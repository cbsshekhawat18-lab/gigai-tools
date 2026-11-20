"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { makeBlob } from "@/lib/svg-tools/generate";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  SegmentedControl,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * A single serialisable object drives the whole tool, so undo/redo and preset
 * loading are just "swap the state". `seed` is a plain integer the re-roll walks
 * so any blob is deterministic and reproducible.
 * ──────────────────────────────────────────────────────────────────────────── */

type FillMode = "solid" | "gradient";

interface BlobState {
  seed: number;
  complexity: number;
  contrast: number;
  size: number;
  fill: FillMode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  /** Angular asymmetry 0–1 (optional; older presets default to 0.5). */
  jitter?: number;
  /** Axis elongation -0.4..0.4 (optional; defaults to 0). */
  stretch?: number;
}

const MIN_COMPLEXITY = 3;
const MAX_COMPLEXITY = 16;
const MIN_SIZE = 128;
const MAX_SIZE = 1024;

const DEFAULT_STATE: BlobState = {
  seed: 1,
  complexity: 6,
  contrast: 0.42,
  size: 512,
  fill: "gradient",
  color: "#8b5cf6",
  gradientFrom: "#8b5cf6",
  gradientTo: "#ec4899",
  jitter: 0.5,
  stretch: 0,
};

/** One-click starting points. Each is a fully-specified, reproducible blob. */
const PRESETS: { label: string; icon: string; state: BlobState }[] = [
  {
    label: "Grape soda",
    icon: "Sparkles",
    state: {
      seed: 3,
      complexity: 6,
      contrast: 0.42,
      size: 512,
      fill: "gradient",
      color: "#8b5cf6",
      gradientFrom: "#8b5cf6",
      gradientTo: "#ec4899",
    },
  },
  {
    label: "Ocean",
    icon: "Droplet",
    state: {
      seed: 12,
      complexity: 7,
      contrast: 0.5,
      size: 512,
      fill: "gradient",
      color: "#0ea5e9",
      gradientFrom: "#0ea5e9",
      gradientTo: "#22d3ee",
    },
  },
  {
    label: "Sunrise",
    icon: "Sun",
    state: {
      seed: 21,
      complexity: 5,
      contrast: 0.36,
      size: 512,
      fill: "gradient",
      color: "#f59e0b",
      gradientFrom: "#f59e0b",
      gradientTo: "#ef4444",
    },
  },
  {
    label: "Mint solid",
    icon: "Leaf",
    state: {
      seed: 8,
      complexity: 8,
      contrast: 0.3,
      size: 512,
      fill: "solid",
      color: "#10b981",
      gradientFrom: "#10b981",
      gradientTo: "#2dd4bf",
    },
  },
];

/** Deterministic "next seed", a small LCG step so re-roll never repeats immediately. */
function nextSeed(seed: number): number {
  return (Math.imul(seed, 1103515245) + 12345) >>> 8 || 1;
}

/**
 * SVG Blob Generator, the flagship "Generate" tool. Three sliders (complexity,
 * contrast, size) plus a seeded re-roll drive `makeBlob` from the SVG engine;
 * fill with a solid color or a two-stop gradient; live big preview via
 * <GeneratorCanvas> with copy, scalable SVG download and a transparent PNG
 * export. Full undo/redo across every shape and color, one-click presets, and
 * keyboard shortcuts. Everything runs in-browser and is deterministic.
 */
