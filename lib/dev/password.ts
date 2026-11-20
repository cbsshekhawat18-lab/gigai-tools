/**
 * GigAI Tools, password generator + strength estimator.
 *
 * Uses `crypto.getRandomValues` with rejection sampling for an UNBIASED choice
 * across the selected character pool (naïve `% pool.length` would skew toward
 * lower indices). Strength is estimated from entropy bits (log2(pool) × length).
 * Dependency-free.
 */

export interface PasswordOptions {
  length: number;
  upper?: boolean;
  lower?: boolean;
  digits?: boolean;
  symbols?: boolean;
  /** Drop visually ambiguous characters (O/0/I/l/1 …). */
  avoidAmbiguous?: boolean;
}

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
} as const;

const AMBIGUOUS = new Set("O0oIl1|`'\"S5B8Z2G6");

export type PasswordResult =
  | { ok: true; password: string; entropyBits: number }
  | { ok: false; error: { message: string } };

/** Pick an unbiased random index in [0, max) via rejection sampling. */
function randomIndex(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0x1_0000_0000 / max) * max; // largest fair multiple
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0] ?? 0;
  } while (x >= limit);
  return x % max;
}

/** Build the character pool from the enabled sets. */
function buildPool(opts: PasswordOptions): string {
  let pool = "";
  if (opts.upper) pool += SETS.upper;
  if (opts.lower) pool += SETS.lower;
  if (opts.digits) pool += SETS.digits;
  if (opts.symbols) pool += SETS.symbols;
  if (opts.avoidAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join("");
  }
  return pool;
}

/**
 * Generate a password of `length` characters from the selected sets. Returns a
 * typed error if no character set is enabled or the length is invalid.
 */
export function generatePassword(opts: PasswordOptions): PasswordResult {
  const length = Math.floor(opts.length);
  if (!Number.isFinite(length) || length < 1) {
    return { ok: false, error: { message: "Length must be at least 1." } };
  }
  if (length > 4096) {
    return { ok: false, error: { message: "Length must be 4096 or fewer." } };
  }
  const pool = buildPool(opts);
  if (pool.length === 0) {
    return { ok: false, error: { message: "Enable at least one character set." } };
  }

  const chars = [...pool];
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars[randomIndex(chars.length)];
  }
  const entropyBits = Math.round(length * Math.log2(chars.length) * 10) / 10;
  return { ok: true, password, entropyBits };
}

export interface StrengthEstimate {
  entropyBits: number;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
}

/**
 * Estimate password strength from character-class diversity and length. This is
 * an entropy heuristic (pool size × length), not a dictionary/crack-time model -
 * a common password can still score high, so treat it as a guide.
 */
export function estimateStrength(pw: string): StrengthEstimate {
  if (pw.length === 0) return { entropyBits: 0, label: "Very weak" };

  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 32; // approx. symbol space
  if (pool === 0) pool = 1;

  const entropyBits = Math.round(pw.length * Math.log2(pool) * 10) / 10;
  const label: StrengthEstimate["label"] =
    entropyBits < 28
      ? "Very weak"
      : entropyBits < 40
        ? "Weak"
        : entropyBits < 60
          ? "Fair"
          : entropyBits < 80
            ? "Strong"
            : "Very strong";
  return { entropyBits, label };
}
