"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { useDebounce } from "@/hooks/use-debounce";
import { useRecentTools } from "@/hooks/use-personalization";
import type {
  AssistantResult,
  LinkRec,
  ToolRec,
} from "@/lib/assistant/types";
import type { ToolCard } from "@/lib/assistant/intent";
import { PROCESSING_META } from "./meta";

/**
 * The GigAI ASSISTANT panel, a local, search-first "product expert".
 *
 * It is NOT a chatbot: as the user types, it LAZY-imports the pure intent engine
 * (`@/lib/assistant/intent`): exactly how the search bar lazy-loads `lib/search`
 * - so the ~249 tool configs never enter the initial page bundle. Every result
 * is a real, validated tool/page (the engine guarantees zero hallucinations).
 *
 * Rendering order mirrors how a good expert answers: a SHORT answer line, then a
 * PRIMARY tool card with an "Open Tool" CTA, ALTERNATIVES, an optional guided
 * WORKFLOW, and related guides / blogs / comparisons for deeper reading. The
 * empty state surfaces popular questions, example queries and recent tools.
 *
 * Fully accessible: role="dialog", focus trap, Esc closes, arrow/Enter keyboard
 * nav over the primary + alternative rows, ARIA labels, reduced-motion aware.
 */

/* The shape of the engine module we lazy-load (typed, so no `any` leaks in). */
type IntentModule = typeof import("@/lib/assistant/intent");

export interface AssistantPanelProps {
  /** Whether the panel is mounted/visible. */
  open: boolean;
  /** Request close (backdrop click, Esc, close button). */
  onClose: () => void;
}

/** Flat list of keyboard-focusable tool rows (primary first, then alternatives). */
interface FocusRow {
  slug: string;
  href: string;
}

