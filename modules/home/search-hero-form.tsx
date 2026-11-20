"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ROUTES } from "@/config/constants";

/**
 * The hero's search form. A plain GET form to /search (works before hydration,
 * static-export friendly); after hydration we route client-side and autofocus
 * on desktop only - autofocusing on mobile pops the keyboard over the page,
 * which is hostile, so the spec's "autofocused on desktop" is taken literally.
 *
 * Sizing per spec: at least 64px tall, 20px text.
 */
export function HeroSearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <form
      action={ROUTES.search}
      method="get"
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        const q = inputRef.current?.value.trim();
        if (!q) return; // let an empty submit land on /search itself
        event.preventDefault();
        router.push(`${ROUTES.search}?q=${encodeURIComponent(q)}`);
      }}
    >
      <Icon
        name="Search"
        size={22}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        aria-label="Search all tools"
        placeholder="compress a pdf, resize an image, make a qr code…"
        autoComplete="off"
        className="h-16 w-full rounded-lg border-2 border-border bg-card pl-14 pr-32 text-xl text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1/2 inline-flex h-11 -translate-y-1/2 items-center gap-1.5 rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Search
      </button>
    </form>
  );
}
