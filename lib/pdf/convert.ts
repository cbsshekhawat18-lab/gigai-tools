/**
 * GigAI Tools, PDF conversions (images ⇄ PDF) and honest browser compression.
 *
 * Runs client-side; pdf-lib, pdf.js and the @jsquash JPEG codec are all
 * dynamic-imported. `imagesToPdf` embeds JPG/PNG images at their native
 * resolution. `pdfToImages` rasterises pages via pdf.js. `compressPdf`
 * re-rasterises pages and re-encodes them as JPEG, a genuine, if lossy,
 * in-browser size reduction (we never claim server-grade structural
 * optimisation we can't do in the browser).
 */

import { loadPdfjs, openPdfDocument, pageToCanvas, pdfDocToBlob, withPdfAssets } from "./core";
import type { NamedBlob, PdfInput, ProgressFn } from "./types";
import { changeExtension, namedBlob } from "./types";

/** Standard page geometries (points; 1pt = 1/72"). */
const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
} as const;

export type ImagesToPdfOptions = {
  /** Page size, or "fit" to make each page match its image's pixel size. */
  pageSize?: keyof typeof PAGE_SIZES | "fit";
  orientation?: "portrait" | "landscape";
  /** Uniform margin in points around each image (ignored for "fit"). */
  margin?: number;
  /** Output filename (defaults to "images.pdf"). */
  fileName?: string;
};

/** Read a File/Blob as a Uint8Array for embedding. */
async function bytesOf(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Combine JPG/PNG images into a single PDF, one image per page. PNG keeps
 * transparency (composited on white by viewers); JPG stays JPG. Unsupported
 * image types are converted to PNG via canvas first so the call never fails.
 */
export async function imagesToPdf(
  files: PdfInput[],
  opts: ImagesToPdfOptions = {},
): Promise<NamedBlob> {
  if (files.length === 0) throw new Error("Add at least one image.");
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();

  const margin = Math.max(0, opts.margin ?? 0);
  const sizeKey = opts.pageSize ?? "A4";

  for (const input of files) {
    const type = input.file.type;
    let bytes: Uint8Array;
    let embed: "jpg" | "png";

    if (type === "image/jpeg" || type === "image/jpg") {
      bytes = await bytesOf(input.file);
      embed = "jpg";
    } else if (type === "image/png") {
      bytes = await bytesOf(input.file);
      embed = "png";
    } else {
      // Re-encode anything else (webp, gif, bmp…) to PNG through a canvas.
      bytes = await imageToPngBytes(input.file);
      embed = "png";
    }

    const image =
      embed === "jpg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);

    if (sizeKey === "fit") {
      const page = doc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      continue;
    }

    const base = PAGE_SIZES[sizeKey];
    const landscape = opts.orientation === "landscape";
    const pageW = landscape ? base.height : base.width;
    const pageH = landscape ? base.width : base.height;
    const page = doc.addPage([pageW, pageH]);

    // Scale image to fit inside the page minus margins, preserving aspect.
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;
    const scale = Math.min(availW / image.width, availH / image.height, 1) || 1;
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    page.drawImage(image, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  return namedBlob(opts.fileName ?? "images.pdf", await pdfDocToBlob(doc));
}

/** Draw any browser-decodable image onto a canvas and return PNG bytes. */
async function imageToPngBytes(file: Blob): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get a 2D canvas context in this browser.");
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not read this image."))),
        "image/png",
      ),
    );
    return bytesOf(blob);
  } finally {
    bitmap.close();
  }
}

export type PdfToImagesOptions = {
  format?: "image/png" | "image/jpeg";
  /** Render scale; higher = sharper & larger. Default 2 (≈150 DPI). */
  scale?: number;
  /** JPEG quality 0–1 (ignored for PNG). */
  quality?: number;
  /** 1-based pages to render; omit for all pages. */
  pages?: number[];
  password?: string;
  onProgress?: ProgressFn;
};

/**
 * Rasterise PDF pages to images. PNG uses `canvas.toBlob`; JPEG is encoded via
 * the @jsquash MozJPEG codec for smaller, higher-quality output than the
 * browser's built-in JPEG encoder (with a canvas fallback if the codec fails).
 */
