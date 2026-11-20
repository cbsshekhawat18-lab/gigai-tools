/**
 * Poster renderer: draws one banner plus the supporter's photo and name into
 * ANY Canvas 2D context. Deliberately DOM-free (no document/window/Image), so
 * the one function drives the live preview, the thumbnails, the HD export
 * and a future server-side @napi-rs/canvas path. Geometry helpers are pure
 * and unit-tested.
 */
import type { NameZone, PhotoZone, SupporterState, Zones } from "./types";

export interface RenderFonts {
  display: string;
  body: string;
}

export interface RenderInput {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  banner: CanvasImageSource | null;
  zones: Zones;
  photo: CanvasImageSource | null;
  photoSize: { w: number; h: number } | null;
  supporter: SupporterState;
  /** Shown when the supporter leaves name/area blank (text-style zones only). */
  labels: { name: string; area: string };
  fonts: RenderFonts;
  accent: string;
}

export const INK = "#0F172A";

export interface ZoneRect {
  cx: number;
  cy: number;
  w: number;
  h: number;
  radius: number;
}

/** Smallest w×h that covers a box while keeping the image's aspect. */
export function coverFit(imgW: number, imgH: number, boxW: number, boxH: number): { w: number; h: number } {
  const s = Math.max(boxW / imgW, boxH / imgH);
  return { w: imgW * s, h: imgH * s };
}

/** Pixel rect of a photo zone on a width×height canvas. */
export function zoneRect(z: PhotoZone, width: number, height: number): ZoneRect {
  const cx = z.cx * width;
  const cy = z.cy * height;
  if (z.shape === "circle") {
    const r = z.r * width;
    return { cx, cy, w: r * 2, h: r * 2, radius: r };
  }
  return { cx, cy, w: z.w * width, h: z.h * height, radius: z.radius * width };
}

/**
 * Pan (fractions of the slot box) that centres a face found at (fx, fy) -
 * fractions of the source image - inside the slot at the given zoom.
 */
export function panForFace(
  fx: number,
  fy: number,
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number,
  scale = 1,
): { panX: number; panY: number } {
  const fit = coverFit(imgW, imgH, boxW, boxH);
  return {
    panX: (-(fx - 0.5) * fit.w * scale) / boxW,
    panY: (-(fy - 0.5) * fit.h * scale) / boxH,
  };
}

/** Badge box for the pill-style name zone. `fs` = name font size in px. */
export function badgeMetrics(
  nameW: number,
  areaW: number,
  fs: number,
  canvasW: number,
  twoLine: boolean,
): { w: number; h: number; r: number } {
  if (twoLine) {
    const w = Math.min(canvasW * 0.52, Math.max(fs * 7, Math.max(nameW, areaW) + fs * 1.6));
    return { w, h: fs * 2.7, r: fs * 0.5 };
  }
  const h = fs * 1.9;
  return { w: Math.min(canvasW * 0.5, Math.max(nameW, areaW) + fs * 1.6), h, r: h / 2 };
}

function pathRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function pathZone(ctx: CanvasRenderingContext2D, rect: ZoneRect, circle: boolean): void {
  if (circle) {
    ctx.beginPath();
    ctx.arc(rect.cx, rect.cy, rect.w / 2, 0, Math.PI * 2);
    ctx.closePath();
  } else {
    pathRoundRect(ctx, rect.cx - rect.w / 2, rect.cy - rect.h / 2, rect.w, rect.h, rect.radius);
  }
}

