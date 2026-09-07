# Patient App — `apps/mobile`

> **Author:** [GiorgiKavtaradze](https://github.com/GiorgiKavtaradze-prog)
> **Repository:** [GiorgiKavtaradze-prog/dental-app](https://github.com/GiorgiKavtaradze-prog/dental-app.git)

Expo SDK 57 / React Native 0.86 application for the patients of a single dental
practice — and for staff chat and calls on the go. It talks to the Next.js API
in [`apps/web`](../web) and renders what that API returns; all business logic
lives server-side.

## Features

- **Sign in with Apple / Google** via Clerk
- **4-step onboarding** — profile → medical history → primary concern → notifications
- **Home** — next appointment with countdown, unread clinic messages, post-op instructions
- **Booking flow** — service → dentist → date → time → confirm, against real availability
- **Appointments** — upcoming list, detail view, cancel/reschedule inside the allowed window
- **Clinic chat** — Stream Chat with photo attachments
- **Teleconsults** — Stream Video calls on `appointment-{id}`, ringing while both apps are open
- **AI assistant** — education and triage only, persistent disclaimer, no patient record ever sent to the model
- **Family profiles** — dependents under one account
- **Sentry** — error tracking and session replay (see the open blocker in `legal/reviewer-notes.md`)

## Screens (Expo Router — file-based)

```
src/app/
├── index.tsx                    sign-in
├── onboarding/step1–4           intake flow
├── (tabs)/
│   ├── home.tsx                 next appointment, messages, post-op
│   ├── appointments.tsx         upcoming / past
│   ├── messages.tsx             clinic inbox
│   └── profile/                 personal · medical · notifications
├── booking/                     date · time · confirm
├── appointment/[id].tsx         appointment detail
├── channel/[id].tsx             chat thread
├── call/[id].tsx                video consultation
├── assistant.tsx                AI assistant
└── sentry-*.tsx                 diagnostics screens
```

## Setup

1. Install dependencies from the **repo root** (npm workspaces):

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set:

   | Variable | Purpose |
   | --- | --- |
   | `EXPO_PUBLIC_API_URL` | Base URL of the Next.js API — use your LAN IP for a physical device |
   | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
   | `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN (public by design) |

   There is deliberately **no Stream key here** — `POST /api/stream/token`
   returns the API key alongside the user token, so there is one place to
   rotate it. Secrets never belong in this file: Expo inlines `EXPO_PUBLIC_*`
   into the JS bundle.

3. Build and run. The Stream Video / WebRTC native modules require a
   **development build** — Expo Go will not work:

   ```bash
   npx expo run:ios          # local build to simulator/device
   npx expo run:android
   # or cloud builds:
   npm run build:ios         # EAS, development profile
   npm run build:android
   npm run mobile            # start Metro
   ```

## Architecture notes

- `src/lib/api.tsx` — the entire data layer: a Clerk-token `fetch` wrapper, a
  `useApi` hook that refetches on screen focus, and a `MeProvider` holding
  `/api/me`. No data-fetching library by design.
- `src/lib/stream.tsx` — mounts `StreamVideo` and the chat client at the root,
  so ringing works whenever the app is open.
- `src/components/ui.tsx` — the design system. Read
  [`AGENTS.md`](./AGENTS.md) before building any screen: use the shared
  components, never fork them.

## In-app calls & background ringing

Calling works today while both apps are open. Waking a backgrounded or killed
app needs push credentials the repo does not carry — the full status, the
missing credentials, and the step-by-step upgrade are documented in
[`RINGING-PUSH.md`](./RINGING-PUSH.md).