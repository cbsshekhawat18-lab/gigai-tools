"use client";

import { useCallback, useMemo, useRef, useState } from "react";

/** Options for {@link useHistory}. */
export interface UseHistoryOptions {
  /** Max entries kept in the undo stack (oldest are dropped). Default 100. */
  limit?: number;
  /**
   * Coalescing window in ms. `set` calls within this window replace the last
   * pushed entry instead of adding a new one, so a burst of keystrokes becomes
   * a single undo step. Default 400ms. Pass 0 to disable coalescing.
   */
  debounceMs?: number;
}

/** Return shape of {@link useHistory}. */
export interface History<T> {
  /** Current value. */
  state: T;
  /** Push a new value onto the stack (coalesced within `debounceMs`). */
  set: (next: T | ((prev: T) => T)) => void;
  /** Replace the current value without creating an undo step. */
  replace: (next: T | ((prev: T) => T)) => void;
  /** Step back one entry; no-op when {@link History.canUndo} is false. */
  undo: () => void;
  /** Step forward one entry; no-op when {@link History.canRedo} is false. */
  redo: () => void;
  /** True when a previous entry exists. */
  canUndo: boolean;
  /** True when a forward entry exists. */
  canRedo: boolean;
  /** Reset the whole stack to a single value (defaults to the initial value). */
  reset: (value?: T) => void;
}

interface Stack<T> {
  past: T[];
  present: T;
  future: T[];
}

const resolve = <T>(next: T | ((prev: T) => T), prev: T): T =>
  typeof next === "function" ? (next as (p: T) => T)(prev) : next;

/**
 * Undo/redo state with debounced coalescing of rapid edits and a capped stack.
 *
 * Designed for text editors: typing produces one merged undo step per idle
 * window, while discrete actions (paste, format, load example) land as their
 * own steps by calling `set` after the window elapses, or use `replace` to
 * mutate without an undo step at all.
 */
export function useHistory<T>(
  initial: T,
  { limit = 100, debounceMs = 400 }: UseHistoryOptions = {},
): History<T> {
  const [stack, setStack] = useState<Stack<T>>({
    past: [],
    present: initial,
    future: [],
  });
  const initialRef = useRef(initial);
  // Timestamp of the last `set`; used to decide coalescing vs. new step.
  const lastSetAt = useRef(0);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const now = Date.now();
      const coalesce = debounceMs > 0 && now - lastSetAt.current < debounceMs;
      lastSetAt.current = now;

      setStack((s) => {
        const value = resolve(next, s.present);
        if (Object.is(value, s.present)) return s;

        if (coalesce && s.past.length > 0) {
          // Merge into the current step: keep past as-is, just move present.
          return { past: s.past, present: value, future: [] };
        }

        const past = [...s.past, s.present];
        // Cap: drop oldest entries beyond the limit.
        if (past.length > limit) past.splice(0, past.length - limit);
        return { past, present: value, future: [] };
      });
    },
    [debounceMs, limit],
  );

  const replace = useCallback((next: T | ((prev: T) => T)) => {
    // Prevent the next `set` from coalescing across an out-of-band replace.
    lastSetAt.current = 0;
    setStack((s) => {
      const value = resolve(next, s.present);
      if (Object.is(value, s.present)) return s;
      return { ...s, present: value };
    });
  }, []);

  const undo = useCallback(() => {
    lastSetAt.current = 0;
    setStack((s) => {
      if (s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1] as T;
      return {
        past: s.past.slice(0, -1),
        present: prev,
        future: [s.present, ...s.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    lastSetAt.current = 0;
    setStack((s) => {
      if (s.future.length === 0) return s;
      const next = s.future[0] as T;
      return {
        past: [...s.past, s.present],
        present: next,
        future: s.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((value?: T) => {
    lastSetAt.current = 0;
    setStack({
      past: [],
      present: value === undefined ? initialRef.current : value,
      future: [],
    });
  }, []);

  return useMemo(
    () => ({
      state: stack.present,
      set,
      replace,
      undo,
      redo,
      canUndo: stack.past.length > 0,
      canRedo: stack.future.length > 0,
      reset,
    }),
    [stack, set, replace, undo, redo, reset],
  );
}
