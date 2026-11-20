"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { makeShape, type ShapeType } from "@/lib/svg-tools/generate";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  SegmentedControl,
  SelectField,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * A single serialisable object drives the whole tool, so undo/redo and preset
 * loading are just "swap the state". Every field is a plain number/string, so
 * the geometry is fully deterministic and reproducible. No seed, no randomness.
 * ──────────────────────────────────────────────────────────────────────────── */

type FillMode = "solid" | "gradient";

interface ShapeState {
  type: ShapeType;
  sides: number;
  radius: number; // fraction of size, 0.1–0.5
  innerRadius: number; // fraction of outer, 0.1–0.95
  rotation: number; // degrees, 0–359
  size: number;
  fill: FillMode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const MIN_SIDES = 3;
const MAX_SIDES = 24;
const MIN_SIZE = 128;
const MAX_SIZE = 1024;

const DEFAULT_STATE: ShapeState = {
  type: "star",
  sides: 5,
  radius: 0.45,
  innerRadius: 0.45,
  rotation: 0,
  size: 512,
  fill: "gradient",
  color: "#06b6d4",
  gradientFrom: "#06b6d4",
  gradientTo: "#3b82f6",
};

const SHAPE_OPTIONS: { value: ShapeType; label: string }[] = [
  { value: "polygon", label: "Polygon" },
  { value: "star", label: "Star" },
  { value: "gear", label: "Gear" },
  { value: "heart", label: "Heart" },
  { value: "burst", label: "Sunburst" },
  { value: "hexagon", label: "Hexagon" },
  { value: "triangle", label: "Triangle" },
];

/** Which controls a given shape type actually responds to (drives disabling). */
function usesSides(type: ShapeType): boolean {
  return type === "polygon" || type === "star" || type === "gear" || type === "burst";
}
function usesInnerRadius(type: ShapeType): boolean {
  return type === "star" || type === "gear";
}
function usesRotation(type: ShapeType): boolean {
  return type !== "heart";
}

/** One-click starting points. Each is a fully-specified, reproducible shape. */
const PRESETS: { label: string; icon: string; state: ShapeState }[] = [
  {
    label: "5-point star",
    icon: "Star",
    state: { ...DEFAULT_STATE, type: "star", sides: 5, innerRadius: 0.45 },
  },
  {
    label: "Cog",
    icon: "Settings",
    state: {
      ...DEFAULT_STATE,
      type: "gear",
      sides: 10,
      innerRadius: 0.78,
      fill: "solid",
      color: "#64748b",
    },
  },
  {
    label: "Hex badge",
    icon: "Hexagon",
    state: {
      ...DEFAULT_STATE,
      type: "hexagon",
      rotation: 30,
      fill: "gradient",
      gradientFrom: "#8b5cf6",
      gradientTo: "#ec4899",
    },
  },
  {
    label: "Heart",
    icon: "Heart",
    state: {
      ...DEFAULT_STATE,
      type: "heart",
      fill: "gradient",
      gradientFrom: "#f43f5e",
      gradientTo: "#f59e0b",
    },
  },
  {
    label: "Sunburst",
    icon: "Sun",
    state: {
      ...DEFAULT_STATE,
      type: "burst",
      sides: 16,
      fill: "gradient",
      gradientFrom: "#f59e0b",
      gradientTo: "#ef4444",
    },
  },
  {
    label: "Hexagon tile",
    icon: "Hexagon",
    state: {
      ...DEFAULT_STATE,
      type: "polygon",
      sides: 6,
      rotation: 0,
      fill: "solid",
      color: "#10b981",
    },
  },
];

/**
 * SVG Shape Generator: the geometric "Generate" tool. A shape-type selector
 * plus sides / radius / inner-radius / rotation controls drive `makeShape` from
 * the SVG engine; fill with a solid color or a two-stop gradient; live big
 * preview via <GeneratorCanvas> with copy, scalable SVG download and a
 * transparent PNG export. Full undo/redo, one-click presets and keyboard
 * shortcuts. Everything runs in-browser and is fully deterministic.
 */
export default function SvgShapeGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<ShapeState>(DEFAULT_STATE, { debounceMs: 350 });
  const s = history.state;

  /** Patch state through history, coalesces rapid slider drags into one step. */
  const patch = React.useCallback(
    (next: Partial<ShapeState>) => {
      history.set((prev) => ({ ...prev, ...next }));
    },
    [history],
  );

  const loadPreset = React.useCallback(
    (state: ShapeState) => history.set(state),
    [history],
  );

  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  // The generated SVG: pure, deterministic, recomputed only when inputs change.
  const svg = React.useMemo(
    () =>
      makeShape(s.type, {
        sides: s.sides,
        radius: s.radius,
        innerRadius: s.innerRadius,
        rotation: s.rotation,
        size: s.size,
        ...(s.fill === "gradient"
          ? { gradient: [s.gradientFrom, s.gradientTo] as [string, string] }
          : { color: s.color }),
      }),
    [
      s.type,
      s.sides,
      s.radius,
      s.innerRadius,
      s.rotation,
      s.size,
      s.fill,
      s.color,
      s.gradientFrom,
      s.gradientTo,
    ],
  );

