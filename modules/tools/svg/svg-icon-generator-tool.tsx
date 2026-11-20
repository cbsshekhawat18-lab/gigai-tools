"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { Tool, WorkspaceToolData } from "@/types";
import {
  makeShape,
  makeSprite,
  normalizeIcons,
  iconGrid,
  type ShapeType,
} from "@/lib/svg-tools/generate";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  SegmentedControl,
  SelectField,
  Toggle,
  CopyButton,
  DownloadButton,
  ToolbarButton,
  ToolbarDivider,
  StatBadge,
  ExamplesMenu,
  ShortcutsHelp,
  useHistory,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * The tool has two modes that share one preview canvas:
 *  • "normalize"; a pile of pasted/dropped SVGs is forced onto one shared
 *     viewBox + export size, retinted to currentColor, stroke-unified, then
 *     laid out on a grid. Sprite / cleaned-SVG export lives in the toolbar.
 *  • "build": a single icon is minted from a geometric shape preset.
 * A single serialisable state object drives everything so undo/redo and preset
 * loading are just "swap the state".
 * ──────────────────────────────────────────────────────────────────────────── */

type Mode = "normalize" | "build";

interface IconState {
  mode: Mode;

  // Normalize mode
  source: string;
  boxSize: number; // shared viewBox + export size, px
  toCurrentColor: boolean;
  unifyStroke: boolean;
  strokeWidth: number;
  gridColor: string;

  // Build mode
  shape: ShapeType;
  sides: number;
  rotation: number;
  radius: number; // 0–100 (% of size)
  buildFill: "solid" | "gradient";
  buildColor: string;
  gradFrom: string;
  gradTo: string;
}

const MIN_BOX = 16;
const MAX_BOX = 64;

const DEFAULT_STATE: IconState = {
  mode: "normalize",
  source: "",
  boxSize: 24,
  toCurrentColor: true,
  unifyStroke: false,
  strokeWidth: 2,
  gridColor: "#0f172a",

  shape: "star",
  sides: 6,
  rotation: 0,
  radius: 45,
  buildFill: "gradient",
  buildColor: "#0891b2",
  gradFrom: "#06b6d4",
  gradTo: "#3b82f6",
};

const SHAPE_OPTIONS: ReadonlyArray<{ value: ShapeType; label: string }> = [
  { value: "star", label: "Star" },
  { value: "hexagon", label: "Hexagon" },
  { value: "triangle", label: "Triangle" },
  { value: "polygon", label: "Polygon" },
  { value: "gear", label: "Gear" },
  { value: "heart", label: "Heart" },
  { value: "burst", label: "Burst" },
];

/** Curated batches so the empty Normalize state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Mismatched trio",
    description: "Three sizes & colors to unify",
    icon: "Shapes",
    value: [
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10h10"/><path d="M10 5v10"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="#2563eb"><circle cx="24" cy="24" r="16"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16l7 7 13-13"/></svg>',
    ].join("\n\n"),
  },
  {
    label: "Line icon set",
    description: "Four stroked 24×24 glyphs",
    icon: "PenLine",
    value: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>',
    ].join("\n\n"),
  },
];

const EMPTY_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>';

/* ────────────────────────────────────────────────────────────────────────────
 * Pure helpers. Split a source blob into individual <svg> blocks, then run the
 * engine's normaliser plus a stroke/size pass on each one.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Extract every top-level `<svg>…</svg>` block from a pasted blob. */
function splitSvgs(source: string): string[] {
  const matches = source.match(/<svg\b[\s\S]*?<\/svg>/gi);
  return matches ? matches.map((s) => s.trim()).filter(Boolean) : [];
}

/**
 * Force a single icon onto the shared export size + optional stroke width. The
 * engine's `normalizeIcons` already handles viewBox + currentColor; this adds
 * the width/height and the unified stroke-width on the root, which the tool
 * exposes as first-class controls.
 */
