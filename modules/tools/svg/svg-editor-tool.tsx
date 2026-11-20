"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  ExamplesMenu,
  ShortcutsHelp,
  StatBadge,
  ToolbarButton,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import { SvgWorkspace } from "@/components/tool/svg";
import { optimizeSvg, minifySvg, prettifySvg } from "@/lib/svg-tools/optimize";
import { analyzeSvg, type SvgAnalysis } from "@/lib/svg-tools/validate";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${Math.max(0, Math.round(n))} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/** Trim a color token for display without losing meaning. */
function shortColor(c: string): string {
  return c.length > 20 ? `${c.slice(0, 19)}…` : c;
}

/** A CSS-safe swatch value; falls back to transparent for un-paintable tokens. */
function swatchColor(c: string): string {
  const t = c.trim().toLowerCase();
  if (!t || t === "none" || t === "transparent" || t === "currentcolor") {
    return "transparent";
  }
  return c;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Starter SVGs, one click from a real, editable graphic.
 * ──────────────────────────────────────────────────────────────────────────── */

const STARTER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
</svg>`;

const STARTER_GRADIENT = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#g)"/>
  <path d="M40 74 L60 40 L80 74 Z" fill="#ffffff" fill-opacity="0.92"/>
  <circle cx="60" cy="82" r="6" fill="#ffffff"/>
</svg>`;

const STARTER_MESSY = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px" height="48px" viewBox="0 0 48 48" enable-background="new 0 0 48 48" xml:space="preserve">
  <!-- Exported from a design tool: lots to clean up -->
  <g id="Frame">
    <g>
      <path fill="#7C3AED" d="M24.0000001 6.00000012C14.0588998 6.00000012 6.00000012 14.0588998 6.00000012 24.0000001C6.00000012 33.9411004 14.0588998 42.0000001 24.0000001 42.0000001C33.9411004 42.0000001 42.0000001 33.9411004 42.0000001 24.0000001C42.0000001 14.0588998 33.9411004 6.00000012 24.0000001 6.00000012Z"/>
      <path stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M17 24.5 L21.5 29 L31 19.5"/>
    </g>
  </g>
</svg>`;

const STARTER_ANIMATED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="34" fill="none" stroke="#8b5cf6" stroke-width="8" stroke-dasharray="160 60" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.4s" repeatCount="indefinite"/>
  </circle>
</svg>`;

const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "currentColor icon",
    description: "A stroke icon that inherits text color",
    value: STARTER_ICON,
    icon: "Star",
  },
  {
    label: "Gradient logo",
    description: "Rounded mark with a linear gradient",
    value: STARTER_GRADIENT,
    icon: "Sparkles",
  },
  {
    label: "Messy export",
    description: "Editor cruft to Format & Optimize",
    value: STARTER_MESSY,
    icon: "Brush",
  },
  {
    label: "Animated spinner",
    description: "SMIL animation the inspector detects",
    value: STARTER_ANIMATED,
    icon: "Loader",
  },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+shift+f", description: "Format (pretty-print)" },
  { combo: "mod+shift+o", description: "Optimize with SVGO" },
  { combo: "mod+shift+m", description: "Minify to one line" },
  { combo: "mod+z", description: "Undo edit / transform" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+shift+backspace", description: "Clear the editor" },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Live element inspector
 * ──────────────────────────────────────────────────────────────────────────── */

function FeatureFlag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        on
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground/70",
      )}
    >
      <Icon name={on ? "Check" : "Minus"} size={12} />
      {label}
    </span>
  );
}

