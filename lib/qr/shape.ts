/**
 * Shape QR: one object that reads as "a heart made of QR", not a square code
 * parked inside a decorative outline.
 *
 * Physics we do not fight: the code is a square matrix and its three finder
 * squares plus a clear quiet ring must survive untouched - that is how a
 * scanner locks on. What we CAN do is make the shape big enough to swallow
 * the code whole: we search for the smallest silhouette whose largest
 * inscribed square can host the matrix, drop the code in there, and fill the
 * rest of the silhouette with modules drawn in the same language (a solid
 * 1-cell rim for a crisp edge, QR-like 50% dither inside). The result has a
 * single outline - the shape - with the real code hidden in its body.
 *
 * Every render is decoded back with jsQR before the UI enables download, so
 * a dead code can never leave the tool.
 *
 * Shapes are EMOJI rendered to an offscreen canvas, bounding-box normalised
 * (so every glyph fills the frame the same way) and thresholded into a cell
 * mask: zero bundled artwork, a curated silhouette set plus any emoji the user
 * types, and no trademark exposure (emoji are an open standard).
 */

import { buildMatrix } from "./matrix";
import { alphaAt, INK, loadGlyph, type Glyph } from "./glyph";

export interface ShapeQrOptions {
  payload: string;
  /** The silhouette, e.g. "🚗". Any renderable emoji works. */
  emoji: string;
  fg: string;
  bg: string;
  /** Target output width in px (canvas is square). Default 800. */
  size?: number;
  /**
   * "solid" (default): the whole silhouette is filled with modules - the
   * shape IS the code. "outline": only the silhouette's edge is drawn, so
   * the code sits inside a hollow contour. Same module geometry either way,
   * which is what keeps both decodable.
   */
  fill?: "solid" | "outline";
}

export interface ShapeQrResult {
  /** Grid cells per side used for the silhouette. */
  grid: number;
  /** Real-QR span in cells (modules + quiet ring). */
  qrSpan: number;
  /** True when the code sits entirely inside the silhouette. */
  contained: boolean;
}

/**
 * Curated silhouettes - every entry passed BOTH gates on 2026-09-04:
 * the jsQR scan gate in the real tool, and a blind recognizability review
 * ("obvious at a glance without the label") by a fresh-context reviewer.
 * 21 candidates failed one gate or the other (car, phone, pizza, scissors,
 * paw...): a shape whose identity lives in thin appendages or interior
 * detail collapses once the code takes the interior. The custom-emoji input
 * covers everything else (a searchable 1,900-glyph catalog renders below
 * this row) - the live preview and scan badge let the user
 * judge their own choice. Fashion (t-shirt) was cut last: its inscribed
 * square cannot hold the matrix, so the engine's fallback let the code
 * overhang the hem - the reviewer called it "a broken render on a printed
 * page". Re-add only if the engine learns hem-aware placement.
 */
export const QR_SHAPES: { emoji: string; label: string }[] = [
  { emoji: "\u2764\uFE0F", label: "Heart" },
  { emoji: "\u2B50", label: "Star" },
  { emoji: "\uD83D\uDEE1\uFE0F", label: "Shield" },
  { emoji: "\uD83D\uDC51", label: "Crown" },
  { emoji: "\u2615", label: "Coffee" },
  { emoji: "\uD83C\uDF93", label: "Education" },
  { emoji: "\uD83D\uDCA1", label: "Idea" },
  { emoji: "\uD83C\uDFAE", label: "Gaming" },
  { emoji: "\u2708\uFE0F", label: "Travel" },
  { emoji: "\uD83C\uDF88", label: "Balloon" },
  { emoji: "\uD83C\uDF4E", label: "Apple" },
  { emoji: "\uD83D\uDD14", label: "Bell" },
  { emoji: "\u2601\uFE0F", label: "Cloud" },
  { emoji: "\uD83C\uDF7A", label: "Beer" },
  { emoji: "\uD83D\uDC31", label: "Cat" },
  { emoji: "\uD83C\uDF40", label: "Clover" },
  { emoji: "\uD83E\uDDB7", label: "Dental" },
  { emoji: "\uD83E\uDD64", label: "Drink" },
  { emoji: "\uD83C\uDF38", label: "Flower" },
  { emoji: "\u2699\uFE0F", label: "Gear" },
  { emoji: "\uD83C\uDF66", label: "Ice cream" },
  { emoji: "\uD83D\uDC4D", label: "Like" },
  { emoji: "\uD83E\uDD47", label: "Medal" },
  { emoji: "\uD83D\uDC8A", label: "Pharmacy" },
  { emoji: "\uD83D\uDD12", label: "Security" },
  { emoji: "\uD83C\uDFC6", label: "Trophy" },
];

