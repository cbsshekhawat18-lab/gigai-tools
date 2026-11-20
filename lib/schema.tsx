import type { ReactElement } from "react";

import type { BlogPost, BreadcrumbItem, FaqItem, HowToStep, Tool } from "@/types";
import { ROUTES, SITE } from "@/config/constants";
import { ORGANIZATION } from "@/config/seo";
import { CATEGORIES } from "@/config/categories";
import { absoluteUrl } from "@/lib/utils";

/**
 * Structured-data (JSON-LD) builders + a renderer. Rich results for search
 * engines are pure data derived from the same registry the UI uses, so schema
 * never drifts from what's on the page.
 */

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Map a category slug to a schema.org-recognised `applicationCategory` token
 * (the human label like "PDF Tools" is NOT a valid token). Substring matching
 * keeps this resilient to exact slug naming; falls back to UtilitiesApplication.
 */
function appCategoryToken(categorySlug: string): string {
  const s = categorySlug.toLowerCase();
  if (/(image|photo|video|audio|media|music)/.test(s)) return "MultimediaApplication";
  if (/(dev|code|developer|program)/.test(s)) return "DeveloperApplication";
  if (/(svg|design|draw|vector)/.test(s)) return "DesignApplication";
  if (/(pdf|doc|document|office|business|seo|convert|writing|text)/.test(s))
    return "BusinessApplication";
  return "UtilitiesApplication";
}

/**
 * Derive published/modified dates for a tool from its `createdAt` + changelog
 * entry dates. ISO date strings sort lexicographically, so min = published and
 * max = last modified. Returns {} when the tool carries no dates (omit, never fake).
 */
export function toolDates(tool: Tool): { datePublished?: string; dateModified?: string } {
  const dates: string[] = [];
  if (tool.createdAt) dates.push(tool.createdAt);
  for (const c of tool.changelog ?? []) if (c.date) dates.push(c.date);
  if (dates.length === 0) return {};
  const sorted = [...dates].sort();
  return { datePublished: sorted[0], dateModified: sorted[sorted.length - 1] };
}

/* ── Builders ─────────────────────────────────────────────────────────────── */

/** Organization node: the publisher behind the site. */
export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.parentUrl}#organization`,
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    description: ORGANIZATION.description,
    // Named founder (a real, accountable person) is a strong E-E-A-T signal.
    founder: ORGANIZATION.founder,
    email: SITE.email,
    sameAs: ORGANIZATION.sameAs,
  };
}

/** WebSite node with a SearchAction wired to the on-site search route. */
export function websiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.parentUrl}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(ROUTES.search)}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList from an ordered list of crumbs. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

/** FAQPage from question/answer pairs. */
export function faqJsonLd(items: FaqItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** SoftwareApplication node for a tool: free, browser-based utility. */
export function softwareApplicationJsonLd(tool: Tool): object {
  const category = CATEGORIES.find((c) => c.slug === tool.category);
  const dates = toolDates(tool);

  return {
    "@context": "https://schema.org",
    // Both types: it's an application that runs in the browser (WebApplication).
    "@type": ["SoftwareApplication", "WebApplication"],
    name: tool.title,
    description: tool.description,
    url: absoluteUrl(ROUTES.tool(tool.slug)),
    applicationCategory: appCategoryToken(tool.category),
    ...(category ? { applicationSubCategory: category.name } : {}),
    operatingSystem: "Any (Web)",
    browserRequirements: "Requires a modern web browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": `${SITE.parentUrl}#organization` },
    ...(dates.datePublished ? { datePublished: dates.datePublished } : {}),
    ...(dates.dateModified ? { dateModified: dates.dateModified } : {}),
    ...(tool.keywords && tool.keywords.length > 0
      ? { keywords: tool.keywords.join(", ") }
      : {}),
  };
}

/** WebAPI node for the developer API landing: free tier, documented, ours. */
export function webApiJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: "GigAI Tools API",
    description:
      "Run PDF, image, SVG and QR tools over HTTP: job graphs, webhooks, signed downloads, verified deletion. Free plan with 1,000 tasks a month.",
    url: absoluteUrl("/developers"),
    documentation: absoluteUrl("/developers/docs"),
    termsOfService: absoluteUrl("/terms"),
    provider: { "@id": `${SITE.parentUrl}#organization` },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/** Article node for a blog post. */
export function articleJsonLd(post: BlogPost): object {
  const url = absoluteUrl(ROUTES.blogPost(post.slug));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    // Named person (not a faceless org): E-E-A-T signal; reuse the founder node when it matches.
    author:
      post.author === ORGANIZATION.founder.name
        ? { ...ORGANIZATION.founder, url: absoluteUrl(ROUTES.about) }
        : { "@type": "Person", name: post.author },
    publisher: { "@id": `${SITE.parentUrl}#organization` },
    ...(post.cover ? { image: [absoluteUrl(post.cover)] } : {}),
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
  };
}

