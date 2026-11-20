import type { AccentKey } from "@/types";

/**
 * Accent palette. Category/tool accents map to a set of STATIC Tailwind classes
 * (built-in palette) so Tailwind's JIT can always see them. Never build these
 * class names dynamically (e.g. `bg-${accent}-500`), or they'll be purged.
 */
export interface AccentStyle {
  /** Icon / label text color */
  text: string;
  /** Solid fill (badges, dots) */
  solid: string;
  /** Soft tinted surface (icon chips) */
  soft: string;
  /** Hairline border */
  border: string;
  /** Focus/hover ring */
  ring: string;
  /** Two-stop gradient (hero accents, hovers) */
  gradient: string;
  /**
   * Raw hex stops for the same two-stop gradient, in `[from, to]` order.
   * Use these anywhere Tailwind classes can't reach, inline SVG (see
   * `lib/qr/illustrations`), `<canvas>` fills, dynamically-tinted exports, etc.
   * Values mirror the Tailwind palette used in `gradient`.
   */
  hex: readonly [from: string, to: string];
}

export const ACCENT_STYLES: Record<AccentKey, AccentStyle> = {
  sky: {
    text: "text-sky-600 dark:text-sky-400",
    solid: "bg-sky-500",
    soft: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    ring: "ring-sky-500/30",
    gradient: "from-sky-500 to-cyan-400",
    hex: ["#0ea5e9", "#22d3ee"],
  },
  // Key kept for config stability; the rendered hue is teal - purple, indigo
  // and violet are banned sitewide (UI-upgrade spec phase 1).
  violet: {
    text: "text-teal-600 dark:text-teal-400",
    solid: "bg-teal-500",
    soft: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
    ring: "ring-teal-500/30",
    gradient: "from-teal-500 to-cyan-400",
    hex: ["#14b8a6", "#22d3ee"],
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    solid: "bg-emerald-500",
    soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    ring: "ring-emerald-500/30",
    gradient: "from-emerald-500 to-teal-400",
    hex: ["#10b981", "#2dd4bf"],
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    solid: "bg-amber-500",
    soft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    ring: "ring-amber-500/30",
    gradient: "from-amber-500 to-orange-400",
    hex: ["#f59e0b", "#fb923c"],
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    solid: "bg-rose-500",
    soft: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    ring: "ring-rose-500/30",
    gradient: "from-rose-500 to-pink-400",
    hex: ["#f43f5e", "#f472b6"],
  },
  cyan: {
    text: "text-cyan-600 dark:text-cyan-400",
    solid: "bg-cyan-500",
    soft: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    ring: "ring-cyan-500/30",
    gradient: "from-cyan-500 to-blue-400",
    hex: ["#06b6d4", "#60a5fa"],
  },
  indigo: {
    text: "text-blue-600 dark:text-blue-400",
    solid: "bg-blue-500",
    soft: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    ring: "ring-blue-500/30",
    gradient: "from-blue-500 to-sky-400",
    hex: ["#3b82f6", "#38bdf8"],
  },
  orange: {
    text: "text-orange-600 dark:text-orange-400",
    solid: "bg-orange-500",
    soft: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
    ring: "ring-orange-500/30",
    gradient: "from-orange-500 to-amber-400",
    hex: ["#f97316", "#fbbf24"],
  },
};

export function accentStyle(key: AccentKey | undefined): AccentStyle {
  return (key && ACCENT_STYLES[key]) || ACCENT_STYLES.indigo;
}
