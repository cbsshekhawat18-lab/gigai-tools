"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import {
  Field,
  Toggle,
  SegmentedControl,
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
  optimizeSvg,
  sizeReport,
  type OptimizeOptions,
  type SizeReport,
} from "@/lib/svg-tools/optimize";

/** The full option set driving the live shrink. Precision is the headline. */
interface SizeOptions {
  precision: number;
  keepViewBox: boolean;
  removeDimensions: boolean;
  removeIds: boolean;
  removeTitle: boolean;
  multipass: boolean;
}

const MIN_PRECISION = 0;
const MAX_PRECISION = 8;

const DEFAULT_OPTIONS: SizeOptions = {
  precision: 3,
  keepViewBox: true,
  removeDimensions: false,
  removeIds: false,
  removeTitle: false,
  multipass: true,
};

/** Precision presets: one click to the three most useful spots on the slider. */
type PresetKey = "lossless" | "balanced" | "aggressive";

const PRESET_PRECISION: Record<PresetKey, number> = {
  lossless: 5,
  balanced: 3,
  aggressive: 1,
};

const PRESET_OPTIONS: ReadonlyArray<{ value: PresetKey; label: string }> = [
  { value: "lossless", label: "Lossless" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" },
];

/** Which preset (if any) the current precision matches, for the segmented UI. */
function precisionToPreset(precision: number): PresetKey | null {
  const hit = (Object.keys(PRESET_PRECISION) as PresetKey[]).find(
    (k) => PRESET_PRECISION[k] === precision,
  );
  return hit ?? null;
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

/**
 * Curated samples chosen to make the precision slider obviously useful, each
 * carries deliberately over-precise coordinates so dragging precision down
 * produces a big, visible saving.
 */
const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Over-precise logo path",
    description: "12-decimal coordinates begging to be rounded",
    value: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32.000000012 8.000000041C18.745166204 8.000000041 8.000000041 18.745166204 8.000000041 32.000000012C8.000000041 45.254833819 18.745166204 56.000000012 32.000000012 56.000000012C45.254833819 56.000000012 56.000000012 45.254833819 56.000000012 32.000000012C56.000000012 18.745166204 45.254833819 8.000000041 32.000000012 8.000000041Z" fill="#F59E0B"/>
  <path d="M22.500000031 32.000000012L29.000000041 38.500000021L42.000000059 25.500000034" stroke="#ffffff" stroke-width="4.000000004" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,
  },
  {
    label: "Traced illustration",
    description: "Long float coordinates from an auto-tracer",
    value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path d="M12.4839201 50.1029384Q30.9182734 12.0928374 50.0001923 30.4839201T87.5192837 49.9283746Q69.1029384 87.4839201 49.9182734 69.5928374T12.4839201 50.1029384Z" fill="#fbbf24"/>
  <circle cx="50.0000019" cy="50.0000019" r="6.4839201748" fill="#78350f"/>
</svg>`,
  },
  {
    label: "Fluid-ready badge",
    description: "Gradient badge to shrink without breaking scaling",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbbf24"/>
      <stop offset="1" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect x="8.0000001" y="8.0000001" width="104.0000002" height="104.0000002" rx="24.0000004" fill="url(#g)"/>
  <path d="M40.0000001 62.0000001L54.0000001 76.0000001L82.0000001 44.0000001" fill="none" stroke="#ffffff" stroke-width="8.0000001" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
];

/** Keyboard shortcuts advertised in the help dialog. */
const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+arrowdown", description: "Lower precision (smaller file)" },
  { combo: "mod+arrowup", description: "Raise precision (safer)" },
  { combo: "mod+b", description: "Reset options to defaults" },
  { combo: "mod+shift+backspace", description: "Clear input" },
];

/**
 * SVG Size Optimizer: the precision-first shrinker. It composes
 * {@link SvgWorkspace} (editable source, live checkerboard preview of the
 * shrunk OUTPUT, import/copy/download/reset/share toolbar, options slot) with
 * the `optimizeSvg` engine and a `sizeReport` trade-off meter.
 *
 * The defining control is a large precision range slider plus Lossless /
 * Balanced / Aggressive presets; every move re-runs the async optimize (SVGO
 * browser build with a dependency-free fallback) and updates the byte + gzip +
 * saved-percentage badges live, so the size cost of each decimal is visible.
 * `useHistory` gives undo/redo on the source, `useShareState` produces deep
 * links, and `useShortcuts` wires the keyboard. Everything runs in the browser.
 */
export default function SvgSizeOptimizerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const input = history.state;

  const [options, setOptions] = React.useState<SizeOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = React.useState<string>("");
  const [report, setReport] = React.useState<SizeReport | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const setOption = React.useCallback(
    <K extends keyof SizeOptions>(key: K, value: SizeOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setPrecision = React.useCallback((value: number) => {
    const clamped = Math.min(MAX_PRECISION, Math.max(MIN_PRECISION, Math.round(value)));
    setOptions((prev) => ({ ...prev, precision: clamped }));
  }, []);

  const applyPreset = React.useCallback((preset: PresetKey) => {
    setPrecision(PRESET_PRECISION[preset]);
  }, [setPrecision]);

  // Re-optimize whenever the source or an option changes. A monotonic run id
  // guards against a slow run overwriting a newer result.
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
      multipass: options.multipass,
      keepViewBox: options.keepViewBox,
      removeIds: options.removeIds,
      removeTitle: options.removeTitle,
      removeDimensions: options.removeDimensions,
    };

    optimizeSvg(input, engineOptions)
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
        setError("Couldn't shrink this SVG. Check that it's valid markup.");
      })
      .finally(() => {
        if (runId === runIdRef.current) setBusy(false);
      });
  }, [input, options]);

  const reset = React.useCallback(() => {
    history.reset("");
    setOptions(DEFAULT_OPTIONS);
  }, [history]);

  const resetOptions = React.useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
  }, []);

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
      "mod+arrowdown": (e) => {
        e.preventDefault();
        setPrecision(options.precision - 1);
      },
      "mod+arrowup": (e) => {
        e.preventDefault();
        setPrecision(options.precision + 1);
      },
      "mod+b": (e) => {
        e.preventDefault();
        resetOptions();
      },
      "mod+shift+backspace": (e) => {
        e.preventDefault();
        history.reset("");
      },
    },
    { allowInInputs: true },
  );

  const savedTone: "success" | "info" | "default" =
    report == null ? "default" : report.savedPct > 0 ? "success" : "info";

  const activePreset = precisionToPreset(options.precision);

  const precisionLabel =
    options.precision === 0
      ? "0 · integers only"
      : options.precision >= MAX_PRECISION
        ? `${options.precision} · lossless`
        : `${options.precision} decimal${options.precision === 1 ? "" : "s"}`;

  const optionControls = (
    <div className="flex flex-col gap-4">
      {/* Headline precision control: the whole point of this tool. */}
      <Field
        label={`Coordinate precision, ${precisionLabel}`}
        hint="Fewer decimals means fewer bytes. Drag until the preview just starts to shift, then step back one."
      >
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={MIN_PRECISION}
            max={MAX_PRECISION}
            step={1}
            value={options.precision}
            onChange={(e) => setPrecision(Number(e.target.value))}
            aria-label="Coordinate precision"
            className="w-full accent-amber-500"
          />
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
            <span>Smaller</span>
            <SegmentedControl<PresetKey>
              value={activePreset ?? "balanced"}
              onChange={applyPreset}
              options={PRESET_OPTIONS}
              size="sm"
              ariaLabel="Precision preset"
              className={cn(activePreset ? "" : "opacity-70")}
            />
            <span>Safer</span>
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border/60 pt-3 sm:grid-cols-3">
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
          checked={options.multipass}
          onChange={(v) => setOption("multipass", v)}
          label="Multipass"
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

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        {report ? (
          <>
            <StatBadge
              label="Before"
              value={formatBytes(report.bytesBefore)}
              icon="FileInput"
              tone="default"
            />
            <StatBadge
              label="After"
              value={formatBytes(report.bytesAfter)}
              icon="FileOutput"
              tone="info"
            />
            <StatBadge
              label="Saved"
              value={`${formatBytes(Math.max(0, report.savedBytes))} · ${report.savedPct}%`}
              icon={report.savedPct > 0 ? "TrendingDown" : "Minus"}
              tone={savedTone}
            />
            <StatBadge
              label="Gzip est."
              value={formatBytes(report.gzipEstimate)}
              icon="Archive"
              tone="default"
            />
          </>
        ) : (
          <span
            className={cn(
              "text-xs",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {error
              ? error
              : busy
                ? "Shrinking…"
                : "Add an SVG, then drag precision to watch the size drop."}
          </span>
        )}
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
        <StatBadge value="Shrinking…" icon="Loader" tone="info" />
      )}
    </>
  );

  return (
    <SvgWorkspace
      input={input}
      onInputChange={(v) => history.set(v)}
      output={error ? input : output || input}
      inputLabel="SVG source"
      placeholder="Paste SVG markup, drop a .svg file, or load a sample with over-precise coordinates…"
      filename="shrunk.svg"
      copyTarget="output"
      options={optionControls}
      toolbarExtra={toolbarExtra}
      onReset={reset}
      onShare={handleShare}
      shareJustCopied={share.justCopied}
      emptyLabel="Shrunk SVG preview appears here"
    />
  );
}
