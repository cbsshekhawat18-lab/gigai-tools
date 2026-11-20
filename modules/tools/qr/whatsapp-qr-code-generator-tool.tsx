"use client";

/**
 * WhatsApp QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "whatsapp" content type so the form opens directly
 * on the international number + pre-filled message, seeds a friendly click-to-chat
 * example, and frames everything around "scan to chat". The heavy lifting, live
 * preview, color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) - all
 * comes from the shared QR Studio, which builds the standard `https://wa.me/`
 * click-to-chat link entirely in the browser (nothing is ever uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function WhatsappQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "whatsapp",
        lockType: true,
        // Seed a realistic click-to-chat example so the live preview renders a
        // real, scannable code the instant the tool loads, users overwrite the
        // number with their own and reword the pre-filled opener.
        defaultFields: {
          phone: "15551234567",
          message: "Hi! I'd like to know more.",
        },
        // An on-brand default look tuned for a printed "message us on WhatsApp"
        // card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo is common on WhatsApp codes, so start at the higher
          // error correction that keeps a logo'd code reliably scannable.
          errorCorrection: "Q",
        },
        filename: "whatsapp-qr-code",
      }}
    />
  );
}
