import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs/docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "API rate limits and quotas",
  description:
    "The GigAI Tools API free plan limits: requests per minute, monthly tasks, concurrency, file sizes, and how to read the X-RateLimit headers.",
  canonical: "/developers/rate-limits",
});

export default function RateLimitsPage() {
  return (
    <DocsShell
      title="Rate limits and quotas"
      lead="One free plan, real numbers. Rate limiting answers 429 with headers that say exactly when to come back."
      current="/developers/rate-limits"
    >
      <div>
        <DocH2 id="free-plan">The free plan</DocH2>
        <ul className="mt-3 max-w-[70ch] list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>1,000 tool tasks a month. Imports and exports are free of quota.</li>
          <li>60 requests a minute per key.</li>
          <li>5 jobs running at the same time.</li>
          <li>
            Files up to 100 MB through import/url, tighter for some tools (the
            catalog says which). Inline import/base64 uploads carry up to 24 MB -
            use import/url for anything larger.
          </li>
          <li>10 webhook endpoints.</li>
          <li>Result retention up to 24 hours per job.</li>
        </ul>
        <P>
          Sandbox keys (gk_test_) never consume the monthly quota, with files capped
          at 10 MB and retention at 15 minutes. Usage shows in the{" "}
          <Link href="/developers/dashboard" className="text-primary hover:underline">
            dashboard
          </Link>
          . The quota resets on the first of each month.
        </P>
      </div>

      <div>
        <DocH2 id="headers">Reading the headers</DocH2>
        <Code>{`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 12
X-RateLimit-Reset: 1788542891
Retry-After: 4`}</Code>
        <P>
          Over the limit, the answer is 429 with code rate_limited. Sleep for
          Retry-After seconds and try again. Over the monthly quota, the answer is
          429 with code quota_exceeded and retrying does not help until the month
          rolls over.
        </P>
      </div>

      <div>
        <DocH2 id="behave">Being a good citizen</DocH2>
        <P>
          Use GET /v1/jobs/&#123;id&#125;/wait instead of polling GET /v1/jobs/&#123;id&#125;
          in a tight loop - one wait call holds for up to 55 seconds and returns the
          moment the job settles. Use Idempotency-Key on retries so a network blip
          never runs a job twice. The SDKs do both by default.
        </P>
      </div>
    </DocsShell>
  );
}
