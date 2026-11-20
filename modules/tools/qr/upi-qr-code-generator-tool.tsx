"use client";

/**
 * UPI QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "upi" content type so the form opens directly on
 * UPI ID (VPA) / payee name / amount / note, seeds a friendly Scan & Pay
 * example, and frames everything around "scan & pay". The heavy lifting, live
 * preview, color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) -
 * all comes from the shared QR Studio, which encodes the standard upi://pay
 * intent entirely in the browser (the UPI ID is never uploaded).
 *
 * Honest boundary: this is a standard personal / P2P UPI collect QR. Money
 * flows through the payer's own UPI app straight to the encoded UPI ID. There
 * is no bank integration, merchant onboarding or settlement here.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function UpiQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "upi",
        lockType: true,
        // Seed a realistic Scan & Pay example so the live preview renders a
        // real, scannable UPI code the moment the tool loads, users overwrite
        // it with their own UPI ID, name and (optionally) a fixed amount.
        defaultFields: {
          vpa: "yourname@okhdfcbank",
          name: "Your Shop",
          currency: "INR",
          note: "Scan & Pay",
        },
        // A calm, on-brand default look tuned for a printed "Scan & Pay" counter
        // sticker; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // Shop QRs are often printed with a logo, so start with the higher
          // error correction that keeps a logo'd code scannable under harsh
          // counter lighting.
          errorCorrection: "Q",
        },
        filename: "upi-qr-code",
      }}
    />
  );
}
