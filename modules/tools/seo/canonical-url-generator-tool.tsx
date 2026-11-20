"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  Field,
  SegmentedControl,
  Toggle,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { parseUrl } from "@/lib/seo-tools/url";
import { escapeHtmlAttr } from "@/lib/seo-tools/meta";

/**
 * Canonical URL Generator, a focused Meta Tags tool.
 *
 * A single controlled form (`CanonState`) drives everything: the raw URL is
 * parsed with the browser's native URL engine (`lib/seo-tools/url.ts`),
 * normalised deterministically per the toggles, and the clean canonical is
 * rendered as a `<link rel="canonical">` tag, an HTTP `Link` header, and
 * framework snippets. `<GeneratorWithPreview>` owns the toolbar, undo/redo,
 * share links, presets and shortcuts; this module owns the data, the
 * normalisation, and the live before/after preview. Everything runs in the
 * browser. Nothing pasted here is ever uploaded.
 */

/* --------------------------------- state ---------------------------------- */

type OutputFormat = "tag" | "header" | "next" | "wordpress";
type TrailingSlash = "keep" | "add" | "remove";

interface CanonState {
  url: string;
  forceHttps: boolean;
  lowerHost: boolean;
  dropWww: boolean;
  dropFragment: boolean;
  stripTracking: boolean;
  sortParams: boolean;
  trailingSlash: TrailingSlash;
  format: OutputFormat;
}

const INITIAL: CanonState = {
  url: "",
  forceHttps: true,
  lowerHost: true,
  dropWww: false,
  dropFragment: true,
  stripTracking: true,
  sortParams: false,
  trailingSlash: "keep",
  format: "tag",
};

/* ------------------------------ tracking keys ----------------------------- */

/** Query keys that never change page content: safe to drop from a canonical. */
const TRACKING_KEYS = new Set<string>([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_source_platform",
  "gclid",
  "gclsrc",
  "dclid",
  "wbraid",
  "gbraid",
  "fbclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "_hsenc",
  "_hsmi",
  "hsctatracking",
  "yclid",
  "igshid",
  "ttclid",
  "twclid",
  "ref",
  "ref_src",
  "referrer",
  "source",
  "cmpid",
  "campaignid",
  "adgroupid",
  "spm",
  "vero_id",
  "oly_anon_id",
  "oly_enc_id",
]);

/* ------------------------------ normalisation ----------------------------- */

interface NormalizeResult {
  canonical: string;
  changes: string[];
  removedParams: string[];
  isSecure: boolean;
  paramCount: number;
}