function fitIcon(svg: string, box: number, unifyStroke: boolean, strokeWidth: number): string {
  let out = svg;
  // Set explicit width/height on the root <svg> so standalone downloads render
  // at the chosen size (the shared viewBox keeps them on the same grid).
  out = out.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => {
    let a = attrs
      .replace(/\swidth\s*=\s*["'][^"']*["']/i, "")
      .replace(/\sheight\s*=\s*["'][^"']*["']/i, "");
    if (unifyStroke) {
      a = a.replace(/\sstroke-width\s*=\s*["'][^"']*["']/i, "");
    }
    return `<svg${a} width="${box}" height="${box}"${
      unifyStroke ? ` stroke-width="${strokeWidth}"` : ""
    }>`;
  });
  if (unifyStroke) {
    // Also strip per-element stroke-width so the root value wins across the set.
    out = out.replace(/\sstroke-width\s*=\s*["'][^"']*["']/gi, "");
  }
  return out;
}

interface NormalizeResult {
  icons: string[]; // cleaned standalone SVGs, in order
  grid: string; // preview grid SVG
  count: number;
}

function normalizeBatch(state: IconState): NormalizeResult {
  const raw = splitSvgs(state.source);
  const viewBox = `0 0 ${state.boxSize} ${state.boxSize}`;
  const cleaned = normalizeIcons(raw, {
    toCurrentColor: state.toCurrentColor,
    viewBox,
  }).map((svg) => fitIcon(svg, state.boxSize, state.unifyStroke, state.strokeWidth));

  const grid =
    cleaned.length > 0
      ? iconGrid(cleaned, {
          cols: Math.min(6, Math.max(1, cleaned.length)),
          cell: 48,
          gap: 16,
          color: state.gridColor,
        })
      : EMPTY_SVG;

  return { icons: cleaned, grid, count: cleaned.length };
}

/**
 * SVG Icon Generator: normalize a batch of SVGs into one consistent icon set
 * (shared viewBox + size, currentColor, unified stroke) with a live grid
 * preview and `<symbol>` sprite / standalone export, or build a fresh icon from
 * a geometric shape preset. Undo/redo, examples, shortcuts; all in-browser.
 */
