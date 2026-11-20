"use client";

import * as React from "react";
import { toast } from "sonner";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { ScorePanel, ShareReport } from "@/components/tool/seo";
import {
  PLATFORMS,
  inspectHtml,
  inspectImageUrl,
  inspectionToCsv,
  inspectionToHtmlReport,
  inspectionToJson,
  type Diagnostic,
  type ImageCheck,
  type PlatformPreview,
  type SocialInspection,
  type SocialPlatformId,
} from "@/lib/seo-tools/social-inspector";

/**
 * GigAI Social Share Inspector, the dashboard.
 *
 * Paste HTML / upload an .html file (or read how to fetch a live URL) and get a
 * full social-share diagnosis: live previews for 8 platforms, an image
 * inspector, a cache "why is the old preview still showing" explainer, prioritised
 * diagnostics with fixes, structured-data + header analysis, four scores, and a
 * downloadable report. Everything runs in the browser via `lib/seo-tools`
 * (reusing the meta/preview/schema/headers engines); nothing is uploaded.
 *
 * The URL field is PROXY-READY: if a backend fetch proxy is configured
 * (`NEXT_PUBLIC_INSPECTOR_PROXY`), it fetches with an explicit consent notice and
 * the promise that the page is fetched, analysed and discarded (never stored).
 * With no proxy (today's static export) it explains, honestly, how to grab the
 * HTML yourself, matching the platform's paste-first SEO tools.
 */

type InputMode = "url" | "paste" | "upload";

const PROXY_ENDPOINT = process.env.NEXT_PUBLIC_INSPECTOR_PROXY;

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
 <meta charset="utf-8">
 <title>Launch Day: Our New Analytics Dashboard is Here: Acme</title>
 <meta name="description" content="Acme's new analytics dashboard gives your team real-time insight in one place. See what's new and how to get started today.">
 <link rel="canonical" href="https://acme.example/blog/analytics-dashboard">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <!-- Open Graph (note: image is relative + no twitter:card, the inspector flags these) -->
 <meta property="og:title" content="Launch Day: Our New Analytics Dashboard">
 <meta property="og:description" content="Real-time insight for your whole team, in one place.">
 <meta property="og:image" content="/images/og-dashboard.png">
 <meta property="og:url" content="https://acme.example/blog/analytics-dashboard">
 <meta property="og:type" content="article">
 <meta property="og:site_name" content="Acme">
 <script type="application/ld+json">
 { "@context": "https://schema.org", "@type": "Article", "headline": "Launch Day: Our New Analytics Dashboard" }
 </script>
