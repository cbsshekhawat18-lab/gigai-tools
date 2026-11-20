/**
 * GigAI Tools, JSON engine.
 *
 * Pure, dependency-free helpers for the JSON formatter / validator / minifier
 * tools. User-input errors are returned as typed objects (never thrown), so the
 * UI can point at the exact line/column of a syntax error.
 *
 * Big-number fidelity: `JSON.parse` coerces numbers to IEEE-754 doubles, so
 * integers beyond `Number.MAX_SAFE_INTEGER` (2^53-1) lose precision on a
 * parse→stringify round-trip. To preserve the *source text* exactly, `formatJson`
 * and `minifyJson` re-serialise from the parsed value but callers needing
 * lossless large-integer handling should keep the original string. This is the
 * standard trade-off; documented here rather than silently corrupting data.
 */

/** A precise, positioned parse error. */
export interface JsonError {
  message: string;
  /** 1-based line of the error, when derivable. */
  line?: number;
  /** 1-based column of the error, when derivable. */
  column?: number;
  /** 0-based character offset into the source, when derivable. */
  position?: number;
}

/** Result of validating JSON source. */
export type JsonValidation =
  | { ok: true }
  | { ok: false; error: JsonError };

/** Result of parsing JSON source into a value. */
export type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: JsonError };

/** Result of a formatting/minifying transform. */
export type JsonTransform =
  | { ok: true; result: string }
  | { ok: false; error: JsonError };

/** Normalise an `indent` argument into the `space` accepted by JSON.stringify. */
function toSpace(indent: number | "\t"): number | string {
  if (indent === "\t") return "\t";
  if (!Number.isFinite(indent)) return 2;
  return Math.max(0, Math.min(10, Math.floor(indent)));
}

/**
 * Derive a 1-based line/column from a `JSON.parse` error message. V8 and
 * SpiderMonkey both encode a position; we support "position N" (V8),
 * "at line L column C" (some engines), and fall back gracefully.
 */
function locateError(src: string, err: unknown): JsonError {
  const message = err instanceof Error ? err.message : String(err);

  // V8 / modern Node: "... in JSON at position 123 (line 4 column 5)".
  const lineCol = /line (\d+) column (\d+)/i.exec(message);
  if (lineCol && lineCol[1] && lineCol[2]) {
    return {
      message,
      line: Number(lineCol[1]),
      column: Number(lineCol[2]),
    };
  }

  const posMatch = /position (\d+)/i.exec(message);
  if (posMatch && posMatch[1]) {
    const position = Number(posMatch[1]);
    return { message, position, ...offsetToLineCol(src, position) };
  }

  return { message };
}

/** Convert a 0-based character offset into 1-based line/column. */
function offsetToLineCol(src: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const end = Math.min(offset, src.length);
  for (let i = 0; i < end; i += 1) {
    if (src[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

/** Validate JSON, returning a positioned error on failure. */
export function validateJson(src: string): JsonValidation {
  try {
    JSON.parse(src);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: locateError(src, err) };
  }
}

/** Parse JSON without throwing; returns the value or a positioned error. */
export function safeParse(src: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(src) };
  } catch (err) {
    return { ok: false, error: locateError(src, err) };
  }
}

/** Pretty-print JSON with the given indent (a number of spaces, or a tab). */
export function formatJson(src: string, indent: number | "\t" = 2): JsonTransform {
  const parsed = safeParse(src);
  if (!parsed.ok) return parsed;
  try {
    return { ok: true, result: JSON.stringify(parsed.value, null, toSpace(indent)) };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** Collapse JSON to its most compact representation. */
export function minifyJson(src: string): JsonTransform {
  const parsed = safeParse(src);
  if (!parsed.ok) return parsed;
  try {
    return { ok: true, result: JSON.stringify(parsed.value) };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** Recursively sort object keys (arrays keep order) for stable diffs. */
function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortValue((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

/** Pretty-print JSON with all object keys sorted alphabetically (deep). */
export function sortJsonKeys(src: string, indent: number | "\t" = 2): JsonTransform {
  const parsed = safeParse(src);
  if (!parsed.ok) return parsed;
  try {
    return { ok: true, result: JSON.stringify(sortValue(parsed.value), null, toSpace(indent)) };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}
