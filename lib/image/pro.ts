/**
 * GigAI Tools, "pro" image engine: best-in-class processing paths.
 *
 * These implementations use industry-standard, actively-maintained engines and
 * are loaded ONLY when a tool runs (dynamic import), keeping the initial bundle
 * light. Each is wrapped by lib/image/engine.ts, which falls back to the canvas
 * path if a library or model fails to load, so a tool never hard-fails.
 *
 *   • Compress / Convert  → Squoosh WASM codecs: MozJPEG, libwebp, OxiPNG
 *   • Resize              → pica (Lanczos high-quality resampling)
 *
 * Client-only: every function touches the DOM and must run in a browser.
 */
import type { LoadedImage, ProcessResult } from "./engine";

type CodecFormat = "image/jpeg" | "image/webp" | "image/png";

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.92;
  return Math.min(1, Math.max(0.05, n));
}

function supportsAlpha(format: string): boolean {
  return format === "image/png" || format === "image/webp";
}

function toResult(blob: Blob, width: number, height: number): ProcessResult {
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
    format: blob.type,
    size: blob.size,
  };
}

function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas context available.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/** Draw a source bitmap to a full-size canvas, optionally flattening alpha. */
function bitmapToCanvas(img: LoadedImage, background?: string): HTMLCanvasElement {
  const { canvas, ctx } = canvasOf(img.width, img.height);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img.bitmap, 0, 0);
  return canvas;
}

function imageDataOf(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas context available.");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error(`Encode to ${format} failed.`))),
      format,
      quality,
    );
  });
}

/**
 * Encode ImageData with the best available codec for the target format:
 * MozJPEG (jpeg), libwebp (webp), OxiPNG-optimised PNG (png). Throws if the
 * format has no WASM codec so the caller can fall back.
 */
async function encodeWithCodec(
  data: ImageData,
  format: CodecFormat,
  quality0to1: number,
): Promise<Blob> {
  const quality = Math.round(clamp01(quality0to1) * 100);

  if (format === "image/jpeg") {
    const { encode } = await import("@jsquash/jpeg");
    const buf = await encode(data, { quality });
    return new Blob([buf], { type: "image/jpeg" });
  }
  if (format === "image/webp") {
    const { encode } = await import("@jsquash/webp");
    const buf = await encode(data, { quality });
    return new Blob([buf], { type: "image/webp" });
  }
  // PNG: encode then losslessly optimise with OxiPNG.
  const { encode } = await import("@jsquash/png");
  let buf: ArrayBuffer = await encode(data);
  try {
    const { optimise } = await import("@jsquash/oxipng");
    buf = await optimise(buf, { level: 2 });
  } catch {
    /* optimisation is a bonus. Keep the un-optimised PNG on failure */
  }
  return new Blob([buf], { type: "image/png" });
}

function isCodecFormat(f: string): f is CodecFormat {
  return f === "image/jpeg" || f === "image/webp" || f === "image/png";
}

/** MozJPEG / libwebp compression at exact dimensions. */
export async function compressPro(
  img: LoadedImage,
  opts: { quality: number; format?: "image/jpeg" | "image/webp" },
): Promise<ProcessResult> {
  const format: CodecFormat = opts.format ?? "image/jpeg";
  const canvas = bitmapToCanvas(img, supportsAlpha(format) ? undefined : "#ffffff");
  const blob = await encodeWithCodec(imageDataOf(canvas), format, opts.quality);
  return toResult(blob, img.width, img.height);
}

/** Format conversion via the WASM codecs (crisper than canvas re-encode). */
export async function convertPro(
  img: LoadedImage,
  opts: { format: CodecFormat; quality?: number; background?: string },
): Promise<ProcessResult> {
  if (!isCodecFormat(opts.format)) throw new Error("Unsupported codec format.");
  const canvas = bitmapToCanvas(
    img,
    supportsAlpha(opts.format) ? undefined : opts.background ?? "#ffffff",
  );
  const blob = await encodeWithCodec(imageDataOf(canvas), opts.format, opts.quality ?? 0.92);
  return toResult(blob, img.width, img.height);
}

/** Lanczos high-quality resize with pica, then codec (or canvas) encode. */
export async function resizePro(
  img: LoadedImage,
  opts: { width: number; height: number; format?: string; quality?: number },
): Promise<ProcessResult> {
  const width = Math.max(1, Math.round(opts.width));
  const height = Math.max(1, Math.round(opts.height));
  const format = opts.format ?? img.file.type ?? "image/png";

  const picaModule = await import("pica");
  const pica = (picaModule.default as unknown as () => { resize: (from: HTMLCanvasElement, to: HTMLCanvasElement, o?: unknown) => Promise<HTMLCanvasElement> })();
  const source = bitmapToCanvas(img);
  const { canvas: dest } = canvasOf(width, height);
  await pica.resize(source, dest, { alpha: true });

  if (isCodecFormat(format)) {
    let data = imageDataOf(dest);
    if (!supportsAlpha(format)) {
      const flat = canvasOf(width, height);
      flat.ctx.fillStyle = "#ffffff";
      flat.ctx.fillRect(0, 0, width, height);
      flat.ctx.drawImage(dest, 0, 0);
      data = imageDataOf(flat.canvas);
    }
    try {
      const blob = await encodeWithCodec(data, format, opts.quality ?? 0.92);
      return toResult(blob, width, height);
    } catch {
      /* fall through to canvas encode below */
    }
  }
  const blob = await canvasToBlob(dest, format, opts.quality ?? 0.92);
  return toResult(blob, width, height);
}

/**
 * Neural super-resolution with UpscalerJS + TensorFlow.js (ESRGAN model),
 * running entirely in the browser. Enlarges 2× or 4× by reconstructing detail
 * rather than merely smoothing. Model weights are fetched and cached on first
 * use; large images are processed in tiles to keep memory bounded.
 */
export async function upscalePro(img: LoadedImage, factor: 2 | 4): Promise<ProcessResult> {
  const { default: Upscaler } = await import("upscaler");
  await import("@tensorflow/tfjs"); // registers a TF backend (WebGL/CPU)
  const model =
    factor === 4
      ? (await import("@upscalerjs/esrgan-slim/4x")).default
      : (await import("@upscalerjs/esrgan-slim/2x")).default;

  const upscaler = new Upscaler({ model });
  try {
    const el = new Image();
    el.src = img.url;
    await el.decode();
    const base64 = await upscaler.upscale(el, {
      output: "base64",
      patchSize: 64,
      padding: 5,
    });
    const dataUrl = base64.startsWith("data:")
      ? base64
      : `data:image/png;base64,${base64}`;
    const blob = await (await fetch(dataUrl)).blob();
    return toResult(blob, img.width * factor, img.height * factor);
  } finally {
    try {
      upscaler.dispose();
    } catch {
      /* dispose is best-effort */
    }
  }
}
