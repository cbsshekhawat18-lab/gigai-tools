"use client";

/**
 * Dynamic QR Code Generator, the interactive workspace.
 *
 * An HONEST, single-purpose preset over the desktop-grade {@link QRToolPage},
 * locked to the "url" content type. A truly editable-after-print "dynamic" QR
 * requires a hosted redirect endpoint + database behind a login, infrastructure
 * this platform intentionally does not run (no server, no accounts, no
 * persistence). So rather than fake editing-after-print, this tool delivers the
 * part that genuinely IS dynamic and that the user can own: it encodes a short
 * redirect link the USER controls, so they re-point the destination on their own
 * side without ever reprinting the code.
 *
 * The heavy lifting: live preview, color/gradient/dot/eye customization, logo
 * drop-in, real-time scan/contrast validation, drag-drop/paste/copy/share and
 * every print-ready export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up
 * to 4096px); all comes from the shared QR Studio, which encodes the URL
 * entirely in the browser (the link is never uploaded).
 *
 * We keep this component a thin wrapper (per the platform's DRY rule): the
 * studio owns the workspace; here we hand it a preset tuned for a reusable,
 * brandable redirect code and let the registry accent flow through.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function DynamicQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "url",
        lockType: true,
        // Seed an owner-controlled redirect example so the live preview renders a
        // real, scannable code immediately, and the placeholder itself models
        // the recommended pattern (a short path on a domain you own). Users
        // overwrite it with their own redirect link.
        defaultFields: { url: "https://gigai.tools/go" },
        // A confident, on-brand default look tuned for a reusable printed code;
        // every value stays fully editable in the Design tab. Error correction
        // starts at H so a centre logo (common on branded codes) stays scannable
        // and the print survives wear.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          errorCorrection: "H",
        },
        filename: "dynamic-qr-code",
      }}
    />
  );
}
