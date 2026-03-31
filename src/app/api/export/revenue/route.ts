import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, events } from "@/lib/db/schema";

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
    .from(events)
    .where(eq(events.orgId, dbUser.orgId));

  const header = "Date,Type,MRR Delta ($),Customer ID\n";

  const lines = rows.map((e) => {
    const date = e.date.toISOString().split("T")[0];
    const type = e.type;
    const mrrDelta = (e.mrrDelta / 100).toFixed(2);
    const customerId = e.customerId;
    return `${date},${type},${mrrDelta},${customerId}`;
  });

  const csv = header + lines.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="revenue-events.csv"',
    },
  });
}
