"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Global navigation loader. Client-side route changes (Next App Router) load a
 * new JS chunk, so there's a beat where a menu/link seems to "do nothing"; this
 * gives instant feedback: a glowing top progress bar on every navigation, plus,
 * for slower loads, an on-brand MORPHING BLOB loader (a nod to our SVG blob
 * studio. Not a generic spinner).
 *
 * It starts on any internal link click (and back/forward), then completes when
 * the pathname actually resolves. Self-contained, no dependency.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBlob, setShowBlob] = useState(false);
  const timers = useRef<number[]>([]);
  const first = useRef(true);
  /** Last RESOLVED path+search: popstate compares against this to tell real
      route changes from same-document hash jumps (see onPop). */
  const lastLoc = useRef<string | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const start = (opts?: { blob?: boolean; autoFinishMs?: number }) => {
    clearTimers();
    setActive(true);
    setProgress(10);
    timers.current.push(window.setTimeout(() => setProgress(40), 100));
    timers.current.push(window.setTimeout(() => setProgress(65), 300));
    timers.current.push(window.setTimeout(() => setProgress(82), 700));
    // Only surfaces if the navigation is still going after ~450ms.
    if (opts?.blob !== false) {
      timers.current.push(window.setTimeout(() => setShowBlob(true), 450));
    }
    // Watchdog: if no route ever resolves (e.g. a navigation Next cancels, or
    // a history entry the router doesn't own), never leave a stuck scrim.
    timers.current.push(window.setTimeout(finish, opts?.autoFinishMs ?? 8000));
  };

  const finish = () => {
    clearTimers();
    setShowBlob(false);
    setProgress(100);
    timers.current.push(
      window.setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 300),
    );
  };

  // Start on any same-origin link click (capture phase, before navigation).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || anchor.hasAttribute("download") || (target && target !== "_self")) return;
      if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // external
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page
      start();
    };
    const onPop = () => {
      // Chrome fires popstate on SAME-DOCUMENT fragment navigations too
      // (clicking "#workspace" jump links). Those never change the pathname,
      // so pathname-effect `finish()` would never run and the scrim would
      // stick. Only start for real route changes, and even then, back/forward
      // restores are near-instant AND may land on browser-created hash entries
      // the router never resolves (no pathname signal). So: top bar only, no
      // blocking blob, and a short auto-finish instead of the long watchdog.
      const now = window.location.pathname + window.location.search;
      if (now === lastLoc.current) return;
      start({ blob: false, autoFinishMs: 900 });
    };
    lastLoc.current = window.location.pathname + window.location.search;
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Complete when the route resolves.
  useEffect(() => {
    lastLoc.current = window.location.pathname + window.location.search;
    if (first.current) {
      first.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!active) return null;

  return (
    <>
      {/* Top progress bar - brand gradient + glow + shimmer sweep */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]" role="status" aria-label="Loading page">
        <div
          className="relative h-full overflow-hidden rounded-r-full bg-gradient-to-r from-primary via-teal-500 to-primary shadow-[0_0_14px_2px] shadow-primary/50 transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <span className="gigai-nav-shimmer absolute inset-y-0 -left-6 w-16 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
      </div>

      {/* Branded morphing-blob loader for slower navigations - a full-page dim
          scrim (theme-aware) sits behind it so the whole page reads as "loading"
          and stays non-interactive until the route resolves. */}
      {showBlob ? (
        <div className="fixed inset-0 z-[99] flex items-center justify-center" role="status" aria-label="Loading page">
          <div className="gigai-nav-scrim absolute inset-0 bg-background/70 backdrop-blur-[3px]" />
          <div className="gigai-nav-pop relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-8 py-7 shadow-2xl">
            <span className="gigai-blob-loader size-12 bg-gradient-to-br from-primary via-teal-500 to-primary shadow-lg shadow-primary/40" />
            <span className="text-xs font-medium text-muted-foreground">Loading…</span>
          </div>
        </div>
      ) : null}
    </>
  );
}
