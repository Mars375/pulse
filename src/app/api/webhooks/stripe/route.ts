import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { organizations, subscriptions } from "@/lib/db/schema";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headerMap = await headers();
  const signature = headerMap.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.orgId;
  if (!orgId) {
    console.error("checkout.session.completed: missing orgId in metadata");
    return;
  }

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id;

  if (!customerId) {
    console.error("checkout.session.completed: missing customer ID");
    return;
  }

  // Update org with stripe customer ID
  await db
    .update(organizations)
    .set({
      stripeCustomerId: customerId,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  // Retrieve the full subscription to get plan details
  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;

  if (!subscriptionId) {
    console.error("checkout.session.completed: missing subscription ID");
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const firstItem = stripeSubscription.items.data[0];
  const priceId = firstItem?.price.id ?? "";
  const plan = resolvePlanFromPriceId(priceId);
  const mrr = computeMrr(stripeSubscription);

  // Create subscription record
  await db.insert(subscriptions).values({
    orgId,
    stripeSubscriptionId: subscriptionId,
    status: mapSubscriptionStatus(stripeSubscription.status),
    planId: priceId,
    currentPeriodStart: new Date((firstItem?.current_period_start ?? 0) * 1000),
    currentPeriodEnd: new Date((firstItem?.current_period_end ?? 0) * 1000),
    mrr,
  });

  // Update org plan
  await db
    .update(organizations)
    .set({ plan, updatedAt: new Date() })
    .where(eq(organizations.id, orgId));
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const mrr = computeMrr(subscription);
  const status = mapSubscriptionStatus(subscription.status);
  const firstItem = subscription.items.data[0];

  await db
    .update(subscriptions)
    .set({
      status,
      mrr,
      planId: firstItem?.price.id ?? "",
      currentPeriodStart: new Date((firstItem?.current_period_start ?? 0) * 1000),
      currentPeriodEnd: new Date((firstItem?.current_period_end ?? 0) * 1000),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as canceled
  await db
    .update(subscriptions)
    .set({ status: "canceled" })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // Find the org via customer metadata or subscription metadata
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;

  if (customerId) {
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.stripeCustomerId, customerId))
      .limit(1);

    if (org) {
      await db
        .update(organizations)
        .set({ plan: "free", updatedAt: new Date() })
        .where(eq(organizations.id, org.id));
    }
  }
}

function computeMrr(subscription: Stripe.Subscription): number {
  const item = subscription.items.data[0];
  if (!item) return 0;

  const unitAmount = item.price.unit_amount ?? 0;
  const quantity = item.quantity ?? 1;
  const interval = item.price.recurring?.interval;

  if (interval === "year") {
    return Math.round((unitAmount * quantity) / 12);
  }
  // Default: monthly
  return unitAmount * quantity;
}

function resolvePlanFromPriceId(priceId: string): "free" | "starter" | "pro" | "business" {
  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID ?? "";
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID ?? "";
  const businessPriceId = process.env.STRIPE_BUSINESS_PRICE_ID ?? "";

  if (priceId === starterPriceId) return "starter";
  if (priceId === proPriceId) return "pro";
  if (priceId === businessPriceId) return "business";
  return "free";
}

function mapSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "active" | "canceled" | "past_due" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    case "past_due":
    case "incomplete":
      return "past_due";
    case "trialing":
      return "trialing";
    default:
      return "active";
  }
}
