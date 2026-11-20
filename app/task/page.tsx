import type { Metadata } from "next";

import { ROUTES } from "@/config/constants";
import { TASK_HUBS, getTaskTools } from "@/config/tasks";
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
 * Tasks index: every job-to-be-done hub on the platform. Each task groups the
 * tools you need to get one thing done (compress files, convert files, create
 * QR codes…) so a visitor can start from intent instead of scanning ~248 tools.
 * Server-rendered, fully static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Tasks", href: "/task" },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Tasks, Get the Job Done with the Right Free Tools",
    description:
      "Start from what you want to do. Each task hub gathers every free tool for one job: compress files, convert formats, edit PDFs, create QR codes and more. No sign-up.",
    canonical: "/task",
  });
}

export default function TasksPage() {
  const items: DiscoveryCardItem[] = TASK_HUBS.map((task) => {
    const count = getTaskTools(task).length;
    return {
      href: `/task/${task.slug}`,
      icon: task.icon,
      accent: task.accent,
      title: task.title,
      description: task.intro,
      meta: count > 0 ? pluralize(count, "tool") : undefined,
    };
  });

  const featured = TASK_HUBS[0];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="ListChecks"
        accent="indigo"
        title="Get the job done"
        description="Start from what you're trying to do, each task gathers every free tool for that one job, so you skip the search and go straight to the right tool."
        longDescription="Compress files, convert formats, edit PDFs, create QR codes, resize images and more. Every tool is free, private and runs in your browser. No sign-up, no watermark."
        badge={{ icon: "ListChecks", label: pluralize(TASK_HUBS.length, "task") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="All tasks"
            description="Pick a job and jump straight to the tools that do it."
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
              title="Not sure where to start?"
              description="Jump into the most common task, or search across every tool on the platform."
              primary={{ label: `${featured.title}`, href: `/task/${featured.slug}` }}
              secondary={{ label: "Browse all tools", href: ROUTES.search }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Tasks",
            description:
              "Job-to-be-done hubs that group every free online tool by the task you want to accomplish.",
            url: "/task",
          }),
          itemListJsonLd(
            TASK_HUBS.map((task) => ({
              name: task.title,
              url: absoluteUrl(`/task/${task.slug}`),
            })),
          ),
        ]}
      />
    </div>
  );
}
