/**
 * GigAI GEO engine: retrieval chunking.
 *
 * Splits a page the way a RAG pipeline does — by heading section first, then
 * by token window with overlap when a section runs long — and judges every
 * chunk in ISOLATION, exactly as a model sees it when it's retrieved. A chunk
 * that only makes sense with the rest of the page around it is a chunk that
 * fails, and the flags say precisely why, quoting the evidence.
 *
 * Pure functions over the GeoDocument shape (or plain text). No network.
 */

import type { GeoDocument } from "./html";
import {
  containmentIssues,
  countWords,
  estimateTokens,
  linkDensity,
  splitSentences,
  type ContainmentIssue,
} from "./text";

/** Target chunk size in (estimated) tokens, typical RAG defaults. */
export const CHUNK_TOKENS = 300;
/** Overlap between token-window chunks (~15%). */
export const CHUNK_OVERLAP_TOKENS = 45;

export type ChunkFlagKind = ContainmentIssue["kind"] | "no-subject" | "boilerplate" | "too-thin";

export interface ChunkFlag {
  kind: ChunkFlagKind;
  label: string;
  evidence: string;
}

export interface RetrievalChunk {
  /** Position, 1-based, in reading order. */
  index: number;
  /** The heading whose section this chunk came from ("" = pre-heading intro). */
  heading: string;
  text: string;
  tokens: number;
  words: number;
  flags: ChunkFlag[];
  /** True when the chunk works read alone. */
  standalone: boolean;
  /** True when this chunk was split out of a longer section by token window. */
  windowed: boolean;
}

export interface ChunkReport {
  chunks: RetrievalChunk[];
  total: number;
  failing: number;
  /** One-line verdict: "4 of your 11 chunks would be incomprehensible if retrieved alone." */
  verdict: string;
}

const FLAG_LABELS: Record<ChunkFlagKind, string> = {
  "pronoun-open": "Opens with a pronoun that has no antecedent here",
  "continuation-open": "Opens mid-thought, reads as a continuation of missing text",
  "back-reference": "References text that isn't in the chunk",
  "no-subject": "Never names what it's about",
  boilerplate: "Mostly navigation / link-list boilerplate",
  "too-thin": "Too thin to answer anything on its own",
};

/** Split one section's text into token windows with overlap. */
function windowText(text: string): string[] {
  if (estimateTokens(text) <= CHUNK_TOKENS * 1.3) return [text];
  const sentences = splitSentences(text);
  const windows: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;
  for (const s of sentences) {
    const t = estimateTokens(s);
    if (currentTokens + t > CHUNK_TOKENS && current.length > 0) {
      windows.push(current.join(" "));
      // Overlap: carry trailing sentences worth ~CHUNK_OVERLAP_TOKENS back in.
      const carried: string[] = [];
      let carriedTokens = 0;
      for (let j = current.length - 1; j >= 0 && carriedTokens < CHUNK_OVERLAP_TOKENS; j--) {
        const prev = current[j];
        if (prev === undefined) continue;
        carried.unshift(prev);
        carriedTokens += estimateTokens(prev);
      }
      current = carried;
      currentTokens = carriedTokens;
    }
    current.push(s);
    currentTokens += t;
  }
  if (current.length) windows.push(current.join(" "));
  return windows;
}

/**
 * Judge one chunk in isolation. `heading` is prepended context only when the
 * splitter would include it (heading-aware splitters do; we judge the text
 * WITH its heading, the honest common case).
 */
