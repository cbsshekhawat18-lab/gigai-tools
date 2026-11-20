import type { ReactNode } from "react";

import type { BreadcrumbItem } from "@/types";
import { formatDate } from "@/lib/utils";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";

interface LegalDocProps {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  /** ISO date; renders a "Last updated" line + is the freshness signal. */
  lastUpdated?: string;
  children: ReactNode;
}

/**
 * Shared shell for every legal / policy / trust page (Privacy, Terms, Editorial,
 * AI, Cookie, Disclaimer, DMCA, Accessibility). Renders the page header, an
 * optional "Last updated" line, a measured prose column, and BreadcrumbList
 * JSON-LD, so all of them stay visually and structurally identical.
 */
export function LegalDoc({
  title,
  description,
  breadcrumb,
  lastUpdated,
  children,
}: LegalDocProps) {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(breadcrumb)} />
      <Container>
        <PageHeader title={title} description={description} breadcrumb={breadcrumb} />
      </Container>

      <Container size="narrow" className="mt-12">
        {lastUpdated ? (
          <p className="text-sm text-muted-foreground">
            Last updated: {formatDate(lastUpdated)}
          </p>
        ) : null}
        <div className="prose-measure mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
          {children}
        </div>
      </Container>
    </div>
  );
}

/** A titled section (h2 + body) inside a LegalDoc. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
