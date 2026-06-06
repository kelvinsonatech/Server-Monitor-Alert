export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initMonitorScheduler } = await import("./lib/monitor-service");
    try {
      await initMonitorScheduler();
    } catch (err) {
      console.error("Failed to initialize monitor scheduler:", err);
    }
  }
}
