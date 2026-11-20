"use client";

/**
 * EPUB Viewer, a premium, private in-browser e-reader.
 *
 * Drop an .epub and read it in a paginated, book-like rendition. We open the
 * book with the engine's `openEpub` (metadata + table of contents + the
 * underlying epubjs Book), then drive `book.renderTo` directly so we get full
 * reader control: next/previous page turns, table-of-contents jumps, adjustable
 * font size, and light / sepia / dark themes.
 *
 * Everything runs on-device; epubjs is lazy-imported by the engine and the
 * archive is parsed and rendered in memory. Nothing is uploaded.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import type { Book, Rendition } from "epubjs";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Field, SegmentedControl, StatBadge } from "@/components/tool/dev";
import { DocumentDropzone, type DetectedFile } from "@/components/tool/document";
import { openEpub, type EpubMetadata, type EpubTocEntry } from "@/lib/document-tools/epub";

/* ── Reading options ──────────────────────────────────────────────────────── */

type ThemeKey = "light" | "sepia" | "dark";

const THEMES: ReadonlyArray<{ value: ThemeKey; label: string; icon: string }> = [
  { value: "light", label: "Light", icon: "Sun" },
  { value: "sepia", label: "Sepia", icon: "BookOpen" },
  { value: "dark", label: "Dark", icon: "Moon" },
];

/** Page + ink colors injected into the rendition body for each theme. */
const THEME_COLORS: Record<ThemeKey, { bg: string; fg: string; link: string }> = {
  light: { bg: "#ffffff", fg: "#1a1a1a", link: "#b45309" },
  sepia: { bg: "#faf4e6", fg: "#3a2f1c", link: "#9a3412" },
  dark: { bg: "#16161a", fg: "#e6e6e6", link: "#fbbf24" },
};

const FONT_MIN = 80;
const FONT_MAX = 160;
const FONT_STEP = 10;

/* ── Component ────────────────────────────────────────────────────────────── */

