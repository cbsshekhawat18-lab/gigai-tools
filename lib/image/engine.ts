/**
 * GigAI Tools, client-side image engine.
 *
 * Every image operation runs entirely in the browser on an HTMLCanvasElement:
 * files are NEVER uploaded, which is the whole privacy promise of the product.
 * Each function loads pixels into a canvas, applies the transform, and encodes
 * the result via `canvas.toBlob`. Object URLs are minted for previews and must
 * be released with `releaseImage` / `releaseResult` to avoid leaks.
 *
 * All functions assume a DOM environment (they touch `document`, `Image`,
 * `URL`, `createImageBitmap`) and therefore only run in client components.
 */

/** A decoded source image plus the metadata every tool needs. */
export interface LoadedImage {
  file: File;
  /** Object URL for previewing the original (revoke via releaseImage). */
  url: string;
  width: number;
  height: number;
  /** Decoded bitmap used as the canvas draw source. */
  bitmap: ImageBitmap;
}

/** The encoded output of any engine operation. */
export interface ProcessResult {
  blob: Blob;
  /** Object URL for previewing/downloading (revoke via releaseResult). */
  url: string;
  width: number;
  height: number;
  /** MIME type of the encoded blob, e.g. "image/webp". */
  format: string;
  /** Byte length of the blob. */
  size: number;
}

/** Default encoder quality (0–1) for lossy formats when a tool omits one. */
const DEFAULT_QUALITY = 0.92;

/** Clamp a value into [min, max]; NaN falls back to `min`. */
function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** True for MIME types that carry an alpha channel. */
function supportsAlpha(format: string): boolean {
  return format === "image/png" || format === "image/webp";
}

/**
 * Create a 2D canvas at the given size. Rounds and enforces a minimum of 1px
 * so a zero/negative dimension never throws when creating the context.
 */
function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get a 2D canvas context in this browser.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/**
 * Promise wrapper around `canvas.toBlob`, which yields `null` when encoding
 * fails or the format is unsupported. Rejects with a helpful message instead.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error(
              `This browser could not encode the image as ${format}. Try a different format.`,
            ),
          );
        }
      },
      format,
      quality,
    );
  });
}

/** Wrap an encoded blob as a ProcessResult with a fresh preview URL. */
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

/** Cap decoded images so a huge file can't exhaust memory via full-size canvases. */
const MAX_MEGAPIXELS = 50;

/**
 * Decode a File into a LoadedImage. Uses `createImageBitmap` for fast,
 * off-thread decoding where available and keeps an object URL for previews.
 */
export async function loadImageFile(file: File): Promise<LoadedImage> {
  // HEIC/HEIF (iPhone photos) can't be decoded natively by browsers. Detect them
  // by MIME or extension. The type is sometimes empty on non-Apple devices.
  const isHeic = /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

  if (!isHeic && !file.type.startsWith("image/")) {
    throw new Error("That file is not an image. Please choose a PNG, JPG, WebP, HEIC or GIF.");
  }

  // Decode HEIC to a PNG blob first. Browsers can't decode HEIC natively.
  // heic2any is lazy-imported here, so it only downloads when a HEIC is actually
  // opened (zero bundle cost for every other image). The original `file` is
  // still returned, so size/name reflect the source HEIC in the UI.
  let source: Blob = file;
  if (isHeic) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({ blob: file, toType: "image/png" });
      source = Array.isArray(converted) ? (converted[0] as Blob) : converted;
    } catch {
      throw new Error(
        "Could not read this HEIC image. Some HEIC variants aren't supported: try exporting it as JPG on your device.",
      );
    }
  }

  const url = URL.createObjectURL(source);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch {
    // Fallback for formats/browsers where createImageBitmap(file) is flaky:
    // decode through an <img> element, then snapshot to a bitmap.
    bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        createImageBitmap(img).then(resolve).catch(reject);
      };
      img.onerror = () =>
        reject(new Error("Could not read this image. It may be corrupt or unsupported."));
      img.src = url;
    });
  }

  // Reject before any full-size canvas is allocated from this bitmap.
  const megapixels = (bitmap.width * bitmap.height) / 1_000_000;
  if (megapixels > MAX_MEGAPIXELS) {
    bitmap.close();
    URL.revokeObjectURL(url);
    throw new Error(
      `This image is about ${Math.round(megapixels)} megapixels, larger than the ${MAX_MEGAPIXELS} MP limit. Please use a smaller image.`,
    );
  }

  return {
    file,
    url,
    width: bitmap.width,
    height: bitmap.height,
    bitmap,
  };
}

/**
 * Re-encode an image at a lower quality to shrink its file size. JPEG flattens
 * transparency onto white; WebP preserves it. Dimensions are unchanged.
 */
