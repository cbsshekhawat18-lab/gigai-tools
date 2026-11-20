"use client";

import { useEffect } from "react";

import { recordVital } from "@/lib/vitals/store";
import { track } from "@/lib/analytics";

/**
 * Captures real-user Core Web Vitals (LCP/CLS/INP/TTFB/FCP): stores them locally
 * (`lib/vitals/store`) AND reports each to the dataLayer as a `web_vitals` event
 * (GA4 convention, integer value, CLS×1000; forwarded only when GTM is loaded,
 * otherwise a no-op). The `web-vitals` lib (~1.5 kB) is DYNAMICALLY imported
 * after `load`, so measurement never affects the metrics it measures. Renders nothing.
 */
type Metric = { name: string; value: number; id: string; rating: string };

function report(name: "LCP" | "CLS" | "INP" | "TTFB" | "FCP", m: Metric) {
  recordVital(name, m.value);
  track("web_vitals", {
    metric_name: name,
    // GA4 expects an integer; CLS is unitless so scale ×1000, others are ms.
    value: Math.round(name === "CLS" ? m.value * 1000 : m.value),
    metric_id: m.id,
    metric_rating: m.rating,
  });
}

export function VitalsTracker() {
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      void import("web-vitals").then(({ onLCP, onCLS, onINP, onTTFB, onFCP }) => {
        if (cancelled) return;
        onLCP((m) => report("LCP", m));
        onCLS((m) => report("CLS", m));
        onINP((m) => report("INP", m));
        onTTFB((m) => report("TTFB", m));
        onFCP((m) => report("FCP", m));
      });
    };
    if (document.readyState === "complete") start();
    else {
      window.addEventListener("load", start, { once: true });
      return () => {
        cancelled = true;
        window.removeEventListener("load", start);
      };
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
