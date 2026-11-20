import type { BlogPost, BreadcrumbItem } from "@/types";
import type { Taxonomy } from "@/lib/blog";
import { ROUTES } from "@/config/constants";
import { pluralize } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { BlogList } from "@/modules/blog/blog-list";
import { TaxonomyChips } from "@/components/blog/taxonomy-chips";
import { SubscribeCta } from "@/components/blog/subscribe-cta";

interface BlogArchiveProps {
  /** Archive H1, e.g. the category or tag name. */
  title: string;
  /** Intro paragraph under the title. */
  description: string;
  breadcrumb: BreadcrumbItem[];
  posts: BlogPost[];
  /** Sibling taxonomies rendered as filter chips for discovery. */
  chips: Taxonomy[];
  /** Base path for the chips, e.g. "/blog/category" or "/blog/tag". */
  chipsBase: string;
  /** Slug of the active chip (this archive). */
  activeSlug: string;
  /** Empty-state message when the archive has no posts. */
  emptyMessage?: string;
}

/**
 * Shared shell for taxonomy archives (category + tag). Renders the standard page
 * header, a discovery chip row of sibling taxonomies, the full post grid, and an
 * honest subscribe CTA. All posts for the taxonomy are shown (no truncation), so
 * the page stays fully static with no unreachable pagination links.
 */
export function BlogArchive({
  title,
  description,
  breadcrumb,
  posts,
  chips,
  chipsBase,
  activeSlug,
  emptyMessage,
}: BlogArchiveProps) {
  return (
    <div className="pb-14">
      <PageHeader title={title} description={description} breadcrumb={breadcrumb} />

      <Container className="mt-10">
        {chips.length > 0 ? (
          <TaxonomyChips
            items={chips.map((c) => ({ label: c.name, slug: c.slug, count: c.count }))}
            base={chipsBase}
            activeSlug={activeSlug}
            allLabel="All articles"
            allHref={ROUTES.blog}
            className="justify-center"
          />
        ) : null}

        <p className="mt-8 text-sm text-muted-foreground">
          {posts.length > 0
            ? `${pluralize(posts.length, "article")} in this collection.`
            : null}
        </p>

        <div className="mt-4">
          <BlogList posts={posts} emptyMessage={emptyMessage} />
        </div>

        <SubscribeCta className="mt-16" />
      </Container>
    </div>
  );
}
