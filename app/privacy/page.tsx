import type { Metadata } from "next";

import { ROUTES, SITE } from "@/config/constants";
import { formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = pageMetadata("privacy");

const LAST_UPDATED = "2026-08-21";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Privacy Policy", href: ROUTES.privacy },
];

export default function PrivacyPage() {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />
      <Container>
        <PageHeader
          title="Privacy Policy"
          description="The short version: we keep the data we collect to a minimum, and most tools process your files right in your browser."
          breadcrumb={BREADCRUMB}
        />
      </Container>

      <Container size="narrow" className="mt-12">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(LAST_UPDATED)}
        </p>

        <div className="prose-measure mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Overview</h2>
            <p>
              {SITE.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by{" "}
              {SITE.brand}. We&apos;ve designed the platform to be private by default.
              Wherever it is technically possible, tools run entirely inside your
              browser, which means your files are never uploaded to us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Your files</h2>
            <p>
              For browser-based tools, the content you drop in, images, PDFs, text  -
              is processed on your device and is not transmitted to our servers. When a
              specific tool genuinely requires server-side processing, that will be
              clearly indicated on the tool itself, and any uploaded data is used only
              to perform the requested operation and is not retained beyond what is
              needed to return your result.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Information we collect
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-foreground">Usage analytics (Google Analytics 4).</strong>{" "}
                Aggregate statistics such as which tools are popular. Google Consent
                Mode starts with every storage type denied. In the EEA, UK and
                Switzerland the Analytics script is not loaded at all until the consent
                message is answered. This data does not identify you.
              </li>
              <li>
                <strong className="text-foreground">Local storage.</strong> Small
                preferences, like your theme and recent searches, are stored in your
                browser only and never leave your device.
              </li>
              <li>
                <strong className="text-foreground">Contact messages.</strong> If you
                email us or use the contact form, we receive the details you send so we
                can reply.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Cookies &amp; advertising
            </h2>
            <p>
              We use cookies and local storage to remember your preferences (such as
              theme and recent searches) and to keep the site working. This site is free
              to use and is supported by advertising served by{" "}
              <strong className="text-foreground">Google AdSense</strong> and other
              third-party vendors.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on
                your prior visits to this and other websites.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to
                serve ads to you based on your visits to this site and/or other sites on
                the Internet.
              </li>
              <li>
                You can opt out of personalised advertising via{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Google Ads Settings
                </a>
                , or opt out of third-party vendors&apos; cookies at{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  aboutads.info/choices
                </a>
                . You can also manage or block cookies in your browser settings.
              </li>
              <li>
                You can learn more about how Google uses data from sites that use its
                services at{" "}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  policies.google.com/technologies/partner-sites
                </a>
                .
              </li>
              <li>
                If you are in the European Economic Area, the UK, or Switzerland,
                consent is collected by Google&apos;s certified consent management
                platform (&ldquo;Privacy &amp; messaging&rdquo;), integrated with the
                IAB Transparency &amp; Consent Framework (TCF v2.2), before any
                advertising or analytics storage is used. You can change or withdraw
                that choice at any time (reopen the consent message, or clear this
                site&apos;s data in your browser to be asked again).
              </li>
              <li>
                California residents (CCPA/CPRA): the &ldquo;Do Not Sell or Share My
                Personal Information&rdquo; link in the footer opts you out by turning
                on Google&apos;s restricted data processing and non-personalised ads.
                Browsers that send the Global Privacy Control (GPC) signal are opted
                out automatically, with no action needed.
              </li>
            </ul>
            <p>
              Advertising is only ever shown <em>around</em> the tools - never inside the
              tool workspace, and ad networks never receive the contents of your files,
              because browser-based tools process everything on your own device.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Third parties</h2>
            <p>
              Named plainly, these are the third parties involved in running this
              site, and what each one receives:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-foreground">Google AdSense</strong> serves the
                ads and provides the certified consent message. It never receives the
                contents of your files.
              </li>
              <li>
                <strong className="text-foreground">Google Analytics 4</strong> receives
                aggregate page-view data, consent-gated as described above.
              </li>
              <li>
                <strong className="text-foreground">Hugging Face&apos;s model CDN</strong>{" "}
                is contacted only when you start an on-device speech-recognition tool:
                your browser downloads the model file from it. Your audio and video are
                never sent anywhere. The download is one-way and cached.
              </li>
              <li>
                <strong className="text-foreground">Our own server</strong> is involved
                in exactly two disclosed features: the Video &rarr; Work analysis step
                (transcript text and selected frames, never the video file, and only
                when you choose the server provider over local Ollama) and the
                URL-fetch option in some SEO tools. Everything else is static hosting.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of any personal
              information you have shared with us directly. To make a request, contact
              us using the details below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p>
              Questions about this policy? Email us at{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                {SITE.email}
              </a>{" "}
              or visit our{" "}
              <a
                href={ROUTES.contact}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                contact page
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
