import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock Sheet components used by Navbar
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { Hero } from "@/components/marketing/hero";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
describe("Hero", () => {
  it("renders without crashing", () => {
    render(<Hero />);
    // The headline words are individual spans
    expect(screen.getByText("Know")).toBeInTheDocument();
    expect(screen.getByText("your")).toBeInTheDocument();
    expect(screen.getByText("numbers.")).toBeInTheDocument();
  });

  it("contains the Start Free CTA link", () => {
    render(<Hero />);
    const startFreeLink = screen.getByText("Start Free").closest("a");
    expect(startFreeLink).toHaveAttribute("href", "/sign-up");
  });

  it("contains the See Demo CTA link", () => {
    render(<Hero />);
    const demoLink = screen.getByText("See Demo").closest("a");
    expect(demoLink).toHaveAttribute("href", "/overview");
  });

  it("displays the label pill text", () => {
    render(<Hero />);
    expect(screen.getByText("Real-time SaaS metrics")).toBeInTheDocument();
  });

  it("displays the subheadline text", () => {
    render(<Hero />);
    expect(screen.getByText(/MRR, churn, cohorts, customers/)).toBeInTheDocument();
  });

  it("renders the dashboard mockup with KPI labels", () => {
    render(<Hero />);
    // Mockup KPI labels inside the visual
    expect(screen.getByText("Customers")).toBeInTheDocument();
  });

  it("renders floating badge stat values", () => {
    render(<Hero />);
    // Values appear in both floating badges and the mockup, so use getAllByText
    expect(screen.getAllByText("$48.2K").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1,247").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2.1%").length).toBeGreaterThanOrEqual(1);
  });

  it("has a heading element for the headline", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
describe("Navbar", () => {
  it("renders without crashing", () => {
    render(<Navbar />);
    expect(screen.getByText("Pulse")).toBeInTheDocument();
  });

  it("displays navigation links", () => {
    render(<Navbar />);
    const featureLinks = screen.getAllByText("Features");
    expect(featureLinks.length).toBeGreaterThanOrEqual(1);
    const pricingLinks = screen.getAllByText("Pricing");
    expect(pricingLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("has Features link pointing to #features", () => {
    render(<Navbar />);
    const featureLinks = screen.getAllByText("Features");
    const link = featureLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "#features");
  });

  it("has Pricing link pointing to #pricing", () => {
    render(<Navbar />);
    const pricingLinks = screen.getAllByText("Pricing");
    const link = pricingLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "#pricing");
  });

  it("has a Get Started CTA linking to sign-up", () => {
    render(<Navbar />);
    const ctaLinks = screen.getAllByText("Get Started");
    const link = ctaLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "/sign-up");
  });

  it("has the Pulse logo linking to home", () => {
    render(<Navbar />);
    const logoLink = screen.getByText("Pulse").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("has a mobile menu button with aria-label", () => {
    render(<Navbar />);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("renders as a header element", () => {
    render(<Navbar />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("contains a nav element", () => {
    render(<Navbar />);
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
describe("Footer", () => {
  it("renders without crashing", () => {
    render(<Footer />);
    expect(screen.getByText("Pulse")).toBeInTheDocument();
  });

  it("displays the Pulse logo linking to home", () => {
    render(<Footer />);
    const logoLink = screen.getByText("Pulse").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("has Features link pointing to #features", () => {
    render(<Footer />);
    const link = screen.getByText("Features").closest("a");
    expect(link).toHaveAttribute("href", "#features");
  });

  it("has Pricing link pointing to #pricing", () => {
    render(<Footer />);
    const link = screen.getByText("Pricing").closest("a");
    expect(link).toHaveAttribute("href", "#pricing");
  });

  it("has Sign In link pointing to /sign-in", () => {
    render(<Footer />);
    const link = screen.getByText("Sign In").closest("a");
    expect(link).toHaveAttribute("href", "/sign-in");
  });

  it("displays the tech stack text", () => {
    render(<Footer />);
    expect(screen.getByText("Built with Next.js, Neon & Stripe")).toBeInTheDocument();
  });

  it("displays copyright notice", () => {
    render(<Footer />);
    expect(screen.getByText(/2026 Pulse. All rights reserved./)).toBeInTheDocument();
  });

  it("renders as a footer element", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });
});
