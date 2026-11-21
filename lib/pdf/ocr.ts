/**
 * GigAI Tools: in-browser OCR (make scanned PDFs searchable) with tesseract.js.
 *
 * Pipeline, entirely client-side:
 *   1. Rasterise each page with pdf.js.
 *   2. Recognise words + bounding boxes with a tesseract.js worker.
 *   3. Rebuild the PDF with pdf-lib: draw the page image, then overlay an
 *      INVISIBLE text layer (render mode 3) positioned at each word's box so
 *      the text is selectable/searchable but visually identical to the scan.
 *
 * We return both the concatenated plain `text` and the `searchablePdf` blob.
 * tesseract.js, pdf.js and pdf-lib are all dynamic-imported. Progress is
 * reported per page via the optional `onProgress` callback.
 */

import { loadPdfjs, pageToCanvas, pdfDocToBlob, withPdfAssets } from "./core";
import type { NamedBlob, PdfInput, ProgressFn } from "./types";
import { namedBlob } from "./types";

export interface OcrOptions {
  /** Tesseract language code(s), e.g. "eng" or "eng+deu". Default "eng". */
  language?: string;
  /** Render scale for OCR input. Higher = more accurate but slower. Default 2. */
  scale?: number;
  password?: string;
  onProgress?: ProgressFn;
}

export interface OcrResult {
  /** All recognised text, pages separated by a form feed. */
  text: string;
  /** A new PDF with an invisible, selectable text layer over each page. */
  searchablePdf: NamedBlob;
}

/** One recognised word with its pixel-space bounding box (from tesseract). */
interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * OCR a (typically scanned) PDF and return a searchable copy plus its text.
 * The page image is preserved exactly; only an invisible text layer is added.
 */
export async function ocrPdf(input: PdfInput, opts: OcrOptions = {}): Promise<OcrResult> {
  const language = opts.language ?? "eng";
  const scale = opts.scale ?? 2;

  const [{ createWorker }, { PDFDocument, rgb }, pdfjs] = await Promise.all([
    import("tesseract.js"),
    import("pdf-lib"),
    loadPdfjs(),
  ]);

  const srcDoc = await pdfjs.getDocument(
    withPdfAssets({
      data: new Uint8Array(await input.file.arrayBuffer()),
      password: opts.password,
    }),
  ).promise;

  const total = srcDoc.numPages;
  const outDoc = await PDFDocument.create();
  const font = await outDoc.embedFont("Helvetica");
  const textChunks: string[] = [];

  // A single worker recognises every page (initialising per page is costly).
  // The logger surfaces tesseract's own 0..1 progress inside each page so the
  // overall bar advances smoothly, not just in per-page jumps.
  const worker = await createWorker(language, undefined, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        // Blended progress: completed pages + fractional current page.
        const pageBase = (currentPage - 1) / total;
        opts.onProgress?.(
          Math.min(0.999, pageBase + m.progress / total),
          `Reading page ${currentPage} of ${total}`,
        );
      }
    },
  });

  let currentPage = 1;
  try {
    for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
      currentPage = pageNumber;
      const page = await srcDoc.getPage(pageNumber);
      const canvas = await pageToCanvas(page, scale);
      page.cleanup();

      // Request block-level output: tesseract.js v6+ no longer returns a
      // top-level `words` array, and `blocks` (which nests the words) is OFF by
      // default: without this flag we'd get zero word boxes and an empty,
      // useless text layer.
      const { data } = await worker.recognize(
        canvas,
        {},
        { blocks: true, text: true },
      );
      const words: OcrWord[] = extractWords(data);
      textChunks.push(typeof data.text === "string" ? data.text : "");

      // Draw the page image at its native (points) size.
      const viewport = page.getViewport({ scale: 1 });
      const pageW = viewport.width;
      const pageH = viewport.height;
      const jpegBytes = await canvasToJpegBytes(canvas);
      const image = await outDoc.embedJpg(jpegBytes);
      const pdfPage = outDoc.addPage([pageW, pageH]);
      pdfPage.drawImage(image, { x: 0, y: 0, width: pageW, height: pageH });

      // Overlay invisible text. Canvas pixels → PDF points: divide by `scale`,
      // and flip Y (PDF origin is bottom-left, canvas is top-left).
      for (const word of words) {
        const text = word.text.trim();
        if (!text) continue;
        const boxW = (word.bbox.x1 - word.bbox.x0) / scale;
        const boxH = (word.bbox.y1 - word.bbox.y0) / scale;
        if (boxW <= 0 || boxH <= 0) continue;

        const x = word.bbox.x0 / scale;
        const y = pageH - word.bbox.y1 / scale;

        // Choose a font size that fits the box: start from the box height, then
        // shrink if the glyph run would overflow the box width. pdf-lib has no
        // horizontal-scale option, so fitting by size keeps the invisible text
        // inside the word's box and selection highlights aligned with the scan.
        let fontSize = Math.max(1, boxH * 0.9);
        const measured = font.widthOfTextAtSize(text, fontSize);
        if (measured > boxW && measured > 0) {
          fontSize = Math.max(1, fontSize * (boxW / measured));
        }

        pdfPage.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
          opacity: 0, // invisible, but still selectable & searchable
        });
      }

      opts.onProgress?.(pageNumber / total, `Finished page ${pageNumber} of ${total}`);
    }
  } finally {
    await worker.terminate();
    await srcDoc.loadingTask.destroy();
  }

  const base = input.name.replace(/\.pdf$/i, "");
  const blob = await pdfDocToBlob(outDoc);
  return {
    text: textChunks.join("\n\f\n").trim(),
    searchablePdf: namedBlob(`${base}-searchable.pdf`, blob),
  };
}

