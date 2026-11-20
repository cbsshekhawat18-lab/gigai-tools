/**
 * GigAI Tools: shared "HTML → PDF" renderer for the document engine.
 *
 * Used by markdown→pdf, html→pdf, excel→pdf, epub→pdf and word→pdf, so every
 * one of those improves together.
 *
 * There are two engines behind one entry point:
 *
 *  1. TEXT (preferred). The HTML becomes `Block[]` and jsPDF draws real text.
 *     Output is selectable, searchable, sharp at any zoom, a fraction of the
 *     size, and - the part that used to be visibly broken - page breaks land
 *     between lines instead of shearing one in half.
 *  2. RASTER (fallback). The PDF standard fonts only cover WinAnsi, so a
 *     document containing Devanagari, CJK, Arabic, Cyrillic or Greek would come
 *     out blank or as mojibake. Those go through html2canvas, where the browser
 *     draws every script correctly. This path is unavoidably an image, but it
 *     now cuts pages at element boundaries rather than at arbitrary offsets.
 *
 * The raster path renders inside an ISOLATED same-origin iframe rather than the
 * live app body: html2canvas 1.4.x throws on `oklch()` and our Tailwind v4 theme
 * is authored in oklch, so any capture inheriting app styles used to crash. See
 * the `gigai-html2canvas-oklch` note.
 *
 * Heavy libs (html2canvas, jspdf) are dynamic-imported.
 */

import { htmlToBlocks } from "./html-blocks";
import { blocksText, isLatinSafe, normaliseBlocks } from "./pdf-blocks";
import { renderBlocksToPdf } from "./pdf-layout";
import { type Result, fail, message, ok } from "./shared";

export interface RenderHtmlToPdfOptions {
  /** Page format for jsPDF. Default "a4". */
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  /** Uniform page margin in points (1pt = 1/72"). Default 36 (½"). */
  margin?: number;
  /** CSS pixel width of the raster render surface. Default 794 (≈A4@96dpi). */
  pixelWidth?: number;
  /** Extra CSS applied to the body in the raster path (fonts, colors…). */
  containerStyle?: Partial<CSSStyleDeclaration>;
  /** Body text size in points for the text engine. Default 11. */
  fontSize?: number;
  /** Serif body text in the text engine. */
  serif?: boolean;
  /** Title written into the PDF metadata. */
  title?: string;
  /** Force one engine. Default picks automatically; used by tests and callers
   *  that know their content (e.g. a spreadsheet grid). */
  engine?: "auto" | "text" | "raster";
}

/** Which engine produced the last successful render, for honest UI copy. */
export type RenderEngine = "text" | "raster";

export interface RenderReport {
  blob: Blob;
  engine: RenderEngine;
  /** Set when the text engine was skipped because of non-WinAnsi characters. */
  reason?: "non-latin-script";
}

