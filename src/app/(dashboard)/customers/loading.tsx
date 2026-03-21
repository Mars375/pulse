import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      {/* Header KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-bg-surface-1 border">
            <CardContent className="flex flex-col gap-2 py-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-xs" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table */}
      <Card className="bg-bg-surface-1 border">
        <CardContent className="p-0">
          <div className="space-y-0 divide-y divide-border">
            {/* Header */}
            <div className="flex gap-4 px-4 py-3">
              {["w-32", "w-48", "w-20", "w-20", "w-24", "w-20"].map((w, i) => (
                <Skeleton key={i} className={`h-3 ${w}`} />
              ))}
            </div>
            {/* Rows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
