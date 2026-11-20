"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";

/**
 * Generic banner ad, a thin, unopinionated wrapper over {@link BaseAd} using
 * the responsive display slot. Prefer {@link ResponsiveAd} for in-content
 * banners; use this when you want to pass a raw `adSlot`/`adFormat` directly.
 */
export function AdBanner({
  position,
  adSlot,
  adFormat,
  ...rest
}: PresetAdProps): React.JSX.Element {
  return (
    <BaseAd
      position={position}
      slot={adSlot}
      format={adFormat}
      {...rest}
    />
  );
}
