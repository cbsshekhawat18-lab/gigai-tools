/**
 * Regex-from-examples, infer a regular expression from sample strings.
 *
 * Honest scope: general regex synthesis is a hard problem, so this is a
 * pragmatic heuristic that nails the common real cases:
 *  1. KNOWN formats; if every example is an email / URL / IPv4 / ISO date /
 *      time / UUID / hex color / integer / decimal, emit a clean, hand-tuned
 *      regex for that format.
 *  2. STRUCTURAL inference; otherwise, split each example into runs of the
 *      same character class (digits, letters, spaces, literal separators),
 *      align them across all examples, and generalise each run to a class +
 *      quantifier (e.g. "AB-123", "XY-456" → [A-Z]{2}-\d{3}).
 *  3. FALLBACK, if the examples don't share a structure, emit a broad
 *      character-class pattern (a union of the characters seen) and say so.
 *
 * Every result is VALIDATED against the positives (must all match) and the
 * optional negatives (must all be rejected), so the UI can show honestly whether
 * the inferred pattern actually works. Everything runs in the browser.
 */

export type Method = "known" | "structural" | "fallback";

export interface RegexResult {
  /** Regex source without slashes. */
  pattern: string;
  flags: string;
  method: Method;
  /** Human-readable breakdown of what the pattern matches. */
  explanation: string[];
  /** Every positive example matches. */
  matchesAll: boolean;
  /** Every negative example is rejected (true when there are none). */
  rejectsNegatives: boolean;
  /** Which positives failed to match (for honest feedback). */
  failedPositives: string[];
  /** Which negatives wrongly matched. */
  matchedNegatives: string[];
}

export interface InferOptions {
  anchor: boolean;
  ignoreCase: boolean;
}

/* ── Known formats ─────────────────────────────────────────────────────────── */

interface KnownFormat {
  name: string;
  /** Test used to decide the format applies (unanchored, lenient). */
  test: RegExp;
  /** The clean pattern we emit (unanchored. Anchoring is applied later). */
  pattern: string;
  explanation: string;
}

