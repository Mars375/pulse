"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { createCheckoutSession, createPortalSession, PLANS, type PlanKey } from "@/lib/stripe";

async function getOrgForCurrentUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const [user] = await db
    .select({ orgId: users.orgId })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!user?.orgId) {
    throw new Error("User has no organization");
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.orgId))
    .limit(1);

  if (!org) {
    throw new Error("Organization not found");
  }

  return org;
}

export async function checkoutAction(planKey: string) {
  const org = await getOrgForCurrentUser();

  const plan = PLANS[planKey as PlanKey];
  if (!plan) {
    throw new Error(`Invalid plan: ${planKey}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await createCheckoutSession({
    orgId: org.id,
    stripeCustomerId: org.stripeCustomerId,
    priceId: plan.priceId,
    successUrl: `${baseUrl}/settings?success=true`,
    cancelUrl: `${baseUrl}/settings?canceled=true`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(session.url);
}

export async function portalAction() {
  const org = await getOrgForCurrentUser();

  if (!org.stripeCustomerId) {
    throw new Error("No billing account found. Please subscribe to a plan first.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await createPortalSession(
    org.stripeCustomerId,
    `${baseUrl}/settings`,
  );

  redirect(session.url);
}
