/**
 * GigAI Tools: EPUB engine (client-side, epubjs-backed).
 *
 * epubjs opens the EPUB archive in memory and exposes its metadata, spine
 * (reading order) and table of contents. We drive it directly rather than
 * mounting a live rendition, so extraction works headless:
 *   - openEpub: returns metadata + toc + a `renderTo(element)` helper for UIs
 *     that DO want a live preview.
 *   - epubToText: walks the spine, loads each chapter's document, and pulls its
 *     text content into one plain-text string.
 *   - epubToPdf: renders each chapter's sanitised HTML into an offscreen node
 *     and paginates via the shared html2canvas renderer.
 *
 * HONEST: EPUB is reflowable, so a PDF is a linearised approximation: original
 * pagination, embedded fonts and complex CSS won't be reproduced exactly.
 *
 * epubjs, dompurify and jspdf are all dynamic-imported.
 */

import type { Book, NavItem } from "epubjs";
import { renderHtmlToPdf } from "./render-pdf";
import { type Result, escapeHtml, fail, message, ok } from "./shared";

/** Flattened metadata surfaced to the UI. */
export interface EpubMetadata {
  title: string;
  creator: string;
  publisher: string;
  language: string;
  description: string;
}

/** One table-of-contents entry (nested via `children`). */
export interface EpubTocEntry {
  label: string;
  href: string;
  children: EpubTocEntry[];
}

/** What {@link openEpub} hands back. `renderTo` is for live-preview UIs. */
export interface OpenedEpub {
  metadata: EpubMetadata;
  toc: EpubTocEntry[];
  /** Chapter count (spine length). */
  chapterCount: number;
  /**
   * Mount a paginated live preview into `element` using epubjs's own renderer.
   * Returns a `destroy()` to tear it down. Only usable in a real DOM.
   */
  renderTo: (element: HTMLElement) => { destroy: () => void };
  /** The underlying epubjs Book, for advanced callers. */
  book: Book;
}

/** Lazily import epubjs and open a Book from a File/Blob's ArrayBuffer. */
async function openBook(file: Blob): Promise<Book> {
  const ePub = (await import("epubjs")).default;
  const buffer = await file.arrayBuffer();
  const book = ePub(buffer);
  await book.ready;
  return book;
}

/** Map epubjs nav items to our serialisable toc shape. */
function mapToc(items: NavItem[] | undefined): EpubTocEntry[] {
  if (!items) return [];
  return items.map((item) => ({
    label: (item.label ?? "").trim(),
    href: item.href ?? "",
    children: mapToc(item.subitems),
  }));
}

/**
 * Open an EPUB and return its metadata, table of contents and a `renderTo`
 * helper. Nothing is rasterised or converted here. This is the cheap "inspect"
 * entry point the reader/preview UIs build on.
 */
