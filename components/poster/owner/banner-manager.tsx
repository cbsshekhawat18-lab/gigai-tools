"use client";

import * as React from "react";
import { toast } from "sonner";

import { posterApi } from "@/lib/poster/api";
import { LIMITS, type Banner, type PosterPage, type Zones } from "@/lib/poster/types";

import { btn, btnPrimary } from "./ui";
import { ZoneEditor } from "./zone-editor";

function summary(z: Zones): string {
  const shapes = z.photos.map((p) => p.shape);
  const photos = shapes.length
    ? `${shapes.length} photo slot${shapes.length > 1 ? "s" : ""} (${shapes.join(", ")})`
    : "No photo slot yet - supporters cannot add their photo";
  return z.name ? `${photos} · name: ${z.name.style === "badge" ? "white pill" : "plain text"}` : photos;
}

/** Upload (sequential, up to the page limit), reorder, remove, and open the slot editor per banner. */
export function BannerManager({ page, maxBanners, onChange }: {
  page: PosterPage; maxBanners: number; onChange: (p: PosterPage) => void;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const banners = [...page.banners].sort((a, b) => a.sort_order - b.sort_order);
  const remaining = maxBanners - banners.length;

  const reload = async () => {
    const r = await posterApi.page(page.slug);
    if (r.ok) onChange(r.data);
  };

  const upload = async (files: FileList | null) => {
    const list = Array.from(files ?? []).slice(0, Math.max(0, remaining));
    if (!list.length) {
      toast.error(`This page already has ${maxBanners} banners.`);
      return;
    }
    for (const [i, file] of list.entries()) {
      setBusy(`Uploading ${i + 1} of ${list.length}…`);
      const r = await posterApi.uploadBanner(page.id, file);
      if (!r.ok) {
        toast.error(r.error.message);
        break;
      }
    }
    setBusy(null);
    await reload();
  };

  const move = async (b: Banner, dir: -1 | 1) => {
    const i = banners.indexOf(b);
    const other = banners[i + dir];
    if (!other) return;
    setBusy("Reordering…");
    await posterApi.updateBanner(page.id, b.id, { sort_order: i + dir });
    await posterApi.updateBanner(page.id, other.id, { sort_order: i });
    setBusy(null);
    await reload();
  };

  const remove = async (b: Banner) => {
    if (!window.confirm("Remove this banner? Supporters will no longer see it.")) return;
    setBusy("Removing…");
    const r = await posterApi.deleteBanner(page.id, b.id);
    setBusy(null);
    if (!r.ok) toast.error(r.error.message);
    await reload();
  };

  const saveZones = async (b: Banner, zones: Zones) => {
    const r = await posterApi.updateBanner(page.id, b.id, { zones });
    if (!r.ok) {
      toast.error(r.error.message);
      return;
    }
    toast.success("Slots saved");
    setEditing(null);
    await reload();
  };

  return (
    <div>
      {banners.length ? (
        <ul className="space-y-3">
          {banners.map((b, i) => (
            <li key={b.id} className="rounded-lg border border-border">
              <div className="flex flex-wrap items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.preview_url} alt="" className="h-20 w-16 rounded bg-muted object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Design {i + 1} <span className="font-normal text-muted-foreground">{b.width}×{b.height}</span>
                  </p>
                  <p className={`text-xs ${b.zones.photos.length ? "text-muted-foreground" : "text-amber-700"}`}>{summary(b.zones)}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => setEditing(editing === b.id ? null : b.id)} className={b.zones.photos.length ? btn : btnPrimary}>
                    {editing === b.id ? "Close" : b.zones.photos.length ? "Edit slots" : "Set photo slot"}
                  </button>
                  <button type="button" onClick={() => void move(b, -1)} disabled={i === 0 || !!busy} className={btn} aria-label="Move up">↑</button>
                  <button type="button" onClick={() => void move(b, 1)} disabled={i === banners.length - 1 || !!busy} className={btn} aria-label="Move down">↓</button>
                  <button type="button" onClick={() => void remove(b)} disabled={!!busy} className={`${btn} text-red-600`}>Remove</button>
                </div>
              </div>
              {editing === b.id ? (
                <div className="border-t border-border p-3">
                  <ZoneEditor key={b.id} banner={b} page={page} onSave={(z) => void saveZones(b, z)} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No banners yet. Upload the finished designs from your designer - the ones with your photo, name and slogans already on them.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={remaining <= 0 || !!busy} className={btnPrimary}>
          + Upload banner{remaining > 1 ? "s" : ""}
        </button>
        <span className="text-xs text-muted-foreground">
          {busy ?? `${remaining} of ${maxBanners} slots free · JPG/PNG/WebP · 4:5 portrait (1080×1350 or larger) looks best · max ${LIMITS.bannerMB} MB each`}
        </span>
        <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
      </div>
    </div>
  );
}
