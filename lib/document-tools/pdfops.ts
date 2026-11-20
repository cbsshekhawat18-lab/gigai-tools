/**
 * GigAI Tools, higher-level PDF page operations for the document toolkit.
 *
 * These are thin wrappers that REUSE the existing PDF engine (`lib/pdf/*`) and
 * pdf-lib. The structural primitives (merge/split/rotate/extract/delete/reorder)
 * and password protect/unlock already exist and are NOT reimplemented here; we
 * re-export them so document tools have one import surface. This module only adds
 * the annotation-style operations that weren't already in `lib/pdf`:
 *  - addPageNumbers: draw "Page X of Y" (or a custom format) on every page
 *  - addWatermark, tiled/diagonal text (or an image) behind/over content
 *  - addSignature, stamp a signature image or typed name at a position
 *  - readMetadata / writeMetadata, the document info dictionary
 *  - organizePages, reorder + rotate + delete in a single pass
 *
 * All page numbers are 1-based. pdf-lib is dynamic-imported. Nothing is uploaded.
 */

import { pdfDocToBlob } from "@/lib/pdf/core";
import type { NamedBlob, PdfInput } from "@/lib/pdf/types";
import { namedBlob } from "@/lib/pdf/types";
import { type Result, fail, message, ok } from "./shared";

/* ── Re-exports: reuse the existing engine, never duplicate it ────────────── */

export {
  mergePdfs,
  splitToPages,
  splitByRanges,
  extractPages,
  deletePages,
  reorderPages,
  rotatePages,
} from "@/lib/pdf/ops";
export { protectPdf, unlockPdf, isEncrypted } from "@/lib/pdf/security";
export type { PdfPermissions, ProtectOptions } from "@/lib/pdf/security";
export { pdfDocToBlob } from "@/lib/pdf/core";
export type { NamedBlob, PdfInput } from "@/lib/pdf/types";
export { namedBlob, toPdfInput } from "@/lib/pdf/types";

/** Lazily import pdf-lib once (matches the pattern in lib/pdf/ops). */
async function loadPdfLib() {
  return import("pdf-lib");
}

/** Read a PdfInput's bytes for pdf-lib. */
async function inputBytes(input: PdfInput): Promise<ArrayBuffer> {
  return input.file.arrayBuffer();
}

/** Base name without the .pdf extension, for deriving output filenames. */
function baseName(input: PdfInput): string {
  return input.name.replace(/\.pdf$/i, "");
}

/* ── Page numbers ─────────────────────────────────────────────────────────── */

export type PagePosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export interface PageNumberOptions {
  position?: PagePosition;
  /**
   * Label format. `{n}` → current page, `{total}` → page count. Default
   * "Page {n} of {total}". A plain "{n}" gives bare numbers.
   */
  format?: string;
  /** Number to assign the first page (default 1). */
  start?: number;
  /** Font size in points. Default 10. */
  fontSize?: number;
  /** Margin from the page edge in points. Default 28. */
  margin?: number;
  /** Skip the first N pages (e.g. a cover). Default 0. */
  skipFirst?: number;
}

/**
 * Draw a page-number label on every page (except any skipped leading pages).
 * Uses pdf-lib's built-in Helvetica so no font embedding is needed.
 */
export async function addPageNumbers(
  input: PdfInput,
  opts: PageNumberOptions = {},
): Promise<Result<NamedBlob>> {
  try {
    const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
    const doc = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;

    const fmt = opts.format ?? "Page {n} of {total}";
    const size = opts.fontSize ?? 10;
    const margin = opts.margin ?? 28;
    const start = opts.start ?? 1;
    const skip = Math.max(0, opts.skipFirst ?? 0);
    const position = opts.position ?? "bottom-center";
    const shown = total - skip;

    for (let i = skip; i < total; i += 1) {
      const page = pages[i]!;
      const label = fmt
        .replace(/\{n\}/g, String(start + (i - skip)))
        .replace(/\{total\}/g, String(shown));
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(label, size);

      const isTop = position.startsWith("top");
      const y = isTop ? height - margin - size : margin;
      let x: number;
      if (position.endsWith("left")) x = margin;
      else if (position.endsWith("right")) x = width - margin - textWidth;
      else x = (width - textWidth) / 2;

      page.drawText(label, { x, y, size, font, color: rgb(0.15, 0.15, 0.15) });
    }

    return ok(namedBlob(`${baseName(input)}-numbered.pdf`, await pdfDocToBlob(doc)));
  } catch (err) {
    return fail(message(err));
  }
}

/* ── Watermark ────────────────────────────────────────────────────────────── */

