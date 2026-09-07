# 🦷 Dental App

**A full-stack, production-grade dental clinic platform — mobile patient app + staff web dashboard — built as a single monorepo.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![React 19](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) ![Next.js 16](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![Expo SDK 57](https://img.shields.io/badge/Expo_SDK_57-000020?style=flat-square&logo=expo&logoColor=white) ![React Native 0.86](https://img.shields.io/badge/React_Native_0.86-61DAFB?style=flat-square&logo=react&logoColor=black) ![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![NativeWind 4](https://img.shields.io/badge/NativeWind_4-38BDF8?style=flat-square)

![Node.js 22+](https://img.shields.io/badge/Node.js_22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black) ![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-00E599?style=flat-square&logo=neon&logoColor=black) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Zod 4](https://img.shields.io/badge/Zod_4-3068B7?style=flat-square&logo=zod&logoColor=white)

![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white) ![Stream Video + Chat](https://img.shields.io/badge/Stream_Video_%2B_Chat-005FFF?style=flat-square) ![OpenAI gpt-4o-mini](https://img.shields.io/badge/OpenAI_gpt--4o--mini-412991?style=flat-square) ![ImageKit](https://img.shields.io/badge/ImageKit-E8590C?style=flat-square) ![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white)

![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=flat-square&logo=vitest&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-1A2B34?style=flat-square&logo=prettier&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) ![EAS Build](https://img.shields.io/badge/EAS_Build-000020?style=flat-square&logo=expo&logoColor=white)

> **Author:** [GiorgiKavtaradze](https://github.com/GiorgiKavtaradze-prog) &nbsp;·&nbsp; **Repo:** [GiorgiKavtaradze-prog/dental-app](https://github.com/GiorgiKavtaradze-prog/dental-app)

---

## 📖 Overview

**Dental App** is a monorepo combining a patient-facing **mobile application** and a **staff web dashboard** for a single dental practice — designed for real-world clinic operation from day one.

- **Patients** sign in with Apple or Google, complete a medical intake, book real appointments from live clinic availability, securely chat with staff, and join scheduled video consultations — all from their phone.
- **Staff** manage the daily schedule, patient records, chat threads, and post-op notes from a Next.js dashboard that doubles as the REST API and webhook server.

Two core principles govern every design decision:

| Principle                         | Detail                                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`apps/web` is the backend**     | It owns the Postgres schema (Drizzle ORM on Neon), all business logic, and every external integration. The mobile app is a thin rendering layer.                         |
| **Third parties own the minimum** | Clerk holds identity only; Stream holds call and message content only. Everything clinical lives in our own database, with PHI reads and writes recorded in `audit_log`. |

---

## ✨ Features

| Area                   | Description                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔐 **Authentication**  | Apple + Google SSO via Clerk; roles (`patient`, `staff`, `dentist`) mirrored into Postgres by webhook                                                      |
| 📋 **Onboarding**      | 4-step intake — profile, medical history, primary concern, notifications permission                                                                        |
| 📅 **Smart Booking**   | Real availability = working hours − time-off − existing bookings; duration computed server-side; double-booking blocked by a Postgres exclusion constraint |
| 📹 **Teleconsults**    | Scheduled video/audio calls via Stream Video (WebRTC); room ID is derived server-side (`appointment-{id}`), never client-supplied                          |
| 💬 **Clinic Chat**     | Secure patient ↔ clinic messaging via Stream Chat with photo attachments                                                                                   |
| 🤖 **AI Assistant**    | Education & triage only (`gpt-4o-mini`); emergency-keyword guard runs before any model call; patient photos are **never** sent to OpenAI                   |
| 👨‍👩‍👧 **Family Accounts** | One user account, N patient profiles — exactly one `"self"` profile; appointments reference patients, not users                                            |
| 🗂️ **Visit History**   | Complete past-appointment list with staff-authored post-op notes                                                                                           |
| 🌐 **Public Site**     | Landing page, Terms of Service, and Privacy Policy (draft banner until legal sign-off)                                                                     |
| 📡 **Observability**   | Sentry on both apps; PHI never leaves the compliance boundary                                                                                              |

---

## 🏗️ Architecture

### System diagram

```mermaid
flowchart TB
    Mobile["📱 Mobile App — Expo SDK 57 / React Native"]
    Web["🌐 Staff Dashboard — Next.js 16 App Router"]
    Clerk["🔐 Clerk — Auth, Apple/Google SSO, roles"]
    API["⚙️ /api/* — Route Handlers + Zod validation"]
    Webhooks["🔔 /api/webhooks — Clerk & Stream events"]
    AI["🤖 /api/ai — OpenAI gpt-4o-mini assistant"]
    Neon["🗄️ Neon Postgres — PHI data + audit_log"]
    Stream["💬 Stream — Video WebRTC + Chat messages"]
    ImageKit["🖼️ ImageKit — Private patient media CDN"]
    Sentry["📡 Sentry — Error tracking (both apps)"]

    Mobile -->|"ClerkProvider, Apple/Google SSO"| Clerk
    Mobile -->|"REST over HTTPS"| API
    Mobile -->|"WebRTC + chat SDK"| Stream
    Web -->|"@clerk/nextjs middleware"| Clerk
    Web --> API
    API -->|"auth() → userId, orgId, role"| Clerk
    API -->|"Drizzle ORM queries"| Neon
    AI -->|"emergency keyword guard → model call"| Neon
    Webhooks -->|"mirror users & roles"| Neon
    Webhooks --> Stream
    API --> Stream
    API --> ImageKit
    Mobile --> Sentry
    Web --> Sentry
```

### One request, one booking

```mermaid
flowchart LR
    R["Patient taps 'Book Appointment'"] --> Z["Zod validates request body"]
    Z --> C["Clerk auth() resolves userId + role"]
    C --> A["Server computes real availability"]
    A --> X["Working hours − time-off − existing bookings"]
    X --> E["Postgres exclusion constraint\nblocks double-booking at DB level"]
    E --> S["Stream room ID derived server-side\nappointment-{id} — never client-supplied"]
    S --> L["audit_log records PHI write"]
    L --> B["✅ Appointment confirmed"]
```

### Why the server can't be abused

```mermaid
flowchart LR
    Req["Incoming request\n(mobile or browser)"] --> Auth{"Clerk auth()"}
    Auth -->|"unauthenticated"| Deny["❌ 401 Unauthorized"]
    Auth -->|"authenticated"| Role{"Role check"}
    Role -->|"wrong role"| Forbidden["❌ 403 Forbidden"]
    Role -->|"patient / staff / dentist"| Own{"Resource ownership\nassertOwned(id, userId)"}
    Own -->|"not owner"| Forbidden2["❌ 403 Forbidden"]
    Own -->|"owner"| AI{"AI route?"}
    AI -->|"yes"| Guard["Emergency-keyword guard\nruns before OpenAI call\nPatient photos stripped"]
    AI -->|"no"| DB["Drizzle ORM → Neon Postgres"]
    Guard --> DB
    DB --> Audit["audit_log records every PHI read/write"]
    Audit --> Resp["✅ Response"]
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 22** and npm
- A **[Neon](https://neon.tech)** Postgres database (free tier works)
- API keys for: **[Clerk](https://clerk.com)**, **[Stream](https://getstream.io)**, **[OpenAI](https://platform.openai.com)**, **[ImageKit](https://imagekit.io)**, **[Sentry](https://sentry.io)** (all have free tiers)

---

### Step 1 — Install dependencies

```bash
npm install
```

---

### Step 2 — Configure the web app

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` and fill in the following:

| Variable                                          | Purpose                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`                                    | Neon Postgres connection string                                  |
| `CLERK_SECRET_KEY`                                | Clerk server-side secret key                                     |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | Clerk client-side publishable key                                |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | Route for sign-in page (`/sign-in`)                              |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                   | Route for sign-up page (`/sign-up`)                              |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post-sign-in redirect URL                                        |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post-sign-up redirect URL                                        |
| `NEXT_PUBLIC_STREAM_API_KEY`                      | Stream Chat + Video (public key)                                 |
| `STREAM_API_SECRET`                               | Stream server-side secret                                        |
| `OPENAI_API_KEY`                                  | AI assistant API key                                             |
| `IMAGEKIT_PUBLIC_KEY`                             | ImageKit upload authentication                                   |
| `IMAGEKIT_PRIVATE_KEY`                            | ImageKit server operations                                       |
| `IMAGEKIT_URL_ENDPOINT`                           | ImageKit CDN base URL                                            |
| `NEXT_PUBLIC_SENTRY_DSN`                          | Sentry error tracking DSN                                        |
| `CLINIC_TZ`                                       | Clinic timezone for all scheduling (default: `America/New_York`) |

---

### Step 3 — Migrate and seed the database

```bash
npm run db:migrate        # Apply Drizzle schema migrations to Neon
npm run db:seed           # Seed demo data: dentists, services, working hours
npm run db:seed:stream    # Mirror demo users into Stream
```

> **Tip:** Run `npm run db:studio` to open Drizzle Studio for a visual database browser.

---

### Step 4 — Run the web dashboard

```bash
npm run web               # → http://localhost:3000
```

---

```bash
npm run mobile            # Start Metro bundler

# Build and run locally
npx expo run:ios          # iOS simulator or physical device
npx expo run:android      # Android emulator or physical device

# Build with EAS
npm run build:ios
npm run build:android
```

---

## 🔒 Security & Compliance

| Concern                       | Approach                                                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **PHI Boundary**              | All patient health information is stored exclusively in Neon Postgres. No PHI is transmitted to OpenAI or third-party analytics. |
| **Audit Log**                 | Every PHI read and write is recorded in the `audit_log` table.                                                                   |
| **AI Guardrails**             | Emergency-keyword detection runs server-side before any OpenAI API call. Patient photos are never included in AI requests.       |
| **Double-Booking Prevention** | A Postgres exclusion constraint enforces non-overlapping appointment windows at the database level.                              |
| **Token Scoping**             | Stream room IDs are derived server-side from appointment IDs; clients never supply or forge room tokens.                         |

---

## 🧪 Testing

```bash
npm run test        # Run Vitest unit suite (apps/web)
npm run typecheck   # TypeScript type-check all workspaces
```

---

## 📄 License

Released under the [MIT License](./LICENSE) — Copyright © 2026 [GiorgiKavtaradze](https://github.com/GiorgiKavtaradze-prog).

Third-party services used by this project (Clerk, Stream, OpenAI, ImageKit, Sentry, Neon) are governed by their own terms of service. This license covers the repository source code only.

---

Made with ❤️ by [GiorgiKavtaradze](https://github.com/GiorgiKavtaradze-prog)
