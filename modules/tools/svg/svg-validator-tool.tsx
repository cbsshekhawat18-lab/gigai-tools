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
import {
  validateSvg,
  analyzeSvg,
  type SvgValidation,
  type SvgAnalysis,
} from "@/lib/svg-tools/validate";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const ACCEPT = ".svg,image/svg+xml";

const ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
function byteLength(s: string): number {
  if (ENCODER) return ENCODER.encode(s).length;
  return unescape(encodeURIComponent(s)).length;
}

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

/* ────────────────────────────────────────────────────────────────────────────
 * Sample SVGs, a clean pass, a broken parse, and a deliberately unsafe file.
 * ──────────────────────────────────────────────────────────────────────────── */

const SAMPLE_VALID =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">\n' +
  '  <rect x="8" y="8" width="104" height="104" rx="24" fill="#14b8a6"/>\n' +
  '  <path d="M40 74 L60 40 L80 74 Z" fill="#ffffff"/>\n' +
  '  <circle cx="60" cy="82" r="6" fill="#ffffff"/>\n' +
  "</svg>";

const SAMPLE_NO_VIEWBOX =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">\n' +
  "  <!-- No viewBox: watch the checklist warn about scaling -->\n" +
  '  <circle cx="32" cy="32" r="28" fill="#f59e0b"/>\n' +
  "</svg>";

const SAMPLE_BROKEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n' +
  "  <!-- Unclosed <rect> & a bare ampersand break well-formedness -->\n" +
  '  <rect x="10" y="10" width="80" height="80" fill="#ef4444">\n' +
  "  <text x=\"20\" y=\"55\">A & B</text>\n" +
  "</svg>";

