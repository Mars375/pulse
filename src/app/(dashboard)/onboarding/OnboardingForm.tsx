"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOrganization } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 w-full bg-accent-primary text-white hover:bg-accent-primary-hover"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg
            className="size-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Setting up your dashboard...
        </span>
      ) : (
        "Start tracking"
      )}
    </Button>
  );
}

export default function OnboardingForm() {
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-bg-surface-1 p-8 shadow-lg">
        <h1 className="font-satoshi text-3xl font-bold text-text-primary">
          Welcome to Pulse
        </h1>
        <p className="mt-2 text-text-secondary">
          What&apos;s your SaaS called?
        </p>

        <form action={createOrganization} className="mt-6 space-y-4">
          <Input
            name="name"
            placeholder="e.g. Acme Analytics"
            required
            minLength={2}
            maxLength={64}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 bg-bg-surface-2 text-text-primary placeholder:text-text-tertiary"
          />
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
