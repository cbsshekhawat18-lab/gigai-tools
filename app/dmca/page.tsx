import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = pageMetadata("dmca");

const LAST_UPDATED = "2026-07-23";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "DMCA & Copyright", href: ROUTES.dmca },
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

export default function DmcaPage() {
  return (
    <LegalDoc
      title="DMCA & Copyright Policy"
      description="We respect intellectual property. Here’s how to report content on GigAI Tools that you believe infringes your copyright, and how we handle notices."
      breadcrumb={BREADCRUMB}
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="Our commitment">
        <p>
          {SITE.brand} respects the intellectual-property rights of others and expects
          users to do the same. Note that {SITE.name}&apos;s tools run in your browser
          and we do <strong className="text-foreground">not host user-uploaded files</strong>
          - so this policy concerns the content we publish on the site (articles, images,
          copy). If you believe such content infringes a copyright you own, tell us and we
          will review it promptly.
        </p>
      </LegalSection>

      <LegalSection title="Filing a takedown notice">
        <p>
          Send a written notice to{" "}
          <A href={`mailto:${SITE.email}`}>{SITE.email}</A> with the subject
          &ldquo;DMCA Notice&rdquo;, including:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your physical or electronic signature.</li>
          <li>Identification of the copyrighted work you claim has been infringed.</li>
          <li>
            The exact URL(s) on {SITE.name} of the material you want removed, so we can
            locate it.
          </li>
          <li>Your name, address, telephone number and email address.</li>
          <li>
            A statement that you have a good-faith belief the use is not authorised by the
            copyright owner, its agent, or the law.
          </li>
          <li>
            A statement, under penalty of perjury, that the information is accurate and
            that you are the owner or authorised to act on the owner&apos;s behalf.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="What happens next">
        <p>
          On receiving a valid notice we will review and, where appropriate, remove or
          disable access to the material and make a good-faith effort to notify whoever
          posted it. We may keep a record of notices.
        </p>
      </LegalSection>

      <LegalSection title="Counter-notice">
        <p>
          If you believe content was removed in error, you may send a counter-notice to
          the same address with your contact details, identification of the removed
          material and its former location, and a statement under penalty of perjury that
          you have a good-faith belief it was removed by mistake or misidentification.
        </p>
      </LegalSection>

      <LegalSection title="Repeat infringers">
        <p>
          We may, in appropriate circumstances, restrict or terminate access for anyone
          who repeatedly infringes copyright. See also our{" "}
          <A href={ROUTES.terms}>Terms of Service</A>.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
