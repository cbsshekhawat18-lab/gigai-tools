"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { SegmentedControl } from "@/components/tool/dev";

/**
 * Renders the share card a page produces on the major social networks from its
 * Open Graph / Twitter Card tags. Each platform crops, sizes and labels the
 * card differently, so we reproduce Facebook, X (Twitter), and LinkedIn
 * faithfully. Live + controlled: pass `{ title, description, image, url }` and
 * (for Twitter) the `card` type, then toggle platforms.
 */

/** Supported preview platforms. */
export type SocialPlatform = "facebook" | "twitter" | "linkedin";

/** Twitter card layouts. */
export type TwitterCardType = "summary" | "summary_large_image";

/** The metadata a share card is built from. */
export interface SocialCardData {
  title: string;
  description: string;
  /** OG/Twitter image URL or data URI. */
  image?: string;
  /** Canonical/share URL; its host is shown as the card's source label. */
  url: string;
  /** Site name (og:site_name), shown by some platforms. */
  siteName?: string;
  /** Twitter card layout. Default "summary_large_image". */
  card?: TwitterCardType;
}

/** Props for {@link SocialCardPreview}. */
export interface SocialCardPreviewProps extends SocialCardData {
  /** Controlled platform; when omitted an internal toggle is shown. */
  platform?: SocialPlatform;
  onPlatformChange?: (platform: SocialPlatform) => void;
  /** Show the platform toggle. Default true. */
  showToggle?: boolean;
  className?: string;
}

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
};

/** Extract the bare display host (no scheme, no www) for the card source label. */
function displayHost(raw: string): string {
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? raw;
  }
}

/** Shared image slot: renders the OG image, or a neutral placeholder. */
function CardImage({
  image,
  aspect,
  rounded,
}: {
  image?: string;
  aspect: string;
  rounded?: string;
}) {
  if (image) {
    // Remote/data image, plain <img> for static export + arbitrary hosts.
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-supplied preview image; next/image can't optimize on static export
      <img
        src={image}
        alt=""
        className={cn("w-full object-cover", rounded)}
        style={{ aspectRatio: aspect }}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground",
        rounded,
      )}
      style={{ aspectRatio: aspect }}
    >
      <div className="flex flex-col items-center gap-1">
        <Icon name="Image" size={28} />
        <span className="text-sm">og:image</span>
      </div>
    </div>
  );
}

/** Facebook feed share card: large image, grey meta bar, title, description. */
function FacebookCard({ title, description, image, url, siteName }: SocialCardData) {
  const host = displayHost(url);
  return (
    <div className="mx-auto w-full max-w-[500px] overflow-hidden rounded-lg border border-[#dadde1] bg-white font-sans dark:border-[#3e4042] dark:bg-[#242526]">
      <CardImage image={image} aspect="1.91 / 1" />
      <div className="border-t border-[#dadde1] bg-[#f2f3f5] px-3 py-2.5 dark:border-[#3e4042] dark:bg-[#3a3b3c]">
        <div className="text-[11px] uppercase tracking-wide text-[#606770] dark:text-[#b0b3b8]">
          {siteName ?? host}
        </div>
        <div className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[#1d2129] dark:text-[#e4e6eb]">
          {title || "Your Open Graph title"}
        </div>
        {description && (
          <div className="mt-0.5 line-clamp-1 text-[13px] text-[#606770] dark:text-[#b0b3b8]">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

/** X/Twitter card, supports summary (small square) and large-image layouts. */
function TwitterCard({ title, description, image, url, card = "summary_large_image" }: SocialCardData) {
  const host = displayHost(url);
  if (card === "summary") {
    return (
      <div className="mx-auto flex w-full max-w-[500px] overflow-hidden rounded-2xl border border-[#cfd9de] bg-white font-sans dark:border-[#38444d] dark:bg-black">
        <div className="w-[130px] shrink-0 border-r border-[#cfd9de] dark:border-[#38444d]">
          <CardImage image={image} aspect="1 / 1" />
        </div>
        <div className="min-w-0 flex-1 px-3 py-2.5">
          <div className="text-[13px] text-[#536471] dark:text-[#8b98a5]">{host}</div>
          <div className="mt-0.5 line-clamp-1 text-[15px] font-normal text-[#0f1419] dark:text-[#e7e9ea]">
            {title || "Your Twitter card title"}
          </div>
          {description && (
            <div className="mt-0.5 line-clamp-2 text-[15px] text-[#536471] dark:text-[#8b98a5]">
              {description}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="relative mx-auto w-full max-w-[500px] overflow-hidden rounded-2xl border border-[#cfd9de] bg-white font-sans dark:border-[#38444d] dark:bg-black">
      <CardImage image={image} aspect="1.91 / 1" />
      <div className="absolute bottom-3 left-3 rounded bg-black/70 px-1.5 py-0.5 text-[13px] text-white">
        {title ? (title.length > 42 ? `${title.slice(0, 42)}…` : title) : "Your title"}
      </div>
      <div className="px-3 py-2 text-[13px] text-[#536471] dark:text-[#8b98a5]">{host}</div>
    </div>
  );
}

/** LinkedIn feed card: image with a white meta bar; bold title + host. */
function LinkedInCard({ title, image, url }: SocialCardData) {
  const host = displayHost(url);
  return (
    <div className="mx-auto w-full max-w-[500px] overflow-hidden rounded-lg border border-[#e0e0e0] bg-white font-sans shadow-sm dark:border-[#38434f] dark:bg-[#1b1f23]">
      <CardImage image={image} aspect="1.91 / 1" />
      <div className="px-3 py-2.5">
        <div className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#000000e6] dark:text-[#ffffffe6]">
          {title || "Your Open Graph title"}
        </div>
        <div className="mt-0.5 text-[12px] text-[#00000099] dark:text-[#ffffff99]">{host}</div>
      </div>
    </div>
  );
}

export function SocialCardPreview({
  platform: platformProp,
  onPlatformChange,
  showToggle = true,
  className,
  ...data
}: SocialCardPreviewProps) {
  const [platformState, setPlatformState] = React.useState<SocialPlatform>("facebook");
  const platform = platformProp ?? platformState;
  const setPlatform = (p: SocialPlatform) => {
    onPlatformChange?.(p);
    if (platformProp === undefined) setPlatformState(p);
  };

  const showControls = showToggle && (platformProp === undefined || onPlatformChange);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showControls && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">Share preview</span>
          <SegmentedControl<SocialPlatform>
           
            ariaLabel="Social platform"
            value={platform}
            onChange={setPlatform}
            options={[
              { value: "facebook", label: "Facebook", icon: "Facebook" },
              { value: "twitter", label: "X", icon: "Twitter" },
              { value: "linkedin", label: "LinkedIn", icon: "Linkedin" },
            ]}
          />
        </div>
      )}

      <div
        className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6"
        role="group"
        aria-label={`${PLATFORM_LABEL[platform]} share card preview`}
      >
        {platform === "facebook" && <FacebookCard {...data} />}
        {platform === "twitter" && <TwitterCard {...data} />}
        {platform === "linkedin" && <LinkedInCard {...data} />}
      </div>
    </div>
  );
}
