"use client";

import { useEffect, useState } from "react";

/**
 * Detects the GigAI Copilot browser extension via the marker its announce-only
 * bridge content script sets on this site (the GigAI Copilot extension —
 * standalone repo at ../../GigAI Copilot/copilot, public/bridge.js):
 * a `data-gigai-copilot` attribute on <html> plus a `gigai-copilot` event.
 * We also ping in case our listener mounts before the bridge announced.
 *
 * `?ext=1` simulates an install — for screenshots and UI work only.
 */
export function useCopilotExtension(): { installed: boolean; version: string | null } {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("ext")) {
      setVersion("2.0.0");
      return;
    }
    const read = () => {
      const v = document.documentElement.dataset.gigaiCopilot;
      if (v !== undefined) setVersion(v || "unknown");
    };
    const onAnnounce = (e: Event) => {
      setVersion((e as CustomEvent<{ version?: string }>).detail?.version ?? "unknown");
    };
    window.addEventListener("gigai-copilot", onAnnounce);
    read();
    window.dispatchEvent(new Event("gigai-copilot:ping"));
    return () => window.removeEventListener("gigai-copilot", onAnnounce);
  }, []);

  return { installed: version !== null, version };
}
