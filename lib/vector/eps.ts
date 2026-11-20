/**
 * EPS / AI → raster, without a PostScript interpreter.
 *
 * WHY THIS IS SHAPED THIS WAY: rasterising arbitrary EPS means running
 * PostScript, which in practice means Ghostscript, and Ghostscript is AGPL-3.0
 * (the only WASM build on npm is an unmaintained 15.6MB v0.0.2 from 2022).
 * Shipping it would oblige us to release this whole site under AGPL, and Artifex
 * actively enforce that. So we do NOT interpret PostScript.
 *
 * What we do instead: Illustrator writes a complete PDF stream inside the file
 * whenever "Create PDF Compatible File" is on, which is the default, and is
 * what almost every .ai and Illustrator-exported .eps in circulation contains.
 * Modern .ai files ARE PDFs outright. We locate that PDF payload and hand it to
 * the existing pdf.js pipeline (lib/pdf/convert.ts), which we already ship.
 *
 * Files with no PDF payload: hand-written or Ghostscript-emitted pure
 * PostScript; are reported honestly rather than rendered wrong or blank. We
 * deliberately do NOT fall back to the low-res TIFF/WMF thumbnail some EPS files
 * embed: that preview is a screen proxy, not the artwork, and silently handing
 * back a blurry approximation of someone's logo is worse than saying no.
 */

import { pdfToImages, type PdfToImagesOptions } from "@/lib/pdf/convert";
import { fileToUint8Array } from "@/lib/pdf/core";
import { namedBlob, toPdfInput, type NamedBlob } from "@/lib/pdf/types";

/** `%PDF-`: start of an embedded (or whole-file) PDF payload. */
const PDF_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d];
/** `%%EOF`, end of a PDF payload. */
const PDF_EOF = [0x25, 0x25, 0x45, 0x4f, 0x46];
/** `%!PS`: a PostScript / EPS wrapper. */
const PS_HEADER = [0x25, 0x21, 0x50, 0x53];
/** DOS/binary EPS container magic (C5 D0 D3 C6), preview + PS in one file. */
const DOS_EPS_MAGIC = [0xc5, 0xd0, 0xd3, 0xc6];

function matchesAt(haystack: Uint8Array, needle: number[], at: number): boolean {
  for (let i = 0; i < needle.length; i += 1) {
    if (haystack[at + i] !== needle[i]) return false;
  }
  return true;
}

function indexOfBytes(haystack: Uint8Array, needle: number[], from = 0): number {
  const limit = haystack.length - needle.length;
  for (let i = from; i <= limit; i += 1) {
    if (matchesAt(haystack, needle, i)) return i;
  }
  return -1;
}

function lastIndexOfBytes(haystack: Uint8Array, needle: number[]): number {
  for (let i = haystack.length - needle.length; i >= 0; i -= 1) {
    if (matchesAt(haystack, needle, i)) return i;
  }
  return -1;
}

export type EpsProbe =
  /** A PDF payload was found and can be rendered at any resolution. */
  | { kind: "pdf"; bytes: Uint8Array; wrapped: boolean }
  /**
   * No PDF payload, but the DOS/binary EPS container carries a TIFF preview.
   * That preview is a fixed, low-resolution screen proxy (NOT the artwork) so
   * callers must label it as such and let the user opt in.
   */
  | { kind: "preview-only"; tiff: Uint8Array }
  /** Recognisably EPS/PostScript, with nothing we can render. */
  | { kind: "postscript-only" }
  /** Not an EPS/AI/PDF at all. */
  | { kind: "unrecognised" };

function readU32LE(b: Uint8Array, at: number): number {
  return (
    ((b[at] ?? 0) |
      ((b[at + 1] ?? 0) << 8) |
      ((b[at + 2] ?? 0) << 16) |
      ((b[at + 3] ?? 0) << 24)) >>>
    0
  );
}

/**
 * Read the TIFF preview out of a DOS/binary EPS container.
 *
 * The 30-byte header is: magic(4) psOffset(4) psLength(4) wmfOffset(4)
 * wmfLength(4) tiffOffset(4) tiffLength(4) checksum(2), all little-endian.
 * We only take TIFF. WMF is a vector metafile that would need its own
 * interpreter, which is the very thing we're avoiding.
 */
function dosEpsTiffPreview(bytes: Uint8Array): Uint8Array | null {
  if (!matchesAt(bytes, DOS_EPS_MAGIC, 0) || bytes.length < 30) return null;
  const offset = readU32LE(bytes, 20);
  const length = readU32LE(bytes, 24);
  if (offset === 0 || length === 0) return null;
  if (offset + length > bytes.length) return null;
  return bytes.subarray(offset, offset + length);
}

/**
 * Locate a renderable PDF payload inside an .eps / .ai file.
 *
 * Searching the whole buffer for `%PDF-` covers every container we care about in
 * one pass: a bare PDF (offset 0, i.e. a modern .ai), an Illustrator EPS with the
 * PDF inside a `%%BeginData` block, and the DOS/binary EPS container: in the
 * last case the PDF sits inside the PostScript section, so scanning the raw
 * bytes finds it without parsing the 30-byte offset header.
 */
