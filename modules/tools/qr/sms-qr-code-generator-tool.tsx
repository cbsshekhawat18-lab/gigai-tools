"use client";

/**
 * SMS QR Code Generator: the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "sms" content type so the form opens directly on
 * phone number + message, seeds a sensible "text us" example, and frames
 * everything around scan-to-text. The heavy lifting, live preview,
 * color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) -
 * all comes from the shared QR Studio, which encodes the standard SMSTO:
 * payload entirely in the browser (the number and message are never uploaded,
 * and the code pre-fills the text but never sends it).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function SmsQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "sms",
        lockType: true,
        // Seed a friendly "text us" example so the live preview renders a real,
        // scannable code the instant the tool loads, users overwrite it with
        // their own number and message.
        defaultFields: {
          phone: "+15551234567",
          message: "JOIN",
        },
        // A soft, on-brand default look tuned for a printed "text us" card;
        // every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo is common on marketing codes, so start with the
          // higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "sms-qr-code",
      }}
    />
  );
}
