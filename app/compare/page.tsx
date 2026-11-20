import type { Metadata } from "next";

import { ROUTES } from "@/config/constants";
import { absoluteUrl, pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/schema";
import { getAllComparisons } from "@/lib/content";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * Comparisons index, every "X vs Y" page in one grid. Each card links to a
 * full comparison micro-site that answers a real "which should I use?" search.
 * Server-rendered, fully static; derives entirely from the comparison registry.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Compare", href: ROUTES.compare },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Compare, Which Tool, Format or Approach Should You Use?",
    description:
      "Head-to-head comparisons that settle the everyday 'X vs Y' questions (file formats, tools and approaches) with clear tables, guidance and an honest verdict.",
    canonical: ROUTES.compare,
  });
}

export default function CompareIndexPage() {
  const comparisons = getAllComparisons();

  const items: DiscoveryCardItem[] = comparisons.map((c) => ({
    href: ROUTES.comparison(c.slug),
    icon: c.icon ?? "GitCompare",
    accent: c.accent ?? "sky",
    title: `${c.a} vs ${c.b}`,
    description: c.description,
    meta: pluralize(c.dimensions.length, "dimension"),
  }));

  const featured = comparisons[0];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="GitCompare"
        accent="cyan"
        title="Compare"
        description="Clear, honest head-to-head comparisons for the choices that trip people up (which format, which tool, which approach) each ending in a straight answer."
        longDescription="Every comparison lays out a scannable side-by-side table, spells out exactly when each option wins, and links straight to the tool that acts on your decision."
        badge={{ icon: "GitCompare", label: pluralize(comparisons.length, "comparison") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="All comparisons"
            description="Pick the match-up you're weighing up and get to a decision fast."
          />
          <div className="mt-8">
            <DiscoveryCardGrid items={items} columns={3} />
          </div>
        </Container>
      </section>

      {featured ? (
        <section className="pt-2 sm:pt-6">
          <Container>
            <CTA
              title="Still not sure which to pick?"
              description="Start with our most-read comparison, or explore step-by-step how-to guides."
              primary={{
                label: `${featured.a} vs ${featured.b}`,
                href: ROUTES.comparison(featured.slug),
              }}
              secondary={{ label: "How-to guides", href: ROUTES.howToIndex }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Compare",
            description:
              "Head-to-head comparisons of file formats, tools and approaches with clear guidance and a verdict.",
            url: ROUTES.compare,
          }),
          ...(comparisons.length > 0
            ? [
                itemListJsonLd(
                  comparisons.map((c) => ({
                    name: `${c.a} vs ${c.b}`,
                    url: absoluteUrl(ROUTES.comparison(c.slug)),
                  })),
                ),
              ]
            : []),
        ]}
      />
    </div>
  );
}
