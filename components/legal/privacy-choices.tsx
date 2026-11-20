"use client";

import * as React from "react";

import { Icon } from "@/lib/icons";

/**
 * CCPA/CPRA "Do Not Sell or Share My Personal Information" control + GPC.
 *
 * The link renders for everyone, not just California: we deliberately collect
 * no location data, so geo-hiding the link would need a lookup that itself
 * costs privacy. Showing it universally is compliant everywhere and matches
 * the brand.
 *
 * Opt-out applies Google's documented signals:
 *  - `restricted_data_processing: true` via gtag (Google Ads / AdSense RDP)
 *  - Consent Mode: ad_user_data + ad_personalization -> denied
 *  - AdSense non-personalized ads (`requestNonPersonalizedAds = 1`)
 *
 * Global Privacy Control: a browser sending GPC is treated as an opt-out with
 * NO interaction required (the head script in google-analytics.tsx already set
 * RDP before any tag ran; this component reflects that state in the dialog and
 * re-applies the full signal set after hydration). The stored choice and GPC
 * share the `gigai-usp-optout` key contract.
 */
const KEY = "gigai-usp-optout";

function gpcActive(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

function storedOptOut(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Push the full opt-out signal set. Idempotent; safe before tags load. */
function applyOptOut() {
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
  };
  w.dataLayer = w.dataLayer || [];
  const gtag: (...args: unknown[]) => void =
    typeof w.gtag === "function" ? w.gtag : (...args) => (w.dataLayer as unknown[]).push(args);
  gtag("set", { restricted_data_processing: true });
  gtag("consent", "update", { ad_user_data: "denied", ad_personalization: "denied" });
  // NPA note: once adsbygoogle.js has processed the queue it replaces
  // window.adsbygoogle with an object that discards this write (probed live),
  // so mid-session the effective opt-out signals are the two gtag calls above.
  // The head script (google-analytics.tsx) sets the flag early, pre-loader,
  // from the stored choice - it applies from the next page load onward.
  w.adsbygoogle = w.adsbygoogle || [];
  w.adsbygoogle.requestNonPersonalizedAds = 1;
}

function clearOptOut() {
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
  };
  w.dataLayer = w.dataLayer || [];
  const gtag: (...args: unknown[]) => void =
    typeof w.gtag === "function" ? w.gtag : (...args) => (w.dataLayer as unknown[]).push(args);
  gtag("set", { restricted_data_processing: false });
  if (w.adsbygoogle) w.adsbygoogle.requestNonPersonalizedAds = 0;
  // Personalization consent is NOT re-granted here; that stays with the
  // consent banner / CMP, which owns the affirmative grant.
}

export function PrivacyChoices() {
  const [open, setOpen] = React.useState(false);
  const [optedOut, setOptedOut] = React.useState(false);
  const [gpc, setGpc] = React.useState(false);

  React.useEffect(() => {
    const viaGpc = gpcActive();
    const stored = storedOptOut();
    setGpc(viaGpc);
    if (viaGpc || stored) {
      setOptedOut(true);
      applyOptOut();
    }
  }, []);

  const choose = (out: boolean) => {
    try {
      localStorage.setItem(KEY, out ? "1" : "0");
    } catch {
      /* storage blocked */
    }
    setOptedOut(out);
    if (out) applyOptOut();
    else clearOptOut();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center text-left text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
      >
        Do Not Sell or Share My Personal Information
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Your privacy choices"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="Shield" size={16} className="text-primary" />
              Your privacy choices
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Our tools run in your browser and your files are never uploaded. The only
              third-party data use on this site is Google advertising and analytics. Opting out
              here turns on Google&apos;s restricted data processing and non-personalized ads,
              which is the &quot;do not sell or share&quot; signal under California law
              (CCPA/CPRA).
            </p>
            {gpc ? (
              <p className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-foreground">
                Your browser sends Global Privacy Control, so you are already opted out
                automatically. No action needed.
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-foreground">
                {optedOut ? "You are opted out." : "You are not opted out."}
              </span>
              <div className="flex gap-2">
                {!gpc ? (
                  <button
                    type="button"
                    onClick={() => choose(!optedOut)}
                    className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {optedOut ? "Opt back in" : "Opt out"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
