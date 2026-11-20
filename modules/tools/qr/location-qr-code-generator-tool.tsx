"use client";

/**
 * Location QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "geo" content type so the form opens directly on
 * latitude / longitude / label, seeds a recognisable example pin, and frames
 * everything around "scan for directions". The heavy lifting: live preview,
 * color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) -
 * all comes from the shared QR Studio, which encodes the standard geo:lat,lng
 * payload entirely in the browser (the coordinates are never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function LocationQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "geo",
        lockType: true,
        // Seed a well-known landmark (the Eiffel Tower) so the live preview
        // renders a real, scannable pin the moment the tool loads, users
        // overwrite it with their own coordinates and label.
        defaultFields: {
          lat: "48.8584",
          lng: "2.2945",
          label: "Eiffel Tower",
        },
        // A soft, on-brand default look tuned for a printed "scan for
        // directions" card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centred logo / map marker is common for location cards, so start
          // with the higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "location-qr-code",
      }}
    />
  );
}
