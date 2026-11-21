/**
 * GigAI Tools: PDF core: pdf.js document loading, rendering, and shared plumbing.
 *
 * Everything here runs client-side only (it touches `document`, `canvas`, and
 * `import.meta.url`). pdf.js is dynamic-imported inside each function so its
 * ~1MB payload is code-split out of the initial bundle and only fetched when a
 * user actually opens a PDF tool.
 *
 * Worker setup for Next 15 / Turbopack: we resolve the worker asset with
 * `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)`, which lets
 * the bundler fingerprint and emit the worker file and hand us a correct URL -
 * no manual copying into /public required.
 */

import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/types/src/display/api";
import { downloadBlob, formatBytes } from "@/lib/image/engine";
import type { PageThumbnail } from "./types";

// Re-export the generic helpers so PDF tools import everything from one place.
export { downloadBlob, formatBytes };

/** The subset of the pdf.js module we consume. */
type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;
let workerConfigured = false;

/**
 * Point pdf.js at its web-worker bundle. Idempotent and safe to call before
 * every operation. Uses `import.meta.url` resolution so the bundler emits the
 * hashed worker asset and gives us a valid same-origin URL.
 */
export function ensurePdfWorker(mod: PdfjsModule): void {
  if (workerConfigured) return;
  // No cache-bust query: the worker filename is content-hashed and nginx now
  // serves .mjs with the correct MIME type, so the bare URL caches correctly.
  try {
    mod.GlobalWorkerOptions.workerSrc =
      new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    workerConfigured = true;
  } catch {
    // If URL resolution ever fails (exotic bundler), fall back to the ESM
    // worker path shipped in the package so rendering still works.
    mod.GlobalWorkerOptions.workerSrc =
      new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
    workerConfigured = true;
  }
}

/** Lazily import pdf.js once and configure its worker. */
export async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist");
  }
  const mod = await pdfjsPromise;
  ensurePdfWorker(mod);
  return mod;
}

/** Read a File/Blob into a fresh `Uint8Array` (pdf.js consumes the buffer). */
export async function fileToUint8Array(file: Blob): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Self-hosted pdf.js support assets (copied from `pdfjs-dist` into
 * `public/pdfjs/` at build time). Without these, rendering any PDF that relies
 * on the standard-14 fonts (e.g. a plain Helvetica document) throws
 * "UnknownErrorException: Ensure that the `standardFontDataUrl` API parameter
 * is provided", and CJK/encoded PDFs fail to map glyphs. Absolute, root-relative
 * URLs work because the app is served from the site root.
 */
export const PDF_STANDARD_FONT_URL = "/pdfjs/standard_fonts/";
export const PDF_CMAP_URL = "/pdfjs/cmaps/";

/**
 * Merge the required font/CMap asset URLs into a pdf.js `getDocument` parameter
 * object. Every `getDocument` call site MUST route through this so no PDF ever
 * fails to render for want of standard fonts.
 */
export function withPdfAssets<T extends Record<string, unknown>>(
  params: T,
): T & { standardFontDataUrl: string; cMapUrl: string; cMapPacked: true } {
  return {
    ...params,
    standardFontDataUrl: PDF_STANDARD_FONT_URL,
    cMapUrl: PDF_CMAP_URL,
    cMapPacked: true,
  };
}

/**
 * Open a PDF with pdf.js. `password` is forwarded for encrypted files; a wrong
 * or missing password surfaces as a typed error the security tools can catch.
 */
export async function openPdfDocument(
  file: Blob,
  password?: string,
): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  const data = await fileToUint8Array(file);
  try {
    const task = pdfjs.getDocument(withPdfAssets({ data, password }));
    return await task.promise;
  } catch (err) {
    throw normalizePdfError(err);
  }
}

/** Turn cryptic pdf.js errors into clear, user-facing messages. */
export function normalizePdfError(err: unknown): Error {
  const name = (err as { name?: string })?.name ?? "";
  const message = (err as { message?: string })?.message ?? String(err);

  if (name === "PasswordException" || /password/i.test(message)) {
    if (/incorrect|invalid/i.test(message)) {
      return new Error("Incorrect password. Please check it and try again.");
    }
    return new Error("This PDF is password-protected. Enter its password to continue.");
  }
  if (name === "InvalidPDFException" || /invalid pdf|corrupt/i.test(message)) {
    return new Error("This file isn't a valid PDF, or it's damaged.");
  }
  return err instanceof Error ? err : new Error(message);
}

/** Count pages in a PDF without keeping the document around. */
export async function getPageCount(file: Blob, password?: string): Promise<number> {
  const doc = await openPdfDocument(file, password);
  try {
    return doc.numPages;
  } finally {
    await doc.loadingTask.destroy();
  }
}

/**
 * Render a single 1-based page onto a **new** canvas at `scale` (default 1.5,
 * a crisp on-screen size). Returns the canvas so callers can snapshot it to a
 * blob/data URL or re-encode via @jsquash. Throws on out-of-range page numbers.
 */
export async function renderPageToCanvas(
  file: Blob,
  pageNumber: number,
  scale = 1.5,
  password?: string,
): Promise<HTMLCanvasElement> {
  const doc = await openPdfDocument(file, password);
  try {
    if (pageNumber < 1 || pageNumber > doc.numPages) {
      throw new Error(
        `Page ${pageNumber} is out of range (this PDF has ${doc.numPages} page${doc.numPages === 1 ? "" : "s"}).`,
      );
    }
    const page = await doc.getPage(pageNumber);
    return await pageToCanvas(page, scale);
  } finally {
    await doc.loadingTask.destroy();
  }
}

/** Render a live PDFPageProxy onto a canvas at `scale`. */
export async function pageToCanvas(
  page: PDFPageProxy,
  scale: number,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get a 2D canvas context in this browser.");
  }
  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
  return canvas;
}

/**
 * Render every page to a small thumbnail (`maxWidth` px wide, default 180).
 * Used by the page grid for delete/extract/reorder previews. Data URLs are
 * PNG so they stay crisp; they're cheap to garbage-collect (no object URLs).
 */
export async function renderThumbnails(
  file: Blob,
  maxWidth = 180,
  password?: string,
): Promise<PageThumbnail[]> {
  const doc = await openPdfDocument(file, password);
  const thumbs: PageThumbnail[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      // Compute a scale that lands the page at ~maxWidth px wide.
      const base = page.getViewport({ scale: 1 });
      const scale = base.width > 0 ? Math.min(2, maxWidth / base.width) : 1;
      const canvas = await pageToCanvas(page, scale);
      thumbs.push({
        page: pageNumber,
        dataUrl: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height,
      });
      page.cleanup();
    }
    return thumbs;
  } finally {
    await doc.loadingTask.destroy();
  }
}

/**
 * Serialize a pdf-lib `PDFDocument` (or @cantoo variant) to a `Blob`. The
 * document is duck-typed as anything exposing `save(): Promise<Uint8Array>`,
 * so this works across pdf-lib and @cantoo/pdf-lib without a hard import.
 */
export async function pdfDocToBlob(
  doc: { save: () => Promise<Uint8Array> },
): Promise<Blob> {
  const bytes = await doc.save();
  // Copy into a standalone ArrayBuffer so BlobPart typing is exact and the
  // blob never references a detached/pooled WASM buffer.
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

/** Convenience: read a canvas as a Blob of the given type/quality. */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`This browser could not encode the page as ${type}.`));
      },
      type,
      quality,
    );
  });
}