export default function SvgBlobGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<BlobState>(DEFAULT_STATE, { debounceMs: 350 });
  const s = history.state;

  /** Patch state through history, coalesces rapid slider drags into one step. */
  const patch = React.useCallback(
    (next: Partial<BlobState>) => {
      history.set((prev) => ({ ...prev, ...next }));
    },
    [history],
  );

  const reroll = React.useCallback(() => {
    history.set((prev) => ({ ...prev, seed: nextSeed(prev.seed) }));
  }, [history]);

  const loadPreset = React.useCallback(
    (state: BlobState) => history.set(state),
    [history],
  );

  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  // ── Package (collect shapes → download as a ZIP for your app/site) ────────
  const [pkg, setPkg] = React.useState<{ id: string; svg: string }[]>([]);
  const addToPackage = React.useCallback((svgStr: string) => {
    setPkg((prev) =>
      prev.length >= 60
        ? prev
        : [...prev, { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, svg: svgStr }],
    );
  }, []);
  const removeFromPackage = React.useCallback(
    (id: string) => setPkg((prev) => prev.filter((p) => p.id !== id)),
    [],
  );
  const clearPackage = React.useCallback(() => setPkg([]), []);
  const downloadPackage = React.useCallback(async () => {
    if (pkg.length === 0) return;
    const { zip } = await import("fflate");
    const entries: Record<string, [Uint8Array, { level: 0 | 6 }]> = {};
    pkg.forEach((it, i) => {
      entries[`blob-${String(i + 1).padStart(2, "0")}.svg`] = [new TextEncoder().encode(it.svg), { level: 6 }];
    });
    const data = await new Promise<Uint8Array>((res, rej) =>
      zip(entries, (e, d) => (e ? rej(e) : res(d))),
    );
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    const url = URL.createObjectURL(new Blob([copy], { type: "application/zip" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "gigai-blobs.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [pkg]);

  // The generated SVG: pure, deterministic, recomputed only when inputs change.
  const svg = React.useMemo(
    () =>
      makeBlob({
        seed: s.seed,
        complexity: s.complexity,
        contrast: s.contrast,
        jitter: s.jitter ?? 0.5,
        stretch: s.stretch ?? 0,
        size: s.size,
        ...(s.fill === "gradient"
          ? { gradient: [s.gradientFrom, s.gradientTo] as [string, string] }
          : { color: s.color }),
      }),
    [s.seed, s.complexity, s.contrast, s.jitter, s.stretch, s.size, s.fill, s.color, s.gradientFrom, s.gradientTo],
  );

  useShortcuts({
    "mod+enter": reroll,
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
    "mod+backspace": reset,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Re-roll a new blob" },
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "mod+backspace", description: "Reset to default" },
  ];

  const controls = (
    <div className="flex flex-col gap-5">
      {/* Presets */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Presets</span>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => loadPreset(p.state)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name={p.icon} size={13} className={style.text} />
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <Field
        label={`Complexity: ${s.complexity} lobes`}
        htmlFor="blob-complexity"
        hint="How many anchor points ring the blob. More points = busier silhouette."
      >
        <input
          id="blob-complexity"
          type="range"
          min={MIN_COMPLEXITY}
          max={MAX_COMPLEXITY}
          step={1}
          value={s.complexity}
          onChange={(e) => patch({ complexity: Number(e.target.value) })}
          aria-label="Blob complexity"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Contrast */}
      <Field
        label={`Contrast: ${Math.round(s.contrast * 100)}%`}
        htmlFor="blob-contrast"
        hint="Edge irregularity. 0% is a smooth circle. Higher is more organic and gooey."
      >
        <input
          id="blob-contrast"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(s.contrast * 100)}
          onChange={(e) => patch({ contrast: Number(e.target.value) / 100 })}
          aria-label="Blob edge contrast"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Asymmetry (jitter) */}
      <Field
        label={`Asymmetry, ${Math.round((s.jitter ?? 0.5) * 100)}%`}
        htmlFor="blob-jitter"
        hint="How lopsided the shape is. 0% is evenly balanced. Higher makes each blob a unique, organic silhouette."
      >
        <input
          id="blob-jitter"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round((s.jitter ?? 0.5) * 100)}
          onChange={(e) => patch({ jitter: Number(e.target.value) / 100 })}
          aria-label="Blob asymmetry"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Stretch */}
      <Field
        label={`Stretch, ${(s.stretch ?? 0) > 0 ? "wide " : (s.stretch ?? 0) < 0 ? "tall " : ""}${Math.round(Math.abs(s.stretch ?? 0) * 100)}%`}
        htmlFor="blob-stretch"
        hint="Elongate the shape, left for tall, right for wide."
      >
        <input
          id="blob-stretch"
          type="range"
          min={-40}
          max={40}
          step={1}
          value={Math.round((s.stretch ?? 0) * 100)}
          onChange={(e) => patch({ stretch: Number(e.target.value) / 100 })}
          aria-label="Blob stretch"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Size */}
      <Field
        label={`Size, ${s.size}px`}
        htmlFor="blob-size"
        hint="Export dimensions of the square viewBox (also seeds the PNG resolution)."
      >
        <input
          id="blob-size"
          type="range"
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={16}
          value={s.size}
          onChange={(e) => patch({ size: Number(e.target.value) })}
          aria-label="Blob size in pixels"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Fill mode */}
      <Field label="Fill" htmlFor="blob-fill">
        <SegmentedControl<FillMode>
          value={s.fill}
          onChange={(fill) => patch({ fill })}
          size="sm"
          ariaLabel="Fill mode"
          options={[
            { value: "solid", label: "Solid", icon: "Square" },
            { value: "gradient", label: "Gradient", icon: "Blend" },
          ]}
        />
      </Field>

      {/* Colors */}
      {s.fill === "solid" ? (
        <Field label="Color" htmlFor="blob-color">
          <ColorInput
            id="blob-color"
            value={s.color}
            onChange={(color) => patch({ color })}
            ringClass={style.ring}
          />
        </Field>
      ) : (
        <div className="flex flex-wrap gap-4">
          <Field label="From" htmlFor="blob-grad-from">
            <ColorInput
              id="blob-grad-from"
              value={s.gradientFrom}
              onChange={(gradientFrom) => patch({ gradientFrom })}
              ringClass={style.ring}
            />
          </Field>
          <Field label="To" htmlFor="blob-grad-to">
            <ColorInput
              id="blob-grad-to"
              value={s.gradientTo}
              onChange={(gradientTo) => patch({ gradientTo })}
              ringClass={style.ring}
            />
          </Field>
        </div>
      )}

      {/* Undo / redo + shortcuts */}
      <div className="flex items-center gap-1.5 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => history.undo()}
          disabled={!history.canUndo}
          aria-label="Undo"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="Undo2" size={14} />
          Undo
        </button>
        <button
          type="button"
          onClick={() => history.redo()}
          disabled={!history.canRedo}
          aria-label="Redo"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="Redo2" size={14} />
          Redo
        </button>
        <div className="ml-auto">
          <ShortcutsHelp shortcuts={shortcuts} />
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Every blob is generated from a reproducible seed (
          <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">
            {s.seed}
          </code>
          ). The same seed and sliders always regenerate the exact same shape.
        </span>
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <GeneratorCanvas
          svg={svg}
          controls={controls}
          controlsTitle="Blob controls"
          filename="blob-gigai"
          pngScale={2}
          onRandomize={reroll}
          onReset={reset}
          previewMinHeight={420}
        />
        <button
          type="button"
          onClick={() => addToPackage(svg)}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Plus" size={15} className={style.text} />
          Add this blob to your package
        </button>
      </div>

      <ShapeGallery
        fillMode={s.fill}
        color={s.color}
        gradient={[s.gradientFrom, s.gradientTo]}
        accentText={style.text}
        currentSvg={svg}
        onPick={(preset) => patch(preset)}
        onAdd={addToPackage}
      />

      <PackageTray
        items={pkg}
        onRemove={removeFromPackage}
        onClear={clearPackage}
        onDownload={downloadPackage}
        accentText={style.text}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Shape gallery, hundreds of ready-made blobs across styles. Each is generated
 * with the SAME engine (makeBlob) from a style's complexity/contrast + a seed,
 * tinted with the user's current color, so the grid feels like one library.
 * Click to load into the editor; ＋ adds it straight to the package.
 * ──────────────────────────────────────────────────────────────────────────── */

