/**
 * GigAI QR Studio, shared engine types.
 *
 * The design layer (`QRDesign`) is a single serialisable object that fully
 * describes a styled QR code: the encoded payload plus every visual knob. The
 * UI mutates a `QRDesign`, the render layer turns it into pixels/vectors, the
 * validate layer scores its scannability, and the export layer writes files.
 *
 * All types here are pure data (no DOM, no library imports) so they are safe to
 * import anywhere - server components, config, or the browser.
 */

/** Error-correction level: L(7%) M(15%) Q(25%) H(30%) recovery. */
export type QRErrorLevel = "L" | "M" | "Q" | "H";

/** The kind of real-world content a QR encodes. Drives which form is shown. */
export type QRContentType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "wifi"
  | "vcard"
  | "mecard"
  | "upi"
  | "geo"
  | "event"
  | "crypto"
  | "twitter"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "appstore"
  | "paypal"
  | "zoom";

/** Module (dot) rendering styles, aligned to qr-code-styling's `DotType`. */
export type QRDotStyle =
  | "square"
  | "rounded"
  | "extra-rounded"
  | "dots"
  | "classy"
  | "classy-rounded";

/** Eye (finder) frame styles, aligned to qr-code-styling's `CornerSquareType`. */
export type QREyeFrameStyle = "square" | "extra-rounded" | "dot";

/** Eye centre styles, aligned to qr-code-styling's `CornerDotType`. */
export type QREyeDotStyle = "square" | "dot" | "rounded" | "extra-rounded" | "classy" | "dots";

/** Overall QR silhouette. */
export type QRShape = "square" | "circle";

/** Gradient descriptor for foreground or background fills. */
export interface QRGradient {
  type: "linear" | "radial";
  /** Rotation in degrees for linear gradients. */
  rotation: number;
  from: string;
  to: string;
}

/** A decorative frame/caption wrapped around the QR (a "call-to-action"). */
export type QRFrameStyle =
  | "none"
  | "bottom-label"
  | "top-label"
  | "rounded-border"
  | "phone"
  | "speech"
  | "banner";

/** Logo / centre-image overlay. */
export interface QRLogo {
  /** Data URL of the logo image (PNG/SVG/JPG/WEBP). */
  src: string;
  /** Fraction of the QR the logo occupies (0.1–0.5). */
  size: number;
  /** Quiet padding (in module units) around the logo. */
  margin: number;
  /** Punch a clean hole in the pattern behind the logo for reliability. */
  hideBackgroundDots: boolean;
}

/** Foreground styling for the QR modules and eyes. */
export interface QRForeground {
  color: string;
  gradient: QRGradient | null;
  dotStyle: QRDotStyle;
  eyeFrameStyle: QREyeFrameStyle;
  eyeDotStyle: QREyeDotStyle;
  /** Override eye color; null inherits the module color. */
  eyeColor: string | null;
}

/** Background styling. */
export interface QRBackground {
  color: string;
  gradient: QRGradient | null;
  /** Transparent background (checkerboard preview; alpha in PNG/SVG). */
  transparent: boolean;
  /** Corner rounding of the background plate (0–50, as a % of side). */
  round: number;
}

/** Frame / caption around the code. */
export interface QRFrame {
  style: QRFrameStyle;
  text: string;
  color: string;
  textColor: string;
}

/**
 * The complete, serialisable description of a styled QR code. Everything the
 * studio produces is a function of this object.
 */
export interface QRDesign {
  /** The exact string a scanner will read. Built by the content layer. */
  data: string;
  errorLevel: QRErrorLevel;
  /** Quiet-zone margin in modules. */
  margin: number;
  shape: QRShape;
  foreground: QRForeground;
  background: QRBackground;
  logo: QRLogo | null;
  frame: QRFrame;
}

/** Uniform result envelope used across the engine (mirrors lib/dev/*). */
export type QRResult<T> =
  | { ok: true; result: T }
  | { ok: false; error: { message: string } };

/** The raster/vector output formats the exporter can write. */
export type QRExportFormat = "png" | "svg" | "jpeg" | "webp" | "pdf" | "eps";
