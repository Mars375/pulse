import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  starter: { name: "Starter", price: 2900, priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "" },
  pro: { name: "Pro", price: 7900, priceId: process.env.STRIPE_PRO_PRICE_ID ?? "" },
  business: { name: "Business", price: 19900, priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? "" },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createCheckoutSession(params: {
  orgId: string;
  stripeCustomerId: string | null;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  let customerId = params.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { orgId: params.orgId },
    });
    customerId = customer.id;
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { orgId: params.orgId },
  });
}

export async function createPortalSession(stripeCustomerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}
