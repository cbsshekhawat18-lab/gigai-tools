"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { CheckList, ScorePanel, UrlPrefillBar, useDeepLinkUrl, type CheckItem } from "@/components/tool/seo";
import { analyzeHtml, type GeoDocument } from "@/lib/geo/html";
import { splitSentences, countWords } from "@/lib/geo/text";

/**
 * JS Rendering Checker — what does your page look like to a crawler that
 * doesn't execute JavaScript? (Most AI crawlers don't.)
 *
 * Mode 1 (always available): analyze the RAW HTML — visible words, framework
 * markers, content trapped in serialized JS data islands.
 *
 * Mode 2 (the exact comparison): paste the RENDERED DOM (copy the <html>
 * element's outerHTML from DevTools on the live page) next to the raw HTML,
 * and get a word-for-word visibility diff: what % of the real page an AI
 * crawler never sees, with the invisible passages listed.
 */

function normalizeSentence(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

interface Comparison {
  rawWords: number;
  renderedWords: number;
  invisiblePct: number;
  missingSentences: string[];
}

function compare(raw: GeoDocument, rendered: GeoDocument): Comparison {
  const rawNorm = normalizeSentence(raw.mainText);
  const missing = splitSentences(rendered.mainText).filter((s) => {
    const n = normalizeSentence(s);
    return n.length > 20 && !rawNorm.includes(n);
  });
  const invisibleWords = missing.reduce((n, s) => n + countWords(s), 0);
  return {
    rawWords: raw.visibleWords,
    renderedWords: rendered.visibleWords,
    invisiblePct: rendered.visibleWords ? Math.round((invisibleWords / rendered.visibleWords) * 100) : 0,
    missingSentences: missing.slice(0, 12),
  };
}

const paneClass =
  "min-h-[180px] w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function JsRenderingCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  const [rawHtml, setRawHtml] = React.useState("");
  const [rawUrl, setRawUrl] = React.useState("");
  const [renderedHtml, setRenderedHtml] = React.useState("");
  const deepLink = useDeepLinkUrl();

  const rawDoc = React.useMemo(
    () => (rawHtml.trim() ? analyzeHtml(rawHtml, rawUrl || undefined) : null),
    [rawHtml, rawUrl],
  );
  const renderedDoc = React.useMemo(
    () => (renderedHtml.trim() ? analyzeHtml(renderedHtml, rawUrl || undefined) : null),
    [renderedHtml, rawUrl],
  );
  const comparison = React.useMemo(
    () => (rawDoc && renderedDoc ? compare(rawDoc, renderedDoc) : null),
    [rawDoc, renderedDoc],
  );

  const checks: CheckItem[] = [];
  let score = 100;

  if (rawDoc) {
    const clientFrameworks = rawDoc.frameworks.filter((f) => f.clientRendered);
    checks.push({
      status: rawDoc.visibleWords >= 200 ? "pass" : rawDoc.visibleWords >= 50 ? "warn" : "fail",
      label: `${rawDoc.visibleWords} words visible in the raw HTML`,
      detail:
        rawDoc.visibleWords >= 200
          ? "A no-JavaScript crawler receives substantial readable content."
          : "Most AI crawlers (GPTBot, ClaudeBot, PerplexityBot and the on-demand user fetchers) do not execute JavaScript. Words that aren't in this HTML don't exist for them.",
      group: "What an AI crawler sees",
    });
    if (rawDoc.visibleWords < 200) score -= rawDoc.visibleWords < 50 ? 45 : 20;

    for (const f of rawDoc.frameworks) {
      checks.push({
        status: f.clientRendered && rawDoc.visibleWords < 200 ? "fail" : f.clientRendered ? "warn" : "pass",
        label: `${f.name} detected`,
        detail: `Evidence: ${f.marker}.${f.clientRendered ? " This pattern ships content as a JavaScript payload. Whether crawlers see the content depends on server rendering." : " This pattern is server-rendered — good."}`,
        group: "Rendering signals",
      });
    }
    if (clientFrameworks.length && rawDoc.dataIslandWords > 50) {
      checks.push({
        status: "warn",
        label: `~${rawDoc.dataIslandWords} words of prose are trapped in serialized JS data`,
        detail:
          "Content found inside script-tag JSON (hydration payloads). Browsers turn this into visible text. Non-JS crawlers see script soup. Some crawlers read obvious JSON strings, but none reliably.",
        group: "Rendering signals",
      });
      score -= 10;
    }
    if (rawDoc.noscriptText) {
      checks.push({
        status: "info",
        label: "The page has <noscript> fallback content",
        detail: `"${rawDoc.noscriptText.slice(0, 160)}…"`,
        group: "Rendering signals",
      });
    }
    if (rawDoc.metaRobots && /noindex|nosnippet/i.test(rawDoc.metaRobots)) {
      checks.push({
        status: "fail",
        label: `meta robots: "${rawDoc.metaRobots}"`,
        detail: "This also removes the page from the search indexes AI answers retrieve through.",
        group: "Rendering signals",
      });
      score -= 25;
    }
  }

  if (comparison) {
    checks.push({
      status: comparison.invisiblePct <= 5 ? "pass" : comparison.invisiblePct <= 25 ? "warn" : "fail",
      label: `${comparison.invisiblePct}% of the rendered page is invisible to AI crawlers`,
      detail: `Raw HTML: ${comparison.rawWords} words · rendered DOM: ${comparison.renderedWords} words. The percentage counts rendered sentences with no match in the raw HTML.`,
      group: "Raw vs rendered",
    });
    score -= Math.round(comparison.invisiblePct * 0.5);
    if (comparison.missingSentences.length) {
      checks.push({
        status: "info",
        label: `Content that exists only after hydration (first ${comparison.missingSentences.length})`,
        detail: (
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
            {comparison.missingSentences.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">{s}</li>
            ))}
          </ul>
        ),
        group: "Raw vs rendered",
      });
    }
  } else if (rawDoc) {
    checks.push({
      status: "info",
      label: "Add the rendered DOM for an exact diff",
      detail:
        "Open the live page, run `copy(document.documentElement.outerHTML)` in the DevTools console, and paste the result into the second box. You'll get the precise list of content only a JavaScript-running browser ever sees.",
      group: "Raw vs rendered",
    });
  }

  score = Math.max(0, Math.min(100, score));

  return (
    <section aria-label={tool.title} className="flex flex-col gap-4">
      <UrlPrefillBar
        onHtml={(html, finalUrl) => {
          setRawHtml(html);
          setRawUrl(finalUrl);
        }}
        actionLabel="Fetch raw HTML"
        placeholder="https://example.com/page: fetched exactly as a crawler receives it"
        autoUrl={deepLink}
        hint="Fetched statelessly through our proxy without executing any JavaScript: byte-for-byte what a non-JS crawler receives. Nothing is stored."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="raw-html">
            Raw HTML (what an AI crawler sees)
          </label>
          <textarea
            id="raw-html"
            value={rawHtml}
            onChange={(e) => setRawHtml(e.target.value)}
            placeholder="Fetch a URL above, or paste the page source (Ctrl/Cmd-U on the page → copy)."
            className={paneClass}
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="rendered-html">
            Rendered DOM (what a user sees), optional
          </label>
          <textarea
            id="rendered-html"
            value={renderedHtml}
            onChange={(e) => setRenderedHtml(e.target.value)}
            placeholder={"On the live page, in the DevTools console:\n  copy(document.documentElement.outerHTML)\nthen paste here."}
            className={paneClass}
            spellCheck={false}
          />
        </div>
      </div>

      {rawDoc ? (
        <>
          <ScorePanel
            score={score}
            summary={
              comparison
                ? comparison.invisiblePct <= 5
                  ? "AI crawlers see essentially the full page."
                  : `AI crawlers miss ${comparison.invisiblePct}% of this page.`
                : rawDoc.visibleWords >= 200
                  ? "The raw HTML carries real content. Add the rendered DOM for the exact diff."
                  : "Thin raw HTML. This page likely depends on JavaScript to show its content."
            }
            counts={{
              pass: checks.filter((c) => c.status === "pass").length,
              warn: checks.filter((c) => c.status === "warn").length,
              fail: checks.filter((c) => c.status === "fail").length,
            }}
          />
          <CheckList items={checks} grouped />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <Icon name="MonitorOff" size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Does your content exist without JavaScript?</p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Most AI crawlers never run your JavaScript. Fetch a URL (or paste view-source HTML) to see the
            page exactly as they do: how many words survive, which framework markers reveal client-side
            rendering, and (if you paste the rendered DOM alongside) precisely which content is invisible
            to every AI system reading your site. Analysis runs in your browser; pasted HTML never leaves it.
          </p>
        </div>
      )}
    </section>
  );
}
