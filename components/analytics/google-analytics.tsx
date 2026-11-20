import { GA4_ID } from "@/config/analytics";

/**
 * GA4 (gtag.js) loader + Google Consent Mode v2 default + TCF gating.
 *
 * Server component: renders nothing unless NEXT_PUBLIC_GA4_ID is set, so the
 * static export ships zero third-party JS by default.
 *
 * ORDER MATTERS: this sets every storage type to "denied" BEFORE gtag.js runs,
 * and before the end-of-body AdSense loader, so ads/analytics start
 * consent-compliant. Two things can then flip consent: Google's certified CMP
 * (Privacy & messaging, published from the AdSense dashboard - it exposes
 * `__tcfapi` and drives Consent Mode itself for EEA/UK/CH visitors) or our own
 * banner for everyone else (components/legal/cookie-consent.tsx).
 *
 * TCF GATING (EEA/UK/CH): gtag.js is NOT injected immediately. We watch for
 * `window.__tcfapi` (Google's CMP stub only appears for in-scope visitors).
 *  - Stub appears  -> wait for a RESOLVED TC string ('tcloaded' or
 *    'useractioncomplete') before injecting gtag.js, so no Google Analytics
 *    request at all leaves the browser until the banner is answered.
 *  - No stub within ~4s -> out-of-scope visitor: inject gtag.js with the
 *    denied defaults (cookieless pings only until our banner is accepted).
 * If the CMP stub races in later than our timeout, gtag.js is already running
 * denied-by-default, which is Google's "advanced" Consent Mode - a safe
 * fallback, not a data leak.
 *
 * GPC: a browser sending Global Privacy Control is treated as an opt-out of
 * sale/sharing with no interaction: restricted data processing is set and
 * ad_user_data / ad_personalization stay denied (see privacy-choices.tsx,
 * which owns the CCPA link and shares the same storage key).
 *
 * The gtag.js loader is INJECTED from inside this inline script rather than
 * rendered as its own `<script async src>` element. React 19 hoists async
 * external scripts to the top of <head>, which would let gtag.js execute
 * before consent defaults were set if it came warm from cache. Creating the
 * element after the consent lines makes that impossible.
 *
 * Mounted inside <head>: React does NOT hoist inline dangerouslySetInnerHTML
 * scripts, so placing this in <body> would put it after </head> and Google's
 * tag testers report the tag as missing.
 */
export function GoogleAnalytics() {
  if (!GA4_ID) return null;
  return (
    <script
      id="ga-consent-and-loader"
      dangerouslySetInnerHTML={{
        __html:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;" +
          "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});" +
          "gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);" +
          // GPC / stored CCPA opt-out: restricted data processing before any
          // tag. The NPA flag must be set HERE, on the plain queue array,
          // because adsbygoogle.js replaces window.adsbygoogle with an object
          // that silently discards later property writes (probed live).
          "try{if(navigator.globalPrivacyControl===true||localStorage.getItem('gigai-usp-optout')==='1'){gtag('set',{restricted_data_processing:true});(window.adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;}}catch(e){}" +
          "gtag('js',new Date());" +
          `gtag('config','${GA4_ID}');` +
          "(function(){var loaded=false;function load(){if(loaded)return;loaded=true;" +
          "var s=document.createElement('script');s.async=true;" +
          `s.src='https://www.googletagmanager.com/gtag/js?id=${GA4_ID}';` +
          "document.head.appendChild(s);}" +
          "var tries=0;(function watch(){var tcf=window.__tcfapi;" +
          "if(typeof tcf==='function'){tcf('addEventListener',2,function(d,ok){" +
          "if(!ok)return load();" +
          "if(d&&d.gdprApplies===false)return load();" +
          "if(d&&(d.eventStatus==='tcloaded'||d.eventStatus==='useractioncomplete'))return load();});return;}" +
          "if(++tries>10)return load();setTimeout(watch,400);})();})();",
      }}
    />
  );
}
