import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = pageMetadata("disclaimer");

const LAST_UPDATED = "2026-07-23";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Disclaimer", href: ROUTES.disclaimer },
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

export default function DisclaimerPage() {
  return (
    <LegalDoc
      title="Disclaimer"
      description="The tools and content on GigAI Tools are provided for general use on an “as is” basis. Here’s what that means and where our responsibility ends."
      breadcrumb={BREADCRUMB}
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="General">
        <p>
          {SITE.name}, operated by {SITE.brand}, provides free online tools and
          informational content for general purposes. We work hard to keep everything
          accurate and working, but we provide the site on an{" "}
          <strong className="text-foreground">&ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;</strong> basis, without warranties of any kind, express or
          implied.
        </p>
      </LegalSection>

      <LegalSection title="Tool results">
        <p>
          Our tools are designed to be reliable, but outcomes can depend on your files,
          your browser and your device. Always keep a copy of your original files and
          verify important results yourself. We are not responsible for any loss of data
          or other loss arising from use of a tool. Because most tools run in your
          browser, your files are processed on your own device - see our{" "}
          <A href={ROUTES.privacy}>Privacy Policy</A>.
        </p>
      </LegalSection>

      <LegalSection title="Not professional advice">
        <p>
          Articles, guides and glossary entries are for general information only and are
          not legal, financial, medical or other professional advice. For decisions that
          matter, consult a qualified professional.
        </p>
      </LegalSection>

      <LegalSection title="External links">
        <p>
          The site may link to third-party websites for convenience. We do not control
          and are not responsible for their content, policies or availability. A link is
          not an endorsement.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {SITE.brand} will not be liable for any
          direct, indirect, incidental or consequential damages arising from your use of,
          or inability to use, {SITE.name}. Your use of the site is governed by our{" "}
          <A href={ROUTES.terms}>Terms of Service</A>.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this disclaimer? Email{" "}
          <A href={`mailto:${SITE.email}`}>{SITE.email}</A>.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
