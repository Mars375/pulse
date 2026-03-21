"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WORDS = ["Know", "your", "numbers."];

export function Hero() {
  const [revealedCount, setRevealedCount] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= WORDS.length) {
          clearInterval(interval);
          return prev;
        }
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
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = ((e.clientY - centerY) / rect.height) * 3;
    const y = ((e.clientX - centerX) / rect.width) * -3;
    setTilt({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <section
      className="relative pt-32 pb-20 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* Headline */}
        <h1 className="font-satoshi text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
          {WORDS.map((word, i) => (
            <span key={word} className="inline-block mr-[0.3em] overflow-hidden">
              <span
                className={cn(
                  "inline-block transition-transform duration-500 ease-out",
                  i < revealedCount
                    ? "translate-y-0"
                    : "translate-y-[110%]"
                )}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p
          className={cn(
            "mx-auto mt-6 max-w-2xl text-lg text-text-secondary transition-all duration-700",
            subtitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          Real-time SaaS metrics. MRR, churn, cohorts — one dashboard for
          everything that matters.
        </p>

        {/* CTA buttons */}
        <div
          className={cn(
            "mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-200",
            subtitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-primary-hover"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/overview"
            className="inline-flex items-center gap-2 rounded-xl border border-border-default px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary"
          >
            See Demo
          </Link>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-20 flex justify-center [perspective:1200px]">
          <div
            ref={mockupRef}
            className="relative w-full max-w-3xl rounded-2xl border border-border-default bg-bg-surface-1 p-4 shadow-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${8 + tilt.x}deg) rotateY(${-5 + tilt.y}deg)`,
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.15)",
            }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-text-tertiary/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-text-tertiary/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-text-tertiary/40" />
              <div className="ml-4 h-2 w-24 rounded bg-bg-surface-2" />
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "MRR", value: "$48.2K", color: "bg-chart-1" },
                { label: "Customers", value: "1,247", color: "bg-chart-2" },
                { label: "Churn", value: "2.1%", color: "bg-positive" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg bg-bg-surface-2 p-3"
                >
                  <div className="text-[10px] text-text-tertiary">{kpi.label}</div>
                  <div className="mt-1 font-mono text-sm font-bold text-text-primary">
                    {kpi.value}
                  </div>
                  <div className={cn("mt-2 h-1 w-3/4 rounded-full", kpi.color, "opacity-60")} />
                </div>
              ))}
            </div>

            {/* Mini chart area */}
            <div className="rounded-lg bg-bg-surface-2 p-3">
              <div className="flex items-end gap-[3px] h-16">
                {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 90, 88, 95].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-accent-primary/60"
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
              <div className="mt-2 flex justify-between">
                <div className="h-1.5 w-12 rounded bg-bg-surface-1" />
                <div className="h-1.5 w-8 rounded bg-bg-surface-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
