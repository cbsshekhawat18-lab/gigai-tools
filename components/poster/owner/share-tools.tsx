"use client";

import * as React from "react";
import { toast } from "sonner";

import { Field } from "@/components/devdash/auth-card";
import { posterApi } from "@/lib/poster/api";
import { downloadPromo, downloadQr, whatsappHref } from "@/lib/poster/share";
import type { PageStatus, PosterPage } from "@/lib/poster/types";

import { btn, btnPrimary, StatusBadge } from "./ui";
import { useSlugCheck } from "./use-slug-check";

type OnChange = (p: PosterPage) => void;

/** Copy link, WhatsApp, QR, promo image, open. Sharing only - status lives in PublishControls. */
export function ShareTools({ page }: { page: PosterPage }) {
  const [busy, setBusy] = React.useState<"qr" | "promo" | null>(null);
  const copy = async () => {
    await navigator.clipboard.writeText(page.url);
    toast.success("Link copied");
  };
  const build = async (kind: "qr" | "promo", fn: () => Promise<void>) => {
    setBusy(kind);
    try {
      await fn();
    } catch {
      toast.error("Could not build the image. Try again.");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded border border-border bg-muted/40 px-3 py-2 text-sm">
        <span className="min-w-0 flex-1 truncate font-mono">{page.url}</span>
        <button type="button" onClick={() => void copy()} className="text-sm font-semibold text-primary">Copy</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={whatsappHref(page)} target="_blank" rel="noopener noreferrer" className={btn}>Share on WhatsApp</a>
        <button type="button" onClick={() => void build("qr", () => downloadQr(page))} disabled={busy !== null} className={btn}>
          {busy === "qr" ? "Building…" : "Download QR code"}
        </button>
        <button type="button" onClick={() => void build("promo", () => downloadPromo(page))} disabled={busy !== null} className={btn}>
          {busy === "promo" ? "Building…" : "Download promo image (1080×1080)"}
        </button>
        <a href={page.url} target="_blank" rel="noopener noreferrer" className={btn}>Open page ↗</a>
      </div>
      <p className="text-xs text-muted-foreground">
        The promo image carries your name, colours, the QR code and the link - print it or post it so supporters find the page.
      </p>
    </div>
  );
}

/** Live / paused / draft. Publishing needs at least one design with a photo slot. */
export function PublishControls({ page, onChange }: { page: PosterPage; onChange: OnChange }) {
  const [busy, setBusy] = React.useState(false);
  const ready = page.banners.some((b) => b.zones.photos.length > 0);
  const setStatus = async (status: PageStatus) => {
    setBusy(true);
    const r = await posterApi.setStatus(page.id, status);
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error.message);
      return;
    }
    onChange(r.data);
    toast.success(status === "live" ? "Your page is live." : `Page is now ${status}.`);
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusBadge status={page.status} />
      {page.status === "live" ? (
        <button type="button" onClick={() => void setStatus("paused")} disabled={busy} className={btn}>Pause page</button>
      ) : (
        <button type="button" onClick={() => void setStatus("live")} disabled={busy || !ready} className={btnPrimary}>Publish page</button>
      )}
      {page.status === "paused" ? (
        <button type="button" onClick={() => void setStatus("draft")} disabled={busy} className={btn}>Back to draft</button>
      ) : null}
      <span className="text-xs text-muted-foreground">
        {!ready ? "Add a design with a photo slot before publishing." : page.status === "live" ? "Paused pages answer 404 until you publish again." : "Only live pages are public and counted."}
      </span>
    </div>
  );
}

/** Rename the address. The old link keeps 301-ing to the new one for 30 days. */
export function SlugForm({ page, onChange }: { page: PosterPage; onChange: OnChange }) {
  const [slug, setSlug] = React.useState(page.slug);
  const [busy, setBusy] = React.useState(false);
  const check = useSlugCheck(slug, page.slug);
  const changed = slug !== page.slug;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changed) return;
    if (!window.confirm(`Change the address to gigai.tools/p/${slug}?\n\nThe old link keeps working for 30 days, then stops. Reprint anything that shows the old QR code.`)) return;
    setBusy(true);
    const r = await posterApi.rename(page.id, slug);
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error.message);
      return;
    }
    onChange(r.data);
    toast.success("Address changed. The old link redirects for 30 days.");
  };

  return (
    <form onSubmit={(e) => void submit(e)}>
      <Field label="Page address" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} required error={check && !check.available ? check.reason : null} />
      <p className="-mt-2 mb-4 text-xs text-muted-foreground">
        gigai.tools/p/<b className="text-foreground">{slug || "your-name"}</b>
        {changed && check?.available ? <span className="ml-2 text-emerald-700">available</span> : null}
      </p>
      <button type="submit" disabled={busy || !changed || !check?.available} className={btnPrimary}>{busy ? "Changing…" : "Change address"}</button>
    </form>
  );
}

export function DangerZone({ page, onDeleted }: { page: PosterPage; onDeleted: () => void }) {
  const [busy, setBusy] = React.useState(false);
  const del = async () => {
    if (!window.confirm(`Delete "${page.display_name}"? The page, its designs and its counters are removed for good.`)) return;
    setBusy(true);
    const r = await posterApi.remove(page.id);
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error.message);
      return;
    }
    toast.success("Page deleted");
    onDeleted();
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => void del()} disabled={busy} className={`${btn} border-red-200 text-red-600 hover:bg-red-50`}>Delete this page</button>
      <span className="text-xs text-muted-foreground">Frees the address for someone else. This cannot be undone.</span>
    </div>
  );
}
