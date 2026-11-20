"use client";

import * as React from "react";
import Link from "next/link";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  CodePane,
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
import {
  SvgPreview,
  type PreviewBackground,
  type PreviewZoom,
} from "@/components/tool/svg";
import { analyzeSvg, type SvgAnalysis } from "@/lib/svg-tools/validate";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const ACCEPT = ".svg,image/svg+xml";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
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
  return c.length > 22 ? `${c.slice(0, 21)}…` : c;
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
 * Sample SVGs, one click from a useful, non-trivial preview.
 * ──────────────────────────────────────────────────────────────────────────── */

const SAMPLE_LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">\n' +
  '  <defs>\n' +
  '    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\n' +
  '      <stop offset="0%" stop-color="#06b6d4"/>\n' +
  '      <stop offset="100%" stop-color="#3b82f6"/>\n' +
  '    </linearGradient>\n' +
  '  </defs>\n' +
  '  <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#g)"/>\n' +
  '  <path d="M40 74 L60 40 L80 74 Z" fill="#ffffff" fill-opacity="0.92"/>\n' +
  '  <circle cx="60" cy="82" r="6" fill="#ffffff"/>\n' +
  '</svg>';

const SAMPLE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n' +
  '  <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>\n' +
  '</svg>';

const SAMPLE_NO_VIEWBOX =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">\n' +
  '  <!-- No viewBox: watch the report flag it -->\n' +
  '  <circle cx="32" cy="32" r="28" fill="#f43f5e"/>\n' +
  '  <rect x="20" y="20" width="24" height="24" fill="#ffffff" rx="4"/>\n' +
  '</svg>';

const SAMPLE_ANIMATED =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">\n' +
  '  <circle cx="50" cy="50" r="34" fill="none" stroke="#10b981" stroke-width="8" ' +
  'stroke-dasharray="160 60" stroke-linecap="round">\n' +
  '    <animateTransform attributeName="transform" type="rotate" from="0 50 50" ' +
  'to="360 50 50" dur="1.4s" repeatCount="indefinite"/>\n' +
  '  </circle>\n' +
  '</svg>';

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Gradient logo",
    description: "Rounded mark with a linear gradient",
    value: SAMPLE_LOGO,
    icon: "Sparkles",
  },
  {
    label: "currentColor icon",
    description: "A stroke icon that inherits text color",
    value: SAMPLE_ICON,
    icon: "Star",
  },
  {
    label: "Missing viewBox",
    description: "See the report flag a scaling problem",
    value: SAMPLE_NO_VIEWBOX,
    icon: "TriangleAlert",
  },
  {
    label: "Animated spinner",
    description: "SMIL animation the report detects",
    value: SAMPLE_ANIMATED,
    icon: "Loader",
  },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+o", description: "Open / import an SVG file" },
  { combo: "mod+c", description: "Copy the SVG source" },
  { combo: "mod+s", description: "Download the .svg" },
  { combo: "mod+z", description: "Undo edit" },
  { combo: "mod+shift+z", description: "Redo edit" },
  { combo: "mod+backspace", description: "Clear the canvas" },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Report panel
 * ──────────────────────────────────────────────────────────────────────────── */

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

