import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Variable.woff2", style: "normal" },
    { path: "../../public/fonts/Satoshi-VariableItalic.woff2", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pulse — SaaS Metrics Dashboard",
    template: "%s | Pulse",
  },
  description:
    "Real-time SaaS metrics. MRR, churn, cohorts — one dashboard for everything that matters.",
  openGraph: {
    title: "Pulse — SaaS Metrics Dashboard",
    description:
      "Real-time SaaS metrics. MRR, churn, cohorts — one dashboard for everything that matters.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", satoshi.variable, GeistSans.variable, GeistMono.variable)}>
      <body className="bg-bg-primary text-text-primary antialiased">
        <ClerkProvider afterSignInUrl="/overview" afterSignUpUrl="/overview">
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