</head>
<body><h1>Launch Day</h1></body>
</html>`;

export default function SocialShareInspectorTool({ tool }: { tool: WorkspaceToolData }) {
  const [mode, setMode] = React.useState<InputMode>("paste");
  const [url, setUrl] = React.useState("");
  const [html, setHtml] = React.useState("");
  const [headers, setHeaders] = React.useState("");
  const [showHeaders, setShowHeaders] = React.useState(false);
  const [inspection, setInspection] = React.useState<SocialInspection | null>(null);
  const [activePlatform, setActivePlatform] = React.useState<SocialPlatformId>("facebook");
  const [urlNotice, setUrlNotice] = React.useState<string | null>(null);
  const [fetching, setFetching] = React.useState(false);

  const run = React.useCallback(
    (source: string, headersText: string) => {
      if (!source.trim()) {
        setInspection(null);
        return;
      }
      const result = inspectHtml(source, { headers: headersText });
      setInspection(result);
      track("social_inspector_run", {
        overall: result.scores.overall,
        diagnostics: result.diagnostics.length,
        hasImage: Boolean(result.resolved.image),
      });
    },
    [],
  );

  // Re-run when headers are added/changed and we already have HTML analysed.
  React.useEffect(() => {
    if (inspection && html.trim()) run(html, headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers]);

  const onAnalyzePaste = () => run(html, headers);

  const onUpload = (file: File) => {
    void file.text().then((text) => {
      setHtml(text);
      setMode("paste");
      run(text, headers);
    });
  };

  const onLoadSample = () => {
    setHtml(SAMPLE_HTML);
    setMode("paste");
    run(SAMPLE_HTML, headers);
  };

  const onInspectUrl = async (targetUrl?: string) => {
    setUrlNotice(null);
    const clean = (targetUrl ?? url).trim();
    if (targetUrl) {
      setUrl(targetUrl);
      setMode("url");
    }
    if (!/^https?:\/\//i.test(clean)) {
      setUrlNotice("Enter a full URL starting with https://");
      return;
    }
    if (!PROXY_ENDPOINT) {
      setUrlNotice(
        "Your browser can't fetch another site's HTML directly (cross-origin security blocks it). Grab the HTML with the bookmarklet or View Source, then paste it below, it's the same result, fully private.",
      );
      return;
    }
    // Server-side fetch via our edge proxy (opt-in, ephemeral): the proxy fetches
    // the page, returns its HTML + response headers, and stores nothing. We then
    // analyse it locally, including the real cache/header/redirect signals.
    setFetching(true);
    try {
      const res = await fetch(`${PROXY_ENDPOINT}?url=${encodeURIComponent(clean)}`, {
        headers: { Accept: "application/json", "X-GigAI-Inspector": "1" },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; html?: string; status?: number; finalUrl?: string; headers?: Record<string, string>; error?: string }
        | null;
      if (!res.ok || !data || data.ok === false || typeof data.html !== "string" || !data.html) {
        throw new Error(data?.error || `Fetch failed (${res.status})`);
      }
      // Rebuild a raw header block so the header/cache analysis auto-populates.
      const lines: string[] = [];
      if (data.status) lines.push(`HTTP/1.1 ${data.status}`);
      for (const [k, v] of Object.entries(data.headers ?? {})) lines.push(`${k}: ${v}`);
      const headerText = lines.join("\n");
      setHtml(data.html);
      setHeaders(headerText);
      if (headerText) setShowHeaders(true);
      run(data.html, headerText);
    } catch (e) {
      setUrlNotice(
        `Couldn't fetch that URL (${e instanceof Error ? e.message : "unknown error"}). The site may block automated requests. Paste the HTML instead (View Source → Ctrl/Cmd+U → copy).`,
      );
    } finally {
      setFetching(false);
    }
  };

  const copyBookmarklet = () => {
    const code = "javascript:(function(){navigator.clipboard.writeText(document.documentElement.outerHTML);alert('HTML copied. Paste it into GigAI Social Share Inspector.');})()";
    void navigator.clipboard.writeText(code);
    setUrlNotice("Bookmarklet copied. Make a new bookmark, paste it as the URL, then click it on any page to copy that page's HTML.");
  };

  // Deep-link: opening /social-share-inspector?url=… auto-fetches + shows the
  // report, so a shared link reproduces exactly what the sender saw.
  React.useEffect(() => {
    if (typeof window === "undefined" || !PROXY_ENDPOINT) return;
    const param = new URLSearchParams(window.location.search).get("url");
    if (param && /^https?:\/\//i.test(param)) void onInspectUrl(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <ModeTabs mode={mode} onChange={setMode} />

        {mode === "url" ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onInspectUrl()}
                placeholder="https://example.com/page"
                className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => onInspectUrl()}
                disabled={fetching}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {fetching ? <Icon name="LoaderCircle" size={15} className="animate-spin" /> : <Icon name="Search" size={15} />}
                Inspect
              </button>
            </div>
            {urlNotice ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p>{urlNotice}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copyBookmarklet} className="rounded border border-border bg-background px-2 py-1 font-medium text-foreground hover:bg-accent">
                      Copy “Grab HTML” bookmarklet
                    </button>
                    <button type="button" onClick={() => setMode("paste")} className="rounded border border-border bg-background px-2 py-1 font-medium text-foreground hover:bg-accent">
                      Switch to Paste HTML
                    </button>
                  </div>
                </div>
              </div>
            ) : PROXY_ENDPOINT ? (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Icon name="ShieldCheck" size={13} className="mt-0.5 shrink-0 text-primary" />
                We fetch the page once on our edge to read its public HTML &amp; headers, analyse it in your browser, and store nothing. Prefer to keep it fully local? Use Paste HTML.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Live URL fetch needs a server (browsers block cross-origin reads). Paste or upload the HTML for a full, private analysis now, or use the bookmarklet to grab it in one click.
              </p>
            )}
          </div>
        ) : mode === "upload" ? (
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/50 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40">
            <Icon name="Upload" size={22} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Upload an .html file</span>
            <span className="text-xs text-muted-foreground">Read locally in your browser. Never uploaded</span>
            <input
              type="file"
              accept=".html,.htm,text/html,text/plain"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste a page's HTML here (View Source → Ctrl/Cmd+U → copy all)…"
              spellCheck={false}
              className="h-40 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onAnalyzePaste} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Icon name="ScanSearch" size={15} /> Inspect
              </button>
              <button type="button" onClick={onLoadSample} className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                <Icon name="FlaskConical" size={15} /> Load sample
              </button>
              {html ? (
                <button type="button" onClick={() => { setHtml(""); setInspection(null); }} className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent">
                  <Icon name="X" size={15} /> Clear
                </button>
              ) : null}
            </div>
          </div>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="ShieldCheck" size={13} className="text-primary" />
          Analysis runs entirely in your browser. Nothing you paste is uploaded, stored or logged.
        </p>
      </div>

      {inspection ? (
        <Results
          inspection={inspection}
          url={url || inspection.resolved.url}
          activePlatform={activePlatform}
          onPlatform={setActivePlatform}
          headers={headers}
          setHeaders={setHeaders}
          showHeaders={showHeaders}
          setShowHeaders={setShowHeaders}
          relatedTools={tool.relatedTools ?? []}
        />
      ) : (
        <EmptyHint />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Results
 * ════════════════════════════════════════════════════════════════════════ */

function Results({
  inspection,
  url,
  activePlatform,
  onPlatform,
  headers,
  setHeaders,
  showHeaders,
  setShowHeaders,
  relatedTools,
}: {
  inspection: SocialInspection;
  url: string;
  activePlatform: SocialPlatformId;
  onPlatform: (id: SocialPlatformId) => void;
  headers: string;
  setHeaders: (v: string) => void;
  showHeaders: boolean;
  setShowHeaders: (v: boolean) => void;
  relatedTools: string[];
}) {
  const active = inspection.platforms.find((p) => p.spec.id === activePlatform) ?? inspection.platforms[0]!;
  const host = safeHost(url) || "this page";
  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/social-share-inspector${/^https?:\/\//i.test(url) ? `?url=${encodeURIComponent(url)}` : ""}`
      : "";
  return (
    <div className="flex flex-col gap-6">
      <ScoresRow inspection={inspection} />
      <ShareReport
        url={shareLink}
        title={`Social share report: ${host}`}
        text={`Social share preview & SEO report for ${host} (via GigAI)`}
        onDownload={() => void saveReportPdf(url, inspection)}
        downloadLabel="Download PDF report"
      />
      <PreviewSection inspection={inspection} active={active} onPlatform={onPlatform} />
      <ImageInspector inspection={inspection} />
      <DiagnosticsSection diagnostics={inspection.diagnostics} />
      <TagsSection inspection={inspection} />
      <StructuredDataSection inspection={inspection} />
      <HeadersSection inspection={inspection} headers={headers} setHeaders={setHeaders} show={showHeaders} setShow={setShowHeaders} />
      <ReportSection inspection={inspection} url={url} />
      <RelatedTools slugs={relatedTools} />
    </div>
  );
}

/* ── Scores ────────────────────────────────────────────────────────────── */

function ScoresRow({ inspection }: { inspection: SocialInspection }) {
  const s = inspection.scores;
  const metrics = [
    { label: "Social", value: s.social, icon: "Share2" },
    { label: "SEO", value: s.seo, icon: "TrendingUp" },
    { label: "Image", value: s.image, icon: "Image" },
    { label: "Metadata", value: s.metadata, icon: "Tags" },
  ];
  const errors = inspection.diagnostics.filter((d) => d.severity === "error").length;
  const warns = inspection.diagnostics.filter((d) => d.severity === "warn").length;
  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 md:grid-cols-[auto_1fr]">
      <div className="flex items-center justify-center md:border-r md:border-border md:pr-6">
        <ScorePanel
          score={s.overall}
          summary="Overall share health"
          counts={{ fail: errors, warn: warns, pass: Math.max(0, inspection.diagnostics.length - errors - warns) }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:pl-2">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-background/50 p-3 text-center">
            <Icon name={m.icon} size={16} className="text-muted-foreground" />
            <span className={cn("mt-1 text-2xl font-bold tabular-nums", scoreColor(m.value))}>{m.value}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function scoreColor(n: number): string {
  if (n >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (n >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

/* ── Platform previews ─────────────────────────────────────────────────── */

function PreviewSection({
  inspection,
  active,
  onPlatform,
}: {
  inspection: SocialInspection;
  active: PlatformPreview;
  onPlatform: (id: SocialPlatformId) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <SectionTitle icon="Eye" title="Social previews" subtitle="How your link renders on each platform" />
      <div className="mt-4 flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPlatform(p.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active.spec.id === p.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon name={p.icon} size={13} />
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_18rem]">
        <div className="flex items-center justify-center rounded-xl bg-muted/40 p-4 sm:p-6">
          <PlatformCard preview={active} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border/60 bg-background/50 p-3">
            <p className="text-xs font-semibold text-foreground">How {active.spec.label} builds this</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{active.spec.note}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">Ideal image: {active.spec.image.w}×{active.spec.image.h} ({active.spec.image.ratio})</p>
          </div>
          {active.warnings.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {active.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <Icon name="TriangleAlert" size={13} className="mt-0.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Icon name="CircleCheck" size={13} /> Renders cleanly on {active.spec.label}.
            </p>
          )}
          <div className="rounded-xl border border-sky-500/25 bg-sky-500/[0.05] p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Icon name="RefreshCw" size={12} className="text-sky-500" /> Cache behaviour
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{active.spec.cache}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A platform-accurate preview card. */
function PlatformCard({ preview }: { preview: PlatformPreview }) {
  const { spec, clippedTitle, clippedDescription, image, domain, hasImage } = preview;
  const title = clippedTitle || "(no title)";
  const desc = clippedDescription;

  if (spec.style === "large") {
    return (
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-background shadow-sm">
        <ImageSlot image={image} hasImage={hasImage} className="aspect-[1.91/1]" />
        <div className="border-t border-border px-3 py-2.5">
          {spec.id === "facebook" ? <p className="text-[11px] uppercase text-muted-foreground">{domain}</p> : null}
          <p className="line-clamp-2 text-sm font-semibold text-foreground">{title}</p>
          {desc ? <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{desc}</p> : null}
          {spec.id !== "facebook" ? <p className="mt-1 text-[11px] text-muted-foreground">{domain}</p> : null}
        </div>
      </div>
    );
  }
  if (spec.style === "chat") {
    // Telegram / Discord: left accent bar + stacked content.
    return (
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-3 shadow-sm">
        <div className="border-l-4 border-primary/70 pl-3">
          <p className="text-xs font-semibold text-primary/90">{preview.siteName || domain}</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground">{title}</p>
          {desc ? <p className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">{desc}</p> : null}
          {hasImage ? <ImageSlot image={image} hasImage={hasImage} className="mt-2 aspect-[1.91/1] rounded-md" /> : null}
        </div>
      </div>
    );
  }
  // compact (whatsapp / slack / teams): thumbnail left, text right.
  return (
    <div className="flex w-full max-w-md gap-3 rounded-lg border border-border bg-background p-2.5 shadow-sm">
      <ImageSlot image={image} hasImage={hasImage} className="size-16 shrink-0 rounded-md" small />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{title}</p>
        {desc ? <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{desc}</p> : null}
        <p className="mt-1 text-[11px] text-muted-foreground">{domain}</p>
      </div>
    </div>
  );
}

function ImageSlot({ image, hasImage, className, small }: { image?: string; hasImage: boolean; className?: string; small?: boolean }) {
  const [broken, setBroken] = React.useState(false);
  if (hasImage && image && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" onError={() => setBroken(true)} className={cn("w-full bg-muted object-cover", className)} />;
  }
  return (
    <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
      <div className="flex flex-col items-center gap-1">
        <Icon name="ImageOff" size={small ? 16 : 22} />
        {!small ? <span className="text-[10px]">{broken ? "Image failed to load" : "No image"}</span> : null}
      </div>
    </div>
  );
}

/* ── Image inspector ───────────────────────────────────────────────────── */

function ImageInspector({ inspection }: { inspection: SocialInspection }) {
  const imageUrl = inspection.resolved.image;
  const [check, setCheck] = React.useState<ImageCheck | null>(null);
  const [loading, setLoading] = React.useState(false);

  const inspect = async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      setCheck(await inspectImageUrl(imageUrl));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <SectionTitle icon="ImagePlus" title="Share image inspector" subtitle="Validate the og:image against platform requirements" />
      {!imageUrl ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          <Icon name="ImageOff" size={15} /> No share image found - add an og:image (1200×630) so links render with a picture.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 break-all rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
            <Icon name="Link" size={13} className="shrink-0" />
            <span className="min-w-0 flex-1">{imageUrl}</span>
            {!check ? (
              <button type="button" onClick={inspect} disabled={loading} className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {loading ? "Checking…" : "Inspect image"}
              </button>
            ) : null}
          </div>
          {check ? (
            <div className={cn("rounded-lg border p-3", check.status === "good" ? "border-emerald-500/30 bg-emerald-500/5" : check.status === "warn" ? "border-amber-500/30 bg-amber-500/5" : "border-rose-500/30 bg-rose-500/5")}>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <Fact label="Loads" value={check.exists ? "Yes" : "No"} />
                <Fact label="HTTPS" value={check.https ? "Yes" : "No"} />
                {check.width ? <Fact label="Size" value={`${check.width}×${check.height}`} /> : null}
                {check.ratio ? <Fact label="Ratio" value={check.ratio} /> : null}
                {check.bytes ? <Fact label="Weight" value={formatKB(check.bytes)} /> : null}
                {check.contentType ? <Fact label="Type" value={check.contentType} /> : null}
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {check.messages.map((m, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {m}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Dimensions are measured in your browser; file size is read when the image host allows it.</p>
          )}
        </div>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

/* ── Diagnostics ───────────────────────────────────────────────────────── */

const SEV_STYLE: Record<Diagnostic["severity"], { icon: string; color: string; ring: string }> = {
  error: { icon: "OctagonAlert", color: "text-rose-600 dark:text-rose-400", ring: "border-rose-500/30" },
  warn: { icon: "TriangleAlert", color: "text-amber-600 dark:text-amber-400", ring: "border-amber-500/30" },
  info: { icon: "Info", color: "text-sky-600 dark:text-sky-400", ring: "border-sky-500/25" },
};

function DiagnosticsSection({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const [query, setQuery] = React.useState("");
  const filtered = query
    ? diagnostics.filter((d) => (d.title + d.cause + d.impact + d.fix + d.category).toLowerCase().includes(query.toLowerCase()))
    : diagnostics;
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon="Stethoscope" title="Diagnostics" subtitle="Every issue explained, cause, impact and the fix" />
        <div className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5">
          <Icon name="Search" size={13} className="text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search report" className="w-32 bg-transparent text-xs outline-none placeholder:text-muted-foreground sm:w-40" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((d) => (
          <DiagnosticRow key={d.id} d={d} />
        ))}
        {filtered.length === 0 ? <p className="text-sm text-muted-foreground">No diagnostics match “{query}”.</p> : null}
      </div>
    </section>
  );
}

function DiagnosticRow({ d }: { d: Diagnostic }) {
  const [open, setOpen] = React.useState(d.priority === "high");
  const s = SEV_STYLE[d.severity];
  return (
    <div className={cn("rounded-xl border bg-background/50", s.ring)}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
        <Icon name={s.icon} size={16} className={cn("shrink-0", s.color)} />
        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{d.title}</span>
        <PriorityBadge priority={d.priority} />
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="shrink-0 text-muted-foreground" />
      </button>
      {open ? (
        <div className="grid gap-2 border-t border-border/60 px-3 py-3 text-xs sm:grid-cols-3">
          <Detail label="Why it happens" value={d.cause} />
          <Detail label="Impact" value={d.impact} />
          <Detail label="Recommended fix" value={d.fix} accent />
          <div className="sm:col-span-3 flex flex-wrap gap-2 pt-1 text-[11px] text-muted-foreground">
            <span className="rounded bg-muted px-1.5 py-0.5">Category: {d.category}</span>
            <span className="rounded bg-muted px-1.5 py-0.5">Difficulty: {d.difficulty}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="font-semibold text-foreground">{label}</p>
      <p className={cn("mt-0.5 leading-relaxed", accent ? "text-foreground" : "text-muted-foreground")}>{value}</p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Diagnostic["priority"] }) {
  const map = {
    high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    low: "bg-muted text-muted-foreground",
  };
  return <span className={cn("hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase sm:inline-block", map[priority])}>{priority}</span>;
}

/* ── Extracted tags ────────────────────────────────────────────────────── */

function TagsSection({ inspection }: { inspection: SocialInspection }) {
  const { extracted } = inspection;
  const og = Object.entries(extracted.og);
  const tw = Object.entries(extracted.twitter);
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <SectionTitle icon="Tags" title="Extracted tags" subtitle="Exactly what was found in the markup" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TagTable title="Open Graph" prefix="og:" rows={og} icon="Share2" empty="No og: tags found" />
        <TagTable title="Twitter Card" prefix="twitter:" rows={tw} icon="Twitter" empty="No twitter: tags found" />
      </div>
      <div className="mt-4 grid gap-2 rounded-xl border border-border/60 bg-background/50 p-3 text-xs sm:grid-cols-2">
        <TagRow label="Title" value={extracted.title} />
        <TagRow label="Description" value={extracted.description} />
        <TagRow label="Canonical" value={extracted.canonical} />
        <TagRow label="Robots" value={extracted.robots} />
        <TagRow label="Viewport" value={extracted.viewport} />
        <TagRow label="Charset" value={extracted.charset} />
        <TagRow label="Language" value={extracted.language} />
        <TagRow label="Favicon" value={extracted.favicon} />
      </div>
    </section>
  );
}

function TagTable({ title, prefix, rows, icon, empty }: { title: string; prefix: string; rows: [string, string][]; icon: string; empty: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground"><Icon name={icon} size={13} /> {title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {rows.map(([k, v]) => (
            <li key={k} className="flex flex-col gap-0.5 border-b border-border/50 py-1 last:border-0 sm:flex-row sm:gap-2">
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{prefix}{k}</span>
              <span className="min-w-0 break-words text-[11px] text-foreground">{v || "-"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TagRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 break-words", value ? "text-foreground" : "text-muted-foreground/60")}>{value || "-"}</span>
    </div>
  );
}

/* ── Structured data ───────────────────────────────────────────────────── */

function StructuredDataSection({ inspection }: { inspection: SocialInspection }) {
  const items = inspection.structuredData;
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <SectionTitle icon="Braces" title="Structured data" subtitle="JSON-LD schema found on the page" />
      {items.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Info" size={15} /> No JSON-LD structured data found. Adding it unlocks rich results.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className={cn("rounded-xl border p-3", item.validation.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5")}>
              <div className="flex items-center gap-2">
                <Icon name={item.validation.ok ? "CircleCheck" : "TriangleAlert"} size={15} className={item.validation.ok ? "text-emerald-500" : "text-amber-500"} />
                <span className="text-sm font-medium text-foreground">{item.types.length ? item.types.join(", ") : "Unknown type"}</span>
              </div>
              {!item.validation.ok ? (
                <ul className="mt-1.5 flex flex-col gap-0.5 pl-6 text-xs text-muted-foreground">
                  {[...item.validation.errors, ...item.validation.warnings].map((e, j) => (
                    <li key={j}>• {e.path ? `${e.path}: ` : ""}{e.message}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── HTTP headers (optional paste) ─────────────────────────────────────── */

function HeadersSection({
  inspection,
  headers,
  setHeaders,
  show,
  setShow,
}: {
  inspection: SocialInspection;
  headers: string;
  setHeaders: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  const report = inspection.headers;
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <button type="button" onClick={() => setShow(!show)} aria-expanded={show} className="flex w-full items-center gap-2 text-left">
        <Icon name="ServerCog" size={17} className="text-primary" />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-foreground">HTTP headers &amp; cache</span>
          <span className="block text-xs text-muted-foreground">Paste response headers to analyze Cache-Control, security &amp; more</span>
        </span>
        <Icon name={show ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
      </button>
      {show ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Browsers can&apos;t read another site&apos;s response headers (CORS). Grab them from your browser&apos;s Network tab (right-click the request → Copy → Copy response headers) or <code className="rounded bg-muted px-1">curl -I your-url</code>, then paste below.
          </p>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder={"cache-control: public, max-age=3600\netag: \"abc123\"\ncontent-type: text/html. Charset=utf-8"}
            spellCheck={false}
            className="h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {report ? (
            <div className="grid gap-2 rounded-xl border border-border/60 bg-background/50 p-3 text-xs sm:grid-cols-2">
              {report.parsed.status ? <Fact label="Status" value={String(report.parsed.status)} /> : null}
              {["content-type", "cache-control", "etag", "expires", "server", "content-encoding"].map((h) => {
                const v = report.parsed.map[h];
                return v ? <Fact key={h} label={h} value={v} /> : null;
              })}
              <div className="sm:col-span-2 mt-1 flex items-center gap-2 border-t border-border/50 pt-2">
                <span className="rounded bg-muted px-1.5 py-0.5 font-semibold">Security grade {report.security.grade}</span>
                <span className="text-muted-foreground">{report.security.score}/100 on security headers</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/* ── Report export ─────────────────────────────────────────────────────── */

function ReportSection({ inspection, url }: { inspection: SocialInspection; url: string }) {
  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    track("social_inspector_export", { format: filename.split(".").pop() ?? "" });
  };
  const host = safeHost(url) || "page";
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <SectionTitle icon="Download" title="Export report" subtitle="Hand a prioritised, developer-ready report to your team" />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => download(inspectionToJson(url, inspection), `social-report-${host}.json`, "application/json")} className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
          <Icon name="Braces" size={15} /> JSON
        </button>
        <button type="button" onClick={() => download(inspectionToCsv(inspection), `social-report-${host}.csv`, "text/csv")} className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
          <Icon name="Sheet" size={15} /> CSV
        </button>
        <button type="button" onClick={() => void saveReportPdf(url, inspection)} className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
          <Icon name="FileText" size={15} /> PDF report
        </button>
        <button type="button" onClick={() => { void navigator.clipboard.writeText(inspectionToJson(url, inspection)); }} className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
          <Icon name="Copy" size={15} /> Copy JSON
        </button>
      </div>
    </section>
  );
}

/* ── Related tools ─────────────────────────────────────────────────────── */

const RELATED_LABELS: Record<string, { title: string; icon: string }> = {
  "open-graph-generator": { title: "Open Graph Generator", icon: "Share2" },
  "meta-tag-generator": { title: "Meta Tag Generator", icon: "Tags" },
  "meta-tag-analyzer": { title: "Meta Tag Analyzer", icon: "ScanSearch" },
  "twitter-card-generator": { title: "Twitter Card Generator", icon: "Twitter" },
  "schema-generator": { title: "Schema Generator", icon: "Braces" },
  "robots-txt-generator": { title: "Robots.txt Generator", icon: "Bot" },
  "xml-sitemap-generator": { title: "Sitemap Generator", icon: "Network" },
  "image-resizer": { title: "Image Resizer", icon: "Maximize2" },
  "image-compressor": { title: "Image Compressor", icon: "FileArchive" },
  "open-graph-preview": { title: "Open Graph Preview", icon: "Eye" },
  "google-serp-preview": { title: "Google SERP Preview", icon: "Search" },
};

function RelatedTools({ slugs }: { slugs: string[] }) {
  const items = slugs.map((s) => ({ slug: s, ...(RELATED_LABELS[s] ?? { title: s, icon: "Wrench" }) }));
  if (items.length === 0) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <SectionTitle icon="Sparkles" title="Fix it faster with these tools" subtitle="Everything you need to resolve the issues above" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <a key={it.slug} href={`/${it.slug}`} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-accent">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon name={it.icon} size={15} /></span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{it.title}</span>
            <Icon name="ArrowRight" size={14} className="shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  );
}

/* ── Shared bits ───────────────────────────────────────────────────────── */

function ModeTabs({ mode, onChange }: { mode: InputMode; onChange: (m: InputMode) => void }) {
  const tabs: { id: InputMode; label: string; icon: string }[] = [
    { id: "paste", label: "Paste HTML", icon: "ClipboardPaste" },
    { id: "upload", label: "Upload", icon: "Upload" },
    { id: "url", label: "URL", icon: "Link" },
  ];
  return (
    <div className="inline-flex rounded-lg border border-border p-0.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            mode === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon name={t.icon} size={14} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon name={icon} size={16} /></span>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <Icon name="ScanSearch" size={28} className="mx-auto text-muted-foreground" />
      <p className="mt-3 text-sm font-medium text-foreground">Paste a page&apos;s HTML to inspect its social previews</p>
      <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
        You&apos;ll get live previews for 8 platforms, an image inspector, a cache explainer, prioritised fixes, and a downloadable report: all private, in your browser.
      </p>
    </div>
  );
}

function formatKB(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function safeHost(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Build the branded report HTML and render it to a PDF the user can hand to a
 * client. The heavy renderer (jspdf + html2canvas) is dynamic-imported so it
 * never weighs down the tool's first load. Progress + result are surfaced as
 * toasts because rasterising the report takes a moment.
 */
async function saveReportPdf(url: string, inspection: SocialInspection) {
  const host = safeHost(url) || "page";
  const id = toast.loading("Building your PDF report…");
  try {
    const { reportHtmlToPdfBlob } = await import("@/lib/seo-tools/report-pdf");
    const blob = await reportHtmlToPdfBlob(inspectionToHtmlReport(url, inspection));
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `social-report-${host}.pdf`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    toast.success("PDF report downloaded", { id });
    track("social_inspector_export", { format: "pdf" });
  } catch (e) {
    toast.error(`Couldn't build the PDF (${e instanceof Error ? e.message : "unknown error"}). Try again or export JSON.`, { id });
  }
}
