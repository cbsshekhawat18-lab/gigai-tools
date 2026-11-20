"use client";

/**
 * Image QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "image" content type so the form opens directly on a
 * single "image URL" field, seeds a real example link so the live preview
 * renders a scannable code the instant the page loads, and frames everything
 * around "scan to view". The heavy lifting, live preview, color / gradient /
 * dot / eye customization, logo drop-in, real-time jsQR scan + WCAG contrast
 * validation, drag-drop / paste / copy / share, and every print-ready export
 * (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px). All comes
 * from the shared QR Studio.
 *
 * Honest by design: the "image" encoder builds a standard URL QR from the link
 * you paste. It does NOT host, upload or store the picture, the image must
 * already live at a public, direct URL you control, and encoding happens
 * entirely in the browser (the link is never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function ImageQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "image",
        lockType: true,
        // Seed a real, public direct-image link so the preview renders an
        // actually-scannable code on load: users overwrite it with their own
        // hosted image URL.
        defaultFields: {
          url: "https://example.com/photo.jpg",
        },
        // A soft, on-brand default look tuned for a printed "scan to view"
        // label; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centred brand/watermark logo is common for image codes, so start
          // with the higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "image-qr-code",
      }}
    />
  );
}
