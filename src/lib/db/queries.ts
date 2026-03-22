import { eq, and, gte, lte, desc, asc, count, sum, like, or, sql, isNull, isNotNull } from "drizzle-orm";
import { db } from "./index";
import { customers, events, invoices } from "./schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function periodToDays(period: string): number {
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "12m":
      return 365;
    default:
      return 30;
  }
}

function startDateForPeriod(period: string): Date {
  const d = new Date();
  d.setDate(d.getDate() - periodToDays(period));
  return d;
}

function previousPeriodStart(period: string): Date {
  const days = periodToDays(period);
  const d = new Date();
  d.setDate(d.getDate() - days * 2);
  return d;
}

// ---------------------------------------------------------------------------
// Overview Metrics
// ---------------------------------------------------------------------------

export async function getOverviewMetrics(orgId: string, period: string) {
  const now = new Date();
  const start = startDateForPeriod(period);
  const prevStart = previousPeriodStart(period);

  // Current MRR: sum of mrrValue for active (non-churned) customers
  const [mrrResult] = await db
    .select({ total: sum(customers.mrrValue) })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), isNull(customers.churnedAt)));

  const mrr = Number(mrrResult?.total ?? 0);

  // Active customers count (current)
  const [activeResult] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), isNull(customers.churnedAt)));

  const activeCustomers = Number(activeResult?.count ?? 0);

  // Previous period MRR delta to calculate change
  const [currentDelta] = await db
    .select({ total: sum(events.mrrDelta) })
    .from(events)
    .where(and(eq(events.orgId, orgId), gte(events.date, start), lte(events.date, now)));

  const [prevDelta] = await db
    .select({ total: sum(events.mrrDelta) })
    .from(events)
    .where(and(eq(events.orgId, orgId), gte(events.date, prevStart), lte(events.date, start)));

  const currentMrrChange = Number(currentDelta?.total ?? 0);
  const prevMrrChange = Number(prevDelta?.total ?? 0);
  const mrrChange = prevMrrChange !== 0 ? ((currentMrrChange - prevMrrChange) / Math.abs(prevMrrChange)) * 100 : 0;

  // Customer change: new signups in current vs previous period
  const [curCustCount] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), gte(customers.signupDate, start), lte(customers.signupDate, now)));

  const [prevCustCount] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), gte(customers.signupDate, prevStart), lte(customers.signupDate, start)));

  const curCust = Number(curCustCount?.count ?? 0);
  const prevCust = Number(prevCustCount?.count ?? 0);
  const customerChange = prevCust !== 0 ? ((curCust - prevCust) / prevCust) * 100 : 0;

  // Churn rate: churned in period / active at start of period
  const [churnedCount] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), gte(customers.churnedAt, start), lte(customers.churnedAt, now)));

  const churned = Number(churnedCount?.count ?? 0);
  const churnRate = activeCustomers + churned > 0 ? (churned / (activeCustomers + churned)) * 100 : 0;

  // Previous period churn
  const [prevChurnedCount] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), gte(customers.churnedAt, prevStart), lte(customers.churnedAt, start)));

  const prevChurned = Number(prevChurnedCount?.count ?? 0);
  const prevChurnRate = prevCust + prevChurned > 0 ? (prevChurned / (prevCust + prevChurned)) * 100 : 0;
  const churnChange = prevChurnRate !== 0 ? ((churnRate - prevChurnRate) / prevChurnRate) * 100 : 0;

  // Net revenue in period
  const netRevenue = currentMrrChange;
  const netRevenueChange = prevMrrChange !== 0 ? ((currentMrrChange - prevMrrChange) / Math.abs(prevMrrChange)) * 100 : 0;

  // Sparklines: MRR and customer count per day for the period
  const days = periodToDays(period);
  const sparklineBuckets = Math.min(days, 30); // max 30 data points

  const mrrSparklineRows = await db
    .select({
      bucket: sql<string>`date_trunc('day', ${events.date})::text`,
      total: sum(events.mrrDelta),
    })
    .from(events)
    .where(and(eq(events.orgId, orgId), gte(events.date, start)))
    .groupBy(sql`date_trunc('day', ${events.date})`)
    .orderBy(asc(sql`date_trunc('day', ${events.date})`));

  // Build cumulative MRR sparkline
  let cumulativeMrr = mrr - currentMrrChange; // MRR at start of period
  const mrrSparkline: number[] = [];
  for (const row of mrrSparklineRows) {
    cumulativeMrr += Number(row.total ?? 0);
    mrrSparkline.push(cumulativeMrr);
  }
  // Pad to at least a few data points
  if (mrrSparkline.length === 0) {
    mrrSparkline.push(mrr);
  }

  const customerSparklineRows = await db
    .select({
      bucket: sql<string>`date_trunc('day', ${customers.signupDate})::text`,
      total: count(),
    })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), gte(customers.signupDate, start)))
    .groupBy(sql`date_trunc('day', ${customers.signupDate})`)
    .orderBy(asc(sql`date_trunc('day', ${customers.signupDate})`));

  const customerSparkline: number[] = customerSparklineRows.map((row) => Number(row.total));
  if (customerSparkline.length === 0) {
    customerSparkline.push(activeCustomers);
  }

  return {
    mrr,
    mrrChange: Math.round(mrrChange * 10) / 10,
    activeCustomers,
    customerChange: Math.round(customerChange * 10) / 10,
    churnRate: Math.round(churnRate * 10) / 10,
    churnChange: Math.round(churnChange * 10) / 10,
    netRevenue,
    netRevenueChange: Math.round(netRevenueChange * 10) / 10,
    mrrSparkline,
    customerSparkline,
  };
}