/** Deterministically normalise a URL into its canonical form per the options. */
function normalize(raw: string, s: CanonState): { ok: true; value: NormalizeResult } | { ok: false; error: string } {
  const parsed = parseUrl(raw);
  if (!parsed.ok) return { ok: false, error: parsed.error.message };

  const u = new URL(parsed.result.href);
  const changes: string[] = [];
  const removedParams: string[] = [];

  // Scheme.
  if (s.forceHttps && u.protocol === "http:") {
    u.protocol = "https:";
    changes.push("Upgraded scheme to https");
  }

  // Host casing (URL already lowercases hostname; note when input differed).
  if (s.lowerHost) {
    const rawHost = raw.match(/^[a-z]+:\/\/([^/?#]+)/i)?.[1] ?? "";
    if (rawHost && rawHost.toLowerCase() !== rawHost) {
      changes.push("Lowercased host");
    }
  }

  // Drop www.
  if (s.dropWww && u.hostname.startsWith("www.")) {
    u.hostname = u.hostname.slice(4);
    changes.push("Removed www. prefix");
  }

  // Default port.
  if (u.port === "80" && u.protocol === "http:") {
    u.port = "";
    changes.push("Removed default port :80");
  } else if (u.port === "443" && u.protocol === "https:") {
    u.port = "";
    changes.push("Removed default port :443");
  }

  // Fragment.
  if (s.dropFragment && u.hash) {
    u.hash = "";
    changes.push("Removed #fragment");
  }

  // Query parameters.
  const beforeSearch = u.search;
  if (s.stripTracking) {
    for (const key of Array.from(u.searchParams.keys())) {
      if (TRACKING_KEYS.has(key.toLowerCase())) {
        u.searchParams.delete(key);
        removedParams.push(key);
      }
    }
  }
  if (s.sortParams) {
    const entries = Array.from(u.searchParams.entries()).sort((a, b) =>
      a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0,
    );
    // Rebuild in sorted order.
    for (const key of Array.from(u.searchParams.keys())) u.searchParams.delete(key);
    for (const [k, v] of entries) u.searchParams.append(k, v);
  }
  if (removedParams.length) {
    changes.push(
      `Stripped ${removedParams.length} tracking parameter${removedParams.length === 1 ? "" : "s"}`,
    );
  }
  if (s.sortParams && beforeSearch !== u.search && !removedParams.length) {
    changes.push("Sorted query parameters");
  }

  // Trailing slash, only touch non-root paths without a file extension.
  const path = u.pathname;
  const isRoot = path === "/";
  const looksLikeFile = /\.[a-z0-9]{1,8}$/i.test(path.split("/").pop() ?? "");
  if (!isRoot && !looksLikeFile) {
    if (s.trailingSlash === "add" && !path.endsWith("/")) {
      u.pathname = path + "/";
      changes.push("Added trailing slash");
    } else if (s.trailingSlash === "remove" && path.endsWith("/")) {
      u.pathname = path.replace(/\/+$/, "");
      changes.push("Removed trailing slash");
    }
  }

  const canonical = u.toString();
  return {
    ok: true,
    value: {
      canonical,
      changes,
      removedParams,
      isSecure: u.protocol === "https:",
      paramCount: Array.from(u.searchParams.keys()).length,
    },
  };
}

/* ------------------------------ code assembly ----------------------------- */

function buildOutput(canonical: string, format: OutputFormat): string {
  const href = escapeHtmlAttr(canonical);
  switch (format) {
    case "tag":
      return `<link rel="canonical" href="${href}" />`;
    case "header":
      return `Link: <${canonical}>; rel="canonical"`;
    case "next":
      return [
        "// app/…/page.tsx, Next.js App Router",
        "export const metadata = {",
        "  alternates: {",
        `    canonical: "${canonical.replace(/"/g, '\\"')}",`,
        "  },",
        "};",
      ].join("\n");
    case "wordpress":
      return [
        "<?php // functions.php or your theme <head> ?>",
        `<link rel="canonical" href="<?php echo esc_url( '${canonical.replace(/'/g, "\\'")}' ); ?>" />`,
      ].join("\n");
  }
}

const FORMAT_META: Record<OutputFormat, { language: string; downloadName: string; downloadMime: string }> = {
  tag: { language: "HTML", downloadName: "canonical.html", downloadMime: "text/html;charset=utf-8" },
  header: { language: "HTTP", downloadName: "canonical-header.txt", downloadMime: "text/plain;charset=utf-8" },
  next: { language: "TS", downloadName: "canonical.metadata.ts", downloadMime: "text/plain;charset=utf-8" },
  wordpress: { language: "PHP", downloadName: "canonical.php", downloadMime: "text/plain;charset=utf-8" },
};

/* -------------------------------- presets --------------------------------- */

const EXAMPLES: ReadonlyArray<Example<CanonState>> = [
  {
    label: "Tracked share link",
    description: "Strip UTM & click IDs from a campaign URL",
    icon: "Filter",
    value: {
      ...INITIAL,
      url: "https://Example.com/Blog/canonical-urls?utm_source=twitter&utm_medium=social&utm_campaign=launch&fbclid=IwAR12345#top",
      lowerHost: true,
      stripTracking: true,
      dropFragment: true,
    },
  },
  {
    label: "www + http variant",
    description: "Consolidate to https, bare domain",
    icon: "Globe",
    value: {
      ...INITIAL,
      url: "http://www.example.com/products/aera-runner/",
      forceHttps: true,
      dropWww: true,
      trailingSlash: "remove",
    },
  },
  {
    label: "Faceted listing",
    description: "Canonicalize a filtered category page",
    icon: "LayoutGrid",
    value: {
      ...INITIAL,
      url: "https://shop.example.com/shoes?color=black&sort=price&utm_source=newsletter&page=1",
      stripTracking: true,
      sortParams: true,
    },
  },
];

/* ------------------------------ small helpers ----------------------------- */

const inputClass =
  "h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

function SectionHead({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon name={icon} size={13} />
      {children}
    </div>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-transparent px-1 py-1.5 hover:border-border">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </label>
      <span className="mt-0.5 shrink-0">
        <Toggle id={id} checked={checked} onChange={onChange} />
      </span>
    </div>
  );
}

/* --------------------------------- tool ----------------------------------- */

export default function CanonicalUrlGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<CanonState>(INITIAL);

  const set = React.useCallback(
    <K extends keyof CanonState>(key: K) =>
      (value: CanonState[K]) =>
        setState((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const result = React.useMemo(() => {
    if (!state.url.trim()) return null;
    return normalize(state.url, state);
  }, [state]);

  const error = result && !result.ok ? result.error : null;
  const norm = result && result.ok ? result.value : null;

  const meta = FORMAT_META[state.format];
  const code = norm ? buildOutput(norm.canonical, state.format) : "";

  const inputTrimmed = state.url.trim();
  const changed = norm ? norm.canonical !== inputTrimmed : false;

  const stats = norm ? (
    <>
      <StatBadge
        label="Scheme"
        value={norm.isSecure ? "https" : "http"}
        tone={norm.isSecure ? "success" : "warning"}
      />
      <StatBadge label="Params" value={`${norm.paramCount}`} tone="default" />
      <StatBadge
        label="Changes"
        value={`${norm.changes.length}`}
        tone={norm.changes.length ? "warning" : "success"}
      />
    </>
  ) : undefined;

  const form = (
    <div className="flex flex-col gap-3">
      <SectionHead icon="Link">Page URL</SectionHead>
      <Field
        label="URL to canonicalize"
        htmlFor="canon-url"
        hint="Paste the absolute URL of the page (include https://)."
      >
        <input
          id="canon-url"
          type="url"
          inputMode="url"
          value={state.url}
          placeholder="https://www.Example.com/blog/post?utm_source=news#top"
          onChange={(e) => set("url")(e.target.value)}
          className={inputClass}
          spellCheck={false}
          autoComplete="off"
        />
      </Field>

      <SectionHead icon="Wand2">Normalisation</SectionHead>
      <div className="flex flex-col gap-0.5">
        <ToggleRow
          id="canon-https"
          label="Force https"
          hint="Upgrade an http:// URL to https://."
          checked={state.forceHttps}
          onChange={set("forceHttps")}
        />
        <ToggleRow
          id="canon-lowerhost"
          label="Lowercase host"
          hint="Hosts are case-insensitive. Keep them lowercase."
          checked={state.lowerHost}
          onChange={set("lowerHost")}
        />
        <ToggleRow
          id="canon-www"
          label="Drop www."
          hint="Only if your canonical host is the bare domain."
          checked={state.dropWww}
          onChange={set("dropWww")}
        />
        <ToggleRow
          id="canon-fragment"
          label="Remove #fragment"
          hint="Fragments don't identify a separate page for crawlers."
          checked={state.dropFragment}
          onChange={set("dropFragment")}
        />
        <ToggleRow
          id="canon-tracking"
          label="Strip tracking parameters"
          hint="Remove utm_*, gclid, fbclid and similar analytics junk."
          checked={state.stripTracking}
          onChange={set("stripTracking")}
        />
        <ToggleRow
          id="canon-sort"
          label="Sort query parameters"
          hint="Alphabetise remaining params for a deterministic URL."
          checked={state.sortParams}
          onChange={set("sortParams")}
        />
      </div>

      <Field label="Trailing slash" htmlFor="canon-slash" hint="Applied to directory-style paths only.">
        <SegmentedControl<TrailingSlash>
          value={state.trailingSlash}
          onChange={set("trailingSlash")}
          ariaLabel="Trailing slash handling"
          options={[
            { value: "keep", label: "Keep" },
            { value: "add", label: "Add" },
            { value: "remove", label: "Remove" },
          ]}
        />
      </Field>

      <SectionHead icon="Code2">Output format</SectionHead>
      <SegmentedControl<OutputFormat>
        value={state.format}
        onChange={set("format")}
        ariaLabel="Output format"
        options={[
          { value: "tag", label: "Link tag" },
          { value: "header", label: "HTTP header" },
          { value: "next", label: "Next.js" },
          { value: "wordpress", label: "WordPress" },
        ]}
      />
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-4">
      {!norm && !error && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <Icon name="Link" size={22} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Paste a URL to build its canonical</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The clean canonical, a before/after diff and the tag appear here. Try an example from the
            toolbar.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {norm && (
        <>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Icon name="GitCompareArrows" size={13} />
              Before / after
            </div>
            <dl className="overflow-hidden rounded-lg border border-border text-sm">
              <div className="flex flex-col gap-0.5 border-b border-border bg-muted/30 px-3 py-2 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Input
                </dt>
                <dd className="min-w-0 break-all font-mono text-[13px] text-muted-foreground line-through decoration-rose-400/60">
                  {inputTrimmed}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Canonical
                </dt>
                <dd className="min-w-0 break-all font-mono text-[13px] font-medium text-foreground">
                  {norm.canonical}
                </dd>
              </div>
            </dl>
            {!changed && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Icon name="Check" size={13} />
                Already canonical. This is a clean, self-referencing URL.
              </p>
            )}
          </div>

          {norm.changes.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon name="ListChecks" size={13} />
                What changed
              </div>
              <ul className="flex flex-col gap-1">
                {norm.changes.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-xs text-foreground">
                    <Icon
                      name="ArrowRight"
                      size={12}
                      className="mt-0.5 shrink-0 text-muted-foreground"
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {norm.removedParams.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon name="Filter" size={13} />
                Removed parameters
              </div>
              <div className="flex flex-wrap gap-1.5">
                {norm.removedParams.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-border bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground line-through"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Icon name="Info" size={13} />
              Where to put it
            </span>
            <p className="mt-1 leading-relaxed">
              Add this to the page&apos;s <code className="font-mono">&lt;head&gt;</code> - and to every
              URL variant of the page, as a self-referencing canonical. Use exactly one canonical per
              page, and keep it consistent with your sitemap and internal links.
            </p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<CanonState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language={meta.language}
        form={form}
        preview={preview}
        previewLabel="Canonical & diff"
        downloadName={meta.downloadName}
        downloadMime={meta.downloadMime}
        error={error}
        examples={EXAMPLES}
        stats={stats}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<CanonState>;
            if (!parsed || typeof parsed !== "object") return null;
            return { ...INITIAL, ...parsed };
          } catch {
            return null;
          }
        }}
      />
    </section>
  );
}
