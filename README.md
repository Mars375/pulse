# Pulse

> SaaS metrics dashboard — MRR, churn, cohorts, and customer intelligence.

Track revenue, understand churn, and monitor customer health in one place. Built for indie hackers and small SaaS teams who want Baremetrics-level insight without the Baremetrics price tag.

## Features

- **Revenue** — MRR by plan, monthly movements (new, expansion, contraction, churn), month-over-month comparison
- **Churn** — Cohort heatmap, churn reasons breakdown, at-risk customer list
- **Customers** — Filterable table, search, customer detail sheet
- **Overview** — KPI cards, MRR chart, revenue breakdown, activity feed
- **Onboarding** — Org creation + auto-seeded demo data so you can explore immediately
- **Auth** — Clerk (email, OAuth, SSO)
- **Billing** — Stripe checkout + billing portal

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | Neon Postgres + Drizzle ORM |
| Auth | Clerk |
| Payments | Stripe |
| Charts | Recharts |
| UI | shadcn/ui, Tailwind CSS, Framer Motion |
| Fonts | Satoshi, Geist Sans, JetBrains Mono |

## Getting Started

```bash
git clone https://github.com/your-username/pulse.git
cd pulse
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Neon
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Seed
SEED_API_KEY=
```

Push the schema and start dev:

```bash
npx drizzle-kit push
npm run dev
```

Seed demo data:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SEED_API_KEY" \
  -d '{"orgId": "YOUR_ORG_ID"}'
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — animated hero, features, pricing |
| `/pricing` | Dedicated pricing with FAQ and plan comparison |
| `/onboarding` | Org creation + auto data seeding |
| `/overview` | KPIs, MRR chart, revenue breakdown, activity feed |
| `/revenue` | MRR by plan, monthly movements, month comparison |
| `/customers` | Filterable table, search, customer detail sheet |
| `/churn` | Cohort heatmap, churn reasons, at-risk customers |
| `/settings` | Profile, billing, integrations, danger zone |

## Deploy

```bash
vercel
```
