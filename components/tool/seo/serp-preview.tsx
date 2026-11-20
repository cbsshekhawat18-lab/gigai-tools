"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { SegmentedControl } from "@/components/tool/dev";

/**
 * A pixel-accurate Google search-result snippet preview. Renders the modern
 * result layout, favicon + site name / breadcrumb row, the blue clickable
 * title, and the description, for both desktop and mobile widths, with the
 * same pixel-width truncation Google applies. Live and controlled: give it
 * `{ title, url, description }` and it re-renders instantly.
 *
 * Google truncates the title and description by *rendered pixel width*, not
 * character count, so we measure with a canvas using the same fonts/sizes
 * Google uses (Arial, 20px title / 14px description on desktop; 16/14 mobile).
 */

/** Device the SERP is rendered for. */
export type SerpDevice = "desktop" | "mobile";

/** Props for {@link SerpPreview}. */
export interface SerpPreviewProps {
  /** Page `<title>` (blue link). */
  title: string;
  /** Full page URL, e.g. "https://example.com/blog/seo-guide". */
  url: string;
  /** Meta description. */
  description: string;
  /** Optional favicon data/URL. Falls back to a globe glyph. */
  faviconUrl?: string;
  /** Controlled device; when omitted an internal toggle is shown. */
  device?: SerpDevice;
  onDeviceChange?: (device: SerpDevice) => void;
  /** Show the desktop/mobile toggle. Default true (only when uncontrolled or handler given). */
  showToggle?: boolean;
  /** Simulated calendar date shown before the description (Google often prefixes one). */
  datePrefix?: string;
  className?: string;
}

/** Pixel budgets Google applies before appending an ellipsis. */
const LIMITS: Record<
  SerpDevice,
  { titlePx: number; descPx: number; titleFont: string; descFont: string; width: number }
> = {
  desktop: {
    titlePx: 600,
    descPx: 990, // ~2 lines of ~495px
    titleFont: "20px Arial, sans-serif",
    descFont: "14px Arial, sans-serif",
    width: 600,
  },
  mobile: {
    titlePx: 663, // ~3 lines but title usually 2; measured horizontally per line
    descPx: 828,
    titleFont: "16px Arial, sans-serif",
    descFont: "14px Arial, sans-serif",
    width: 400,
  },
};

/** Measure a string's rendered width in px using an offscreen canvas. */
function useTextMeasurer(): (text: string, font: string) => number {
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  return React.useCallback((text: string, font: string) => {
    if (typeof document === "undefined") return text.length * 8; // SSR estimate
    if (!ctxRef.current) {
      const canvas = document.createElement("canvas");
      ctxRef.current = canvas.getContext("2d");
    }
    const ctx = ctxRef.current;
    if (!ctx) return text.length * 8;
    ctx.font = font;
    return ctx.measureText(text).width;
  }, []);
}

/** Truncate `text` to fit `maxPx` at `font`, appending "…" when clipped. */
function truncateToWidth(
  measure: (t: string, f: string) => number,
  text: string,
  maxPx: number,
  font: string,
): { text: string; truncated: boolean } {
  const trimmed = text.trim();
  if (!trimmed) return { text: "", truncated: false };
  if (measure(trimmed, font) <= maxPx) return { text: trimmed, truncated: false };

  const ellipsis = "…";
  const ellipsisPx = measure(ellipsis, font);
  let lo = 0;
  let hi = trimmed.length;
  // Binary-search the longest prefix that fits with the ellipsis.
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const slice = trimmed.slice(0, mid);
    if (measure(slice, font) + ellipsisPx <= maxPx) lo = mid;
    else hi = mid - 1;
  }
  return { text: trimmed.slice(0, lo).trimEnd() + ellipsis, truncated: true };
}

/** Parse a URL into a Google-style breadcrumb: "example.com › blog › seo-guide". */
function toBreadcrumb(raw: string): { domain: string; crumb: string; origin: string } {
  let parsed: URL | null = null;
  try {
    parsed = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return { domain: raw || "example.com", crumb: "", origin: raw };
  }
  const domain = parsed.hostname.replace(/^www\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean).map((s) => decodeURIComponent(s));
  const crumb = segments.length ? ` › ${segments.join(" › ")}` : "";
  return { domain, crumb, origin: parsed.origin };
}

