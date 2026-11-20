"use client";

/** Settings: retention default, password change, danger zone. */

import * as React from "react";

import { DashShell } from "@/components/devdash/shell";
import { Button } from "@/components/ui/button";
import { api, setSession } from "@/lib/devapi/client";

export default function SettingsPage() {
  const [email, setEmail] = React.useState("");
  const [retention, setRetention] = React.useState("3600");
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = React.useState("");

  React.useEffect(() => {
    void api<{ email: string; retention_default_s: number }>("/account").then((r) => {
      if (r.ok) {
        setEmail(r.data.email);
        setRetention(String(r.data.retention_default_s));
      }
    });
  }, []);

  const flash = (m: string) => {
    setMsg(m);
    setErr(null);
    setTimeout(() => setMsg(null), 4000);
  };

  const saveRetention = async () => {
    const r = await api<{ updated: string[] }>("/account", {
      method: "PATCH",
      body: JSON.stringify({ retention_default_s: Number(retention) }),
    });
    if (r.ok) flash("Saved.");
    else setErr(r.error.message);
  };

  const changePassword = async () => {
    setErr(null);
    const r = await api<{ updated: string[] }>("/account", {
      method: "PATCH",
      body: JSON.stringify({ password: { current, new: next } }),
    });
    if (r.ok) {
      setCurrent("");
      setNext("");
      flash("Password changed.");
    } else setErr(r.error.message);
  };

  const deleteAccount = async () => {
    if (confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
      setErr("Type your account email exactly to confirm deletion.");
      return;
    }
    await api("/account", { method: "DELETE" });
    setSession(null);
    window.location.href = "/developers";
  };

  return (
    <DashShell title="Settings">
      {msg ? <p className="mb-4 text-sm text-emerald-700">{msg}</p> : null}
      {err ? <p className="mb-4 text-sm text-red-600">{err}</p> : null}

      <h2 className="text-base font-semibold text-foreground">Defaults</h2>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-foreground">
          Default retention (seconds, 0-86400)
          <input
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
            className="mt-1 block h-10 w-40 rounded border border-border bg-background px-3 text-sm"
          />
        </label>
        <Button variant="outline" onClick={() => void saveRetention()}>Save</Button>
      </div>
      <p className="mt-1 max-w-[60ch] text-xs text-muted-foreground">
        How long job results are kept when a job does not set its own retention_s.
        Zero means one download or 60 seconds.
      </p>

      <h2 className="mt-10 text-base font-semibold text-foreground">Password</h2>
      <div className="mt-3 flex max-w-md flex-col gap-3">
        <label className="text-sm font-medium text-foreground">
          Current password
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="mt-1 block h-10 w-full rounded border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          New password (10+ characters)
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="mt-1 block h-10 w-full rounded border border-border bg-background px-3 text-sm"
          />
        </label>
        <div>
          <Button variant="outline" onClick={() => void changePassword()}>Change password</Button>
        </div>
      </div>

      <h2 className="mt-10 text-base font-semibold text-red-700">Danger zone</h2>
      <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">
        Deleting the account revokes every key immediately, disables webhooks, and
        purges account data. Job files are already deleted on their retention
        schedule regardless. Type <span className="font-mono">{email}</span> to confirm.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder="your email"
          className="h-10 w-72 rounded border border-border bg-background px-3 font-mono text-sm"
        />
        <Button variant="outline" className="text-red-700" onClick={() => void deleteAccount()}>
          Delete account
        </Button>
      </div>
    </DashShell>
  );
}
