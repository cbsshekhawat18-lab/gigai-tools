/**
 * Analytics + verification IDs, read from build-time env (NEXT_PUBLIC_*) so they
 * bake into the static export. All optional: with none set, the analytics loader
 * and verification meta render nothing, zero third-party JS, no behaviour change.
 *
 * Set in `.env.production`:
 *   NEXT_PUBLIC_GA4_ID           e.g. G-XXXXXXXXXX (loads gtag.js directly)
 *   NEXT_PUBLIC_GSC_VERIFICATION e.g. the google-site-verification token (optional; DNS works too)
 *   NEXT_PUBLIC_BING_VERIFICATION the Bing Webmaster Tools msvalidate.01 token (optional)
 *
 * GA4 is loaded DIRECTLY rather than through Google Tag Manager: lib/analytics.ts
 * `track()` already forwards every event to both `dataLayer` and `gtag()`, so the
 * GTM container was an extra moving part that bought nothing here, the only tag
 * it ever needed to hold was GA4 itself.
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID?.trim() || "";
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim() || "";
/** Bing Webmaster Tools ownership token (the `msvalidate.01` meta), optional. */
export const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim() || "";

/** True when a GA4 property is configured, gates the loader + dataLayer usage. */
export const ANALYTICS_ENABLED = Boolean(GA4_ID);
