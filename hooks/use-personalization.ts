"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  CAPS,
  clearAllPersonalization,
  clearFavorites,
  clearPinned,
  clearRecentTools,
  getFavorites,
  getPinned,
  getRecentToolSlugs,
  isFavorite as readIsFavorite,
  isPinned as readIsPinned,
  recordToolVisit,
  removeFavorite,
  removePinned,
  removeRecentTool,
  subscribe as subscribePersonalization,
  toggleFavorite,
  togglePinned,
  type PersonalizationKey,
  STORAGE_KEYS,
} from "@/lib/personalization";

/**
 * React bindings for `lib/personalization`. Everything reads via
 * `useSyncExternalStore`, so components stay in sync across instances, tabs and
 * hydration boundaries with no flicker: the server snapshot is always empty
 * (nothing is personalized until the client reads localStorage), and the client
 * snapshot updates the moment any personalization event fires.
 *
 * All of this is *purely local to the browser* — there is no account or sync.
 */

/* ── Shared subscription/snapshot plumbing ───────────────────────────────── */

const EMPTY: string[] = [];

/**
 * Cache the last returned array per storage key so `getSnapshot` is referentially
 * stable when the underlying data is unchanged (required by useSyncExternalStore).
 */
const cache = new Map<PersonalizationKey | "all", string[]>();

function stableRead(
  key: PersonalizationKey | "all",
  read: () => string[],
): string[] {
  const next = read();
  const prev = cache.get(key);
  if (prev && prev.length === next.length && prev.every((v, i) => v === next[i])) {
    return prev;
  }
  cache.set(key, next);
  return next;
}

function makeSubscribe(key?: PersonalizationKey) {
  return (onChange: () => void) => subscribePersonalization(onChange, key);
}

/* ── Hooks ───────────────────────────────────────────────────────────────── */

export interface UseRecentTools {
  /** Recent tool slugs, newest first. Empty on the server + first paint. */
  slugs: string[];
  remove: (slug: string) => void;
  clear: () => void;
}

/** Recently-used tool slugs (newest first), reactive across the app. */
export function useRecentTools(): UseRecentTools {
  const slugs = useSyncExternalStore(
    makeSubscribe(STORAGE_KEYS.recentTools),
    () => stableRead(STORAGE_KEYS.recentTools, getRecentToolSlugs),
    () => EMPTY,
  );
  return {
    slugs,
    remove: useCallback((slug: string) => removeRecentTool(slug), []),
    clear: useCallback(() => clearRecentTools(), []),
  };
}

export interface UseFavorites {
  slugs: string[];
  /** Reactive membership test for a specific slug. */
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  /** True once the favorites list is full (capacity cap reached). */
  isFull: boolean;
}

/** Favorited tool slugs, reactive across instances/tabs. */
export function useFavorites(): UseFavorites {
  const slugs = useSyncExternalStore(
    makeSubscribe(STORAGE_KEYS.favorites),
    () => stableRead(STORAGE_KEYS.favorites, getFavorites),
    () => EMPTY,
  );
  return {
    slugs,
    isFavorite: useCallback((slug: string) => slugs.includes(slug.trim()), [slugs]),
    toggle: useCallback((slug: string) => toggleFavorite(slug), []),
    remove: useCallback((slug: string) => removeFavorite(slug), []),
    clear: useCallback(() => clearFavorites(), []),
    isFull: slugs.length >= CAPS.favorites,
  };
}

export interface UsePinned {
  slugs: string[];
  isPinned: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  isFull: boolean;
}

/** Pinned tool slugs, reactive across instances/tabs. */
export function usePinned(): UsePinned {
  const slugs = useSyncExternalStore(
    makeSubscribe(STORAGE_KEYS.pinned),
    () => stableRead(STORAGE_KEYS.pinned, getPinned),
    () => EMPTY,
  );
  return {
    slugs,
    isPinned: useCallback((slug: string) => slugs.includes(slug.trim()), [slugs]),
    toggle: useCallback((slug: string) => togglePinned(slug), []),
    remove: useCallback((slug: string) => removePinned(slug), []),
    clear: useCallback(() => clearPinned(), []),
    isFull: slugs.length >= CAPS.pinned,
  };
}

export interface UseToolPersonalization {
  isFavorite: boolean;
  isPinned: boolean;
  toggleFavorite: () => boolean;
  togglePinned: () => boolean;
}

/**
 * Per-tool favorite/pin state — the compact binding used by `<FavoriteButton>`
 * and `<PinButton>`. Only re-renders when *this* slug's state changes.
 */
export function useToolPersonalization(slug: string): UseToolPersonalization {
  const favorite = useSyncExternalStore(
    makeSubscribe(STORAGE_KEYS.favorites),
    () => readIsFavorite(slug),
    () => false,
  );
  const pinned = useSyncExternalStore(
    makeSubscribe(STORAGE_KEYS.pinned),
    () => readIsPinned(slug),
    () => false,
  );
  return {
    isFavorite: favorite,
    isPinned: pinned,
    toggleFavorite: useCallback(() => toggleFavorite(slug), [slug]),
    togglePinned: useCallback(() => togglePinned(slug), [slug]),
  };
}

/** Imperatively record a tool visit (used by `<ToolVisitTracker>`). */
export function useRecordToolVisit(): (slug: string) => void {
  return useCallback((slug: string) => recordToolVisit(slug), []);
}

/** Clear every personalization key (for a "Clear my data" control). */
export function useClearAllPersonalization(): () => void {
  return useCallback(() => clearAllPersonalization(), []);
}
