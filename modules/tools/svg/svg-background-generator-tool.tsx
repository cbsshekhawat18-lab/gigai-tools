"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { svgToDataUri } from "@/lib/svg-tools/convert";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  SegmentedControl,
  SelectField,
  CopyButton,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * A single serialisable object drives the whole tool, so undo/redo and preset
 * loading are just "swap the state". `seed` is a plain integer the re-roll walks
 * so every layout is deterministic and reproducible.
 * ──────────────────────────────────────────────────────────────────────────── */

type BgStyle = "mesh" | "dots" | "grid" | "waves" | "blobs";
type RatioKey = "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "21:9";

interface BgState {
  seed: number;
  style: BgStyle;
  ratio: RatioKey;
  from: string;
  to: string;
  accent: string;
  opacity: number; // texture/accent opacity 0..1
  density: number; // 1..10, meaning depends on style
}

const RATIOS: Record<RatioKey, { w: number; h: number }> = {
  "16:9": { w: 1600, h: 900 },
  "4:3": { w: 1600, h: 1200 },
  "1:1": { w: 1200, h: 1200 },
  "3:4": { w: 1200, h: 1600 },
  "9:16": { w: 900, h: 1600 },
  "21:9": { w: 1680, h: 720 },
};

const DEFAULT_STATE: BgState = {
  seed: 7,
  style: "mesh",
  ratio: "16:9",
  from: "#4f46e5",
  to: "#0ea5e9",
  accent: "#ec4899",
  opacity: 0.55,
  density: 4,
};

