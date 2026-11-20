"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { makeWave } from "@/lib/svg-tools/generate";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  SegmentedControl,
  Toggle,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * A single serialisable object drives the whole tool, so undo/redo and preset
 * loading are just "swap the state". `seed` is a plain integer the re-roll walks
 * so every divider is deterministic and reproducible. Layers are stacked by
 * calling makeWave once per layer with an offset seed and an auto-tinted color.
 * ──────────────────────────────────────────────────────────────────────────── */

type FillMode = "solid" | "gradient";

interface WaveState {
  seed: number;
  width: number;
  height: number;
  waves: number;
  amplitude: number; // 0–1
  layers: number; // 1–4
  flip: boolean;
  fill: FillMode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const MIN_WAVES = 1;
const MAX_WAVES = 12;
const MIN_HEIGHT = 60;
const MAX_HEIGHT = 400;
const MIN_LAYERS = 1;
const MAX_LAYERS = 4;
const EXPORT_WIDTH = 1440;

const DEFAULT_STATE: WaveState = {
  seed: 1,
  width: EXPORT_WIDTH,
  height: 160,
  waves: 3,
  amplitude: 0.5,
  layers: 3,
  flip: false,
  fill: "solid",
  color: "#06b6d4",
  gradientFrom: "#06b6d4",
  gradientTo: "#3b82f6",
};

/** One-click starting points. Each is a fully-specified, reproducible divider. */
const PRESETS: { label: string; icon: string; state: WaveState }[] = [
  {
    label: "Layered lagoon",
    icon: "Waves",
    state: { ...DEFAULT_STATE, seed: 4, waves: 3, amplitude: 0.5, layers: 3, color: "#06b6d4" },
  },
  {
    label: "Gentle ripple",
    icon: "Minus",
    state: { ...DEFAULT_STATE, seed: 9, waves: 4, amplitude: 0.28, layers: 1, color: "#0ea5e9" },
  },
  {
    label: "Bold swell",
    icon: "Mountain",
    state: { ...DEFAULT_STATE, seed: 15, waves: 2, amplitude: 0.78, layers: 2, height: 220, color: "#6366f1" },
  },
  {
    label: "Sunset gradient",
    icon: "Sunset",
    state: {
      ...DEFAULT_STATE,
      seed: 22,
      waves: 3,
      amplitude: 0.46,
      layers: 2,
      fill: "gradient",
      gradientFrom: "#f59e0b",
      gradientTo: "#ef4444",
    },
  },
];

/** Deterministic "next seed", a small LCG step so re-roll never repeats immediately. */
function nextSeed(seed: number): number {
  return (Math.imul(seed, 1103515245) + 12345) >>> 8 || 1;
}

/* --- color helpers: tint a hex toward white so stacked layers read as depth --- */

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1] as string, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function toHex(r: number, g: number, b: number): string {
  const h = (v: number) => clampByte(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Lighten a hex color toward white by `amount` (0–1). Falls back to the input. */
function tint(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/**
 * Compose a layered wave divider. Each layer is one deterministic `makeWave`
 * call (offset seed + tinted color) whose inner markup we lift into a single
 * shared root. The root uses preserveAspectRatio="none" so the divider stretches
 * full-bleed across any section width. Back layers are the lightest tints; the
 * front (base color) layer is drawn last so it sits on top.
 */
function composeWaveSvg(s: WaveState): string {
  const total = Math.max(MIN_LAYERS, Math.min(MAX_LAYERS, s.layers));
  const bodies: string[] = [];

  for (let i = 0; i < total; i++) {
    // Layer 0 = back (lightest, tallest amplitude), last = front (base color).
    const depth = total === 1 ? 0 : i / (total - 1); // 0 back → 1 front
    const layerAmp = Math.max(0, Math.min(1, s.amplitude * (0.7 + depth * 0.3)));
    const isFront = i === total - 1;

    const useGradient = s.fill === "gradient" && isFront;
    const layerColor = useGradient ? undefined : tint(s.color, (1 - depth) * 0.55);

    const single = makeWave({
      seed: `${s.seed}:${i}`,
      width: s.width,
      height: s.height,
      waves: s.waves,
      amplitude: layerAmp,
      flip: s.flip,
      ...(useGradient
        ? { gradient: [s.gradientFrom, s.gradientTo] as [string, string] }
        : { color: layerColor }),
    });

    // Lift the inner markup (defs + path) out of makeWave's own <svg> wrapper.
    const inner = single.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
    // Gradient id "waveGrad" would collide across layers: namespace per layer.
    const namespaced = inner.replace(/waveGrad/g, `waveGrad${i}`);
    bodies.push(`<g opacity="${isFront ? 1 : 0.9}">${namespaced}</g>`);
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" ` +
    `viewBox="0 0 ${s.width} ${s.height}" preserveAspectRatio="none">` +
    bodies.join("") +
    `</svg>`
  );
}

/**
 * SVG Wave Generator, the "Generate" tool for layered section dividers. Sliders
 * for height, amplitude, wave count and layers drive per-layer `makeWave` calls
 * from the SVG engine; fill with a solid color (layers auto-tinted) or a
 * two-stop gradient, flip for top/bottom, and re-roll for a fresh silhouette.
 * Live full-bleed preview via <GeneratorCanvas> with copy, scalable SVG download
 * and a PNG export. Full undo/redo, one-click presets, and keyboard shortcuts.
 * Everything runs in-browser and is deterministic.
 */
export default function SvgWaveGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<WaveState>(DEFAULT_STATE, { debounceMs: 350 });
  const s = history.state;

  /** Patch state through history: coalesces rapid slider drags into one step. */
  const patch = React.useCallback(
    (next: Partial<WaveState>) => {
      history.set((prev) => ({ ...prev, ...next }));
    },
    [history],
  );

  const reroll = React.useCallback(() => {
    history.set((prev) => ({ ...prev, seed: nextSeed(prev.seed) }));
  }, [history]);

  const loadPreset = React.useCallback(
    (state: WaveState) => history.set(state),
    [history],
  );

  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  // The composed layered SVG, pure, deterministic, recomputed only on change.
  const svg = React.useMemo(() => composeWaveSvg(s), [s]);

  useShortcuts({
    "mod+enter": reroll,
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
    "mod+backspace": reset,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Re-roll a new wave" },
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

      {/* Height */}
      <Field
        label={`Height: ${s.height}px`}
        htmlFor="wave-height"
        hint="Depth of the divider band. Taller bands allow bigger crests."
      >
        <input
          id="wave-height"
          type="range"
          min={MIN_HEIGHT}
          max={MAX_HEIGHT}
          step={4}
          value={s.height}
          onChange={(e) => patch({ height: Number(e.target.value) })}
          aria-label="Divider height in pixels"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Amplitude */}
      <Field
        label={`Amplitude, ${Math.round(s.amplitude * 100)}%`}
        htmlFor="wave-amplitude"
        hint="How deep the crests dip. Low is a gentle ripple. High is a dramatic swell."
      >
        <input
          id="wave-amplitude"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(s.amplitude * 100)}
          onChange={(e) => patch({ amplitude: Number(e.target.value) / 100 })}
          aria-label="Wave amplitude"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Wave count */}
      <Field
        label={`Wave count, ${s.waves} ${s.waves === 1 ? "crest" : "crests"}`}
        htmlFor="wave-count"
        hint="How many crests span the full width. Low = long lazy curves. High = tight ripple."
      >
        <input
          id="wave-count"
          type="range"
          min={MIN_WAVES}
          max={MAX_WAVES}
          step={1}
          value={s.waves}
          onChange={(e) => patch({ waves: Number(e.target.value) })}
          aria-label="Number of wave crests"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Layers */}
      <Field
        label={`Layers: ${s.layers}`}
        htmlFor="wave-layers"
        hint="Stack offset, auto-tinted waves for a parallax look. 1 = a single clean seam."
      >
        <input
          id="wave-layers"
          type="range"
          min={MIN_LAYERS}
          max={MAX_LAYERS}
          step={1}
          value={s.layers}
          onChange={(e) => patch({ layers: Number(e.target.value) })}
          aria-label="Number of stacked layers"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Flip */}
      <Field label="Orientation" htmlFor="wave-flip" hint="Flip vertically for the top vs bottom of a section.">
        <Toggle
          checked={s.flip}
          onChange={(flip) => patch({ flip })}
          label={s.flip ? "Flipped (top of section)" : "Default (bottom of section)"}
        />
      </Field>

      {/* Fill mode */}
      <Field label="Fill" htmlFor="wave-fill">
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
        <Field label="Color" htmlFor="wave-color" hint="Back layers are auto-tinted lighter for depth.">
          <ColorInput
            id="wave-color"
            value={s.color}
            onChange={(color) => patch({ color })}
            ringClass={style.ring}
          />
        </Field>
      ) : (
        <div className="flex flex-wrap gap-4">
          <Field label="From" htmlFor="wave-grad-from">
            <ColorInput
              id="wave-grad-from"
              value={s.gradientFrom}
              onChange={(gradientFrom) => patch({ gradientFrom })}
              ringClass={style.ring}
            />
          </Field>
          <Field label="To" htmlFor="wave-grad-to">
            <ColorInput
              id="wave-grad-to"
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
          The divider is authored full-bleed (
          <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">
            preserveAspectRatio=&quot;none&quot;
          </code>
          ) from a reproducible seed (
          <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">
            {s.seed}
          </code>
          ). Set <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">width:100%</code> to stretch it across a section.
        </span>
      </p>
    </div>
  );

  return (
    <GeneratorCanvas
      svg={svg}
      controls={controls}
      controlsTitle="Wave controls"
      filename="wave-divider-gigai"
      pngScale={2}
      pngBackground="#ffffff"
      onRandomize={reroll}
      onReset={reset}
      previewMinHeight={360}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Color input: a swatch + hex text field kept in sync, a11y-labelled.
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
