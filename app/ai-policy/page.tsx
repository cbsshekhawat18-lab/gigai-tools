import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = pageMetadata("aiPolicy");

const LAST_UPDATED = "2026-07-23";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "AI Usage Policy", href: ROUTES.aiPolicy },
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

export default function AiPolicyPage() {
  return (
    <LegalDoc
      title="AI Usage Policy"
      description="Exactly how, and how little, we use AI at GigAI Tools. Human-reviewed content, no fabricated facts or reviews, and real code behind every tool."
      breadcrumb={BREADCRUMB}
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="Our position in one line">
        <p>
          We treat AI as a writing assistant, not an author, and never as a source
          of truth. Everything published on {SITE.name} is reviewed by a person and
          checked against how the tools actually work.
        </p>
      </LegalSection>

      <LegalSection title="Where we use AI">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-foreground">Drafting and editing.</strong> AI may
            help draft or tidy an early version of a guide or tool description, which
            a human then edits, fact-checks and approves.
          </li>
          <li>
            <strong className="text-foreground">Summarising and structuring.</strong>{" "}
            Turning notes or steps into clearer prose, or suggesting an outline.
          </li>
          <li>
            <strong className="text-foreground">Support behind the scenes.</strong>{" "}
            Internal tasks like drafting alt text or spotting inconsistencies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Where we do NOT use AI">
        <ul className="list-disc space-y-2 pl-6">
          <li>We do not publish unreviewed, auto-generated text.</li>
          <li>
            We do not fabricate facts, statistics, quotes, testimonials, star ratings
            or reviews. If we cannot verify a claim, we do not make it.
          </li>
          <li>
            We do not invent fake authors or credentials. Content is published under
            our real company, {SITE.brand} (see our{" "}
            <A href={ROUTES.editorial}>Editorial Standards</A>).
          </li>
          <li>
            We do not use AI to manipulate rankings with mass-produced, low-value
            pages. Pages exist because they help a real user finish a real task.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="The tools themselves are real code. Not &ldquo;AI&rdquo;">
        <p>
          When a tool converts, compresses, edits or generates something, it does so
          with genuine, deterministic code (and, where noted, on-device machine-learning
          models). Not by asking a chatbot. We never label something &ldquo;AI&rdquo;
          for marketing when it is ordinary processing, and we describe what each tool
          actually does.
        </p>
      </LegalSection>

      <LegalSection title="Your data and AI">
        <p>
          Browser-based tools process your files on your own device. Their contents are
          never sent to us or to any AI model. Our writing assistants work on our own
          drafts and documentation - never on your files. This is consistent with our{" "}
          <A href={ROUTES.privacy}>Privacy Policy</A>: we keep the data we collect to a
          minimum, and your files stay yours.
        </p>
      </LegalSection>

      <LegalSection title="Accountability">
        <p>
          A human is responsible for everything we publish. If you spot something that
          reads as inaccurate, fabricated or AI-generated without review, please tell us
          at <A href={`mailto:${SITE.email}`}>{SITE.email}</A> and we will investigate and
          correct it.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
