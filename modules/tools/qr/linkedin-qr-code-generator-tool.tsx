"use client";

/**
 * LinkedIn QR Code Generator: the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "linkedin" content type so the form opens directly
 * on a single LinkedIn URL field (profile, company page or post), seeds a real
 * example so the live preview renders a scannable code on load, and frames
 * everything around "connect on LinkedIn". The heavy lifting: live preview,
 * color/gradient/dot/eye customization, headshot/logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) - all
 * comes from the shared QR Studio, which encodes the plain LinkedIn link
 * entirely in the browser (nothing is uploaded and no scan is ever tracked).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function LinkedinQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "linkedin",
        lockType: true,
        // Seed a realistic profile URL so the preview shows a real, scannable
        // code the instant the tool loads, users overwrite it with their own
        // profile, company page or post link.
        defaultFields: {
          url: "https://www.linkedin.com/in/your-name",
        },
        // An on-brand default look: LinkedIn-blue foreground with soft rounded
        // dots/eyes, tuned for a business card or badge. Higher error correction
        // keeps a centred headshot/logo scannable. Every value stays editable.
        defaultStyle: {
          fgColor: "#0A66C2",
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          errorCorrection: "Q",
        },
        filename: "linkedin-qr-code",
      }}
    />
  );
}
