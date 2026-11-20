/**
 * GigAI Tools: SVG engine shared core.
 *
 * Every SVG operation runs 100% in the browser (or Node-safe where noted).
 * Heavy libraries (svgo, imagetracerjs) are lazy-imported by the callers that
 * need them; this module carries only the zero-dependency primitives every
 * engine file shares: the `SvgResult` return contract, number rounding, safe
 * DOMParser access, attribute/entity escaping, and tiny SVG serialization.
 *
 * The engines return a discriminated union instead of throwing so UIs can
 * render a precise error message without a try/catch at every call site.
 */

/** Discriminated result used by every SVG engine function. */
export type SvgResult<T = string> =
  | { ok: true; result: T }
  | { ok: false; error: { message: string } };

/** Convenience constructors so call sites stay terse. */
export function ok<T>(result: T): { ok: true; result: T } {
  return { ok: true, result };
}
export function fail(message: string): { ok: false; error: { message: string } } {
  return { ok: false, error: { message } };
}

/** Normalize any thrown value into a readable message. */
export function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** True when we have a real DOM (client component / jsdom), not SSR. */
export function hasDom(): boolean {
  return typeof DOMParser !== "undefined" && typeof document !== "undefined";
}

/**
 * Round a number to `precision` decimals, stripping the trailing `.0`.
 * `12.3400 -> "12.34"`, `12 -> "12"`. Non-finite falls back to `"0"`.
 */
export function roundNum(value: number, precision: number): string {
  if (!Number.isFinite(value)) return "0";
  const p = Math.max(0, Math.min(10, Math.floor(precision)));
  const factor = 10 ** p;
  const rounded = Math.round(value * factor) / factor;
  // Number() drops trailing zeros; avoid "-0".
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/** Round every number embedded in a string (coords/paths) to `precision`. */
export function roundNumbersInString(input: string, precision: number): string {
  return input.replace(/-?\d*\.\d+(?:e-?\d+)?/gi, (m) => roundNum(parseFloat(m), precision));
}

/** Escape a value for use inside an XML attribute (double-quoted). */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape a value for use as XML text content. */
export function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Parse an SVG string into a Document via DOMParser. Returns the parsed
 * document and the first `<parsererror>` message if the parse failed.
 * Throws only when DOMParser is unavailable (no DOM), callers should guard.
 */
export function parseSvgDoc(svg: string): { doc: Document; error: string | null } {
  if (!hasDom()) throw new Error("DOMParser is unavailable (this runs in the browser).");
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const err = doc.querySelector("parsererror");
  return { doc, error: err ? (err.textContent?.trim().split("\n")[0] ?? "Parse error") : null };
}

/** Serialize a Document/Element back to a string via XMLSerializer. */
export function serialize(node: Node): string {
  return new XMLSerializer().serializeToString(node);
}

/**
 * Extract the root `<svg>` element from a string. Returns null if there is no
 * SVG root or the markup is not well-formed.
 */
export function getSvgRoot(svg: string): SVGSVGElement | null {
  const { doc, error } = parseSvgDoc(svg);
  if (error) return null;
  const root = doc.documentElement;
  return root && root.nodeName.toLowerCase() === "svg" ? (root as unknown as SVGSVGElement) : null;
}

/** Byte length of a UTF-8 string (matches what ships over the wire). */
export function utf8Bytes(input: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(input).length;
  // Fallback UTF-8 byte counter.
  let bytes = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff) {
      bytes += 4;
      i++;
    } else bytes += 3;
  }
  return bytes;
}

/** Base64-encode a UTF-8 string in browser or Node. */
export function toBase64(input: string): string {
  if (typeof btoa !== "undefined") {
    // btoa needs latin1; encode UTF-8 bytes first.
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
  }
  return Buffer.from(input, "utf-8").toString("base64");
}

/** Decode a base64 string to UTF-8 in browser or Node. */
export function fromBase64(input: string): string {
  if (typeof atob !== "undefined") {
    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(input, "base64").toString("utf-8");
}
