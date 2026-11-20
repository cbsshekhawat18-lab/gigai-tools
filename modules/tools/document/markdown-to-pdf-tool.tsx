"use client";

/**
 * Markdown to PDF, the flagship Document Studio converter.
 *
 * A split-pane editor: write/paste/drop Markdown on the left, see a live
 * GitHub-flavoured preview on the right, then export a paginated PDF (A4/Letter,
 * tunable margins, light/sepia theme). Everything runs in the browser, the
 * Markdown parser (`markdownToHtml`) and PDF renderer (`markdownToPdf`) are
 * lazy-imported by the engine, nothing is uploaded.
 */

import * as React from "react";

import type { Tool, WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  CodePane,
  CopyButton,
  ExamplesMenu,
  Field,
  SegmentedControl,
  StatBadge,
  download,
  type Example,
} from "@/components/tool/dev";
import { markdownToHtml, textStats } from "@/lib/document-tools";
import { markdownToPdf } from "@/lib/document-tools/convert";

/* ── Options ──────────────────────────────────────────────────────────────── */

type PageSize = "a4" | "letter";
type MarginKey = "cozy" | "comfortable" | "wide";
type ThemeKey = "light" | "sepia";

const PAGE_SIZES: ReadonlyArray<{ value: PageSize; label: string }> = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "US Letter" },
];

const MARGINS: ReadonlyArray<{ value: MarginKey; label: string }> = [
  { value: "cozy", label: "Cozy" },
  { value: "comfortable", label: "Comfortable" },
  { value: "wide", label: "Wide" },
];

/** Margin preset → outer padding (px) applied to the printable page. */
const MARGIN_PX: Record<MarginKey, number> = {
  cozy: 32,
  comfortable: 56,
  wide: 88,
};

const THEMES: ReadonlyArray<{ value: ThemeKey; label: string; icon: string }> = [
  { value: "light", label: "Light", icon: "Sun" },
  { value: "sepia", label: "Sepia", icon: "BookOpen" },
];

/** Theme preset → page + ink colors (used for both preview and export). */
const THEME_COLORS: Record<ThemeKey, { bg: string; fg: string }> = {
  light: { bg: "#ffffff", fg: "#111111" },
  sepia: { bg: "#faf4e6", fg: "#3a2f1c" },
};

/* ── Samples ──────────────────────────────────────────────────────────────── */

const README_SAMPLE = `# GigAI Toolkit

> The best **free** document toolkit - 100% in your browser.

A collection of fast, private tools that never upload your files.

## Features

- Convert Markdown to a clean PDF
- Merge, split and organize PDFs
- Live preview as you type
- Works offline once loaded

## Install

\`\`\`bash
npm install gigai-toolkit
\`\`\`

## Status

| Tool            | State   | Notes                  |
| --------------- | ------- | ---------------------- |
| Markdown to PDF | Live    | GitHub-flavoured       |
| Text to PDF     | Live    | Selectable vector text |
| Merge PDF       | Live    | Drag to reorder        |

## Roadmap

- [x] Live split-pane preview
- [x] Page size & margins
- [ ] Custom fonts

---

Made with care. See the [docs](https://example.com) for more.
`;

const NOTES_SAMPLE = `# Meeting notes - Q3 kickoff

**Date:** 2026-07-01 · **Attendees:** Priya, Sam, Chandra

## Decisions

1. Ship the Document Studio in July
2. Keep everything client-side, *no uploads*
3. Prioritise the Markdown to PDF flagship

## Action items

- [ ] Sam: finalise the margin presets
- [ ] Priya: write the launch post
- [x] Chandra: build the split-pane editor

## Notes

> "What you see in the preview is exactly what the PDF contains."

Any \`inline code\` and long-form prose renders cleanly for print.
`;

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Project README",
    description: "Headings, table, code fence & task list",
    value: README_SAMPLE,
    icon: "FileCode2",
  },
  {
    label: "Meeting notes",
    description: "Lists, quote, checkboxes & inline code",
    value: NOTES_SAMPLE,
    icon: "NotebookPen",
  },
];

/* ── Preview styling (shared look for on-screen preview) ──────────────────── */

const PREVIEW_CSS = `
.gk-md{font-family:Georgia,'Times New Roman',serif;line-height:1.65;font-size:15px;}
.gk-md h1,.gk-md h2,.gk-md h3,.gk-md h4{font-family:ui-sans-serif,system-ui,Arial,sans-serif;line-height:1.25;margin:1.3em 0 .5em;font-weight:700;}
.gk-md h1{font-size:1.9em;border-bottom:1px solid rgba(0,0,0,.12);padding-bottom:.25em;}
.gk-md h2{font-size:1.5em;border-bottom:1px solid rgba(0,0,0,.08);padding-bottom:.2em;}
.gk-md h3{font-size:1.22em;} .gk-md h4{font-size:1.05em;}
.gk-md p{margin:0 0 .85em;} .gk-md ul,.gk-md ol{margin:0 0 .85em 1.5em;} .gk-md li{margin:.2em 0;}
.gk-md li input[type=checkbox]{margin-right:.4em;}
.gk-md code{font-family:ui-monospace,'Courier New',monospace;background:rgba(0,0,0,.06);border-radius:4px;padding:1px 5px;font-size:.88em;}
.gk-md pre{font-family:ui-monospace,'Courier New',monospace;background:rgba(0,0,0,.05);border-radius:8px;padding:14px 16px;overflow:auto;margin:0 0 .95em;}
.gk-md pre code{background:none;padding:0;font-size:.85em;}
.gk-md blockquote{margin:0 0 .9em;padding:.1em 0 .1em 14px;border-left:3px solid rgba(0,0,0,.2);opacity:.85;}
.gk-md table{border-collapse:collapse;width:100%;margin:0 0 1em;font-size:.9em;}
.gk-md th,.gk-md td{border:1px solid rgba(0,0,0,.18);padding:6px 10px;text-align:left;}
.gk-md th{background:rgba(0,0,0,.05);font-weight:600;}
.gk-md hr{border:none;border-top:1px solid rgba(0,0,0,.15);margin:1.4em 0;}
.gk-md a{color:#6d28d9;text-decoration:underline;} .gk-md img{max-width:100%;}
`;

