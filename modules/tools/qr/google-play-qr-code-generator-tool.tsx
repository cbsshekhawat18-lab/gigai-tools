"use client";

/**
 * Google Play QR Code Generator: the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "googlePlay" content type so the form opens directly
 * on "Google Play URL", seeds a real listing link so the live preview renders a
 * genuine, scannable code on load, and frames everything around "scan to
 * install" on Android. The heavy lifting: live preview,
 * color/gradient/dot/eye customization, app-icon/logo drop-in, real-time
 * scan/contrast validation, drag-drop/paste/copy/share and every print-ready
 * export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS at up to 4096px) - all
 * comes from the shared QR Studio, which encodes the exact play.google.com URL
 * entirely in the browser (nothing about the app is ever uploaded).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function GooglePlayQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "googlePlay",
        lockType: true,
        // Seed a real, resolvable Play listing so the preview shows a genuine
        // scannable code the instant the tool loads: users overwrite it with
        // their own app's URL.
        defaultFields: {
          url: "https://play.google.com/store/apps/details?id=com.google.android.apps.maps",
        },
        // A soft, on-brand default look tuned for a printed "scan to install"
        // card; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // An app icon in the centre is common for install codes, so start with
          // the higher error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "google-play-qr-code",
      }}
    />
  );
}
