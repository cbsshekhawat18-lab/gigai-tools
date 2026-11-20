/**
 * GigAI Tools, regex tester engine.
 *
 * Runs a user regex against input text and returns every match with its index,
 * length, value, and named/numbered capture groups. Uses the native `RegExp`
 * with an enforced global flag so all matches surface. Dependency-free; invalid
 * patterns return a typed error rather than throwing.
 */

export interface RegexMatch {
  /** 0-based start index of the match in the input. */
  index: number;
  /** Character length of the full match. */
  length: number;
  /** The matched substring. */
  value: string;
  /** Named capture groups (empty object when the pattern has none). */
  groups: Record<string, string>;
  /** All numbered capture group values (group 0 = full match). */
  captures: (string | undefined)[];
  /** Per-group [start, end] offsets, when the `d` flag is set. */
  indices?: ([number, number] | undefined)[];
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; error: { message: string } };

/** Ensure the global flag is present (so we can iterate all matches). */
function withGlobal(flags: string): string {
  const set = new Set(flags.split(""));
  set.add("g");
  return [...set].join("");
}

/**
 * Execute `pattern`/`flags` against `input`, returning all matches. The `g` flag
 * is added automatically. A guard caps iterations to avoid infinite loops on
 * pathological zero-width patterns. Named groups are supported.
 */
export function runRegex(pattern: string, flags: string, input: string): RegexResult {
  let re: RegExp;
  try {
    re = new RegExp(pattern, withGlobal(flags));
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }

  const matches: RegexMatch[] = [];
  const MAX_MATCHES = 100000;
  let guard = 0;
  let m: RegExpExecArray | null;

  try {
    while ((m = re.exec(input)) !== null) {
      guard += 1;
      if (guard > MAX_MATCHES) break;

      const value = m[0];
      const match: RegexMatch = {
        index: m.index,
        length: value.length,
        value,
        groups: m.groups ? { ...m.groups } : {},
        captures: Array.from(m),
      };
      const withIndices = m as RegExpExecArray & {
        indices?: ([number, number] | undefined)[];
      };
      if (withIndices.indices) match.indices = withIndices.indices;
      matches.push(match);

      // Advance past zero-length matches to prevent an infinite loop.
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }

  return { ok: true, matches };
}

/** Escape a string so it matches literally inside a RegExp. */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
