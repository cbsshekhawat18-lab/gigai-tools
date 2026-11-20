"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import {
  parseHttpHeaders,
  analyzeSecurityHeaders,
  type ParsedHeaders,
  type HeaderCheck,
} from "@/lib/seo-tools/headers";

/**
 * HTTP Header Checker, the paste-first response-header inspector.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes raw HTTP
 * response headers (from `curl -I`, `curl -sD -` or DevTools) and
 * `parseHttpHeaders` (in-browser, no network) turns the block into a case-
 * insensitive map + ordered pairs. On top of that this module derives the
 * story the headers tell, status & redirects, caching, compression, cookies,
 * CORS and content, and folds in the shared `analyzeSecurityHeaders` audit,
 * shaping everything into a grouped {@link AnalysisReport}. Nothing is uploaded;
 * every check runs on the pasted text.
 */

/* ------------------------------- primitives ------------------------------- */

/** One key/value row in a compact parsed panel. */
function KV({ name, value }: { name: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-1.5 last:border-0 sm:flex-row sm:gap-3">
      <span className="w-44 shrink-0 break-words font-mono text-xs font-medium text-muted-foreground">
        {name}
      </span>
      <span className="min-w-0 break-words font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

/** The full, sorted, parsed header table (rendered inside an info check row). */
function HeaderTable({ parsed }: { parsed: ParsedHeaders }) {
  const entries = React.useMemo(
    () => Object.entries(parsed.map).sort(([a], [b]) => a.localeCompare(b)),
    [parsed.map],
  );
  return (
    <div className="mt-1 overflow-x-auto rounded-lg border border-border bg-muted/20 p-3">
      {parsed.statusLine ? (
        <KV
          name="(status line)"
          value={<span className="font-semibold text-foreground">{parsed.statusLine}</span>}
        />
      ) : null}
      {entries.map(([name, value]) => (
        <KV key={name} name={name} value={value} />
      ))}
    </div>
  );
}

/* ------------------------------ derived notes ----------------------------- */

type NoteStatus = CheckItem["status"];

interface Note {
  id: string;
  status: NoteStatus;
  label: string;
  detail: string;
  fix?: string;
  group: string;
}

const REDIRECT_CODES: Record<number, string> = {
  301: "Moved Permanently",
  302: "Found (temporary)",
  303: "See Other",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
};

/** Status + redirect reading. */
function statusNotes(parsed: ParsedHeaders): Note[] {
  const notes: Note[] = [];
  const code = parsed.status;
  const group = "Status & redirects";

  if (code == null) {
    notes.push({
      id: "status",
      status: "info",
      label: "No status line detected",
      detail:
        "Paste didn't include an `HTTP/… 200`-style status line. Header analysis still works. Add `curl -sD -` to include the status.",
      group,
    });
    return notes;
  }

  const location = parsed.map["location"];
  if (code in REDIRECT_CODES) {
    const permanent = code === 301 || code === 308;
    notes.push({
      id: "status",
      status: "warn",
      label: `${code} ${REDIRECT_CODES[code]}; this URL redirects`,
      detail: location
        ? `The response redirects to ${location}. ${
            permanent ? "This is a permanent redirect." : "This is a temporary redirect."
          } Follow it with \`curl -sIL\` to inspect the final destination.`
        : "A redirect status was returned but no Location header was found in this block.",
      fix: "For SEO and speed, redirect in a single hop straight to the canonical HTTPS URL rather than chaining several redirects.",
      group,
    });
  } else if (code >= 200 && code < 300) {
    notes.push({
      id: "status",
      status: "pass",
      label: `${code}, success`,
      detail: "The server returned a successful response for this request.",
      group,
    });
  } else if (code >= 400 && code < 500) {
    notes.push({
      id: "status",
      status: "fail",
      label: `${code}: client error`,
      detail:
        "The request was rejected (e.g. not found, unauthorized or forbidden). Check the URL, method and any required auth.",
      group,
    });
  } else if (code >= 500) {
    notes.push({
      id: "status",
      status: "fail",
      label: `${code}, server error`,
      detail: "The server failed to fulfil an apparently valid request. Check server and upstream logs.",
      group,
    });
  } else {
    notes.push({
      id: "status",
      status: "info",
      label: `${code}, informational`,
      detail: "An informational or non-standard status code was returned.",
      group,
    });
  }
  return notes;
}

/** Caching + compression + content reading. */
function transportNotes(parsed: ParsedHeaders): Note[] {
  const notes: Note[] = [];
  const m = parsed.map;
  const group = "Caching & delivery";

  // Compression
  const enc = m["content-encoding"];
  if (!enc) {
    notes.push({
      id: "compression",
      status: "warn",
      label: "No compression on this response",
      detail:
        "No Content-Encoding header, the body appears to be served uncompressed. Text responses (HTML, CSS, JS, JSON) should be compressed.",
      fix: "Enable Brotli (br) or gzip on your server or CDN for compressible content types.",
      group,
    });
  } else {
    const label = /br/i.test(enc)
      ? "Brotli"
      : /zstd/i.test(enc)
        ? "Zstandard"
        : /gzip/i.test(enc)
          ? "gzip"
          : /deflate/i.test(enc)
            ? "deflate"
            : enc;
    notes.push({
      id: "compression",
      status: "pass",
      label: `Compressed with ${label}`,
      detail: `Content-Encoding: ${enc}; the response body is compressed for faster transfer.`,
      group,
    });
  }

  // Caching
  const cc = m["cache-control"];
  const etag = m["etag"];
  const expires = m["expires"];
  const age = m["age"];
  if (!cc && !expires) {
    notes.push({
      id: "cache",
      status: "warn",
      label: "No explicit caching policy",
      detail:
        "Neither Cache-Control nor Expires was sent, so caching falls back to heuristics. Set an explicit policy for predictable CDN and browser behaviour.",
      fix: "Add a Cache-Control directive, e.g. `public, max-age=31536000, immutable` for hashed assets, or `no-store` for private, dynamic responses.",
      group,
    });
  } else if (cc && /no-store/i.test(cc)) {
    notes.push({
      id: "cache",
      status: "info",
      label: "Response is explicitly not cached",
      detail: `Cache-Control: ${cc}. This response is marked not to be stored, which is correct for private or highly dynamic content.`,
      group,
    });
  } else {
    const bits: string[] = [];
    if (cc) bits.push(`Cache-Control: ${cc}`);
    if (etag) bits.push("has an ETag validator");
    if (expires) bits.push(`Expires: ${expires}`);
    if (age) bits.push(`served from cache (Age: ${age})`);
    notes.push({
      id: "cache",
      status: "pass",
      label: "Caching is configured",
      detail: bits.join(" · ") + ".",
      group,
    });
  }

  // Vary (cache correctness)
  if (m["vary"]) {
    notes.push({
      id: "vary",
      status: "info",
      label: "Vary header present",
      detail: `Vary: ${m["vary"]}. Caches will key on these request headers, which is important when serving compressed or content-negotiated variants.`,
      group,
    });
  }

  // Content-Type
  if (m["content-type"]) {
    notes.push({
      id: "content-type",
      status: "info",
      label: "Content type",
      detail: `Content-Type: ${m["content-type"]}`,
      group,
    });
  }

  return notes;
}

/** Cookie + CORS reading. */
function cookieCorsNotes(parsed: ParsedHeaders): Note[] {
  const notes: Note[] = [];
  const m = parsed.map;
  const group = "Cookies & CORS";

  const setCookie = m["set-cookie"];
  if (setCookie) {
    const missing: string[] = [];
    if (!/;\s*secure/i.test(setCookie) && !/^secure/i.test(setCookie)) missing.push("Secure");
    if (!/httponly/i.test(setCookie)) missing.push("HttpOnly");
    if (!/samesite/i.test(setCookie)) missing.push("SameSite");
    if (missing.length) {
      notes.push({
        id: "cookie",
        status: "warn",
        label: `Set-Cookie is missing ${missing.join(", ")}`,
        detail:
          "A cookie is set without one or more hardening attributes. Session and auth cookies should carry all three.",
        fix: "Add Secure (HTTPS-only), HttpOnly (hidden from JS) and an explicit SameSite (Lax or Strict) to sensitive cookies.",
        group,
      });
    } else {
      notes.push({
        id: "cookie",
        status: "pass",
        label: "Set-Cookie is hardened",
        detail: "Cookies carry Secure, HttpOnly and SameSite, good protection against theft and CSRF.",
        group,
      });
    }
  }

  const acao = m["access-control-allow-origin"];
  if (acao) {
    if (acao.trim() === "*") {
      notes.push({
        id: "cors",
        status: /access-control-allow-credentials/i.test(m["access-control-allow-credentials"] ?? "")
          ? "fail"
          : "info",
        label: "CORS: any origin allowed (*)",
        detail:
          "Access-Control-Allow-Origin is `*`. That's fine for public, credential-free resources, but must never be combined with Allow-Credentials: true.",
        ...(/true/i.test(m["access-control-allow-credentials"] ?? "")
          ? {
              fix: "Never pair `Allow-Origin: *` with `Allow-Credentials: true`: echo a specific allowed origin instead.",
            }
          : {}),
        group,
      });
    } else {
      notes.push({
        id: "cors",
        status: "info",
        label: "CORS: specific origin allowed",
        detail: `Access-Control-Allow-Origin: ${acao}. Cross-origin requests from this origin are permitted.`,
        group,
      });
    }
  }

  return notes;
}

/** Server / info fingerprinting (low-priority hygiene). */
function serverNotes(parsed: ParsedHeaders): Note[] {
  const notes: Note[] = [];
  const m = parsed.map;
  const group = "Server & disclosure";
  const revealing = ["server", "x-powered-by", "x-aspnet-version", "x-generator"].filter(
    (h) => m[h] !== undefined,
  );
  for (const h of revealing) {
    const chatty = h === "x-powered-by" || h === "x-aspnet-version";
    notes.push({
      id: h,
      status: chatty ? "warn" : "info",
      label: `${h}: ${m[h]}`,
      detail: chatty
        ? "This header advertises your stack and version, which helps attackers target known vulnerabilities."
        : "Identifies the server software. Consider trimming version detail to reduce fingerprinting.",
      ...(chatty ? { fix: `Remove the ${h} header at your server or proxy layer.` } : {}),
      group,
    });
  }
  return notes;
}

/* -------------------------------- analysis -------------------------------- */

/** One-line verdict shown next to the score dial. */
function verdict(score: number): string {
  if (score >= 90) return "Excellent: a strong, well-configured response.";
  if (score >= 75) return "Good: solid headers with a few quick wins.";
  if (score >= 60) return "Fair: several headers need attention.";
  if (score >= 40) return "Needs work: important security headers are missing.";
  return "Poor. The essential security headers are largely absent.";
}

/** Turn a security HeaderCheck into a PasteAnalyze CheckItem. */
function secToCheck(c: HeaderCheck): CheckItem {
  const status: CheckItem["status"] =
    c.status === "good" ? "pass" : c.status === "warn" ? "warn" : "fail";
  return {
    id: `sec-${c.header}`,
    status,
    label: c.present ? `${c.header}: ${c.value ?? ""}`.trim() : `${c.header}. Not set`,
    detail: c.advice,
    group: "Security headers",
  };
}

/** Analyze a pasted raw header block into the structured report. */
function analyzeHeaders(raw: string): AnalysisReport {
  const parsed = parseHttpHeaders(raw);

  if (parsed.raw.length === 0 && !parsed.statusLine) {
    throw new Error(
      "No HTTP headers found. Paste raw response headers like `content-type: text/html` (from `curl -I` or DevTools → Network → Headers).",
    );
  }

  const sec = analyzeSecurityHeaders(parsed.map);

  const notes: Note[] = [
    ...statusNotes(parsed),
    ...transportNotes(parsed),
    ...cookieCorsNotes(parsed),
    ...serverNotes(parsed),
  ];

  const parsedRow: CheckItem = {
    id: "parsed",
    status: "info",
    label: `${parsed.raw.length} header${parsed.raw.length === 1 ? "" : "s"} parsed`,
    detail: <HeaderTable parsed={parsed} />,
    group: "Parsed headers",
  };

  const noteChecks: CheckItem[] = notes.map((n) => ({
    id: n.id,
    status: n.status,
    label: n.label,
    detail: n.detail,
    ...(n.fix ? { fix: n.fix } : {}),
    group: n.group,
  }));

  const secChecks: CheckItem[] = sec.checks.map(secToCheck);

  return {
    score: sec.score,
    grade: sec.grade,
    summary: `${verdict(sec.score)} Security-header grade ${sec.grade} · ${sec.passed}/${sec.total} key headers set.`,
    checks: [...noteChecks, ...secChecks, parsedRow],
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE = `HTTP/2 200
date: Mon, 30 Jun 2026 12:00:00 GMT
content-type: text/html; charset=utf-8
content-encoding: br
vary: Accept-Encoding
cache-control: public, max-age=3600
etag: "a1b2c3d4"
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; img-src 'self' data:; object-src 'none'
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), camera=()
set-cookie: session=abc123; Path=/; Secure; HttpOnly; SameSite=Lax
server: cloudflare`;

const EMPTY_HINT = (
  <>
    Capture your response headers with{" "}
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
      curl -sSI https://example.com
    </code>{" "}
    (add <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">-D -</code> for the
    status line), or copy them from DevTools → Network → Headers, then paste here. Everything is
    parsed locally in your browser: nothing is uploaded. Reading a live URL&apos;s headers would need a
    server we deliberately don&apos;t run (privacy + CORS), so paste the raw block instead. It works on
    staging, internal and login-gated URLs too.
  </>
);

export default function HttpHeaderCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeHeaders}
        fetchable
        fetchInto="headers"
        shareSlug="http-header-checker"
        shareLabel="HTTP header report"
        urlPlaceholder="https://example.com, we'll fetch its response headers"
        inputLabel="Enter a URL to fetch its headers, or paste them"
        placeholder={"HTTP/2 200\ncontent-type: text/html. Charset=utf-8\ncache-control: public, max-age=3600\n…"}
        sample={SAMPLE}
        emptyTitle="Paste response headers to inspect them"
        emptyHint={EMPTY_HINT}
        emptyIcon="Server"
        accept=".txt,.log"
      />
    </section>
  );
}
