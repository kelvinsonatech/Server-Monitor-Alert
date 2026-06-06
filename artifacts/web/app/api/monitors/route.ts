import { NextRequest, NextResponse } from "next/server";
import { db, monitorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { runCheck, scheduleMonitor } from "@/lib/monitor-service";

export async function GET() {
  try {
    const monitors = await db.select().from(monitorsTable).orderBy(monitorsTable.createdAt);
    return NextResponse.json(monitors);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, url, intervalMinutes = 5, enabled = true } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const [monitor] = await db.insert(monitorsTable).values({
      name: name.trim(),
      url: url.trim(),
      intervalMinutes: Number(intervalMinutes),
      enabled,
      status: "unknown",
    }).returning();

    runCheck(monitor.id).catch(() => {});
    scheduleMonitor(monitor.id, monitor.intervalMinutes).catch(() => {});

    return NextResponse.json(monitor, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
