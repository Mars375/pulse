import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Will add full layout (sidebar, topbar) in Task 11
  // Redirect logic (onboarding vs dashboard) is handled per-page
  return <>{children}</>;
}