/** camelCase → kebab-case for inline CSS keys. */
function cssKey(k: string): string {
  return k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Render an HTML string to a PDF, reporting which engine ran.
 *
 * The HTML is page BODY content; the caller is responsible for having
 * sanitised it if it came from user input.
 */
export async function renderHtmlToPdfReport(
  html: string,
  opts: RenderHtmlToPdfOptions = {},
): Promise<Result<RenderReport>> {
  if (typeof document === "undefined") return fail("PDF rendering runs in the browser only.");
  const engine = opts.engine ?? "auto";

  if (engine !== "raster") {
    try {
      const blocks = normaliseBlocks(await htmlToBlocks(html));
      const latin = isLatinSafe(blocksText(blocks));
      if (blocks.length && (latin || engine === "text")) {
        const rendered = await renderBlocksToPdf(blocks, {
          format: opts.format,
          orientation: opts.orientation,
          margin: opts.margin,
          fontSize: opts.fontSize,
          serif: opts.serif,
          title: opts.title,
        });
        if (rendered.ok) return ok({ blob: rendered.result, engine: "text" });
        // Fall through to raster rather than failing the conversion outright.
      }
      if (!latin && engine === "auto") {
        const raster = await renderRaster(html, opts);
        return raster.ok
          ? ok({ blob: raster.result, engine: "raster", reason: "non-latin-script" })
          : fail(raster.error);
      }
    } catch (err) {
      if (engine === "text") return fail(message(err));
      // Any parser problem falls back to the raster path below.
    }
  }

  const raster = await renderRaster(html, opts);
  return raster.ok ? ok({ blob: raster.result, engine: "raster" }) : fail(raster.error);
}

/**
 * Back-compatible entry point: returns just the Blob. Existing callers keep
 * working and silently gain the text engine.
 */
export async function renderHtmlToPdf(
  html: string,
  opts: RenderHtmlToPdfOptions = {},
): Promise<Result<Blob>> {
  const report = await renderHtmlToPdfReport(html, opts);
  return report.ok ? ok(report.result.blob) : fail(report.error);
}

/**
 * Pick page cut points that do not fall inside a block element.
 *
 * The old code drew one tall image at `-pageHeight * n` for each page, so every
 * boundary sliced whatever happened to be there - most visibly, a line of text
 * cut in half across two pages. Here we collect the bottom edge of every block
 * element and cut at the last one that still fits, so a break lands in the gap
 * between blocks whenever there is one.
 */
export function pageCuts(boundaries: number[], total: number, pageHeight: number): number[] {
  if (pageHeight <= 0) return [0, total];
  const sorted = [...new Set(boundaries.filter((b) => b > 0 && b < total))].sort((a, b) => a - b);
  const cuts = [0];
  let position = 0;
  let guard = 0;

  while (position < total && guard < 2000) {
    guard += 1;
    const limit = position + pageHeight;
    if (limit >= total) break;
    // The last boundary that fits on this page, but only if it makes progress;
    // a single block taller than a page still has to be cut hard.
    let candidate = 0;
    for (const b of sorted) {
      if (b > position && b <= limit) candidate = b;
      else if (b > limit) break;
    }
    const next = candidate > position ? candidate : limit;
    cuts.push(next);
    position = next;
  }
  cuts.push(total);
  return cuts;
}


/**
 * Rows of the rendered canvas where every sampled pixel is the same colour.
 *
 * In a page of text those are the gaps between lines, so they are the only
 * places a page may be cut without slicing through glyphs. Working from the
 * canvas rather than from DOM geometry keeps this correct no matter how
 * html2canvas positioned what it drew. The canvas is read in bands so a long
 * document never needs one huge ImageData allocation.
 */
export function uniformRows(canvas: HTMLCanvasElement, sampleStep = 8, bandHeight = 512): number[] {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const rows: number[] = [];
  const width = canvas.width;
  for (let top = 0; top < canvas.height; top += bandHeight) {
    const height = Math.min(bandHeight, canvas.height - top);
    let band: ImageData;
    try {
      band = ctx.getImageData(0, top, width, height);
    } catch {
      return rows; // tainted canvas: fall back to hard cuts
    }
    const data = band.data;
    for (let y = 0; y < height; y += 1) {
      const base = y * width * 4;
      const r = data[base] ?? 255;
      const g = data[base + 1] ?? 255;
      const b = data[base + 2] ?? 255;
      let uniform = true;
      for (let x = sampleStep; x < width; x += sampleStep) {
        const i = base + x * 4;
        if (data[i] !== r || data[i + 1] !== g || data[i + 2] !== b) {
          uniform = false;
          break;
        }
      }
      if (uniform) rows.push(top + y);
    }
  }
  return rows;
}

/** Draw one HTML fragment in an isolated iframe and return the rendered canvas. */
async function htmlToCanvas(html: string, opts: RenderHtmlToPdfOptions): Promise<HTMLCanvasElement> {
  const pixelWidth = opts.pixelWidth ?? 794;
  const marginPt = opts.margin ?? 36;
  const marginPx = Math.round(marginPt * (96 / 72));

  const bodyStyle: Record<string, string> = {
    margin: "0",
    padding: `${marginPx}px`,
    width: `${pixelWidth}px`,
    "box-sizing": "border-box",
    background: "#ffffff",
    color: "#111111",
    "font-family": "Arial, Helvetica, 'Segoe UI', system-ui, sans-serif",
    "font-size": "14px",
    "line-height": "1.5",
  };
  for (const [k, v] of Object.entries(opts.containerStyle ?? {})) {
    if (typeof v === "string" && v) bodyStyle[cssKey(k)] = v;
  }
  const bodyCss = Object.entries(bodyStyle)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  const content = html && html.trim().length > 0 ? html : "<p>This document appears to be empty.</p>";
  // Table borders so a spreadsheet or Word table does not come out as loose text.
  const docHtml =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<style>*{box-sizing:border-box}img{max-width:100%}` +
    `table{border-collapse:collapse;width:100%}th,td{border:1px solid #aaa;padding:4px 6px;text-align:left}` +
    `th{background:#f2f2f2}h1,h2,h3{margin:0.6em 0 0.3em}p{margin:0 0 0.5em}` +
    `body{${bodyCss}}</style></head>` +
    `<body>${content}</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${pixelWidth}px`,
    height: "1123px",
    border: "0",
    background: "#ffffff",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve, reject) => {
      iframe.onload = () => resolve();
      iframe.onerror = () => reject(new Error("Document failed to render."));
      iframe.srcdoc = docHtml;
    });
    const idoc = iframe.contentDocument;
    if (!idoc?.body) throw new Error("Render document unavailable.");
    await new Promise((r) => setTimeout(r, 120)); // let layout/fonts settle
    const fullH = Math.max(idoc.body.scrollHeight, idoc.body.offsetHeight, 200);
    iframe.style.height = `${fullH}px`;

    const scale = Math.max(1, Math.min(2, Math.floor(15000 / Math.max(fullH, 1))));
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(idoc.body, {
      backgroundColor: "#ffffff",
      scale,
      width: pixelWidth,
      height: fullH,
      windowWidth: pixelWidth,
      windowHeight: fullH,
      useCORS: true,
    });

    return canvas;

    // CSS px -> canvas px, and how many CSS px of content fill one PDF page.
  } finally {
    iframe.remove();
  }
}

