"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";

/**
 * Responsive display banner (`data-ad-format="auto"`, full-width responsive).
 * The workhorse between content sections. Defaults to the `HOME_AFTER_POPULAR`
 * placement but any `position` (or raw `adSlot`) can be passed.
 */
export function ResponsiveAd({
  position = "HOME_AFTER_POPULAR",
  adSlot,
  adFormat,
  responsive = true,
  ...rest
}: PresetAdProps): React.JSX.Element {
  return (
    <BaseAd
      position={position}
      slot={adSlot}
      format={adFormat ?? "auto"}
      responsive={responsive}
      {...rest}
    />
  );
}
