"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { SearchResult } from "@/types";
import { ROUTES, TRENDING_SEARCHES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { useDebounce } from "@/hooks/use-debounce";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { recordSearch } from "@/lib/usage/search-stats";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  className?: string;
  variant?: "inline" | "hero";
  placeholder?: string;
  autoFocus?: boolean;
  /** Prefill the input (e.g. the ?q= param on /search). */
  defaultValue?: string;
  /**
   * Open the suggestions panel on bare focus (default). The /search page
   * turns this off: it renders results below the input, and the empty-state
   * Recent/Trending popover was covering them on mobile the moment the
   * autofocused input mounted. There the panel opens only when typing.
   */
  openOnFocus?: boolean;
}

/** A flat, keyboard-navigable list of the panel's interactive rows. */
type PanelRow =
  | { type: "result"; result: SearchResult }
  | { type: "query"; query: string };

const KIND_ICON: Record<SearchResult["kind"], string> = {
  tool: "Wrench",
  category: "LayoutGrid",
  article: "FileText",
};

/**
 * Instant, client-side search. Debounces input, queries the static registry via
 * searchAll, and renders a grouped results panel. With an empty query it shows
 * recent searches and trending chips. Fully keyboard accessible (arrow keys,
 * Enter, Escape) with click-outside dismissal.
 */
/** Rotating example searches shown in the empty-state placeholder. */
const SEARCH_EXAMPLES = [
  "compress pdf",
  "image resizer",
  "json formatter",
  "qr code generator",
  "svg optimizer",
  "video to gif",
  "mp3 converter",
  "merge pdf",
  "word to pdf",
];