/** CollectionPage node, for category / listing pages. */
export function collectionPageJsonLd(a: {
  name: string;
  description: string;
  url: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: a.name,
    description: a.description,
    url: a.url.startsWith("http") ? a.url : absoluteUrl(a.url),
    isPartOf: { "@id": `${SITE.url}#website` },
  };
}

/** WebPage node, the canonical page record for a tool detail page. */
export function webPageJsonLd(a: {
  name: string;
  description: string;
  url: string;
  /**
   * Optional CSS selectors marking the answer-first content for voice/AI
   * surfaces (Google Assistant, AI Overviews). Emits a `speakable`
   * SpeakableSpecification node. Backward-compatible: omitted → unchanged.
   */
  speakableSelectors?: string[];
  /** ISO dates, freshness signals (enables date-in-SERP + Helpful-Content). */
  datePublished?: string;
  dateModified?: string;
}): object {
  const url = a.url.startsWith("http") ? a.url : absoluteUrl(a.url);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: a.name,
    description: a.description,
    url,
    inLanguage: SITE.language,
    isPartOf: { "@id": `${SITE.url}#website` },
    publisher: { "@id": `${SITE.parentUrl}#organization` },
    ...(a.datePublished ? { datePublished: a.datePublished } : {}),
    ...(a.dateModified ? { dateModified: a.dateModified } : {}),
    ...(a.speakableSelectors && a.speakableSelectors.length > 0
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: a.speakableSelectors,
          },
        }
      : {}),
  };
}

/** HowTo node: the step-by-step guide shown on a tool page. */
export function howToJsonLd(a: {
  name: string;
  description?: string;
  steps: HowToStep[];
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: a.name,
    ...(a.description ? { description: a.description } : {}),
    step: a.steps.map((s, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: s.title,
      text: s.description,
    })),
  };
}

/**
 * ImageObject node. Makes a page's featured/OG image eligible for Google
 * Images and image-rich results. `url` is required; the rest sharpen indexing.
 */
export function imageObjectJsonLd(a: {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: a.url.startsWith("http") ? a.url : absoluteUrl(a.url),
    url: a.url.startsWith("http") ? a.url : absoluteUrl(a.url),
    ...(a.width ? { width: a.width } : {}),
    ...(a.height ? { height: a.height } : {}),
    ...(a.caption ? { caption: a.caption } : {}),
    publisher: { "@id": `${SITE.parentUrl}#organization` },
  };
}

/**
 * VideoObject node: emit ONLY where a real video asset exists. Google requires
 * a genuine `contentUrl` (or `embedUrl`); never fabricate one for a page that
 * has no video.
 */
export function videoObjectJsonLd(a: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: a.name,
    description: a.description,
    thumbnailUrl: [
      a.thumbnailUrl.startsWith("http") ? a.thumbnailUrl : absoluteUrl(a.thumbnailUrl),
    ],
    uploadDate: a.uploadDate,
    ...(a.contentUrl
      ? { contentUrl: a.contentUrl.startsWith("http") ? a.contentUrl : absoluteUrl(a.contentUrl) }
      : {}),
    ...(a.embedUrl
      ? { embedUrl: a.embedUrl.startsWith("http") ? a.embedUrl : absoluteUrl(a.embedUrl) }
      : {}),
    ...(a.duration ? { duration: a.duration } : {}),
    publisher: { "@id": `${SITE.parentUrl}#organization` },
  };
}

/**
 * DefinedTerm node: a single glossary entry. Optionally linked to its
 * DefinedTermSet (the glossary index) via `termSetUrl`.
 */
export function definedTermJsonLd(a: {
  name: string;
  description: string;
  url: string;
  termSetUrl?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: a.name,
    description: a.description,
    url: a.url.startsWith("http") ? a.url : absoluteUrl(a.url),
    inLanguage: SITE.language,
    ...(a.termSetUrl
      ? {
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            "@id": a.termSetUrl.startsWith("http") ? a.termSetUrl : absoluteUrl(a.termSetUrl),
            name: `${SITE.name} Glossary`,
          },
        }
      : {}),
  };
}

/** ItemList node, the ordered list of tools shown on a category/listing page. */
export function itemListJsonLd(items: { name: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };
}

/* ── Renderer ─────────────────────────────────────────────────────────────── */

/**
 * Renders one or more JSON-LD nodes as a `<script type="application/ld+json">`.
 * Server component; safe to place anywhere in the tree. Accepts a single node
 * or an array (rendered as a `@graph`-style list of scripts).
 */
export function JsonLd({ data }: { data: object | object[] }): ReactElement {
  const nodes = Array.isArray(data) ? data : [data];

  return (
    <>
      {nodes.map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify alone does NOT escape "<", a literal "</script>" in
          // any content string would break out of the tag. Escaping "<" as
          // < is valid JSON (identical once parsed) and keeps the block
          // inert. Also stops audit scanners flagging tag-like text in schema.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
