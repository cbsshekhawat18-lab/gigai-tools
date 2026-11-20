"use client";

import Link from "next/link";
import * as React from "react";

import { AuthCard, Field, SubmitButton } from "@/components/devdash/auth-card";
import { api } from "@/lib/devapi/client";

export default function SignupPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; confirm?: string }>({});
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState<null | "email_sent" | "auto_verified">(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (password.length < 10) {
      setErrors({ password: "Use at least 10 characters." });
      return;
    }
    if (password !== confirm) {
      setErrors({ confirm: "Passwords do not match." });
      return;
    }
    setBusy(true);
    const r = await api<{ verification: "email_sent" | "auto_verified" }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false);
    setBusy(false);
    if (r.ok) setDone(r.data.verification);
    else if (r.error.code === "email_taken") setErrors({ email: "This email already has an account - sign in instead." });
    else if (r.error.code === "invalid_email") setErrors({ email: r.error.message });
    else if (r.error.code === "weak_password") setErrors({ password: r.error.message });
    else setErrors({ confirm: r.error.message });
  };

  if (done) {
    return (
      <AuthCard title="Check your inbox" footer={
        <Link href="/developers/login" className="text-primary hover:underline">Go to sign in</Link>
      }>
        <p className="text-sm text-muted-foreground">
          {done === "email_sent"
            ? `A verification link is on its way to ${email}. Click it, then sign in. You need a verified email before the API works.`
            : "Your account is ready - sign in to create your first API key."}
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      lead="Free plan: 1,000 API tasks a month, no card. Accounts are only for the API - the web tools never need one."
      footer={
        <>
          Already have one?{" "}
          <Link href="/developers/login" className="text-primary hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={(e) => void submit(e)}>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <Field
          label="Password (10+ characters)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          required
        />
        <SubmitButton busy={busy}>Create account</SubmitButton>
        <p className="mt-3 text-xs text-muted-foreground">
          You get a verification email first - the API works once it is confirmed.
        </p>
      </form>
    </AuthCard>
  );
}
