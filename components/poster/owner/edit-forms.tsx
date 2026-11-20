"use client";

import * as React from "react";
import { toast } from "sonner";

import { Field } from "@/components/devdash/auth-card";
import { posterApi, type PageFields } from "@/lib/poster/api";
import { LIMITS, THEME_PRESETS, themeOf, type PageLang, type PosterPage } from "@/lib/poster/types";
import { cn } from "@/lib/utils";

import { btn, btnPrimary } from "./ui";

/** Header, strip, footer, defaults, language, colours - one save. */
export function BasicsForm({ page, onSaved }: { page: PosterPage; onSaved: (p: PosterPage) => void }) {
  const theme = themeOf(page);
  const [f, setF] = React.useState({
    display_name: page.display_name, designation: page.designation, area: page.area, tagline: page.tagline, org_name: page.org_name,
    lang: page.lang as PageLang, primary: theme.primary, secondary: theme.secondary,
    announcement: page.defaults.announcement ?? "", whatsapp_text: page.defaults.whatsapp_text ?? "",
    supporter_label: page.defaults.supporter_label ?? "", supporter_area: page.defaults.supporter_area ?? "",
    slogan1: page.defaults.slogans?.[0] ?? "", slogan2: page.defaults.slogans?.[1] ?? "",
  });
  const [busy, setBusy] = React.useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const body: PageFields = {
      display_name: f.display_name, designation: f.designation, area: f.area, tagline: f.tagline, org_name: f.org_name, lang: f.lang,
      theme: { primary: f.primary, secondary: f.secondary },
      defaults: {
        announcement: f.announcement, whatsapp_text: f.whatsapp_text, supporter_label: f.supporter_label, supporter_area: f.supporter_area,
        slogans: [f.slogan1, f.slogan2].filter(Boolean),
      },
    };
    const r = await posterApi.update(page.id, body);
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error.message);
      return;
    }
    onSaved(r.data);
    toast.success("Saved");
  };

  return (
    <form onSubmit={(e) => void save(e)}>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Display name" value={f.display_name} onChange={set("display_name")} required maxLength={60} />
        <Field label="Designation (e.g. भाजपा प्रत्याशी)" value={f.designation} onChange={set("designation")} maxLength={80} />
        <Field label="Area (e.g. वार्ड नं. 76, जयपुर)" value={f.area} onChange={set("area")} maxLength={80} />
        <Field label="Organisation / party / brand" value={f.org_name} onChange={set("org_name")} maxLength={100} />
        <Field label="Tagline (footer, e.g. पुनीत तो अपना भाई है!)" value={f.tagline} onChange={set("tagline")} maxLength={160} />
        <Field label="Announcement strip (blank = tagline + default line)" value={f.announcement} onChange={set("announcement")} maxLength={200} />
        <Field label="Slogan line 1 (footer)" value={f.slogan1} onChange={set("slogan1")} maxLength={60} />
        <Field label="Slogan line 2 (footer)" value={f.slogan2} onChange={set("slogan2")} maxLength={60} />
        <Field label="Default label under the supporter photo" placeholder="समर्थक" value={f.supporter_label} onChange={set("supporter_label")} maxLength={40} />
        <Field label="Default area under the supporter photo" placeholder={page.area || "वार्ड नं. 76, जयपुर"} value={f.supporter_area} onChange={set("supporter_area")} maxLength={80} />
        <Field label="WhatsApp share text (blank = automatic, includes your link)" value={f.whatsapp_text} onChange={set("whatsapp_text")} maxLength={300} />
        <label className="mb-4 block text-sm font-medium text-foreground">
          Page language
          <select value={f.lang} onChange={set("lang")} className="mt-1 block h-11 w-full rounded border border-border bg-background px-3 text-sm">
            <option value="hi">हिन्दी (Hindi, bilingual labels)</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      <p className="text-sm font-medium text-foreground">Colours</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {THEME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.label}
            onClick={() => setF((s) => ({ ...s, primary: p.primary, secondary: p.secondary }))}
            className={cn("flex items-center gap-1 rounded border px-2 py-1.5", f.primary === p.primary && f.secondary === p.secondary ? "border-primary" : "border-border")}
          >
            <span className="size-4 rounded-full" style={{ background: p.primary }} />
            <span className="size-4 rounded-full" style={{ background: p.secondary }} />
          </button>
        ))}
        <label className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          Custom <input type="color" value={f.primary} onChange={set("primary")} aria-label="Primary colour" className="size-7 cursor-pointer border-0 bg-transparent p-0" />
          <input type="color" value={f.secondary} onChange={set("secondary")} aria-label="Secondary colour" className="size-7 cursor-pointer border-0 bg-transparent p-0" />
        </label>
      </div>

      <button type="submit" disabled={busy || !f.display_name.trim()} className={`${btnPrimary} mt-5`}>{busy ? "Saving…" : "Save details"}</button>
    </form>
  );
}

export function LogoForm({ page, onChange }: { page: PosterPage; onChange: (p: PosterPage) => void }) {
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);
  const run = async (p: Promise<{ ok: true; data: PosterPage } | { ok: false; error: { message: string } }>) => {
    setBusy(true);
    const r = await p;
    setBusy(false);
    if (r.ok) onChange(r.data);
    else toast.error(r.error.message);
  };
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-16 place-items-center overflow-hidden rounded-full border border-border bg-muted">
        {page.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.logo_url} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-xl font-bold text-muted-foreground">{page.display_name.slice(0, 1)}</span>
        )}
      </span>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} className={btn}>{page.logo_url ? "Replace" : "Upload logo"}</button>
        {page.logo_url ? <button type="button" onClick={() => void run(posterApi.deleteLogo(page.id))} disabled={busy} className={`${btn} text-red-600`}>Remove</button> : null}
        <span className="self-center text-xs text-muted-foreground">PNG/JPG, max {LIMITS.logoMB} MB</span>
      </div>
      <input ref={ref} type="file" accept="image/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void run(posterApi.uploadLogo(page.id, file)); }} />
    </div>
  );
}
