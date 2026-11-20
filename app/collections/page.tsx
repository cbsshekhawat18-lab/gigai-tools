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
import { getCollections, getCollectionTools } from "@/lib/discovery";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * Collections index, a curated map of every browsable theme on the platform.
 * Each collection groups tools by intent (audience, domain or freshness) so a
 * visitor can jump straight to a hand-picked set instead of scanning ~249 tools.
 * Server-rendered, fully static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Collections", href: "/collections" },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Tool Collections, Curated Sets for Every Job",
    description:
      "Browse hand-picked collections of our free online tools: grouped by who you are and what you're doing, from student essentials to a full developer toolbox.",
    canonical: "/collections",
  });
}

export default function CollectionsPage() {
  const collections = getCollections();

  const items: DiscoveryCardItem[] = collections.map((collection) => {
    const count = getCollectionTools(collection).length;
    return {
      href: `/collections/${collection.slug}`,
      icon: collection.icon,
      accent: collection.accent,
      title: collection.title,
      description: collection.description,
      meta: count > 0 ? pluralize(count, "tool") : undefined,
    };
  });

  const featured = collections[0];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="LayoutGrid"
        accent="indigo"
        title="Tool Collections"
        description="Curated sets of tools for every kind of work. Pick the collection that matches what you're doing and get straight to the right tool."
        longDescription="Every collection is a hand-picked shortlist drawn from our full library, so you skip the search and start with the tools that actually fit the task in front of you."
        badge={{ icon: "LayoutGrid", label: pluralize(collections.length, "collection") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="All collections"
            description="From audience toolkits to whole domains, jump into a curated set."
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
              title="Prefer to start from a task?"
              description="Task hubs gather every tool for one job, compress files, convert formats, create QR codes and more."
              primary={{ label: "Browse tasks", href: ROUTES.tasks }}
              secondary={{ label: `Open ${featured.title}`, href: `/collections/${featured.slug}` }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Tool Collections",
            description:
              "Curated collections of free online tools grouped by audience, domain and intent.",
            url: "/collections",
          }),
          itemListJsonLd(
            collections.map((c) => ({
              name: c.title,
              url: absoluteUrl(`/collections/${c.slug}`),
            })),
          ),
        ]}
      />
    </div>
  );
}
