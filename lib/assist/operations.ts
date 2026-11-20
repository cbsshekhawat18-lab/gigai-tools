/**
 * GigAI Smart Assist: headless OPERATIONS (the executable side of a plan).
 *
 * Each operation is a THIN adapter over an EXISTING client-side engine
 * (`lib/image/engine`, `lib/pdf/*`). No pixel/PDF logic is re-implemented here -
 * these just translate a plan step's params into an engine call and return a
 * blob. Engines are dynamic-imported INSIDE `run`, so the initial bundle stays
 * tiny and a codec/model only loads the first time it's actually used.
 *
 * Extensibility (STEP 12): to teach Smart Assist a new inline capability, add an
 * operation here and reference its id from the planner. Nothing else changes.
 */

import type {
  AssistAsset,
  AssistOperation,
  AssistOpResult,
  AssistProgress,
} from "@/lib/assist/types";

/* ── Filename helpers ──────────────────────────────────────────────────────*/

function withExt(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

function num(params: Record<string, unknown>, key: string, fallback: number): number {
  const v = params[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function str<T extends string>(params: Record<string, unknown>, key: string, fallback: T): T {
  const v = params[key];
  return typeof v === "string" ? (v as T) : fallback;
}

/* ── Image engine plumbing (mirrors the image workspace's decode/release) ──*/

async function decodeImage(asset: AssistAsset) {
  const engine = await import("@/lib/image/engine");
  const file = new File([asset.blob], asset.name, {
    type: asset.blob.type || asset.meta.mime || "image/png",
  });
  const img = await engine.loadImageFile(file);
  return { engine, img, release: () => engine.releaseImage(img) };
}

function fromProcess(
  engine: typeof import("@/lib/image/engine"),
  result: import("@/lib/image/engine").ProcessResult,
  name?: string,
): AssistOpResult {
  const out: AssistOpResult = {
    blob: result.blob,
    meta: { size: result.size, width: result.width, height: result.height, mime: result.format },
    ...(name ? { name } : {}),
  };
  engine.releaseResult(result);
  return out;
}

/* ── Image operations ──────────────────────────────────────────────────────*/

/** Compress an image down to (at most) a target byte size. */
const imageCompressToTarget: AssistOperation = {
  id: "image.compressToTarget",
  label: "Compress to target size",
  accepts: ["image"],
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading image…");
    const { engine, img, release } = await decodeImage(asset);
    try {
      const targetBytes = num(params, "targetBytes", 2 * 1024 * 1024);
      const format = str<"image/jpeg" | "image/webp">(params, "format", "image/jpeg");
      onProgress?.(0.5, "Finding the best quality that fits…");
      const result = await engine.compressToTargetSize(img, { targetBytes, format });
      onProgress?.(1, "Done");
      return fromProcess(engine, result, withExt(asset.name, format === "image/webp" ? "webp" : "jpg"));
    } finally {
      release();
    }
  },
};

/** Compress an image at a chosen quality. */
const imageCompress: AssistOperation = {
  id: "image.compress",
  label: "Compress",
  accepts: ["image"],
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading image…");
    const { engine, img, release } = await decodeImage(asset);
    try {
      const quality = num(params, "quality", 72) / 100;
      const format = str<"image/jpeg" | "image/webp">(params, "format", "image/jpeg");
      onProgress?.(0.5, "Compressing…");
      const result = await engine.compressImage(img, { quality, format });
      onProgress?.(1, "Done");
      return fromProcess(engine, result, withExt(asset.name, format === "image/webp" ? "webp" : "jpg"));
    } finally {
      release();
    }
  },
};

/** Resize an image to exact dimensions, a scale percent, or fit-within a box. */
const imageResize: AssistOperation = {
  id: "image.resize",
  label: "Resize",
  accepts: ["image"],
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading image…");
    const { engine, img, release } = await decodeImage(asset);
    try {
      const percent = num(params, "percent", 0);
      const keepAspect = params["keepAspect"] !== false;
      let width: number;
      let height: number;
      if (percent > 0) {
        const p = percent / 100;
        width = img.width * p;
        height = img.height * p;
      } else {
        const targetW = num(params, "width", 0) || img.width;
        const targetH = num(params, "height", 0) || img.height;
        if (keepAspect) {
          const scale = Math.min(targetW / img.width, targetH / img.height);
          width = img.width * scale;
          height = img.height * scale;
        } else {
          width = targetW;
          height = targetH;
        }
      }
      onProgress?.(0.5, "Resizing…");
      const result = await engine.resizeImage(img, {
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      });
      onProgress?.(1, "Done");
      return fromProcess(engine, result);
    } finally {
      release();
    }
  },
};

