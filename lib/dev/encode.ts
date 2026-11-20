/**
 * GigAI Tools, encoding / URL engine.
 *
 * Unicode-safe Base64 (via TextEncoder/TextDecoder, not raw btoa on a UTF-16
 * string), URL encoding, and structured URL parsing. Dependency-free; all
 * synchronous except `fileToBase64`. User errors are returned, never thrown.
 */

export type EncodeResult =
  | { ok: true; result: string }
  | { ok: false; error: { message: string } };

/** Base64-encode a raw byte array (optionally URL-safe, unpadded). */
function bytesToBase64(bytes: Uint8Array, urlSafe: boolean): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode(...slice);
  }
  let b64 = btoa(binary);
  if (urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64;
}

/** Decode Base64 (standard or URL-safe, padded or not) to raw bytes. */
function base64ToBytes(b64: string, urlSafe: boolean): Uint8Array {
  let normalized = b64.trim();
  if (urlSafe) normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
  else normalized = normalized.replace(/\s+/g, "");
  const pad = normalized.length % 4;
  if (pad) normalized += "=".repeat(4 - pad);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Unicode-safe Base64 encode of text. */
export function base64Encode(
  text: string,
  opts: { urlSafe?: boolean } = {},
): EncodeResult {
  try {
    const bytes = new TextEncoder().encode(text);
    return { ok: true, result: bytesToBase64(bytes, opts.urlSafe ?? false) };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** Unicode-safe Base64 decode to text. Reports malformed input clearly. */
export function base64Decode(
  text: string,
  opts: { urlSafe?: boolean } = {},
): EncodeResult {
  try {
    const bytes = base64ToBytes(text, opts.urlSafe ?? false);
    const result = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { ok: true, result };
  } catch {
    return { ok: false, error: { message: "Input is not valid Base64." } };
  }
}

/** Read a File/Blob as a Base64 data URL (`data:<mime>;base64,…`). */
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Unexpected file read result."));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * URL-encode text. With `component:true` (default) uses
 * `encodeURIComponent` (escapes `& = ? /` …); with `component:false` uses
 * `encodeURI` (preserves URL structure).
 */
export function urlEncode(
  text: string,
  opts: { component?: boolean } = {},
): EncodeResult {
  try {
    const component = opts.component ?? true;
    return { ok: true, result: component ? encodeURIComponent(text) : encodeURI(text) };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** URL-decode text (component or full-URI variant). */
export function urlDecode(
  text: string,
  opts: { component?: boolean } = {},
): EncodeResult {
  try {
    const component = opts.component ?? true;
    return { ok: true, result: component ? decodeURIComponent(text) : decodeURI(text) };
  } catch {
    return { ok: false, error: { message: "Input contains an invalid percent-encoding." } };
  }
}

/** Decomposed parts of a parsed URL. */
export interface UrlParts {
  href: string;
  protocol: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  /** Query string as ordered `[key, value]` pairs (repeats preserved). */
  params: [string, string][];
}

export type ParseUrlResult =
  | { ok: true; parts: UrlParts }
  | { ok: false; error: { message: string } };

/** Parse a URL into its structured parts using the native `URL` API. */
export function parseUrl(url: string): ParseUrlResult {
  try {
    const u = new URL(url);
    const params: [string, string][] = [];
    u.searchParams.forEach((value, key) => params.push([key, value]));
    return {
      ok: true,
      parts: {
        href: u.href,
        protocol: u.protocol,
        username: u.username,
        password: u.password,
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        origin: u.origin,
        params,
      },
    };
  } catch {
    return { ok: false, error: { message: "That isn't a valid absolute URL." } };
  }
}