/** Modules of clear space around the real code. Two decodes everywhere. */
const QUIET = 2;
/** Share of a cell that must be inked for the cell to join the silhouette. */
const CELL_INK = 0.25;
/** Dark share of the shape's interior texture - matches a real QR's density. */
const TEXTURE = 0.5;
/** Module footprint inside its cell. Below ~0.94 the gaps between modules
 *  start losing decodes: the harness scored 0.88-of-cell modules 153/200
 *  across offsets and resolutions, 0.94 and up 200/200. Rounded, not
 *  circular - circles scored 0/5. */
const MODULE_SCALE = 0.94;
/** Corner radius as a share of the module. */
const MODULE_RADIUS = 0.3;
/** Widest silhouette we will grow to before giving up on containment. */
const MAX_SPREAD = 2.6;
/** Blank cells kept around the silhouette - a shape bleeding to the canvas
 *  edge left scanners nothing to lock the image against, and circle/rectangle
 *  glyphs failed the decode without it. */
const MARGIN = 2;

/** Sample the glyph into a grid×grid coverage mask, inset by {@link MARGIN}. */
function sampleMask(g: Glyph, grid: number): boolean[][] {
  const step = g.side / (grid - MARGIN * 2);
  const mask: boolean[][] = [];
  for (let gy = 0; gy < grid; gy += 1) {
    const row: boolean[] = [];
    for (let gx = 0; gx < grid; gx += 1) {
      if (gx < MARGIN || gy < MARGIN || gx >= grid - MARGIN || gy >= grid - MARGIN) {
        row.push(false);
        continue;
      }
      let hit = 0;
      let taken = 0;
      for (let sy = 0; sy < 4; sy += 1) {
        for (let sx = 0; sx < 4; sx += 1) {
          const px = Math.round(g.x0 + (gx - MARGIN + (sx + 0.5) / 4) * step);
          const py = Math.round(g.y0 + (gy - MARGIN + (sy + 0.5) / 4) * step);
          if (px < 0 || py < 0 || px >= g.size || py >= g.size) continue;
          taken += 1;
          if (alphaAt(g, px, py) > INK) hit += 1;
        }
      }
      row.push(taken > 0 && hit / taken >= CELL_INK);
    }
    mask.push(row);
  }
  return mask;
}

/** Mask centroid in cell coordinates, or null when the mask is empty. */
function centroid(mask: boolean[][], grid: number): { x: number; y: number } | null {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      if (mask[y]?.[x]) {
        sx += x;
        sy += y;
        count += 1;
      }
    }
  }
  return count ? { x: sx / count, y: sy / count } : null;
}

/**
 * Largest-inscribed-square placement: the top-left cell of a span×span block
 * that is entirely inside the silhouette, chosen closest to the shape's
 * centre. Classic DP - dp[y][x] is the biggest all-ink square ending here.
 */
function placeInside(
  mask: boolean[][],
  grid: number,
  span: number,
): { x: number; y: number } | null {
  const mid = centroid(mask, grid);
  if (!mid) return null;
  const dp = new Int32Array(grid * grid);
  let best: { x: number; y: number; d: number } | null = null;
  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      if (!mask[y]?.[x]) continue;
      const i = y * grid + x;
      dp[i] =
        x === 0 || y === 0
          ? 1
          : Math.min(dp[i - 1]!, dp[i - grid]!, dp[i - grid - 1]!) + 1;
      if (dp[i]! < span) continue;
      const px = x - span + 1;
      const py = y - span + 1;
      const d = Math.hypot(px + span / 2 - mid.x, py + span / 2 - mid.y);
      if (!best || d < best.d) best = { x: px, y: py, d };
    }
  }
  return best ? { x: best.x, y: best.y } : null;
}

/**
 * Grow the silhouette until it can swallow the code. Smallest grid that fits
 * = biggest possible code inside the shape. Thin glyphs (scissors, leaf) may
 * never fit; those fall back to the widest grid with a centred code, which
 * overhangs the outline a little but still scans.
 */
