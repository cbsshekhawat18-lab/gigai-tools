"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";

/**
 * Native in-article ad (`fluid` + `data-ad-layout="in-article"`), designed to
 * sit between paragraphs of long-form blog content. Defaults to the
 * `BLOG_MIDDLE` placement.
 */
export function InArticleAd({
  position = "BLOG_MIDDLE",
  adSlot,
  adFormat,
  layout,
  ...rest
}: PresetAdProps): React.JSX.Element {
  return (
    <BaseAd
      position={position}
      slot={adSlot}
      format={adFormat ?? "fluid"}
      layout={layout ?? "in-article"}
      {...rest}
    />
  );
}