export interface WatermarkOptions {
  /** Watermark text (ignored when `image` is given). */
  text?: string;
  /** PNG/JPG bytes to stamp instead of text. */
  image?: Uint8Array;
  imageType?: "png" | "jpg";
  /** 0–1 opacity. Default 0.2. */
  opacity?: number;
  /** Rotation in degrees (counter-clockwise). Default 45. */
  angle?: number;
  /** Tile the watermark across the whole page. Default false (single centred). */
  tile?: boolean;
  /** Text size in points (text mode). Default 48. */
  fontSize?: number;
  /** Fraction of page width the image spans (image mode). Default 0.5. */
  imageScale?: number;
}

/**
 * Overlay a repeating or centred text/image watermark on every page. Text uses
 * pdf-lib's Helvetica-Bold; images accept PNG or JPG bytes. Opacity keeps the
 * underlying content legible.
 */
export async function addWatermark(
  input: PdfInput,
  opts: WatermarkOptions = {},
): Promise<Result<NamedBlob>> {
  try {
    if (!opts.text && !opts.image) {
      return fail("Provide watermark text or an image.");
    }
    const { PDFDocument, StandardFonts, degrees, rgb } = await loadPdfLib();
    const doc = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
    const opacity = clamp(opts.opacity ?? 0.2, 0, 1);
    const angle = opts.angle ?? 45;
    const tile = opts.tile ?? false;

    const font = opts.text ? await doc.embedFont(StandardFonts.HelveticaBold) : null;
    const size = opts.fontSize ?? 48;
    const image =
      opts.image != null
        ? opts.imageType === "jpg"
          ? await doc.embedJpg(opts.image)
          : await doc.embedPng(opts.image)
        : null;

    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();

      const stampAt = (cx: number, cy: number) => {
        if (font && opts.text) {
          const tw = font.widthOfTextAtSize(opts.text, size);
          page.drawText(opts.text, {
            x: cx - tw / 2,
            y: cy - size / 2,
            size,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity,
            rotate: degrees(angle),
          });
        } else if (image) {
          const w = width * (opts.imageScale ?? 0.5);
          const h = (image.height / image.width) * w;
          page.drawImage(image, {
            x: cx - w / 2,
            y: cy - h / 2,
            width: w,
            height: h,
            opacity,
            rotate: degrees(angle),
          });
        }
      };

      if (tile) {
        const stepX = width / 3;
        const stepY = height / 4;
        for (let gx = stepX / 2; gx < width; gx += stepX) {
          for (let gy = stepY / 2; gy < height; gy += stepY) stampAt(gx, gy);
        }
      } else {
        stampAt(width / 2, height / 2);
      }
    }

    return ok(namedBlob(`${baseName(input)}-watermarked.pdf`, await pdfDocToBlob(doc)));
  } catch (err) {
    return fail(message(err));
  }
}

/* ── Signature / stamp ────────────────────────────────────────────────────── */

export interface SignatureOptions {
  /** Signature image bytes (PNG recommended for transparency). */
  image?: Uint8Array;
  imageType?: "png" | "jpg";
  /** Typed signature text (used when no image is provided). */
  text?: string;
  /** 1-based page to stamp. Default: the last page. */
  page?: number;
  /**
   * Position of the signature's bottom-left corner, as fractions of page size
   * from the bottom-left origin. Default { x: 0.62, y: 0.08 }.
   */
  x?: number;
  y?: number;
  /** Image width as a fraction of page width (image mode). Default 0.25. */
  size?: number;
  /** Font size in points (text mode). Default 24. */
  fontSize?: number;
}

/**
 * Stamp a signature onto one page: either an image (PNG/JPG) sized to `size` ×
 * page width, or typed `text` in an italic-style font. Position is given as
 * bottom-left-origin fractions so it's resolution-independent.
 */
export async function addSignature(
  input: PdfInput,
  opts: SignatureOptions = {},
): Promise<Result<NamedBlob>> {
  try {
    if (!opts.image && !opts.text) {
      return fail("Provide a signature image or typed text.");
    }
    const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
    const doc = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
    const pages = doc.getPages();
    const total = pages.length;
    const pageIndex = (opts.page ?? total) - 1;
    if (pageIndex < 0 || pageIndex >= total) {
      return fail(`Page ${opts.page} is out of range (this PDF has ${total}).`);
    }
    const page = pages[pageIndex]!;
    const { width, height } = page.getSize();
    const fx = clamp(opts.x ?? 0.62, 0, 1);
    const fy = clamp(opts.y ?? 0.08, 0, 1);
    const originX = fx * width;
    const originY = fy * height;

    if (opts.image) {
      const image =
        opts.imageType === "jpg"
          ? await doc.embedJpg(opts.image)
          : await doc.embedPng(opts.image);
      const w = width * (opts.size ?? 0.25);
      const h = (image.height / image.width) * w;
      page.drawImage(image, { x: originX, y: originY, width: w, height: h });
    } else if (opts.text) {
      const font = await doc.embedFont(StandardFonts.HelveticaOblique);
      const size = opts.fontSize ?? 24;
      page.drawText(opts.text, {
        x: originX,
        y: originY,
        size,
        font,
        color: rgb(0.05, 0.1, 0.35),
      });
    }

    return ok(namedBlob(`${baseName(input)}-signed.pdf`, await pdfDocToBlob(doc)));
  } catch (err) {
    return fail(message(err));
  }
}

