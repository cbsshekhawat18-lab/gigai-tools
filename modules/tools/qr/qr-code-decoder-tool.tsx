"use client";

/**
 * QR Code Decoder, tool UI.
 *
 * A paste-first *decode* experience for developers, QA and support: bring a code
 * in via clipboard paste, drag-drop, file upload or the live webcam, and read
 * the exact raw payload plus a scheme-aware parsed breakdown. It's driven through
 * the universal {@link QRToolPage} with `scanner: true`, the platform's single
 * entry point for the read/decode tools, so this stays a thin, DRY wrapper over
 * the shared {@link QRScanner} (getUserMedia + jsQR, 100% in-browser) and
 * inherits its raw-string-first result view, typed field parsing, copy/open
 * actions, dark-mode, responsive layout and a11y handling.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr";

export default function QrCodeDecoderTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={{ scanner: true, filename: tool.slug }} />;
}
