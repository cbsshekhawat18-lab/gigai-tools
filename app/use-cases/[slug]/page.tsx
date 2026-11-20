import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { FaqItem } from "@/types";
import { ROUTES } from "@/config/constants";
import { absoluteUrl, pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqJsonLd,
  itemListJsonLd,
} from "@/lib/schema";
import {
  getUseCaseBySlug,
  getUseCaseTools,
  getUseCases,
} from "@/lib/discovery";
import { getAllPosts } from "@/lib/blog";
import { getRelatedWeb } from "@/lib/seo/related-web";
import { Container } from "@/components/shared/container";
import { RelatedWeb } from "@/components/shared/related-web";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolGrid } from "@/components/shared/tool-grid";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * A single use-case micro-site: hero, curated toolkit grid, "how they fit"
 * guidance, other audiences, FAQ. Derived from `lib/discovery`. Fully static.
 */

interface UseCasePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getUseCases().map((useCase) => ({ slug: useCase.slug }));
}

export async function generateMetadata({
  params,
}: UseCasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);
  if (!useCase) {
    return { title: "Use case not found", robots: { index: false, follow: false } };
  }
  const count = getUseCaseTools(useCase).length;
  return buildMetadata({
    title: `${useCase.title}, ${pluralize(count, "Free Tool")}`,
    description: `${useCase.description} A curated set of ${count} free, private tools that run in your browser. No sign-up.`,
    canonical: `/use-cases/${useCase.slug}`,
  });
}

function buildFaq(title: string, count: number): FaqItem[] {
  return [
    {
      question: `What tools are in the ${title} toolkit?`,
      answer: `It's a curated set of ${pluralize(
        count,
        "free tool",
      )} chosen for this audience's most common tasks: grouped so you can move through a job from start to finish without hunting for the next tool.`,
    },
    {
      question: "Do I need an account or to pay?",
      answer:
        "No. Every tool here is free with no sign-up, no trial and no usage limit. Nothing is watermarked or gated.",
    },
    {
      question: "Are my files safe?",
      answer:
        "Yes: these tools process everything locally in your browser, so your files and text never leave your device.",
    },
  ];
}

export default async function UseCasePage({ params }: UseCasePageProps) {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);
  if (!useCase) notFound();

  const tools = getUseCaseTools(useCase);

  const all = getUseCases();
  const index = all.findIndex((u) => u.slug === useCase.slug);
  const related = [...all.slice(index + 1), ...all.slice(0, index)]
    .filter((u) => u.slug !== useCase.slug)
    .slice(0, 3);

  const relatedItems: DiscoveryCardItem[] = related.map((u) => ({
    href: `/use-cases/${u.slug}`,
    icon: u.icon,
    accent: u.accent,
    title: u.title,
    description: u.description,
    meta: pluralize(getUseCaseTools(u).length, "tool"),
  }));

  const firstTool = tools[0];
  const faq = buildFaq(useCase.title, tools.length);

  // Slim internal-linking web for this audience hub, seed matching with the
  // title, audience and the categories its curated tools span.
  const relatedWeb = getRelatedWeb({
    kind: "hub",
    title: useCase.title,
    tags: [useCase.audience, ...new Set(tools.map((t) => t.category))],
    allPosts: await getAllPosts(),
  });

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Use Cases", href: "/use-cases" },
    { label: useCase.title, href: `/use-cases/${useCase.slug}` },
  ];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={useCase.icon}
        accent={useCase.accent}
        title={useCase.title}
        description={useCase.description}
        badge={{ icon: "Wrench", label: pluralize(tools.length, "tool") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={`${pluralize(tools.length, "tool")}, hand-picked`}
            description="Everything this workflow needs, in one place."
          />
          <div className="mt-8">
            <ToolGrid
              tools={tools}
              columns={4}
              emptyMessage="This toolkit is being curated. Check back soon."
            />
          </div>
        </Container>
      </section>

      {relatedItems.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading title="Other use cases" />
            <div className="mt-8">
              <DiscoveryCardGrid items={relatedItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── Related web (slim internal-linking bundle) ───────────────────── */}
      <section className="py-10 sm:py-14">
        <Container>
          <RelatedWeb bundle={relatedWeb} title="Keep exploring" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <FAQ items={faq} />
        </Container>
      </section>

      {firstTool ? (
        <section className="pt-2 sm:pt-6">
          <Container>
            <CTA
              title={`Get started with ${firstTool.title}`}
              description="Free, private and instant: everything runs in your browser."
              primary={{ label: `Try ${firstTool.title}`, href: ROUTES.tool(firstTool.slug) }}
              secondary={{ label: "All use cases", href: "/use-cases" }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          collectionPageJsonLd({
            name: useCase.title,
            description: useCase.description,
            url: `/use-cases/${useCase.slug}`,
          }),
          faqJsonLd(faq),
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
