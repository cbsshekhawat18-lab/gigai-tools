"use client";

/**
 * QR Code with Logo, the interactive workspace.
 *
 * A branding-first preset over the desktop-grade {@link QRToolPage}. Unlike the
 * flagship generator (which opens neutral), this one is tuned end to end around
 * dropping a logo into the centre of a QR code and keeping it scannable:
 *
 * - `lockType: false` keeps the full 28-type picker available, so a logo can be
 *   put on any payload (URL, Wi-Fi, vCard, UPI, calendar, social…). It opens on
 *  a URL (the most common thing people brand) with an example so the live
 *   preview renders a real, scannable code immediately.
 * - `defaultStyle` seeds a logo-safe look: error correction is raised to `H`
 *   (the strongest, giving the maximum redundancy to survive a centred mark),
 *   plus soft rounded dots/eyes that read as "designed" rather than generic.
 *   The logo, protect-area cut-out, colors, gradient, frame and everything else
 *   stay fully editable in the studio's Logo and Design tabs.
 *
 * All the heavy lifting: reading the logo locally, the protect-area behind it,
 * the automatic error-correction guidance, the real-time jsQR scan test + WCAG
 * contrast check, drag-drop/paste/copy/share, and every print-ready export
 * (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS up to 4096px): comes from the
 * shared QR Studio, which runs entirely in the browser. The logo image and the
 * data you encode are never uploaded.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage, type QRToolPreset } from "@/components/tool/qr";

const LOGO_PRESET: QRToolPreset = {
  contentType: "url",
  // Keep the full type picker so a logo can brand any of the 28 payloads.
  lockType: false,
  defaultFields: { url: "https://gigai.tools" },
  defaultStyle: {
    // A logo covers modules, so start at the strongest error correction: the
    // studio recommends this whenever a logo is present, and we default to it
    // here so the very first branded render is already scan-safe.
    errorCorrection: "H",
    dotStyle: "rounded",
    eyeFrameStyle: "rounded",
  },
  filename: "qr-code-with-logo",
};

export default function QrCodeWithLogoTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={LOGO_PRESET} />;
}
