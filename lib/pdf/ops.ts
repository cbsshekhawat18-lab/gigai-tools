/**
 * GigAI Tools, PDF page operations (pure structural edits via pdf-lib).
 *
 * All functions run client-side and dynamic-import pdf-lib so its payload is
 * code-split. Page numbers are **1-based** and every function guards its input
 * so an out-of-range page produces a clear error instead of a silent no-op or
 * a corrupt file. Copying pages between documents preserves their exact content
 * (pdf-lib deep-copies the page objects).
 */

import { pdfDocToBlob } from "./core";
import type { NamedBlob, PageRange, PdfInput, RotationSpec } from "./types";
import { changeExtension, namedBlob } from "./types";

/** Lazily import pdf-lib once. */
async function loadPdfLib() {
  return import("pdf-lib");
}

/** Read a PdfInput's bytes for pdf-lib. */
async function inputBytes(input: PdfInput): Promise<ArrayBuffer> {
  return input.file.arrayBuffer();
}

/**
 * Validate & de-duplicate a list of 1-based page numbers against `total`.
 * Preserves the caller's order (important for reorder/extract). Throws if any
 * page is out of range so we never emit a mangled document.
 */
function normalizePages(pages: number[], total: number, label = "page"): number[] {
  if (pages.length === 0) {
    throw new Error(`Select at least one ${label}.`);
  }
  const seen = new Set<number>();
  const out: number[] = [];
  for (const p of pages) {
    if (!Number.isInteger(p) || p < 1 || p > total) {
      throw new Error(
        `${label[0]?.toUpperCase()}${label.slice(1)} ${p} is out of range (this PDF has ${total} page${total === 1 ? "" : "s"}).`,
      );
    }
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

/**
 * Merge several PDFs into one, in the order given. Empty inputs are rejected;
 * a single input is still copied (so the output is always a fresh document).
 */
export async function mergePdfs(files: PdfInput[]): Promise<NamedBlob> {
  if (files.length === 0) {
    throw new Error("Add at least one PDF to merge.");
  }
  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();

  for (const input of files) {
    let src;
    try {
      src = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
    } catch {
      throw new Error(`Couldn't read "${input.name}". It may be corrupt or password-protected.`);
    }
    const copied = await merged.copyPages(src, src.getPageIndices());
    for (const page of copied) merged.addPage(page);
  }

  const blob = await pdfDocToBlob(merged);
  const name = files.length === 1 ? changeExtension(files[0]!.name, "pdf") : "merged.pdf";
  return namedBlob(name, blob);
}

/** Split a PDF into one single-page PDF per page. */
export async function splitToPages(input: PdfInput): Promise<NamedBlob[]> {
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
  const total = src.getPageCount();
  if (total === 0) throw new Error("This PDF has no pages to split.");

  const out: NamedBlob[] = [];
  const pad = String(total).length;
  for (let i = 0; i < total; i += 1) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(src, [i]);
    doc.addPage(page);
    const blob = await pdfDocToBlob(doc);
    const base = input.name.replace(/\.pdf$/i, "");
    out.push(namedBlob(`${base}-page-${String(i + 1).padStart(pad, "0")}.pdf`, blob));
  }
  return out;
}

/**
 * Split a PDF into several PDFs, one per inclusive 1-based `PageRange`.
 * Ranges may overlap or be out of order, each becomes its own output file.
 */
export async function splitByRanges(
  input: PdfInput,
  ranges: PageRange[],
): Promise<NamedBlob[]> {
  if (ranges.length === 0) throw new Error("Add at least one page range.");
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
  const total = src.getPageCount();

  const out: NamedBlob[] = [];
  const base = input.name.replace(/\.pdf$/i, "");
  for (const range of ranges) {
    const from = Math.min(range.from, range.to);
    const to = Math.max(range.from, range.to);
    if (from < 1 || to > total) {
      throw new Error(
        `Range ${range.from}-${range.to} is out of bounds (this PDF has ${total} page${total === 1 ? "" : "s"}).`,
      );
    }
    const indices: number[] = [];
    for (let p = from; p <= to; p += 1) indices.push(p - 1);
    const doc = await PDFDocument.create();
    const copied = await doc.copyPages(src, indices);
    for (const page of copied) doc.addPage(page);
    out.push(namedBlob(`${base}-pages-${from}-${to}.pdf`, await pdfDocToBlob(doc)));
  }
  return out;
}

/** Extract the given 1-based pages into a single new PDF (order preserved). */
export async function extractPages(
  input: PdfInput,
  pages: number[],
): Promise<NamedBlob> {
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
  const total = src.getPageCount();
  const wanted = normalizePages(pages, total);

  const doc = await PDFDocument.create();
  const copied = await doc.copyPages(src, wanted.map((p) => p - 1));
  for (const page of copied) doc.addPage(page);

  const base = input.name.replace(/\.pdf$/i, "");
  return namedBlob(`${base}-extracted.pdf`, await pdfDocToBlob(doc));
}

/** Delete the given 1-based pages, keeping the rest in their original order. */
export async function deletePages(
  input: PdfInput,
  pages: number[],
): Promise<NamedBlob> {
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
  const total = src.getPageCount();
  const remove = new Set(normalizePages(pages, total));
  if (remove.size >= total) {
    throw new Error("You can't delete every page: at least one must remain.");
  }

  const keep: number[] = [];
  for (let p = 1; p <= total; p += 1) if (!remove.has(p)) keep.push(p - 1);

  const doc = await PDFDocument.create();
  const copied = await doc.copyPages(src, keep);
  for (const page of copied) doc.addPage(page);

  const base = input.name.replace(/\.pdf$/i, "");
  return namedBlob(`${base}-edited.pdf`, await pdfDocToBlob(doc));
}

/**
 * Reorder pages to exactly `order` (a permutation of 1..total). Every existing
 * page must appear exactly once, so we validate length and completeness.
 */
export async function reorderPages(
  input: PdfInput,
  order: number[],
): Promise<NamedBlob> {
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
  const total = src.getPageCount();
  const seq = normalizePages(order, total);
  if (seq.length !== total) {
    throw new Error("The new order must include every page exactly once.");
  }

  const doc = await PDFDocument.create();
  const copied = await doc.copyPages(src, seq.map((p) => p - 1));
  for (const page of copied) doc.addPage(page);

  const base = input.name.replace(/\.pdf$/i, "");
  return namedBlob(`${base}-reordered.pdf`, await pdfDocToBlob(doc));
}

/**
 * Rotate pages. `spec` is either a single number (apply to ALL pages) or a list
 * of per-page `RotationSpec`s. Degrees are added to each page's current
 * rotation and normalised to 0/90/180/270 (clockwise).
 */
export async function rotatePages(
  input: PdfInput,
  spec: number | RotationSpec[],
): Promise<NamedBlob> {
  const { PDFDocument, degrees } = await loadPdfLib();
  const doc = await PDFDocument.load(await inputBytes(input), { ignoreEncryption: true });
  const total = doc.getPageCount();
  const allPages = doc.getPages();

  /** Normalise any degree value to one of 0/90/180/270. */
  const norm = (deg: number) => ((Math.round(deg / 90) * 90) % 360 + 360) % 360;

  if (typeof spec === "number") {
    for (const page of allPages) {
      page.setRotation(degrees(norm(page.getRotation().angle + spec)));
    }
  } else {
    for (const { page, degrees: deg } of spec) {
      if (page < 1 || page > total) {
        throw new Error(`Page ${page} is out of range (this PDF has ${total}).`);
      }
      const target = allPages[page - 1]!;
      target.setRotation(degrees(norm(target.getRotation().angle + deg)));
    }
  }

  const base = input.name.replace(/\.pdf$/i, "");
  return namedBlob(`${base}-rotated.pdf`, await pdfDocToBlob(doc));
}
