"use client";

import { api, type ApiError } from "@/lib/devapi/client";

import type { Banner, EventType, PageStats, PageStatus, PosterPage, Zones } from "./types";

type Result<T> = Promise<{ ok: true; data: T } | { ok: false; error: ApiError }>;

export type PageFields = Partial<
  Pick<PosterPage, "display_name" | "designation" | "area" | "tagline" | "org_name" | "theme" | "defaults" | "lang">
>;

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });
const form = (file: File): FormData => {
  const fd = new FormData();
  fd.append("file", file, file.name);
  return fd;
};

/** Typed wrappers over /v1/poster. Session token rides along automatically when present. */
export const posterApi = {
  page: (slug: string): Result<PosterPage> => api(`/poster/pages/${encodeURIComponent(slug)}`),
  myPages: (): Result<{ pages: PosterPage[]; limit: number; max_banners: number }> => api("/poster/me/pages"),
  slugCheck: (slug: string): Result<{ slug: string; available: boolean; reason: string | null }> =>
    api(`/poster/slug-check?slug=${encodeURIComponent(slug)}`),
  create: (body: PageFields & { slug: string; display_name: string }): Result<PosterPage> =>
    api("/poster/pages", { method: "POST", ...json(body) }),
  update: (id: string, body: PageFields): Result<PosterPage> =>
    api(`/poster/pages/${id}`, { method: "PATCH", ...json(body) }),
  setStatus: (id: string, status: PageStatus): Result<PosterPage> =>
    api(`/poster/pages/${id}/status`, { method: "POST", ...json({ status }) }),
  remove: (id: string): Result<void> => api(`/poster/pages/${id}`, { method: "DELETE" }),
  /** Change the address; the old one keeps 301-ing to the new one for 30 days. */
  rename: (id: string, slug: string): Result<PosterPage> =>
    api(`/poster/pages/${id}/slug`, { method: "POST", ...json({ slug }) }),
  stats: (id: string, range: PageStats["range"]): Result<PageStats> => api(`/poster/pages/${id}/stats?range=${range}`),
  uploadLogo: (id: string, file: File): Result<PosterPage> =>
    api(`/poster/pages/${id}/logo`, { method: "POST", body: form(file) }),
  deleteLogo: (id: string): Result<PosterPage> => api(`/poster/pages/${id}/logo`, { method: "DELETE" }),
  uploadBanner: (id: string, file: File): Result<Banner> =>
    api(`/poster/pages/${id}/banners`, { method: "POST", body: form(file) }),
  updateBanner: (id: string, bannerId: string, body: { zones?: Zones; sort_order?: number }): Result<Banner> =>
    api(`/poster/pages/${id}/banners/${bannerId}`, { method: "PATCH", ...json(body) }),
  deleteBanner: (id: string, bannerId: string): Result<void> =>
    api(`/poster/pages/${id}/banners/${bannerId}`, { method: "DELETE" }),
};

/** Best-effort counter. No identity, no photo, no name - just "someone did X on page Y". */
export function trackEvent(pageId: string, bannerId: string | null, type: EventType): void {
  try {
    void fetch("/v1/poster/events", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_id: pageId, banner_id: bannerId, type }),
    }).catch(() => undefined);
  } catch {
    /* counters never block the visitor */
  }
}
