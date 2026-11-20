/**
 * GigAI Tools, 1D barcode engine.
 *
 * Renders barcodes to a PNG data URL via JsBarcode onto an offscreen canvas
 * (dynamic-imported). Supports the common 1D symbologies with per-format value
 * validation so users get a precise error instead of a broken image.
 * Client-only: it creates a `<canvas>`.
 */

/** Supported barcode symbologies. */
export type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "ITF14"
  | "MSI"
  | "pharmacode"
  | "codabar";

/** The list of formats the UI can offer. */
export const SUPPORTED_BARCODE_FORMATS: BarcodeFormat[] = [
  "CODE128",
  "CODE39",
  "EAN13",
  "EAN8",
  "UPC",
  "ITF14",
  "MSI",
  "pharmacode",
  "codabar",
];

export interface BarcodeOptions {
  format?: BarcodeFormat;
  /** Bar width in px (default 2). */
  width?: number;
  /** Bar height in px (default 100). */
  height?: number;
  /** Render the human-readable value below the bars (default true). */
  displayValue?: boolean;
  /** Foreground color (default "#000000"). */
  lineColor?: string;
  /** Background color (default "#ffffff"). */
  background?: string;
  /** Quiet-zone margin in px (default 10). */
  margin?: number;
}

export type BarcodeResult =
  | { ok: true; result: string }
  | { ok: false; error: { message: string } };

/** Validate a value against a format's requirements before rendering. */
function validateValue(value: string, format: BarcodeFormat): string | null {
  if (value.length === 0) return "Enter a value to encode.";
  switch (format) {
    case "EAN13":
      if (!/^\d{12,13}$/.test(value)) return "EAN-13 needs 12 or 13 digits.";
      return null;
    case "EAN8":
      if (!/^\d{7,8}$/.test(value)) return "EAN-8 needs 7 or 8 digits.";
      return null;
    case "UPC":
      if (!/^\d{11,12}$/.test(value)) return "UPC-A needs 11 or 12 digits.";
      return null;
    case "ITF14":
      if (!/^\d{13,14}$/.test(value)) return "ITF-14 needs 13 or 14 digits.";
      return null;
    case "MSI":
      if (!/^\d+$/.test(value)) return "MSI accepts digits only.";
      return null;
    case "pharmacode": {
      const n = Number(value);
      if (!/^\d+$/.test(value) || n < 3 || n > 131070) {
        return "Pharmacode must be a number between 3 and 131070.";
      }
      return null;
    }
    case "codabar":
      if (!/^[A-D]?[0-9\-$:/.+]+[A-D]?$/i.test(value)) {
        return "Codabar accepts digits and - $ : / . + with optional A–D start/stop.";
      }
      return null;
    case "CODE39":
      if (!/^[0-9A-Z\-. $/+%]+$/.test(value)) {
        return "CODE39 accepts A–Z, 0–9 and - . space $ / + %.";
      }
      return null;
    case "CODE128":
    default:
      return null; // CODE128 encodes any ASCII.
  }
}

/**
 * Render `value` as a barcode PNG data URL. Validates the value per format and
 * returns a typed error on invalid input or an unencodable value. Async because
 * JsBarcode is dynamic-imported to keep it out of the shared bundle; rendering
 * itself is synchronous once the module loads.
 */
export async function barcodeToDataUrl(
  value: string,
  opts: BarcodeOptions = {},
): Promise<BarcodeResult> {
  const format = opts.format ?? "CODE128";
  const validationError = validateValue(value, format);
  if (validationError) return { ok: false, error: { message: validationError } };

  try {
    const mod = await import("jsbarcode");
    const JsBarcode = (mod as { default?: unknown }).default ?? mod;
    const canvas = document.createElement("canvas");
    let valid = true;
    (JsBarcode as (c: HTMLCanvasElement, v: string, o: unknown) => void)(canvas, value, {
      format,
      width: opts.width ?? 2,
      height: opts.height ?? 100,
      displayValue: opts.displayValue ?? true,
      lineColor: opts.lineColor ?? "#000000",
      background: opts.background ?? "#ffffff",
      margin: opts.margin ?? 10,
      valid: (isValid: boolean) => {
        valid = isValid;
      },
    });
    if (!valid) {
      return { ok: false, error: { message: `"${value}" is not valid for ${format}.` } };
    }
    return { ok: true, result: canvas.toDataURL("image/png") };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}
