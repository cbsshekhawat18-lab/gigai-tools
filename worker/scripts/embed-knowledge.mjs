/**
 * Embed the guidance corpus - RUNS ON THE DEV MACHINE ONLY, never the
 * server (architecture decision: the server never loads a model). Output
 * knowledge.embedded.json carries chunk vectors plus one precomputed query
 * vector per check id, so worker-side retrieval is pure arithmetic.
 *
 * Usage: node scripts/embed-knowledge.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

import { pipeline } from "@huggingface/transformers";

const knowledge = JSON.parse(readFileSync(new URL("../audit/knowledge.json", import.meta.url), "utf8"));

const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
async function embed(text) {
  const out = await embedder(text, { pooling: "mean", normalize: true });
  return [...out.data].map((v) => Number(v.toFixed(6)));
}

const chunks = [];
for (const chunk of knowledge.chunks) {
  chunks.push({ ...chunk, embedding: await embed(`${chunk.title}. ${chunk.content}`) });
  console.log("embedded chunk", chunk.id);
}

// One canonical query per check id: what a finding of that kind "asks".
const checkIds = [...new Set(knowledge.chunks.flatMap((c) => c.checkIds))];
const queries = {};
for (const id of checkIds) {
  queries[id] = await embed(`How to fix and why it matters: ${id.replaceAll("-", " ")}`);
  console.log("embedded query", id);
}

writeFileSync(
  new URL("../audit/knowledge.embedded.json", import.meta.url),
  JSON.stringify({ model: "Xenova/all-MiniLM-L6-v2", dims: chunks[0].embedding.length, chunks, queries }),
);
console.log(`done: ${chunks.length} chunks, ${checkIds.length} query vectors`);
