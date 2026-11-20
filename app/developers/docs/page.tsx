import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "./docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "API Quickstart - first job in five minutes",
  description:
    "Authenticate with an API key, create a job, wait for it, download the result. The GigAI Tools API quickstart with curl examples.",
  canonical: "/developers/docs",
});

export default function DocsQuickstart() {
  return (
    <DocsShell
      title="Quickstart"
      lead="Create a key, send a job, download the result. Three requests end to end."
      current="/developers/docs"
    >
      <div>
        <DocH2 id="base">Base URL and auth</DocH2>
        <P>
          Every request carries your API key as a bearer token. Keys come from the{" "}
          <Link href="/developers/dashboard" className="text-primary hover:underline">
            dashboard
          </Link>{" "}
          after a free signup. The free plan gives 1,000 tasks a month.
        </P>
        <Code>{`https://api.gigai.tools/v1

Authorization: Bearer gk_live_...`}</Code>
        <P>
          The catalog needs no key - curl https://api.gigai.tools/v1/tools answers
          right now.
        </P>
      </div>

      <div>
        <DocH2 id="first-job">1. Create a job</DocH2>
        <P>
          A job is a set of named tasks. This one needs no input file: it generates a
          QR code and exports a download link.
        </P>
        <Code label="request">{`curl -X POST https://api.gigai.tools/v1/jobs \\
  -H "Authorization: Bearer $GIGAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tasks": {
      "qr":  { "operation": "generate-qr", "text": "https://example.com" },
      "out": { "operation": "export/url", "input": ["qr"] }
    }
  }'`}</Code>
        <P>The answer is the job with its id and every task in state waiting.</P>
      </div>

      <div>
        <DocH2 id="wait">2. Wait for it</DocH2>
        <P>
          Long-poll the wait endpoint. It returns as soon as the job settles, or after
          about 55 seconds with the current state so you can call it again in a loop.
        </P>
        <Code label="request">{`curl https://api.gigai.tools/v1/jobs/JOB_ID/wait \\
  -H "Authorization: Bearer $GIGAI_API_KEY"`}</Code>
      </div>

      <div>
        <DocH2 id="download">3. Download the result</DocH2>
        <P>
          The finished export task carries signed URLs. They need no auth header, so
          they work in curl, a browser, or anything else, until the retention you
          chose deletes the file.
        </P>
        <Code label="response (the export task)">{`{
  "name": "out", "status": "finished",
  "result": { "files": [
    { "filename": "qr.png", "size": 1577,
      "url": "https://gigai.tools/v1/files/file_.../download?e=...&s=..." }
  ]}
}`}</Code>
      </div>

      <div>
        <DocH2 id="files">Working with your own files</DocH2>
        <P>
          Import tasks bring files in, by URL or inline as base64. Chain any tool from
          the <Link href="/developers/docs/tools" className="text-primary hover:underline">catalog</Link>{" "}
          between import and export.
        </P>
        <Code>{`"tasks": {
  "in1":   { "operation": "import/url", "url": "https://example.com/a.pdf" },
  "in2":   { "operation": "import/base64", "file": "<base64>", "filename": "b.pdf" },
  "merge": { "operation": "merge-pdf", "input": ["in1", "in2"] },
  "out":   { "operation": "export/url", "input": ["merge"] }
}`}</Code>
      </div>

      <div>
        <DocH2 id="sdk">Or skip the HTTP entirely</DocH2>
        <P>
          The <Link href="/developers/docs/sdks" className="text-primary hover:underline">SDKs</Link>{" "}
          wrap the whole loop in one call:
        </P>
        <Code label="python">{`from gigai_tools import Client

Client().run("merge-pdf", files=["a.pdf", "b.pdf"], output="merged.pdf")`}</Code>
        <P>
          The full contract lives in the{" "}
          <a href="/developers/openapi.yaml" className="text-primary hover:underline">
            OpenAPI 3.1 spec
          </a>
          . Privacy is part of it: file contents are never logged, results are deleted
          after your chosen retention, and deletion is verified.
        </P>
      </div>
    </DocsShell>
  );
}
