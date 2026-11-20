"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gt:recent";
const MAX_RECENT = 6;

/** Read the persisted recent-search list, tolerating malformed storage. */
function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

/** Persist a list, silently ignoring quota / privacy-mode errors. */
function write(values: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export interface UseRecentSearches {
  recent: string[];
  add: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

/**
 * Recent search history backed by localStorage (key "gt:recent", capped at 6).
 * Newest first; adding an existing query moves it to the top.
 */
export function useRecentSearches(): UseRecentSearches {
  const [recent, setRecent] = useState<string[]>([]);

  // Hydrate from storage after mount to avoid SSR/client mismatch.
  useEffect(() => {
    setRecent(read());
  }, []);

  const add = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    setRecent((prev) => {
      const next = [q, ...prev.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(
        0,
        MAX_RECENT,
      );
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setRecent((prev) => {
      const next = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    write([]);
  }, []);

  return { recent, add, remove, clear };
}
