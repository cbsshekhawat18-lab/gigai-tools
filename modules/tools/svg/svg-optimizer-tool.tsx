"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  CopyButton,
  DownloadButton,
  CodePane,
  FileDropZone,
  useFileDrop,
  SegmentedControl,
  Toggle,
  NumberStepper,
  Field,
  StatBadge,
  ExamplesMenu,
  ShortcutsHelp,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import { SvgCompare, SvgIconPreview } from "@/components/tool/svg";
import { download } from "@/components/tool/dev";
import {
  optimizeBatch,
  zipBatch,
  batchCsv,
  batchJson,
  type BatchResultItem,
  type BatchProgress,
} from "@/lib/svg-tools/batch";
import { analyzeA11y, applyA11yFix, type A11yReport, type A11yFixId } from "@/lib/svg-tools/a11y";
import { sizeReport, type SizeReport } from "@/lib/svg-tools/optimize";
import { optimizeAsync } from "@/lib/svg-tools/optimize-runner";
import {
  getPluginRegistry,
  PLUGIN_CATEGORIES,
  PRESET_DEFAULT_PLUGINS,
  type EngineOptions,
  type OptimizeMode,
  type CustomPlugins,
  type PluginInfo,
  type PluginCategory,
} from "@/lib/svg-tools/svgo-engine";
import { analyzeForOptimize, computeMetrics, KIND_LABEL, type SvgMetrics, type SvgKind } from "@/lib/svg-tools/analyze";
import { computeHealth, type HealthReport, type QuickFixId } from "@/lib/svg-tools/health";
import { buildReport, type OptimizationReport } from "@/lib/svg-tools/report";
import {
  BUILTIN_PRESETS,
  readCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  subscribePresets,
  type OptimizePreset,
} from "@/lib/svg-tools/presets";
import {
  EXPORT_FORMATS,
  exportAs,
  exportFilename,
  type ExportFormatId,
} from "@/lib/svg-tools/export-formats";

/* ─────────────────────────────── samples ─────────────────────────────────── */

const SAMPLE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2"><!-- home icon --><path d="M3.00000 12.00000 L12.0000 3.0000 L21.00000 12.0000"/><path d="M5 10v10h14V10"/></svg>';
const SAMPLE_LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 120 40"><metadata>Made with a vector editor</metadata><g id="layer1"><rect id="r1" x="0" y="0" width="120.000" height="40.0000" rx="8" fill="#4f46e5"/><text x="16" y="26" fill="#ffffff" font-family="sans-serif" font-size="18">GigAI</text></g></svg>';

const EXAMPLES: ReadonlyArray<Example<string>> = [
  { label: "Editor-exported logo", description: "Metadata + editor cruft to strip", icon: "PenTool", value: SAMPLE_LOGO },
  { label: "Verbose icon", description: "High-precision coordinates + comments", icon: "Hexagon", value: SAMPLE_ICON },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+shift+backspace", description: "Clear" },
];

const MODE_OPTIONS = [
  { value: "smart" as const, label: "Smart", icon: "Sparkles" },
  { value: "safe" as const, label: "Safe", icon: "ShieldCheck" },
  { value: "max" as const, label: "Maximum", icon: "Zap" },
  { value: "custom" as const, label: "Custom", icon: "SlidersHorizontal" },
];

const MODE_HINT: Record<OptimizeMode, string> = {
  smart: "Inspects your SVG and picks the best-fit settings automatically: the safe default for anything.",
  safe: "Conservative: keeps IDs, titles and hidden layers. Zero-risk for SVGs you'll edit later.",
  max: "Squeezes out every byte: strips dimensions, titles and metadata. Best for final web export.",
  custom: "Full control: switch any of SVGO's optimizations on or off below.",
};

/** Human byte formatter. */
function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/* ──────────────────────────── small UI pieces ────────────────────────────── */

