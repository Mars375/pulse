import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function OverviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // If user has no org, send to onboarding
  const [dbUser] = await db
    .select({ orgId: users.orgId })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser?.orgId) {
    redirect("/onboarding");
  }

  return (
    <div className="p-8">
      <h1 className="font-satoshi text-3xl font-bold">Overview</h1>
      <p className="mt-2 text-text-secondary">Dashboard coming soon...</p>
    </div>
  );
}
