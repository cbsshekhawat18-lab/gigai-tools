"use client";

/**
 * Discord QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "discord" content type so the form opens directly
 * on the invite-link field, seeds a friendly example invite, and frames
 * everything around "scan to join". The heavy lifting, live preview,
 * color/gradient/dot/eye customization, server-logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every export
 * (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px). All comes
 * from the shared QR Studio, which encodes the invite URL entirely in the
 * browser (the link is never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function DiscordQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "discord",
        lockType: true,
        // Seed a sample invite so the live preview renders a real, scannable
        // code the instant the tool loads, users overwrite it with their own
        // discord.gg link.
        defaultFields: {
          url: "https://discord.gg/discord-developers",
        },
        // An on-brand default look tuned for a printed / on-stream "scan to
        // join" card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre logo is common for community codes, so start with the
          // higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "discord-qr-code",
      }}
    />
  );
}
