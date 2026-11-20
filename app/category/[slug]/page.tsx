import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { BlogPost, Category, Tool } from "@/types";
import { ROUTES } from "@/config/constants";
import { CATEGORIES } from "@/config/categories";
import { absoluteUrl, cn, pluralize, toToolCardData } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";
import { buildCategoryMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqJsonLd,
  itemListJsonLd,
} from "@/lib/schema";
import {
  getCategoryBySlug,
  getToolBySlug,
  getToolsByCategory,
  CATEGORY_MIN_INDEXED,
  isLiveTool,
} from "@/lib/registry";
import { getAllPosts, getPostsByCategory } from "@/lib/blog";
import { getRelatedWeb } from "@/lib/seo/related-web";
import { Container } from "@/components/shared/container";
import { ToolCard } from "@/components/shared/tool-card";
import { RelatedWeb } from "@/components/shared/related-web";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { CategoryVisitTracker } from "@/components/personalization/category-visit-tracker";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { CategoryToolSearch } from "@/components/category/category-tool-search";
import { BlogList } from "@/modules/blog/blog-list";
import { Badge } from "@/components/ui/badge";
import { ResponsiveAd, MultiplexAd } from "@/components/ads";

/**
 * Category landing: a premium, standalone micro-site for a whole category.
 * Driven entirely by config: the page is richer when the optional premium
 * fields (longDescription, intro, faq, popularSlugs, relatedCategories) are
 * present, but works for every category out of the box. Stays a server
 * component; the only client interactivity is the small search island.
 */

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    return { title: "Category not found", robots: { index: false, follow: false } };
  }
  const meta = buildCategoryMetadata(category);
  // Thin-content guard: a near-empty category stays reachable (no 404) but is
  // kept out of the index, still `follow` so link equity flows to its tool(s).
  if (getToolsByCategory(category.slug).length < CATEGORY_MIN_INDEXED) {
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

/** Resolve the "Popular tools" set: explicit popularSlugs → popular/featured flags. */
function resolvePopularTools(category: Category, tools: Tool[]): Tool[] {
  if (category.popularSlugs && category.popularSlugs.length > 0) {
    const resolved = category.popularSlugs
      .map((slug) => getToolBySlug(slug))
      .filter(
        (t): t is Tool =>
          t !== undefined && t.category === category.slug && isLiveTool(t),
      );
    if (resolved.length > 0) return resolved;
  }
  return tools.filter((t) => t.popular || t.featured).slice(0, 6);
}

/** Newest tools first, flagged `isNew` or by `createdAt` desc. */
function resolveNewestTools(tools: Tool[]): Tool[] {
  const flagged = tools.filter((t) => t.isNew);
  const base = flagged.length > 0 ? flagged : tools;
  return [...base]
    .sort((a, b) => {
      const at = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bt - at;
    })
    .slice(0, 3);
}

/** A named group of tools (sub-category) for the grouped landing view. */
interface ToolGroup {
  name: string;
  tools: Tool[];
}

/**
 * Bucket a category's tools by their optional `group` label, preserving the
 * registry order both within and across groups. Returns an empty array when no
 * tool in the category sets `group`, so the grouped view only appears for
 * categories that opt in (e.g. SEO), leaving every other category untouched.
 */
function groupToolsBySubcategory(tools: Tool[]): ToolGroup[] {
  const order: string[] = [];
  const byGroup = new Map<string, Tool[]>();
  for (const tool of tools) {
    if (!tool.group) continue;
    const existing = byGroup.get(tool.group);
    if (existing) {
      existing.push(tool);
    } else {
      byGroup.set(tool.group, [tool]);
      order.push(tool.group);
    }
  }
  return order.map((name) => ({ name, tools: byGroup.get(name) ?? [] }));
}

/** Related categories: explicit list → other featured categories. */
function resolveRelatedCategories(category: Category): Category[] {
  if (category.relatedCategories && category.relatedCategories.length > 0) {
    const resolved = category.relatedCategories
      .map((slug) => getCategoryBySlug(slug))
      .filter((c): c is Category => c !== undefined && c.slug !== category.slug);
    if (resolved.length > 0) return resolved;
  }
  return CATEGORIES.filter((c) => c.featured && c.slug !== category.slug).slice(0, 3);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = getToolsByCategory(category.slug);
  const accent = accentStyle(category.accent);

  const popularTools = resolvePopularTools(category, tools);
  const relatedCategories = resolveRelatedCategories(category);

  // Sub-category groups (SEO opts in via each tool's `group`). Empty for every
  // category whose tools don't set `group`, so the grouped view stays hidden.
  const toolGroups = groupToolsBySubcategory(tools);

  // First real destination for the hero CTA: first popular tool, else first tool.
  const primaryTool = popularTools[0] ?? tools[0];

  // "Guides & articles" for this landing (by guidesTag, else the category slug).
  const guides: BlogPost[] = await getPostsByCategory(
    category.guidesTag ?? category.slug,
    6,
  );

  // Slim internal-linking web (tools / blogs / tasks / file hubs) for this category.
  const relatedWeb = getRelatedWeb({
    kind: "category",
    category,
    allPosts: await getAllPosts(),
  });

  // Internal-link chips: up to 8 tools to seed deep links / crawl paths.

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: category.name, href: ROUTES.category(category.slug) },
  ];

  return (
    <div className="pb-16 sm:pb-24">
      {/* Record the visit for the homepage "Continue where you were" chips. */}
      <CategoryVisitTracker slug={category.slug} />
      {/* ── Compact header - category = browse, so nothing tall sits above
          the tool grid (V4: the task is the hero). ── */}
      <section className="border-b border-border">
        <Container className="py-6 sm:py-8">
          <Breadcrumb items={breadcrumb} />

          <div className="mt-4 flex min-w-0 items-start gap-3.5">
            <span
              className={cn(
                "mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border",
                accent.soft,
                accent.border,
              )}
            >
              <Icon name={category.icon} size={20} />
            </span>
            <div className="min-w-0">
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {category.name}
                <Badge variant="outline" className="ml-2.5 align-middle">
                  {pluralize(tools.length, "tool")}
                </Badge>
              </h1>
              <p className="mt-1.5 max-w-2xl text-pretty text-base text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="ShieldCheck" size={15} />
              100% private. Runs in your browser
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Zap" size={15} />
              Free, no sign-up
            </span>
          </div>
        </Container>
      </section>

      {/* ── All tools + inline search - the browse task, first ───────────── */}
      <section className="py-8 sm:py-10">
        <Container>
          {tools.length > 0 ? (
            <CategoryToolSearch
              tools={tools.map((tool) => ({
                ...toToolCardData(tool),
                keywords: tool.keywords,
              }))}
              categoryName={category.name}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
              {`No ${category.name.toLowerCase()} just yet. Check back soon.`}
            </p>
          )}
        </Container>
      </section>

      {/* ── Intro ────────────────────────────────────────────────────────── */}
      {category.intro ? (
        <section className="py-10 sm:py-12">
          <Container size="narrow">
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              {category.intro}
            </p>
          </Container>
        </section>
      ) : null}

      <Container>
        <ResponsiveAd position="CATEGORY_TOP" className={category.intro ? "" : "mt-10"} />
      </Container>


      {/* ── All SEO categories (grouped by sub-category) ─────────────────── */}
      {toolGroups.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading
              title={`All ${category.name.toLowerCase()} categories`}
              description={`Browse the ${pluralize(
                tools.length,
                "tool",
              )} grouped by what they do.`}
            />
            <div className="mt-8 flex flex-col gap-10">
              {toolGroups.map((group) => (
                <div key={group.name}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {group.name}
                    </h3>
                    <span className={cn("text-sm font-medium tabular-nums", accent.text)}>
                      {pluralize(group.tools.length, "tool")}
                    </span>
                  </div>
                  <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.tools.map((tool) => (
                      <li key={tool.slug}>
                        <ToolCard tool={toToolCardData(tool)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── Learning Center / best practices (config-driven) ─────────────── */}
      {category.learningCenter &&
      category.learningCenter.lessons.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading
              title={category.learningCenter.title}
              description={category.learningCenter.description}
            />
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.learningCenter.lessons.map((lesson) => (
                <li
                  key={lesson.title}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl ring-1 ring-inset ring-border/50",
                      accent.soft,
                    )}
                  >
                    <Icon name={lesson.icon} size={22} />
                  </span>
                  <h3 className="font-semibold leading-snug tracking-tight text-foreground">
                    {lesson.title}
                  </h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {lesson.description}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <Container>
        <ResponsiveAd position="CATEGORY_MID" className="my-4" />
      </Container>

      {/* ── Guides & articles ────────────────────────────────────────────── */}
      {guides.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading
              title="Guides & articles"
              description={`Tutorials and tips for getting more from our ${category.name.toLowerCase()}.`}
            />
            <div className="mt-8">
              <BlogList posts={guides} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {category.faq && category.faq.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container size="narrow">
            <FAQ items={category.faq} />
          </Container>
        </section>
      ) : null}

      {/* ── Related categories ───────────────────────────────────────────── */}
      {relatedCategories.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading title="Related categories" />
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCategories.map((related) => {
                const relAccent = accentStyle(related.accent);
                return (
                  <li key={related.slug}>
                    <Link
                      href={ROUTES.category(related.slug)}
                      className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-transparent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-xl ring-1 ring-inset ring-border/50",
                          relAccent.soft,
                        )}
                      >
                        <Icon name={related.icon} size={22} />
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        {related.name}
                        <Icon
                          name="ArrowRight"
                          size={16}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {related.description}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* ── Related web (slim internal-linking bundle) ───────────────────── */}
      <section className="py-10 sm:py-14">
        <Container>
          <RelatedWeb bundle={relatedWeb} title="More across the site" />
        </Container>
      </section>

      <Container>
        <MultiplexAd position="CATEGORY_BOTTOM" className="mt-4" />
      </Container>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      {primaryTool ? (
        <section className="pt-6 sm:pt-10">
          <Container>
            <CTA
              title={`Get started with our ${category.name.toLowerCase()}`}
              description="Free, private and instant: everything runs in your browser."
              primary={{
                label: `Try ${primaryTool.title}`,
                href: ROUTES.tool(primaryTool.slug),
              }}
              secondary={{ label: "Browse all tools", href: ROUTES.home }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          collectionPageJsonLd({
            name: category.name,
            description: category.longDescription ?? category.description,
            url: ROUTES.category(category.slug),
          }),
          ...(category.faq && category.faq.length > 0
            ? [faqJsonLd(category.faq)]
            : []),
          ...(tools.length > 0
            ? [
                itemListJsonLd(
                  tools.map((t) => ({
                    name: t.title,
                    url: absoluteUrl(ROUTES.tool(t.slug)),
                  })),
                ),
              ]
            : []),
        ]}
      />
    </div>
  );
}
