"use client";

/**
 * Project-context RAG for Video -> Work - fully on-device.
 *
 * The user drops up to 10 context files (spec PDFs, markdown docs, previous
 * ticket exports as CSV/JSON, plain text). Parsing reuses the site's own
 * in-browser parsers, chunks carry their source and location, embeddings
 * run in this browser via transformers.js (the same runtime Whisper already
 * uses here), and vectors live in IndexedDB for this session. Nothing about
 * these files ever leaves the device.
 */

export interface ContextChunk {
  id: string;
  file: string;
  /** "spec" for documents, "tickets" for previous-ticket exports. */
  kind: "spec" | "tickets";
  /** Page number, row range, or heading - whatever locates the chunk. */
  where: string;
  text: string;
  /** Ticket id detected in a tickets-export chunk (duplicate detection). */
  ticketId?: string;
  embedding: number[];
}

const DB_NAME = "gigai-vw-context";
const STORE = "chunks";
const CHUNK_CHARS = 1600;
const OVERLAP = 200;
const MAX_FILES = 10;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

/* ------------------------------ embedding ------------------------------ */

type Embedder = (texts: string[]) => Promise<number[][]>;
let embedderPromise: Promise<Embedder> | null = null;

/** Lazy, cached MiniLM pipeline. ~23 MB one-time download, then cached. */
export function getEmbedder(): Promise<Embedder> {
  embedderPromise ??= (async () => {
    const { pipeline } = await import("@huggingface/transformers");
    const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    return async (texts: string[]) => {
      const out: number[][] = [];
      for (const text of texts) {
        const t = await extractor(text, { pooling: "mean", normalize: true });
        out.push([...(t.data as Float32Array)]);
      }
      return out;
    };
  })();
  return embedderPromise;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i]! * b[i]!;
  return dot;
}

/* ------------------------------- parsing ------------------------------- */

const TICKET_ID_RE = /\b([A-Z][A-Z0-9]{1,9}-\d{1,6})\b/;

export async function parseFile(file: File): Promise<{ where: string; text: string }[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const { extractTextRuns } = await import("@/lib/pdf/text");
    const { openPdfDocument } = await import("@/lib/pdf/core");
    const doc = await openPdfDocument(file);
    const parts: { where: string; text: string }[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const runs = await extractTextRuns(file, p);
      const text = runs.map((r) => r.str).join(" ").replace(/\s+/g, " ").trim();
      if (text) parts.push({ where: `p.${p}`, text });
    }
    return parts;
  }
  const raw = await file.text();
  if (name.endsWith(".csv")) {
    const lines = raw.split("\n");
    const parts: { where: string; text: string }[] = [];
    for (let i = 0; i < lines.length; i += 20) {
      const slice = lines.slice(i, i + 20).join("\n").trim();
      if (slice) parts.push({ where: `rows ${i + 1}-${Math.min(i + 20, lines.length)}`, text: slice });
    }
    return parts;
  }
  if (name.endsWith(".json")) {
    try {
      const data = JSON.parse(raw);
      const rows = Array.isArray(data) ? data : [data];
      return rows.map((row, i) => ({ where: `item ${i + 1}`, text: JSON.stringify(row) }));
    } catch {
      return [{ where: "file", text: raw }];
    }
  }
  // md / txt / transcripts: split on headings, then hard-wrap.
  const sections = raw.split(/\n(?=#{1,4}\s)/);
  return sections
    .map((section) => {
      const heading = section.match(/^#{1,4}\s+(.{1,60})/)?.[1] ?? "section";
      return { where: heading, text: section.trim() };
    })
    .filter((s) => s.text);
}

export function chunkText(text: string): string[] {
  if (text.length <= CHUNK_CHARS) return [text];
  const out: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_CHARS - OVERLAP) {
    out.push(text.slice(i, i + CHUNK_CHARS));
  }
  return out;
}

/* ------------------------------ IndexedDB ------------------------------ */

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putChunks(chunks: ContextChunk[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    for (const c of chunks) tx.objectStore(STORE).put(c);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function allChunks(): Promise<ContextChunk[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as ContextChunk[]);
    req.onerror = () => reject(req.error);
  });
}

export async function clearContext(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ------------------------------ ingestion ------------------------------ */

export async function ingestFile(
  file: File,
  kind: "spec" | "tickets",
  onProgress?: (done: number, total: number) => void,
): Promise<{ chunks: number }> {
  if (file.size > MAX_FILE_BYTES) throw new Error(`'${file.name}' is over 20 MB.`);
  const existing = await allChunks();
  if (new Set(existing.map((c) => c.file)).size >= MAX_FILES) {
    throw new Error(`Context is limited to ${MAX_FILES} files - remove one first.`);
  }
  const parts = await parseFile(file);
  const pieces: { where: string; text: string }[] = [];
  for (const part of parts) {
    for (const chunk of chunkText(part.text)) pieces.push({ where: part.where, text: chunk });
  }
  if (!pieces.length) throw new Error(`Nothing readable found in '${file.name}'.`);

  const embed = await getEmbedder();
  const chunks: ContextChunk[] = [];
  for (let i = 0; i < pieces.length; i++) {
    const [embedding] = await embed([pieces[i]!.text.slice(0, 2000)]);
    chunks.push({
      id: `${file.name}:${i}`,
      file: file.name,
      kind,
      where: pieces[i]!.where,
      text: pieces[i]!.text,
      ticketId: kind === "tickets" ? pieces[i]!.text.match(TICKET_ID_RE)?.[1] : undefined,
      embedding: embedding!,
    });
    onProgress?.(i + 1, pieces.length);
  }
  await putChunks(chunks);
  return { chunks: chunks.length };
}

/* ------------------------------ retrieval ------------------------------ */

export async function retrieve(query: string, k = 5): Promise<(ContextChunk & { score: number })[]> {
  const chunks = await allChunks();
  if (!chunks.length) return [];
  const embed = await getEmbedder();
  const [qv] = await embed([query.slice(0, 2000)]);
  return chunks
    .map((c) => ({ ...c, score: cosine(qv!, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
