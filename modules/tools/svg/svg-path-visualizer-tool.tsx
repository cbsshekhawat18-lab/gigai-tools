"use client";

import * as React from "react";
import Link from "next/link";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  ExamplesMenu,
  ShortcutsHelp,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  CopyButton,
  download,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import {
  PathVisualizer,
  type PreviewBackground,
} from "@/components/tool/svg";
import { pathInfo, normalizePath, type PathInfo } from "@/lib/svg-tools/path";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

/** Format a number for compact display without trailing-zero noise. */
function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
}

/** Wrap a bare `d` value into a minimal, standalone SVG for download. */
function wrapAsSvg(d: string, info: PathInfo | null): string {
  const b = info?.bbox;
  const pad = b ? Math.max(b.width, b.height) * 0.06 + 1 : 2;
  const vb = b
    ? `${fmt(b.x - pad)} ${fmt(b.y - pad)} ${fmt(b.width + pad * 2)} ${fmt(
        b.height + pad * 2,
      )}`
    : "0 0 100 100";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">\n` +
    `  <path d="${d.replace(/"/g, "&quot;")}" fill="none" stroke="#6366f1" stroke-width="1" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>\n` +
    `</svg>`
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sample paths, one click from a useful, non-trivial visualization.
 * ──────────────────────────────────────────────────────────────────────────── */

const SAMPLE_HEART =
  "M 50 30 C 50 20, 35 15, 28 25 C 20 36, 30 50, 50 65 " +
  "C 70 50, 80 36, 72 25 C 65 15, 50 20, 50 30 Z";

const SAMPLE_STAR =
  "M 50 8 L 61 38 L 94 38 L 67 58 L 78 90 L 50 70 L 22 90 " +
  "L 33 58 L 6 38 L 39 38 Z";

const SAMPLE_WAVE =
  "M 0 40 Q 20 10, 40 40 T 80 40 T 120 40 T 160 40";

const SAMPLE_LETTER_G =
  "M 78 30 C 70 12, 40 8, 26 26 C 12 44, 18 78, 46 82 " +
  "C 66 85, 82 72, 82 54 L 56 54 L 56 44 L 92 44 " +
  "L 92 90";

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Heart",
    description: "Two mirrored cubic beziers",
    value: SAMPLE_HEART,
    icon: "Heart",
  },
  {
    label: "Star",
    description: "Ten straight lineto segments",
    value: SAMPLE_STAR,
    icon: "Star",
  },
  {
    label: "Wave",
    description: "Quadratic with smooth T commands",
    value: SAMPLE_WAVE,
    icon: "Waves",
  },
  {
    label: "Letterform",
    description: "A curvy glyph outline",
    value: SAMPLE_LETTER_G,
    icon: "Type",
  },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+c", description: "Copy the path d string" },
  { combo: "mod+s", description: "Download as .svg" },
  { combo: "mod+shift+n", description: "Normalize to absolute commands" },
  { combo: "mod+z", description: "Undo edit" },
  { combo: "mod+shift+z", description: "Redo edit" },
  { combo: "mod+backspace", description: "Clear the path" },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Geometry report
 * ──────────────────────────────────────────────────────────────────────────── */

/** Preferred display order for the command histogram. */
const COMMAND_ORDER = [
  "M",
  "m",
  "L",
  "l",
  "H",
  "h",
  "V",
  "v",
  "C",
  "c",
  "S",
  "s",
  "Q",
  "q",
  "T",
  "t",
  "A",
  "a",
  "Z",
  "z",
];

function ReportRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name={icon} size={14} className="shrink-0" />
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function GeometryReport({ info }: { info: PathInfo }) {
  const commands = React.useMemo(() => {
    const entries = Object.entries(info.commandCounts);
    entries.sort((a, b) => {
      const ia = COMMAND_ORDER.indexOf(a[0]);
      const ib = COMMAND_ORDER.indexOf(b[0]);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return entries;
  }, [info.commandCounts]);

  const { bbox } = info;

  return (
    <div className="flex flex-col gap-4">
      {/* Headline stats */}
      <div className="flex flex-wrap gap-1.5">
        <StatBadge
          label="Length"
          value={fmt(info.length)}
          icon="Ruler"
          tone="info"
        />
        <StatBadge
          label={info.lengthExact ? "Exact" : "Estimate"}
          value={info.lengthExact ? "getTotalLength" : "subdivided"}
          icon={info.lengthExact ? "CircleCheck" : "Sigma"}
          tone={info.lengthExact ? "success" : "default"}
        />
        <StatBadge label="Commands" value={info.total} icon="ListOrdered" />
        <StatBadge label="Subpaths" value={info.subpaths} icon="Split" />
      </div>

      {/* Detail rows */}
      <div className="divide-y divide-border rounded-lg border border-border bg-card/50 px-3">
        <ReportRow icon="Ruler" label="Outline length">
          <span className="tabular-nums">{fmt(info.length)}</span>
          <span className="ml-1 text-xs text-muted-foreground">
            {info.lengthExact ? "units" : "units (est.)"}
          </span>
        </ReportRow>
        <ReportRow icon="Frame" label="Bounding box">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {fmt(bbox.width)} × {fmt(bbox.height)}
          </code>
        </ReportRow>
        <ReportRow icon="Move" label="Origin (x, y)">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {fmt(bbox.x)}, {fmt(bbox.y)}
          </code>
        </ReportRow>
        <ReportRow icon="Split" label="Subpaths">
          {info.subpaths}
        </ReportRow>
      </div>

      {/* Command histogram */}
      {commands.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Commands ({info.total})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {commands.map(([cmd, count]) => (
              <span
                key={cmd}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs"
                title={`${count}× "${cmd}" command`}
              >
                <code className="font-mono font-semibold text-foreground">
                  {cmd}
                </code>
                <span className="tabular-nums text-muted-foreground">
                  ×{count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * SVG Path Visualizer tool
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * SVG Path Visualizer. Paste a `d` attribute and see it rendered on an
 * auto-fitting canvas with anchor nodes, bezier control handles and green/red
 * start-end markers via <PathVisualizer>, beside a live geometry report (exact
 * length, bounding box, subpaths, per-command histogram) from `pathInfo`. The
 * path stays editable with live redraw; undo/redo, normalize-to-absolute,
 * copy/download/share, samples and keyboard shortcuts are wired through the dev
 * harness. Nothing is uploaded.
 */
export default function SvgPathVisualizerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const d = history.state;

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const [background, setBackground] =
    React.useState<PreviewBackground>("checker");

  const hasContent = d.trim().length > 0;

  const clear = React.useCallback(() => history.set(""), [history]);

  // Live geometry report for the current path.
  const info = React.useMemo<PathInfo | null>(() => {
    if (!hasContent) return null;
    const res = pathInfo(d);
    return res.ok ? res.result : null;
  }, [d, hasContent]);

  const parseError = React.useMemo<string | null>(() => {
    if (!hasContent) return null;
    const res = pathInfo(d);
    return res.ok ? null : res.error.message;
  }, [d, hasContent]);

  const doDownload = React.useCallback(() => {
    if (!hasContent) return;
    download("path.svg", wrapAsSvg(d, info), "image/svg+xml;charset=utf-8");
  }, [d, info, hasContent]);

  const normalize = React.useCallback(() => {
    if (!hasContent) return;
    const res = normalizePath(d, { toAbsolute: true });
    if (res.ok) history.set(res.result);
  }, [d, hasContent, history]);

  // Keyboard shortcuts, mod combos fire even inside the editor.
  useShortcuts(
    {
      "mod+s": (e) => {
        e.preventDefault();
        doDownload();
      },
      "mod+shift+n": (e) => {
        e.preventDefault();
        normalize();
      },
      "mod+backspace": (e) => {
        e.preventDefault();
        clear();
      },
      "mod+z": (e) => {
        e.preventDefault();
        history.undo();
      },
      "mod+shift+z": (e) => {
        e.preventDefault();
        history.redo();
      },
    },
    { allowInInputs: true },
  );

  const bgOptions: { value: PreviewBackground; icon: string; label: string }[] =
    [
      { value: "checker", icon: "Grid2x2", label: "Checkerboard" },
      { value: "light", icon: "Sun", label: "Light" },
      { value: "dark", icon: "Moon", label: "Dark" },
    ];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <Toolbar>
        <ExamplesMenu
          examples={EXAMPLES}
          onPick={(value) => history.set(value)}
          label="Samples"
        />
        <ToolbarDivider />
        <CopyButton
          getValue={() => d}
          label="Copy d"
          disabled={!hasContent}
        />
        <ToolbarButton
          icon="Download"
          label="Download"
          disabled={!hasContent}
          onClick={doDownload}
        />
        <ToolbarButton
          icon="Wand2"
          label="Normalize"
          disabled={!hasContent}
          onClick={normalize}
        />
        <ToolbarDivider />
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
        <ToolbarSpacer />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link2"}
          label={share.justCopied ? "Link copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          disabled={!hasContent}
          onClick={() => void share.copyShareLink(d)}
        />
        <ToolbarButton
          icon="RotateCcw"
          label="Clear"
          variant="destructive"
          onClick={clear}
          disabled={!hasContent}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && (
        <p className="text-xs text-destructive" role="alert">
          {share.shareError}
        </p>
      )}

      {/* Background picker */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Canvas
        </span>
        {bgOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setBackground(opt.value)}
            aria-pressed={background === opt.value}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              background === opt.value
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon name={opt.icon} size={13} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Main grid: visualizer + editable pane on the left, report on the right */}
      <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        <PathVisualizer
          d={d}
          onChange={(value) => history.set(value)}
          background={background}
          minHeight={340}
        />

        {/* Report */}
        <section
          aria-label="Path geometry report"
          className="flex flex-col rounded-xl border border-border bg-card/60 p-4"
        >
          <header className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="Route" size={16} className="text-primary" />
              Geometry report
            </h3>
            {hasContent && !parseError && (
              <Link
                href="/svg-viewer"
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                <Icon name="Eye" size={13} />
                Open in Viewer
              </Link>
            )}
          </header>

          {!hasContent ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
              <Icon name="Spline" size={26} className="opacity-60" />
              <p className="text-sm">
                Paste a path <code className="font-mono">d</code> value or load a
                sample to see its length, bounding box and commands.
              </p>
            </div>
          ) : parseError ? (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <Icon name="TriangleAlert" size={15} />
              {parseError}
            </p>
          ) : info ? (
            <GeometryReport info={info} />
          ) : null}
        </section>
      </div>
    </div>
  );
}
