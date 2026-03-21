"use client";

import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

/* ---------- Mini chart visuals ---------- */

function MiniAreaChart() {
  const points = [20, 35, 28, 50, 45, 62, 55, 72, 68, 85, 80, 92];
  return (
    <div className="rounded-xl bg-bg-surface-2 p-4 border border-border-default">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-mono text-xl font-bold text-text-primary">$48.2K</span>
        <span className="text-xs font-medium text-positive">+12.3%</span>
      </div>
      <div className="flex items-end gap-[3px] h-20">
        {points.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-chart-1/70 transition-all"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function MiniHeatmap() {
  const rows = 4;
  const cols = 8;
  const opacities = [
    [90, 80, 70, 60, 50, 40, 35, 30],
    [85, 75, 65, 55, 45, 38, 30, 25],
    [80, 70, 58, 48, 40, 32, 28, 20],
    [75, 65, 55, 42, 35, 28, 22, 18],
  ];
  return (
    <div className="rounded-xl bg-bg-surface-2 p-4 border border-border-default">
      <div className="mb-3 text-xs text-text-tertiary uppercase tracking-wider">
        Cohort Retention
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              className="aspect-square rounded-sm bg-chart-2"
              style={{ opacity: (opacities[r][c] / 100) }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MiniTable() {
  const rows = [
    { name: "Acme Corp", mrr: "$2,400", status: "active" },
    { name: "Quantum Inc", mrr: "$1,800", status: "active" },
    { name: "Nebula Ltd", mrr: "$950", status: "at risk" },
    { name: "Zenith Co", mrr: "$3,200", status: "active" },
  ];
  return (
    <div className="rounded-xl bg-bg-surface-2 p-4 border border-border-default">
      <div className="mb-3 text-xs text-text-tertiary uppercase tracking-wider">
        Customers
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-lg bg-bg-surface-1 px-3 py-2"
          >
            <span className="text-xs text-text-primary">{row.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-text-secondary">{row.mrr}</span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  row.status === "active" ? "bg-positive" : "bg-negative"
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBarChart() {
  const bars = [
    { label: "Price", pct: 35 },
    { label: "Support", pct: 25 },
    { label: "Features", pct: 20 },
    { label: "Other", pct: 12 },
  ];
  return (
    <div className="rounded-xl bg-bg-surface-2 p-4 border border-border-default">
      <div className="mb-3 text-xs text-text-tertiary uppercase tracking-wider">
        Churn Reasons
      </div>
      <div className="space-y-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="w-14 text-right text-[10px] text-text-secondary">{bar.label}</span>
            <div className="flex-1 h-3 rounded-full bg-bg-surface-1 overflow-hidden">
              <div
                className="h-full rounded-full bg-negative/70"
                style={{ width: `${bar.pct}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-text-secondary">{bar.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Feature data ---------- */

const FEATURES = [
  {
    title: "MRR at a glance",
    description: "Track monthly recurring revenue with real-time precision.",
    visual: <MiniAreaChart />,
  },
  {
    title: "Cohort retention",
    description: "Understand how each cohort retains over time.",
    visual: <MiniHeatmap />,
  },
  {
    title: "Customer intelligence",
    description: "Every customer, every metric, one search away.",
    visual: <MiniTable />,
  },
  {
    title: "Churn autopsy",
    description: "Know exactly why customers leave — and who's next.",
    visual: <MiniBarChart />,
  },
] as const;

/* ---------- Feature row ---------- */

function FeatureRow({
  title,
  description,
  visual,
  reversed,
  index,
}: {
  title: string;
  description: string;
  visual: React.ReactNode;
  reversed: boolean;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center gap-10 md:gap-16 transition-all duration-600 ease-out",
        reversed ? "md:flex-row-reverse" : "md:flex-row",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Text */}
      <div className="flex-1 text-center md:text-left">
        <h3 className="font-satoshi text-2xl font-bold text-text-primary sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-text-secondary max-w-md">
          {description}
        </p>
      </div>

      {/* Visual */}
      <div
        className={cn(
          "flex-1 w-full max-w-sm transition-transform duration-300",
          reversed ? "rotate-1 hover:rotate-0" : "-rotate-1 hover:rotate-0"
        )}
      >
        {visual}
      </div>
    </div>
  );
}

/* ---------- Features section ---------- */

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-5xl px-6 space-y-24">
        <div className="text-center">
          <h2 className="font-satoshi text-3xl font-bold text-text-primary sm:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mt-3 text-text-secondary">
            One dashboard. Every metric that matters.
          </p>
        </div>

        {FEATURES.map((feature, i) => (
          <FeatureRow
            key={feature.title}
            title={feature.title}
            description={feature.description}
            visual={feature.visual}
            reversed={i % 2 === 1}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