export function probeEps(bytes: Uint8Array): EpsProbe {
  const pdfStart = indexOfBytes(bytes, PDF_HEADER);

  if (pdfStart >= 0) {
    // Trim to the payload's own %%EOF where we can. Illustrator EPS keeps
    // emitting PostScript after the embedded PDF ends, and although pdf.js
    // tolerates trailing bytes (it scans backwards for `startxref`), cutting at
    // the last %%EOF keeps the buffer honest and smaller.
    const eof = lastIndexOfBytes(bytes, PDF_EOF);
    const end = eof > pdfStart ? eof + PDF_EOF.length : bytes.length;
    return { kind: "pdf", bytes: bytes.subarray(pdfStart, end), wrapped: pdfStart > 0 };
  }

  const tiff = dosEpsTiffPreview(bytes);
  if (tiff) return { kind: "preview-only", tiff };

  const isPostScript =
    matchesAt(bytes, PS_HEADER, 0) || matchesAt(bytes, DOS_EPS_MAGIC, 0);
  return isPostScript ? { kind: "postscript-only" } : { kind: "unrecognised" };
}

/** Probe a File without the caller having to read it into memory itself. */
export async function probeEpsFile(file: File): Promise<EpsProbe> {
  return probeEps(await fileToUint8Array(file));
}

/**
 * Decode a DOS EPS TIFF preview to PNG. Browsers can't decode TIFF natively
 * (Chrome and Firefox both refuse), so this lazy-loads `utif`, pulled in ONLY
 * on this path, so the 62KB never reaches anyone converting a normal file.
 *
 * Returns the true pixel dimensions alongside the blob so the UI can state
 * exactly what the user is getting instead of implying it's the real artwork.
 */
export async function decodeEpsPreview(
  tiff: Uint8Array,
): Promise<{ blob: Blob; width: number; height: number }> {
  const UTIF = (await import("utif")).default;
  // `tiff` is a subarray of the source file; .slice() copies it so `.buffer` is
  // exactly the preview bytes (utif's types take an ArrayBuffer, not a view).
  const buffer = tiff.slice().buffer as ArrayBuffer;
  const ifds = UTIF.decode(buffer);
  const page = ifds[0];
  if (!page) throw new Error("The preview image inside this EPS could not be read.");

  UTIF.decodeImage(buffer, page);
  const rgba = UTIF.toRGBA8(page);
  const width = page.width;
  const height = page.height;
  if (!width || !height) {
    throw new Error("The preview image inside this EPS has no usable dimensions.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser blocked the canvas needed to build the PNG.");
  ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("The preview could not be encoded as a PNG.");
  return { blob, width, height };
}

/**
 * Convert a DOS EPS TIFF preview into the NamedBlob shape the tool harness
 * expects, so the fallback path plugs into the same results panel.
 */
export async function epsPreviewToImages(
  file: File,
  tiff: Uint8Array,
): Promise<NamedBlob[]> {
  const { blob, width, height } = await decodeEpsPreview(tiff);
  const base = file.name.replace(/\.(eps|ai|ps)$/i, "");
  return [namedBlob(`${base}-preview-${width}x${height}.png`, blob)];
}

/** Reasons a file can't be rendered as vector artwork. */
export type EpsUnsupportedReason = "postscript-only" | "unrecognised" | "preview-only";

const UNSUPPORTED_MESSAGE: Record<EpsUnsupportedReason, string> = {
  "postscript-only":
    "This EPS contains only PostScript drawing code, with no embedded PDF, so it can't be rendered in the browser. Re-save it from Illustrator with “Create PDF Compatible File” ticked, or export it directly as PDF, and this tool will convert it.",
  unrecognised:
    "This doesn't look like an EPS, AI or PDF file. Check the file and try again.",
  // Defensive: the UI routes preview-only files to the opt-in preview path
  // before ever calling the vector renderer, so this should not surface.
  "preview-only":
    "This EPS has no vector artwork to render: only a low-resolution preview image. Use the “Extract preview instead” option to save that.",
};

/** Thrown when the file is real but holds no PDF payload we can render. */
export class EpsUnsupportedError extends Error {
  readonly reason: EpsUnsupportedReason;
  constructor(reason: EpsUnsupportedReason) {
    super(UNSUPPORTED_MESSAGE[reason]);
    this.name = "EpsUnsupportedError";
    this.reason = reason;
  }
}

export type EpsToImagesOptions = Omit<PdfToImagesOptions, "password">;

/**
 * Convert an .eps / .ai file to PNG (or JPEG) pages by extracting its PDF
 * payload and reusing the existing pdf.js rasteriser. Runs entirely in the
 * browser; the file is never uploaded.
 */
export async function epsToImages(
  file: File,
  opts: EpsToImagesOptions = {},
): Promise<NamedBlob[]> {
  const bytes = await fileToUint8Array(file);
  const probe = probeEps(bytes);
  if (probe.kind !== "pdf") throw new EpsUnsupportedError(probe.kind);

  // pdfToImages names outputs from the input name and strips a .pdf suffix;
  // give it a .pdf name so .eps/.ai don't leak into the download filename.
  const base = file.name.replace(/\.(eps|ai|ps)$/i, "");
  const pdfFile = new File([probe.bytes as BlobPart], `${base}.pdf`, {
    type: "application/pdf",
  });

  return pdfToImages(toPdfInput(pdfFile), { format: "image/png", ...opts });
}
