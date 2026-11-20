"use client";

/**
 * Bulk QR Code Generator: the batch-first QR micro-site UI.
 *
 * This is the full desktop-grade QR Studio tuned for volume: the CSV → ZIP
 * batch drawer is enabled (`enableBatch`), so users upload a spreadsheet, apply
 * one shared style, colors, dot/eye shapes, margin, corner radius and a centre
 * logo, and download every row as an individually named QR code inside a single
 * ZIP, with a live progress bar and a built-in template.
 *
 * Per the platform's DRY rule this stays a thin, honest wrapper over the studio.
 * The studio owns the entire workspace (live preview across desktop/mobile/dark/
 * print modes, full customization + logo panels, real-time scan/contrast
 * validation, drag-drop/paste/copy, keyboard support and a11y) and the
 * `lib/qr/batch` engine owns the client-side CSV parse → render → ZIP pipeline,
 * lazy-importing every heavy library.
 *
 * We keep the type picker unlocked so a batch can encode any of the 28 payload
 * types (URLs, Wi-Fi, vCards, …), and open on a URL example so the tool is never
 * empty. The registry accent flows through automatically.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage, type QRToolPreset } from "@/components/tool/qr";

/**
 * Bulk preset: the full studio with the CSV → ZIP batch drawer enabled and the
 * type picker left open so a single sheet can drive any content type. A branded
 * shared style is seeded so the very first preview already looks designed rather
 * than a plain black-and-white square, and error correction is raised to Q so
 * batches remain reliably scannable even before a logo is added.
 */
const BULK_PRESET: QRToolPreset = {
  contentType: "url",
  lockType: false,
  enableBatch: true,
  defaultFields: { url: "https://gigai.tools" },
  defaultStyle: {
    dotStyle: "rounded",
    eyeFrameStyle: "rounded",
    eyeDotStyle: "rounded",
    errorCorrection: "Q",
  },
  filename: "bulk-qr-code",
};

/**
 * Bulk QR Code Generator tool UI. Renders the complete QR studio with batch
 * mode for this preset. All heavy lifting (rendering, styling, logo, validation,
 * CSV parsing, ZIP packing, export) lives in the studio + `lib/qr` engine, which
 * lazy-imports every heavy library and runs entirely in the browser.
 */
export default function BulkQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={BULK_PRESET} />;
}
