"use client";

/**
 * Telegram QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "telegram" content type so the form opens directly on
 * the username / link field, seeds a friendly public-channel example, and frames
 * everything around "scan to open Telegram". The heavy lifting, live preview,
 * color/gradient/dot/eye customization, logo drop-in, real-time scan/contrast
 * validation, drag-drop/paste/copy/share and every export (PNG, transparent PNG,
 * SVG, PDF, JPG, WEBP, EPS at up to 4096px). All comes from the shared QR
 * Studio, which builds the https://t.me/… payload entirely in the browser
 * (nothing is ever uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function TelegramQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "telegram",
        lockType: true,
        // Seed a real, public example so the live preview renders a scannable
        // t.me code the moment the tool loads: users overwrite it with their
        // own @username or invite link.
        defaultFields: {
          username: "durov",
        },
        // An on-brand Telegram-blue default tuned for a "scan to open Telegram"
        // card or overlay; every value stays fully editable in the Design tab.
        defaultStyle: {
          fgColor: "#229ED9",
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A centre avatar/logo is common for channel codes, so start with the
          // higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "telegram-qr-code",
      }}
    />
  );
}