function StatCard({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "accent" | "good" | "warn" }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-card/40 px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums text-foreground",
          tone === "accent" && "text-primary",
          tone === "good" && "text-emerald-500",
          tone === "warn" && "text-amber-500",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const HEALTH_FIX_ICON: Record<QuickFixId, string> = {
  metadata: "FileMinus",
  ids: "Hash",
  precision: "Ruler",
  "empty-groups": "Group",
  hidden: "EyeOff",
  styles: "Paintbrush",
  all: "WandSparkles",
};

/** A compact circular score gauge (0–100). */
function HealthRing({ score }: { score: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * c;
  const color = pct >= 80 ? "#10b981" : pct >= 55 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative size-12 shrink-0">
      <svg viewBox="0 0 44 44" className="size-12 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/40" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-foreground">{pct}</span>
    </div>
  );
}

/* ─────────────────────────────── the tool ────────────────────────────────── */

export default function SvgOptimizerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const input = history.state;

  const [mode, setMode] = React.useState<OptimizeMode>("smart");
  const [precision, setPrecision] = React.useState(2);
  const [pretty, setPretty] = React.useState(false);
  const [multipass, setMultipass] = React.useState(true);
  const [custom, setCustom] = React.useState<CustomPlugins>({});
  const [registry, setRegistry] = React.useState<PluginInfo[]>([]);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [pluginQuery, setPluginQuery] = React.useState("");

  const [output, setOutput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [detected, setDetected] = React.useState<SvgKind | null>(null);

  // Phase 2: presets, export, version history
  const [presetId, setPresetId] = React.useState<string>("general-web");
  const [customPresets, setCustomPresets] = React.useState<OptimizePreset[]>([]);
  const [exportFormat, setExportFormat] = React.useState<ExportFormatId>("svg");
  const [componentName, setComponentName] = React.useState("SvgIcon");
  const [versions, setVersions] = React.useState<Array<{ id: number; label: string; svg: string }>>([]);
  const [compareBase, setCompareBase] = React.useState<string | null>(null);
  const versionIdRef = React.useRef(1);

  // Phase 3: single/batch view, batch queue, a11y
  const [view, setView] = React.useState<"single" | "batch">("single");
  const [batchInputs, setBatchInputs] = React.useState<Array<{ name: string; svg: string }>>([]);
  const [batchResults, setBatchResults] = React.useState<BatchResultItem[]>([]);
  const [batchProgress, setBatchProgress] = React.useState<BatchProgress | null>(null);
  const [batchBusy, setBatchBusy] = React.useState(false);
  const cancelRef = React.useRef(false);
  const [showIconPreview, setShowIconPreview] = React.useState(false);

  const share = useShareState({ onInit: (v) => history.reset(v) });
  const runIdRef = React.useRef(0);
  const { isDragging, dropProps } = useFileDrop({
    onFiles: (files) => {
      const file = files[0];
      if (file) void file.text().then((t) => history.set(t));
    },
  });

  // Load the plugin registry once; seed Custom toggles from the preset defaults.
  React.useEffect(() => {
    let live = true;
    void getPluginRegistry().then((list) => {
      if (!live) return;
      setRegistry(list);
      const preset = new Set(PRESET_DEFAULT_PLUGINS);
      const seed: CustomPlugins = {};
      for (const p of list) seed[p.name] = preset.has(p.name);
      setCustom(seed);
    });
    return () => {
      live = false;
    };
  }, []);

  // Custom presets: load once + stay in sync across tabs/components.
  React.useEffect(() => {
    const sync = () => setCustomPresets(readCustomPresets());
    sync();
    return subscribePresets(sync);
  }, []);

  // Live optimize (debounced, worker-backed).
  React.useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      setError(null);
      setDetected(null);
      return;
    }
    const runId = ++runIdRef.current;
    setBusy(true);
    const timer = setTimeout(() => {
      const started = performance.now();
      const kind = mode === "smart" ? analyzeForOptimize(trimmed).kind : undefined;
      setDetected(mode === "smart" ? kind ?? null : null);
      const opts: EngineOptions = { mode, precision, pretty, multipass, custom, kind };
      void optimizeAsync(trimmed, opts)
        .then((res) => {
          if (runId !== runIdRef.current) return;
          setElapsed(performance.now() - started);
          if (res.ok) {
            setOutput(res.data);
            setError(null);
          } else {
            setOutput(trimmed);
            setError(res.error ?? "Could not optimize this SVG.");
          }
        })
        .finally(() => {
          if (runId === runIdRef.current) setBusy(false);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [input, mode, precision, pretty, multipass, custom]);

  // Derived analysis.
  const metricsAfter: SvgMetrics = React.useMemo(() => computeMetrics(output || input), [output, input]);
  const metricsBefore: SvgMetrics = React.useMemo(() => computeMetrics(input), [input]);
  const report: SizeReport = React.useMemo(() => sizeReport(input, output || input), [input, output]);
  const optReport: OptimizationReport = React.useMemo(() => buildReport(input, output || input), [input, output]);
  const health: HealthReport = React.useMemo(() => computeHealth(input, metricsBefore), [input, metricsBefore]);
  const a11y: A11yReport = React.useMemo(() => analyzeA11y(output || input), [output, input]);

  const hasInput = input.trim().length > 0;

  /* Phase 3: batch handlers */
  const addBatchFiles = React.useCallback((files: File[]) => {
    const svgFiles = files.filter((f) => /\.svg$/i.test(f.name) || f.type === "image/svg+xml");
    void Promise.all(svgFiles.map(async (f) => ({ name: f.name, svg: await f.text() }))).then((items) => {
      setBatchInputs((prev) => [...prev, ...items]);
      setBatchResults([]);
    });
  }, []);

  const runBatch = React.useCallback(() => {
    if (batchInputs.length === 0 || batchBusy) return;
    cancelRef.current = false;
    setBatchBusy(true);
    setBatchResults([]);
    const opts: EngineOptions = { mode, precision, pretty, multipass, custom };
    void optimizeBatch(batchInputs, opts, {
      onProgress: (p) => setBatchProgress(p),
      shouldCancel: () => cancelRef.current,
    })
      .then((res) => setBatchResults(res))
      .finally(() => {
        setBatchBusy(false);
        setBatchProgress(null);
      });
  }, [batchInputs, batchBusy, mode, precision, pretty, multipass, custom]);

  const downloadZip = React.useCallback(() => {
    if (batchResults.length === 0) return;
    void zipBatch(batchResults).then((nb) => download(nb.name, nb.blob));
  }, [batchResults]);

  /** All presets (built-in first, then the user's saved ones). */
  const allPresets = React.useMemo(() => [...BUILTIN_PRESETS, ...customPresets], [customPresets]);

  /** The optimized SVG rendered in the currently-selected export format. */
  const exported = React.useMemo(() => {
    const res = exportAs(output || input, exportFormat, componentName);
    return res.ok ? res.result : output || input;
  }, [output, input, exportFormat, componentName]);

  const exportMeta = EXPORT_FORMATS.find((f) => f.id === exportFormat) ?? EXPORT_FORMATS[0]!;

  /** Apply a preset: adopt its optimize settings and suggested export format. */
  const applyPreset = React.useCallback((p: OptimizePreset) => {
    setPresetId(p.id);
    setMode(p.options.mode);
    setPrecision(p.options.precision);
    setPretty(p.options.pretty);
    setMultipass(p.options.multipass);
    if (p.options.custom) setCustom(p.options.custom);
    if (p.exportFormat) setExportFormat(p.exportFormat);
  }, []);

  /** Snapshot the current source so it can be restored or compared later. */
  const snapshot = React.useCallback(
    (label: string, svg: string) => {
      setVersions((v) => [{ id: versionIdRef.current++, label, svg }, ...v].slice(0, 8));
    },
    [],
  );

  /* actions */
  const reset = React.useCallback(() => {
    history.reset("");
    setOutput("");
    setError(null);
    setMode("smart");
  }, [history]);

  const setPlugin = (name: string, on: boolean) => setCustom((c) => ({ ...c, [name]: on }));
  const resetPlugins = () => {
    const preset = new Set(PRESET_DEFAULT_PLUGINS);
    setCustom(Object.fromEntries(registry.map((p) => [p.name, preset.has(p.name)])));
  };

  /** Run a one-off fix on the source and adopt the result as the new source. */
  const runFix = React.useCallback(
    (opts: EngineOptions, label = "Fix") => {
      const trimmed = input.trim();
      if (!trimmed) return;
      void optimizeAsync(trimmed, opts).then((res) => {
        if (res.ok && res.data && res.data !== trimmed) {
          snapshot(`Before "${label}"`, trimmed);
          history.set(res.data);
        }
      });
    },
    [input, history, snapshot],
  );

  const a11yFix = React.useCallback(
    (fix: A11yFixId) => {
      const trimmed = input.trim();
      if (!trimmed) return;
      const fixed = applyA11yFix(trimmed, fix, componentName);
      if (fixed !== trimmed) {
        snapshot("Before accessibility fix", trimmed);
        history.set(fixed);
      }
    },
    [input, componentName, history, snapshot],
  );

  const quickFix = React.useCallback(
    (id: QuickFixId) => {
      const c = (names: string[]): CustomPlugins => Object.fromEntries(names.map((n) => [n, true]));
      switch (id) {
        case "metadata":
          return runFix({ mode: "custom", precision, pretty, multipass, custom: c(["removeMetadata", "removeComments", "removeEditorsNSData", "removeDoctype"]) }, "Fix metadata");
        case "ids":
          return runFix({ mode: "custom", precision, pretty, multipass, custom: c(["cleanupIds"]) }, "Fix IDs");
        case "precision":
          setPrecision(1);
          return;
        case "empty-groups":
          return runFix({ mode: "custom", precision, pretty, multipass, custom: c(["removeEmptyContainers", "collapseGroups"]) }, "Fix empty groups");
        case "hidden":
          return runFix({ mode: "custom", precision, pretty, multipass, custom: c(["removeHiddenElems"]) }, "Fix hidden layers");
        case "styles":
          return runFix({ mode: "custom", precision, pretty, multipass, custom: c(["inlineStyles", "convertStyleToAttrs", "minifyStyles"]) }, "Fix styles");
        case "all":
        default:
          return runFix({ mode: "smart", precision, pretty, multipass, custom }, "Fix all");
      }
    },
    [runFix, precision, pretty, multipass, custom],
  );

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
      "mod+shift+backspace": (e) => {
        e.preventDefault();
        reset();
      },
    },
    { allowInInputs: true },
  );

  const pluginsByCategory = React.useMemo(() => {
    const q = pluginQuery.trim().toLowerCase();
    const map = new Map<PluginCategory, PluginInfo[]>();
    for (const p of registry) {
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) continue;
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return map;
  }, [registry, pluginQuery]);

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton
          icon="Upload"
          label="Import"
          onClick={() => {
            const el = document.createElement("input");
            el.type = "file";
            el.accept = ".svg,image/svg+xml";
            el.onchange = () => {
              const f = el.files?.[0];
              if (f) void f.text().then((t) => history.set(t));
            };
            el.click();
          }}
        />
        <CopyButton getValue={() => output || input} label="Copy SVG" />
        <DownloadButton filename="optimized.svg" getValue={() => output || input} mime="image/svg+xml;charset=utf-8" label="Download" />
        <ToolbarDivider />
        <ToolbarButton icon="Undo2" label="Undo" onClick={() => history.undo()} disabled={!history.canUndo} labelMode="icon" />
        <ToolbarButton icon="Redo2" label="Redo" onClick={() => history.redo()} disabled={!history.canRedo} labelMode="icon" />
        <ToolbarDivider />
        <ExamplesMenu examples={EXAMPLES} onPick={(v) => history.set(v)} heading="Load a sample SVG" />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
        <ToolbarSpacer />
        {busy ? <StatBadge value="Optimizing…" icon="Loader" tone="info" /> : null}
        <ToolbarButton icon="RotateCcw" label="Reset" onClick={reset} disabled={!hasInput} variant="destructive" labelMode="icon" />
        <ToolbarButton icon="Share2" label={share.justCopied ? "Copied" : "Share"} onClick={() => void share.copyShareLink(input)} disabled={!hasInput} labelMode="icon" />
      </Toolbar>

      {/* Single / Batch */}
      <SegmentedControl<"single" | "batch">
        value={view}
        onChange={setView}
        ariaLabel="Workspace view"
        size="sm"
        options={[
          { value: "single", label: "Single file", icon: "File" },
          { value: "batch", label: "Batch", icon: "Files" },
        ]}
      />

      {/* Mode bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/30 p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <SegmentedControl<OptimizeMode> value={mode} onChange={setMode} ariaLabel="Optimization mode" options={MODE_OPTIONS} />
          {mode === "smart" && detected ? <StatBadge label="Detected" value={KIND_LABEL[detected]} icon="ScanEye" tone="info" /> : null}
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
            <Field label="Precision" hint="Decimal places for coordinates">
              <NumberStepper value={precision} onChange={setPrecision} min={0} max={6} step={1} ariaLabel="Precision" />
            </Field>
            <Toggle checked={multipass} onChange={setMultipass} label="Multipass" />
            <Toggle checked={pretty} onChange={setPretty} label="Pretty" />
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{MODE_HINT[mode]}</p>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preset</span>
          {allPresets.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.description}
              onClick={() => applyPreset(p)}
              className={cn(
                "group inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors",
                presetId === p.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {p.custom ? <Icon name="Star" size={11} className="text-amber-500" /> : null}
              {p.label}
              {p.custom ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Delete preset ${p.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomPresets(deleteCustomPreset(p.id));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      setCustomPresets(deleteCustomPreset(p.id));
                    }
                  }}
                  className="ml-0.5 opacity-50 hover:opacity-100"
                >
                  <Icon name="Trash2" size={10} />
                </span>
              ) : null}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const label = window.prompt("Name this preset", "My preset");
              if (label) setCustomPresets(saveCustomPreset(label, { mode, precision, pretty, multipass, custom }, exportFormat));
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Icon name="Plus" size={11} /> Save current
          </button>
        </div>

        {/* Advanced plugin panel */}
        <div className="rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-foreground"
          >
            <Icon name={advancedOpen ? "ChevronDown" : "ChevronRight"} size={14} />
            Advanced settings
            <span className="text-muted-foreground">- every SVGO optimization ({registry.length})</span>
            {mode !== "custom" ? (
              <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">switch to Custom to apply</span>
            ) : null}
          </button>
          {advancedOpen ? (
            <div className="flex flex-col gap-3 border-t border-border p-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Icon name="Search" size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={pluginQuery}
                    onChange={(e) => setPluginQuery(e.target.value)}
                    placeholder="Search optimizations…"
                    className="w-full rounded-lg border border-border bg-background py-1.5 pl-7 pr-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <ToolbarButton icon="RotateCcw" label="Reset" onClick={resetPlugins} labelMode="always" />
              </div>
              {registry.length === 0 ? (
                <p className="text-xs text-muted-foreground">Loading optimizations…</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {PLUGIN_CATEGORIES.map((cat) => {
                    const items = pluginsByCategory.get(cat);
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={cat} className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{cat}</span>
                        {items.map((p) => (
                          <label
                            key={p.name}
                            title={p.description}
                            className={cn("flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs", mode === "custom" ? "hover:bg-muted/50" : "opacity-60")}
                          >
                            <input
                              type="checkbox"
                              checked={!!custom[p.name]}
                              disabled={mode !== "custom"}
                              onChange={(e) => setPlugin(p.name, e.target.checked)}
                              className="mt-0.5 accent-primary"
                            />
                            <span className="flex flex-col">
                              <span className="font-medium text-foreground">{p.name}</span>
                              <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">{p.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      {view === "batch" ? (
        <div className="flex flex-col gap-3">
          <FileDropZone
            onFiles={addBatchFiles}
            accept=".svg,image/svg+xml"
            icon="Files"
            label="Drop SVGs (or a folder) here, or click to browse"
            hint="Optimize many at once. Everything stays on your device"
            className="min-h-[160px]"
          />
          {batchInputs.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/30 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{batchInputs.length} file{batchInputs.length > 1 ? "s" : ""}</span>
                <button type="button" onClick={() => { setBatchInputs([]); setBatchResults([]); }} className="text-[11px] text-muted-foreground underline underline-offset-2">Clear</button>
                <div className="ml-auto flex flex-wrap items-center gap-1.5">
                  {batchBusy ? (
                    <button type="button" onClick={() => { cancelRef.current = true; }} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted">
                      <Icon name="CircleX" size={12} /> Cancel
                    </button>
                  ) : (
                    <button type="button" onClick={runBatch} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90">
                      <Icon name="Zap" size={12} /> Optimize all
                    </button>
                  )}
                  {batchResults.length > 0 ? (
                    <>
                      <button type="button" onClick={downloadZip} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted"><Icon name="FileArchive" size={12} /> ZIP</button>
                      <button type="button" onClick={() => download("svg-optimization-report.csv", batchCsv(batchResults), "text/csv")} className="rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted">CSV</button>
                      <button type="button" onClick={() => download("svg-optimization-report.json", batchJson(batchResults), "application/json")} className="rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted">JSON</button>
                    </>
                  ) : null}
                </div>
              </div>
              {batchProgress ? (
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${batchProgress.total ? (batchProgress.done / batchProgress.total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Optimizing {batchProgress.done}/{batchProgress.total} - {batchProgress.current}</span>
                </div>
              ) : null}
              <ul className="flex max-h-72 flex-col gap-1 overflow-auto">
                {(batchResults.length > 0 ? batchResults : batchInputs.map((i) => ({ name: i.name, ok: true, before: 0, after: 0, savedBytes: 0, savedPct: 0, data: "" } as BatchResultItem))).map((r, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-[11px]">
                    <Icon name={r.ok ? "FileCheck2" : "FileWarning"} size={13} className={cn("shrink-0", r.ok ? "text-emerald-500" : "text-amber-500")} />
                    <span className="flex-1 truncate text-foreground" title={r.name}>{r.name}</span>
                    {batchResults.length > 0 ? (
                      <span className="tabular-nums text-muted-foreground">{formatBytes(r.before)} → <span className="text-foreground">{formatBytes(r.after)}</span> <span className={r.savedPct > 0 ? "text-emerald-500" : ""}>({r.savedPct}%)</span></span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {batchResults.length > 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Total saved:{" "}
                  <span className="font-semibold text-emerald-500">
                    {formatBytes(batchResults.reduce((s, r) => s + r.savedBytes, 0))}
                  </span>{" "}
                  across {batchResults.length} file{batchResults.length > 1 ? "s" : ""}.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : !hasInput ? (
        <FileDropZone
          onFiles={(files) => {
            const f = files[0];
            if (f) void f.text().then((t) => history.set(t));
          }}
          accept=".svg,image/svg+xml"
          icon="FileCode2"
          label="Drop an SVG, click to browse, or paste code"
          hint="Everything runs in your browser, your files never leave your device"
          className={cn("min-h-[320px]", isDragging && "ring-2 ring-primary")}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Center: compare + code */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {compareBase ? (
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-2 py-1 text-[11px] text-foreground">
                <Icon name="GitCompare" size={12} className="text-primary" />
                Comparing against a saved version
                <button type="button" onClick={() => setCompareBase(null)} className="ml-auto underline underline-offset-2">
                  Back to current
                </button>
              </div>
            ) : null}
            <SvgCompare original={compareBase ?? input} optimized={output || input} minHeight={340} />

            {/* Icon-size preview matrix */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowIconPreview((o) => !o)}
                className="flex w-fit items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <Icon name={showIconPreview ? "ChevronDown" : "ChevronRight"} size={14} />
                Preview at every icon size (16–256px)
              </button>
              {showIconPreview ? <SvgIconPreview svg={output || input} /> : null}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">Export</span>
                <div className="flex items-center gap-1.5">
                  <CopyButton getValue={() => exported} label="Copy" />
                  <DownloadButton
                    filename={exportFilename(exportFormat, componentName)}
                    getValue={() => exported}
                    mime={exportMeta.mime}
                    label="Download"
                  />
                </div>
              </div>

              {/* Format chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {EXPORT_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setExportFormat(f.id)}
                    aria-pressed={exportFormat === f.id}
                    className={cn(
                      "rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors",
                      exportFormat === f.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
                {["jsx", "react", "react-native", "vue", "angular", "svelte"].includes(exportFormat) ? (
                  <input
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    aria-label="Component name"
                    placeholder="Component name"
                    className="w-40 rounded-lg border border-border bg-background px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                ) : null}
              </div>

              <CodePane
                value={exported}
                readOnly
                lineNumbers
                wrap={false}
                minHeight={160}
                maxHeight={320}
                ariaLabel={`Optimized SVG as ${exportMeta.label}`}
              />
              {error ? <p className="text-[11px] text-amber-500">{error}</p> : null}
            </div>
          </div>

          {/* Sidebar: health + stats + report */}
          <div className="flex flex-col gap-4">
            {/* Health */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/40 p-3">
              <div className="flex items-center gap-3">
                <HealthRing score={health.score} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">SVG health</span>
                  <span className="text-[11px] text-muted-foreground">
                    {health.issues.length === 0 ? "No issues found" : `${health.issues.length} issue${health.issues.length > 1 ? "s" : ""} to review`}
                  </span>
                </div>
              </div>
              {health.issues.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {health.issues.slice(0, 6).map((iss) => (
                    <li key={iss.id} className="flex items-start gap-2 text-[11px]">
                      <Icon name={iss.severity === "warning" ? "TriangleAlert" : "Info"} size={13} className={cn("mt-0.5 shrink-0", iss.severity === "warning" ? "text-amber-500" : "text-muted-foreground")} />
                      <span className="flex-1 text-muted-foreground">{iss.title}</span>
                      {iss.fix ? (
                        <button
                          type="button"
                          onClick={() => quickFix(iss.fix as QuickFixId)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-foreground hover:bg-muted"
                        >
                          <Icon name={HEALTH_FIX_ICON[iss.fix]} size={11} />
                          Fix
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button type="button" onClick={() => quickFix("all")} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90">
                  <Icon name="WandSparkles" size={12} /> Fix all
                </button>
                {(
                  [
                    ["metadata", "Metadata"],
                    ["ids", "IDs"],
                    ["precision", "Precision"],
                    ["empty-groups", "Empty groups"],
                    ["hidden", "Hidden layers"],
                    ["styles", "Styles"],
                  ] as Array<[QuickFixId, string]>
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => quickFix(id)}
                    className="rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Accessibility</span>
                <span className={cn("text-xs font-bold tabular-nums", a11y.score >= 80 ? "text-emerald-500" : a11y.score >= 55 ? "text-amber-500" : "text-red-500")}>
                  {a11y.score}/100
                </span>
              </div>
              {a11y.issues.length === 0 ? (
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-500"><Icon name="CircleCheck" size={13} /> Accessible: nothing to fix.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {a11y.issues.map((iss) => (
                    <li key={iss.id} className="flex items-start gap-2 text-[11px]">
                      <Icon name={iss.severity === "warning" ? "TriangleAlert" : "Info"} size={13} className={cn("mt-0.5 shrink-0", iss.severity === "warning" ? "text-amber-500" : "text-muted-foreground")} />
                      <span className="flex-1 text-muted-foreground">{iss.title}</span>
                      {iss.fix ? (
                        <button type="button" onClick={() => a11yFix(iss.fix as A11yFixId)} className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-foreground hover:bg-muted">Fix</button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button type="button" onClick={() => a11yFix("add-title")} className="rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted">Add title</button>
                <button type="button" onClick={() => a11yFix("mark-decorative")} className="rounded-lg border border-border px-2 py-1 text-[11px] text-foreground hover:bg-muted">Mark decorative</button>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/40 p-3">
              <span className="text-sm font-semibold text-foreground">Statistics</span>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Original" value={formatBytes(report.bytesBefore)} />
                <StatCard label="Optimized" value={formatBytes(report.bytesAfter)} tone="accent" />
                <StatCard label="Reduction" value={`${report.savedPct}%`} tone={report.savedPct > 0 ? "good" : undefined} />
                <StatCard label="Gzip (est.)" value={formatBytes(report.gzipEstimate)} />
                <StatCard label="Elements" value={metricsAfter.elementCount} />
                <StatCard label="Paths" value={metricsAfter.pathCount} />
                <StatCard label="Gradients" value={metricsAfter.gradientCount} />
                <StatCard label="Masks" value={metricsAfter.maskCount} />
                <StatCard label="Clip paths" value={metricsAfter.clipPathCount} />
                <StatCard label="Filters" value={metricsAfter.filterCount} tone={metricsAfter.filterCount > 3 ? "warn" : undefined} />
                <StatCard label="Patterns" value={metricsAfter.patternCount} />
                <StatCard label="Text" value={metricsAfter.textCount} />
                <StatCard label="Images" value={metricsAfter.imageCount} tone={metricsAfter.imageCount > 0 ? "warn" : undefined} />
                <StatCard label="Precision" value={`${metricsAfter.decimalPrecision}dp`} />
                <StatCard label="Render cost" value={metricsAfter.complexityLabel} tone={metricsAfter.renderComplexity > 60 ? "warn" : undefined} />
                <StatCard label="Time" value={`${elapsed.toFixed(0)} ms`} />
              </div>
            </div>

            {/* Version history */}
            {versions.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Versions</span>
                  <button type="button" onClick={() => setVersions([])} className="text-[10px] text-muted-foreground underline underline-offset-2">
                    Clear
                  </button>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {versions.map((v) => (
                    <li key={v.id} className="flex items-center gap-2 text-[11px]">
                      <Icon name="History" size={12} className="shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-muted-foreground" title={v.label}>{v.label}</span>
                      <button
                        type="button"
                        onClick={() => setCompareBase(v.svg)}
                        className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-foreground hover:bg-muted"
                      >
                        Compare
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          snapshot("Before restore", input);
                          history.set(v.svg);
                          setCompareBase(null);
                        }}
                        className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-foreground hover:bg-muted"
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Report */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/40 p-3">
              <span className="text-sm font-semibold text-foreground">What changed</span>
              <ul className="flex flex-col gap-1.5">
                {optReport.lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px]">
                    <Icon
                      name={line.kind === "merge" ? "GitMerge" : line.kind === "round" ? "Ruler" : line.kind === "convert" ? "Replace" : "Minus"}
                      size={13}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span className="flex-1 text-foreground/90">{line.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
