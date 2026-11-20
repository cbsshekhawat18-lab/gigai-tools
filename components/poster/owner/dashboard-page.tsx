"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Container } from "@/components/shared/container";
import { useDevSession } from "@/lib/devapi/session";
import { posterApi } from "@/lib/poster/api";
import { downloadQr } from "@/lib/poster/share";
import type { PosterPage } from "@/lib/poster/types";
import { cn } from "@/lib/utils";

import { BannerManager } from "./banner-manager";
import { BasicsForm, LogoForm } from "./edit-forms";
import { OverviewTab } from "./overview-tab";
import { DangerZone, PublishControls, ShareTools, SlugForm } from "./share-tools";
import { btn, btnPrimary, Section, StatusBadge } from "./ui";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "edit", label: "Edit page" },
  { id: "banners", label: "Designs" },
  { id: "share", label: "Share" },
  { id: "settings", label: "Settings" },
] as const;
type Tab = (typeof TABS)[number]["id"];
const isTab = (s: string | null): s is Tab => TABS.some((t) => t.id === s);

interface Mine {
  pages: PosterPage[];
  limit: number;
  max_banners: number;
}
interface Sel {
  page: string | null;
  tab: Tab;
}

/** ?page=<id>&tab=<tab> is the whole navigation state, so refresh and back/forward keep working. */
function readUrl(): Sel {
  const q = new URLSearchParams(window.location.search);
  const t = q.get("tab");
  return { page: q.get("page"), tab: isTab(t) ? t : "overview" };
}
function writeUrl(sel: Sel, push: boolean): void {
  const q = new URLSearchParams();
  if (sel.page) {
    q.set("page", sel.page);
    if (sel.tab !== "overview") q.set("tab", sel.tab);
  }
  const qs = q.toString();
  const url = `/dashboard${qs ? `?${qs}` : ""}`;
  if (push) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

/** /dashboard: my pages, then one page's overview / edit / designs / share / settings. Session-gated. */
export function DashboardPage() {
  const { ready, email } = useDevSession();
  const [mine, setMine] = React.useState<Mine | null>(null);
  const [sel, setSel] = React.useState<Sel>({ page: null, tab: "overview" });

  const refresh = React.useCallback(async () => {
    const r = await posterApi.myPages();
    if (r.ok) setMine(r.data);
    else toast.error(r.error.message);
  }, []);

  React.useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  React.useEffect(() => {
    setSel(readUrl());
    const onPop = () => setSel(readUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (page: string | null, tab: Tab = "overview") => {
    const next = { page, tab };
    writeUrl(next, page !== sel.page);
    setSel(next);
  };
  const replace = (p: PosterPage) => setMine((m) => m && { ...m, pages: m.pages.map((x) => (x.id === p.id ? p : x)) });

  if (!ready || !mine) {
    return (
      <section className="py-12">
        <Container size="narrow"><div className="h-6 w-40 animate-pulse rounded bg-muted" /></Container>
      </section>
    );
  }

  const page = mine.pages.find((p) => p.id === sel.page);

  return (
    <section className="py-8">
      <Container size="narrow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">My poster pages</h1>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <Link href="/developers/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Account</Link>
        </div>
        <div className="mt-6">
          {page ? (
            <PageDetail
              page={page}
              tab={sel.tab}
              maxBanners={mine.max_banners}
              onTab={(t) => go(page.id, t)}
              onBack={() => go(null)}
              onChange={replace}
              onDeleted={() => { go(null); void refresh(); }}
            />
          ) : (
            <PageList pages={mine.pages} limit={mine.limit} onOpen={go} />
          )}
        </div>
      </Container>
    </section>
  );
}

function PageList({ pages, limit, onOpen }: { pages: PosterPage[]; limit: number; onOpen: (id: string, tab: Tab) => void }) {
  const atLimit = pages.length >= limit;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground">My pages <span className="font-normal text-muted-foreground">({pages.length}/{limit})</span></h2>
        {atLimit ? (
          <span className={cn(btnPrimary, "cursor-not-allowed opacity-50")} title={`Limit of ${limit} pages reached`}>+ Create new page</span>
        ) : (
          <Link href="/create" className={btnPrimary}>+ Create new page</Link>
        )}
      </div>
      {atLimit ? <p className="mt-1 text-xs text-muted-foreground">Page limit reached. Delete a page to add another.</p> : null}
      {pages.length ? (
        <ul className="mt-4 space-y-3">
          {pages.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              {p.banners[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.banners[0].preview_url} alt="" className="h-20 w-16 shrink-0 rounded bg-muted object-cover" />
              ) : (
                <div className="h-20 w-16 shrink-0 rounded bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-foreground"><span className="truncate">{p.display_name}</span><StatusBadge status={p.status} /></p>
                <p className="truncate text-xs text-muted-foreground">{p.url}</p>
                <p className="text-xs text-muted-foreground">{p.banners.length} design{p.banners.length === 1 ? "" : "s"}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className={btn}>Open</a>
                <button type="button" onClick={() => onOpen(p.id, "share")} className={btn}>Share</button>
                <button type="button" onClick={() => void downloadQr(p)} className={btn}>QR</button>
                <button type="button" onClick={() => onOpen(p.id, "edit")} className={btnPrimary}>Edit</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No pages yet. <Link href="/create" className="text-primary hover:underline">Create one</Link>: pick a name and address, upload up to 4 designs, mark where the supporter&apos;s photo goes, publish.
        </div>
      )}
    </div>
  );
}

function PageDetail({ page, tab, maxBanners, onTab, onBack, onChange, onDeleted }: {
  page: PosterPage; tab: Tab; maxBanners: number; onTab: (t: Tab) => void; onBack: () => void;
  onChange: (p: PosterPage) => void; onDeleted: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← My pages</button>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="truncate">{page.display_name}</span>
            <StatusBadge status={page.status} />
          </h2>
          <p className="truncate text-xs text-muted-foreground">{page.url}</p>
        </div>
        <a href={page.url} target="_blank" rel="noopener noreferrer" className={btn}>Open page ↗</a>
      </div>

      <div role="tablist" aria-label="Page sections" className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => onTab(t.id)}
            className={cn("-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm", tab === t.id ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "overview" ? <OverviewTab page={page} /> : null}
        {tab === "edit" ? (
          <div className="space-y-5">
            <Section title="Page details" lead="Header, announcement strip, footer and the default label under the supporter's photo. Write it the way supporters should read it.">
              <BasicsForm key={page.updated_at} page={page} onSaved={onChange} />
            </Section>
            <Section title="Logo / emblem" lead="The circle at the top-left of the page. A square PNG with a transparent background looks best.">
              <LogoForm page={page} onChange={onChange} />
            </Section>
          </div>
        ) : null}
        {tab === "banners" ? (
          <Section title={`Banner designs (up to ${maxBanners})`} lead="Upload the finished designs, then mark where the supporter's photo and name go on each one. The first design is the one supporters see first.">
            <BannerManager page={page} maxBanners={maxBanners} onChange={onChange} />
          </Section>
        ) : null}
        {tab === "share" ? (
          <Section title="Share your page">
            <ShareTools page={page} />
          </Section>
        ) : null}
        {tab === "settings" ? (
          <div className="space-y-5">
            <Section title="Publishing">
              <PublishControls page={page} onChange={onChange} />
            </Section>
            <Section title="Page address" lead="Changing it keeps the old link working for 30 days, then it stops. Anything printed with the old QR code needs reprinting.">
              <SlugForm key={page.slug} page={page} onChange={onChange} />
            </Section>
            <Section title="Delete page">
              <DangerZone page={page} onDeleted={onDeleted} />
            </Section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
