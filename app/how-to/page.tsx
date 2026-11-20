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
import { getAllHowTos } from "@/lib/content";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * How-to index, every step-by-step guide in one grid. Each card links to a
 * full guide that walks the reader through a task and hands them the exact tool
 * to do it. Server-rendered, fully static; derives from the how-to registry.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "How-to guides", href: ROUTES.howToIndex },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "How-To Guides, Step-by-Step, With the Right Tool",
    description:
      "Clear, no-nonsense how-to guides for everyday file and content tasks, each one a numbered walkthrough that hands you the exact free tool to get it done.",
    canonical: ROUTES.howToIndex,
  });
}

export default function HowToIndexPage() {
  const guides = getAllHowTos();

  const items: DiscoveryCardItem[] = guides.map((g) => ({
    href: ROUTES.howTo(g.slug),
    icon: g.icon ?? "ListChecks",
    accent: g.accent ?? "emerald",
    title: g.title,
    description: g.description,
    meta: pluralize(g.steps.length, "step"),
  }));

  const featured = guides[0];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="ListChecks"
        accent="emerald"
        title="How-to guides"
        description="Short, practical walkthroughs for the file and content tasks people actually search for: follow the numbered steps and get it done in minutes."
        longDescription="Every guide is anchored to a free, in-browser tool, so you're never left wondering which button to press. You follow the steps and finish the job."
        badge={{ icon: "ListChecks", label: pluralize(guides.length, "guide") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="All how-to guides"
            description="Pick the task you're trying to do and follow the steps."
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
              title="Looking for something specific?"
              description="Start with our most popular guide, or compare your options first."
              primary={{ label: featured.title, href: ROUTES.howTo(featured.slug) }}
              secondary={{ label: "Compare options", href: ROUTES.compare }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "How-to guides",
            description:
              "Step-by-step how-to guides for everyday file and content tasks, each paired with a free tool.",
            url: ROUTES.howToIndex,
          }),
          ...(guides.length > 0
            ? [
                itemListJsonLd(
                  guides.map((g) => ({
                    name: g.title,
                    url: absoluteUrl(ROUTES.howTo(g.slug)),
                  })),
                ),
              ]
            : []),
        ]}
      />
    </div>
  );
}
