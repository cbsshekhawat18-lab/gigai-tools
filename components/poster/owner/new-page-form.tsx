"use client";

import * as React from "react";

import { Field } from "@/components/devdash/auth-card";
import { posterApi } from "@/lib/poster/api";
import { suggestSlug } from "@/lib/poster/slug";
import type { PosterPage } from "@/lib/poster/types";

import { btn, btnPrimary } from "./ui";
import { useSlugCheck } from "./use-slug-check";

/** Name + address; everything else is edited afterwards in the dashboard. */
export function NewPageForm({ onCreated, onCancel }: { onCreated: (p: PosterPage) => void; onCancel?: () => void }) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const check = useSlugCheck(slug);

  React.useEffect(() => {
    if (!touched) setSlug(suggestSlug(name));
  }, [name, touched]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await posterApi.create({ slug, display_name: name });
    setBusy(false);
    if (r.ok) onCreated(r.data);
    else setError(r.error.message);
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">New page</h2>
      <p className="mt-1 text-sm text-muted-foreground">You can change every detail afterwards, including the address.</p>
      <div className="mt-4">
        <Field label="Display name (shown in the page header)" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoFocus />
        <Field label="Page address" value={slug} onChange={(e) => { setTouched(true); setSlug(e.target.value.toLowerCase()); }} required error={check && !check.available ? check.reason : null} />
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          gigai.tools/p/<b className="text-foreground">{slug || "your-name"}</b>
          {check?.available ? <span className="ml-2 text-emerald-700">available</span> : null}
        </p>
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          {onCancel ? <button type="button" onClick={onCancel} className={btn}>Cancel</button> : null}
          <button type="submit" disabled={busy || !name.trim() || !check?.available} className={btnPrimary}>{busy ? "Creating…" : "Create page"}</button>
        </div>
      </div>
    </form>
  );
}
