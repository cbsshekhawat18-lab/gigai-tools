/**
 * GigAI Tools, client-side personalization store.
 *
 * IMPORTANT: This is *purely local* to the visitor's browser. There is no
 * account, no server and no sync: everything lives in `localStorage`, so it is
 * private to this device/profile and disappears if the user clears their data.
 *
 * The platform is a static export, so this module is the single source of truth
 * for "what has this browser done here": recently-used tools, favorites, pinned
 * tools and recent searches. It is safe to import from BOTH server and client
 * bundles, every call guards `typeof window` and never touches the tool
 * registry, so it stays tiny and never bundles the ~249 tool configs.
 *
 * State changes emit a cross-instance event (a `window` CustomEvent plus the
 * native `storage` event across tabs), so any subscribed component re-reads and
 * re-renders. Subscribe via `hooks/use-personalization.ts` rather than reading
 * these functions directly from components.
 */

/* ── Storage keys (namespaced `gt:`) ─────────────────────────────────────── */

export const STORAGE_KEYS = {
  recentTools: "gt:recent-tools",
  favorites: "gt:favorites",
  pinned: "gt:pinned",
  recentSearches: "gt:recent", // shared with hooks/use-recent-searches
  recentCategories: "gt:recent-categories",
} as const;

export type PersonalizationKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/* ── Capacity caps ───────────────────────────────────────────────────────── */

export const CAPS = {
  recentTools: 12,
  favorites: 60,
  pinned: 12,
  recentSearches: 6,
  recentCategories: 4,
} as const;

/**
 * A recently-used tool entry. We store only the slug + a timestamp. Never the
 * full tool object, so the store stays slim and registry-free. Titles/icons
 * are resolved at render time from a slim lookup passed by a server parent.
 */
export interface RecentToolEntry {
  slug: string;
  /** Epoch ms of the most recent visit. */
  at: number;
}

/* ── Event plumbing ──────────────────────────────────────────────────────── */

/** Fired on `window` whenever any personalization key changes in this tab. */
export const PERSONALIZATION_EVENT = "gt:personalization";

function emit(key: PersonalizationKey): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(PERSONALIZATION_EVENT, { detail: { key } }),
    );
  } catch {
    /* CustomEvent unsupported, non-fatal */
  }
}

/* ── Low-level storage helpers (malformed/quota tolerant) ────────────────── */

function readRaw(key: PersonalizationKey): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeRaw(key: PersonalizationKey, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    emit(key);
  } catch {
    /* storage unavailable / quota exceeded: non-fatal */
  }
}

/** Parse an array of non-empty slug strings, de-duplicated, capped. */
function readSlugList(key: PersonalizationKey, cap: number): string[] {
  const parsed = readRaw(key);
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of parsed) {
    if (typeof v !== "string") continue;
    const slug = v.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
    if (out.length >= cap) break;
  }
  return out;
}

/* ── Recently-used tools ─────────────────────────────────────────────────── */

/** Read recent tools, newest first, tolerating legacy/malformed storage. */
export function getRecentTools(): RecentToolEntry[] {
  const parsed = readRaw(STORAGE_KEYS.recentTools);
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  const out: RecentToolEntry[] = [];
  for (const v of parsed) {
    if (!v || typeof v !== "object") continue;
    const slug = typeof (v as RecentToolEntry).slug === "string" ? (v as RecentToolEntry).slug.trim() : "";
    const at = typeof (v as RecentToolEntry).at === "number" ? (v as RecentToolEntry).at : 0;
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, at });
    if (out.length >= CAPS.recentTools) break;
  }
  return out;
}

/** Convenience: just the slugs of recent tools, newest first. */
export function getRecentToolSlugs(): string[] {
  return getRecentTools().map((e) => e.slug);
}

/**
 * Record a tool visit. Moves the slug to the front (newest first), refreshes
 * its timestamp and caps the list. Called on tool-page mount via
 * `<ToolVisitTracker slug=… />`.
 */
export function recordToolVisit(slug: string): void {
  const s = slug.trim();
  if (!s) return;
  const prev = getRecentTools().filter((e) => e.slug !== s);
  const next = [{ slug: s, at: Date.now() }, ...prev].slice(0, CAPS.recentTools);
  writeRaw(STORAGE_KEYS.recentTools, next);
}

/** Remove a single tool from the recent list. */
export function removeRecentTool(slug: string): void {
  const s = slug.trim();
  const next = getRecentTools().filter((e) => e.slug !== s);
  writeRaw(STORAGE_KEYS.recentTools, next);
}

/** Clear the entire recent-tools list. */
export function clearRecentTools(): void {
  writeRaw(STORAGE_KEYS.recentTools, []);
}

/* ── Favorites ───────────────────────────────────────────────────────────── */

/** Read favorited tool slugs, most-recently-added first. */
export function getFavorites(): string[] {
  return readSlugList(STORAGE_KEYS.favorites, CAPS.favorites);
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug.trim());
}

