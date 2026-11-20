"use client";

/**
 * Business Card QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "vcard" content type so the form opens directly on
 * name / title / company / phone / email / website / address, seeds a realistic
 * example contact, and frames everything around "scan to save my details". The
 * heavy lifting, live preview, color/gradient/dot/eye customization, company
 * logo drop-in, real-time scan/contrast validation, drag-drop/paste/copy/share
 * and every print-ready export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS
 * at up to 4096px). All comes from the shared QR Studio, which encodes the
 * standard vCard 3.0 payload entirely in the browser (details never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function BusinessCardQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "vcard",
        lockType: true,
        // Seed a realistic example contact so the live preview renders a real,
        // scannable "Add Contact" card the moment the tool loads, users
        // overwrite it with their own details.
        defaultFields: {
          firstName: "Alex",
          lastName: "Morgan",
          org: "GigAI Studio",
          title: "Founder & Product Lead",
          phone: "+15551234567",
          email: "alex@example.com",
          website: "https://example.com",
        },
        // A soft, on-brand default look tuned for the back of a printed business
        // card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // vCards carry many fields, so start with higher error correction that
          // keeps a denser, logo'd contact code reliably scannable.
          errorCorrection: "Q",
        },
        filename: "business-card-qr-code",
      }}
    />
  );
}
