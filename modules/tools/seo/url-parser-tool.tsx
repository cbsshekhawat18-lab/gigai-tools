"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import {
  CopyButton,
  Field,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { Icon } from "@/lib/icons";
import { parseUrl, type UrlBreakdown } from "@/lib/seo-tools/url";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

interface UrlParserState {
  /** The single URL being parsed. */
  url: string;
}

const INITIAL: UrlParserState = { url: "" };

/* -------------------------------------------------------------------------- */
/*  Derived model                                                             */
/* -------------------------------------------------------------------------- */

interface ComponentRow {
  key: string;
  label: string;
  value: string;
  /** A short hint shown under empty values. */
  emptyHint?: string;
  mono?: boolean;
}

/** Build the ordered list of component rows from a parsed breakdown. */
function componentRows(b: UrlBreakdown): ComponentRow[] {
  return [
    { key: "scheme", label: "Scheme", value: b.scheme, mono: true },
    { key: "username", label: "Username", value: b.username, emptyHint: "none", mono: true },
    { key: "password", label: "Password", value: b.password, emptyHint: "none", mono: true },
    { key: "host", label: "Host", value: b.host, mono: true },
    { key: "hostname", label: "Hostname", value: b.hostname, mono: true },
    { key: "port", label: "Port", value: b.port, emptyHint: "default for scheme", mono: true },
    { key: "origin", label: "Origin", value: b.origin, mono: true },
    { key: "pathname", label: "Path", value: b.pathname, mono: true },
    { key: "search", label: "Query string", value: b.search, emptyHint: "none", mono: true },
    { key: "hash", label: "Fragment", value: b.hash, emptyHint: "none", mono: true },
  ];
}

/** Best-effort domain rows (skipped for IP literals). */
function domainRows(b: UrlBreakdown): ComponentRow[] {
  if (b.isIp) return [];
  const rows: ComponentRow[] = [];
  if (b.subdomain) rows.push({ key: "subdomain", label: "Subdomain", value: b.subdomain, mono: true });
  if (b.domain) rows.push({ key: "domain", label: "Domain", value: b.domain, mono: true });
  if (b.tld) rows.push({ key: "tld", label: "TLD", value: b.tld, mono: true });
  return rows;
}

/** Which query keys appear more than once. */
function duplicateKeys(params: [string, string][]): Set<string> {
  const counts = new Map<string, number>();
  for (const [k] of params) counts.set(k, (counts.get(k) ?? 0) + 1);
  const dups = new Set<string>();
  for (const [k, n] of counts) if (n > 1) dups.add(k);
  return dups;
}