interface GalleryStyle {
  key: string;
  label: string;
  /** Lobe-count range. */
  cMin: number;
  cMax: number;
  /** Spikiness range. */
  ctMin: number;
  ctMax: number;
  /** Asymmetry range. */
  jMin: number;
  jMax: number;
  /** Max elongation magnitude. */
  stretch: number;
}

// Each style spans RANGES, so every seed within it is a genuinely different
// silhouette, round pebbles, lopsided organics, wavy amoebas, spiky stars.
const GALLERY_STYLES: GalleryStyle[] = [
  { key: "smooth", label: "Smooth", cMin: 4, cMax: 6, ctMin: 0.1, ctMax: 0.24, jMin: 0.1, jMax: 0.35, stretch: 0.28 },
  { key: "rounded", label: "Rounded", cMin: 5, cMax: 8, ctMin: 0.2, ctMax: 0.4, jMin: 0.3, jMax: 0.6, stretch: 0.3 },
  { key: "organic", label: "Organic", cMin: 6, cMax: 10, ctMin: 0.35, ctMax: 0.55, jMin: 0.5, jMax: 0.9, stretch: 0.36 },
  { key: "wavy", label: "Wavy", cMin: 9, cMax: 14, ctMin: 0.3, ctMax: 0.52, jMin: 0.45, jMax: 0.8, stretch: 0.3 },
  { key: "spiky", label: "Spiky", cMin: 7, cMax: 11, ctMin: 0.6, ctMax: 0.85, jMin: 0.35, jMax: 0.65, stretch: 0.26 },
  { key: "wild", label: "Wild", cMin: 10, cMax: 16, ctMin: 0.62, ctMax: 0.9, jMin: 0.7, jMax: 1, stretch: 0.4 },
];

