import { NextRequest, NextResponse } from "next/server";
import { db, monitorsTable, checksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { pingUrl } from "@/lib/monitor-service";
import { sendTelegramMessage } from "@/lib/telegram";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const monitorId = Number(id);
    const [monitor] = await db.select().from(monitorsTable).where(eq(monitorsTable.id, monitorId));
    if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await pingUrl(monitor.url);

    const [check] = await db.insert(checksTable).values({
      monitorId: monitor.id,
      status: result.status,
      responseMs: result.responseMs,
      statusCode: result.statusCode,
      error: result.error,
      checkedAt: new Date(),
    }).returning();

    await db.update(monitorsTable).set({
      status: result.status,
      lastCheckedAt: new Date(),
      lastResponseMs: result.responseMs,
    }).where(eq(monitorsTable.id, monitor.id));

    return NextResponse.json(check);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