/** A favicon: image when provided, else a neutral globe on a light chip. */
function Favicon({ url, size }: { url?: string; size: number }) {
  if (url) {
    // Dynamic favicon (data/remote URL), plain <img> so static export handles it.
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-supplied preview URL; next/image can't optimize on static export
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-contain"
      />
    );
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-[#f1f3f4] text-[#5f6368]"
      style={{ width: size, height: size }}
    >
      <Icon name="Globe" size={size - 8} />
    </span>
  );
}

export function SerpPreview({
  title,
  url,
  description,
  faviconUrl,
  device: deviceProp,
  onDeviceChange,
  showToggle = true,
  datePrefix,
  className,
}: SerpPreviewProps) {
  const [deviceState, setDeviceState] = React.useState<SerpDevice>("desktop");
  const device = deviceProp ?? deviceState;
  const setDevice = (d: SerpDevice) => {
    onDeviceChange?.(d);
    if (deviceProp === undefined) setDeviceState(d);
  };

  const measure = useTextMeasurer();
  const limits = LIMITS[device];
  const { domain, crumb } = React.useMemo(() => toBreadcrumb(url), [url]);

  // Title: mobile wraps to 2 lines, so allow 2× the single-line budget.
  const titleBudget = device === "mobile" ? limits.titlePx * 2 : limits.titlePx;
  const titleOut = React.useMemo(
    () =>
      truncateToWidth(
        measure,
        title || "Your page title appears here",
        titleBudget,
        limits.titleFont,
      ),
    [measure, title, titleBudget, limits.titleFont],
  );
  const descOut = React.useMemo(
    () =>
      truncateToWidth(
        measure,
        description || "Your meta description appears here. Aim for 150–160 characters that summarize the page and earn the click.",
        limits.descPx,
        limits.descFont,
      ),
    [measure, description, limits.descPx, limits.descFont],
  );

  const showControls = showToggle && (deviceProp === undefined || onDeviceChange);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showControls && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Google preview</span>
          <SegmentedControl<SerpDevice>
           
            ariaLabel="Preview device"
            value={device}
            onChange={setDevice}
            options={[
              { value: "desktop", label: "Desktop", icon: "Monitor" },
              { value: "mobile", label: "Mobile", icon: "Smartphone" },
            ]}
          />
        </div>
      )}

      <div
        className={cn(
          "mx-auto w-full rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-[#202124]",
          device === "mobile" && "max-w-[400px] rounded-3xl border-[6px] p-4",
        )}
        style={{ maxWidth: device === "desktop" ? limits.width + 32 : undefined }}
      >
        <div className="font-arial text-left" style={{ fontFamily: "Arial, sans-serif" }}>
          {/* Site row: favicon + name + breadcrumb */}
          <div className="flex items-center gap-3">
            <Favicon url={faviconUrl} size={26} />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm text-[#202124] dark:text-[#e8eaed]">{domain}</div>
              <div className="truncate text-sm text-[#4d5156] dark:text-[#bdc1c6]">
                {domain}
                {crumb}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3
            className="mt-1 cursor-pointer text-[#1a0dab] hover:underline dark:text-[#8ab4f8]"
            style={{
              fontSize: device === "mobile" ? 18 : 20,
              lineHeight: 1.3,
              fontWeight: 400,
            }}
          >
            {titleOut.text}
          </h3>

          {/* Description */}
          <p
            className="mt-1 text-[#4d5156] dark:text-[#bdc1c6]"
            style={{ fontSize: 14, lineHeight: 1.58 }}
          >
            {datePrefix && (
              <span className="text-[#70757a] dark:text-[#9aa0a6]">{datePrefix} - </span>
            )}
            {descOut.text}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className={cn("inline-flex items-center gap-1", titleOut.truncated && "text-warning")}>
          <Icon name={titleOut.truncated ? "TriangleAlert" : "Check"} size={12} />
          Title {titleOut.truncated ? "truncated" : "fits"}
        </span>
        <span className={cn("inline-flex items-center gap-1", descOut.truncated && "text-warning")}>
          <Icon name={descOut.truncated ? "TriangleAlert" : "Check"} size={12} />
          Description {descOut.truncated ? "truncated" : "fits"}
        </span>
      </div>
    </div>
  );
}
