"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { PeriodSelector } from "./period-selector";

const pageNames: Record<string, string> = {
  "/overview": "Overview",
  "/revenue": "Revenue",
  "/customers": "Customers",
  "/churn": "Churn",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] ?? "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-default bg-bg-primary px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-tertiary">Dashboard</span>
        <span className="text-text-tertiary">/</span>
        <span className="font-medium text-text-primary">{pageName}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <PeriodSelector />
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-surface-2 hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
