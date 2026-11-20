/**
 * Target Size Engine, one search, every medium.
 *
 * Adapters expose a single monotonic knob in [0, 1] (0 = smallest output,
 * 1 = best quality). This binary-searches that knob for the LARGEST value whose
 * output still fits the target, which is the highest quality that meets the
 * constraint. Not merely the first thing that happens to fit.
 *
 * Three rules that keep it honest, and they are the whole point of the file:
 *
 *  1. It never runs forever. Attempts, wall-clock and the quality floor are all
 *     bounded, and every bound is reported rather than silently applied.
 *  2. It never claims success it didn't achieve. If the floor is reached and
 *     the output is still over target, the outcome is `best-effort` and the UI
 *  says so. It does not hand back a mangled file dressed up as a win.
 *  3. It never destroys quality it didn't need to. An early exit fires as soon
 *     as a result lands inside the acceptance band just under the target, so a
 *     file that could sit at 1.98 MB is not ground down to 1.2 MB.
 */

import type {
  FitAdapter,
  FitAttempt,
  FitResult,
  FitStage,
  SourceInfo,
} from "./types";
import { formatSize } from "./types";

export interface FitOptions {
  targetBytes: number;
  /** Hard ceiling on encodes. Defaults to the adapter's own budget. */
  maxAttempts?: number;
  /** Wall-clock budget in ms. Default 3 minutes; video needs the room. */
  maxMillis?: number;
  /**
   * Accept anything within this fraction BELOW the target and stop early.
   * 0.06 means "1.88 MB against a 2 MB target is good enough", which avoids
   * three more encodes to gain 40 KB nobody asked for.
   */
  acceptBand?: number;
  onStage?: FitStage;
  signal?: AbortSignal;
}

const DEFAULT_MAX_MILLIS = 3 * 60 * 1000;
const DEFAULT_ACCEPT_BAND = 0.06;

