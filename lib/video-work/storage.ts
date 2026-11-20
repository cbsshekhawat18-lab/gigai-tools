/**
 * Video → Work, local project storage.
 *
 * Projects live in IndexedDB on the user's own machine. There is no account, no
 * server-side project record, and nothing to sign into, which means "delete my
 * data" is a real operation with a real end state, not a support request.
 *
 * WHAT IS STORED: the findings, the transcript, the selected frames (as JPEG
 * data URLs, because a report without its screenshots is worthless), and the
 * video's metadata.
 *
 * WHAT IS NEVER STORED: the video file. It stays a runtime object URL and dies
 * with the tab. Client recordings routinely contain a logged-in admin panel,
 * customer records, invoices or an inbox, and quietly parking hundreds of
 * megabytes of that in browser storage: where it survives the session and the
 * user's memory of having used the tool. Is not a trade worth making for the
 * convenience of resuming playback. Reopening a saved project restores every
 * finding, screenshot and timestamp; only scrubbing the video needs the file
 * re-added, and the UI says so.
 *
 * Retention is the user's choice: keep projects until deleted (the default), or
 * hold them in memory only and leave nothing behind at all.
 */

import type { Project } from "./types";

const DB_NAME = "gigai-video-work";
const DB_VERSION = 1;
const STORE = "projects";
const RETENTION_KEY = "gigai.video-work.retention";

/** How long a project should outlive the session. */
export type Retention = "keep" | "session-only";

export interface ProjectSummaryRow {
  id: string;
  name: string;
  videoCount: number;
  findingCount: number;
  updatedAt: string;
}

/* ── Retention preference ─────────────────────────────────────────────────── */

export function getRetention(): Retention {
  if (typeof localStorage === "undefined") return "keep";
  return localStorage.getItem(RETENTION_KEY) === "session-only" ? "session-only" : "keep";
}

/**
 * Change the retention setting. Switching to session-only deletes what is
 * already stored, a privacy control that only applies going forward would be
 * a misleading one.
 */
export async function setRetention(retention: Retention): Promise<void> {
  if (typeof localStorage !== "undefined") localStorage.setItem(RETENTION_KEY, retention);
  if (retention === "session-only") await deleteEverything();
}

/* ── Database ─────────────────────────────────────────────────────────────── */

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser has no local storage available."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Local storage couldn't be opened. Private browsing can block it."));
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = run(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Storage operation failed."));
        transaction.oncomplete = () => db.close();
      }),
  );
}

/* ── Persistence ──────────────────────────────────────────────────────────── */

/**
 * Persist a project. A no-op under session-only retention, so the setting is
 * enforced at the single write path rather than at each call site.
 */
export async function saveProject(project: Project): Promise<void> {
  if (getRetention() === "session-only") return;
  await tx("readwrite", (store) => store.put(toStored(project)));
}

export async function loadProject(id: string): Promise<Project | null> {
  const stored = await tx<Project | undefined>("readonly", (store) => store.get(id));
  return stored ? fromStored(stored) : null;
}

export async function listProjects(): Promise<ProjectSummaryRow[]> {
  const all = await tx<Project[]>("readonly", (store) => store.getAll());
  return all
    .map((project) => ({
      id: project.id,
      name: project.name,
      videoCount: project.videos.length,
      findingCount: project.findings.length,
      updatedAt: project.updatedAt,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteProject(id: string): Promise<void> {
  await tx("readwrite", (store) => store.delete(id));
}

/** Remove every stored project. The "delete everything" the privacy panel offers. */
export async function deleteEverything(): Promise<void> {
  await tx("readwrite", (store) => store.clear());
}

/**
 * Delete a single video's evidence from a project while keeping the findings it
 * produced. Lets a user drop the screenshots of a sensitive recording without
 * losing the work extracted from it.
 */
export function stripVideoEvidence(project: Project, videoId: string): Project {
  return {
    ...project,
    videos: project.videos.map((video) =>
      video.id === videoId
        ? { ...video, frames: [], segments: [], posterDataUrl: undefined, objectUrl: undefined }
        : video,
    ),
    findings: project.findings.map((finding) =>
      finding.evidence.videoId === videoId
        ? { ...finding, evidence: { ...finding.evidence, frameTimeMs: null } }
        : finding,
    ),
    updatedAt: new Date().toISOString(),
  };
}

/* ── Serialisation ────────────────────────────────────────────────────────── */

/** Strip anything that can't or shouldn't outlive the session. */
function toStored(project: Project): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    videos: project.videos.map((video) => {
      // Object URLs are meaningless once the tab closes, and keeping the field
      // would make a reloaded project look playable when it isn't.
      const { objectUrl: _dropped, ...rest } = video;
      return rest;
    }),
  };
}

function fromStored(project: Project): Project {
  return {
    ...project,
    videos: project.videos.map((video) => ({ ...video, objectUrl: undefined })),
  };
}

/* ── Diagnostics ──────────────────────────────────────────────────────────── */

/** Roughly how much space this origin is using, for the privacy panel. */
export async function storageEstimate(): Promise<{ usedMb: number; quotaMb: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return {
      usedMb: Math.round((usage / (1024 * 1024)) * 10) / 10,
      quotaMb: Math.round(quota / (1024 * 1024)),
    };
  } catch {
    return null;
  }
}