/** Convert an image to PNG / JPG / WebP. */
const imageConvert: AssistOperation = {
  id: "image.convert",
  label: "Convert format",
  accepts: ["image"],
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading image…");
    const { engine, img, release } = await decodeImage(asset);
    try {
      const format = str<"image/png" | "image/jpeg" | "image/webp">(params, "format", "image/webp");
      const quality = num(params, "quality", 92) / 100;
      onProgress?.(0.5, "Converting…");
      const result = await engine.convertFormat(img, { format, quality });
      onProgress?.(1, "Done");
      const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
      return fromProcess(engine, result, withExt(asset.name, ext));
    } finally {
      release();
    }
  },
};


/** Turn an image into a one-page PDF (reuses the PDF engine's imagesToPdf). */
const imageToPdf: AssistOperation = {
  id: "image.toPdf",
  label: "Make a PDF",
  accepts: ["image"],
  run: async (asset, _params, onProgress): Promise<AssistOpResult> => {
    onProgress?.(0.3, "Building PDF…");
    const { imagesToPdf } = await import("@/lib/pdf/convert");
    const file = new File([asset.blob], asset.name, { type: asset.blob.type || "image/png" });
    const out = await imagesToPdf([{ file, name: asset.name }], {});
    onProgress?.(1, "Done");
    return { blob: out.blob, name: withExt(asset.name, "pdf"), meta: { size: out.blob.size, mime: "application/pdf" } };
  },
};

/* ── PDF operations ────────────────────────────────────────────────────────*/

/** Compress a PDF (reuses the PDF engine's raster-recompress). */
const pdfCompress: AssistOperation = {
  id: "pdf.compress",
  label: "Compress PDF",
  accepts: ["pdf"],
  run: async (asset, params, onProgress): Promise<AssistOpResult> => {
    const level = str<"low" | "medium" | "high">(params, "level", "medium");
    const { compressPdf } = await import("@/lib/pdf/convert");
    const file = new File([asset.blob], asset.name, { type: "application/pdf" });
    const out = await compressPdf(
      { file, name: asset.name },
      { level, onProgress: (f, s) => onProgress?.(f, s) },
    );
    return { blob: out.blob, name: asset.name, meta: { size: out.blob.size, mime: "application/pdf" } };
  },
};

/* ── Document operations ───────────────────────────────────────────────────*/

/**
 * Convert a Word .docx to a PDF entirely in the browser. Reuses the same libs as
 * the Word to PDF tool (mammoth + jsPDF), but takes the RELIABLE text path:
 * mammoth extracts the document text, jsPDF lays it out as real, SELECTABLE text
 * with wrapping + pagination. This is fast and robust (no html2canvas raster) and
 * produces a searchable PDF. Complex layouts/images/tables need the dedicated
 * Word to PDF tool (which can use a higher-fidelity server render), the planner
 * surfaces that honestly and offers it as the "fine-tune" option.
 */
const documentWordToPdf: AssistOperation = {
  id: "document.wordToPdf",
  label: "Convert Word to PDF",
  accepts: ["document"],
  run: async (asset, _params, onProgress): Promise<AssistOpResult> => {
    onProgress?.(0.1, "Reading document…");
    const [{ default: mammoth }, { jsPDF }] = await Promise.all([import("mammoth"), import("jspdf")]);
    const arrayBuffer = await asset.blob.arrayBuffer();
    onProgress?.(0.45, "Extracting text…");
    const { value: raw } = await mammoth.extractRawText({ arrayBuffer });
    const text = (raw || "").replace(/\r/g, "").trim() || "This document appears to be empty.";

    onProgress?.(0.7, "Building PDF…");
    const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const marginX = 48;
    const marginTop = 56;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const maxW = pageW - marginX * 2;
    const lineH = 16;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    let y = marginTop;
    for (const para of text.split(/\n+/)) {
      const lines = pdf.splitTextToSize(para.trim() === "" ? " " : para, maxW) as string[];
      for (const line of lines) {
        if (y > pageH - marginTop) {
          pdf.addPage();
          y = marginTop;
        }
        pdf.text(line, marginX, y);
        y += lineH;
      }
      y += 6; // paragraph spacing
    }
    const blob = pdf.output("blob");
    onProgress?.(1, "Done");
    return { blob, name: withExt(asset.name, "pdf"), meta: { size: blob.size, mime: "application/pdf" } };
  },
};

/* ── Catalog ───────────────────────────────────────────────────────────────*/

const OPERATIONS: AssistOperation[] = [
  imageCompressToTarget,
  imageCompress,
  imageResize,
  imageConvert,
  imageToPdf,
  pdfCompress,
  documentWordToPdf,
];

const OP_BY_ID = new Map(OPERATIONS.map((op) => [op.id, op]));

/** Look up an assist operation by id, or undefined. */
export function getAssistOperation(id: string): AssistOperation | undefined {
  return OP_BY_ID.get(id);
}

export type { AssistProgress };
