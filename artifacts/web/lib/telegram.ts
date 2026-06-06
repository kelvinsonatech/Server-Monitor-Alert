export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json()) as { ok: boolean; description?: string };
    return data.ok;
  } catch {
    return false;
  }
}
