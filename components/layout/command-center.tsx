"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { AccentKey } from "@/types";
import { ROUTES } from "@/config/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import {
  clearSearchStats,
  getTopSearches,
  recordSearch,
} from "@/lib/usage/search-stats";
import { getPopularSlugs } from "@/lib/usage/store";
import {
  useFavorites,
  usePinned,
  useRecentTools,
} from "@/hooks/use-personalization";
import type {
  EverythingKind,
  EverythingResult,
} from "@/lib/assistant/types";
import type { ToolCard, Discovery } from "@/lib/assistant/intent";

/**
 * The GigAI command center: a Raycast/Linear-grade ⌘K palette.
 *
 * This component is LAZY-loaded by `<CommandSearch>` on first open, so the
 * heavy intent engine (which imports the registry) never lands in the initial
 * page bundle. It powers search with the assistant engine's `searchEverything`,
 * so it searches EVERYTHING, tools, categories, blogs, guides, comparisons,
 * collections, workflows and file-types: with synonyms, typo-tolerance and
 * grouped, highlighted results.
 *
 * Empty state shows DISCOVERY (recent, pinned, favorites, trending, popular,
 * new). There is no dead "No results": a miss still surfaces the closest tool
 * and related content from the engine. Tool rows expose QUICK ACTIONS (open,
 * pin, favorite, copy link, open guide) and the whole surface is keyboard-only
 * navigable with a roving `aria-activedescendant` listbox.
 */

/* ── Engine module shape (dynamically imported) ──────────────────────────── */

interface Engine {
  searchEverything: (
    query: string,
    ctx?: undefined,
    limit?: number,
  ) => EverythingResult[];
  resolveToolCards: (slugs: readonly string[], limit?: number) => ToolCard[];
  getDiscovery: (limit?: number) => Discovery;
}

/* ── Row model, a flat, keyboard-navigable list ─────────────────────────── */

type Row =
  | { kind: "everything"; id: string; item: EverythingResult }
  | { kind: "tool-card"; id: string; item: ToolCard; source: RailSource }
  | { kind: "query"; id: string; query: string };

type RailSource = "recent" | "pinned" | "favorite" | "popular" | "new";

/** Human labels + icons for each `EverythingKind`, for group headers/subtitles. */
const KIND_META: Record<EverythingKind, { label: string; group: string }> = {
  tool: { label: "Tool", group: "Tools" },
  category: { label: "Category", group: "Categories" },
  collection: { label: "Collection", group: "Collections" },
  workflow: { label: "Workflow", group: "Workflows" },
  "use-case": { label: "Use case", group: "Use cases" },
  guide: { label: "Guide", group: "Guides & how-tos" },
  comparison: { label: "Comparison", group: "Comparisons" },
  blog: { label: "Article", group: "From the blog" },
  "file-type": { label: "File type", group: "File types" },
};

/** Deterministic order the result groups render in. */
const GROUP_ORDER: EverythingKind[] = [
  "tool",
  "category",
  "collection",
  "workflow",
  "use-case",
  "file-type",
  "guide",
  "comparison",
  "blog",
];

/* ── Match highlighting ──────────────────────────────────────────────────── */

/** Split `text` around the first case-insensitive occurrence of `query`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-primary/15 px-0.5 text-foreground">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */

export interface CommandCenterProps {
  /** Called to close the surrounding dialog (Esc, navigate, etc.). */
  onClose: () => void;
}

