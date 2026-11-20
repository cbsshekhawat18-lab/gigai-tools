"use client";

/**
 * PDF QR Code Generator: the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "pdf" content type so the form opens directly on a
 * single "PDF link" field, seeds an example link so the live preview renders a
 * real, scannable code on load, and frames everything around "scan to view PDF".
 *
 * The heavy lifting: live preview, color/gradient/dot/eye customization, logo
 * drop-in with auto error-correction guidance, real-time on-canvas scan +
 * contrast validation, drag-drop/paste/copy/share and every print-ready export
 * (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS up to 4096px). All comes from
 * the shared QR Studio, which encodes the URL entirely in the browser.
 *
 * Honest boundary: we never host or upload the document. The preset encodes the
 * link the user provides to a PDF they host themselves; the page copy points to
 * /pdf-tools for preparing the file before hosting it.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function PdfQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "pdf",
        lockType: true,
        // Seed a realistic hosted-PDF link so the preview renders a scannable
        // code immediately; users replace it with their own public URL.
        defaultFields: {
          url: "https://example.com/menu.pdf",
        },
        // A soft, on-brand default look for a printed "scan to view PDF" card;
        // every value stays fully editable in the Design tab. A centre logo is
        // common here, so start at higher error correction to keep it scannable.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          errorCorrection: "Q",
        },
        filename: "pdf-qr-code",
      }}
    />
  );
}
