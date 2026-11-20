import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { FeatureGrid } from "@/components/shared/feature-grid";
import { CamelMark } from "@/components/verify/camel-mark";
import { CTA } from "@/components/shared/cta";

export const metadata: Metadata = pageMetadata("verifyExtension");

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "GigAI Verify", href: ROUTES.verify },
  { label: "Browser extension", href: ROUTES.verifyExtension },
];

const FEATURES = [
  {
    icon: "MousePointerClick",
    title: "One click, one question",
    description:
      "Open the sidebar and press check. No model picker, no detector setting, no prompt to write. GigAI works out whether you're looking at an article, a selection, an image, a PDF or a video, and routes it accordingly.",
  },
  {
    icon: "Search",
    title: "Evidence, not a score",
    description:
      "Every result lists what was actually measured (sentence rhythm, stock phrasing, generator metadata, Content Credentials) and lets you open each signal to see the exact excerpt or field behind it.",
  },
  {
    icon: "Scale",
    title: "Four honest outcomes",
    description:
      "Likely Human, Likely AI, Likely AI-Assisted, or Inconclusive. Nothing is forced: when the evidence doesn't support a call, GigAI says so instead of guessing.",
  },
  {
    icon: "FileSearch",
    title: "Text, images, PDFs and video",
    description:
      "Stylometry and metadata for text. EXIF, C2PA and embedded generator fields for images. Producer and structure for PDFs. Transcript and metadata for supported video pages.",
  },
  {
    icon: "MessageCircleQuestion",
    title: "Ask about the result",
    description:
      "Ask why, what evidence was found, which part looks generated, or what can actually be proven. Answers are drawn from the signals already collected. Never invented.",
  },
  {
    icon: "ShieldCheck",
    title: "Reads a page only when you ask",
    description:
      "It ships with no site permissions at all. Page content is read on your click, for one tab, once. Analysis runs on your device by default: nothing is uploaded unless you switch cloud analysis on.",
  },
];

/**
 * Landing page for the GigAI Verify browser extension.
 *
 * Note the restraint in the copy throughout: no accuracy percentage, no "detects
 * AI with X% accuracy", no implication that a result is proof. That is a product
 * constraint, not a stylistic one, the extension refuses to make those claims,
 * so the page that sells it cannot either.
 */
