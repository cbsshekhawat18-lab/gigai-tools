"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  ADS_ENABLED,
  ADSENSE_CLIENT,
  AD_POSITIONS,
  type AdFormat,
  type AdPosition,
  type AdPositionKey,
} from "@/config/ads";
import { track } from "@/lib/analytics";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

/** Shape AdSense adds to `window`; `push` accepts unit or page-level configs. */
interface AdsByGoogleWindow extends Window {
  adsbygoogle?: unknown[] & { loaded?: boolean };
}

/**
 * Fill state of one unit, mirrored onto the wrapper as `data-ad-state` so the
 * stylesheet (not inline styles) decides what to show.
 * - `pending`  no verdict yet (server render, and until AdSense answers)
 * - `filled`   a real ad is showing
 * - `unfilled` AdSense returned nothing, or never answered: the box collapses
 */
type AdState = "pending" | "filled" | "unfilled";

/**
 * How long (ms) after the push we wait for AdSense to write `data-ad-status`
 * before collapsing the box anyway. Covers ad blockers (the loader never runs,
 * so no status is ever written) and stalled requests. The observer keeps
 * watching, so a slow but successful fill still re-opens the box.
 */
const FILL_TIMEOUT_MS = 6000;

/**
 * Map AdSense's `data-ad-status` attribute onto {@link AdState}. AdSense writes
 * `filled`, `unfilled`, or `unfill-optimized` (its own filler content, so it is
 * treated as filled and left visible, per Google's guidance).
 */
function readAdStatus(ins: HTMLElement): AdState {
  const status = ins.getAttribute("data-ad-status");
  if (status === "filled" || status === "unfill-optimized") return "filled";
  if (status === "unfilled") return "unfilled";
  return "pending";
}

/** Props for {@link BaseAd}, the engine every ad preset composes over. */
export interface BaseAdProps {
  /**
   * A named placement from {@link AD_POSITIONS}. When provided its slot/format/
   * layout/minHeight/etc. are used as defaults; any explicit prop below wins.
   */
  position?: AdPositionKey;
  /** Concrete AdSense slot ID. Required unless `position` is given. */
  slot?: string;
  /** `data-ad-format`. Defaults from `position` or `"auto"`. */
  format?: AdFormat;
  /** `data-ad-layout` (in-article fluid units). */
  layout?: string;
  /** `data-ad-layout-key` (in-feed fluid units). */
  layoutKey?: string;
  /** `data-full-width-responsive`. */
  responsive?: boolean;
  /** Reserved height (px) to prevent CLS before the ad fills. */
  minHeight?: number;
  /** Extra inline styles merged onto the reserved wrapper. */
  style?: CSSProperties;
  /** Extra classes for the reserved wrapper. */
  className?: string;
  /** Lazy-mount the `<ins>` only once near the viewport. Default `true`. */
  lazyLoad?: boolean;
  /**
   * Screen-reader / analytics label. Defaults from the `position` label. The
   * visible "Advertisements" tag is always shown regardless, AdSense permits
   * ONLY "Advertisements" or "Sponsored Links" as ad labels; no variations.
   */
  label?: string;
}

/**
 * The ad engine. Renders a reserved-space wrapper (to prevent layout shift)
 * with a subtle "Advertisements" label, lazily mounts an
 * `<ins class="adsbygoogle">`, and calls `adsbygoogle.push({})` exactly once
 * (ref-guarded so React strict-mode double effects can never double-push,
 * which would throw "All ins elements already have ads").
 *
 * - Hydration-safe: server + first client render show only the reserved
 *   placeholder; the `<ins>` mounts after the element is in view.
 * - Collapses when unfilled: once AdSense reports `data-ad-status="unfilled"`
 *   (or reports nothing within {@link FILL_TIMEOUT_MS}) the WHOLE box, label
 *   and reserved space included, is removed from layout. Before approval
 *   AdSense answers every unit with a sized but blank white iframe, so a
 *   merely invisible spacer still left a white block on dark pages and a
 *   250 to 600px hole on light ones.
 * - Analytics: fires `ad_loaded` / `ad_failed` via {@link track}.
 * - Respects the global {@link ADS_ENABLED} kill-switch (renders nothing off).
 */
