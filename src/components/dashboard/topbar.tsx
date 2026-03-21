"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { PeriodSelector } from "./period-selector";
import { navItems } from "./sidebar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-default bg-bg-primary px-4 md:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-surface-2 hover:text-text-primary"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-bg-surface-1 border-border-default p-0"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>

              {/* Logo */}
              <div className="flex h-16 items-center px-4 border-b border-border-default">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-primary font-satoshi text-lg font-bold text-white">
                  P
                </div>
                <span className="ml-3 font-satoshi text-lg font-bold text-text-primary">
                  Pulse
                </span>
              </div>

              {/* Nav items */}
              <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent-primary/15 text-text-primary"
                          : "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive ? "text-accent-primary" : "text-text-secondary"
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* User */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-border-default p-4">
                <UserButton
                  appearance={{
                    elements: { avatarBox: "h-8 w-8" },
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-text-tertiary sm:inline">Dashboard</span>
          <span className="hidden text-text-tertiary sm:inline">/</span>
          <span className="font-medium text-text-primary">{pageName}</span>
        </div>
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
