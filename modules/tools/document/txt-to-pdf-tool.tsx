"use client";

/**
 * Text to PDF: the Document Studio's selectable-text converter.
 *
 * Paste/drop/type plain text on the left, see a live paginated page preview on
 * the right that mirrors the chosen font, size, margins and page size, then
 * export a PDF whose body is REAL selectable vector text (`txtToPdf`). Nothing
 * is uploaded. The PDF library (jsPDF) is lazy-imported inside the engine.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  CodePane,
  CopyButton,
  ExamplesMenu,
  Field,
  NumberStepper,
  SegmentedControl,
  SelectField,
  StatBadge,
  download,
  type Example,
} from "@/components/tool/dev";
import { textStats } from "@/lib/document-tools";
import { txtToPdf, type TxtToPdfOptions } from "@/lib/document-tools/convert";

/* ── Options ──────────────────────────────────────────────────────────────── */

type FontKey = NonNullable<TxtToPdfOptions["font"]>;
type PageSize = "a4" | "letter";
type MarginKey = "cozy" | "comfortable" | "wide";

const FONTS: ReadonlyArray<{ value: FontKey; label: string; css: string }> = [
  { value: "helvetica", label: "Sans-serif (Helvetica)", css: "Helvetica, Arial, sans-serif" },
  { value: "times", label: "Serif (Times)", css: "'Times New Roman', Times, serif" },
  { value: "courier", label: "Monospace (Courier)", css: "'Courier New', Courier, monospace" },
];

const PAGE_SIZES: ReadonlyArray<{ value: PageSize; label: string }> = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "US Letter" },
];

const MARGINS: ReadonlyArray<{ value: MarginKey; label: string }> = [
  { value: "cozy", label: "Cozy" },
  { value: "comfortable", label: "Comfortable" },
  { value: "wide", label: "Wide" },
];

/** Margin preset → point value passed to the engine (jsPDF works in points). */
const MARGIN_PT: Record<MarginKey, number> = {
  cozy: 32,
  comfortable: 48,
  wide: 72,
};

/** Page size → aspect ratio (w/h) used to scale the on-screen preview page. */
const PAGE_RATIO: Record<PageSize, number> = {
  a4: 210 / 297,
  letter: 8.5 / 11,
};

/* ── Samples ──────────────────────────────────────────────────────────────── */

const NOTES_SAMPLE = `Meeting notes, Q3 kickoff
2026-07-01 · Priya, Sam, Chandra

Decisions
 1. Ship the Document Studio in July.
 2. Keep everything client-side. No uploads.
 3. Prioritise the Text to PDF and Markdown to PDF flagships.

Action items
 - Sam: finalise the margin presets.
 - Priya: write the launch post.
 - Chandra: build the live preview.

Note
 "The words in the exported PDF stay real, selectable text. Recipients can copy a line or Ctrl+F straight from the file."
`;

const LOG_SAMPLE = `2026-07-01T09:14:02Z  INFO   worker started            pid=4821 region=us-east-1
2026-07-01T09:14:02Z  INFO   loaded config             file=/etc/gigai/app.toml
2026-07-01T09:14:03Z  DEBUG  cache warm                keys=1024 ms=42
2026-07-01T09:14:05Z  WARN   slow query                table=jobs ms=812
2026-07-01T09:14:07Z  ERROR  upstream timeout          host=api.internal ms=3001
2026-07-01T09:14:07Z  INFO   retry scheduled           attempt=2 backoff=500ms
2026-07-01T09:14:08Z  INFO   request ok                status=200 ms=61

Tip: export this in the Monospace (Courier) font so the columns stay aligned.
`;

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Meeting notes",
    description: "Indented lists, blank lines & a quote",
    value: NOTES_SAMPLE,
    icon: "NotebookPen",
  },
  {
    label: "Server log",
    description: "Space-aligned columns. Try Courier",
    value: LOG_SAMPLE,
    icon: "Terminal",
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function TxtToPdfTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [source, setSource] = React.useState<string>(NOTES_SAMPLE);
  const [font, setFont] = React.useState<FontKey>("helvetica");
  const [size, setSize] = React.useState<number>(11);
  const [pageSize, setPageSize] = React.useState<PageSize>("a4");
  const [margin, setMargin] = React.useState<MarginKey>("comfortable");
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const stats = React.useMemo(() => textStats(source), [source]);
  const fontCss = React.useMemo(
    () => FONTS.find((f) => f.value === font)?.css ?? "sans-serif",
    [font],
  );

  const handleDropText = React.useCallback((text: string) => {
    setSource(text);
    setError(null);
  }, []);

  const handleExport = React.useCallback(async () => {
    if (!source.trim()) {
      setError("Add some text before exporting.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const res = await txtToPdf(source, {
        font,
        size,
        margins: MARGIN_PT[margin],
        format: pageSize,
      });
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
  }, [source, font, size, margin, pageSize]);

  const reset = React.useCallback(() => {
    setSource("");
    setError(null);
  }, []);

  // Preview padding scaled so the on-screen page roughly mirrors the PDF margins.
  const previewPad = MARGIN_PT[margin] * 0.9;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <ExamplesMenu
          examples={EXAMPLES}
          onPick={(value) => {
            setSource(value);
            setError(null);
          }}
        />
        <CopyButton getValue={() => source} label="Copy text" disabled={!source} />
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
          label="Text"
          placeholder="Paste or type plain text here…"
          lineNumbers
          ariaLabel="Plain text source editor"
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
            {/* The "page" - white sheet whose ratio and padding mirror the PDF. */}
            <div
              className="mx-auto rounded-md bg-white text-black shadow-sm ring-1 ring-black/5"
              style={{
                width: "100%",
                maxWidth: 640,
                aspectRatio: String(PAGE_RATIO[pageSize]),
                padding: previewPad,
                overflow: "hidden",
              }}
            >
              <pre
                aria-label="PDF page preview"
                style={{
                  margin: 0,
                  fontFamily: fontCss,
                  fontSize: Math.max(9, size),
                  lineHeight: 1.35,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  wordBreak: "normal",
                }}
              >
                {source || "Your document appears here…"}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
        <Field label="Font">
          <SelectField
            value={font}
            onChange={setFont}
            options={FONTS.map(({ value, label }) => ({ value, label }))}
            ariaLabel="Font family"
            className="min-w-[13rem]"
          />
        </Field>
        <Field label="Font size">
          <NumberStepper
            value={size}
            onChange={setSize}
            min={7}
            max={36}
            step={1}
            ariaLabel="Font size in points"
          />
        </Field>
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

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="lg"
            onClick={() => void handleExport()}
            disabled={exporting || !source.trim()}
          >
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
      <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          The PDF body is drawn as real vector text, so it stays selectable and searchable. This
          renders plain text only: Markdown symbols and HTML tags appear literally. Need styled
          headings, tables and code? Use the <span className="font-medium">Markdown to PDF</span>{" "}
          tool. Everything runs in your browser. Nothing is uploaded.
        </span>
      </p>
    </div>
  );
}
