"use client";

/**
 * Facebook QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "url" content type so the form opens directly on a
 * Facebook link, seeds a friendly Page-URL example so the live preview renders a
 * real, scannable "scan to follow" code the moment the tool loads, and applies a
 * soft, Facebook-flavoured default look. Everything else: live preview,
 * color/gradient/dot/eye customization, logo drop-in, real-time scan/contrast
 * validation, drag-drop/paste/copy/share and every print-ready export (PNG,
 * transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px): comes from the
 * shared QR Studio, which validates and encodes the URL entirely in the browser
 * (nothing is uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function FacebookQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "url",
        lockType: true,
        // Seed a recognisable Facebook Page URL so the studio opens on a real,
        // scannable code: users overwrite it with their own Page, profile,
        // Group or event link.
        defaultFields: {
          url: "https://facebook.com/yourbusiness",
        },
        // A soft, on-brand default look tuned for a printed "follow us on
        // Facebook" card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo (the Page's profile picture) is common here, so start
          // with the higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "facebook-qr-code",
      }}
    />
  );
}