export default function SvgIconGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<IconState>(DEFAULT_STATE, { debounceMs: 300 });
  const s = history.state;

  const patch = React.useCallback(
    (next: Partial<IconState>) => history.set((prev) => ({ ...prev, ...next })),
    [history],
  );

  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  // Normalize result, recomputed only when its inputs change.
  const normalized = React.useMemo(
    () => normalizeBatch(s),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      s.source,
      s.boxSize,
      s.toCurrentColor,
      s.unifyStroke,
      s.strokeWidth,
      s.gridColor,
    ],
  );

  // The single built icon (Build mode).
  const built = React.useMemo(
    () =>
      makeShape(s.shape, {
        size: s.boxSize * 16, // export the built icon at a comfortable resolution
        sides: s.sides,
        rotation: s.rotation,
        radius: s.radius / 100,
        ...(s.buildFill === "gradient"
          ? { gradient: [s.gradFrom, s.gradTo] as [string, string] }
          : { color: s.buildColor }),
      }),
    [
      s.shape,
      s.boxSize,
      s.sides,
      s.rotation,
      s.radius,
      s.buildFill,
      s.buildColor,
      s.gradFrom,
      s.gradTo,
    ],
  );

  // What the big canvas shows + what Copy/Download/PNG in the toolbar act on.
  const previewSvg = s.mode === "normalize" ? normalized.grid : built;

  // Sprite is derived on demand from the cleaned batch.
  const sprite = React.useMemo(() => {
    if (s.mode !== "normalize" || normalized.count === 0) return null;
    const entries = normalized.icons.map((svg, i) => ({ id: `icon-${i + 1}`, svg }));
    const result = makeSprite(entries);
    return result.ok ? result.result : null;
  }, [s.mode, normalized.icons, normalized.count]);

  useShortcuts({
    "mod+z": (e) => {
      e.preventDefault();
      history.undo();
    },
    "mod+shift+z": (e) => {
      e.preventDefault();
      history.redo();
    },
    "mod+backspace": (e) => {
      e.preventDefault();
      reset();
    },
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "mod+backspace", description: "Reset to defaults" },
  ];

  const supportsCurrentColor = s.toCurrentColor;

  /* ── Controls ─────────────────────────────────────────────────────────── */
  const controls = (
    <div className="flex flex-col gap-5">
      {/* Mode switch */}
      <Field label="Mode" htmlFor="icon-mode">
        <SegmentedControl<Mode>
          value={s.mode}
          onChange={(mode) => patch({ mode })}
          size="sm"
          ariaLabel="Tool mode"
          options={[
            { value: "normalize", label: "Normalize", icon: "Ruler" },
            { value: "build", label: "Build", icon: "Shapes" },
          ]}
        />
      </Field>

      {/* Shared grid size */}
      <Field
        label={`Grid: ${s.boxSize}×${s.boxSize}`}
        htmlFor="icon-box"
        hint={
          s.mode === "normalize"
            ? "Shared viewBox and export size every icon snaps to."
            : "Base grid the built icon uses (exported at higher resolution)."
        }
      >
        <input
          id="icon-box"
          type="range"
          min={MIN_BOX}
          max={MAX_BOX}
          step={2}
          value={s.boxSize}
          onChange={(e) => patch({ boxSize: Number(e.target.value) })}
          aria-label="Icon grid size"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
            style.text,
          )}
        />
      </Field>

      {s.mode === "normalize" ? (
        <>
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <Toggle
              checked={s.toCurrentColor}
              onChange={(v) => patch({ toCurrentColor: v })}
              label="Retint to currentColor"
            />
            <Toggle
              checked={s.unifyStroke}
              onChange={(v) => patch({ unifyStroke: v })}
              label="Unify stroke width"
            />
            {s.unifyStroke && (
              <Field label={`Stroke width: ${s.strokeWidth}`} htmlFor="icon-stroke">
                <input
                  id="icon-stroke"
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={s.strokeWidth}
                  onChange={(e) => patch({ strokeWidth: Number(e.target.value) })}
                  aria-label="Unified stroke width"
                  className={cn(
                    "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
                    style.text,
                  )}
                />
              </Field>
            )}
          </div>

          <Field
            label="Preview color"
            htmlFor="icon-grid-color"
            hint={
              supportsCurrentColor
                ? "currentColor icons render in this color on the grid."
                : "Retinting is off, icons keep their own colors. This tints only ones set to currentColor."
            }
          >
            <ColorInput
              id="icon-grid-color"
              value={s.gridColor}
              onChange={(gridColor) => patch({ gridColor })}
              ringClass={style.ring}
            />
          </Field>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
            <span>
              Paste one or more SVGs separated by a blank line, or drop{" "}
              <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">
                .svg
              </code>{" "}
              files below. Detected:{" "}
              <strong className="text-foreground">{normalized.count}</strong> icon
              {normalized.count === 1 ? "" : "s"}.
            </span>
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <Field label="Shape" htmlFor="icon-shape">
              <SelectField<ShapeType>
                id="icon-shape"
                value={s.shape}
                onChange={(shape) => patch({ shape })}
                ariaLabel="Icon shape"
                options={SHAPE_OPTIONS}
              />
            </Field>

            {s.shape !== "heart" && s.shape !== "hexagon" && s.shape !== "triangle" && (
              <Field label={`Sides / points, ${s.sides}`} htmlFor="icon-sides">
                <input
                  id="icon-sides"
                  type="range"
                  min={3}
                  max={12}
                  step={1}
                  value={s.sides}
                  onChange={(e) => patch({ sides: Number(e.target.value) })}
                  aria-label="Number of sides or points"
                  className={cn(
                    "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
                    style.text,
                  )}
                />
              </Field>
            )}

            <Field label={`Rotation: ${s.rotation}°`} htmlFor="icon-rotation">
              <input
                id="icon-rotation"
                type="range"
                min={0}
                max={360}
                step={5}
                value={s.rotation}
                onChange={(e) => patch({ rotation: Number(e.target.value) })}
                aria-label="Rotation in degrees"
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
                  style.text,
                )}
              />
            </Field>

            <Field label={`Radius, ${s.radius}%`} htmlFor="icon-radius">
              <input
                id="icon-radius"
                type="range"
                min={20}
                max={50}
                step={1}
                value={s.radius}
                onChange={(e) => patch({ radius: Number(e.target.value) })}
                aria-label="Outer radius percentage"
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
                  style.text,
                )}
              />
            </Field>

            <Field label="Fill" htmlFor="icon-fill">
              <SegmentedControl<"solid" | "gradient">
                value={s.buildFill}
                onChange={(buildFill) => patch({ buildFill })}
                size="sm"
                ariaLabel="Fill mode"
                options={[
                  { value: "solid", label: "Solid", icon: "Square" },
                  { value: "gradient", label: "Gradient", icon: "Blend" },
                ]}
              />
            </Field>

            {s.buildFill === "solid" ? (
              <Field label="Color" htmlFor="icon-color">
                <ColorInput
                  id="icon-color"
                  value={s.buildColor}
                  onChange={(buildColor) => patch({ buildColor })}
                  ringClass={style.ring}
                />
              </Field>
            ) : (
              <div className="flex flex-wrap gap-4">
                <Field label="From" htmlFor="icon-grad-from">
                  <ColorInput
                    id="icon-grad-from"
                    value={s.gradFrom}
                    onChange={(gradFrom) => patch({ gradFrom })}
                    ringClass={style.ring}
                  />
                </Field>
                <Field label="To" htmlFor="icon-grad-to">
                  <ColorInput
                    id="icon-grad-to"
                    value={s.gradTo}
                    onChange={(gradTo) => patch({ gradTo })}
                    ringClass={style.ring}
                  />
                </Field>
              </div>
            )}
          </div>
        </>
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
    </div>
  );

  /* ── Source pane (Normalize only) ─────────────────────────────────────── */
  const sourcePane =
    s.mode === "normalize" ? (
      <SourceInput
        value={s.source}
        onChange={(source) => patch({ source })}
        onExamplePick={(value) => history.set((prev) => ({ ...prev, source: value }))}
        ringClass={style.ring}
      />
    ) : null;

  /* ── Toolbar extras: sprite/standalone export in Normalize mode ──────── */
  const toolbarExtra =
    s.mode === "normalize" && normalized.count > 0 ? (
      <>
        <ToolbarDivider />
        {sprite ? (
          <>
            <CopyButton getValue={() => sprite.sprite} label="Copy sprite" />
            <DownloadButton
              filename="icons-sprite.svg"
              getValue={() => sprite.sprite}
              mime="image/svg+xml"
              label="Sprite"
              icon="Package"
            />
          </>
        ) : null}
        <ToolbarDivider />
        <StatBadge
          label="Icons"
          value={String(normalized.count)}
          icon="Boxes"
          tone="info"
        />
      </>
    ) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {sourcePane}
      <GeneratorCanvas
        svg={previewSvg}
        controls={controls}
        controlsTitle={s.mode === "normalize" ? "Normalize controls" : "Build controls"}
        filename={s.mode === "normalize" ? "icon-set" : `icon-${s.shape}`}
        pngScale={2}
        pngBackground="transparent"
        toolbarExtra={toolbarExtra}
        onReset={reset}
        previewMinHeight={380}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Source input, a code textarea for pasted SVGs + a drop zone + examples.
 * ──────────────────────────────────────────────────────────────────────────── */

