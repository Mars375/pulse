import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { AreaChart } from "@/components/dashboard/charts/area-chart";
import { DonutChart } from "@/components/dashboard/charts/donut-chart";
import { StackedAreaChart } from "@/components/dashboard/charts/stacked-area-chart";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { HorizontalBarChart } from "@/components/dashboard/charts/horizontal-bar-chart";
import { CohortHeatmap } from "@/components/dashboard/charts/cohort-heatmap";

// ---------------------------------------------------------------------------
// AreaChart
// ---------------------------------------------------------------------------
describe("AreaChart", () => {
  const data = [
    { month: "Jan", mrr: 100000 },
    { month: "Feb", mrr: 120000 },
    { month: "Mar", mrr: 150000 },
  ];

  it("renders without crashing", () => {
    render(<AreaChart title="MRR Over Time" data={data} />);
    expect(screen.getByText("MRR Over Time")).toBeInTheDocument();
  });

  it("displays the title in the card header", () => {
    render(<AreaChart title="Monthly Revenue" data={data} />);
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
  });

  it("renders with empty data array", () => {
    render(<AreaChart title="Empty Chart" data={[]} />);
    expect(screen.getByText("Empty Chart")).toBeInTheDocument();
  });

  it("renders with a single data point", () => {
    render(<AreaChart title="Single Point" data={[{ month: "Jan", mrr: 50000 }]} />);
    expect(screen.getByText("Single Point")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DonutChart
// ---------------------------------------------------------------------------
describe("DonutChart", () => {
  const data = [
    { name: "Starter", value: 120, color: "#38BDF8" },
    { name: "Pro", value: 340, color: "#6366F1" },
    { name: "Business", value: 90, color: "#A78BFA" },
  ];

  it("renders without crashing", () => {
    render(<DonutChart title="Customers by Plan" data={data} />);
    expect(screen.getByText("Customers by Plan")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(<DonutChart title="Plan Distribution" data={data} />);
    expect(screen.getByText("Plan Distribution")).toBeInTheDocument();
  });

  it("shows the center label with total", () => {
    render(<DonutChart title="Plans" data={data} />);
    // Total = 120 + 340 + 90 = 550
    expect(screen.getByText("550")).toBeInTheDocument();
    expect(screen.getByText("Net New")).toBeInTheDocument();
  });

  it("renders legend entries for each data item", () => {
    render(<DonutChart title="Plans" data={data} />);
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
  });

  it("shows individual values in legend", () => {
    render(<DonutChart title="Plans" data={data} />);
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("340")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("handles empty data array", () => {
    render(<DonutChart title="Empty" data={[]} />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
    // Total should be 0
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// StackedAreaChart
// ---------------------------------------------------------------------------
describe("StackedAreaChart", () => {
  const data = [
    { month: "Jan", starter: 50, pro: 120, business: 30 },
    { month: "Feb", starter: 55, pro: 130, business: 35 },
    { month: "Mar", starter: 60, pro: 140, business: 40 },
  ];

  it("renders without crashing", () => {
    render(<StackedAreaChart title="Customers by Plan" data={data} />);
    expect(screen.getByText("Customers by Plan")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(<StackedAreaChart title="Plan Growth" data={data} />);
    expect(screen.getByText("Plan Growth")).toBeInTheDocument();
  });

  it("renders with empty data", () => {
    render(<StackedAreaChart title="No Data" data={[]} />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// BarChart
// ---------------------------------------------------------------------------
describe("BarChart", () => {
  const data = [
    { month: "Jan", current: 100, previous: 80 },
    { month: "Feb", current: 120, previous: 90 },
    { month: "Mar", current: 150, previous: 110 },
  ];

  it("renders without crashing", () => {
    render(<BarChart title="New Customers" data={data} />);
    expect(screen.getByText("New Customers")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(<BarChart title="Revenue Comparison" data={data} />);
    expect(screen.getByText("Revenue Comparison")).toBeInTheDocument();
  });

  it("renders with empty data", () => {
    render(<BarChart title="Empty" data={[]} />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders with zero values", () => {
    const zeroData = [{ month: "Jan", current: 0, previous: 0 }];
    render(<BarChart title="Zero" data={zeroData} />);
    expect(screen.getByText("Zero")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// HorizontalBarChart
// ---------------------------------------------------------------------------
describe("HorizontalBarChart", () => {
  const data = [
    { reason: "Too expensive", count: 45, percentage: 32 },
    { reason: "Missing features", count: 30, percentage: 21 },
    { reason: "Switched competitor", count: 25, percentage: 18 },
  ];

  it("renders without crashing", () => {
    render(<HorizontalBarChart title="Churn Reasons" data={data} />);
    expect(screen.getByText("Churn Reasons")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(<HorizontalBarChart title="Top Reasons" data={data} />);
    expect(screen.getByText("Top Reasons")).toBeInTheDocument();
  });

  it("renders with empty data", () => {
    render(<HorizontalBarChart title="No Reasons" data={[]} />);
    expect(screen.getByText("No Reasons")).toBeInTheDocument();
  });

  it("renders with a single data point", () => {
    render(
      <HorizontalBarChart
        title="Single"
        data={[{ reason: "Cost", count: 10, percentage: 100 }]}
      />
    );
    expect(screen.getByText("Single")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CohortHeatmap
// ---------------------------------------------------------------------------
describe("CohortHeatmap", () => {
  const data = [
    { cohort: "Jan 2025", months: [100, 90, 82, 78, 72, 68, 65, 62, 59, 55, 52, 50] },
    { cohort: "Feb 2025", months: [100, 88, 80, 75, 70, 66, 63, 60, 57, 53, 50, 0] },
  ];

  it("renders without crashing", () => {
    render(<CohortHeatmap title="Cohort Retention" data={data} />);
    expect(screen.getByText("Cohort Retention")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(<CohortHeatmap title="Retention Heatmap" data={data} />);
    expect(screen.getByText("Retention Heatmap")).toBeInTheDocument();
  });

  it("renders cohort labels", () => {
    render(<CohortHeatmap title="Cohorts" data={data} />);
    expect(screen.getByText("Jan 2025")).toBeInTheDocument();
    expect(screen.getByText("Feb 2025")).toBeInTheDocument();
  });

  it("renders column headers M0 through M11", () => {
    render(<CohortHeatmap title="Cohorts" data={data} />);
    expect(screen.getByText("M0")).toBeInTheDocument();
    expect(screen.getByText("M11")).toBeInTheDocument();
  });

  it("displays retention percentages in cells", () => {
    render(<CohortHeatmap title="Cohorts" data={data} />);
    // 100% appears multiple times (M0 for both cohorts)
    const hundredCells = screen.getAllByText("100%");
    expect(hundredCells.length).toBe(2);
  });

  it("does not display text for zero retention cells", () => {
    render(<CohortHeatmap title="Cohorts" data={data} />);
    // The last cell in Feb 2025 has retention 0, should show empty
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("renders with empty data array", () => {
    render(<CohortHeatmap title="Empty" data={[]} />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
    // Column headers should still be present
    expect(screen.getByText("M0")).toBeInTheDocument();
  });
});
