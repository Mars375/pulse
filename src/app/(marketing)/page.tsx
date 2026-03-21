import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";

export const metadata: Metadata = {
  title: "Pulse — SaaS Metrics Dashboard",
  description:
    "Real-time SaaS metrics. MRR, churn, cohorts — one dashboard for everything that matters.",
};
import { TrustedBy } from "@/components/marketing/trusted-by";
import { Features } from "@/components/marketing/features";
import { MetricsBar } from "@/components/marketing/metrics-bar";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FinalCta } from "@/components/marketing/final-cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrustedBy />
      <section id="features">
        <Features />
      </section>
      <MetricsBar />
      <section id="pricing">
        <PricingCards />
      </section>
      <FinalCta />
    </div>
  );
}
