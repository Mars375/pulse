"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  UserMinus,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/overview" },
  { icon: TrendingUp, label: "Revenue", href: "/revenue" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: UserMinus, label: "Churn", href: "/churn" },
  { icon: Settings, label: "Settings", href: "/settings" },
] as const;

const sidebarVariants = {
  expanded: { width: 240 },
  collapsed: { width: 64 },
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-screen flex-col border-r border-border-default bg-bg-surface-1"
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-primary font-satoshi text-lg font-bold text-white">
          P
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ml-3 font-satoshi text-lg font-bold text-text-primary"
          >
            Pulse
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-primary/15 text-text-primary"
                  : "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-accent-primary/15"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-5 w-5 shrink-0",
                  isActive ? "text-accent-primary" : "text-text-secondary group-hover:text-text-primary"
                )}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: User + Collapse toggle */}
      <div className="flex flex-col gap-2 border-t border-border-default p-3">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3 px-1")}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-surface-2 hover:text-text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
