"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon as UiIcon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import type { ImageToolProps } from "@/components/tool/types";

import {
  DEFAULT_DNA,
  bumpVersion,
  shortId,
  slugify,
  type Icon,
  type IconDNA,
  type IconFamily,
} from "@/lib/iconlab/types";
import { indexedDbStore, exportFamily, importFamily } from "@/lib/iconlab/storage";
import { analyzeReferences, familyHealth } from "@/lib/iconlab/analyze";
import { generateIcon, generateBulk, CATEGORY_PRESETS } from "@/lib/iconlab/generate";
import { VOCABULARY } from "@/lib/iconlab/primitives";
import { buildPackage, DEFAULT_PACKAGE_OPTIONS } from "@/lib/iconlab/package";
import { enableAiComposer, aiComposerAvailable } from "@/lib/iconlab/ai-provider";

type Screen = "families" | "create-family" | "family";

/**
 * GigAI IconLab: build an icon system, not one icon.
 *
 * The whole UI is organized around the family, because that is the product's
 * actual idea: define the design language once, then keep extending it. There
 * is deliberately no stroke/grid/corner control on the create-icon screen, the
 * family already decided those, and re-asking would defeat the point.
 *
 * Everything is local. Families live in IndexedDB and move between machines as
 * an exported JSON file, which is stated plainly rather than implied.
 */
export default function GigaiIconLabTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [screen, setScreen] = React.useState<Screen>("families");
  const [families, setFamilies] = React.useState<IconFamily[]>([]);
  const [family, setFamily] = React.useState<IconFamily | null>(null);
  const [icons, setIcons] = React.useState<Icon[]>([]);
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const [aiReady, setAiReady] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      setFamilies(await indexedDbStore.listFamilies());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Families could not be loaded.");
    }
  }, []);

  // Register the AI composer as the fallback provider (the 98-concept
  // vocabulary always wins) and find out whether the server has it configured,
  // so the disclosure below the input reflects what will actually happen.
  React.useEffect(() => {
    enableAiComposer();
    void aiComposerAvailable().then(setAiReady);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const openFamily = React.useCallback(async (f: IconFamily) => {
    setFamily(f);
    setIcons(await indexedDbStore.listIcons(f.id));
    setScreen("family");
    setNotice(null);
  }, []);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium", style.border, style.soft)}>
          <UiIcon name="Lock" size={13} className={style.text} />
          Families are stored in this browser, your icons and files never leave it
        </p>
        {screen !== "families" ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => { setScreen("families"); void refresh(); }}>
            <UiIcon name="ArrowLeft" size={15} />
            All families
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
          <UiIcon name="TriangleAlert" size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", style.border, style.soft)}>
          <UiIcon name="CircleCheck" size={15} className={cn("mt-0.5 shrink-0", style.text)} />
          {notice}
        </p>
      ) : null}
      {busy ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <UiIcon name="LoaderCircle" size={15} className="animate-spin" />
          {busy}
        </p>
      ) : null}

      {screen === "families" ? (
        <FamilyList
          families={families}
          accent={tool.accent}
          onOpen={openFamily}
          onNew={() => setScreen("create-family")}
          onImported={async (f) => { await refresh(); void openFamily(f); }}
          onError={setError}
        />
      ) : null}

      {screen === "create-family" ? (
        <CreateFamily
          accent={tool.accent}
          onCreated={async (f) => { await refresh(); void openFamily(f); }}
          onError={setError}
        />
      ) : null}

      {screen === "family" && family ? (
        <FamilyWorkspace
          family={family}
          icons={icons}
          aiReady={aiReady}
          accent={tool.accent}
          setBusy={setBusy}
          setNotice={setNotice}
          setError={setError}
          onChanged={async (f) => {
            setFamily(f);
            setIcons(await indexedDbStore.listIcons(f.id));
            await refresh();
          }}
        />
      ) : null}
    </div>
  );
}

/* ── Families list ────────────────────────────────────────────────────────── */

