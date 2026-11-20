"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { makeSprite, iconGrid, type SpriteEntry } from "@/lib/svg-tools/generate";
import { GeneratorCanvas, sanitizeSvg } from "@/components/tool/svg";
import {
  CopyButton,
  ToolbarButton,
  FileDropZone,
  ErrorBanner,
  StatBadge,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  download,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * State model
 * The whole tool is driven by an ordered list of icon entries. Each entry keeps
 * its raw SVG markup plus a user-editable `name` (the source of the <symbol>
 * id). Undo/redo, reorder, rename and remove are all just "swap the list", so
 * history is a single serialisable array.
 * ──────────────────────────────────────────────────────────────────────────── */

interface IconEntry {
  /** Stable key for React lists (survives rename/reorder). */
  key: string;
  /** User-facing name → becomes the sanitised <symbol> id. */
  name: string;
  /** Raw source SVG markup. */
  svg: string;
}

type SpriteState = IconEntry[];

const EMPTY_STATE: SpriteState = [];

let keyCounter = 0;
function freshKey(): string {
  keyCounter += 1;
  return `icon-${keyCounter}-${Date.now().toString(36)}`;
}

/** Strip a trailing .svg and any path, so a File name reads cleanly. */
function baseName(fileName: string): string {
  const noPath = fileName.split(/[\\/]/).pop() ?? fileName;
  return noPath.replace(/\.svg$/i, "") || "icon";
}

/** Quick sanity check that a string actually contains an <svg> element. */
function looksLikeSvg(text: string): boolean {
  return /<svg[\s>]/i.test(text) && /<\/svg>/i.test(text);
}

/** A couple of tiny, self-contained demo icons so the tool is never empty. */
const EXAMPLE_ICONS: { name: string; svg: string }[] = [
  {
    name: "home",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
  },
  {
    name: "heart",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 6 4 2.8-2.8 4-4 6-4 3.5 0 5 3.5 3.5 7C19 15.65 12 20 12 20Z"/></svg>',
  },
  {
    name: "star",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.9 6.2 21.9l1.1-6.5L2.6 10.7l6.5-.9L12 3Z"/></svg>',
  },
  {
    name: "settings",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.7M12 18.8v2.7M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.5 12h2.7M18.8 12h2.7M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9"/></svg>',
  },
];

/**
 * SVG Sprite Generator, the "Generate" tool that folds many icon SVGs into a
 * single `<symbol>` sprite. Drop/paste SVGs, rename them (the id → `<use>`
 * handle), reorder and remove, and `generate.makeSprite` stitches everything
 * into one hidden `<svg>` plus copy-paste `<use>` snippets. Live grid preview
 * via <GeneratorCanvas> with copy/download of the sprite, per-icon usage,
 * undo/redo, examples and shortcuts. Everything runs in-browser.
 */
export default function SvgSpriteGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const history = useHistory<SpriteState>(EMPTY_STATE, { debounceMs: 300 });
  const icons = history.state;
  const [error, setError] = React.useState<string | null>(null);

  /* --- Mutations, all routed through history so undo/redo covers everything --- */

  const addEntries = React.useCallback(
    (entries: { name: string; svg: string }[]) => {
      if (!entries.length) return;
      history.set((prev) => [
        ...prev,
        ...entries.map((e) => ({ key: freshKey(), name: e.name, svg: e.svg })),
      ]);
    },
    [history],
  );

  const importFiles = React.useCallback(
    async (files: File[]) => {
      const accepted: { name: string; svg: string }[] = [];
      const rejected: string[] = [];
      for (const file of files) {
        try {
          const text = await file.text();
          if (looksLikeSvg(text)) {
            accepted.push({ name: baseName(file.name), svg: text.trim() });
          } else {
            rejected.push(file.name);
          }
        } catch {
          rejected.push(file.name);
        }
      }
      addEntries(accepted);
      setError(
        rejected.length
          ? `Skipped ${rejected.length} file${rejected.length > 1 ? "s" : ""} that ${rejected.length > 1 ? "aren't" : "isn't"} valid SVG: ${rejected.join(", ")}.`
          : null,
      );
    },
    [addEntries],
  );

  const rename = React.useCallback(
    (key: string, name: string) => {
      history.set((prev) => prev.map((e) => (e.key === key ? { ...e, name } : e)));
    },
    [history],
  );

  const remove = React.useCallback(
    (key: string) => {
      history.set((prev) => prev.filter((e) => e.key !== key));
    },
    [history],
  );

  const move = React.useCallback(
    (key: string, dir: -1 | 1) => {
      history.set((prev) => {
        const i = prev.findIndex((e) => e.key === key);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= prev.length) return prev;
        const next = prev.slice();
        const a = next[i]!;
        const b = next[j]!;
        next[i] = b;
        next[j] = a;
        return next;
      });
    },
    [history],
  );

  const loadExamples = React.useCallback(() => {
    setError(null);
    history.set(EXAMPLE_ICONS.map((e) => ({ key: freshKey(), name: e.name, svg: e.svg })));
  }, [history]);

  const reset = React.useCallback(() => {
    setError(null);
    history.reset(EMPTY_STATE);
  }, [history]);

  /* --------------------------- Derived sprite output --------------------------- */

  const built = React.useMemo(() => {
    if (!icons.length) return null;
    const entries: SpriteEntry[] = icons.map((e) => ({ id: e.name, svg: e.svg }));
    return makeSprite(entries);
  }, [icons]);

  const sprite = built?.ok ? built.result.sprite : "";
  const buildError = built && !built.ok ? built.error.message : null;

  /**
   * The raw sprite is `display:none`, so it can't be previewed directly. Lay the
   * source icons out in a visible grid (deterministic, currentColor) purely for
   * the preview surface, the copy/download targets stay the real sprite.
   */
  const previewSvg = React.useMemo(() => {
    if (!icons.length) return "";
    return iconGrid(
      icons.map((e) => e.svg),
      { cols: Math.min(6, icons.length), cell: 56, gap: 20, color: "currentColor" },
    );
  }, [icons]);

  /** Per-symbol <use> usage snippets, matching the sanitised, de-duplicated ids. */
  const usageSnippet = React.useMemo(() => {
    if (!icons.length) return "";
    const ids = symbolIds(icons.map((e) => e.name));
    return ids
      .map((id) => `<svg width="24" height="24"><use href="#${id}"></use></svg>`)
      .join("\n");
  }, [icons]);

  const downloadSprite = React.useCallback(() => {
    if (sprite) download("sprite.svg", sprite, "image/svg+xml");
  }, [sprite]);

  /* -------------------------------- Shortcuts -------------------------------- */

  useShortcuts({
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
    "mod+backspace": reset,
    "mod+s": (e) => {
      e.preventDefault();
      downloadSprite();
    },
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+s", description: "Download sprite.svg" },
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "mod+backspace", description: "Clear all icons" },
  ];

  const activeError = error ?? buildError;

  /* --------------------------------- Controls -------------------------------- */

  const controls = (
    <div className="flex flex-col gap-4">
      {/* Import */}
      <FileDropZone
        onFiles={importFiles}
        accept=".svg,image/svg+xml"
        multiple
        icon="LayoutGrid"
        label="Drop SVGs, click to browse, or paste"
        hint="Add as many icons as you like: each becomes a <symbol>"
      />

      {activeError && (
        <ErrorBanner error={activeError} onDismiss={() => setError(null)} />
      )}

      {/* Empty state helper */}
      {icons.length === 0 ? (
        <button
          type="button"
          onClick={loadExamples}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Sparkles" size={14} className={style.text} />
          Load example icons
        </button>
      ) : (
        <>
          {/* Icon list */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Icons ({icons.length})
            </span>
            <StatBadge label="symbols" value={icons.length} tone="info" />
          </div>

          <ul className="flex flex-col gap-1.5">
            {icons.map((entry, i) => (
              <li
                key={entry.key}
                className="flex items-center gap-2 rounded-md border border-border bg-background p-1.5"
              >
                {/* Thumbnail */}
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded bg-muted/50 text-foreground",
                    style.text,
                  )}
                  aria-hidden
                  dangerouslySetInnerHTML={{ __html: thumbSvg(entry.svg) }}
                />
                {/* Name → id */}
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <span className="text-muted-foreground">#</span>
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e) => rename(entry.key, e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    aria-label={`Name for icon ${i + 1}`}
                    className={cn(
                      "h-7 w-full min-w-0 rounded border border-transparent bg-transparent px-1 font-mono text-xs text-foreground outline-none hover:border-border focus-visible:border-border focus-visible:ring-2",
                      style.ring,
                    )}
                  />
                </div>
                {/* Reorder / remove */}
                <div className="flex shrink-0 items-center">
                  <IconBtn
                    icon="ChevronUp"
                    label={`Move ${entry.name} up`}
                    onClick={() => move(entry.key, -1)}
                    disabled={i === 0}
                  />
                  <IconBtn
                    icon="ChevronDown"
                    label={`Move ${entry.name} down`}
                    onClick={() => move(entry.key, 1)}
                    disabled={i === icons.length - 1}
                  />
                  <IconBtn
                    icon="X"
                    label={`Remove ${entry.name}`}
                    onClick={() => remove(entry.key)}
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* Usage snippet */}
          <div className="flex flex-col gap-1.5 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Usage, &lt;use&gt; snippets
              </span>
              <CopyButton getValue={() => usageSnippet} label="Copy" />
            </div>
            <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed text-foreground">
              <code>{usageSnippet}</code>
            </pre>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Inline the sprite and reference symbols with these, or use{" "}
              <code className="rounded bg-muted/60 px-1 font-mono text-foreground">
                sprite.svg#id
              </code>{" "}
              against the downloaded file.
            </p>
          </div>

          {/* Undo / redo + shortcuts */}
          <div className="flex items-center gap-1.5 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => history.undo()}
              disabled={!history.canUndo}
              aria-label="Undo"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="Undo2" size={14} />
              Undo
            </button>
            <button
              type="button"
              onClick={() => history.redo()}
              disabled={!history.canRedo}
              aria-label="Redo"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="Redo2" size={14} />
              Redo
            </button>
            <div className="ml-auto">
              <ShortcutsHelp shortcuts={shortcuts} />
            </div>
          </div>
        </>
      )}

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          Each icon&apos;s name becomes a sanitised, unique{" "}
          <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">
            &lt;symbol id&gt;
          </code>
          . Icons drawn with <code className="rounded bg-muted/60 px-1 font-mono text-[11px] text-foreground">currentColor</code> recolor from CSS.
        </span>
      </p>
    </div>
  );

  const toolbarExtra =
    sprite ? (
      <>
        <CopyButton getValue={() => sprite} label="Copy sprite" />
        <ToolbarButton
          icon="Download"
          label="sprite.svg"
          onClick={downloadSprite}
          labelMode="responsive"
        />
      </>
    ) : null;

  return (
    <GeneratorCanvas
      svg={previewSvg}
      controls={controls}
      controlsTitle="Sprite builder"
      filename="sprite"
      toolbarExtra={toolbarExtra}
      onReset={icons.length ? reset : undefined}
      previewMinHeight={420}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

/** Mirror makeSprite's id sanitising + de-dup so usage snippets match symbols. */
function symbolIds(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((raw) => {
    const base =
      raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "icon";
    let id = base;
    let n = 1;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  });
}

/**
 * A small, safe thumbnail: force the SVG to fit a 20px box and inherit color.
 * Sanitised with DOMPurify (via the shared `sanitizeSvg`) defensively even
 * though these are user-provided local files.
 */
function thumbSvg(svg: string): string {
  const cleaned = sanitizeSvg(svg);
  return cleaned.replace(
    /<svg\b([^>]*)>/i,
    (_m, attrs: string) => {
      const stripped = attrs
        .replace(/\swidth\s*=\s*(["'])[\s\S]*?\1/gi, "")
        .replace(/\sheight\s*=\s*(["'])[\s\S]*?\1/gi, "");
      return `<svg${stripped} width="20" height="20">`;
    },
  );
}

/* Small square icon button used for reorder/remove in the list rows. */
function IconBtn({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded text-muted-foreground outline-none transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Icon name={icon} size={14} />
    </button>
  );
}