function ElementInspector({ analysis }: { analysis: SvgAnalysis }) {
  const elements = React.useMemo(
    () =>
      Object.entries(analysis.elementCounts)
        .filter(([tag]) => tag !== "svg")
        .sort((a, b) => b[1] - a[1]),
    [analysis.elementCounts],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Headline stats */}
      <div className="flex flex-wrap gap-1.5">
        <StatBadge
          label="Size"
          value={formatBytes(analysis.bytes)}
          icon="HardDrive"
          tone="info"
        />
        <StatBadge
          label="Elements"
          value={analysis.totalElements}
          icon="ListTree"
        />
        <StatBadge label="Colors" value={analysis.colors.length} icon="Palette" />
        <StatBadge
          label="viewBox"
          value={analysis.viewBox ? "Present" : "Missing"}
          icon={analysis.viewBox ? "CircleCheck" : "TriangleAlert"}
          tone={analysis.viewBox ? "success" : "danger"}
        />
      </div>

      {/* Feature flags */}
      <div className="flex flex-wrap gap-1.5">
        <FeatureFlag on={analysis.hasGradients} label="Gradients" />
        <FeatureFlag on={analysis.hasFilters} label="Filters" />
        <FeatureFlag on={analysis.hasAnimation} label="Animation" />
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
            analysis.viewBox
              ? "border-border bg-muted/40 text-muted-foreground"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
          title={analysis.viewBox ?? "No viewBox: won't scale responsively"}
        >
          <Icon name="Frame" size={12} />
          {analysis.viewBox
            ? `viewBox ${analysis.viewBox}`
            : "No viewBox: won't scale"}
        </span>
      </div>

      {/* Element histogram */}
      {elements.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Elements
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {elements.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs"
              >
                <code className="font-mono text-foreground">{tag}</code>
                <span className="tabular-nums text-muted-foreground">
                  ×{count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {analysis.colors.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Colors ({analysis.colors.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.colors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 py-0.5 pl-1 pr-2 text-xs"
                title={color}
              >
                <span
                  className="size-3.5 shrink-0 rounded-sm border border-border/60"
                  style={{ background: swatchColor(color) }}
                />
                <code className="font-mono text-muted-foreground">
                  {shortColor(color)}
                </code>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * SVG Editor tool
 * ──────────────────────────────────────────────────────────────────────────── */

type TransformKind = "format" | "optimize" | "minify";

/**
 * SVG Editor, a desktop-grade code↔preview editor. It composes
 * {@link SvgWorkspace} (editable source + live checkerboard preview of the same
 * SVG, import/copy/download/reset/share toolbar, options slot) with the engine's
 * `prettifySvg`/`optimizeSvg`/`minifySvg` transforms and a live `analyzeSvg`
 * element inspector.
 *
 * The transforms are async (SVGO's browser build lazy-loads, with a
 * dependency-free fallback). Each transform result is written back into the
 * `useHistory` stack as a single undoable step. `useShareState` produces deep
 * links and `useShortcuts` wires the keyboard. Everything runs in the browser;
 * nothing is uploaded.
 */
export default function SvgEditorTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const svg = history.state;

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const [busy, setBusy] = React.useState<TransformKind | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const hasContent = svg.trim().length > 0;

  // Guard against races: only the newest transform may write its result.
  const runIdRef = React.useRef(0);

  const runTransform = React.useCallback(
    (kind: TransformKind) => {
      const source = svg.trim();
      if (!source) return;

      const runId = ++runIdRef.current;
      setBusy(kind);
      setError(null);

      const op =
        kind === "format"
          ? prettifySvg(svg)
          : kind === "optimize"
            ? optimizeSvg(svg, { pretty: true })
            : minifySvg(svg);

      op
        .then((result) => {
          if (runId !== runIdRef.current) return;
          if (result.ok) {
            history.set(result.result);
          } else {
            setError(result.error.message);
          }
        })
        .catch(() => {
          if (runId !== runIdRef.current) return;
          setError("Couldn't transform this SVG. Check that it's valid markup.");
        })
        .finally(() => {
          if (runId === runIdRef.current) setBusy(null);
        });
    },
    [svg, history],
  );

  const reset = React.useCallback(() => {
    history.reset("");
    setError(null);
  }, [history]);

  const handleShare = React.useCallback(() => {
    if (hasContent) void share.copyShareLink(svg);
  }, [hasContent, svg, share]);

  // Live analysis of the current source (pure, browser-native, safe).
  const analysis = React.useMemo<SvgAnalysis | null>(() => {
    if (!hasContent) return null;
    const res = analyzeSvg(svg);
    return res.ok ? res.result : null;
  }, [svg, hasContent]);

  const analysisError = React.useMemo<string | null>(() => {
    if (!hasContent) return null;
    const res = analyzeSvg(svg);
    return res.ok ? null : res.error.message;
  }, [svg, hasContent]);

  useShortcuts(
    {
      "mod+shift+f": (e) => {
        e.preventDefault();
        runTransform("format");
      },
      "mod+shift+o": (e) => {
        e.preventDefault();
        runTransform("optimize");
      },
      "mod+shift+m": (e) => {
        e.preventDefault();
        runTransform("minify");
      },
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
      "mod+shift+backspace": (e) => {
        e.preventDefault();
        history.reset("");
      },
    },
    { allowInInputs: true },
  );

  const optionControls = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Transform
        </span>
        <ToolbarButton
          icon="AlignLeft"
          label="Format"
          onClick={() => runTransform("format")}
          disabled={!hasContent || busy !== null}
          loading={busy === "format"}
        />
        <ToolbarButton
          icon="Sparkles"
          label="Optimize"
          variant="active"
          onClick={() => runTransform("optimize")}
          disabled={!hasContent || busy !== null}
          loading={busy === "optimize"}
        />
        <ToolbarButton
          icon="Minimize2"
          label="Minify"
          onClick={() => runTransform("minify")}
          disabled={!hasContent || busy !== null}
          loading={busy === "minify"}
        />
      </div>

      {(error || analysisError) && (
        <p
          className="flex items-center gap-1.5 text-xs text-destructive"
          role="alert"
        >
          <Icon name="TriangleAlert" size={13} className="shrink-0" />
          {error ?? analysisError}
        </p>
      )}

      {analysis && !analysisError && (
        <div className="border-t border-border/60 pt-3">
          <ElementInspector analysis={analysis} />
        </div>
      )}

      {!hasContent && (
        <p className="text-xs text-muted-foreground">
          Paste SVG markup, drop a.svg file, or load a starter: then edit with
          a live preview and Format, Optimize or Minify in one click.
        </p>
      )}
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
      <ExamplesMenu
        examples={EXAMPLES}
        onPick={(value) => history.set(value)}
        label="Starters"
      />
      <ShortcutsHelp shortcuts={SHORTCUTS} />
      {busy && <StatBadge value="Working…" icon="Loader" tone="info" />}
    </>
  );

  return (
    <SvgWorkspace
      input={svg}
      onInputChange={(v) => history.set(v)}
      output={svg}
      inputLabel="SVG source"
      placeholder="Paste SVG markup, drop a .svg file, or load a starter…"
      filename="edited.svg"
      copyTarget="input"
      options={optionControls}
      toolbarExtra={toolbarExtra}
      onReset={reset}
      onShare={handleShare}
      shareJustCopied={share.justCopied}
      emptyLabel="Live preview appears here as you edit"
    />
  );
}
