"use client";

import Link from "next/link";
import * as React from "react";

import { AuthCard, Field, SubmitButton } from "@/components/devdash/auth-card";
import { api, setSession } from "@/lib/devapi/client";
import { safeNext } from "@/lib/devapi/session";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [unverified, setUnverified] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setUnverified(false);
    const r = await api<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false);
    setBusy(false);
    if (r.ok) {
      setSession(r.data.token);
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = safeNext(next, "/developers/dashboard");
      return;
    }
    if (r.error.code === "email_unverified") setUnverified(true);
    else setError(r.error.message);
  };

  const resend = async () => {
    await api("/auth/resend", { method: "POST", body: JSON.stringify({ email }) }, false);
    setNote("Sent - check your inbox for a fresh verification link.");
  };

  return (
    <AuthCard
      title="Sign in"
      lead="Your dashboard, keys and usage."
      footer={
        <>
          New here?{" "}
          <Link href="/developers/signup" className="text-primary hover:underline">
            Create an account
          </Link>
          {" · "}
          <Link href="/developers/forgot" className="text-primary hover:underline">
            Forgot password
          </Link>
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
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          required
        />
        {unverified ? (
          <div className="mb-4 rounded border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Verify your email first - the link is in your inbox.{" "}
            <button type="button" onClick={() => void resend()} className="text-primary hover:underline">
              Send it again
            </button>
            {note ? <span className="mt-1 block text-emerald-700">{note}</span> : null}
          </div>
        ) : null}
        <SubmitButton busy={busy}>Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
