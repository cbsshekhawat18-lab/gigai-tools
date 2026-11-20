/**
 * GigAI Smart Assist, STEP 7: local WORKFLOW HISTORY.
 *
 * Purely local to the browser (localStorage). No account, no server, no sync,
 * and NEVER any file contents: we store only the goal text, the filename, the
 * family and a short summary. Mirrors `lib/personalization`'s conventions
 * (namespaced key, capacity cap, cross-instance event) so the UI can subscribe
 * with `useSyncExternalStore`. Safe to import from server or client (guards
 * `window`).
 */

import type { AssistHistoryEntry, FileFamily } from "@/lib/assist/types";

const STORAGE_KEY = "gt:assist-history";
const CAP = 15;

/** Fired on `window` whenever the history changes in this tab. */
export const ASSIST_HISTORY_EVENT = "gt:assist-history";

function makeId(): string {
  return `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Cached snapshot so `getAssists` (used as a `useSyncExternalStore` getSnapshot)
 * returns a REFERENTIALLY STABLE array until localStorage actually changes.
 * Without this, JSON.parse would hand back a fresh array every render and React
 * would loop forever ("Maximum update depth exceeded"). We key the cache on the
 * raw string, so any write invalidates it and re-parses exactly once.
 */
let snapshotCache: { raw: string; value: AssistHistoryEntry[] } | null = null;
const EMPTY_SNAPSHOT: AssistHistoryEntry[] = [];

function read(): AssistHistoryEntry[] {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  let raw: string;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return EMPTY_SNAPSHOT;
  }
  if (raw === "") return EMPTY_SNAPSHOT;
  if (snapshotCache && snapshotCache.raw === raw) return snapshotCache.value;
  try {
    const parsed = JSON.parse(raw);
    const value = Array.isArray(parsed) ? (parsed as AssistHistoryEntry[]) : EMPTY_SNAPSHOT;
    snapshotCache = { raw, value };
    return value;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function write(entries: AssistHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent(ASSIST_HISTORY_EVENT));
  } catch {
    /* quota / disabled, non-fatal */
  }
}

/** All history entries, newest first (pinned entries are kept even past the cap). */
export function getAssists(): AssistHistoryEntry[] {
  return read();
}

/** Record a completed/opened assist. Returns the created entry. */
export function addAssist(input: {
  goal: string;
  fileName: string;
  family: FileFamily;
  summary: string;
}): AssistHistoryEntry {
  const entry: AssistHistoryEntry = { id: makeId(), at: Date.now(), ...input };
  const existing = read();
  const pinned = existing.filter((e) => e.pinned);
  const recent = existing.filter((e) => !e.pinned);
  const nextRecent = [entry, ...recent].slice(0, Math.max(0, CAP - pinned.length));
  write([...pinned, ...nextRecent]);
  return entry;
}

/** Toggle the pinned flag on an entry. */
export function togglePinAssist(id: string): void {
  write(read().map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)));
}

/** Remove one entry. */
export function removeAssist(id: string): void {
  write(read().filter((e) => e.id !== id));
}

/** Clear all history. */
export function clearAssists(): void {
  write([]);
}

/** Subscribe to history changes (same tab + across tabs). Returns an unsubscribe. */
export function subscribeAssists(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => callback();
  window.addEventListener(ASSIST_HISTORY_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ASSIST_HISTORY_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