/**
 * Toggle a favorite. Returns the new state (`true` = now favorited). Newly
 * favorited slugs go to the front so a "Favorites" rail shows recent picks.
 */
export function toggleFavorite(slug: string): boolean {
  const s = slug.trim();
  if (!s) return false;
  const prev = getFavorites();
  const has = prev.includes(s);
  const next = has ? prev.filter((v) => v !== s) : [s, ...prev].slice(0, CAPS.favorites);
  writeRaw(STORAGE_KEYS.favorites, next);
  return !has;
}

export function removeFavorite(slug: string): void {
  const s = slug.trim();
  writeRaw(STORAGE_KEYS.favorites, getFavorites().filter((v) => v !== s));
}

export function clearFavorites(): void {
  writeRaw(STORAGE_KEYS.favorites, []);
}

/* ── Pinned tools ────────────────────────────────────────────────────────── */

/** Read pinned tool slugs, most-recently-pinned first. */
export function getPinned(): string[] {
  return readSlugList(STORAGE_KEYS.pinned, CAPS.pinned);
}

export function isPinned(slug: string): boolean {
  return getPinned().includes(slug.trim());
}

/**
 * Toggle a pin. Returns the new state (`true` = now pinned). Pins are capped;
 * once full, toggling a new slug still succeeds by dropping the oldest pin.
 */
export function togglePinned(slug: string): boolean {
  const s = slug.trim();
  if (!s) return false;
  const prev = getPinned();
  const has = prev.includes(s);
  const next = has ? prev.filter((v) => v !== s) : [s, ...prev].slice(0, CAPS.pinned);
  writeRaw(STORAGE_KEYS.pinned, next);
  return !has;
}

export function removePinned(slug: string): void {
  const s = slug.trim();
  writeRaw(STORAGE_KEYS.pinned, getPinned().filter((v) => v !== s));
}

export function clearPinned(): void {
  writeRaw(STORAGE_KEYS.pinned, []);
}

/* ── Recent categories ───────────────────────────────────────────────────── */

/** Read recently-visited category slugs, newest first. */
export function getRecentCategories(): string[] {
  return readSlugList(STORAGE_KEYS.recentCategories, CAPS.recentCategories);
}

/** Record a category-page visit (newest first, deduped, capped). */
export function recordCategoryVisit(slug: string): void {
  const s = slug.trim();
  if (!s) return;
  const prev = getRecentCategories().filter((v) => v !== s);
  writeRaw(STORAGE_KEYS.recentCategories, [s, ...prev].slice(0, CAPS.recentCategories));
}

export function clearRecentCategories(): void {
  writeRaw(STORAGE_KEYS.recentCategories, []);
}

/* ── Recent searches ─────────────────────────────────────────────────────── */
/**
 * Recent searches share the `gt:recent` key with `hooks/use-recent-searches`
 * (the search bar's own hook). These functions are provided so the wider
 * personalization API is complete; the search bar itself keeps using its hook.
 */

export function getRecentSearches(): string[] {
  return readSlugList(STORAGE_KEYS.recentSearches, CAPS.recentSearches);
}

export function addRecentSearch(query: string): void {
  const q = query.trim();
  if (!q) return;
  const prev = getRecentSearches().filter((v) => v.toLowerCase() !== q.toLowerCase());
  writeRaw(STORAGE_KEYS.recentSearches, [q, ...prev].slice(0, CAPS.recentSearches));
}

export function removeRecentSearch(query: string): void {
  const q = query.trim().toLowerCase();
  writeRaw(
    STORAGE_KEYS.recentSearches,
    getRecentSearches().filter((v) => v.toLowerCase() !== q),
  );
}

export function clearRecentSearches(): void {
  writeRaw(STORAGE_KEYS.recentSearches, []);
}

/* ── Bulk / diagnostics ──────────────────────────────────────────────────── */

/** Wipe every personalization key. Useful for a "Clear my data" control. */
export function clearAllPersonalization(): void {
  clearRecentTools();
  clearFavorites();
  clearPinned();
  clearRecentSearches();
  clearRecentCategories();
}

/**
 * Subscribe to any personalization change (this tab via CustomEvent, other tabs
 * via the native `storage` event). Returns an unsubscribe function. When `key`
 * is provided, `handler` only fires for that storage key.
 */
export function subscribe(
  handler: () => void,
  key?: PersonalizationKey,
): () => void {
  if (typeof window === "undefined") return () => {};

  const onCustom = (e: Event) => {
    const detailKey = (e as CustomEvent<{ key?: PersonalizationKey }>).detail?.key;
    if (key && detailKey && detailKey !== key) return;
    handler();
  };
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return;
    if (key && e.key !== key) return;
    if (!Object.values(STORAGE_KEYS).includes(e.key as PersonalizationKey)) return;
    handler();
  };

  window.addEventListener(PERSONALIZATION_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PERSONALIZATION_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
