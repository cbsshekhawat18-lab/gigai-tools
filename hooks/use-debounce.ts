"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a rapidly-changing value. Returns the latest value only after it has
 * stopped changing for `delayMs`. Ideal for search inputs and live filters.
 *
 * @param value   The value to debounce.
 * @param delayMs Idle time before the value is committed (default 300ms).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