export async function pdfToImages(
  input: PdfInput,
  opts: PdfToImagesOptions = {},
): Promise<NamedBlob[]> {
  const format = opts.format ?? "image/png";
  const scale = opts.scale ?? 2;
  const quality = opts.quality ?? 0.9;

  const doc = await openPdfDocument(input.file, opts.password);
  try {
    const total = doc.numPages;
    const targets =
      opts.pages && opts.pages.length > 0
        ? opts.pages.filter((p) => p >= 1 && p <= total)
        : Array.from({ length: total }, (_, i) => i + 1);
    if (targets.length === 0) throw new Error("No valid pages selected to convert.");

    const base = input.name.replace(/\.pdf$/i, "");
    const pad = String(total).length;
    const out: NamedBlob[] = [];

    for (let i = 0; i < targets.length; i += 1) {
      const pageNumber = targets[i]!;
      const page = await doc.getPage(pageNumber);
      const canvas = await pageToCanvas(page, scale);
      page.cleanup();

      const ext = format === "image/jpeg" ? "jpg" : "png";
      const name = `${base}-page-${String(pageNumber).padStart(pad, "0")}.${ext}`;
      const blob =
        format === "image/jpeg"
          ? await canvasToJpeg(canvas, quality)
          : await canvasToPng(canvas);
      out.push(namedBlob(name, blob));

      opts.onProgress?.((i + 1) / targets.length, `Rendering page ${pageNumber} of ${targets.length}`);
    }
    return out;
  } finally {
    await doc.loadingTask.destroy();
  }
}

/** PNG via the browser encoder (lossless, exact colors). */
function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode the page as PNG."))),
      "image/png",
    ),
  );
}

/** JPEG via @jsquash MozJPEG, falling back to the browser encoder. */
async function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D canvas context in this browser.");
  try {
    const { default: encode } = await import("@jsquash/jpeg/encode");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const buffer = await encode(imageData, { quality: Math.round(quality * 100) });
    return new Blob([buffer], { type: "image/jpeg" });
  } catch {
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode the page as JPEG."))),
        "image/jpeg",
        quality,
      ),
    );
  }
}

export type CompressPdfOptions = {
  /**
   * Compression level → JPEG quality + render scale. "low" keeps quality high
   * (smaller savings); "high" is aggressive. Default "medium".
   */
  level?: "low" | "medium" | "high";
  password?: string;
  onProgress?: ProgressFn;
};

const COMPRESSION_PROFILES = {
  low: { scale: 2, quality: 0.82 },
  medium: { scale: 1.5, quality: 0.72 },
  high: { scale: 1.15, quality: 0.6 },
} as const;

/**
 * Honest in-browser PDF compression: each page is rasterised and re-embedded as
 * a JPEG, which reliably shrinks image-heavy or scanned PDFs. This flattens
 * vector text into an image (so text is no longer selectable), a real
 * trade-off we surface in the UI rather than pretending we do lossless
 * structural optimisation. If the re-encoded result is somehow larger than the
 * original (e.g. a pure-text PDF), the ORIGINAL bytes are returned unchanged.
 */
export async function compressPdf(
  input: PdfInput,
  opts: CompressPdfOptions = {},
): Promise<NamedBlob> {
  const profile = COMPRESSION_PROFILES[opts.level ?? "medium"];
  const originalBytes = await bytesOf(input.file);

  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument(
    withPdfAssets({ data: originalBytes.slice(), password: opts.password }),
  ).promise;

  try {
    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();
    const total = doc.numPages;

    for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const canvas = await pageToCanvas(page, profile.scale);
      page.cleanup();

      const jpeg = await canvasToJpeg(canvas, profile.quality);
      const jpegBytes = await bytesOf(jpeg);
      const image = await out.embedJpg(jpegBytes);

      // Keep the original page dimensions (points) so layout is unchanged.
      const viewport = page.getViewport({ scale: 1 });
      const pdfPage = out.addPage([viewport.width, viewport.height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });

      opts.onProgress?.(pageNumber / total, `Compressing page ${pageNumber} of ${total}`);
    }

    const compressedBlob = await pdfDocToBlob(out);
    const base = input.name.replace(/\.pdf$/i, "");
    const name = `${base}-compressed.pdf`;

    // Never hand back a bigger file than we received.
    if (compressedBlob.size >= originalBytes.byteLength) {
      const copy = originalBytes.slice();
      return namedBlob(
        changeExtension(input.name, "pdf"),
        new Blob([copy], { type: "application/pdf" }),
      );
    }
    return namedBlob(name, compressedBlob);
  } finally {
    await doc.loadingTask.destroy();
  }
}
