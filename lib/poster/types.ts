/**
 * Supporter poster pages - shared contracts. Mirrors backend/app/v1/poster.py:
 * every coordinate in a zone is a FRACTION of the banner (x, w, r and text
 * size by width; y and h by height), so one spec renders identically at
 * thumbnail, preview and HD sizes.
 */

export type PhotoZone =
  | { shape: "circle"; cx: number; cy: number; r: number }
  | { shape: "box"; cx: number; cy: number; w: number; h: number; radius: number };

/** badge = white pill over the art (shown only once the supporter types);
 *  text  = plain two-line text on a designed band (always shows defaults). */
export interface NameZone {
  style: "badge" | "text";
  cx: number;
  cy: number;
  size: number;
}

export interface Zones {
  photos: PhotoZone[];
  name: NameZone | null;
}

export interface Banner {
  id: string;
  sort_order: number;
  width: number;
  height: number;
  zones: Zones;
  bytes_total: number;
  preview_url: string;
  hd_url: string;
}

export interface PageTheme {
  primary?: string;
  secondary?: string;
}

export interface PageDefaults {
  supporter_label?: string;
  supporter_area?: string;
  announcement?: string;
  whatsapp_text?: string;
  slogans?: string[];
}

export type PageStatus = "draft" | "live" | "paused";
export type PageLang = "hi" | "en";

export interface PosterPage {
  id: string;
  slug: string;
  display_name: string;
  designation: string;
  area: string;
  tagline: string;
  org_name: string;
  theme: PageTheme;
  defaults: PageDefaults;
  lang: PageLang;
  status: PageStatus;
  url: string;
  logo_url: string | null;
  banners: Banner[];
  created_at: string;
  updated_at: string;
}

/** What the visitor controls. Pan is in fractions of the photo slot's box. */
export interface SupporterState {
  name: string;
  area: string;
  scale: number;
  rotation: number;
  panX: number;
  panY: number;
}

export const INITIAL_SUPPORTER: SupporterState = { name: "", area: "", scale: 1, rotation: 0, panX: 0, panY: 0 };

export type EventType = "visit" | "download" | "share" | "copy";

export interface PageStats {
  range: "7" | "30" | "all";
  totals: Record<EventType, number>;
  by_day: { day: string; visits: number; downloads: number; shares: number; copies: number }[];
  by_banner: { banner_id: string; downloads: number; shares: number }[];
}

export interface ThemePreset {
  id: string;
  label: string;
  primary: string;
  secondary: string;
}

/** Owner-pickable palettes; "custom" is any two hex colours. */
export const THEME_PRESETS: readonly ThemePreset[] = [
  { id: "saffron", label: "Saffron & green", primary: "#FF671F", secondary: "#138808" },
  { id: "blue", label: "Blue & sky", primary: "#1D4ED8", secondary: "#0EA5E9" },
  { id: "red", label: "Red & amber", primary: "#DC2626", secondary: "#F59E0B" },
  { id: "green", label: "Green & lime", primary: "#15803D", secondary: "#65A30D" },
];

export const DEFAULT_THEME: Required<PageTheme> = { primary: "#FF671F", secondary: "#138808" };

export const LIMITS = {
  banners: 4,
  bannerMB: 8,
  logoMB: 2,
  scale: { min: 0.5, max: 3, step: 0.05 },
  rotation: { min: -180, max: 180 },
} as const;

export function themeOf(page: Pick<PosterPage, "theme">): Required<PageTheme> {
  return { primary: page.theme.primary ?? DEFAULT_THEME.primary, secondary: page.theme.secondary ?? DEFAULT_THEME.secondary };
}
