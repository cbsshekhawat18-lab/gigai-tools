import type { Metadata } from "next";
import Link from "next/link";

import type { BlogPost } from "@/types";
import { ROUTES } from "@/config/constants";
import { absoluteUrl, cn, formatDate } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/schema";

import { getToolsByCategory, getIndexableCategories } from "@/lib/registry";
import { getAllPosts, getFeaturedPosts } from "@/lib/blog";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * Learning Center hub, the single entry point for guides, tutorials,
 * cheatsheets and best practices. Pulls per-category learning content and the
 * latest blog articles from the registry + blog, so it auto-populates as
 * content is added. Server-rendered, fully static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Learn", href: "/learn" },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Learning Center, Guides, Tutorials & Best Practices",
    description:
      "Learn how to get the most out of every tool. Category-by-category guides, hands-on tutorials, cheatsheets and best practices: plus the latest articles from our blog.",
    canonical: "/learn",
  });
}

export default async function LearnPage() {
  // Per-category guides, one card per category, linking to its landing page,
  // annotated with how many tools it holds so it reads as a real learning path.
  const categories = getIndexableCategories();
  const categoryItems: DiscoveryCardItem[] = categories.map((category) => {
    const toolCount = getToolsByCategory(category.slug).length;
    const learnTitle = category.learningCenter?.title;
    return {
      href: ROUTES.category(category.slug),
      icon: category.icon,
      accent: category.accent,
      title: category.name,
      description: learnTitle ?? category.description,
      meta: toolCount > 0 ? `${toolCount} tools · guides` : "guides",
    };
  });

  // Latest articles from the blog (featured first, then most recent overall).
  const featured = await getFeaturedPosts(6);
  const posts: BlogPost[] =
    featured.length > 0 ? featured : (await getAllPosts()).slice(0, 6);

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="GraduationCap"
        accent="emerald"
        title="Learning Center"
        description="Guides, tutorials, cheatsheets and best practices for every category, so you don't just use the tools, you master them."
        longDescription="Pick a category to dive into its how-tos and best practices, or jump straight to the latest hands-on articles. Everything here is free to read and built to get you to the result faster."
        badge={{ icon: "BookOpen", label: `${categories.length} learning paths` }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Learn a category"
            description="Best practices and how-tos for each part of the toolkit."
          />
          <div className="mt-8">
            <DiscoveryCardGrid items={categoryItems} columns={3} />
          </div>
        </Container>
      </section>

      {posts.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading
              eyebrow="From the blog"
              title="Latest tutorials & articles"
              description="Hands-on walkthroughs, tips and deep dives."
            />
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={ROUTES.blogPost(post.slug)}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-transparent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Icon name="Newspaper" size={14} />
                      {post.category ?? "Article"}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold leading-snug tracking-tight text-foreground">
                      {post.title}
                      <Icon
                        name="ArrowRight"
                        size={16}
                        className="shrink-0 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {post.description}
                    </span>
                    <span className="mt-auto pt-1 text-xs text-muted-foreground">
                      {formatDate(post.date)}
                      {post.readingTimeMinutes
                        ? ` · ${post.readingTimeMinutes} min read`
                        : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href={ROUTES.blog}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-semibold",
                  accentStyle("emerald").text,
                )}
              >
                Read all articles
                <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-10 sm:py-14">
        <Container>
          <SectionHeading
            title="Comparisons & how-to guides"
            description="Substantive, long-form pages that answer the exact question you searched for."
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={ROUTES.glossary}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Icon name="BookOpen" size={14} />
                Glossary
              </span>
              <span className="flex items-center gap-1.5 font-semibold leading-snug tracking-tight text-foreground">
                What is…? Plain-English definitions
                <Icon
                  name="ArrowRight"
                  size={16}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-sm text-muted-foreground">
                PDF, WebP, SVG, OCR, bitrate, favicon, the terms behind every tool,
                explained without jargon.
              </span>
            </Link>
            <Link
              href={ROUTES.solve}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Icon name="Lightbulb" size={14} />
                Solve a problem
              </span>
              <span className="flex items-center gap-1.5 font-semibold leading-snug tracking-tight text-foreground">
                Start from your problem
                <Icon
                  name="ArrowRight"
                  size={16}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-sm text-muted-foreground">
                &ldquo;My PDF is too large&rdquo;, &ldquo;QR code for WiFi&rdquo;,
                &ldquo;email attachment too large&rdquo;, jump straight to the fix.
              </span>
            </Link>
            <Link
              href={ROUTES.compare}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Icon name="GitCompare" size={14} />
                Comparisons
              </span>
              <span className="flex items-center gap-1.5 font-semibold leading-snug tracking-tight text-foreground">
                Format & tool comparisons
                <Icon
                  name="ArrowRight"
                  size={16}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-sm text-muted-foreground">
                PNG vs JPG, JSON vs XML, MP4 vs WebM and more. Pick the right
                format with a clear, honest verdict.
              </span>
            </Link>
            <Link
              href={ROUTES.howToIndex}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Icon name="ListChecks" size={14} />
                How-to guides
              </span>
              <span className="flex items-center gap-1.5 font-semibold leading-snug tracking-tight text-foreground">
                Step-by-step how-to guides
                <Icon
                  name="ArrowRight"
                  size={16}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-sm text-muted-foreground">
                Compress a PDF, make a ringtone, format JSON: follow along and
                get it done in your browser.
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <section className="pt-2 sm:pt-6">
        <Container>
          <CTA
            title="Ready to put it into practice?"
            description="Explore curated collections and guided workflows to apply what you've learned."
            primary={{ label: "Browse workflows", href: ROUTES.workflows }}
            secondary={{ label: "Browse collections", href: ROUTES.collections }}
          />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Learning Center",
            description:
              "Guides, tutorials, cheatsheets and best practices for every category of free online tools.",
            url: "/learn",
          }),
          itemListJsonLd(
            categories.map((c) => ({
              name: c.name,
              url: absoluteUrl(ROUTES.category(c.slug)),
            })),
          ),
        ]}
      />
    </div>
  );
}
