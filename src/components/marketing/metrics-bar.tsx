"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function AnimatedCounter({ end, prefix = "", suffix = "", decimals = 0 }: CounterProps) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const proxy = { value: 0 };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      onEnter: () => {
        if (triggered.current) return;
        triggered.current = true;

        gsap.to(proxy, {
          value: end,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            const v = decimals > 0
              ? proxy.value.toFixed(decimals)
              : Math.round(proxy.value).toLocaleString("en-US");
            setDisplay(`${prefix}${v}${suffix}`);
          },
        });
      },
    });

    return () => st.kill();
  }, [end, prefix, suffix, decimals]);

  return <span ref={ref}>{display}</span>;
}

const METRICS = [
  { end: 2.4, prefix: "$", suffix: "M", decimals: 1, label: "MRR tracked" },
  { end: 12000, prefix: "", suffix: "+", decimals: 0, label: "Active customers" },
  { end: 99.9, prefix: "", suffix: "%", decimals: 1, label: "Uptime SLA" },
] as const;

export function MetricsBar() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 20 });

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-bg-surface-1 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 text-center">
          {METRICS.map((metric) => (
            <div key={metric.label}>
              <div className="font-mono text-5xl font-bold text-text-primary tabular-nums">
                <AnimatedCounter
                  end={metric.end}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  decimals={metric.decimals}
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
