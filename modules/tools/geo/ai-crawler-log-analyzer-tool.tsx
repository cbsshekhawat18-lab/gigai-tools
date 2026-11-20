"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { FileDropZone } from "@/components/tool/dev";
import { CheckList, ScorePanel, type CheckItem } from "@/components/tool/seo";
import { analyzeAccessLog, type BotStats, type LogReport } from "@/lib/geo/logs";
import { ROLE_LABELS } from "@/lib/geo/crawlers";

/**
 * AI Crawler Log Analyzer — drop a server access log and see which AI crawlers
 * ACTUALLY visit, how often, what they read, and what they've never touched.
 *
 * 100% client-side, and here that's not a slogan: access logs contain visitor
 * IP addresses. The file is parsed in this tab, the IP column is discarded at
 * the parser level (never stored, never displayed), and nothing is uploaded.
 */

const MAX_MB = 200;

function fmtDate(d?: Date): string {
  return d ? d.toISOString().slice(0, 16).replace("T", " ") + " UTC" : "";
}

/** Mini per-day activity bars (pure CSS, no chart lib). */
function TrendBars({ byDay }: { byDay: Record<string, number> }) {
  const days = Object.keys(byDay).sort();
  if (days.length < 2) return null;
  const max = Math.max(...days.map((d) => byDay[d] ?? 0));
  const shown = days.slice(-30);
  return (
    <div className="mt-2 flex h-8 items-end gap-px" aria-label="Daily hits, most recent 30 days with traffic">
      {shown.map((d) => (
        <div
          key={d}
          title={`${d}: ${byDay[d] ?? 0} hits`}
          className="min-w-[3px] flex-1 rounded-t-sm bg-primary/60"
          style={{ height: `${Math.max(8, ((byDay[d] ?? 0) / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function BotCard({ bot }: { bot: BotStats }) {
  const ok = Object.entries(bot.statuses)
    .filter(([s]) => s.startsWith("2") || s.startsWith("3"))
    .reduce((n, [, c]) => n + c, 0);
  const okPct = bot.hits ? Math.round((ok / bot.hits) * 100) : 0;
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-sm font-semibold text-foreground">{bot.crawler.token}</span>
        <span className="text-xs text-muted-foreground">
          {bot.crawler.operator} · {ROLE_LABELS[bot.crawler.role]}
        </span>
        <span className="ml-auto font-mono text-sm text-foreground">{bot.hits.toLocaleString()} hits</span>
      </div>
      <div className="mt-1.5 grid gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground sm:grid-cols-2">
        <span>First seen: <span className="font-mono">{fmtDate(bot.firstSeen)}</span></span>
        <span>Last seen: <span className="font-mono">{fmtDate(bot.lastSeen)}</span></span>
        <span>
          Got content (2xx/3xx): <span className={cn("font-mono", okPct < 80 ? "text-warning" : "")}>{okPct}%</span>
          {okPct < 80 && ": check what's being denied"}
        </span>
        <span>
          Statuses:{" "}
          <span className="font-mono">
            {Object.entries(bot.statuses).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s, c]) => `${s}×${c}`).join(" ")}
          </span>
        </span>
      </div>
      {bot.topPaths.length > 0 && (
        <div className="mt-2 border-t border-border pt-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Most fetched</p>
          <ul className="flex flex-col gap-0.5">
            {bot.topPaths.slice(0, 5).map((p) => (
              <li key={p.path} className="flex items-baseline gap-2 font-mono text-[11px]">
                <span className="text-muted-foreground">{p.hits}×</span>
                <span className="min-w-0 break-all text-foreground">{p.path}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <TrendBars byDay={bot.byDay} />
    </div>
  );
}

export default function AiCrawlerLogAnalyzerTool({ tool }: { tool: WorkspaceToolData }) {
  const [report, setReport] = React.useState<LogReport | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [siteUrls, setSiteUrls] = React.useState("");
  const logTextRef = React.useRef<string>("");

  const run = React.useCallback((text: string, urls: string) => {
    const urlList = urls
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    setReport(analyzeAccessLog(text, urlList.length ? urlList : undefined));
  }, []);

  const onFiles = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError(null);
      setBusy(true);
      try {
        if (/\.gz$/i.test(file.name)) {
          throw new Error("Please gunzip the log first (e.g. `gunzip access.log.gz`): compressed logs aren't parsed.");
        }
        const text = await file.text();
        logTextRef.current = text;
        setFileName(file.name);
        run(text, siteUrls);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't read that file.");
        setReport(null);
      } finally {
        setBusy(false);
      }
    },
    [run, siteUrls],
  );

  // Re-run never-fetched when the sitemap list changes (log already loaded).
  React.useEffect(() => {
    if (logTextRef.current) run(logTextRef.current, siteUrls);
  }, [siteUrls, run]);

  const checks: CheckItem[] = [];
  if (report) {
    if (report.aiHits === 0) {
      checks.push({
        status: "fail",
        label: "Zero AI crawler hits in this log",
        detail: `${report.parsedLines.toLocaleString()} requests parsed and not one came from an AI crawler. Either the log window predates AI crawling, robots.txt/your firewall is blocking them, or a CDN answers bots before they reach this server (CDN-served requests never appear in origin logs).`,
        fix: "Check crawler access first, then confirm whether a CDN (e.g. Cloudflare) terminates bot traffic before your origin.",
        group: "Verdict",
      });
    } else {
      checks.push({
        status: "pass",
        label: `${report.aiHits.toLocaleString()} AI crawler requests from ${report.bots.length} different bots`,
        detail: `Log window: ${fmtDate(report.from)} → ${fmtDate(report.to)} · ${report.parsedLines.toLocaleString()} of ${report.totalLines.toLocaleString()} lines parsed as combined/common log format.`,
        group: "Verdict",
      });
    }
    if (report.parsedLines < report.totalLines * 0.5 && report.totalLines > 10) {
      checks.push({
        status: "warn",
        label: `Only ${report.parsedLines.toLocaleString()} of ${report.totalLines.toLocaleString()} lines matched the combined/common log format`,
        detail: "Custom log formats aren't parsed. Export nginx/Apache default-format logs for full coverage.",
        group: "Verdict",
      });
    }
    if (report.neverSeen.length > 0 && report.aiHits > 0) {
      checks.push({
        status: "info",
        label: `Never seen: ${report.neverSeen.map((c) => c.token).join(", ")}`,
        detail: "These AI crawlers made zero requests in this window. Absence isn't automatically a problem, but if you expected e.g. OAI-SearchBot and it never comes, check your crawler access.",
        group: "Verdict",
      });
    }
    if (report.neverFetched) {
      checks.push({
        status: report.neverFetched.length ? "warn" : "pass",
        label: report.neverFetched.length
          ? `${report.neverFetched.length} of your listed pages were NEVER fetched by any AI crawler`
          : "Every listed page was fetched by at least one AI crawler",
        detail: report.neverFetched.length ? (
          <ul className="mt-1 flex max-h-40 flex-col gap-0.5 overflow-y-auto font-mono text-[11px]">
            {report.neverFetched.slice(0, 50).map((p) => (
              <li key={p} className="break-all">{p}</li>
            ))}
            {report.neverFetched.length > 50 && <li>…and {report.neverFetched.length - 50} more</li>}
          </ul>
        ) : undefined,
        group: "Coverage",
      });
    }
  }

  return (
    <section aria-label={tool.title} className="flex flex-col gap-4">
      <FileDropZone
        onFiles={onFiles}
        accept=".log,.txt,text/plain"
        maxSizeMb={MAX_MB}
        icon="ScrollText"
        label={fileName ? `Loaded ${fileName}: drop another to replace` : "Drop your access log (nginx/Apache)"}
        hint={`Parsed entirely in this tab. Access logs contain visitor IPs, so nothing is uploaded: the parser discards the IP column and keeps only date, path, status and user-agent. Up to ${MAX_MB} MB.`}
      />

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}
      {busy && <p className="text-xs text-muted-foreground">Parsing…</p>}

      {report && (
        <>
          <ScorePanel
            score={report.aiHits === 0 ? 0 : Math.min(100, 40 + report.bots.length * 8)}
            summary={
              report.aiHits === 0
                ? "No AI crawler has read this site in the logged window."
                : `${report.bots.length} AI crawlers are actively reading this site.`
            }
            counts={{
              pass: checks.filter((c) => c.status === "pass").length,
              warn: checks.filter((c) => c.status === "warn").length,
              fail: checks.filter((c) => c.status === "fail").length,
            }}
          />
          <CheckList items={checks} grouped />

          {report.bots.length > 0 && (
            <div className="grid gap-3 lg:grid-cols-2">
              {report.bots.map((b) => (
                <BotCard key={b.crawler.id} bot={b} />
              ))}
            </div>
          )}

          <div>
            <label htmlFor="site-urls" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Optional: paste your page URLs or paths (one per line, e.g. from your sitemap) to find pages no AI crawler has ever fetched
            </label>
            <textarea
              id="site-urls"
              value={siteUrls}
              onChange={(e) => setSiteUrls(e.target.value)}
              placeholder={"/pricing\n/blog/launch-post\nhttps://example.com/docs/setup"}
              className="min-h-[100px] w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              spellCheck={false}
            />
          </div>
        </>
      )}

      {!report && !busy && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <Icon name="ScrollText" size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Are the bots actually reading your site?</p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Every GEO article tells you to allow AI crawlers; none can tell you whether they came. Your
            server's access log can. Drop an nginx or Apache log and get per-bot visit counts, last-seen
            times, most-fetched pages, status-code health and a daily trend, for GPTBot, ClaudeBot,
            OAI-SearchBot, PerplexityBot, Bingbot and every other AI token we track.
          </p>
        </div>
      )}
    </section>
  );
}