export default function VerifyExtensionPage() {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "GigAI Verify, AI or Human?",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome, Edge, Brave",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "Check text, images, PDFs and supported video pages for signals associated with AI-generated content, and see the evidence behind every assessment. Results are probabilistic, not proof of authorship.",
          url: absoluteUrl(ROUTES.verifyExtension),
          publisher: { "@type": "Organization", name: SITE.brand },
        }}
      />

      <Container>
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              <CamelMark size={44} className="shrink-0" />
              GigAI Verify for Chrome
            </span>
          }
          description="AI or human? Ask without leaving the page. Read an article, watch a video or view an image, then open GigAI Verify and check the available evidence in seconds."
          breadcrumb={BREADCRUMB}
        />
      </Container>

      {/* ── the promise, stated once, plainly ────────────────────────────── */}
      <Container size="narrow" className="mt-10">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Read it. Watch it. Ask GigAI.
          </p>
          <p className="mt-3 text-lg leading-relaxed text-foreground">
            You&rsquo;re looking at something. GigAI tells you what the evidence says about its
            origin &mdash; and how much that evidence is actually worth.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Distribution decision (user, 2026-08-22): the extension ships
                from THIS site only for now - no store references on the page.
                When the user says the Web Store listing is live, swap this CTA
                for the store URL. */}
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              href="/extension/gigai-verify-1.0.0.zip"
              download
            >
              Download for Chrome (v1.0.0, .zip)
            </a>
            <a
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
              href="#how-it-works"
            >
              Learn how it works
            </a>
          </div>
          <details className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <summary className="flex min-h-11 cursor-pointer items-center font-medium text-foreground">
              Install in 30 seconds
            </summary>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5">
              <li>Download and unzip the file above.</li>
              <li>
                Open <code className="font-mono text-xs">chrome://extensions</code>, switch on
                &ldquo;Developer mode&rdquo; (top right).
              </li>
              <li>
                Click &ldquo;Load unpacked&rdquo; and choose the unzipped folder. The GigAI
                Verify icon appears next to the address bar.
              </li>
            </ol>
            <p className="mt-3">
              The extension is distributed directly from this site. It analyses pages
              locally, needs no account, and its 98-test suite runs on every release.
            </p>
          </details>

          {/* Same product, other surface. The extension checks what you are
              looking at; the web tool checks a file you already have. Someone
              who arrives here with a file in hand needs sending there. */}
          <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
            Got a file rather than a page?{" "}
            <Link href={ROUTES.verifyTool} className="font-medium text-primary underline underline-offset-4">
              GigAI Verify on the web
            </Link>{" "}
            reads an image, PDF, video or document you already have, metadata,
            Content Credentials, structure and compression: without installing
            anything.
          </p>
        </div>
      </Container>

      <Container className="mt-14">
        <FeatureGrid features={FEATURES} columns={3} />
      </Container>

      {/* ── how it works ─────────────────────────────────────────────────── */}
      <Container size="narrow" className="mt-16">
        <div
          id="how-it-works"
          className="prose-measure mx-auto space-y-5 text-base leading-relaxed text-muted-foreground"
        >
          <h2 className="text-xl font-semibold text-foreground">How it works</h2>
          <p>
            GigAI Verify collects signals from three independent places and weighs them together.{" "}
            <strong className="text-foreground">Writing style</strong> &mdash; sentence-length
            variation, stock phrasing, vocabulary range, repeated openings.{" "}
            <strong className="text-foreground">Metadata</strong> &mdash; what the page or file
            declares about its author, its dates and the software that produced it.{" "}
            <strong className="text-foreground">Provenance</strong> &mdash; C2PA Content
            Credentials, EXIF camera data, and the generation parameters that image tools embed in
            their output.
          </p>
          <p>
            Style signals are the weakest of the three, and the extension treats them that way. A
            careful human writer and a lightly edited model draft occupy the same stylistic
            territory, and writers working in a second language trip several of the same signals
            for reasons that have nothing to do with AI. So a result based on style alone is capped
            at moderate confidence. Only evidence of record &mdash; a Content Credential, a
            generator tag, an assistant&rsquo;s own words left in the text &mdash; lifts it higher.
          </p>

          <h2 className="text-xl font-semibold text-foreground">What it will never do</h2>
          <p>
            It will never show you a percentage. &ldquo;97.4% AI&rdquo; implies a precision that no
            detector has, and it invites people to treat a guess as a finding. GigAI reports one of
            four outcomes with a low, moderate or high confidence, and shows you the evidence so you
            can judge it yourself.
          </p>
          <p>
            It will also never claim to have analysed something it didn&rsquo;t. If only a
            video&rsquo;s transcript was available, the result says so next to the verdict rather
            than implying the video was watched. If an image carries no metadata, it says that too
            &mdash; and notes that stripped metadata is normal on social platforms and proves
            nothing either way.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Private by architecture</h2>
          <p>
            The extension ships with{" "}
            <strong className="text-foreground">no site permissions at all</strong>. It cannot read
            a page in the background because it has no standing access to one. When you click check,
            it uses a one-off grant scoped to that single tab, which expires as soon as you navigate.
          </p>
          <p>
            Form fields are excluded at the extractor level, so passwords, payment details and
            half-typed messages cannot enter the analysis even by accident. Analysis runs on your
            device by default. If you switch on cloud analysis, the result is labelled{" "}
            <strong className="text-foreground">GigAI analysis</strong> rather than{" "}
            <strong className="text-foreground">Local analysis</strong> &mdash; the badge always
            reflects what actually happened, never what you preferred.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Limitations, up front</h2>
          <p>
            AI detection is probabilistic and produces both false positives and false negatives.
            Short passages carry too little signal to judge. Edited AI text often leaves no trace at
            all. Content Credentials are detected but not cryptographically verified in the browser.
            None of this is proof of authorship, and it should never be used to accuse someone
            &mdash; treat a result as a reason to look closer, not as a verdict about a person.
          </p>
        </div>
      </Container>

      <Container className="mt-16">
        <CTA
          title="The full report lives here"
          description="The extension stays deliberately small. Open any result on GigAI Tools for the detailed evidence view."
          primary={{ label: "Open GigAI Verify", href: ROUTES.verify }}
          secondary={{ label: "Questions? Contact us", href: ROUTES.contact }}
        />
      </Container>
    </div>
  );
}
