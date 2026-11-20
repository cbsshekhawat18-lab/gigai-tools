import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { CONTEXT_PAGES, getContextsByGroup } from "@/config/contexts";
import { absoluteUrl } from "@/lib/utils";
import { Icon } from "@/lib/icons";
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
 * "For…" index at `/for`, destination-specific landing pages grouped by where
 * the image is going (social, e-commerce, messaging, web). Each gives the exact
 * spec that platform needs and the tool to hit it. Server-rendered, static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "For…", href: ROUTES.forIndex },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Image Sizes for Every Platform, Free Resize & Compress Tools",
    description:
      "The exact image size for Shopify, LinkedIn, Amazon, WhatsApp, WordPress and more, with free tools to crop, resize and compress to fit. Private, in your browser.",
    keywords: [
      "image size for",
      "social media image sizes",
      "product image size",
      "resize image for platform",
      "image dimensions guide",
    ],
    canonical: ROUTES.forIndex,
  });
}

export default function ForIndexPage() {
  const groups = getContextsByGroup();

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="Scaling"
        accent="violet"
        title="The right image size for every platform"
        description="Where's your image going? Get the exact size that platform needs, and the free tool to hit it in one step."
        longDescription="Shopify, LinkedIn, Amazon, WhatsApp, WordPress and more each want specific dimensions, formats and file sizes. Pick your destination for the exact spec plus the tools to crop, resize and compress to fit."
        badge={{ icon: "Scaling", label: `${CONTEXT_PAGES.length} destinations` }}
      />

      <section className="pt-8">
        <Container>
          <Link
            href="/image-size-cheat-sheet"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-r from-muted/50 to-transparent p-5 transition-colors hover:border-foreground/20"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="Table" size={20} />
              </span>
              <span>
                <span className="block font-semibold text-foreground">Image Size Cheat Sheet</span>
                <span className="block text-sm text-muted-foreground">
                  Every platform&rsquo;s sizes in one scannable table.
                </span>
              </span>
            </span>
            <Icon
              name="ArrowRight"
              size={18}
              className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Container>
      </section>

      {groups.map((group) => {
        const items: DiscoveryCardItem[] = group.contexts.map((c) => ({
          href: ROUTES.forContext(c.slug),
          icon: c.icon,
          accent: c.accent,
          title: c.h1,
          description: c.intro,
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
            title="Not sure of the size?"
            description="Start from your problem, or browse every free image tool on the platform."
            primary={{ label: "Solve a problem", href: ROUTES.solve }}
            secondary={{ label: "All tools", href: ROUTES.search }}
          />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Image sizes for every platform",
            description:
              "Destination-specific guides to the exact image size each platform needs, with the tools to fit.",
            url: ROUTES.forIndex,
          }),
          itemListJsonLd(
            CONTEXT_PAGES.map((c) => ({
              name: c.h1,
              url: absoluteUrl(ROUTES.forContext(c.slug)),
            })),
          ),
        ]}
      />
    </div>
  );
}
