"use client";

import * as React from "react";
import Link from "next/link";

import { Icon } from "@/lib/icons";
import { ROUTES } from "@/config/constants";

/**
 * Lightweight, dependency-free cookie-consent banner. It sets Google Consent
 * Mode to "denied" by default and only grants ad/analytics storage once the
 * visitor accepts. The choice is remembered in localStorage so it shows once.
 *
 * IMPORTANT: this banner is NOT a Google-certified CMP, and since Jan 2024
 * AdSense requires a certified, IAB-TCF-integrated CMP to serve ads in the
 * EEA/UK/Switzerland. That job belongs to Google's own "Privacy & messaging"
 * GDPR message (published from the AdSense dashboard), which the AdSense
 * loader renders itself and which exposes `window.__tcfapi` / `googlefc`.
 * When that certified CMP is detected on the page we YIELD: hide this banner
 * and let Google's message own the consent flow, so EEA visitors never see
 * two banners and our gtag update can't fight the TCF signal.
 */
const KEY = "gigai-cookie-consent";

/**
 * True once Google's certified CMP is actively handling THIS visitor. The TCF
 * API stub only appears for visitors the GDPR message applies to (EEA/UK/CH),
 * so elsewhere our banner still runs and analytics consent still gets asked.
 */
function googleCmpActive(): boolean {
  return typeof (window as unknown as { __tcfapi?: unknown }).__tcfapi === "function";
}

type Choice = "allow" | "deny";

function applyConsent(choice: Choice) {
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  // Consent Mode reads an `arguments` object, NOT a plain array: use the global
  // gtag() defined by the tag manager. Shim only runs when no GTM is configured
  // (nothing consumes it then, so the queued shape is irrelevant).
  const gtag: (...args: unknown[]) => void =
    typeof w.gtag === "function"
      ? w.gtag
      : (...args) => {
          (w.dataLayer as unknown[]).push(args);
        };
  const val = choice === "allow" ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: val,
    ad_user_data: val,
    ad_personalization: val,
    analytics_storage: val,
  });
}

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Google's certified CMP owns consent for this visitor, stay out of the way.
    if (googleCmpActive()) return;

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* storage blocked */
    }
    if (stored === "allow" || stored === "deny") {
      applyConsent(stored);
      return;
    }
    applyConsent("deny");
    setVisible(true);

    // The AdSense loader fetches Google's CMP asynchronously, so it can appear
    // AFTER this effect ran. Watch briefly and hide ourselves if it does.
    const timer = window.setInterval(() => {
      if (googleCmpActive()) {
        setVisible(false);
        window.clearInterval(timer);
      }
    }, 500);
    const stop = window.setTimeout(() => window.clearInterval(timer), 8000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, []);

  const choose = (choice: Choice) => {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* storage blocked */
    }
    applyConsent(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[120] mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Cookie" size={15} className="mt-0.5 shrink-0 text-primary" />
        <span>
          We use cookies for essential features, analytics, and to serve ads via Google AdSense. See our{" "}
          <Link href={ROUTES.privacy} className="font-medium text-foreground underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </span>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => choose("deny")}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose("allow")}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
