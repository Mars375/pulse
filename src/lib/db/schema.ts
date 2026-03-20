import { pgTable, uuid, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

export const orgPlanEnum = pgEnum("org_plan", ["free", "starter", "pro", "business"]);
export const customerPlanEnum = pgEnum("customer_plan", ["starter", "pro", "business"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "trialing"]);
export const eventTypeEnum = pgEnum("event_type", ["new", "expansion", "contraction", "churn", "reactivation"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["paid", "pending", "failed"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  orgId: uuid("org_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  plan: orgPlanEnum("plan").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique().notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  planId: text("plan_id").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  mrr: integer("mrr").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  plan: customerPlanEnum("plan").notNull(),
  mrrValue: integer("mrr_value").notNull(),
  signupDate: timestamp("signup_date").notNull(),
  churnedAt: timestamp("churned_at"),
  churnReason: text("churn_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  type: eventTypeEnum("type").notNull(),
  mrrDelta: integer("mrr_delta").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  amount: integer("amount").notNull(),
  status: invoiceStatusEnum("status").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
