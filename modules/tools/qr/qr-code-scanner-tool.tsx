"use client";

/**
 * QR Code Scanner: tool UI.
 *
 * A pure *decode* experience: live webcam scanning, image upload / drag-drop,
 * and clipboard paste, all via the studio's {@link QRScanner} (getUserMedia +
 * jsQR, 100% in-browser). We drive it through the universal {@link QRToolPage}
 * with `scanner: true`, which is the platform's single entry point for the
 * read/decode tools, so this tool stays a thin, DRY wrapper and inherits the
 * shared scanner's typed result parsing, copy/open actions, dark-mode,
 * responsive layout and a11y handling.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr";

export default function QrCodeScannerTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={{ scanner: true, filename: tool.slug }} />;
}
