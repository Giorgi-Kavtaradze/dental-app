# Dental App

> **Author:** [GiorgiKavtaradze](https://github.com/GiorgiKavtaradze-prog)
> **Repository:** [GiorgiKavtaradze-prog/dental-app](https://github.com/GiorgiKavtaradze-prog/dental-app.git)

Monorepo: an Expo patient app plus a Next.js staff dashboard/API for a single
dental practice. Read `PLAN.md` first — it holds the v1 spec, the data model,
the numbered ASSUMPTIONS (A1–A16), and the open risks. Keep it current when
decisions change.

## Layout

- `apps/mobile` — Expo 57 patient app. See `apps/mobile/AGENTS.md`.
- `apps/web` — Next.js 16. Staff dashboard **and** the API the mobile app calls
  **and** the webhook endpoints. One deploy. See `apps/web/AGENTS.md`.

npm workspaces (not pnpm — see assumption A14). `npm install` at the root.

## Commands

| Command                                            | Purpose                                 |
| -------------------------------------------------- | --------------------------------------- |
| `npm run web`                                      | Next.js dev server                      |
| `npm run mobile`                                   | Expo dev server                         |
| `npm run test`                                     | Vitest suite (`apps/web`)               |
| `npm run typecheck`                                | TypeScript check in every workspace     |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle schema workflow                 |
| `npm run db:seed` / `db:seed:stream`               | Demo data in Postgres / Stream          |
| `npm run stream:check`                             | Verify Stream credentials and user sync |

## Non-negotiables

- **PHI never leaves the boundary.** No patient name, DOB, or medical field in a
  Sentry event, a log line, an analytics call, or a push notification body.
- **No patient record is ever sent to OpenAI.** The assistant is education and
  triage only.
- **Double-booking is prevented by a Postgres exclusion constraint**, not by
  application logic. Do not replace it with an app-level check.
- Business logic lives in `apps/web`. The mobile app renders what the API returns.
