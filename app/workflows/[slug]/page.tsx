import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import type { FaqItem } from "@/types";
import { ROUTES } from "@/config/constants";
import { absoluteUrl, cn, pluralize } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  itemListJsonLd,
} from "@/lib/schema";
import {
  getWorkflowBySlug,
  getWorkflowStepTools,
  getWorkflows,
} from "@/lib/discovery";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * A single workflow micro-site: hero, an ordered VISUAL stepper (each step a
 * numbered node linking to its tool), related workflows and an FAQ. Ships
 * HowTo + ItemList + Breadcrumb + FAQ JSON-LD. Everything derives from
 * `lib/discovery`. Server-rendered, fully static.
 */

interface WorkflowPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getWorkflows().map((workflow) => ({ slug: workflow.slug }));
}

export async function generateMetadata({
  params,
}: WorkflowPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workflow = getWorkflowBySlug(slug);
  if (!workflow) {
    return { title: "Workflow not found", robots: { index: false, follow: false } };
  }
  const count = getWorkflowStepTools(workflow).length;
  return {
    ...buildMetadata({
      title: `${workflow.title}: ${pluralize(count, "Step")}, Free`,
      description: `${workflow.description} A ${pluralize(count, "step")} guided workflow using free tools that run privately in your browser.`,
      canonical: `/workflows/${workflow.slug}`,
    }),
    // P2 audit 2026-08-21: every workflow page carries <60 words of unique
    // text over a tool list another page already has. Noindexed (follow kept)
    // until the pages earn real content; also excluded from the sitemap.
    robots: { index: false, follow: true },
  };
}

function buildFaq(title: string, count: number, firstTool?: string): FaqItem[] {
  return [
    {
      question: `How does the "${title}" workflow work?`,
      answer: `It's a guided, ${pluralize(
        count,
        "step",
      )} recipe: each step links straight to the free tool that does it${firstTool ? `, starting with ${firstTool}` : ""}. Work through them in order and you'll finish the whole job.`,
    },
    {
      question: "Do I have to do every step?",
      answer:
        "No. The steps are an ordered suggestion, not a lock-step process, skip any that don't apply to your files and jump straight to the tool you need.",
    },
    {
      question: "Is it free and private?",
      answer:
        "Yes. Every tool in the workflow is completely free with no sign-up, and each runs entirely in your browser, so your files never leave your device.",
    },
  ];
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { slug } = await params;
  const workflow = getWorkflowBySlug(slug);
  if (!workflow) notFound();

  const steps = getWorkflowStepTools(workflow);

  // Related workflows: the next few in curated order, wrapping around.
  const all = getWorkflows();
  const index = all.findIndex((w) => w.slug === workflow.slug);
  const related = [...all.slice(index + 1), ...all.slice(0, index)]
    .filter((w) => w.slug !== workflow.slug)
    .slice(0, 3);

  const relatedItems: DiscoveryCardItem[] = related.map((w) => ({
    href: `/workflows/${w.slug}`,
    icon: w.icon,
    accent: w.accent,
    title: w.title,
    description: w.description,
    meta: pluralize(w.steps.length, "step"),
  }));

  const first = steps[0];
  const faq = buildFaq(workflow.title, steps.length, first?.tool.title);
  const a = accentStyle(workflow.accent);

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Workflows", href: "/workflows" },
    { label: workflow.title, href: `/workflows/${workflow.slug}` },
  ];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={workflow.icon}
        accent={workflow.accent}
        title={workflow.title}
        description={workflow.description}
        badge={{ icon: "Route", label: pluralize(steps.length, "step") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={`${pluralize(steps.length, "step")} to done`}
            description="Work through them in order, each links straight to the tool."
          />

          <ol className="relative mt-10 flex flex-col gap-4" role="list">
            {steps.map(({ step, tool }, i) => {
              const isLast = i === steps.length - 1;
              return (
                <li key={step.toolSlug} className="relative flex gap-4 sm:gap-6">
                  {/* Numbered node + connecting rail */}
                  <div className="relative flex flex-col items-center">
                    <span
                      className={cn(
                        "z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold tabular-nums ring-1 ring-inset ring-border/50",
                        a.soft,
                      )}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    {!isLast ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-11 h-[calc(100%-1rem)] w-px bg-border"
                      />
                    ) : null}
                  </div>

                  {/* Step card links to its tool */}
                  <Link
                    href={ROUTES.tool(tool.slug)}
                    className="group mb-2 flex flex-1 flex-col gap-1.5 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-transparent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="flex items-start gap-4 sm:items-center">
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/50",
                          a.soft,
                        )}
                        aria-hidden="true"
                      >
                        <Icon name={tool.icon} size={20} />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm text-muted-foreground">{step.label}</span>
                        <span className="flex items-center gap-1.5 font-semibold leading-snug tracking-tight text-foreground">
                          {tool.title}
                          <Icon
                            name="ArrowRight"
                            size={15}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 self-start rounded-full px-3 py-1 text-xs font-medium sm:self-center",
                        a.soft,
                      )}
                    >
                      Open tool
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {relatedItems.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading title="Related workflows" />
            <div className="mt-8">
              <DiscoveryCardGrid items={relatedItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <FAQ items={faq} />
        </Container>
      </section>

      {first ? (
        <section className="pt-2 sm:pt-6">
          <Container>
            <CTA
              title={`Start step 1: ${first.tool.title}`}
              description="Free, private and instant, work through the whole recipe in your browser."
              primary={{ label: `Open ${first.tool.title}`, href: ROUTES.tool(first.tool.slug) }}
              secondary={{ label: "All workflows", href: "/workflows" }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          howToJsonLd({
            name: workflow.title,
            description: workflow.description,
            steps: steps.map(({ step, tool }) => ({
              title: tool.title,
              description: step.label,
            })),
          }),
          ...(steps.length > 0
            ? [
                itemListJsonLd(
                  steps.map(({ tool }) => ({
                    name: tool.title,
                    url: absoluteUrl(ROUTES.tool(tool.slug)),
                  })),
                ),
              ]
            : []),
          faqJsonLd(faq),
        ]}
      />
    </div>
  );
}