/** One-click starting points; each is a fully-specified, reproducible layout. */
const PRESETS: { label: string; icon: string; state: BgState }[] = [
  {
    label: "Aurora mesh",
    icon: "Sparkles",
    state: { seed: 7, style: "mesh", ratio: "16:9", from: "#4f46e5", to: "#0ea5e9", accent: "#ec4899", opacity: 0.55, density: 4 },
  },
  {
    label: "Dot grid",
    icon: "Grid2x2",
    state: { seed: 3, style: "dots", ratio: "16:9", from: "#0f172a", to: "#1e293b", accent: "#6366f1", opacity: 0.18, density: 6 },
  },
  {
    label: "Blueprint",
    icon: "Grid3x3",
    state: { seed: 5, style: "grid", ratio: "16:9", from: "#0b1220", to: "#111c33", accent: "#38bdf8", opacity: 0.16, density: 5 },
  },
  {
    label: "Ocean waves",
    icon: "Waves",
    state: { seed: 11, style: "waves", ratio: "21:9", from: "#0369a1", to: "#0ea5e9", accent: "#22d3ee", opacity: 0.7, density: 4 },
  },
  {
    label: "Blob field",
    icon: "Blend",
    state: { seed: 9, style: "blobs", ratio: "1:1", from: "#7c3aed", to: "#db2777", accent: "#f59e0b", opacity: 0.6, density: 5 },
  },
  {
    label: "Sunset",
    icon: "Sun",
    state: { seed: 21, style: "mesh", ratio: "16:9", from: "#f59e0b", to: "#ef4444", accent: "#8b5cf6", opacity: 0.6, density: 5 },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Deterministic PRNG (mulberry32). Keeps every layout reproducible from `seed`.
 * ──────────────────────────────────────────────────────────────────────────── */

function makeRng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic "next seed" so re-roll never repeats immediately. */
function nextSeed(seed: number): number {
  return (Math.imul(seed, 1103515245) + 12345) >>> 8 || 1;
}

const r2 = (v: number) => Math.round(v * 100) / 100;
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/* ────────────────────────────────────────────────────────────────────────────
 * Layer builders, each returns SVG body markup drawn against a shared
 * `width × height` viewBox so mesh/dots/grid/waves/blobs all render full-bleed
 * at the chosen aspect ratio (unlike the tile-sized engine pattern helper).
 * ──────────────────────────────────────────────────────────────────────────── */

function buildBackground(s: BgState): string {
  const { w, h } = RATIOS[s.ratio];
  const rng = makeRng(s.seed);
  const gradId = "bgGrad";
  const blurId = "bgBlur";

  const defs: string[] = [
    `<linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0%" stop-color="${esc(s.from)}"/>` +
      `<stop offset="100%" stop-color="${esc(s.to)}"/></linearGradient>`,
  ];

  const layers: string[] = [`<rect width="${w}" height="${h}" fill="url(#${gradId})"/>`];

  if (s.style === "mesh") {
    defs.push(
      `<filter id="${blurId}" x="-30%" y="-30%" width="160%" height="160%">` +
        `<feGaussianBlur stdDeviation="${r2(Math.min(w, h) * 0.09)}"/></filter>`,
    );
    const orbs = 2 + Math.round((s.density / 10) * 5); // 2..7
    let body = "";
    for (let i = 0; i < orbs; i++) {
      const cx = r2(rng() * w);
      const cy = r2(rng() * h);
      const rad = r2((0.18 + rng() * 0.22) * Math.min(w, h));
      const col = i % 2 === 0 ? s.accent : s.to;
      body += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${esc(col)}" opacity="${r2(s.opacity)}"/>`;
    }
    layers.push(`<g filter="url(#${blurId})">${body}</g>`);
  } else if (s.style === "dots") {
    const gap = 90 - s.density * 6; // denser = smaller gap
    const patId = "bgDots";
    defs.push(
      `<pattern id="${patId}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">` +
        `<circle cx="${r2(gap / 2)}" cy="${r2(gap / 2)}" r="${r2(gap * 0.11)}" fill="${esc(s.accent)}"/></pattern>`,
    );
    layers.push(`<rect width="${w}" height="${h}" fill="url(#${patId})" opacity="${r2(s.opacity)}"/>`);
  } else if (s.style === "grid") {
    const gap = 110 - s.density * 8;
    const patId = "bgGrid";
    defs.push(
      `<pattern id="${patId}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse">` +
        `<path d="M ${gap} 0 L 0 0 0 ${gap}" fill="none" stroke="${esc(s.accent)}" stroke-width="1.25"/></pattern>`,
    );
    layers.push(`<rect width="${w}" height="${h}" fill="url(#${patId})" opacity="${r2(s.opacity)}"/>`);
  } else if (s.style === "waves") {
    const bands = 2 + Math.round((s.density / 10) * 3); // 2..5
    let body = "";
    for (let b = 0; b < bands; b++) {
      const baseY = h * (0.45 + b * 0.14);
      const amp = h * (0.05 + rng() * 0.06);
      const segs = 5;
      const step = w / segs;
      let d = `M 0 ${r2(baseY)}`;
      for (let i = 0; i < segs; i++) {
        const x2 = step * (i + 1);
        const cx = step * (i + 0.5);
        const dir = i % 2 === 0 ? -1 : 1;
        d += ` Q ${r2(cx)} ${r2(baseY + dir * amp)} ${r2(x2)} ${r2(baseY)}`;
      }
      d += ` L ${w} ${h} L 0 ${h} Z`;
      const col = b % 2 === 0 ? s.accent : s.to;
      const op = r2(s.opacity * (0.5 + b * 0.16));
      body += `<path d="${d}" fill="${esc(col)}" opacity="${Math.min(1, op)}"/>`;
    }
    layers.push(body);
  } else {
    // blobs
    const count = 3 + Math.round((s.density / 10) * 5); // 3..8
    let body = "";
    for (let i = 0; i < count; i++) {
      const cx = r2(rng() * w);
      const cy = r2(rng() * h);
      const rad = r2((0.1 + rng() * 0.18) * Math.min(w, h));
      const pts = 6;
      const step = (Math.PI * 2) / pts;
      const coords: [number, number][] = [];
      for (let p = 0; p < pts; p++) {
        const rr = rad * (0.7 + rng() * 0.6);
        coords.push([cx + Math.cos(p * step) * rr, cy + Math.sin(p * step) * rr]);
      }
      let d = `M ${r2(coords[0]![0])} ${r2(coords[0]![1])}`;
      for (let p = 0; p < pts; p++) {
        const cur = coords[p]!;
        const nxt = coords[(p + 1) % pts]!;
        const mx = (cur[0] + nxt[0]) / 2;
        const my = (cur[1] + nxt[1]) / 2;
        d += ` Q ${r2(cur[0])} ${r2(cur[1])} ${r2(mx)} ${r2(my)}`;
      }
      d += " Z";
      const col = i % 3 === 0 ? s.accent : i % 3 === 1 ? s.to : s.from;
      body += `<path d="${d}" fill="${esc(col)}" opacity="${r2(s.opacity)}"/>`;
    }
    layers.push(body);
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ` +
    `fill="none" role="img" aria-label="Generated background">` +
    `<defs>${defs.join("")}</defs>${layers.join("")}</svg>`
  );
}

/**
 * SVG Background Generator, a "Generate" tool. Five styles (mesh, dots, grid,
 * waves, blobs) render full-bleed against a shared viewBox at the chosen aspect
 * ratio; two brand colors plus accent, opacity and density drive the look, and
 * a seeded re-roll keeps every layout reproducible. Live preview via
 * <GeneratorCanvas> with copy SVG, a copy-ready CSS background-image snippet,
 * scalable SVG download and PNG export. Full undo/redo, presets and shortcuts.
 */
export default function SvgBackgroundGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<BgState>(DEFAULT_STATE, { debounceMs: 300 });
  const s = history.state;

  const patch = React.useCallback(
    (next: Partial<BgState>) => history.set((prev) => ({ ...prev, ...next })),
    [history],
  );
  const reroll = React.useCallback(
    () => history.set((prev) => ({ ...prev, seed: nextSeed(prev.seed) })),
    [history],
  );
  const loadPreset = React.useCallback((state: BgState) => history.set(state), [history]);
  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  const svg = React.useMemo(() => buildBackground(s), [s]);

  const cssSnippet = React.useMemo(() => {
    const uri = svgToDataUri(svg, { encoding: "url-optimized" });
    const value = uri.ok ? uri.result : "";
    return (
      `.hero {\n` +
      `  background-image: url("${value}");\n` +
      `  background-size: cover;\n` +
      `  background-position: center;\n` +
      `}`
    );
  }, [svg]);

  const dims = RATIOS[s.ratio];

  useShortcuts({
    "mod+enter": reroll,
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
    "mod+backspace": reset,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Re-roll a new layout" },
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

      {/* Style */}
      <Field label="Style" htmlFor="bg-style">
        <SegmentedControl<BgStyle>
          value={s.style}
          onChange={(style) => patch({ style })}
          size="sm"
          ariaLabel="Background style"
          options={[
            { value: "mesh", label: "Mesh", icon: "Sparkles" },
            { value: "dots", label: "Dots", icon: "Grid2x2" },
            { value: "grid", label: "Grid", icon: "Grid3x3" },
            { value: "waves", label: "Waves", icon: "Waves" },
            { value: "blobs", label: "Blobs", icon: "Blend" },
          ]}
        />
      </Field>

      {/* Aspect ratio */}
      <Field label="Aspect ratio" htmlFor="bg-ratio" hint={`Output ${dims.w}×${dims.h} viewBox, scales to fill any container.`}>
        <SelectField<RatioKey>
          value={s.ratio}
          onChange={(ratio) => patch({ ratio })}
          options={[
            { value: "16:9", label: "16:9: wide hero" },
            { value: "21:9", label: "21:9, ultrawide banner" },
            { value: "4:3", label: "4:3, classic" },
            { value: "1:1", label: "1:1, square card" },
            { value: "3:4", label: "3:4: portrait" },
            { value: "9:16", label: "9:16: mobile splash" },
          ]}
        />
      </Field>

      {/* Colors */}
      <div className="flex flex-wrap gap-4">
        <Field label="From" htmlFor="bg-from">
          <ColorInput id="bg-from" value={s.from} onChange={(from) => patch({ from })} ringClass={style.ring} />
        </Field>
        <Field label="To" htmlFor="bg-to">
          <ColorInput id="bg-to" value={s.to} onChange={(to) => patch({ to })} ringClass={style.ring} />
        </Field>
        <Field label="Accent" htmlFor="bg-accent">
          <ColorInput id="bg-accent" value={s.accent} onChange={(accent) => patch({ accent })} ringClass={style.ring} />
        </Field>
      </div>

      {/* Opacity */}
      <Field
        label={`Texture opacity, ${Math.round(s.opacity * 100)}%`}
        htmlFor="bg-opacity"
        hint="How strongly the pattern, orbs or shapes read over the base gradient."
      >
        <input
          id="bg-opacity"
          type="range"
          min={5}
          max={100}
          step={1}
          value={Math.round(s.opacity * 100)}
          onChange={(e) => patch({ opacity: Number(e.target.value) / 100 })}
          aria-label="Texture opacity"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Density */}
      <Field
        label={`Density, ${s.density}`}
        htmlFor="bg-density"
        hint="How busy the layout is: more orbs, tighter pattern, or more shapes."
      >
        <input
          id="bg-density"
          type="range"
          min={1}
          max={10}
          step={1}
          value={s.density}
          onChange={(e) => patch({ density: Number(e.target.value) })}
          aria-label="Layout density"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

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

      {/* CSS snippet */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">CSS background</span>
          <CopyButton getValue={() => cssSnippet} label="Copy CSS" />
        </div>
        <pre className="max-h-32 overflow-auto rounded-md border border-border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed text-foreground">
          <code>{cssSnippet}</code>
        </pre>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Every background is generated from a reproducible seed (
          <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">{s.seed}</code>). The same
          seed and settings always regenerate the exact same layout.
        </span>
      </p>
    </div>
  );

  return (
    <GeneratorCanvas
      svg={svg}
      controls={controls}
      controlsTitle="Background controls"
      filename="background-gigai"
      pngSize={{ width: dims.w, height: dims.h }}
      onRandomize={reroll}
      onReset={reset}
      previewMinHeight={420}
    />
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
