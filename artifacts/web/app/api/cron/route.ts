import { NextRequest, NextResponse } from "next/server";
import { db, monitorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { runCheck } from "@/lib/monitor-service";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const monitors = await db.select().from(monitorsTable).where(eq(monitorsTable.enabled, true));
    const now = Date.now();

    const due = monitors.filter((m) => {
      if (!m.lastCheckedAt) return true;
      const lastMs = new Date(m.lastCheckedAt).getTime();
      return now - lastMs >= m.intervalMinutes * 60 * 1000;
    });

    await Promise.allSettled(due.map((m) => runCheck(m.id)));

    return NextResponse.json({ checked: due.length, total: monitors.length });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
