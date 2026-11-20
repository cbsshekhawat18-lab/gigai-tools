"use client";

/**
 * Ask Your File - fully on-device document Q&A (Lite tier).
 *
 * Honesty contract: Lite mode is EXTRACTIVE - answers are passages quoted
 * from the user's own file, ranked by on-device semantic search, each with
 * a clickable citation. No generative model means no hallucination and no
 * gigabyte download; the only network activity ever is the one-time 23 MB
 * embedding model fetch, after which everything runs offline. A Full tier
 * with an on-device LLM (WebLLM/WebGPU) ships only after the device spike -
 * the UI says exactly that instead of pretending.
 *
 * Parsing, chunking and embedding reuse lib/video-work/context.ts - one
 * on-device RAG substrate for both features.
 */

import { chunkText, cosine, getEmbedder, parseFile } from "@/lib/video-work/context";

export interface FileChunk {
  id: number;
  where: string;
  text: string;
  embedding: number[];
}

export interface IngestedFile {
  hash: string;
  name: string;
  chunks: FileChunk[];
}

const DB_NAME = "gigai-ask-file";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "hash" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function fileHash(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function loadCached(hash: string): Promise<IngestedFile | null> {
  const db = await openDb();
  return new Promise((resolve) => {
    const req = db.transaction(STORE).objectStore(STORE).get(hash);
    req.onsuccess = () => resolve((req.result as IngestedFile) ?? null);
    req.onerror = () => resolve(null);
  });
}

async function saveCached(entry: IngestedFile): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

/**
 * Delete the downloaded embedding model (transformers.js keeps it in the
 * Cache API under "transformers-cache"). The next question re-downloads it.
 */
export async function deleteModel(): Promise<boolean> {
  try {
    return await caches.delete("transformers-cache");
  } catch {
    return false;
  }
}

export async function forgetFile(hash: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(hash);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

/**
 * Ingest a file: parse -> chunk -> embed, cached by content hash so
 * reopening the same file is instant.
 */
export async function ingest(
  file: File,
  onProgress?: (stage: string, done?: number, total?: number) => void,
): Promise<IngestedFile> {
  const hash = await fileHash(file);
  const cached = await loadCached(hash);
  if (cached) return cached;

  onProgress?.("Reading the file...");
  const parts = await parseFile(file);
  const pieces: { where: string; text: string }[] = [];
  for (const part of parts) {
    for (const chunk of chunkText(part.text)) pieces.push({ where: part.where, text: chunk });
  }
  if (!pieces.length) throw new Error(`Nothing readable found in '${file.name}'.`);

  onProgress?.("Loading the on-device model (one-time ~23 MB)...");
  const embed = await getEmbedder();
  const chunks: FileChunk[] = [];
  for (let i = 0; i < pieces.length; i++) {
    const [embedding] = await embed([pieces[i]!.text.slice(0, 2000)]);
    chunks.push({ id: i, where: pieces[i]!.where, text: pieces[i]!.text, embedding: embedding! });
    onProgress?.("Indexing", i + 1, pieces.length);
  }
  const entry = { hash, name: file.name, chunks };
  await saveCached(entry);
  return entry;
}

export interface Answer {
  chunkId: number;
  where: string;
  /** The best sentence-window from the chunk for this question. */
  passage: string;
  score: number;
}

/** Extractive ask: rank chunks, then pick the best sentence window. */
export async function ask(entry: IngestedFile, question: string, k = 3): Promise<Answer[]> {
  const embed = await getEmbedder();
  const [qv] = await embed([question.slice(0, 2000)]);
  const ranked = entry.chunks
    .map((c) => ({ c, score: cosine(qv!, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  // Keyword overlap picks the tightest sentence window inside each chunk.
  const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  return ranked.map(({ c, score }) => {
    const sentences = c.text.split(/(?<=[.!?])\s+/);
    let bestStart = 0;
    let bestHits = -1;
    for (let i = 0; i < sentences.length; i++) {
      const window = sentences.slice(i, i + 3).join(" ").toLowerCase();
      const hits = words.reduce((n, w) => n + (window.includes(w) ? 1 : 0), 0);
      if (hits > bestHits) {
        bestHits = hits;
        bestStart = i;
      }
    }
    return {
      chunkId: c.id,
      where: c.where,
      passage: sentences.slice(bestStart, bestStart + 3).join(" ").slice(0, 600),
      score: Number(score.toFixed(3)),
    };
  });
}

/* ------------------------------- act mode ------------------------------- */

export interface ActPlan {
  action: string;
  description: string;
  run: (entry: IngestedFile, sourceFile: File) => Promise<{ filename: string; blob: Blob; note: string }>;
}

const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?\d{1,3}[\s-]?)?(?:\(\d{2,4}\)[\s-]?)?\d{3,5}[\s-]?\d{4,6}\b/g,
  amount: /(?:₹|Rs\.?|\$|EUR|USD|INR)\s?[\d,]+(?:\.\d{1,2})?/g,
};

/** The Act catalogue - every action is deterministic and on-device. */
export function actPlans(): ActPlan[] {
  return [
    {
      action: "extract-contacts",
      description: "Extract every email address and phone number to CSV",
      run: async (entry) => {
        const rows: string[] = ["type,value,location"];
        for (const chunk of entry.chunks) {
          for (const m of chunk.text.match(PATTERNS.email) ?? []) rows.push(`email,"${m}","${chunk.where}"`);
          for (const m of chunk.text.match(PATTERNS.phone) ?? []) {
            if (m.replace(/\D/g, "").length >= 8) rows.push(`phone,"${m.trim()}","${chunk.where}"`);
          }
        }
        if (rows.length === 1) throw new Error("No emails or phone numbers found.");
        return {
          filename: "contacts.csv",
          blob: new Blob([rows.join("\n")], { type: "text/csv" }),
          note: `${rows.length - 1} contacts extracted with their locations.`,
        };
      },
    },
    {
      action: "extract-amounts",
      description: "Extract every money amount to CSV",
      run: async (entry) => {
        const rows: string[] = ["amount,location"];
        for (const chunk of entry.chunks) {
          for (const m of chunk.text.match(PATTERNS.amount) ?? []) rows.push(`"${m}","${chunk.where}"`);
        }
        if (rows.length === 1) throw new Error("No money amounts found.");
        return {
          filename: "amounts.csv",
          blob: new Blob([rows.join("\n")], { type: "text/csv" }),
          note: `${rows.length - 1} amounts extracted.`,
        };
      },
    },
    {
      action: "redact-pii",
      description: "Redact Indian PII (Aadhaar, PAN, phones...) from the text",
      run: async (entry) => {
        const { mask, detect } = await import("@/lib/vendor/indian-pii");
        const full = entry.chunks.map((c) => c.text).join("\n\n");
        const found = detect(full);
        const redacted = mask(full);
        // Verification pass - the redaction promise is checked, not assumed.
        const leftover = detect(redacted).filter((d) => d.valid);
        if (leftover.length) throw new Error("Verification failed: identifiers survived redaction.");
        return {
          filename: `${entry.name.replace(/\.[^.]+$/, "")}.redacted.txt`,
          blob: new Blob([redacted], { type: "text/plain" }),
          note: `${found.length} identifiers masked; verification re-scan found none remaining. Text output - layout is not preserved.`,
        };
      },
    },
    {
      action: "page-summary",
      description: "One-line-per-section outline (first sentence of each part)",
      run: async (entry) => {
        const lines = entry.chunks.map((c) => {
          const first = c.text.split(/(?<=[.!?])\s+/)[0] ?? "";
          return `[${c.where}] ${first.slice(0, 160)}`;
        });
        return {
          filename: "outline.txt",
          blob: new Blob([lines.join("\n")], { type: "text/plain" }),
          note: `${lines.length} sections outlined. Extractive - each line is the section's own opening sentence.`,
        };
      },
    },
  ];
}
