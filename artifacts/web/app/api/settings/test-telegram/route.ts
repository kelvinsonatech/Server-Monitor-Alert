import { NextResponse } from "next/server";
import { db, appSettingsTable } from "@workspace/db";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
  try {
    const rows = await db.select().from(appSettingsTable);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const botToken = map["telegram_bot_token"] ?? null;
    const chatId = map["telegram_chat_id"] ?? null;

    if (!botToken || !chatId) {
      return NextResponse.json({ success: false, message: "Telegram is not configured. Please add a bot token and chat ID first." });
    }

    const text = [
      "✅ <b>PingAlert — Test Message</b>",
      "",
      "Your Telegram alerts are configured correctly!",
      "You'll receive notifications here when your monitors go down or recover.",
      "",
      `<i>Sent at ${new Date().toUTCString()}</i>`,
    ].join("\n");

    const ids = chatId.split(",").map((s: string) => s.trim()).filter(Boolean);
    const results = await Promise.all(ids.map((id: string) => sendTelegramMessage(botToken, id, text)));
    const allOk = results.every(Boolean);

    if (allOk) {
      return NextResponse.json({ success: true, message: `Test message sent to ${ids.length} recipient(s).` });
    } else {
      return NextResponse.json({ success: false, message: "Failed to send to one or more recipients. Check your bot token and chat IDs." });
    }
  } catch {
    return NextResponse.json({ success: false, message: "An unexpected error occurred." });
  }
}