/**
 * Pull a flat word list out of tesseract's page result, defensively.
 *
 * tesseract.js v6+ nests words as `blocks → paragraphs → lines → words` (there
 * is no top-level `words` array anymore), so we walk that tree. As a fallback we
 * also accept a legacy flat `data.words` array, so this keeps working across
 * versions. Every candidate is validated before use.
 */
function extractWords(data: unknown): OcrWord[] {
  const out: OcrWord[] = [];

  const pushWord = (candidate: unknown): void => {
    const text = (candidate as { text?: unknown }).text;
    const bbox = (candidate as {
      bbox?: { x0?: number; y0?: number; x1?: number; y1?: number };
    }).bbox;
    if (
      typeof text === "string" &&
      bbox &&
      typeof bbox.x0 === "number" &&
      typeof bbox.y0 === "number" &&
      typeof bbox.x1 === "number" &&
      typeof bbox.y1 === "number"
    ) {
      out.push({ text, bbox: { x0: bbox.x0, y0: bbox.y0, x1: bbox.x1, y1: bbox.y1 } });
    }
  };

  const asArray = (value: unknown): unknown[] =>
    Array.isArray(value) ? value : [];

  // Preferred path (v6+): descend the block tree.
  const blocks = (data as { blocks?: unknown }).blocks;
  for (const block of asArray(blocks)) {
    for (const paragraph of asArray((block as { paragraphs?: unknown }).paragraphs)) {
      for (const line of asArray((paragraph as { lines?: unknown }).lines)) {
        for (const word of asArray((line as { words?: unknown }).words)) {
          pushWord(word);
        }
      }
    }
  }

  // Legacy fallback: a flat top-level words array.
  if (out.length === 0) {
    for (const word of asArray((data as { words?: unknown }).words)) {
      pushWord(word);
    }
  }

  return out;
}

/** Encode a canvas to JPEG bytes (browser encoder is plenty for scans). */
function canvasToJpegBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode the scanned page."));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject);
      },
      "image/jpeg",
      0.85,
    ),
  );
}
