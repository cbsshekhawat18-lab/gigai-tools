import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { JsonLd, webApiJsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { getEngines } from "@/lib/devdocs/engines";

export const metadata: Metadata = buildMetadata({
  title: "Developer API - process files with one HTTP call",
  description:
    "The GigAI Tools developer API: compress, convert and process PDFs, images and documents from your own code. Free plan, API key in two minutes.",
  canonical: "/developers",
});

/**
 * Developer landing (Phase 2 scope: account + keys; tool endpoints arrive in
 * Phase 3 and this page grows a quickstart when they exist - the docs never
 * promise what the API can't run yet).
 */
export default function DevelopersPage() {
  return (
    <section className="py-12">
      <JsonLd data={[webApiJsonLd()]} />
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-foreground">Developer API</h1>
        <p className="mt-3 max-w-[70ch] text-muted-foreground">
          Run GigAI tools from your own code. Create an account, make a key, call the
          API. The free plan has 1,000 tasks a month with no card and no trial clock.
        </p>
        <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">
          You never need an account for the tools on this site - they run in your
          browser and stay free. Accounts exist only for the API, because API files
          are processed on our server. API files are deleted after processing, are
          never used for anything except your job, and are never used for training.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/developers/signup"
            className="rounded bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Create a free account
          </Link>
          <Link
            href="/developers/login"
            className="rounded border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-foreground/40"
          >
            Sign in
          </Link>
        </div>

        <h2 className="mt-12 text-lg font-semibold text-foreground">What&apos;s live now</h2>
        <ul className="mt-3 max-w-[70ch] list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Accounts with email verification, session login, account deletion</li>
          <li>API keys: create, list, revoke. Secrets are shown once and stored hashed</li>
          <li>Free-plan limits and usage tracking, visible in the dashboard</li>
          <li>
            The jobs pipeline: import files, run a tool, export signed download links.
            Webhooks with HMAC signatures, idempotent retries, verified deletion after
            the retention you choose
          </li>
          <li>
            {getEngines().length} engines, each with golden tests: PDF (merge, split,
            rotate, delete pages, page numbers, watermark, metadata, to text, to JPG,
            from images), image (convert, resize, compress to a target size, crop,
            rotate, flip, grayscale, blur, strip metadata), SVG (optimize, to PNG),
            data (JSON, YAML, CSV, format), code minifiers, Markdown and HTML,
            subtitles, QR codes
          </li>
        </ul>
        <p className="mt-3 max-w-[70ch] text-sm text-muted-foreground">
          The API answers at{" "}
          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            https://api.gigai.tools/v1
          </code>{" "}
          - try{" "}
          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            curl https://api.gigai.tools/v1/tools
          </code>{" "}
          right now, no key needed for the catalog. This page never lists an endpoint
          that doesn&apos;t work.
        </p>

        <h2 className="mt-12 text-lg font-semibold text-foreground">Documentation</h2>
        <ul className="mt-3 max-w-[70ch] space-y-1 text-sm">
          <li>
            <Link href="/developers/docs" className="text-primary hover:underline">Quickstart</Link>
            <span className="text-muted-foreground"> - first job in three requests</span>
          </li>
          <li>
            <Link href="/developers/docs/jobs" className="text-primary hover:underline">Jobs and tasks</Link>
            <span className="text-muted-foreground"> - graphs, states, idempotency, retention</span>
          </li>
          <li>
            <Link href="/developers/docs/tools" className="text-primary hover:underline">Tool catalog</Link>
            <span className="text-muted-foreground"> - every engine with its options</span>
          </li>
          <li>
            <Link href="/developers/docs/webhooks" className="text-primary hover:underline">Webhooks</Link>
            <span className="text-muted-foreground"> - signed notifications with verify code</span>
          </li>
          <li>
            <Link href="/developers/docs/sdks" className="text-primary hover:underline">SDKs</Link>
            <span className="text-muted-foreground"> - Python, Node and the gigai CLI</span>
          </li>
          <li>
            <Link href="/developers/docs/mcp" className="text-primary hover:underline">MCP server</Link>
            <span className="text-muted-foreground"> - the tools inside Claude and other agents</span>
          </li>
          <li>
            <Link href="/developers/errors" className="text-primary hover:underline">Error codes</Link>
            <span className="text-muted-foreground"> and </span>
            <Link href="/developers/rate-limits" className="text-primary hover:underline">rate limits</Link>
          </li>
          <li>
            <a href="/developers/openapi.yaml" className="text-primary hover:underline">openapi.yaml</a>
            <span className="text-muted-foreground"> - the machine-readable contract</span>
          </li>
        </ul>

        <p className="mt-8 text-sm">
          <Link href="/developers/dashboard" className="font-semibold text-primary hover:underline">
            Open the dashboard
          </Link>
        </p>
      </Container>
    </section>
  );
}
