"use client";

import { ensureFonts, loadImage } from "./export";
import { posterFontFamilies } from "./fonts";
import { stringsFor } from "./locales";
import { themeOf, type PosterPage } from "./types";

const SIZE = 1080;
const INK = "#0f172a";
const MUTED = "#64748b";

/** Largest font size (<= max) at which `text` fits `maxWidth`. */
function fit(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, max: number, maxWidth: number): number {
  let size = max;
  for (; size > 18; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
  }
  return size;
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, family: string, weight: string, max: number, maxWidth: number, color: string, align: CanvasTextAlign = "center") {
  const size = fit(ctx, s, family, weight, max, maxWidth);
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
  return size;
}

/** 1080×1080 "make your supporter poster" card: theme gradient, owner header, QR code, link. Browser only. */
export async function renderPromo(page: PosterPage): Promise<Blob> {
  const t = stringsFor(page.lang);
  const theme = themeOf(page);
  const { display, body } = posterFontFamilies;
  await ensureFonts(posterFontFamilies);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, theme.primary);
  g.addColorStop(1, theme.secondary);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Header: logo circle (or initial) + name + designation · area
  ctx.save();
  ctx.beginPath();
  ctx.arc(140, 135, 70, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.clip();
  const logo = page.logo_url ? await loadImage(page.logo_url).catch(() => null) : null;
  if (logo) ctx.drawImage(logo, 70, 65, 140, 140);
  else text(ctx, page.display_name.slice(0, 1).toUpperCase(), 140, 138, display, "700", 72, 120, theme.primary);
  ctx.restore();
  text(ctx, page.display_name, 240, 112, display, "700", 60, 760, "#fff", "left");
  const sub = [page.designation, page.area].filter(Boolean).join(" · ");
  if (sub) text(ctx, sub, 240, 170, body, "500", 34, 760, "rgba(255,255,255,0.92)", "left");

  // Card with the call to action, QR and link
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(80, 250, 920, 700, 40);
  ctx.fill();
  ctx.restore();
  text(ctx, t.stripDefault, SIZE / 2, 335, display, "700", 54, 840, INK);

  const QRCode = (await import("qrcode")).default;
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, page.url, { width: 400, margin: 1, color: { dark: INK, light: "#ffffff" } });
  ctx.drawImage(qr, 340, 390, 400, 400);

  text(ctx, page.url.replace(/^https?:\/\//, ""), SIZE / 2, 850, body, "700", 38, 840, theme.primary);
  text(ctx, t.scanToMake, SIZE / 2, 905, body, "500", 28, 840, MUTED);

  if (page.tagline) text(ctx, page.tagline, SIZE / 2, 1015, body, "600", 32, 960, "#fff");

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92);
  });
}