  useShortcuts({
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
    "mod+backspace": reset,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "mod+backspace", description: "Reset to default" },
  ];

  const sidesActive = usesSides(s.type);
  const innerActive = usesInnerRadius(s.type);
  const rotationActive = usesRotation(s.type);

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

      {/* Shape type */}
      <Field label="Shape" htmlFor="shape-type">
        <SelectField<ShapeType>
          value={s.type}
          onChange={(type) => patch({ type })}
          options={SHAPE_OPTIONS}
        />
      </Field>

      {/* Sides / points */}
      <Field
        label={`${sidesLabel(s.type)}: ${s.sides}`}
        htmlFor="shape-sides"
        hint={
          sidesActive
            ? "Number of sides (polygon) or points/teeth (star, gear, sunburst)."
            : "This shape has a fixed side count, switch to Polygon for a custom count."
        }
      >
        <input
          id="shape-sides"
          type="range"
          min={MIN_SIDES}
          max={MAX_SIDES}
          step={1}
          value={s.sides}
          disabled={!sidesActive}
          onChange={(e) => patch({ sides: Number(e.target.value) })}
          aria-label="Number of sides or points"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
            style.text,
          )}
        />
      </Field>

      {/* Outer radius */}
      <Field
        label={`Radius, ${Math.round(s.radius * 100)}%`}
        htmlFor="shape-radius"
        hint="Outer radius as a fraction of the canvas. Controls how much of the frame the shape fills."
      >
        <input
          id="shape-radius"
          type="range"
          min={10}
          max={50}
          step={1}
          value={Math.round(s.radius * 100)}
          onChange={(e) => patch({ radius: Number(e.target.value) / 100 })}
          aria-label="Outer radius"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Inner radius (star/gear) */}
      <Field
        label={`Inner radius: ${Math.round(s.innerRadius * 100)}%`}
        htmlFor="shape-inner"
        hint={
          innerActive
            ? "Depth of the notches as a fraction of the outer radius. Lower = sharper points/teeth."
            : "Only stars and gears use an inner radius."
        }
      >
        <input
          id="shape-inner"
          type="range"
          min={10}
          max={95}
          step={1}
          value={Math.round(s.innerRadius * 100)}
          disabled={!innerActive}
          onChange={(e) => patch({ innerRadius: Number(e.target.value) / 100 })}
          aria-label="Inner radius"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
            style.text,
          )}
        />
      </Field>

      {/* Rotation */}
      <Field
        label={`Rotation, ${s.rotation}°`}
        htmlFor="shape-rotation"
        hint={
          rotationActive
            ? "Spin the shape around its centre. Half a step flips point-up vs flat-side-up."
            : "The heart shape ignores rotation."
        }
      >
        <input
          id="shape-rotation"
          type="range"
          min={0}
          max={359}
          step={1}
          value={s.rotation}
          disabled={!rotationActive}
          onChange={(e) => patch({ rotation: Number(e.target.value) })}
          aria-label="Rotation in degrees"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
            style.text,
          )}
        />
      </Field>

      {/* Size */}
      <Field
        label={`Size, ${s.size}px`}
        htmlFor="shape-size"
        hint="Dimensions of the square viewBox (also seeds the PNG export resolution)."
      >
        <input
          id="shape-size"
          type="range"
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={16}
          value={s.size}
          onChange={(e) => patch({ size: Number(e.target.value) })}
          aria-label="Size in pixels"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {/* Fill mode */}
      <Field label="Fill" htmlFor="shape-fill">
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
        <Field label="Color" htmlFor="shape-color">
          <ColorInput
            id="shape-color"
            value={s.color}
            onChange={(color) => patch({ color })}
            ringClass={style.ring}
          />
        </Field>
      ) : (
        <div className="flex flex-wrap gap-4">
          <Field label="From" htmlFor="shape-grad-from">
            <ColorInput
              id="shape-grad-from"
              value={s.gradientFrom}
              onChange={(gradientFrom) => patch({ gradientFrom })}
              ringClass={style.ring}
            />
          </Field>
          <Field label="To" htmlFor="shape-grad-to">
            <ColorInput
              id="shape-grad-to"
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
          Every shape is pure geometry. No randomness. The same settings always
          regenerate the exact same <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">&lt;path&gt;</code>.
        </span>
      </p>
    </div>
  );

  return (
    <GeneratorCanvas
      svg={svg}
      controls={controls}
      controlsTitle="Shape controls"
      filename="shape-gigai"
      pngScale={2}
      onReset={reset}
      previewMinHeight={420}
    />
  );
}

/** Label for the sides slider, "points" for stars/bursts, "teeth" for gears. */
function sidesLabel(type: ShapeType): string {
  if (type === "star" || type === "burst") return "Points";
  if (type === "gear") return "Teeth";
  return "Sides";
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