function FamilyList({
  families, accent, onOpen, onNew, onImported, onError,
}: {
  families: IconFamily[];
  accent: ImageToolProps["tool"]["accent"];
  onOpen: (f: IconFamily) => void;
  onNew: () => void;
  onImported: (f: IconFamily) => void;
  onError: (m: string) => void;
}) {
  const style = accentStyle(accent);
  const importId = React.useId();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">My icon families</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <label htmlFor={importId} className="cursor-pointer">
              <UiIcon name="Upload" size={16} />
              Import family
              <input
                id={importId}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    const f = await importFamily(indexedDbStore, JSON.parse(await file.text()));
                    onImported(f);
                  } catch (err) {
                    onError(err instanceof Error ? err.message : "That file couldn't be imported.");
                  }
                }}
              />
            </label>
          </Button>
          <Button type="button" onClick={onNew}>
            <UiIcon name="Plus" size={16} />
            New family
          </Button>
        </div>
      </div>

      {families.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border px-6 py-14 text-center">
          <span className={cn("flex size-14 items-center justify-center rounded-2xl", style.soft)}>
            <UiIcon name="Shapes" size={26} className={style.text} />
          </span>
          <span className="text-base font-medium text-foreground">Start with one icon. Build a whole system.</span>
          <span className="max-w-md text-sm text-muted-foreground">
            A family holds your design language, grid, stroke, corners, padding. Define it once and
            every icon you add afterwards matches, however long the gap.
          </span>
          <Button type="button" onClick={onNew} className="mt-1">Create your first family</Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {families.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => onOpen(f)}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                  "hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.border, style.ring,
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{f.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">v{f.version}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {f.iconCount} icon{f.iconCount === 1 ? "" : "s"} · {f.dna.canvas.width}px grid · stroke {f.dna.stroke.width}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn("size-1.5 rounded-full", f.styleLocked ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                  Style lock {f.styleLocked ? "on" : "off"} · {f.familyCode}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Create family ────────────────────────────────────────────────────────── */

function CreateFamily({
  accent, onCreated, onError,
}: {
  accent: ImageToolProps["tool"]["accent"];
  onCreated: (f: IconFamily) => void;
  onError: (m: string) => void;
}) {
  const style = accentStyle(accent);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dna, setDna] = React.useState<IconDNA>(DEFAULT_DNA);
  const [reading, setReading] = React.useState<ReturnType<typeof analyzeReferences> | null>(null);
  const uploadId = React.useId();

  const analyse = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const svgs: string[] = [];
      for (const f of Array.from(files).slice(0, 50)) {
        if (!/svg/i.test(f.type) && !f.name.endsWith(".svg")) continue;
        svgs.push(await f.text());
      }
      if (!svgs.length) {
        onError("None of those files were SVGs.");
        return;
      }
      const r = analyzeReferences(svgs);
      setReading(r);
      setDna(r.dna);
    } catch {
      onError("Those references couldn't be read.");
    }
  };

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = shortId("FAM");
    const now = new Date().toISOString();
    const family: IconFamily = {
      id, name: trimmed, description: description.trim(), slug: slugify(trimmed),
      familyCode: id, status: "active", version: "1.0.0", iconCount: 0, styleLocked: true,
      dna, memory: { corrections: [], rejected: [] },
      categories: ["General"], createdAt: now, updatedAt: now,
    };
    try {
      await indexedDbStore.saveFamily(family);
      onCreated(family);
    } catch (e) {
      onError(e instanceof Error ? e.message : "The family couldn't be saved.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Create an icon family</h2>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Family name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Modern SaaS"
          className={cn("rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none", style.ring, "border-border focus-visible:ring-2")}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Description <span className="font-normal text-muted-foreground">(optional)</span></span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Outline icons for a product dashboard"
          className={cn("rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none", style.ring, "border-border focus-visible:ring-2")}
        />
      </label>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4">
        <span className="text-sm font-medium text-foreground">Learn the style from icons you already have</span>
        <p className="text-sm text-muted-foreground">
          Upload a few SVGs and IconLab reads their <em>design rules</em> - grid, stroke, corners, padding.
          It never copies their shapes; the reference teaches a style, it doesn&apos;t donate geometry.
        </p>
        <Button type="button" variant="outline" asChild className="self-start">
          <label htmlFor={uploadId} className="cursor-pointer">
            <UiIcon name="Upload" size={16} />
            Add reference SVGs
            <input id={uploadId} type="file" accept=".svg,image/svg+xml" multiple className="sr-only"
              onChange={(e) => { void analyse(e.target.files); e.target.value = ""; }} />
          </label>
        </Button>

        {reading ? (
          <div className="mt-1 flex flex-col gap-2">
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {Object.entries(reading.observed).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-medium tabular-nums text-foreground">{String(v)}</dd>
                </div>
              ))}
            </dl>
            {reading.assumptions.length ? (
              <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                {reading.assumptions.map((a) => <li key={a}>- {a}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <details className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
        <summary className="cursor-pointer font-medium text-foreground">Design language. Set it once</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <NumField label="Grid" value={dna.canvas.width} min={16} max={64} step={4}
            onChange={(v) => setDna({ ...dna, canvas: { width: v, height: v }, grid: { columns: v, rows: v } })} />
          <NumField label="Stroke width" value={dna.stroke.width} min={0.5} max={4} step={0.25}
            onChange={(v) => setDna({ ...dna, stroke: { ...dna.stroke, width: v } })} />
          <NumField label="Corner radius" value={dna.geometry.cornerRadius} min={0} max={8} step={0.5}
            onChange={(v) => setDna({ ...dna, geometry: { ...dna.geometry, cornerRadius: v, style: v >= 1 ? "rounded" : "sharp" } })} />
          <NumField label="Outer padding" value={dna.spacing.outerPadding} min={0} max={6} step={0.5}
            onChange={(v) => setDna({ ...dna, spacing: { ...dna.spacing, outerPadding: v } })} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          You won&apos;t be asked for these again, every icon in the family inherits them.
        </p>
      </details>

      <Button type="button" onClick={() => void create()} disabled={!name.trim()} className="self-start">
        <UiIcon name="Plus" size={16} />
        Create family
      </Button>
    </div>
  );
}

function NumField({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium text-foreground">{value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-current" />
    </label>
  );
}

/* ── Family workspace ─────────────────────────────────────────────────────── */

function FamilyWorkspace({
  family, icons, aiReady, accent, setBusy, setNotice, setError, onChanged,
}: {
  family: IconFamily;
  icons: Icon[];
  aiReady: boolean;
  accent: ImageToolProps["tool"]["accent"];
  setBusy: (s: string) => void;
  setNotice: (s: string | null) => void;
  setError: (s: string | null) => void;
  onChanged: (f: IconFamily) => Promise<void>;
}) {
  const style = accentStyle(accent);
  const [concept, setConcept] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Icon | null>(null);
  const health = React.useMemo(() => familyHealth(icons, family.dna), [icons, family.dna]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return icons;
    return icons.filter((i) =>
      [i.name, i.slug, i.description, i.category, ...i.tags].join(" ").toLowerCase().includes(q),
    );
  }, [icons, query]);

  const persist = async (added: Icon[], changelog: string) => {
    await indexedDbStore.saveIcons(added);
    const next: IconFamily = {
      ...family,
      iconCount: icons.length + added.length,
      version: bumpVersion(family.version, "minor"),
      updatedAt: new Date().toISOString(),
    };
    await indexedDbStore.saveFamily(next);
    await indexedDbStore.saveVersion({
      id: shortId("VER"), familyId: family.id, version: next.version,
      iconIds: [...icons.map((i) => i.id), ...added.map((i) => i.id)],
      dna: family.dna, changelog, createdAt: new Date().toISOString(),
    });
    await onChanged(next);
  };

  const createOne = async () => {
    const name = concept.trim();
    if (!name) return;
    setError(null); setNotice(null); setBusy(`Generating “${name}”…`);
    try {
      const out = await generateIcon(family, icons, { concept: name });
      if (!out.ok || !out.icon) {
        setError(out.reason ?? "That icon couldn't be generated.");
        return;
      }
      await persist([{ ...out.icon, status: "approved" }], `Added ${name}`);
      setConcept("");
      setNotice(
        `Added “${name}”, ${out.originality?.score}% originality, ${out.consistency?.overall}% family match` +
          (out.providerId === "ai-composer" ? ", arrangement composed by AI" : "") +
          (out.attempts > 1 ? `, after ${out.attempts} attempts (too close to an existing icon at first)` : ""),
      );
    } catch (e) {
      // persist() touches IndexedDB; a storage failure must surface, not
      // become an unhandled rejection that silently drops the icon.
      setError(e instanceof Error ? e.message : "The icon couldn't be saved.");
    } finally {
      setBusy("");
    }
  };

  const createBulk = async (names: string[], label: string) => {
    setError(null); setNotice(null);
    const results = await generateBulk(
      family, icons, names.map((n) => ({ name: n })), {},
      (p) => setBusy(`Generating ${label}: ${p.done}/${p.total}${p.current ? ` · ${p.current}` : ""}`),
    );
    setBusy("");
    const made = results.filter((r) => r.ok && r.icon).map((r) => ({ ...r.icon!, status: "approved" as const }));
    const failed = results.length - made.length;
    if (!made.length) {
      setError("None of those concepts could be generated. They may already exist in this family.");
      return;
    }
    await persist(made, `Added ${made.length} icons`);
    setNotice(
      `Added ${made.length} icon${made.length === 1 ? "" : "s"}.` +
        (failed ? ` ${failed} skipped, already in the family or not in the vocabulary.` : ""),
    );
  };

  const exportPackage = async () => {
    if (!icons.length) return;
    setBusy("Building package…");
    try {
      const blob = await buildPackage(family, icons, DEFAULT_PACKAGE_OPTIONS, (n, f) =>
        setBusy(`${n} ${Math.round(f * 100)}%`),
      );
      download(blob, `${family.slug}-icons.zip`);
      setNotice(`Package built, ${icons.length} icons as SVG, PNG, React, Vue, sprite, JSON and TypeScript.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The package couldn't be built.");
    } finally {
      setBusy("");
    }
  };

  const saveFamilyFile = async () => {
    const bundle = await exportFamily(indexedDbStore, family.id);
    download(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }), `${family.slug}-family.json`);
    setNotice("Family saved. Import this file on another machine to continue the same family there.");
  };

  const missing = VOCABULARY.filter((v) => !icons.some((i) => i.slug === v));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">{family.name}</h2>
          <p className="text-sm text-muted-foreground">
            {icons.length} icon{icons.length === 1 ? "" : "s"} · v{family.version} · {family.familyCode}
            {family.styleLocked ? " · style locked" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void saveFamilyFile()}>
            <UiIcon name="Download" size={16} />Save family
          </Button>
          <Button type="button" onClick={() => void exportPackage()} disabled={!icons.length}>
            <UiIcon name="Package" size={16} />Export package
          </Button>
        </div>
      </div>

      {/* Create */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4">
        <span className="text-sm font-medium text-foreground">Add an icon</span>
        <div className="flex flex-wrap gap-2">
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void createOne(); }}
            placeholder="mail, dashboard, security…"
            className={cn("min-w-0 flex-1 rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none", style.ring, "border-border focus-visible:ring-2")}
          />
          <Button type="button" onClick={() => void createOne()} disabled={!concept.trim()}>
            <UiIcon name="Sparkles" size={16} />Generate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Style is inherited from the family - {family.dna.canvas.width}px grid, {family.dna.stroke.width} stroke,
          radius {family.dna.geometry.cornerRadius}. You never set those per icon.
          {aiReady
            ? " Concepts outside the built-in set are arranged by AI on our server (only the name you type is sent, never your files or family) then drawn by the same renderer."
            : ""}
        </p>

        <div className="mt-1 flex flex-wrap gap-2">
          {Object.entries(CATEGORY_PRESETS).map(([cat, names]) => (
            <button key={cat} type="button"
              onClick={() => void createBulk(names.filter((n) => !icons.some((i) => i.slug === n)), cat)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50">
              + {cat} ({names.filter((n) => !icons.some((i) => i.slug === n)).length})
            </button>
          ))}
          {missing.length ? (
            <button type="button" onClick={() => void createBulk(missing, "everything available")}
              className={cn("rounded-lg border px-2.5 py-1.5 text-xs font-medium", style.border, style.soft)}>
              + All {missing.length} remaining
            </button>
          ) : null}
        </div>
      </div>

      {/* Health */}
      {icons.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-4">
          <Stat label="Family health" value={`${health.overall}%`} strong />
          <Stat label="Style" value={`${health.styleConsistency}%`} />
          <Stat label="Naming" value={`${health.namingConsistency}%`} />
          <Stat label="Originality" value={`${health.originality}%`} />
          {health.issues.length ? (
            <p className="col-span-2 text-xs text-muted-foreground sm:col-span-4">{health.issues.join(" ")}</p>
          ) : null}
        </div>
      ) : null}

      {/* Icons */}
      {icons.length > 0 ? (
        <div className="flex flex-col gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${icons.length} icons…`}
            className={cn("w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none sm:max-w-xs", style.ring, "border-border focus-visible:ring-2")}
          />
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
            {visible.map((icon) => (
              <li key={icon.id}>
                <button
                  type="button"
                  onClick={() => setSelected(selected?.id === icon.id ? null : icon)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1.5 rounded-xl border bg-card p-3 outline-none transition-colors",
                    "hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                    selected?.id === icon.id ? cn(style.border, style.soft) : "border-border",
                  )}
                >
                  <span
                    className="text-foreground [&>svg]:size-7"
                    // The SVG is produced by our own renderer from a fixed primitive
                    // set (never from user markup) so there is no untrusted input here.
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />
                  <span className="w-full truncate text-center text-[11px] text-muted-foreground" title={icon.name}>
                    {icon.favorite ? "★ " : ""}{icon.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          ) : null}

          {selected ? (
            <IconDetail
              icon={selected}
              accent={accent}
              onFavorite={async () => {
                const next = { ...selected, favorite: !selected.favorite, updatedAt: new Date().toISOString() };
                await indexedDbStore.saveIcon(next);
                setSelected(next);
                await onChanged(family);
              }}
              onDownload={() => {
                download(new Blob([selected.svg], { type: "image/svg+xml" }), `${selected.slug}.svg`);
              }}
              onReject={async (reason) => {
                // Spec §16: a rejection is remembered by the family, not just
                // deleted. The memory is what future adjustments draw on.
                await indexedDbStore.deleteIcon(selected.id);
                const next: IconFamily = {
                  ...family,
                  iconCount: Math.max(0, family.iconCount - 1),
                  memory: {
                    ...family.memory,
                    rejected: [
                      { concept: selected.name, reason: reason || undefined, at: new Date().toISOString() },
                      ...family.memory.rejected,
                    ].slice(0, 100),
                  },
                  updatedAt: new Date().toISOString(),
                };
                await indexedDbStore.saveFamily(next);
                setSelected(null);
                setNotice(`Removed “${selected.name}”. The family will remember it was rejected.`);
                await onChanged(next);
              }}
              onClose={() => setSelected(null)}
            />
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No icons yet. Add one above, or tap a category to generate a set.
        </p>
      )}
    </div>
  );
}

function IconDetail({
  icon, accent, onFavorite, onDownload, onReject, onClose,
}: {
  icon: Icon;
  accent: ImageToolProps["tool"]["accent"];
  onFavorite: () => Promise<void>;
  onDownload: () => void;
  onReject: (reason: string) => Promise<void>;
  onClose: () => void;
}) {
  const style = accentStyle(accent);
  const [confirming, setConfirming] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const aiComposed = icon.tags.includes("ai-composed");

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border p-4", style.border, style.soft)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-12 items-center justify-center rounded-xl border border-border bg-card text-foreground [&>svg]:size-8"
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{icon.name}</span>
            <span className="text-xs text-muted-foreground">
              {icon.originalityScore}% originality · {icon.consistencyScore}% family match
              {aiComposed ? " · arrangement composed by AI" : " · from the built-in vocabulary"}
            </span>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
          <UiIcon name="X" size={15} />
        </Button>
      </div>

      {confirming ? (
        <div className="flex flex-col gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why? (optional, the family remembers, e.g. “too busy”)"
            className={cn("rounded-lg border bg-card px-3 py-2 text-sm outline-none", style.ring, "border-border focus-visible:ring-2")}
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void onReject(reason.trim())}>
              <UiIcon name="Trash2" size={14} />Remove from family
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void onFavorite()}>
            <UiIcon name="Star" size={14} />{icon.favorite ? "Unfavorite" : "Favorite"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDownload}>
            <UiIcon name="Download" size={14} />SVG
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            <UiIcon name="X" size={14} />Reject
          </Button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums", strong ? "text-xl font-semibold text-foreground" : "text-base font-medium text-foreground")}>
        {value}
      </span>
    </div>
  );
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
