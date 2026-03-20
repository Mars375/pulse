import { NextRequest, NextResponse } from "next/server";
import { seedOrganization } from "@/lib/db/seed";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.SEED_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = await req.json();
  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  try {
    await seedOrganization(orgId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