export async function openEpub(file: Blob): Promise<Result<OpenedEpub>> {
  try {
    const book = await openBook(file);
    const md = await book.loaded.metadata;
    const nav = await book.loaded.navigation;

    const metadata: EpubMetadata = {
      title: md.title ?? "",
      creator: md.creator ?? "",
      publisher: md.publisher ?? "",
      language: md.language ?? "",
      description: md.description ?? "",
    };

    // Spine length = chapter count.
    const spineItems = getSpineItems(book);

    const opened: OpenedEpub = {
      metadata,
      toc: mapToc(nav.toc),
      chapterCount: spineItems.length,
      renderTo: (element: HTMLElement) => {
        const rendition = book.renderTo(element, { width: "100%", height: "100%" });
        void rendition.display();
        return { destroy: () => rendition.destroy() };
      },
      book,
    };
    return ok(opened);
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Extract the full plain text of an EPUB by walking the spine in reading order,
 * loading each section's document, and reading its `textContent`. Chapters are
 * separated by a blank line. Returns whatever text the EPUB actually contains
 * (empty for DRM'd or image-only books).
 */
export async function epubToText(file: Blob): Promise<Result<string>> {
  try {
    const book = await openBook(file);
    try {
      const chapters = await loadChapters(book);
      const text = chapters
        .map((c) => c.text.trim())
        .filter((t) => t.length > 0)
        .join("\n\n");
      return ok(text);
    } finally {
      book.destroy();
    }
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Convert an EPUB to a PDF. Each chapter's body HTML is sanitised, concatenated
 * with page-break hints, and paginated by the shared html2canvas renderer.
 * HONEST: reflowable content is linearised; this is a readable export, not a
 * faithful reproduction of the publisher's typeset pages.
 */
export async function epubToPdf(
  file: Blob,
  opts: { format?: "a4" | "letter" } = {},
): Promise<Result<Blob>> {
  try {
    const book = await openBook(file);
    let title = "EPUB";
    try {
      const md = await book.loaded.metadata;
      if (md.title) title = md.title;
      const chapters = await loadChapters(book);
      const DOMPurify = (await import("dompurify")).default;

      const body = chapters
        .map((c, i) => {
          const safe = DOMPurify.sanitize(c.html, { USE_PROFILES: { html: true } });
          const brk = i > 0 ? ' style="page-break-before:always;"' : "";
          return `<section${brk}>${safe}</section>`;
        })
        .join("\n");

      const html = `<div style="font-family:Georgia,'Times New Roman',serif;color:#111;line-height:1.6;">
<style>
  h1,h2,h3{font-family:Arial,Helvetica,sans-serif;line-height:1.25;}
  h1{font-size:24px;margin:0 0 .6em;} h2{font-size:19px;} h3{font-size:16px;}
  p{margin:0 0 .8em;} img{max-width:100%;height:auto;}
  blockquote{margin:0 0 .8em;padding-left:14px;border-left:3px solid #d4d4d8;color:#3f3f46;}
</style>
<h1>${escapeHtml(title)}</h1>
${body}</div>`;

      return renderHtmlToPdf(html, { format: opts.format });
    } finally {
      book.destroy();
    }
  } catch (err) {
    return fail(message(err));
  }
}

/** A loaded chapter: sanitisable body HTML + its extracted plain text. */
interface Chapter {
  html: string;
  text: string;
}

/**
 * Load every spine section's document and return its inner-body HTML + text.
 * `section.load` needs epubjs's own request function; `book.load` provides it.
 */
async function loadChapters(book: Book): Promise<Chapter[]> {
  const items = getSpineItems(book);
  const request = book.load.bind(book);
  const chapters: Chapter[] = [];

  for (const section of items) {
    try {
      const doc = (await section.load(request)) as Document;
      const bodyEl = doc.body ?? doc.documentElement;
      const html = bodyEl ? bodyEl.innerHTML : "";
      const text = bodyEl ? (bodyEl.textContent ?? "") : "";
      chapters.push({ html, text });
    } catch {
      // Skip any section that fails to load (e.g. missing resource) so one bad
      // chapter never aborts the whole export.
    } finally {
      // Free the section's cached document.
      (section as { unload?: () => void }).unload?.();
    }
  }
  return chapters;
}

/**
 * Read the spine's sections in reading order. epubjs stores them on
 * `spine.spineItems`; we fall back to iterating with `spine.get(index)`.
 */
function getSpineItems(book: Book): SpineSection[] {
  const spine = book.spine as unknown as {
    spineItems?: SpineSection[];
    length?: number;
    get?: (i: number) => SpineSection | null;
  };
  if (Array.isArray(spine.spineItems)) return spine.spineItems;

  const out: SpineSection[] = [];
  const len = spine.length ?? 0;
  for (let i = 0; i < len; i += 1) {
    const s = spine.get?.(i);
    if (s) out.push(s);
  }
  return out;
}

/** Minimal shape of an epubjs spine Section we rely on. */
interface SpineSection {
  load: (request: unknown) => Promise<Document>;
  unload?: () => void;
}
