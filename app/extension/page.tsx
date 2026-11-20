import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { FeatureGrid } from "@/components/shared/feature-grid";
import { CTA } from "@/components/shared/cta";
import { ExtensionStatus } from "@/components/extension/extension-status";

export const metadata: Metadata = pageMetadata("extension");

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "GigAI Copilot", href: ROUTES.extension },
];

const FEATURES = [
  {
    icon: "Target",
    title: "Missions, not warnings",
    description:
      "Instead of 80 red flags, Copilot picks today's one highest-impact improvement and explains it in plain language: with an honest estimate of what it may achieve.",
  },
  {
    icon: "PenLine",
    title: "Fix Mode",
    description:
      "Every issue arrives with an editable suggestion generated from your page (title rewrite, meta description, Open Graph block, JSON-LD) plus a copy-ready snippet.",
  },
  {
    icon: "Send",
    title: "Tools open pre-filled",
    description:
      "One click opens the exact GigAI tool with your page's data already in the form. No copy-paste between the extension and the site.",
  },
  {
    icon: "Share2",
    title: "See shares before you post",
    description:
      "Live previews of how your page unfurls on Google, Facebook, LinkedIn, X, Discord, Slack, WhatsApp and Telegram.",
  },
  {
    icon: "Command",
    title: "⌘K command palette",
    description:
      "Search every Copilot action and the full GigAI tool library from one input: your most-used tools rise to the top.",
  },
  {
    icon: "ShieldCheck",
    title: "100% private",
    description:
      "Analysis and AI run on your device. No accounts, no telemetry, no server calls. It can't even see a page until you click its icon.",
  },
];

/**
 * Landing page for the GigAI Copilot browser extension, the site half of the
 * extension↔site reverse bridge. The status panel flips to "installed ✓" when
 * the extension's announce script is present.
 */
export default function ExtensionPage() {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "GigAI Copilot",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome, Edge, Brave, Firefox",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "Free SEO browser extension: missions instead of warnings, editable fixes, on-device AI, and pre-filled hand-off into GigAI Tools. 100% private.",
          url: absoluteUrl(ROUTES.extension),
          publisher: { "@type": "Organization", name: SITE.brand },
        }}
      />
      <Container>
        <PageHeader
          title="GigAI Copilot, the SEO copilot in your browser"
          description="Click one icon on any page you own: Copilot finds the highest-impact SEO improvement, explains it like a mentor, drafts the fix, and opens the right GigAI tool pre-filled. Entirely on your device."
          breadcrumb={BREADCRUMB}
        />
      </Container>

      <Container size="narrow" className="mt-10">
        <ExtensionStatus />
      </Container>

      <Container className="mt-14">
        <FeatureGrid features={FEATURES} columns={3} />
      </Container>

      <Container size="narrow" className="mt-16">
        <div className="prose-measure mx-auto space-y-5 text-base leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Private by architecture, not by promise</h2>
          <p>
            Copilot requests the minimum the job needs: it can read a page <strong className="text-foreground">only after you click its icon on that page</strong>, never in the background. The analysis, the AI rewrites (Chrome&apos;s built-in on-device AI where available) and your scan history all stay on your machine. There is no account, no telemetry and no server - the{" "}
            <strong className="text-foreground">only</strong> thing it ever does elsewhere is a one-line &ldquo;I&apos;m installed&rdquo; note on this website, so we can stop showing you install prompts.
          </p>
          <p>
            And because it&apos;s built by the team behind {SITE.name}, every fix connects to a real, free tool - the extension is the shortcut, this site is the toolbox.
          </p>
        </div>
      </Container>

      <Container className="mt-16">
        <CTA
          title="Meanwhile, the tools work everywhere"
          description="Everything Copilot automates is powered by the free tools on this site. No extension required."
          primary={{ label: "Explore SEO tools", href: ROUTES.category("seo-tools") }}
          secondary={{ label: "Questions? Contact us", href: ROUTES.contact }}
        />
      </Container>
    </div>
  );
}
