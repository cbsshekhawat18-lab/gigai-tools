"use client";

import { useEffect } from "react";

import { useRecordToolVisit } from "@/hooks/use-personalization";
import { useRecordUsage } from "@/hooks/use-usage";

export interface ToolVisitTrackerProps {
  /** Slug of the tool being viewed. */
  slug: string;
}

/**
 * Invisible client island dropped into a tool page. It:
 *   1. records a visit to `slug` (recently-used list + an "open" usage event);
 *  2. counts DOWNLOADS produced by this tool: a strong "successful use"
 *      signal that feeds the popularity score.
 *
 * Download detection is done ONCE, generically: virtually every tool triggers a
 * download by appending an `<a download>` to the document and calling `.click()`
 * (both shared helpers and the ~40 inline sites do this). A single capturing
 * click listener catches them all. No per-tool wiring, nothing to maintain.
 *
 * Renders nothing. Safe in a static export, effects only run client-side.
 */
export function ToolVisitTracker({ slug }: ToolVisitTrackerProps) {
  const record = useRecordToolVisit();
  const { open, download } = useRecordUsage();

  useEffect(() => {
    if (!slug) return;
    record(slug);
    open(slug);
  }, [slug, record, open]);

  useEffect(() => {
    if (!slug || typeof document === "undefined") return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[download]");
      if (anchor) download(slug);
    };
    // Capture phase so we see programmatic `a.click()` before the anchor is
    // removed from the DOM by the download helper.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [slug, download]);

  return null;
}
