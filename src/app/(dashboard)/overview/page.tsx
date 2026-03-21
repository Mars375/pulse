import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import {
  getOverviewMetrics,
  getMrrEvolution,
  getRevenueBreakdown,
  getRecentActivity,
} from "@/lib/db/queries";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AreaChart } from "@/components/dashboard/charts/area-chart";
import { DonutChart } from "@/components/dashboard/charts/donut-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function OverviewPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [dbUser] = await db
    .select({ orgId: users.orgId })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser?.orgId) redirect("/onboarding");

  const params = await searchParams;
  const period = params.period ?? "30d";
  const orgId = dbUser.orgId;

  const [metrics, mrrData, breakdown, activity] = await Promise.all([
    getOverviewMetrics(orgId, period),
    getMrrEvolution(orgId, period),
    getRevenueBreakdown(orgId, period),
    getRecentActivity(orgId, 10),
  ]);

  const kpis = [
    {
      title: "Monthly Recurring Revenue",
      value: `$${(metrics.mrr / 100).toLocaleString()}`,
      change: metrics.mrrChange,
      sparkline: metrics.mrrSparkline,
      color: "var(--chart-1)",
    },
    {
      title: "Active Customers",
      value: metrics.activeCustomers.toLocaleString(),
      change: metrics.customerChange,
      sparkline: metrics.customerSparkline,
      color: "var(--chart-3)",
    },
    {
      title: "Churn Rate",
      value: `${metrics.churnRate.toFixed(1)}%`,
      change: -metrics.churnChange,
      sparkline: [],
      color: "var(--color-negative)",
    },
    {
      title: "Net Revenue",
      value: `$${(metrics.netRevenue / 100).toLocaleString()}`,
      change: metrics.netRevenueChange,
      sparkline: [],
      color: "var(--color-positive)",
    },
  ];

  const donutData = [
    { name: "New", value: breakdown.newMrr, color: "var(--chart-1)" },
    { name: "Expansion", value: breakdown.expansionMrr, color: "var(--chart-2)" },
    { name: "Contraction", value: -breakdown.contractionMrr, color: "var(--chart-3)" },
    { name: "Churn", value: -breakdown.churnMrr, color: "var(--chart-4)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-satoshi text-3xl font-bold text-text-primary">Overview</h1>
        <p className="mt-1 text-text-secondary">Your SaaS metrics at a glance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            sparklineData={kpi.sparkline}
            accentColor={kpi.color}
            delay={i * 0.08}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-bg-surface-1 border">
          <CardHeader>
            <CardTitle className="font-satoshi text-base text-text-primary">
              MRR Evolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart title="" data={mrrData} height={300} />
          </CardContent>
        </Card>

        <Card className="bg-bg-surface-1 border">
          <CardHeader>
            <CardTitle className="font-satoshi text-base text-text-primary">
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart title="" data={donutData} />
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <CardTitle className="font-satoshi text-base text-text-primary">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={activity} />
        </CardContent>
      </Card>
    </div>
  );
}
