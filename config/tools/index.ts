import type { Tool } from "@/types";

import { COMING_SOON_TOOLS } from "./_placeholders";

// ── Live Image Tools (Phase 1, each a full micro-site) ───────────────────────
import imageCompressor from "./image/image-compressor";
import imageResizer from "./image/image-resizer";
import cropImage from "./image/crop-image";
import pngToJpg from "./image/png-to-jpg";
import jpgToPng from "./image/jpg-to-png";
import webpConverter from "./image/webp-converter";
import heicToJpg from "./image/heic-to-jpg";
import removeMetadata from "./image/remove-metadata";
import imageUpscaler from "./image/image-upscaler";
import epsToPng from "./image/eps-to-png";

// ── Live PDF Tools (Phase 2) ──────────────────────────────────────────────────
import pdfEditor from "./pdf/pdf-editor";
import mergePdf from "./pdf/merge-pdf";
import splitPdf from "./pdf/split-pdf";
import compressPdf from "./pdf/compress-pdf";
import pdfToWord from "./pdf/pdf-to-word";
import wordToPdf from "./pdf/word-to-pdf";
import jpgToPdf from "./pdf/jpg-to-pdf";
import pdfToJpg from "./pdf/pdf-to-jpg";
import rotatePdf from "./pdf/rotate-pdf";
import extractPdfPages from "./pdf/extract-pdf-pages";
import deletePdfPages from "./pdf/delete-pdf-pages";
import reorderPdfPages from "./pdf/reorder-pdf-pages";
import pdfPasswordProtect from "./pdf/pdf-password-protect";
import unlockPdf from "./pdf/unlock-pdf";
import ocrPdf from "./pdf/ocr-pdf";
// Closing the gap against the big PDF suites (2026-08-11): crop, redact,
// repair, forms, Markdown and camera scanning. All browser-side.
import scanToPdf from "./pdf/scan-to-pdf";
import pdfToMarkdown from "./pdf/pdf-to-markdown";
import cropPdf from "./pdf/crop-pdf";
import pdfForms from "./pdf/pdf-forms";
import redactPdf from "./pdf/redact-pdf";
import repairPdf from "./pdf/repair-pdf";
// Moved out of the Document Studio (2026-08-11) so every PDF tool lives in
// ONE hub. Splitting them across two categories meant nobody could find
// 'every tool you need to work with PDFs in one place', which is exactly
// what the competition leads with.
import documentOrganizer from "./pdf/document-organizer";
import pptToPdf from "./pdf/ppt-to-pdf";
import excelToPdf from "./pdf/excel-to-pdf";
import htmlToPdf from "./pdf/html-to-pdf";
import markdownToPdf from "./pdf/markdown-to-pdf";
import txtToPdf from "./pdf/txt-to-pdf";
import epubToPdf from "./pdf/epub-to-pdf";
import pdfToPpt from "./pdf/pdf-to-ppt";
import pdfToExcel from "./pdf/pdf-to-excel";
import pdfToHtml from "./pdf/pdf-to-html";
import pdfToTxt from "./pdf/pdf-to-txt";
import documentPageNumber from "./pdf/document-page-number";
import documentWatermark from "./pdf/document-watermark";
import documentMetadataEditor from "./pdf/document-metadata-editor";
import documentSignature from "./pdf/document-signature";
import redactionChecker from "./pdf/redaction-checker";
import documentComparer from "./pdf/document-comparer";

// ── Live Developer Tools (Phase 3) ────────────────────────────────────────────
import { DEV_TOOLS } from "./dev";

// ── Live QR Tools (Phase 4, the QR studio) ───────────────────────────────────
import { QR_TOOLS } from "./qr";

// ── Live SEO Tools (Phase 5, the Website & SEO toolkit) ──────────────────────
import { SEO_TOOLS } from "./seo";

// ── Live SVG Tools (Phase 6, the SVG toolkit) ────────────────────────────────
import { SVG_TOOLS } from "./svg";

// ── Live Document Tools (Phase 7: the Document Studio) ───────────────────────
import { DOCUMENT_TOOLS } from "./document";

// ── Live Video Tools (Phase 8, the Video Toolkit, FFmpeg WASM) ───────────────
import { VIDEO_TOOLS } from "./video";

// ── Live Audio Tools (Phase 9: the Audio Toolkit, Web Audio API) ─────────────
import { AUDIO_TOOLS } from "./audio";

