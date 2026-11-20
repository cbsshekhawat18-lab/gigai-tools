"use client";

/**
 * Zoom QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "zoom" content type so the form opens directly on
 * the meeting join URL, seeds a realistic one-click link (with an embedded
 * passcode) so the live preview renders a scannable code immediately, and frames
 * everything around "scan to join". The heavy lifting, live preview,
 * color/gradient/dot/eye customization, logo drop-in, real-time scan/contrast
 * validation, drag-drop/paste/copy/share and every print- and slide-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) - all
 * comes from the shared QR Studio, which encodes the Zoom URL entirely in the
 * browser (the link is never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function ZoomQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "zoom",
        lockType: true,
        // Seed a realistic one-click join link (Meeting ID + embedded ?pwd=
        // passcode) so the preview shows a real, scannable code the instant the
        // tool loads, users paste their own Zoom link over it.
        defaultFields: {
          url: "https://zoom.us/j/1234567890?pwd=Example1PasscodeToken",
        },
        // A soft, on-brand default look tuned for a "scan to join" slide/card;
        // every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A logo in the centre is common for event codes, so start at the
          // higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "zoom-qr-code",
      }}
    />
  );
}
