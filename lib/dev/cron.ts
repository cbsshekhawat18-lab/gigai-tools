/**
 * GigAI Tools, cron engine.
 *
 * Human descriptions via cronstrue; upcoming run times via cron-parser
 * (v5 `CronExpressionParser.parse`). Both are dynamic-imported. A small helper
 * composes a 5-field cron expression from individual fields. Invalid expressions
 * return typed errors, never throw.
 */

export type CronResult<T> = { ok: true; value: T } | { ok: false; error: { message: string } };

/** Individual fields of a standard 5-field cron expression. */
export interface CronFields {
  minute?: string;
  hour?: string;
  dayOfMonth?: string;
  month?: string;
  dayOfWeek?: string;
}

/** Describe a cron expression in plain English via cronstrue. */
export async function describeCron(expr: string): Promise<CronResult<string>> {
  const trimmed = expr.trim();
  if (!trimmed) return { ok: false, error: { message: "Enter a cron expression." } };
  try {
    const cronstrue = (await import("cronstrue")).default;
    const text = cronstrue.toString(trimmed, { throwExceptionOnParseError: true });
    return { ok: true, value: text };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/**
 * Compute the next `count` run times for a cron expression, as ISO strings.
 * Pass `tz` (an IANA zone like "America/New_York") to evaluate in that zone;
 * omit it to use UTC. Returns a typed error for invalid expressions.
 */
export async function nextCronRuns(
  expr: string,
  count = 5,
  opts: { tz?: string; currentDate?: Date } = {},
): Promise<CronResult<string[]>> {
  const trimmed = expr.trim();
  if (!trimmed) return { ok: false, error: { message: "Enter a cron expression." } };
  const n = Math.max(1, Math.min(100, Math.floor(count)));
  try {
    const { CronExpressionParser } = await import("cron-parser");
    const interval = CronExpressionParser.parse(trimmed, {
      currentDate: opts.currentDate ?? new Date(),
      tz: opts.tz ?? "UTC",
    });
    const runs = interval.take(n).map((d) => d.toDate().toISOString());
    return { ok: true, value: runs };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/**
 * Compose a 5-field cron expression from individual fields, defaulting each to
 * `*`. Purely mechanical. It does not validate the field values (use
 * `describeCron` / `nextCronRuns` for that).
 */
export function buildCron(fields: CronFields): string {
  const f = (v: string | undefined) => (v && v.trim() ? v.trim() : "*");
  return [
    f(fields.minute),
    f(fields.hour),
    f(fields.dayOfMonth),
    f(fields.month),
    f(fields.dayOfWeek),
  ].join(" ");
}