async function compressImageCanvas(
  img: LoadedImage,
  opts: { quality: number; format?: "image/jpeg" | "image/webp" },
): Promise<ProcessResult> {
  const format = opts.format ?? "image/jpeg";
  const quality = clamp(opts.quality, 0.05, 1);
  const { canvas, ctx } = createCanvas(img.width, img.height);

  if (!supportsAlpha(format)) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img.bitmap, 0, 0);

  const blob = await canvasToBlob(canvas, format, quality);
  return toResult(blob, canvas.width, canvas.height);
}

/**
 * Resample an image to an exact width × height. Uses high-quality smoothing;
 * the caller is responsible for preserving aspect ratio if desired.
 */
async function resizeImageCanvas(
  img: LoadedImage,
  opts: { width: number; height: number; format?: string; quality?: number },
): Promise<ProcessResult> {
  const format = opts.format ?? img.file.type ?? "image/png";
  const width = Math.max(1, Math.round(opts.width));
  const height = Math.max(1, Math.round(opts.height));
  const { canvas, ctx } = createCanvas(width, height);

  if (!supportsAlpha(format)) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img.bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await canvasToBlob(canvas, format, opts.quality ?? DEFAULT_QUALITY);
  return toResult(blob, canvas.width, canvas.height);
}

/**
 * Crop a rectangular region out of an image. The rect is clamped to the image
 * bounds so out-of-range selections never draw empty/garbage pixels.
 */
export async function cropImage(
  img: LoadedImage,
  rect: { x: number; y: number; width: number; height: number },
  opts?: { format?: string; quality?: number },
): Promise<ProcessResult> {
  const format = opts?.format ?? img.file.type ?? "image/png";

  const x = clamp(rect.x, 0, img.width);
  const y = clamp(rect.y, 0, img.height);
  const width = clamp(rect.width, 1, img.width - x);
  const height = clamp(rect.height, 1, img.height - y);

  const { canvas, ctx } = createCanvas(width, height);

  if (!supportsAlpha(format)) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(
    img.bitmap,
    x,
    y,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const blob = await canvasToBlob(canvas, format, opts?.quality ?? DEFAULT_QUALITY);
  return toResult(blob, canvas.width, canvas.height);
}

/**
 * Convert an image to another format. When targeting a non-alpha format
 * (JPEG), transparent pixels are flattened onto `background` (default white).
 */
async function convertFormatCanvas(
  img: LoadedImage,
  opts: {
    format: "image/png" | "image/jpeg" | "image/webp";
    quality?: number;
    background?: string;
  },
): Promise<ProcessResult> {
  const { canvas, ctx } = createCanvas(img.width, img.height);

  if (!supportsAlpha(opts.format)) {
    ctx.fillStyle = opts.background ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img.bitmap, 0, 0);

  const blob = await canvasToBlob(canvas, opts.format, opts.quality ?? DEFAULT_QUALITY);
  return toResult(blob, canvas.width, canvas.height);
}

/**
 * Enlarge an image by 2× or 4× using high-quality canvas resampling
 * (bilinear/bicubic-ish smoothing). Honest scope: this is superior resampling,
 * not generative super-resolution; it will not invent detail that isn't there.
 */
async function upscaleImageCanvas(
  img: LoadedImage,
  opts: { factor: 2 | 4; format?: string; quality?: number },
): Promise<ProcessResult> {
  const factor = opts.factor === 4 ? 4 : 2;
  const format = opts.format ?? img.file.type ?? "image/png";
  const targetW = img.width * factor;
  const targetH = img.height * factor;

  // Upscale in successive 2× steps: repeated moderate scaling with smoothing
  // yields cleaner results than a single large jump.
  let sourceW = img.width;
  let sourceH = img.height;
  let current = createCanvas(sourceW, sourceH);
  current.ctx.drawImage(img.bitmap, 0, 0);

  while (sourceW < targetW) {
    const nextW = Math.min(sourceW * 2, targetW);
    const nextH = Math.min(sourceH * 2, targetH);
    const next = createCanvas(nextW, nextH);
    next.ctx.drawImage(current.canvas, 0, 0, nextW, nextH);
    current = next;
    sourceW = nextW;
    sourceH = nextH;
  }

  if (!supportsAlpha(format)) {
    // Flatten onto white for non-alpha targets by compositing behind.
    const flat = createCanvas(targetW, targetH);
    flat.ctx.fillStyle = "#ffffff";
    flat.ctx.fillRect(0, 0, flat.canvas.width, flat.canvas.height);
    flat.ctx.drawImage(current.canvas, 0, 0);
    current = flat;
  }

  const blob = await canvasToBlob(current.canvas, format, opts.quality ?? DEFAULT_QUALITY);
  return toResult(blob, current.canvas.width, current.canvas.height);
}

/** Trigger a browser download of a blob under `filename`. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, exponent);
  const unit = units[exponent] ?? "B";
  // Whole bytes have no decimals; larger units show one.
  const formatted = exponent === 0 ? String(Math.round(value)) : value.toFixed(1);
  return `${formatted} ${unit}`;
}

/** Revoke a LoadedImage's preview URL and close its bitmap. Null-safe. */
export function releaseImage(img: LoadedImage | null): void {
  if (!img) return;
  try {
    URL.revokeObjectURL(img.url);
  } catch {
    /* already revoked, ignore */
  }
  try {
    img.bitmap.close();
  } catch {
    /* not all browsers support close(): ignore */
  }
}

/** Revoke a ProcessResult's preview URL. Null-safe. */
export function releaseResult(r: ProcessResult | null): void {
  if (!r) return;
  try {
    URL.revokeObjectURL(r.url);
  } catch {
    /* already revoked, ignore */
  }
}

/* ── Best-in-class engines (with automatic canvas fallback) ───────────────────
 * Public operations prefer the "pro" engine (Squoosh MozJPEG/WebP/OxiPNG codecs,
 * pica Lanczos resampling, ESRGAN upscaling), loaded on demand. If a library
 * or model fails to load (offline, unsupported, blocked) they transparently
 * fall back to the canvas implementations above, so a tool never hard-fails.
 * The tool UIs are unchanged: same function names, same signatures.
 */
async function withFallback<T>(pro: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await pro();
  } catch (err) {
    // Always log why the pro path failed (also in production), a silent drop to
    // the fallback made real failures (e.g. a WASM codec failing to load)
    // impossible to diagnose from user reports.
     
    console.warn("[image-engine] pro path unavailable, using canvas fallback:", err);
    return fallback();
  }
}