export function CommandCenter({ onClose }: CommandCenterProps) {
  const router = useRouter();
  const listboxId = useId();

  const { recent, add: addRecentSearch, clear: clearRecentSearches } =
    useRecentSearches();
  // This browser's most-repeated successful searches (local analytics). Read
  // once per open: the palette mounts fresh each time it opens.
  const [popularSearches] = useState<string[]>(() =>
    getTopSearches(6).map((t) => t.query),
  );
  // Empty-state query suggestions: recent first, then the visitor's popular
  // searches (deduped, capped), so the palette teaches their own habits back.
  const querySuggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const q of [...recent, ...popularSearches]) {
      const k = q.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(q);
      if (out.length >= 8) break;
    }
    return out;
  }, [recent, popularSearches]);
  const clearSearches = useCallback(() => {
    clearRecentSearches();
    clearSearchStats();
  }, [clearRecentSearches]);
  const { slugs: recentToolSlugs } = useRecentTools();
  const { slugs: pinnedSlugs, toggle: togglePin } = usePinned();
  const { slugs: favoriteSlugs, toggle: toggleFav } = useFavorites();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedHref, setCopiedHref] = useState<string | null>(null);

  const debounced = useDebounce(query, 140);
  const trimmed = debounced.trim();
  const hasQuery = query.trim().length > 0;

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── Lazy-load the engine on mount (we only mount once open) ───────────── */

  const engineRef = useRef<Engine | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void import("@/lib/assistant/intent").then((mod) => {
      if (cancelled) return;
      engineRef.current = {
        searchEverything: mod.searchEverything,
        resolveToolCards: mod.resolveToolCards,
        getDiscovery: mod.getDiscovery,
      };
      setEngineReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Discovery (empty state), computed once the engine is ready ────────── */

  const discovery = useMemo<Discovery | null>(() => {
    if (!engineReady || !engineRef.current) return null;
    const base = engineRef.current.getDiscovery(6);
    // Personalize the "Popular" rail: this browser's most-used tools first
    // (local usage engine), padded with the editorial set, the same blend as
    // the homepage, so the palette reflects how THIS person actually works.
    const mine = engineRef.current.resolveToolCards(getPopularSlugs("all", 6), 6);
    if (mine.length === 0) return base;
    const seen = new Set(mine.map((c) => c.slug));
    const popular = [...mine, ...base.popular.filter((c) => !seen.has(c.slug))].slice(0, 6);
    return { ...base, popular };
  }, [engineReady]);

  // Resolve personalization slugs → validated cards (registry-free, via engine).
  const recentToolCards = useMemo<ToolCard[]>(
    () =>
      engineReady && engineRef.current
        ? engineRef.current.resolveToolCards(recentToolSlugs, 6)
        : [],
    [engineReady, recentToolSlugs],
  );
  const pinnedCards = useMemo<ToolCard[]>(
    () =>
      engineReady && engineRef.current
        ? engineRef.current.resolveToolCards(pinnedSlugs, 8)
        : [],
    [engineReady, pinnedSlugs],
  );
  const favoriteCards = useMemo<ToolCard[]>(
    () =>
      engineReady && engineRef.current
        ? engineRef.current.resolveToolCards(favoriteSlugs, 8)
        : [],
    [engineReady, favoriteSlugs],
  );

  /* ── Search results, recomputed on debounced query ─────────────────────── */

  const results = useMemo<EverythingResult[]>(() => {
    if (!trimmed || !engineReady || !engineRef.current) return [];
    return engineRef.current.searchEverything(trimmed, undefined, 24);
  }, [trimmed, engineReady]);

  // Local-first search analytics: record settled queries + their hit count
  // (only once the engine answered, so a loading engine never logs "0 hits").
  useEffect(() => {
    if (trimmed && engineReady) recordSearch(trimmed, results.length);
  }, [trimmed, engineReady, results.length]);

  /* ── Build grouped display + a flat roving row list for a11y ────────────── */

  const grouped = useMemo(() => {
    const byKind = new Map<EverythingKind, EverythingResult[]>();
    for (const r of results) {
      const bucket = byKind.get(r.kind) ?? [];
      bucket.push(r);
      byKind.set(r.kind, bucket);
    }
    return GROUP_ORDER.filter((k) => byKind.has(k)).map((kind) => ({
      kind,
      label: KIND_META[kind].group,
      items: byKind.get(kind) ?? [],
    }));
  }, [results]);

  // The flat, ordered row list drives keyboard navigation (index === activedescendant).
  const rows = useMemo<Row[]>(() => {
    if (hasQuery) {
      const out: Row[] = [];
      for (const group of grouped) {
        for (const item of group.items) {
          out.push({ kind: "everything", id: `${group.kind}:${item.href}`, item });
        }
      }
      return out;
    }
    // Empty state: recent searches + all discovery cards, in visual order.
    const out: Row[] = [];
    for (const q of querySuggestions)
      out.push({ kind: "query", id: `q:${q}`, query: q });
    const pushCards = (cards: ToolCard[], source: RailSource) => {
      for (const c of cards)
        out.push({ kind: "tool-card", id: `${source}:${c.slug}`, item: c, source });
    };
    pushCards(pinnedCards, "pinned");
    pushCards(favoriteCards, "favorite");
    pushCards(recentToolCards, "recent");
    if (discovery) {
      pushCards(discovery.popular, "popular");
      pushCards(discovery.fresh, "new");
    }
    return out;
  }, [hasQuery, grouped, querySuggestions, pinnedCards, favoriteCards, recentToolCards, discovery]);

  // Reset the highlight to the first row whenever the visible rows change.
  useEffect(() => {
    setActiveIndex(rows.length > 0 ? 0 : -1);
  }, [rows]);

  // Keep the active row scrolled into view.
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `#${cssEscape(listboxId)}-row-${activeIndex}`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId]);

  /* ── Navigation + actions ──────────────────────────────────────────────── */

  const navigate = useCallback(
    (href: string, label?: string) => {
      if (label) addRecentSearch(label);
      onClose();
      router.push(href);
    },
    [addRecentSearch, onClose, router],
  );

  const runQuery = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      addRecentSearch(q);
      onClose();
      router.push(`${ROUTES.search}?q=${encodeURIComponent(q)}`);
    },
    [addRecentSearch, onClose, router],
  );

  const copyLink = useCallback((href: string) => {
    const url =
      typeof window !== "undefined" ? new URL(href, window.location.origin).href : href;
    try {
      void navigator.clipboard?.writeText(url);
      setCopiedHref(href);
      window.setTimeout(() => setCopiedHref((h) => (h === href ? null : h)), 1400);
    } catch {
      /* clipboard unavailable, non-fatal */
    }
  }, []);

  const commitRow = useCallback(
    (row: Row) => {
      if (row.kind === "query") return runQuery(row.query);
      if (row.kind === "tool-card") return navigate(row.item.href, row.item.title);
      return navigate(row.item.href, row.item.kind === "tool" ? row.item.title : undefined);
    },
    [runQuery, navigate],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const n = rows.length;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((i) => (n === 0 ? -1 : (i + 1) % n));
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((i) => (n === 0 ? -1 : (i - 1 + n) % n));
          break;
        case "Home":
          if (n > 0) {
            event.preventDefault();
            setActiveIndex(0);
          }
          break;
        case "End":
          if (n > 0) {
            event.preventDefault();
            setActiveIndex(n - 1);
          }
          break;
        case "Enter": {
          event.preventDefault();
          const row = activeIndex >= 0 ? rows[activeIndex] : undefined;
          if (row) commitRow(row);
          else if (hasQuery) runQuery(query);
          break;
        }
        default:
          break;
      }
    },
    [rows, activeIndex, commitRow, hasQuery, runQuery, query],
  );

  // Map a row id → its flat index (for aria + hover sync).
  const rowIndex = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r, i) => m.set(r.id, i));
    return m;
  }, [rows]);

  const activeDescendant =
    activeIndex >= 0 && activeIndex < rows.length
      ? `${listboxId}-row-${activeIndex}`
      : undefined;

  const showEmpty = !hasQuery;
  const showNoStrongMatch = hasQuery && results.length > 0;

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="flex max-h-[70vh] flex-col overflow-hidden">
      {/* Search input row */}
      <div className="flex items-center gap-2.5 border-b border-border px-4">
        <Icon
          name="Search"
          size={18}
          className="shrink-0 text-muted-foreground"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          aria-label="Search everything"
          autoFocus
          value={query}
          placeholder="Search tools, guides, categories…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-12 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-md p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="X" size={16} />
          </button>
        ) : (
          <kbd className="hidden shrink-0 items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground sm:inline-flex">
            Esc
          </kbd>
        )}
      </div>

      {/* Results / discovery */}
      <div
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label="Results"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
      >
        {!engineReady ? (
          <LoadingRows />
        ) : showEmpty ? (
          <EmptyState
            recent={querySuggestions}
            onClearRecent={clearSearches}
            onRunQuery={runQuery}
            pinned={pinnedCards}
            favorites={favoriteCards}
            recentTools={recentToolCards}
            discovery={discovery}
            listboxId={listboxId}
            rowIndex={rowIndex}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onSelectCard={(c) => navigate(c.href, c.title)}
            onTogglePin={togglePin}
            onToggleFav={toggleFav}
            pinnedSlugs={pinnedSlugs}
            favoriteSlugs={favoriteSlugs}
            copiedHref={copiedHref}
            onCopy={copyLink}
          />
        ) : showNoStrongMatch ? (
          <div className="space-y-2">
            {grouped.map((group) => (
              <Group key={group.kind} label={group.label}>
                {group.items.map((item) => {
                  const id = `${group.kind}:${item.href}`;
                  const idx = rowIndex.get(id) ?? -1;
                  const slug = slugFromHref(item.href);
                  const isTool = item.kind === "tool";
                  return (
                    <EverythingRow
                      key={item.href}
                      domId={`${listboxId}-row-${idx}`}
                      item={item}
                      query={trimmed}
                      active={idx === activeIndex}
                      onHover={() => setActiveIndex(idx)}
                      onSelect={() => commitRow({ kind: "everything", id, item })}
                      onTogglePin={togglePin}
                      onToggleFav={toggleFav}
                      isPinned={isTool && pinnedSlugs.includes(slug)}
                      isFav={isTool && favoriteSlugs.includes(slug)}
                      copied={copiedHref === item.href}
                      onCopy={() => copyLink(item.href)}
                    />
                  );
                })}
              </Group>
            ))}
          </div>
        ) : (
          <NoResults query={query.trim()} onSearchAnyway={() => runQuery(query)} />
        )}
      </div>

      {/* Footer hint bar */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-3">
          <Hint keys={["↑", "↓"]} label="Navigate" />
          <Hint keys={["↵"]} label="Open" />
          <Hint keys={["Esc"]} label="Close" />
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <Icon name="Sparkles" size={12} className="text-primary" />
          GigAI search
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Rows & groups
 * ──────────────────────────────────────────────────────────────────────────── */

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-1.5">
      <div className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

interface EverythingRowProps {
  domId: string;
  item: EverythingResult;
  query: string;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
  onTogglePin: (slug: string) => void;
  onToggleFav: (slug: string) => void;
  isPinned: boolean;
  isFav: boolean;
  copied: boolean;
  onCopy: () => void;
}

function EverythingRow({
  domId,
  item,
  query,
  active,
  onHover,
  onSelect,
  onTogglePin,
  onToggleFav,
  isPinned,
  isFav,
  copied,
  onCopy,
}: EverythingRowProps) {
  const isTool = item.kind === "tool";
  const slug = slugFromHref(item.href);
  return (
    <li>
      <div
        id={domId}
        role="option"
        aria-selected={active}
        onMouseMove={onHover}
        onClick={onSelect}
        className={cn(
          "group/row flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 outline-none transition-colors",
          active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon name={item.icon} size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            <Highlight text={item.title} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {item.description}
          </span>
        </span>

        {/* Kind badge (fades out to reveal quick actions on the active/hovered row). */}
        <span
          className={cn(
            "hidden shrink-0 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block",
            active && "sm:hidden",
          )}
        >
          {KIND_META[item.kind].label}
        </span>

        {/* Quick actions - visible on the active row (or hover). */}
        <span
          className={cn(
            "shrink-0 items-center gap-0.5",
            active ? "flex" : "hidden group-hover/row:flex",
          )}
        >
          {isTool && (
            <QuickAction
              icon={isPinned ? "PinOff" : "Pin"}
              label={isPinned ? "Unpin" : "Pin"}
              onClick={() => onTogglePin(slug)}
              on={isPinned}
            />
          )}
          {isTool && (
            <QuickAction
              icon={isFav ? "Heart" : "Heart"}
              label={isFav ? "Unfavorite" : "Favorite"}
              onClick={() => onToggleFav(slug)}
              on={isFav}
              filled={isFav}
            />
          )}
          <QuickAction
            icon={copied ? "Check" : "Link"}
            label={copied ? "Copied" : "Copy link"}
            onClick={onCopy}
            on={copied}
          />
          <QuickAction icon="ArrowUpRight" label="Open" onClick={onSelect} />
        </span>
      </div>
    </li>
  );
}

/** A tiny icon button used inside a row for a quick action. Stops row-select. */
function QuickAction({
  icon,
  label,
  onClick,
  on = false,
  filled = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  on?: boolean;
  filled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md outline-none transition-colors",
        on
          ? "text-primary"
          : "text-muted-foreground hover:bg-background hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <Icon
        name={icon}
        size={15}
        className={cn(filled && "fill-current")}
      />
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Empty state (discovery)
 * ──────────────────────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  recent: string[];
  onClearRecent: () => void;
  onRunQuery: (q: string) => void;
  pinned: ToolCard[];
  favorites: ToolCard[];
  recentTools: ToolCard[];
  discovery: Discovery | null;
  listboxId: string;
  rowIndex: Map<string, number>;
  activeIndex: number;
  onHover: (i: number) => void;
  onSelectCard: (c: ToolCard) => void;
  onTogglePin: (slug: string) => void;
  onToggleFav: (slug: string) => void;
  pinnedSlugs: string[];
  favoriteSlugs: string[];
  copiedHref: string | null;
  onCopy: (href: string) => void;
}

function EmptyState(props: EmptyStateProps) {
  const {
    recent,
    onClearRecent,
    onRunQuery,
    pinned,
    favorites,
    recentTools,
    discovery,
    listboxId,
    rowIndex,
    activeIndex,
    onHover,
    onSelectCard,
    onTogglePin,
    onToggleFav,
    pinnedSlugs,
    favoriteSlugs,
    copiedHref,
    onCopy,
  } = props;

  const cardRow = (card: ToolCard, source: RailSource) => {
    const id = `${source}:${card.slug}`;
    const idx = rowIndex.get(id) ?? -1;
    const domId = `${listboxId}-row-${idx}`;
    const accent = accentStyle(card.accent as AccentKey | undefined);
    return (
      <li key={id}>
        <div
          id={domId}
          role="option"
          aria-selected={idx === activeIndex}
          onMouseMove={() => onHover(idx)}
          onClick={() => onSelectCard(card)}
          className={cn(
            "group/row flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 outline-none transition-colors",
            idx === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
          )}
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border/40",
              card.accent ? accent.soft : "bg-muted text-muted-foreground",
            )}
          >
            <Icon name={card.icon} size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {card.title}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {card.category}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 items-center gap-0.5",
              idx === activeIndex ? "flex" : "hidden group-hover/row:flex",
            )}
          >
            <QuickAction
              icon={pinnedSlugs.includes(card.slug) ? "PinOff" : "Pin"}
              label={pinnedSlugs.includes(card.slug) ? "Unpin" : "Pin"}
              on={pinnedSlugs.includes(card.slug)}
              onClick={() => onTogglePin(card.slug)}
            />
            <QuickAction
              icon="Heart"
              label={favoriteSlugs.includes(card.slug) ? "Unfavorite" : "Favorite"}
              on={favoriteSlugs.includes(card.slug)}
              filled={favoriteSlugs.includes(card.slug)}
              onClick={() => onToggleFav(card.slug)}
            />
            <QuickAction
              icon={copiedHref === card.href ? "Check" : "Link"}
              label={copiedHref === card.href ? "Copied" : "Copy link"}
              on={copiedHref === card.href}
              onClick={() => onCopy(card.href)}
            />
            <QuickAction icon="ArrowUpRight" label="Open" onClick={() => onSelectCard(card)} />
          </span>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-1">
      {recent.length > 0 && (
        <div className="pb-1">
          <div className="flex items-center justify-between px-2.5 pb-1 pt-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Recent &amp; popular searches
            </span>
            <button
              type="button"
              onClick={onClearRecent}
              className="rounded px-1 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear
            </button>
          </div>
          <ul className="space-y-0.5">
            {recent.map((q) => {
              const id = `q:${q}`;
              const idx = rowIndex.get(id) ?? -1;
              return (
                <li key={q}>
                  <div
                    id={`${listboxId}-row-${idx}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseMove={() => onHover(idx)}
                    onClick={() => onRunQuery(q)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors",
                      idx === activeIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/60",
                    )}
                  >
                    <Icon name="Clock" size={16} className="shrink-0 text-muted-foreground" />
                    <span className="truncate text-foreground">{q}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {pinned.length > 0 && (
        <RailGroup label="Pinned" icon="Pin">
          {pinned.map((c) => cardRow(c, "pinned"))}
        </RailGroup>
      )}
      {favorites.length > 0 && (
        <RailGroup label="Favorites" icon="Heart">
          {favorites.map((c) => cardRow(c, "favorite"))}
        </RailGroup>
      )}
      {recentTools.length > 0 && (
        <RailGroup label="Recently used" icon="History">
          {recentTools.map((c) => cardRow(c, "recent"))}
        </RailGroup>
      )}

      {/* Trending chips */}
      {discovery && discovery.trending.length > 0 && (
        <div className="px-1 pb-1 pt-1.5">
          <div className="px-1.5 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Trending
          </div>
          <div className="flex flex-wrap gap-1.5 px-1">
            {discovery.trending.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onRunQuery(q)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="TrendingUp" size={13} className="text-muted-foreground" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {discovery && discovery.popular.length > 0 && (
        <RailGroup label="Popular" icon="Flame">
          {discovery.popular.map((c) => cardRow(c, "popular"))}
        </RailGroup>
      )}
      {discovery && discovery.fresh.length > 0 && (
        <RailGroup label="New" icon="Sparkles">
          {discovery.fresh.map((c) => cardRow(c, "new"))}
        </RailGroup>
      )}
    </div>
  );
}

function RailGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-1">
      <div className="flex items-center gap-1.5 px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon name={icon} size={12} />
        {label}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Misc states
 * ──────────────────────────────────────────────────────────────────────────── */

function NoResults({
  query,
  onSearchAnyway,
}: {
  query: string;
  onSearchAnyway: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon name="SearchX" size={20} />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">
          Nothing matched “{query}”.
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Try a different word, or search the full library.
        </p>
      </div>
      <button
        type="button"
        onClick={onSearchAnyway}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Icon name="Search" size={15} />
        Search anyway
      </button>
    </div>
  );
}

function LoadingRows() {
  return (
    <ul className="space-y-1 p-1" aria-label="Loading" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg px-2.5 py-2"
        >
          <span className="size-8 shrink-0 animate-pulse rounded-lg bg-muted" />
          <span className="flex-1 space-y-1.5">
            <span className="block h-3 w-2/5 animate-pulse rounded bg-muted" />
            <span className="block h-2.5 w-3/5 animate-pulse rounded bg-muted/70" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted/50 px-1 py-0.5 font-sans text-[10px] font-medium leading-none text-muted-foreground"
        >
          {k}
        </kbd>
      ))}
      <span>{label}</span>
    </span>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

/** Tool routes are `/${slug}`, so the slug is the path's single segment. */
function slugFromHref(href: string): string {
  return href.replace(/^\//, "").split(/[/?#]/)[0] ?? "";
}

/** Minimal CSS.escape fallback for the `useId()` colon in querySelector. */
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}
