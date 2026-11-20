"use client";

/**
 * YouTube QR Code Generator: the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "youtube" content type so the form opens directly
 * on the YouTube URL, seeds a real channel link so the live preview renders a
 * scannable code immediately, and frames everything around "scan to subscribe".
 * The heavy lifting: live preview, color/gradient/dot/eye customization, logo
 * or avatar drop-in, real-time scan/contrast validation, drag-drop/paste/copy/
 * share and every print- and overlay-ready export (PNG, transparent PNG, SVG,
 * PDF, JPG, WEBP, EPS at up to 4096px). All comes from the shared QR Studio,
 * which normalises and encodes the link entirely in the browser (nothing is
 * uploaded). This is a static QR: it points at the exact URL you paste.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function YoutubeQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "youtube",
        lockType: true,
        // Seed a real channel link so the preview renders a scannable code the
        // moment the tool loads, users overwrite it with their own URL.
        defaultFields: {
          url: "https://www.youtube.com/@YouTube",
        },
        // An on-brand YouTube-red default look tuned for a "scan to subscribe"
        // card; every value stays fully editable in the Design tab.
        defaultStyle: {
          fgColor: "#FF0000",
          bgColor: "#FFFFFF",
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo/avatar is common for channel codes, so start with the
          // higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "youtube-qr-code",
      }}
    />
  );
}
