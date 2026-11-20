"use client";

import { useEffect, useRef } from "react";

import { ADS_ENABLED, ADSENSE_CLIENT } from "@/config/ads";
import { track } from "@/lib/analytics";

/** Page-level Auto ads config accepted by `adsbygoogle.push`. */
interface AutoAdsConfig {
  google_ad_client: string;
  enable_page_level_ads: true;
  overlays?: { bottom?: boolean };
}

interface AdsByGoogleWindow extends Window {
  adsbygoogle?: unknown[];
}

/** Props for {@link AutoAds}. */
export interface AutoAdsProps {
  /**
   * Enable AdSense Auto ads (page-level, machine-placed) for the page this is
   * mounted on. **Default `false`.** Leaving this off keeps ad placement fully
   * manual and predictable.
   */
  enabled?: boolean;
  /** Allow Auto ads to inject bottom overlay/anchor units. Default `false`. */
  overlayBottom?: boolean;
}

/**
 * Optional, page-scoped **Auto ads** enabler.
 *
 * Auto ads let Google automatically insert units anywhere on the page it sees
 * fit. That is convenient but UNCONTROLLED. It can drop ads over interactive
 * UI. For that reason this component is **OFF by default** and MUST NEVER be
 * mounted on tool pages (it could place an ad over the workspace, upload, or
 * download controls) or on the 404 page. Use it only on pure content pages
 * where you explicitly want machine-placed ads, and pass `enabled`.
 *
 * It relies on the single loader already present in `app/layout.tsx` and only
 * pushes the page-level config once.
 *
 * @example
 * // On a content-only page, opt in explicitly:
 * <AutoAds enabled />
 */
export function AutoAds({
  enabled = false,
  overlayBottom = false,
}: AutoAdsProps): null {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADS_ENABLED || !enabled || pushedRef.current) return;
    pushedRef.current = true;

    try {
      const config: AutoAdsConfig = {
        google_ad_client: ADSENSE_CLIENT,
        enable_page_level_ads: true,
        ...(overlayBottom ? { overlays: { bottom: true } } : {}),
      };
      const w = window as AdsByGoogleWindow;
      (w.adsbygoogle = w.adsbygoogle ?? []).push(config);
      track("ad_loaded", { position: "AUTO_ADS", slot: "auto" });
    } catch {
      pushedRef.current = false;
      track("ad_failed", { position: "AUTO_ADS", slot: "auto" });
    }
  }, [enabled, overlayBottom]);

  return null;
}