const KNOWN: KnownFormat[] = [
  { name: "email", test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, pattern: "[^\\s@]+@[^\\s@]+\\.[^\\s@]+", explanation: "An email address: local part, @, domain, dot, TLD." },
  { name: "url", test: /^https?:\/\/[^\s]+$/i, pattern: "https?:\\/\\/[^\\s]+", explanation: "An http/https URL." },
  { name: "ipv4", test: /^(?:\d{1,3}\.){3}\d{1,3}$/, pattern: "(?:\\d{1,3}\\.){3}\\d{1,3}", explanation: "An IPv4 address: four dot-separated numbers." },
  { name: "uuid", test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", explanation: "A UUID (8-4-4-4-12 hex digits)." },
  { name: "iso-date", test: /^\d{4}-\d{2}-\d{2}$/, pattern: "\\d{4}-\\d{2}-\\d{2}", explanation: "An ISO date: YYYY-MM-DD." },
  { name: "time", test: /^\d{1,2}:\d{2}(?::\d{2})?$/, pattern: "\\d{1,2}:\\d{2}(?::\\d{2})?", explanation: "A time: HH:MM with optional :SS." },
  { name: "hex-color", test: /^#?[0-9a-f]{6}$/i, pattern: "#?[0-9a-fA-F]{6}", explanation: "A 6-digit hex color, optional leading #." },
  { name: "decimal", test: /^-?\d+\.\d+$/, pattern: "-?\\d+\\.\\d+", explanation: "A decimal number, optional minus sign." },
  { name: "integer", test: /^-?\d+$/, pattern: "-?\\d+", explanation: "An integer, optional minus sign." },
];

/* ── Character classification ──────────────────────────────────────────────── */

type Cls = "digit" | "letter" | "space" | "literal";

interface Run {
  cls: Cls;
  key: string; // groups runs; literals key by their exact char
  char: string; // representative char (for literals)
  len: number;
  chars: string[]; // every char seen in this run (across the single example)
}

function classify(ch: string): { cls: Cls; key: string } {
  if (ch >= "0" && ch <= "9") return { cls: "digit", key: "d" };
  if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z")) return { cls: "letter", key: "L" };
  if (/\s/.test(ch)) return { cls: "space", key: "s" };
  return { cls: "literal", key: `#${ch}` };
}

function runsOf(s: string): Run[] {
  const runs: Run[] = [];
  for (const ch of s) {
    const { cls, key } = classify(ch);
    const last = runs[runs.length - 1];
    if (last && last.key === key) {
      last.len++;
      last.chars.push(ch);
    } else {
      runs.push({ cls, key, char: ch, len: 1, chars: [ch] });
    }
  }
  return runs;
}

function escapeLiteral(ch: string): string {
  return /[.*+?^${}()|[\]\\/-]/.test(ch) ? `\\${ch}` : ch;
}

function quant(min: number, max: number): string {
  if (min === max) return min === 1 ? "" : `{${min}}`;
  return `{${min},${max}}`;
}

function quantWords(min: number, max: number): string {
  return min === max ? `exactly ${min}` : `${min}–${max}`;
}

/** Choose the tightest letter class for a set of letters actually seen. */
function letterClass(letters: string[]): { pat: string; name: string } {
  const hasLower = letters.some((c) => c >= "a" && c <= "z");
  const hasUpper = letters.some((c) => c >= "A" && c <= "Z");
  if (hasLower && hasUpper) return { pat: "[A-Za-z]", name: "letters" };
  if (hasUpper) return { pat: "[A-Z]", name: "uppercase letters" };
  return { pat: "[a-z]", name: "lowercase letters" };
}

/* ── Structural inference ──────────────────────────────────────────────────── */

function structural(pos: string[]): { pattern: string; explanation: string[] } | null {
  const runsList = pos.map(runsOf);
  const first = runsList[0];
  if (!first) return null;

  // Every example must share the same run-class sequence.
  for (const runs of runsList) {
    if (runs.length !== first.length) return null;
    for (let i = 0; i < runs.length; i++) {
      if (runs[i]!.key !== first[i]!.key) return null;
    }
  }

  const parts: string[] = [];
  const explanation: string[] = [];

  for (let i = 0; i < first.length; i++) {
    const lens = runsList.map((r) => r[i]!.len);
    const min = Math.min(...lens);
    const max = Math.max(...lens);
    const cls = first[i]!.cls;

    if (cls === "digit") {
      parts.push(`\\d${quant(min, max)}`);
      explanation.push(`${quantWords(min, max)} digit${max === 1 ? "" : "s"}`);
    } else if (cls === "space") {
      parts.push(`\\s${quant(min, max)}`);
      explanation.push(`${quantWords(min, max)} whitespace character${max === 1 ? "" : "s"}`);
    } else if (cls === "letter") {
      const allLetters = runsList.flatMap((r) => r[i]!.chars);
      const lc = letterClass(allLetters);
      parts.push(`${lc.pat}${quant(min, max)}`);
      explanation.push(`${quantWords(min, max)} ${lc.name}`);
    } else {
      // literal, same exact char across all examples (guaranteed by key match)
      const ch = first[i]!.char;
      parts.push(`${escapeLiteral(ch)}${quant(min, max)}`);
      explanation.push(`the literal "${ch}"${min === max ? "" : ` (${quantWords(min, max)} times)`}`);
    }
  }

  return { pattern: parts.join(""), explanation };
}

/* ── Fallback: broad character-class union ─────────────────────────────────── */

function fallback(pos: string[]): { pattern: string; explanation: string[] } {
  const chars = new Set<string>(pos.join("").split(""));
  let hasDigit = false;
  let hasLower = false;
  let hasUpper = false;
  let hasSpace = false;
  const literals = new Set<string>();
  for (const ch of chars) {
    const { cls } = classify(ch);
    if (cls === "digit") hasDigit = true;
    else if (cls === "space") hasSpace = true;
    else if (cls === "letter") ch >= "a" && ch <= "z" ? (hasLower = true) : (hasUpper = true);
    else literals.add(ch);
  }
  let set = "";
  if (hasLower) set += "a-z";
  if (hasUpper) set += "A-Z";
  if (hasDigit) set += "0-9";
  if (hasSpace) set += "\\s";
  for (const ch of literals) set += ch === "]" || ch === "\\" || ch === "^" || ch === "-" ? `\\${ch}` : ch;

  const lens = pos.map((s) => s.length);
  const min = Math.min(...lens);
  const max = Math.max(...lens);
  return {
    pattern: `[${set}]${quant(min, max)}`,
    explanation: [
      "The examples don't share a clear structure, so this is a broad pattern:",
      `${quantWords(min, max)} of the characters seen in the examples.`,
      "Refine it by hand, or add more consistent examples.",
    ],
  };
}

/* ── Public entry ──────────────────────────────────────────────────────────── */

function buildRegex(pattern: string, opts: InferOptions): { src: string; flags: string; re: RegExp | null } {
  const src = opts.anchor ? `^(?:${pattern})$` : pattern;
  const flags = opts.ignoreCase ? "i" : "";
  try {
    return { src, flags, re: new RegExp(src, flags) };
  } catch {
    return { src, flags, re: null };
  }
}

export function inferRegex(
  positivesRaw: string[],
  negativesRaw: string[],
  opts: InferOptions,
): RegexResult | null {
  const positives = positivesRaw.map((s) => s).filter((s) => s.length > 0);
  const negatives = negativesRaw.map((s) => s).filter((s) => s.length > 0);
  if (positives.length === 0) return null;

  let method: Method = "structural";
  let pattern = "";
  let explanation: string[] = [];

  // 1. Known formats, every positive matches one.
  const known = KNOWN.find((k) => positives.every((p) => k.test.test(p)));
  if (known) {
    method = "known";
    pattern = known.pattern;
    explanation = [known.explanation];
  } else {
    // 2. Structural.
    const s = structural(positives);
    if (s) {
      method = "structural";
      pattern = s.pattern;
      explanation = s.explanation;
    } else {
      // 3. Fallback.
      method = "fallback";
      const f = fallback(positives);
      pattern = f.pattern;
      explanation = f.explanation;
    }
  }

  const { src, flags, re } = buildRegex(pattern, opts);
  const failedPositives = re ? positives.filter((p) => !re.test(p)) : positives;
  const matchedNegatives = re ? negatives.filter((n) => re.test(n)) : [];

  return {
    pattern: src,
    flags,
    method,
    explanation,
    matchesAll: failedPositives.length === 0,
    rejectsNegatives: matchedNegatives.length === 0,
    failedPositives,
    matchedNegatives,
  };
}
