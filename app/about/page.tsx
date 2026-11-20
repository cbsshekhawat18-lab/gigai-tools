import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES, SITE } from "@/config/constants";
import { ORGANIZATION } from "@/config/seo";
import { pageMetadata } from "@/lib/seo";
import { getTotalToolCount, getIndexableCategories, getToolsByCategory } from "@/lib/registry";
import { pluralize } from "@/lib/utils";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Icon } from "@/lib/icons";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { FeatureGrid } from "@/components/shared/feature-grid";
import { CTA } from "@/components/shared/cta";

export const metadata: Metadata = pageMetadata("about");

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "About", href: ROUTES.about },
];

const VALUES = [
  {
    icon: "ShieldCheck",
    title: "Privacy first",
    description:
      "Wherever possible, your files are processed right in your browser. No uploads, no server copies, nothing to delete.",
  },
  {
    icon: "Zap",
    title: "Genuinely fast",
    description:
      "No sign-up funnels, no bloat. Tools load instantly and do one job well with sensible defaults.",
  },
  {
    icon: "Gift",
    title: "Free to use",
    description:
      "The core tools are free, with no watermarks and no paywalls on the essentials.",
  },
  {
    icon: "Blocks",
    title: "Built to scale",
    description:
      "A consistent, component-driven platform means new tools ship quickly and feel familiar from day one.",
  },
];

export default function AboutPage() {
  const toolCount = getTotalToolCount();
  const categories = getIndexableCategories();
  const categoryCount = categories.length;

  // Each category with its live tool count + a few example tool titles.
  const showcase = categories.map((cat) => {
    const tools = getToolsByCategory(cat.slug);
    return {
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      count: tools.length,
      examples: tools.slice(0, 4).map((t) => t.title),
    };
  });

  const stats = [
    { value: `${toolCount}+`, label: "free tools" },
    { value: String(categoryCount), label: "studios" },
    { value: "0", label: "files uploaded" },
    { value: "$0", label: "to get started" },
  ];

  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />
      <Container>
        <PageHeader
          title={`About ${SITE.name}`}
          description={`The privacy-first browser productivity platform, ${toolCount}+ free tools for images, PDFs, documents, developers, QR codes, SEO, SVG, video and audio, all running entirely in your browser. Built by Gigai Kripa Services.`}
          breadcrumb={BREADCRUMB}
        />
      </Container>

      {/* By the numbers */}
      <Container className="mt-10">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/40 px-4 py-6 text-center">
              <dt className="text-3xl font-bold tabular-nums text-foreground">{s.value}</dt>
              <dd className="text-sm text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>

      {/* Mission */}
      <Container size="narrow" className="mt-14">
        <div className="prose-measure mx-auto space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">{SITE.name}</strong> exists for a
            simple reason: everyday digital tasks: compressing an image, merging a
            few PDFs, converting a file, cleaning up an SVG, generating a QR code  -
            shouldn&apos;t require an account, a download, or handing your files to a
            stranger. They should just work.
          </p>
          <p>
            So we built a single, dependable home for all of them. Every tool opens,
            does one job well with sensible defaults, and closes in under a minute  -
            and because the processing happens in <em>your</em> browser, your files
            never leave your device. Today the library spans{" "}
            <strong className="text-foreground">{pluralize(toolCount, "tool")}</strong>{" "}
            across{" "}
            <strong className="text-foreground">
              {categoryCount} {categoryCount === 1 ? "studio" : "studios"}
            </strong>
            , and it keeps growing.
          </p>
          <p>
            {SITE.name} is a product of{" "}
            <a
              href={SITE.parentUrl}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {SITE.brand}
            </a>
            , a studio that ships focused, well-crafted software. The platform is
            engineered as a foundation, a shared design system, registry and set of
            reusable components, so every tool feels consistent and trustworthy
            rather than a scattered collection of one-offs.
          </p>
        </div>
      </Container>

      {/* Who's behind it - real, accountable authorship (E-E-A-T) */}
      <Container size="narrow" className="mt-16">
        <div className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">
            Who&apos;s behind {SITE.name}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {SITE.name} is built and maintained by{" "}
            <a
              href={SITE.parentUrl}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {SITE.brand}
            </a>
            , founded by{" "}
            <a
              href={ORGANIZATION.founder.sameAs[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {ORGANIZATION.founder.name}
            </a>
            . A small, real team designs, engineers and documents every tool and
            article here - and stands behind them. Read how we work in our{" "}
            <Link
              href={ROUTES.editorial}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Editorial Standards
            </Link>{" "}
            and{" "}
            <Link
              href={ROUTES.aiPolicy}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              AI Usage Policy
            </Link>
            , or reach a person any time at{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {SITE.email}
            </a>
            . The code behind the site is{" "}
            <Link
              href={ROUTES.openSource}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              open source
            </Link>
            .
          </p>
        </div>
      </Container>

      {/* Everything inside - the studios */}
      <Container className="mt-16">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Everything inside</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          {categoryCount} focused studios, each a full toolkit for its job. Here&apos;s a taste of what&apos;s in each.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showcase.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-primary/50 hover:bg-card"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={cat.icon} size={18} />
                </span>
                <h3 className="flex-1 font-semibold text-foreground">{cat.name}</h3>
                <span className="text-xs tabular-nums text-muted-foreground">{cat.count} tools</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{cat.description}</p>
              {cat.examples.length > 0 ? (
                <p className="mt-auto pt-1 text-[11px] text-muted-foreground/80">
                  <span className="text-foreground/70">e.g.</span> {cat.examples.join(" · ")}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </Container>

      {/* Values */}
      <Container className="mt-16">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">What we stand for</h2>
        <div className="mt-8">
          <FeatureGrid features={VALUES} columns={2} />
        </div>
      </Container>

      <Container className="mt-16">
        <CTA
          title="Have an idea for a tool?"
          description="We build what people actually need. Tell us what would save you time."
          primary={{ label: "Get in touch", href: ROUTES.contact }}
          secondary={{ label: "Browse all tools", href: ROUTES.search }}
        />
      </Container>
    </div>
  );
}
