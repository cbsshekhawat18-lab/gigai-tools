import type { Metadata } from "next";
import { getBlogCover } from "@/lib/blog-covers";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { absoluteUrl, formatDate, pluralize, slugify } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/schema";
import {
  extractHeadings,
  getAdjacentPosts,
  getAllPostSlugs,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import { getRelatedWeb } from "@/lib/seo/related-web";
import { Container } from "@/components/shared/container";
import { RelatedWeb } from "@/components/shared/related-web";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/lib/icons";
import { BlogContent } from "@/modules/blog/blog-content";
import { BlogList } from "@/modules/blog/blog-list";
import { SectionHeading } from "@/components/shared/section-heading";
import { InArticleAd, MultiplexAd } from "@/components/ads";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ShareButtons } from "@/components/blog/share-buttons";
import { Reactions } from "@/components/blog/reactions";
import { AuthorBox } from "@/components/blog/author-box";
import { PostNav } from "@/components/blog/post-nav";
import { SubscribeCta } from "@/components/blog/subscribe-cta";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: post.title,
    description: post.description,
    keywords: post.tags,
    ogImage: post.cover,
    canonical: ROUTES.blogPost(post.slug),
    type: "article",
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [related, { prev, next }, allPosts] = await Promise.all([
    getRelatedPosts(post, 3),
    getAdjacentPosts(post.slug),
    getAllPosts(),
  ]);

  // Slim internal-linking web: the post's tool, tag-matched tools, related
  // posts, comparisons, file hubs and task hubs, all as compact chips.
  const relatedWeb = getRelatedWeb({ kind: "blog", post, allPosts });

  const headings = extractHeadings(post.contentHtml ?? "");
  const shareUrl = absoluteUrl(ROUTES.blogPost(post.slug));

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Blog", href: ROUTES.blog },
    { label: post.title, href: ROUTES.blogPost(post.slug) },
  ];

  return (
    <>
      <ReadingProgress target="#post-article" />

      <article id="post-article" className="py-10 sm:py-14">
        <Container size="narrow">
          <Breadcrumb items={breadcrumb} />

          <header className="mt-8">
            {post.category ? (
              <Link href={`/blog/category/${slugify(post.category)}`}>
                <Badge variant="secondary" className="mb-4 capitalize">
                  {post.category}
                </Badge>
              </Link>
            ) : null}

            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="User" size={15} />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="Calendar" size={15} />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
              {typeof post.readingTimeMinutes === "number" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Clock" size={15} />
                  {pluralize(post.readingTimeMinutes, "min")} read
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
              <Reactions slug={post.slug} />
              <ShareButtons url={shareUrl} title={post.title} variant="inline" />
            </div>
          </header>

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover ?? getBlogCover(post)}
              alt={post.title}
              className="size-full object-cover"
              // This cover is the blog post's LCP element, prioritise it and
              // load it eagerly (the 16/9 container already reserves space, so
              // no CLS). decoding=async keeps it off the main-thread critical path.
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
          </div>
        </Container>

        {/* ── Two-column reading layout: sticky rails + article ─────────────── */}
        <Container size="wide" className="mt-10">
          <div className="lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,720px)_minmax(0,4rem)] lg:justify-center lg:gap-8">
            {/* Left rail - table of contents (desktop sticky) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                {headings.length > 0 ? (
                  <TableOfContents headings={headings} />
                ) : null}
              </div>
            </aside>

            {/* Article column */}
            <div className="min-w-0">
              {/* Mobile TOC disclosure */}
              {headings.length > 0 ? (
                <div className="mb-8 lg:hidden">
                  <TableOfContents headings={headings} />
                </div>
              ) : null}

              <BlogContent html={post.contentHtml ?? ""} />

              {/* In-article ad, after the article body */}
              <InArticleAd position="BLOG_MIDDLE" />

              {/* Reactions after the body */}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
                <Reactions slug={post.slug} />
                <ShareButtons url={shareUrl} title={post.title} variant="inline" />
              </div>

              {post.tags && post.tags.length > 0 ? (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-sm font-medium text-muted-foreground">
                    Tags:
                  </span>
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/blog/tag/${slugify(tag)}`}>
                      <Badge variant="outline" className="capitalize">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : null}

              <AuthorBox
                author={post.author}
                date={post.date}
                {...(typeof post.readingTimeMinutes === "number"
                  ? { readingTimeMinutes: post.readingTimeMinutes }
                  : {})}
                className="mt-10"
              />

              <PostNav prev={prev} next={next} className="mt-10" />
            </div>

            {/* Right rail - sticky share buttons (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <ShareButtons url={shareUrl} title={post.title} variant="rail" />
              </div>
            </aside>
          </div>
        </Container>

        {/* ── Multiplex grid after the article ─────────────────────────────── */}
        <Container size="narrow" className="mt-14">
          <MultiplexAd position="BLOG_AFTER" />
        </Container>

        <Container size="narrow" className="mt-14">
          <SubscribeCta />
        </Container>

        {related.length > 0 ? (
          <Container size="narrow" className="mt-16">
            <SectionHeading title="Keep reading" />
            <div className="mt-6">
              <BlogList posts={related} />
            </div>
          </Container>
        ) : null}

        {/* ── Related web (tools, comparisons, file hubs, tasks) ──────────── */}
        <Container size="narrow" className="mt-16">
          <RelatedWeb bundle={relatedWeb} title="Explore related tools" />
        </Container>

        <JsonLd data={[articleJsonLd(post), breadcrumbJsonLd(breadcrumb)]} />
      </article>
    </>
  );
}