export function AssistantPanel({ open, onClose }: AssistantPanelProps) {
  const { slugs: recentSlugs } = useRecentTools();

  const titleId = useId();
  const inputId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<IntentModule | null>(null);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [engine, setEngine] = useState<IntentModule | null>(null);
  const [activeRow, setActiveRow] = useState(-1);

  const debounced = useDebounce(query, 180);
  const trimmed = debounced.trim();

  /* ── Lazy-load the intent engine on first interaction ─────────────────── */
  const ensureEngine = useCallback(async () => {
    if (engineRef.current) return engineRef.current;
    const mod = await import("@/lib/assistant/intent");
    engineRef.current = mod;
    setEngine(mod);
    return mod;
  }, []);

  // Warm the engine the moment the panel opens so the first keystroke is instant;
  // this still keeps it out of the initial page bundle.
  useEffect(() => {
    if (open) void ensureEngine();
  }, [open, ensureEngine]);

  // Resolve intent as the (debounced) query changes.
  useEffect(() => {
    if (!trimmed) {
      setResult(null);
      setActiveRow(-1);
      return;
    }
    let cancelled = false;
    void ensureEngine().then((mod) => {
      if (cancelled) return;
      const res = mod.resolveIntent(trimmed);
      setResult(res);
      setActiveRow(-1);
      track("assistant_query", {
        query: trimmed,
        intent: res.intentType,
        result: res.primary?.slug ?? null,
      });
      if (res.intentType === "none" || !res.primary) {
        track("assistant_no_result", { query: trimmed });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [trimmed, ensureEngine]);

  /* ── Empty-state suggestions (only need engine's static data) ─────────── */
  const popular = engine?.POPULAR_QUESTIONS ?? [];
  const examples = engine?.EXAMPLE_QUERIES ?? [];

  const recentTools = useMemo<ToolCard[]>(() => {
    if (!engine || recentSlugs.length === 0) return [];
    // The engine's purpose-built, registry-free helper: validates every slug and
    // preserves order: the correct primitive for personalization rails.
    return engine.resolveToolCards(recentSlugs, 4);
  }, [engine, recentSlugs]);

  /* ── Keyboard-focusable tool rows (primary + alternatives) ────────────── */
  const focusRows = useMemo<FocusRow[]>(() => {
    if (!result) return [];
    const rows: FocusRow[] = [];
    if (result.primary) rows.push({ slug: result.primary.slug, href: result.primary.href });
    for (const alt of result.alternatives) rows.push({ slug: alt.slug, href: alt.href });
    return rows;
  }, [result]);

  const onResultClick = useCallback(
    (slug: string, kind: string) => {
      track("assistant_result_click", { query: trimmed, slug, kind });
      onClose();
    },
    [trimmed, onClose],
  );

  /* ── Focus management: autofocus input, trap focus, restore on close ──── */
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(id);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Arrow navigation over the tool rows; Enter follows the active row.
      if (focusRows.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        setActiveRow((i) => {
          const next =
            event.key === "ArrowDown"
              ? (i + 1) % focusRows.length
              : (i <= 0 ? focusRows.length : i) - 1;
          return next;
        });
        return;
      }
      if (event.key === "Enter" && activeRow >= 0) {
        const row = focusRows[activeRow];
        if (row) {
          event.preventDefault();
          onResultClick(row.slug, "keyboard");
          window.location.assign(row.href);
        }
        return;
      }

      // Focus trap on Tab within the panel.
      if (event.key === "Tab") {
        const root = panelRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    [focusRows, activeRow, onResultClick, onClose],
  );

  const showEmpty = !trimmed || (result?.intentType === "none" && !result.primary);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-end sm:justify-end sm:p-4 md:p-6">
      {/* Backdrop - CSS enter animation (tw-animate-css), reduced-motion aware */}
      <button
        type="button"
        aria-label="Close assistant"
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none"
      />

      {/* Panel - bottom sheet on mobile, anchored card on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-popover text-popover-foreground shadow-2xl ring-1 ring-border",
          "rounded-t-2xl sm:max-h-[80vh] sm:w-[440px] sm:rounded-2xl",
          "animate-in fade-in slide-in-from-bottom-6 zoom-in-[0.98] duration-300 ease-out motion-reduce:animate-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="Sparkles" size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p id={titleId} className="text-sm font-semibold leading-tight">
              GigAI Assistant
            </p>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Describe your task, get the exact tool
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="X" size={17} />
          </button>
        </div>

        {/* Search input */}
        <div className="border-b border-border px-3 py-2.5">
          <label htmlFor={inputId} className="sr-only">
            Ask the assistant
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
            <Icon name="Search" size={16} className="text-muted-foreground" />
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={!showEmpty}
              aria-controls={`${inputId}-results`}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. shrink a PDF under 5 MB"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear"
                className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Body (scrolls) */}
        <div
          id={`${inputId}-results`}
          role="listbox"
          aria-label="Assistant results"
          className="flex-1 overflow-y-auto overscroll-contain px-3 py-3"
        >
          {showEmpty ? (
            <EmptyState
              popular={popular}
              examples={examples}
              recentTools={recentTools}
              onPick={(q) => {
                setQuery(q);
                inputRef.current?.focus();
              }}
              onToolClick={onResultClick}
            />
          ) : result ? (
            <ResultView
              result={result}
              activeRow={activeRow}
              onToolClick={onResultClick}
            />
          ) : (
            <LoadingRows />
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Icon name="ShieldCheck" size={12} />
            Local &amp; private. No AI, nothing sent
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <kbd className="rounded border border-border bg-muted px-1 font-mono">↑↓</kbd>
            <kbd className="rounded border border-border bg-muted px-1 font-mono">Esc</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Result view
 * ════════════════════════════════════════════════════════════════════════ */

function ResultView({
  result,
  activeRow,
  onToolClick,
}: {
  result: AssistantResult;
  activeRow: number;
  onToolClick: (slug: string, kind: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Expert answer line */}
      {result.answer ? (
        <p className="text-[13px] leading-relaxed text-foreground/90">
          {result.answer}
        </p>
      ) : null}

      {/* Primary tool card */}
      {result.primary ? (
        <PrimaryCard
          tool={result.primary}
          active={activeRow === 0}
          onClick={() => onToolClick(result.primary!.slug, "primary")}
        />
      ) : null}

      {/* Alternatives */}
      {result.alternatives.length > 0 ? (
        <section aria-label="Alternatives" className="flex flex-col gap-1.5">
          <SectionLabel icon="Shuffle">Also works</SectionLabel>
          <div className="flex flex-col gap-1">
            {result.alternatives.map((alt, i) => (
              <AltRow
                key={alt.slug}
                tool={alt}
                active={activeRow === i + 1}
                onClick={() => onToolClick(alt.slug, "alternative")}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Workflow */}
      {result.workflow ? (
        <WorkflowCard
          workflow={result.workflow}
          onStart={() => onToolClick(result.workflow!.slug, "workflow")}
        />
      ) : null}

      {/* Cross-links: guides / comparisons / blogs */}
      {result.guides.length + result.comparisons.length + result.blogs.length > 0 ? (
        <section aria-label="Learn more" className="flex flex-col gap-1.5">
          <SectionLabel icon="BookOpen">Learn more</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {[...result.guides, ...result.comparisons, ...result.blogs].map((link) => (
              <CrossLink key={link.href} link={link} onClick={() => onToolClick(link.href, "link")} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

/* ── Primary tool card: the hero of the answer ───────────────────────────── */
function PrimaryCard({
  tool,
  active,
  onClick,
}: {
  tool: ToolRec;
  active: boolean;
  onClick: () => void;
}) {
  const proc = PROCESSING_META[tool.processing];
  return (
    <div
      role="option"
      aria-selected={active}
      className={cn(
        "group relative rounded-xl border bg-card p-3.5 transition-colors",
        active ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name="Wrench" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{tool.title}</h3>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {tool.category.replace(/-/g, " ")}
              </p>
            </div>
            <Badge className={proc.className} icon={proc.icon} title={proc.hint}>
              {proc.label}
            </Badge>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
            {tool.why}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Icon name="Clock" size={12} /> {tool.estTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="Gauge" size={12} /> {tool.difficulty}
            </span>
          </div>
        </div>
      </div>

      <Link
        href={tool.href}
        onClick={onClick}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        Open Tool
        <Icon name="ArrowRight" size={15} />
      </Link>
    </div>
  );
}

/* ── Alternative row ──────────────────────────────────────────────────────── */
function AltRow({
  tool,
  active,
  onClick,
}: {
  tool: ToolRec;
  active: boolean;
  onClick: () => void;
}) {
  const proc = PROCESSING_META[tool.processing];
  return (
    <Link
      href={tool.href}
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
        active
          ? "border-primary bg-accent"
          : "border-transparent hover:border-border hover:bg-accent",
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon name="Wrench" size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{tool.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{tool.why}</p>
      </div>
      <Badge className={proc.className} icon={proc.icon} title={proc.hint} compact>
        {proc.label}
      </Badge>
      <Icon name="ArrowRight" size={14} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}

/* ── Workflow card ────────────────────────────────────────────────────────── */
function WorkflowCard({
  workflow,
  onStart,
}: {
  workflow: NonNullable<AssistantResult["workflow"]>;
  onStart: () => void;
}) {
  return (
    <section
      aria-label="Guided workflow"
      className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3.5"
    >
      <div className="flex items-center gap-2">
        <Icon name="Route" size={15} className="text-primary" />
        <h3 className="text-sm font-semibold">{workflow.title}</h3>
      </div>
      <ol className="mt-2.5 flex flex-col gap-0.5">
        {workflow.steps.map((step, i) => (
          <li key={step.slug + i}>
            <Link
              href={step.href}
              onClick={onStart}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary tabular-nums">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px]">{step.title}</span>
              <Icon name="ChevronRight" size={13} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href={workflow.href}
        onClick={onStart}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Start Workflow
        <Icon name="ArrowRight" size={15} />
      </Link>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Empty state
 * ════════════════════════════════════════════════════════════════════════ */

function EmptyState({
  popular,
  examples,
  recentTools,
  onPick,
  onToolClick,
}: {
  popular: readonly { q: string; slug: string }[];
  examples: readonly string[];
  recentTools: ToolCard[];
  onPick: (q: string) => void;
  onToolClick: (slug: string, kind: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {recentTools.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <SectionLabel icon="History">Recent tools</SectionLabel>
          <div className="flex flex-col gap-1">
            {recentTools.map((card) => (
              <ToolCardRow
                key={card.slug}
                card={card}
                onClick={() => onToolClick(card.slug, "recent")}
              />
            ))}
          </div>
        </section>
      ) : null}

      {popular.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <SectionLabel icon="Star">Popular questions</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {popular.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onPick(item.q)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="CornerDownRight" size={13} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">{item.q}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {examples.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <SectionLabel icon="Lightbulb">Try asking</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {examples.slice(0, 8).map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => onPick(ex)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ex}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Small shared pieces
 * ════════════════════════════════════════════════════════════════════════ */

function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon name={icon} size={12} />
      {children}
    </p>
  );
}

function Badge({
  className,
  icon,
  title,
  compact = false,
  children,
}: {
  className: string;
  icon: string;
  title: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-medium",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        className,
      )}
    >
      <Icon name={icon} size={compact ? 10 : 12} />
      {children}
    </span>
  );
}

/** A slim recent/personalization row (registry-free ToolCard, no ToolRec needed). */
function ToolCardRow({ card, onClick }: { card: ToolCard; onClick: () => void }) {
  return (
    <Link
      href={card.href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon name={card.icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{card.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{card.category}</p>
      </div>
      <Icon name="ArrowRight" size={14} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}

function CrossLink({ link, onClick }: { link: LinkRec; onClick: () => void }) {
  return (
    <Link
      href={link.href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name={link.icon} size={13} className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-[13px]">{link.title}</span>
      <Icon name="ArrowUpRight" size={12} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
