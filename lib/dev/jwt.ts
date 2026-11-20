/**
 * GigAI Tools, JWT engine.
 *
 * Structure-only decode by default: we split the token and Base64URL-decode the
 * header and payload WITHOUT verifying the signature. Never trust a decoded
 * token. `verifyHs256` optionally checks an HS256 signature with Web Crypto when
 * the user supplies the secret. Dependency-free.
 */

export interface JwtDecoded {
  ok: true;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** Raw Base64URL signature segment (empty for unsigned tokens). */
  signature: string;
  alg?: string;
  typ?: string;
  /** `iat` as a Date, when present and numeric. */
  issuedAt?: Date;
  /** `exp` as a Date, when present and numeric. */
  expiresAt?: Date;
  /** Seconds until expiry (negative if already expired), when `exp` present. */
  expiresInSec?: number;
  /** True when `exp` is present and in the past. */
  isExpired?: boolean;
}

export type JwtDecodeResult = JwtDecoded | { ok: false; error: { message: string } };

/** Base64URL-decode a JWT segment to a UTF-8 string. */
function decodeSegment(segment: string): string {
  let b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function parseJsonSegment(segment: string): Record<string, unknown> {
  const parsed = JSON.parse(decodeSegment(segment)) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("segment is not a JSON object");
  }
  return parsed as Record<string, unknown>;
}

/**
 * Decode a JWT's header and payload. Does NOT verify the signature. Returns a
 * typed error for malformed tokens.
 */
export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length < 2 || parts.length > 3) {
    return { ok: false, error: { message: "A JWT must have 2 or 3 dot-separated parts." } };
  }
  const [headerSeg, payloadSeg, signatureSeg = ""] = parts as [string, string, string?];

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = parseJsonSegment(headerSeg);
  } catch {
    return { ok: false, error: { message: "The token header is not valid Base64URL JSON." } };
  }
  try {
    payload = parseJsonSegment(payloadSeg);
  } catch {
    return { ok: false, error: { message: "The token payload is not valid Base64URL JSON." } };
  }

  const alg = typeof header.alg === "string" ? header.alg : undefined;
  const typ = typeof header.typ === "string" ? header.typ : undefined;

  const iat = typeof payload.iat === "number" ? payload.iat : undefined;
  const exp = typeof payload.exp === "number" ? payload.exp : undefined;
  const nowSec = Math.floor(Date.now() / 1000);

  const result: JwtDecoded = {
    ok: true,
    header,
    payload,
    signature: signatureSeg,
  };
  if (alg !== undefined) result.alg = alg;
  if (typ !== undefined) result.typ = typ;
  if (iat !== undefined) result.issuedAt = new Date(iat * 1000);
  if (exp !== undefined) {
    result.expiresAt = new Date(exp * 1000);
    result.expiresInSec = exp - nowSec;
    result.isExpired = exp <= nowSec;
  }
  return result;
}

/** Base64URL-decode a segment to bytes (for signature comparison). */
function segmentToBytes(segment: string): Uint8Array {
  let b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Verify an HS256-signed JWT against a shared secret using Web Crypto HMAC.
 * Returns `false` (never throws) for any malformed token or wrong algorithm.
 */
export async function verifyHs256(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return false;
    const [headerSeg, payloadSeg, signatureSeg] = parts as [string, string, string];

    const header = parseJsonSegment(headerSeg);
    if (header.alg !== "HS256") return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signingInput = new TextEncoder().encode(`${headerSeg}.${payloadSeg}`);
    const sigBuffer = await crypto.subtle.sign("HMAC", key, signingInput);

    const expected = new Uint8Array(sigBuffer);
    const actual = segmentToBytes(signatureSeg);
    if (expected.length !== actual.length) return false;

    // Constant-time-ish comparison.
    let diff = 0;
    for (let i = 0; i < expected.length; i += 1) {
      diff |= (expected[i] ?? 0) ^ (actual[i] ?? 0);
    }
    return diff === 0;
  } catch {
    return false;
  }
}
