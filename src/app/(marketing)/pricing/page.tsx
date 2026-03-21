import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free. Upgrade when your SaaS grows.",
};
import { Check } from "lucide-react";

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime from your dashboard. Changes apply immediately and we prorate the difference.",
  },
  {
    q: "What happens when my trial ends?",
    a: "You keep access to all your data on the free tier. Upgrade when you're ready — no pressure, no data loss.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — save 17% with annual billing. Toggle the switch on the pricing cards above to see annual prices.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. No contracts, no cancellation fees. Your data stays accessible on the free tier after cancellation.",
  },
  {
    q: "Is there a setup fee?",
    a: "No. Sign up, connect your payment provider, and start tracking metrics in under 2 minutes.",
  },
];

const features = [
  { name: "MRR tracking", starter: true, pro: true, business: true },
  { name: "Customer list", starter: true, pro: true, business: true },
  { name: "Basic charts", starter: true, pro: true, business: true },
  { name: "Cohort analysis", starter: false, pro: true, business: true },
  { name: "Churn predictions", starter: false, pro: true, business: true },
  { name: "Custom dashboards", starter: false, pro: false, business: true },
  { name: "API access", starter: false, pro: false, business: true },
  { name: "Dedicated support", starter: false, pro: false, business: true },
  { name: "Team members", starter: "1", pro: "5", business: "Unlimited" },
  { name: "Data retention", starter: "3 months", pro: "12 months", business: "Unlimited" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="font-satoshi text-4xl font-bold text-text-primary text-center">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-center text-text-secondary text-lg max-w-2xl mx-auto">
          Start free. Upgrade when your SaaS grows. No surprises.
        </p>
      </div>

      <div className="mt-16">
        <PricingCards />
      </div>

      {/* Feature comparison */}
      <div className="mx-auto max-w-4xl px-6 mt-24">
        <h2 className="font-satoshi text-2xl font-bold text-text-primary text-center mb-8">
          Compare plans
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left text-text-secondary font-medium">Feature</th>
                <th className="py-3 text-center text-text-secondary font-medium">Starter</th>
                <th className="py-3 text-center text-text-secondary font-medium">Pro</th>
                <th className="py-3 text-center text-text-secondary font-medium">Business</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} className="border-b border-border/50">
                  <td className="py-3 text-text-primary">{f.name}</td>
                  {(["starter", "pro", "business"] as const).map((plan) => (
                    <td key={plan} className="py-3 text-center">
                      {typeof f[plan] === "boolean" ? (
                        f[plan] ? (
                          <Check className="mx-auto h-4 w-4 text-positive" />
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )
                      ) : (
                        <span className="text-text-primary font-mono text-xs">{f[plan]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl px-6 mt-24">
        <h2 className="font-satoshi text-2xl font-bold text-text-primary text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b pb-6">
              <h3 className="font-satoshi font-semibold text-text-primary">{faq.q}</h3>
              <p className="mt-2 text-text-secondary text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
