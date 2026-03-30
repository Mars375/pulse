"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

interface CustomerDetailProps {
  customerId: string | null;
  onClose: () => void;
}

interface CustomerData {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrrValue: number;
  signupDate: string;
  churnedAt: string | null;
  churnReason: string | null;
  events: { id: string; type: string; mrrDelta: number; date: string }[];
  invoices: { id: string; amount: number; status: string; createdAt: string }[];
}

const planColors: Record<string, string> = {
  starter: "bg-info/10 text-info",
  pro: "bg-accent-primary/10 text-accent-primary",
  business: "bg-chart-2/10 text-chart-2",
};

const eventLabels: Record<string, string> = {
  new: "Signed up",
  expansion: "Upgraded",
  contraction: "Downgraded",
  churn: "Churned",
  reactivation: "Reactivated",
};

export function CustomerDetail({ customerId, onClose }: CustomerDetailProps) {
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [customerId]);

  return (
    <Sheet open={!!customerId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-bg-surface-1 border-l w-[450px] sm:max-w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-satoshi text-text-primary">
            {data?.name ?? "Loading..."}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 rounded bg-bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 space-y-6"
          >
            {/* Info */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">Email</span>
                <span className="text-text-primary text-sm">{data.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">Plan</span>
                <Badge className={cn("text-xs", planColors[data.plan])}>
                  {data.plan}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">MRR</span>
                <span className="font-mono text-sm tabular-nums text-text-primary">
                  {formatCurrency(data.mrrValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">Signed up</span>
                <span className="text-text-primary text-sm">
                  {formatDate(new Date(data.signupDate))}
                </span>
              </div>
              {data.churnedAt && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Churned</span>
                    <span className="text-negative text-sm">
                      {formatDate(new Date(data.churnedAt))}
                    </span>
                  </div>
                  {data.churnReason && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary text-sm">Reason</span>
                      <span className="text-text-primary text-sm">{data.churnReason}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator className="bg-border" />

            {/* Event Timeline */}
            <div>
              <h3 className="font-satoshi font-semibold text-text-primary mb-3">Timeline</h3>
              <div className="space-y-2">
                {data.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between text-sm py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        event.type === "churn" ? "bg-negative" :
                        event.type === "contraction" ? "bg-warning" : "bg-positive"
                      )} />
                      <span className="text-text-secondary">
                        {eventLabels[event.type] ?? event.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "font-mono tabular-nums",
                        event.mrrDelta >= 0 ? "text-positive" : "text-negative"
                      )}>
                        {event.mrrDelta >= 0 ? "+" : ""}{formatCurrency(event.mrrDelta)}
                      </span>
                      <span className="text-text-tertiary text-xs w-14 text-right">
                        {formatRelativeTime(new Date(event.date))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Invoices */}
            <div>
              <h3 className="font-satoshi font-semibold text-text-primary mb-3">Invoices</h3>
              <div className="space-y-2">
                {data.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between text-sm py-1.5"
                  >
                    <span className="font-mono tabular-nums text-text-primary">
                      {formatCurrency(inv.amount)}
                    </span>
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "text-xs",
                        inv.status === "paid" ? "bg-positive/10 text-positive" :
                        inv.status === "pending" ? "bg-warning/10 text-warning" :
                        "bg-negative/10 text-negative"
                      )}>
                        {inv.status}
                      </Badge>
                      <span className="text-text-tertiary text-xs">
                        {formatDate(new Date(inv.createdAt))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