// ---------------------------------------------------------------------------
// MRR Evolution (area chart)
// ---------------------------------------------------------------------------

export async function getMrrEvolution(orgId: string, period: string) {
  const start = startDateForPeriod(period);

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${events.date}), 'YYYY-MM')`,
      total: sum(events.mrrDelta),
    })
    .from(events)
    .where(and(eq(events.orgId, orgId), gte(events.date, start)))
    .groupBy(sql`date_trunc('month', ${events.date})`)
    .orderBy(asc(sql`date_trunc('month', ${events.date})`));

  // Build cumulative MRR by month
  let runningMrr = 0;

  // Get MRR baseline before the period
  const [baseline] = await db
    .select({ total: sum(events.mrrDelta) })
    .from(events)
    .where(and(eq(events.orgId, orgId), lte(events.date, start)));

  runningMrr = Number(baseline?.total ?? 0);

  return rows.map((row) => {
    runningMrr += Number(row.total ?? 0);
    return {
      month: row.month,
      mrr: runningMrr,
    };
  });
}

// ---------------------------------------------------------------------------
// Revenue Breakdown
// ---------------------------------------------------------------------------

export async function getRevenueBreakdown(orgId: string, period: string) {
  const start = startDateForPeriod(period);
  const now = new Date();

  const rows = await db
    .select({
      type: events.type,
      total: sum(events.mrrDelta),
    })
    .from(events)
    .where(and(eq(events.orgId, orgId), gte(events.date, start), lte(events.date, now)))
    .groupBy(events.type);

  const breakdown: Record<string, number> = {
    new: 0,
    expansion: 0,
    contraction: 0,
    churn: 0,
  };

  for (const row of rows) {
    if (row.type in breakdown) {
      breakdown[row.type] = Math.abs(Number(row.total ?? 0));
    }
  }

  return {
    newMrr: breakdown.new,
    expansionMrr: breakdown.expansion,
    contractionMrr: breakdown.contraction,
    churnMrr: breakdown.churn,
  };
}

// ---------------------------------------------------------------------------
// Recent Activity
// ---------------------------------------------------------------------------

export async function getRecentActivity(orgId: string, limit: number = 10) {
  const rows = await db
    .select({
      id: events.id,
      type: events.type,
      customerName: customers.name,
      mrrDelta: events.mrrDelta,
      date: events.date,
    })
    .from(events)
    .innerJoin(customers, eq(events.customerId, customers.id))
    .where(eq(events.orgId, orgId))
    .orderBy(desc(events.date))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    customerName: row.customerName,
    mrrDelta: row.mrrDelta,
    date: row.date,
  }));
}

// ---------------------------------------------------------------------------
// MRR by Plan (stacked area chart)
// ---------------------------------------------------------------------------

export async function getMrrByPlan(orgId: string, period: string) {
  const start = startDateForPeriod(period);

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${events.date}), 'YYYY-MM')`,
      plan: customers.plan,
      total: sum(events.mrrDelta),
    })
    .from(events)
    .innerJoin(customers, eq(events.customerId, customers.id))
    .where(and(eq(events.orgId, orgId), gte(events.date, start)))
    .groupBy(sql`date_trunc('month', ${events.date})`, customers.plan)
    .orderBy(asc(sql`date_trunc('month', ${events.date})`));

  // Pivot into { month, starter, pro, business } format
  const monthMap = new Map<string, { month: string; starter: number; pro: number; business: number }>();

  // Running totals per plan
  const running = { starter: 0, pro: 0, business: 0 };

  // Get baseline per plan before the period
  const baselines = await db
    .select({
      plan: customers.plan,
      total: sum(events.mrrDelta),
    })
    .from(events)
    .innerJoin(customers, eq(events.customerId, customers.id))
    .where(and(eq(events.orgId, orgId), lte(events.date, start)))
    .groupBy(customers.plan);

  for (const b of baselines) {
    if (b.plan in running) {
      running[b.plan as keyof typeof running] = Number(b.total ?? 0);
    }
  }

  for (const row of rows) {
    const plan = row.plan as keyof typeof running;
    if (!monthMap.has(row.month)) {
      monthMap.set(row.month, { month: row.month, starter: running.starter, pro: running.pro, business: running.business });
    }
    const entry = monthMap.get(row.month)!;
    running[plan] += Number(row.total ?? 0);
    entry[plan] = running[plan];
  }

  return Array.from(monthMap.values());
}

