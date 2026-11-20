"use client";

import Link from "next/link";
import * as React from "react";

import { AuthCard, Field, SubmitButton } from "@/components/devdash/auth-card";
import { api } from "@/lib/devapi/client";

export default function ForgotPage() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await api("/auth/forgot", { method: "POST", body: JSON.stringify({ email }) }, false);
    setBusy(false);
    setDone(true);
  };

  if (done) {
    return (
      <AuthCard title="Check your inbox" footer={
        <Link href="/developers/login" className="text-primary hover:underline">Back to sign in</Link>
      }>
        <p className="text-sm text-muted-foreground">
          If an account exists for {email}, a reset link is on its way. It is valid
          for one hour.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      lead="Enter your account email and we send a reset link."
      footer={
        <Link href="/developers/login" className="text-primary hover:underline">Back to sign in</Link>
      }
    >
      <form onSubmit={(e) => void submit(e)}>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <SubmitButton busy={busy}>Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}
