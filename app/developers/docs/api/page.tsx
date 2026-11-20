import type { Metadata } from "next";
import Link from "next/link";

import { CodePanel } from "@/components/devdocs/code-panel";
import { buildMetadata } from "@/lib/seo";
import { getEngines } from "@/lib/devdocs/engines";
import { LANGS, LANG_LABELS, endpointSample, runResponse, taskGraphJson } from "@/lib/devdocs/samples";
import { Code, DocH2, DocsShell, P } from "../docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "API reference - every endpoint",
  description:
    "Every GigAI Tools API endpoint: method, URL, auth scope, parameters, and errors. Jobs, tasks, files, webhooks, tools, account.",
  canonical: "/developers/docs/api",
});

/** One endpoint's documentation, data-driven so blocks stay uniform. */
type Param = { name: string; type: string; required?: boolean; text: string };
type Endpoint = {
  method: "GET" | "POST" | "DELETE" | "PATCH";
  path: string;
  summary: string;
  scope: string | null;
  params?: Param[];
  body?: Param[];
  errors?: string[];
  note?: string;
};

const METHOD_STYLE: Record<string, string> = {
  GET: "bg-emerald-600/10 text-emerald-700",
  POST: "bg-blue-600/10 text-blue-700",
  DELETE: "bg-red-600/10 text-red-700",
  PATCH: "bg-amber-600/10 text-amber-700",
};

const SECTIONS: { id: string; label: string; endpoints: Endpoint[] }[] = [
  {
    id: "tools",
    label: "Tools",
    endpoints: [
      { method: "GET", path: "/v1/tools", summary: "List every runnable engine with its options schema.", scope: null },
      { method: "GET", path: "/v1/tools/{slug}", summary: "One engine's contract.", scope: null, errors: ["not_found"] },
    ],
  },
  {
    id: "jobs",
    label: "Jobs",
    endpoints: [
      {
        method: "POST", path: "/v1/jobs", summary: "Create a job from a graph of named tasks.", scope: "jobs:write",
        body: [
          { name: "tasks", type: "object", required: true, text: "Task name to task. Operations: import/url, import/base64, any tool slug, export/url." },
          { name: "tag", type: "string", text: "Your own label, up to 128 chars, echoed back." },
          { name: "retention_s", type: "integer", text: "0..86400, default 3600. Zero means one download or 60 seconds." },
        ],
        params: [{ name: "Idempotency-Key", type: "header", text: "Same key returns the same job instead of re-running. Up to 200 chars." }],
        errors: ["invalid_request", "invalid_option", "file_too_large", "concurrent_limit", "quota_exceeded", "rate_limited"],
      },
      { method: "GET", path: "/v1/jobs", summary: "Recent jobs, newest first. ?status= and ?limit= (max 50).", scope: "jobs:read" },
      { method: "GET", path: "/v1/jobs/{id}", summary: "Current state, with export URLs once finished.", scope: "jobs:read", errors: ["not_found"] },
      { method: "GET", path: "/v1/jobs/{id}/wait", summary: "Long-poll: answers when the job settles or after ~55 s.", scope: "jobs:read", errors: ["not_found"] },
      { method: "DELETE", path: "/v1/jobs/{id}", summary: "Cancel outstanding work and delete every file immediately, verified.", scope: "jobs:write", errors: ["not_found"] },
      { method: "GET", path: "/v1/tasks/{id}", summary: "One task by id.", scope: "jobs:read", errors: ["not_found"] },
    ],
  },
  {
    id: "files",
    label: "Files",
    endpoints: [
      { method: "GET", path: "/v1/files/{id}", summary: "Metadata plus a fresh signed download URL.", scope: "jobs:read", errors: ["not_found"] },
      { method: "DELETE", path: "/v1/files/{id}", summary: "Delete now, without waiting for retention. Answer confirms verification.", scope: "jobs:write", errors: ["not_found"] },
      {
        method: "GET", path: "/v1/files/{id}/download", summary: "The signed download itself - no auth header, the signature is the auth.", scope: null,
        params: [
          { name: "e", type: "integer", required: true, text: "Expiry, unix epoch." },
          { name: "s", type: "string", required: true, text: "HMAC signature." },
        ],
        errors: ["bad_signature", "not_found"],
      },
    ],
  },
  {
    id: "webhooks",
    label: "Webhooks",
    endpoints: [
      {
        method: "POST", path: "/v1/webhooks", summary: "Register an https endpoint. The signing secret is in the answer exactly once.", scope: "webhooks:manage",
        body: [
          { name: "url", type: "string", required: true, text: "https only, must resolve to a public address." },
          { name: "events", type: "string[]", text: "Subset of job.finished, job.failed. Default: both." },
        ],
        errors: ["invalid_request", "webhook_limit"],
      },
      { method: "GET", path: "/v1/webhooks", summary: "List endpoints. Secrets never included.", scope: "webhooks:manage" },
      { method: "DELETE", path: "/v1/webhooks/{id}", summary: "Disable an endpoint.", scope: "webhooks:manage", errors: ["not_found"] },
    ],
  },
  {
    id: "account",
    label: "Account & auth",
    endpoints: [
      { method: "POST", path: "/v1/auth/signup", summary: "Create an account. Sends a verification email.", scope: null, body: [
        { name: "email", type: "string", required: true, text: "A real inbox - the verify link goes there." },
        { name: "password", type: "string", required: true, text: "At least 10 characters." },
      ], errors: ["email_taken", "invalid_email", "weak_password"] },
      { method: "POST", path: "/v1/auth/login", summary: "Exchange credentials for a 12-hour dashboard session token.", scope: null, errors: ["bad_credentials", "email_unverified", "account_suspended"] },
      { method: "GET", path: "/v1/account", summary: "Plan, limits and this month's usage. Session auth.", scope: null },
      { method: "POST", path: "/v1/keys", summary: "Create an API key. The secret appears once. Session auth.", scope: null, errors: ["too_many_keys"] },
      { method: "DELETE", path: "/v1/keys/{id}", summary: "Revoke a key. Session auth.", scope: null, errors: ["not_found"] },
    ],
  },
  {
    id: "agent",
    label: "Agent planning",
    endpoints: [
      {
        method: "POST", path: "/v1/agent/plan",
        summary: "Goal sentence + file metadata in, a tool pipeline out - planned by a free-tier model chain and meant to be validated against the live catalog before running. Strictly text-only: file contents are never accepted. 10 plans/day per account.",
        scope: "API key",
        body: [
          { name: "goal", type: "string", required: true, text: "What should happen, one sentence, up to 500 chars." },
          { name: "files", type: "array", text: "Up to 10 entries of {name, type, size, width?, height?} - metadata only." },
          { name: "catalogue", type: "array", text: "Optional tool list to plan against (the MCP server sends its own). Defaults to the server engine catalog." },
        ],
        errors: ["invalid_request", "agent_quota", "planning_unavailable"],
        note: "planning_unavailable is the honest dormant state: callers fall back to local planning (the /ask page and MCP clients both have one).",
      },
      {
        method: "POST", path: "/v1/agent/learn",
        summary: "Store one opt-in learning record: goal, plan, step outcomes, whether the plan was edited. Never file names, contents or results; records are metadata-sized and refused otherwise. The answer echoes exactly what was stored.",
        scope: "API key",
        body: [
          { name: "opt_in", type: "boolean", required: true, text: "Must be literally true - there is no implicit consent." },
          { name: "goal", type: "string", required: true, text: "The goal sentence." },
          { name: "plan", type: "object", required: true, text: "The plan that ran, {steps: [...]}." },
          { name: "outcomes", type: "array", required: true, text: "Per step: {toolId, ok, corrected}." },
          { name: "edited", type: "boolean", text: "Whether the user changed the proposed plan before running." },
        ],
        errors: ["invalid_request"],
      },
    ],
  },
];