export default function EpubViewerTool({ tool: _tool }: { tool: WorkspaceToolData }) {
  const [selected, setSelected] = React.useState<DetectedFile | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [metadata, setMetadata] = React.useState<EpubMetadata | null>(null);
  const [toc, setToc] = React.useState<EpubTocEntry[]>([]);
  const [chapterCount, setChapterCount] = React.useState(0);

  const [theme, setTheme] = React.useState<ThemeKey>("light");
  const [fontSize, setFontSize] = React.useState(100); // percent
  const [tocOpen, setTocOpen] = React.useState(true);
  const [progress, setProgress] = React.useState(0); // 0..1

  const viewerRef = React.useRef<HTMLDivElement | null>(null);
  const bookRef = React.useRef<Book | null>(null);
  const renditionRef = React.useRef<Rendition | null>(null);

  /* Apply the active theme's colors + font size to the live rendition. */
  const applyStyles = React.useCallback(
    (t: ThemeKey, fs: number) => {
      const rendition = renditionRef.current;
      if (!rendition) return;
      const c = THEME_COLORS[t];
      rendition.themes.override("color", c.fg, true);
      rendition.themes.override("background", c.bg, true);
      // Style anchors + images without clobbering the book's own layout.
      rendition.themes.register("gk-theme", {
        body: { color: `${c.fg} !important`, background: `${c.bg} !important` },
        a: { color: `${c.link} !important` },
        "a:link, a:visited": { color: `${c.link} !important` },
        img: { "max-width": "100% !important", height: "auto !important" },
        "::selection": { background: "rgba(180,131,9,0.28)" },
      });
      rendition.themes.select("gk-theme");
      rendition.themes.fontSize(`${fs}%`);
    },
    [],
  );

  /* Open the dropped file: metadata + toc via the engine, then mount a live
     rendition we control directly. */
  const openFile = React.useCallback(
    async (detected: DetectedFile) => {
      setLoading(true);
      setError(null);
      // Tear down any previous book/rendition first.
      renditionRef.current?.destroy();
      renditionRef.current = null;
      bookRef.current?.destroy();
      bookRef.current = null;

      const res = await openEpub(detected.file);
      if (!res.ok) {
        setError(
          `Couldn't open this EPUB. ${res.error}, the file may be DRM-protected, corrupted, or not a valid.epub.`,
        );
        setLoading(false);
        setMetadata(null);
        setToc([]);
        return;
      }

      const opened = res.result;
      setMetadata(opened.metadata);
      setToc(opened.toc);
      setChapterCount(opened.chapterCount);
      bookRef.current = opened.book;
      setLoading(false);
    },
    [],
  );

  /* Mount the rendition once the viewer element is on screen and a book is
     loaded. Re-runs when a new book is opened. */
  React.useEffect(() => {
    const book = bookRef.current;
    const el = viewerRef.current;
    if (!book || !el || loading) return;

    let cancelled = false;
    const rendition = book.renderTo(el, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: "auto",
      allowScriptedContent: false,
    });
    renditionRef.current = rendition;

    // Track reading progress across the spine.
    const onRelocated = (location: {
      start?: { percentage?: number };
    }) => {
      const pct = location?.start?.percentage;
      if (typeof pct === "number") setProgress(pct);
    };
    rendition.on("relocated", onRelocated);

    // Re-apply reading styles whenever a new section is rendered.
    rendition.on("rendered", () => {
      applyStyles(theme, fontSize);
    });

    void rendition.display().then(() => {
      if (!cancelled) applyStyles(theme, fontSize);
    });

    return () => {
      cancelled = true;
      rendition.off?.("relocated", onRelocated);
      rendition.destroy();
      if (renditionRef.current === rendition) renditionRef.current = null;
    };
    // metadata identity signals a freshly opened book.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata, loading]);

  /* Live-apply option changes without remounting the rendition. */
  React.useEffect(() => {
    applyStyles(theme, fontSize);
  }, [theme, fontSize, applyStyles]);

  const goPrev = React.useCallback(() => {
    void renditionRef.current?.prev();
  }, []);
  const goNext = React.useCallback(() => {
    void renditionRef.current?.next();
  }, []);

  const jumpTo = React.useCallback((href: string) => {
    if (href) void renditionRef.current?.display(href);
  }, []);

  /* Keyboard page turns (arrows / PageUp / PageDown) while a book is open. */
  React.useEffect(() => {
    if (!metadata) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [metadata, goPrev, goNext]);

  /* Clean up the book on unmount. */
  React.useEffect(() => {
    return () => {
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
    };
  }, []);

  const reset = React.useCallback(() => {
    renditionRef.current?.destroy();
    renditionRef.current = null;
    bookRef.current?.destroy();
    bookRef.current = null;
    setSelected(null);
    setMetadata(null);
    setToc([]);
    setChapterCount(0);
    setProgress(0);
    setError(null);
  }, []);

  const changeFont = React.useCallback((delta: number) => {
    setFontSize((f) => Math.min(FONT_MAX, Math.max(FONT_MIN, f + delta)));
  }, []);

  const pageColors = THEME_COLORS[theme];
  const hasBook = Boolean(metadata) && !loading;

  /* ── Upload state ───────────────────────────────────────────────────────── */
  if (!selected || (!hasBook && !loading && !error)) {
    return (
      <div className="flex flex-col gap-4">
        <DocumentDropzone
          accept={["epub"]}
          icon="BookOpen"
          label="Drop an .epub, click to browse, or paste"
          hint="Your book is opened and read entirely in your browser. Never uploaded"
          selected={null}
          onFile={(d) => {
            setSelected(d);
            void openFile(d);
          }}
        />
        <HonestyNote />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header: metadata + toolbar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="BookMarked" size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {metadata?.title || selected.file.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {metadata?.creator ? metadata.creator : "Unknown author"}
              {chapterCount > 0 ? ` · ${chapterCount} sections` : ""}
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <StatBadge
            label="Progress"
            value={`${Math.round(progress * 100)}%`}
            icon="BookOpenCheck"
            tone={progress > 0 ? "info" : "default"}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTocOpen((v) => !v)}
            aria-pressed={tocOpen}
          >
            <Icon name="ListTree" size={15} />
            Contents
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <Icon name="RotateCcw" size={15} />
            Close book
          </Button>
        </div>
      </div>

      {/* Options bar */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-3">
        <Field label="Theme">
          <SegmentedControl
            value={theme}
            onChange={setTheme}
            options={THEMES}
            ariaLabel="Reading theme"
            size="sm"
          />
        </Field>
        <Field label="Font size">
          <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => changeFont(-FONT_STEP)}
              disabled={fontSize <= FONT_MIN}
              aria-label="Decrease font size"
              className="inline-flex size-7 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Icon name="Minus" size={14} />
            </button>
            <span className="min-w-[3ch] text-center text-xs font-medium tabular-nums text-foreground">
              {fontSize}%
            </span>
            <button
              type="button"
              onClick={() => changeFont(FONT_STEP)}
              disabled={fontSize >= FONT_MAX}
              aria-label="Increase font size"
              className="inline-flex size-7 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Icon name="Plus" size={14} />
            </button>
          </div>
        </Field>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Reader: TOC sidebar + paginated viewer */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,240px)_1fr]">
        {tocOpen && (
          <nav
            aria-label="Table of contents"
            className="hidden max-h-[560px] flex-col overflow-auto rounded-xl border border-border bg-card p-2 lg:flex"
          >
            <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contents
            </p>
            {toc.length > 0 ? (
              <TocList entries={toc} onJump={jumpTo} depth={0} />
            ) : (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                This book has no embedded table of contents. Use the page controls to read
                through.
              </p>
            )}
          </nav>
        )}

        <div className="relative flex flex-col overflow-hidden rounded-xl border border-border shadow-sm">
          {/* Page surface (epubjs mounts an iframe here). */}
          <div
            className="relative flex-1"
            style={{ background: pageColors.bg, minHeight: 520 }}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Icon name="LoaderCircle" size={18} className="animate-spin" />
                Opening book…
              </div>
            )}
            <div ref={viewerRef} className="h-full w-full" style={{ minHeight: 520 }} />

            {/* Tap zones for page turns (don't block text selection center). */}
            {hasBook && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous page"
                  className="group absolute inset-y-0 left-0 z-[5] flex w-12 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="rounded-full bg-black/5 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/10">
                    <Icon name="ChevronLeft" size={18} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next page"
                  className="group absolute inset-y-0 right-0 z-[5] flex w-12 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="rounded-full bg-black/5 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/10">
                    <Icon name="ChevronRight" size={18} />
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Footer controls */}
          <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={!hasBook}>
              <Icon name="ChevronLeft" size={15} />
              Prev
            </Button>
            <div
              className="mx-1 h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Reading progress"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${Math.max(2, progress * 100)}%` }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={goNext} disabled={!hasBook}>
              Next
              <Icon name="ChevronRight" size={15} />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Turn pages with the arrows, your keyboard&apos;s ← → keys, or by tapping either side.
      </p>

      <HonestyNote />
    </div>
  );
}

/* ── Table-of-contents list (recursive, nested entries) ───────────────────── */

function TocList({
  entries,
  onJump,
  depth,
}: {
  entries: EpubTocEntry[];
  onJump: (href: string) => void;
  depth: number;
}) {
  return (
    <ul className="flex flex-col">
      {entries.map((entry, i) => (
        <li key={`${entry.href}-${i}`}>
          <button
            type="button"
            onClick={() => onJump(entry.href)}
            title={entry.label}
            className="w-full truncate rounded px-2 py-1.5 text-left text-xs text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            style={{ paddingLeft: 8 + depth * 12 }}
          >
            {entry.label || "Untitled section"}
          </button>
          {entry.children.length > 0 && (
            <TocList entries={entry.children} onJump={onJump} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

/* ── Honesty note ─────────────────────────────────────────────────────────── */

function HonestyNote() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
      <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
      <span>
        Your book is opened and read entirely in your browser; nothing is uploaded. EPUB is a
        reflowable format, so pages are re-flowed to your screen rather than reproduced from a
        specific print edition, and DRM-protected books can&apos;t be opened by any in-browser
        reader. Want a fixed file instead? Use the <span className="font-medium">EPUB to PDF</span>{" "}
        tool.
      </span>
    </p>
  );
}
