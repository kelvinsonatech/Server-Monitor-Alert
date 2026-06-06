import { NextRequest, NextResponse } from "next/server";
import { db, monitorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { runCheck, scheduleMonitor, clearMonitorTimer } from "@/lib/monitor-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [monitor] = await db.select().from(monitorsTable).where(eq(monitorsTable.id, Number(id)));
    if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(monitor);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const monitorId = Number(id);
    const [existing] = await db.select().from(monitorsTable).where(eq(monitorsTable.id, monitorId));
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const updates: Partial<typeof existing> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.url !== undefined) updates.url = String(body.url).trim();
    if (body.intervalMinutes !== undefined) updates.intervalMinutes = Number(body.intervalMinutes);
    if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled);

    const [updated] = await db.update(monitorsTable).set(updates).where(eq(monitorsTable.id, monitorId)).returning();

    if (updates.intervalMinutes !== undefined && updated.enabled) {
      clearMonitorTimer(monitorId);
      scheduleMonitor(monitorId, updated.intervalMinutes).catch(() => {});
    }
    if (updates.enabled === true) {
      clearMonitorTimer(monitorId);
      runCheck(monitorId).catch(() => {});
      scheduleMonitor(monitorId, updated.intervalMinutes).catch(() => {});
    } else if (updates.enabled === false) {
      clearMonitorTimer(monitorId);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const monitorId = Number(id);
    const [existing] = await db.select().from(monitorsTable).where(eq(monitorsTable.id, monitorId));
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    clearMonitorTimer(monitorId);
    await db.delete(monitorsTable).where(eq(monitorsTable.id, monitorId));
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
