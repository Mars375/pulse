import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Profile Card */}
      <Card className="bg-bg-surface-1 border">
        <CardContent className="space-y-6 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full max-w-sm" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full max-w-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
