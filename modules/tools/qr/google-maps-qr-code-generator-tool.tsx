"use client";

/**
 * Google Maps QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "googleMaps" content type so the form opens
 * directly on the place / address (or pasted Maps URL) field, seeds a sensible
 * example so the live preview renders a real, scannable code on load, and
 * frames everything around "scan for directions". The heavy lifting: live
 * preview, color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) -
 * all comes from the shared QR Studio, which builds the standard Google Maps
 * URL entirely in the browser (nothing about your location is uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function GoogleMapsQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "googleMaps",
        lockType: true,
        // Seed a well-known place so the preview renders a real, scannable
        // "scan for directions" code the instant the tool loads: users
        // overwrite it with their own address, place name or Maps link.
        defaultFields: {
          query: "India Gate, New Delhi",
        },
        // A soft, on-brand default look tuned for a printed "scan for
        // directions" card or sign; every value stays editable in Design.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // Maps codes are often logo'd and printed on signage, so start with
          // the higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "google-maps-qr-code",
      }}
    />
  );
}
