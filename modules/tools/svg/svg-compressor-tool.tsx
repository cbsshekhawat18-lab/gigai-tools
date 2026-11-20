"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import {
  Field,
  NumberStepper,
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
  optimizeSvg,
  sizeReport,
  type OptimizeOptions,
  type SizeReport,
} from "@/lib/svg-tools/optimize";

/** The full option set driving the live compress. */
interface CompressorOptions {
  precision: number;
  keepViewBox: boolean;
  removeDimensions: boolean;
  removeIds: boolean;
  removeTitle: boolean;
  multipass: boolean;
}

const DEFAULT_OPTIONS: CompressorOptions = {
  precision: 2,
  keepViewBox: true,
  removeDimensions: false,
  removeIds: false,
  removeTitle: false,
  multipass: true,
};

/**
 * Brotli, modeled from the engine's gzip estimate. On text markup Brotli
 * typically lands ~10–20% under gzip; we take a mid-band factor. Like the gzip
 * figure this is an ESTIMATE (not a live compressor) and is labeled as such in
 * the UI. Clamped so tiny files never model to nothing.
 */
const BROTLI_OF_GZIP = 0.85;
function estimateBrotli(gzip: number): number {
  if (gzip <= 0) return 0;
  return Math.max(18, Math.round(gzip * BROTLI_OF_GZIP));
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

/** Percent saved between two byte counts, one decimal, floored at input>0. */
function pctSaved(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 1000) / 10;
}

/** Tone for a savings badge: green when we shrank, neutral info otherwise. */
function toneFor(pct: number): "success" | "info" {
  return pct > 0 ? "success" : "info";
}

/** Curated sample SVGs so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Repetitive path (compresses hard)",
    description: "Long, redundant path data: big gzip/Brotli win",
    value: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Exported from a design tool -->
  <g id="wave" clip-path="url(#c0)">
    <path d="M0.0000000 32.0000000C4.0000000 28.0000000 8.0000000 36.0000000 12.0000000 32.0000000C16.0000000 28.0000000 20.0000000 36.0000000 24.0000000 32.0000000C28.0000000 28.0000000 32.0000000 36.0000000 36.0000000 32.0000000C40.0000000 28.0000000 44.0000000 36.0000000 48.0000000 32.0000000C52.0000000 28.0000000 56.0000000 36.0000000 60.0000000 32.0000000C64.0000000 28.0000000 68.0000000 36.0000000 72.0000000 32.0000000" stroke="#0d9488" stroke-width="3" stroke-linecap="round"/>
    <g id="hidden" style="display:none"><rect width="64" height="64" fill="#000"/></g>
  </g>
  <defs><clipPath id="c0"><rect width="64" height="64"/></clipPath></defs>
</svg>`,
  },
  {
    label: "Gradient badge",
    description: "Keeps gradients & defs. Modest compressed size",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5eead4"/>
      <stop offset="1" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#g)"/>
  <path d="M40 62 L54 76 L82 44" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    label: "Verbose icon",
    description: "Redundant groups & attributes to collapse",
    value: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="32px" height="32px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve">
  <g>
    <g>
      <path fill="#14b8a6" d="M16,2 L20,12 L30,12 L22,19 L25,29 L16,23 L7,29 L10,19 L2,12 L12,12 Z"/>
    </g>
  </g>
</svg>`,
  },
];

/** Keyboard shortcuts advertised in the help dialog (mod combos also fire in the editor). */
const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+b", description: "Reset compression options" },
  { combo: "mod+shift+backspace", description: "Clear input" },
];

/**
 * SVG Compressor: the transfer-size member of the SVG suite. It composes
 * {@link SvgWorkspace} (editable source, live checkerboard preview of the
 * compressed OUTPUT, import/copy/download/reset/share toolbar, options slot)
 * with the `optimizeSvg` engine and a `sizeReport`-driven transfer meter that
 * surfaces raw, estimated gzip and estimated Brotli payloads before/after.
 *
 * Optimization is async (the engine lazy-loads, with a dependency-free
 * fallback), so a small effect re-runs it whenever the debounced input or any
 * option changes and stores the result plus its size report. `useHistory`
 * gives real undo/redo on the source, `useShareState` produces deep links, and
 * `useShortcuts` wires the keyboard. Everything runs in the browser; nothing is
 * uploaded. The gzip/Brotli figures are entropy-based ESTIMATES, labeled as
 * such in the meter. Not a live compressor.
 */
export default function SvgCompressorTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const input = history.state;

  const [options, setOptions] = React.useState<CompressorOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = React.useState<string>("");
  const [report, setReport] = React.useState<SizeReport | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const setOption = React.useCallback(
    <K extends keyof CompressorOptions>(key: K, value: CompressorOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Re-compress whenever the source or an option changes. Guarded against races
  // by a monotonic run id so a slow run can never overwrite a newer result.
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
        setError("Couldn't compress this SVG. Check that it's valid markup.");
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

  // Derived transfer figures. gzip comes straight from the engine's estimate;
  // Brotli is modeled from it. Both before/after so the meter can show savings.
  const transfer = React.useMemo(() => {
    if (!report) return null;
    const brotliBefore = estimateBrotli(report.gzipBefore);
    const brotliAfter = estimateBrotli(report.gzipEstimate);
    return {
      raw: {
        before: report.bytesBefore,
        after: report.bytesAfter,
        pct: report.savedPct,
      },
      gzip: {
        before: report.gzipBefore,
        after: report.gzipEstimate,
        pct: pctSaved(report.gzipBefore, report.gzipEstimate),
      },
      brotli: {
        before: brotliBefore,
        after: brotliAfter,
        pct: pctSaved(brotliBefore, brotliAfter),
      },
    };
  }, [report]);

  const optionControls = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        <Field label="Precision" hint="Decimals: fewer compresses harder">
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

      <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
        {transfer ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <StatBadge
                label="Raw"
                value={`${formatBytes(transfer.raw.after)} · ${transfer.raw.pct}%`}
                icon="FileOutput"
                tone={toneFor(transfer.raw.pct)}
              />
              <StatBadge
                label="gzip*"
                value={`${formatBytes(transfer.gzip.after)} · ${transfer.gzip.pct}%`}
                icon="Archive"
                tone={toneFor(transfer.gzip.pct)}
              />
              <StatBadge
                label="Brotli*"
                value={`${formatBytes(transfer.brotli.after)} · ${transfer.brotli.pct}%`}
                icon="TrendingDown"
                tone={toneFor(transfer.brotli.pct)}
              />
              <StatBadge
                label="Was"
                value={`${formatBytes(transfer.raw.before)} raw`}
                icon="FileInput"
                tone="default"
              />
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              <span className="font-medium">Transfer size</span> - the bytes that
              cross the wire once your server compresses the file.{" "}
              <span className="text-muted-foreground/80">
                *gzip and Brotli are entropy-based estimates, not a live
                compressor; confirm production budgets against your server&rsquo;s
                Content-Encoding.
              </span>
            </p>
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
                ? "Compressing…"
                : "Add an SVG to see its raw, gzip and Brotli transfer size."}
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
        <StatBadge value="Compressing…" icon="Loader" tone="info" />
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
      filename="compressed.svg"
      copyTarget="output"
      options={optionControls}
      toolbarExtra={toolbarExtra}
      onReset={reset}
      onShare={handleShare}
      shareJustCopied={share.justCopied}
      emptyLabel="Compressed SVG preview appears here"
    />
  );
}