// ── GEO Studio (Phase 11: the free technical layer under AI visibility) ─────
import { GEO_TOOLS } from "./geo";

// ── File Intelligence (Phase 10, the flagship experiences) ──────────────────
import gigaiFit from "./file-intel/gigai-fit";
import gigaiVerify from "./file-intel/gigai-verify";
import gigaiIconLab from "./file-intel/gigai-iconlab";

/** Live image tools, in the internal-linking order used across the site. */
export const IMAGE_TOOLS: Tool[] = [
  imageCompressor,
  imageResizer,
  cropImage,
  pngToJpg,
  jpgToPng,
  webpConverter,
  heicToJpg,
  removeMetadata,
  imageUpscaler,
  epsToPng,
];

/** Live PDF tools (Phase 2), in internal-linking order. */
export const PDF_TOOLS: Tool[] = [
  // ── Organize PDF ────────────────────────────────────────────────────────
  mergePdf,
  splitPdf,
  extractPdfPages,
  deletePdfPages,
  reorderPdfPages,
  documentOrganizer,

  // ── Optimize PDF ────────────────────────────────────────────────────────
  compressPdf,
  ocrPdf,
  repairPdf,

  // ── Convert to PDF ──────────────────────────────────────────────────────
  wordToPdf,
  jpgToPdf,
  pptToPdf,
  excelToPdf,
  htmlToPdf,
  markdownToPdf,
  txtToPdf,
  epubToPdf,
  scanToPdf,

  // ── Convert from PDF ────────────────────────────────────────────────────
  pdfToWord,
  pdfToJpg,
  pdfToPpt,
  pdfToExcel,
  pdfToHtml,
  pdfToTxt,
  pdfToMarkdown,

  // ── Edit PDF ────────────────────────────────────────────────────────────
  pdfEditor,
  rotatePdf,
  cropPdf,
  documentPageNumber,
  documentWatermark,
  documentMetadataEditor,
  pdfForms,

  // ── PDF Security ────────────────────────────────────────────────────────
  pdfPasswordProtect,
  unlockPdf,
  documentSignature,
  redactPdf,
  redactionChecker,
  documentComparer,
];

/**
 * THE TOOL REGISTRY: the single source of truth. Add a tool by dropping a file
 * under config/tools/<category>/ and importing it here. Everything else (routes,
 * metadata, JSON-LD, cards, category listings, search, sitemap) is generated.
 */
/**
 * Badge truth (UI-upgrade spec, phase 0 bug 6): the old per-file popular/isNew
 * flags were bulk-set on ~250 of 262 tools and meant nothing, so they are
 * DERIVED here instead and the per-file flags are gone.
 *  - isNew: createdAt within the last 30 days, computed at build time.
 *  - popular: the top 20 tool pages by request count on gigai.tools
 *    (measured 2026-08-21). Re-derive from your own logs in a fork.
 */
const POPULAR_TOP20 = new Set([
  "video-player", "url-parser", "video-to-work", "video-metadata",
  "compress-pdf", "svg-gradient-generator", "merge-pdf",
  "svg-animation-generator", "svg-viewer", "video-resizer",
  "video-intelligence", "gigai-fit", "crop-image", "image-compressor",
  "audio-waveform", "image-resizer", "video-frame-extractor", "jpg-to-png",
  "barcode-generator", "audio-volume-booster",
]);

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const BUILD_TIME = Date.now();

function withDerivedBadges(tool: Tool): Tool {
  return {
    ...tool,
    isNew: Boolean(
      tool.createdAt && BUILD_TIME - Date.parse(tool.createdAt) < NEW_WINDOW_MS,
    ),
    popular: POPULAR_TOP20.has(tool.slug),
  };
}

export const TOOLS: Tool[] = [
  ...IMAGE_TOOLS,
  ...PDF_TOOLS,
  ...DEV_TOOLS,
  ...QR_TOOLS,
  ...SEO_TOOLS,
  ...SVG_TOOLS,
  ...DOCUMENT_TOOLS,
  ...VIDEO_TOOLS,
  ...AUDIO_TOOLS,
  ...GEO_TOOLS,
  ...COMING_SOON_TOOLS,
  gigaiFit,
  gigaiVerify,
  gigaiIconLab,
].map(withDerivedBadges);
