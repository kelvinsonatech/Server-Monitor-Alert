import { NextRequest, NextResponse } from "next/server";
import { db, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function getSettingsMap() {
  const rows = await db.select().from(appSettingsTable);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

async function upsertSetting(key: string, value: string) {
  const [existing] = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key));
  if (existing) {
    await db.update(appSettingsTable).set({ value }).where(eq(appSettingsTable.key, key));
  } else {
    await db.insert(appSettingsTable).values({ key, value });
  }
}

export async function GET() {
  try {
    const map = await getSettingsMap();
    const botToken = map["telegram_bot_token"] ?? null;
    const chatId = map["telegram_chat_id"] ?? null;
    return NextResponse.json({
      telegramConfigured: !!(botToken && chatId),
      telegramChatId: chatId,
      hasBotToken: !!botToken,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.telegramBotToken && body.telegramBotToken.trim()) {
      await upsertSetting("telegram_bot_token", body.telegramBotToken.trim());
    }
    if (body.telegramChatId !== undefined) {
      await upsertSetting("telegram_chat_id", body.telegramChatId.trim());
    }

    const map = await getSettingsMap();
    const botToken = map["telegram_bot_token"] ?? null;
    const chatId = map["telegram_chat_id"] ?? null;
    return NextResponse.json({
      telegramConfigured: !!(botToken && chatId),
      telegramChatId: chatId,
      hasBotToken: !!botToken,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