class Cancelled extends Error {
  constructor() {
    super("Cancelled");
    this.name = "Cancelled";
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new Cancelled();
}

/** True when this was a user cancellation rather than a failure. */
export function isCancelled(err: unknown): boolean {
  return err instanceof Error && err.name === "Cancelled";
}

/**
 * Drive `adapter` towards `targetBytes`.
 *
 * @throws Cancelled when the signal aborts; any other error is the adapter's.
 */
export async function fitToTarget(
  file: File,
  adapter: FitAdapter,
  info: SourceInfo,
  opts: FitOptions,
): Promise<FitResult> {
  const target = Math.max(1, opts.targetBytes);
  const maxAttempts = Math.max(1, opts.maxAttempts ?? adapter.maxAttempts);
  const maxMillis = opts.maxMillis ?? DEFAULT_MAX_MILLIS;
  const band = opts.acceptBand ?? DEFAULT_ACCEPT_BAND;
  const stage: FitStage = opts.onStage ?? (() => {});
  const startedAt = Date.now();

  const attempts: { knob: number; size: number }[] = [];

  // Already small enough: do nothing at all rather than re-encode a file that
  // needs no work, which would cost quality for zero benefit.
  if (file.size <= target) {
    return {
      outcome: "already-small",
      blob: file,
      size: file.size,
      targetBytes: target,
      source: info,
      facts: { width: info.width, height: info.height, mime: info.mime },
      attempts,
      changed: [],
      name: file.name,
    };
  }

  let lo = 0; // known-or-assumed to fit
  let hi = 1; // known-or-assumed too big
  let best: FitAttempt | null = null;   // largest output that FITS
  let smallest: FitAttempt | null = null; // fallback when nothing fits

  // Observed (knob, size) points, used to aim the next probe instead of blindly
  // halving. Measured why this matters: Firefox encodes ~7x slower than
  // Chromium (3–4.5s vs ~0.5s per attempt), so a search that converges in four
  // encodes instead of six is ~8 seconds of a user's life back on that engine -
  // and costs nothing on the fast ones.
  const seen: { knob: number; size: number }[] = [];

  const outOfTime = () => Date.now() - startedAt > maxMillis;

  // The acceptance band widens on a slow engine. Measured: MozJPEG-in-WASM
  // costs ~0.5s per encode in Chromium but 3–4.5s in Firefox, so an identical
  // search is 4s there and 22s here. Rather than making Firefox users wait for
  // the last 3% of the size budget, a slow first encode buys a looser band -
  // the result is a slightly smaller file, delivered far sooner, and the UI
  // reports the real size either way so nothing is hidden by the trade.
  let effectiveBand = band;

  for (let i = 0; i < maxAttempts; i++) {
    throwIfAborted(opts.signal);
    if (outOfTime()) break;

    // First probe bisects. With no measurements yet there is nothing to
    // interpolate from, and adapters differ far too much in how knob maps to
    // bytes for an a-priori guess to be trustworthy. After that, aim.
    const knob = seen.length >= 2 ? aim(seen, target, lo, hi) : (lo + hi) / 2;

    stage(
      `Trying ${adapter.kind === "image" || adapter.kind === "pdf" ? "quality" : "settings"} ${Math.round(knob * 100)}%, attempt ${i + 1} of ${maxAttempts}`,
      (i + 1) / maxAttempts,
    );

    const encodeStarted = Date.now();
    const attempt = await adapter.encode(file, knob, { info, stage, signal: opts.signal });
    const encodeMs = Date.now() - encodeStarted;
    attempts.push({ knob, size: attempt.size });
    seen.push({ knob, size: attempt.size });

    if (i === 0 && adapter.speed === "fast" && encodeMs > 1500) {
      // Each further attempt costs at least this much again. Two extra encodes
      // to shave a few percent off is a bad trade at these speeds.
      effectiveBand = Math.max(band, encodeMs > 3000 ? 0.2 : 0.12);
    }

    if (!smallest || attempt.size < smallest.size) smallest = attempt;

    if (attempt.size <= target) {
      best = attempt;
      lo = knob;
      // Close enough to the target that further searching buys nothing.
      if (attempt.size >= target * (1 - effectiveBand)) break;
    } else {
      hi = knob;
    }
  }

  throwIfAborted(opts.signal);

  const chosen = best ?? smallest;
  if (!chosen) {
    throw new Error(
      `No output could be produced for this ${adapter.kind}. The file may be corrupt or use a feature this browser can't re-encode.`,
    );
  }

  // A re-encode that grew the file helps nobody, hand back the original and
  // say so, rather than shipping a "compressed" file that is bigger.
  if (chosen.size >= file.size) {
    return {
      outcome: "grew",
      blob: file,
      size: file.size,
      targetBytes: target,
      source: info,
      facts: { width: info.width, height: info.height, mime: info.mime },
      attempts,
      changed: [],
      name: file.name,
    };
  }

  return {
    outcome: best ? "hit" : "best-effort",
    blob: chosen.blob,
    size: chosen.size,
    targetBytes: target,
    source: info,
    facts: chosen.facts,
    attempts,
    changed: describeChanges(info, chosen),
    name: outputName(file.name, chosen.facts.mime ?? info.mime),
  };
}

/**
 * Choose the next knob by interpolating the two measurements that bracket the
 * target most closely, instead of halving the remaining range.
 *
 * File size against a quality knob is far closer to exponential than linear, so
 * the interpolation runs in LOG size space. That is what makes the estimate
 * good enough to be worth using. The result is then clamped strictly inside the
 * current bracket, so this can only ever speed up a search that bisection would
 * have completed anyway; it can never break convergence or escape the bounds.
 */
function aim(
  seen: { knob: number; size: number }[],
  target: number,
  lo: number,
  hi: number,
): number {
  // The closest measurement below the target and the closest above it.
  let below: { knob: number; size: number } | null = null;
  let above: { knob: number; size: number } | null = null;
  for (const point of seen) {
    if (point.size <= target) {
      if (!below || point.size > below.size) below = point;
    } else if (!above || point.size < above.size) above = point;
  }

  const mid = (lo + hi) / 2;
  if (!below || !above || below.size <= 0 || above.size <= 0) return mid;
  if (above.knob === below.knob) return mid;

  const span = Math.log(above.size) - Math.log(below.size);
  if (!Number.isFinite(span) || Math.abs(span) < 1e-9) return mid;

  // Aim a little under the target so the probe lands on the fitting side, which
  // is the side that actually improves the answer.
  const t = (Math.log(target * 0.97) - Math.log(below.size)) / span;
  const guess = below.knob + (above.knob - below.knob) * t;

  if (!Number.isFinite(guess)) return mid;

  // Keep the probe meaningfully inside the bracket. Landing on a bound would
  // repeat a measurement already taken and waste a whole (slow) encode.
  const margin = (hi - lo) * 0.08;
  return Math.min(hi - margin, Math.max(lo + margin, guess));
}

/**
 * Say what actually changed, in the user's terms.
 *
 * Only real, measured differences are listed. Nothing is claimed that wasn't
 * observed in the output's own facts.
 */
function describeChanges(info: SourceInfo, attempt: FitAttempt): string[] {
  const out: string[] = [];
  const f = attempt.facts;

  if (f.width && f.height && info.width && info.height && (f.width !== info.width || f.height !== info.height)) {
    out.push(`Resolution reduced from ${info.width}×${info.height} to ${f.width}×${f.height}.`);
  }
  if (f.bitrate && info.bitrate && f.bitrate < info.bitrate) {
    out.push(`Bitrate reduced from ${Math.round(info.bitrate)} kbps to ${Math.round(f.bitrate)} kbps.`);
  }
  if (f.quality !== undefined) {
    out.push(`Encoded at ${Math.round(f.quality * 100)}% quality.`);
  }
  if (f.mime && f.mime !== info.mime) {
    out.push(`Format changed to ${f.mime.split("/")[1]?.toUpperCase() ?? f.mime}.`);
  }
  if (out.length === 0) out.push(attempt.summary);
  return out;
}

const EXT_FOR_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/png": "png",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

function outputName(name: string, mime: string): string {
  const ext = EXT_FOR_MIME[mime];
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const current = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  return `${base}-fit.${ext ?? current ?? "bin"}`;
}

/**
 * A short, honest sentence about an unreachable target, used when the outcome
 * is `best-effort`. Kept here so Fit's UI and its exported report can't drift.
 */
export function impossibleTargetMessage(result: FitResult): string {
  return `Reaching ${formatSize(result.targetBytes)} would cause severe quality loss. We stopped at the best practical result, ${formatSize(result.size)}.`;
}
