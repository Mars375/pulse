import { db } from "./index";
import { customers, events, invoices } from "./schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) seeded from orgId string
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash |= 0; // Convert to 32-bit int
  }
  return hash >>> 0; // unsigned
}

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Name / domain pools
// ---------------------------------------------------------------------------

const firstNames = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery",
  "Blake", "Cameron", "Drew", "Ellis", "Finley", "Harper", "Jamie", "Kelly",
  "Logan", "Mason", "Noah", "Peyton", "Reese", "Sam", "Spencer", "Sydney",
  "Tatum",
];

const lastNames = [
  "Chen", "Kumar", "Patel", "Williams", "Garcia", "Brown", "Wilson", "Lee",
  "Martin", "Anderson", "Thomas", "Jackson", "White", "Harris", "Clark",
  "Lewis", "Robinson", "Walker", "Hall", "Young", "King", "Wright", "Scott",
  "Green", "Baker",
];

const domains = [
  "techflow.io", "datastack.co", "cloudpeak.dev", "nexuspoint.com",
  "bytecraft.io", "codestream.co", "pixelforge.dev", "quantumlabs.io",
  "synthwave.co", "hyperloop.dev",
];

// ---------------------------------------------------------------------------
// Plan helpers (all amounts in cents)
// ---------------------------------------------------------------------------

type Plan = "starter" | "pro" | "business";

const PLAN_MRR: Record<Plan, number> = {
  starter: 2900,
  pro: 7900,
  business: 19900,
};

const CHURN_REASONS = [
  "Too expensive",
  "Switched to competitor",
  "No longer needed",
  "Missing features",
  "Poor support",
];

// ---------------------------------------------------------------------------
// Types for generated records
// ---------------------------------------------------------------------------

interface CustomerRecord {
  id: string;
  orgId: string;
  name: string;
  email: string;
  plan: Plan;
  mrrValue: number;
  signupDate: Date;
  churnedAt: Date | null;
  churnReason: string | null;
}

interface EventRecord {
  id: string;
  orgId: string;
  customerId: string;
  type: "new" | "expansion" | "contraction" | "churn" | "reactivation";
  mrrDelta: number;
  date: Date;
}

interface InvoiceRecord {
  id: string;
  orgId: string;
  customerId: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  paidAt: Date | null;
}

// ---------------------------------------------------------------------------
// UUID v4 from PRNG (deterministic)
// ---------------------------------------------------------------------------

function randomUUID(rand: () => number): string {
  const hex = "0123456789abcdef";
  const tpl = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return tpl.replace(/[xy]/g, (c) => {
    const r = (rand() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return hex[v];
  });
}

// ---------------------------------------------------------------------------
// Pick helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickPlan(rand: () => number): Plan {
  const r = rand();
  if (r < 0.5) return "starter";
  if (r < 0.85) return "pro";
  return "business";
}

function upgradePlan(plan: Plan): Plan | null {
  if (plan === "starter") return "pro";
  if (plan === "pro") return "business";
  return null;
}

function downgradePlan(plan: Plan): Plan | null {
  if (plan === "business") return "pro";
  if (plan === "pro") return "starter";
  return null;
}

// ---------------------------------------------------------------------------
// Core generation logic
// ---------------------------------------------------------------------------

