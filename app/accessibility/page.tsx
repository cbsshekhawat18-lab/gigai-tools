import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = pageMetadata("accessibility");

const LAST_UPDATED = "2026-07-23";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Accessibility", href: ROUTES.accessibility },
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

export default function AccessibilityPage() {
  return (
    <LegalDoc
      title="Accessibility Statement"
      description="We want GigAI Tools to be usable by everyone. Our commitment to WCAG 2.1 AA, what we support today, known limitations, and how to report an issue."
      breadcrumb={BREADCRUMB}
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="Our commitment">
        <p>
          {SITE.name} is built to be usable by as many people as possible, including
          people who rely on assistive technology. We aim to conform to the{" "}
          <strong className="text-foreground">Web Content Accessibility Guidelines
          (WCAG) 2.1, Level AA</strong>, and we treat accessibility as an ongoing part
          of how we build. Not an afterthought.
        </p>
      </LegalSection>

      <LegalSection title="What we support">
        <ul className="list-disc space-y-2 pl-6">
          <li>Full keyboard navigation, with a &ldquo;skip to content&rdquo; link on every page.</li>
          <li>Visible focus indicators on all interactive elements.</li>
          <li>Semantic landmarks and ARIA labelling for screen readers.</li>
          <li>Labelled form controls and descriptive links and buttons.</li>
          <li>Colour choices designed to meet AA contrast, in both light and dark themes.</li>
          <li>Respect for the &ldquo;reduce motion&rdquo; system setting.</li>
          <li>Responsive layouts that reflow and support zoom without loss of content.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Known limitations">
        <p>
          Some tools involve rich, canvas- or media-based workspaces (for example image
          or PDF editing) where certain interactions can be harder to fully expose to
          assistive technology. We are actively improving these, and where a workflow is
          difficult we try to offer a simpler alternative. Third-party advertising content
          is outside our direct control, though we label and contain it.
        </p>
      </LegalSection>

      <LegalSection title="Tell us about a barrier">
        <p>
          If you hit an accessibility barrier, we want to fix it, and we&apos;ll help you
          get the task done in the meantime. Email{" "}
          <A href={`mailto:${SITE.email}`}>{SITE.email}</A> or use our{" "}
          <A href={ROUTES.contact}>contact page</A> with the page, what happened, and the
          assistive technology or browser you were using. We aim to respond promptly.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
