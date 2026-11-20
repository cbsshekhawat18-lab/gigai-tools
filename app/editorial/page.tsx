import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = pageMetadata("editorial");

const LAST_UPDATED = "2026-07-23";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Editorial Standards", href: ROUTES.editorial },
];

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
    >
      {children}
    </a>
  );
}

export default function EditorialPage() {
  return (
    <LegalDoc
      title="Editorial Standards"
      description="How we build tools, research topics, and write the guides on GigAI Tools, and the review, accuracy and independence standards we hold ourselves to."
      breadcrumb={BREADCRUMB}
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="Who is behind this site">
        <p>
          {SITE.name} is built and maintained by {SITE.brand}, a software company
          founded by Chandrabhan Shekhawat. A small team designs, engineers and
          documents every tool and article here. There is a real, accountable
          publisher behind the platform, and you can always reach a person via our{" "}
          <A href={ROUTES.contact}>contact page</A> or at{" "}
          <A href={`mailto:${SITE.email}`}>{SITE.email}</A>.
        </p>
      </LegalSection>

      <LegalSection title="How we build the tools">
        <p>
          Every tool is a real, working utility. Not a demo and not a wrapper
          around someone else&apos;s service. Wherever it is technically possible,
          tools run <strong className="text-foreground">entirely in your browser</strong>,
          so your files are processed on your own device and never uploaded. We
          test each tool against real files before it goes live, and we state its
          limits plainly rather than over-promising.
        </p>
        <p>
          When a tool genuinely needs server-side processing to produce a better
          result, we say so on the tool itself, process the file ephemerally, and
          delete it immediately afterwards. We never store or reuse your content.
        </p>
      </LegalSection>

      <LegalSection title="How we research and write">
        <p>Our guides, comparisons and how-tos are written to help you finish a task, not to fill a page. For each topic we:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Start from a real question or problem people actually have.</li>
          <li>Use the tool ourselves and describe what genuinely happens, including edge cases and trade-offs.</li>
          <li>Prefer plain language over jargon, and concrete steps over filler.</li>
          <li>Link to the primary tool and to related tools, so the article is a means to an end, not a dead end.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Review and accuracy">
        <p>
          Content is reviewed by a human before publication and checked against how
          the tools actually behave. We do not publish auto-generated text without
          review. If something is wrong or out of date, we want to fix it - email{" "}
          <A href={`mailto:${SITE.email}`}>{SITE.email}</A> and we will correct or
          clarify it. Substantive changes update the article&apos;s date so you can
          see when it was last revised.
        </p>
      </LegalSection>

      <LegalSection title="Use of AI">
        <p>
          We use AI as an assistant for tasks like drafting and summarising, always
          under human review. Never as a substitute for accuracy or judgement, and
          never to invent facts, statistics, quotes or reviews. The full details are
          in our <A href={ROUTES.aiPolicy}>AI Usage Policy</A>.
        </p>
      </LegalSection>

      <LegalSection title="Editorial independence">
        <p>
          {SITE.name} is free and supported by advertising. Advertisers do not get
          to influence what we build, how we describe a tool, or which tools we
          recommend. Ads are clearly labelled and shown only <em>around</em> content
          - never inside a tool&apos;s workspace, and never in a way that disguises
          them as part of a tool.
        </p>
      </LegalSection>

      <LegalSection title="Corrections and contact">
        <p>
          Found an error, a broken tool, or something unclear? Please tell us at{" "}
          <A href={`mailto:${SITE.email}`}>{SITE.email}</A> or via our{" "}
          <A href={ROUTES.contact}>contact page</A>. See also our{" "}
          <A href={ROUTES.privacy}>Privacy Policy</A> and{" "}
          <A href={ROUTES.terms}>Terms of Service</A>.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
