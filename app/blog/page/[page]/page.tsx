import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES, SITE, PAGINATION } from "@/config/constants";
import { absoluteUrl } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/schema";
import { getPaginatedPosts } from "@/lib/blog";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { BlogList } from "@/modules/blog/blog-list";
import { Pagination } from "@/components/blog/pagination";
import { SubscribeCta } from "@/components/blog/subscribe-cta";

interface BlogPageProps {
  params: Promise<{ page: string }>;
}

/** Prerender pages 2..N (page 1 is /blog). */
export async function generateStaticParams(): Promise<{ page: string }[]> {
  const { totalPages } = await getPaginatedPosts(1, PAGINATION.blogPerPage);
  const pages: { page: string }[] = [];
  for (let p = 2; p <= totalPages; p++) pages.push({ page: String(p) });
  return pages;
}

/** Parse the `[page]` param to a positive integer, or null when invalid. */
function parsePage(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 2 ? n : null;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { page: raw } = await params;
  const page = parsePage(raw);
  if (page === null) return { title: "Page not found", robots: { index: false, follow: false } };

  return buildMetadata({
    title: `Blog: Page ${page}`,
    description: `More guides, tips and updates on the tools you use every day, page ${page}.`,
    canonical: `${ROUTES.blog}/page/${page}`,
  });
}

export default async function BlogPaginatedPage({ params }: BlogPageProps) {
  const { page: raw } = await params;
  const requested = parsePage(raw);
  if (requested === null) notFound();

  const { posts, page, totalPages } = await getPaginatedPosts(requested, PAGINATION.blogPerPage);
  // A page number past the end (or a non-existent slice) has no content.
  if (page !== requested || posts.length === 0) notFound();

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Blog", href: ROUTES.blog },
    { label: `Page ${page}`, href: `${ROUTES.blog}/page/${page}` },
  ];

  const prevHref = page - 1 <= 1 ? ROUTES.blog : `${ROUTES.blog}/page/${page - 1}`;
  const nextHref = page < totalPages ? `${ROUTES.blog}/page/${page + 1}` : null;

  return (
    <div className="pb-14">
      {/* rel=prev/next for paginated series (hoisted into <head> by Next). */}
      <link rel="prev" href={absoluteUrl(prevHref)} />
      {nextHref ? <link rel="next" href={absoluteUrl(nextHref)} /> : null}

      <PageHeader
        title="The GigAI Tools Blog"
        description={`Guides, tips and updates on the tools you use every day: page ${page} of ${totalPages}.`}
        breadcrumb={breadcrumb}
      />

      <Container className="mt-12">
        <BlogList posts={posts} />

        <Pagination page={page} totalPages={totalPages} basePath={ROUTES.blog} className="mt-14" />

        <SubscribeCta className="mt-16" />
      </Container>

      <JsonLd
        data={[
          collectionPageJsonLd({
            name: `${SITE.name} Blog, Page ${page}`,
            description: "Guides, tips and updates on the tools you use every day.",
            url: absoluteUrl(`${ROUTES.blog}/page/${page}`),
          }),
          breadcrumbJsonLd(breadcrumb),
        ]}
      />
    </div>
  );
}
