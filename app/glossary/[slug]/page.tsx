import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import type { Tool } from "@/types";
import { ROUTES } from "@/config/constants";
import {
  GLOSSARY,
  getGlossaryTerm,
  getRelatedGlossaryTerms,
} from "@/config/glossary";
import { getProblemBySlug } from "@/config/problems";
import { getToolBySlug, isLiveTool } from "@/lib/registry";
import { absoluteUrl } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";
import {
  JsonLd,
  breadcrumbJsonLd,
  definedTermJsonLd,
  faqJsonLd,
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
 * A single glossary entry at `/glossary/<slug>`: the DEFINITIONAL layer. Answers
 * "What is X?" first (speakable / snippet-optimised), explains why it matters,
 * then routes to the tools and problems it relates to. Emits DefinedTerm +
 * WebPage(speakable) + FAQPage + Breadcrumb JSON-LD. Config-driven, static.
 */

interface GlossaryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return GLOSSARY.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: GlossaryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) {
    return { title: "Term not found", robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: `What is ${term.term}? Definition, Uses & Tools`,
    description: term.definition,
    keywords: term.keywords,
    canonical: ROUTES.glossaryTerm(term.slug),
  });
}

export default async function GlossaryPage({ params }: GlossaryPageProps) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const tools: Tool[] = term.relatedTools
    .map((s) => getToolBySlug(s))
    .filter((t): t is Tool => Boolean(t) && isLiveTool(t as Tool));

  const problems = term.relatedProblems
    .map((s) => getProblemBySlug(s))
    .filter((p): p is NonNullable<ReturnType<typeof getProblemBySlug>> => Boolean(p));

  const relatedTerms = getRelatedGlossaryTerms(term);
  const allPosts = await getAllPosts();

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Glossary", href: ROUTES.glossary },
    { label: term.term, href: ROUTES.glossaryTerm(term.slug) },
  ];

  const problemItems: DiscoveryCardItem[] = problems.map((p) => ({
    href: ROUTES.solveProblem(p.slug),
    icon: p.icon,
    accent: p.accent,
    title: p.problem,
    description: p.intro,
  }));

  const termItems: DiscoveryCardItem[] = relatedTerms.map((t) => ({
    href: ROUTES.glossaryTerm(t.slug),
    icon: t.icon,
    accent: "sky",
    title: t.term,
    description: t.definition,
  }));

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={term.icon}
        accent="sky"
        title={`What is ${term.term}?`}
        description={term.label ? `Also known as ${term.term}.` : `A plain-English definition, and the tools that work with it.`}
        badge={{ icon: "BookOpen", label: "Definition" }}
      />

      {/* Answer-first definition - speakable / featured-snippet target. */}
      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <div
            id="answer"
            className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-transparent p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon name="BookOpen" size={16} />
              <span>Definition</span>
            </div>
            <p className="mt-3 text-base leading-relaxed text-foreground">{term.definition}</p>
          </div>

          {term.points.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {term.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Icon name="Check" size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      {/* Tools that work with this term. */}
      {tools.length > 0 ? (
        <section className="py-2 sm:py-6">
          <Container>
            <SectionHeading
              title={`Tools for ${term.term}`}
              description="Free, private and in your browser. No sign-up."
            />
            <div className="mt-8">
              <ToolGrid tools={tools} columns={4} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Related problems. */}
      {problemItems.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading
              title={`${term.term} problems we solve`}
              description="Hit one of these? Here's the fix."
            />
            <div className="mt-8">
              <DiscoveryCardGrid items={problemItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* FAQ. */}
      {term.faq && term.faq.length > 0 ? (
        <section id="faq" className="scroll-mt-24 py-2 sm:py-6">
          <Container size="narrow">
            <FAQ items={term.faq} />
          </Container>
        </section>
      ) : null}

      {/* Related terms. */}
      {termItems.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading title="Related terms" />
            <div className="mt-8">
              <DiscoveryCardGrid items={termItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Shared internal-link web. */}
      <section className="py-2 sm:py-6">
        <Container>
          <RelatedWeb
            input={{
              kind: "hub",
              title: term.term,
              tags: term.keywords,
              excludeGlossary: [term.slug],
              allPosts,
            }}
          />
        </Container>
      </section>

      <section className="pt-6 sm:pt-10">
        <Container>
          <CTA
            title={tools[0] ? `Try ${tools[0].title}` : "Browse the glossary"}
            description="Free, private and instant. Everything runs in your browser."
            primary={
              tools[0]
                ? { label: `Open ${tools[0].title}`, href: ROUTES.tool(tools[0].slug) }
                : { label: "All definitions", href: ROUTES.glossary }
            }
            secondary={{ label: "All definitions", href: ROUTES.glossary }}
          />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          definedTermJsonLd({
            name: term.term,
            description: term.definition,
            url: ROUTES.glossaryTerm(term.slug),
            termSetUrl: ROUTES.glossary,
          }),
          webPageJsonLd({
            name: `What is ${term.term}?`,
            description: term.definition,
            url: ROUTES.glossaryTerm(term.slug),
            speakableSelectors: ["#answer"],
          }),
          ...(term.faq && term.faq.length > 0 ? [faqJsonLd(term.faq)] : []),
        ]}
      />
    </div>
  );
}
