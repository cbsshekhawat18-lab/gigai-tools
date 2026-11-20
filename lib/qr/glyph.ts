/**
 * Emoji → pixels, shared by the artistic QR renderers.
 *
 * One offscreen render per call, normalised by the ink's bounding box so a
 * wide car and a tall bulb both fill the frame the same way. The silhouette
 * renderer reads the alpha channel; the halftone renderer reads the colours
 * too, which is the whole point of that mode.
 */

/** A rendered emoji plus the square crop that frames its ink. */
export interface Glyph {
  /** The canvas the emoji was drawn on, for scaled redraws. */
  canvas: HTMLCanvasElement;
  /** RGBA pixels, `size`×`size`. */
  data: Uint8ClampedArray;
  size: number;
  /** Top-left of the square ink box, in pixels (may be fractional). */
  x0: number;
  y0: number;
  /** Side of the square ink box, in pixels. */
  side: number;
}

/** Alpha above this counts as ink. */
export const INK = 60;

/**
 * Render `emoji` to an offscreen canvas and measure its ink box. Returns null
 * when the glyph draws nothing, which is how an unsupported character looks
 * on the user's machine.
 */
export function loadGlyph(emoji: string, size = 512): Glyph | null {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.round(size * 0.8)}px serif`;
  ctx.fillText(emoji, size / 2, size / 2);
  const { data } = ctx.getImageData(0, 0, size, size);
  let minX = size;
  let minY = size;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if ((data[(y * size + x) * 4 + 3] ?? 0) > INK) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const side = Math.max(maxX - minX + 1, maxY - minY + 1);
  return {
    canvas: c,
    data,
    size,
    x0: (minX + maxX + 1) / 2 - side / 2,
    y0: (minY + maxY + 1) / 2 - side / 2,
    side,
  };
}

/** Alpha of the glyph at a pixel, 0 outside the canvas. */
export function alphaAt(g: Glyph, px: number, py: number): number {
  if (px < 0 || py < 0 || px >= g.size || py >= g.size) return 0;
  return g.data[(py * g.size + px) * 4 + 3] ?? 0;
}