export function SearchBar({
  className,
  variant = "inline",
  placeholder = "Search tools, tasks, formats…",
  autoFocus = false,
  defaultValue = "",
  openOnFocus = true,
}: SearchBarProps) {
  const router = useRouter();
  const { recent, add } = useRecentSearches();

  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounced = useDebounce(query, 200);
  const trimmed = debounced.trim();

  // Rotating example-search placeholder, cycles through real tool queries while
  // the field is empty, pauses while typing, and respects reduced-motion (then
  // it falls back to the static `placeholder`).
  const [exampleIndex, setExampleIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  useEffect(() => {
    if (reduceMotion || query.length > 0) return;
    const id = window.setInterval(
      () => setExampleIndex((i) => (i + 1) % SEARCH_EXAMPLES.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, query]);
  const activePlaceholder =
    query.length === 0 && !reduceMotion
      ? `Search “${SEARCH_EXAMPLES[exampleIndex] ?? "compress pdf"}”…`
      : placeholder;

  // The search index imports the full tool registry, so we load it LAZILY on
  // first interaction (dynamic import), keeping it out of the initial bundle
  // for the home hero and /search page. Results compute once the index is ready.
  const searchFnRef = useRef<
    ((q: string, limit?: number) => SearchResult[]) | null
  >(null);
  const ensureSearch = useCallback(async () => {
    if (searchFnRef.current) return searchFnRef.current;
    const mod = await import("@/lib/search");
    searchFnRef.current = mod.searchAll;
    return mod.searchAll;
  }, []);

  const [results, setResults] = useState<SearchResult[]>([]);
  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      return;
    }
    let cancelled = false;
    void ensureSearch().then((fn) => {
      if (cancelled) return;
      const next = fn(trimmed, 8);
      setResults(next);
      // Local-first search analytics (input is debounced; the store sweeps
      // keystroke prefixes so settled queries win). Nothing leaves the device.
      recordSearch(trimmed, next.length);
    });
    return () => {
      cancelled = true;
    };
  }, [trimmed, ensureSearch]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const hasQuery = query.trim().length > 0;

  // Group results by kind for display while keeping a flat row list for a11y.
  const toolResults = useMemo(() => results.filter((r) => r.kind === "tool"), [results]);
  const problemResults = useMemo(
    () => results.filter((r) => r.kind === "article"),
    [results],
  );
  const categoryResults = useMemo(
    () => results.filter((r) => r.kind === "category"),
    [results],
  );

  const rows = useMemo<PanelRow[]>(() => {
    if (hasQuery) return results.map((result) => ({ type: "result", result }));
    return recent.map((q) => ({ type: "query", query: q }));
  }, [hasQuery, results, recent]);

  // Reset the active highlight whenever the visible rows change.
  useEffect(() => {
    setActiveIndex(-1);
  }, [rows]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const submitQuery = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      // If the query exactly names a tool (a recent "Crop Image", a trending
      // "compress pdf"…), open that tool directly, a real route change that
      // always renders, instead of pushing /search?q=. On the static export a
      // same-page query change can be missed by the results island, so it looked
      // like "no results". Non-tool queries still go to the search page.
      let href = `${ROUTES.search}?q=${encodeURIComponent(q)}`;
      try {
        const fn = await ensureSearch();
        const exact = fn(q, 5).find(
          (r) => r.kind === "tool" && r.title.toLowerCase() === q.toLowerCase(),
        );
        if (exact) href = exact.href;
      } catch {
        /* fall back to the search page */
      }
      add(q);
      close();
      router.push(href);
    },
    [ensureSearch, add, close, router],
  );

  const goToResult = useCallback(
    (result: SearchResult) => {
      add(result.title);
      close();
      router.push(result.href);
    },
    [add, close, router],
  );

  const commitRow = useCallback(
    (row: PanelRow) => {
      if (row.type === "result") goToResult(row.result);
      else submitQuery(row.query);
    },
    [goToResult, submitQuery],
  );

  // Close on outside click/tap (touchstart too - iOS taps on non-interactive
  // areas don't reliably produce mousedown).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, close]);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (rows.length === 0 ? -1 : (i + 1) % rows.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (rows.length === 0 ? -1 : (i - 1 + rows.length) % rows.length));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const active = activeIndex >= 0 ? rows[activeIndex] : undefined;
      if (active) commitRow(active);
      else submitQuery(query);
    }
  }

  const isHero = variant === "hero";
  const showPanel = open;

  return (
    <div
      ref={containerRef}
      className={cn("relative z-50 w-full", isHero ? "max-w-2xl" : "max-w-md", className)}
    >
      <div className="relative">
        <Icon
          name="Search"
          size={isHero ? 22 : 18}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
            isHero ? "left-5" : "left-3.5",
          )}
        />
        <Input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-row-${activeIndex}` : undefined
          }
          autoFocus={autoFocus}
          value={query}
          placeholder={activePlaceholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (openOnFocus) setOpen(true);
            void ensureSearch();
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "pl-11",
            isHero
              ? "h-14 rounded-2xl pl-14 pr-4 text-base shadow-lg shadow-primary/5 md:text-base"
              : "h-11 rounded-xl",
          )}
        />
      </div>

      {showPanel && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className={cn(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          <div className="max-h-[22rem] overflow-y-auto p-2">
            {hasQuery ? (
              results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matches for &ldquo;{query.trim()}&rdquo;. Press Enter to search anyway.
                </p>
              ) : (
                <>
                  {toolResults.length > 0 && (
                    <ResultGroup label="Tools">
                      {toolResults.map((result) => {
                        const idx = rows.findIndex(
                          (r) => r.type === "result" && r.result.href === result.href,
                        );
                        return (
                          <ResultRow
                            key={result.href}
                            id={`${listboxId}-row-${idx}`}
                            result={result}
                            active={idx === activeIndex}
                            onSelect={() => goToResult(result)}
                            onHover={() => setActiveIndex(idx)}
                          />
                        );
                      })}
                    </ResultGroup>
                  )}
                  {problemResults.length > 0 && (
                    <ResultGroup label="Problem solvers">
                      {problemResults.map((result) => {
                        const idx = rows.findIndex(
                          (r) => r.type === "result" && r.result.href === result.href,
                        );
                        return (
                          <ResultRow
                            key={result.href}
                            id={`${listboxId}-row-${idx}`}
                            result={result}
                            active={idx === activeIndex}
                            onSelect={() => goToResult(result)}
                            onHover={() => setActiveIndex(idx)}
                          />
                        );
                      })}
                    </ResultGroup>
                  )}
                  {categoryResults.length > 0 && (
                    <ResultGroup label="Categories">
                      {categoryResults.map((result) => {
                        const idx = rows.findIndex(
                          (r) => r.type === "result" && r.result.href === result.href,
                        );
                        return (
                          <ResultRow
                            key={result.href}
                            id={`${listboxId}-row-${idx}`}
                            result={result}
                            active={idx === activeIndex}
                            onSelect={() => goToResult(result)}
                            onHover={() => setActiveIndex(idx)}
                          />
                        );
                      })}
                    </ResultGroup>
                  )}
                </>
              )
            ) : (
              <div className="space-y-3 p-1">
                {recent.length > 0 && (
                  <div>
                    <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">
                      Recent
                    </p>
                    <ul className="space-y-0.5">
                      {recent.map((q, i) => (
                        <li key={q}>
                          <button
                            type="button"
                            id={`${listboxId}-row-${i}`}
                            role="option"
                            aria-selected={i === activeIndex}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => submitQuery(q)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                              i === activeIndex
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground",
                            )}
                          >
                            <Icon name="Clock" size={16} className="text-muted-foreground" />
                            <span className="truncate">{q}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">
                    Trending
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {TRENDING_SEARCHES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => submitQuery(q)}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Icon name="TrendingUp" size={13} className="text-muted-foreground" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-1">
      <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

interface ResultRowProps {
  id: string;
  result: SearchResult;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function ResultRow({ id, result, active, onSelect, onHover }: ResultRowProps) {
  return (
    <li>
      <button
        type="button"
        id={id}
        role="option"
        aria-selected={active}
        onMouseEnter={onHover}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
          active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon name={result.icon || KIND_ICON[result.kind]} size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{result.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {result.description}
          </span>
        </span>
        <Icon
          name="ArrowUpRight"
          size={15}
          className="ml-auto shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
    </li>
  );
}
