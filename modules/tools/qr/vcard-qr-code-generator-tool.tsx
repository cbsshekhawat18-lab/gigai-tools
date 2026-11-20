"use client";

/**
 * vCard QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "vcard" content type so the form opens directly on the
 * full contact card (name, title, org, phone, email, website, address), seeds a
 * realistic example so the live preview renders a scannable code immediately, and
 * frames everything around "scan to save my contact". The heavy lifting: live
 * preview, color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) - all
 * comes from the shared QR Studio, which assembles the standard vCard 3.0 payload
 * entirely in the browser (nothing is uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function VcardQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "vcard",
        lockType: true,
        // Seed a friendly, complete example so the live preview shows a real,
        // scannable contact card the moment the tool loads, users overwrite it
        // with their own details.
        defaultFields: {
          firstName: "Alex",
          lastName: "Rivera",
          title: "Product Designer",
          org: "GigAI Studio",
          phone: "+15551234567",
          email: "alex@example.com",
          website: "https://example.com",
          city: "San Francisco",
          country: "USA",
        },
        // A soft, on-brand default look tuned for a printed contact card / badge;
        // every value stays fully editable in the Design tab. A vCard carries a
        // lot of data and often gets a centre logo, so start at higher error
        // correction to keep the denser code reliably scannable.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          errorCorrection: "Q",
        },
        filename: "vcard-qr-code",
      }}
    />
  );
}
