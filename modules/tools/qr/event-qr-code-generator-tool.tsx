"use client";

/**
 * Event QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "calendar" content type so the form opens directly
 * on event title / location / start / end / description, seeds a realistic
 * upcoming-event example so the live preview renders a real, scannable
 * "add to calendar" code the moment the tool loads, and frames everything
 * around "scan to add to calendar". The heavy lifting: live preview,
 * color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) -
 * all comes from the shared QR Studio, which encodes a standards-compliant
 * iCalendar (VEVENT) entirely in the browser (event details are never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function EventQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "calendar",
        lockType: true,
        // Seed a friendly, realistic event so the preview renders a real,
        // scannable add-to-calendar code on load: users overwrite it with
        // their own event. Times use the datetime-local format the form expects.
        defaultFields: {
          title: "Product Launch Party",
          location: "The Grand Hall, Bengaluru",
          start: "2026-09-18T18:30",
          end: "2026-09-18T21:00",
          description: "Doors at 6:30pm. Smart casual. Parking on Level 2.",
        },
        // A soft, celebratory default look tuned for a printed "scan to add to
        // calendar" card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A logo or monogram in the centre is common for invites, so start
          // with the higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "event-qr-code",
      }}
    />
  );
}
