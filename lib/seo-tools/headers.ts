/**
 * GigAI Tools, HTTP headers & security engine.
 *
 * Parses raw response headers (as pasted from `curl -I` or DevTools), grades
 * the key security headers with actionable advice, and builds a
 * Content-Security-Policy from a friendly directive model. Pure and
 * dependency-free.
 *
 * PASTE-FIRST, honestly: inspecting a *live* URL's real headers needs a server
 * request that browsers block via CORS and that our privacy stance rules out -
 * so you paste the raw headers and we analyze them client-side.
 */

/** Parsed headers as a case-insensitive map (lowercased keys). */
export type HeaderMap = Record<string, string>;

export interface ParsedHeaders {
  /** Lowercased header name → value (repeats joined with ", "). */
  map: HeaderMap;
  /** The HTTP status line, if present (e.g. "HTTP/2 200"). */
  statusLine?: string;
  /** Parsed numeric status code, if derivable. */
  status?: number;
  /** Ordered original `[name, value]` pairs (case preserved). */
  raw: [string, string][];
}

/**
 * Parse a raw HTTP response-header block. Accepts an optional leading status
 * line, folds duplicate headers, and ignores blank lines.
 */
export function parseHttpHeaders(raw: string): ParsedHeaders {
  const map: HeaderMap = {};
  const rawPairs: [string, string][] = [];
  let statusLine: string | undefined;
  let status: number | undefined;

  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^HTTP\/[\d.]+\s/i.test(trimmed) || /^HTTP\/\d/i.test(trimmed)) {
      statusLine = trimmed;
      const m = trimmed.match(/\s(\d{3})\b/);
      if (m && m[1]) status = Number(m[1]);
      continue;
    }
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const name = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    if (!name) continue;
    rawPairs.push([name, value]);
    const key = name.toLowerCase();
    map[key] = map[key] ? `${map[key]}, ${value}` : value;
  }

  return { map, statusLine, status, raw: rawPairs };
}

/* ---------------------------- security analysis --------------------------- */

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface HeaderCheck {
  header: string;
  present: boolean;
  value?: string;
  status: "good" | "warn" | "bad";
  advice: string;
}

export interface SecurityHeaderReport {
  checks: HeaderCheck[];
  /** 0–100 score. */
  score: number;
  grade: Grade;
  /** Count of headers considered present-and-good. */
  passed: number;
  total: number;
}

interface HeaderSpec {
  header: string;
  weight: number;
  evaluate: (value: string | undefined) => { status: HeaderCheck["status"]; advice: string };
}

const SECURITY_SPECS: HeaderSpec[] = [
  {
    header: "Strict-Transport-Security",
    weight: 2,
    evaluate: (v) => {
      if (!v) return { status: "bad", advice: "Add HSTS to force HTTPS: `max-age=31536000; includeSubDomains; preload`." };
      const maxAge = Number(/max-age=(\d+)/i.exec(v)?.[1] ?? "0");
      if (maxAge < 15552000)
        return { status: "warn", advice: "max-age is below the recommended 6 months (15552000s)." };
      if (!/includeSubDomains/i.test(v))
        return { status: "warn", advice: "Consider adding `includeSubDomains` (and `preload`)." };
      return { status: "good", advice: "Strong HSTS policy in place." };
    },
  },
  {
    header: "Content-Security-Policy",
    weight: 2,
    evaluate: (v) => {
      if (!v) return { status: "bad", advice: "Add a Content-Security-Policy to mitigate XSS and data-injection." };
      if (/unsafe-inline|unsafe-eval/i.test(v))
        return { status: "warn", advice: "CSP allows `unsafe-inline`/`unsafe-eval`, which weakens XSS protection." };
      if (!/default-src/i.test(v))
        return { status: "warn", advice: "Consider setting a `default-src` fallback directive." };
      return { status: "good", advice: "Content-Security-Policy is present and reasonably strict." };
    },
  },
  {
    header: "X-Frame-Options",
    weight: 1,
    evaluate: (v) => {
      if (!v) return { status: "warn", advice: "Add `X-Frame-Options: DENY` (or a CSP frame-ancestors) to prevent clickjacking." };
      if (/deny|sameorigin/i.test(v)) return { status: "good", advice: "Clickjacking protection is active." };
      return { status: "warn", advice: `Unusual value "${v}", prefer DENY or SAMEORIGIN.` };
    },
  },
  {
    header: "X-Content-Type-Options",
    weight: 1,
    evaluate: (v) => {
      if (!v) return { status: "bad", advice: "Add `X-Content-Type-Options: nosniff` to stop MIME sniffing." };
      if (/nosniff/i.test(v)) return { status: "good", advice: "MIME-sniffing is disabled." };
      return { status: "warn", advice: `Expected "nosniff", got "${v}".` };
    },
  },
  {
    header: "Referrer-Policy",
    weight: 1,
    evaluate: (v) => {
      if (!v) return { status: "warn", advice: "Set a Referrer-Policy such as `strict-origin-when-cross-origin`." };
      return { status: "good", advice: `Referrer-Policy set to "${v}".` };
    },
  },
  {
    header: "Permissions-Policy",
    weight: 1,
    evaluate: (v) => {
      if (!v) return { status: "warn", advice: "Add a Permissions-Policy to restrict powerful features (camera, geolocation, …)." };
      return { status: "good", advice: "Permissions-Policy restricts browser features." };
    },
  },
  {
    header: "X-XSS-Protection",
    weight: 0,
    evaluate: (v) => {
      if (!v)
        return { status: "good", advice: "Omitting X-XSS-Protection is fine: modern browsers ignore it. Rely on CSP instead." };
      if (/^0/.test(v.trim()))
        return { status: "good", advice: "Explicitly disabled (`0`), recommended. Rely on CSP." };
      return { status: "warn", advice: "This header is deprecated. A CSP is the modern replacement." };
    },
  },
];

