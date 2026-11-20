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
import { getUseCases, getUseCaseTools } from "@/lib/discovery";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * Use-cases index, "tools for X". An audience-first way in: pick who you are
 * (student, developer, marketer…) and land on a curated toolkit plus guidance.
 * Server-rendered, fully static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Use Cases", href: "/use-cases" },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Tools by Use Case. Curated for Who You Are",
    description:
      "Find the right tools for your role in seconds. Curated toolkits for students, developers, designers, marketers, businesses and creators, free and private.",
    canonical: "/use-cases",
  });
}

export default function UseCasesPage() {
  const useCases = getUseCases();

  const items: DiscoveryCardItem[] = useCases.map((useCase) => ({
    href: `/use-cases/${useCase.slug}`,
    icon: useCase.icon,
    accent: useCase.accent,
    title: useCase.title,
    description: useCase.description,
    meta: pluralize(getUseCaseTools(useCase).length, "tool"),
  }));

  const first = useCases[0];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="Users"
        accent="sky"
        title="Tools for the way you work"
        description="Pick your role and get a curated toolkit built for it. No scanning the whole library, just the tools that fit what you do."
        longDescription="Each use-case bundles the tools a given audience reaches for most, with guidance on how they fit together, so you get from 'which tool?' to 'done' in seconds."
        badge={{ icon: "Users", label: pluralize(useCases.length, "use case") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Browse by use case"
            description="Curated toolkits for every kind of work."
          />
          <div className="mt-8">
            <DiscoveryCardGrid items={items} columns={3} />
          </div>
        </Container>
      </section>

      {first ? (
        <section className="pt-2 sm:pt-6">
          <Container>
            <CTA
              title="Find your toolkit"
              description="Curated, free and private. Everything runs in your browser."
              primary={{ label: `Open ${first.title}`, href: `/use-cases/${first.slug}` }}
              secondary={{ label: "Browse all tools", href: ROUTES.home }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Tools by Use Case",
            description:
              "Curated toolkits of free online tools for students, developers, designers, marketers, businesses and creators.",
            url: "/use-cases",
          }),
          itemListJsonLd(
            useCases.map((u) => ({
              name: u.title,
              url: absoluteUrl(`/use-cases/${u.slug}`),
            })),
          ),
        ]}
      />
    </div>
  );
}
