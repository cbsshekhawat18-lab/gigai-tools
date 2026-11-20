"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { makePlaceholder } from "@/lib/svg-tools/generate";
import { svgToDataUri } from "@/lib/svg-tools/convert";
import { GeneratorCanvas } from "@/components/tool/svg";
import {
  Field,
  NumberStepper,
  SegmentedControl,
  CopyButton,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * A single serialisable object drives the tool, so undo/redo and presets are
 * just "swap the state". `label` empty ⇒ auto "W × H"; `fontSize` 0 ⇒ auto.
 * ──────────────────────────────────────────────────────────────────────────── */

interface PlaceholderState {
  width: number;
  height: number;
  label: string;
  bg: string;
  fg: string;
  fontSize: number; // 0 = auto (scales to the box)
}

const MIN_DIM = 1;
const MAX_DIM = 4096;

const DEFAULT_STATE: PlaceholderState = {
  width: 600,
  height: 400,
  label: "",
  bg: "#e2e8f0",
  fg: "#64748b",
  fontSize: 0,
};

/** One-click starting sizes for the most common prototyping slots. */
const PRESETS: { label: string; icon: string; width: number; height: number }[] = [
  { label: "16:9", icon: "RectangleHorizontal", width: 1280, height: 720 },
  { label: "Square", icon: "Square", width: 600, height: 600 },
  { label: "Banner", icon: "PanelTop", width: 1200, height: 300 },
  { label: "Avatar", icon: "Circle", width: 256, height: 256 },
  { label: "Story", icon: "RectangleVertical", width: 1080, height: 1920 },
  { label: "Card", icon: "SquareStack", width: 400, height: 300 },
];

/**
 * SVG Placeholder Generator: the "Generate" tool for prototyping imagery. Four
 * inputs (width, height, label, colors) drive `makePlaceholder` from the SVG
 * engine into a tiny, scalable labelled box. Live big preview via
 * <GeneratorCanvas> with copy, scalable SVG download and a PNG export, plus a
 * one-click data-URI copy in the toolbar. Full undo/redo, size presets and
 * keyboard shortcuts. Everything runs in-browser and is deterministic.
 */
export default function SvgPlaceholderGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<PlaceholderState>(DEFAULT_STATE, { debounceMs: 300 });
  const s = history.state;

  /** Patch state through history, coalesces rapid edits into one undo step. */
  const patch = React.useCallback(
    (next: Partial<PlaceholderState>) => {
      history.set((prev) => ({ ...prev, ...next }));
    },
    [history],
  );

  const loadPreset = React.useCallback(
    (width: number, height: number) => patch({ width, height }),
    [patch],
  );

  const reset = React.useCallback(() => history.reset(DEFAULT_STATE), [history]);

  // The generated SVG: pure, recomputed only when inputs change. An empty
  // label lets makePlaceholder fall back to its "W × H" default; fontSize 0
  // means auto (the engine derives it from the shorter side).
  const svg = React.useMemo(
    () =>
      makePlaceholder({
        w: s.width,
        h: s.height,
        bg: s.bg,
        fg: s.fg,
        ...(s.label.trim() ? { text: s.label } : {}),
        ...(s.fontSize > 0 ? { fontSize: s.fontSize } : {}),
      }),
    [s.width, s.height, s.label, s.bg, s.fg, s.fontSize],
  );

  // URL-optimized data URI for pasting into <img>/CSS. Falls back to raw SVG.
  const dataUri = React.useMemo(() => {
    const r = svgToDataUri(svg);
    return r.ok ? r.result : svg;
  }, [svg]);

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

  const isSquareish = s.width === s.height;

  const controls = (
    <div className="flex flex-col gap-5">
      {/* Presets */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Size presets</span>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => {
            const active = s.width === p.width && s.height === p.height;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => loadPreset(p.width, p.height)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? cn("border-transparent text-white", style.solid)
                    : "border-border bg-background text-foreground hover:bg-accent/50",
                )}
              >
                <Icon name={p.icon} size={13} className={active ? "text-white" : style.text} />
                <span className="truncate">{p.label}</span>
                <span className="ml-auto font-mono text-[10px] opacity-70">
                  {p.width}×{p.height}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dimensions */}
      <div className="flex flex-wrap gap-4">
        <Field label="Width (px)" htmlFor="ph-width">
          <NumberStepper
            id="ph-width"
            value={s.width}
            onChange={(width) => patch({ width })}
            min={MIN_DIM}
            max={MAX_DIM}
            step={10}
            ariaLabel="Placeholder width in pixels"
          />
        </Field>
        <Field label="Height (px)" htmlFor="ph-height">
          <NumberStepper
            id="ph-height"
            value={s.height}
            onChange={(height) => patch({ height })}
            min={MIN_DIM}
            max={MAX_DIM}
            step={10}
            ariaLabel="Placeholder height in pixels"
          />
        </Field>
        <button
          type="button"
          onClick={() => patch({ width: s.height, height: s.width })}
          disabled={isSquareish}
          aria-label="Swap width and height"
          className="mt-5 inline-flex h-8 items-center gap-1.5 self-start rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="ArrowLeftRight" size={13} />
          Swap
        </button>
      </div>

      {/* Label */}
      <Field
        label="Label"
        htmlFor="ph-label"
        hint="Leave empty to auto-show the dimensions (e.g. 600 × 400)."
      >
        <input
          id="ph-label"
          type="text"
          value={s.label}
          onChange={(e) => patch({ label: e.target.value })}
          placeholder={`${s.width} × ${s.height}`}
          spellCheck={false}
          autoComplete="off"
          aria-label="Placeholder label text"
          className={cn(
            "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2",
            style.ring,
          )}
        />
      </Field>

      {/* Font size */}
      <Field label="Font size" htmlFor="ph-fontmode">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl<"auto" | "custom">
            value={s.fontSize > 0 ? "custom" : "auto"}
            onChange={(mode) =>
              patch({
                fontSize:
                  mode === "auto"
                    ? 0
                    : Math.max(1, Math.round(Math.min(s.width, s.height) * 0.15)),
              })
            }
            size="sm"
            ariaLabel="Font size mode"
            options={[
              { value: "auto", label: "Auto", icon: "Wand2" },
              { value: "custom", label: "Custom", icon: "Type" },
            ]}
          />
          {s.fontSize > 0 && (
            <NumberStepper
              value={s.fontSize}
              onChange={(fontSize) => patch({ fontSize })}
              min={4}
              max={512}
              step={2}
              ariaLabel="Custom font size in pixels"
            />
          )}
        </div>
      </Field>

      {/* Colors */}
      <div className="flex flex-wrap gap-4">
        <Field label="Background" htmlFor="ph-bg">
          <ColorInput
            id="ph-bg"
            value={s.bg}
            onChange={(bg) => patch({ bg })}
            ringClass={style.ring}
          />
        </Field>
        <Field label="Text" htmlFor="ph-fg">
          <ColorInput
            id="ph-fg"
            value={s.fg}
            onChange={(fg) => patch({ fg })}
            ringClass={style.ring}
          />
        </Field>
      </div>

      {/* Data URI - copy-ready for <img>/CSS */}
      <Field
        label="Data URI"
        htmlFor="ph-datauri"
        hint="URL-optimized. Paste into an <img src>, CSS background-image, or a Tailwind class."
      >
        <div className="flex items-stretch gap-1.5">
          <input
            id="ph-datauri"
            type="text"
            value={dataUri}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            spellCheck={false}
            aria-label="Placeholder data URI"
            className={cn(
              "h-8 min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-2.5 font-mono text-[11px] text-foreground outline-none focus-visible:ring-2",
              style.ring,
            )}
          />
          <CopyButton getValue={() => dataUri} label="Copy" />
        </div>
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

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          The output is a single{" "}
          <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">
            &lt;svg&gt;
          </code>{" "}
          - a colored rectangle plus a centred caption. It scales to any size and
          stays crisp on every screen.
        </span>
      </p>
    </div>
  );

  // PNG export honours the exact pixel dimensions of the placeholder.
  return (
    <GeneratorCanvas
      svg={svg}
      controls={controls}
      controlsTitle="Placeholder controls"
      filename="placeholder-gigai"
      pngSize={{ width: s.width, height: s.height }}
      pngBackground={s.bg}
      onReset={reset}
      previewMinHeight={420}
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
