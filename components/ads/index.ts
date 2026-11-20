/**
 * Barrel for the GigAI Tools advertisement system.
 *
 * The AdSense loader is injected exactly once in `app/layout.tsx`. Everything
 * here is a client component that hydrates cleanly under static export.
 *
 * - {@link BaseAd}          the engine (lazy, single ref-guarded push, CLS-safe)
 * - Preset banners          {@link ResponsiveAd} {@link AdBanner}
 *                           {@link HeaderAd} {@link FooterAd}
 * - Native                  {@link InArticleAd} {@link NativeAd}
 * - Grids                   {@link MultiplexAd}
 * - Chrome                  {@link SidebarAd} (desktop-only; policy-capped at 300px)
 * - Opt-in                  {@link AutoAds} (page-level Auto ads; OFF by default)
 *
 * POLICY (AdSense ad-placement rules: do not regress):
 * - NO manual sticky/fixed ads on mobile or tablet, and none wider than 300px
 *   anywhere; screen-edge anchors are Google-served (Auto ads) only.
 * - NO ads on screens without publisher content (search/empty/error states).
 * - Visible ad labels must read exactly "Advertisements" (or "Sponsored Links").
 */
export { BaseAd, type BaseAdProps } from "@/components/ads/base-ad";
export type { PresetAdProps } from "@/components/ads/types";

export { ResponsiveAd } from "@/components/ads/responsive-ad";
export { AdBanner } from "@/components/ads/ad-banner";
export { InArticleAd } from "@/components/ads/in-article-ad";
export { SidebarAd } from "@/components/ads/sidebar-ad";
export { HeaderAd } from "@/components/ads/header-ad";
export { FooterAd } from "@/components/ads/footer-ad";
export { MultiplexAd } from "@/components/ads/multiplex-ad";
export { NativeAd } from "@/components/ads/native-ad";
export { AutoAds, type AutoAdsProps } from "@/components/ads/auto-ads";
