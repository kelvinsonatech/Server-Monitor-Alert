export async function register() {
  // Monitoring (pinging + Telegram alerts) is owned by the Express api-server
  // artifact, which runs the scheduler against the shared database. Starting a
  // second scheduler here would double every check and send duplicate alerts.
  // Set ENABLE_MONITOR_SCHEDULER=true to opt this backend in instead.
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.ENABLE_MONITOR_SCHEDULER === "true"
  ) {
    const { initMonitorScheduler } = await import("./lib/monitor-service");
    try {
      await initMonitorScheduler();
    } catch (err) {
      console.error("Failed to initialize monitor scheduler:", err);
    }
  }
}
