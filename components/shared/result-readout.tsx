import { cn } from "@/lib/utils";

/**
 * THE RESULT READOUT - the signature element of the UI-upgrade spec.
 *
 * Every tool here produces a measurable delta, and this is where it lands:
 * real numbers, set large in the mono face, with an instrument-style arrow
 * between them. This is the one place --signal appears at scale; everything
 * around it stays quiet so the payoff reads.
 *
 *     4.2 MB  ──────→  780 KB
 *     ORIGINAL         81% SMALLER
 *
 * Server-renderable (no client hooks). Compose via the helpers below so the
 * formatting stays identical across all 262 tools.
 */
export interface ResultReadoutProps {
  /** Left value, e.g. "4.2 MB" or "3024 × 4032". */
  from: string;
  /** Right value - the result, e.g. "780 KB" or "1080 × 1440". */
  to: string;
  /** Small label under the left value. Defaults to "original". */
  fromLabel?: string;
  /** Small label under the right value, e.g. "81% smaller" or "resized". */
  toLabel: string;
  className?: string;
}

export function ResultReadout({
  from,
  to,
  fromLabel = "original",
  toLabel,
  className,
}: ResultReadoutProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-5 py-4 font-mono",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col">
        <span className="text-xl font-medium tabular-nums text-muted-foreground sm:text-2xl">
          {from}
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {fromLabel}
        </span>
      </div>
      <span
        aria-hidden="true"
        className="mt-2.5 hidden flex-1 items-center text-border sm:flex"
      >
        <span className="h-px min-w-8 flex-1 bg-current" />
        <span className="-ml-px text-sm leading-none">→</span>
      </span>
      <span aria-hidden="true" className="mt-2 text-sm text-muted-foreground sm:hidden">
        →
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xl font-semibold tabular-nums text-primary sm:text-2xl">
          {to}
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-primary/80">
          {toLabel}
        </span>
      </div>
    </div>
  );
}

/* ── formatting helpers, shared so every tool reads the same ─────────────── */

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Props for a size-delta readout: "4.2 MB → 780 KB / 81% smaller". */
export function bytesReadout(
  originalBytes: number,
  resultBytes: number,
): ResultReadoutProps {
  const from = formatBytes(originalBytes);
  const to = formatBytes(resultBytes);
  if (resultBytes < originalBytes && originalBytes > 0) {
    const pct = Math.round((1 - resultBytes / originalBytes) * 100);
    return { from, to, toLabel: pct >= 1 ? `${pct}% smaller` : "smaller" };
  }
  if (resultBytes === originalBytes) return { from, to, toLabel: "unchanged" };
  return { from, to, toLabel: "converted" };
}

/** Props for a dimensions readout: "3024 × 4032 → 1080 × 1440 / resized". */
export function dimensionsReadout(
  fromW: number,
  fromH: number,
  toW: number,
  toH: number,
  toLabel = "resized",
): ResultReadoutProps {
  return {
    from: `${fromW} × ${fromH}`,
    to: `${toW} × ${toH}`,
    toLabel,
  };
}
