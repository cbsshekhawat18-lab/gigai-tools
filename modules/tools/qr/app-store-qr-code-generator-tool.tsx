"use client";

/**
 * App Store QR Code Generator: a single-purpose micro-site over the QR Studio,
 * locked to the "appStore" content type.
 *
 * We keep this component a thin, honest wrapper over {@link QRToolPage} (per the
 * platform's DRY rule): the studio owns the entire desktop-grade workspace -
 * the live preview across desktop/mobile/dark/print modes, the full
 * customization panel (dot/eye shapes, gradients, colors, margin, corner
 * radius, error correction), the centre-logo panel for the app icon, every
 * export format (PNG/SVG/PDF/EPS/JPG/WEBP up to 4096px, plus transparent
 * PNG/SVG), copy/paste/share, and the real-time scan + WCAG-contrast
 * validation. Here we simply hand it the App Store preset and let the registry
 * accent flow through.
 *
 * Preset choices:
 * - `contentType: "appStore"` opens (and, via the default lock, stays on) the
 *  App Store link encoder: the guided form takes the apps.apple.com URL.
 * - `lockType: true` hides the type picker so this stays a focused, single-
 *   purpose tool rather than the full multi-type studio.
 * - `defaultFields` seeds a realistic apps.apple.com example so the preview is
 *   never empty and users can see the expected link shape.
 * - `defaultStyle` leans into iOS-flavoured styling, rounded dots and eyes on
 *   a high error-correction (Q) base so a centred app icon still scans.
 * - `filename` gives downloads a sensible base name.
 * - Batch is intentionally left off; bulk App Store codes are an edge case and
 *   the flagship generator covers CSV → ZIP for anyone who needs it.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage, type QRToolPreset } from "@/components/tool/qr";

const APP_STORE_PRESET: QRToolPreset = {
  contentType: "appStore",
  lockType: true,
  defaultFields: {
    url: "https://apps.apple.com/app/id123456789",
  },
  defaultStyle: {
    dotStyle: "rounded",
    eyeFrameStyle: "rounded",
    eyeDotStyle: "rounded",
    errorCorrection: "Q",
  },
  filename: "app-store-qr-code",
};

export default function AppStoreQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={APP_STORE_PRESET} />;
}
