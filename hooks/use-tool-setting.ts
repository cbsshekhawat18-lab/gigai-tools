"use client";

import * as React from "react";

/**
 * Per-tool remembered settings (de-ai-ux spec, Rule 3): if the user set
 * quality to 85 last time, start there next time. localStorage only - the
 * same privacy posture as every other preference on the site.
 *
 * Usage: const [quality, setQuality] = useToolSetting("image-compressor", "quality", 80);
 *
 * Values must be JSON-serialisable. The default is returned on first visit,
 * blocked storage, or a stored value whose type no longer matches the
 * default's (so a shipped settings change can't crash on old data).
 */
export function useToolSetting<T>(
  toolSlug: string,
  key: string,
  defaultValue: T,
): [T, (next: T) => void] {
  const storageKey = `gigai.tool.${toolSlug}.${key}`;

  const [value, setValue] = React.useState<T>(defaultValue);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return;
      const parsed = JSON.parse(raw) as T;
      if (typeof parsed === typeof defaultValue) setValue(parsed);
    } catch {
      /* blocked or corrupt - the default stands */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const set = React.useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage blocked - the in-session value still applies */
      }
    },
    [storageKey],
  );

  return [value, set];
}
