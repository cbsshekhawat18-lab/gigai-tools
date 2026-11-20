"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import {
  parseHttpHeaders,
  analyzeSecurityHeaders,
  type HeaderCheck,
  type ParsedHeaders,
} from "@/lib/seo-tools/headers";

/**
 * Security Header Checker, the paste-first HTTP security-header auditor.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes a raw response
 * header block (curl -I / DevTools), `parseHttpHeaders` folds it into a
 * case-insensitive map in the browser, and `analyzeSecurityHeaders` grades the
 * six headers that matter most. We shape that into a scored {@link AnalysisReport}
 * and enrich each row with the value found, the risk in plain English, and a
 * copy-ready fix line. A parsed-headers summary rounds out the report. Nothing
 * is fetched or uploaded. The audit runs entirely on the pasted text.
 */

/* ----------------------------- status mapping ----------------------------- */

/** Map an engine header status to a PasteAnalyze check status. */
function toCheckStatus(status: HeaderCheck["status"]): CheckItem["status"] {
  return status === "good" ? "pass" : status === "warn" ? "warn" : "fail";
}

/**
 * A copy-ready remediation line per header, the exact header a user should
 * emit to reach a passing verdict. Shown on warn/fail rows.
 */
const FIX_SNIPPET: Record<string, string> = {
  "Strict-Transport-Security":
    "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy":
    "Content-Security-Policy: default-src 'self'. Script-src 'self'. Object-src 'none'. Frame-ancestors 'none'. Base-uri 'self'",
  "X-Frame-Options": "X-Frame-Options: DENY",
  "X-Content-Type-Options": "X-Content-Type-Options: nosniff",
  "Referrer-Policy": "Referrer-Policy: strict-origin-when-cross-origin",
  "Permissions-Policy":
    "Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()",
  "X-XSS-Protection": "X-XSS-Protection: 0",
};

/** A short "why it matters" line per header, shown under warn/fail rows. */
const RISK_BY_HEADER: Record<string, string> = {
  "Strict-Transport-Security":
    "Without HSTS, a first-visit or man-in-the-middle request can be downgraded to plain HTTP and intercepted.",
  "Content-Security-Policy":
    "Without a strict CSP, an injected <script> runs with full trust, the core of most cross-site scripting attacks.",
  "X-Frame-Options":
    "Without frame protection, an attacker can embed your page invisibly and trick users into clicking hidden controls (clickjacking).",
  "X-Content-Type-Options":
    "Without nosniff, a browser may guess a response's type and execute an upload or asset as script.",
  "Referrer-Policy":
    "A permissive referrer policy leaks full URLs (including tokens and internal paths) to third-party sites.",
  "Permissions-Policy":
    "Without a Permissions-Policy, embedded content and scripts can access powerful features like camera, mic and geolocation.",
  "X-XSS-Protection":
    "The legacy XSS auditor is deprecated and can introduce its own bugs. A Content-Security-Policy is the modern replacement.",
};

/* ------------------------------- fix snippet ------------------------------ */

