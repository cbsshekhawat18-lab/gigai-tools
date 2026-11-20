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
import { getWorkflows } from "@/lib/discovery";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * Workflows index, guided, multi-tool journeys. Each workflow chains several
 * tools into an ordered recipe (optimise an image, publish a PDF, run a QR
 * campaign…) so a visitor sees the whole path, not just one isolated tool.
 * Server-rendered, fully static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Workflows", href: "/workflows" },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Guided Workflows, Chain Tools Into One Recipe",
    description:
      "Step-by-step workflows that connect our free online tools into a single job, optimise images, assemble a PDF, launch a search-ready page or run a QR campaign, start to finish.",
    canonical: "/workflows",
  });
}

export default function WorkflowsPage() {
  const workflows = getWorkflows();

  const items: DiscoveryCardItem[] = workflows.map((workflow) => ({
    href: `/workflows/${workflow.slug}`,
    icon: workflow.icon,
    accent: workflow.accent,
    title: workflow.title,
    description: workflow.description,
    meta: pluralize(workflow.steps.length, "step"),
  }));

  const first = workflows[0];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="Route"
        accent="violet"
        title="Guided workflows"
        description="Follow a proven recipe from start to finish, each workflow chains the right tools in the right order, so you always know the next step."
        longDescription="Instead of hunting for one tool at a time, pick the outcome you want and walk through an ordered path. Every step links straight to the tool that does it, all free and private in your browser."
        badge={{ icon: "Route", label: pluralize(workflows.length, "workflow") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Browse workflows"
            description="Ordered, tool-by-tool recipes for common jobs."
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
              title="Not sure where to start?"
              description="Follow a guided recipe, or explore the full library of tools."
              primary={{ label: `Start: ${first.title}`, href: `/workflows/${first.slug}` }}
              secondary={{ label: "Browse all tools", href: ROUTES.home }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Guided Workflows",
            description:
              "Step-by-step workflows that chain free online tools into a single, complete job.",
            url: "/workflows",
          }),
          itemListJsonLd(
            workflows.map((w) => ({
              name: w.title,
              url: absoluteUrl(`/workflows/${w.slug}`),
            })),
          ),
        ]}
      />
    </div>
  );
}
