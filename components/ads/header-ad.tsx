"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";

/**
 * Slim responsive banner intended for a page's header/masthead area. Defaults
 * to the `HEADER` placement. Never place this over a tool workspace.
 */
export function HeaderAd({
  position = "HEADER",
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
