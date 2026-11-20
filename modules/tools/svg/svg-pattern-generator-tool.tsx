"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { makePattern, type PatternType } from "@/lib/svg-tools/generate";
import { svgToDataUri } from "@/lib/svg-tools/convert";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  SegmentedControl,
  CopyButton,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * A single serialisable object drives the whole tool, so undo/redo and preset
 * loading are just "swap the state". Every field maps to a `makePattern` option,
 * so the output is fully deterministic and reproducible from the settings alone.
 * ──────────────────────────────────────────────────────────────────────────── */

interface PatternState {
  type: PatternType;
  scale: number;
  strokeWidth: number;
  color: string;
  useBackground: boolean;
  background: string;
}

const MIN_SCALE = 12;
const MAX_SCALE = 96;
const MIN_STROKE = 0.5;
const MAX_STROKE = 8;

/** Tiles whose visible weight is driven by stroke (line-based, not filled). */
const STROKE_TILES: ReadonlySet<PatternType> = new Set<PatternType>([
  "grid",
  "lines",
  "cross",
  "chevron",
  "circles",
]);

const TILE_OPTIONS: { value: PatternType; label: string; icon: string }[] = [
  { value: "dots", label: "Dots", icon: "MoreHorizontal" },
  { value: "grid", label: "Grid", icon: "Grid3x3" },
  { value: "lines", label: "Lines", icon: "Slash" },
  { value: "cross", label: "Cross", icon: "Plus" },
  { value: "chevron", label: "Chevron", icon: "ChevronUp" },
  { value: "triangles", label: "Triangles", icon: "Triangle" },
  { value: "circles", label: "Circles", icon: "Circle" },
];

const DEFAULT_STATE: PatternState = {
  type: "dots",
  scale: 32,
  strokeWidth: 2,
  color: "#0891b2",
  useBackground: false,
  background: "#ecfeff",
};

/** One-click starting points. Each is a fully-specified, reproducible pattern. */
const PRESETS: { label: string; icon: string; state: PatternState }[] = [
  {
    label: "Dot grid",
    icon: "Grip",
    state: {
      type: "dots",
      scale: 24,
      strokeWidth: 2,
      color: "#94a3b8",
      useBackground: false,
      background: "#f8fafc",
    },
  },
  {
    label: "Graph paper",
    icon: "Grid3x3",
    state: {
      type: "grid",
      scale: 28,
      strokeWidth: 1,
      color: "#cbd5e1",
      useBackground: true,
      background: "#ffffff",
    },
  },
  {
    label: "Diagonal hatch",
    icon: "Slash",
    state: {
      type: "lines",
      scale: 18,
      strokeWidth: 1.5,
      color: "#a5b4fc",
      useBackground: false,
      background: "#eef2ff",
    },
  },
  {
    label: "Chevron",
    icon: "ChevronUp",
    state: {
      type: "chevron",
      scale: 40,
      strokeWidth: 3,
      color: "#0891b2",
      useBackground: true,
      background: "#ecfeff",
    },
  },
];

const RANDOM_COLORS = [
  "#0891b2",
  "#6366f1",
  "#e11d48",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#0ea5e9",
  "#94a3b8",
];

/** Deterministic-enough randomiser for the "surprise me" button. */
function randomState(): PatternState {
  const pick = <T,>(arr: readonly T[]): T =>
    arr[Math.floor(Math.random() * arr.length)] as T;
  const type = pick(TILE_OPTIONS).value;
  return {
    type,
    scale: 12 + Math.floor(Math.random() * 7) * 12,
    strokeWidth: [1, 1.5, 2, 3, 4][Math.floor(Math.random() * 5)] as number,
    color: pick(RANDOM_COLORS),
    useBackground: Math.random() > 0.5,
    background: "#ffffff",
  };
}

/**
 * Build one standalone tile SVG (a single `width×height = scale` unit) so the
 * CSS output can embed a compact one-tile data-URI and let the browser repeat
 * it, smaller than inlining the multi-tile preview SVG. Mirrors the engine's
 * tile geometry so the CSS matches the preview.
 */
function singleTileSvg(s: PatternState): string {
  const size = s.scale;
  const half = size / 2;
  const fg = s.color;
  const sw = s.strokeWidth;
  const round = (v: number) => Math.round(v * 100) / 100;
  let tile = "";
  switch (s.type) {
    case "dots":
      tile = `<circle cx="${round(half)}" cy="${round(half)}" r="${round(size * 0.12)}" fill="${fg}"/>`;
      break;
    case "circles":
      tile = `<circle cx="${round(half)}" cy="${round(half)}" r="${round(size * 0.35)}" fill="none" stroke="${fg}" stroke-width="${sw}"/>`;
      break;
    case "grid":
      tile = `<path d="M ${round(size)} 0 L 0 0 0 ${round(size)}" fill="none" stroke="${fg}" stroke-width="${sw}"/>`;
      break;
    case "lines":
      tile = `<path d="M 0 ${round(size)} L ${round(size)} 0" stroke="${fg}" stroke-width="${sw}"/>`;
      break;
    case "cross":
      tile = `<path d="M ${round(half)} ${round(size * 0.2)} L ${round(half)} ${round(size * 0.8)} M ${round(size * 0.2)} ${round(half)} L ${round(size * 0.8)} ${round(half)}" stroke="${fg}" stroke-width="${sw}"/>`;
      break;
    case "chevron":
      tile = `<path d="M 0 ${round(half)} L ${round(half)} 0 L ${round(size)} ${round(half)}" fill="none" stroke="${fg}" stroke-width="${sw}"/>`;
      break;
    case "triangles":
      tile = `<path d="M ${round(half)} 0 L ${round(size)} ${round(size)} L 0 ${round(size)} Z" fill="${fg}"/>`;
      break;
  }
  const bgRect = s.useBackground
    ? `<rect width="${round(size)}" height="${round(size)}" fill="${s.background}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(size)}" height="${round(size)}" viewBox="0 0 ${round(size)} ${round(size)}">${bgRect}${tile}</svg>`;
}

