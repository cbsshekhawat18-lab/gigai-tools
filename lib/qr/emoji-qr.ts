/**
 * Emoji art QR: the emoji stays a picture, the code sits on top as dots.
 *
 * The first build of this file painted every sub-module with a banded version
 * of the artwork (halftone QR, Chu et al. 2013). It decoded everywhere, but it
 * destroyed the picture: with 100% of the area recoloured to satisfy the code,
 * a smiley came out as olive mosaic and the user could not read the face.
 *
 * This is the approach the eye actually forgives: draw the emoji properly,
 * then overlay the code as DOTS smaller than a module. A scanner samples near
 * each module's centre, so a dot covering ~60% of the module carries the whole
 * message, while the artwork survives in the gutters between dots. Function
 * patterns - finders, separators, timing, alignment, format and version blocks
 * (see matrix.ts) - are drawn as FULL opaque modules instead, because those
 * are what the scanner locks onto before it can sample anything.
 *
 * A wash of background colour over the artwork keeps dark dots readable on a
 * dark picture; both the dot size and the wash step up together through a
 * ladder, boldest first, and {@link renderEmojiQrVerified} returns the first
 * render that decodes back to the exact payload. A dead code cannot ship.
 *
 * Which code we draw is itself a choice: `encoder.ts` builds the matrix from
 * the spec rather than taking one from a library, so we can try all eight mask
 * patterns - eight different codes that every scanner reads identically - and
 * keep the one whose dark modules already fall where the picture is dark.
 */

import { encodeForTone, moduleCount } from "./encoder";
import { loadGlyph, type Glyph } from "./glyph";
import { decodeFromImageData } from "./decode";

/** Quiet zone in modules. The spec asks for four and artwork needs them. */
const QUIET = 4;
/** Pixels per module. Dots need room to be round without going fuzzy. */
const MIN_CELL = 8;

export interface EmojiQrOptions {
  payload: string;
  /** The emoji to become the code, e.g. "😀". */
  emoji: string;
  fg?: string;
  bg?: string;
  /** Target output width in px (canvas is square). Default 1024. */
  size?: number;
  /** Dot diameter as a share of the module. Smaller = more picture. */
  dot?: number;
  /** How far the artwork is washed toward the background, 0..1. */
  wash?: number;
}

export interface EmojiQrResult {
  /** Modules per side of the code itself (no quiet zone). */
  modules: number;
  /** How much of the artwork survived, 1 = boldest rung of the ladder. */
  strength: number;
  /** Dot diameter actually used, as a share of the module. */
  dot: number;
  /** Which of the eight mask patterns suited the picture best. */
  mask: number;
  /** Share of confident modules whose polarity matches the picture, 0..1. */
  agreement: number;
}

/* ------------------------------ rendering ------------------------------- */

/**
 * Darkness the picture wants at each module, 0..1, with 0.5 meaning "no
 * opinion" - either the emoji is transparent there or the tone is mid-grey,
 * and in both cases the code is free to do whatever suits it.
 */
function toneMap(g: Glyph, n: number): number[][] {
  const step = g.side / n;
  const map: number[][] = [];
  for (let my = 0; my < n; my += 1) {
    const row: number[] = [];
    for (let mx = 0; mx < n; mx += 1) {
      let lum = 0;
      let alpha = 0;
      let taken = 0;
      for (let sy = 0; sy < 3; sy += 1) {
        for (let sx = 0; sx < 3; sx += 1) {
          const px = Math.round(g.x0 + (mx + (sx + 0.5) / 3) * step);
          const py = Math.round(g.y0 + (my + (sy + 0.5) / 3) * step);
          if (px < 0 || py < 0 || px >= g.size || py >= g.size) continue;
          const i = (py * g.size + px) * 4;
          lum += (0.2126 * (g.data[i] ?? 0) + 0.7152 * (g.data[i + 1] ?? 0) + 0.0722 * (g.data[i + 2] ?? 0)) / 255;
          alpha += (g.data[i + 3] ?? 0) / 255;
          taken += 1;
        }
      }
      if (!taken || alpha / taken < 0.35) row.push(0.5);
      else row.push(1 - lum / taken);
    }
    map.push(row);
  }
  return map;
}

/** Parse #rgb / #rrggbb, falling back when the studio hands us something odd. */
function parseHex(hex: string, fallback: string): string {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return /^[0-9a-f]{6}$/i.test(full) ? `#${full}` : fallback;
}

