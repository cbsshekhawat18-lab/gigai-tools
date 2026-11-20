import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { AccentKey } from "@/types";
import { ROUTES } from "@/config/constants";
import { pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  webPageJsonLd,
} from "@/lib/schema";
import {
  getAllComparisonSlugs,
  getComparisonBySlug,
  getComparisonTools,
  getRelatedComparisons,
} from "@/lib/content";
import { getAllPosts } from "@/lib/blog";
import { getRelatedWeb } from "@/lib/seo/related-web";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";
import { RelatedTools } from "@/components/shared/related-tools";
import { RelatedWeb } from "@/components/shared/related-web";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";
import { ComparisonTable, ChooseColumns } from "@/components/content/comparison-table";
import { ContentCta } from "@/components/content/content-cta";

/**
 * A single "X vs Y" comparison micro-site: hero, intro, side-by-side table,
 * "choose A / choose B" columns, verdict, a CTA to the converter tool(s),
 * related tools + comparisons, and FAQ. Fully static; derives entirely from the
 * comparison registry.
 */

interface ComparisonPageProps {
  params: Promise<{ slug: string }>;
}

// The two column accents: side A takes the comparison's own accent, side B a
// complementary warm accent, so the table's two sides stay visually distinct.
const SIDE_A_ACCENT_FALLBACK: AccentKey = "sky";
const SIDE_B_ACCENT: AccentKey = "amber";

export function generateStaticParams(): { slug: string }[] {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ComparisonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) {
    return { title: "Comparison not found", robots: { index: false, follow: false } };
  }
  const seo = comparison.seo ?? {};
  return buildMetadata({
    title: seo.title ?? comparison.title,
    description: seo.description ?? comparison.description,
    keywords: seo.keywords,
    ogImage: seo.ogImage,
    canonical: seo.canonical ?? ROUTES.comparison(comparison.slug),
    type: seo.type ?? "article",
  });
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  const accentA = comparison.accent ?? SIDE_A_ACCENT_FALLBACK;
  const tools = getComparisonTools(comparison);
  const related = getRelatedComparisons(comparison);
  const verdictStyle = accentStyle(accentA);

  const relatedItems: DiscoveryCardItem[] = related.map((c) => ({
    href: ROUTES.comparison(c.slug),
    icon: c.icon ?? "GitCompare",
    accent: c.accent ?? "sky",
    title: `${c.a} vs ${c.b}`,
    description: c.description,
    meta: pluralize(c.dimensions.length, "dimension"),
  }));

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Compare", href: ROUTES.compare },
    { label: `${comparison.a} vs ${comparison.b}`, href: ROUTES.comparison(comparison.slug) },
  ];

  const primaryTool = tools[0];

  // Slim internal-linking web for this comparison: seed matching with the two
  // sides. Only clean single-token sides become file-type hubs (e.g. png, jpg);
  // multi-word labels still sharpen tag matching. Degrades gracefully.
  const sides = [comparison.a, comparison.b].map((s) => s.toLowerCase());
  const relatedWeb = getRelatedWeb({
    kind: "hub",
    title: `${comparison.a} vs ${comparison.b}`,
    tags: [...sides, ...(comparison.seo?.keywords ?? [])],
    fileTypes: sides.filter((s) => /^[a-z0-9]+$/.test(s)),
    allPosts: await getAllPosts(),
  });

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={comparison.icon ?? "GitCompare"}
        accent={accentA}
        title={comparison.title}
        description={comparison.description}
        badge={{ icon: "GitCompare", label: pluralize(comparison.dimensions.length, "dimension") }}
      />

      {/* Intro */}
      <section className="py-12 sm:py-16">
        <Container size="narrow">
          <div className="space-y-4 text-pretty text-base leading-relaxed text-muted-foreground">
            {comparison.intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* Side-by-side table */}
      <section className="pb-12 sm:pb-16">
        <Container>
          <SectionHeading
            title={`${comparison.a} vs ${comparison.b}, compared`}
            description="Every dimension that actually affects the decision, at a glance."
          />
          <div className="mt-8">
            <ComparisonTable
              a={comparison.a}
              b={comparison.b}
              dimensions={comparison.dimensions}
              accentA={accentA}
              accentB={SIDE_B_ACCENT}
            />
          </div>
        </Container>
      </section>

      {/* Choose A / Choose B */}
      <section className="pb-12 sm:pb-16">
        <Container>
          <SectionHeading
            title="Which one is right for you?"
          />
          <div className="mt-8">
            <ChooseColumns
              a={comparison.a}
              b={comparison.b}
              whenA={comparison.whenA}
              whenB={comparison.whenB}
              accentA={accentA}
              accentB={SIDE_B_ACCENT}
            />
          </div>
        </Container>
      </section>

      {/* Verdict */}
      <section className="pb-12 sm:pb-16">
        <Container size="narrow">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${verdictStyle.gradient}`}
            />
            <div className="flex items-center gap-2.5">
              <Icon name="Gavel" size={20} className={verdictStyle.text} />
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                The verdict
              </h2>
            </div>
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
              {comparison.verdict}
            </p>
          </div>
        </Container>
      </section>

      {/* CTA to the converter tool(s) */}
      {primaryTool ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <ContentCta
              tool={primaryTool}
              heading={`Ready to switch? Try ${primaryTool.title}`}
              description="Free, private and instant: everything runs right in your browser."
            />
          </Container>
        </section>
      ) : null}

      {/* Related tools */}
      {tools.length > 0 ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <RelatedTools tools={tools} title="Tools for this comparison" />
          </Container>
        </section>
      ) : null}

      {/* Related comparisons */}
      {relatedItems.length > 0 ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <SectionHeading title="Related comparisons" />
            <div className="mt-8">
              <DiscoveryCardGrid items={relatedItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Related web (slim internal-linking bundle) */}
      <section className="pb-12 sm:pb-16">
        <Container>
          <RelatedWeb bundle={relatedWeb} title="Keep exploring" />
        </Container>
      </section>

      {/* FAQ */}
      <section className="pb-4">
        <Container size="narrow">
          <FAQ items={comparison.faq} />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          webPageJsonLd({
            name: comparison.title,
            description: comparison.description,
            url: ROUTES.comparison(comparison.slug),
          }),
          faqJsonLd(comparison.faq),
        ]}
      />
    </div>
  );
}
