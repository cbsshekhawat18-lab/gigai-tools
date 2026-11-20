"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Container } from "@/components/shared/container";
import { useDevSession } from "@/lib/devapi/session";
import { posterApi } from "@/lib/poster/api";

import { NewPageForm } from "./new-page-form";

const STEPS = [
  ["Name and address", "Pick how the page is titled and its gigai.tools/p/… link."],
  ["Upload your designs", "Up to 4 finished banners; mark where the supporter's photo and name go on each."],
  ["Publish and share", "Copy the link, download the QR code or promo image, watch the counters in your dashboard."],
];

/** /create: make a new page, then hand off to the dashboard for everything else. Session-gated. */
export function CreatePage() {
  const { ready, email } = useDevSession();
  const [mine, setMine] = React.useState<{ count: number; limit: number } | null>(null);

  React.useEffect(() => {
    // Phase 1 linked here with ?page=…; the editor now lives in the dashboard.
    const id = new URLSearchParams(window.location.search).get("page");
    if (id) window.location.replace(`/dashboard?page=${encodeURIComponent(id)}&tab=edit`);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    void posterApi.myPages().then((r) => {
      if (r.ok) setMine({ count: r.data.pages.length, limit: r.data.limit });
      else toast.error(r.error.message);
    });
  }, [ready]);

  if (!ready || !mine) {
    return (
      <section className="py-12">
        <Container size="narrow"><div className="h-6 w-40 animate-pulse rounded bg-muted" /></Container>
      </section>
    );
  }

  return (
    <section className="py-8">
      <Container size="narrow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Create a supporter poster page</h1>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          {mine.count ? <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">My pages ({mine.count}) →</Link> : null}
        </div>
        <div className="mt-6">
          {mine.count >= mine.limit ? (
            <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              You have reached the limit of {mine.limit} pages. Delete one in your <Link href="/dashboard" className="text-primary hover:underline">dashboard</Link> to add another.
            </p>
          ) : (
            <NewPageForm
              onCreated={(p) => {
                toast.success("Page created. Now upload your designs.");
                window.location.href = `/dashboard?page=${encodeURIComponent(p.id)}&tab=banners`;
              }}
            />
          )}
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="text-sm">
              <p className="font-semibold text-foreground"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">{i + 1}</span>{title}</p>
              <p className="mt-1 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
