"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Field,
  SegmentedControl,
  StatBadge,
  Toggle,
  type Example,
} from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import { buildCsp, type CspDirectives } from "@/lib/seo-tools/headers";

/**
 * CSP Generator, a friendly, per-directive builder for the
 * `Content-Security-Policy` header.
 *
 * A single controlled `CspState` drives everything: `buildCsp` (from
 * `lib/seo-tools/headers.ts`) assembles the header value with correct keyword
 * quoting, and a local strictness analysis reads that value back to explain how
 * much real XSS protection the policy provides. `<GeneratorWithPreview>` owns
 * the toolbar, undo/redo, presets and shortcuts; this module owns the data
 * shape and how it renders. Everything runs in the browser, nothing typed
 * here is ever uploaded.
 */

/* --------------------------------- model ---------------------------------- */

/** Keyword source tokens offered as toggles per directive. */
type KeywordToken =
  | "self"
  | "none"
  | "unsafe-inline"
  | "unsafe-eval"
  | "strict-dynamic"
  | "https:"
  | "data:"
  | "blob:";

interface KeywordMeta {
  token: KeywordToken;
  label: string;
  /** Weakens the policy when present in a fetch directive. */
  risky?: boolean;
}

const ALL_KEYWORDS: readonly KeywordMeta[] = [
  { token: "self", label: "'self'" },
  { token: "none", label: "'none'" },
  { token: "unsafe-inline", label: "'unsafe-inline'", risky: true },
  { token: "unsafe-eval", label: "'unsafe-eval'", risky: true },
  { token: "strict-dynamic", label: "'strict-dynamic'" },
  { token: "https:", label: "https:" },
  { token: "data:", label: "data:" },
  { token: "blob:", label: "blob:" },
];

/** Which keyword toggles make sense for which directive. */
const SCRIPT_KEYWORDS: readonly KeywordToken[] = [
  "self",
  "none",
  "unsafe-inline",
  "unsafe-eval",
  "strict-dynamic",
  "https:",
];
const STYLE_KEYWORDS: readonly KeywordToken[] = ["self", "none", "unsafe-inline", "https:"];
const IMG_KEYWORDS: readonly KeywordToken[] = ["self", "none", "https:", "data:", "blob:"];
const CONNECT_KEYWORDS: readonly KeywordToken[] = ["self", "none", "https:"];
const FONT_KEYWORDS: readonly KeywordToken[] = ["self", "none", "https:", "data:"];
const FRAME_KEYWORDS: readonly KeywordToken[] = ["self", "none", "https:"];
const ANCESTOR_KEYWORDS: readonly KeywordToken[] = ["self", "none"];

/** One directive's controlled state. */
interface DirectiveState {
  /** Selected keyword tokens (order-preserving via the definition list). */
  keywords: Partial<Record<KeywordToken, boolean>>;
  /** Free-form host/scheme sources, one per line. */
  hosts: string;
}

/** A directive definition: what to render and how to explain it. */
interface DirectiveDef {
  /** CSP directive name. */
  name: string;
  label: string;
  /** Plain-English description of what it governs. */
  hint: string;
  /** Keyword toggles to offer. */
  keywords: readonly KeywordToken[];
  /** Whether this directive falls back to default-src (fetch directive). */
  fetch: boolean;
}

const DIRECTIVES: readonly DirectiveDef[] = [
  {
    name: "default-src",
    label: "default-src",
    hint: "The fallback for every fetch directive you don't set explicitly. Start restrictive here.",
    keywords: SCRIPT_KEYWORDS,
    fetch: true,
  },
  {
    name: "script-src",
    label: "script-src",
    hint: "Where <script> may load from and whether inline/eval is allowed. The most security-critical directive.",
    keywords: SCRIPT_KEYWORDS,
    fetch: true,
  },
  {
    name: "style-src",
    label: "style-src",
    hint: "Where CSS may load from and whether inline style attributes are allowed.",
    keywords: STYLE_KEYWORDS,
    fetch: true,
  },
  {
    name: "img-src",
    label: "img-src",
    hint: "Where images (and favicons) may load from. data: enables inline base64 images.",
    keywords: IMG_KEYWORDS,
    fetch: true,
  },
  {
    name: "connect-src",
    label: "connect-src",
    hint: "Origins for fetch/XHR, WebSocket and EventSource: list every API and socket endpoint.",
    keywords: CONNECT_KEYWORDS,
    fetch: true,
  },
  {
    name: "font-src",
    label: "font-src",
    hint: "Where web fonts may load from. data: allows fonts embedded as base64.",
    keywords: FONT_KEYWORDS,
    fetch: true,
  },
  {
    name: "frame-src",
    label: "frame-src",
    hint: "Which URLs may be loaded into <iframe>s on your page (embeds, players, widgets).",
    keywords: FRAME_KEYWORDS,
    fetch: true,
  },
  {
    name: "frame-ancestors",
    label: "frame-ancestors",
    hint: "Who may iframe your page: the modern anti-clickjacking replacement for X-Frame-Options. Header-only.",
    keywords: ANCESTOR_KEYWORDS,
    fetch: false,
  },
];

