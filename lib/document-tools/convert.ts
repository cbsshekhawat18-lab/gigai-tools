/**
 * GigAI Tools: text/markdown/html ⇄ PDF conversions (client-side).
 *
 * "Make a PDF" paths:
 *   - txtToPdf: draws wrapped monospace/serif text with jsPDF's vector text API,
 *  so the output has REAL selectable text (no rasterisation), the highest
 *     fidelity option for plain text.
 *   - markdownToPdf / htmlToPdf: go through the shared html2canvas renderer, so
 *     styling is preserved but text is rasterised (honest trade-off).
 *
 * "Read a PDF" paths use pdf.js text extraction:
 *   - pdfToText: concatenates every page's text layer.
 *   - pdfToHtml: reconstructs rough paragraphs/line-breaks from text positions.
 *     It is NOT pixel-perfect and image-only/scanned PDFs yield nothing.
 *
 * Heavy libs (jspdf, marked, dompurify, pdf.js) are dynamic-imported. The pdf.js
 * reader reuses the shared `openPdfDocument` loader from the PDF engine.
 */

import { openPdfDocument } from "@/lib/pdf/core";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { renderHtmlToPdf } from "./render-pdf";
import { type Result, escapeHtml, fail, message, ok } from "./shared";

/* ── Make a PDF ──────────────────────────────────────────────────────────── */

export interface TxtToPdfOptions {
  /** Base font family. "helvetica" (sans), "times" (serif), or "courier" (mono). */
  font?: "helvetica" | "times" | "courier";
  /** Font size in points. Default 11. */
  size?: number;
  /** Uniform page margin in points. Default 48 (⅔"). */
  margins?: number;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
}

/**
 * Render plain text into a PDF with real, selectable vector text. Lines are
 * word-wrapped to the content width and paginated manually, preserving the
 * caller's own line breaks. This beats an html2canvas render for pure text
 * because nothing is rasterised.
 */
