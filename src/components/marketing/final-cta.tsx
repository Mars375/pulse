import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 30% 60%, rgba(139,92,246,0.06) 0%, transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-satoshi text-4xl font-bold text-text-primary sm:text-5xl">
          Know your numbers.
        </h2>
        <p className="mt-4 text-lg text-text-secondary">
          Start tracking your SaaS metrics in under 2 minutes.
        </p>
        <div className="mt-10">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-8 py-4 text-base font-medium text-white transition-colors hover:bg-accent-primary-hover"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