// ---------------------------------------------------------------------------
// Monthly Movements
// ---------------------------------------------------------------------------

export async function getMonthlyMovements(orgId: string) {
  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${events.date}), 'YYYY-MM')`,
      type: events.type,
      total: sum(events.mrrDelta),
    })
    .from(events)
    .where(eq(events.orgId, orgId))
    .groupBy(sql`date_trunc('month', ${events.date})`, events.type)
    .orderBy(asc(sql`date_trunc('month', ${events.date})`));

  const monthMap = new Map<string, {
    month: string;
    newMrr: number;
    expansionMrr: number;
    contractionMrr: number;
    churnMrr: number;
    netNew: number;
  }>();

  for (const row of rows) {
    if (!monthMap.has(row.month)) {
      monthMap.set(row.month, {
        month: row.month,
        newMrr: 0,
        expansionMrr: 0,
        contractionMrr: 0,
        churnMrr: 0,
        netNew: 0,
      });
    }
    const entry = monthMap.get(row.month)!;
    const value = Number(row.total ?? 0);

    switch (row.type) {
      case "new":
      case "reactivation":
        entry.newMrr += value;
        break;
      case "expansion":
        entry.expansionMrr += value;
        break;
      case "contraction":
        entry.contractionMrr += Math.abs(value);
        break;
      case "churn":
        entry.churnMrr += Math.abs(value);
        break;
    }
  }

  // Calculate netNew for each month
  for (const entry of monthMap.values()) {
    entry.netNew = entry.newMrr + entry.expansionMrr - entry.contractionMrr - entry.churnMrr;
  }

  return Array.from(monthMap.values());
}

// ---------------------------------------------------------------------------
// Customers (paginated, filterable)
// ---------------------------------------------------------------------------

export async function getCustomers(
  orgId: string,
  filters: { plan?: string; status?: string; search?: string; page?: number } = {}
) {
  const pageSize = 20;
  const page = filters.page ?? 1;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(customers.orgId, orgId)];

  if (filters.plan) {
    conditions.push(sql`${customers.plan} = ${filters.plan}`);
  }

  if (filters.status === "active") {
    conditions.push(isNull(customers.churnedAt));
  } else if (filters.status === "churned") {
    conditions.push(isNotNull(customers.churnedAt));
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(customers.name, searchTerm),
        like(customers.email, searchTerm)
      )!
    );
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(customers)
    .where(whereClause);

  const total = Number(totalResult?.count ?? 0);

  const rows = await db
    .select()
    .from(customers)
    .where(whereClause)
    .orderBy(desc(customers.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { customers: rows, total };
}

// ---------------------------------------------------------------------------
// Customer Detail
// ---------------------------------------------------------------------------

export async function getCustomerDetail(customerId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId));

  if (!customer) {
    return null;
  }

  const customerEvents = await db
    .select()
    .from(events)
    .where(eq(events.customerId, customerId))
    .orderBy(desc(events.date));

  const customerInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.customerId, customerId))
    .orderBy(desc(invoices.createdAt));

  return {
    ...customer,
    events: customerEvents,
    invoices: customerInvoices,
  };
}

// ---------------------------------------------------------------------------
// Churn Metrics
// ---------------------------------------------------------------------------

export async function getChurnMetrics(orgId: string, period: string) {
  const start = startDateForPeriod(period);
  const prevStart = previousPeriodStart(period);
  const now = new Date();

  // Churned in current period
  const [churnedResult] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), gte(customers.churnedAt, start), lte(customers.churnedAt, now)));

  const churnedCount = Number(churnedResult?.count ?? 0);

  // Total customers at start of period (signed up before period end, not churned before period start)
  const [totalAtStart] = await db
    .select({ count: count() })
    .from(customers)
    .where(
      and(
        eq(customers.orgId, orgId),
        lte(customers.signupDate, start),
        or(isNull(customers.churnedAt), gte(customers.churnedAt, start))
      )
    );

  const totalStart = Number(totalAtStart?.count ?? 0);
  const churnRate = totalStart > 0 ? (churnedCount / totalStart) * 100 : 0;

  // Previous period churn
  const [prevChurnedResult] = await db
    .select({ count: count() })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), gte(customers.churnedAt, prevStart), lte(customers.churnedAt, start)));

  const prevChurnedCount = Number(prevChurnedResult?.count ?? 0);

  const [prevTotalAtStart] = await db
    .select({ count: count() })
    .from(customers)
    .where(
      and(
        eq(customers.orgId, orgId),
        lte(customers.signupDate, prevStart),
        or(isNull(customers.churnedAt), gte(customers.churnedAt, prevStart))
      )
    );

  const prevTotalStart = Number(prevTotalAtStart?.count ?? 0);
  const previousChurnRate = prevTotalStart > 0 ? (prevChurnedCount / prevTotalStart) * 100 : 0;

  return {
    churnRate: Math.round(churnRate * 10) / 10,
    previousChurnRate: Math.round(previousChurnRate * 10) / 10,
    churnedCount,
  };
}

// ---------------------------------------------------------------------------
// Cohort Retention (12x12 matrix)
// ---------------------------------------------------------------------------

export async function getCohortRetention(orgId: string) {
  // Get all customers with their signup month and churn date
  const allCustomers = await db
    .select({
      id: customers.id,
      signupMonth: sql<string>`to_char(date_trunc('month', ${customers.signupDate}), 'YYYY-MM')`,
      signupDate: customers.signupDate,
      churnedAt: customers.churnedAt,
    })
    .from(customers)
    .where(eq(customers.orgId, orgId))
    .orderBy(asc(customers.signupDate));

  // Group by cohort month
  const cohortMap = new Map<string, Array<{ signupDate: Date; churnedAt: Date | null }>>();

  for (const customer of allCustomers) {
    const cohort = customer.signupMonth;
    if (!cohortMap.has(cohort)) {
      cohortMap.set(cohort, []);
    }
    cohortMap.get(cohort)!.push({
      signupDate: customer.signupDate,
      churnedAt: customer.churnedAt,
    });
  }

  // Get last 12 cohort months
  const sortedCohorts = Array.from(cohortMap.keys()).sort().slice(-12);
  const now = new Date();

  return sortedCohorts.map((cohort) => {
    const cohortCustomers = cohortMap.get(cohort)!;
    const cohortSize = cohortCustomers.length;
    const cohortDate = new Date(cohort + "-01");

    // Calculate retention for months 0-11
    const months: number[] = [];
    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
      const checkDate = new Date(cohortDate);
      checkDate.setMonth(checkDate.getMonth() + monthOffset + 1);

      // If the check date is in the future, stop
      if (checkDate > now) {
        break;
      }

      // Count customers still active at this point
      const activeCount = cohortCustomers.filter((customer) => {
        if (!customer.churnedAt) return true; // still active
        return customer.churnedAt >= checkDate; // hadn't churned yet at check date
      }).length;

      const retention = cohortSize > 0 ? Math.round((activeCount / cohortSize) * 100) : 0;
      months.push(retention);
    }

    return { cohort, months };
  });
}

// ---------------------------------------------------------------------------
// Churn Reasons
// ---------------------------------------------------------------------------

export async function getChurnReasons(orgId: string) {
  const rows = await db
    .select({
      reason: customers.churnReason,
      count: count(),
    })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), isNotNull(customers.churnedAt), isNotNull(customers.churnReason)))
    .groupBy(customers.churnReason)
    .orderBy(desc(count()));

  const total = rows.reduce((acc, row) => acc + Number(row.count), 0);

  return rows.map((row) => ({
    reason: row.reason ?? "Unknown",
    count: Number(row.count),
    percentage: total > 0 ? Math.round((Number(row.count) / total) * 1000) / 10 : 0,
  }));
}

// ---------------------------------------------------------------------------
// At-Risk Customers
// ---------------------------------------------------------------------------

export async function getAtRiskCustomers(orgId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Customers with contraction events in last 30 days
  const downgradedCustomerIds = db
    .select({ customerId: events.customerId })
    .from(events)
    .where(
      and(
        eq(events.orgId, orgId),
        eq(events.type, "contraction"),
        gte(events.date, thirtyDaysAgo)
      )
    );

  // Customers with past_due invoices in last 30 days
  const pastDueCustomerIds = db
    .select({ customerId: invoices.customerId })
    .from(invoices)
    .where(
      and(
        eq(invoices.orgId, orgId),
        sql`${invoices.status} = 'failed'`,
        gte(invoices.createdAt, thirtyDaysAgo)
      )
    );

  // Combine: get customers matching either condition
  const atRiskRows = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.orgId, orgId),
        isNull(customers.churnedAt),
        or(
          sql`${customers.id} IN (${downgradedCustomerIds})`,
          sql`${customers.id} IN (${pastDueCustomerIds})`
        )
      )
    )
    .orderBy(desc(customers.mrrValue));

  return atRiskRows;
}
