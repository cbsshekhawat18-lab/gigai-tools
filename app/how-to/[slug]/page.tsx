import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/constants";
import { pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  webPageJsonLd,
} from "@/lib/schema";
import {
  getAllHowToSlugs,
  getHowToBySlug,
  getHowToRelatedTools,
  getHowToTool,
  getRelatedHowTos,
} from "@/lib/content";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";
import { RelatedTools } from "@/components/shared/related-tools";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";
import { HowToSteps } from "@/components/content/howto-steps";
import { ContentCta } from "@/components/content/content-cta";

/**
 * A single how-to guide micro-site: hero, intro, an embedded CTA to the tool,
 * numbered steps, tips, related tools + guides, and FAQ. Emits HowTo + FAQPage +
 * BreadcrumbList JSON-LD. Fully static; derives entirely from the how-to
 * registry.
 */

interface HowToPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getAllHowToSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: HowToPageProps): Promise<Metadata> {
  const { slug } = await params;
  const howto = getHowToBySlug(slug);
  if (!howto) {
    return { title: "Guide not found", robots: { index: false, follow: false } };
  }
  const seo = howto.seo ?? {};
  return buildMetadata({
    title: seo.title ?? howto.title,
    description: seo.description ?? howto.description,
    keywords: seo.keywords,
    ogImage: seo.ogImage,
    canonical: seo.canonical ?? ROUTES.howTo(howto.slug),
    type: seo.type ?? "article",
  });
}

export default async function HowToPage({ params }: HowToPageProps) {
  const { slug } = await params;
  const howto = getHowToBySlug(slug);
  if (!howto) notFound();

  const accent = howto.accent ?? "emerald";
  const tool = getHowToTool(howto);
  const relatedTools = getHowToRelatedTools(howto);
  const relatedGuides = getRelatedHowTos(howto);
  const tipStyle = accentStyle(accent);

  const relatedItems: DiscoveryCardItem[] = relatedGuides.map((g) => ({
    href: ROUTES.howTo(g.slug),
    icon: g.icon ?? "ListChecks",
    accent: g.accent ?? "emerald",
    title: g.title,
    description: g.description,
    meta: pluralize(g.steps.length, "step"),
  }));

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "How-to guides", href: ROUTES.howToIndex },
    { label: howto.title, href: ROUTES.howTo(howto.slug) },
  ];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={howto.icon ?? "ListChecks"}
        accent={accent}
        title={howto.title}
        description={howto.description}
        badge={{ icon: "ListChecks", label: pluralize(howto.steps.length, "step") }}
      />

      {/* Intro */}
      <section className="py-12 sm:py-16">
        <Container size="narrow">
          <div className="space-y-4 text-pretty text-base leading-relaxed text-muted-foreground">
            {howto.intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* Embedded CTA to the tool this guide teaches */}
      {tool ? (
        <section className="pb-12 sm:pb-16">
          <Container size="narrow">
            <ContentCta
              tool={tool}
              heading={`This guide uses ${tool.title}`}
              description="Free, private and instant. Open it now and follow along with the steps below."
            />
          </Container>
        </section>
      ) : null}

      {/* Numbered steps */}
      <section className="pb-12 sm:pb-16">
        <Container size="narrow">
          <SectionHeading title="Follow these steps" />
          <div className="mt-8">
            <HowToSteps steps={howto.steps} accent={accent} />
          </div>
        </Container>
      </section>

      {/* Tips */}
      {howto.tips.length > 0 ? (
        <section className="pb-12 sm:pb-16">
          <Container size="narrow">
            <SectionHeading title="Tips & best practices" />
            <ul className="mt-8 space-y-3">
              {howto.tips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-[0.9375rem] leading-relaxed text-muted-foreground shadow-sm"
                >
                  <Icon
                    name="Lightbulb"
                    size={18}
                    className={`mt-0.5 shrink-0 ${tipStyle.text}`}
                  />
                  <span className="text-pretty">{tip}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Related tools */}
      {relatedTools.length > 0 ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <RelatedTools tools={relatedTools} title="Related tools" />
          </Container>
        </section>
      ) : null}

      {/* Related guides */}
      {relatedItems.length > 0 ? (
        <section className="pb-12 sm:pb-16">
          <Container>
            <SectionHeading title="Related how-to guides" />
            <div className="mt-8">
              <DiscoveryCardGrid items={relatedItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* FAQ */}
      <section className="pb-4">
        <Container size="narrow">
          <FAQ items={howto.faq} />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          webPageJsonLd({
            name: howto.title,
            description: howto.description,
            url: ROUTES.howTo(howto.slug),
          }),
          howToJsonLd({
            name: howto.title,
            description: howto.description,
            steps: howto.steps.map((s) => ({ title: s.title, description: s.body })),
          }),
          faqJsonLd(howto.faq),
        ]}
      />
    </div>
  );
}
