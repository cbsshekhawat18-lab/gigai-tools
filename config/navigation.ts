import type { SocialLink } from "@/types";

/**
 * Social / off-site profiles. These render as footer icons AND feed the
 * Organization `sameAs` JSON-LD, so keep them to REAL public profiles only
 * (bare placeholder domains were a past audit finding). Add GitHub/X/LinkedIn
 * once actual profiles exist.
 *
 * NOTE: the site's real navigation lives in the layout components
 * (components/layout/{header,mobile-nav,browse-menu,footer}.tsx), each with its
 * own link lists. Not in this file.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Product Hunt",
    href: "https://www.producthunt.com/products/gigai-tools",
    icon: "Rocket",
  },
  {
    label: "PostYourStartup",
    href: "https://postyourstartup.co/startup/gigai-tools",
    icon: "Megaphone",
  },
  {
    label: "Gigai Kripa Services",
    href: "https://gigaikripaservices.com",
    icon: "Globe",
  },
];
