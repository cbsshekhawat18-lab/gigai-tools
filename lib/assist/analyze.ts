/**
 * GigAI Smart Assist, STEP 1: universal, on-device FILE ANALYSIS.
 *
 * `analyzeFile(file)` inspects an uploaded file entirely in the browser and
 * returns a rich {@link FileAnalysis}. Nothing is uploaded. It is deliberately
 * DEPENDENCY-LIGHT: geometry/alpha use native `createImageBitmap` + canvas,
 * duration uses a native media element, and the only heavy engine (pdf.js) is
 * dynamic-imported lazily and only for PDFs. Everything is wrapped so a probe
 * that fails degrades to "unknown" with an honest warning rather than throwing.
 *
 * Reuses existing infra where it helps (the PDF engine's page-count / encryption
 * checks) and never re-implements a tool.
 */

import {
  assetKindFor,
  extOf,
  familyOf,
  isTextual,
} from "@/lib/assist/kinds";
import type { FileAnalysis, FileFamily } from "@/lib/assist/types";

/* ── Small local helpers (kept here so analysis pulls no heavy imports) ─────*/

/** Human-readable byte size, e.g. 2411724 → "2.3 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

/** Greatest common divisor (for aspect-ratio simplification). */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Simplified aspect-ratio label, e.g. 1920×1080 → "16:9". */
function aspectRatioLabel(w: number, h: number): string {
  if (!w || !h) return "";
  const d = gcd(w, h);
  const rw = w / d;
  const rh = h / d;
  // Collapse awkward ratios (e.g. 1237:825) to a decimal approximation.
  if (rw > 32 || rh > 32) return `${(w / h).toFixed(2)}:1`;
  return `${rw}:${rh}`;
}

/** Read the first `n` bytes of a file as a Uint8Array. */
async function head(file: Blob, n: number): Promise<Uint8Array> {
  const buf = await file.slice(0, n).arrayBuffer();
  return new Uint8Array(buf);
}

/** Case-insensitive search for an ASCII marker within a byte window. */
function bytesInclude(bytes: Uint8Array, marker: string): boolean {
  const m = marker.split("").map((c) => c.charCodeAt(0));
  outer: for (let i = 0; i + m.length <= bytes.length; i += 1) {
    for (let j = 0; j < m.length; j += 1) {
      if (bytes[i + j] !== m[j]) continue outer;
    }
    return true;
  }
  return false;
}

/* ── Image geometry, transparency & "graphic vs photo" ─────────────────────*/

interface RasterProbe {
  width: number;
  height: number;
  hasAlpha: boolean;
  looksLikeGraphic: boolean;
}

/**
 * Decode an image to read true pixel dimensions, whether it carries real
 * transparency, and a cheap flat-graphic-vs-photo hint (used later to tailor
 * how the image is handled). Runs on a tiny 48px sample so it's fast and
 * memory-safe even for huge photos. Returns null if the browser can't decode.
 */
async function probeRaster(file: File, canSample: boolean): Promise<RasterProbe | null> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return null;
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const width = bitmap.width;
    const height = bitmap.height;
    let hasAlpha = false;
    let looksLikeGraphic = false;

    if (canSample) {
      const s = 48;
      const scale = Math.min(1, s / Math.max(width, height));
      const sw = Math.max(1, Math.round(width * scale));
      const sh = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, sw, sh);
        const { data } = ctx.getImageData(0, 0, sw, sh);
        // Transparency: any pixel with alpha below opaque.
        for (let i = 3; i < data.length; i += 4) {
          if (data[i]! < 250) {
            hasAlpha = true;
            break;
          }
        }
        looksLikeGraphic = sampleLooksLikeGraphic(data, sw, sh);
      }
    }
    return { width, height, hasAlpha, looksLikeGraphic };
  } catch {
    return null;
  } finally {
    bitmap?.close?.();
  }
}

/**
 * Heuristic on a small RGBA sample: a "graphic" (logo/icon/flat illustration)
 * has a near-uniform border ring and a small color palette; a photo has a
 * noisy border and a rich palette. Mirrors the intent of the image engine's
 * `looksLikeFlatGraphic` without needing its LoadedImage.
 */
function sampleLooksLikeGraphic(data: Uint8ClampedArray, w: number, h: number): boolean {
  const px = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return [data[i]!, data[i + 1]!, data[i + 2]!] as const;
  };
  // Border uniformity: compare a handful of edge pixels to the top-left.
  const [r0, g0, b0] = px(0, 0);
  const edges = [
    px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1),
    px((w / 2) | 0, 0), px(0, (h / 2) | 0),
  ];
  let uniform = 0;
  for (const [r, g, b] of edges) {
    if (Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0) < 36) uniform += 1;
  }
  // Palette size: quantise to 4 bits/channel and count buckets.
  const buckets = new Set<number>();
  for (let i = 0; i < data.length; i += 4) {
    const key = ((data[i]! >> 4) << 8) | ((data[i + 1]! >> 4) << 4) | (data[i + 2]! >> 4);
    buckets.add(key);
  }
  return uniform >= 3 && buckets.size < 48;
}

