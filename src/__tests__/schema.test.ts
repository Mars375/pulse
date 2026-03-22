import { describe, it, expect } from "vitest";
import {
  orgPlanEnum,
  customerPlanEnum,
  subscriptionStatusEnum,
  eventTypeEnum,
  invoiceStatusEnum,
  users,
  organizations,
  subscriptions,
  customers,
  events,
  invoices,
} from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Enum definitions
// ---------------------------------------------------------------------------

describe("Schema enums", () => {
  it("orgPlanEnum has the correct values", () => {
    expect(orgPlanEnum.enumValues).toEqual(["free", "starter", "pro", "business"]);
  });

  it("customerPlanEnum has the correct values", () => {
    expect(customerPlanEnum.enumValues).toEqual(["starter", "pro", "business"]);
  });

  it("subscriptionStatusEnum has the correct values", () => {
    expect(subscriptionStatusEnum.enumValues).toEqual(["active", "canceled", "past_due", "trialing"]);
  });

  it("eventTypeEnum has the correct values", () => {
    expect(eventTypeEnum.enumValues).toEqual(["new", "expansion", "contraction", "churn", "reactivation"]);
  });

  it("invoiceStatusEnum has the correct values", () => {
    expect(invoiceStatusEnum.enumValues).toEqual(["paid", "pending", "failed"]);
  });
});

// ---------------------------------------------------------------------------
// Table exports
// ---------------------------------------------------------------------------

describe("Schema table exports", () => {
  it("exports the users table", () => {
    expect(users).toBeDefined();
  });

  it("exports the organizations table", () => {
    expect(organizations).toBeDefined();
  });

  it("exports the subscriptions table", () => {
    expect(subscriptions).toBeDefined();
  });

  it("exports the customers table", () => {
    expect(customers).toBeDefined();
  });

  it("exports the events table", () => {
    expect(events).toBeDefined();
  });

  it("exports the invoices table", () => {
    expect(invoices).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Required fields — check that key columns exist on each table
// ---------------------------------------------------------------------------

describe("Schema required fields", () => {
  it("users table has id, clerkId, email, createdAt columns", () => {
    const cols = Object.keys(users);
    expect(cols).toContain("id");
    expect(cols).toContain("clerkId");
    expect(cols).toContain("email");
    expect(cols).toContain("createdAt");
  });

  it("organizations table has id, name, slug, plan columns", () => {
    const cols = Object.keys(organizations);
    expect(cols).toContain("id");
    expect(cols).toContain("name");
    expect(cols).toContain("slug");
    expect(cols).toContain("plan");
  });

  it("subscriptions table has id, orgId, stripeSubscriptionId, status, mrr", () => {
    const cols = Object.keys(subscriptions);
    expect(cols).toContain("id");
    expect(cols).toContain("orgId");
    expect(cols).toContain("stripeSubscriptionId");
    expect(cols).toContain("status");
    expect(cols).toContain("mrr");
  });

  it("customers table has id, orgId, name, email, plan, mrrValue, signupDate", () => {
    const cols = Object.keys(customers);
    expect(cols).toContain("id");
    expect(cols).toContain("orgId");
    expect(cols).toContain("name");
    expect(cols).toContain("email");
    expect(cols).toContain("plan");
    expect(cols).toContain("mrrValue");
    expect(cols).toContain("signupDate");
  });

  it("customers table has optional churnedAt and churnReason columns", () => {
    const cols = Object.keys(customers);
    expect(cols).toContain("churnedAt");
    expect(cols).toContain("churnReason");
  });

  it("events table has id, orgId, customerId, type, mrrDelta, date", () => {
    const cols = Object.keys(events);
    expect(cols).toContain("id");
    expect(cols).toContain("orgId");
    expect(cols).toContain("customerId");
    expect(cols).toContain("type");
    expect(cols).toContain("mrrDelta");
    expect(cols).toContain("date");
  });

  it("invoices table has id, orgId, customerId, amount, status", () => {
    const cols = Object.keys(invoices);
    expect(cols).toContain("id");
    expect(cols).toContain("orgId");
    expect(cols).toContain("customerId");
    expect(cols).toContain("amount");
    expect(cols).toContain("status");
  });
});
