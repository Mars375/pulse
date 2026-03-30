import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, formatPercent, formatRelativeTime, formatCompactNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// cn() — class name merging via clsx + tailwind-merge
// ---------------------------------------------------------------------------

describe("cn()", () => {
  it("merges multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles undefined, null, and false values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — last value wins", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("resolves conflicting text colors", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("keeps non-conflicting Tailwind classes", () => {
    expect(cn("p-4", "mt-2")).toBe("p-4 mt-2");
  });

  it("handles conditional class objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});

// ---------------------------------------------------------------------------
// formatCurrency()
// ---------------------------------------------------------------------------

describe("formatCurrency()", () => {
  it("converts cents to dollars with dollar sign", () => {
    expect(formatCurrency(1245000)).toBe("$12,450");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("rounds half cents", () => {
    expect(formatCurrency(150)).toBe("$2");
  });

  it("formats large numbers with commas", () => {
    expect(formatCurrency(100000000)).toBe("$1,000,000");
  });
});

// ---------------------------------------------------------------------------
// formatPercent()
// ---------------------------------------------------------------------------

describe("formatPercent()", () => {
  it("adds + sign for positive values", () => {
    expect(formatPercent(12.3)).toBe("+12.3%");
  });

  it("keeps - sign for negative values", () => {
    expect(formatPercent(-5.1)).toBe("-5.1%");
  });

  it("formats zero without sign", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("rounds to one decimal place", () => {
    expect(formatPercent(3.456)).toBe("+3.5%");
  });
});

// ---------------------------------------------------------------------------
// formatRelativeTime()
// ---------------------------------------------------------------------------

describe("formatRelativeTime()", () => {
  it("returns 'just now' for < 60 seconds ago", () => {
    const date = new Date(Date.now() - 30 * 1000);
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns minutes for < 60 minutes", () => {
    const date = new Date(Date.now() - 15 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("15m ago");
  });

  it("returns hours for < 24 hours", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days for < 30 days", () => {
    const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5d ago");
  });

  it("returns months for < 12 months", () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("3mo ago");
  });

  it("returns years for >= 12 months", () => {
    const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("1y ago");
  });
});

// ---------------------------------------------------------------------------
// formatCompactNumber()
// ---------------------------------------------------------------------------

describe("formatCompactNumber()", () => {
  it("formats millions with M suffix", () => {
    expect(formatCompactNumber(3400000)).toBe("3.4M");
  });

  it("formats thousands with K suffix", () => {
    expect(formatCompactNumber(1234)).toBe("1.2K");
  });

  it("drops trailing .0 for round millions", () => {
    expect(formatCompactNumber(2000000)).toBe("2M");
  });

  it("drops trailing .0 for round thousands", () => {
    expect(formatCompactNumber(5000)).toBe("5K");
  });

  it("returns plain number below 1000", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });

  it("handles zero", () => {
    expect(formatCompactNumber(0)).toBe("0");
  });

  it("handles negative millions", () => {
    expect(formatCompactNumber(-1500000)).toBe("-1.5M");
  });
});

// ---------------------------------------------------------------------------
// formatDate()
// ---------------------------------------------------------------------------

describe("formatDate()", () => {
  it("formats a date as 'Mon DD, YYYY'", () => {
    expect(formatDate(new Date("2024-01-15T00:00:00Z"))).toBe("Jan 15, 2024");
  });

  it("handles single-digit days", () => {
    expect(formatDate(new Date("2024-03-05T00:00:00Z"))).toBe("Mar 5, 2024");
  });

  it("formats December correctly", () => {
    expect(formatDate(new Date("2023-12-31T00:00:00Z"))).toBe("Dec 31, 2023");
  });
});
