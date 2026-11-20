import type { Metadata } from "next";
import Link from "next/link";

import { OPEN_SOURCE, ROUTES, SITE } from "@/config/constants";
import { pageMetadata } from "@/lib/seo";
import { getTotalToolCount } from "@/lib/registry";
import { JsonLd } from "@/lib/schema";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";

export const metadata: Metadata = pageMetadata("openSource");

const LAST_UPDATED = "2026-11-20";

const BREADCRUMB = [
  { label: "Home", href: ROUTES.home },
  { label: "Open Source", href: ROUTES.openSource },
];

const docs = (path = "") => `${OPEN_SOURCE.docs}${path}`;
const repo = (path = "") => `${OPEN_SOURCE.repo}${path}`;

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

export default function OpenSourcePage() {
  const toolCount = getTotalToolCount();
  return (
    <LegalDoc
      title="Open Source"
      description={`The code behind ${SITE.name} is open source. You can read what each tool does with your file, run the site yourself, or build on it.`}
      breadcrumb={BREADCRUMB}
      lastUpdated={LAST_UPDATED}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: SITE.name,
          codeRepository: OPEN_SOURCE.repo,
          license: "https://www.apache.org/licenses/LICENSE-2.0",
          programmingLanguage: ["TypeScript", "Python"],
          targetProduct: { "@type": "SoftwareApplication", name: SITE.name, url: SITE.url },
        }}
      />

      <LegalSection title="Where the code is">
        <p>
          Every tool on this site, all {toolCount} of them, is in one public repository:{" "}
          <A href={OPEN_SOURCE.repo}>github.com/cbsshekhawat18-lab/gigai-tools</A>. The
          documentation, with a page for every part, is at{" "}
          <A href={OPEN_SOURCE.docs}>cbsshekhawat18-lab.github.io/gigai-tools</A>.
        </p>
      </LegalSection>

      <LegalSection title="Why it is open">
        <p>
          Most of our tools process your files in your browser, so nothing is uploaded. With
          the code public, you do not have to take that on trust: you can read what each tool
          does with a file. The documentation lists{" "}
          <A href={docs("privacy-model/")}>which tools use a server, and what the server keeps</A>.
        </p>
      </LegalSection>

      <LegalSection title="What is in the repository">
        <ul>
          <li>
            <strong>The website</strong>: every tool page, its interface and the engine that runs
            in your browser.
          </li>
          <li>
            <strong>The backend</strong>: the FastAPI service behind the few features a browser
            cannot do alone, such as Video to Work analysis.
          </li>
          <li>
            <strong>The developer API</strong> and its task worker, behind{" "}
            <Link href="/developers" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
              GigAI for developers
            </Link>
            .
          </li>
          <li>
            <strong>Example server files</strong> for running it on your own machine or server,
            and Docker files for the website and the backend.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Run it yourself">
        <p>You need Node 20 or later. Three commands start the site on your machine:</p>
        <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 text-sm">
          <code>{`git clone ${OPEN_SOURCE.repo}.git\ncd gigai-tools\nnpm install && npm run dev`}</code>
        </pre>
        <p>
          The <A href={docs("quickstart/")}>quickstart</A> adds the backend, and{" "}
          <A href={docs("self-hosting/")}>self-hosting</A> covers your own server.
        </p>
      </LegalSection>

      <LegalSection title="Licence and name">
        <p>
          The code is licensed under the <A href={repo("/blob/main/LICENSE")}>Apache License 2.0</A>:
          you may use, change and run it, including on your own site. One optional backend
          module, PDF repair, is AGPL-3.0 because of a library it uses. The {SITE.name} name and
          logo are not covered by the licence, so a public copy uses its own;{" "}
          <A href={repo("/blob/main/TRADEMARKS.md")}>TRADEMARKS.md</A> explains how.
        </p>
      </LegalSection>

      <LegalSection title="Contribute">
        <p>
          Found a tool that gives a wrong result? <A href={repo("/issues/new/choose")}>Open an issue</A>,
          with a file that fails if you can share one. Code changes are welcome as pull requests;
          the <A href={repo("/blob/main/CONTRIBUTING.md")}>contributing guide</A> explains how.
          Report security problems privately, as the{" "}
          <A href={repo("/blob/main/SECURITY.md")}>security policy</A> describes.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