const SAMPLE_UNSAFE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" onload="alert(1)">\n' +
  '  <script>alert(document.domain)</script>\n' +
  '  <a href="javascript:alert(2)"><rect width="100" height="100" fill="#a855f7"/></a>\n' +
  "  <foreignObject><div xmlns=\"http://www.w3.org/1999/xhtml\">html</div></foreignObject>\n" +
  "</svg>";

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Valid icon",
    description: "A clean file that passes every check",
    value: SAMPLE_VALID,
    icon: "CircleCheck",
  },
  {
    label: "Missing viewBox",
    description: "Warns about responsive scaling",
    value: SAMPLE_NO_VIEWBOX,
    icon: "TriangleAlert",
  },
  {
    label: "Broken markup",
    description: "Unclosed tag + bare ampersand",
    value: SAMPLE_BROKEN,
    icon: "Bug",
  },
  {
    label: "Unsafe SVG",
    description: "script, onload, foreignObject, javascript:",
    value: SAMPLE_UNSAFE,
    icon: "ShieldAlert",
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
 * Checklist model: turn validate + analyze into explicit pass/warn/error rows.
 * ──────────────────────────────────────────────────────────────────────────── */

type CheckStatus = "pass" | "warn" | "error" | "info";

interface CheckItem {
  status: CheckStatus;
  label: string;
  detail: string;
}

interface CheckGroup {
  title: string;
  icon: string;
  items: CheckItem[];
}

const STATUS_META: Record<
  CheckStatus,
  { icon: string; ring: string; text: string; dot: string }
> = {
  pass: {
    icon: "CircleCheck",
    ring: "border-emerald-500/30 bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  warn: {
    icon: "TriangleAlert",
    ring: "border-amber-500/30 bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  error: {
    icon: "CircleX",
    ring: "border-destructive/30 bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  info: {
    icon: "Info",
    ring: "border-sky-500/30 bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
};

const SECURITY_KEYS = ["<script", "event handler", "foreignobject", "javascript:", "external url"];
function isSecurityMessage(message: string): boolean {
  const m = message.toLowerCase();
  return SECURITY_KEYS.some((k) => m.includes(k));
}

/**
 * Build the grouped checklist from a validation result. Structure checks that
 * did NOT trigger a warning are shown affirmatively as passes; security checks
 * default to "safe" and flip to warn/info when the linter reports the vector.
 */
function buildChecklist(v: SvgValidation): {
  structure: CheckGroup;
  security: CheckGroup;
} {
  const structureWarnings = v.warnings.filter((w) => !isSecurityMessage(w.message));
  const securityFindings = v.warnings.filter((w) => isSecurityMessage(w.message));

  // ---- Structure group ----
  const structureItems: CheckItem[] = [];

  // Well-formedness comes from errors.
  if (v.errors.length > 0) {
    for (const e of v.errors) {
      structureItems.push({
        status: "error",
        label: "Well-formed XML",
        detail: e.message,
      });
    }
  } else {
    structureItems.push({
      status: "pass",
      label: "Well-formed XML",
      detail: "Parses cleanly as XML. No unclosed tags or invalid characters.",
    });
  }

  // Only add affirmative structure rows when we actually parsed.
  if (v.errors.length === 0) {
    const has = (needle: string) =>
      structureWarnings.some((w) => w.message.toLowerCase().includes(needle));

    structureItems.push({
      status: has("xmlns") ? "warn" : "pass",
      label: "xmlns declaration",
      detail: has("xmlns")
        ? 'Missing xmlns="http://www.w3.org/2000/svg", required for standalone files.'
        : "Declares the SVG namespace, so the file works as a standalone asset.",
    });

    structureItems.push({
      status: has("viewbox") ? "warn" : "pass",
      label: "viewBox present",
      detail: has("viewbox")
        ? "No viewBox: the SVG renders at a fixed size and won't scale responsively."
        : "A viewBox is present, so the graphic scales to its container.",
    });

    const dimWarn = structureWarnings.find((w) =>
      /unusual (width|height)/i.test(w.message),
    );
    structureItems.push({
      status: dimWarn ? "warn" : "pass",
      label: "Dimension sanity",
      detail: dimWarn
        ? dimWarn.message
        : "Width and height are within a normal, non-zero range.",
    });

    const rootWarn = structureWarnings.find((w) =>
      /root element/i.test(w.message),
    );
    if (rootWarn) {
      structureItems.push({
        status: "warn",
        label: "Root element",
        detail: rootWarn.message,
      });
    }
  }

  // ---- Security group ----
  const securityItems: CheckItem[] = [];
  if (v.errors.length === 0) {
    const flagged = (needle: string) =>
      securityFindings.find((w) => w.message.toLowerCase().includes(needle));

    const scriptF = flagged("<script");
    securityItems.push({
      status: scriptF ? "error" : "pass",
      label: "No embedded <script>",
      detail: scriptF
        ? scriptF.message
        : "No <script> element: nothing executes when the SVG is inlined.",
    });

    const handlerF = flagged("event handler");
    securityItems.push({
      status: handlerF ? "error" : "pass",
      label: "No inline on* handlers",
      detail: handlerF
        ? handlerF.message
        : "No onload/onclick-style handlers that would run inline.",
    });

    const foF = flagged("foreignobject");
    securityItems.push({
      status: foF ? "warn" : "pass",
      label: "No <foreignObject>",
      detail: foF
        ? foF.message
        : "No <foreignObject> smuggling arbitrary HTML into the SVG.",
    });

    const jsF = flagged("javascript:");
    securityItems.push({
      status: jsF ? "error" : "pass",
      label: "No javascript: URLs",
      detail: jsF
        ? jsF.message
        : 'No "javascript:" URLs that could execute on interaction.',
    });

    const extF = flagged("external url");
    if (extF) {
      securityItems.push({
        status: "info",
        label: "External reference",
        detail: extF.message,
      });
    }
  } else {
    securityItems.push({
      status: "info",
      label: "Security scan skipped",
      detail: "Fix the well-formedness error above, then the security scan runs.",
    });
  }

  return {
    structure: { title: "Structure & correctness", icon: "FileCheck2", items: structureItems },
    security: { title: "Security scan", icon: "ShieldAlert", items: securityItems },
  };
}

/** Overall verdict for the headline banner. */
function verdict(v: SvgValidation): {
  status: CheckStatus;
  title: string;
  sub: string;
} {
  if (v.errors.length > 0) {
    return {
      status: "error",
      title: "Not valid",
      sub: "This SVG is not well-formed and needs to be fixed before it will render reliably.",
    };
  }
  const hasSecurity = v.warnings.some((w) => isSecurityMessage(w.message));
  const errorLikeSecurity = v.warnings.some(
    (w) =>
      isSecurityMessage(w.message) &&
      /(<script|event handler|javascript:)/i.test(w.message),
  );
  if (errorLikeSecurity) {
    return {
      status: "error",
      title: "Valid, but unsafe to embed",
      sub: "The SVG is well-formed but contains active-content vectors, sanitize it before rendering inline.",
    };
  }
  if (v.warnings.length > 0) {
    return {
      status: "warn",
      title: hasSecurity ? "Valid, with security notes" : "Valid, with warnings",
      sub: "The SVG parses correctly. Review the warnings below to fix scaling, portability or trust issues.",
    };
  }
  return {
    status: "pass",
    title: "Valid & clean",
    sub: "Well-formed, properly declared, and free of the constructs that make an SVG risky to embed.",
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Report UI
 * ──────────────────────────────────────────────────────────────────────────── */

function CheckRow({ item }: { item: CheckItem }) {
  const meta = STATUS_META[item.status];
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Icon
        name={meta.icon}
        size={16}
        className={cn("mt-0.5 shrink-0", meta.text)}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{item.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {item.detail}
        </p>
      </div>
    </li>
  );
}

function CheckGroupCard({ group }: { group: CheckGroup }) {
  const counts = group.items.reduce(
    (acc, it) => {
      acc[it.status] += 1;
      return acc;
    },
    { pass: 0, warn: 0, error: 0, info: 0 } as Record<CheckStatus, number>,
  );
  const worst: CheckStatus =
    counts.error > 0 ? "error" : counts.warn > 0 ? "warn" : counts.info > 0 && counts.pass === 0 ? "info" : "pass";
  const meta = STATUS_META[worst];

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <header className="mb-1 flex items-center gap-2">
        <Icon name={group.icon} size={15} className={meta.text} />
        <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
        <span className={cn("ml-auto size-2 rounded-full", meta.dot)} aria-hidden />
      </header>
      <ul className="divide-y divide-border/70">
        {group.items.map((item, i) => (
          <CheckRow key={`${item.label}-${i}`} item={item} />
        ))}
      </ul>
    </div>
  );
}

function VerdictBanner({ v }: { v: SvgValidation }) {
  const info = verdict(v);
  const meta = STATUS_META[info.status];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        meta.ring,
      )}
      role="status"
    >
      <Icon name={meta.icon} size={22} className={cn("mt-0.5 shrink-0", meta.text)} />
      <div className="min-w-0">
        <p className={cn("text-base font-semibold", meta.text)}>{info.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{info.sub}</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * SVG Validator tool
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * SVG Validator, a desktop-grade linter that parses pasted/dropped SVG with
 * the browser's native XML engine, then renders an explicit pass/warn/error
 * checklist (well-formedness, xmlns, viewBox, dimensions) plus a security scan
 * for <script>, on* handlers, <foreignObject>, javascript: and external
 * references. A live checkerboard preview and a composition summary sit beside
 * the findings; undo/redo, copy/download/share, examples and shortcuts run
 * through the dev harness. Advisory only: nothing is uploaded or sanitized.
 */
export default function SvgValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const svg = history.state;

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const [background, setBackground] =
    React.useState<PreviewBackground>("checker");
  const [zoom, setZoom] = React.useState<PreviewZoom>("fit");

  const hasContent = svg.trim().length > 0;

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

  // Live validation + analysis (pure, browser-native, never uploaded).
  const validation = React.useMemo<SvgValidation | null>(
    () => (hasContent ? validateSvg(svg) : null),
    [svg, hasContent],
  );

  const analysis = React.useMemo<SvgAnalysis | null>(() => {
    if (!hasContent) return null;
    const res = analyzeSvg(svg);
    return res.ok ? res.result : null;
  }, [svg, hasContent]);

  const checklist = React.useMemo(
    () => (validation ? buildChecklist(validation) : null),
    [validation],
  );

  // Summary counts for the toolbar stat badges.
  const summary = React.useMemo(() => {
    if (!validation) return null;
    const warnCount = validation.warnings.filter(
      (w) => w.severity === "warning",
    ).length;
    const infoCount = validation.warnings.filter(
      (w) => w.severity === "info",
    ).length;
    return {
      errors: validation.errors.length,
      warnings: warnCount,
      infos: infoCount,
    };
  }, [validation]);

  const parseError = validation && validation.errors.length > 0;

  useShortcuts(
    {
      "mod+o": (e) => {
        e.preventDefault();
        openPicker();
      },
      "mod+s": (e) => {
        e.preventDefault();
        if (hasContent)
          download("image.svg", svg, "image/svg+xml;charset=utf-8");
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
        {summary && (
          <div className="hidden items-center gap-1.5 sm:flex">
            {summary.errors > 0 && (
              <StatBadge
                label="Errors"
                value={summary.errors}
                icon="CircleX"
                tone="danger"
              />
            )}
            {summary.warnings > 0 && (
              <StatBadge
                label="Warnings"
                value={summary.warnings}
                icon="TriangleAlert"
                tone="default"
              />
            )}
            {summary.errors === 0 && summary.warnings === 0 && (
              <StatBadge label="Checks" value="All pass" icon="CircleCheck" tone="success" />
            )}
          </div>
        )}
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
          icon="ShieldCheck"
        />
      ) : (
        <div
          className={cn(
            "grid gap-3 lg:grid-cols-2",
            isDragging &&
              "rounded-lg outline-2 outline-dashed outline-primary/60",
          )}
        >
          {/* Left: preview */}
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
            errorLine={parseError ? 1 : null}
            ariaLabel="SVG source editor"
          />
        </div>
      )}

      {/* Validation report */}
      {hasContent && validation && checklist && (
        <section
          aria-label="SVG validation report"
          className="flex flex-col gap-3"
        >
          <VerdictBanner v={validation} />

          <div className="grid gap-3 lg:grid-cols-2">
            <CheckGroupCard group={checklist.structure} />
            <CheckGroupCard group={checklist.security} />
          </div>

          {/* Advisory note + optimize CTA */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              This is an advisory linter. It identifies risky constructs but
              does not sanitize or rewrite your SVG. Strip flagged vectors
              before rendering any SVG you did not author.
            </p>
            {validation.errors.length === 0 && (
              <Link
                href="/svg-optimizer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                <Icon name="Wand2" size={13} />
                Optimize this SVG
              </Link>
            )}
          </div>

          {/* Composition summary */}
          {analysis && (
            <div className="rounded-xl border border-border bg-card/60 p-4">
              <header className="mb-3 flex items-center gap-2">
                <Icon name="ScanSearch" size={15} className="text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Composition
                </h4>
              </header>
              <div className="flex flex-wrap gap-1.5">
                <StatBadge
                  label="Size"
                  value={formatBytes(analysis.bytes || byteLength(svg))}
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
                  tone={analysis.viewBox ? "success" : "default"}
                />
                {analysis.hasGradients && (
                  <StatBadge label="Gradients" value="Yes" icon="Blend" />
                )}
                {analysis.hasFilters && (
                  <StatBadge label="Filters" value="Yes" icon="Sparkles" />
                )}
                {analysis.hasAnimation && (
                  <StatBadge label="Animation" value="Yes" icon="Play" />
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
