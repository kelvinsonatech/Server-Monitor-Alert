import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, monitorsTable, checksTable } from "@workspace/db";
import {
  CreateMonitorBody,
  UpdateMonitorBody,
  GetMonitorParams,
  UpdateMonitorParams,
  DeleteMonitorParams,
  ListChecksParams,
  PingMonitorParams,
} from "@workspace/api-zod";
import {
  scheduleMonitor,
  clearMonitorTimer,
  runCheck,
} from "../lib/monitor-service";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/monitors", async (_req, res): Promise<void> => {
  const monitors = await db
    .select()
    .from(monitorsTable)
    .orderBy(monitorsTable.createdAt);
  res.json(monitors);
});

router.post("/monitors", async (req, res): Promise<void> => {
  const parsed = CreateMonitorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, url, intervalMinutes, enabled } = parsed.data;
  const [monitor] = await db
    .insert(monitorsTable)
    .values({
      name,
      url,
      intervalMinutes: intervalMinutes ?? 5,
      enabled: enabled ?? true,
      status: "unknown",
    })
    .returning();
  if (monitor.enabled) {
    runCheck(monitor.id).catch((err) =>
      logger.error({ err, monitorId: monitor.id }, "Initial check failed")
    );
    scheduleMonitor(monitor.id, monitor.intervalMinutes).catch((err) =>
      logger.error({ err, monitorId: monitor.id }, "Schedule failed")
    );
  }
  res.status(201).json(monitor);
});

router.get("/monitors/:id", async (req, res): Promise<void> => {
  const params = GetMonitorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [monitor] = await db
    .select()
    .from(monitorsTable)
    .where(eq(monitorsTable.id, params.data.id));
  if (!monitor) {
    res.status(404).json({ error: "Monitor not found" });
    return;
  }
  res.json(monitor);
});

router.patch("/monitors/:id", async (req, res): Promise<void> => {
  const params = UpdateMonitorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMonitorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [monitor] = await db
    .update(monitorsTable)
    .set(parsed.data)
    .where(eq(monitorsTable.id, params.data.id))
    .returning();
  if (!monitor) {
    res.status(404).json({ error: "Monitor not found" });
    return;
  }
  clearMonitorTimer(monitor.id);
  if (monitor.enabled) {
    scheduleMonitor(monitor.id, monitor.intervalMinutes).catch((err) =>
      logger.error({ err, monitorId: monitor.id }, "Reschedule failed")
    );
  }
  res.json(monitor);
});

router.delete("/monitors/:id", async (req, res): Promise<void> => {
  const params = DeleteMonitorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  clearMonitorTimer(params.data.id);
  const [deleted] = await db
    .delete(monitorsTable)
    .where(eq(monitorsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Monitor not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/monitors/:id/checks", async (req, res): Promise<void> => {
  const params = ListChecksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const checks = await db
    .select()
    .from(checksTable)
    .where(eq(checksTable.monitorId, params.data.id))
    .orderBy(desc(checksTable.checkedAt))
    .limit(50);
  res.json(checks);
});

router.post("/monitors/:id/ping", async (req, res): Promise<void> => {
  const params = PingMonitorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [monitor] = await db
    .select()
    .from(monitorsTable)
    .where(eq(monitorsTable.id, params.data.id));
  if (!monitor) {
    res.status(404).json({ error: "Monitor not found" });
    return;
  }
  await runCheck(monitor.id);
  const [latest] = await db
    .select()
    .from(checksTable)
    .where(eq(checksTable.monitorId, monitor.id))
    .orderBy(desc(checksTable.checkedAt))
    .limit(1);
  res.json(latest);
});

router.get("/stats", async (_req, res): Promise<void> => {
  const monitors = await db.select().from(monitorsTable);
  const totalMonitors = monitors.length;
  const upCount = monitors.filter((m) => m.status === "up").length;
  const downCount = monitors.filter((m) => m.status === "down").length;
  const unknownCount = monitors.filter((m) => m.status === "unknown").length;

  let overallUptimePct = 100;
  if (totalMonitors > 0) {
    const result = await db
      .select({ total: sql<number>`count(*)`, upTotal: sql<number>`count(*) filter (where status = 'up')` })
      .from(checksTable);
    const total = Number(result[0]?.total ?? 0);
    const upTotal = Number(result[0]?.upTotal ?? 0);
    overallUptimePct = total > 0 ? Math.round((upTotal / total) * 10000) / 100 : 100;
  }

  res.json({ totalMonitors, upCount, downCount, unknownCount, overallUptimePct });
});

export default router;
