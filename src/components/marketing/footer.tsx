import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5">
            <span className="font-satoshi text-xl font-bold text-text-primary">
              Pulse
            </span>
            <span className="relative -top-0.5 ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-accent-primary animate-heartbeat" />
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Pricing
            </a>
            <Link
              href="/sign-in"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Sign In
            </Link>
          </div>

          {/* Built with */}
          <p className="text-sm text-text-tertiary">
            Built with Next.js, Neon &amp; Stripe
          </p>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-center text-xs text-text-tertiary">
          &copy; 2026 Pulse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
