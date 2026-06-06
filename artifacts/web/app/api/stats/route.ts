import { NextResponse } from "next/server";
import { db, monitorsTable, checksTable } from "@workspace/db";
import { eq, and, gte, count } from "drizzle-orm";

export async function GET() {
  try {
    const monitors = await db.select().from(monitorsTable);
    const total = monitors.length;
    const upCount = monitors.filter((m) => m.status === "up").length;
    const downCount = monitors.filter((m) => m.status === "down").length;
    const unknownCount = monitors.filter((m) => m.status === "unknown").length;

    let overallUptimePct = 100;
    if (total > 0) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const allChecks = await db.select().from(checksTable).where(gte(checksTable.checkedAt, since));
      if (allChecks.length > 0) {
        const upChecks = allChecks.filter((c) => c.status === "up").length;
        overallUptimePct = (upChecks / allChecks.length) * 100;
      }
    }

    return NextResponse.json({ totalMonitors: total, upCount, downCount, unknownCount, overallUptimePct });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
