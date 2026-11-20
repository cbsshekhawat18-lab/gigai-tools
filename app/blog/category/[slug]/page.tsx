import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES, SITE } from "@/config/constants";
import { absoluteUrl } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/schema";
import { getAllCategories, getPostsByCategorySlug } from "@/lib/blog";
import { categoryBySlug } from "@/config/categories";
import { BlogArchive } from "@/modules/blog/blog-archive";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const categories = await getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

/** Resolve the taxonomy record for a slug (its display name + count). */
async function resolveCategory(slug: string) {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug) ?? null;
  return { categories, category };
}

/** Human display name, prefer the real category name, else title-case the slug. */
function niceCategoryName(slug: string, fallback: string): string {
  return (
    categoryBySlug(slug)?.name ??
    fallback.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** Below this many posts an archive is thinner than the post it lists. */
const MIN_INDEXABLE_CATEGORY_POSTS = 3;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await resolveCategory(slug);
  if (!category) {
    return { title: "Category not found", robots: { index: false, follow: false } };
  }

  const name = niceCategoryName(category.slug, category.name);
  const meta = buildMetadata({
    title: `${name} Articles & Guides`,
    description: `Browse ${category.count} ${name} article${category.count === 1 ? "" : "s"}, guides and tutorials on ${SITE.name}.`,
    canonical: `${ROUTES.blog}/category/${category.slug}`,
  });
  // A one- or two-post archive is a heading plus a card: ~120 unique words,
  // duplicating the post it lists. Keep it reachable, out of the index.
  if (category.count < MIN_INDEXABLE_CATEGORY_POSTS) {
    meta.robots = { index: false, follow: true };
  }
  return meta;
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { categories, category } = await resolveCategory(slug);
  if (!category) notFound();

  const posts = await getPostsByCategorySlug(slug);
  const name = niceCategoryName(category.slug, category.name);

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Blog", href: ROUTES.blog },
    { label: name, href: `${ROUTES.blog}/category/${category.slug}` },
  ];

  const description = `Browse every ${name} article: guides, tips and how-tos from the ${SITE.name} team.`;

  return (
    <>
      <BlogArchive
        title={name}
        description={description}
        breadcrumb={breadcrumb}
        posts={posts}
        chips={categories}
        chipsBase="/blog/category"
        activeSlug={category.slug}
        emptyMessage="No articles in this category yet. Check back soon."
      />

      <JsonLd
        data={[
          collectionPageJsonLd({
            name: `${name}: ${SITE.name} Blog`,
            description,
            url: absoluteUrl(`${ROUTES.blog}/category/${category.slug}`),
          }),
          breadcrumbJsonLd(breadcrumb),
        ]}
      />
    </>
  );
}
