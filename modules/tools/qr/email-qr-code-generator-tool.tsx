"use client";

/**
 * Email QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "email" content type so the form opens directly on
 * recipient / subject / message, seeds a sensible "scan to email us" example,
 * and frames everything around composing a ready-to-send draft. The heavy
 * lifting, live preview, color/gradient/dot/eye customization, logo drop-in,
 * real-time scan/contrast validation, drag-drop/paste/copy/share and every
 * print-ready export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to
 * 4096px); all comes from the shared QR Studio, which encodes the standard
 * mailto: payload entirely in the browser (nothing is uploaded). The QR opens a
 * pre-filled draft in the scanner's mail app; it never sends the email itself.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function EmailQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "email",
        lockType: true,
        // Seed a friendly "contact us" example so the live preview renders a
        // real, scannable code the moment the tool loads, users overwrite it
        // with their own address, subject and message.
        defaultFields: {
          email: "hello@example.com",
          subject: "Hello from your QR code",
          body: "Hi there,\n\nI scanned your QR code and wanted to get in touch about ",
        },
        // A soft, on-brand default look tuned for a printed "scan to email us"
        // card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo is common for contact codes, so start with the higher
          // error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "email-qr-code",
      }}
    />
  );
}