const SEEDS_PER_STYLE = 100; // 6 styles × 100 = 600 distinct shapes
const PAGE = 42;

interface GalleryItem {
  id: string;
  seed: number;
  complexity: number;
  contrast: number;
  jitter: number;
  stretch: number;
}

/** Deterministic 0..1 hash of a seed + salt (so each shape's params are stable). */
function hash01(n: number, salt: number): number {
  let x = (n * 2654435761 + salt * 40503 + 101) >>> 0;
  x ^= x >>> 15;
  x = (x * 2246822519) >>> 0;
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Derive a UNIQUE, diverse param set for a (style, seed) pair. */
function itemParams(st: GalleryStyle, seed: number): GalleryItem {
  const complexity = Math.round(lerp(st.cMin, st.cMax, hash01(seed, 1)));
  const contrast = +lerp(st.ctMin, st.ctMax, hash01(seed, 2)).toFixed(2);
  const jitter = +lerp(st.jMin, st.jMax, hash01(seed, 3)).toFixed(2);
  const stretch = +((hash01(seed, 4) - 0.5) * st.stretch).toFixed(2);
  return { id: `${st.key}-${seed}`, seed, complexity, contrast, jitter, stretch };
}

/** Build the item list for a category ("all" interleaves the styles). */
function buildItems(category: string): GalleryItem[] {
  const out: GalleryItem[] = [];
  if (category === "all") {
    for (let seed = 1; seed <= SEEDS_PER_STYLE; seed++) {
      for (const st of GALLERY_STYLES) out.push(itemParams(st, seed));
    }
  } else {
    const st = GALLERY_STYLES.find((x) => x.key === category) ?? GALLERY_STYLES[0]!;
    for (let seed = 1; seed <= SEEDS_PER_STYLE; seed++) out.push(itemParams(st, seed));
  }
  return out;
}

function ShapeGallery({
  fillMode,
  color,
  gradient,
  accentText,
  currentSvg,
  onPick,
  onAdd,
}: {
  fillMode: FillMode;
  color: string;
  gradient: [string, string];
  accentText: string;
  /** The editor's current blob SVG: shown as a "your selection" preview. */
  currentSvg: string;
  onPick: (preset: { seed: number; complexity: number; contrast: number; jitter: number; stretch: number }) => void;
  onAdd: (svg: string) => void;
}) {
  const [category, setCategory] = React.useState("all");
  const [visible, setVisible] = React.useState(PAGE);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const items = React.useMemo(() => buildItems(category), [category]);
  const total = category === "all" ? SEEDS_PER_STYLE * GALLERY_STYLES.length : SEEDS_PER_STYLE;

  React.useEffect(() => setVisible(PAGE), [category]);

  const fillOpts = fillMode === "gradient" ? { gradient } : { color };

  const pick = (it: GalleryItem) => {
    setSelectedId(it.id);
    onPick(it);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon name="Shapes" size={16} className={accentText} />
            Shape library - {total.toLocaleString()}+ unique blobs
          </h3>
          <p className="text-xs text-muted-foreground">Every shape is different. Click one to load it above, or ＋ add it to your package.</p>
        </div>
        {/* Current selection preview - so you always see what's active */}
        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.05] px-3 py-1.5">
          <span className="size-9 shrink-0 [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: currentSvg }} />
          <span className="text-[11px] font-medium leading-tight text-muted-foreground">Your<br />selection</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[{ key: "all", label: "All" }, ...GALLERY_STYLES].map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === c.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
        {items.slice(0, visible).map((it) => {
          const opts = { seed: it.seed, complexity: it.complexity, contrast: it.contrast, jitter: it.jitter, stretch: it.stretch };
          const thumb = makeBlob({ ...opts, size: 120, ...fillOpts });
          const active = selectedId === it.id;
          return (
            <div
              key={it.id}
              className={cn(
                "group relative aspect-square rounded-xl border bg-background/50 p-2 transition-all",
                active ? "border-primary ring-2 ring-primary" : "border-border/60 hover:border-primary/40",
              )}
            >
              <button
                type="button"
                onClick={() => pick(it)}
                aria-label="Use this shape"
                aria-pressed={active}
                className="block size-full [&>svg]:size-full"
                dangerouslySetInnerHTML={{ __html: thumb }}
              />
              {active ? (
                <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Icon name="Check" size={12} />
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onAdd(makeBlob({ ...opts, size: 512, ...fillOpts }))}
                aria-label="Add to package"
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Icon name="Plus" size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {visible < items.length ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setVisible((v) => Math.min(v + PAGE, items.length))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Icon name="ChevronDown" size={15} /> Show more shapes
          </button>
          <span className="text-xs text-muted-foreground">Showing {Math.min(visible, items.length)} of {items.length.toLocaleString()}</span>
        </div>
      ) : null}
    </section>
  );
}

/* ── Package tray: the user's collected shapes, downloadable as a ZIP ─────── */

function PackageTray({
  items,
  onRemove,
  onClear,
  onDownload,
  accentText,
}: {
  items: { id: string; svg: string }[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onDownload: () => void;
  accentText: string;
}) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
        <Icon name="Package" size={22} className="mx-auto text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">Build your own blob package</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          Add shapes from the library above (＋) and download them all as a ready-to-use set of SVGs for your app, website or design.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="Package" size={16} className={accentText} />
          Your package - {items.length} shape{items.length === 1 ? "" : "s"}
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={onClear} className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent">
            Clear
          </button>
          <button type="button" onClick={onDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Icon name="Download" size={15} /> Download .zip
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((it) => (
          <div key={it.id} className="group relative size-16 rounded-lg border border-border bg-background p-1.5 [&>span>svg]:size-full">
            <span className="block size-full" dangerouslySetInnerHTML={{ __html: it.svg }} />
            <button
              type="button"
              onClick={() => onRemove(it.id)}
              aria-label="Remove"
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-foreground"
            >
              <Icon name="X" size={12} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Color input, a swatch + hex text field kept in sync, a11y-labelled.
 * ──────────────────────────────────────────────────────────────────────────── */

function ColorInput({
  id,
  value,
  onChange,
  ringClass,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  ringClass: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${id} color picker`}
        className="h-8 w-10 cursor-pointer rounded-md border border-border bg-background p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        aria-label={`${id} hex value`}
        className={cn(
          "h-8 w-24 rounded-md border border-border bg-background px-2 font-mono text-xs uppercase text-foreground outline-none focus-visible:ring-2",
          ringClass,
        )}
      />
    </div>
  );
}
