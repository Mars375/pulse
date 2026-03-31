import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getOverviewMetrics,
  getMrrByPlan,
  getMonthlyMovements,
} from "@/lib/db/queries";
import { Download } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StackedAreaChart } from "@/components/dashboard/charts/stacked-area-chart";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function RevenuePage({ searchParams }: PageProps) {
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

  const [metrics, mrrByPlan, movements] = await Promise.all([
    getOverviewMetrics(orgId, period),
    getMrrByPlan(orgId, period),
    getMonthlyMovements(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-satoshi text-3xl font-bold text-text-primary">Revenue</h1>
          <p className="mt-1 text-text-secondary">Deep dive into your revenue streams.</p>
        </div>
        <a
          href="/api/export/revenue"
          download
          className="inline-flex items-center gap-2 rounded-md border border-border bg-bg-surface-1 px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          title="Monthly Recurring Revenue"
          value={`$${(metrics.mrr / 100).toLocaleString()}`}
          change={metrics.mrrChange}
          sparklineData={metrics.mrrSparkline}
          accentColor="var(--chart-1)"
        />
        <KpiCard
          title="Annual Run Rate"
          value={`$${((metrics.mrr * 12) / 100).toLocaleString()}`}
          change={metrics.mrrChange}
          sparklineData={[]}
          accentColor="var(--chart-2)"
          delay={0.08}
        />
      </div>

      {/* MRR by Plan */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <CardTitle className="font-satoshi text-base text-text-primary">
            MRR by Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StackedAreaChart title="" data={mrrByPlan} />
        </CardContent>
      </Card>

      {/* Monthly Movements Table */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <CardTitle className="font-satoshi text-base text-text-primary">
            Monthly MRR Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="text-text-secondary">Month</TableHead>
                  <TableHead className="text-text-secondary text-right">New</TableHead>
                  <TableHead className="text-text-secondary text-right">Expansion</TableHead>
                  <TableHead className="text-text-secondary text-right">Contraction</TableHead>
                  <TableHead className="text-text-secondary text-right">Churn</TableHead>
                  <TableHead className="text-text-secondary text-right font-semibold">Net New</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.month} className="border-b border-border/50">
                    <TableCell className="font-mono text-sm text-text-primary">{m.month}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-positive">
                      +{formatCurrency(m.newMrr)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-positive">
                      +{formatCurrency(m.expansionMrr)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-negative">
                      -{formatCurrency(Math.abs(m.contractionMrr))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-negative">
                      -{formatCurrency(Math.abs(m.churnMrr))}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-mono text-sm tabular-nums font-semibold",
                      m.netNew >= 0 ? "text-positive" : "text-negative"
                    )}>
                      {m.netNew >= 0 ? "+" : ""}{formatCurrency(m.netNew)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart Comparison */}
      {movements.length >= 2 && (
        <Card className="bg-bg-surface-1 border">
          <CardHeader>
            <CardTitle className="font-satoshi text-base text-text-primary">
              Month over Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              title=""
              data={movements.slice(-6).map((m) => ({
                month: m.month,
                current: m.newMrr + m.expansionMrr,
                previous: Math.abs(m.contractionMrr) + Math.abs(m.churnMrr),
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
