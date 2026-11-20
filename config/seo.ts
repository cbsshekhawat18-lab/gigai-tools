import type { SeoMeta } from "@/types";
import { SITE } from "@/config/constants";
import { advertisedToolCount } from "@/lib/registry";
import { SOCIAL_LINKS } from "@/config/navigation";

/** Site-wide SEO defaults; lib/seo merges these into every page's metadata. */
export const DEFAULT_SEO: SeoMeta = {
  title: SITE.name,
  description: SITE.description,
  ogImage: SITE.ogImage,
  type: "website",
  keywords: [
    "online tools",
    "free tools",
    "image tools",
    "pdf tools",
    "developer tools",
    "ai tools",
  ],
};

/** Next.js title template: page titles become "<page> · GigAI Tools". */
export const TITLE_TEMPLATE = `%s · ${SITE.name}`;

/**
 * Organization node reused in JSON-LD across the site. It represents the company
 * (Gigai Kripa Services) that publishes GigAI Tools. The `@id` deliberately
 * matches the company site's Organization `@id`
 * (https://gigaikripaservices.com/#organization) so search engines treat both
 * properties as ONE entity, a strong cross-site signal for a Knowledge Panel.
 */
export const ORGANIZATION = {
  "@id": `${SITE.parentUrl}/#organization`,
  name: SITE.brand,
  url: SITE.parentUrl,
  logo: `${SITE.url}${SITE.logo}`,
  description:
    "Software development and AI product company. Gigai Kripa Services builds " +
    "SaaS, developer tools, WordPress themes and plugins, and browser games. " +
    "GigAI Tools is its privacy-first, browser-based productivity platform - " +
    `${advertisedToolCount()} free tools that run entirely in your browser.`,
  founder: {
    "@type": "Person",
    name: "Chandrabhan Shekhawat",
    sameAs: ["https://www.linkedin.com/in/chandrabhan-shekhawat-197a30121/"],
  },
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

/** Per-static-page SEO overrides, keyed by route name. */
export const PAGE_SEO: Record<string, Partial<SeoMeta>> = {
  home: {
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    canonical: "/",
  },
  search: {
    title: "Search Tools",
    description: "Search across every tool on GigAI Tools, instant results as you type.",
    canonical: "/search",
  },
  blog: {
    title: "Blog",
    description: "Guides, tips and updates on the tools you use every day.",
    canonical: "/blog",
    type: "website",
  },
  about: {
    title: "About",
    description: `About ${SITE.name}: a growing library of fast, free, privacy-first online tools by ${SITE.brand}.`,
    canonical: "/about",
  },
  openSource: {
    title: "Open Source",
    description: `${SITE.name} is open source under the Apache License 2.0. Read the code, run it yourself, self-host it or contribute: the website, the backend and the developer API.`,
    keywords: ["open source online tools", "self-hosted file tools", "open source pdf tools", "browser tools github"],
    canonical: "/open-source",
  },
  extension: {
    title: "GigAI Copilot, Free SEO Browser Extension",
    description:
      `Audit and fix any page's SEO from your toolbar. Missions instead of warnings, editable fixes, on-device AI, and one-click hand-off into ${advertisedToolCount()} free GigAI tools. 100% private, nothing leaves your device.`,
    keywords: ["seo browser extension", "seo copilot", "seo checker extension", "meta tag extension", "free seo extension"],
    canonical: "/extension",
  },
  verify: {
    title: "GigAI Verify, AI or Human?",
    description:
      "Check text, images, PDFs and videos for signals associated with AI-generated content. GigAI shows the evidence behind every assessment, and says plainly when the evidence is inconclusive.",
    keywords: ["ai detector", "ai or human", "ai content checker", "ai image detector", "c2pa content credentials"],
    canonical: "/verify",
  },
  verifyExtension: {
    title: "GigAI Verify for Chrome: AI or Human, without leaving the page",
    description:
      "Read an article, watch a video or view an image, then check the available evidence in seconds. Free browser extension. Analysis runs on your device by default. Results are probabilistic, never presented as proof.",
    keywords: [
      "ai detector extension",
      "ai content checker chrome extension",
      "detect ai written text",
      "ai image checker browser",
      "chatgpt detector extension",
    ],
    canonical: "/verify/extension",
  },
  contact: {
    title: "Contact",
    description: `Get in touch with the ${SITE.name} team.`,
    canonical: "/contact",
  },
  privacy: {
    title: "Privacy Policy",
    description: `How ${SITE.name} handles your data, the short version: we keep it minimal.`,
    canonical: "/privacy",
  },
  terms: {
    title: "Terms of Service",
    description: `The terms for using ${SITE.name}.`,
    canonical: "/terms",
  },
  editorial: {
    title: "Editorial Standards",
    description: `How ${SITE.name} builds tools, researches topics and writes content, our review, accuracy, AI-disclosure and independence standards.`,
    canonical: "/editorial",
  },
  aiPolicy: {
    title: "AI Usage Policy",
    description: `Exactly how, and how little, ${SITE.name} uses AI: human-reviewed content, no fabricated facts or reviews, and real code behind every tool.`,
    canonical: "/ai-policy",
  },
  cookies: {
    title: "Cookie Policy",
    description: `Which cookies ${SITE.name} uses and why (essentials, preferences and Google AdSense advertising) plus how to control them.`,
    canonical: "/cookies",
  },
  disclaimer: {
    title: "Disclaimer",
    description: `The tools and content on ${SITE.name} are provided "as is" for general use. What that means and where our responsibility ends.`,
    canonical: "/disclaimer",
  },
  dmca: {
    title: "DMCA & Copyright Policy",
    description: `How to report copyright infringement to ${SITE.name} and how we handle takedown notices and counter-notices.`,
    canonical: "/dmca",
  },
  accessibility: {
    title: "Accessibility Statement",
    description: `Our commitment to WCAG 2.1 AA at ${SITE.name}, what we support, known limitations, and how to report accessibility issues.`,
    canonical: "/accessibility",
  },
};
