"use client";

/**
 * HTML to PDF: Document Studio converter.
 *
 * A split-pane editor: paste/type/drop HTML on the left, see a live sandboxed
 * preview on the right, then export a paginated PDF (A4/Letter, tunable margins).
 * Everything runs in the browser, sanitisation + rendering happen locally via
 * the engine's `htmlToPdf` (DOMPurify -> html2canvas -> jsPDF). The preview frame
 * is sandboxed with NO scripts and NO network, honestly mirroring the export:
 * the page is drawn exactly as-is and external assets are not fetched.
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
  SegmentedControl,
  StatBadge,
  download,
  type Example,
} from "@/components/tool/dev";
import { sanitizeHtml, textStats } from "@/lib/document-tools";
import { htmlToPdf } from "@/lib/document-tools/convert";

/* ── Options ──────────────────────────────────────────────────────────────── */

type PageSize = "a4" | "letter";
type MarginKey = "cozy" | "comfortable" | "wide";

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

/* ── Samples ──────────────────────────────────────────────────────────────── */

const INVOICE_SAMPLE = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:760px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0ea5e9;padding-bottom:16px;">
    <div>
      <h1 style="margin:0;font-size:24px;color:#0ea5e9;">Gigai Kripa Services</h1>
      <p style="margin:4px 0 0;color:#555;">123 Studio Lane · Jaipur, IN</p>
    </div>
    <div style="text-align:right;">
      <h2 style="margin:0;font-size:20px;">INVOICE</h2>
      <p style="margin:4px 0 0;color:#555;">#INV-2026-0142</p>
      <p style="margin:2px 0 0;color:#555;">2026-07-01</p>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">Description</th>
        <th style="text-align:right;padding:10px;border-bottom:1px solid #e2e8f0;">Qty</th>
        <th style="text-align:right;padding:10px;border-bottom:1px solid #e2e8f0;">Rate</th>
        <th style="text-align:right;padding:10px;border-bottom:1px solid #e2e8f0;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;">Document toolkit build</td><td style="text-align:right;padding:10px;">40</td><td style="text-align:right;padding:10px;">$75</td><td style="text-align:right;padding:10px;">$3,000</td></tr>
      <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;">Design QA pass</td><td style="text-align:right;padding:10px;">8</td><td style="text-align:right;padding:10px;">$90</td><td style="text-align:right;padding:10px;">$720</td></tr>
    </tbody>
    <tfoot>
      <tr><td colspan="3" style="text-align:right;padding:10px;font-weight:700;">Total</td><td style="text-align:right;padding:10px;font-weight:700;color:#0ea5e9;">$3,720</td></tr>
    </tfoot>
  </table>

  <p style="color:#555;font-size:13px;">Thank you for your business. Payment due within 14 days.</p>
</div>`;

const REPORT_SAMPLE = `<article style="font-family:Georgia,'Times New Roman',serif;color:#1f2937;max-width:760px;line-height:1.6;">
  <h1 style="font-family:Arial,sans-serif;font-size:26px;border-bottom:3px solid #0284c7;padding-bottom:8px;">Quarterly Report</h1>
  <p style="color:#6b7280;margin-top:4px;">Prepared 2026-07-01 · Internal · Confidential</p>

  <h2 style="font-family:Arial,sans-serif;font-size:19px;margin-top:28px;">Summary</h2>
  <p>The Document Studio shipped four flagship tools this quarter, all running <strong>100% client-side</strong> with <em>no uploads</em>. Adoption exceeded the plan.</p>

  <h2 style="font-family:Arial,sans-serif;font-size:19px;margin-top:24px;">Highlights</h2>
  <ul>
    <li>Markdown to PDF &amp; HTML to PDF launched</li>
    <li>Zero data leaves the browser</li>
    <li>Consistent, print-ready output</li>
  </ul>

  <blockquote style="margin:20px 0;padding:8px 16px;border-left:4px solid #0284c7;background:#f0f9ff;color:#334155;">
    "What you see in the preview is exactly what the PDF contains."
  </blockquote>

  <h2 style="font-family:Arial,sans-serif;font-size:19px;margin-top:24px;">Next</h2>
  <p>Expand office conversions and add selectable-text export paths. See the <a href="#" style="color:#0284c7;">roadmap</a>.</p>
</article>`;

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Invoice",
    description: "Header, styled table & totals",
    value: INVOICE_SAMPLE,
    icon: "ReceiptText",
  },
  {
    label: "Report page",
    description: "Headings, list, quote & links",
    value: REPORT_SAMPLE,
    icon: "FileText",
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function HtmlToPdfTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [source, setSource] = React.useState<string>(INVOICE_SAMPLE);
  const [pageSize, setPageSize] = React.useState<PageSize>("a4");
  const [margin, setMargin] = React.useState<MarginKey>("comfortable");
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sanitised HTML drives both the preview frame and the "copy HTML" action, so
  // the preview honestly reflects what the engine renders into the PDF.
  const safeHtml = React.useMemo(() => sanitizeHtml(source), [source]);
  const stats = React.useMemo(() => textStats(source), [source]);

  // The sandboxed frame gets a full document with the sanitised body inside a
  // white "page" padded by the chosen margin, matching the exported look. The
  // sandbox attribute is empty: no scripts, no forms, no network, by design.
  const srcDoc = React.useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><style>` +
      `html,body{margin:0;background:#e5e7eb;}` +
      `.gk-page{background:#fff;color:#111;max-width:820px;margin:0 auto;padding:${MARGIN_PX[margin]}px;` +
      `box-shadow:0 1px 4px rgba(0,0,0,.12);min-height:360px;box-sizing:border-box;` +
      `font-family:ui-sans-serif,system-ui,Arial,sans-serif;overflow-wrap:anywhere;}` +
      `.gk-page img{max-width:100%;}` +
      `</style></head><body><div class="gk-page">` +
      (safeHtml || `<p style="opacity:.5">Your rendered document appears here…</p>`) +
      `</div></body></html>`,
    [safeHtml, margin],
  );

  const handleDropText = React.useCallback((text: string) => {
    setSource(text);
    setError(null);
  }, []);

  const handleExport = React.useCallback(async () => {
    if (!source.trim()) {
      setError("Add some HTML before exporting.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      // htmlToPdf sanitises again internally, strips wrapping html/body and
      // paginates via the shared html2canvas → jsPDF renderer.
      const res = await htmlToPdf(source, { format: pageSize });
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
        <CopyButton getValue={() => safeHtml} label="Copy HTML" disabled={!safeHtml} />
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
          label="HTML"
          placeholder="<h1>Paste or type HTML here…</h1>"
          lineNumbers
          ariaLabel="HTML source editor"
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
          <iframe
            title="HTML preview"
            // Empty sandbox: no scripts, no forms, no network, mirrors the
            // export (page rendered as-is, external assets not fetched).
            sandbox=""
            srcDoc={srcDoc}
            className="flex-1 w-full border-0 bg-muted/40"
            style={{ minHeight: 360 }}
          />
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
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        <span>
          Your HTML is rendered exactly as-is with <span className="font-medium">no network access</span> - external
          images, fonts and stylesheets aren&apos;t fetched, so inline them as data-URIs and put CSS in a{" "}
          <code className="rounded bg-amber-500/10 px-1">&lt;style&gt;</code> block. Scripts and iframes are sanitised
          out for safety, and the styled page is captured as a high-resolution image, so that text isn&apos;t
          individually selectable - need selectable text? Use the{" "}
          <span className="font-medium">Text to PDF</span> tool. Everything runs in your browser; nothing is uploaded.
        </span>
      </p>
    </div>
  );
}
