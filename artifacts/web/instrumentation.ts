export async function register() {
  // Monitor scheduling is handled by the Express API server (artifacts/api-server).
  // On Vercel (no Express server), use an external cron service to call /api/cron
  // every minute instead of running the scheduler inline.
}
