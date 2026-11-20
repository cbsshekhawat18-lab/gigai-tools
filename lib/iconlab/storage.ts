/**
 * IconLab persistence: IndexedDB, behind an interface.
 *
 * There are no accounts on this platform, so a family belongs to a browser and
 * travels as an exported JSON file. That is a deliberate trade, not an
 * oversight: it ships today, costs nothing to run, and matches the privacy-first
 * promise made everywhere else on the site.
 *
 * Everything goes through `FamilyStore`, so a server-backed adapter can be
 * added later without touching the engine or the UI. Nothing outside this file
 * knows that IndexedDB exists.
 */

import type { Icon, IconFamily, FamilyVersion } from "./types";

const DB_NAME = "gigai-iconlab";
const DB_VERSION = 1;
const FAMILIES = "families";
const ICONS = "icons";
const VERSIONS = "versions";

export interface FamilyStore {
  listFamilies(): Promise<IconFamily[]>;
  getFamily(id: string): Promise<IconFamily | null>;
  saveFamily(family: IconFamily): Promise<void>;
  deleteFamily(id: string): Promise<void>;

  listIcons(familyId: string): Promise<Icon[]>;
  saveIcon(icon: Icon): Promise<void>;
  saveIcons(icons: Icon[]): Promise<void>;
  deleteIcon(id: string): Promise<void>;

  listVersions(familyId: string): Promise<FamilyVersion[]>;
  saveVersion(version: FamilyVersion): Promise<void>;
}

/* ── IndexedDB adapter ────────────────────────────────────────────────────── */

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser doesn't provide IndexedDB, so families can't be saved."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(FAMILIES)) {
        db.createObjectStore(FAMILIES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ICONS)) {
        const s = db.createObjectStore(ICONS, { keyPath: "id" });
        // Indexed so a 1,000-icon family lists without scanning every record.
        s.createIndex("familyId", "familyId", { unique: false });
        s.createIndex("fingerprint", "fingerprint", { unique: false });
      }
      if (!db.objectStoreNames.contains(VERSIONS)) {
        const s = db.createObjectStore(VERSIONS, { keyPath: "id" });
        s.createIndex("familyId", "familyId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB could not be opened."));
  });
  return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("Storage operation failed."));
      }),
  );
}

function byIndex<T>(store: string, index: string, value: IDBValidKey): Promise<T[]> {
  return openDb().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const t = db.transaction(store, "readonly");
        const req = t.objectStore(store).index(index).getAll(value);
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error ?? new Error("Storage read failed."));
      }),
  );
}

export const indexedDbStore: FamilyStore = {
  listFamilies: () => tx<IconFamily[]>(FAMILIES, "readonly", (s) => s.getAll()),
  getFamily: (id) => tx<IconFamily | undefined>(FAMILIES, "readonly", (s) => s.get(id)).then((f) => f ?? null),
  saveFamily: (family) => tx(FAMILIES, "readwrite", (s) => s.put(family)).then(() => undefined),

  async deleteFamily(id) {
    const db = await openDb();
    const icons = await byIndex<Icon>(ICONS, "familyId", id);
    const versions = await byIndex<FamilyVersion>(VERSIONS, "familyId", id);
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction([FAMILIES, ICONS, VERSIONS], "readwrite");
      t.objectStore(FAMILIES).delete(id);
      for (const i of icons) t.objectStore(ICONS).delete(i.id);
      for (const v of versions) t.objectStore(VERSIONS).delete(v.id);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error ?? new Error("The family could not be deleted."));
    });
  },

  listIcons: (familyId) => byIndex<Icon>(ICONS, "familyId", familyId),
  saveIcon: (icon) => tx(ICONS, "readwrite", (s) => s.put(icon)).then(() => undefined),

  /** One transaction for the whole batch. 100 separate ones is glacial. */
  async saveIcons(icons) {
    if (!icons.length) return;
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(ICONS, "readwrite");
      const store = t.objectStore(ICONS);
      for (const icon of icons) store.put(icon);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error ?? new Error("Icons could not be saved."));
    });
  },

  deleteIcon: (id) => tx(ICONS, "readwrite", (s) => s.delete(id)).then(() => undefined),
  listVersions: (familyId) => byIndex<FamilyVersion>(VERSIONS, "familyId", familyId),
  saveVersion: (version) => tx(VERSIONS, "readwrite", (s) => s.put(version)).then(() => undefined),
};

/* ── Portability ──────────────────────────────────────────────────────────── */

export interface FamilyBundle {
  format: "gigai-iconlab-family";
  version: 1;
  family: IconFamily;
  icons: Icon[];
  versions: FamilyVersion[];
  exportedAt: string;
}

/** Everything needed to move a family to another browser or share it. */
export async function exportFamily(store: FamilyStore, familyId: string): Promise<FamilyBundle> {
  const family = await store.getFamily(familyId);
  if (!family) throw new Error("That family no longer exists in this browser.");
  return {
    format: "gigai-iconlab-family",
    version: 1,
    family,
    icons: await store.listIcons(familyId),
    versions: await store.listVersions(familyId),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Import a bundle. Ids are rewritten so importing a family you already have
 * creates a copy rather than silently overwriting your work.
 */
export async function importFamily(store: FamilyStore, bundle: unknown): Promise<IconFamily> {
  const b = bundle as Partial<FamilyBundle>;
  if (!b || b.format !== "gigai-iconlab-family" || !b.family) {
    throw new Error("That file isn't an IconLab family export.");
  }
  const { shortId } = await import("./types");
  const newId = shortId("FAM");
  const family: IconFamily = {
    ...b.family,
    id: newId,
    familyCode: newId,
    name: b.family.name,
    updatedAt: new Date().toISOString(),
  };
  await store.saveFamily(family);

  const icons = (b.icons ?? []).map((i) => ({ ...i, id: shortId("ICO"), familyId: newId }));
  await store.saveIcons(icons);

  for (const v of b.versions ?? []) {
    await store.saveVersion({ ...v, id: shortId("VER"), familyId: newId });
  }
  return family;
}