export function BaseAd(props: BaseAdProps): React.JSX.Element | null {
  const preset: AdPosition | undefined = props.position
    ? AD_POSITIONS[props.position]
    : undefined;

  const slot = props.slot ?? preset?.slot;
  const format: AdFormat = props.format ?? preset?.format ?? "auto";
  const layout = props.layout ?? preset?.layout;
  const layoutKey = props.layoutKey ?? preset?.layoutKey;
  const responsive = props.responsive ?? preset?.responsive ?? false;
  const minHeight = props.minHeight ?? preset?.minHeight ?? 100;
  const label = props.label ?? preset?.label ?? "Advertisements";

  const lazyLoad = props.lazyLoad ?? true;

  // Observe the wrapper; when lazy-loading is off, treat as immediately in view.
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: "300px",
    once: true,
  });

  // The <ins> ELEMENT is always rendered, server included, so the ad code is
  // present in the static HTML. AdSense's "your account wasn't approved" page
  // requires live pages with ad code in place during review, and a reviewer
  // (or any crawler that doesn't scroll) previously saw zero ad units: the
  // element was client-only AND gated behind an IntersectionObserver, so
  // `curl` returned 0 matches for `class="adsbygoogle"` on every page.
  // It is static markup with fixed attributes, so SSR and CSR agree and
  // hydration stays clean.
  //
  // What stays lazy is the LOAD: `adsbygoogle.push()` still waits for mount
  // and viewport, which is where the performance win actually came from.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shouldLoadAd = mounted && (!lazyLoad || inView);

  // Guards so we push at most once for the lifetime of this <ins>.
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  // `pending` on the server and until AdSense answers, so the unit is visible
  // (and measurable) at push time: AdSense refuses to request an ad for a unit
  // it finds hidden ("availableWidth=0"), which is why we never start hidden.
  const [adState, setAdState] = useState<AdState>("pending");

  useEffect(() => {
    if (!shouldLoadAd || !slot) return;
    if (pushedRef.current) return;
    const ins = insRef.current;
    if (!ins) return;

    pushedRef.current = true;

    try {
      const w = window as AdsByGoogleWindow;
      (w.adsbygoogle = w.adsbygoogle ?? []).push({});
      track("ad_loaded", { position: props.position ?? "custom", slot });
    } catch {
      // Most commonly the loader hasn't arrived yet, or a duplicate push was
      // blocked. Allow a later attempt only if the loader was genuinely absent.
      const w = window as AdsByGoogleWindow;
      if (!Array.isArray(w.adsbygoogle)) pushedRef.current = false;
      track("ad_failed", { position: props.position ?? "custom", slot });
    }
  }, [shouldLoadAd, slot, props.position]);

  // Watch the <ins> for AdSense's verdict; collapse the box when it is unfilled
  // or when no verdict arrives in time. The observer stays attached for the
  // life of the unit so a late `filled` re-opens the box.
  useEffect(() => {
    if (!shouldLoadAd) return;
    const ins = insRef.current;
    if (!ins) return;

    const sync = () => {
      const next = readAdStatus(ins);
      if (next !== "pending") setAdState(next);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    const timer = window.setTimeout(() => {
      if (readAdStatus(ins) === "pending") setAdState("unfilled");
    }, FILL_TIMEOUT_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [shouldLoadAd]);

  // No slot resolvable, or ads globally disabled → render nothing at all.
  if (!ADS_ENABLED || !slot) return null;

  // The reserved height only applies while the unit is pending or filled; the
  // `unfilled` state is collapsed by `.ad-wrapper[data-ad-state="unfilled"]`
  // in globals.css (and, independently of React state, by AdSense's own
  // `data-ad-status="unfilled"` attribute via `:has()`).
  return (
    <div
      ref={ref}
      role="complementary"
      aria-label="Advertisements"
      data-ad-slot={slot}
      data-ad-state={adState}
      className={cn("ad-wrapper", props.className)}
      style={{ minHeight: `${minHeight}px`, ...props.style }}
    >
      {/* AdSense allows exactly this text (or "Sponsored Links") - nothing else. */}
      <span className="ad-label" aria-hidden="true">
        {"Advertisements"}
      </span>

      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        aria-label={label}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
}
