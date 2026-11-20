import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "Jobs and tasks - the API's execution model",
  description:
    "How GigAI API jobs work: task graphs, imports and exports, states, long-polling, cancellation, idempotency keys, retention and quotas.",
  canonical: "/developers/docs/jobs",
});

export default function DocsJobs() {
  return (
    <DocsShell
      title="Jobs and tasks"
      lead="A job is a small graph of named tasks. The server runs them in dependency order and tells you exactly what happened to each."
      current="/developers/docs/jobs"
    >
      <div>
        <DocH2 id="operations">Operations</DocH2>
        <P>Each task has an operation and, except for imports, names its inputs.</P>
        <ul className="mt-3 max-w-[70ch] list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <code className="font-mono text-foreground">import/url</code> - the server fetches an
            http(s) URL. Add <code className="font-mono">filename</code> to override the name.
          </li>
          <li>
            <code className="font-mono text-foreground">import/base64</code> - inline upload:{" "}
            <code className="font-mono">file</code> (base64) and <code className="font-mono">filename</code>.
          </li>
          <li>
            Any tool slug from{" "}
            <Link href="/developers/docs/tools" className="text-primary hover:underline">
              the catalog
            </Link>{" "}
            - takes <code className="font-mono">input</code> plus that tool&apos;s options.
          </li>
          <li>
            <code className="font-mono text-foreground">export/url</code> - makes the files of its
            input tasks downloadable through signed URLs.
          </li>
        </ul>
        <P>
          A job holds up to 20 tasks. The graph is validated at create time: unknown
          operations, unknown option names, wrong option types, missing required
          options, references to tasks that do not exist, and cycles are all rejected
          with an error naming the exact task and field.
        </P>
      </div>

      <div>
        <DocH2 id="states">States</DocH2>
        <P>
          Tasks move waiting, processing, then finished, error or cancelled. The job
          mirrors them: it is finished only when every task finished. One failed task
          fails the job and cancels its remaining waiting tasks. Failed tasks carry an{" "}
          <Link href="/developers/errors" className="text-primary hover:underline">
            error code
          </Link>{" "}
          and a message that names the file or option at fault.
        </P>
      </div>

      <div>
        <DocH2 id="endpoints">Endpoints</DocH2>
        <Code>{`POST   /v1/jobs             create (201, or 200 on an Idempotency-Key replay)
GET    /v1/jobs             list recent, ?status= and ?limit=
GET    /v1/jobs/{id}        current state
GET    /v1/jobs/{id}/wait   long-poll until settled (~55 s max per call)
DELETE /v1/jobs/{id}        cancel and delete every file immediately
GET    /v1/tasks/{id}       one task
GET    /v1/files/{id}       file metadata plus a fresh signed URL
DELETE /v1/files/{id}       delete now, deletion verified`}</Code>
      </div>

      <div>
        <DocH2 id="idempotency">Idempotency</DocH2>
        <P>
          Send an <code className="font-mono">Idempotency-Key</code> header on create.
          A retry with the same key returns the job made the first time instead of
          running the work twice. Keys are per account, up to 200 characters.
        </P>
      </div>

      <div>
        <DocH2 id="retention">Retention</DocH2>
        <P>
          <code className="font-mono">retention_s</code> (0 to 86400, default 3600)
          starts when the job finishes. After it, files are deleted, deletion is
          verified against the store, and an audit row records it. Zero means one
          download or 60 seconds, whichever comes first. DELETE the job or the file
          to purge earlier.
        </P>
      </div>

      <div>
        <DocH2 id="quotas">Quotas and sandbox</DocH2>
        <P>
          The free plan runs 1,000 tool tasks a month, 5 jobs at a time, files up to
          100 MB. Import and export tasks are free. Keys created as sandbox
          (gk_test_) run the same pipeline with nothing counted, files up to 10 MB
          and retention capped at 15 minutes. Limits and usage show in the{" "}
          <Link href="/developers/dashboard" className="text-primary hover:underline">
            dashboard
          </Link>
          .
        </P>
      </div>
    </DocsShell>
  );
}
