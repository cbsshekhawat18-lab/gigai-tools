/**
 * Quality Evaluator; how much did hitting the target actually cost?
 *
 * This is deliberately a MEASURED verdict, not a guess dressed as one. It reads
 * the real numbers from the result (pixels kept, bitrate kept, bytes kept) and
 * bands them. It never invents a percentage, and it never says "Excellent" for
 * an output that lost three quarters of its pixels.
 *
 * The bands are intentionally conservative: it is far better to warn someone
 * their file looks rough and be over-cautious than to call a mangled image
 * "Excellent" and have them send it to a client.
 */

import type { FitResult, QualityVerdict } from "./types";
import { formatSize, reductionPercent } from "./types";

export function evaluateQuality(result: FitResult): QualityVerdict {
  if (result.outcome === "already-small") {
    return {
      band: "excellent",
      label: "Untouched",
      detail: "The file was already under your target, so it was left exactly as it was. No re-encoding, no quality lost.",
    };
  }
  if (result.outcome === "grew") {
    return {
      band: "excellent",
      label: "Untouched",
      detail: "Every compressed version came out larger than the original, so the original was kept. Nothing was degraded.",
    };
  }

  const { source, facts } = result;

  // Pixels kept, the single strongest signal for images and video, because
  // resolution loss is what people actually notice.
  let pixelRatio = 1;
  if (source.width && source.height && facts.width && facts.height) {
    pixelRatio = (facts.width * facts.height) / (source.width * source.height);
  }

  const bitrateRatio =
    source.bitrate && facts.bitrate ? facts.bitrate / source.bitrate : 1;

  const quality = facts.quality ?? 1;
  const byteRatio = source.bytes > 0 ? result.size / source.bytes : 1;

  // The worst of the available signals decides the band. Averaging would let a
  // good score on one axis mask a bad one on another, exactly the failure mode
  // that produces a confident "Excellent" over a ruined file.
  const score = Math.min(pixelRatio, bitrateRatio, quality, Math.max(byteRatio, 0.08) * 2.2);

  if (score >= 0.62) {
    return {
      band: "excellent",
      label: "Excellent",
      detail: describe(result, "Most of the original detail is intact. This will look right to a normal viewer."),
    };
  }
  if (score >= 0.3) {
    return {
      band: "noticeable",
      label: "Noticeable",
      detail: describe(result, "Some detail was given up to hit the target. Fine for sharing and messaging. Check it before printing or archiving."),
    };
  }
  return {
    band: "heavy",
    label: "Heavy degradation",
    detail: describe(result, "A lot of quality was traded away to reach this size. Consider allowing a larger target if the file matters."),
  };
}

function describe(result: FitResult, verdict: string): string {
  const saved = reductionPercent(result.source.bytes, result.size);
  return `${formatSize(result.source.bytes)} → ${formatSize(result.size)}, ${saved.toFixed(1)}% smaller. ${verdict}`;
}

/* ── Destination presets ──────────────────────────────────────────────────── */

export interface SizePreset {
  id: string;
  label: string;
  bytes: number;
  hint: string;
}

/**
 * Real platform limits, kept deliberately a little under the published cap so a
 * result actually uploads rather than landing one kilobyte over it.
 */
export const PRESETS: SizePreset[] = [
  { id: "email", label: "Email", bytes: 20 * 1024 * 1024, hint: "Most mail servers reject attachments above ~25 MB" },
  { id: "whatsapp", label: "WhatsApp", bytes: 15 * 1024 * 1024, hint: "WhatsApp caps documents and media around 16 MB" },
  { id: "discord", label: "Discord", bytes: 9 * 1024 * 1024, hint: "Discord's free upload limit is 10 MB" },
  { id: "web", label: "Web upload", bytes: 2 * 1024 * 1024, hint: "A good ceiling for images on a fast-loading page" },
];
