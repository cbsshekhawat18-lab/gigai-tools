/**
 * GigAI Tools, QR export & download.
 *
 * Client-side download helpers for every format the studio offers:
 * PNG / JPG / WEBP / SVG (incl. transparent PNG & SVG), PDF (jspdf, embeds the
 * raster or vector), and best-effort EPS (PostScript filled rects drawn from
 * the raw module matrix via `qrcode`). Heavy libs (jspdf) are dynamic-imported.
 *
 * Transparency is honest: transparent PNG is produced by rendering with
 * `transparentBg` so no bg is baked in; transparent SVG strips the bg rect.
 */

import type { QRStyleConfig } from "./style";
import { renderToCanvas, renderToSvgString, canvasToBlob } from "./render";
import type { QrExportFormat } from "./render";

/** Preset export sizes (px). "custom" means caller supplies the number. */
export const QR_SIZES = [256, 512, 1024, 2048, 4096] as const;
export type QrSize = (typeof QR_SIZES)[number] | number;

/** Trigger a browser download of a Blob under `filename`. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the click has a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Produce a Blob for a raster format (png/jpeg/webp). */
export async function exportRaster(
  payload: string,
  style: QRStyleConfig,
  size: number,
  format: "png" | "jpeg" | "webp",
  quality = 0.95,
): Promise<Blob> {
  const canvas = await renderToCanvas(payload, style, size);
  return canvasToBlob(canvas, format, quality);
}

/** Produce a transparent-background PNG Blob (forces `transparentBg`). */
export async function exportTransparentPng(
  payload: string,
  style: QRStyleConfig,
  size: number,
): Promise<Blob> {
  const canvas = await renderToCanvas(payload, { ...style, transparentBg: true }, size);
  return canvasToBlob(canvas, "png");
}

/** Produce an SVG string Blob (optionally transparent). */
export async function exportSvg(
  payload: string,
  style: QRStyleConfig,
  size: number,
  transparent = false,
): Promise<Blob> {
  const svg = await renderToSvgString(payload, { ...style, transparentBg: transparent || style.transparentBg }, size);
  return new Blob([svg], { type: "image/svg+xml" });
}

/**
 * Produce a PDF (jspdf) embedding the QR. A PNG raster is placed centered on
 * an A-sized page; the QR keeps its aspect and a small margin. `size` controls
 * the raster resolution baked into the PDF (higher = sharper print).
 */
export async function exportPdf(
  payload: string,
  style: QRStyleConfig,
  size: number,
  opts: { title?: string } = {},
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const canvas = await renderToCanvas(payload, style, size);
  const pngBlob = await canvasToBlob(canvas, "png");
  const dataUrl = await blobToDataUrl(pngBlob);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const aspect = canvas.height / canvas.width;
  const drawW = Math.min(pageW - 96, 360);
  const drawH = drawW * aspect;
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  if (opts.title) {
    doc.setFontSize(18);
    doc.text(opts.title, pageW / 2, y - 24, { align: "center" });
  }
  doc.addImage(dataUrl, "PNG", x, y, drawW, drawH);
  return doc.output("blob");
}

/**
 * Best-effort EPS. EPS has no native raster-friendly QR primitive, so we draw
 * the QR MODULE MATRIX (from `qrcode`) as filled PostScript rectangles: true
 * vector output that scales cleanly for print. Honest limitations: this exports
 * the pure black/white matrix only; gradients, custom dot shapes, logos and
 * frames are NOT represented (they are a raster/SVG concept). For a fully-styled
 * vector, use SVG. EC level from the style is respected.
 */
export async function exportEps(
  payload: string,
  style: QRStyleConfig,
  size = 1024,
): Promise<Blob> {
  if (!payload) throw new Error("Nothing to encode.");
  const QRCode = await import("qrcode");
  const qr = QRCode.create(payload, { errorCorrectionLevel: style.errorCorrection });
  const count = qr.modules.size;
  const data = qr.modules.data;

  const quiet = 4; // modules of quiet zone
  const grid = count + quiet * 2;
  const scale = size / grid; // pt per module
  const dim = grid * scale;

  const fg = hexToPsRgb(style.fgColor);
  const bg = hexToPsRgb(style.bgColor);

  const lines: string[] = [
    "%!PS-Adobe-3.0 EPSF-3.0",
    `%%BoundingBox: 0 0 ${Math.ceil(dim)} ${Math.ceil(dim)}`,
    "%%Creator: GigAI Tools QR Studio",
    "%%Pages: 1",
    "%%EndComments",
  ];

  if (!style.transparentBg) {
    lines.push(`${bg} setrgbcolor`, `0 0 ${dim} ${dim} rectfill`);
  }
  lines.push(`${fg} setrgbcolor`);

  // PostScript origin is bottom-left, so flip rows vertically.
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if ((data[row * count + col] ?? 0) & 1) {
        const x = (col + quiet) * scale;
        const y = (grid - 1 - (row + quiet)) * scale;
        lines.push(`${fmt(x)} ${fmt(y)} ${fmt(scale)} ${fmt(scale)} rectfill`);
      }
    }
  }
  lines.push("showpage", "%%EOF");
  return new Blob([lines.join("\n")], { type: "application/postscript" });
}

/** Round to 3 dp and drop trailing zeros for compact PostScript. */
function fmt(n: number): string {
  return Number(n.toFixed(3)).toString();
}

/** "#rrggbb" → "r g b" in 0..1 PostScript floats. */
function hexToPsRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2) || "00", 16) / 255;
  const g = parseInt(full.slice(2, 4) || "00", 16) / 255;
  const b = parseInt(full.slice(4, 6) || "00", 16) / 255;
  return `${fmt(r)} ${fmt(g)} ${fmt(b)}`;
}

/** Read a Blob as a data URL. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read blob."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

/** Full list of export formats the UI can offer. */
export type QrDownloadFormat = QrExportFormat | "pdf" | "eps" | "png-transparent" | "svg-transparent";

/** Default file extension for a download format. */
function extFor(format: QrDownloadFormat): string {
  switch (format) {
    case "png":
    case "png-transparent":
      return "png";
    case "jpeg":
      return "jpg";
    case "webp":
      return "webp";
    case "svg":
    case "svg-transparent":
      return "svg";
    case "pdf":
      return "pdf";
    case "eps":
      return "eps";
  }
}

/**
 * One-call export: build the Blob for any format at a given size. Central
 * dispatch so tool UIs never branch on format themselves.
 */
export async function exportQr(
  payload: string,
  style: QRStyleConfig,
  size: number,
  format: QrDownloadFormat,
  opts: { quality?: number; pdfTitle?: string } = {},
): Promise<Blob> {
  switch (format) {
    case "png":
    case "jpeg":
    case "webp":
      return exportRaster(payload, style, size, format, opts.quality);
    case "png-transparent":
      return exportTransparentPng(payload, style, size);
    case "svg":
      return exportSvg(payload, style, size, false);
    case "svg-transparent":
      return exportSvg(payload, style, size, true);
    case "pdf":
      return exportPdf(payload, style, size, { title: opts.pdfTitle });
    case "eps":
      return exportEps(payload, style, size);
  }
}

/**
 * Export AND download in one call. `basename` gets the correct extension for
 * the chosen format automatically.
 */
export async function downloadQr(
  payload: string,
  style: QRStyleConfig,
  size: number,
  format: QrDownloadFormat,
  basename = "qr-code",
  opts: { quality?: number; pdfTitle?: string } = {},
): Promise<void> {
  const blob = await exportQr(payload, style, size, format, opts);
  downloadBlob(blob, `${basename}.${extFor(format)}`);
}
