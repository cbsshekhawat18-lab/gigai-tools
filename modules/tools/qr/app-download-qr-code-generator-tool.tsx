"use client";

/**
 * App Download QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}: it
 * locks the studio to the "appDownload" content type so the form opens directly
 * on the App Store / Google Play / fallback-URL inputs, seeds a friendly example
 * so the live preview renders a real, scannable code on load, and frames
 * everything around "download the app".
 *
 * The heavy lifting, live preview, color/gradient/dot/eye customization, app-
 * icon drop-in, real-time decode + WCAG contrast validation, drag-drop/paste/
 * copy/share and every print-ready export (PNG, transparent PNG, SVG, PDF, JPG,
 * WEBP, EPS up to 4096px): all comes from the shared QR Studio, which encodes
 * the single URL entirely in the browser (nothing is uploaded).
 *
 * HONEST NOTE: buildPayload("appDownload", …) returns the first present URL
 * (ios → android → fallback). A single QR is one fixed string, so it cannot
 * redirect by OS on its own; the studio copy makes this plain and points users
 * to a smart-link/landing page they control, or to two labelled store codes.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function AppDownloadQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "appDownload",
        lockType: true,
        // Seed a realistic example so the preview renders a real, scannable code
        // immediately: users overwrite these with their own store / smart links.
        defaultFields: {
          url: "https://example.com/get-the-app",
          ios: "https://apps.apple.com/app/id0000000000",
          android: "https://play.google.com/store/apps/details?id=com.example.app",
        },
        // A soft, on-brand default look tuned for an install poster or packaging
        // code; every value stays fully editable in the Design tab.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // App-icon-in-centre is common here, so start with the higher error
          // correction that keeps a logo'd code reliably scannable.
          errorCorrection: "Q",
        },
        filename: "app-download-qr-code",
      }}
    />
  );
}