export async function txtToPdf(
  text: string,
  opts: TxtToPdfOptions = {},
): Promise<Result<Blob>> {
  try {
    const { jsPDF } = await import("jspdf");
    const size = opts.size ?? 11;
    const margin = opts.margins ?? 48;

    const pdf = new jsPDF({
      unit: "pt",
      format: opts.format ?? "a4",
      orientation: opts.orientation ?? "portrait",
      compress: true,
    });
    pdf.setFont(opts.font ?? "helvetica", "normal");
    pdf.setFontSize(size);

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const contentW = pageW - margin * 2;
    const lineHeight = size * 1.35;

    // Split on the caller's newlines first, then wrap each logical line.
    const source = (text ?? "").replace(/\r\n?/g, "\n");
    const logicalLines = source.split("\n");
    const wrapped: string[] = [];
    for (const line of logicalLines) {
      if (line.length === 0) {
        wrapped.push(""); // preserve blank lines
        continue;
      }
      // splitTextToSize honours the font metrics jsPDF is currently set to.
      const parts = pdf.splitTextToSize(line, contentW) as string[];
      for (const p of parts) wrapped.push(p);
    }

    let y = margin + size; // baseline of the first line
    for (const line of wrapped) {
      if (y > pageH - margin) {
        pdf.addPage();
        y = margin + size;
      }
      if (line.length > 0) pdf.text(line, margin, y);
      y += lineHeight;
    }

    return ok(pdf.output("blob"));
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Convert Markdown (GFM) to a PDF. The markdown is rendered to HTML with marked,
 * sanitised with DOMPurify, wrapped in print-friendly styles, then paginated via
 * the shared html2canvas renderer (rasterised text, honest trade-off).
 */
export async function markdownToPdf(
  md: string,
  opts: { format?: "a4" | "letter" } = {},
): Promise<Result<Blob>> {
  try {
    const { marked } = await import("marked");
    const DOMPurify = (await import("dompurify")).default;
    const rawHtml = marked.parse(md ?? "", { gfm: true, breaks: false, async: false });
    const safe = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
    return renderHtmlToPdf(wrapPrintable(safe), { format: opts.format });
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Convert an HTML string/fragment to a PDF. The HTML is DOMPurify-sanitised (so
 * untrusted input can't run scripts) then paginated via the shared renderer.
 */
export async function htmlToPdf(
  html: string,
  opts: { format?: "a4" | "letter"; sanitize?: boolean } = {},
): Promise<Result<Blob>> {
  try {
    let content = html ?? "";
    if (opts.sanitize !== false) {
      const DOMPurify = (await import("dompurify")).default;
      content = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
    }
    // Strip any wrapping <html>/<body> so we don't nest documents.
    const body = extractBody(content);
    return renderHtmlToPdf(wrapPrintable(body), { format: opts.format });
  } catch (err) {
    return fail(message(err));
  }
}

/** Print-friendly base styling wrapped around rendered document HTML. */
function wrapPrintable(inner: string): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;color:#111;">
<style>
  h1,h2,h3,h4{font-family:Arial,Helvetica,sans-serif;line-height:1.25;margin:1.2em 0 .5em;}
  h1{font-size:26px;} h2{font-size:21px;} h3{font-size:17px;}
  p{margin:0 0 .8em;line-height:1.6;}
  ul,ol{margin:0 0 .8em 1.4em;} li{margin:.2em 0;}
  code,pre{font-family:'Courier New',monospace;background:#f4f4f5;border-radius:4px;}
  code{padding:1px 4px;font-size:.9em;} pre{padding:12px;overflow-wrap:anywhere;white-space:pre-wrap;}
  blockquote{margin:0 0 .8em;padding-left:14px;border-left:3px solid #d4d4d8;color:#3f3f46;}
  table{border-collapse:collapse;width:100%;margin:0 0 1em;font-size:13px;}
  th,td{border:1px solid #d4d4d8;padding:6px 8px;text-align:left;}
  th{background:#f4f4f5;} img{max-width:100%;}
  a{color:#1d4ed8;text-decoration:underline;}
</style>${inner}</div>`;
}

/** Pull the <body> inner HTML from a full document, or return input unchanged. */
function extractBody(html: string): string {
  const match = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  return match?.[1] ?? html;
}

/* ── Read a PDF ──────────────────────────────────────────────────────────── */

/**
 * Extract all text from a PDF via pdf.js's text layer, page by page. Pages are
 * separated by a form-feed-style blank line. Returns an empty-ish result for
 * image-only/scanned PDFs (no selectable text) rather than throwing.
 */
export async function pdfToText(
  file: Blob,
  opts: { password?: string; pageSeparator?: string } = {},
): Promise<Result<string>> {
  try {
    const doc = await openPdfDocument(file, opts.password);
    try {
      const sep = opts.pageSeparator ?? "\n\n";
      const pages: string[] = [];
      for (let p = 1; p <= doc.numPages; p += 1) {
        const page = await doc.getPage(p);
        try {
          const content = await page.getTextContent();
          pages.push(itemsToText(content.items as TextItem[]));
        } finally {
          page.cleanup();
        }
      }
      return ok(pages.join(sep).trim());
    } finally {
      await doc.loadingTask.destroy();
    }
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Reconstruct rough semantic HTML from a PDF's text layer. We group text items
 * into lines by vertical position, join lines into paragraphs on blank-gap
 * heuristics, and wrap each page in a <section>. HONEST: this recovers reading
 * order and paragraphing, NOT pixel-perfect layout, columns, or images.
 */
export async function pdfToHtml(
  file: Blob,
  opts: { password?: string; title?: string } = {},
): Promise<Result<string>> {
  try {
    const doc = await openPdfDocument(file, opts.password);
    try {
      const sections: string[] = [];
      for (let p = 1; p <= doc.numPages; p += 1) {
        const page = await doc.getPage(p);
        try {
          const content = await page.getTextContent();
          const paras = itemsToParagraphs(content.items as TextItem[]);
          const html = paras
            .map((para) => `    <p>${escapeHtml(para)}</p>`)
            .join("\n");
          sections.push(`  <section data-page="${p}">\n${html}\n  </section>`);
        } finally {
          page.cleanup();
        }
      }
      const title = escapeHtml(opts.title ?? "Converted PDF");
      const out = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title></head>
<body>
${sections.join("\n")}
</body>
</html>`;
      return ok(out);
    } finally {
      await doc.loadingTask.destroy();
    }
  } catch (err) {
    return fail(message(err));
  }
}

/** Join pdf.js text items into plain text, honouring end-of-line markers. */
function itemsToText(items: TextItem[]): string {
  let out = "";
  for (const item of items) {
    if (!("str" in item)) continue;
    out += item.str;
    if (item.hasEOL) out += "\n";
  }
  return out;
}

/**
 * Group text items into paragraphs. pdf.js sets `hasEOL` at visual line ends; we
 * treat a run of blank/short lines as a paragraph boundary and otherwise join
 * consecutive lines with a space (unwrapping soft-wrapped body text).
 */
function itemsToParagraphs(items: TextItem[]): string[] {
  // Build lines first.
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    if (!("str" in item)) continue;
    current += item.str;
    if (item.hasEOL) {
      lines.push(current);
      current = "";
    }
  }
  if (current.trim().length > 0) lines.push(current);

  const paragraphs: string[] = [];
  let buffer: string[] = [];
  const flush = () => {
    const text = buffer.join(" ").replace(/\s+/g, " ").trim();
    if (text.length > 0) paragraphs.push(text);
    buffer = [];
  };
  for (const line of lines) {
    if (line.trim().length === 0) flush();
    else buffer.push(line.trim());
  }
  flush();
  return paragraphs;
}
