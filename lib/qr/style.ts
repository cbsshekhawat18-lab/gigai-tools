/**
 * GigAI Tools, QR style model.
 *
 * A single, UI-friendly `QRStyleConfig` that fully describes a QR's look, plus
 * `toQrCodeStylingOptions()` mapping it to the exact shape qr-code-styling
 * expects. Pure and framework-free. No imports of the render lib here, only
 * its option types are re-declared minimally so this file stays lightweight and
 * tree-shakeable.
 *
 * DOT / EYE STYLE MAPPING (honest):
 *   qr-code-styling offers a fixed vocabulary of dot & corner shapes. We expose
 *   friendlier names and map each to the CLOSEST supported primitive:
 *     Dot style   Square→"square"  Rounded→"rounded"  Dots→"dots"
 *                 Classy→"classy"  ExtraRounded→"extra-rounded"
 *                 (there is no separate "diamond"; ClassyRounded→"classy-rounded")
 *     Eye frame   Square→"square"  Rounded→"extra-rounded"  Circle/Dot→"dot"
 *     Eye dot     Square→"square"  Rounded→"rounded"  Circle/Dot→"dot"
 *   Anything outside the vocabulary falls back to the nearest match, never an
 *   invalid value, so the render never silently breaks.
 */

/* ---- qr-code-styling option primitives (kept local, no runtime import) ---- */
type QcsDotType = "dots" | "rounded" | "classy" | "classy-rounded" | "square" | "extra-rounded";
type QcsCornerSquareType = "dot" | "square" | "extra-rounded" | QcsDotType;
type QcsCornerDotType = "dot" | "square" | QcsDotType;
type QcsGradient = {
  type: "linear" | "radial";
  rotation?: number;
  colorStops: { offset: number; color: string }[];
};

/** The options subset we actually populate for qr-code-styling. */
export interface QrCodeStylingOptions {
  width: number;
  height: number;
  type: "canvas" | "svg";
  data: string;
  margin: number;
  image?: string;
  qrOptions: { errorCorrectionLevel: "L" | "M" | "Q" | "H" };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
    crossOrigin?: string;
  };
  dotsOptions: { type: QcsDotType; color: string; gradient?: QcsGradient };
  cornersSquareOptions?: { type: QcsCornerSquareType; color: string; gradient?: QcsGradient };
  cornersDotOptions?: { type: QcsCornerDotType; color: string; gradient?: QcsGradient };
  backgroundOptions: { color: string; round?: number; gradient?: QcsGradient };
}

/* ------------------------------ UI-facing types --------------------------- */

export type QRErrorCorrection = "L" | "M" | "Q" | "H";

/** User-facing dot vocabulary (mapped to qr-code-styling below). */
export type QRDotStyle = "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";

/** User-facing eye-frame vocabulary. */
export type QREyeFrameStyle = "square" | "rounded" | "circle" | "extra-rounded" | "dot";

/** User-facing eye-center (dot) vocabulary. */
export type QREyeDotStyle = "square" | "rounded" | "circle" | "dot";

export interface QRGradient {
  type: "linear" | "radial";
  /** Start color (offset 0). */
  from: string;
  /** End color (offset 1). */
  to: string;
  /** Rotation in radians (linear only). Default 0. */
  rotation?: number;
}

export interface QRLogo {
  /** Data URL (data:image/...) of the logo to embed. */
  dataUrl: string;
  /** Fraction of the QR the logo covers, 0.1–0.5 (default 0.25). */
  sizeRatio?: number;
  /** Quiet gap in px around the logo (default 6). */
  margin?: number;
  /** Punch a hole in the dots behind the logo (default true). */
  hideBackgroundDots?: boolean;
  /** Round the logo's corners in composed output (used by render.ts). */
  rounded?: boolean;
  /** Draw a border ring around the logo (used by render.ts). */
  border?: boolean;
}

/** Decorative frame drawn AROUND the QR (composed in render.ts, not by qcs). */
export interface QRFrame {
  style: "none" | "square" | "rounded" | "scan-me" | "circle";
  /** Optional call-to-action label (e.g. "SCAN ME"). */
  label?: string;
  /** Frame + label color. */
  color?: string;
  /** Label text color (defaults to bg for contrast). */
  textColor?: string;
}

