"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface AnimatedCounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  started: boolean;
}

function AnimatedCounter({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2000,
  started,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = eased * end;

      if (decimals > 0) {
        setDisplay(current.toFixed(decimals));
      } else {
        setDisplay(Math.round(current).toLocaleString("en-US"));
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [end, decimals, duration]);

  useEffect(() => {
    if (started) {
      animate();
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [started, animate]);

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

const METRICS = [
  { end: 2.4, prefix: "$", suffix: "M", decimals: 1, label: "MRR tracked" },
  { end: 12000, prefix: "", suffix: "+", decimals: 0, label: "Active customers" },
  { end: 99.9, prefix: "", suffix: "%", decimals: 1, label: "Uptime SLA" },
] as const;

export function MetricsBar() {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="bg-bg-surface-1 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 text-center">
          {METRICS.map((metric) => (
            <div key={metric.label}>
              <div className="font-mono text-5xl font-bold text-text-primary">
                <AnimatedCounter
                  end={metric.end}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  decimals={metric.decimals}
                  started={isVisible}
                />
              </div>
              <p className="mt-2 text-sm text-text-secondary">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