function SourceInput({
  value,
  onChange,
  onExamplePick,
  ringClass,
}: {
  value: string;
  onChange: (value: string) => void;
  onExamplePick: (value: string) => void;
  ringClass: string;
}) {
  const inputId = React.useId();

  const onDrop = React.useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "image/svg+xml" || f.name.toLowerCase().endsWith(".svg"),
      );
      if (files.length === 0) return;
      const texts = await Promise.all(files.map((f) => f.text()));
      const joined = texts.map((t) => t.trim()).join("\n\n");
      onChange(value.trim() ? `${value.trim()}\n\n${joined}` : joined);
    },
    [onChange, value],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          SVG source
        </label>
        <div className="flex items-center gap-1.5">
          <ExamplesMenu
            examples={EXAMPLES}
            onPick={onExamplePick}
            heading="Load a sample batch"
          />
          {value.trim().length > 0 && (
            <ToolbarButton
              icon="Trash2"
              label="Clear"
              variant="destructive"
              labelMode="responsive"
              onClick={() => onChange("")}
            />
          )}
        </div>
      </div>
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={
          'Paste one or more SVGs (separate them with a blank line), or drop.svg files here, e.g.\n<svg viewBox="0 0 24 24">…</svg>\n\n<svg viewBox="0 0 48 48">…</svg>'
        }
        className={cn(
          "min-h-[160px] w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:ring-2",
          ringClass,
        )}
        aria-label="SVG source: paste or drop icons to normalize"
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Color input: swatch + hex text field kept in sync, a11y-labelled.
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