/**
 * Draw one render at a fixed dot size and wash. Returns null when the emoji
 * draws nothing. Prefer {@link renderEmojiQrVerified}, which also proves the
 * result decodes.
 */
export function renderEmojiQr(
  canvas: HTMLCanvasElement,
  opts: EmojiQrOptions,
): EmojiQrResult | null {
  const glyph = loadGlyph(opts.emoji);
  if (!glyph) return null;
  const n = moduleCount(opts.payload);
  const tone = toneMap(glyph, n);
  const qr = encodeForTone(opts.payload, (x, y) => tone[y]![x]!);
  const { matrix, data } = qr;

  const dot = Math.max(0.3, Math.min(1, opts.dot ?? 0.6));
  const wash = Math.max(0, Math.min(1, opts.wash ?? 0.12));
  const fg = parseHex(opts.fg ?? "#111111", "#111111");
  const bg = parseHex(opts.bg ?? "#ffffff", "#ffffff");

  const span = n + QUIET * 2;
  const size = opts.size ?? 1024;
  const cell = Math.max(MIN_CELL, Math.floor(size / span));
  const w = span * cell;
  canvas.width = w;
  canvas.height = w;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, w);

  // 1. The picture, scaled from its ink box so every emoji fills the code area.
  const origin = QUIET * cell;
  const art = n * cell;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(glyph.canvas, glyph.x0, glyph.y0, glyph.side, glyph.side, origin, origin, art, art);

  // 2. Wash it toward the background so dark dots stay readable on dark art.
  if (wash > 0) {
    ctx.globalAlpha = wash;
    ctx.fillStyle = bg;
    ctx.fillRect(origin, origin, art, art);
    ctx.globalAlpha = 1;
  }

  // 3. The code. Function patterns are opaque full modules - a scanner finds
  // the code by them before it can sample anything - and data modules are
  // dots, so the artwork survives in the gutters between them.
  const radius = (cell * dot) / 2;
  const inset = (cell - cell * dot) / 2;
  const canRound = typeof ctx.roundRect === "function";
  for (let my = 0; my < n; my += 1) {
    for (let mx = 0; mx < n; mx += 1) {
      const dark = Boolean(matrix[my]?.[mx]);
      const x = origin + mx * cell;
      const y = origin + my * cell;
      ctx.fillStyle = dark ? fg : bg;
      if (!data[my]?.[mx]) {
        ctx.fillRect(x, y, cell, cell);
        continue;
      }
      ctx.beginPath();
      if (canRound) ctx.roundRect(x + inset, y + inset, cell * dot, cell * dot, radius * 0.75);
      else ctx.arc(x + cell / 2, y + cell / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return { modules: n, strength: 1, dot, mask: qr.mask, agreement: qr.agreement };
}

/**
 * Boldest first: each rung gives the scanner a bigger dot and a paler picture.
 * `strength` is what the UI reports, so it walks down in readable steps.
 */
const LADDER: { strength: number; dot: number; wash: number }[] = [
  { strength: 1, dot: 0.58, wash: 0.1 },
  { strength: 0.85, dot: 0.66, wash: 0.18 },
  { strength: 0.7, dot: 0.74, wash: 0.26 },
  { strength: 0.55, dot: 0.82, wash: 0.34 },
  { strength: 0.4, dot: 0.9, wash: 0.45 },
  { strength: 0.25, dot: 1, wash: 0.6 },
  { strength: 0, dot: 1, wash: 1 },
];

/** What {@link renderEmojiQrVerified} settled on, or why it could not. */
export type EmojiQrVerified =
  | ({ ok: true } & EmojiQrResult)
  | { ok: false; reason: "unsupported" | "unscannable" };

/**
 * Render the boldest artwork that still decodes back to the exact payload.
 * The last rung washes the picture out entirely into a plain code, so
 * "unscannable" means something else is wrong - colours with no contrast, say.
 */
export async function renderEmojiQrVerified(
  canvas: HTMLCanvasElement,
  opts: EmojiQrOptions,
): Promise<EmojiQrVerified> {
  for (const step of LADDER) {
    const meta = renderEmojiQr(canvas, { ...opts, dot: step.dot, wash: step.wash });
    if (!meta) return { ok: false, reason: "unsupported" };
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, reason: "unscannable" };
    const decoded = await decodeFromImageData(
      ctx.getImageData(0, 0, canvas.width, canvas.height),
    );
    if (decoded.ok && decoded.text === opts.payload) {
      return { ok: true, ...meta, strength: step.strength };
    }
  }
  return { ok: false, reason: "unscannable" };
}
