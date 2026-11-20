"use client";

/**
 * Calendar QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "calendar" content type so the form opens directly
 * on title / location / start / end / description, seeds a realistic
 * save-the-date example, and frames everything around "scan to save the date".
 * The heavy lifting, live preview, color/gradient/dot/eye customization, logo
 * drop-in, real-time scan/contrast validation, drag-drop/paste/copy/share and
 * every print-ready export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up
 * to 4096px); all comes from the shared QR Studio, which encodes the standard
 * iCalendar VEVENT entirely in the browser (nothing about the event is uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function CalendarQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "calendar",
        lockType: true,
        // Seed a realistic save-the-date so the live preview renders a real,
        // scannable event QR the moment the tool loads, users overwrite it with
        // their own title, date/time and venue.
        defaultFields: {
          title: "Save the Date: GigAI Launch",
          location: "Bengaluru",
          start: "2026-09-12T18:00",
          end: "2026-09-12T21:00",
          description: "Join us for the launch. Details to follow.",
        },
        // A soft, on-brand default look tuned for a printed save-the-date card;
        // every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A logo or monogram in the centre is common on invitations, so start
          // with the higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "calendar-qr-code",
      }}
    />
  );
}
