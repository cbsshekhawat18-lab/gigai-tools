"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { PasteAnalyze, type AnalysisReport, type CheckItem } from "@/components/tool/seo";
import { analyzeHtml, looksLikeHtml } from "@/lib/geo/html";
import { chunkDocument, chunkText, type RetrievalChunk, type ChunkReport } from "@/lib/geo/chunks";

/**
 * Retrieval Chunk Preview — split a page the way a RAG system does (heading
 * sections, then ~300-token windows with overlap) and show every chunk in
 * ISOLATION, exactly as a model sees it when retrieved. The mental shift this
 * teaches: your page isn't read as a page; it's read as fragments.
 */

/** One chunk, rendered alone in a bordered card, as a model would receive it. */
function ChunkCard({ chunk }: { chunk: RetrievalChunk }) {
  const failed = !chunk.standalone;
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        failed ? "border-destructive/40 bg-destructive/[0.04]" : "border-success/30 bg-success/[0.03]",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground">
          chunk {chunk.index}
        </span>
        {chunk.heading ? (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            under “{chunk.heading}”
          </span>
        ) : (
          <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
            no heading attached{chunk.windowed ? " (split window)" : ""}
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">~{chunk.tokens} tokens</span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            failed ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success",
          )}
        >
          {failed ? "fails alone" : "standalone"}
        </span>
      </div>

      <p className="max-h-32 overflow-y-auto whitespace-pre-wrap font-serif text-[13px] leading-relaxed text-foreground/90">
        {chunk.text}
      </p>

      {chunk.flags.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {chunk.flags.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Icon name="TriangleAlert" size={11} className="mt-0.5 shrink-0 text-warning" />
              <span>
                <span className="font-medium text-foreground">{f.label}.</span>{" "}
                {f.evidence && <span className="font-mono">“{f.evidence}”</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toReport(report: ChunkReport): AnalysisReport {
  const score = report.total
    ? Math.round(((report.total - report.failing) / report.total) * 100)
    : undefined;

  const checks: CheckItem[] = [
    {
      status: report.failing === 0 ? "pass" : report.failing / Math.max(1, report.total) > 0.4 ? "fail" : "warn",
      label: report.verdict,
      detail: `Split method: heading sections first, then ~300-token windows with ~45-token overlap when a section runs long, the defaults of mainstream RAG pipelines. Token counts are estimated at 4 characters per token.`,
      group: "Verdict",
    },
    {
      status: "info",
      label: `Your ${report.total} chunks, each read in isolation`,
      detail: (
        <div className="mt-1 flex flex-col gap-2.5">
          {report.chunks.map((c) => (
            <ChunkCard key={c.index} chunk={c} />
          ))}
        </div>
      ),
      group: "Chunks",
    },
  ];

  const windowed = report.chunks.filter((c) => c.windowed).length;
  if (windowed > 0) {
    checks.splice(1, 0, {
      status: "warn",
      label: `${windowed} chunk${windowed === 1 ? " lost its" : "s lost their"} heading to window splitting`,
      detail:
        "Sections longer than ~300 tokens get split, and only the first window keeps the heading. Later windows arrive with zero context: keep sections tight, or restate the subject when a section runs long.",
      group: "Verdict",
    });
  }

  return {
    score,
    summary: report.verdict,
    checks,
  };
}

function analyze(input: string, fetched?: { finalUrl: string }): AnalysisReport {
  return toReport(
    looksLikeHtml(input) ? chunkDocument(analyzeHtml(input, fetched?.finalUrl)) : chunkText(input),
  );
}

const SAMPLE = `# Choosing an image format

WebP compresses photographs 25–34% smaller than JPEG at equivalent quality, and it supports transparency and animation in one format.

## Compression results

As mentioned above, it compresses well. In the benchmark it beat every alternative we tested, and this makes it the obvious default for the web today.

## Compatibility

However, a few legacy tools still reject it. Email clients from before 2020 and some Windows photo viewers can't open the files, so keep a JPEG fallback when you don't control the destination. PNG remains the safer choice for logos and screenshots that need pixel-perfect edges.
`;

export default function RetrievalChunkPreviewTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyze}
        fetchable
        shareSlug="retrieval-chunk-preview"
        shareLabel="Chunk report"
        urlPlaceholder="https://example.com/article: we'll fetch, chunk and judge it"
        inputLabel="Paste content (prose, Markdown or HTML), or fetch a URL"
        placeholder="Paste an article or a page's HTML to see how a RAG system slices it…"
        sample={SAMPLE}
        emptyTitle="Your page isn't read as a page"
        emptyHint="When an AI answers from your site, it never sees the whole page: a retrieval system slices it into chunks and hands the model one fragment at a time. This tool performs that exact slicing (heading sections, then ~300-token windows with overlap) and shows every chunk alone, flagging the ones that collapse without their surroundings: pronoun openers with no antecedent, “as mentioned above”, fragments that never name their subject. Runs entirely in your browser."
        emptyIcon="Puzzle"
        accept=".txt,.md,.html,text/plain,text/html"
      />
    </section>
  );
}
