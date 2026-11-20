"use client";

/**
 * WiFi QR Code Generator: the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "wifi" content type so the form opens directly on
 * SSID / security / password / hidden, seeds sensible guest-network defaults,
 * and frames everything around "scan to connect". The heavy lifting, live
 * preview, color/gradient/dot/eye customization, logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) -
 * all comes from the shared QR Studio, which encodes the standard WIFI: payload
 * entirely in the browser (the password is never uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function WifiQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "wifi",
        lockType: true,
        // Seed a friendly guest-network example so the live preview renders a
        // real, scannable code the moment the tool loads, users overwrite it
        // with their own SSID and password.
        defaultFields: {
          ssid: "Guest-WiFi",
          encryption: "WPA",
          password: "welcome123",
          hidden: false,
        },
        // A soft, on-brand default look tuned for a printed "scan to connect"
        // card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // A logo in the centre is common for Wi-Fi cards, so start with the
          // higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "wifi-qr-code",
      }}
    />
  );
}