/** Compress via MozJPEG / libwebp (falls back to canvas encode). */
export function compressImage(
  img: LoadedImage,
  opts: { quality: number; format?: "image/jpeg" | "image/webp" },
): Promise<ProcessResult> {
  return withFallback(
    async () => (await import("./pro")).compressPro(img, opts),
    () => compressImageCanvas(img, opts),
  );
}

/**
 * Compress an image to a TARGET file size by binary-searching the quality that
 * lands just under `targetBytes`. Runs ~8 encodes, keeping the best (largest
 * file that still fits) and releasing the rest so no blob URLs leak. If even the
 * lowest quality can't reach the target (a large image aimed at a tiny size),
 * it returns the smallest achievable result, the UI reports the actual size so
 * the outcome is always honest. Reuses the tested `compressImage` encode path.
 */
export async function compressToTargetSize(
  img: LoadedImage,
  opts: { targetBytes: number; format?: "image/jpeg" | "image/webp" },
): Promise<ProcessResult> {
  const format = opts.format ?? "image/jpeg";
  const target = Math.max(1, opts.targetBytes);

  let lo = 0.05; // lowest quality we'll try
  let hi = 0.95; // highest quality we'll try
  let best: ProcessResult | null = null; // largest result that still fits

  for (let i = 0; i < 8; i++) {
    const q = (lo + hi) / 2;
    const result = await compressImage(img, { quality: q, format });
    if (result.size <= target) {
      if (best) releaseResult(best);
      best = result; // fits - push quality up for a sharper result
      lo = q;
    } else {
      releaseResult(result); // too big: pull quality down
      hi = q;
    }
  }

  // Nothing fit within the search range. Return the smallest we can produce.
  if (!best) {
    best = await compressImage(img, { quality: 0.05, format });
  }
  return best;
}

/** Resize via pica Lanczos + codec encode (falls back to canvas). */
export function resizeImage(
  img: LoadedImage,
  opts: { width: number; height: number; format?: string; quality?: number },
): Promise<ProcessResult> {
  return withFallback(
    async () => (await import("./pro")).resizePro(img, opts),
    () => resizeImageCanvas(img, opts),
  );
}

/** Convert format via Squoosh codecs (falls back to canvas). */
export function convertFormat(
  img: LoadedImage,
  opts: {
    format: "image/png" | "image/jpeg" | "image/webp";
    quality?: number;
    background?: string;
  },
): Promise<ProcessResult> {
  return withFallback(
    async () => (await import("./pro")).convertPro(img, opts),
    () => convertFormatCanvas(img, opts),
  );
}

/** Upscale with the ESRGAN neural model (falls back to canvas resampling). */
export function upscaleImage(
  img: LoadedImage,
  opts: { factor: 2 | 4; format?: string; quality?: number },
): Promise<ProcessResult> {
  return withFallback(
    async () => (await import("./pro")).upscalePro(img, opts.factor),
    () => upscaleImageCanvas(img, opts),
  );
}
