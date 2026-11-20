import type { CSSProperties } from "react";

import type { AdFormat, AdPositionKey } from "@/config/ads";

/**
 * Common props shared by every preset ad component. Each preset supplies its
 * own default `position`; all other fields override the resolved preset. The
 * `adSlot`/`adFormat` aliases exist because callers sometimes pass raw AdSense
 * values rather than a named position.
 */
export interface PresetAdProps {
  /** Named placement from `AD_POSITIONS`; defaults per component. */
  position?: AdPositionKey;
  /** Raw AdSense slot ID (overrides the position's slot). */
  adSlot?: string;
  /** Raw `data-ad-format` (overrides the position's format). */
  adFormat?: AdFormat;
  /** `data-ad-layout` (in-article fluid). */
  layout?: string;
  /** `data-ad-layout-key` (in-feed fluid). */
  layoutKey?: string;
  /** `data-full-width-responsive`. */
  responsive?: boolean;
  /** Reserved height (px) override for CLS. */
  minHeight?: number;
  /** Extra inline styles for the reserved wrapper. */
  style?: CSSProperties;
  /** Extra classes for the reserved wrapper. */
  className?: string;
  /** Lazy-mount near the viewport. Default `true`. */
  lazyLoad?: boolean;
}
