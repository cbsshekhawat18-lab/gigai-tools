"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { track } from "@/lib/analytics";

/**
 * The floating GigAI ASSISTANT launcher.
 *
 * This is the ONLY assistant code that reaches the initial page bundle, and it
 * is deliberately tiny: an elegant floating button plus open-state. The panel -
 * which pulls in the intent engine (and therefore the registry). Is
 * `dynamic(..., { ssr: false })`, so it is only fetched once the user first
 * opens the assistant. That keeps ~249 tool configs out of every page's payload,
 * exactly the CWV rule the platform follows for search.
 *
 * Placement: bottom-right on every page (`z-50`), honoring the device
 * safe-area inset. It steps aside inside a tool `#workspace` so it never
 * overlaps a tool's own controls, and it must never overlap an ad unit
 * (AdSense treats UI covering ads as an accidental-click violation).
 */

// Lazy panel: not fetched until `open` flips true for the first time.
const AssistantPanel = dynamic(
  () => import("./assistant-panel").then((m) => m.AssistantPanel),
  { ssr: false },
);

export function AssistantButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  // Once opened, keep the panel mounted (hidden) so re-opening is instant.
  const [everOpened, setEverOpened] = useState(false);

  const openPanel = useCallback(() => {
    setEverOpened(true);
    setOpen(true);
    track("assistant_open", { source: "button" });
  }, []);

  const closePanel = useCallback(() => setOpen(false), []);

  // Keyboard: ⌘/Ctrl-J toggles the assistant from anywhere (⌘K stays with the
  // header command search, so power users get both).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setEverOpened(true);
        setOpen((v) => {
          const next = !v;
          if (next) track("assistant_open", { source: "hotkey" });
          return next;
        });
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open ? closePanel : openPanel}
        aria-label="Open GigAI Assistant"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Meta+J Control+J"
        className={cn(
          // Position: classic bottom-right, lifted by the device safe area.
          "fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] right-4 z-50 lg:bottom-6 lg:right-6",
          // Shape: pill that collapses to a circle on very small screens.
          "group flex h-12 items-center gap-2 rounded-full pl-3.5 pr-3.5 sm:pr-4",
          "border border-primary/20 bg-primary text-primary-foreground shadow-lg shadow-primary/25",
          "transition-transform duration-200 hover:scale-[1.03] active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none motion-reduce:hover:scale-100",
          className,
        )}
      >
        <Icon name={open ? "X" : "Sparkles"} size={18} />
        <span className="hidden text-sm font-medium sm:inline">
          {open ? "Close" : "Ask GigAI"}
        </span>
      </button>

      {everOpened ? <AssistantPanel open={open} onClose={closePanel} /> : null}
    </>
  );
}
