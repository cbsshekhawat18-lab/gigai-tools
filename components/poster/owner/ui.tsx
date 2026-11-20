"use client";

import * as React from "react";

import type { PageStatus } from "@/lib/poster/types";

export const btn = "rounded border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50";
export const btnPrimary = "rounded bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50";

const STATUS_STYLE: Record<PageStatus, string> = {
  live: "bg-emerald-600/10 text-emerald-700",
  paused: "bg-amber-500/10 text-amber-700",
  draft: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: PageStatus }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span>;
}

export function Section({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">{title}</h3>
      {lead ? <p className="mt-1 text-sm text-muted-foreground">{lead}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