function scoreToGrade(pct: number): Grade {
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}

/** Grade the security posture implied by a parsed header map. */
export function analyzeSecurityHeaders(map: HeaderMap): SecurityHeaderReport {
  const checks: HeaderCheck[] = [];
  let earned = 0;
  let possible = 0;
  let passed = 0;

  for (const spec of SECURITY_SPECS) {
    const value = map[spec.header.toLowerCase()];
    const { status, advice } = spec.evaluate(value);
    const present = value !== undefined;
    checks.push({ header: spec.header, present, value, status, advice });
    if (spec.weight > 0) {
      possible += spec.weight;
      if (status === "good") {
        earned += spec.weight;
        passed += 1;
      } else if (status === "warn") {
        earned += spec.weight * 0.5;
      }
    } else if (status === "good") {
      passed += 1;
    }
  }

  const score = possible ? Math.round((earned / possible) * 100) : 0;
  return {
    checks,
    score,
    grade: scoreToGrade(score),
    passed,
    total: SECURITY_SPECS.length,
  };
}

/* --------------------------------- CSP ------------------------------------ */

/** A friendly CSP model: directive name → list of source values. */
export type CspDirectives = Record<string, string[]>;

export interface CspInput {
  directives: CspDirectives;
  /** Emit `upgrade-insecure-requests`. */
  upgradeInsecureRequests?: boolean;
  /** Emit `block-all-mixed-content`. */
  blockAllMixedContent?: boolean;
}

/** Directives that take no value (flag directives). */
const FLAG_DIRECTIVES = new Set(["upgrade-insecure-requests", "block-all-mixed-content"]);

/**
 * Build a `Content-Security-Policy` header value from a directive model.
 * Source tokens like `self`, `none`, `unsafe-inline` are auto-quoted.
 */
export function buildCsp(input: CspInput): string {
  const parts: string[] = [];
  const quote = (token: string): string => {
    const t = token.trim();
    if (!t) return "";
    const keyword = t.replace(/^'|'$/g, "").toLowerCase();
    const needsQuote = ["self", "none", "unsafe-inline", "unsafe-eval", "strict-dynamic"].includes(keyword) ||
      /^(nonce-|sha256-|sha384-|sha512-)/i.test(keyword);
    return needsQuote ? `'${keyword}'` : t;
  };

  for (const [name, sources] of Object.entries(input.directives)) {
    const dir = name.trim();
    if (!dir) continue;
    if (FLAG_DIRECTIVES.has(dir)) {
      parts.push(dir);
      continue;
    }
    const values = sources.map(quote).filter(Boolean);
    parts.push(values.length ? `${dir} ${values.join(" ")}` : dir);
  }

  if (input.upgradeInsecureRequests) parts.push("upgrade-insecure-requests");
  if (input.blockAllMixedContent) parts.push("block-all-mixed-content");

  return parts.join("; ");
}
