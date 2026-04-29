# Pulse

SaaS analytics for tracking recurring revenue, churn, cohorts, and customer health in one dashboard.

Pulse is a Next.js app for small SaaS teams that want a clear view of revenue performance and customer behavior. The current repo includes a marketing site, authenticated dashboard flows, seeded demo data, CSV exports, and Stripe + Clerk integrations.

## Features

- Overview dashboard with KPI cards, MRR evolution, revenue breakdown, and recent activity
- Revenue analytics for recurring revenue trends and movement tracking
- Churn analysis with cohort views, churn breakdowns, and at-risk customer surfacing
- Customer management with searchable tables and customer detail views
- Onboarding flow with organization creation and demo-data seeding
- CSV exports for customer and revenue data
- Authentication with Clerk
- Billing hooks with Stripe checkout and webhooks
- Component and logic tests with Vitest and Testing Library

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** Neon Postgres + Drizzle ORM
- **Auth:** Clerk
- **Payments:** Stripe
- **UI:** Tailwind CSS v4, shadcn/ui, Radix UI
- **Animation:** Framer Motion, GSAP, Lenis
- **Charts:** Recharts
- **Testing:** Vitest, Testing Library, axe-core

## Local Setup

```bash
git clone https://github.com/Mars375/pulse.git
cd pulse
npm install
cp .env.example .env.local
```

Fill in `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/overview
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SEED_API_KEY=
```

Prepare the database and start the app:

```bash
npx drizzle-kit push
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:coverage
```

## Project Status

**Current status: working product prototype.**

The repo already contains the main dashboard areas, onboarding, CSV export routes, Stripe webhook plumbing, and a meaningful test suite. It still depends on real third-party credentials and database setup before it can run locally or be deployed.
