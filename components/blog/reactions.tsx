"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface ReactionsProps {
  /** Post slug, namespaces the localStorage keys. */
  slug: string;
  /** Max claps a single visitor can add (personal, honest. Not a global count). */
  maxClaps?: number;
  className?: string;
}

const CLAP_KEY = (slug: string) => `gigai:blog:claps:${slug}`;
const SAVE_KEY = (slug: string) => `gigai:blog:saved:${slug}`;

function readNumber(key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * A clap button and a bookmark button, each persisted to localStorage for THIS
 * visitor only. We never fabricate a global count. The number shown is the
 * visitor's own claps, capped at `maxClaps`.
 */
export function Reactions({ slug, maxClaps = 50, className }: ReactionsProps) {
  const [claps, setClaps] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const [burst, setBurst] = React.useState(0);

  React.useEffect(() => {
    setClaps(Math.min(readNumber(CLAP_KEY(slug)), maxClaps));
    setSaved(window.localStorage.getItem(SAVE_KEY(slug)) === "1");
    setHydrated(true);
  }, [slug, maxClaps]);

  const addClap = React.useCallback(() => {
    setClaps((prev) => {
      const next = Math.min(prev + 1, maxClaps);
      if (next !== prev) window.localStorage.setItem(CLAP_KEY(slug), String(next));
      return next;
    });
    setBurst((b) => b + 1);
  }, [slug, maxClaps]);

  const toggleSave = React.useCallback(() => {
    setSaved((prev) => {
      const next = !prev;
      if (next) window.localStorage.setItem(SAVE_KEY(slug), "1");
      else window.localStorage.removeItem(SAVE_KEY(slug));
      return next;
    });
  }, [slug]);

  const clapped = claps > 0;
  const maxed = claps >= maxClaps;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={addClap}
        disabled={maxed}
        aria-pressed={clapped}
        aria-label={
          maxed
            ? `You gave the maximum ${maxClaps} claps`
            : clapped
              ? `You clapped ${claps} times, clap again`
              : "Clap for this article"
        }
        className={cn(
          "group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          clapped
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
          maxed ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5 active:translate-y-0",
        )}
      >
        <span className="relative inline-flex">
          <Icon
            name="Heart"
            size={16}
            className={cn(
              "transition-transform motion-reduce:transition-none group-active:scale-90",
              clapped && "fill-current",
            )}
          />
          {/* Burst pulse on each clap (skipped for reduced motion). */}
          {burst > 0 ? (
            <span
              key={burst}
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:hidden"
            />
          ) : null}
        </span>
        <span className="tabular-nums">
          {hydrated && claps > 0 ? claps : "Clap"}
        </span>
      </button>

      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={saved ? "Remove bookmark" : "Save for later"}
        className={cn(
          "group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "hover:-translate-y-0.5 active:translate-y-0",
          saved
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
        )}
      >
        <Icon
          name="Bookmark"
          size={16}
          className={cn(
            "transition-transform motion-reduce:transition-none group-active:scale-90",
            saved && "fill-current",
          )}
        />
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
