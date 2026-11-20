"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { SearchResult, SearchResultKind } from "@/types";
import { cn, pluralize } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { EmptyState } from "@/components/shared/empty-state";

interface SearchResultsProps {
  query: string;
}

/** Section order + human labels for the grouped result kinds. */
const GROUPS: { kind: SearchResultKind; label: string }[] = [
  { kind: "tool", label: "Tools" },
  { kind: "category", label: "Categories" },
  { kind: "article", label: "Articles" },
];

const KIND_ICON: Record<SearchResultKind, string> = {
  tool: "Wrench",
  category: "LayoutGrid",
  article: "FileText",
};

/**
 * Full-page search results, grouped by kind with per-group counts. The registry
 * search index is loaded LAZILY (dynamic import) so the full tool registry stays
 * out of the initial /search bundle; results appear a beat after the query
 * resolves. Shows a friendly EmptyState when nothing matches.
 */
export function SearchResults({ query }: SearchResultsProps) {
  const trimmed = query.trim();

  const [all, setAll] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trimmed) {
      setAll([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void import("@/lib/search").then((mod) => {
      if (cancelled) return;
      setAll(mod.searchAll(trimmed, 60));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  const byKind = useMemo(() => {
    const map = new Map<SearchResultKind, SearchResult[]>();
    for (const result of all) {
      const list = map.get(result.kind) ?? [];
      list.push(result);
      map.set(result.kind, list);
    }
    return map;
  }, [all]);

  if (!trimmed) {
    return (
      <EmptyState
        icon="Search"
        title="Start typing to search"
        description="Search across every tool and category on GigAI Tools, results appear instantly."
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-10" role="status" aria-live="polite">
        <p className="text-sm text-muted-foreground">Searching&hellip;</p>
        <div>
          <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" aria-hidden="true" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <span className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                <span className="min-w-0 flex-1 space-y-2 py-0.5">
                  <span className="block h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <span className="block h-3 w-full animate-pulse rounded bg-muted" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (all.length === 0) {
    return (
      <EmptyState
        icon="SearchX"
        title={`No results for “${trimmed}”`}
        description="Try a different keyword, or browse tools by category from the menu above."
      />
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {pluralize(all.length, "result")} for{" "}
        <span className="font-medium text-foreground">&ldquo;{trimmed}&rdquo;</span>
      </p>

      {GROUPS.map(({ kind, label }) => {
        const items = byKind.get(kind);
        if (!items || items.length === 0) return null;
        return (
          <section key={kind} aria-labelledby={`search-group-${kind}`}>
            <h2
              id={`search-group-${kind}`}
              className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {label}{" "}
              <span className="ml-1 font-normal text-muted-foreground">
                ({items.length})
              </span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((result) => (
                <li key={result.href}>
                  <ResultLink result={result} kind={kind} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ResultLink({ result, kind }: { result: SearchResult; kind: SearchResultKind }) {
  return (
    <Link
      href={result.href}
      className={cn(
        "group flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon name={result.icon || KIND_ICON[kind]} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <span className="truncate">{result.title}</span>
          <Icon
            name="ArrowUpRight"
            size={14}
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
          {result.description}
        </span>
      </span>
    </Link>
  );
}
