"use client";

/**
 * QR Code Generator: the flagship QR micro-site UI.
 *
 * This is the *full* studio with nothing locked: every one of the 28 content
 * encoders is available, the complete customization panel (dot/eye shapes,
 * gradients, colors, margin, corner radius, error correction, frame + CTA),
 * the centre-logo panel, the CSV → ZIP batch drawer, all export formats, and
 * the real-time scan/contrast validation are all wired up by {@link QRToolPage}
 * → {@link QRStudio}.
 *
 * We keep this component a thin, honest wrapper over the studio (per the
 * platform's DRY rule): the studio owns the entire desktop-grade workspace
 * (live preview across desktop/mobile/dark/print modes, drag-drop/paste/copy,
 * keyboard support, a11y). Here we simply hand it the flagship preset, full
 * multi-type, batch enabled, opening on a URL, and let the registry accent
 * flow through.
 */

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage, type QRToolPreset } from "@/components/tool/qr";

/**
 * The flagship preset: the whole studio, unlocked.
 *
 * - No `contentType` lock. The type picker is fully available (all 28 types).
 * - Opens on a sensible default (URL) with an example so the tool is never empty.
 * - `enableBatch` exposes the CSV → ZIP drawer.
 * - `lockType: false` is explicit so the picker always shows even with a
 *   default content type present.
 */
const FLAGSHIP_PRESET: QRToolPreset = {
  contentType: "url",
  lockType: false,
  enableBatch: true,
  defaultFields: { url: "https://gigai.tools" },
  filename: "qr-code",
};

/**
 * QR Code Generator tool UI. Renders the complete QR studio for this preset.
 * All heavy lifting (rendering, styling, logo, validation, batch, export) lives
 * in the studio + `lib/qr` engine, which lazy-imports every heavy library.
 */
export default function QrCodeGeneratorTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={FLAGSHIP_PRESET} />;
}
