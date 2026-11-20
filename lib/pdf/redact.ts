/**
 * GigAI Tools, TRUE redaction.
 *
 * The reason this file exists at all: the common way to "redact" a PDF is to
 * draw a black rectangle over the text. That removes nothing. The characters
 * are still in the content stream, so anyone can select the text underneath,
 * run `pdftotext`, or simply delete the annotation, and this is the single
 * most common way confidential material leaks from a document.
 *
 * So this does the only thing that is honestly redaction in a browser:
 *
 *   1. Render each page to a canvas (the text becomes pixels).
 *   2. Paint opaque boxes over the marked regions on that canvas.
 *   3. Build a NEW PDF from those images and discard the original page objects.
 *
 * The result contains no text layer at all: the redacted words are not merely
 * covered, they no longer exist in the file. The unavoidable trade-off is that
 * NO text on a redacted page stays selectable or searchable, and file size
 * grows. Both are stated plainly in the UI rather than buried, because a user
 * who doesn't understand that is a user who might reach for Crop instead.
 *
 * @see lib/pdf/edit.ts `cropPdf`; hides content, deliberately does NOT do this.
 */

import { loadPdfjs, pageToCanvas, withPdfAssets, normalizePdfError } from "./core";
import type { NamedBlob, PdfInput, ProgressFn } from "./types";
import { namedBlob } from "./types";

/** A rectangle to destroy, in fractions (0–1) of the page's own size. */
export interface RedactionBox {
  page: number; // 1-based
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RedactOptions {
  /**
   * Render scale. 2 ≈ 150 DPI, which keeps ordinary documents readable. Higher
   * values look better and cost size; this is the single biggest lever on the
   * output's weight, so the UI exposes it.
   */
  scale?: number;
  /** Fill color for the boxes. Black is conventional and unambiguous. */
  color?: string;
  /** JPEG quality 0–1. JPEG is used because a rasterised page is photographic. */
  quality?: number;
  onProgress?: ProgressFn;
  password?: string;
}

export interface RedactResult {
  file: NamedBlob;
  /** Pages that were rasterised (every page, since a mixed file is a trap). */
  pagesRasterised: number;
  boxesApplied: number;
}

/**
 * Apply redactions and return a PDF whose redacted content is genuinely gone.
 *
 * Every page is rasterised, not just the marked ones. That is deliberate: a
 * document where page 3 has no selectable text and page 4 does is a document
 * that quietly tells a reader which page was censored, and it makes "is this
 * file safe to send?" impossible to answer at a glance. Uniform output is the
 * honest, safe default.
 */
export async function redactPdf(
  input: PdfInput,
  boxes: RedactionBox[],
  opts: RedactOptions = {},
): Promise<RedactResult> {
  if (boxes.length === 0) {
    throw new Error("Mark at least one area to redact, drag a box over the text you need removed.");
  }

  const scale = opts.scale ?? 2;
  const color = opts.color ?? "#000000";
  const quality = opts.quality ?? 0.92;

  try {
    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await input.file.arrayBuffer());
    const doc = await pdfjs.getDocument(
      withPdfAssets({ data, password: opts.password }),
    ).promise;

    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();

    const total = doc.numPages;
    let applied = 0;

    try {
      for (let n = 1; n <= total; n++) {
        opts.onProgress?.((n - 1) / total, `Redacting page ${n} of ${total}`);

        const page_ = await doc.getPage(n);
        const canvas = await pageToCanvas(page_, scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("This browser wouldn't provide a canvas to render onto.");

        ctx.fillStyle = color;
        for (const box of boxes) {
          if (box.page !== n) continue;
          // Fractions → device pixels on THIS page's canvas, so a box drawn on
          // a preview at one zoom lands identically at render scale.
          ctx.fillRect(
            Math.floor(box.x * canvas.width),
            Math.floor(box.y * canvas.height),
            Math.ceil(box.w * canvas.width),
            Math.ceil(box.h * canvas.height),
          );
          applied++;
        }

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", quality),
        );
        if (!blob) throw new Error(`Page ${n} could not be encoded after redaction.`);

        const img = await out.embedJpg(await blob.arrayBuffer());
        const page = out.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

        // Free the canvas and the page eagerly; a long document otherwise
        // holds every page's bitmap alive at once and falls over on a
        // low-memory device.
        canvas.width = 0;
        canvas.height = 0;
        page_.cleanup();
      }
    } finally {
      await doc.destroy();
    }

    opts.onProgress?.(1, "Writing the redacted file");
    const bytes = await out.save();
    const file = namedBlob(
      input.name.replace(/\.pdf$/i, "") + "-redacted.pdf",
      new Blob([bytes as BlobPart], { type: "application/pdf" }),
    );

    return { file, pagesRasterised: total, boxesApplied: applied };
  } catch (err) {
    throw normalizePdfError(err);
  }
}
