import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = pageMetadata("terms");

const LAST_UPDATED = "2026-06-01";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Terms of Service", href: ROUTES.terms },
];

export default function TermsPage() {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />
      <Container>
        <PageHeader
          title="Terms of Service"
          description={`The terms that govern your use of ${SITE.name}.`}
          breadcrumb={BREADCRUMB}
        />
      </Container>

      <Container size="narrow" className="mt-12">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(LAST_UPDATED)}
        </p>

        <div className="prose-measure mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              1. Acceptance of terms
            </h2>
            <p>
              By accessing or using {SITE.name} (the &ldquo;Service&rdquo;), operated by{" "}
              {SITE.brand}, you agree to these Terms of Service. If you do not agree,
              please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Use of the Service</h2>
            <p>
              The Service provides a collection of online utilities offered for your
              personal and business use. You agree to use the tools lawfully and not to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Use the Service to process content you do not have the right to use.</li>
              <li>
                Attempt to disrupt, overload, reverse-engineer or gain unauthorised
                access to the Service or its infrastructure.
              </li>
              <li>
                Use the Service for any unlawful, harmful, or fraudulent purpose.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Your content</h2>
            <p>
              You retain all rights to the files and content you process with the
              Service. Most tools run in your browser and never transmit your content to
              us. You are solely responsible for the content you choose to process and
              for keeping your own backups.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              4. Availability &amp; changes
            </h2>
            <p>
              We aim to keep the Service available and reliable, but it is provided on an
              &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We may add,
              modify, or discontinue tools and features at any time without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              5. Disclaimer of warranties
            </h2>
            <p>
              To the fullest extent permitted by law, the Service is provided without
              warranties of any kind, whether express or implied, including fitness for
              a particular purpose. We do not warrant that results obtained from any tool
              will be accurate, complete, or error-free.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              6. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, {SITE.brand} shall not be liable
              for any indirect, incidental, or consequential damages, or for any loss of
              data or profits, arising from your use of, or inability to use, the
              Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              7. Intellectual property
            </h2>
            <p>
              The Service&apos;s design, branding, and software are owned by {SITE.brand}
              and protected by applicable laws. These terms do not grant you any right to
              use our trademarks without prior written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Changes to terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service
              after changes take effect constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
            <p>
              For any questions about these terms, email us at{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                {SITE.email}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
