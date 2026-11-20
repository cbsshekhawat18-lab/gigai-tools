"use client";

import { useEffect } from "react";

import { recordCategoryVisit } from "@/lib/personalization";

/**
 * Invisible client island dropped into a category page. Records the visit in
 * the browser-local recent-categories list so the homepage "Continue working"
 * chips can offer a way back. Renders nothing; client-only effect.
 */
export function CategoryVisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (slug) recordCategoryVisit(slug);
  }, [slug]);
  return null;
}
