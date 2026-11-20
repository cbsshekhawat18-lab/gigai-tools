/**
 * GigAI Tools: QR code engine.
 *
 * Renders QR codes to a PNG data URL or inline SVG string via the `qrcode`
 * library (dynamic-imported). Colors, size, quiet-zone margin, and error-
 * correction level are configurable. Empty input returns a typed error.
 */

/** Error-correction level: L(7%) M(15%) Q(25%) H(30%) recovery. */
export type QrEcl = "L" | "M" | "Q" | "H";

export interface QrOptions {
  /** Output width/height in px for the PNG (default 512). */
  size?: number;
  /** Quiet-zone width in modules (default 4). */
  margin?: number;
  /** Error-correction level (default "M"). */
  ecl?: QrEcl;
  /** Foreground color (default "#000000"). */
  dark?: string;
  /** Background color (default "#ffffff"). */
  light?: string;
}

export type QrResult =
  | { ok: true; result: string }
  | { ok: false; error: { message: string } };

function baseOptions(opts: QrOptions) {
  return {
    errorCorrectionLevel: opts.ecl ?? "M",
    margin: opts.margin ?? 4,
    color: {
      dark: opts.dark ?? "#000000",
      light: opts.light ?? "#ffffff",
    },
  } as const;
}

/** Render `text` as a PNG data URL. */
export async function qrToDataUrl(text: string, opts: QrOptions = {}): Promise<QrResult> {
  if (!text) return { ok: false, error: { message: "Enter text to encode." } };
  try {
    const QRCode = (await import("qrcode")).default;
    const result = await QRCode.toDataURL(text, {
      ...baseOptions(opts),
      width: opts.size ?? 512,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** Render `text` as an inline SVG string (crisp at any scale). */
export async function qrToSvg(text: string, opts: QrOptions = {}): Promise<QrResult> {
  if (!text) return { ok: false, error: { message: "Enter text to encode." } };
  try {
    const QRCode = (await import("qrcode")).default;
    const result = await QRCode.toString(text, {
      ...baseOptions(opts),
      type: "svg",
      width: opts.size ?? 512,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}
