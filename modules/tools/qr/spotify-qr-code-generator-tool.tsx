"use client";

/**
 * Spotify QR Code Generator, the interactive workspace.
 *
 * A thin, single-purpose preset over the desktop-grade {@link QRToolPage}:
 * it locks the studio to the "spotify" content type so the form opens directly
 * on a Spotify share link, seeds a real playlist example so the preview renders
 * a scannable code on load, and frames everything around "scan to listen". The
 * heavy lifting, live preview, color/gradient/dot/eye customization, cover-art
 * logo drop-in, real-time scan/contrast validation, drag-drop/paste/copy/share
 * and every print-ready export (PNG, transparent PNG, SVG, PDF, JPG, WEBP, EPS
 * at up to 4096px): all comes from the shared QR Studio, which encodes the real
 * Spotify URL entirely in the browser (nothing is uploaded, no scan tracking).
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr/qr-tool-page";

export default function SpotifyQrCodeGeneratorTool({ tool }: ImageToolProps) {
  return (
    <QRToolPage
      tool={tool}
      preset={{
        contentType: "spotify",
        lockType: true,
        // Seed a real public Spotify playlist so the live preview renders a
        // scannable "scan to listen" code the instant the tool loads, users
        // paste their own track, album, artist or playlist link over it.
        defaultFields: {
          url: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
        },
        // A warm, on-brand default look tuned to sit next to cover art on a
        // printed "scan to listen" card; every value stays editable in Design.
        defaultStyle: {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          // Cover art in the centre is common here, so start with the higher
          // error correction that keeps a logo'd code scannable.
          errorCorrection: "Q",
        },
        filename: "spotify-qr-code",
      }}
    />
  );
}
