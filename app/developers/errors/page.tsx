import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs/docs-shell";
import { REQUEST_ERRORS, TASK_ERRORS } from "@/lib/devdocs/errors-data";

export const metadata: Metadata = buildMetadata({
  title: "API error codes - every code, what it means, what to do",
  description:
    "Reference for every GigAI Tools API error code. Errors link here with an anchor, so the doc_url in an error response lands on its explanation.",
  canonical: "/developers/errors",
});

/**
 * Every error the API can emit links here as doc_url#code - keep the anchor
 * ids equal to the codes. Two families: request errors (the whole HTTP call
 * failed) and task errors (the job ran, one task inside it failed).
 */





export default function ErrorsPage() {
  return (
    <DocsShell
      title="Error codes"
      lead="Every error answer names a machine-readable code and links back to this page. Request errors fail the HTTP call. Task errors live inside a job's tasks."
      current="/developers/errors"
    >
      <div>
        <DocH2 id="shape">The error shape</DocH2>
        <Code>{`{
  "error": {
    "code": "invalid_option",
    "message": "Task 'qr': 'size' is above 2048.",
    "param": "size",
    "doc_url": "https://gigai.tools/developers/errors#invalid_option"
  }
}`}</Code>
        <P>
          Match on code, never on message text. Messages are for humans and may
          improve. param appears when one field is at fault.
        </P>
      </div>

      <div>
        <DocH2 id="request-errors">Request errors</DocH2>
        <div className="mt-3 space-y-4">
          {REQUEST_ERRORS.map(([code, status, text]) => (
            <div key={code} id={code} className="scroll-mt-24">
              <p className="text-sm">
                <code className="font-mono font-semibold text-foreground">{code}</code>
                <span className="ml-2 text-xs text-muted-foreground">HTTP {status}</span>
              </p>
              <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <DocH2 id="task-errors">Task errors</DocH2>
        <P>
          The job answers 2xx and finishes with status error. The failed task carries
          the code and message, and the job&apos;s remaining tasks are cancelled.
        </P>
        <div className="mt-3 space-y-4">
          {TASK_ERRORS.map(([code, text]) => (
            <div key={code} id={code} className="scroll-mt-24">
              <p className="text-sm">
                <code className="font-mono font-semibold text-foreground">{code}</code>
              </p>
              <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </DocsShell>
  );
}