function generateData(orgId: string) {
  const rand = mulberry32(hashString(orgId));

  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - 18);
  startDate.setDate(1);

  const allCustomers: CustomerRecord[] = [];
  const allEvents: EventRecord[] = [];
  const allInvoices: InvoiceRecord[] = [];

  // Active customer pool keyed by customerId
  const active = new Map<string, CustomerRecord>();

  // Determine new-customer count per month (~15% MoM growth, ~200 total)
  // Start with ~5, grow 15% per month, with seasonal dip Jul-Aug
  let baseNew = 5;
  const monthlyNewCounts: number[] = [];
  for (let m = 0; m < 18; m++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + m);
    const month = monthDate.getMonth(); // 0-indexed (0=Jan)
    const seasonal = month === 6 || month === 7 ? 0.6 : 1.0; // Jul-Aug dip
    const count = Math.max(1, Math.round(baseNew * seasonal + (rand() - 0.5) * 2));
    monthlyNewCounts.push(count);
    baseNew = Math.round(baseNew * 1.15);
  }

  function makeName(): { name: string; email: string } {
    const first = pick(firstNames, rand);
    const last = pick(lastNames, rand);
    const domain = pick(domains, rand);
    return {
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
    };
  }

  // Process each month
  for (let m = 0; m < 18; m++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + m);

    // --- New signups ---
    const newCount = monthlyNewCounts[m];
    for (let i = 0; i < newCount; i++) {
      const plan = pickPlan(rand);
      const mrr = PLAN_MRR[plan];
      const day = Math.floor(rand() * 28) + 1;
      const signupDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);

      const { name, email } = makeName();
      const id = randomUUID(rand);

      const customer: CustomerRecord = {
        id,
        orgId,
        name,
        email,
        plan,
        mrrValue: mrr,
        signupDate,
        churnedAt: null,
        churnReason: null,
      };
      allCustomers.push(customer);
      active.set(id, customer);

      allEvents.push({
        id: randomUUID(rand),
        orgId,
        customerId: id,
        type: "new",
        mrrDelta: mrr,
        date: signupDate,
      });
    }

    // --- Process existing active customers for this month ---
    const activeIds = Array.from(active.keys());

    for (const custId of activeIds) {
      const cust = active.get(custId)!;
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const eventDay = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        Math.floor(rand() * 28) + 1,
      );

      // Skip if customer signed up this month (already handled above)
      if (
        cust.signupDate.getFullYear() === monthDate.getFullYear() &&
        cust.signupDate.getMonth() === monthDate.getMonth()
      ) {
        // Still generate their first invoice
        allInvoices.push({
          id: randomUUID(rand),
          orgId,
          customerId: custId,
          amount: cust.mrrValue,
          status: "paid",
          paidAt: cust.signupDate,
        });
        continue;
      }

      const roll = rand();

      // 5-8% churn
      const churnRate = 0.05 + rand() * 0.03;
      if (roll < churnRate) {
        cust.churnedAt = eventDay;
        cust.churnReason = pick(CHURN_REASONS, rand);
        allEvents.push({
          id: randomUUID(rand),
          orgId,
          customerId: custId,
          type: "churn",
          mrrDelta: -cust.mrrValue,
          date: eventDay,
        });
        active.delete(custId);
        continue;
      }

      // ~3% expansion
      if (roll < churnRate + 0.03) {
        const newPlan = upgradePlan(cust.plan);
        if (newPlan) {
          const oldMrr = cust.mrrValue;
          cust.plan = newPlan;
          cust.mrrValue = PLAN_MRR[newPlan];
          allEvents.push({
            id: randomUUID(rand),
            orgId,
            customerId: custId,
            type: "expansion",
            mrrDelta: cust.mrrValue - oldMrr,
            date: eventDay,
          });
        }
      }

      // ~1% contraction
      if (roll >= churnRate + 0.03 && roll < churnRate + 0.04) {
        const newPlan = downgradePlan(cust.plan);
        if (newPlan) {
          const oldMrr = cust.mrrValue;
          cust.plan = newPlan;
          cust.mrrValue = PLAN_MRR[newPlan];
          allEvents.push({
            id: randomUUID(rand),
            orgId,
            customerId: custId,
            type: "contraction",
            mrrDelta: cust.mrrValue - oldMrr,
            date: eventDay,
          });
        }
      }

      // Monthly invoice for active customers
      allInvoices.push({
        id: randomUUID(rand),
        orgId,
        customerId: custId,
        amount: cust.mrrValue,
        status: "paid",
        paidAt: monthEnd,
      });
    }
  }

  return { allCustomers, allEvents, allInvoices };
}

// ---------------------------------------------------------------------------
// Public API — seed a single organization
// ---------------------------------------------------------------------------

export async function seedOrganization(orgId: string): Promise<void> {
  const { allCustomers, allEvents, allInvoices } = generateData(orgId);

  // Delete existing data (respect FK order: invoices, events, then customers)
  await db.delete(invoices).where(eq(invoices.orgId, orgId));
  await db.delete(events).where(eq(events.orgId, orgId));
  await db.delete(customers).where(eq(customers.orgId, orgId));

  // Batch insert in chunks of 100 to stay within parameter limits
  const BATCH = 100;

  for (let i = 0; i < allCustomers.length; i += BATCH) {
    const chunk = allCustomers.slice(i, i + BATCH);
    await db.insert(customers).values(chunk);
  }

  for (let i = 0; i < allEvents.length; i += BATCH) {
    const chunk = allEvents.slice(i, i + BATCH);
    await db.insert(events).values(chunk);
  }

  for (let i = 0; i < allInvoices.length; i += BATCH) {
    const chunk = allInvoices.slice(i, i + BATCH);
    await db.insert(invoices).values(chunk);
  }
}
