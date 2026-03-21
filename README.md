# Pulse

SaaS metrics dashboard — MRR, churn, cohorts, customer intelligence.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Neon Postgres + Drizzle ORM
- **Auth:** Clerk
- **Payments:** Stripe (checkout, portal, webhooks)
- **UI:** shadcn/ui, Tailwind CSS, Recharts, Framer Motion
- **Fonts:** Satoshi, Geist Sans, JetBrains Mono

## Getting Started

```bash
cp .env.example .env.local
# Fill in Clerk, Neon, and Stripe keys

npm install
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

- `/` — Landing page with animated hero, features, pricing
- `/pricing` — Dedicated pricing with FAQ and plan comparison
- `/sign-in`, `/sign-up` — Clerk authentication
- `/onboarding` — Org creation + auto data seeding
- `/overview` — KPIs, MRR chart, revenue breakdown, activity feed
- `/revenue` — MRR by plan, monthly movements, month comparison
- `/customers` — Filterable table, search, detail sheet
- `/churn` — Cohort heatmap, churn reasons, at-risk customers
- `/settings` — Profile, billing, integrations, danger zone

## Deploy

```bash
vercel
```
