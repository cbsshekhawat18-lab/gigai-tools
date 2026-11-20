"use client";

import * as React from "react";
import Link from "next/link";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  CopyButton,
  ExamplesMenu,
  FileDropZone,
  ShortcutsHelp,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  download,
  useFileDrop,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import { PathVisualizer } from "@/components/tool/svg";
import {
  parsePath,
  pathInfo,
  normalizePath,
  type PathCommand,
  type PathInfo,
} from "@/lib/svg-tools/path";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const ACCEPT = ".svg,image/svg+xml,text/plain";

/** Number of parameters each command letter carries (per repetition). */
const PARAM_LABELS: Record<string, string[]> = {
  m: ["x", "y"],
  l: ["x", "y"],
  h: ["x"],
  v: ["y"],
  c: ["x1", "y1", "x2", "y2", "x", "y"],
  s: ["x2", "y2", "x", "y"],
  q: ["x1", "y1", "x", "y"],
  t: ["x", "y"],
  a: ["rx", "ry", "rot", "large", "sweep", "x", "y"],
  z: [],
};

const COMMAND_NAMES: Record<string, string> = {
  m: "Move to",
  l: "Line to",
  h: "Horizontal line",
  v: "Vertical line",
  c: "Cubic bézier",
  s: "Smooth cubic",
  q: "Quadratic bézier",
  t: "Smooth quadratic",
  a: "Elliptical arc",
  z: "Close path",
};

/**
 * Pull an editable `d` string out of whatever the user pasted or dropped: a bare
 * d-string, a whole `<path …/>` element, or a full `<svg>` document (first path).
 */
