/**
 * GigAI Tools: SVG raster bridge.
 *
 * Rasterize an SVG to PNG/JPEG/WebP via an offscreen `<canvas>` (draw an
 * `Image` built from a data-URI, then `canvas.toBlob`), and vectorize a raster
 * image back to SVG via imagetracerjs (lazy-imported).
 *
 * HONEST LIMITS on tracing: imagetracerjs is a color-quantizing edge tracer.
 * It shines on flat/logo/pixel art and produces clean, small SVGs there; on
 * photographs it emits thousands of paths and a large file. It is NOT an AI
 * vectorizer. `pngToSvg` exposes a `mode` preset so the UI can steer quality.
 *
 * Everything here is client-only (canvas/Image/DOM). Functions reject with a
 * clear message off the main thread / on SSR.
 */

import { type SvgResult, ok, fail, errMessage, hasDom } from "./core";
import { svgToDataUri } from "./convert";

/* ------------------------------ SVG -> raster ----------------------------- */

export interface RasterOptions {
  /** Multiply the SVG's intrinsic size (default 1). Ignored if width/height set. */
  scale?: number;
  /** Explicit output width in px (height derived from aspect if omitted). */
  width?: number;
  /** Explicit output height in px. */
  height?: number;
  /** Background fill (e.g. "#fff"); default transparent for PNG/WebP. */
  background?: string;
  /** Quality 0–1 for lossy formats (JPEG/WebP); default 0.92. */
  quality?: number;
}

/** Render an SVG string to a PNG Blob. */
export function svgToPng(svg: string, options: RasterOptions = {}): Promise<Blob> {
  return svgToRaster(svg, "image/png", options);
}

/**
 * Render an SVG string to a raster Blob of `type`. Resolves the encoded Blob or
 * rejects with a readable Error. JPEG gets a white background by default (it
 * has no alpha) so transparent regions don't turn black.
 */
export async function svgToRaster(svg: string, type: "image/png" | "image/jpeg" | "image/webp", options: RasterOptions = {}): Promise<Blob> {
  if (!hasDom()) throw new Error("Rasterizing requires a browser (canvas/Image).");
  const input = svg.trim();
  if (!input) throw new Error("Paste an SVG to rasterize.");

  const { width, height } = await measureSvg(input, options);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D canvas context.");

  const bg = options.background ?? (type === "image/jpeg" ? "#ffffff" : null);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const img = await loadSvgImage(input);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const quality = options.quality ?? 0.92;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) throw new Error(`Browser could not encode ${type}. WebP may be unsupported here.`);
  return blob;
}

/** Load an SVG string into an HTMLImageElement (via data-URI, CORS-clean). */
function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const uri = svgToDataUri(svg, { encoding: "base64" });
    if (!uri.ok) {
      reject(new Error(uri.error.message));
      return;
    }
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The SVG could not be loaded as an image (check that it is valid)."));
    img.src = uri.result;
  });
}

/**
 * Determine output pixel dimensions from options + the SVG's intrinsic size
 * (width/height attrs or viewBox). Falls back to 512×512 if the SVG declares
 * no size. Honors explicit width/height, else applies `scale`.
 */
async function measureSvg(svg: string, options: RasterOptions): Promise<{ width: number; height: number }> {
  const intrinsic = intrinsicSize(svg);
  const aspect = intrinsic.width / intrinsic.height;

  if (options.width && options.height) return { width: options.width, height: options.height };
  if (options.width) return { width: options.width, height: options.width / aspect };
  if (options.height) return { width: options.height * aspect, height: options.height };

  const scale = options.scale && options.scale > 0 ? options.scale : 1;
  return { width: intrinsic.width * scale, height: intrinsic.height * scale };
}