/* ── Metadata ─────────────────────────────────────────────────────────────── */

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount: number;
}

/** Read the document info dictionary (title/author/etc.) and page count. */
export async function readMetadata(input: PdfInput): Promise<Result<PdfMetadata>> {
  try {
    const { PDFDocument } = await loadPdfLib();
    const doc = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
    const asIso = (d: Date | undefined) => {
      try {
        return d ? d.toISOString() : undefined;
      } catch {
        return undefined;
      }
    };
    return ok({
      title: doc.getTitle() ?? "",
      author: doc.getAuthor() ?? "",
      subject: doc.getSubject() ?? "",
      keywords: (doc.getKeywords() ?? "") as string,
      creator: doc.getCreator() ?? "",
      producer: doc.getProducer() ?? "",
      creationDate: asIso(doc.getCreationDate()),
      modificationDate: asIso(doc.getModificationDate()),
      pageCount: doc.getPageCount(),
    });
  } catch (err) {
    return fail(message(err));
  }
}

export interface WriteMetadataOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string; // comma-separated
  creator?: string;
  producer?: string;
}

/**
 * Write selected fields into the document info dictionary. Only provided fields
 * are changed; others are left untouched. `keywords` is split on commas.
 */
export async function writeMetadata(
  input: PdfInput,
  meta: WriteMetadataOptions,
): Promise<Result<NamedBlob>> {
  try {
    const { PDFDocument } = await loadPdfLib();
    const doc = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
    if (meta.title != null) doc.setTitle(meta.title);
    if (meta.author != null) doc.setAuthor(meta.author);
    if (meta.subject != null) doc.setSubject(meta.subject);
    if (meta.keywords != null) {
      doc.setKeywords(meta.keywords.split(",").map((k) => k.trim()).filter(Boolean));
    }
    if (meta.creator != null) doc.setCreator(meta.creator);
    if (meta.producer != null) doc.setProducer(meta.producer);
    doc.setModificationDate(new Date());

    return ok(namedBlob(`${baseName(input)}-metadata.pdf`, await pdfDocToBlob(doc)));
  } catch (err) {
    return fail(message(err));
  }
}

/* ── Organize (reorder + rotate + delete in one pass) ─────────────────────── */

export interface OrganizeOptions {
  /**
   * The desired output order as 1-based source page numbers. Pages omitted from
   * `order` are removed. Omit `order` to keep all pages in their current order.
   */
  order?: number[];
  /** Per-page clockwise rotation to ADD, keyed by 1-based SOURCE page number. */
  rotations?: Record<number, number>;
  /** 1-based SOURCE page numbers to delete (applied when `order` is omitted). */
  deletions?: number[];
}

/**
 * Reorder, rotate and delete pages in a single rebuild. This composes on top of
 * pdf-lib rather than chaining the separate engine ops, so the document is only
 * copied once. Rotations are added to each page's existing rotation and
 * normalised to 0/90/180/270.
 */
export async function organizePages(
  input: PdfInput,
  opts: OrganizeOptions = {},
): Promise<Result<NamedBlob>> {
  try {
    const { PDFDocument, degrees } = await loadPdfLib();
    const src = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
    const total = src.getPageCount();

    // Resolve the final 1-based source order.
    let order: number[];
    if (opts.order && opts.order.length > 0) {
      order = opts.order;
    } else {
      const remove = new Set(opts.deletions ?? []);
      order = [];
      for (let p = 1; p <= total; p += 1) if (!remove.has(p)) order.push(p);
    }
    for (const p of order) {
      if (!Number.isInteger(p) || p < 1 || p > total) {
        return fail(`Page ${p} is out of range (this PDF has ${total}).`);
      }
    }
    if (order.length === 0) return fail("The result would have no pages.");

    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, order.map((p) => p - 1));
    const norm = (deg: number) => ((Math.round(deg / 90) * 90) % 360 + 360) % 360;
    copied.forEach((page, i) => {
      out.addPage(page);
      const sourcePage = order[i]!;
      const add = opts.rotations?.[sourcePage];
      if (add) page.setRotation(degrees(norm(page.getRotation().angle + add)));
    });

    return ok(namedBlob(`${baseName(input)}-organized.pdf`, await pdfDocToBlob(out)));
  } catch (err) {
    return fail(message(err));
  }
}

/** Clamp a number into [min, max]. */
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
