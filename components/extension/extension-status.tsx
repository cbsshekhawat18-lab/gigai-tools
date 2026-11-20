"use client";

import { Icon } from "@/lib/icons";
import { useCopilotExtension } from "@/hooks/use-copilot-extension";

/**
 * Install-state panel for the /extension landing page. Honest states only:
 * installed → confirmation + usage tip; not installed → the truthful launch
 * status (finished, store review in progress). No fake "Add to Chrome" button
 * while there is no store listing to link.
 */
export function ExtensionStatus() {
  const { installed, version } = useCopilotExtension();

  if (installed) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
        <Icon name="CircleCheck" size={22} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300" />
        <div>
          <p className="font-semibold text-emerald-800 dark:text-emerald-200">
            GigAI Copilot is installed{version && version !== "unknown" ? ` - v${version}` : ""}.
          </p>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
            Click its icon in your toolbar on any website to get today&apos;s mission, or press <kbd className="rounded border border-current/30 px-1 font-mono text-xs">Ctrl/⌘ K</kbd> inside it to search every action and all GigAI tools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-5">
      <Icon name="Rocket" size={22} className="mt-0.5 shrink-0 text-primary" />
      <div>
        <p className="font-semibold">Launching on the Chrome Web Store</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Version 2.0 is finished and being submitted for store review now. It runs on Chrome, Edge, Brave and Firefox. Check back here soon. This page will show the install button the moment it&apos;s live.
        </p>
      </div>
    </div>
  );
}
