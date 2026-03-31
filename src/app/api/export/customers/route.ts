import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, customers } from "@/lib/db/schema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbUser] = await db
    .select({ orgId: users.orgId })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser?.orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.orgId, dbUser.orgId));

  const header = "Name,Email,Plan,MRR ($),Status,Signup Date,Churn Date,Churn Reason\n";

  const lines = rows.map((c) => {
    const name = `"${c.name.replace(/"/g, '""')}"`;
    const email = `"${c.email.replace(/"/g, '""')}"`;
    const plan = c.plan;
    const mrr = (c.mrrValue / 100).toFixed(2);
    const status = c.churnedAt ? "churned" : "active";
    const signupDate = c.signupDate.toISOString().split("T")[0];
    const churnDate = c.churnedAt ? c.churnedAt.toISOString().split("T")[0] : "";
    const churnReason = c.churnReason ? `"${c.churnReason.replace(/"/g, '""')}"` : "";
    return `${name},${email},${plan},${mrr},${status},${signupDate},${churnDate},${churnReason}`;
  });

  const csv = header + lines.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="customers.csv"',
    },
  });
}
