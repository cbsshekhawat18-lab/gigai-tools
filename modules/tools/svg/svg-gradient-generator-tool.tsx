"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import {
  makeGradient,
  type GradientStop,
  type GradientOptions,
} from "@/lib/svg-tools/generate";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  SegmentedControl,
  CopyButton,
  CodePane,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * One serialisable object drives the whole tool, so undo/redo and preset/reroll
 * are just "swap the state". Stops carry a stable `id` so React keys survive
 * reordering and color edits without remounting the row.
 * ──────────────────────────────────────────────────────────────────────────── */

type GradientType = "linear" | "radial" | "conic";

interface Stop {
  id: number;
  offset: number; // 0–100
  color: string;
}

interface GradientState {
  type: GradientType;
  angle: number; // 0–360, linear/conic only
  stops: Stop[];
}

const SIZE = 512;
const MAX_STOPS = 8;
const MIN_STOPS = 2;

let STOP_SEQ = 1;
const stop = (offset: number, color: string): Stop => ({ id: STOP_SEQ++, offset, color });

const DEFAULT_STATE: GradientState = {
  type: "linear",
  angle: 135,
  stops: [stop(0, "#6366f1"), stop(100, "#ec4899")],
};

/** One-click starting points: each a fully-specified gradient. */
const PRESETS: { label: string; icon: string; state: () => GradientState }[] = [
  {
    label: "Indigo dusk",
    icon: "Moon",
    state: () => ({ type: "linear", angle: 135, stops: [stop(0, "#6366f1"), stop(100, "#ec4899")] }),
  },
  {
    label: "Sunset",
    icon: "Sunset",
    state: () => ({ type: "linear", angle: 90, stops: [stop(0, "#f59e0b"), stop(50, "#ef4444"), stop(100, "#7c3aed")] }),
  },
  {
    label: "Ocean bloom",
    icon: "Droplet",
    state: () => ({ type: "radial", angle: 90, stops: [stop(0, "#22d3ee"), stop(100, "#2563eb")] }),
  },
  {
    label: "Spectrum",
    icon: "Rainbow",
    state: () => ({ type: "conic", angle: 0, stops: [stop(0, "#ef4444"), stop(25, "#f59e0b"), stop(50, "#22c55e"), stop(75, "#3b82f6"), stop(100, "#ef4444")] }),
  },
];

/** A small seeded palette generator for reroll: harmonious hue-shifted stops. */
function rerollStops(seed: number): Stop[] {
  const baseHue = (Math.imul(seed, 2654435761) >>> 0) % 360;
  const spread = 40 + ((seed * 37) % 120);
  const count = 2 + ((seed >>> 2) % 2); // 2–3 stops
  const sat = 65 + ((seed * 13) % 20);
  const light = 50 + ((seed * 7) % 12);
  const out: Stop[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const hue = (baseHue + t * spread) % 360;
    out.push(stop(Math.round(t * 100), hslToHex(hue, sat, light)));
  }
  return out;
}

