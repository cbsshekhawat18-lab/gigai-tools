"use client";

import Link from "next/link";
import * as React from "react";

/**
 * Centered auth card, shared by login / signup / forgot / reset. Plain on
 * purpose: logo line, one form, inline errors under the fields, no
 * illustration.
 */

export function AuthCard({ title, lead, children, footer }: {
  title: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm font-bold tracking-tight text-foreground">
          Gig<span className="text-primary">AI</span> Tools
          <span className="ml-2 font-normal text-muted-foreground">Developer API</span>
        </p>
        <div className="mt-4 rounded-xl border border-border bg-card p-6">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {lead ? <p className="mt-1 text-sm text-muted-foreground">{lead}</p> : null}
          <div className="mt-5">{children}</div>
        </div>
        {footer ? <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </section>
  );
}

export function Field({ label, error, ...props }: {
  label: string;
  error?: string | null;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="mb-4 block text-sm font-medium text-foreground">
      {label}
      <input
        {...props}
        className={`mt-1 block h-11 w-full rounded border bg-background px-3 text-sm ${
          error ? "border-red-500" : "border-border"
        }`}
      />
      {error ? <span className="mt-1 block text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="h-11 w-full rounded bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
    >
      {busy ? "..." : children}
    </button>
  );
}

export { Link };
