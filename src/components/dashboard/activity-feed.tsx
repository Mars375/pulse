"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, UserPlus, UserMinus, RefreshCw } from "lucide-react";
import { cn, formatRelativeTime, formatCurrency } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "new" | "expansion" | "contraction" | "churn" | "reactivation";
  customerName: string;
  mrrDelta: number;
  date: Date;
}

const typeConfig = {
  new: { icon: UserPlus, label: "New customer", color: "text-positive" },
  expansion: { icon: TrendingUp, label: "Expansion", color: "text-positive" },
  contraction: { icon: TrendingDown, label: "Contraction", color: "text-warning" },
  churn: { icon: UserMinus, label: "Churned", color: "text-negative" },
  reactivation: { icon: RefreshCw, label: "Reactivated", color: "text-info" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-bg-surface-2/50 transition-colors duration-150"
          >
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-surface-2", config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">
                <span className="font-medium">{item.customerName}</span>
                <span className="text-text-secondary"> — {config.label}</span>
              </p>
            </div>
            <span className={cn("font-mono text-sm tabular-nums shrink-0", item.mrrDelta >= 0 ? "text-positive" : "text-negative")}>
              {item.mrrDelta >= 0 ? "+" : ""}{formatCurrency(item.mrrDelta)}
            </span>
            <span className="text-text-tertiary text-xs shrink-0 w-16 text-right">
              {formatRelativeTime(new Date(item.date))}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
