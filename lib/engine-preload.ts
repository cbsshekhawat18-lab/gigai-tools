/**
 * Fire-and-forget engine warm-up, called the moment a file is selected so the
 * WASM codecs are fetched and compiled while the user is still reading the
 * options. Without this, the first "Compress" click paid the whole engine
 * download (~8-9s cold, measured); with it, the engine races the user's own
 * settings-reading time and usually wins.
 *
 * Each key runs once per session; a failed load clears the key so a retry is
 * possible (e.g. flaky network). Failures are silent by design. The real code
 * path has its own fallback and error surface, warm-up must never add noise.
 */

const warmed = new Set<string>();

function warm(key: string, load: () => Promise<unknown>): void {
  if (typeof window === "undefined" || warmed.has(key)) return;
  warmed.add(key);
  load().catch(() => {
    warmed.delete(key);
  });
}

/** A 1x1 encode forces the codec to fetch AND compile its WASM, not just the JS shim. */
function tinyImage(): ImageData {
  return new ImageData(1, 1);
}

/** JPEG + WebP encoders and the pro pipeline; shared by every image tool. */
export function warmImageEncoders(): void {
  warm("image-pro", () => import("@/lib/image/pro"));
  warm("jpeg-wasm", async () => {
    const { encode } = await import("@jsquash/jpeg");
    await encode(tinyImage(), { quality: 50 });
  });
  warm("webp-wasm", async () => {
    const { encode } = await import("@jsquash/webp");
    await encode(tinyImage(), { quality: 50 });
  });
}

/** pdf-lib, needed by almost every PDF tool. */
export function warmPdfBase(): void {
  warm("pdf-lib", () => import("pdf-lib"));
}

/** The rasterising path: pdf.js + JPEG encoder (compress, PDF-to-image). */
export function warmPdfRaster(): void {
  warmPdfBase();
  warm("pdfjs", async () => {
    const { loadPdfjs } = await import("@/lib/pdf/core");
    await loadPdfjs();
  });
  warm("jpeg-encode", async () => {
    const { default: encode } = await import("@jsquash/jpeg/encode");
    await encode(tinyImage(), { quality: 50 });
  });
}
