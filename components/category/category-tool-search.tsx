"use client";

import * as React from "react";

import type { Tool, ToolCardData } from "@/types";
import { cn, pluralize } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { ToolGrid } from "@/components/shared/tool-grid";

/**
 * Card fields + the searchable keywords. This is a client island, so its
 * `tools` prop is serialised into the page, the server must pass this slim
 * shape (see `toToolCardData`), never full registry Tools.
 */
export type SearchableTool = ToolCardData & Pick<Tool, "keywords">;

export interface CategoryToolSearchProps {
  /** All tools in this category (pre-filtered + slimmed by the server). */
  tools: SearchableTool[];
  categoryName: string;
}

/**
 * Client island: an instant, in-page filter over a single category's tools.
 * Matches the query against each tool's title, description and keywords. The
 * surrounding category page stays a server component. Only this box is client.
 */
export function CategoryToolSearch({
  tools,
  categoryName,
}: CategoryToolSearchProps) {
  const [query, setQuery] = React.useState("");

  const normalized = query.trim().toLowerCase();

  const filtered = React.useMemo(() => {
    if (!normalized) return tools;
    return tools.filter((tool) => {
      const haystack = [
        tool.title,
        tool.description,
        ...(tool.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [tools, normalized]);

  const inputId = "category-tool-search";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor={inputId} className="sr-only">
            Search {categoryName.toLowerCase()}
          </label>
          <Icon
            name="Search"
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${categoryName.toLowerCase()}…`}
            autoComplete="off"
            className="h-11 pl-9"
          />
        </div>

        <p
          aria-live="polite"
          className={cn(
            "text-sm text-muted-foreground",
            normalized ? "opacity-100" : "opacity-0 sm:opacity-100",
          )}
        >
          {normalized
            ? `${pluralize(filtered.length, "match", "es")} for “${query.trim()}”`
            : `${pluralize(tools.length, "tool")} available`}
        </p>
      </div>

      <ToolGrid
        tools={filtered}
        columns={3}
        emptyMessage={`No ${categoryName.toLowerCase()} match “${query.trim()}”. Try a different search.`}
      />
    </div>
  );
}
