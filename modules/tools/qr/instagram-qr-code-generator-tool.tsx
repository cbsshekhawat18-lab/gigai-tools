"use client";

/**
 * Instagram QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "instagram" content type so the form opens directly on
 * "username or profile URL", seeds a friendly example handle, and frames the
 * whole thing around "scan to follow". The heavy lifting, live preview,
 * color/gradient/dot/eye customization, logo (or profile-picture) drop-in,
 * real-time scan/contrast validation, drag-drop/paste/copy/share and every
 * print-ready export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to
 * 4096px); all comes from the shared QR Studio, which normalises the handle
 * into a standard instagram.com profile link entirely in the browser (nothing
 * about the account is ever uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function InstagramQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "instagram",
        lockType: true,
        // Seed a real handle so the live preview renders a genuine, scannable
        // profile code the moment the tool loads, users overwrite it with
        // their own @username.
        defaultFields: {
          username: "gigai.tools",
        },
        // A soft, on-brand default look tuned for a printed "follow us on
        // Instagram" card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A logo or profile picture in the centre is common for social codes,
          // so start with the higher error correction that keeps it scannable.
          errorCorrection: "Q",
        },
        filename: "instagram-qr-code",
      }}
    />
  );
}
