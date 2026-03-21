import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RevenueLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>

      {/* Header KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-bg-surface-1 border">
            <CardContent className="flex flex-col gap-2 py-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stacked Area Chart */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>

      {/* Movement Table */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="bg-bg-surface-1 border">
        <CardHeader>
          <Skeleton className="h-5 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