/* ── Audio / video duration ────────────────────────────────────────────────*/

interface MediaProbe {
  durationSec?: number;
  width?: number;
  height?: number;
}

/** Read duration (and video dimensions) via a native media element. */
async function probeMedia(file: File, family: FileFamily): Promise<MediaProbe> {
  if (typeof document === "undefined") return {};
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<MediaProbe>((resolve) => {
      const el = document.createElement(family === "video" ? "video" : "audio");
      const done = (probe: MediaProbe) => resolve(probe);
      const timer = window.setTimeout(() => done({}), 6000);
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        window.clearTimeout(timer);
        const out: MediaProbe = {};
        if (Number.isFinite(el.duration)) out.durationSec = el.duration;
        if (family === "video") {
          const v = el as HTMLVideoElement;
          if (v.videoWidth) out.width = v.videoWidth;
          if (v.videoHeight) out.height = v.videoHeight;
        }
        done(out);
      };
      el.onerror = () => {
        window.clearTimeout(timer);
        done({});
      };
      el.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

/* ── Textual structure (JSON / XML / SVG / CSV / code) ─────────────────────*/

interface TextProbe {
  lineCount: number;
  encoding: string;
  minified: boolean;
  valid?: boolean;
  validationError?: string;
  width?: number;
  height?: number;
}

/** Detect a byte-order mark → encoding label. */
function detectEncoding(bytes: Uint8Array): string {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "UTF-8 (BOM)";
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return "UTF-16 LE";
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return "UTF-16 BE";
  return "UTF-8";
}

async function probeText(file: File, ext: string, mime: string): Promise<TextProbe> {
  const bomBytes = await head(file, 3);
  const encoding = detectEncoding(bomBytes);
  // Cap heavy string work: read up to 2 MB for structure, validate up to 6 MB.
  const sample = await file.slice(0, 2 * 1024 * 1024).text();
  const lines = sample.split(/\r\n|\r|\n/);
  const lineCount = lines.length;
  const nonEmpty = lines.filter((l) => l.length > 0);
  const avgLen = nonEmpty.length ? sample.length / nonEmpty.length : sample.length;
  const minified = avgLen > 300 && lineCount < Math.max(5, sample.length / 400);

  const probe: TextProbe = { lineCount, encoding, minified };

  const isJson = ext === "json" || mime === "application/json";
  const isXmlish = ext === "xml" || ext === "svg" || mime.includes("xml");

  if (file.size <= 6 * 1024 * 1024) {
    const full = file.size <= 2 * 1024 * 1024 ? sample : await file.text();
    if (isJson) {
      try {
        JSON.parse(full);
        probe.valid = true;
      } catch (e) {
        probe.valid = false;
        probe.validationError = e instanceof Error ? e.message : "Invalid JSON";
      }
    } else if (isXmlish && typeof DOMParser !== "undefined") {
      try {
        const doc = new DOMParser().parseFromString(full, "application/xml");
        const err = doc.querySelector("parsererror");
        probe.valid = !err;
        if (err) probe.validationError = "Malformed XML";
        // SVG dimensions from the root element.
        const svg = doc.documentElement;
        if (svg && svg.nodeName.toLowerCase() === "svg") {
          const vb = svg.getAttribute("viewBox");
          const w = parseFloat(svg.getAttribute("width") ?? "");
          const h = parseFloat(svg.getAttribute("height") ?? "");
          if (Number.isFinite(w) && Number.isFinite(h)) {
            probe.width = Math.round(w);
            probe.height = Math.round(h);
          } else if (vb) {
            const parts = vb.split(/[\s,]+/).map(Number);
            if (parts.length === 4 && parts[2] && parts[3]) {
              probe.width = Math.round(parts[2]);
              probe.height = Math.round(parts[3]);
            }
          }
        }
      } catch {
        /* leave valid undefined */
      }
    }
  }
  return probe;
}

/* ── PDF (page count + encryption via the existing engine) ─────────────────*/

async function probePdf(
  file: File,
): Promise<{ pageCount?: number; encrypted?: boolean; corrupt?: boolean }> {
  try {
    const { isEncrypted } = await import("@/lib/pdf/security");
    const encrypted = await isEncrypted({ file, name: file.name });
    if (encrypted) return { encrypted: true };
    const { getPageCount } = await import("@/lib/pdf/core");
    const pageCount = await getPageCount(file);
    return { pageCount };
  } catch (e) {
    if (/password|encrypt/i.test(String(e))) return { encrypted: true };
    return { corrupt: true };
  }
}

/* ── Animation / EXIF byte heuristics ──────────────────────────────────────*/

function isAnimated(ext: string, bytes: Uint8Array): boolean {
  if (ext === "gif") {
    // Count Graphic Control Extensions (0x21 0xF9): >1 ⇒ animated.
    let count = 0;
    for (let i = 0; i + 1 < bytes.length; i += 1) {
      if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9) count += 1;
      if (count > 1) return true;
    }
    return false;
  }
  if (ext === "webp") return bytesInclude(bytes, "ANIM");
  return false;
}

function hasExifBlock(bytes: Uint8Array): boolean {
  // JPEG APP1 marker 0xFFE1 followed by "Exif".
  for (let i = 0; i + 3 < bytes.length; i += 1) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xe1) return true;
  }
  return bytesInclude(bytes, "Exif");
}

