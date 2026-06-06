# PingAlert

A server uptime monitor that watches your servers via HTTP pings and sends instant Telegram alerts when they go down or recover.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/monitor run dev` — run the dashboard frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, shadcn/ui, TanStack Query, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/monitors.ts` — monitors, checks, app_settings tables
- `artifacts/api-server/src/lib/monitor-service.ts` — background pinger + Telegram alert logic
- `artifacts/api-server/src/lib/telegram.ts` — Telegram Bot API helper
- `artifacts/api-server/src/routes/monitors.ts` — monitors/checks/stats routes
- `artifacts/api-server/src/routes/settings.ts` — Telegram settings routes
- `artifacts/monitor/src/` — React dashboard frontend

## Architecture decisions

- Monitoring runs as in-process `setTimeout` loops on the API server — no separate cron process needed
- Telegram bot token is stored encrypted-at-rest in the `app_settings` DB table, never exposed to the frontend
- Alerts fire only on status *transitions* (up→down or down→up), not on every failed check
- Check interval per monitor is configurable (default 5 minutes); first check runs immediately on add
- OpenAPI spec gates codegen which gates the frontend — spec changes require `codegen` before building

## Product

- **Dashboard** — all monitors with live status (up/down/unknown), uptime %, response time, auto-refreshes every 30s
- **Add monitor** — name, URL, check interval
- **Monitor detail** — full check history, manual ping button, delete
- **Settings** — Telegram bot token + chat ID, test message button

## Gotchas

- After any `lib/*` schema change, run `pnpm run typecheck:libs` before the API server typecheck
- Body schemas in openapi.yaml must use entity-shaped names (not `CreateXBody`) to avoid Orval TS2308 collision
- The monitor scheduler boots in the `app.listen` callback — it won't run until the server is listening

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
