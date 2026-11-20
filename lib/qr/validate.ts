/**
 * GigAI QR Studio: scannability validation.
 *
 * A QR can be beautiful and still unscannable. This module scores a
 * {@link QRStyleConfig} + payload against the practical rules that make codes
 * reliable in the wild: enough foreground/background contrast, a sane logo
 * footprint for the chosen error-correction level, a big-enough quiet zone, and
 * a payload that isn't so long it forces a dense (hard-to-scan) matrix.
 *
 * Pure and synchronous, color maths only, no DOM. The UI surfaces the result
 * as a live "scan-test" badge and inline warnings.
 */

import type { QRStyleConfig, QRErrorCorrection } from "./style";
import { decodeFromImageData } from "./decode";

/** One issue found while validating a design. */
export interface QRValidationIssue {
  level: "error" | "warning";
  message: string;
}

/** Result of {@link scanTest}. */
export interface QRScanReport {
  /** True when there are no blocking (error-level) issues. */
  scannable: boolean;
  /** WCAG-style contrast ratio between fg and bg (1–21). */
  contrast: number;
  /** All issues, most severe first. */
  issues: QRValidationIssue[];
}

/* ----------------------------- color maths ----------------------------- */

/** Parse #rgb / #rrggbb (and 8-digit alpha) to [r,g,b] 0–255, or null. */
function parseHex(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3 || h.length === 4) {
    h = h
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length === 6 || h.length === 8) {
    const r = Number.parseInt(h.slice(0, 2), 16);
    const g = Number.parseInt(h.slice(2, 4), 16);
    const b = Number.parseInt(h.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return [r, g, b];
  }
  return null;
}

/** Relative luminance (WCAG 2.1) of an sRGB color. */
function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two colors (1–21). Unknown colors → 1. */
export function contrastRatio(a: string, b: string): number {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return 1;
  const la = luminance(ca);
  const lb = luminance(cb);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/* ----------------------------- constants ----------------------------- */

/** Rough max logo footprint (fraction of QR) that each ECL can survive. */
const MAX_LOGO_RATIO: Record<QRStyleConfig["errorCorrection"], number> = {
  L: 0.1,
  M: 0.18,
  Q: 0.25,
  H: 0.3,
};

/** Payload byte length beyond which the matrix gets dense, nudge ECL down/up. */
const DENSE_BYTES = 900;
const VERY_DENSE_BYTES = 1800;

/* ----------------------------- validation ----------------------------- */

/**
 * Score a design's real-world scannability. `payload` may be empty (returns a
 * clean report with no content warning. The UI decides what "empty" means).
 */
export function scanTest(style: QRStyleConfig, payload = ""): QRScanReport {
  const issues: QRValidationIssue[] = [];

  // 1) Contrast: the single biggest cause of unscannable "designer" QRs.
  const bg = style.transparentBg ? "#ffffff" : style.bgColor;
  const contrast = contrastRatio(style.fgColor, bg);
  if (contrast < 1.6) {
    issues.push({
      level: "error",
      message: `Foreground and background are too close (${contrast}:1). Scanners will fail: use a much darker foreground on a light background.`,
    });
  } else if (contrast < 3) {
    issues.push({
      level: "warning",
      message: `Low contrast (${contrast}:1). Aim for 3:1 or higher: some cameras in poor light will struggle.`,
    });
  }

  // 2) Inverted colors (light dots on dark bg), many scanners still expect
  // dark-on-light and fail on inverted codes.
  const fgLum = parseHex(style.fgColor) ? luminance(parseHex(style.fgColor)!) : 0;
  const bgLum = parseHex(bg) ? luminance(parseHex(bg)!) : 1;
  if (fgLum > bgLum) {
    issues.push({
      level: "warning",
      message: "Light modules on a dark background are inverted, many scanners expect dark-on-light and may not read it.",
    });
  }

  // 3) Logo footprint vs error correction.
  if (style.logo?.dataUrl) {
    const ratio = Math.min(0.5, Math.max(0.1, style.logo.sizeRatio ?? 0.25));
    const max = MAX_LOGO_RATIO[style.errorCorrection];
    if (ratio > max + 0.06) {
      issues.push({
        level: "error",
        message: `The logo covers ${Math.round(ratio * 100)}% of the code, too much for error-correction ${style.errorCorrection}. Shrink it or raise error correction to H.`,
      });
    } else if (ratio > max) {
      issues.push({
        level: "warning",
        message: `The logo is large for level ${style.errorCorrection}. Raise error correction to Q or H so the code stays reliable.`,
      });
    }
    if (style.logo.hideBackgroundDots === false && ratio > 0.15) {
      issues.push({
        level: "warning",
        message: "The logo overlaps live modules without clearing the dots behind it: enable the protected area for reliability.",
      });
    }
    if (style.errorCorrection === "L" && ratio > 0.1) {
      issues.push({
        level: "warning",
        message: "A logo with error-correction L is risky. Level H recovers ~30% and is recommended whenever a logo overlaps the code.",
      });
    }
  }

  // 4) Quiet zone.
  if (style.margin < 8) {
    issues.push({
      level: style.margin <= 2 ? "error" : "warning",
      message: `Quiet-zone margin is small (${style.margin}px). QR codes need a clear border. Use at least 16px (≈4 modules) so scanners can lock on.`,
    });
  }

  // 5) Payload density.
  const bytes = payload ? new TextEncoder().encode(payload).length : 0;
  if (bytes > VERY_DENSE_BYTES) {
    issues.push({
      level: "error",
      message: `The content is very long (${bytes.toLocaleString()} bytes). The matrix becomes tiny and dense: shorten the text or link to it instead.`,
    });
  } else if (bytes > DENSE_BYTES) {
    issues.push({
      level: "warning",
      message: `Long content (${bytes.toLocaleString()} bytes) makes a dense pattern. Consider a shorter payload or a URL, and print larger.`,
    });
  }

  // Sort errors before warnings for display.
  issues.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));

  return {
    scannable: !issues.some((i) => i.level === "error"),
    contrast,
    issues,
  };
}