function hslToHex(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Sort stops by offset for a stable, valid gradient definition. */
function sorted(stops: Stop[]): Stop[] {
  return [...stops].sort((a, b) => a.offset - b.offset);
}

/**
 * SVG Gradient Generator, the "Generate" tool for designing linear/radial/conic
 * gradients. Unlimited draggable color stops, an angle dial and a type switch
 * drive `makeGradient` from the SVG engine, which returns a scalable SVG and a
 * matching CSS background at once. Live big preview via <GeneratorCanvas> with
 * copy/download SVG, PNG export, plus a dedicated CSS output panel with its own
 * copy. Full undo/redo, presets, reroll and keyboard shortcuts: all in-browser.
 */
export default function SvgGradientGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<GradientState>(DEFAULT_STATE, { debounceMs: 300 });
  const s = history.state;
  const rerollSeed = React.useRef(1);

  const patch = React.useCallback(
    (next: Partial<GradientState>) => history.set((prev) => ({ ...prev, ...next })),
    [history],
  );

  const setStop = React.useCallback(
    (id: number, next: Partial<Stop>) =>
      history.set((prev) => ({
        ...prev,
        stops: prev.stops.map((st) => (st.id === id ? { ...st, ...next } : st)),
      })),
    [history],
  );

  const addStop = React.useCallback(() => {
    history.set((prev) => {
      if (prev.stops.length >= MAX_STOPS) return prev;
      const so = sorted(prev.stops);
      // Insert at the widest gap for a sensible default position.
      let bestGap = -1;
      let mid = 50;
      for (let i = 0; i < so.length - 1; i++) {
        const a = so[i];
        const b = so[i + 1];
        if (!a || !b) continue;
        const gap = b.offset - a.offset;
        if (gap > bestGap) {
          bestGap = gap;
          mid = Math.round((a.offset + b.offset) / 2);
        }
      }
      const anchor = so[Math.floor(so.length / 2)];
      return { ...prev, stops: [...prev.stops, stop(mid, anchor?.color ?? "#8b5cf6")] };
    });
  }, [history]);

  const removeStop = React.useCallback(
    (id: number) =>
      history.set((prev) =>
        prev.stops.length <= MIN_STOPS
          ? prev
          : { ...prev, stops: prev.stops.filter((st) => st.id !== id) },
      ),
    [history],
  );

  const loadPreset = React.useCallback(
    (state: GradientState) => history.set(state),
    [history],
  );

  const reroll = React.useCallback(() => {
    const seed = (rerollSeed.current = (rerollSeed.current + 1) % 100000 || 1);
    history.set((prev) => ({ ...prev, stops: rerollStops(seed) }));
  }, [history]);

  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  // Engine call: pure & deterministic; recomputed only when inputs change.
  const { svg, css } = React.useMemo(() => {
    const engineStops: GradientStop[] = sorted(s.stops).map((st) => ({
      offset: st.offset,
      color: st.color,
    }));
    const opts: GradientOptions = {
      type: s.type,
      size: SIZE,
      angle: s.angle,
      stops: engineStops,
    };
    return makeGradient(opts);
  }, [s.type, s.angle, s.stops]);

  const showAngle = s.type !== "radial";

  useShortcuts({
    "mod+enter": reroll,
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
    "mod+backspace": reset,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Reroll a fresh palette" },
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
              onClick={() => loadPreset(p.state())}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name={p.icon} size={13} className={style.text} />
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <Field label="Type" htmlFor="grad-type">
        <SegmentedControl<GradientType>
          value={s.type}
          onChange={(type) => patch({ type })}
          size="sm"
          ariaLabel="Gradient type"
          options={[
            { value: "linear", label: "Linear", icon: "MoveRight" },
            { value: "radial", label: "Radial", icon: "CircleDot" },
            { value: "conic", label: "Conic", icon: "RotateCw" },
          ]}
        />
      </Field>

      {/* Angle (linear + conic) */}
      {showAngle && (
        <Field
          label={`Angle, ${s.angle}°`}
          htmlFor="grad-angle"
          hint={
            s.type === "conic"
              ? "Where the conic sweep starts, clockwise from the top."
              : "Direction of the linear gradient across the frame."
          }
        >
          <input
            id="grad-angle"
            type="range"
            min={0}
            max={360}
            step={1}
            value={s.angle}
            onChange={(e) => patch({ angle: Number(e.target.value) })}
            aria-label="Gradient angle in degrees"
            className={cn(
              "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
              style.text,
            )}
          />
        </Field>
      )}

      {/* Color stops */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Color stops - {s.stops.length}
          </span>
          <button
            type="button"
            onClick={addStop}
            disabled={s.stops.length >= MAX_STOPS}
            aria-label="Add color stop"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="Plus" size={13} />
            Add stop
          </button>
        </div>

        {/* Gradient track - visualises stops along their offsets. */}
        <div
          className="relative h-6 w-full overflow-hidden rounded-md border border-border"
          style={{
            backgroundImage: `linear-gradient(90deg, ${sorted(s.stops)
              .map((st) => `${st.color} ${st.offset}%`)
              .join(", ")})`,
          }}
          aria-hidden="true"
        >
          {sorted(s.stops).map((st) => (
            <span
              key={st.id}
              className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow ring-1 ring-black/20"
              style={{ left: `${st.offset}%`, backgroundColor: st.color }}
            />
          ))}
        </div>

        {/* Stop rows */}
        <div className="flex flex-col gap-2">
          {sorted(s.stops).map((st, i) => (
            <div key={st.id} className="flex items-center gap-2">
              <input
                type="color"
                value={st.color}
                onChange={(e) => setStop(st.id, { color: e.target.value })}
                aria-label={`Stop ${i + 1} color`}
                className="h-8 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-background p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <input
                type="text"
                value={st.color}
                onChange={(e) => setStop(st.id, { color: e.target.value })}
                spellCheck={false}
                autoComplete="off"
                aria-label={`Stop ${i + 1} hex value`}
                className={cn(
                  "h-8 w-[5.5rem] rounded-md border border-border bg-background px-2 font-mono text-xs uppercase text-foreground outline-none focus-visible:ring-2",
                  style.ring,
                )}
              />
              <label className="sr-only" htmlFor={`stop-offset-${st.id}`}>
                Stop {i + 1} offset percent
              </label>
              <input
                id={`stop-offset-${st.id}`}
                type="range"
                min={0}
                max={100}
                step={1}
                value={st.offset}
                onChange={(e) => setStop(st.id, { offset: Number(e.target.value) })}
                aria-label={`Stop ${i + 1} position`}
                className={cn(
                  "h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
                  style.text,
                )}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={st.offset}
                onChange={(e) =>
                  setStop(st.id, {
                    offset: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                  })
                }
                aria-label={`Stop ${i + 1} offset value`}
                className="h-8 w-14 rounded-md border border-border bg-background px-1.5 text-right font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => removeStop(st.id)}
                disabled={s.stops.length <= MIN_STOPS}
                aria-label={`Remove stop ${i + 1}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CSS output panel - the second half of "SVG + CSS from one design". */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon name="Braces" size={13} className={style.text} />
            CSS background
          </span>
          <CopyButton getValue={() => css} label="Copy CSS" copiedLabel="Copied!" />
        </div>
        <CodePane
          value={css}
          readOnly
          lineNumbers={false}
          ariaLabel="CSS gradient output"
          minHeight={64}
          maxHeight={140}
          fontSize={12}
        />
      </div>

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
          {s.type === "conic"
            ? "Conic uses a true conic-gradient() in CSS. The SVG falls back to linear since SVG has no native conic. Export PNG to bake the sweep."
            : "The SVG and CSS are generated from the same stops, so the vector and the CSS background always match."}
        </span>
      </p>
    </div>
  );

  return (
    <GeneratorCanvas
      svg={svg}
      controls={controls}
      controlsTitle="Gradient controls"
      filename="gradient-gigai"
      pngScale={2}
      onRandomize={reroll}
      onReset={reset}
      previewMinHeight={420}
    />
  );
}
