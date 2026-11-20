import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { TASK_HUBS, getTaskBySlug, getTaskTools } from "@/config/tasks";
import { absoluteUrl, pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqJsonLd,
  itemListJsonLd,
} from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolGrid } from "@/components/shared/tool-grid";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import { RelatedWeb } from "@/components/shared/related-web";

/**
 * A single Task Hub at `/task/<slug>`: a job-to-be-done landing page that
 * aggregates every live tool for one task (e.g. "Compress Files"). Renders a
 * hero, an AI-answer block, the matched tools as a grid, an FAQ and the shared
 * <RelatedWeb> internal-link web. Emits CollectionPage + ItemList + FAQPage +
 * Breadcrumb JSON-LD. Config-driven (config/tasks.ts) and fully static.
 */

interface TaskPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return TASK_HUBS.map((task) => ({ slug: task.slug }));
}

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
  const { slug } = await params;
  const task = getTaskBySlug(slug);
  if (!task) {
    return { title: "Task not found", robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: task.seoTitle,
    description: task.seoDescription,
    keywords: task.keywords,
    canonical: `/task/${task.slug}`,
  });
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { slug } = await params;
  const task = getTaskBySlug(slug);
  if (!task) notFound();

  const tools = getTaskTools(task);
  const allPosts = await getAllPosts();

  const firstTool = tools[0];

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Tasks", href: "/task" },
    { label: task.title, href: `/task/${task.slug}` },
  ];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={task.icon}
        accent={task.accent}
        title={task.h1}
        description={task.intro}
        badge={{ icon: "Wrench", label: pluralize(tools.length, "tool") }}
      />

      {/* AI-answer block - a direct, entity-rich answer for the task intent. */}
      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <div className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {`How to ${task.title.toLowerCase()}`}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {task.answer}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-2 sm:py-6">
        <Container>
          <SectionHeading
            title={`${pluralize(tools.length, "tool")} for this task`}
            description="Every one is free, private and runs in your browser. No sign-up."
          />
          <div className="mt-8">
            <ToolGrid
              tools={tools}
              columns={4}
              emptyMessage="Tools for this task are on the way: check back soon."
            />
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <FAQ items={task.faq} />
        </Container>
      </section>

      <section className="py-2 sm:py-6">
        <Container>
          <RelatedWeb
            input={{
              kind: "hub",
              title: task.title,
              category: task.categories?.[0],
              tags: task.match,
              allPosts,
            }}
          />
        </Container>
      </section>

      {firstTool ? (
        <section className="pt-6 sm:pt-10">
          <Container>
            <CTA
              title={`Start with ${firstTool.title}`}
              description="Free, private and instant: everything runs in your browser."
              primary={{ label: `Try ${firstTool.title}`, href: ROUTES.tool(firstTool.slug) }}
              secondary={{ label: "All tasks", href: "/task" }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          collectionPageJsonLd({
            name: task.h1,
            description: task.seoDescription,
            url: `/task/${task.slug}`,
          }),
          faqJsonLd(task.faq),
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