/** Convenience: does this design pass with no blocking errors? */
export function isScannable(style: QRStyleConfig, payload = ""): boolean {
  return scanTest(style, payload).scannable;
}

/* ---------------------- error-correction recommendation ------------------- */

const EC_RANK: Record<QRErrorCorrection, number> = { L: 0, M: 1, Q: 2, H: 3 };

/**
 * Recommend the minimum error-correction level for a design. A logo overlays
 * (destroys) modules, so the bigger the logo the higher the EC needed to keep
 * the code recoverable. Rough mapping by covered-area fraction (ratio²):
 * ≥0.2 width → H, ≥0.15 → Q, else M. No logo → M (a sensible everyday default).
 */
export function recommendErrorCorrection(hasLogo: boolean, logoRatio = 0): QRErrorCorrection {
  if (!hasLogo) return "M";
  const ratio = Math.min(0.5, Math.max(0, logoRatio));
  if (ratio >= 0.28) return "H";
  if (ratio >= 0.2) return "H";
  if (ratio >= 0.15) return "Q";
  return "M";
}

/**
 * Logo-vs-error-correction safety check. Returns actionable issues when the
 * logo is too large for the chosen EC, or when EC should be raised to keep the
 * code reliable. Empty array when there is no logo or all is well.
 */
export function logoSafeCheck(style: QRStyleConfig): QRValidationIssue[] {
  const issues: QRValidationIssue[] = [];
  if (!style.logo?.dataUrl) return issues;
  const ratio = Math.min(0.5, Math.max(0.05, style.logo.sizeRatio ?? 0.25));

  if (ratio > 0.35) {
    issues.push({
      level: "error",
      message: `Logo covers ${Math.round(ratio * 100)}% of the QR width, too large to stay scannable. Keep it under ~30%.`,
    });
  } else if (ratio > 0.3) {
    issues.push({
      level: "warning",
      message: `Logo is large (${Math.round(ratio * 100)}% of width). Use error-correction H and run a scan test.`,
    });
  }

  const recommended = recommendErrorCorrection(true, ratio);
  if (EC_RANK[style.errorCorrection] < EC_RANK[recommended]) {
    issues.push({
      level: "warning",
      message: `With this logo, raise error correction to ${recommended} (currently ${style.errorCorrection}) so scanners can recover the covered modules.`,
    });
  }
  return issues;
}

/* ------------------------ ground-truth canvas re-decode ------------------- */

/** Result of re-decoding a rendered QR straight off a canvas. */
export interface CanvasScanResult {
  /** True when jsQR could read the rendered code back. */
  scannable: boolean;
  /** The text decoded back, when scannable. */
  decoded?: string;
  /** True when the decoded text matches the expected payload (if provided). */
  matches?: boolean;
}

/**
 * The ground-truth "will this actually scan?" test: re-decode the RENDERED QR
 * off a canvas with jsQR. Unlike {@link scanTest} (which reasons about the style
 * statically), this proves the pixels are readable. Downscales huge canvases and
 * lays the QR on a white backing so transparent codes still decode. Optionally
 * verifies the decoded text equals the expected payload.
 */
export async function scanTestCanvas(
  canvas: HTMLCanvasElement,
  expected?: string,
): Promise<CanvasScanResult> {
  const maxDim = 1024;
  const scale = Math.min(1, maxDim / Math.max(canvas.width, canvas.height));
  const w = Math.max(1, Math.round(canvas.width * scale));
  const h = Math.max(1, Math.round(canvas.height * scale));

  const work = document.createElement("canvas");
  work.width = w;
  work.height = h;
  const ctx = work.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { scannable: false };
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(canvas, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const result = await decodeFromImageData(imageData);
  if (!result.ok) return { scannable: false };
  return {
    scannable: true,
    decoded: result.text,
    matches: expected === undefined ? undefined : result.text === expected,
  };
}
