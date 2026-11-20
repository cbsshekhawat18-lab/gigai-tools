import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import type { Tool } from "@/types";
import { ROUTES } from "@/config/constants";
import {
  PROBLEMS,
  getProblemBySlug,
  getRelatedProblems,
} from "@/config/problems";
import { getToolBySlug, isLiveTool } from "@/lib/registry";
import { absoluteUrl, pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  itemListJsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from "@/lib/schema";
import { Icon } from "@/lib/icons";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolGrid } from "@/components/shared/tool-grid";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";
import { RelatedWeb } from "@/components/shared/related-web";

/**
 * A single Problem/Solution page at `/solve/<slug>`, the USER-INTENT layer.
 * Titled in the visitor's own words ("My PDF is too large"), it answers the
 * problem first (speakable / snippet-optimised), then routes to the EXISTING
 * tools that solve it: a primary-tool CTA, the full tool set, a step-by-step
 * HowTo, honest common mistakes, an FAQ, related problems and the shared
 * internal-link web. Emits WebPage(speakable) + HowTo + FAQPage + ItemList +
 * SoftwareApplication + Breadcrumb JSON-LD. Config-driven, fully static.
 */

interface SolvePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return PROBLEMS.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({ params }: SolvePageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);
  if (!problem) {
    return { title: "Problem not found", robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: problem.seoTitle,
    description: problem.seoDescription,
    keywords: problem.keywords,
    canonical: ROUTES.solveProblem(problem.slug),
  });
}

export default async function SolvePage({ params }: SolvePageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);
  if (!problem) notFound();

  // Resolve the problem's tool slugs to live Tool objects (drop any missing).
  const tools: Tool[] = problem.tools
    .map((s) => getToolBySlug(s))
    .filter((t): t is Tool => Boolean(t) && isLiveTool(t as Tool));

  const primaryTool =
    tools.find((t) => t.slug === problem.primaryTool) ?? tools[0];

  const relatedProblems = getRelatedProblems(problem);
  const allPosts = await getAllPosts();

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Solve a problem", href: ROUTES.solve },
    { label: problem.label, href: ROUTES.solveProblem(problem.slug) },
  ];

  const relatedItems: DiscoveryCardItem[] = relatedProblems.map((p) => ({
    href: ROUTES.solveProblem(p.slug),
    icon: p.icon,
    accent: p.accent,
    title: p.problem,
    description: p.intro,
  }));

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={problem.icon}
        accent={problem.accent}
        eyebrow="Problem → solution"
        title={problem.problem}
        description={problem.intro}
        badge={{ icon: "Wrench", label: pluralize(tools.length, "tool") }}
      />

      {/* Answer-first block - direct fix in the first sentence, speakable. */}
      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <div
            id="answer"
            className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon name="Sparkles" size={16} />
              <span>The quick answer</span>
            </div>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {problem.answer}
            </p>
            {primaryTool ? (
              <div className="mt-5">
                <Link
                  href={ROUTES.tool(primaryTool.slug)}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  <Icon name={primaryTool.icon} size={16} />
                  {`Open ${primaryTool.title}`}
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {/* Tools that solve this problem. */}
      <section className="py-2 sm:py-6">
        <Container>
          <SectionHeading
            title={`${pluralize(tools.length, "tool")} for this`}
            description="Each one is free, private and runs in your browser. No sign-up, no watermark."
          />
          <div className="mt-8">
            <ToolGrid
              tools={tools}
              columns={4}
              emptyMessage="Tools for this problem are on the way. Check back soon."
            />
          </div>
        </Container>
      </section>

      {/* Step-by-step guide. */}
      <section id="steps" className="scroll-mt-24 py-10 sm:py-14">
        <Container size="narrow">
          <SectionHeading
            title={`How to fix it`}
            description="Follow these steps and you'll have it sorted in a couple of minutes."
          />
          <ol className="mt-8 space-y-5">
            {problem.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Common mistakes - honest "watch out for" list. */}
      {problem.mistakes.length > 0 ? (
        <section id="mistakes" className="scroll-mt-24 py-2 sm:py-6">
          <Container size="narrow">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon name="TriangleAlert" size={18} className="text-amber-500" />
                <span>Common mistakes to avoid</span>
              </div>
              <ul className="mt-4 space-y-3">
                {problem.mistakes.map((m) => (
                  <li key={m} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <Icon name="Dot" size={18} className="mt-0.5 shrink-0 text-amber-500" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      ) : null}

      {/* FAQ. */}
      <section id="faq" className="scroll-mt-24 py-10 sm:py-14">
        <Container size="narrow">
          <FAQ items={problem.faq} />
        </Container>
      </section>

      {/* Related problems. */}
      {relatedItems.length > 0 ? (
        <section className="py-2 sm:py-6">
          <Container>
            <SectionHeading
              title="More problems we solve"
              description="Ran into one of these too? Here's the fix."
            />
            <div className="mt-8">
              <DiscoveryCardGrid items={relatedItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Shared internal-link web. */}
      <section className="py-10 sm:py-14">
        <Container>
          <RelatedWeb
            input={{
              kind: "hub",
              title: problem.label,
              tags: problem.tags,
              fileTypes: problem.fileTypes,
              excludeProblems: [problem.slug, ...problem.related],
              allPosts,
            }}
          />
        </Container>
      </section>

      {primaryTool ? (
        <section className="pt-2 sm:pt-6">
          <Container>
            <CTA
              title={`Ready? Start with ${primaryTool.title}`}
              description="Free, private and instant: everything runs in your browser."
              primary={{ label: `Try ${primaryTool.title}`, href: ROUTES.tool(primaryTool.slug) }}
              secondary={{ label: "All problems", href: ROUTES.solve }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          webPageJsonLd({
            name: problem.problem,
            description: problem.seoDescription,
            url: ROUTES.solveProblem(problem.slug),
            speakableSelectors: ["#answer"],
          }),
          howToJsonLd({
            name: `How to fix: ${problem.problem}`,
            description: problem.intro,
            steps: problem.steps,
          }),
          faqJsonLd(problem.faq),
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
          ...(primaryTool ? [softwareApplicationJsonLd(primaryTool)] : []),
        ]}
      />
    </div>
  );
}
