import type { Metadata } from "next";

import { ROUTES } from "@/config/constants";
import { GLOSSARY, getGlossaryByGroup } from "@/config/glossary";
import { absoluteUrl } from "@/lib/utils";
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
 * Glossary index at `/glossary`, the definitional layer's front door. Groups
 * every "what is X" term so a visitor can learn the concept behind any tool.
 * Emits CollectionPage + ItemList + Breadcrumb JSON-LD. Server-rendered, static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Glossary", href: ROUTES.glossary },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Glossary, Plain-English Definitions of File & Web Terms",
    description:
      "What is a PDF, WebP, SVG, OCR, bitrate or favicon? Clear, jargon-free definitions of the file, image, audio, video and web terms behind every tool, with the tools to match.",
    keywords: [
      "file format glossary",
      "what is",
      "tech definitions",
      "image format meaning",
      "web terms explained",
    ],
    canonical: ROUTES.glossary,
  });
}

export default function GlossaryIndexPage() {
  const groups = getGlossaryByGroup();

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="BookOpen"
        accent="sky"
        title="Glossary"
        description="Plain-English definitions of the file, image, audio, video and web terms behind every tool. No jargon."
        longDescription="Ever wondered what WebP, OCR, bitrate or a favicon actually is? Each entry gives a clear definition, why it matters, and the free tools that work with it."
        badge={{ icon: "BookOpen", label: `${GLOSSARY.length} terms` }}
      />

      {groups.map((group) => {
        const items: DiscoveryCardItem[] = group.terms.map((t) => ({
          href: ROUTES.glossaryTerm(t.slug),
          icon: t.icon,
          accent: "sky",
          title: t.term,
          description: t.definition,
        }));
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
            title="Know the term? Get it done."
            description="Jump straight to a tool, or start from the problem you're trying to solve."
            primary={{ label: "Browse all tools", href: ROUTES.search }}
            secondary={{ label: "Solve a problem", href: ROUTES.solve }}
          />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Glossary",
            description:
              "Plain-English definitions of the file, image, audio, video and web terms behind every tool.",
            url: ROUTES.glossary,
          }),
          itemListJsonLd(
            GLOSSARY.map((t) => ({
              name: `What is ${t.term}?`,
              url: absoluteUrl(ROUTES.glossaryTerm(t.slug)),
            })),
          ),
        ]}
      />
    </div>
  );
}
