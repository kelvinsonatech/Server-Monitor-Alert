import { db, monitorsTable, checksTable, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { sendTelegramMessage } from "./telegram";
import { Agent, fetch as undiciFetch } from "undici";

const TIMEOUT_MS = 15000;

const insecureAgent = new Agent({
  connect: { rejectUnauthorized: false },
});

export async function pingUrl(url: string): Promise<{ status: "up" | "down"; responseMs: number | null; statusCode: number | null; error: string | null }> {
  const start = Date.now();
  try {
    const res = await undiciFetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
      dispatcher: insecureAgent,
    } as Parameters<typeof undiciFetch>[1]);
    const responseMs = Date.now() - start;
    const isUp = res.status < 500;
    return {
      status: isUp ? "up" : "down",
      responseMs,
      statusCode: res.status,
      error: isUp ? null : `HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    const responseMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return { status: "down", responseMs, statusCode: null, error: message };
  }
}

async function getTelegramSettings(): Promise<{ botToken: string | null; chatId: string | null }> {
  const rows = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, "telegram_bot_token"));
  const chatRows = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, "telegram_chat_id"));
  return {
    botToken: rows[0]?.value ?? null,
    chatId: chatRows[0]?.value ?? null,
  };
}

export async function runCheck(monitorId: number): Promise<void> {
  const [monitor] = await db
    .select()
    .from(monitorsTable)
    .where(eq(monitorsTable.id, monitorId));

  if (!monitor || !monitor.enabled) return;

  const previousStatus = monitor.status;
  const result = await pingUrl(monitor.url);

  await db.insert(checksTable).values({
    monitorId: monitor.id,
    status: result.status,
    responseMs: result.responseMs,
    statusCode: result.statusCode,
    error: result.error,
    checkedAt: new Date(),
  });

  await db
    .update(monitorsTable)
    .set({
      status: result.status,
      lastCheckedAt: new Date(),
      lastResponseMs: result.responseMs,
    })
    .where(eq(monitorsTable.id, monitor.id));

  logger.info({ monitorId, url: monitor.url, status: result.status, responseMs: result.responseMs }, "Check complete");

  const { botToken, chatId } = await getTelegramSettings();
  if (botToken && chatId) {
    const isDown = result.status === "down";
    const now = new Date().toUTCString();
    let text: string;
    if (isDown) {
      const errorLine = result.error ? `\n⚠️ <b>Reason:</b> <code>${result.error}</code>` : "";
      text = [
        `🔴❤️⚠️ <b>ALERT — SERVER DOWN</b> ⚠️❤️🔴`,
        ``,
        `📛 <b>Monitor:</b> ${monitor.name}`,
        `🌐 <b>URL:</b> <code>${monitor.url}</code>${errorLine}`,
        `🕐 <b>Detected at:</b> ${now}`,
        ``,
        `<i>PingAlert will notify you again when it recovers.</i>`,
      ].join("\n");
    } else {
      const respLine = result.responseMs !== null ? `\n⚡ <b>Response:</b> ${result.responseMs}ms` : "";
      text = [
        `✅ <b>Server is UP</b>`,
        ``,
        `📛 <b>Monitor:</b> ${monitor.name}`,
        `🌐 <b>URL:</b> <code>${monitor.url}</code>${respLine}`,
        `🕐 <b>Checked at:</b> ${now}`,
      ].join("\n");
    }
    const ids = chatId.split(",").map((s) => s.trim()).filter(Boolean);
    await Promise.all(ids.map((id) => sendTelegramMessage(botToken, id, text)));
  }
}

const timers = new Map<number, NodeJS.Timeout>();

export async function scheduleMonitor(monitorId: number, intervalMinutes: number): Promise<void> {
  clearMonitorTimer(monitorId);
  const ms = intervalMinutes * 60 * 1000;
  const tick = async () => {
    try {
      await runCheck(monitorId);
    } catch (err) {
      logger.error({ err, monitorId }, "Error during scheduled check");
    }
    timers.set(monitorId, setTimeout(tick, ms));
  };
  timers.set(monitorId, setTimeout(tick, ms));
  logger.info({ monitorId, intervalMinutes }, "Monitor scheduled");
}

export function clearMonitorTimer(monitorId: number): void {
  const t = timers.get(monitorId);
  if (t) {
    clearTimeout(t);
    timers.delete(monitorId);
  }
}

export async function initMonitorScheduler(): Promise<void> {
  const monitors = await db.select().from(monitorsTable).where(eq(monitorsTable.enabled, true));
  for (const monitor of monitors) {
    await runCheck(monitor.id);
    await scheduleMonitor(monitor.id, monitor.intervalMinutes);
  }
  logger.info({ count: monitors.length }, "Monitor scheduler initialized");
}
