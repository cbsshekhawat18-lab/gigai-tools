/**
 * Browser-only companions to render.ts: image loading, face-centred crop,
 * HD export to a Blob, and the download/share plumbing. Everything here needs
 * a DOM; nothing here draws.
 */
import { renderPoster, type RenderFonts, type RenderInput } from "./render";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Set before src or the canvas taints (same-origin today, but the
    // banners may move to a CDN host later).
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadImage(url);
  } finally {
    // The decoded bitmap survives revocation once the element has loaded.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

interface DetectedFace {
  boundingBox: { x: number; y: number; width: number; height: number };
}
interface FaceDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedFace[]>;
}
type FaceDetectorCtor = new (opts: { fastMode: boolean; maxDetectedFaces: number }) => FaceDetectorLike;

/**
 * Centre of the most prominent face as fractions of the image, or null when
 * the Shape Detection API is unavailable (Chrome on Android has it; others
 * fall back to a plain centre crop, which is fine).
 */
export async function detectFaceCenter(img: HTMLImageElement): Promise<{ fx: number; fy: number } | null> {
  const Ctor = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
  if (!Ctor) return null;
  try {
    const faces = await new Ctor({ fastMode: true, maxDetectedFaces: 1 }).detect(img);
    const box = faces[0]?.boundingBox;
    if (!box) return null;
    return {
      fx: (box.x + box.width / 2) / img.naturalWidth,
      fy: (box.y + box.height / 2) / img.naturalHeight,
    };
  } catch {
    return null;
  }
}

/** Warm the exact faces the canvas will use, so text never falls back mid-render. */
export async function ensureFonts(fonts: RenderFonts, sample = "समर्थक Supporter"): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  await Promise.all([
    document.fonts.load(`700 40px ${fonts.display}`, sample),
    document.fonts.load(`700 40px ${fonts.body}`, sample),
  ]).catch(() => undefined);
}

export async function renderToBlob(
  input: Omit<RenderInput, "ctx">,
  type: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = input.width;
  canvas.height = input.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available in this browser.");
  renderPoster({ ...input, ctx });
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed."))), type, quality),
  );
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Keeps letters from any script plus digits; everything else becomes "_". */
export function safeFilename(s: string, fallback = "poster"): string {
  const cleaned = s.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

export function canShareFiles(files: File[]): boolean {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files });
}
