import app from "./app";
import { logger } from "./lib/logger";
import { initMonitorScheduler } from "./lib/monitor-service";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Monitoring (pinging + Telegram alerts) must run in exactly one place.
  // The dev workspace and the published deployment share the same database, so
  // running the scheduler in both fires duplicate alerts. Only the deployed
  // instance runs it (it stays up 24/7); set ENABLE_MONITOR_SCHEDULER=true to
  // opt the dev workspace in for testing.
  const schedulerEnabled =
    Boolean(process.env["REPLIT_DEPLOYMENT"]) ||
    process.env["ENABLE_MONITOR_SCHEDULER"] === "true";

  if (!schedulerEnabled) {
    logger.info(
      "Monitor scheduler disabled in this environment (deployment-only). Set ENABLE_MONITOR_SCHEDULER=true to enable.",
    );
    return;
  }

  try {
    await initMonitorScheduler();
  } catch (err) {
    logger.error({ err }, "Failed to initialize monitor scheduler");
  }
});
