"use client";

/**
 * Sign up / log in for the developer API. Plain two-tab form, current design
 * tokens, copy per the de-AI rules: verb + object, say what happened, link
 * the fix.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api, getSession, setSession } from "@/lib/devapi/client";

export function DevAuth() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"signup" | "login">("signup");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => setSignedIn(Boolean(getSession())), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    if (mode === "signup") {
      const r = await api<{ verification: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, false);
      setNote(
        r.ok
          ? { kind: "ok", text: r.data.verification === "email_sent"
              ? "Account created. Open the verification link we sent to your email, then log in here."
              : "Account created and verified. Log in below." }
          : { kind: "err", text: r.error.message },
      );
      if (r.ok) setMode("login");
    } else {
      const r = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, false);
      if (r.ok) {
        setSession(r.data.token);
        router.push("/developers/dashboard");
      } else {
        setNote({ kind: "err", text: r.error.message });
      }
    }
    setBusy(false);
  };

  if (signedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        You are logged in.{" "}
        <Link href="/developers/dashboard" className="font-semibold text-primary hover:underline">
          Go to the dashboard
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="max-w-sm rounded-xl border border-border bg-card p-5">
      <div className="flex gap-1 border-b border-border pb-3" role="tablist">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "min-h-11 rounded-md px-3 text-sm font-medium",
              mode === m ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "signup" ? "Create account" : "Log in"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <label className="text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Password
          <input
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
          />
          {mode === "signup" ? (
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              At least 10 characters.
            </span>
          ) : null}
        </label>
        {note ? (
          <p
            role="status"
            className={cn(
              "border-l-2 pl-3 text-sm",
              note.kind === "ok" ? "border-primary text-foreground" : "border-destructive text-destructive",
            )}
          >
            {note.text}
          </p>
        ) : null}
        <Button type="submit" disabled={busy || !email || password.length < 10}>
          {busy ? "Working…" : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>
    </div>
  );
}
