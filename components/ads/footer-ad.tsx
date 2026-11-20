"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";

/**
 * Slim responsive banner intended for a page's footer area. Defaults to the
 * `FOOTER` placement.
 */
export function FooterAd({
  position = "FOOTER",
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
