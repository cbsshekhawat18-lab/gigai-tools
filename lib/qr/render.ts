/**
 * GigAI Tools: QR renderer.
 *
 * Wraps qr-code-styling (dynamic-imported, DOM-dependent) into a small typed
 * surface: create an instance, get a canvas / SVG string / Blob, and, when a
 * frame is requested, COMPOSE the QR into a larger outer canvas/SVG with a
 * decorative border + call-to-action label. Client-only (touches document).
 *
 * Frames are drawn by us, not by qr-code-styling, so they work identically for
 * raster and vector output and stay honest about what the library can/can't do.
 */

import type { QRStyleConfig } from "./style";
import { toQrCodeStylingOptions } from "./style";

/** Output raster/vector formats we can produce. */
export type QrRasterFormat = "png" | "jpeg" | "webp";
export type QrExportFormat = QrRasterFormat | "svg";

/** Minimal structural type for the qr-code-styling instance we use. */
export interface QrInstance {
  update(options: Record<string, unknown>): void;
  getRawData(extension: "png" | "jpeg" | "webp" | "svg"): Promise<Blob | null>;
  append(container: HTMLElement): void;
}

/** Load the qr-code-styling constructor once, lazily. */
async function loadQrCodeStyling(): Promise<new (o: unknown) => QrInstance> {
  const mod = await import("qr-code-styling");
  return (mod.default ?? mod) as unknown as new (o: unknown) => QrInstance;
}

/**
 * Create a configured qr-code-styling instance for a payload + style + pixel
 * size. `renderType` "svg" produces vector output; "canvas" raster.
 */
export async function createQr(
  payload: string,
  style: QRStyleConfig,
  size: number,
  renderType: "canvas" | "svg" = "canvas",
): Promise<QrInstance> {
  const QRCodeStyling = await loadQrCodeStyling();
  const options = toQrCodeStylingOptions(payload, style, size, renderType);
  return new QRCodeStyling(options as unknown as Record<string, unknown>);
}

/** Load an image from a data/URL string into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = src;
  });
}

/** Draw a rounded rectangle path on a 2D context. */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/** Get the QR as a raster Blob at the requested format. */
async function qrToRasterBlob(instance: QrInstance, format: QrRasterFormat): Promise<Blob> {
  const blob = await instance.getRawData(format);
  if (!blob) throw new Error("QR rendering produced no data.");
  return blob;
}

/**
 * Render the QR onto a fresh <canvas> and return it. When `style.frame` is set
 * (and not "none"), the QR is composed into a larger framed canvas with an
 * optional call-to-action label. Otherwise the QR canvas is returned as-is.
 */
export async function renderToCanvas(
  payload: string,
  style: QRStyleConfig,
  size: number,
): Promise<HTMLCanvasElement> {
  const instance = await createQr(payload, style, size, "canvas");
  const blob = await qrToRasterBlob(instance, "png");
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const frame = style.frame && style.frame.style !== "none" ? style.frame : undefined;
    if (!frame) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable.");
      ctx.drawImage(img, 0, 0, size, size);
      return canvas;
    }
    return composeFrame(img, style, size, frame);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Compose a QR image into a decorative outer frame canvas. */
