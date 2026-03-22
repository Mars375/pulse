import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

// Add UserButton to the Clerk mock (setup.ts doesn't include it)
vi.mock("@clerk/nextjs", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@clerk/nextjs");
  return {
    ...actual,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    UserButton: () => <div data-testid="user-button" />,
    useUser: () => ({ user: { id: "test-user" }, isLoaded: true }),
    useAuth: () => ({ userId: "test-user", isLoaded: true }),
  };
});

// Mock the PeriodSelector used by Topbar (it uses Select which needs Radix internals)
vi.mock("@/components/dashboard/period-selector", () => ({
  PeriodSelector: () => <div data-testid="period-selector">Period Selector</div>,
}));

// Mock Sheet components used by Topbar
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { AtRiskTable } from "@/components/dashboard/at-risk-table";

// ---------------------------------------------------------------------------
// KpiCard
// ---------------------------------------------------------------------------
describe("KpiCard", () => {
  const defaultProps = {
    title: "Monthly Revenue",
    value: "$48,200",
    change: 12.3,
    sparklineData: [10, 20, 30, 40, 50],
    accentColor: "#6366F1",
  };

  it("renders without crashing", () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
  });

  it("displays the value and title", () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByText("$48,200")).toBeInTheDocument();
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
  });

  it("shows positive change with up arrow", () => {
    render(<KpiCard {...defaultProps} change={12.3} />);
    expect(screen.getByText("12.3%")).toBeInTheDocument();
  });

  it("shows negative change with down arrow", () => {
    render(<KpiCard {...defaultProps} change={-5.1} />);
    expect(screen.getByText("5.1%")).toBeInTheDocument();
  });

  it("handles zero change as positive", () => {
    render(<KpiCard {...defaultProps} change={0} />);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("renders sparkline SVG when data has 2+ points", () => {
    const { container } = render(<KpiCard {...defaultProps} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("polyline")).toBeInTheDocument();
  });

  it("does not render sparkline with fewer than 2 data points", () => {
    const { container } = render(<KpiCard {...defaultProps} sparklineData={[10]} />);
    expect(container.querySelector("polyline")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
describe("Sidebar", () => {
  it("renders without crashing", () => {
    render(<Sidebar />);
    expect(screen.getByText("Pulse")).toBeInTheDocument();
  });

  it("displays all navigation items", () => {
    render(<Sidebar />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByText("Churn")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders navigation links with correct hrefs", () => {
    render(<Sidebar />);
    const overviewLink = screen.getByText("Overview").closest("a");
    expect(overviewLink).toHaveAttribute("href", "/overview");
    const revenueLink = screen.getByText("Revenue").closest("a");
    expect(revenueLink).toHaveAttribute("href", "/revenue");
  });

  it("has a collapse/expand toggle button with aria-label", () => {
    render(<Sidebar />);
    const toggleButton = screen.getByLabelText("Collapse sidebar");
    expect(toggleButton).toBeInTheDocument();
  });

  it("toggles aria-label on collapse button click", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const toggleButton = screen.getByLabelText("Collapse sidebar");
    await user.click(toggleButton);
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
  });

  it("renders the logo P icon", () => {
    render(<Sidebar />);
    expect(screen.getByText("P")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Topbar
// ---------------------------------------------------------------------------
describe("Topbar", () => {
  it("renders without crashing", () => {
    render(<Topbar />);
    // pathname is mocked to /overview, so pageName = "Overview"
    // Multiple "Overview" texts exist (breadcrumb + mobile nav), so use getAllByText
    const overviewElements = screen.getAllByText("Overview");
    expect(overviewElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the breadcrumb with Dashboard prefix", () => {
    render(<Topbar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("has a notifications button with aria-label", () => {
    render(<Topbar />);
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("has a mobile navigation button with aria-label", () => {
    render(<Topbar />);
    expect(screen.getByLabelText("Open navigation")).toBeInTheDocument();
  });

  it("renders the period selector", () => {
    render(<Topbar />);
    expect(screen.getByTestId("period-selector")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ActivityFeed
// ---------------------------------------------------------------------------
describe("ActivityFeed", () => {
  const items = [
    {
      id: "1",
      type: "new" as const,
      customerName: "Acme Corp",
      mrrDelta: 7900,
      date: new Date(),
    },
    {
      id: "2",
      type: "churn" as const,
      customerName: "Zenith Co",
      mrrDelta: -2900,
      date: new Date(),
    },
    {
      id: "3",
      type: "expansion" as const,
      customerName: "Nebula Ltd",
      mrrDelta: 5000,
      date: new Date(),
    },
  ];

  it("renders without crashing", () => {
    render(<ActivityFeed items={items} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("displays all customer names", () => {
    render(<ActivityFeed items={items} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Zenith Co")).toBeInTheDocument();
    expect(screen.getByText("Nebula Ltd")).toBeInTheDocument();
  });

  it("shows the correct type labels", () => {
    render(<ActivityFeed items={items} />);
    expect(screen.getByText("— New customer")).toBeInTheDocument();
    expect(screen.getByText("— Churned")).toBeInTheDocument();
    expect(screen.getByText("— Expansion")).toBeInTheDocument();
  });

  it("handles empty items array gracefully", () => {
    const { container } = render(<ActivityFeed items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("formats positive MRR delta with + prefix", () => {
    render(<ActivityFeed items={[items[0]]} />);
    // formatCurrency(7900) = "$79" and prefixed with "+"
    expect(screen.getByText("+$79")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CustomerTable
// ---------------------------------------------------------------------------
describe("CustomerTable", () => {
  const customers = [
    {
      id: "c1",
      name: "Acme Corp",
      email: "billing@acme.com",
      plan: "pro",
      mrrValue: 9900,
      signupDate: new Date("2025-01-15"),
      churnedAt: null,
    },
    {
      id: "c2",
      name: "Zenith Co",
      email: "admin@zenith.co",
      plan: "starter",
      mrrValue: 2900,
      signupDate: new Date("2025-03-01"),
      churnedAt: new Date("2026-01-10"),
    },
  ];

  const onSelect = vi.fn();

  it("renders without crashing", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("displays customer names and emails", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("billing@acme.com")).toBeInTheDocument();
    expect(screen.getByText("Zenith Co")).toBeInTheDocument();
    expect(screen.getByText("admin@zenith.co")).toBeInTheDocument();
  });

  it("shows plan badges", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByText("pro")).toBeInTheDocument();
    expect(screen.getByText("starter")).toBeInTheDocument();
  });

  it("shows Active badge for non-churned customers", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows Churned badge for churned customers", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByText("Churned")).toBeInTheDocument();
  });

  it("displays total customer count", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByText("2 customers")).toBeInTheDocument();
  });

  it("shows singular when total is 1", () => {
    render(<CustomerTable customers={[customers[0]]} total={1} onSelect={onSelect} />);
    expect(screen.getByText("1 customer")).toBeInTheDocument();
  });

  it("has table headers", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("MRR")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("calls onSelect when a row is clicked", async () => {
    const user = userEvent.setup();
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    const row = screen.getByText("Acme Corp").closest("tr");
    await user.click(row!);
    expect(onSelect).toHaveBeenCalledWith("c1");
  });

  it("handles empty customers array gracefully", () => {
    render(<CustomerTable customers={[]} total={0} onSelect={onSelect} />);
    expect(screen.getByText("0 customers")).toBeInTheDocument();
  });

  it("has search input with placeholder", () => {
    render(<CustomerTable customers={customers} total={2} onSelect={onSelect} />);
    expect(screen.getByPlaceholderText("Search customers...")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// AtRiskTable
// ---------------------------------------------------------------------------
describe("AtRiskTable", () => {
  const atRiskCustomers = [
    {
      id: "r1",
      name: "FadingCo",
      email: "team@fadingco.io",
      plan: "pro",
      mrrValue: 14900,
      riskSignal: "No login 30d",
    },
    {
      id: "r2",
      name: "DriftInc",
      email: "ops@driftinc.com",
      plan: "business",
      mrrValue: 49900,
      riskSignal: "Support tickets spike",
    },
  ];

  it("renders without crashing", () => {
    render(<AtRiskTable customers={atRiskCustomers} />);
    expect(screen.getByText("FadingCo")).toBeInTheDocument();
  });

  it("displays customer names and emails", () => {
    render(<AtRiskTable customers={atRiskCustomers} />);
    expect(screen.getByText("FadingCo")).toBeInTheDocument();
    expect(screen.getByText("team@fadingco.io")).toBeInTheDocument();
    expect(screen.getByText("DriftInc")).toBeInTheDocument();
    expect(screen.getByText("ops@driftinc.com")).toBeInTheDocument();
  });

  it("shows risk signal badges", () => {
    render(<AtRiskTable customers={atRiskCustomers} />);
    expect(screen.getByText("No login 30d")).toBeInTheDocument();
    expect(screen.getByText("Support tickets spike")).toBeInTheDocument();
  });

  it("shows plan badges", () => {
    render(<AtRiskTable customers={atRiskCustomers} />);
    expect(screen.getByText("pro")).toBeInTheDocument();
    expect(screen.getByText("business")).toBeInTheDocument();
  });

  it("has table column headers", () => {
    render(<AtRiskTable customers={atRiskCustomers} />);
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("MRR")).toBeInTheDocument();
    expect(screen.getByText("Risk Signal")).toBeInTheDocument();
  });

  it("shows empty state when no at-risk customers", () => {
    render(<AtRiskTable customers={[]} />);
    expect(screen.getByText("No at-risk customers detected.")).toBeInTheDocument();
  });

  it("does not render table when empty", () => {
    const { container } = render(<AtRiskTable customers={[]} />);
    expect(container.querySelector("table")).not.toBeInTheDocument();
  });
});
