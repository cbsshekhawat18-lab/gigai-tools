"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { AuthCard, Field, SubmitButton } from "@/components/devdash/auth-card";
import { api } from "@/lib/devapi/client";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError("Use at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const r = await api("/auth/reset", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }, false);
    setBusy(false);
    if (r.ok) setDone(true);
    else setError(r.error.message);
  };

  if (!token) {
    return (
      <AuthCard title="Missing link" footer={
        <Link href="/developers/forgot" className="text-primary hover:underline">Ask for a reset link</Link>
      }>
        <p className="text-sm text-muted-foreground">
          Open this page from the link in your reset email.
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password changed" footer={
        <Link href="/developers/login" className="text-primary hover:underline">Sign in</Link>
      }>
        <p className="text-sm text-muted-foreground">Sign in with the new password.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={(e) => void submit(e)}>
        <Field
          label="New password (10+ characters)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={error}
          required
        />
        <SubmitButton busy={busy}>Set password</SubmitButton>
      </form>
    </AuthCard>
  );
}

export default function ResetPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetForm />
    </React.Suspense>
  );
}
