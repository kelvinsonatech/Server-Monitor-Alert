---
name: monitor alert semantics
description: How PingAlert decides when to send Telegram down/up alerts, and a divergence between the two backends.
---

# Alert gating in monitor-service

`replit.md` states the intent: alerts fire only on status **transitions** (up→down / down→up), not on every failed check.

- The Next.js backend (`artifacts/web/lib/monitor-service.ts`) implements this: `shouldAlert = manual || (isDown && statusChanged)`.
- The Express backend (`artifacts/api-server/src/lib/monitor-service.ts`) does NOT — it uses `shouldAlert = isDown || manual`, which alerts on **every** down check (repeated down→down included).

**Why this matters:** the two backends share the same DB and are meant to behave identically, but their alert frequency differs. If you ever unify or pick one, the api-server is the outlier vs the documented transition-based intent.

**TS alias-narrowing gotcha:** a `previousStatus === "unknown"` clause guarded by `statusChanged || ...` is dead code. TypeScript tracks `const statusChanged = result.status !== previousStatus`; when the right side of `statusChanged || X` runs, status didn't change, so `previousStatus` is narrowed to `result.status`'s type (`"up" | "down"`) and can never be `"unknown"`. An unknown→down transition already sets `statusChanged = true`, so the clause adds nothing.
