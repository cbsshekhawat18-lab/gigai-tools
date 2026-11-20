import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/config/constants";
import { CONTEXT_PAGES, getContextsByGroup } from "@/config/contexts";
import { absoluteUrl } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  webPageJsonLd,
} from "@/lib/schema";
import { Icon } from "@/lib/icons";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";

/**
 * Image Size Cheat Sheet at `/image-size-cheat-sheet`, a single, comprehensive
 * reference table of every platform image size the site covers, each linking to
 * its full /for guide. A scannable, quotable, linkable asset (a different format
 * from the card-based /for index) that targets "image size cheat sheet" and
 * "all social media image sizes" queries. Server-rendered, static.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Image sizes", href: ROUTES.forIndex },
  { label: "Cheat sheet", href: "/image-size-cheat-sheet" },
];

const FAQ = [
  {
    question: "What is the most common social media image size?",
    answer:
      "1080×1080px (a square) works across most feeds, and 1080×1920px (9:16) is the standard for stories and reels. Beyond that, each platform has its own recommended sizes for profiles, banners and posts, listed in full above.",
  },
  {
    question: "What size is best for a shared link preview?",
    answer:
      "1200×630px (1.91:1) is the Open Graph standard used by Facebook, LinkedIn and most platforms for the image shown when a link is shared.",
  },
  {
    question: "How do I resize an image to these sizes?",
    answer:
      "Crop to the right aspect ratio first, then resize to the exact pixels, both run free in your browser with no upload. Each platform row links to a step-by-step guide and the tools.",
  },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Image Size Cheat Sheet 2026: Every Social & E-commerce Size",
    description:
      "The complete image size cheat sheet: Instagram, LinkedIn, Facebook, YouTube, Shopify, Amazon, TikTok and more, every recommended dimension in one table, with free resize tools.",
    keywords: [
      "image size cheat sheet",
      "social media image sizes",
      "all image sizes 2026",
      "social media size guide",
      "image dimensions cheat sheet",
    ],
    canonical: "/image-size-cheat-sheet",
  });
}

export default function CheatSheetPage() {
  const groups = getContextsByGroup();

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="Scaling"
        accent="violet"
        title="Image Size Cheat Sheet"
        description="Every recommended image size for social, e-commerce and the web, in one scannable table. Tap any platform for the full guide and the free tools to hit it."
        badge={{ icon: "Table", label: `${CONTEXT_PAGES.length} platforms` }}
      />

      {groups.map((group) => (
        <section key={group.group} className="py-8 sm:py-10">
          <Container>
            <SectionHeading title={group.group} />
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[36rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">Platform</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">Placement</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">Recommended size</th>
                  </tr>
                </thead>
                <tbody>
                  {group.contexts.map((c) =>
                    c.specs.map((spec, i) => (
                      <tr key={`${c.slug}-${spec.label}`} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 align-top">
                          {i === 0 ? (
                            <Link
                              href={ROUTES.forContext(c.slug)}
                              className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
                            >
                              <Icon name={c.icon} size={15} />
                              {c.destination}
                            </Link>
                          ) : (
                            <span className="sr-only">{c.destination}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-muted-foreground">{spec.label}</td>
                        <td className="px-4 py-3 align-top font-medium tabular-nums text-foreground">{spec.value}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      ))}

      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="Lightbulb" size={18} className="text-primary" />
              <span>How to hit any of these sizes</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Crop your image to the right aspect ratio first, then resize to the exact pixels, both
              run free in your browser with nothing uploaded. Tap any platform above for a step-by-step
              guide, or jump straight to the tools.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={ROUTES.tool("image-resizer")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                <Icon name="Scaling" size={15} /> Image Resizer
              </Link>
              <Link
                href={ROUTES.tool("crop-image")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
              >
                <Icon name="Crop" size={15} /> Crop Image
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-2 sm:pt-6">
        <Container>
          <CTA
            title="Need the full guide for a platform?"
            description="Each destination has a step-by-step page with tips and the exact tools."
            primary={{ label: "Browse image-size guides", href: ROUTES.forIndex }}
            secondary={{ label: "Solve an image problem", href: ROUTES.solve }}
          />
        </Container>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          webPageJsonLd({
            name: "Image Size Cheat Sheet",
            description:
              "A complete reference table of recommended image sizes for social media, e-commerce and the web.",
            url: "/image-size-cheat-sheet",
          }),
          faqJsonLd(FAQ),
        ]}
      />
    </div>
  );
}