/** How the policy is emitted. */
type OutputMode = "header" | "meta";

interface CspState {
  directives: Record<string, DirectiveState>;
  upgradeInsecureRequests: boolean;
  blockAllMixedContent: boolean;
  output: OutputMode;
}

function emptyDirective(): DirectiveState {
  return { keywords: {}, hosts: "" };
}

function blankDirectives(): Record<string, DirectiveState> {
  const out: Record<string, DirectiveState> = {};
  for (const d of DIRECTIVES) out[d.name] = emptyDirective();
  return out;
}

const INITIAL: CspState = {
  directives: {
    ...blankDirectives(),
    "default-src": { keywords: { self: true }, hosts: "" },
  },
  upgradeInsecureRequests: false,
  blockAllMixedContent: false,
  output: "header",
};

/* -------------------------------- presets --------------------------------- */

function makeState(
  overrides: Record<string, Partial<DirectiveState>>,
  flags: Partial<Pick<CspState, "upgradeInsecureRequests" | "blockAllMixedContent" | "output">> = {},
): CspState {
  const directives = blankDirectives();
  for (const [name, patch] of Object.entries(overrides)) {
    const base = directives[name] ?? emptyDirective();
    directives[name] = {
      keywords: { ...base.keywords, ...patch.keywords },
      hosts: patch.hosts ?? base.hosts,
    };
  }
  return {
    directives,
    upgradeInsecureRequests: flags.upgradeInsecureRequests ?? false,
    blockAllMixedContent: flags.blockAllMixedContent ?? false,
    output: flags.output ?? "header",
  };
}

const EXAMPLES: ReadonlyArray<Example<CspState>> = [
  {
    label: "Strict (self-only)",
    description: "Lock everything to your own origin, the safest baseline",
    icon: "Lock",
    value: makeState(
      {
        "default-src": { keywords: { self: true } },
        "frame-ancestors": { keywords: { none: true } },
      },
      { upgradeInsecureRequests: true },
    ),
  },
  {
    label: "App with a CDN",
    description: "Typical SPA: assets on a CDN, an API and Google Fonts",
    icon: "Boxes",
    value: makeState(
      {
        "default-src": { keywords: { self: true } },
        "script-src": { keywords: { self: true }, hosts: "https://cdn.example.com" },
        "style-src": {
          keywords: { self: true },
          hosts: "https://cdn.example.com\nhttps://fonts.googleapis.com",
        },
        "img-src": { keywords: { self: true, "data:": true }, hosts: "https://cdn.example.com" },
        "font-src": { keywords: { self: true }, hosts: "https://fonts.gstatic.com" },
        "connect-src": { keywords: { self: true }, hosts: "https://api.example.com\nwss://api.example.com" },
        "frame-ancestors": { keywords: { none: true } },
      },
      { upgradeInsecureRequests: true },
    ),
  },
  {
    label: "Permissive starter",
    description: "A loose policy to tighten from: the meter will flag the weak spots",
    icon: "Unlock",
    value: makeState({
      "default-src": { keywords: { self: true } },
      "script-src": { keywords: { self: true, "unsafe-inline": true } },
      "style-src": { keywords: { self: true, "unsafe-inline": true } },
      "img-src": { keywords: { self: true, "data:": true, "https:": true } },
      "connect-src": { keywords: { self: true, "https:": true } },
    }),
  },
];

/* ------------------------------ code assembly ----------------------------- */

/** Selected keyword tokens for a directive, in definition order. */
function selectedKeywords(dir: DirectiveState): string[] {
  return ALL_KEYWORDS.filter((k) => dir.keywords[k.token]).map((k) => k.token);
}