/**
 * The image path: the browser draws the HTML, we slice the result into pages.
 *
 * The document is rendered one chunk per explicit page break so those breaks
 * survive here too, and each chunk's canvas is cut into pages at rows where
 * every pixel is the same colour - the gaps between lines. Cutting in canvas
 * space rather than from DOM geometry is deliberate: html2canvas gives no
 * guarantee that what it draws lines up with the coordinates we could measure,
 * and a half-line discrepancy is exactly what shears a line of text in two.
 */
async function renderRaster(html: string, opts: RenderHtmlToPdfOptions): Promise<Result<Blob>> {
  try {
    const source = html && html.trim().length > 0 ? html : "<p>This document appears to be empty.</p>";
    const chunks = source
      .split(/<hr[^>]*class=["'][^"']*page-break[^"']*["'][^>]*>/i)
      .filter((c) => c.trim().length > 0);

    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      unit: "pt",
      format: opts.format ?? "a4",
      orientation: opts.orientation ?? "portrait",
      compress: true,
    });
    if (opts.title) pdf.setProperties({ title: opts.title });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const slice = document.createElement("canvas");
    const sctx = slice.getContext("2d");
    if (!sctx) throw new Error("Canvas unavailable.");
    let first = true;

    for (const chunk of chunks.length ? chunks : [source]) {
      const canvas = await htmlToCanvas(chunk, opts);
      const pageHeightCanvas = (pageH / pageW) * canvas.width;
      const cuts = pageCuts(uniformRows(canvas), canvas.height, pageHeightCanvas);

      for (let i = 0; i < cuts.length - 1; i += 1) {
        const startPx = Math.round(cuts[i] ?? 0);
        const endPx = Math.round(cuts[i + 1] ?? canvas.height);
        const h = Math.max(1, endPx - startPx);
        slice.width = canvas.width;
        slice.height = h;
        sctx.fillStyle = "#ffffff";
        sctx.fillRect(0, 0, slice.width, slice.height);
        sctx.drawImage(canvas, 0, startPx, canvas.width, h, 0, 0, canvas.width, h);
        if (!first) pdf.addPage();
        first = false;
        pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageW, (h / canvas.width) * pageW);
      }
    }

    return ok(pdf.output("blob"));
  } catch (err) {
    return fail(message(err));
  }
}