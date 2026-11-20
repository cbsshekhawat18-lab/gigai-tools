import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { buildMetadata } from "@/lib/seo";
import { AuditClient } from "./audit-client";

export const metadata: Metadata = buildMetadata({
  title: "Site Audit - SEO and AI visibility with real fixes",
  description:
    "Audit any public site: 24 checks across SEO and AI visibility, paste-ready fixes built from your own pages, transparent scores, sourced guidance. Free, 3 audits a day.",
  canonical: "/site-audit",
});

export default function SiteAuditPage() {
  return (
    <section className="py-12">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-foreground">Site Audit</h1>
        <p className="mt-3 max-w-[70ch] text-muted-foreground">
          One URL in, a scored report out: 24 deterministic checks across classic SEO
          and AI visibility (can ChatGPT, Claude and Perplexity read and cite you?),
          each finding with paste-ready fix code built from your own pages and
          guidance linked to its source.
        </p>
        <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">
          Only the public URL is fetched - no account, no files, nothing stored except
          the findings, which expire after 30 days. AI explanations are optional and
          run with your own key, straight from your browser.{" "}
          <Link href="/developers/docs" className="text-primary hover:underline">
            Also available over the API
          </Link>{" "}
          as POST /v1/audit.
        </p>
        <div className="mt-8">
          <AuditClient />
        </div>
      </Container>
    </section>
  );
}
