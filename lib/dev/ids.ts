/**
 * GigAI Tools, UUID engine.
 *
 * v4 (random) via native `crypto.randomUUID`, v7 (time-ordered) implemented per
 * the RFC 9562 draft layout, plus the nil UUID and a bulk generator. All values
 * are RFC-formatted lowercase strings. Dependency-free (Web Crypto only).
 */

export type UuidVersion = 4 | 7 | "nil";

/** Format 16 bytes as a canonical `8-4-4-4-12` lowercase UUID. */
function bytesToUuid(bytes: Uint8Array): string {
  const hex: string[] = [];
  for (let i = 0; i < 16; i += 1) {
    hex.push((bytes[i] ?? 0).toString(16).padStart(2, "0"));
  }
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}

/** Generate a random UUID v4. */
export function uuidV4(): string {
  return crypto.randomUUID();
}

/**
 * Generate a time-ordered UUID v7. Layout: 48-bit big-endian Unix-ms timestamp,
 * version nibble `7`, then 74 random bits with the RFC variant (10xx) set. v7
 * values sort lexically by creation time, great for database keys.
 */
export function uuidV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const ms = Date.now();
  // 48-bit timestamp across bytes 0..5 (big-endian). Bit-ops cap at 32 bits, so
  // split into high 16 and low 32 to stay exact for the full 48-bit range.
  const timeHigh = Math.floor(ms / 0x1_0000_0000); // top 16 bits
  const timeLow = ms >>> 0; // low 32 bits
  bytes[0] = (timeHigh >>> 8) & 0xff;
  bytes[1] = timeHigh & 0xff;
  bytes[2] = (timeLow >>> 24) & 0xff;
  bytes[3] = (timeLow >>> 16) & 0xff;
  bytes[4] = (timeLow >>> 8) & 0xff;
  bytes[5] = timeLow & 0xff;

  // Version 7 in the high nibble of byte 6.
  bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f);
  // Variant 10xx in the high bits of byte 8.
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f);

  return bytesToUuid(bytes);
}

/** The all-zero nil UUID. */
export function nilUuid(): string {
  return "00000000-0000-0000-0000-000000000000";
}

/** Generate `count` UUIDs of the requested version (1–10000, clamped). */
export function generate(count: number, version: UuidVersion = 4): string[] {
  const n = Math.max(1, Math.min(10000, Math.floor(count)));
  const out = new Array<string>(n);
  for (let i = 0; i < n; i += 1) {
    out[i] = version === 7 ? uuidV7() : version === "nil" ? nilUuid() : uuidV4();
  }
  return out;
}
