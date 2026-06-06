---
name: monitor alert semantics
description: How PingAlert decides when to send Telegram down/up alerts, and a divergence between the two backends.
---

# Alert gating in monitor-service

`replit.md` states the intent: alerts fire only on status **transitions** (up→down / down→up), not on every failed check.

- The Next.js backend (`artifacts/web/lib/monitor-service.ts`) implements this: `shouldAlert = manual || (isDown && statusChanged)`.
- The Express backend (`artifacts/api-server/src/lib/monitor-service.ts`) does NOT — it uses `shouldAlert = isDown || manual`, which alerts on **every** down check (repeated down→down included).

**Why this matters:** the two backends share the same DB and are meant to behave identically, but their alert frequency differs. If you ever unify or pick one, the api-server is the outlier vs the documented transition-based intent.

## One scheduler per shared DB (duplicate-alert root cause)

Dev workspace and the published deployment share the **same** `DATABASE_URL`. Any backend that auto-starts a ping/alert scheduler will run in BOTH places, so every down event fires **two** Telegram messages. Two independent multipliers existed:

- The Next.js `web` artifact auto-started its scheduler in `instrumentation.ts`.
- The Express `api-server` started its scheduler unconditionally in the `app.listen` callback.

**Decision:** monitoring runs in exactly one place — the deployed Express api-server. Both backends now gate the scheduler:
- api-server: runs only if `process.env.REPLIT_DEPLOYMENT` is set (or `ENABLE_MONITOR_SCHEDULER=true` to opt the dev workspace in for testing).
- web `instrumentation.ts`: never starts unless `ENABLE_MONITOR_SCHEDULER=true`.

**Why:** deployment-only is correct because the deployment stays up 24/7 independent of whether the workspace is open. **How to apply:** never start a scheduler unconditionally on boot in this repo; gate on the deployment env var. Republish after changing alert logic so prod carries it.

**TS alias-narrowing gotcha:** a `previousStatus === "unknown"` clause guarded by `statusChanged || ...` is dead code. TypeScript tracks `const statusChanged = result.status !== previousStatus`; when the right side of `statusChanged || X` runs, status didn't change, so `previousStatus` is narrowed to `result.status`'s type (`"up" | "down"`) and can never be `"unknown"`. An unknown→down transition already sets `statusChanged = true`, so the clause adds nothing.
