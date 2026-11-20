"use client";

/**
 * Video QR Code Generator: the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "video" content type so the form opens directly on a
 * single "hosted/streamed video URL" field, seeds a neutral example link so the
 * live preview renders a real, scannable code on load, and frames everything
 * around "scan to watch". The heavy lifting, live preview, color / gradient /
 * dot / eye customization, logo drop-in, real-time scan + contrast validation,
 * drag-drop / paste / copy / share and every print-ready export (PNG,
 * transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px). All comes from
 * the shared QR Studio, which builds the payload entirely in the browser.
 *
 * Honest boundary: this encodes a LINK to a video the user hosts elsewhere. It
 * never uploads or hosts the video itself, and the resulting QR is static.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function VideoQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "video",
        lockType: true,
        // Seed a neutral direct-MP4 example so the preview renders a real,
        // scannable code immediately: users replace it with their own hosted
        // video link (CDN, Vimeo, Loom, Drive share, etc.).
        defaultFields: {
          url: "https://example.com/product-demo.mp4",
        },
        // A soft, on-brand default look tuned for a printed "scan to watch"
        // card; every value stays editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo / play mark is common on video codes, so start at the
          // higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "video-qr-code",
      }}
    />
  );
}
