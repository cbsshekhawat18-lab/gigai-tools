/**
 * GigAI Tools, page-geometry and structural-repair operations.
 *
 * Sits alongside `ops.ts` (which owns page *selection*, merge, split, extract,
 * reorder). This module owns edits to the page BOX and to the file's structure.
 * Like the rest of the engine it runs entirely client-side and dynamic-imports
 * pdf-lib so the payload stays code-split.
 */

import { pdfDocToBlob } from "./core";
import type { NamedBlob, PdfInput } from "./types";
import { changeExtension, namedBlob } from "./types";

async function loadPdfLib() {
  return import("pdf-lib");
}

/* ── Crop ─────────────────────────────────────────────────────────────────── */

/**
 * Margins to trim from each edge, as a FRACTION of that page's own size
 * (0–0.49). Fractions rather than points so one setting applies sensibly to a
 * mixed-size document, an A4 page and a US Letter page both lose "5% off the
 * top" rather than a fixed 20pt that means different things on each.
 */
export interface CropMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_CROP: CropMargins = { top: 0, right: 0, bottom: 0, left: 0 };

export interface CropOptions {
  /** 1-based pages to crop; omit for every page. */
  pages?: number[];
  password?: string;
}

/**
 * Crop pages by setting the CropBox: the box a viewer actually displays.
 *
 * IMPORTANT and stated in the UI: this hides content, it does not delete it.
 * The underlying page objects are untouched, so anything outside the new box
 * is still in the file and can be recovered by resetting the box. That makes
 * crop the wrong tool for removing sensitive material; Redact PDF exists for
 * that and genuinely destroys the content.
 *
 * MediaBox is left alone deliberately: rewriting it too would break pages whose
 * MediaBox origin isn't (0,0), which is common in print-ready PDFs.
 */
export async function cropPdf(
  input: PdfInput,
  margins: CropMargins,
  opts: CropOptions = {},
): Promise<NamedBlob> {
  for (const [edge, value] of Object.entries(margins)) {
    if (!Number.isFinite(value) || value < 0 || value >= 0.5) {
      throw new Error(
        `The ${edge} margin must be between 0% and 49%. ${Math.round(value * 100)}% would leave nothing of the page.`,
      );
    }
  }
  if (margins.left + margins.right >= 1 || margins.top + margins.bottom >= 1) {
    throw new Error("Those margins would crop away the whole page. Reduce them and try again.");
  }

  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.load(await input.file.arrayBuffer(), {
    ignoreEncryption: true,
    password: opts.password,
  } as Parameters<typeof PDFDocument.load>[1]);

  const total = doc.getPageCount();
  const targets = opts.pages?.length
    ? opts.pages
    : Array.from({ length: total }, (_, i) => i + 1);

  for (const n of targets) {
    if (!Number.isInteger(n) || n < 1 || n > total) {
      throw new Error(`Page ${n} is out of range (this PDF has ${total} page${total === 1 ? "" : "s"}).`);
    }
    const page = doc.getPage(n - 1);
    // Read the CURRENT crop box, so cropping twice compounds predictably
    // instead of silently measuring against the original media box again.
    const box = page.getCropBox();
    page.setCropBox(
      box.x + box.width * margins.left,
      box.y + box.height * margins.bottom,
      box.width * (1 - margins.left - margins.right),
      box.height * (1 - margins.top - margins.bottom),
    );
  }

  const blob = await pdfDocToBlob(doc);
  return namedBlob(changeExtension(input.name, "pdf").replace(/\.pdf$/i, "-cropped.pdf"), blob);
}

/* ── Repair ───────────────────────────────────────────────────────────────── */

export interface RepairReport {
  /** Pages the rebuilt document contains. */
  pages: number;
  /** Byte size before and after. */
  before: number;
  after: number;
  /** True when the original refused a strict parse and needed the lenient one. */
  neededLenientParse: boolean;
}

export interface RepairResult {
  file: NamedBlob;
  report: RepairReport;
}

/**
 * Best-effort structural repair: parse the file as leniently as pdf-lib allows,
 * then write a brand-new document from what survived.
 *
 * BE HONEST ABOUT WHAT THIS IS. It rebuilds the cross-reference table, object
 * offsets and trailer, which is what's actually broken in the overwhelming
 * majority of "this PDF won't open" files, usually from an interrupted download
 * or a bad export. It CANNOT invent content that isn't in the bytes: if pages
 * were truncated away, they stay gone, and no amount of parsing recovers them.
 * The UI says exactly this, and the report shows the page count so the user can
 * see for themselves whether anything is missing rather than assuming a green
 * tick means "fully recovered".
 */
export async function repairPdf(input: PdfInput): Promise<RepairResult> {
  const { PDFDocument } = await loadPdfLib();
  const bytes = await input.file.arrayBuffer();

  let neededLenientParse = false;
  let doc: Awaited<ReturnType<typeof PDFDocument.load>>;

  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  } catch {
    neededLenientParse = true;
    try {
      doc = await PDFDocument.load(bytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      });
    } catch {
      throw new Error(
        "This file is damaged beyond what a rebuild can recover: the PDF structure couldn't be read at all. If you have the original source document, re-exporting it will give a better result than any repair.",
      );
    }
  }

  const pages = doc.getPageCount();
  if (pages === 0) {
    throw new Error(
      "The file parsed, but contains no pages to recover. That usually means the download was truncated before any page data arrived.",
    );
  }

  const blob = await pdfDocToBlob(doc);
  return {
    file: namedBlob(input.name.replace(/\.pdf$/i, "") + "-repaired.pdf", blob),
    report: {
      pages,
      before: input.file.size,
      after: blob.size,
      neededLenientParse,
    },
  };
}
