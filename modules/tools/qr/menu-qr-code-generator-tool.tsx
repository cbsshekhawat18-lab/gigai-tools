"use client";

/**
 * Menu QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "url" content type so the form opens directly on the
 * menu link, seeds a friendly example menu URL, and, crucially, ships a
 * "Scan for Menu" table-tent frame plus warm, on-brand default styling tuned
 * for a printed restaurant tent. Everything else, live preview, color/
 * gradient/dot/eye customization, logo drop-in, real-time scan/contrast
 * validation, drag-drop/paste/copy/share and every print-ready export (PNG,
 * transparent PNG, SVG, PDF, JPG, WEBP, EPS up to 4096px); comes from the
 * shared QR Studio, which encodes the URL entirely in the browser (the menu
 * link is never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function MenuQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "url",
        lockType: true,
        // Seed a realistic menu link so the live preview renders a scannable,
        // framed table tent the instant the tool loads, users replace it with
        // their own hosted menu URL.
        defaultFields: {
          url: "https://your-restaurant.com/menu",
        },
        // Warm, on-brand table-tent look with a "Scan for Menu" call-to-action
        // frame; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo is common on restaurant tents, so start at the higher
          // error correction that keeps a logo'd code scannable on print.
          errorCorrection: "Q",
          frame: {
            style: "scan-me",
            label: "Scan for Menu",
          },
        },
        filename: "menu-qr-code",
      }}
    />
  );
}