/** Build the ready-to-paste CSS rule from a single-tile data-URI. */
function buildCss(s: PatternState): string {
  const uri = svgToDataUri(singleTileSvg(s), { encoding: "url-optimized" });
  const dataUri = uri.ok ? uri.result : "";
  const bgColor = s.useBackground ? `\n  background-color: ${s.background};` : "";
  return `.pattern {${bgColor}
  background-image: url("${dataUri}");
  background-repeat: repeat;
  background-size: ${s.scale}px ${s.scale}px;
}`;
}

/**
 * SVG Pattern Generator, the "Generate" tool for seamless tiling backgrounds.
 * Seven tile primitives (dots, grid, lines, cross, chevron, triangles, circles)
 * drive `makePattern` from the SVG engine; tile-size, stroke and color controls
 * tune the look; a live big preview via <GeneratorCanvas> with copy, scalable
 * SVG download and a "Copy CSS" action that emits a compact single-tile
 * data-URI. Full undo/redo, one-click presets, randomise and keyboard
 * shortcuts. Everything runs in-browser and is deterministic.
 */
export default function SvgPatternGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<PatternState>(DEFAULT_STATE, { debounceMs: 350 });
  const s = history.state;

  const patch = React.useCallback(
    (next: Partial<PatternState>) => {
      history.set((prev) => ({ ...prev, ...next }));
    },
    [history],
  );

  const loadPreset = React.useCallback(
    (state: PatternState) => history.set(state),
    [history],
  );

  const randomize = React.useCallback(
    () => history.set(randomState()),
    [history],
  );

  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  // The generated preview SVG: pure, deterministic, recomputed on change.
  const svg = React.useMemo(
    () =>
      makePattern(s.type, {
        scale: s.scale,
        strokeWidth: s.strokeWidth,
        colors: [s.color],
        ...(s.useBackground ? { background: s.background } : {}),
      }),
    [s.type, s.scale, s.strokeWidth, s.color, s.useBackground, s.background],
  );

  const css = React.useMemo(() => buildCss(s), [s]);

  const strokeApplies = STROKE_TILES.has(s.type);

  useShortcuts({
    "mod+enter": randomize,
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
    "mod+backspace": reset,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Randomise the pattern" },
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

      {/* Tile type */}
      <Field label="Tile" hint="The repeating motif. Line tiles respond to the stroke control.">
        <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Pattern tile">
          {TILE_OPTIONS.map((t) => {
            const active = s.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => patch({ type: t.value })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? cn("border-current", style.soft)
                    : "border-border bg-background text-foreground hover:bg-accent/50",
                )}
              >
                <Icon name={t.icon} size={13} className={active ? undefined : style.text} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Tile size */}
      <Field
        label={`Tile size: ${s.scale}px`}
        htmlFor="pattern-scale"
        hint="How big one tile is. Smaller packs the motif denser. Larger spaces it out."
      >
        <input
          id="pattern-scale"
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={2}
          value={s.scale}
          onChange={(e) => patch({ scale: Number(e.target.value) })}
          aria-label="Tile size in pixels"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Stroke width - only meaningful for line tiles */}
      <Field
        label={`Stroke, ${s.strokeWidth}px`}
        htmlFor="pattern-stroke"
        hint={
          strokeApplies
            ? "Line weight for this tile: hairline to heavy."
            : "This tile is filled, so stroke has no effect. Pick a line tile to use it."
        }
      >
        <input
          id="pattern-stroke"
          type="range"
          min={MIN_STROKE}
          max={MAX_STROKE}
          step={0.5}
          value={s.strokeWidth}
          disabled={!strokeApplies}
          onChange={(e) => patch({ strokeWidth: Number(e.target.value) })}
          aria-label="Stroke width in pixels"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
            style.text,
          )}
        />
      </Field>

      {/* Foreground color */}
      <Field label="Pattern color" htmlFor="pattern-color">
        <ColorInput
          id="pattern-color"
          value={s.color}
          onChange={(color) => patch({ color })}
          ringClass={style.ring}
        />
      </Field>

      {/* Background */}
      <Field label="Background">
        <SegmentedControl<"transparent" | "solid">
          value={s.useBackground ? "solid" : "transparent"}
          onChange={(v) => patch({ useBackground: v === "solid" })}
          size="sm"
          ariaLabel="Background mode"
          options={[
            { value: "transparent", label: "Transparent", icon: "Grid2x2" },
            { value: "solid", label: "Solid", icon: "Square" },
          ]}
        />
      </Field>
      {s.useBackground && (
        <Field label="Background color" htmlFor="pattern-bg">
          <ColorInput
            id="pattern-bg"
            value={s.background}
            onChange={(background) => patch({ background })}
            ringClass={style.ring}
          />
        </Field>
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

      {/* CSS output */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">CSS background</span>
          <CopyButton getValue={() => css} label="Copy CSS" copiedLabel="Copied!" />
        </div>
        <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed text-foreground">
          <code>{css}</code>
        </pre>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Every pattern is a real repeating tile, so it stays seamless at any size. The
          CSS embeds a compact single-tile data-URI. No separate image file to host.
        </span>
      </p>
    </div>
  );

  return (
    <GeneratorCanvas
      svg={svg}
      controls={controls}
      controlsTitle="Pattern controls"
      filename="pattern-gigai"
      previewBackground="light"
      toolbarExtra={<CopyButton getValue={() => css} label="Copy CSS" copiedLabel="Copied!" />}
      onRandomize={randomize}
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