/** A monospace fix line with an inline copy button. */
function FixSnippet({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(() => {
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {
        /* clipboard blocked, no-op */
      });
  }, [text]);

  return (
    <div className="mt-1.5 flex items-stretch gap-1 rounded-md border border-border bg-muted/30">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre px-2.5 py-1.5 font-mono text-xs text-foreground">
        {text}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied fix" : "Copy fix"} title={copied ? "Copied fix" : "Copy fix"}
        className="flex shrink-0 items-center gap-1 border-l border-border px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon name={copied ? "Check" : "Copy"} size={13} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/** Detail body for one header row: risk + current value + copy-ready fix. */
function HeaderDetail({ check }: { check: HeaderCheck }) {
  const isPass = check.status === "good";
  const fix = FIX_SNIPPET[check.header];
  const risk = RISK_BY_HEADER[check.header];
  return (
    <div className="flex flex-col gap-1.5">
      <span>{check.advice}</span>
      {!isPass && risk && (
        <span className="text-xs text-muted-foreground">{risk}</span>
      )}
      {check.present && check.value && (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Found
          </span>
          <code className="min-w-0 break-all font-mono text-xs text-foreground">
            {check.value}
          </code>
        </div>
      )}
      {!isPass && fix && <FixSnippet text={fix} />}
    </div>
  );
}

/* --------------------------- parsed-headers table ------------------------- */

/** All parsed headers, for reference, so the user can see what we read. */
function ParsedHeaderTable({ parsed }: { parsed: ParsedHeaders }) {
  if (parsed.raw.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No <code className="font-mono">Name: value</code> header lines were found
        - check the paste.
      </p>
    );
  }
  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-border bg-muted/20">
      {parsed.statusLine && (
        <div className="border-b border-border/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
          {parsed.statusLine}
        </div>
      )}
      <div className="max-h-64 overflow-y-auto">
        {parsed.raw.map(([name, value], i) => (
          <div
            key={`${name}-${i}`}
            className="flex flex-col gap-0.5 border-b border-border/40 px-3 py-1.5 last:border-0 sm:flex-row sm:gap-3"
          >
            <span className="w-48 shrink-0 break-words font-mono text-xs font-medium text-foreground">
              {name}
            </span>
            <span className="min-w-0 break-all font-mono text-xs text-muted-foreground">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

/** One-line verdict shown next to the score dial. */
function verdict(score: number, fails: number): string {
  if (score >= 90) return "Excellent: the essential security headers are all in place.";
  if (score >= 75)
    return fails
      ? "Good, one or two headers still need fixing."
      : "Good, tighten the remaining warnings for an A.";
  if (score >= 60) return "Fair. Several important headers are missing or weak.";
  if (score >= 40) return "Needs work, key protections like CSP or HSTS are absent.";
  return "Poor. The site is missing most of its security headers.";
}

/** Turn a pasted header block into the structured report PasteAnalyze renders. */
function analyzeHeaders(raw: string): AnalysisReport {
  const parsed = parseHttpHeaders(raw);

  if (parsed.raw.length === 0) {
    throw new Error(
      "No headers recognised. Paste raw response headers in `Name: value` form, e.g. the output of `curl -sI https://yoursite.com` or DevTools → Network → Response Headers.",
    );
  }

  const report = analyzeSecurityHeaders(parsed.map);

  const headerChecks: CheckItem[] = report.checks.map((check) => ({
    id: check.header,
    status: toCheckStatus(check.status),
    label: (
      <span className="flex items-center gap-2">
        <code className="font-mono text-[13px]">{check.header}</code>
        {!check.present && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            missing
          </span>
        )}
      </span>
    ),
    detail: <HeaderDetail check={check} />,
    group: "Security headers",
  }));

  const fails = headerChecks.filter((c) => c.status === "fail").length;

  const reference: CheckItem[] = [
    {
      id: "parsed",
      status: "info",
      label: `Parsed ${parsed.raw.length} header${parsed.raw.length === 1 ? "" : "s"}${
        parsed.status ? ` · status ${parsed.status}` : ""
      }`,
      detail: <ParsedHeaderTable parsed={parsed} />,
      group: "What we read",
    },
  ];

  return {
    score: report.score,
    grade: report.grade,
    summary: `${verdict(report.score, fails)} ${report.passed}/${report.total} headers passing.`,
    checks: [...headerChecks, ...reference],
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_HEADERS = `HTTP/2 200
content-type: text/html; charset=utf-8
date: Wed, 18 Jun 2026 09:14:22 GMT
server: cloudflare
strict-transport-security: max-age=15552000
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
cache-control: public, max-age=3600
vary: Accept-Encoding`;

export default function SecurityHeaderCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeHeaders}
        fetchable
        fetchInto="headers"
        shareSlug="security-header-checker"
        shareLabel="Security header report"
        urlPlaceholder="https://example.com, we'll fetch its response headers"
        inputLabel="Enter a URL to fetch its headers, or paste them"
        placeholder="Paste the output of `curl -sI https://yoursite.com`, or DevTools → Network → Response Headers…"
        sample={SAMPLE_HEADERS}
        emptyTitle="Paste response headers to grade a site's security"
        emptyHint="Run `curl -sI https://yoursite.com`, or open DevTools (F12) → Network, click the document request, and copy everything under Response Headers. Paste it here and every header is graded locally in your browser: nothing is uploaded. A live-URL scan would need a server we deliberately don't run (and CORS blocks it client-side), so paste the headers instead. This also lets you audit staging, intranet and login-gated pages a public scanner can't reach."
        emptyIcon="ShieldCheck"
        accept=".txt"
      />
    </section>
  );
}
