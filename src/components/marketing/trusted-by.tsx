"use client";

import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-animation";

const LOGOS = [
  { name: "ACME", mrr: "$12K MRR" },
  { name: "QUANTUM", mrr: "$89K MRR" },
  { name: "NEBULA", mrr: "$34K MRR" },
  { name: "ZENITH", mrr: "$156K MRR" },
  { name: "APEX", mrr: "$22K MRR" },
  { name: "VORTEX", mrr: "$67K MRR" },
  { name: "CIPHER", mrr: "$45K MRR" },
  { name: "PRISM", mrr: "$91K MRR" },
] as const;

export function TrustedBy() {
  const doubled = [...LOGOS, ...LOGOS];
  const ref = useScrollReveal({ y: 20, duration: 0.6 });

  return (
    <section ref={ref} className="border-y border-white/5 py-10 overflow-hidden bg-bg-surface-1/30">
      <p className="mb-8 text-center text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
        Trusted by fast-growing SaaS teams
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg-primary to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg-primary to-transparent" />

        <div
          className="flex whitespace-nowrap"
          style={{ animation: "marquee 35s linear infinite" }}
        >
          {doubled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="mx-8 inline-flex items-center gap-3 select-none sm:mx-12"
            >
              <span className={cn("font-mono text-sm font-bold uppercase tracking-wider text-text-primary/30")}>
                {logo.name}
              </span>
              <span className="font-mono text-[10px] text-text-tertiary/50 tabular-nums">
                {logo.mrr}
              </span>
              <span className="text-text-tertiary/20">&middot;</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
