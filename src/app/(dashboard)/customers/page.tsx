import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCustomers } from "@/lib/db/queries";
import { CustomersClient } from "./customers-client";

interface PageProps {
  searchParams: Promise<{
    plan?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [dbUser] = await db
    .select({ orgId: users.orgId })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser?.orgId) redirect("/onboarding");

  const params = await searchParams;
  const { customers, total } = await getCustomers(dbUser.orgId, {
    plan: params.plan,
    status: params.status,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-satoshi text-3xl font-bold text-text-primary">Customers</h1>
        <p className="mt-1 text-text-secondary">
          {total} customer{total !== 1 ? "s" : ""} across all plans.
        </p>
      </div>

      <CustomersClient customers={customers} total={total} />
    </div>
  );
}
