"use client";

import { BaseAd } from "@/components/ads/base-ad";
import type { PresetAdProps } from "@/components/ads/types";
import { cn } from "@/lib/utils";

/**
 * Tall responsive display unit for a desktop sidebar. Sticks below the header
 * (`top-24`) while scrolling and is hidden entirely on mobile (`< lg`), where a
 * sidebar column doesn't exist. Defaults to the `SIDEBAR` placement.
 *
 * POLICY: AdSense allows manual sticky units on DESKTOP ONLY, at most 300px
 * wide, one per viewport, never overlapping content, hence the hard
 * `max-w-[300px]` and `lg:` gating here. Do not loosen either.
 */
export function SidebarAd({
  position = "SIDEBAR",
  adSlot,
  adFormat,
  responsive = true,
  className,
  ...rest
}: PresetAdProps): React.JSX.Element {
  return (
    <aside
      aria-label="Advertisements"
      className={cn("hidden lg:block lg:sticky lg:top-24 lg:max-w-[300px]", className)}
    >
      <BaseAd
        position={position}
        slot={adSlot}
        format={adFormat ?? "auto"}
        responsive={responsive}
        {...rest}
      />
    </aside>
  );
}
