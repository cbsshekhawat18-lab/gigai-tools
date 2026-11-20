"use client";

/**
 * UI density preference ("comfortable" | "compact"). Compact tightens the
 * whole interface ~14% by shrinking Tailwind v4's root --spacing variable
 * (see globals.css), one lever, every padding/gap/control height scales
 * proportionally while type sizes stay untouched for readability.
 *
 * Stored under "gt:density" (a UI preference like the theme. Not user data).
 * The root layout runs a tiny inline script that applies the attribute before
 * first paint so there's no flash; this module owns it from then on.
 */

export type Density = "comfortable" | "compact";

const KEY = "gt:density";
const listeners = new Set<() => void>();

export function getDensity(): Density {
  if (typeof document === "undefined") return "comfortable";
  return document.documentElement.getAttribute("data-density") === "compact"
    ? "compact"
    : "comfortable";
}

export function setDensity(density: Density): void {
  if (typeof document === "undefined") return;
  if (density === "compact") {
    document.documentElement.setAttribute("data-density", "compact");
  } else {
    document.documentElement.removeAttribute("data-density");
  }
  try {
    if (density === "compact") localStorage.setItem(KEY, "compact");
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode, the attribute still applies for this page-load */
  }
  listeners.forEach((cb) => cb());
}

export function subscribeDensity(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// NOTE: the no-FOUC bootstrap lives inline in app/layout.tsx (a server
// component can't import from this "use client" module). If KEY or the
// attribute ever changes, update the inline script there too.
