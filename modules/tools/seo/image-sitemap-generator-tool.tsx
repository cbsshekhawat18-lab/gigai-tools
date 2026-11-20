"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import { CodePane, Field, StatBadge, type Example } from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import { generateImageSitemap, type ImageEntry } from "@/lib/seo-tools/sitemap";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/** The full, undo-tracked form state. */
interface ImageSitemapState {
  /**
   * Raw textarea. A non-indented, non-prefixed line is a PAGE url (<loc>).
   * Lines that are indented, or start with `-`, belong to the most recent
   * page as images. An image line may carry pipe overrides:
   * `image-url | title | caption`. Lines starting with `#` are comments.
   */
  entries: string;
}

const INITIAL: ImageSitemapState = { entries: "" };

/* -------------------------------------------------------------------------- */
/*  Parsing                                                                   */
/* -------------------------------------------------------------------------- */

/** Google's per-page image ceiling in a sitemap. */
const MAX_IMAGES_PER_PAGE = 1000;
/** Protocol per-file URL ceiling. */
const MAX_URLS = 50000;

interface SkippedLine {
  line: number;
  text: string;
  reason: string;
}

interface ParseResult {
  /** Ready-to-render entries (only pages that ended up with ≥1 image). */
  parsed: ImageEntry[];
  /** Pages declared but with zero valid images. */
  emptyPages: { line: number; loc: string }[];
  /** Lines that could not be parsed. */
  skipped: SkippedLine[];
  /** Distinct duplicate image `loc` values (across the whole file). */
  duplicateImages: string[];
  totalPages: number;
  totalImages: number;
  nonHttpsImages: number;
  /** Page URLs (loc) whose image count exceeds MAX_IMAGES_PER_PAGE. */
  overloadedPages: string[];
}

/** A line is an "image" (child) line if it is indented or starts with `-`/`*`. */
function isChildLine(raw: string): boolean {
  return /^\s+/.test(raw) || /^\s*[-*]\s+/.test(raw.replace(/^\s+/, ""));
}

/** Strip a leading list marker (`- ` / `* `) and surrounding space. */
function stripMarker(text: string): string {
  return text.replace(/^\s*[-*]\s+/, "").trim();
}

function parseAbsoluteHttpUrl(value: string): URL | null {
  let u: URL | null = null;
  try {
    u = new URL(value);
  } catch {
    return null;
  }
  return /^https?:$/.test(u.protocol) ? u : null;
}

/**
 * Parse the raw textarea into image-sitemap entries. Blank lines and `#`
 * comments are ignored. A top-level line opens a new page; indented / dashed
 * lines add images to the current page.
 */
function parseEntries(input: string): ParseResult {
  const parsed: ImageEntry[] = [];
  const emptyPages: ParseResult["emptyPages"] = [];
  const skipped: SkippedLine[] = [];
  const duplicateImages: string[] = [];
  const seenImages = new Set<string>();
  const overloadedPages: string[] = [];

  let totalImages = 0;
  let nonHttpsImages = 0;

  // Track the page currently being filled (index into `parsed`) plus its line.
  let current: { entry: ImageEntry; line: number } | null = null;

  const flushEmpty = () => {
    if (current && current.entry.images.length === 0) {
      emptyPages.push({ line: current.line, loc: current.entry.loc });
      // Remove the just-pushed empty entry from output.
      const idx = parsed.indexOf(current.entry);
      if (idx !== -1) parsed.splice(idx, 1);
    }
  };

  const lines = input.split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (isChildLine(raw) && current) {
      // ---- image line under the current page ----
      const body = stripMarker(trimmed);
      const [locRaw, titleRaw, captionRaw] = body.split("|").map((p) => p.trim());
      const loc = locRaw ?? "";
      const u = parseAbsoluteHttpUrl(loc);
      if (!u) {
        skipped.push({
          line: lineNo,
          text: loc || trimmed,
          reason: "Image is not an absolute http(s) URL",
        });
        return;
      }
      if (u.protocol !== "https:") nonHttpsImages += 1;

      if (seenImages.has(loc)) {
        if (!duplicateImages.includes(loc)) duplicateImages.push(loc);
      } else {
        seenImages.add(loc);
      }

      const image: ImageEntry["images"][number] = {
        loc,
        ...(titleRaw ? { title: titleRaw } : {}),
        ...(captionRaw ? { caption: captionRaw } : {}),
      };
      current.entry.images.push(image);
      totalImages += 1;
      if (
        current.entry.images.length > MAX_IMAGES_PER_PAGE &&
        !overloadedPages.includes(current.entry.loc)
      ) {
        overloadedPages.push(current.entry.loc);
      }
      return;
    }

    // ---- top-level line: a new page ----
    // Close out the previous page if it collected no images.
    flushEmpty();

    const pageUrl = parseAbsoluteHttpUrl(trimmed);
    if (!pageUrl) {
      skipped.push({
        line: lineNo,
        text: trimmed,
        reason: "Page is not an absolute http(s) URL",
      });
      current = null;
      return;
    }

    const entry: ImageEntry = { loc: trimmed, images: [] };
    parsed.push(entry);
    current = { entry, line: lineNo };
  });

  // Flush the final page.
  flushEmpty();

  return {
    parsed,
    emptyPages,
    skipped,
    duplicateImages,
    totalPages: parsed.length,
    totalImages,
    nonHttpsImages,
    overloadedPages,
  };
}

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLES: ReadonlyArray<Example<ImageSitemapState>> = [
  {
    label: "Product gallery",
    description: "A product page with three shots, titles + captions",
    icon: "ShoppingBag",
    value: {
      entries: [
        "https://example.com/products/aurora-lamp",
        " https://cdn.example.com/img/aurora-front.jpg | Aurora Lamp, front | Warm brass finish, front view",
        " https://cdn.example.com/img/aurora-side.jpg | Aurora Lamp, side | Adjustable arm, side profile",
        " https://cdn.example.com/img/aurora-lit.jpg | Aurora Lamp: lit | Glowing on a bedside table",
      ].join("\n"),
    },
  },
  {
    label: "Blog article",
    description: "One post, a hero image and an infographic",
    icon: "Newspaper",
    value: {
      entries: [
        "https://blog.example.com/2026/image-seo-guide",
        "  - https://blog.example.com/img/hero-image-seo.jpg | Image SEO guide hero | Illustration of a search bar over photos",
        "  - https://blog.example.com/img/image-sitemap-diagram.png | How an image sitemap works | Diagram mapping pages to images",
      ].join("\n"),
    },
  },
  {
    label: "Multiple pages",
    description: "Two portfolio pages, images grouped per page",
    icon: "Images",
    value: {
      entries: [
        "https://studio.example.com/work/weddings",
        "  https://studio.example.com/img/wedding-1.jpg | Garden ceremony",
        "  https://studio.example.com/img/wedding-2.jpg | First dance",
        "",
        "https://studio.example.com/work/portraits",
        "  https://studio.example.com/img/portrait-1.jpg | Studio portrait",
        "  https://studio.example.com/img/portrait-2.jpg | Outdoor portrait",
      ].join("\n"),
    },
  },
];

