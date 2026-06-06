import { NextRequest, NextResponse } from "next/server";
import { db, monitorsTable, checksTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const monitorId = Number(id);
    const [monitor] = await db.select().from(monitorsTable).where(eq(monitorsTable.id, monitorId));
    if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const checks = await db
      .select()
      .from(checksTable)
      .where(eq(checksTable.monitorId, monitorId))
      .orderBy(desc(checksTable.checkedAt))
      .limit(50);

    return NextResponse.json(checks);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const monitorId = Number(id);
    const [monitor] = await db.select().from(monitorsTable).where(eq(monitorsTable.id, monitorId));
    if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.delete(checksTable).where(eq(checksTable.monitorId, monitorId));
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
