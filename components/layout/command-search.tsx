"use client";

import { Suspense, lazy, useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Global command-center entry point for the header.
 *
 * Desktop renders a wide, click-anywhere "search trigger" that looks like an
 * input but opens a centered command palette (⌘K / Ctrl-K). Mobile/tablet get
 * a compact icon button. Both open the same dialog which hosts the
 * `<CommandCenter>` panel.
 *
 * CWV: the panel, and the assistant intent engine it imports, are LAZY-loaded
 * (React.lazy) and only mounted while the dialog is open, so neither the panel
 * nor the registry-backed engine land in the initial page bundle. The trigger
 * itself is a tiny, dependency-free button.
 */

// Lazy chunk: pulled in on first open. `import("@/lib/assistant/intent")` (the
// registry-backed engine) is deferred further, to the panel's own mount effect.
const CommandCenter = lazy(() =>
  import("@/components/layout/command-center").then((m) => ({
    default: m.CommandCenter,
  })),
);

export function CommandSearch({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  // ⌘K / Ctrl-K toggles the palette from anywhere; "/" opens it too, unless the
  // user is already typing in a field.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const k = event.key.toLowerCase();
      if (k === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (k === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const el = document.activeElement;
        const typing =
          el instanceof HTMLElement &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.isContentEditable);
        if (!typing) {
          event.preventDefault();
          setOpen(true);
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const openPalette = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* Desktop: full search trigger */}
      <button
        type="button"
        onClick={openPalette}
        aria-label="Search GigAI Tools"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          "hidden h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-muted/40 pl-3.5 pr-2 text-left outline-none transition-colors md:flex",
          "hover:border-border hover:bg-muted/70",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <Icon
          name="Search"
          size={17}
          className="shrink-0 text-muted-foreground"
        />
        <span className="flex-1 truncate text-sm text-muted-foreground">
          Search GigAI Tools…
        </span>
        <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground lg:inline-flex">
          <span className="text-sm leading-none">⌘</span>K
        </kbd>
      </button>

      {/* Mobile/tablet: icon button */}
      <button
        type="button"
        onClick={openPalette}
        aria-label="Search GigAI Tools"
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors md:hidden",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <Icon name="Search" size={20} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showClose={false}
          className="top-[10%] max-w-xl translate-y-0 gap-0 overflow-hidden border-border bg-popover p-0 shadow-2xl sm:top-[12%]"
        >
          <DialogTitle className="sr-only">Search GigAI Tools</DialogTitle>
          <DialogDescription className="sr-only">
            Search across every tool, guide, category and article on GigAI
            Tools. Type to see instant results, use the arrow keys to navigate,
            and press Enter to open.
          </DialogDescription>
          {/* Only mount the panel while open, so its chunk + the intent engine
              are requested lazily on first open rather than at page load. */}
          {open ? (
            <Suspense fallback={<PanelFallback />}>
              <CommandCenter onClose={close} />
            </Suspense>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Lightweight skeleton shown while the command-center chunk streams in. */
function PanelFallback() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-4">
        <Icon name="Search" size={18} className="shrink-0 text-muted-foreground" />
        <div className="h-12 flex-1" />
      </div>
      <ul className="space-y-1 p-2" aria-busy="true" aria-label="Loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-lg px-2.5 py-2">
            <span className="size-8 shrink-0 animate-pulse rounded-lg bg-muted" />
            <span className="flex-1 space-y-1.5">
              <span className="block h-3 w-2/5 animate-pulse rounded bg-muted" />
              <span className="block h-2.5 w-3/5 animate-pulse rounded bg-muted/70" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