/* ── Public: analyzeFile ───────────────────────────────────────────────────*/

/**
 * Analyse a single file entirely on-device. Never throws for a decodable
 * input, probe failures downgrade to warnings so the UI always gets a result.
 */
export async function analyzeFile(file: File): Promise<FileAnalysis> {
  const family = familyOf(file);
  const ext = extOf(file.name);
  const analysis: FileAnalysis = {
    name: file.name,
    ext,
    mime: file.type || "",
    family,
    size: file.size,
    sizeLabel: formatBytes(file.size),
    warnings: [],
  };
  const assetKind = assetKindFor(family);
  if (assetKind) analysis.assetKind = assetKind;

  if (file.size === 0) {
    analysis.corrupt = true;
    analysis.warnings.push("This file is empty (0 bytes).");
    return analysis;
  }

  try {
    if (family === "image") {
      const bytes = await head(file, 4096);
      const sampleable = !["heic", "heif", "tiff", "tif", "avif"].includes(ext);
      const raster = await probeRaster(file, sampleable);
      if (raster) {
        analysis.width = raster.width;
        analysis.height = raster.height;
        analysis.megapixels = +((raster.width * raster.height) / 1_000_000).toFixed(1);
        analysis.aspectRatio = aspectRatioLabel(raster.width, raster.height);
        analysis.orientation =
          raster.width === raster.height ? "square" : raster.width > raster.height ? "landscape" : "portrait";
        analysis.hasAlpha = raster.hasAlpha;
        analysis.looksLikeGraphic = raster.looksLikeGraphic;
      } else {
        analysis.warnings.push(`This browser can't preview ${ext.toUpperCase()} directly; analysis is limited.`);
      }
      analysis.animated = isAnimated(ext, bytes);
      if (ext === "jpg" || ext === "jpeg") analysis.hasExif = hasExifBlock(bytes);
    } else if (family === "svg") {
      const t = await probeText(file, ext, analysis.mime);
      applyText(analysis, t);
    } else if (family === "pdf") {
      const pdf = await probePdf(file);
      if (pdf.pageCount !== undefined) analysis.pageCount = pdf.pageCount;
      if (pdf.encrypted) {
        analysis.encrypted = true;
        analysis.warnings.push("This PDF is password-protected, unlock it first to edit or compress.");
      }
      if (pdf.corrupt) {
        analysis.corrupt = true;
        analysis.warnings.push("This PDF couldn't be opened. It may be damaged.");
      }
    } else if (family === "audio" || family === "video") {
      const m = await probeMedia(file, family);
      if (m.durationSec !== undefined) analysis.durationSec = m.durationSec;
      if (m.width) analysis.width = m.width;
      if (m.height) {
        analysis.height = m.height;
        if (m.width) {
          analysis.aspectRatio = aspectRatioLabel(m.width, m.height);
          analysis.orientation =
            m.width === m.height ? "square" : m.width > m.height ? "landscape" : "portrait";
        }
      }
    } else if (isTextual(family)) {
      const t = await probeText(file, ext, analysis.mime);
      applyText(analysis, t);
    }
  } catch (e) {
    analysis.warnings.push("Some details couldn't be read from this file.");
    // Non-fatal: return whatever we gathered.
    if (process.env.NODE_ENV !== "production") console.warn("[assist/analyze]", e);
  }

  return analysis;
}

/** Merge a TextProbe into the analysis. */
function applyText(analysis: FileAnalysis, t: {
  lineCount: number;
  encoding: string;
  minified: boolean;
  valid?: boolean;
  validationError?: string;
  width?: number;
  height?: number;
}): void {
  analysis.lineCount = t.lineCount;
  analysis.encoding = t.encoding;
  analysis.minified = t.minified;
  if (t.valid !== undefined) analysis.valid = t.valid;
  if (t.validationError) analysis.validationError = t.validationError;
  if (t.width) analysis.width = t.width;
  if (t.height) analysis.height = t.height;
  if (t.valid === false) {
    analysis.warnings.push(t.validationError ?? "This file has a syntax error.");
  }
}
