import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = pageMetadata("cookies");

const LAST_UPDATED = "2026-08-21";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Cookie Policy", href: ROUTES.cookies },
];

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
    >
      {children}
    </a>
  );
}

export default function CookiePolicyPage() {
  return (
    <LegalDoc
      title="Cookie Policy"
      description="Which cookies and local storage GigAI Tools uses, why, and how you can control them, including Google AdSense advertising cookies."
      breadcrumb={BREADCRUMB}
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection title="What cookies are">
        <p>
          Cookies are small files a site stores in your browser. &ldquo;Local
          storage&rdquo; is a similar, larger store. Both let a site remember things
          between visits. {SITE.name} keeps its use of them minimal - most of our
          tools run entirely in your browser and need no cookies at all.
        </p>
      </LegalSection>

      <LegalSection title="Exactly who sets what">
        <p>
          Two third parties can set cookies or similar identifiers here, and both are
          Google services. Nothing else on this site loads third-party scripts: fonts
          are self-hosted and our tools process your files on your own device.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-foreground">Google AdSense</strong> (
            <A href="https://policies.google.com/technologies/ads">
              Google advertising cookies
            </A>
            ). The site is free and supported by ads. Google Consent Mode starts with
            every ad storage type <em>denied</em>. Nothing personalised is stored until
            consent is given.
          </li>
          <li>
            <strong className="text-foreground">Google Analytics 4</strong>. Aggregate
            usage measurement. It also starts denied, and in the EEA, UK and
            Switzerland the Analytics script is not even loaded until the consent
            banner is answered.
          </li>
          <li>
            <strong className="text-foreground">First-party storage (no tracking).</strong>{" "}
            Theme, interface density, favourites, recent tools, your consent and
            privacy choices, and per-tool preferences live in your browser&apos;s local
            storage and never leave your device.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Consent, by region">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-foreground">EEA, UK and Switzerland.</strong> Consent
            is collected by Google&apos;s certified consent management platform
            (&ldquo;Privacy &amp; messaging&rdquo;), integrated with the IAB
            Transparency &amp; Consent Framework (TCF). Advertising and analytics tags
            wait for your answer. Declining keeps every tool on the site fully
            working.
          </li>
          <li>
            <strong className="text-foreground">California (CCPA/CPRA).</strong> Use the
            &ldquo;Do Not Sell or Share My Personal Information&rdquo; link in the
            footer. Opting out turns on Google&apos;s restricted data processing and
            non-personalised ads.
          </li>
          <li>
            <strong className="text-foreground">Global Privacy Control.</strong> If your
            browser sends the <A href="https://globalprivacycontrol.org/">GPC</A>{" "}
            signal, we treat it as an opt-out automatically - no clicks required.
          </li>
          <li>
            <strong className="text-foreground">Everywhere else.</strong> Our own banner
            asks once. Ad and analytics storage stays denied until you accept, and
            your choice is remembered on your device.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul className="list-disc space-y-2 pl-6">
          <li>Manage or delete cookies in your browser settings at any time.</li>
          <li>
            Opt out of personalised ads via{" "}
            <A href="https://www.google.com/settings/ads">Google Ads Settings</A> or{" "}
            <A href="https://www.aboutads.info/choices/">aboutads.info/choices</A>.
          </li>
          <li>
            Use the footer&apos;s &ldquo;Do Not Sell or Share&rdquo; link, or enable
            GPC in your browser, for the California-law opt-out.
          </li>
          <li>Use your browser&apos;s private/incognito mode to avoid persistent storage.</li>
        </ul>
      </LegalSection>

      <LegalSection title="More information">
        <p>
          Cookies are part of how we handle data overall - see our{" "}
          <A href={ROUTES.privacy}>Privacy Policy</A> for the full picture. Questions?
          Email <A href={`mailto:${SITE.email}`}>{SITE.email}</A>.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