/** The complete, normalized description of a QR's appearance. */
export interface QRStyleConfig {
  fgColor: string;
  bgColor: string;
  /** Render the background transparent (overrides bgColor at export). */
  transparentBg?: boolean;
  /** Optional gradient applied to the dots (overrides fgColor when set). */
  gradient?: QRGradient;
  dotStyle: QRDotStyle;
  eyeFrameStyle: QREyeFrameStyle;
  eyeDotStyle: QREyeDotStyle;
  /** Eye color; falls back to fgColor when omitted. */
  eyeColor?: string;
  /** Quiet-zone margin in px (default 16). */
  margin: number;
  errorCorrection: QRErrorCorrection;
  logo?: QRLogo;
  frame?: QRFrame;
  /** Corner radius of the QR background (px), applied via backgroundOptions.round as a fraction. */
  borderRadius?: number;
}

/** A sensible, high-contrast, highly-scannable default. */
export const DEFAULT_QR_STYLE: QRStyleConfig = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  transparentBg: false,
  dotStyle: "square",
  eyeFrameStyle: "square",
  eyeDotStyle: "square",
  margin: 16,
  errorCorrection: "M",
  borderRadius: 0,
};

/* ------------------------------- mappings --------------------------------- */

const DOT_MAP: Record<QRDotStyle, QcsDotType> = {
  square: "square",
  rounded: "rounded",
  dots: "dots",
  classy: "classy",
  "classy-rounded": "classy-rounded",
  "extra-rounded": "extra-rounded",
};

const EYE_FRAME_MAP: Record<QREyeFrameStyle, QcsCornerSquareType> = {
  square: "square",
  rounded: "extra-rounded",
  "extra-rounded": "extra-rounded",
  circle: "dot",
  dot: "dot",
};

const EYE_DOT_MAP: Record<QREyeDotStyle, QcsCornerDotType> = {
  square: "square",
  rounded: "rounded",
  circle: "dot",
  dot: "dot",
};

/** Build a qr-code-styling gradient from our normalized gradient. */
function toGradient(g: QRGradient): QcsGradient {
  return {
    type: g.type,
    rotation: g.type === "linear" ? g.rotation ?? 0 : undefined,
    colorStops: [
      { offset: 0, color: g.from },
      { offset: 1, color: g.to },
    ],
  };
}

/**
 * Map a normalized `QRStyleConfig` + payload + pixel size to the exact options
 * object qr-code-styling's constructor/`update` accepts.
 *
 * `renderType` picks the draw backend ("canvas" for raster export/preview,
 * "svg" for vector export). Transparency is handled at EXPORT time (render.ts),
 * not here: for canvas we always feed a solid bg so the on-screen preview is
 * predictable; export.ts strips it for transparent PNG/SVG.
 */
export function toQrCodeStylingOptions(
  payload: string,
  style: QRStyleConfig,
  size: number,
  renderType: "canvas" | "svg" = "canvas",
): QrCodeStylingOptions {
  const eyeColor = style.eyeColor ?? style.fgColor;
  const dotGradient = style.gradient ? toGradient(style.gradient) : undefined;
  const logoRatio = style.logo ? Math.min(0.5, Math.max(0.1, style.logo.sizeRatio ?? 0.25)) : undefined;
  // borderRadius (px) → fraction of size for backgroundOptions.round (0–1).
  const round = style.borderRadius && size > 0
    ? Math.min(1, Math.max(0, style.borderRadius / (size / 2)))
    : 0;

  const options: QrCodeStylingOptions = {
    width: size,
    height: size,
    type: renderType,
    data: payload,
    margin: Math.max(0, style.margin),
    qrOptions: { errorCorrectionLevel: style.errorCorrection },
    dotsOptions: {
      type: DOT_MAP[style.dotStyle],
      color: style.fgColor,
      ...(dotGradient ? { gradient: dotGradient } : {}),
    },
    cornersSquareOptions: { type: EYE_FRAME_MAP[style.eyeFrameStyle], color: eyeColor },
    cornersDotOptions: { type: EYE_DOT_MAP[style.eyeDotStyle], color: eyeColor },
    backgroundOptions: { color: style.bgColor, round },
  };

  if (style.logo?.dataUrl && logoRatio !== undefined) {
    options.image = style.logo.dataUrl;
    options.imageOptions = {
      hideBackgroundDots: style.logo.hideBackgroundDots ?? true,
      imageSize: logoRatio,
      margin: style.logo.margin ?? 6,
    };
  }

  return options;
}
