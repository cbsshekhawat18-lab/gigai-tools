"use client";

/**
 * Phone QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "phone" content type so the form opens directly on
 * the phone-number field, seeds a friendly international-format example, and
 * frames everything around "scan to call". The heavy lifting, live preview,
 * color/gradient/dot/eye customization, logo drop-in, real-time scan/contrast
 * validation, drag-drop/paste/copy/share and every print-ready export (PNG,
 * transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px): all comes from
 * the shared QR Studio, which builds the standard tel: payload entirely in the
 * browser (the number is never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function PhoneQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "phone",
        lockType: true,
        // Seed a full international-format example so the live preview renders a
        // real, scannable tel: code the instant the tool loads, users overwrite
        // it with their own number.
        defaultFields: {
          phone: "+15551234567",
        },
        // A soft, on-brand default look tuned for a printed "scan to call" card
        // or window decal; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo is common on business cards, so start at the higher
          // error correction that keeps a logo'd code reliably scannable.
          errorCorrection: "Q",
        },
        filename: "phone-qr-code",
      }}
    />
  );
}
