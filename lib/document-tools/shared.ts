/**
 * GigAI Tools, shared plumbing for the client-side document engine.
 *
 * Every function under `lib/document-tools/*` runs entirely in the browser and
 * returns the same discriminated shape so callers can branch on a single field.
 * Heavy libraries (xlsx, jspdf, epubjs, marked…) are always dynamic-imported by
 * the module that uses them (never here) so this file stays dependency-free
 * and cheap to include.
 */

/** Discriminated result used by the whole document engine. */
export type Result<T> = { ok: true; result: T } | { ok: false; error: string };

/** Wrap a value as a success result (saves the object literal at call sites). */
export function ok<T>(result: T): Result<T> {
  return { ok: true, result };
}

/** Wrap a message as a failure result. */
export function fail<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

/** Normalise any thrown value into a user-facing string. */
export function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Run `fn`, catching sync/async throws into a failure Result. */
export async function guard<T>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await fn();
  } catch (err) {
    return fail(message(err));
  }
}

/** Read a Blob/File as text (UTF-8). */
export async function readText(file: Blob): Promise<string> {
  return file.text();
}

/** Swap or append a filename extension: `base("a.docx","pdf") → "a.pdf"`. */
export function withExtension(filename: string, ext: string): string {
  const clean = ext.replace(/^\./, "");
  const dot = filename.lastIndexOf(".");
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  return `${stem}.${clean}`;
}

/** Escape a string for safe insertion into HTML text/attributes. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
