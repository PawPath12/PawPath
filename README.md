# 🐾 PawPath

A web platform connecting pet owners with veterinarians and clinics — browse, book,
and review vet care online. Built as a scalable MVP that can grow into mobile apps,
payments, notifications, and real-time chat.

## Features

- **Public site** — searchable, filterable clinic directory (city, service, rating) and rich profile pages.
- **Pet-owner accounts** — manage pets, book appointments, message clinics, view history, leave reviews.
- **Vet/clinic dashboard** — manage services & pricing, weekly availability, staff, bookings, and inquiries.
- **Availability-based booking** — real open-slot computation that prevents double-booking; status tracking (Pending → Confirmed → Completed).
- **Ratings & reviews** — 1–5 stars tied to completed visits, with denormalized clinic rating rollups.
- **Async messaging** — client ↔ clinic conversations (a seam ready for real-time upgrade).

## Tech stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, React Server Components, Server Actions) |
| Language  | TypeScript                                                    |
| Database  | Prisma 7 ORM · SQLite (dev) → PostgreSQL (prod)               |
| Auth      | Auth.js (NextAuth v5), credentials + JWT, role-based          |
| Styling   | Tailwind CSS v4                                               |
| Validation| Zod                                                           |

The API layer (Route Handlers + Server Actions) and Prisma schema are designed so a
future **React Native** app can reuse the same backend.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create the SQLite database + run migrations
npx prisma migrate dev

# 3. Seed demo data (clinics, vets, clients, appointments, reviews)
npm run db:seed

# 4. Start the dev server
npm run dev            # http://localhost:3000
```

> **Note:** Node.js is installed via `nvm`. The `dev`/`build` scripts use Next's Webpack
> bundler (`--webpack`) because Turbopack couldn't spawn its worker process in this
> environment. To try Turbopack (the faster default), drop the flag: `npx next dev`.

### Demo accounts (password: `password123`)

| Role       | Email             |
| ---------- | ----------------- |
| Pet owner  | `alice@demo.com`  |
| Vet/clinic | `happy@demo.com`  |

Other pet owners: `bob@demo.com`, `carol@demo.com`, `dave@demo.com`.
Other clinics: `specialists@demo.com` (specialty referral center), `brooklyn@demo.com`, `la@demo.com`, `chicago@demo.com`, `miami@demo.com`.

## Useful scripts

- `npm run db:seed` — reset & seed demo data
- `npm run db:reset` — drop, re-migrate, and re-seed
- `npm run db:studio` — open Prisma Studio to inspect the database

## Project structure

```
prisma/
  schema.prisma        # data model (User, Clinic, Vet, Service, Availability,
                       # Pet, Appointment, Review, Conversation, Message)
  seed.ts              # deterministic demo data
src/
  app/
    /, /vets, /vets/[clinicId]     # public site
    /login, /register, /go         # auth + role dispatch
    /account/…                     # pet-owner area (guarded)
    /dashboard/…                   # vet area (guarded)
    /book/[clinicId]               # booking wizard
    /api/auth/[...nextauth]        # Auth.js handler
  lib/
    db.ts                # Prisma client (driver adapter)
    auth.ts, rbac.ts     # authentication & role guards
    slots.ts             # availability → bookable slots engine
    validation.ts        # Zod schemas
    actions/…            # server actions (auth, pets, booking, reviews, messages, clinic)
  components/…           # UI (VetCard, BookingWizard, MessageThread, managers, …)
```

## Moving to production (Postgres)

1. Provision a PostgreSQL database.
2. In `prisma/schema.prisma`, change `datasource db { provider = "postgresql" }`.
3. Swap the driver adapter in `src/lib/db.ts` (e.g. `@prisma/adapter-pg`).
4. Set `DATABASE_URL` and `AUTH_SECRET` in your host's environment.
5. `npx prisma migrate deploy && npm run build && npm start`.

## Future roadmap

Mobile apps (React Native) · email/push notifications · Stripe payments ·
real-time chat (websockets) · analytics & reporting.