function EndpointBlock({ e }: { e: Endpoint }) {
  const anchor = `${e.method.toLowerCase()}-${e.path.replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <div id={anchor} className="scroll-mt-24 border-b border-border pb-6 last:border-b-0">
      <p className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${METHOD_STYLE[e.method]}`}>
          {e.method}
        </span>
        <code className="font-mono text-[13px] text-foreground">{e.path}</code>
      </p>
      <p className="mt-1.5 max-w-[70ch] text-sm text-muted-foreground">{e.summary}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Auth: {e.scope ? <code className="font-mono">{e.scope}</code> : e.path.startsWith("/v1/auth") || e.path.includes("download") || e.path.startsWith("/v1/tools") ? "none" : "dashboard session"}
      </p>
      {e.params?.length ? (
        <ul className="mt-2 max-w-[70ch] space-y-1 text-sm text-muted-foreground">
          {e.params.map((p) => (
            <li key={p.name}>
              <code className="font-mono text-foreground">{p.name}</code>
              <span className="text-xs"> ({p.type}{p.required ? ", required" : ""})</span> - {p.text}
            </li>
          ))}
        </ul>
      ) : null}
      {e.body?.length ? (
        <div className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Body</p>
          <ul className="mt-1 max-w-[70ch] space-y-1 text-sm text-muted-foreground">
            {e.body.map((p) => (
              <li key={p.name}>
                <code className="font-mono text-foreground">{p.name}</code>
                <span className="text-xs"> ({p.type}{p.required ? ", required" : ""})</span> - {p.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {e.errors?.length ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Errors:{" "}
          {e.errors.map((code, i) => (
            <span key={code}>
              {i > 0 ? ", " : ""}
              <Link href={`/developers/errors#${code}`} className="text-primary hover:underline">
                {code}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

export default function ApiReferencePage() {
  const merge = getEngines().find((e) => e.slug === "merge-pdf")!;
  const body = `{"tasks": {\n${taskGraphJson(merge, "  ")}\n}}`;
  const request: Record<string, string> = {};
  for (const lang of LANGS) request[lang] = endpointSample(lang, "POST", "/jobs", body);
  return (
    <DocsShell
      title="API reference"
      lead="Every endpoint, in the order you meet them: catalog, jobs, files, webhooks, account. Machine-readable version: openapi.yaml."
      current="/developers/docs/api"
      panel={
        <CodePanel
          samples={{
            langs: LANGS.map((id) => ({ id, label: LANG_LABELS[id] })),
            request,
            response: runResponse(merge),
            responseLabel: "Finished job",
          }}
        />
      }
    >
      <div>
        <DocH2 id="base">Base URL and auth</DocH2>
        <Code>{`https://api.gigai.tools/v1
Authorization: Bearer gk_live_...`}</Code>
        <P>
          Scopes live on keys. New keys carry jobs:read, jobs:write, tools:run and
          webhooks:manage. gk_test_ keys are sandbox: nothing counts against quota.
        </P>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.id}>
          <DocH2 id={section.id}>{section.label}</DocH2>
          <div className="mt-4 space-y-6">
            {section.endpoints.map((e) => (
              <EndpointBlock key={e.method + e.path} e={e} />
            ))}
          </div>
        </div>
      ))}
    </DocsShell>
  );
}
