"use client";

import { useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, Plug, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsClientProps {
  orgName: string;
  orgSlug: string;
  orgPlan: string;
  hasStripeCustomer: boolean;
  subscriptionStatus: string | null;
}

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-bg-surface-2 text-text-secondary" },
  starter: { label: "Starter", color: "bg-info/10 text-info" },
  pro: { label: "Pro", color: "bg-accent-primary/10 text-accent-primary" },
  business: { label: "Business", color: "bg-chart-2/10 text-chart-2" },
};

export function SettingsClient({
  orgName,
  orgSlug,
  orgPlan,
  hasStripeCustomer,
  subscriptionStatus,
}: SettingsClientProps) {
  const [dangerOpen, setDangerOpen] = useState(false);
  const plan = planLabels[orgPlan] ?? planLabels.free;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-satoshi text-3xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-text-secondary">Manage your account and organization.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-bg-surface-1 border">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="bg-bg-surface-1 border">
            <CardHeader>
              <CardTitle className="font-satoshi">Organization</CardTitle>
              <CardDescription className="text-text-secondary">
                Your SaaS organization details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Name</span>
                <span className="text-text-primary font-medium">{orgName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Slug</span>
                <span className="font-mono text-sm text-text-primary">{orgSlug}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Plan</span>
                <Badge className={cn("text-xs", plan.color)}>{plan.label}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bg-surface-1 border overflow-hidden">
            <CardHeader>
              <CardTitle className="font-satoshi">Account</CardTitle>
              <CardDescription className="text-text-secondary">
                Manage your Clerk profile, email, and security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfile
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox: "shadow-none w-full",
                    card: "bg-transparent shadow-none border-0 w-full",
                  },
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card className="bg-bg-surface-1 border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-satoshi">
                <CreditCard className="h-5 w-5 text-text-secondary" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium text-lg">{plan.label}</p>
                  {subscriptionStatus && (
                    <p className="text-text-secondary text-sm capitalize">
                      Status: {subscriptionStatus}
                    </p>
                  )}
                </div>
                <Badge className={cn("text-sm px-3 py-1", plan.color)}>{plan.label}</Badge>
              </div>

              <div className="flex gap-3">
                {orgPlan === "free" ? (
                  <Button
                    className="bg-accent-primary hover:bg-accent-primary-hover text-white"
                    asChild
                  >
                    <a href="/pricing">Upgrade Plan</a>
                  </Button>
                ) : hasStripeCustomer ? (
                  <form action="/api/portal" method="POST">
                    <Button
                      type="submit"
                      variant="outline"
                      className="border-border text-text-primary hover:bg-bg-surface-2"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Billing
                    </Button>
                  </form>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-4">
          <Card className="bg-bg-surface-1 border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-satoshi">
                <Plug className="h-5 w-5 text-text-secondary" />
                Stripe
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Payment processing and subscription management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className={cn("text-xs", hasStripeCustomer ? "bg-positive/10 text-positive" : "bg-bg-surface-2 text-text-secondary")}>
                {hasStripeCustomer ? "Connected" : "Not connected"}
              </Badge>
            </CardContent>
          </Card>

          {["Slack", "Zapier"].map((name) => (
            <Card key={name} className="bg-bg-surface-1 border opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-satoshi">
                  <Plug className="h-5 w-5 text-text-tertiary" />
                  {name}
                </CardTitle>
                <CardDescription className="text-text-tertiary">Coming soon</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-negative/30 bg-bg-surface-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-satoshi text-negative">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={dangerOpen} onOpenChange={setDangerOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-negative/50 text-negative hover:bg-negative/10">
                Delete Organization
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-bg-surface-1 border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-text-primary">
                  Delete &quot;{orgName}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-text-secondary">
                  This will permanently delete your organization, all customers, metrics, and billing data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-text-primary hover:bg-bg-surface-2">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction className="bg-negative text-white hover:bg-negative/90">
                  Delete Forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
