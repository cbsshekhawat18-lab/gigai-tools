"use client";

import * as React from "react";
import Link from "next/link";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { FixWithTool } from "@/components/tool/fix-with-tool";
import { CheckList, ScorePanel, ShareReport, useDeepLinkUrl, type CheckItem } from "@/components/tool/seo";
import { fetchPage, normalizeUrl, urlFetchEnabled } from "@/lib/seo-tools/fetch-url";
import { composeGeoAudit, type GeoAuditResult, type AuditSection } from "@/lib/geo/audit";

/**
 * GigAI GEO Audit — the hero of the GEO Studio. One URL in, one report out:
 * crawler access, JS rendering, citability, retrieval chunks, answer snippets
 * and machine-readable identity, sectioned by severity, every finding linking
 * to the component tool that digs deeper or fixes it.
 *
 * Three stateless fetches through the proxy (the page, /robots.txt and
 * /llms.txt); ALL analysis then runs in this tab. Nothing is stored.
 */

type Phase = "idle" | "fetching" | "done" | "error";

const STEPS = [
  "Fetching the page (raw HTML, exactly as a crawler receives it)",
  "Fetching robots.txt + checking every AI crawler token",
  "Checking llms.txt",
  "Analyzing content, chunks, snippets and schema in your browser",
];

function scoreTone(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function SectionCard({ section }: { section: AuditSection }) {
  const items: CheckItem[] = section.findings.map((f, i) => ({
    id: `${section.id}-${i}`,
    status: f.status,
    label: f.label,
    detail: f.detail,
    fix:
      f.fix || f.toolSlug ? (
        <span>
          {f.fix}
          {f.toolSlug && (
            <FixWithTool
              prompt="Dig deeper with"
              tools={[{ slug: f.toolSlug, label: f.toolLabel ?? f.toolSlug, icon: "ArrowRight" }]}
            />
          )}
        </span>
      ) : undefined,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
        <div className="flex items-center gap-3">
          <span className={cn("font-mono text-lg font-semibold", scoreTone(section.score))}>
            {section.score}
            <span className="text-xs text-muted-foreground">/100</span>
          </span>
          <Link
            href={`/${section.toolSlug}`}
            className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            Open tool <Icon name="ArrowRight" size={12} />
          </Link>
        </div>
      </div>
      <CheckList items={items} />
    </div>
  );
}

export default function GeoAuditTool({ tool }: { tool: WorkspaceToolData }) {
  const [url, setUrl] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<GeoAuditResult | null>(null);
  const deepLink = useDeepLinkUrl();
  const enabled = urlFetchEnabled();

  const run = React.useCallback(async (target: string) => {
    const clean = normalizeUrl(target);
    if (!/^https?:\/\/.+\..+/.test(clean)) {
      setError("Enter a full URL, e.g. https://example.com/page");
      return;
    }
    setPhase("fetching");
    setError(null);
    setResult(null);
    try {
      setStep(0);
      const page = await fetchPage(clean);

      setStep(1);
      let robotsTxt: string | null = null;
      let robotsHeaders: Record<string, string> | undefined;
      try {
        const origin = new URL(page.finalUrl || clean).origin;
        const robots = await fetchPage(`${origin}/robots.txt`);
        robotsTxt = robots.status === 200 ? robots.html : "";
        robotsHeaders = robots.headers;
      } catch {
        robotsTxt = null;
      }

      setStep(2);
      let llmsTxtFound: boolean | null = null;
      try {
        const origin = new URL(page.finalUrl || clean).origin;
        const llms = await fetchPage(`${origin}/llms.txt`);
        llmsTxtFound = llms.status === 200 && !/<html/i.test(llms.html.slice(0, 300));
      } catch {
        llmsTxtFound = null;
      }

      setStep(3);
      // Yield a frame so the step renders before the synchronous analysis.
      await new Promise((r) => setTimeout(r, 30));
      setResult(composeGeoAudit({ url: clean, page, robotsTxt, robotsHeaders, llmsTxtFound, headersAvailable: page.headersAvailable }));
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't fetch that URL.");
      setPhase("error");
    }
  }, []);

  // Deep link: /geo-audit?url=… reproduces a shared report.
  const deepLinked = React.useRef(false);
  React.useEffect(() => {
    if (deepLink && !deepLinked.current && enabled) {
      deepLinked.current = true;
      setUrl(deepLink);
      void run(deepLink);
    }
  }, [deepLink, enabled, run]);

  const shareUrl =
    result && typeof window !== "undefined"
      ? `${window.location.origin}/geo-audit?url=${encodeURIComponent(result.url)}`
      : "";

  return (
    <section aria-label={tool.title} className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(url);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com: audit any page's AI visibility"
          aria-label="URL to audit"
          className="h-12 w-full rounded-md border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={phase === "fetching" || !enabled}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {phase === "fetching" ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : <Icon name="Radar" size={16} />}
          Run GEO audit
        </button>
      </form>
      {!enabled && (
        <p className="text-xs text-muted-foreground">
          Live URL fetching isn&apos;t available on this deployment. Use the individual tools below in paste mode instead.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Three stateless fetches (the page, robots.txt, llms.txt) through our proxy: fetched, analyzed in
        your browser, then discarded. Nothing about you or the site is stored.
      </p>

      {phase === "fetching" && (
        <ol className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-4">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2 text-xs">
              {i < step ? (
                <Icon name="CircleCheck" size={14} className="shrink-0 text-success" />
              ) : i === step ? (
                <Icon name="LoaderCircle" size={14} className="shrink-0 animate-spin text-primary" />
              ) : (
                <Icon name="Circle" size={14} className="shrink-0 text-muted-foreground/40" />
              )}
              <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error} {phase === "error" && "Some sites block automated fetches: try the component tools in paste mode."}
        </p>
      )}

      {result && (
        <>
          <ScorePanel
            score={result.overall}
            summary={
              <span>
                <span className="font-mono text-xs text-muted-foreground">{result.url}</span>
                <br />
                {result.summary}
              </span>
            }
            counts={{
              pass: result.sections.flatMap((s) => s.findings).filter((f) => f.status === "pass").length,
              warn: result.sections.flatMap((s) => s.findings).filter((f) => f.status === "warn").length,
              fail: result.sections.flatMap((s) => s.findings).filter((f) => f.status === "fail").length,
            }}
          />

          {/* Worst sections first: severity ordering is the report's structure. */}
          <div className="flex flex-col gap-3">
            {[...result.sections]
              .sort((a, b) => a.score - b.score)
              .map((s) => (
                <SectionCard key={s.id} section={s} />
              ))}
          </div>

          <ShareReport
            url={shareUrl}
            title={`GEO audit: ${result.url} scored ${result.overall}/100`}
            text={`AI visibility audit of ${result.url}: ${result.overall}/100. ${result.summary}`}
          />
        </>
      )}

      {phase === "idle" && !deepLink && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <Icon name="Radar" size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Can AI systems find, read and cite this page?</p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            One URL, one report: whether the {""}
            AI crawlers can reach it (robots.txt, with real RFC 9309 matching and Cloudflare detection),
            whether the content exists without JavaScript, whether there&apos;s anything worth citing
            (scored with the published GEO-study factors), how it survives retrieval chunking, whether
            sections answer first, and whether its identity is machine-readable. Every finding links to
            the free GigAI tool that fixes it.
          </p>
        </div>
      )}
    </section>
  );
}
