import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "Webhooks - signed job notifications",
  description:
    "Register an endpoint, verify the GigAI-Signature header, handle retries. Webhook reference for the GigAI Tools API.",
  canonical: "/developers/docs/webhooks",
});

export default function DocsWebhooks() {
  return (
    <DocsShell
      title="Webhooks"
      lead="Register an https endpoint once and every finished or failed job posts to it, signed so you can prove it came from us."
      current="/developers/docs/webhooks"
    >
      <div>
        <DocH2 id="register">Register an endpoint</DocH2>
        <Code>{`curl -X POST https://api.gigai.tools/v1/webhooks \\
  -H "Authorization: Bearer $GIGAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "url": "https://example.com/hooks/gigai", "events": ["job.finished", "job.failed"] }'`}</Code>
        <P>
          The answer includes the signing secret exactly once. Store it like a
          password. GET /v1/webhooks lists endpoints without secrets, DELETE
          /v1/webhooks/&#123;id&#125; removes one. The free plan allows 10 endpoints.
        </P>
      </div>

      <div>
        <DocH2 id="verify">Verify the signature</DocH2>
        <P>
          Each delivery carries a GigAI-Signature header. Recompute the HMAC over the
          timestamp and the raw body, compare, and reject stale timestamps.
        </P>
        <Code label="header">{`GigAI-Signature: t=1788542831,v1=6f2a...`}</Code>
        <Code label="python">{`import hashlib, hmac

def verify(secret: str, header: str, body: bytes, max_age_s: int = 300) -> bool:
    parts = dict(p.split("=", 1) for p in header.split(","))
    expected = hmac.new(secret.encode(), f"{parts['t']}.".encode() + body,
                        hashlib.sha256).hexdigest()
    import time
    fresh = abs(time.time() - int(parts["t"])) < max_age_s
    return fresh and hmac.compare_digest(expected, parts["v1"])`}</Code>
        <Code label="node">{`import { createHmac, timingSafeEqual } from "node:crypto";

function verify(secret, header, rawBody, maxAgeS = 300) {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const expected = createHmac("sha256", secret)
    .update(\`\${parts.t}.\`).update(rawBody).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < maxAgeS;
  return fresh && timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}`}</Code>
      </div>

      <div>
        <DocH2 id="payload">Payload</DocH2>
        <Code>{`{
  "event": "job.finished",
  "job": {
    "id": "job_...", "tag": "your-tag", "status": "finished",
    "sandbox": false, "created_at": "...", "finished_at": "..."
  }
}`}</Code>
        <P>
          Job metadata only, never file contents. Fetch the job over the API for its
          tasks and download URLs.
        </P>
      </div>

      <div>
        <DocH2 id="retries">Retries</DocH2>
        <P>
          Answer with any 2xx inside 10 seconds. Anything else retries 5 times at 1,
          5, 30, 120 and 360 minutes. Deliveries can arrive more than once, so make
          the handler idempotent on the job id.
        </P>
      </div>
    </DocsShell>
  );
}
