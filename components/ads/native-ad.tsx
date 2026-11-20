"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";

/**
 * Native in-feed ad (`fluid` + a `data-ad-layout-key`), designed to blend into
 * a card grid as if it were another tool/article. Defaults to the
 * `NATIVE_FEED` placement.
 */
export function NativeAd({
  position = "NATIVE_FEED",
  adSlot,
  adFormat,
  layoutKey,
  ...rest
}: PresetAdProps): React.JSX.Element {
  return (
    <BaseAd
      position={position}
      slot={adSlot}
      format={adFormat ?? "fluid"}
      layoutKey={layoutKey ?? "-6t+ed+2i-1n-4w"}
      {...rest}
    />
  );
}