function judgeChunk(text: string, heading: string, index: number, windowed: boolean, linkWords: number): RetrievalChunk {
  const flags: ChunkFlag[] = [];
  const wordsN = countWords(text);
  const withHeading = heading ? `${heading}. ${text}` : text;

  for (const issue of containmentIssues(text)) {
    // A heading can rescue a pronoun opener ("It parses…" under "The JSON parser").
    if (issue.kind === "pronoun-open" && heading) continue;
    flags.push({ kind: issue.kind, label: FLAG_LABELS[issue.kind], evidence: issue.evidence });
  }

  // "No subject": the chunk (heading included) never names a concrete thing —
  // no capitalized multi-char token beyond sentence starts, no code/product term.
  const properNouns = withHeading.match(/(?<!^)(?<![.!?]\s)\b[A-Z][a-zA-Z0-9.-]{2,}\b/g) ?? [];
  const hasCode = /[`_/]|\.\w{2,4}\b|[a-z]+[A-Z]/.test(withHeading);
  if (properNouns.length === 0 && !hasCode && wordsN > 30) {
    flags.push({ kind: "no-subject", label: FLAG_LABELS["no-subject"], evidence: text.slice(0, 80) });
  }

  if (wordsN < 25) {
    flags.push({ kind: "too-thin", label: FLAG_LABELS["too-thin"], evidence: `${wordsN} words` });
  }

  const density = linkDensity(wordsN, linkWords);
  if (density > 0.6) {
    flags.push({
      kind: "boilerplate",
      label: FLAG_LABELS.boilerplate,
      evidence: `${Math.round(density * 100)}% of its words are link text`,
    });
  }

  return {
    index,
    heading,
    text,
    tokens: estimateTokens(withHeading),
    words: wordsN,
    flags,
    standalone: flags.length === 0,
    windowed,
  };
}

/** Chunk an analyzed document (or plain text via `chunkText`) and judge every chunk. */
export function chunkDocument(doc: GeoDocument): ChunkReport {
  const chunks: RetrievalChunk[] = [];
  let index = 0;

  // Pre-heading intro text (mainText before the first heading has no marker;
  // approximate: when there are no headings at all, the whole text is one section).
  if (doc.headings.length === 0) {
    for (const w of windowText(doc.mainText)) {
      chunks.push(judgeChunk(w, "", ++index, false, 0));
    }
  } else {
    for (const h of doc.headings) {
      if (!h.sectionText.trim()) continue;
      const windows = windowText(h.sectionText);
      windows.forEach((w, wi) => {
        // Only the FIRST window keeps the heading — exactly the failure mode
        // the tool exists to demonstrate.
        chunks.push(judgeChunk(w, wi === 0 ? h.text : "", ++index, wi > 0, 0));
      });
    }
  }

  const failing = chunks.filter((c) => !c.standalone).length;
  return {
    chunks,
    total: chunks.length,
    failing,
    verdict:
      chunks.length === 0
        ? "No text content found to chunk."
        : failing === 0
          ? `All ${chunks.length} chunks work standalone. This page retrieves well.`
          : `${failing} of your ${chunks.length} chunks would be incomprehensible or weak if retrieved alone.`,
  };
}

/** Chunk plain pasted prose (no DOM): markdown-style headings are respected. */
export function chunkText(text: string): ChunkReport {
  // Split on markdown headings when present.
  const parts = text.split(/^(#{1,4}\s+.+)$/m);
  const sections: { heading: string; body: string }[] = [];
  let pendingHeading = "";
  for (const part of parts) {
    if (/^#{1,4}\s+/.test(part)) {
      pendingHeading = part.replace(/^#{1,4}\s+/, "").trim();
    } else if (part.trim()) {
      sections.push({ heading: pendingHeading, body: part.trim() });
      pendingHeading = "";
    }
  }
  if (sections.length === 0) sections.push({ heading: "", body: text.trim() });

  const chunks: RetrievalChunk[] = [];
  let index = 0;
  for (const s of sections) {
    const windows = windowText(s.body);
    windows.forEach((w, wi) => {
      chunks.push(judgeChunk(w, wi === 0 ? s.heading : "", ++index, wi > 0, 0));
    });
  }
  const failing = chunks.filter((c) => !c.standalone).length;
  return {
    chunks,
    total: chunks.length,
    failing,
    verdict:
      chunks.length === 0
        ? "No text content found to chunk."
        : failing === 0
          ? `All ${chunks.length} chunks work standalone. This content retrieves well.`
          : `${failing} of your ${chunks.length} chunks would be incomprehensible or weak if retrieved alone.`,
  };
}
