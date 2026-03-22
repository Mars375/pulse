"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const WORDS = ["Know", "your", "numbers."];

/* Floating stat badge */
function FloatBadge({
  className,
  icon: Icon,
  label,
  value,
  trend,
}: {
  className?: string;
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div
      className={cn(
        "absolute hidden lg:flex items-center gap-2.5 rounded-xl border border-white/10 bg-bg-surface-1/80 backdrop-blur-md px-3 py-2 shadow-xl",
        className
      )}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-primary/15">
        <Icon className="h-3.5 w-3.5 text-accent-primary" />
      </div>
      <div>
        <p className="text-[10px] text-text-tertiary leading-none mb-0.5">{label}</p>
        <p className="font-mono text-xs font-bold text-text-primary">{value}</p>
      </div>
      <span className="text-[10px] font-medium text-positive">{trend}</span>
    </div>
  );
}

export function Hero() {
  const [revealedCount, setRevealedCount] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= WORDS.length) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (revealedCount >= WORDS.length) {
      const timer = setTimeout(() => setSubtitleVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [revealedCount]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 3;
    const y = ((e.clientX - rect.left - rect.width / 2) / rect.width) * -3;
    setTilt({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    <section
      className="relative min-h-[90vh] pt-32 pb-24 overflow-hidden flex flex-col justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Background atmosphere ── */}

      {/* Grid lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial gradient orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-20 h-[350px] w-[350px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, rgba(12,12,14,0.7) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative mx-auto w-full max-w-5xl px-6 text-center">

        {/* Label pill */}
        <div
          className={cn(
            "mb-6 inline-flex items-center gap-2 rounded-full border border-accent-primary/25 bg-accent-primary/8 px-4 py-1.5 text-xs text-accent-primary transition-all duration-500",
            subtitleVisible || revealedCount > 0 ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse" />
          Real-time SaaS metrics
        </div>

        {/* Headline */}
        <h1 className="font-satoshi text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {WORDS.map((word, i) => (
            <span key={word} className="inline-block mr-[0.25em] overflow-hidden">
              <span
                className={cn("inline-block transition-transform duration-500 ease-out", word === "numbers." && "text-transparent bg-clip-text")}
                style={{
                  transform: i < revealedCount ? "translateY(0)" : "translateY(110%)",
                  transitionDelay: `${i * 80}ms`,
                  ...(word === "numbers." ? { backgroundImage: "linear-gradient(135deg, #6366F1, #A78BFA)" } : {}),
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto mt-6 max-w-xl text-base text-text-secondary transition-all duration-700 sm:text-lg"
          style={{
            opacity: subtitleVisible ? 1 : 0,
            transform: subtitleVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          MRR, churn, cohorts, customers — one dashboard for{" "}
          <span className="text-text-primary">everything that matters.</span>
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row transition-all duration-700"
          style={{
            opacity: subtitleVisible ? 1 : 0,
            transform: subtitleVisible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "150ms",
          }}
        >
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-medium text-white shadow-lg shadow-accent-primary/20 transition-all hover:bg-accent-primary-hover hover:shadow-accent-primary/30 hover:-translate-y-0.5"
          >
            Start Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/overview"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-text-secondary backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/8 hover:text-text-primary"
          >
            See Demo
          </Link>
        </div>

        {/* Dashboard mockup */}
        <div
          className="relative mt-20 flex justify-center [perspective:1400px]"
          style={{
            opacity: subtitleVisible ? 1 : 0,
            transition: "opacity 0.8s ease 0.4s",
          }}
        >
          {/* Floating badges */}
          <FloatBadge
            className="-left-4 top-8 animate-[float_4s_ease-in-out_infinite]"
            icon={TrendingUp}
            label="MRR"
            value="$48.2K"
            trend="+12.3%"
          />
          <FloatBadge
            className="-right-4 top-16 animate-[float_4s_ease-in-out_0.8s_infinite]"
            icon={Users}
            label="Active"
            value="1,247"
            trend="+8.1%"
          />
          <FloatBadge
            className="left-8 -bottom-4 animate-[float_4s_ease-in-out_1.6s_infinite]"
            icon={Zap}
            label="Churn"
            value="2.1%"
            trend="-0.4%"
          />

          {/* Glow under mockup */}
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-2/3 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)",
              filter: "blur(30px)",
              transform: "translateX(-50%) translateY(50%)",
            }}
          />

          <div
            ref={mockupRef}
            className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-bg-surface-1 shadow-2xl transition-transform duration-200 ease-out overflow-hidden"
            style={{
              transform: `rotateX(${6 + tilt.x}deg) rotateY(${-4 + tilt.y}deg)`,
              boxShadow: "0 60px 120px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Inner glow top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-negative/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-positive/60" />
              </div>
              <div className="h-5 w-32 rounded-md bg-bg-surface-2 border border-white/5" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-md bg-bg-surface-2 border border-white/5" />
                <div className="h-5 w-5 rounded-md bg-accent-primary/20 border border-accent-primary/30" />
              </div>
            </div>

            <div className="flex h-72">
              {/* Sidebar */}
              <div className="w-14 shrink-0 border-r border-white/5 bg-bg-surface-1/50 flex flex-col items-center gap-3 pt-4">
                <div className="h-7 w-7 rounded-lg bg-accent-primary/20 border border-accent-primary/30" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-7 w-7 rounded-lg bg-bg-surface-2/60" />
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 space-y-3 overflow-hidden">
                {/* KPI row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "MRR", value: "$48.2K", color: "bg-chart-1", up: true },
                    { label: "ARR", value: "$578K", color: "bg-chart-2", up: true },
                    { label: "Customers", value: "1,247", color: "bg-chart-3", up: true },
                    { label: "Churn", value: "2.1%", color: "bg-negative", up: false },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-lg bg-bg-surface-2 p-2.5 border border-white/5">
                      <div className="text-[9px] text-text-tertiary mb-1">{kpi.label}</div>
                      <div className="font-mono text-xs font-bold text-text-primary">{kpi.value}</div>
                      <div className={cn("mt-1.5 h-0.5 w-3/4 rounded-full opacity-50", kpi.color)} />
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-5 gap-2">
                  {/* Area chart */}
                  <div className="col-span-3 rounded-lg bg-bg-surface-2 p-3 border border-white/5">
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="font-mono text-xs font-bold text-text-primary">MRR</span>
                      <span className="text-[9px] text-positive">+12.3%</span>
                    </div>
                    <div className="flex items-end gap-px h-14">
                      {[28, 32, 29, 38, 35, 45, 42, 52, 49, 60, 58, 68, 65, 75, 73, 82].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${h}%`,
                            background: `rgba(99,102,241,${0.3 + (i / 16) * 0.5})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Donut */}
                  <div className="col-span-2 rounded-lg bg-bg-surface-2 p-3 border border-white/5 flex flex-col justify-between">
                    <div className="text-[9px] text-text-tertiary">By Plan</div>
                    <div className="flex items-center justify-center">
                      <div className="relative h-12 w-12">
                        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(99,102,241,0.6)" strokeWidth="4" strokeDasharray="44 44" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="4" strokeDasharray="27 61" strokeDashoffset="-44" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth="4" strokeDasharray="17 71" strokeDashoffset="-71" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {[["Pro", "bg-chart-1"], ["Starter", "bg-chart-2"], ["Biz", "bg-chart-3"]].map(([name, color]) => (
                        <div key={name} className="flex items-center gap-1.5">
                          <div className={cn("h-1.5 w-1.5 rounded-full", color)} />
                          <span className="text-[8px] text-text-tertiary">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity rows */}
                <div className="space-y-1">
                  {[
                    { name: "Acme Corp", action: "Upgraded to Pro", delta: "+$50", color: "text-positive" },
                    { name: "Zenith Co", action: "New customer", delta: "+$79", color: "text-positive" },
                    { name: "Nebula Ltd", action: "Churned", delta: "-$29", color: "text-negative" },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center justify-between rounded-md bg-bg-surface-2/50 px-3 py-1.5 border border-white/3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-bg-surface-2 border border-white/10" />
                        <span className="text-[9px] font-medium text-text-primary">{row.name}</span>
                        <span className="text-[9px] text-text-tertiary">{row.action}</span>
                      </div>
                      <span className={cn("font-mono text-[9px] font-bold", row.color)}>{row.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
