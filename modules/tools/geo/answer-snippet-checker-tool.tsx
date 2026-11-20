"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { PasteAnalyze, type AnalysisReport, type CheckItem } from "@/components/tool/seo";
import { analyzeHtml, looksLikeHtml } from "@/lib/geo/html";
import { judgeOpening, isQuestionHeading, splitSentences, type OpeningVerdict } from "@/lib/geo/text";

/**
 * Answer Snippet Checker — does each H2 section open with a self-contained
 * answer under 40 words? AI systems with live retrieval judge a passage's
 * relevance primarily on how it OPENS; a section that warms up for two
 * paragraphs before answering loses to one that answers in its first breath.
 */

interface Section {
  heading: string;
  opening: string;
}

/** Sections from HTML (H2s, falling back to H3s) or from Markdown `##` headings. */
function extractSections(input: string, baseUrl?: string): { sections: Section[]; pageIntro: string } {
  if (looksLikeHtml(input)) {
    const doc = analyzeHtml(input, baseUrl);
    let hs = doc.headings.filter((h) => h.level === 2 && h.sectionText.trim());
    if (hs.length === 0) hs = doc.headings.filter((h) => h.level === 3 && h.sectionText.trim());
    return {
      sections: hs.map((h) => ({ heading: h.text, opening: h.firstParagraph || h.sectionText })),
      pageIntro: doc.headings[0]?.firstParagraph ?? splitSentences(doc.mainText).slice(0, 2).join(" "),
    };
  }
  // Markdown / plain text: split on ## (or #) headings.
  const sections: Section[] = [];
  const parts = input.split(/^(#{1,3}\s+.+)$/m);
  let heading = "";
  let intro = "";
  for (const part of parts) {
    if (/^#{1,3}\s+/.test(part)) {
      heading = part.replace(/^#{1,3}\s+/, "").trim();
    } else if (part.trim()) {
      const body = (part.trim().split(/\n\s*\n/)[0] ?? "").replace(/\s+/g, " ").trim();
      if (heading) sections.push({ heading, opening: body });
      else if (!intro) intro = body;
      heading = "";
    }
  }
  return { sections, pageIntro: intro || (input.trim().split(/\n\s*\n/)[0] ?? "") };
}

function VerdictDetail({ v, heading }: { v: OpeningVerdict; heading: string }) {
  const problems: string[] = [];
  if (!v.directLength) problems.push(`opening runs ${v.words} words before completing a thought (limit ${v.limit})`);
  if (v.fluffOpener) problems.push("starts with throat-clearing instead of the answer");
  if (!v.selfContained) problems.push("depends on text outside the section (pronoun or back-reference)");
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <p className="rounded bg-muted/40 px-2 py-1.5 font-serif text-[12px] leading-relaxed text-foreground/85">
        “{v.evidence}{v.evidence.length >= 200 ? "…" : ""}”
      </p>
      {problems.length > 0 ? (
        <p className="text-muted-foreground">Why it fails: {problems.join("; ")}.</p>
      ) : (
        <p className="text-muted-foreground">Opens with a {v.words}-word self-contained answer. This is what retrieval rewards.</p>
      )}
      {problems.length > 0 && (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Rewrite target:</span> one or two sentences, ≤ {v.limit} words,
          that answer “{heading}” completely even if nothing else from the page is shown.
        </p>
      )}
    </div>
  );
}

function analyze(input: string, fetched?: { finalUrl: string }): AnalysisReport {
  const { sections, pageIntro } = extractSections(input, fetched?.finalUrl);
  const checks: CheckItem[] = [];

  // The page-level opening is judged too — it's the snippet for the page itself.
  if (pageIntro) {
    const v = judgeOpening(pageIntro);
    checks.push({
      status: v.pass ? "pass" : "warn",
      label: v.pass ? "Page opens with a direct answer" : "Page opening buries the answer",
      detail: <VerdictDetail v={v} heading="the page's own topic" />,
      group: "Page opening",
    });
  }

  if (sections.length === 0) {
    checks.push({
      status: "warn",
      label: "No H2 (or ##) sections found",
      detail:
        "Without section structure there are no snippet candidates to judge. Break the content into H2 sections, each answering one question.",
      group: "Sections",
    });
    return { score: pageIntro ? 40 : undefined, summary: "No sections to check.", checks };
  }

  let passCount = 0;
  for (const s of sections) {
    const v = judgeOpening(s.opening);
    const question = isQuestionHeading(s.heading);
    if (v.pass) passCount++;
    checks.push({
      status: v.pass ? "pass" : "fail",
      label: `“${s.heading}”: ${v.pass ? "answers first" : "buries the answer"} (${v.words} words to first complete thought)`,
      detail: <VerdictDetail v={v} heading={s.heading} />,
      fix: !question
        ? `Also consider phrasing the heading as the question people actually ask (e.g. “How …”, “What …”): retrieval matches queries against headings.`
        : undefined,
      group: "Sections",
    });
  }

  const score = Math.round((passCount / sections.length) * 100);
  return {
    score,
    summary:
      passCount === sections.length
        ? `All ${sections.length} sections open with a direct answer.`
        : `${sections.length - passCount} of ${sections.length} sections make the reader (and the model) wait for the answer.`,
    checks,
  };
}

const SAMPLE = `## How much does compressing a PDF reduce its size?

An image-heavy PDF typically shrinks 80–95% when its embedded images are re-encoded; a 6.6 MB scan becomes roughly 90 KB. Text-only PDFs barely shrink, because text is already tiny.

## Is it safe to compress a contract?

Before we answer that, it's worth stepping back and thinking about what "safe" really means in a world where documents move between so many devices and screens. There are many considerations, and it depends on your situation.

## What about password-protected files?

As mentioned above, they behave differently. You'll need to unlock them first.
`;

export default function AnswerSnippetCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyze}
        fetchable
        shareSlug="answer-snippet-checker"
        shareLabel="Answer snippet report"
        urlPlaceholder="https://example.com/article: we'll fetch and judge every section"
        inputLabel="Paste your content (Markdown or HTML), or fetch a URL"
        placeholder={"## How long does X take?\nX takes 20 minutes for a typical…"}
        sample={SAMPLE}
        emptyTitle="Does every section answer first?"
        emptyHint="Retrieval systems rank passages mostly on how they open. This checker takes every H2 section and judges its first sentences against one standard: a self-contained answer in 40 words or less, with no throat-clearing and no dependence on the surrounding page. Each failing section gets the reason and a rewrite target. Runs entirely in your browser."
        emptyIcon="MessageSquareText"
        accept=".txt,.md,.html,text/plain,text/html"
      />
    </section>
  );
}
