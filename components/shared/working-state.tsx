"use client";

import * as React from "react";

/**
 * Duration-aware progress plumbing (de-ai-ux spec, Rule 1 / Nielsen's limits).
 *
 * The rules, and who enforces them:
 *  - under 1s: show NOTHING. A spinner on a fast operation makes it feel
 *    slower. `WorkGate` keeps existing progress UIs invisible through this
 *    grace period, so every warm image op stops flashing an overlay.
 *  - 1-10s: the shells' existing indeterminate/skeleton UIs are right.
 *  - over 10s: attention has broken. `ElapsedNote` adds the honest layer the
 *    bars lack: elapsed time always, a remaining estimate once measurable
 *    progress supports one, and a plain statement when progress CANNOT be
 *    measured (never a fake timer-driven bar).
 *  - completion while the tab is backgrounded: `notifyDoneInTitle` flips the
 *    title bar so the user spots it from another tab, and restores it the
 *    moment they return.
 */

export type WorkTier = "instant" | "short" | "long";

/** Milliseconds after which work UI may appear at all. */
const GRACE_MS = 1000;
/** Milliseconds after which the full >10s treatment applies. */
const LONG_MS = 10_000;

/** Tracks how long `busy` has been continuously true. Resets when it drops. */
export function useWorkTier(busy: boolean): { tier: WorkTier; elapsedMs: number } {
  const startRef = React.useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);

  React.useEffect(() => {
    if (!busy) {
      startRef.current = null;
      setElapsedMs(0);
      return;
    }
    startRef.current = performance.now();
    setElapsedMs(0);
    const timer = window.setInterval(() => {
      if (startRef.current != null) {
        setElapsedMs(performance.now() - startRef.current);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [busy]);

  const tier: WorkTier = elapsedMs < GRACE_MS ? "instant" : elapsedMs < LONG_MS ? "short" : "long";
  return { tier, elapsedMs };
}

/**
 * Renders children only after work has been running for the 1s grace period.
 * Wrap any existing progress UI in it; sub-second operations then show no
 * loading state at all, which is the point.
 */
export function WorkGate({
  busy,
  children,
}: {
  busy: boolean;
  children: React.ReactNode;
}) {
  const { tier } = useWorkTier(busy);
  if (!busy || tier === "instant") return null;
  return <>{children}</>;
}

function formatClock(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

/**
 * The >10s honesty line: elapsed time, an estimate when `progress` (0-1) is
 * real and far enough along to extrapolate, and a plain "can't measure this
 * step" when it isn't. Renders nothing before the long tier - mount it
 * unconditionally next to any progress bar.
 */
export function ElapsedNote({
  busy,
  progress,
  className,
}: {
  busy: boolean;
  /** Real progress 0-1, or null/undefined when this step can't be measured. */
  progress?: number | null;
  className?: string;
}) {
  const { tier, elapsedMs } = useWorkTier(busy);
  if (!busy || tier !== "long") return null;

  let estimate: string | null = null;
  if (typeof progress === "number" && progress >= 0.05 && progress < 1) {
    const remainingMs = (elapsedMs * (1 - progress)) / progress;
    estimate = `about ${formatClock(remainingMs)} left`;
  }

  return (
    <p className={className ?? "mt-2 text-xs tabular-nums text-muted-foreground"}>
      {formatClock(elapsedMs)} elapsed
      {estimate ? ` · ${estimate}` : ""}
      {progress == null ? " · this step doesn't report progress, but it is running" : ""}
    </p>
  );
}

/* ── title-bar completion notice ─────────────────────────────────────────── */

let restoreTitle: (() => void) | null = null;

/**
 * When the tab is backgrounded at completion, prefix the title so the user
 * sees the finish from another tab; restore on their return. No-op when the
 * tab is visible - the result on screen already says it.
 */
export function notifyDoneInTitle(message = "Done"): void {
  if (typeof document === "undefined" || !document.hidden) return;
  restoreTitle?.();
  const original = document.title;
  document.title = `✓ ${message} — ${original}`;
  const onVisible = () => {
    if (!document.hidden) {
      document.title = original;
      document.removeEventListener("visibilitychange", onVisible);
      restoreTitle = null;
    }
  };
  restoreTitle = () => {
    document.title = original;
    document.removeEventListener("visibilitychange", onVisible);
    restoreTitle = null;
  };
  document.addEventListener("visibilitychange", onVisible);
}