/** Split the host textarea into trimmed, non-empty, deduped tokens. */
function hostTokens(dir: DirectiveState): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of dir.hosts.split(/\r?\n/)) {
    const t = raw.trim();
    if (!t || t.startsWith("#")) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** All source tokens for a directive (keywords + hosts). */
function directiveSources(dir: DirectiveState): string[] {
  return [...selectedKeywords(dir), ...hostTokens(dir)];
}

/** Build the ordered `CspDirectives` map that `buildCsp` consumes. */
function toCspDirectives(state: CspState): CspDirectives {
  const map: CspDirectives = {};
  for (const def of DIRECTIVES) {
    const dir = state.directives[def.name];
    if (!dir) continue;
    const sources = directiveSources(dir);
    if (sources.length === 0) continue;
    map[def.name] = sources;
  }
  return map;
}

function generateHeaderValue(state: CspState): string {
  return buildCsp({
    directives: toCspDirectives(state),
    upgradeInsecureRequests: state.upgradeInsecureRequests,
    blockAllMixedContent: state.blockAllMixedContent,
  });
}

/** Escape a string for safe use inside an HTML double-quoted attribute. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateCode(state: CspState): string {
  const value = generateHeaderValue(state);
  if (!value) return "";
  if (state.output === "meta") {
    return `<meta http-equiv="Content-Security-Policy" content="${escapeAttr(value)}">`;
  }
  return `Content-Security-Policy: ${value}`;
}

/* ---------------------------- strictness meter ---------------------------- */

interface Strictness {
  score: number;
  checks: CheckItem[];
}

/**
 * Read the built policy back and grade how much real protection it gives.
 * Purely local; mirrors the reasoning of the security-header checker but is
 * specific to authoring a fresh policy.
 */
function analyzeStrictness(state: CspState): Strictness {
  const checks: CheckItem[] = [];
  const dirMap = toCspDirectives(state);
  const names = Object.keys(dirMap);

  if (names.length === 0 && !state.upgradeInsecureRequests && !state.blockAllMixedContent) {
    return {
      score: 0,
      checks: [
        {
          status: "info",
          label: "No directives yet",
          detail:
            "Toggle a source on a directive (default-src 'self' is a good start) to begin building your policy.",
        },
      ],
    };
  }

  let score = 100;
  const hasDefault = "default-src" in dirMap;

  // default-src fallback
  if (hasDefault) {
    checks.push({
      status: "pass",
      label: "default-src fallback is set",
      detail: "Fetch directives you didn't set inherit from default-src, so nothing is silently unrestricted.",
      group: "Structure",
    });
  } else {
    score -= 20;
    checks.push({
      status: "warn",
      label: "No default-src fallback",
      detail:
        "Resource types you haven't listed (media, worker, manifest, …) are left unrestricted.",
      fix: "Add a default-src: 'self' is a safe baseline that the other fetch directives fall back to.",
      group: "Structure",
    });
  }

  // Per-directive risky-keyword and wildcard checks.
  let sawUnsafeInline = false;
  let sawUnsafeEval = false;
  let sawWildcard = false;
  let strongScript = false;

  for (const def of DIRECTIVES) {
    const sources = dirMap[def.name];
    if (!sources) continue;

    if (sources.includes("*")) sawWildcard = true;
    if (sources.some((s) => s === "http:" || s === "https:")) {
      // Broad scheme allowlist, mild penalty, informational.
      checks.push({
        status: "warn",
        label: `${def.name} allows an entire scheme`,
        detail: `Listing "${sources.find((s) => s === "http:" || s === "https:")}" trusts every host on that scheme.`,
        fix: "Prefer explicit hostnames over a bare scheme so only your real origins are allowed.",
        group: def.label,
      });
      score -= 4;
    }

    const inline = sources.includes("unsafe-inline");
    const evalT = sources.includes("unsafe-eval");

    if (def.name === "script-src") {
      if (inline) {
        sawUnsafeInline = true;
        score -= 25;
        checks.push({
          status: "fail",
          label: "script-src allows 'unsafe-inline'",
          detail: "Inline scripts can run freely, which re-opens the main XSS hole CSP is meant to close.",
          fix: "Remove 'unsafe-inline' and move scripts to external files, or allow them with a per-request 'nonce-…' or a 'sha256-…' hash.",
          group: "script-src",
        });
      }
      if (evalT) {
        sawUnsafeEval = true;
        score -= 12;
        checks.push({
          status: "warn",
          label: "script-src allows 'unsafe-eval'",
          detail: "eval() and similar string-to-code APIs are permitted, widening the attack surface.",
          fix: "Remove 'unsafe-eval' unless a dependency truly requires it. Most modern code doesn't.",
          group: "script-src",
        });
      }
      if (!inline && (sources.includes("self") || sources.length > 0)) {
        strongScript = true;
      }
    } else if (inline) {
      // unsafe-inline in style-src (or elsewhere), lower severity than script.
      sawUnsafeInline = true;
      score -= 8;
      checks.push({
        status: "warn",
        label: `${def.name} allows 'unsafe-inline'`,
        detail: "Inline styles are permitted. Lower risk than inline script, but still worth removing.",
        fix: "Use external stylesheets or a nonce/hash instead of 'unsafe-inline' where practical.",
        group: def.label,
      });
    }
  }

  if (sawWildcard) {
    score -= 25;
    checks.push({
      status: "fail",
      label: "A wildcard * source is present",
      detail: "A bare * allows resources from any origin, effectively disabling that directive's protection.",
      fix: "Replace * with the specific hostnames you actually load from.",
      group: "Sources",
    });
  }

  if (strongScript && !sawUnsafeInline && !sawUnsafeEval) {
    checks.push({
      status: "pass",
      label: "script-src has no unsafe-inline or unsafe-eval",
      detail: "Scripts are restricted to trusted sources: the strongest part of a CSP.",
      group: "script-src",
    });
  }

  // frame-ancestors clickjacking protection
  if ("frame-ancestors" in dirMap) {
    checks.push({
      status: "pass",
      label: "frame-ancestors controls who can frame the page",
      detail: "This is the modern anti-clickjacking control (replaces X-Frame-Options).",
      group: "Structure",
    });
    if (state.output === "meta") {
      checks.push({
        status: "warn",
        label: "frame-ancestors is ignored in a <meta> tag",
        detail: "frame-ancestors is only enforced when the CSP is sent as an HTTP response header.",
        fix: "Deliver the policy as a header, or add an X-Frame-Options header at the server as well.",
        group: "Structure",
      });
    }
  } else {
    checks.push({
      status: "info",
      label: "No frame-ancestors set",
      detail: "Without it, other sites may embed your page in an iframe (clickjacking risk).",
      fix: "Add frame-ancestors 'none' (or 'self') to control framing.",
      group: "Structure",
    });
  }

  if (state.upgradeInsecureRequests) {
    checks.push({
      status: "pass",
      label: "upgrade-insecure-requests is on",
      detail: "Any http:// references are automatically fetched over https://.",
      group: "Flags",
    });
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { score: clamped, checks };
}

/* ------------------------------ directive row ----------------------------- */

const hostInputClass =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-mono leading-snug text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring resize-y";

function DirectiveRow({
  def,
  state,
  onKeyword,
  onHosts,
}: {
  def: DirectiveDef;
  state: DirectiveState;
  onKeyword: (token: KeywordToken, on: boolean) => void;
  onHosts: (value: string) => void;
}) {
  const keywordMetas = ALL_KEYWORDS.filter((k) => def.keywords.includes(k.token));
  const active = directiveSources(state).length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        active ? "border-border bg-muted/30" : "border-border/60 bg-transparent",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <code className="text-sm font-semibold text-foreground">{def.label}</code>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{def.hint}</p>
        </div>
        {!def.fetch && (
          <span
            title="Does not fall back to default-src. Enforced only as a response header."
            className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            header-only
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {keywordMetas.map((k) => {
          const on = !!state.keywords[k.token];
          return (
            <button
              key={k.token}
              type="button"
              aria-pressed={on}
              onClick={() => onKeyword(k.token, !on)}
              className={cn(
                "rounded-md border px-2 py-0.5 font-mono text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                on
                  ? k.risky
                    ? "border-amber-400/60 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "border-primary/50 bg-primary/15 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {k.label}
            </button>
          );
        })}
      </div>

      <label className="sr-only" htmlFor={`hosts-${def.name}`}>
        {def.label} host sources, one per line
      </label>
      <textarea
        id={`hosts-${def.name}`}
        value={state.hosts}
        onChange={(e) => onHosts(e.target.value)}
        rows={state.hosts.split("\n").length > 2 ? 3 : 1}
        spellCheck={false}
        placeholder="https://cdn.example.com, one host per line"
        className={cn(hostInputClass, "mt-2")}
      />
    </div>
  );
}

/* --------------------------------- tool ----------------------------------- */

export default function CspGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<CspState>(INITIAL);

  const setDirectiveKeyword = React.useCallback(
    (name: string, token: KeywordToken, on: boolean) => {
      setState((s) => {
        const dir = s.directives[name] ?? emptyDirective();
        const keywords = { ...dir.keywords };
        if (on) {
          // 'none' is exclusive. It overrides every other source.
          if (token === "none") {
            return {
              ...s,
              directives: { ...s.directives, [name]: { keywords: { none: true }, hosts: "" } },
            };
          }
          keywords.none = false;
          keywords[token] = true;
        } else {
          delete keywords[token];
        }
        return { ...s, directives: { ...s.directives, [name]: { ...dir, keywords } } };
      });
    },
    [],
  );

  const setDirectiveHosts = React.useCallback((name: string, value: string) => {
    setState((s) => {
      const dir = s.directives[name] ?? emptyDirective();
      return { ...s, directives: { ...s.directives, [name]: { ...dir, hosts: value } } };
    });
  }, []);

  const code = React.useMemo(() => generateCode(state), [state]);
  const { score, checks } = React.useMemo(() => analyzeStrictness(state), [state]);

  const directiveCount = React.useMemo(() => Object.keys(toCspDirectives(state)).length, [state]);
  const bytes = React.useMemo(
    () => (code ? new TextEncoder().encode(code).length : 0),
    [code],
  );

  const scoreTone: "success" | "warning" | "danger" | "default" =
    directiveCount === 0 ? "default" : score >= 85 ? "success" : score >= 55 ? "warning" : "danger";
  const scoreLabel = score >= 85 ? "Strong" : score >= 55 ? "Moderate" : "Weak";

  const stats = (
    <>
      <StatBadge
        label="Strictness"
        value={directiveCount === 0 ? "-" : `${score}/100 ${scoreLabel}`}
        icon="Gauge"
        tone={scoreTone}
      />
      <StatBadge label="Directives" value={directiveCount} icon="ListChecks" tone={directiveCount ? "info" : "default"} />
      <StatBadge
        label="Size"
        value={bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}
        icon="FileCode"
      />
    </>
  );

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Field label="Output as" htmlFor="csp-output">
            <SegmentedControl<OutputMode>
              value={state.output}
              onChange={(v) => setState((s) => ({ ...s, output: v }))}
              ariaLabel="Output format"
              options={[
                { value: "header", label: "HTTP header", icon: "Server" },
                { value: "meta", label: "<meta> tag", icon: "Code" },
              ]}
            />
          </Field>
        </div>
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          <Toggle
            checked={state.upgradeInsecureRequests}
            onChange={(v) => setState((s) => ({ ...s, upgradeInsecureRequests: v }))}
            label={
              <span>
                <code className="text-xs">upgrade-insecure-requests</code>
                <span className="ml-1.5 text-xs text-muted-foreground">- auto-promote http to https</span>
              </span>
            }
          />
          <Toggle
            checked={state.blockAllMixedContent}
            onChange={(v) => setState((s) => ({ ...s, blockAllMixedContent: v }))}
            label={
              <span>
                <code className="text-xs">block-all-mixed-content</code>
                <span className="ml-1.5 text-xs text-muted-foreground">- block any http subresource (legacy)</span>
              </span>
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon name="ShieldPlus" size={13} />
        Directives
      </div>

      <div className="flex flex-col gap-2.5">
        {DIRECTIVES.map((def) => {
          const dir = state.directives[def.name] ?? emptyDirective();
          return (
            <DirectiveRow
              key={def.name}
              def={def}
              state={dir}
              onKeyword={(token, on) => setDirectiveKeyword(def.name, token, on)}
              onHosts={(value) => setDirectiveHosts(def.name, value)}
            />
          );
        })}
      </div>
    </div>
  );

  /* -------------------------------- preview ------------------------------ */

  const preview = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Icon name="Gauge" size={13} />
            Strictness
          </span>
          {directiveCount > 0 && (
            <span
              className={cn(
                "font-semibold",
                scoreTone === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : scoreTone === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400",
              )}
            >
              {score}/100 · {scoreLabel}
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              scoreTone === "success"
                ? "bg-emerald-500"
                : scoreTone === "warning"
                  ? "bg-amber-500"
                  : scoreTone === "danger"
                    ? "bg-rose-500"
                    : "bg-muted-foreground/30",
            )}
            style={{ width: `${directiveCount === 0 ? 0 : score}%` }}
          />
        </div>
      </div>
      <CheckList items={checks} grouped />
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<CspState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language={state.output === "meta" ? "HTML" : "HTTP"}
        form={form}
        preview={preview}
        previewLabel="Policy analysis"
        downloadName={state.output === "meta" ? "csp-meta.html" : "content-security-policy.txt"}
        downloadMime={state.output === "meta" ? "text/html;charset=utf-8" : "text/plain;charset=utf-8"}
        examples={EXAMPLES}
        stats={stats}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<CspState>;
            if (!parsed || typeof parsed !== "object") return null;
            return {
              directives: { ...blankDirectives(), ...(parsed.directives ?? {}) },
              upgradeInsecureRequests: !!parsed.upgradeInsecureRequests,
              blockAllMixedContent: !!parsed.blockAllMixedContent,
              output: parsed.output === "meta" ? "meta" : "header",
            };
          } catch {
            return null;
          }
        }}
      />
    </section>
  );
}
