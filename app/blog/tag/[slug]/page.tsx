import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES, SITE } from "@/config/constants";
import { absoluteUrl } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/schema";
import { getAllTags, getPostsByTag } from "@/lib/blog";
import { BlogArchive } from "@/modules/blog/blog-archive";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const tags = await getAllTags();
  return tags.map((t) => ({ slug: t.slug }));
}

/** Resolve the taxonomy record for a slug (its display name + count). */
async function resolveTag(slug: string) {
  const tags = await getAllTags();
  const tag = tags.find((t) => t.slug === slug) ?? null;
  return { tags, tag };
}

/** How many sibling tag chips to show on a tag page (all 400+ = huge bloat). */
const MAX_TAG_CHIPS = 24;

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { tag } = await resolveTag(slug);
  if (!tag) {
    return { title: "Tag not found", robots: { index: false, follow: false } };
  }

  const niceName = tag.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const meta = buildMetadata({
    title: `Articles Tagged “${niceName}”`,
    description: `Every article tagged “${niceName}” on GigAI Tools, ${tag.count} guide${tag.count === 1 ? "" : "s"} and how-tos.`,
    canonical: `${ROUTES.blog}/tag/${tag.slug}`,
  });
  // ALL tag archives stay out of the index (changed 2026-08-29). A tag page is
  // a list of post titles the blog already publishes elsewhere: even a 5-post
  // tag renders ~140 unique words, which is precisely the thin/duplicate
  // signal that gets a site flagged for "low value content". They remain
  // crawlable and `follow`, so links still pass through to the real posts.
  meta.robots = { index: false, follow: true };
  return meta;
}

export default async function BlogTagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const { tags, tag } = await resolveTag(slug);
  if (!tag) notFound();

  const posts = await getPostsByTag(slug);

  // Only the most-used tags become chips. Rendering all 400+ tags on every tag
  // page added ~500KB per page (400+ pages = ~400MB in the static export).
  // Always include the active tag so it stays highlighted.
  const chipTags = [...tags]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_TAG_CHIPS);
  if (!chipTags.some((t) => t.slug === tag.slug)) chipTags.push(tag);

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Blog", href: ROUTES.blog },
    { label: tag.name, href: `${ROUTES.blog}/tag/${tag.slug}` },
  ];

  const description = `Every article tagged “${tag.name}” on ${SITE.name}: guides, tips and how-tos.`;

  return (
    <>
      <BlogArchive
        title={`#${tag.name}`}
        description={description}
        breadcrumb={breadcrumb}
        posts={posts}
        chips={chipTags}
        chipsBase="/blog/tag"
        activeSlug={tag.slug}
        emptyMessage="No articles with this tag yet. Check back soon."
      />

      <JsonLd
        data={[
          collectionPageJsonLd({
            name: `${tag.name}: ${SITE.name} Blog`,
            description,
            url: absoluteUrl(`${ROUTES.blog}/tag/${tag.slug}`),
          }),
          breadcrumbJsonLd(breadcrumb),
        ]}
      />
    </>
  );
}
