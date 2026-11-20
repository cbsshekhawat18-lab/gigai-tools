"use client";

/**
 * QR Studio, per-tool page wrapper.
 *
 * Given a small `preset`, renders a {@link QRStudio} tuned for one specific tool
 * (e.g. the Wi-Fi tool opens on the Wi-Fi form, locked). This is what makes each
 * of the many QR tool UIs a ~15–40 line file: they just export a preset.
 *
 * A preset can also flag `scanner: true` to render the {@link QRScanner} instead
 * (for the read/decode tools), so every QR tool page shares one entry point.
 */

import * as React from "react";

import type { AccentKey } from "@/types";
import type { QRContentType, QRFields } from "@/lib/qr/content";
import type { QRStyleConfig } from "@/lib/qr/style";
import type { ImageToolProps } from "@/components/tool/types";
import { QRStudio } from "./qr-studio";
import { QRScanner } from "./qr-scanner";

/** A tool's tuning of the studio. */
export interface QRToolPreset {
  /** Content type the tool opens on. */
  contentType?: QRContentType;
  /** Lock the type picker (single-purpose tools). Default true when contentType is set. */
  lockType?: boolean;
  /** Seed field values. */
  defaultFields?: QRFields;
  /** Seed style overrides. */
  defaultStyle?: Partial<QRStyleConfig>;
  /** Offer the CSV → ZIP batch panel. */
  enableBatch?: boolean;
  /** Base download file name (no extension). */
  filename?: string;
  /** Render the scanner/reader instead of the generator. */
  scanner?: boolean;
}

/** Props for {@link QRToolPage}. */
export interface QRToolPageProps extends ImageToolProps {
  preset?: QRToolPreset;
}

/**
 * The universal QR tool page. Reads the tool's accent from the registry and
 * applies the preset. With no preset it opens the full multi-type studio (the
 * flagship "QR generator" experience).
 */
export function QRToolPage({ tool, preset = {} }: QRToolPageProps) {
  const accent = (tool.accent ?? "indigo") as AccentKey;

  if (preset.scanner) {
    return <QRScanner />;
  }

  const locked = preset.lockType ?? Boolean(preset.contentType);

  return (
    <QRStudio
      contentType={preset.contentType}
      lockType={locked}
      defaultFields={preset.defaultFields}
      defaultStyle={preset.defaultStyle}
      enableBatch={preset.enableBatch}
      accent={accent}
      filename={preset.filename ?? tool.slug}
    />
  );
}

export default QRToolPage;
