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
  getCollectionBySlug,
  getCollectionTools,
  getCollections,
} from "@/lib/discovery";
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

/**
 * A single collection micro-site: hero, intro, curated tool grid, related
 * collections, FAQ. Everything derives from `lib/discovery`, so adding or
 * re-curating a collection updates this page automatically. Fully static.
 */

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getCollections().map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) {
    return { title: "Collection not found", robots: { index: false, follow: false } };
  }
  const count = getCollectionTools(collection).length;
  const meta = buildMetadata({
    title: `${collection.title}: ${pluralize(count, "Free Tool")}`,
    description: `${collection.description} ${count} hand-picked free tools, all running privately in your browser.`,
    canonical: `/collections/${collection.slug}`,
  });
  return collection.noindex ? { ...meta, robots: { index: false, follow: true } } : meta;
}

/** Build a small, on-topic FAQ so every collection page ships FAQ + JSON-LD. */
function buildFaq(title: string, count: number, firstTool?: string): FaqItem[] {
  return [
    {
      question: `What is the ${title} collection?`,
      answer: `It's a hand-picked set of ${pluralize(
        count,
        "free tool",
      )} chosen to cover exactly what this workflow needs, so you can start with the right tool${firstTool ? ` (like ${firstTool})` : ""} instead of searching the whole library.`,
    },
    {
      question: "Are these tools free to use?",
      answer:
        "Yes. Every tool in this collection is completely free. No account, no trial and no usage cap. Nothing is watermarked or locked behind a paywall.",
    },
    {
      question: "Is my data private?",
      answer:
        "It is. These tools run entirely in your browser, so the files and text you work with are processed on your own device and never uploaded, logged or stored.",
    },
  ];
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const tools = getCollectionTools(collection);

  // Related collections: the next few in curated order, wrapping around.
  const all = getCollections();
  const index = all.findIndex((c) => c.slug === collection.slug);
  const related = [...all.slice(index + 1), ...all.slice(0, index)]
    .filter((c) => c.slug !== collection.slug)
    .slice(0, 3);

  const relatedItems: DiscoveryCardItem[] = related.map((c) => ({
    href: `/collections/${c.slug}`,
    icon: c.icon,
    accent: c.accent,
    title: c.title,
    description: c.description,
    meta: pluralize(getCollectionTools(c).length, "tool"),
  }));

  const firstTool = tools[0];
  const faq = buildFaq(collection.title, tools.length, firstTool?.title);

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "Collections", href: "/collections" },
    { label: collection.title, href: `/collections/${collection.slug}` },
  ];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={collection.icon}
        accent={collection.accent}
        title={collection.title}
        description={collection.description}
        badge={{ icon: "LayoutGrid", label: pluralize(tools.length, "tool") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={`${pluralize(tools.length, "tool")} for the job`}
            description="Hand-picked and ready. Open any tool to get started."
          />
          <div className="mt-8">
            <ToolGrid
              tools={tools}
              columns={4}
              emptyMessage="This collection is being curated. Check back soon."
            />
          </div>
        </Container>
      </section>

      {relatedItems.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading title="Related collections" />
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

      {firstTool ? (
        <section className="pt-2 sm:pt-6">
          <Container>
            <CTA
              title={`Start with ${firstTool.title}`}
              description="Free, private and instant: everything runs in your browser."
              primary={{ label: `Try ${firstTool.title}`, href: ROUTES.tool(firstTool.slug) }}
              secondary={{ label: "All collections", href: "/collections" }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          collectionPageJsonLd({
            name: collection.title,
            description: collection.description,
            url: `/collections/${collection.slug}`,
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
