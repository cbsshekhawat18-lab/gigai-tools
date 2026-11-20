"use client";

import { useSyncExternalStore } from "react";

import { Icon } from "@/lib/icons";

/** True once a service worker controls this page (assets are cached). */
function subscribe(cb: () => void): () => void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return () => {};
  }
  navigator.serviceWorker.addEventListener("controllerchange", cb);
  return () => navigator.serviceWorker.removeEventListener("controllerchange", cb);
}
function getSnapshot(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    Boolean(navigator.serviceWorker.controller)
  );
}

/**
 * "Offline ready" chip for tool pages. Appears ONLY when the service worker is
 * actually controlling the page: i.e. this tool's page + chunks are cached and
 * genuinely keep working without internet. Honest by construction: no SW, no
 * badge. Renders nothing on the server and for first-visit page loads.
 */
export function OfflineReady({ coreOnly = false }: { coreOnly?: boolean } = {}) {
  const ready = useSyncExternalStore(subscribe, getSnapshot, () => false);
  if (!ready) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300"
      title={
        coreOnly
          ? "The tool itself is cached and works without internet. Only its optional server-assisted feature needs a connection."
          : "This page is cached on your device. It keeps working without internet."
      }
    >
      <Icon name="WifiOff" size={13} />
      {coreOnly ? "Offline ready \u00b7 core features" : "Offline ready"}
    </span>
  );
}
