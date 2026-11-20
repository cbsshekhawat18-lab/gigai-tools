"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (`public/sw.js`) once the page has loaded, so
 * registration never competes with hydration or LCP. Renders nothing.
 *
 * The SW gives the platform intelligent caching + offline mode: hashed chunks
 * cache-first, small assets stale-while-revalidate, and every visited page
 * works offline (see the strategy notes in sw.js). Secure contexts only -
 * browsers ignore SW on plain http (except localhost, which is handy for
 * local verification of the exported build).
 */
export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failing (old browser, private mode) is non-fatal */
      });
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