function AnalysisReport({ analysis }: { analysis: SvgAnalysis }) {
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
        <StatBadge
          label="Colors"
          value={analysis.colors.length}
          icon="Palette"
        />
        <StatBadge
          label="viewBox"
          value={analysis.viewBox ? "Present" : "Missing"}
          icon={analysis.viewBox ? "CircleCheck" : "TriangleAlert"}
          tone={analysis.viewBox ? "success" : "warning"}
        />
      </div>

      {/* Detail rows */}
      <div className="divide-y divide-border rounded-lg border border-border bg-card/50 px-3">
        <ReportRow icon="Frame" label="viewBox">
          {analysis.viewBox ? (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {analysis.viewBox}
            </code>
          ) : (
            <span className="text-warning">None, won&apos;t scale responsively</span>
          )}
        </ReportRow>
        <ReportRow icon="Boxes" label="Total nodes">
          {analysis.totalElements}
        </ReportRow>
        <ReportRow icon="Scale" label="Byte size">
          {formatBytes(analysis.bytes)}
        </ReportRow>
      </div>

      {/* Feature flags */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Features
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <FeatureFlag on={analysis.hasGradients} label="Gradients" />
          <FeatureFlag on={analysis.hasFilters} label="Filters" />
          <FeatureFlag on={analysis.hasAnimation} label="Animation" />
        </div>
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
 * SVG Viewer tool
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * SVG Viewer: a desktop-grade viewer that opens/pastes/drops an SVG into a
 * transparency-aware canvas (checkerboard/light/dark, fit/50/100/200% zoom),
 * with a live dimensions readout, an editable source-code pane, and a full
 * composition report (elements, colors, gradients/filters/animation, viewBox,
 * byte size) from `analyzeSvg`. Undo/redo, copy/download/share, examples and
 * keyboard shortcuts are wired through the dev harness; nothing is uploaded.
 */
export default function SvgViewerTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 350 });
  const svg = history.state;

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const [background, setBackground] =
    React.useState<PreviewBackground>("checker");
  const [zoom, setZoom] = React.useState<PreviewZoom>("fit");

  const hasContent = svg.trim().length > 0;

  // Import a dropped/picked file into history as a discrete undo step.
  const importFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      file
        .text()
        .then((text) => history.set(text))
        .catch(() => undefined);
    },
    [history],
  );

  const { isDragging, dropProps } = useFileDrop({ onFiles: importFiles });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const openPicker = React.useCallback(() => fileInputRef.current?.click(), []);

  const clear = React.useCallback(() => history.set(""), [history]);

  // Live analysis of the current SVG (safe, pure, browser-native).
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

  // Keyboard shortcuts. mod combos fire even inside the editor.
  useShortcuts(
    {
      "mod+o": (e) => {
        e.preventDefault();
        openPicker();
      },
      "mod+s": (e) => {
        e.preventDefault();
        if (hasContent) download("image.svg", svg, "image/svg+xml;charset=utf-8");
      },
      "mod+backspace": (e) => {
        e.preventDefault();
        clear();
      },
      "mod+z": (e) => {
        // Let the textarea's own undo win when it has focus and history is short;
        // otherwise drive our stack. We simply prefer our stack for consistency.
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
        <CopyButton getValue={() => svg} label="Copy SVG" disabled={!hasContent} />
        <ToolbarButton
          icon="Download"
          label="Download"
          disabled={!hasContent}
          onClick={() =>
            download("image.svg", svg, "image/svg+xml;charset=utf-8")
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
          onClick={() => void share.copyShareLink(svg)}
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
          label="Drop an SVG, click to browse, or paste markup below"
          hint="Everything runs in your browser, files never leave your device."
          icon="FileImage"
        />
      ) : (
        <div
          className={cn(
            "grid gap-3 lg:grid-cols-2",
            isDragging &&
              "rounded-lg outline-2 outline-dashed outline-primary/60",
          )}
        >
          {/* Left: preview canvas */}
          <SvgPreview
            svg={svg}
            background={background}
            onBackgroundChange={setBackground}
            zoom={zoom}
            onZoomChange={setZoom}
            minHeight={320}
            ariaLabel="SVG preview canvas"
            emptyLabel="Paste or drop an SVG to preview it"
          />

          {/* Right: editable source */}
          <CodePane
            value={svg}
            onChange={(v) => history.set(v)}
            onDropText={(text) => history.set(text)}
            label="SVG source"
            placeholder="Paste SVG markup here…"
            lineNumbers
            wrap={false}
            minHeight={320}
            errorLine={analysisError ? 1 : null}
            ariaLabel="SVG source editor"
          />
        </div>
      )}

      {/* Report */}
      {hasContent && (
        <section
          aria-label="SVG composition report"
          className="rounded-xl border border-border bg-card/60 p-4"
        >
          <header className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="ScanSearch" size={16} className="text-primary" />
              Composition report
            </h3>
            <Link
              href="/svg-optimizer"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Icon name="Wand2" size={13} />
              Optimize this SVG
            </Link>
          </header>

          {analysisError ? (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <Icon name="TriangleAlert" size={15} />
              {analysisError}
            </p>
          ) : analysis ? (
            <AnalysisReport analysis={analysis} />
          ) : null}
        </section>
      )}
    </div>
  );
}
