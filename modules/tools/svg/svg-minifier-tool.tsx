"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import {
  Field,
  NumberStepper,
  SegmentedControl,
  Toggle,
  ToolbarButton,
  ExamplesMenu,
  ShortcutsHelp,
  StatBadge,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import { SvgWorkspace } from "@/components/tool/svg";
import {
  minifySvg,
  sizeReport,
  type OptimizeOptions,
  type SizeReport,
} from "@/lib/svg-tools/optimize";

/** Minification presets: the headline control of this tool. */
type PresetKey = "safe" | "balanced" | "aggressive" | "custom";

/** The strip/precision options driving the live minify. */
interface MinifyOptions {
  precision: number;
  keepViewBox: boolean;
  removeDimensions: boolean;
  removeIds: boolean;
  removeTitle: boolean;
}

/** Preset → concrete options. "custom" is not in this map (user-tuned). */
const PRESETS: Record<Exclude<PresetKey, "custom">, MinifyOptions> = {
  safe: {
    precision: 4,
    keepViewBox: true,
    removeDimensions: false,
    removeIds: false,
    removeTitle: false,
  },
  balanced: {
    precision: 2,
    keepViewBox: true,
    removeDimensions: false,
    removeIds: false,
    removeTitle: true,
  },
  aggressive: {
    precision: 1,
    keepViewBox: true,
    removeDimensions: true,
    removeIds: true,
    removeTitle: true,
  },
};

const DEFAULT_PRESET: Exclude<PresetKey, "custom"> = "balanced";

const PRESET_OPTIONS = [
  { value: "safe", label: "Safe", icon: "ShieldCheck" },
  { value: "balanced", label: "Balanced", icon: "Scale" },
  { value: "aggressive", label: "Aggressive", icon: "Zap" },
] as const;

/** Compare a MinifyOptions against a preset for the "custom" fallback. */
function optionsMatch(a: MinifyOptions, b: MinifyOptions): boolean {
  return (
    a.precision === b.precision &&
    a.keepViewBox === b.keepViewBox &&
    a.removeDimensions === b.removeDimensions &&
    a.removeIds === b.removeIds &&
    a.removeTitle === b.removeTitle
  );
}

/** Derive which preset (if any) the current options correspond to. */
function presetForOptions(opts: MinifyOptions): PresetKey {
  if (optionsMatch(opts, PRESETS.safe)) return "safe";
  if (optionsMatch(opts, PRESETS.balanced)) return "balanced";
  if (optionsMatch(opts, PRESETS.aggressive)) return "aggressive";
  return "custom";
}

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${Math.max(0, Math.round(n))} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/** Curated sample SVGs so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Verbose icon",
    description: "Comments, editor namespace & redundant groups",
    value: `<?xml version="1.0" encoding="UTF-8"?>
<!-- Exported by a design tool -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="32px" height="32px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve">
  <g>
    <g>
      <path fill="#14B8A6" d="M16,2 L20,12 L30,12 L22,19 L25,29 L16,23 L7,29 L10,19 L2,12 L12,12 Z"/>
    </g>
  </g>
</svg>`,
  },
  {
    label: "Over-precise export",
    description: "12-decimal coordinates & a hidden layer",
    value: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="Frame">
    <path d="M24.0000001 6.00000012C14.0588998 6.00000012 6.00000012 14.0588998 6.00000012 24.0000001C6.00000012 33.9411004 14.0588998 42.0000001 24.0000001 42.0000001C33.9411004 42.0000001 42.0000001 33.9411004 42.0000001 24.0000001C42.0000001 14.0588998 33.9411004 6.00000012 24.0000001 6.00000012Z" fill="#0D9488"/>
    <path d="M17.0000000 24.5000000L21.5000000 29.0000000L31.0000000 19.5000000" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <g id="hidden" style="display:none"><circle cx="24" cy="24" r="22" fill="#000"/></g>
  </g>
</svg>`,
  },
  {
    label: "Gradient badge",
    description: "Preserves gradients & defs while minifying",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2dd4bf"/>
      <stop offset="1" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#g)"/>
  <path d="M40 62 L54 76 L82 44" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
];

/** Keyboard shortcuts advertised in the help dialog. */
const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+b", description: "Reset preset to Balanced" },
  { combo: "mod+shift+backspace", description: "Clear input" },
];