function fitShape(
  glyph: Glyph,
  span: number,
): { grid: number; mask: boolean[][]; x: number; y: number; contained: boolean } {
  const max = Math.ceil(span * MAX_SPREAD) + MARGIN * 2;
  let coarse: { grid: number; mask: boolean[][]; x: number; y: number } | null = null;
  for (let grid = span + MARGIN * 2; grid <= max && !coarse; grid += 2) {
    const mask = sampleMask(glyph, grid);
    const at = placeInside(mask, grid, span);
    if (at) coarse = { grid, mask, ...at };
  }
  if (coarse) {
    // The coarse scan may have stepped one past the true minimum.
    if (coarse.grid > span + MARGIN * 2) {
      const grid = coarse.grid - 1;
      const mask = sampleMask(glyph, grid);
      const at = placeInside(mask, grid, span);
      if (at) return { grid, mask, ...at, contained: true };
    }
    return { ...coarse, contained: true };
  }
  const mask = sampleMask(glyph, max);
  const mid = centroid(mask, max) ?? { x: max / 2, y: max / 2 };
  const clamp = (v: number) => Math.min(max - span, Math.max(0, Math.round(v - span / 2)));
  return { grid: max, mask, x: clamp(mid.x), y: clamp(mid.y), contained: false };
}

/** Stable per-cell noise: same shape, same texture, every render. */
function noise(x: number, y: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Draw the shape QR onto `canvas`. Returns geometry, or null when the emoji
 * produced no ink (unsupported glyph) - the caller should tell the user.
 */
export function renderShapeQr(
  canvas: HTMLCanvasElement,
  opts: ShapeQrOptions,
): ShapeQrResult | null {
  const matrix = buildMatrix(opts.payload);
  const n = matrix.length;
  const fill = opts.fill ?? "solid";
  const qrSpan = n + QUIET * 2;
  const glyph = loadGlyph(opts.emoji);
  if (!glyph) return null;
  const { grid, mask, x: originX, y: originY, contained } = fitShape(glyph, qrSpan);

  const size = opts.size ?? 800;
  const cell = Math.max(3, Math.floor(size / grid));
  const w = grid * cell;
  canvas.width = w;
  canvas.height = w;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, w, w);
  ctx.fillStyle = opts.fg;

  const canRound = typeof ctx.roundRect === "function";
  /** One rounded module, centred in its cell. */
  const inset = (cell * (1 - MODULE_SCALE)) / 2;
  const side = cell * MODULE_SCALE;
  const module_ = (x: number, y: number) => {
    ctx.beginPath();
    if (canRound) ctx.roundRect(x + inset, y + inset, side, side, side * MODULE_RADIUS);
    else ctx.rect(x + inset, y + inset, side, side);
    ctx.fill();
  };

  const inQuietBlock = (x: number, y: number) =>
    x >= originX && x < originX + qrSpan && y >= originY && y < originY + qrSpan;
  const isShape = (x: number, y: number) => Boolean(mask[y]?.[x]);
  /** Silhouette edge: keeps the outline crisp through the dither. */
  const isRim = (x: number, y: number) =>
    !isShape(x - 1, y) || !isShape(x + 1, y) || !isShape(x, y - 1) || !isShape(x, y + 1);

  // The silhouette, in the code's own module language: every edge cell for a
  // crisp contour, plus (solid) a QR-density dither inside, so shape and code
  // read as one object rather than a code parked on a decoration.
  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      if (!isShape(x, y) || inQuietBlock(x, y)) continue;
      const rim = isRim(x, y);
      if (rim || (fill === "solid" && noise(x, y) < TEXTURE)) module_(x * cell, y * cell);
    }
  }

  // The real code: rounded data modules, solid square finder cells for
  // lock-on. Module size is what matters here, not roundness: see
  // {@link MODULE_SCALE}.
  const finder = (mx: number, my: number) =>
    (mx < 7 && my < 7) || (mx >= n - 7 && my < 7) || (mx < 7 && my >= n - 7);
  for (let my = 0; my < n; my += 1) {
    for (let mx = 0; mx < n; mx += 1) {
      if (!matrix[my]?.[mx]) continue;
      const x = (originX + QUIET + mx) * cell;
      const y = (originY + QUIET + my) * cell;
      if (finder(mx, my) || !canRound) ctx.fillRect(x, y, cell, cell);
      else module_(x, y);
    }
  }
  return { grid, qrSpan, contained };
}
