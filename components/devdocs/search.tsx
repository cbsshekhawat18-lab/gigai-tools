"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Docs search: keyboard-first (Cmd/Ctrl-K), instant, grouped. The index is
 * built server-side from the same sources as the pages (engine manifest,
 * error data, page list) and passed in as a prop - typing an option name
 * like "level" or "target_kb" finds the tool that owns it.
 */

export type SearchItem = {
  label: string;
  href: string;
  group: string;
  keywords?: string;
};

export function DocsSearch({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items.slice(0, 12);
    return items
      .filter((it) =>
        (it.label + " " + (it.keywords ?? "") + " " + it.group).toLowerCase().includes(needle),
      )
      .slice(0, 20);
  }, [q, items]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded border border-border bg-card px-3 py-1.5 text-left text-sm text-muted-foreground hover:border-foreground/30"
      >
        <span>Search docs</span>
        <kbd className="rounded border border-border px-1.5 font-mono text-[10px]">⌘K</kbd>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 pt-[10vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto max-w-lg overflow-hidden rounded border border-border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCursor((c) => Math.min(c + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCursor((c) => Math.max(c - 1, 0));
                } else if (e.key === "Enter" && results[cursor]) {
                  go(results[cursor].href);
                }
              }}
              placeholder="Tools, options, error codes, pages..."
              className="w-full border-b border-border bg-background px-4 py-3 text-sm text-foreground outline-none"
            />
            <ul className="max-h-[50vh] overflow-y-auto py-1">
              {results.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted-foreground">Nothing matches.</li>
              ) : (
                results.map((r, i) => (
                  <li key={r.href + r.label}>
                    <button
                      type="button"
                      onClick={() => go(r.href)}
                      onMouseEnter={() => setCursor(i)}
                      className={`flex w-full items-baseline justify-between px-4 py-2 text-left text-sm ${
                        i === cursor ? "bg-muted/60 text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span>{r.label}</span>
                      <span className="ml-3 shrink-0 text-[11px] uppercase tracking-wide opacity-60">
                        {r.group}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
