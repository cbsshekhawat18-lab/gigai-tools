/**
 * Share-platform registry, the single source of truth for social share
 * targets (share URL builders + official brand colors), consumed by
 * components/blog/share-buttons.tsx and components/tool/seo/share-report.tsx.
 *
 * Per the design system, share buttons carry each platform's OFFICIAL brand
 * color (X black/white, Facebook #1877F2, WhatsApp #25D366…) instead of the
 * theme color. All classes are static literals so Tailwind's JIT sees them
 * (same rule as lib/design.ts / lib/export-styles.ts).
 */

export type ShareKey =
  | "x"
  | "facebook"
  | "linkedin"
  | "whatsapp"
  | "telegram"
  | "reddit"
  | "email";

export interface ShareTarget {
  key: ShareKey;
  label: string;
  /** Lucide icon name. */
  icon: string;
  /** Brand glyph color (dark-mode variant where the brand hue needs lift). */
  brand: string;
  /** Hover identity for chips/buttons: brand-tinted border + surface. */
  hover: string;
  /** Build the share URL. `text` falls back to `title` at call sites. */
  href: (url: string, title: string, text?: string) => string;
}

const enc = encodeURIComponent;

export const SHARE_TARGETS: Record<ShareKey, ShareTarget> = {
  x: {
    key: "x",
    label: "X",
    icon: "Twitter",
    /* X's brand is black on light / white on dark: foreground tracks that. */
    brand: "text-foreground",
    hover: "hover:border-foreground/40 hover:bg-foreground/5",
    href: (u, t, x) =>
      `https://twitter.com/intent/tweet?url=${enc(u)}&text=${enc(x ?? t)}`,
  },
  facebook: {
    key: "facebook",
    label: "Facebook",
    icon: "Facebook",
    brand: "text-[#1877F2]",
    hover: "hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10",
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}`,
  },
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    icon: "Linkedin",
    brand: "text-[#0A66C2] dark:text-[#70B5F9]",
    hover: "hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10",
    href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}`,
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "MessageCircle",
    brand: "text-[#25D366]",
    hover: "hover:border-[#25D366]/40 hover:bg-[#25D366]/10",
    href: (u, t, x) => `https://wa.me/?text=${enc(`${x ?? t} ${u}`)}`,
  },
  telegram: {
    key: "telegram",
    label: "Telegram",
    icon: "Send",
    brand: "text-[#229ED9]",
    hover: "hover:border-[#229ED9]/40 hover:bg-[#229ED9]/10",
    href: (u, t, x) => `https://t.me/share/url?url=${enc(u)}&text=${enc(x ?? t)}`,
  },
  reddit: {
    key: "reddit",
    label: "Reddit",
    icon: "MessagesSquare",
    brand: "text-[#FF4500]",
    hover: "hover:border-[#FF4500]/40 hover:bg-[#FF4500]/10",
    href: (u, t) => `https://www.reddit.com/submit?url=${enc(u)}&title=${enc(t)}`,
  },
  email: {
    key: "email",
    label: "Email",
    icon: "Mail",
    /* Email has no brand; stays neutral with the theme hover. */
    brand: "text-muted-foreground",
    hover: "hover:border-primary/40 hover:bg-primary/5",
    href: (u, t, x) =>
      `mailto:?subject=${enc(t)}&body=${enc(x ? `${x}\n\n${u}` : u)}`,
  },
};

/** Resolve targets for a surface, in the order given. */
export function shareTargets(keys: ShareKey[]): ShareTarget[] {
  return keys.map((k) => SHARE_TARGETS[k]);
}