/**
 * SVG Minifier, the opinionated, single-purpose sibling of the SVG Optimizer.
 * It composes {@link SvgWorkspace} (editable source, live checkerboard preview of
 * the minified OUTPUT, import/copy/download/reset/share toolbar) with the
 * `minifySvg` engine, and leads with Safe / Balanced / Aggressive presets plus a
 * big before → after savings bar.
 *
 * Minification is async (the engine's browser build lazy-loads, with a
 * dependency-free fallback), so a race-guarded effect re-runs it whenever the
 * debounced input or any option changes. `useHistory` gives real undo/redo on the
 * source, `useShareState` produces deep links, and `useShortcuts` wires the
 * keyboard. Everything runs in the browser; nothing is uploaded.
 */
export default function SvgMinifierTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const input = history.state;

  const [options, setOptions] = React.useState<MinifyOptions>(
    PRESETS[DEFAULT_PRESET],
  );
  const [output, setOutput] = React.useState<string>("");
  const [report, setReport] = React.useState<SizeReport | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const preset = presetForOptions(options);

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const applyPreset = React.useCallback((key: PresetKey) => {
    if (key === "custom") return;
    setOptions(PRESETS[key]);
  }, []);

  const setOption = React.useCallback(
    <K extends keyof MinifyOptions>(key: K, value: MinifyOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Re-minify whenever the source or an option changes. Guarded by a monotonic
  // run id so a slow run can never overwrite a newer result.
  const runIdRef = React.useRef(0);
  React.useEffect(() => {
    const source = input.trim();
    if (!source) {
      setOutput("");
      setReport(null);
      setError(null);
      setBusy(false);
      return;
    }

    const runId = ++runIdRef.current;
    setBusy(true);

    const engineOptions: OptimizeOptions = {
      precision: options.precision,
      multipass: true,
      pretty: false,
      keepViewBox: options.keepViewBox,
      removeIds: options.removeIds,
      removeTitle: options.removeTitle,
      removeDimensions: options.removeDimensions,
    };

    minifySvg(input, engineOptions)
      .then((result) => {
        if (runId !== runIdRef.current) return;
        if (result.ok) {
          setOutput(result.result);
          setReport(sizeReport(input, result.result));
          setError(null);
        } else {
          setOutput("");
          setReport(null);
          setError(result.error.message);
        }
      })
      .catch(() => {
        if (runId !== runIdRef.current) return;
        setOutput("");
        setReport(null);
        setError("Couldn't minify this SVG. Check that it's valid markup.");
      })
      .finally(() => {
        if (runId === runIdRef.current) setBusy(false);
      });
  }, [input, options]);

  const reset = React.useCallback(() => {
    history.reset("");
    setOptions(PRESETS[DEFAULT_PRESET]);
  }, [history]);

  const handleShare = React.useCallback(() => {
    if (input) void share.copyShareLink(input);
  }, [input, share]);

  useShortcuts(
    {
      "mod+z": (e) => {
        e.preventDefault();
        history.undo();
      },
      "mod+shift+z": (e) => {
        e.preventDefault();
        history.redo();
      },
      "mod+y": (e) => {
        e.preventDefault();
        history.redo();
      },
      "mod+b": (e) => {
        e.preventDefault();
        setOptions(PRESETS[DEFAULT_PRESET]);
      },
      "mod+shift+backspace": (e) => {
        e.preventDefault();
        history.reset("");
      },
    },
    { allowInInputs: true },
  );

  const savedPct = report ? Math.max(0, report.savedPct) : 0;
  const barWidth = report ? Math.min(100, Math.max(0, report.savedPct)) : 0;
  const savedTone: "success" | "info" | "default" =
    report == null ? "default" : report.savedPct > 0 ? "success" : "info";

  const optionControls = (
    <div className="flex flex-col gap-4">
      {/* Headline savings bar */}
      <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Minified size
          </span>
          {report ? (
            <span className="text-sm tabular-nums text-muted-foreground">
              <span className="text-foreground">
                {formatBytes(report.bytesBefore)}
              </span>{" "}
              <span aria-hidden>→</span>{" "}
              <span className="font-semibold text-foreground">
                {formatBytes(report.bytesAfter)}
              </span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {error ? error : busy ? "Minifying…" : "Add an SVG to start"}
            </span>
          )}
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-border/70"
          role="progressbar"
          aria-label="Percentage saved"
          aria-valuenow={savedPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              savedPct > 0 ? "bg-emerald-500" : "bg-muted-foreground/40",
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatBadge
            label="Saved"
            value={report ? `${formatBytes(Math.max(0, report.savedBytes))} · ${savedPct}%` : "—"}
            icon={savedPct > 0 ? "TrendingDown" : "Minus"}
            tone={savedTone}
          />
          <StatBadge
            label="Gzip"
            value={report ? formatBytes(report.gzipEstimate) : "—"}
            icon="Archive"
            tone="default"
          />
        </div>
      </div>

      {/* Preset picker - the headline control */}
      <Field label="Preset" hint="Balanced is the everyday sweet spot">
        <SegmentedControl<PresetKey>
          value={preset === "custom" ? "custom" : preset}
          onChange={applyPreset}
          options={
            preset === "custom"
              ? [...PRESET_OPTIONS, { value: "custom", label: "Custom", icon: "SlidersHorizontal" }]
              : PRESET_OPTIONS
          }
          ariaLabel="Minification preset"
        />
      </Field>

      {/* Advanced fine-tuning */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border/60 pt-3 sm:grid-cols-3">
        <Field label="Precision" hint="Decimals on coordinates">
          <NumberStepper
            value={options.precision}
            onChange={(v) => setOption("precision", v)}
            min={0}
            max={8}
            step={1}
            ariaLabel="Coordinate precision"
          />
        </Field>
        <Toggle
          checked={options.keepViewBox}
          onChange={(v) => setOption("keepViewBox", v)}
          label="Keep viewBox"
        />
        <Toggle
          checked={options.removeDimensions}
          onChange={(v) => setOption("removeDimensions", v)}
          label="Remove width/height"
        />
        <Toggle
          checked={options.removeIds}
          onChange={(v) => setOption("removeIds", v)}
          label="Remove IDs"
        />
        <Toggle
          checked={options.removeTitle}
          onChange={(v) => setOption("removeTitle", v)}
          label="Remove title/desc"
        />
      </div>
    </div>
  );

  const toolbarExtra = (
    <>
      <ToolbarButton
        icon="Undo2"
        label="Undo"
        onClick={history.undo}
        disabled={!history.canUndo}
      />
      <ToolbarButton
        icon="Redo2"
        label="Redo"
        onClick={history.redo}
        disabled={!history.canRedo}
      />
      <ExamplesMenu examples={EXAMPLES} onPick={(value) => history.set(value)} />
      <ShortcutsHelp shortcuts={SHORTCUTS} />
      {busy && input.trim() && (
        <StatBadge value="Minifying…" icon="Loader" tone="info" />
      )}
    </>
  );

  return (
    <SvgWorkspace
      input={input}
      onInputChange={(v) => history.set(v)}
      output={error ? input : output || input}
      inputLabel="SVG source"
      placeholder="Paste SVG markup, drop a .svg file, or load a sample…"
      filename="minified.svg"
      copyTarget="output"
      options={optionControls}
      toolbarExtra={toolbarExtra}
      onReset={reset}
      onShare={handleShare}
      shareJustCopied={share.justCopied}
      emptyLabel="Minified SVG preview appears here"
    />
  );
}
