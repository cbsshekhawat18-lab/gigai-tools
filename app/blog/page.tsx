import type { Metadata } from "next";

import { ROUTES, SITE, PAGINATION } from "@/config/constants";
import { absoluteUrl } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/schema";
import { getAllCategories, getPaginatedPosts } from "@/lib/blog";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { BlogList } from "@/modules/blog/blog-list";
import { FeaturedPost } from "@/modules/blog/featured-post";
import { TaxonomyChips } from "@/components/blog/taxonomy-chips";
import { Pagination } from "@/components/blog/pagination";
import { SubscribeCta } from "@/components/blog/subscribe-cta";
import { ResponsiveAd } from "@/components/ads";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Blog", href: ROUTES.blog },
];

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "Guides, tips and updates on the tools you use every day.",
  canonical: ROUTES.blog,
});

export default async function BlogPage() {
  const [{ posts, page, totalPages }, categories] = await Promise.all([
    getPaginatedPosts(1, PAGINATION.blogPerPage),
    getAllCategories(),
  ]);

  // The newest post headlines the index as a hero; the grid shows the rest of
  // this page so nothing is duplicated and pagination offsets stay intact.
  const [featured, ...rest] = posts;

  return (
    <div className="pb-14">
      <PageHeader
        title="The GigAI Tools Blog"
        description="Guides, tips and updates on the tools you use every day: how-tos, deep dives and product news."
        breadcrumb={BREADCRUMB}
      />

      <Container className="mt-12">
        {featured ? <FeaturedPost post={featured} /> : null}

        {categories.length > 0 ? (
          <div className="mt-12">
            <TaxonomyChips
              items={categories.map((c) => ({ label: c.name, slug: c.slug, count: c.count }))}
              base="/blog/category"
              allLabel="All articles"
              allHref={ROUTES.blog}
              className="justify-center"
            />
          </div>
        ) : null}

        <div className="mt-10">
          <BlogList posts={rest} emptyMessage="More articles are on the way. Check back soon." />
        </div>

        <Pagination page={page} totalPages={totalPages} basePath={ROUTES.blog} className="mt-14" />

        <SubscribeCta className="mt-16" />

        <ResponsiveAd position="BLOG_TOP" className="mt-12" />
      </Container>

      <JsonLd
        data={[
          collectionPageJsonLd({
            name: `${SITE.name} Blog`,
            description: "Guides, tips and updates on the tools you use every day.",
            url: absoluteUrl(ROUTES.blog),
          }),
          breadcrumbJsonLd(BREADCRUMB),
        ]}
      />
    </div>
  );
}
