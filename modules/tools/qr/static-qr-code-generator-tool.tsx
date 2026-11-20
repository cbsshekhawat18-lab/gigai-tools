"use client";

/**
 * Static QR Code Generator, the full studio, framed around permanence.
 *
 * A static QR code encodes its data directly into the module pattern (no
 * redirect link, no server, no expiry, no tracking). Functionally that is the
 * *same* thing every QR code in this platform already does: static is the
 * honest default, so the right UI here is the complete studio, not a locked
 * single-purpose form. We therefore hand {@link QRToolPage} the full unlocked
 * preset: every one of the 28 content encoders, the complete customization +
 * logo panels, all export formats and the real-time scan/contrast validation.
 *
 * Per the platform's DRY rule this stays a thin wrapper over the studio, which
 * owns the entire desktop-grade workspace (live preview across desktop/mobile/
 * dark/print modes, drag-drop/paste/copy/share, keyboard support, a11y AA).
 * The only differences from the flagship are intentional and true to a static
 * code: the type picker is open (any content can be baked in permanently) and
 * batch mode is left off, keeping this page focused on crafting one lasting,
 * verified code rather than bulk output.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage, type QRToolPreset } from "@/components/tool/qr";

/**
 * The static preset: the whole studio, unlocked, opening on a URL example.
 *
 * - No `contentType` lock: every content type can be encoded as a permanent
 *   static code (`lockType: false` is explicit so the picker always shows).
 * - Opens on a sensible URL default so the preview is never empty.
 * - Batch is intentionally omitted. This page is about one enduring code.
 */
const STATIC_PRESET: QRToolPreset = {
  contentType: "url",
  lockType: false,
  defaultFields: { url: "https://gigai.tools" },
  defaultStyle: { errorCorrection: "H" },
  filename: "static-qr-code",
};

/**
 * Static QR Code Generator tool UI. Renders the complete QR studio for the
 * static preset. All rendering, styling, logo, validation and export logic
 * lives in the studio + `lib/qr` engine, which lazy-imports every heavy
 * library. Nothing is duplicated here.
 */
export default function StaticQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={STATIC_PRESET} />;
}
