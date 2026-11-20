"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Container } from "@/components/shared/container";
import { api, getSession } from "@/lib/devapi/client";

/**
 * Admin shell. Access is enforced server-side (session + the env allowlist);
 * this component just probes /v1/admin/stats and shows nothing but a 404-ish
 * message to everyone else. The thin red top border and the Admin label keep
 * staff from ever confusing it with the user dashboard.
 */

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/ops", label: "Tools & ops" },
  { href: "/admin/health", label: "Server health" },
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [state, setState] = React.useState<"checking" | "ok" | "denied">("checking");
  const pathname = usePathname();

  React.useEffect(() => {
    if (!getSession()) {
      setState("denied");
      return;
    }
    void api("/admin/stats").then((r) => setState(r.ok ? "ok" : "denied"));
  }, []);

  if (state === "checking") return null;
  if (state === "denied") {
    return (
      <section className="py-24 text-center">
        <p className="text-sm text-muted-foreground">There is nothing at this address.</p>
      </section>
    );
  }

  return (
    <section className="border-t-2 border-red-600 py-8">
      <Container>
        <div className="gap-8 md:grid md:grid-cols-[180px_minmax(0,1fr)]">
          <aside className="mb-6 md:mb-0">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">Admin</p>
            <nav className="mt-3 space-y-0.5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname === item.href
                      ? "block border-l-2 border-red-600 py-1 pl-2 text-sm font-semibold text-foreground"
                      : "block border-l-2 border-transparent py-1 pl-2 text-sm text-muted-foreground hover:text-foreground"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
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

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-border bg-card p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
