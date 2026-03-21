"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-animation";

interface Plan {
  name: string;
  monthlyPrice: number;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 29,
    features: [
      "Up to 500 customers",
      "MRR & churn tracking",
      "Basic cohort analysis",
      "Email support",
      "7-day data history",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 79,
    popular: true,
    features: [
      "Up to 5,000 customers",
      "All Starter features",
      "Advanced cohort retention",
      "Customer intelligence",
      "Churn prediction",
      "Slack & webhook alerts",
      "Priority support",
    ],
  },
  {
    name: "Business",
    monthlyPrice: 199,
    features: [
      "Unlimited customers",
      "All Pro features",
      "Custom dashboards",
      "API access",
      "SSO & SAML",
      "Dedicated account manager",
      "99.99% SLA",
      "Audit logs",
    ],
  },
];

export function PricingCards() {
  const [annual, setAnnual] = useState(false);
  const headingRef = useScrollReveal({ y: 30, duration: 0.6 });
  const cardsRef = useStaggerReveal(0.15);

  function getPrice(monthlyPrice: number) {
    if (annual) {
      return Math.round(monthlyPrice * 10) / 12;
    }
    return monthlyPrice;
  }

  function formatPrice(price: number) {
    return price % 1 === 0 ? `$${price}` : `$${price.toFixed(0)}`;
  }

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-12">
          <h2 className="font-satoshi text-3xl font-bold text-text-primary sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-text-secondary">
            Start free. Upgrade when you&apos;re ready.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm transition-colors",
                  !annual ? "text-text-primary" : "text-text-tertiary"
                )}
              >
                Monthly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={annual}
                onClick={() => setAnnual((prev) => !prev)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  annual ? "bg-accent-primary" : "bg-bg-surface-2"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    annual ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-sm transition-colors",
                  annual ? "text-text-primary" : "text-text-tertiary"
                )}
              >
                Annual
              </span>
            </div>
            <div className="h-6 flex items-center">
              {annual && (
                <span className="rounded-full bg-accent-glow px-2.5 py-0.5 text-xs font-medium text-accent-primary">
                  Save 17%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 transition-shadow duration-300",
                plan.popular
                  ? "border-accent-primary/30 bg-bg-surface-1 md:scale-105"
                  : "border-border-default bg-bg-surface-1"
              )}
              style={
                plan.popular
                  ? { boxShadow: "0 0 40px rgba(99,102,241,0.15)" }
                  : undefined
              }
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-primary px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </span>
              )}

              <h3 className="font-satoshi text-lg font-bold text-text-primary">
                {plan.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-bold text-text-primary">
                  {formatPrice(getPrice(plan.monthlyPrice))}
                </span>
                <span className="text-sm text-text-secondary">/mo</span>
              </div>

              {annual && (
                <p className="mt-1 text-xs text-text-tertiary">
                  Billed annually
                </p>
              )}

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={cn(
                  "mt-8 block w-full rounded-xl py-3 text-center text-sm font-medium transition-colors",
                  plan.popular
                    ? "bg-accent-primary text-white hover:bg-accent-primary-hover"
                    : "border border-border-default text-text-secondary hover:border-text-tertiary hover:text-text-primary"
                )}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
