"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { PasteAnalyze, type AnalysisReport, type CheckItem } from "@/components/tool/seo";
import { analyzeHtml, looksLikeHtml } from "@/lib/geo/html";
import {
  scoreCitability,
  citabilityInputFromDoc,
  GEO_STUDY_URL,
  GEO_STUDY_CITATION,
  type SubScore,
} from "@/lib/geo/citability";

/**
 * Content Citability Scorer — scores content on the factors the GEO study
 * (Aggarwal et al., KDD 2024) measured as increasing AI citation, plus the
 * retrieval-structure factors. THE POINT: every sub-score shows its formula
 * and the counted evidence. No black-box "73/100".
 */

/** A sub-score rendered with its arithmetic on display. */
function SubScoreDetail({ sub }: { sub: SubScore }) {
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <div className="text-muted-foreground">
        <span className="font-medium text-foreground">Counted:</span> {sub.counted}
      </div>
      <div className="rounded bg-muted/40 px-2 py-1.5 font-mono text-[11px] text-muted-foreground">
        formula: {sub.formula}
      </div>
      {sub.evidence.length > 0 && (
        <ul className="flex list-disc flex-col gap-0.5 pl-4 text-muted-foreground">
          {sub.evidence.map((e, i) => (
            <li key={i} className="break-words">{e}</li>
          ))}
        </ul>
      )}
      <div className="text-[11px] text-muted-foreground">
        Source:{" "}
        {sub.source === "geo-study" ? (
          <a href={GEO_STUDY_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            measured in the GEO study (KDD 2024)
          </a>
        ) : (
          "retrieval-structure factor (how RAG systems select passages)"
        )}
      </div>
    </div>
  );
}

function analyze(input: string, fetched?: { finalUrl: string }): AnalysisReport {
  const isHtml = looksLikeHtml(input);
  const report = isHtml
    ? scoreCitability(citabilityInputFromDoc(analyzeHtml(input, fetched?.finalUrl)))
    : scoreCitability({ text: input });

  const checks: CheckItem[] = report.subs.map((sub) => ({
    id: sub.key,
    status: sub.score >= 70 ? "pass" : sub.score >= 40 ? "warn" : "fail",
    label: `${sub.label}: ${sub.score}/100 (weight ×${sub.weight})`,
    detail: <SubScoreDetail sub={sub} />,
    fix: sub.advice || undefined,
    group: sub.source === "geo-study" ? "Measured by the GEO study" : "Retrieval structure",
  }));

  checks.push({
    status: "info",
    label: "Methodology",
    detail: (
      <span>
        Overall score = weighted mean of the six sub-scores (weights shown per row). The three
        content factors come from {GEO_STUDY_CITATION}:{" "}
        <a href={GEO_STUDY_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          the paper
        </a>{" "}
        measured which edits increased content&apos;s visibility in generative-engine answers across 10,000
        queries; adding statistics, quotations and source citations were the top performers. The three
        structural factors reflect how retrieval systems select and rank passages. Heuristics are
        deliberately simple enough to state as one-line formulas. If we can&apos;t show the arithmetic, we
        don&apos;t score it.
      </span>
    ),
    group: "How this score works",
  });

  if (!isHtml) {
    checks.push({
      status: "info",
      label: "Plain-text mode",
      detail:
        "Outbound links and heading structure can't be measured from plain prose (they're scored neutrally). Fetch a URL or paste full HTML to measure all six factors.",
      group: "How this score works",
    });
  }

  return { score: report.overall, summary: report.summary, checks };
}

const SAMPLE = `# What is WebP and when should you use it?

WebP is an image format developed by Google in 2010 that compresses photographs 25–34% smaller than JPEG at equivalent visual quality. It supports transparency like PNG and animation like GIF, in one format.

## How much smaller is WebP than JPEG?

In Google's published benchmark of 11,000 images, WebP files averaged 30% smaller than JPEGs at matched SSIM quality. A typical 2 MB holiday photo becomes roughly 1.4 MB with no visible difference. The savings come from better entropy coding and block prediction, as described in the WebP compression study (https://developers.google.com/speed/webp/docs/compression).

## When should you avoid WebP?

As mentioned above, it compresses well. But a few legacy tools still can't open it. Email clients from before 2020, some Windows photo viewers, and older CMS image pipelines will reject the upload, so keep a JPEG fallback when you don't control the destination.
`;

export default function ContentCitabilityScorerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyze}
        fetchable
        shareSlug="content-citability-scorer"
        shareLabel="Citability report"
        urlPlaceholder="https://example.com/article: we'll fetch and score it"
        inputLabel="Paste your content (prose, Markdown or full HTML), or fetch a URL"
        placeholder="Paste an article, landing page copy, or the page's HTML…"
        sample={SAMPLE}
        emptyTitle="Would an AI cite this?"
        emptyHint="Paste content (or fetch a URL) and get six sub-scores for the factors the Princeton/Georgia Tech GEO study measured as increasing AI citation: fact density, source citations, quotability, plus answer-first openings, question headings and self-containment. Every sub-score displays its formula and what it counted: evidence, not a verdict. Runs entirely in your browser."
        emptyIcon="Quote"
        accept=".txt,.md,.html,text/plain,text/html"
      />
    </section>
  );
}
