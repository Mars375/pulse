import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getChurnMetrics,
  getCohortRetention,
  getChurnReasons,
  getAtRiskCustomers,
} from "@/lib/db/queries";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CohortHeatmap } from "@/components/dashboard/charts/cohort-heatmap";
import { HorizontalBarChart } from "@/components/dashboard/charts/horizontal-bar-chart";
import { AtRiskTable } from "@/components/dashboard/at-risk-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function ChurnPage({ searchParams }: PageProps) {
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

  const [churnMetrics, cohortData, reasons, atRisk] = await Promise.all([
    getChurnMetrics(orgId, period),
    getCohortRetention(orgId),
    getChurnReasons(orgId),
    getAtRiskCustomers(orgId),
  ]);

  const churnChange = churnMetrics.previousChurnRate > 0
    ? ((churnMetrics.churnRate - churnMetrics.previousChurnRate) / churnMetrics.previousChurnRate) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-satoshi text-3xl font-bold text-text-primary">Churn</h1>
        <p className="mt-1 text-text-secondary">Understand and reduce customer churn.</p>
      </div>

      {/* Churn KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          title="Churn Rate"
          value={`${churnMetrics.churnRate.toFixed(1)}%`}
          change={-churnChange}
          sparklineData={[]}
          accentColor="var(--color-negative)"
        />
        <KpiCard
          title="Churned Customers"
          value={churnMetrics.churnedCount.toString()}
          change={0}
          sparklineData={[]}
          accentColor="var(--color-warning)"
          delay={0.08}
        />
      </div>

      {/* Cohort Heatmap */}
      <CohortHeatmap title="Cohort Retention" data={cohortData} />

      {/* Churn Reasons */}
      <HorizontalBarChart title="Why Customers Leave" data={reasons} />

      {/* At-Risk Customers */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <CardTitle className="font-satoshi text-base text-text-primary">
            At-Risk Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AtRiskTable
            customers={atRisk.map((c) => ({
              id: c.id,
              name: c.name,
              email: c.email,
              plan: c.plan,
              mrrValue: c.mrrValue,
              riskSignal: "Recent downgrade or past due",
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