/* ── Component ────────────────────────────────────────────────────────────── */

export default function MarkdownToPdfTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [source, setSource] = React.useState<string>(README_SAMPLE);
  const [html, setHtml] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<PageSize>("a4");
  const [margin, setMargin] = React.useState<MarginKey>("comfortable");
  const [theme, setTheme] = React.useState<ThemeKey>("light");
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const previewRef = React.useRef<HTMLDivElement | null>(null);

  // Live render Markdown -> sanitised HTML (marked is lazy-imported inside).
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const out = await markdownToHtml(source);
      if (!cancelled) setHtml(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  const stats = React.useMemo(() => textStats(source), [source]);
  const colors = THEME_COLORS[theme];

  const handleDropText = React.useCallback((text: string) => {
    setSource(text);
    setError(null);
  }, []);

  const handleExport = React.useCallback(async () => {
    if (!source.trim()) {
      setError("Add some Markdown before exporting.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const res = await markdownToPdf(source, { format: pageSize });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      download("document.pdf", res.result, "application/pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [source, pageSize]);

  const reset = React.useCallback(() => {
    setSource("");
    setError(null);
  }, []);

  const previewHtml = html || "<p style='opacity:.5'>Your rendered document appears here…</p>";

  return (
    <div className="flex flex-col gap-4">
      <style>{PREVIEW_CSS}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <ExamplesMenu
          examples={EXAMPLES}
          onPick={(value) => {
            setSource(value);
            setError(null);
          }}
        />
        <CopyButton
          getValue={() => html}
          label="Copy HTML"
          disabled={!html}
        />
        <Button variant="ghost" size="sm" onClick={reset}>
          <Icon name="RotateCcw" size={15} />
          Clear
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          <StatBadge label="Words" value={stats.words} icon="Type" />
          <StatBadge label="Chars" value={stats.characters} icon="Hash" />
          <StatBadge label="Lines" value={stats.lines} icon="AlignLeft" />
        </div>
      </div>

      {/* Split-pane editor + preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CodePane
          value={source}
          onChange={(v) => {
            setSource(v);
            setError(null);
          }}
          onDropText={handleDropText}
          label="Markdown"
          placeholder="# Type or paste Markdown here…"
          lineNumbers
          ariaLabel="Markdown source editor"
          minHeight={420}
          maxHeight={620}
        />

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <Icon name="Eye" size={14} />
            Live preview
            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 uppercase tracking-wide">
              {pageSize === "a4" ? "A4" : "Letter"}
            </span>
          </div>
          <div
            className="flex-1 overflow-auto p-4"
            style={{ background: "color-mix(in srgb, var(--muted) 40%, transparent)" }}
          >
            {/* The "page" - its styling mirrors the exported PDF. */}
            <div
              className="mx-auto max-w-[820px] rounded-md shadow-sm ring-1 ring-black/5"
              style={{
                background: colors.bg,
                color: colors.fg,
                padding: MARGIN_PX[margin],
                minHeight: 360,
              }}
            >
              <div
                ref={previewRef}
                className="gk-md"
                 
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
        <Field label="Page size">
          <SegmentedControl
            value={pageSize}
            onChange={setPageSize}
            options={PAGE_SIZES}
            ariaLabel="Page size"
            size="sm"
          />
        </Field>
        <Field label="Margins">
          <SegmentedControl
            value={margin}
            onChange={setMargin}
            options={MARGINS}
            ariaLabel="Page margins"
            size="sm"
          />
        </Field>
        <Field label="Theme">
          <SegmentedControl
            value={theme}
            onChange={setTheme}
            options={THEMES}
            ariaLabel="Document theme"
            size="sm"
          />
        </Field>

        <div className="ml-auto flex items-center gap-2">
          <Button size="lg" onClick={() => void handleExport()} disabled={exporting || !source.trim()}>
            {exporting ? (
              <Icon name="LoaderCircle" size={18} className="animate-spin" />
            ) : (
              <Icon name="FileDown" size={18} />
            )}
            {exporting ? "Rendering…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Honesty note */}
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          Styled Markdown (tables, code, colors) is rendered as a high-resolution image in the PDF
          to preserve the exact look, so that text isn&apos;t individually selectable. Need
          selectable, searchable body text instead? Use the{" "}
          <span className="font-medium">Text to PDF</span> tool, which draws real vector text.
          Everything runs in your browser. Nothing is uploaded.
        </span>
      </p>
    </div>
  );
}
