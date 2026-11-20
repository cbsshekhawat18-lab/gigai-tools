"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Options for {@link useInView}. */
export interface UseInViewOptions {
  /**
   * Margin grown around the root before intersection is reported. A positive
   * value pre-loads content just before it scrolls into view. Default `"300px"`.
   */
  rootMargin?: string;
  /** When `true` (default), stop observing after the first intersection. */
  once?: boolean;
  /** Intersection threshold(s). Default `0` (any pixel visible). */
  threshold?: number | number[];
}

/** Return shape of {@link useInView}. */
export interface UseInViewResult<T extends Element> {
  /** Attach to the element you want to observe. */
  ref: RefObject<T | null>;
  /** `true` once the element has intersected the viewport (per `once`). */
  inView: boolean;
}

/**
 * Observe whether an element has scrolled into (or near) the viewport.
 *
 * SSR-safe: returns `inView: false` during server render and the first client
 * render, then flips to `true` after the {@link IntersectionObserver} fires.
 * When `IntersectionObserver` is unavailable (very old browsers, some test
 * environments) it degrades gracefully by reporting `inView: true` on mount so
 * dependent content still renders.
 *
 * @example
 * const { ref, inView } = useInView<HTMLDivElement>();
 * return <div ref={ref}>{inView ? <Heavy /> : null}</div>;
 */
export function useInView<T extends Element>(
  opts: UseInViewOptions = {},
): UseInViewResult<T> {
  const { rootMargin = "300px", once = true, threshold = 0 } = opts;

  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already resolved and pinned — nothing left to observe.
    if (inView && once) return;

    // Graceful fallback where IntersectionObserver isn't supported.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // `threshold` may be an array literal; callers should pass a stable value.
  }, [rootMargin, once, threshold, inView]);

  return { ref, inView };
}
