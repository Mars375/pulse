"use client";

import { cn } from "@/lib/utils";

const LOGOS = [
  "ACME",
  "QUANTUM",
  "NEBULA",
  "ZENITH",
  "APEX",
  "VORTEX",
  "CIPHER",
  "PRISM",
] as const;

export function TrustedBy() {
  return (
    <section className="border-y border-border-default py-12 overflow-hidden">
      <p className="mb-6 text-center text-xs uppercase tracking-widest text-text-tertiary">
        Trusted by fast-growing teams
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg-primary to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg-primary to-transparent" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className={cn(
                "mx-8 inline-block font-mono text-lg font-semibold uppercase text-text-primary opacity-40 select-none",
                "sm:mx-12 sm:text-xl"
              )}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
