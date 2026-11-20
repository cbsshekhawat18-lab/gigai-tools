"use client";

import * as React from "react";

import { posterApi } from "@/lib/poster/api";
import { slugProblem } from "@/lib/poster/slug";

export type SlugCheck = { slug: string; available: boolean; reason: string | null } | null;

/** Debounced availability check. `current` (the page's own address) always reads as available. */
export function useSlugCheck(slug: string, current?: string): SlugCheck {
  const [check, setCheck] = React.useState<SlugCheck>(null);
  React.useEffect(() => {
    if (!slug) {
      setCheck(null);
      return;
    }
    if (slug === current) {
      setCheck({ slug, available: true, reason: null });
      return;
    }
    const problem = slugProblem(slug);
    if (problem) {
      setCheck({ slug, available: false, reason: problem });
      return;
    }
    const h = setTimeout(() => {
      void posterApi.slugCheck(slug).then((r) => {
        if (r.ok) setCheck(r.data);
      });
    }, 400);
    return () => clearTimeout(h);
  }, [slug, current]);
  return check;
}