/** The JSON payload used for the code pane / download / copy. */
function toJson(b: UrlBreakdown): string {
  return JSON.stringify(
    {
      href: b.href,
      origin: b.origin,
      scheme: b.scheme,
      protocol: b.protocol,
      username: b.username || undefined,
      password: b.password || undefined,
      host: b.host,
      hostname: b.hostname,
      port: b.port || undefined,
      pathname: b.pathname,
      segments: b.segments,
      search: b.search || undefined,
      params: b.params.map(([key, value]) => ({ key, value })),
      hash: b.hash || undefined,
      isSecure: b.isSecure,
      isIp: b.isIp,
      domain: b.domain,
      subdomain: b.subdomain,
      tld: b.tld,
    },
    null,
    2,
  );
}

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLES: ReadonlyArray<Example<UrlParserState>> = [
  {
    label: "Tracking link",
    description: "Campaign URL with utm_* parameters",
    icon: "Megaphone",
    value: {
      url: "https://shop.example.com/products/blue-widget?utm_source=newsletter&utm_medium=email&utm_campaign=summer%20sale&ref=a%2Fb",
    },
  },
  {
    label: "OAuth redirect",
    description: "Callback with encoded redirect_uri and state",
    icon: "KeyRound",
    value: {
      url: "https://auth.example.com/callback?code=Ab12Cd34&state=xyz789&redirect_uri=https%3A%2F%2Fapp.example.com%2Fdashboard#done",
    },
  },
  {
    label: "Deep link with port",
    description: "Userinfo, non-default port, path segments and fragment",
    icon: "Link2",
    value: {
      url: "https://user:s3cret@dev.example.com:8443/v2/orders/1057/items?expand=all&sort=-created#summary",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Presentational pieces                                                     */
/* -------------------------------------------------------------------------- */

function ValueCell({ row }: { row: ComponentRow }) {
  if (!row.value) {
    return (
      <span className="text-xs italic text-muted-foreground">
        {row.emptyHint ?? "empty"}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`min-w-0 break-all ${row.mono ? "font-mono" : ""} text-sm text-foreground`}>
        {row.value}
      </span>
      <CopyButton value={row.value} label={`Copy ${row.label}`} labelMode="icon" />
    </div>
  );
}

function ComponentTable({ title, rows }: { title: string; rows: ComponentRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <table className="w-full border-collapse text-left">
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key} className={i > 0 ? "border-t border-border/70" : ""}>
              <th
                scope="row"
                className="w-32 whitespace-nowrap px-3 py-2 align-top text-xs font-medium text-muted-foreground"
              >
                {row.label}
              </th>
              <td className="px-3 py-2 align-top">
                <ValueCell row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function UrlParserTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<UrlParserState>(INITIAL);

  const { code, preview, stats, error } = React.useMemo(() => {
    const trimmed = state.url.trim();

    // Empty state: no error, helpful preview.
    if (!trimmed) {
      return {
        code: "",
        error: null as string | null,
        stats: (
          <StatBadge label="Status" value="Awaiting URL" icon="Link2" tone="default" />
        ),
        preview: (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
            <Icon name="Link2" size={28} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Paste a URL to break it apart</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Include a scheme like <span className="font-mono">https://</span>. Nothing is fetched  -
              the URL is parsed entirely in your browser. Try an example from the toolbar.
            </p>
          </div>
        ),
      };
    }

    const parsed = parseUrl(trimmed);

    if (!parsed.ok) {
      return {
        code: "",
        error: parsed.error.message,
        stats: <StatBadge label="Status" value="Invalid URL" icon="TriangleAlert" tone="danger" />,
        preview: (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 px-6 py-12 text-center">
            <Icon name="TriangleAlert" size={26} className="text-destructive" />
            <p className="text-sm font-medium text-foreground">Couldn&apos;t parse that URL</p>
            <p className="max-w-sm text-xs text-muted-foreground">{parsed.error.message}</p>
          </div>
        ),
      };
    }

    const b = parsed.result;
    const dups = duplicateKeys(b.params);
    const json = toJson(b);

    const params = b.params;
    const segments = b.segments;

    const statNodes = (
      <>
        <StatBadge
          label="Protocol"
          value={b.isSecure ? "HTTPS" : b.scheme.toUpperCase()}
          icon={b.isSecure ? "ShieldCheck" : "ShieldAlert"}
          tone={b.isSecure ? "success" : "warning"}
        />
        <StatBadge label="Params" value={params.length} icon="Table" tone={params.length ? "info" : "default"} />
        {dups.size > 0 && (
          <StatBadge label="Duplicate keys" value={dups.size} icon="Copy" tone="warning" />
        )}
        <StatBadge label="Segments" value={segments.length} icon="GitFork" />
        {b.isIp && <StatBadge label="Host" value="IP literal" icon="Server" tone="info" />}
      </>
    );

    const previewNode = (
      <div className="flex flex-col gap-4">
        {/* Rebuilt / normalised URL */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rebuilt URL
            </span>
            <CopyButton value={b.href} label="Copy rebuilt URL" labelMode="icon" />
          </div>
          <p className="break-all font-mono text-sm text-foreground">{b.href}</p>
        </div>

        <ComponentTable title="Components" rows={componentRows(b)} />

        {domainRows(b).length > 0 && (
          <ComponentTable title="Domain" rows={domainRows(b)} />
        )}

        {/* Path segments */}
        {segments.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Path segments ({segments.length})
            </div>
            <ol className="flex flex-wrap gap-1.5 p-3">
              {segments.map((seg, i) => (
                <li
                  key={`${i}-${seg}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground"
                >
                  <span className="text-muted-foreground">{i + 1}</span>
                  <span className="break-all">{seg}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Query parameters */}
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Query parameters ({params.length})
          </div>
          {params.length === 0 ? (
            <p className="px-3 py-3 text-xs italic text-muted-foreground">
              No query string on this URL.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/70 text-xs text-muted-foreground">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Key
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Value (decoded)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {params.map(([key, value], i) => (
                    <tr key={`${i}-${key}`} className="border-t border-border/60 align-top">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="break-all font-mono text-sm text-foreground">{key}</span>
                          {dups.has(key) && (
                            <span
                              className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                              title="This key appears more than once"
                            >
                              dup
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {value === "" ? (
                          <span className="text-xs italic text-muted-foreground">empty</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="min-w-0 break-all font-mono text-sm text-foreground">
                              {value}
                            </span>
                            <CopyButton
                              value={value}
                              label={`Copy value of ${key}`}
                              labelMode="icon"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );

    return { code: json, preview: previewNode, stats: statNodes, error: null as string | null };
  }, [state]);

  const form = (
    <Field
      label="URL to parse"
      htmlFor="url-parser-input"
      hint="Paste an absolute URL including its scheme (https://). Nothing is fetched: it's parsed locally."
    >
      <input
        id="url-parser-input"
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        value={state.url}
        onChange={(e) => setState({ url: e.target.value })}
        placeholder="https://example.com/path/page?key=value&utm_source=news#section"
        aria-label="URL to parse"
        className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </Field>
  );

  return (
    <GeneratorWithPreview<UrlParserState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="JSON"
      form={form}
      preview={preview}
      previewLabel="Breakdown"
      downloadName="url-breakdown.json"
      downloadMime="application/json;charset=utf-8"
      error={error}
      examples={EXAMPLES}
      stats={stats}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<UrlParserState>;
          if (typeof parsed !== "object" || parsed === null || typeof parsed.url !== "string") {
            return null;
          }
          return { url: parsed.url };
        } catch {
          return null;
        }
      }}
    />
  );
}
