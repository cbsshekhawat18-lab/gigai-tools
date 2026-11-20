"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";

/**
 * Multiplex / content-recommendation grid (`data-ad-format="autorelaxed"`).
 * Used at the bottom of pages (home, category, tool, blog). Defaults to the
 * `HOME_BEFORE_FOOTER` placement; pass a `position` for the specific page.
 */
export function MultiplexAd({
  position = "HOME_BEFORE_FOOTER",
  adSlot,
  adFormat,
  ...rest
}: PresetAdProps): React.JSX.Element {
  return (
    <BaseAd
      position={position}
      slot={adSlot}
      format={adFormat ?? "autorelaxed"}
      {...rest}
    />
  );
}
