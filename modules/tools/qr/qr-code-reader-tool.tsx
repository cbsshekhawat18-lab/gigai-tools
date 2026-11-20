"use client";

/**
 * QR Code Reader, tool UI.
 *
 * A pure *decode* experience framed image-first: read a QR out of a picture you
 * already have (drag-drop, file choose or clipboard paste), with an optional
 * webcam path. It's driven through the universal {@link QRToolPage} with
 * `scanner: true`, the platform's single entry point for read/decode tools, so
 * this stays a thin, DRY wrapper and inherits the shared scanner's typed result
 * parsing, copy/open actions, dark-mode, responsive layout and a11y handling -
 * all 100% in-browser (jsQR on raw canvas pixels), nothing uploaded.
 */

import type { ImageToolProps } from "@/components/tool/types";
import { QRToolPage } from "@/components/tool/qr";

export default function QrCodeReaderTool({ tool }: ImageToolProps) {
  return <QRToolPage tool={tool} preset={{ scanner: true, filename: tool.slug }} />;
}