const SAMPLE_HINT =
  "https://example.com/page\n  https://cdn.example.com/img/photo.jpg | Optional title | Optional caption\n  - https://cdn.example.com/img/photo-2.jpg";

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function ImageSitemapGeneratorTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<ImageSitemapState>(INITIAL);

  const set = React.useCallback(
    <K extends keyof ImageSitemapState>(key: K, value: ImageSitemapState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const { code, checks, stats, error } = React.useMemo(() => {
    const p = parseEntries(state.entries);
    const xml = p.parsed.length ? generateImageSitemap(p.parsed) : "";

    const httpsImages = p.totalImages - p.nonHttpsImages;
    const checkItems: CheckItem[] = [];

    const nothingYet =
      p.totalPages === 0 && p.skipped.length === 0 && p.emptyPages.length === 0;

    if (nothingYet) {
      checkItems.push({
        status: "info",
        label: "No pages yet",
        detail:
          "Add a page URL on its own line, then list its image URLs on indented lines beneath it.",
      });
    } else if (p.totalPages === 0) {
      checkItems.push({
        status: "fail",
        label: "No page has any valid images",
        detail:
          "Each page needs at least one absolute image URL beneath it to appear in the sitemap.",
        fix: "Indent image URLs (or prefix with '- ') under the page that hosts them.",
      });
    } else {
      checkItems.push({
        status: "pass",
        label: `${p.totalPages} page${p.totalPages === 1 ? "" : "s"} · ${p.totalImages} image${p.totalImages === 1 ? "" : "s"}`,
        detail: "Each page becomes one <url> with its <image:image> entries.",
      });
    }

    if (p.emptyPages.length) {
      const preview = p.emptyPages
        .slice(0, 4)
        .map((e) => `line ${e.line}: ${e.loc}`)
        .join("; ");
      checkItems.push({
        status: "warn",
        label: `${p.emptyPages.length} page${p.emptyPages.length === 1 ? "" : "s"} skipped (no images)`,
        detail: preview + (p.emptyPages.length > 4 ? "; …" : ""),
        fix: "A page with no images is omitted. Add at least one image line beneath it, or remove the page.",
      });
    }

    if (p.skipped.length) {
      const preview = p.skipped
        .slice(0, 4)
        .map((l) => `line ${l.line}: ${l.text || "(empty)"}`)
        .join("; ");
      checkItems.push({
        status: "fail",
        label: `${p.skipped.length} line${p.skipped.length === 1 ? "" : "s"} skipped as invalid`,
        detail: preview + (p.skipped.length > 4 ? "; …" : ""),
        fix: "Every page and image must be an absolute URL like https://example.com/photo.jpg. Fix or remove flagged lines. Use '#' to comment one out.",
      });
    }

    if (p.totalImages > 0 && p.nonHttpsImages > 0) {
      checkItems.push({
        status: "warn",
        label: `${p.nonHttpsImages} image${p.nonHttpsImages === 1 ? " is" : "s are"} not HTTPS`,
        detail: `${httpsImages}/${p.totalImages} image URLs use https://.`,
        fix: "Serve and list the https:// version of each image. Search engines prefer secure URLs.",
      });
    } else if (p.totalImages > 0) {
      checkItems.push({ status: "pass", label: "All image URLs use HTTPS" });
    }

    if (p.duplicateImages.length) {
      checkItems.push({
        status: "warn",
        label: `${p.duplicateImages.length} duplicate image URL${p.duplicateImages.length === 1 ? "" : "s"}`,
        detail:
          p.duplicateImages.slice(0, 3).join(", ") +
          (p.duplicateImages.length > 3 ? ", …" : ""),
        fix: "List each image URL once. Duplicates add no value and waste crawl budget.",
      });
    }

    if (p.overloadedPages.length) {
      checkItems.push({
        status: "fail",
        label: `${p.overloadedPages.length} page${p.overloadedPages.length === 1 ? "" : "s"} exceed ${MAX_IMAGES_PER_PAGE.toLocaleString()} images`,
        detail:
          p.overloadedPages.slice(0, 3).join(", ") +
          (p.overloadedPages.length > 3 ? ", …" : ""),
        fix: `Google lists at most ${MAX_IMAGES_PER_PAGE.toLocaleString()} images per page. Keep the most important images or split the gallery across paginated page URLs.`,
      });
    }

    if (p.totalPages > MAX_URLS) {
      checkItems.push({
        status: "fail",
        label: `Over the ${MAX_URLS.toLocaleString()}-URL limit (${p.totalPages.toLocaleString()})`,
        detail: "A single sitemap may contain at most 50,000 URLs (and 50 MB uncompressed).",
        fix: "Split the pages into multiple sitemap files and reference them from a <sitemapindex>, then submit the index.",
      });
    } else if (p.totalPages > 45000) {
      checkItems.push({
        status: "warn",
        label: `Approaching the ${MAX_URLS.toLocaleString()}-URL limit (${p.totalPages.toLocaleString()})`,
        detail: "Plan to split into multiple sitemaps with a sitemap index soon.",
      });
    }

    const hardError =
      p.overloadedPages.length > 0
        ? `At least one page lists more than ${MAX_IMAGES_PER_PAGE.toLocaleString()} images. Trim it before submitting.`
        : p.totalPages > MAX_URLS
          ? `This sitemap exceeds the ${MAX_URLS.toLocaleString()}-URL protocol limit. Split it and use a sitemap index.`
          : null;

    const bytes = xml ? new TextEncoder().encode(xml).length : 0;

    const statNodes = (
      <>
        <StatBadge
          label="Pages"
          value={p.totalPages}
          icon="FileText"
          tone={p.totalPages ? "info" : "default"}
        />
        <StatBadge
          label="Images"
          value={p.totalImages}
          icon="Image"
          tone={p.totalImages ? "info" : "default"}
        />
        <StatBadge
          label="HTTPS"
          value={p.totalImages ? `${httpsImages}/${p.totalImages}` : "0/0"}
          icon="ShieldCheck"
          tone={
            p.totalImages === 0 ? "default" : p.nonHttpsImages ? "warning" : "success"
          }
        />
        {p.duplicateImages.length > 0 && (
          <StatBadge
            label="Duplicates"
            value={p.duplicateImages.length}
            icon="Copy"
            tone="warning"
          />
        )}
        {p.skipped.length > 0 && (
          <StatBadge
            label="Skipped"
            value={p.skipped.length}
            icon="TriangleAlert"
            tone="danger"
          />
        )}
        <StatBadge
          label="Size"
          value={bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}
          icon="FileCode"
        />
      </>
    );

    return { code: xml, checks: checkItems, stats: statNodes, error: hardError };
  }, [state]);

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      <Field
        label="Pages and their images"
        htmlFor="image-sitemap-entries"
        hint="One page URL per top-level line. Indent (or prefix with '- ') each image URL beneath its page. Optional per-image: image | title | caption. Lines starting with # are ignored."
      >
        <CodePane
          id="image-sitemap-entries"
          value={state.entries}
          onChange={(v) => set("entries", v)}
          onDropText={(text) =>
            set("entries", state.entries ? `${state.entries}\n${text}` : text)
          }
          label={undefined}
          placeholder={SAMPLE_HINT}
          minHeight={260}
          maxHeight={460}
          lineNumbers
          ariaLabel="Pages and their image URLs"
        />
      </Field>
    </div>
  );

  /* -------------------------------- preview ------------------------------ */

  const preview = <CheckList items={checks} />;

  return (
    <GeneratorWithPreview<ImageSitemapState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="XML"
      form={form}
      preview={preview}
      previewLabel="Validation"
      downloadName="image-sitemap.xml"
      downloadMime="application/xml;charset=utf-8"
      error={error}
      examples={EXAMPLES}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<ImageSitemapState>;
          if (typeof parsed !== "object" || parsed === null) return null;
          return { ...INITIAL, ...parsed };
        } catch {
          return null;
        }
      }}
      stats={stats}
    />
  );
}
