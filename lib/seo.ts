import type { Metadata } from "next";

import type { Category, SeoMeta, Tool } from "@/types";
import { ROUTES, SITE } from "@/config/constants";
import { CATEGORIES } from "@/config/categories";
import { DEFAULT_SEO, PAGE_SEO, TITLE_TEMPLATE } from "@/config/seo";
import { absoluteUrl } from "@/lib/utils";

/**
 * Central metadata factory. Everything that needs `<Metadata>`, pages, tools,
 * categories, funnels through `buildMetadata`, so titles, canonicals, Open
 * Graph, Twitter cards and robots directives stay consistent site-wide.
 */

type BuildMetadataInput = Partial<SeoMeta> & { title: string; description: string };

/**
 * Clamp a meta description to `max` characters (Google truncates ~160).
 * Descriptions over the limit are cut at the last word boundary within
 * `max - 3` chars and suffixed with "…" so SERP snippets never end mid-word.
 */
export function clampDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max - 3);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[\s,;:-–-]+$/, "")}…`;
}

/** Resolve an OG image (config path or absolute URL) to an absolute URL. */
function resolveOgImage(ogImage?: string): string {
  const image = ogImage ?? DEFAULT_SEO.ogImage ?? SITE.ogImage;
  return image.startsWith("http") ? image : absoluteUrl(image);
}

/**
 * Apply the title template unless the title already contains the brand name
 * (home/base titles like "GigAI Tools: …" own their full string).
 */
function resolveTitle(title: string): string {
  if (title === SITE.name || title.includes(SITE.name)) return title;
  return TITLE_TEMPLATE.replace("%s", title);
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description: rawDescription,
    keywords,
    ogImage,
    canonical,
    noIndex,
    type = "website",
  } = input;

  const fullTitle = resolveTitle(title);
  const canonicalUrl = canonical ? absoluteUrl(canonical) : undefined;
  const image = resolveOgImage(ogImage);
  const mergedKeywords = keywords ?? DEFAULT_SEO.keywords;
  // Single clamp point: every page/tool/category description flows through
  // here, so overlong copy is truncated once and stays consistent across
  // meta, Open Graph and Twitter.
  const description = clampDescription(rawDescription);

  return {
    // `absolute` bypasses the root layout's title.template: resolveTitle has
    // already ensured the brand appears exactly once, so this prevents the
    // "… | GigAI Tools · GigAI Tools" double-brand.
    title: { absolute: fullTitle },
    description,
    keywords: mergedKeywords,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl ?? SITE.url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: type === "article" ? "article" : "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      site: SITE.twitterHandle,
      creator: SITE.twitterHandle,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
  };
}

/** Convenience wrapper for static pages defined in `PAGE_SEO`. */
export function pageMetadata(key: keyof typeof PAGE_SEO): Metadata {
  const page = PAGE_SEO[key];
  return buildMetadata({
    title: page?.title ?? DEFAULT_SEO.title,
    description: page?.description ?? DEFAULT_SEO.description,
    keywords: page?.keywords,
    ogImage: page?.ogImage,
    canonical: page?.canonical,
    noIndex: page?.noIndex,
    type: page?.type,
  });
}

/** Metadata for a tool detail page, honouring per-tool `seo` overrides. */
export function buildToolMetadata(tool: Tool): Metadata {
  const seo = tool.seo ?? {};
  const category = CATEGORIES.find((c) => c.slug === tool.category);
  const keywords = seo.keywords ?? tool.keywords ?? DEFAULT_SEO.keywords;

  return buildMetadata({
    title: seo.title ?? `${tool.title}${category ? ` - ${category.name}` : ""}`,
    description: seo.description ?? tool.description,
    keywords,
    ogImage: seo.ogImage ?? tool.featuredImage,
    canonical: seo.canonical ?? ROUTES.tool(tool.slug),
    noIndex: seo.noIndex,
    type: seo.type ?? "website",
  });
}

/** Metadata for a category listing page, honouring per-category `seo`. */
export function buildCategoryMetadata(cat: Category): Metadata {
  const seo = cat.seo ?? {};

  return buildMetadata({
    // Prefer the explicit SEO description, then the richer longDescription,
    // then the short card description, so each landing gets unique meta copy.
    title: seo.title ?? `${cat.name}: Free Online Tools`,
    description: seo.description ?? cat.longDescription ?? cat.description,
    keywords: seo.keywords,
    // Branded per-category OG image (public/images/og/<slug>.png).
    ogImage: seo.ogImage ?? `/images/og/${cat.slug}.png`,
    canonical: seo.canonical ?? ROUTES.category(cat.slug),
    noIndex: seo.noIndex,
    type: seo.type ?? "website",
  });
}
