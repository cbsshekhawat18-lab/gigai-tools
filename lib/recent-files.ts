/**
 * Session-only "last file" hand-off between tools.
 *
 * PRIVACY (core product rule. Never persist user data): this is a plain
 * in-memory module variable. Files are NEVER written to localStorage /
 * IndexedDB / anywhere; everything is gone on reload. It only survives
 * client-side navigations, which is exactly the "Continue your workflow"
 * flow: compress an image → open Convert to WebP via the next-step chip →
 * the uploader offers "Reuse" with the file you just processed.
 *
 * Single slot, newest wins: while working, the latest selection is
 * remembered; after a run completes, the RESULT replaces it (the next tool
 * almost always wants the processed file, not the original).
 */

import { fileMatchesAccept } from "@/lib/file-accept";

let lastFiles: File[] = [];
let version = 0;
const listeners = new Set<() => void>();

/** Remember the most recent selection/result. Empty arrays are ignored. */
export function rememberFiles(files: File[]): void {
  if (files.length === 0) return;
  lastFiles = files;
  version += 1;
  listeners.forEach((cb) => cb());
}

/** The remembered files that a tool with this `accept` can consume. */
export function recentFilesFor(accept?: string): File[] {
  return lastFiles.filter((f) => fileMatchesAccept(f, accept));
}

/** Subscribe to changes (useSyncExternalStore-compatible). */
export function subscribeRecentFiles(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Monotonic change counter, the useSyncExternalStore snapshot. */
export function recentFilesVersion(): number {
  return version;
}
