import type { Metadata } from "next";

import { ROUTES } from "@/config/constants";
import { PROBLEMS, getProblemsByGroup } from "@/config/problems";
import { getToolBySlug, isLiveTool } from "@/lib/registry";
import { absoluteUrl, pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * The Problem/Solution directory at `/solve`: the front door to the
 * user-intent database. Instead of "browse 248 tools", visitors start from the
 * problem they actually have ("my PDF is too large", "QR code for WiFi") and
 * get routed to the tools that fix it. Grouped by theme; server-rendered, static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Solve a problem", href: ROUTES.solve },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Solve a Problem, Free Tools for What You're Actually Trying to Do",
    description:
      "Start from your problem, not a tool name. 'My PDF is too large', 'email attachment too large', 'QR code for WiFi', get the exact free, private, in-browser tool that fixes it.",
    keywords: [
      "solve a problem online",
      "free tools for common problems",
      "how do I fix",
      "browser tools",
      "file problems solved",
    ],
    canonical: ROUTES.solve,
  });
}

/** Count the live tools a problem maps to (for the card meta line). */
function liveToolCount(slugs: string[]): number {
  return slugs.filter((s) => {
    const t = getToolBySlug(s);
    return t && isLiveTool(t);
  }).length;
}

export default function SolveIndexPage() {
  const groups = getProblemsByGroup();

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="Lightbulb"
        accent="amber"
        title="What are you trying to do?"
        description="Start from the problem in your own words, we'll point you at the exact free tool that solves it."
        longDescription="No jargon, no tool names to guess. Pick the problem that sounds like yours ('my PDF is too large', 'I need a passport photo', 'QR code for WiFi') and jump straight to the fix. Every tool is free, private and runs in your browser."
        badge={{ icon: "Lightbulb", label: pluralize(PROBLEMS.length, "problem") }}
      />

      {groups.map((group) => {
        const items: DiscoveryCardItem[] = group.problems.map((p) => {
          const count = liveToolCount(p.tools);
          return {
            href: ROUTES.solveProblem(p.slug),
            icon: p.icon,
            accent: p.accent,
            title: p.problem,
            description: p.intro,
            meta: count > 0 ? pluralize(count, "tool") : undefined,
          };
        });

        return (
          <section key={group.group} className="py-8 sm:py-10">
            <Container>
              <SectionHeading title={group.group} />
              <div className="mt-8">
                <DiscoveryCardGrid items={items} columns={3} />
              </div>
            </Container>
          </section>
        );
      })}

      <section className="pt-4 sm:pt-8">
        <Container>
          <CTA
            title="Can't see your exact problem?"
            description="Search across every tool on the platform, or browse by the job you want to get done."
            primary={{ label: "Search all tools", href: ROUTES.search }}
            secondary={{ label: "Browse by task", href: ROUTES.tasks }}
          />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Solve a Problem",
            description:
              "A directory of real user problems mapped to the free, in-browser tools that solve them.",
            url: ROUTES.solve,
          }),
          itemListJsonLd(
            PROBLEMS.map((p) => ({
              name: p.problem,
              url: absoluteUrl(ROUTES.solveProblem(p.slug)),
            })),
          ),
        ]}
      />
    </div>
  );
}
