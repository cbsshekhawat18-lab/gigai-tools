"use client";

/**
 * RAG enrichment of generated findings against the client's own documents.
 * Runs entirely on-device after analysis: for each finding, retrieve the
 * closest context chunks, then
 *   - flag likely duplicates of previously-exported tickets (a chunk from a
 *     tickets file scoring above the duplicate threshold, with its id),
 *   - attach the spec sections the request relates to (file + location),
 *   - collect the client's own terminology worth reusing.
 * Deterministic given the same context - no model beyond the embedder.
 */

import type { Finding } from "./types";
import { retrieve } from "./context";

export interface SpecRef {
  file: string;
  where: string;
  excerpt: string;
  score: number;
}

export interface Enrichment {
  duplicateOf?: string;
  relatedSpecRefs: SpecRef[];
  terms: string[];
}

const DUPLICATE_THRESHOLD = 0.82;
const SPEC_THRESHOLD = 0.45;
const STOP = new Set(["the", "and", "that", "this", "with", "from", "when", "then", "should", "would", "there", "have", "被"]);

/** Capitalised multi-use tokens from spec chunks - the client's own names. */
function extractTerms(refs: SpecRef[], finding: Finding): string[] {
  const counts = new Map<string, number>();
  for (const ref of refs) {
    for (const m of ref.excerpt.matchAll(/\b([A-Z][a-zA-Z0-9]{3,}(?:[A-Z][a-z0-9]+)*)\b/g)) {
      const term = m[1]!;
      if (!STOP.has(term.toLowerCase())) counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }
  const findingText = `${finding.title} ${finding.description}`.toLowerCase();
  return [...counts.entries()]
    .filter(([term, n]) => n >= 2 && !findingText.includes(term.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);
}

export async function enrichFinding(finding: Finding): Promise<Enrichment | null> {
  const query = `${finding.title}. ${finding.description}. ${finding.evidence.clientStatement}`;
  const hits = await retrieve(query, 5);
  if (!hits.length) return null;

  const dup = hits.find((h) => h.kind === "tickets" && h.ticketId && h.score >= DUPLICATE_THRESHOLD);
  const specRefs: SpecRef[] = hits
    .filter((h) => h.kind === "spec" && h.score >= SPEC_THRESHOLD)
    .slice(0, 3)
    .map((h) => ({
      file: h.file,
      where: h.where,
      excerpt: h.text.replace(/\s+/g, " ").slice(0, 200),
      score: Number(h.score.toFixed(3)),
    }));

  return {
    duplicateOf: dup?.ticketId,
    relatedSpecRefs: specRefs,
    terms: extractTerms(specRefs, finding),
  };
}

/** Enrich all findings; returns a map findingId -> enrichment. */
export async function enrichAll(
  findings: Finding[],
  onProgress?: (done: number, total: number) => void,
): Promise<Record<string, Enrichment>> {
  const out: Record<string, Enrichment> = {};
  for (let i = 0; i < findings.length; i++) {
    const enrichment = await enrichFinding(findings[i]!);
    if (enrichment) out[findings[i]!.id] = enrichment;
    onProgress?.(i + 1, findings.length);
  }
  return out;
}
