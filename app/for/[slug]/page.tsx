import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { Tool } from "@/types";
import { ROUTES } from "@/config/constants";
import {
  CONTEXT_PAGES,
  getContextBySlug,
  getRelatedContexts,
} from "@/config/contexts";
import { getProblemBySlug } from "@/config/problems";
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
 * A "For [context]" page at `/for/<slug>`, destination-specific transactional
 * landing pages ("Resize an image for Shopify"). The unique value is the exact
 * spec that destination needs (dimensions, size, format) as a real specs table,
 * plus platform tips, then routes to the existing tool. Emits WebPage(speakable)
 * + HowTo + FAQPage + ItemList + SoftwareApplication + Breadcrumb JSON-LD.
 */

interface ForPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return CONTEXT_PAGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: ForPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ctx = getContextBySlug(slug);
  if (!ctx) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: ctx.seoTitle,
    description: ctx.seoDescription,
    keywords: ctx.keywords,
    canonical: ROUTES.forContext(ctx.slug),
  });
}

/* P5 moat check: a spec page older than 180 days gets flagged in the build
   log for re-verification. Runs once per page at export time. */
const STALE_MS = 180 * 24 * 60 * 60 * 1000;
function warnIfStale(slug: string, lastVerified?: string): void {
  if (!lastVerified) return;
  if (Date.now() - Date.parse(lastVerified) > STALE_MS) {
    console.warn(`[for/${slug}] spec last verified ${lastVerified} - over 180 days, re-verify`);
  }
}

export default async function ForPage({ params }: ForPageProps) {
  const { slug } = await params;
  const ctx = getContextBySlug(slug);
  if (!ctx) notFound();

  const tools: Tool[] = ctx.tools
    .map((s) => getToolBySlug(s))
    .filter((t): t is Tool => Boolean(t) && isLiveTool(t as Tool));
  warnIfStale(ctx.slug, ctx.lastVerified);
  const primaryTool = tools.find((t) => t.slug === ctx.primaryTool) ?? tools[0];

  const problems = ctx.relatedProblems
    .map((s) => getProblemBySlug(s))
    .filter((p): p is NonNullable<ReturnType<typeof getProblemBySlug>> => Boolean(p));
  const relatedContexts = getRelatedContexts(ctx);
  const allPosts = await getAllPosts();

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "For…", href: ROUTES.forIndex },
    { label: ctx.destination, href: ROUTES.forContext(ctx.slug) },
  ];

  const problemItems: DiscoveryCardItem[] = problems.map((p) => ({
    href: ROUTES.solveProblem(p.slug),
    icon: p.icon,
    accent: p.accent,
    title: p.problem,
    description: p.intro,
  }));

  const contextItems: DiscoveryCardItem[] = relatedContexts.map((c) => ({
    href: ROUTES.forContext(c.slug),
    icon: c.icon,
    accent: c.accent,
    title: c.h1,
    description: c.intro,
  }));

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={ctx.icon}
        accent={ctx.accent}
        title={ctx.h1}
        description={ctx.intro}
        badge={{ icon: "Wrench", label: pluralize(tools.length, "tool") }}
      />

      {/* Answer-first - leads with the key spec. Speakable. */}
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
            <p className="mt-3 text-base leading-relaxed text-foreground">{ctx.answer}</p>
          </div>

          {/* Specs table - the unique, snippet-worthy value. */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">{`${ctx.destination} image requirements`}</caption>
              <tbody>
                {ctx.specs.map((spec, i) => (
                  <tr key={spec.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <th scope="row" className="w-1/2 px-4 py-3 text-left font-medium text-foreground">
                      {spec.label}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{spec.value}</td>
                  </tr>
                ))}
                {ctx.lastVerified ? (
                  <tr className={ctx.specs.length % 2 === 0 ? "bg-muted/30" : ""}>
                    <th scope="row" className="w-1/2 px-4 py-3 text-left font-medium text-foreground">
                      Last verified
                    </th>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {ctx.lastVerified}
                      {ctx.officialSource ? (
                        <>
                          {" · against "}
                          <a
                            href={ctx.officialSource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans underline underline-offset-2 hover:text-foreground"
                          >
                            {ctx.officialSource.label}
                          </a>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Tools. */}
      <section className="py-2 sm:py-6">
        <Container>
          <SectionHeading
            title={`${pluralize(tools.length, "tool")} for this`}
            description="Free, private and in your browser. No sign-up, no watermark."
          />
          <div className="mt-8">
            <ToolGrid tools={tools} columns={4} />
          </div>
        </Container>
      </section>

      {/* Steps. */}
      <section id="steps" className="scroll-mt-24 py-10 sm:py-14">
        <Container size="narrow">
          <SectionHeading title="How to do it" />
          <ol className="mt-8 space-y-5">
            {ctx.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Platform tips. */}
      {ctx.tips.length > 0 ? (
        <section className="py-2 sm:py-6">
          <Container size="narrow">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon name="Lightbulb" size={18} className="text-primary" />
                <span>{`${ctx.destination} tips`}</span>
              </div>
              <ul className="mt-4 space-y-3">
                {ctx.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <Icon name="Check" size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>{tip}</span>
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
          <FAQ items={ctx.faq} />
        </Container>
      </section>

      {/* Related problems. */}
      {problemItems.length > 0 ? (
        <section className="py-2 sm:py-6">
          <Container>
            <SectionHeading title="Problems we solve" />
            <div className="mt-8">
              <DiscoveryCardGrid items={problemItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Related contexts. */}
      {contextItems.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading title="Resize for other platforms" />
            <div className="mt-8">
              <DiscoveryCardGrid items={contextItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Shared internal-link web. */}
      <section className="py-2 sm:py-6">
        <Container>
          <RelatedWeb input={{ kind: "hub", title: ctx.h1, tags: ctx.keywords, allPosts }} />
        </Container>
      </section>

      {primaryTool ? (
        <section className="pt-6 sm:pt-10">
          <Container>
            <CTA
              title={`Start with ${primaryTool.title}`}
              description="Free, private and instant: everything runs in your browser."
              primary={{
                label: `Try ${primaryTool.title}`,
                href:
                  ROUTES.tool(primaryTool.slug) +
                  (ctx.preset
                    ? `?${new URLSearchParams(
                        Object.fromEntries(
                          Object.entries(ctx.preset).map(([k, v]) => [k, String(v)]),
                        ),
                      ).toString()}`
                    : ""),
              }}
              secondary={{ label: "All destinations", href: ROUTES.forIndex }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          webPageJsonLd({
            name: ctx.h1,
            description: ctx.seoDescription,
            url: ROUTES.forContext(ctx.slug),
            speakableSelectors: ["#answer"],
          }),
          howToJsonLd({ name: ctx.h1, description: ctx.intro, steps: ctx.steps }),
          faqJsonLd(ctx.faq),
          ...(tools.length > 0
            ? [itemListJsonLd(tools.map((t) => ({ name: t.title, url: absoluteUrl(ROUTES.tool(t.slug)) })))]
            : []),
          ...(primaryTool ? [softwareApplicationJsonLd(primaryTool)] : []),
        ]}
      />
    </div>
  );
}
