/**
 * GigAI Tools: Nano ID engine.
 *
 * Cryptographically-strong, URL-safe short IDs via nanoid. The library is
 * dynamic-imported so it never weighs on the shared bundle. Presets cover the
 * common alphabets (URL-safe, numeric, lowercase, hex).
 */

/** Named alphabet presets. */
export type NanoIdPreset = "default" | "numeric" | "lowercase" | "hex" | "alphanumeric";

/** Character sets for each preset. `default` uses nanoid's built-in URL-safe set. */
export const NANOID_ALPHABETS: Record<Exclude<NanoIdPreset, "default">, string> = {
  numeric: "0123456789",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  hex: "0123456789abcdef",
  alphanumeric: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
};

/**
 * Generate a Nano ID of `size` characters (default 21). Provide `alphabet` to
 * use a custom character set, or omit it for the default URL-safe alphabet.
 */
export async function newNanoId(size = 21, alphabet?: string): Promise<string> {
  const len = Math.max(1, Math.min(1024, Math.floor(size)));
  if (alphabet && alphabet.length > 0) {
    const { customAlphabet } = await import("nanoid");
    return customAlphabet(alphabet, len)();
  }
  const { nanoid } = await import("nanoid");
  return nanoid(len);
}

/** Generate a Nano ID from a named preset. */
export async function newNanoIdPreset(
  preset: NanoIdPreset = "default",
  size = 21,
): Promise<string> {
  if (preset === "default") return newNanoId(size);
  return newNanoId(size, NANOID_ALPHABETS[preset]);
}

/** Generate `count` Nano IDs (1–10000, clamped). */
export async function generateNanoIds(
  count: number,
  size = 21,
  alphabet?: string,
): Promise<string[]> {
  const n = Math.max(1, Math.min(10000, Math.floor(count)));
  const len = Math.max(1, Math.min(1024, Math.floor(size)));
  if (alphabet && alphabet.length > 0) {
    const { customAlphabet } = await import("nanoid");
    const gen = customAlphabet(alphabet, len);
    return Array.from({ length: n }, () => gen());
  }
  const { nanoid } = await import("nanoid");
  return Array.from({ length: n }, () => nanoid(len));
}
