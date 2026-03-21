import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChurnLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>

      {/* Header KPI */}
      <Card className="bg-bg-surface-1 border">
        <CardContent className="flex flex-col gap-2 py-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </CardContent>
      </Card>

      {/* Cohort Heatmap */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-1">
                <Skeleton className="h-8 w-24 shrink-0" />
                {Array.from({ length: 12 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Churn Reasons */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-6 flex-1" style={{ maxWidth: `${80 - i * 12}%` }} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* At Risk Table */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
