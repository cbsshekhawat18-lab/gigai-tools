/**
 * GigAI Tools, timestamp engine.
 *
 * Unix ↔ date conversions with UTC, local, and human-relative renderings via
 * `Intl`. Dependency-free.
 *
 * Timezone honesty: without an external tz database we can only render UTC and
 * the *browser's* local zone. "Local" therefore means the viewer's machine zone,
 * not an arbitrary chosen zone. Arbitrary-zone conversion is out of scope here.
 */

export type UnixUnit = "s" | "ms";

/** Convert a Date to a Unix timestamp in seconds or milliseconds. */
export function toUnix(date: Date, unit: UnixUnit = "s"): number {
  const ms = date.getTime();
  return unit === "ms" ? ms : Math.floor(ms / 1000);
}

/** The current Unix timestamp. */
export function nowUnix(unit: UnixUnit = "s"): number {
  return toUnix(new Date(), unit);
}

/** Rich breakdown of a moment in time. */
export interface UnixBreakdown {
  /** Milliseconds since the epoch. */
  epochMs: number;
  /** Full ISO-8601 string (UTC, `…Z`). */
  iso: string;
  /** Human-readable UTC rendering. */
  utc: string;
  /** Human-readable local (browser-zone) rendering. */
  local: string;
  /** Relative phrasing, e.g. "in 3 hours" / "2 days ago". */
  relative: string;
  /** Local weekday name, e.g. "Monday". */
  dayOfWeek: string;
}

/** Format a signed second-delta as a relative phrase via `Intl.RelativeTimeFormat`. */
function relativeFrom(targetMs: number, nowMs: number): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const diffSec = Math.round((targetMs - nowMs) / 1000);
  const abs = Math.abs(diffSec);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === "second") {
      return rtf.format(Math.round(diffSec / secs), unit);
    }
  }
  return rtf.format(diffSec, "second");
}

/**
 * Expand a Unix timestamp (seconds or ms) into ISO/UTC/local/relative/weekday
 * renderings. `relative` is evaluated against `now` (default: call time) and
 * `local` against the browser's zone at call time.
 */
export function fromUnix(
  value: number,
  unit: UnixUnit = "s",
  now: number = Date.now(),
): UnixBreakdown {
  const epochMs = unit === "ms" ? value : value * 1000;
  const date = new Date(epochMs);
  const utc = date.toLocaleString(undefined, {
    timeZone: "UTC",
    dateStyle: "full",
    timeStyle: "long",
  });
  const local = date.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "long",
  });
  const dayOfWeek = date.toLocaleDateString(undefined, { weekday: "long" });
  return {
    epochMs,
    iso: date.toISOString(),
    utc,
    local,
    relative: relativeFrom(epochMs, now),
    dayOfWeek,
  };
}

export type ParseFlexibleResult =
  | { ok: true; epochMs: number; interpretedAs: "unix-seconds" | "unix-milliseconds" | "date-string" }
  | { ok: false; error: { message: string } };

/**
 * Parse flexible input: a bare number is treated as Unix seconds (≤ 1e11) or
 * milliseconds (larger); otherwise the string is passed to `Date`. Returns the
 * epoch-ms plus how the value was interpreted, or a typed error.
 */
export function parseFlexible(input: string): ParseFlexibleResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: { message: "Enter a timestamp or date." } };

  if (/^-?\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    // Heuristic: values under 1e11 are seconds (year ~5138), else milliseconds.
    const isSeconds = Math.abs(num) < 1e11;
    const epochMs = isSeconds ? num * 1000 : num;
    if (!Number.isFinite(epochMs)) {
      return { ok: false, error: { message: "Number is out of range." } };
    }
    return {
      ok: true,
      epochMs,
      interpretedAs: isSeconds ? "unix-seconds" : "unix-milliseconds",
    };
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return { ok: false, error: { message: "Could not parse that date." } };
  }
  return { ok: true, epochMs: parsed, interpretedAs: "date-string" };
}
