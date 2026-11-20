import type { Metadata } from "next";

import { ROUTES } from "@/config/constants";
import { formatDate } from "@/lib/utils";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { CamelMark } from "@/components/verify/camel-mark";

/**
 * The GigAI Verify EXTENSION's privacy policy, the URL the Chrome Web Store
 * listing points at.
 *
 * Distinct from /privacy (the platform-wide policy) because the Store requires
 * a policy covering the extension's own data practices, and the platform page
 * says nothing about permissions, page reading or the engine call.
 *
 * CONTENT CONTRACT: this page mirrors `GigAI Verify/docs/PRIVACY.md`, which is
 * the source of truth, the extension repo's claims audit checks that document
 * against the built manifest. Edit there first, then reflect the change here.
 */

export const metadata: Metadata = {
  title: "GigAI Verify Privacy Policy · GigAI Tools",
  description:
    "What the GigAI Verify browser extension reads, when, and what it never collects. No telemetry, no tracking, local analysis by default.",
  alternates: { canonical: "/verify/privacy" },
};

const LAST_UPDATED = "2026-08-13";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "GigAI Verify", href: ROUTES.verify },
  { label: "Privacy", href: "/verify/privacy" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function VerifyPrivacyPage() {
  return (
    <div className="py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMB)} />
      <Container>
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              <CamelMark size={44} className="shrink-0" />
              GigAI Verify, Privacy
            </span>
          }
          description="The short version: the extension holds no site permissions and reads a page only when you ask it to."
          breadcrumb={BREADCRUMB}
        />
      </Container>

      <Container size="narrow" className="mt-12">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(LAST_UPDATED)} · Applies to the GigAI Verify
          browser extension for Chrome and Edge.
        </p>

        <div className="prose-measure mt-8 space-y-8 text-base leading-relaxed text-muted-foreground">
          <Section title="Permissions, and why each exists">
            <ul className="space-y-2">
              <li>
                <strong className="text-foreground">activeTab</strong> - one-off access
                to the single tab you acted on, granted by your gesture and expiring on
                navigation. This is the entire read path in the default configuration.
              </li>
              <li>
                <strong className="text-foreground">scripting</strong> - required to run
                the content extractor inside that granted tab.
              </li>
              <li>
                <strong className="text-foreground">sidePanel</strong> - the result UI.
              </li>
              <li>
                <strong className="text-foreground">contextMenus</strong> - the
                &ldquo;Verify with GigAI&rdquo; right-click item.
              </li>
              <li>
                <strong className="text-foreground">storage</strong> - local settings and
                history. Never synced.
              </li>
            </ul>
            <p>
              Deliberately absent: <code>&lt;all_urls&gt;</code> host permissions,{" "}
              <code>tabs</code>, <code>history</code>, <code>cookies</code>,{" "}
              <code>webRequest</code>, <code>downloads</code>, <code>management</code>.
            </p>
            <p>
              Optional host access (off by default) is requested at runtime only for two
              features: the floating selection button, and fetching cross-origin
              image/PDF bytes the page itself cannot supply. Turning the selection
              button off unregisters its script <em>and removes the permission</em>.
              Declining either leaves every other feature working.
            </p>
          </Section>

          <Section title="When page content is read">
            <p>Only in direct response to one of these:</p>
            <ul className="space-y-1">
              <li>clicking the toolbar icon and pressing a check button</li>
              <li>choosing “Verify with GigAI” from the right-click menu</li>
              <li>pressing the keyboard shortcut (default Alt+Shift+V)</li>
              <li>pressing a check button in the side panel</li>
              <li>clicking the floating selection button, if you enabled it</li>
            </ul>
            <p>
              There is no tab listener, no navigation hook, and no timer that reads a
              page. The service worker has no code path that reaches a page without one
              of the gestures above.
            </p>
          </Section>

          <Section title="What is never collected">
            <p>
              The extractor skips form elements entirely - <code>input</code>,{" "}
              <code>textarea</code>, <code>select</code>, <code>button</code>,{" "}
              <code>label</code>, <code>form</code> and anything{" "}
              <code>contenteditable</code> - along with scripts, iframes, hidden
              elements, navigation, footers, and ad/cookie/banner furniture. Their
              contents cannot enter the analysis even by accident.
            </p>
            <p>
              Consequently GigAI Verify never sees{" "}
              <strong className="text-foreground">
                passwords, payment fields, form values, search queries you have typed, or
                half-written messages
              </strong>
              . It also never reads cookies, localStorage, authentication tokens or
              browsing history. It holds no permission that would allow any of them.
              Meta tags matching verification/token/CSRF/nonce/API-key patterns are
              dropped during metadata collection. This is enforced by an automated test
              that runs the real extractor against a page seeded with sentinel
              credentials and fails the build if any of them survive.
            </p>
          </Section>

          <Section title="Where analysis happens">
            <p>
              <strong className="text-foreground">Local analysis (default).</strong>{" "}
              Everything runs in your browser. No network request is made. The result is
              badged Local analysis.
            </p>
            <p>
              <strong className="text-foreground">GigAI analysis (opt-in).</strong> Only
              if you both enable it and configure an engine address. The content you
              asked to check is sent to that endpoint over HTTPS with credentials
              omitted, held in memory for one request, and discarded with the response  -
              nothing is written to a database or disk, and no submitted content is
              logged. The result is badged GigAI analysis.
            </p>
            <p>
              The badge reports what actually happened to your content, not what you
              asked for. If a cloud call is issued but no usable reply comes back, the
              badge reads &ldquo;Sent · analysed locally&rdquo; and it never claims
              content stayed local after a request has gone out. No API keys ship in the
              extension.
            </p>
          </Section>

          <Section title="What is stored">
            <p>
              Local browser storage only. There is no account and nothing is synced.
              Settings, a history of at most 30 results (verdict, confidence, content
              type, page title, host, timestamp), a local calibration record you can
              reset in one click, and a local feedback tally.{" "}
              <strong className="text-foreground">
                The analysed content itself is never stored
              </strong>{" "}
              - not the article text, not your selection, not image bytes. Switch off
              &ldquo;Remember page addresses&rdquo; and history keeps only hostnames, so
              it cannot become a browsing record. Clear history removes everything
              immediately.
            </p>
          </Section>

          <Section title="The website handoff">
            <p>
              &ldquo;Full report&rdquo; opens gigai.tools/verify with a result summary in
              the URL <em>fragment</em> (<code>#r=…</code>). Browsers never transmit a
              fragment to the server, so this cannot leak through access logs, referrer
              headers or a CDN cache. What travels: verdict, confidence, content type,
              hostname, mode, timestamp and each signal&rsquo;s label. What does not:
              the page content, any excerpt, any metadata value, or the URL of what you
              checked.
            </p>
          </Section>

          <Section title="No telemetry">
            <p>
              No analytics, no crash reporting, no usage pings, no install beacon, no
              remote configuration, no third-party SDKs, trackers or ad networks. The
              thumbs up/down feedback control writes a counter to local storage and nothing is
              transmitted. There is no endpoint to transmit it to. The extension makes
              exactly one kind of outbound request: the opt-in engine call described
              above. You can verify this yourself: open DevTools → Network, browse
              normally with the extension installed, and confirm there are zero requests
              until you press a check button.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy:{" "}
              <a className="text-primary underline-offset-4 hover:underline" href={ROUTES.contact}>
                gigai.tools/contact
              </a>
              .
            </p>
          </Section>
        </div>
      </Container>
    </div>
  );
}
