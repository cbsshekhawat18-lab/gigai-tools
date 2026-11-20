/**
 * GigAI Tools, text/markdown/HTML helpers for document previews.
 *
 * `marked` is dynamic-imported so the markdown renderer only loads when needed.
 * Rendered HTML is sanitised with DOMPurify because previews inject it into the
 * DOM. DOMPurify is imported statically (it's ~7 kB gz) so `sanitizeHtml` can
 * stay synchronous for its useMemo/effect call sites; every consumer mounts
 * client-side only (ssr:false), so a real DOM is always available.
 */

import DOMPurify from "dompurify";

/** Read a File/Blob as a UTF-8 string. */
export async function readText(file: Blob): Promise<string> {
  return await file.text();
}

/** Render Markdown to HTML (GFM). Falls back to escaped text on failure. */
export async function markdownToHtml(md: string): Promise<string> {
  try {
    const { marked } = await import("marked");
    const html = await marked.parse(md, { gfm: true, breaks: false });
    return sanitizeHtml(typeof html === "string" ? html : String(html));
  } catch {
    return `<pre>${escapeHtml(md)}</pre>`;
  }
}

/** Escape the five HTML-significant characters. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sanitise an HTML string with DOMPurify (HTML profile) before it is injected
 * into a preview or handed to the PDF renderer: <script>/<style>/<iframe>/
 * <object>/<embed>, inline event handlers and `javascript:` URLs are removed;
 * layout markup and inline style="" attributes survive. Same profile the
 * convert engine (`htmlToPdf`/`markdownToPdf`) uses, so previews match exports.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/** Pretty-print a JSON string (2-space); returns the input unchanged if invalid. */
export function prettyJson(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch {
    return input;
  }
}

/** Word / character / line counts for a text-preview footer. */
export interface TextStats {
  characters: number;
  words: number;
  lines: number;
}

/** Compute basic text statistics. */
export function textStats(text: string): TextStats {
  const trimmed = text.trim();
  return {
    characters: text.length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
  };
}
