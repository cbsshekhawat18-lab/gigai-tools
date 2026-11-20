import type { Metadata } from "next";
import Link from "next/link";

import type { BlogPost } from "@/types";
import { ROUTES } from "@/config/constants";
import { CATEGORIES } from "@/config/categories";
import { absoluteUrl, cn, formatDate } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/schema";
import { getAllTools, getTotalToolCount, getAllCategories } from "@/lib/registry";
import { getAllPosts } from "@/lib/blog";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import { RelatedWeb } from "@/components/shared/related-web";

/**
 * /changelog, a single, indexable "What's new" page. It aggregates every
 * tool's own `changelog` field into one reverse-chronological timeline (grouped
 * by date), fronted by a short hand-written platform release-notes intro.
 *
 * DISK-LEAN BY DESIGN: one page, not per-tool URLs. All data is derived from the
 * registry at build time, so it stays in sync as tools ship updates. Server
 * component. No client JS.
 */

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Changelog", href: ROUTES.changelog },
];

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Changelog, What's New in GigAI Tools",
    description:
      "Release notes and per-tool updates for GigAI Tools: new tools, workspaces, improvements and fixes across the whole library, newest first.",
    canonical: ROUTES.changelog,
  });
}

/** One flattened changelog entry, carrying a link back to the tool that shipped it. */
interface Entry {
  date: string;
  change: string;
  toolTitle: string;
  toolSlug: string;
  categorySlug: string;
}

export default async function ChangelogPage() {
  const totalTools = getTotalToolCount();
  const categoryCount = getAllCategories().length;

  // Flatten every tool's changelog into a single list of dated entries. Only
  // live tools contribute, so retired/coming-soon entries never leak in.
  const entries: Entry[] = getAllTools()
    .filter((tool) => (tool.status ?? "live") === "live" && tool.changelog?.length)
    .flatMap((tool) =>
      (tool.changelog ?? []).map((c) => ({
        date: c.date,
        change: c.change,
        toolTitle: tool.title,
        toolSlug: tool.slug,
        categorySlug: tool.category,
      })),
    );

  // Group by ISO date, then order dates newest-first. Within a date, entries
  // keep registry order (stable + deterministic across builds).
  const byDate = new Map<string, Entry[]>();
  for (const entry of entries) {
    const bucket = byDate.get(entry.date);
    if (bucket) bucket.push(entry);
    else byDate.set(entry.date, [entry]);
  }
  const groups = [...byDate.entries()].sort((a, b) =>
    b[0].localeCompare(a[0]),
  );

  const accentFor = (categorySlug: string) =>
    CATEGORIES.find((c) => c.slug === categorySlug)?.accent ?? "sky";

  const allPosts: BlogPost[] = await getAllPosts();

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={BREADCRUMB}
        icon="Sparkles"
        accent="violet"
        title="Changelog"
        description="Every improvement to GigAI Tools, in one place: new tools, workspaces, features and fixes across the whole library."
        longDescription="This page is generated straight from each tool's own release notes, so it's always current. Newest changes are at the top."
        badge={{ icon: "ListChecks", label: `${entries.length} updates` }}
      />

      {/* ── Platform release notes (hand-written, factual) ─────────────────── */}
      <section className="py-12 sm:py-16">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Platform"
            title="Release notes"
            description="The bigger milestones behind the day-to-day tool updates."
          />
          <div className="mt-8 space-y-6">
            <ReleaseNote
              title="GigAI Workspaces"
              body={
                <>
                  Chain multiple tools on the same files without re-uploading -{" "}
                  nine live workspaces span{" "}
                  <Link href={ROUTES.workspace("image")} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">image</Link>,{" "}
                  <Link href={ROUTES.workspace("pdf")} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">PDF</Link>,{" "}
                  SVG, audio, video, document, developer, QR and SEO work. Start
                  at the{" "}
                  <Link href={ROUTES.workspaces} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">workspaces hub</Link>.
                </>
              }
            />
            <ReleaseNote
              title={`${totalTools}+ tools across ${categoryCount} categories`}
              body={
                <>
                  The library keeps growing, image, PDF, developer, SVG, QR, SEO,
                  document, audio and video utilities, each a focused micro-site
                  that runs in your browser, free and without sign-up. Browse them
                  all from{" "}
                  <Link href={ROUTES.search} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">the tool index</Link>.
                </>
              }
            />
            <ReleaseNote
              title="Guides, comparisons & the blog"
              body={
                <>
                  Long-form help shipped alongside the tools:{" "}
                  <Link href={ROUTES.howToIndex} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">how-to guides</Link>,{" "}
                  <Link href={ROUTES.compare} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">format comparisons</Link>, a{" "}
                  <Link href={ROUTES.learn} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">learning center</Link>{" "}
                  and a regularly updated{" "}
                  <Link href={ROUTES.blog} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">blog</Link>.
                </>
              }
            />
          </div>
        </Container>
      </section>

      {/* ── Per-tool timeline (grouped by date, newest first) ──────────────── */}
      {groups.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container size="narrow">
            <SectionHeading
              eyebrow="Tool updates"
              title="Recent changes"
              description="Individual improvements shipped to specific tools."
            />
            <div className="mt-8 space-y-10">
              {groups.map(([date, items]) => (
                <div key={date}>
                  <h3 className="sticky top-16 z-10 -mx-2 mb-4 inline-flex items-center gap-2 rounded-lg bg-background/80 px-2 py-1 text-sm font-semibold tabular-nums text-foreground backdrop-blur">
                    <Icon name="Calendar" size={14} className="text-muted-foreground" />
                    <time dateTime={date}>{formatDate(date)}</time>
                  </h3>
                  <ol className="space-y-3">
                    {items.map((entry, index) => {
                      const a = accentStyle(accentFor(entry.categorySlug));
                      return (
                        <li
                          key={`${entry.toolSlug}-${date}-${index}`}
                          className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-baseline sm:gap-4"
                        >
                          <Link
                            href={ROUTES.tool(entry.toolSlug)}
                            className={cn(
                              "shrink-0 text-sm font-semibold underline-offset-4 hover:underline sm:w-48",
                              a.text,
                            )}
                          >
                            {entry.toolTitle}
                          </Link>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {entry.change}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="pt-2 sm:pt-6">
        <Container>
          <CTA
            title="Want to see what shipped?"
            description="Jump into the tools and workspaces the changelog is talking about."
            primary={{ label: "Browse all tools", href: ROUTES.search }}
            secondary={{ label: "Open a workspace", href: ROUTES.workspaces }}
          />
        </Container>
      </section>

      {/* Slim cross-links - a few chips, computed at build time. */}
      <Container className="mt-14">
        <RelatedWeb
          input={{
            kind: "hub",
            title: "Changelog",
            tags: ["updates", "release notes", "new tools"],
            allPosts,
          }}
        />
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMB),
          collectionPageJsonLd({
            name: "Changelog, What's New in GigAI Tools",
            description:
              "Release notes and per-tool updates for GigAI Tools, new tools, workspaces, improvements and fixes across the whole library, newest first.",
            url: absoluteUrl(ROUTES.changelog),
          }),
        ]}
      />
    </div>
  );
}

function ReleaseNote({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon name="Rocket" size={18} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