/** Read intrinsic width/height from width/height attrs, else viewBox, else 512. */
function intrinsicSize(svg: string): { width: number; height: number } {
  const wAttr = parseLength(/\bwidth\s*=\s*["']([^"']+)["']/i.exec(svg)?.[1]);
  const hAttr = parseLength(/\bheight\s*=\s*["']([^"']+)["']/i.exec(svg)?.[1]);
  if (wAttr && hAttr) return { width: wAttr, height: hAttr };

  const vb = /\bviewBox\s*=\s*["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i.exec(svg);
  if (vb) {
    const w = parseFloat(vb[3] ?? "");
    const h = parseFloat(vb[4] ?? "");
    if (w > 0 && h > 0) return { width: w, height: h };
  }
  if (wAttr) return { width: wAttr, height: wAttr };
  if (hAttr) return { width: hAttr, height: hAttr };
  return { width: 512, height: 512 };
}

/** Parse a CSS length to px, ignoring % (unresolvable without a viewport). */
function parseLength(value: string | undefined): number | null {
  if (!value) return null;
  if (value.includes("%")) return null;
  const num = parseFloat(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

/* ------------------------------ raster -> SVG ----------------------------- */

export interface TraceOptions {
  /** Number of colors to quantize to (default per mode). */
  colors?: number;
  /**
   * Preset that maps to imagetracerjs parameters:
   * - "flat": few colors, smooth, logos/flat art (default)
   * - "poster": bold posterized look
   * - "photo": many colors, big file, honest warning applies
   * - "sketch": high detail, thin strokes
   */
  mode?: "flat" | "poster" | "photo" | "sketch";
}

/** imagetracerjs option bag (only the fields we set). */
type TracerOptions = Record<string, number | boolean | string>;

// Speckle is the enemy of a clean logo trace: a soft/near-white background or a
// JPEG-compressed source has thousands of near-identical pixels that the tracer
// splits into tiny stray paths. The despeckle-oriented presets (flat/poster)
// counter this with a selective pre-blur (`blurradius` + `blurdelta` smooths
// flat regions while `blurdelta` preserves strong edges), a high `pathomit`
// (drops paths smaller than N px), extra `colorquantcycles` for a stable
// palette, and `mincolorratio` to prune ultra-rare colors. photo/sketch stay
// detail-faithful.
const TRACE_PRESETS: Record<NonNullable<TraceOptions["mode"]>, TracerOptions> = {
  flat: { numberofcolors: 8, colorquantcycles: 4, mincolorratio: 0.01, ltres: 1, qtres: 1, pathomit: 16, rightangleenhance: true, blurradius: 3, blurdelta: 24, strokewidth: 0, linefilter: true, roundcoords: 1 },
  poster: { numberofcolors: 6, colorquantcycles: 4, mincolorratio: 0.02, ltres: 1.5, qtres: 1.5, pathomit: 24, rightangleenhance: true, blurradius: 4, blurdelta: 32, strokewidth: 0, linefilter: true, roundcoords: 1 },
  photo: { numberofcolors: 32, colorquantcycles: 3, mincolorratio: 0, ltres: 1, qtres: 1, pathomit: 4, rightangleenhance: false, blurradius: 1, blurdelta: 20, strokewidth: 0, linefilter: false, roundcoords: 1 },
  sketch: { numberofcolors: 16, colorquantcycles: 3, mincolorratio: 0, ltres: 0.5, qtres: 0.5, pathomit: 2, rightangleenhance: false, blurradius: 0, blurdelta: 20, strokewidth: 1, linefilter: false, roundcoords: 1 },
};

/**
 * Vectorize a raster image (File/Blob) to an SVG string via imagetracerjs.
 * Reads the image onto a canvas to get ImageData, then traces. Resolves the
 * SVG string. Rejects with a readable message on unsupported input.
 *
 * Limits (documented in the UI): color-quantizing tracer; great for flat art
 * and logos, heavy/imperfect on photographs. Not an AI vectorizer.
 */
export async function pngToSvg(file: File | Blob, options: TraceOptions = {}): Promise<SvgResult<string>> {
  if (!hasDom()) return fail("Tracing requires a browser (canvas).");
  try {
    const imageData = await fileToImageData(file);
    const mode = options.mode ?? "flat";
    const preset = { ...TRACE_PRESETS[mode] };
    if (options.colors && options.colors > 0) preset.numberofcolors = Math.min(256, Math.round(options.colors));

    // Speckle scales with resolution: a `pathomit` that cleans a 512px logo
    // barely dents a 2000px one. For the despeckle modes, scale it by the
    // image's linear size so flat art traces clean at any resolution.
    if ((mode === "flat" || mode === "poster") && typeof preset.pathomit === "number") {
      const linear = Math.sqrt((imageData.width * imageData.height) / (512 * 512));
      preset.pathomit = Math.round(preset.pathomit * Math.max(1, linear));
    }

    const tracer = await loadTracer();
    if (!tracer) return fail("The tracing engine (imagetracerjs) failed to load.");

    const svg = tracer.imagedataToSVG(toTracerImageData(imageData), preset);
    if (typeof svg !== "string" || !svg.includes("<svg")) return fail("Tracing produced no SVG output.");
    return ok(svg);
  } catch (err) {
    return fail(`Trace failed: ${errMessage(err)}`);
  }
}

/** Alias kept generic, vectorize any raster Blob, not just PNG. */
export const rasterToSvg = pngToSvg;

/** Decode a File/Blob to ImageData via canvas. */
async function fileToImageData(file: File | Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D canvas context.");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/** imagetracerjs wants a plain {width,height,data} object: ImageData works. */
function toTracerImageData(data: ImageData): { width: number; height: number; data: Uint8ClampedArray } {
  return { width: data.width, height: data.height, data: data.data };
}

/** imagetracerjs surface we use. */
interface Tracer {
  imagedataToSVG: (imageData: { width: number; height: number; data: Uint8ClampedArray }, options?: TracerOptions) => string;
}

let tracerPromise: Promise<Tracer | null> | null = null;

/** Lazy-load imagetracerjs once. */
async function loadTracer(): Promise<Tracer | null> {
  if (!tracerPromise) {
    tracerPromise = (async () => {
      try {
        const mod = (await import("imagetracerjs")) as unknown as { default?: Tracer } & Tracer;
        return (mod.default ?? mod) as Tracer;
      } catch {
        return null;
      }
    })();
  }
  return tracerPromise;
}
