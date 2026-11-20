import type { Metadata } from "next";

import { ROUTES } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { CTA } from "@/components/shared/cta";
import { VerifyReport } from "@/components/verify/verify-report";
import { CamelMark } from "@/components/verify/camel-mark";

export const metadata: Metadata = pageMetadata("verify");

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "GigAI Verify", href: ROUTES.verify },
];

/**
 * GigAI Verify: the full report view.
 *
 * The browser extension stays intentionally small; this is where a result opens
 * out. The report itself is rendered client-side from the URL fragment the
 * extension writes (see `VerifyReport`), so no content ever reaches a server.
 */
export default function VerifyPage() {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />

      <Container>
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              <CamelMark size={44} className="shrink-0" />
              GigAI Verify
            </span>
          }
          description="Is this AI or human? GigAI weighs the writing, the metadata and the provenance of what you're looking at, and shows you the evidence behind the answer."
          breadcrumb={BREADCRUMB}
        />
      </Container>

      <Container size="narrow" className="mt-10">
        <VerifyReport />
      </Container>

      <Container size="narrow" className="mt-14">
        <div className="prose-measure mx-auto space-y-5 text-base leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">The four outcomes</h2>
          <ul className="space-y-2">
            <li>
              <strong className="text-foreground">Likely Human</strong> &mdash; the available
              evidence is more consistent with human-created content.
            </li>
            <li>
              <strong className="text-foreground">Likely AI</strong> &mdash; the available
              evidence is more consistent with AI-generated content.
            </li>
            <li>
              <strong className="text-foreground">Likely AI-Assisted</strong> &mdash; evidence
              suggests AI involvement alongside human editing or contribution.
            </li>
            <li>
              <strong className="text-foreground">Inconclusive</strong> &mdash; there
              isn&rsquo;t enough reliable evidence to determine the origin.
            </li>
          </ul>
          <p>
            There is no fifth outcome and no percentage. When the evidence doesn&rsquo;t support a
            call, GigAI returns Inconclusive rather than picking whichever side is marginally ahead
            &mdash; a detector that always answers is a detector that is often wrong.
          </p>
        </div>
      </Container>

      <Container className="mt-16">
        <CTA
          title="Check what you're reading, without leaving the page"
          description="GigAI Verify for Chrome inspects the article, selection, image, PDF or video in front of you and explains what the evidence says."
          primary={{ label: "Get the extension", href: ROUTES.verifyExtension }}
          secondary={{ label: "Explore all GigAI tools", href: ROUTES.home }}
        />
      </Container>
    </div>
  );
}
