"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Container } from "@/components/shared/container";
import { setSession } from "@/lib/devapi/client";
import { useDevSession } from "@/lib/devapi/session";

/**
 * Dashboard shell: session gate + sidebar. Every dashboard page renders
 * inside it; pages own their data fetching. Dense and quiet on purpose -
 * tables and forms, nothing decorative.
 */

const NAV = [
  { href: "/developers/dashboard", label: "Overview" },
  { href: "/developers/dashboard/keys", label: "API keys" },
  { href: "/developers/dashboard/usage", label: "Usage" },
  { href: "/developers/dashboard/jobs", label: "Jobs" },
  { href: "/developers/dashboard/webhooks", label: "Webhooks" },
  { href: "/developers/builder", label: "Request builder" },
  { href: "/dashboard", label: "Poster pages" },
  { href: "/developers/docs", label: "Docs" },
  { href: "/developers/dashboard/settings", label: "Settings" },
];

export function DashShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { ready, email } = useDevSession();
  const pathname = usePathname();

  if (!ready) {
    return (
      <section className="py-12">
        <Container>
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        </Container>
      </section>
    );
  }

  return (
    <section className="py-8">
      <Container>
        <div className="gap-8 md:grid md:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="mb-6 md:mb-0">
            <div className="md:sticky md:top-20">
              <p className="truncate text-xs text-muted-foreground" title={email ?? ""}>
                {email}
              </p>
              <nav className="mt-3 space-y-0.5">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      pathname === item.href
                        ? "block border-l-2 border-primary py-1 pl-2 text-sm font-semibold text-foreground"
                        : "block border-l-2 border-transparent py-1 pl-2 text-sm text-muted-foreground hover:text-foreground"
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => {
                  setSession(null);
                  window.location.href = "/developers";
                }}
                className="mt-5 pl-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Log out
              </button>
            </div>
          </aside>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function StatusPill({ status }: { status: string }) {
  const style =
    status === "finished"
      ? "bg-emerald-600/10 text-emerald-700"
      : status === "error"
        ? "bg-red-600/10 text-red-700"
        : status === "processing"
          ? "bg-blue-600/10 text-blue-700"
          : "bg-muted text-muted-foreground";
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${style}`}>{status}</span>;
}

export function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{children}</th>;
}

export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 text-sm ${className}`}>{children}</td>;
}

export function DashTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/40">{head}</tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