/** Grey head-and-shoulders silhouette, the "no photo yet" state. */
export function drawPlaceholder(ctx: CanvasRenderingContext2D, rect: ZoneRect): void {
  const m = Math.min(rect.w, rect.h);
  ctx.fillStyle = "#E4E8EF";
  ctx.fillRect(rect.cx - rect.w / 2, rect.cy - rect.h / 2, rect.w, rect.h);
  ctx.fillStyle = "#B6BFCC";
  ctx.beginPath();
  ctx.arc(rect.cx, rect.cy - m * 0.14, m * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(rect.cx, rect.cy + m * 0.47, m * 0.4, m * 0.33, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

function drawPhoto(ctx: CanvasRenderingContext2D, rect: ZoneRect, circle: boolean, input: RenderInput): void {
  ctx.save();
  pathZone(ctx, rect, circle);
  ctx.clip();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(rect.cx - rect.w / 2, rect.cy - rect.h / 2, rect.w, rect.h);
  if (input.photo && input.photoSize) {
    const s = input.supporter;
    ctx.translate(rect.cx + s.panX * rect.w, rect.cy + s.panY * rect.h);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.scale(s.scale, s.scale);
    const fit = coverFit(input.photoSize.w, input.photoSize.h, rect.w * 1.02, rect.h * 1.02);
    ctx.drawImage(input.photo, -fit.w / 2, -fit.h / 2, fit.w, fit.h);
  } else {
    drawPlaceholder(ctx, rect);
  }
  ctx.restore();

  ctx.save();
  pathZone(ctx, rect, circle);
  ctx.lineWidth = Math.max(2, input.width * 0.005);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.stroke();
  ctx.restore();
}

function font(weight: number, px: number, family: string): string {
  return `${weight} ${Math.max(1, Math.round(px))}px ${family}`;
}

function drawNameText(ctx: CanvasRenderingContext2D, z: NameZone, input: RenderInput, name: string, area: string): void {
  const fs = z.size * input.width;
  const cx = z.cx * input.width;
  const cy = z.cy * input.height;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (name && area) {
    ctx.fillStyle = INK;
    ctx.font = font(700, fs, input.fonts.display);
    ctx.fillText(name, cx, cy - fs * 0.48);
    ctx.fillStyle = input.accent;
    ctx.font = font(700, fs * 0.64, input.fonts.body);
    ctx.fillText(area, cx, cy + fs * 0.55);
  } else {
    ctx.fillStyle = INK;
    ctx.font = font(700, fs * 1.05, input.fonts.display);
    ctx.fillText(name || area, cx, cy);
  }
  ctx.restore();
}

function drawNameBadge(ctx: CanvasRenderingContext2D, z: NameZone, input: RenderInput, name: string, area: string): void {
  const fs = z.size * input.width;
  const cx = z.cx * input.width;
  const cy = z.cy * input.height;
  const twoLine = Boolean(name && area);
  ctx.save();
  ctx.font = font(700, fs, input.fonts.display);
  const nameW = name ? ctx.measureText(name).width : 0;
  ctx.font = font(700, fs * 0.72, input.fonts.body);
  const areaW = area ? ctx.measureText(area).width : 0;
  const m = badgeMetrics(nameW, areaW, fs, input.width, twoLine);
  const x = cx - m.w / 2;
  const y = cy - m.h / 2;

  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = fs * 0.5;
  ctx.shadowOffsetY = fs * 0.15;
  ctx.fillStyle = "#FFFFFF";
  pathRoundRect(ctx, x, y, m.w, m.h, m.r);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = Math.max(1.5, fs * 0.09);
  ctx.strokeStyle = input.accent;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (twoLine) {
    ctx.fillStyle = INK;
    ctx.font = font(700, fs, input.fonts.display);
    ctx.fillText(name, cx, cy - fs * 0.5);
    ctx.fillStyle = input.accent;
    ctx.font = font(700, fs * 0.72, input.fonts.body);
    ctx.fillText(area, cx, cy + fs * 0.62);
  } else {
    ctx.fillStyle = INK;
    ctx.font = font(700, fs, input.fonts.display);
    ctx.fillText(name || area, cx, cy);
  }
  ctx.restore();
}

/** Draw the full poster. Safe to call on every input change (cheap at preview size). */
export function renderPoster(input: RenderInput): void {
  const { ctx, width, height } = input;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, width, height);
  if (input.banner) {
    ctx.drawImage(input.banner, 0, 0, width, height);
  } else {
    ctx.fillStyle = "#F3F4F6";
    ctx.fillRect(0, 0, width, height);
  }
  for (const z of input.zones.photos) {
    drawPhoto(ctx, zoneRect(z, width, height), z.shape === "circle", input);
  }
  const nz = input.zones.name;
  if (nz) {
    const typedName = input.supporter.name.trim();
    const typedArea = input.supporter.area.trim();
    if (nz.style === "text") {
      drawNameText(ctx, nz, input, typedName || input.labels.name, typedArea || input.labels.area);
    } else if (typedName || typedArea) {
      drawNameBadge(ctx, nz, input, typedName, typedArea);
    }
  }
  ctx.restore();
}
