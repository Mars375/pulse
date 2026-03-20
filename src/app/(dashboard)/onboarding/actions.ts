"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { seedOrganization } from "@/lib/db/seed";

export async function createOrganization(formData: FormData) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) redirect("/sign-in");

  const name = formData.get("name") as string;
  if (!name || name.trim().length < 2) {
    throw new Error("Organization name must be at least 2 characters");
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Create org
  const [org] = await db
    .insert(organizations)
    .values({ name: name.trim(), slug })
    .returning();

  // Create user record
  await db.insert(users).values({
    clerkId: userId,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    name: user.firstName
      ? `${user.firstName} ${user.lastName ?? ""}`.trim()
      : null,
    orgId: org.id,
  });

  // Seed demo data
  await seedOrganization(org.id);

  redirect("/overview");
}