function composeFrame(
  qrImg: HTMLImageElement,
  style: QRStyleConfig,
  size: number,
  frame: NonNullable<QRStyleConfig["frame"]>,
): HTMLCanvasElement {
  const color = frame.color ?? style.fgColor;
  const hasLabel = Boolean(frame.label && frame.label.trim());
  const pad = Math.round(size * 0.06);
  const border = Math.round(size * 0.03);
  const labelH = hasLabel ? Math.round(size * 0.14) : 0;
  const outer = size + pad * 2 + border * 2;
  const total = outer + labelH;

  const canvas = document.createElement("canvas");
  canvas.width = outer;
  canvas.height = total;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  const radius = frame.style === "rounded" || frame.style === "scan-me" ? Math.round(size * 0.08) : 0;

  // Frame background (fills behind QR + label so the label band is on-brand).
  ctx.fillStyle = color;
  if (frame.style === "circle") {
    ctx.beginPath();
    ctx.arc(outer / 2, outer / 2, outer / 2, 0, Math.PI * 2);
    if (hasLabel) ctx.rect(0, outer, outer, labelH);
    ctx.fill();
  } else {
    roundRectPath(ctx, 0, 0, outer, total, radius);
    ctx.fill();
  }

  // White (bg) plate the QR sits on.
  ctx.fillStyle = style.transparentBg ? style.bgColor : style.bgColor;
  const plateR = frame.style === "circle" ? 0 : Math.max(0, radius - border);
  if (frame.style === "circle") {
    ctx.beginPath();
    ctx.arc(outer / 2, outer / 2, size / 2 + pad, 0, Math.PI * 2);
    ctx.fill();
  } else {
    roundRectPath(ctx, border, border, outer - border * 2, outer - border * 2, plateR);
    ctx.fill();
  }

  ctx.drawImage(qrImg, pad + border, pad + border, size, size);

  if (hasLabel) {
    ctx.fillStyle = frame.textColor ?? style.bgColor;
    ctx.font = `bold ${Math.round(labelH * 0.5)}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((frame.label ?? "").toUpperCase(), outer / 2, outer + labelH / 2);
  }
  return canvas;
}

/**
 * Render the QR to an SVG string. When a frame is requested it is wrapped in an
 * outer <svg> with the border + label composed around the QR's own <svg>.
 */
export async function renderToSvgString(
  payload: string,
  style: QRStyleConfig,
  size: number,
): Promise<string> {
  const instance = await createQr(payload, style, size, "svg");
  const blob = await instance.getRawData("svg");
  if (!blob) throw new Error("QR SVG rendering produced no data.");
  let svg = await blob.text();

  if (style.transparentBg) {
    // Drop the solid background rect qr-code-styling injects so the SVG is
    // genuinely transparent (honest transparency, not a white fill).
    svg = stripSvgBackground(svg, style.bgColor);
  }

  const frame = style.frame && style.frame.style !== "none" ? style.frame : undefined;
  if (!frame) return svg;
  return wrapSvgFrame(svg, style, size, frame);
}

/** Remove the first full-canvas background <rect> of the given fill. */
function stripSvgBackground(svg: string, bgColor: string): string {
  const norm = bgColor.replace(/\s/g, "").toLowerCase();
  return svg.replace(
    /<rect[^>]*?(?:fill="([^"]*)")[^>]*?\/>/i,
    (match, fill: string) => (String(fill).replace(/\s/g, "").toLowerCase() === norm ? "" : match),
  );
}

/** Wrap a QR <svg> string in an outer framed SVG. */
function wrapSvgFrame(
  qrSvg: string,
  style: QRStyleConfig,
  size: number,
  frame: NonNullable<QRStyleConfig["frame"]>,
): string {
  const color = frame.color ?? style.fgColor;
  const hasLabel = Boolean(frame.label && frame.label.trim());
  const pad = Math.round(size * 0.06);
  const border = Math.round(size * 0.03);
  const labelH = hasLabel ? Math.round(size * 0.14) : 0;
  const outer = size + pad * 2 + border * 2;
  const total = outer + labelH;
  const radius = frame.style === "rounded" || frame.style === "scan-me" ? Math.round(size * 0.08) : 0;
  const plateR = Math.max(0, radius - border);

  // Inline the QR svg as an inner group by extracting its inner markup and
  // re-parenting under a translate. We keep it robust by embedding the whole
  // svg via <svg x=.. y=..> nesting (valid in SVG 1.1).
  const innerSvg = qrSvg
    .replace(/<\?xml[^>]*\?>/i, "")
    .replace(/^\s*<svg/i, `<svg x="${pad + border}" y="${pad + border}" width="${size}" height="${size}"`);

  const labelText = hasLabel
    ? `<text x="${outer / 2}" y="${outer + labelH / 2}" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-weight="700" font-size="${Math.round(labelH * 0.5)}" fill="${frame.textColor ?? style.bgColor}" text-anchor="middle" dominant-baseline="central">${escapeXml((frame.label ?? "").toUpperCase())}</text>`
    : "";

  const frameShape =
    frame.style === "circle"
      ? `<circle cx="${outer / 2}" cy="${outer / 2}" r="${outer / 2}" fill="${color}"/>${hasLabel ? `<rect x="0" y="${outer}" width="${outer}" height="${labelH}" fill="${color}"/>` : ""}`
      : `<rect x="0" y="0" width="${outer}" height="${total}" rx="${radius}" fill="${color}"/>`;

  const plate =
    frame.style === "circle"
      ? `<circle cx="${outer / 2}" cy="${outer / 2}" r="${size / 2 + pad}" fill="${style.bgColor}"/>`
      : `<rect x="${border}" y="${border}" width="${outer - border * 2}" height="${outer - border * 2}" rx="${plateR}" fill="${style.bgColor}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${outer}" height="${total}" viewBox="0 0 ${outer} ${total}">${frameShape}${plate}${innerSvg}${labelText}</svg>`;
}

/** Escape XML-special chars for safe text insertion. */
function escapeXml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** A canvas → Blob helper honoring the requested raster format & quality. */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: QrRasterFormat,
  quality = 0.95,
): Promise<Blob> {
  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export produced no data."))),
      mime,
      quality,
    );
  });
}

/**
 * Produce a Blob of the fully-rendered QR (frame included) in any supported
 * format. SVG returns a vector Blob; raster formats go through a composed
 * canvas so frames/labels are baked in.
 */
export async function toBlob(
  payload: string,
  style: QRStyleConfig,
  size: number,
  format: QrExportFormat,
  quality = 0.95,
): Promise<Blob> {
  if (format === "svg") {
    const svg = await renderToSvgString(payload, style, size);
    return new Blob([svg], { type: "image/svg+xml" });
  }
  const canvas = await renderToCanvas(payload, style, size);
  return canvasToBlob(canvas, format, quality);
}
