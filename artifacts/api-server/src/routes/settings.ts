import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appSettingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { sendTelegramMessage } from "../lib/telegram";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(appSettingsTable);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const hasBotToken = !!map["telegram_bot_token"];
  const chatId = map["telegram_chat_id"] ?? null;
  res.json({
    telegramConfigured: hasBotToken && !!chatId,
    telegramChatId: chatId,
    hasBotToken,
  });
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { telegramBotToken, telegramChatId } = parsed.data;
  if (telegramBotToken) {
    await db
      .insert(appSettingsTable)
      .values({ key: "telegram_bot_token", value: telegramBotToken })
      .onConflictDoUpdate({ target: appSettingsTable.key, set: { value: telegramBotToken } });
  }
  if (telegramChatId) {
    await db
      .insert(appSettingsTable)
      .values({ key: "telegram_chat_id", value: telegramChatId })
      .onConflictDoUpdate({ target: appSettingsTable.key, set: { value: telegramChatId } });
  }
  const rows = await db.select().from(appSettingsTable);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const hasBotToken = !!map["telegram_bot_token"];
  const chatId = map["telegram_chat_id"] ?? null;
  res.json({
    telegramConfigured: hasBotToken && !!chatId,
    telegramChatId: chatId,
    hasBotToken,
  });
});

router.post("/settings/test-telegram", async (_req, res): Promise<void> => {
  const rows = await db.select().from(appSettingsTable);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const botToken = map["telegram_bot_token"];
  const chatId = map["telegram_chat_id"];
  if (!botToken || !chatId) {
    res.json({ success: false, message: "Telegram is not configured. Please save your bot token and chat ID first." });
    return;
  }
  const ids = chatId.split(",").map((s) => s.trim()).filter(Boolean);
  const results = await Promise.all(
    ids.map((id) =>
      sendTelegramMessage(botToken, id, "✅ <b>PingAlert test message</b>\nYour Telegram alerts are working correctly.")
    )
  );
  const allOk = results.every(Boolean);
  if (allOk) {
    res.json({ success: true, message: `Test message sent to ${ids.length} recipient(s). Check your Telegram.` });
  } else {
    res.json({ success: false, message: "Failed to send to one or more chat IDs. Check your bot token and IDs." });
  }
});

router.post("/settings/test-telegram-down", async (_req, res): Promise<void> => {
  const rows = await db.select().from(appSettingsTable);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const botToken = map["telegram_bot_token"];
  const chatId = map["telegram_chat_id"];
  if (!botToken || !chatId) {
    res.json({ success: false, message: "Telegram is not configured." });
    return;
  }
  const now = new Date().toUTCString();
  const text = [
    `🔴❤️⚠️ <b>ALERT — SERVER DOWN</b> ⚠️❤️🔴`,
    ``,
    `📛 <b>Monitor:</b> My Linode Server`,
    `🌐 <b>URL:</b> <code>https://172.235.33.210:2053/...</code>`,
    `⚠️ <b>Reason:</b> <code>connect ETIMEDOUT</code>`,
    `🕐 <b>Detected at:</b> ${now}`,
    ``,
    `<i>PingAlert will notify you again when it recovers.</i>`,
  ].join("\n");
  const ids = chatId.split(",").map((s: string) => s.trim()).filter(Boolean);
  const results = await Promise.all(ids.map((id: string) => sendTelegramMessage(botToken, id, text)));
  const allOk = results.every(Boolean);
  res.json({ success: allOk });
});

export default router;