function extractPath(input: string): string {
  const text = input.trim();
  if (!text) return "";
  // If it contains markup, try to read the first path's d attribute.
  if (text.includes("<")) {
    const dAttr = /<path\b[^>]*\bd\s*=\s*(["'])([\s\S]*?)\1/i.exec(text);
    if (dAttr && dAttr[2] !== undefined) return dAttr[2].trim();
    // No <path d="…"> found. Leave the raw text so the error surfaces clearly.
    return text;
  }
  return text;
}

/** Wrap a d-string in a minimal, self-scaling SVG for download. */
function pathToSvg(d: string, info: PathInfo | null): string {
  const box = info?.bbox;
  const pad = box ? Math.max(box.width, box.height) * 0.08 + 1 : 1;
  const vb = box
    ? `${round(box.x - pad)} ${round(box.y - pad)} ${round(box.width + pad * 2)} ${round(
        box.height + pad * 2,
      )}`
    : "0 0 100 100";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">\n` +
    `  <path d="${d.replace(/"/g, "&quot;")}" fill="none" stroke="#111827" stroke-width="1"/>\n` +
    `</svg>`
  );
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sample paths, one click from a meaningful, non-trivial preview.
 * ──────────────────────────────────────────────────────────────────────────── */

const SAMPLE_HEART =
  "M12 21 C12 21 3 13.7 3 8.5 A5.5 5.5 0 0 1 12 5 A5.5 5.5 0 0 1 21 8.5 C21 13.7 12 21 12 21 Z";

const SAMPLE_STAR =
  "M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z";

const SAMPLE_WAVE =
  "M0 40 C 40 0, 80 80, 120 40 S 200 0, 240 40";

const SAMPLE_CHECK = "M4 12 l5 5 L20 6";

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Heart (curves + arcs)",
    description: "Cubic béziers and arcs closing into a shape",
    value: SAMPLE_HEART,
    icon: "Heart",
  },
  {
    label: "Star (straight lines)",
    description: "Ten line-to commands and a close",
    value: SAMPLE_STAR,
    icon: "Star",
  },
  {
    label: "Wave (smooth curves)",
    description: "C then smooth-S continuation",
    value: SAMPLE_WAVE,
    icon: "Waves",
  },
  {
    label: "Checkmark (relative)",
    description: "Mix of relative and absolute line-to",
    value: SAMPLE_CHECK,
    icon: "Check",
  },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+o", description: "Open / import an SVG or path file" },
  { combo: "mod+c", description: "Copy the path d-string" },
  { combo: "mod+s", description: "Download as an SVG" },
  { combo: "mod+z", description: "Undo edit" },
  { combo: "mod+shift+z", description: "Redo edit" },
  { combo: "mod+backspace", description: "Clear the editor" },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Command breakdown
 * ──────────────────────────────────────────────────────────────────────────── */

function CommandRow({ cmd, index }: { cmd: PathCommand; index: number }) {
  const lower = cmd.command.toLowerCase();
  const labels = PARAM_LABELS[lower] ?? [];
  const name = COMMAND_NAMES[lower] ?? "Command";
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {index + 1}
      </span>
      <span
        className={cn(
          "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded font-mono text-xs font-bold",
          cmd.relative
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            : "bg-primary/15 text-primary",
        )}
        title={`${cmd.command}: ${name} (${cmd.relative ? "relative" : "absolute"})`}
      >
        {cmd.command}
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-foreground">{name}</span>
        <span className="ml-1.5 text-[11px] text-muted-foreground/70">
          {cmd.relative ? "relative" : "absolute"}
        </span>
        {cmd.params.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {cmd.params.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-baseline gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[11px]"
              >
                {labels[i] && (
                  <span className="text-muted-foreground/60">{labels[i]}</span>
                )}
                <span className="tabular-nums text-foreground">
                  {formatNumber(p)}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Geometry panel
 * ──────────────────────────────────────────────────────────────────────────── */

function GeometryPanel({ info }: { info: PathInfo }) {
  const commands = React.useMemo(
    () =>
      Object.entries(info.commandCounts).sort((a, b) => b[1] - a[1]),
    [info.commandCounts],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        <StatBadge
          label="Length"
          value={formatNumber(info.length)}
          icon="Ruler"
          tone="info"
        />
        <StatBadge
          label={info.lengthExact ? "Exact" : "Estimated"}
          value={info.lengthExact ? "Measured" : "Flattened"}
          icon={info.lengthExact ? "CircleCheck" : "CircleDashed"}
          tone={info.lengthExact ? "success" : "default"}
        />
        <StatBadge label="Commands" value={info.total} icon="Command" />
        <StatBadge label="Subpaths" value={info.subpaths} icon="GitBranch" />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-card/50 px-3">
        <div className="flex items-start justify-between gap-3 py-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Frame" size={14} className="shrink-0" />
            Bounding box
          </span>
          <code className="rounded bg-muted px-1.5 py-0.5 text-right font-mono text-xs">
            {formatNumber(info.bbox.width)} × {formatNumber(info.bbox.height)}
          </code>
        </div>
        <div className="flex items-start justify-between gap-3 py-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Move" size={14} className="shrink-0" />
            Top-left
          </span>
          <code className="rounded bg-muted px-1.5 py-0.5 text-right font-mono text-xs">
            {formatNumber(info.bbox.x)}, {formatNumber(info.bbox.y)}
          </code>
        </div>
        <div className="flex items-start justify-between gap-3 py-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Spline" size={14} className="shrink-0" />
            Outline length
          </span>
          <span className="text-right text-sm font-medium text-foreground">
            {formatNumber(info.length)}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {info.lengthExact ? "units (exact)" : "units (est.)"}
            </span>
          </span>
        </div>
      </div>

      {commands.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Command histogram
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {commands.map(([letter, count]) => (
              <span
                key={letter}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs"
              >
                <code className="font-mono font-semibold text-foreground">
                  {letter}
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
 * SVG Path Editor tool
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * SVG Path Editor: edit a single `<path>` d-string with a live, auto-fitted
 * outline (anchors + bezier handles from <PathVisualizer>), a command-by-command
 * breakdown, geometry facts (length/bbox/subpaths) from `pathInfo`, and one-click
 * absolute/relative normalisation via `normalizePath`. Undo/redo, copy/download/
 * share, examples and keyboard shortcuts are wired through the dev harness; every
 * operation runs locally and nothing is uploaded.
 */
export default function SvgPathEditorTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 350 });
  const d = history.state;

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const hasContent = d.trim().length > 0;

  // Parse + geometry (memoised; both are pure and DOM-safe).
  const parsed = React.useMemo(() => parsePath(d), [d]);
  const commands: PathCommand[] = parsed.ok ? parsed.result : [];
  const parseError = parsed.ok ? null : parsed.error.message;

  const info = React.useMemo<PathInfo | null>(() => {
    if (!hasContent) return null;
    const res = pathInfo(d);
    return res.ok ? res.result : null;
  }, [d, hasContent]);

  // Import a dropped/picked file (or extract a path from pasted markup).
  const importText = React.useCallback(
    (text: string) => history.set(extractPath(text)),
    [history],
  );

  const importFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      file
        .text()
        .then((text) => importText(text))
        .catch(() => undefined);
    },
    [importText],
  );

  const { isDragging, dropProps } = useFileDrop({ onFiles: importFiles });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const openPicker = React.useCallback(() => fileInputRef.current?.click(), []);

  const clear = React.useCallback(() => history.set(""), [history]);

  // Normalise the whole path to absolute or relative commands.
  const normalize = React.useCallback(
    (toAbsolute: boolean) => {
      if (!hasContent) return;
      const res = normalizePath(d, { toAbsolute });
      if (res.ok) history.set(res.result);
    },
    [d, hasContent, history],
  );

  const svgForDownload = React.useMemo(
    () => pathToSvg(d, info),
    [d, info],
  );

  // Keyboard shortcuts. mod combos fire even inside the editor.
  useShortcuts(
    {
      "mod+o": (e) => {
        e.preventDefault();
        openPicker();
      },
      "mod+s": (e) => {
        e.preventDefault();
        if (hasContent)
          download("path.svg", svgForDownload, "image/svg+xml;charset=utf-8");
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

  return (
    <div className="flex flex-col gap-3" {...dropProps}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) importFiles(files);
          e.target.value = "";
        }}
      />

      {/* Toolbar */}
      <Toolbar>
        <ToolbarButton icon="FolderOpen" label="Open" onClick={openPicker} />
        <ExamplesMenu
          examples={EXAMPLES}
          onPick={(value) => history.set(value)}
          label="Samples"
        />
        <ToolbarDivider />
        <ToolbarButton
          icon="Repeat"
          label="Absolute"
          onClick={() => normalize(true)}
          disabled={!hasContent || !parsed.ok}
        />
        <ToolbarButton
          icon="Repeat2"
          label="Relative"
          onClick={() => normalize(false)}
          disabled={!hasContent || !parsed.ok}
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
          onClick={() =>
            download("path.svg", svgForDownload, "image/svg+xml;charset=utf-8")
          }
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

      {!hasContent ? (
        <FileDropZone
          onFiles={importFiles}
          accept={ACCEPT}
          label="Drop an SVG, paste a path d-string, or load a sample"
          hint="Paste a bare d, a whole <path> element, or a full SVG. Everything runs in your browser."
          icon="Spline"
        />
      ) : (
        <div
          className={cn(
            "grid gap-3 lg:grid-cols-2",
            isDragging &&
              "rounded-lg outline-2 outline-dashed outline-primary/60",
          )}
        >
          {/* Left: live visualiser + editable d code pane */}
          <PathVisualizer
            d={d}
            onChange={(value) => history.set(value)}
            minHeight={320}
          />

          {/* Right: command breakdown */}
          <section
            aria-label="Path command breakdown"
            className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-border bg-card/60"
          >
            <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon name="ListOrdered" size={15} className="text-primary" />
                Commands
              </h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {commands.length} total
              </span>
            </header>
            {parseError ? (
              <p className="flex items-center gap-2 px-3 py-4 text-sm text-destructive">
                <Icon name="TriangleAlert" size={15} className="shrink-0" />
                {parseError}
              </p>
            ) : commands.length > 0 ? (
              <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
                {commands.map((cmd, i) => (
                  <CommandRow key={i} cmd={cmd} index={i} />
                ))}
              </div>
            ) : (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                Enter path data to see the command breakdown.
              </p>
            )}
          </section>
        </div>
      )}

      {/* Geometry report */}
      {hasContent && (
        <section
          aria-label="Path geometry report"
          className="rounded-xl border border-border bg-card/60 p-4"
        >
          <header className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="Ruler" size={16} className="text-primary" />
              Geometry
            </h3>
            <Link
              href="/svg-optimizer"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Icon name="Wand2" size={13} />
              Optimize this path
            </Link>
          </header>

          {parseError ? (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <Icon name="TriangleAlert" size={15} />
              {parseError}
            </p>
          ) : info ? (
            <GeometryPanel info={info} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Geometry appears once the path parses cleanly.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
