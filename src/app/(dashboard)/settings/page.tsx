import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, organizations, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [dbUser] = await db
    .select({
      orgId: users.orgId,
      orgName: organizations.name,
      orgSlug: organizations.slug,
      orgPlan: organizations.plan,
      stripeCustomerId: organizations.stripeCustomerId,
    })
    .from(users)
    .leftJoin(organizations, eq(users.orgId, organizations.id))
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser?.orgId) redirect("/onboarding");

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.orgId, dbUser.orgId))
    .limit(1);

  return (
    <SettingsClient
      orgName={dbUser.orgName ?? ""}
      orgSlug={dbUser.orgSlug ?? ""}
      orgPlan={dbUser.orgPlan ?? "free"}
      hasStripeCustomer={!!dbUser.stripeCustomerId}
      subscriptionStatus={sub?.status ?? null}
    />
  );
}
