/**
 * Guidance retrieval - RAG's retrieval half with zero server-side model.
 * Chunk vectors and per-check query vectors were embedded on the dev
 * machine (scripts/embed-knowledge.mjs); at audit time this is a
 * deterministic lookup plus in-memory cosine over ~20 chunks. Chunks that
 * declare the finding's checkId rank first, vector similarity fills the
 * remaining slots - so guidance appears even in rules-only mode.
 */

import KNOWLEDGE from "./knowledge.embedded.json" with { type: "json" };

export function cosine(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are L2-normalized at embed time
}

const EXCERPT_LEN = 220;

/** Top guidance entries for one finding id. */
export function guidanceFor(findingId, limit = 3) {
  const declared = KNOWLEDGE.chunks.filter((c) => c.checkIds.includes(findingId));
  const query = KNOWLEDGE.queries[findingId];
  let rest = KNOWLEDGE.chunks.filter((c) => !c.checkIds.includes(findingId));
  if (query) {
    rest = rest
      .map((c) => ({ c, score: cosine(query, c.embedding) }))
      .sort((x, y) => y.score - x.score)
      .map(({ c }) => c);
  }
  return [...declared, ...rest].slice(0, limit).map((c) => ({
    title: c.title,
    excerpt: c.content.length > EXCERPT_LEN ? c.content.slice(0, EXCERPT_LEN).replace(/\s+\S*$/, "") + "..." : c.content,
    sourceName: c.sourceName,
    sourceUrl: c.sourceUrl,
  }));
}

/** Attach guidance to every finding that has any. */
export function withGuidance(findings) {
  return findings.map((f) => {
    const guidance = guidanceFor(f.id);
    return guidance.length ? { ...f, guidance } : f;
  });
}
