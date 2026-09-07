# Staff Dashboard & API — `apps/web`

> **Author:** [GiorgiKavtaradze](https://github.com/GiorgiKavtaradze-prog)
> **Repository:** [GiorgiKavtaradze-prog/dental-app](https://github.com/GiorgiKavtaradze-prog/dental-app.git)

Next.js 16 (App Router) application that fills three roles with one deploy:

1. **Staff dashboard** — day schedule across all dentists, patient records,
   dentist management.
2. **REST API** — everything the mobile app calls, under `/api/*`.
3. **Webhooks** — Clerk user sync at `/api/webhooks/clerk`.

It also hosts the public site: a landing page plus Terms of Service and Privacy
Policy that open in an in-app browser from the mobile app.

## Pages

| Route                      | Purpose                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `/`                        | Public landing page                                                                             |
| `/terms`, `/privacy`       | Legal pages (route group `(site)`; visible draft banner until signed off)                       |
| `/sign-in`, `/sign-up`     | Clerk authentication screens                                                                    |
| `/dashboard`               | Day schedule across all dentists (staff-only via `requireStaff()`)                              |
| `/dashboard/patients`      | Patient directory                                                                               |
| `/dashboard/patients/[id]` | Patient record — intake, medical history, visit timeline, post-op notes, appointment completion |
| `/dashboard/dentists`      | Dentist profiles and management                                                                 |

## API endpoints

| Endpoint                                       | Purpose                                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/api/me`                                      | Current user and their patient profiles                                                                             |
| `/api/patients` · `/api/patients/[id]`         | Patient list, detail, create/update (self + dependents)                                                             |
| `/api/patients/[id]/medical-history`           | The PHI table — every read/write hits `audit_log`                                                                   |
| `/api/services`                                | Bookable services                                                                                                   |
| `/api/dentists`                                | Active dentists and the services they offer                                                                         |
| `/api/availability`                            | Bookable slots — working hours minus time-off minus existing bookings                                               |
| `/api/appointments` · `/api/appointments/[id]` | Book, list, detail, cancel (duration computed server-side; the Postgres exclusion constraint blocks double-booking) |
| `/api/appointments/[id]/attachments`           | Upload to the patient's private ImageKit folder                                                                     |
| `/api/ai/chat`                                 | Streaming assistant (`gpt-4o-mini`), persisted in `ai_conversations` / `ai_messages`                                |
| `/api/ai/attachments`                          | Photo upload — blurred + full signed URLs; the image is never sent to OpenAI                                        |
| `/api/stream/token`                            | Stream user token with a server-derived user id                                                                     |
| `/api/stream/channel`                          | Ensure the `patient-{id}` channel exists with staff members synced                                                  |
| `/api/webhooks/clerk`                          | Clerk user created/updated sync                                                                                     |

## Project structure

```
src/
├── app/            App Router — (site), dashboard, api, sign-in, sign-up
├── components/     UI kit (ui.tsx, icons.tsx) + site chrome
├── db/             Drizzle: schema.ts, migrations, seed.ts, seed-stream.ts, check-stream.ts
├── lib/            Business logic — scheduling, booking, audit, ai, imagekit, stream, validation, time
└── types/
```

Key modules in `src/lib/`:

- `scheduling.ts` — slot computation, cancel window, teleconsult join window
- `booking.ts` — appointment creation and its invariants
- `audit.ts` — PHI access logging
- `ai.ts` / `ai-thread.ts` — assistant guardrails, emergency keywords, persistence
- `imagekit.ts` — private-folder uploads and signed, expiring URLs
- `validation.ts` — Zod schemas and usage limits
- `time.ts` — clinic-timezone helpers (`CLINIC_TZ`)

## Development

```bash
npm install                 # from the repo root (npm workspaces)
cp .env.example .env        # then fill in the keys
npm run db:migrate          # apply the Drizzle schema
npm run db:seed             # demo dentists, services, working hours
npm run dev                 # http://localhost:3000
```

## Testing

Vitest — suites live next to the code they cover (`scheduling.test.ts`,
`ai.test.ts`, `http.test.ts`, `imagekit.test.ts`):

```bash
npm run test                # from repo root, or: npm run test:watch here
```

## Design system

`src/components/ui.tsx` + `src/components/icons.tsx` are the single source of
truth for every surface — see [`AGENTS.md`](./AGENTS.md) for the rules. Tokens
live in `src/app/globals.css` as `@theme` variables; never re-sample hex values
per page.

## Deployment

Deploys to Vercel as one project — dashboard, API, and webhooks together.
Set the environment variables from `.env.example` in the Vercel project
settings.
