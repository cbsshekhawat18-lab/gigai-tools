/**
 * GigAI Tools, shared types for the client-side PDF engine.
 *
 * Every operation under `lib/pdf/*` runs entirely in the browser: files are
 * NEVER uploaded, which is the whole privacy promise of the product. These
 * shapes are deliberately tiny and framework-agnostic so both the engine
 * functions and the React workspace hooks can share them.
 */

/**
 * A source PDF (or generic file) handed to an engine function. We keep the
 * original `File` for reading bytes and a display `name` the UI can override
 * (e.g. after a rename) without mutating the underlying File.
 */
export interface PdfInput {
  file: File;
  name: string;
}

/**
 * The encoded output of any engine operation: a named blob plus its byte size.
 * `size` is duplicated from `blob.size` purely so callers can read it without
 * touching the Blob (handy in memoised/serialised UI state).
 */
export interface NamedBlob {
  name: string;
  blob: Blob;
  size: number;
}

/** A single rendered page thumbnail: 1-based page number + data URL preview. */
export interface PageThumbnail {
  page: number;
  dataUrl: string;
  width: number;
  height: number;
}

/** Progress signal for long-running jobs (OCR, batch render). `0..1`. */
export type ProgressFn = (fraction: number, status?: string) => void;

/** An inclusive 1-based page range, e.g. `{ from: 2, to: 5 }`. */
export interface PageRange {
  from: number;
  to: number;
}

/** Per-page rotation instruction (degrees are normalised to 0/90/180/270). */
export interface RotationSpec {
  /** 1-based page number to rotate. */
  page: number;
  /** Clockwise degrees to add to the page's current rotation. */
  degrees: number;
}

/** Build a NamedBlob, deriving `size` from the blob so it can never drift. */
export function namedBlob(name: string, blob: Blob): NamedBlob {
  return { name, blob, size: blob.size };
}

/** Wrap a `File` as a `PdfInput`, defaulting the display name to the filename. */
export function toPdfInput(file: File, name?: string): PdfInput {
  return { file, name: name ?? file.name };
}

/**
 * Swap or append a filename extension. `changeExtension("a.pdf", "png")`
 * → `"a.png"`; used to derive output names from inputs.
 */
export function changeExtension(filename: string, ext: string): string {
  const clean = ext.replace(/^\./, "");
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return `${base}.${clean}`;
}
