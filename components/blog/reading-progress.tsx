"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ReadingProgressProps {
  /**
   * CSS selector for the element whose scroll drives the bar. Defaults to the
   * first <article> on the page. Falls back to full-document scroll if missing.
   */
  target?: string;
  className?: string;
}

/**
 * A thin fixed progress bar pinned to the top of the viewport that fills as the
 * reader scrolls through the article body. Uses rAF-throttled scroll math and a
 * transform for a smooth, cheap fill. Hidden from assistive tech (decorative).
 */
export function ReadingProgress({ target = "article", className }: ReadingProgressProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    let frame = 0;

    const compute = () => {
      frame = 0;
      const scrollTop = window.scrollY;

      // Range across which the article is being read.
      let start = 0;
      let end = document.documentElement.scrollHeight - window.innerHeight;

      if (el) {
        const rect = el.getBoundingClientRect();
        start = rect.top + scrollTop;
        end = start + el.offsetHeight - window.innerHeight;
      }

      const span = end - start;
      const ratio = span <= 0 ? 1 : (scrollTop - start) / span;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent",
        className,
      )}
    >
      <div
        className="h-full origin-left bg-primary transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
