"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { renderMarkdown } from "@/lib/dev/markdown";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  ShortcutsHelp,
  useShortcuts,
  useShareState,
  useFileDrop,
  download,
  type ShortcutHint,
} from "@/components/tool/dev";

/** A rich sample that exercises every supported GFM feature at a glance. */
const SAMPLE = `# Markdown Preview

Write **GitHub-Flavoured Markdown** on the left and see it rendered (safely) on the right.

## Everything you'd expect

- **Bold**, _italic_, ~~strikethrough~~ and \`inline code\`
- [Links](https://gigaikripaservices.com) that open in a new tab
- Nested lists
  1. First
  2. Second

> Blockquotes for emphasis, and horizontal rules below.

---

### Task list

- [x] Live, as-you-type preview
- [x] Sanitised (XSS-safe) HTML
- [ ] Anything left to want

### Table

| Feature      | Supported |
| ------------ | :-------: |
| Tables       | ✅        |
| Task lists   | ✅        |
| Code blocks  | ✅        |

### Code block

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`
`;

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample document" },
  { combo: "mod+b", description: "Bold the selection" },
  { combo: "mod+i", description: "Italicise the selection" },
  { combo: "mod+k", description: "Wrap the selection in a link" },
  { combo: "mod+shift+c", description: "Copy the rendered HTML" },
  { combo: "mod+backspace", description: "Clear the editor" },
];

type WrapKind = "bold" | "italic" | "code" | "strike";
type LinePrefix = "h1" | "h2" | "ul" | "ol" | "quote";

/**
 * Apply a Markdown transform to a textarea's current selection, returning the
 * next value plus the caret/selection to restore. Pure so it's easy to reason
 * about; the component owns the DOM side-effects.
 */
function applyWrap(
  value: string,
  start: number,
  end: number,
  kind: WrapKind,
): { next: string; selStart: number; selEnd: number } {
  const tokens: Record<WrapKind, { open: string; close: string; placeholder: string }> = {
    bold: { open: "**", close: "**", placeholder: "bold text" },
    italic: { open: "_", close: "_", placeholder: "italic text" },
    code: { open: "`", close: "`", placeholder: "code" },
    strike: { open: "~~", close: "~~", placeholder: "strikethrough" },
  };
  const { open, close, placeholder } = tokens[kind];
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + open + selected + close + value.slice(end);
  return {
    next,
    selStart: start + open.length,
    selEnd: start + open.length + selected.length,
  };
}

/** Prefix each selected line (heading / list / blockquote). */
function applyLinePrefix(
  value: string,
  start: number,
  end: number,
  kind: LinePrefix,
): { next: string; selStart: number; selEnd: number } {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndRaw = value.indexOf("\n", end);
  const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");

  const prefixed = lines.map((line, i) => {
    switch (kind) {
      case "h1":
        return `# ${line.replace(/^#+\s*/, "")}`;
      case "h2":
        return `## ${line.replace(/^#+\s*/, "")}`;
      case "ul":
        return `- ${line.replace(/^[-*]\s*/, "")}`;
      case "ol":
        return `${i + 1}. ${line.replace(/^\d+\.\s*/, "")}`;
      case "quote":
        return `> ${line.replace(/^>\s*/, "")}`;
      default:
        return line;
    }
  });

  const replacement = prefixed.join("\n");
  const next = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
  return {
    next,
    selStart: lineStart,
    selEnd: lineStart + replacement.length,
  };
}

/** Insert a link, using the selection as the link text when present. */
function applyLink(
  value: string,
  start: number,
  end: number,
): { next: string; selStart: number; selEnd: number } {
  const text = value.slice(start, end) || "link text";
  const snippet = `[${text}](url)`;
  const next = value.slice(0, start) + snippet + value.slice(end);
  // Select the "url" placeholder so the user can type over it immediately.
  const urlStart = start + text.length + 3; // [text](
  return { next, selStart: urlStart, selEnd: urlStart + 3 };
}

export default function MarkdownPreviewTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);
  const [src, setSrc] = React.useState("");
  const [html, setHtml] = React.useState("");
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const share = useShareState({ onInit: (v) => setSrc(v) });

  // ── Live render (debounced, auto-cancels stale runs) ──────────────────────
  React.useEffect(() => {
    if (!src.trim()) {
      setHtml("");
      setRenderError(null);
      return;
    }
    let cancelled = false;
    const id = window.setTimeout(() => {
      renderMarkdown(src)
        .then((out) => {
          if (!cancelled) {
            setHtml(out);
            setRenderError(null);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setRenderError(err instanceof Error ? err.message : "Failed to render Markdown.");
          }
        });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [src]);

  // ── Selection-aware editing helpers ───────────────────────────────────────
  const runTransform = React.useCallback(
    (fn: (value: string, start: number, end: number) => { next: string; selStart: number; selEnd: number }) => {
      const el = inputRef.current;
      const start = el?.selectionStart ?? src.length;
      const end = el?.selectionEnd ?? src.length;
      const { next, selStart, selEnd } = fn(src, start, end);
      setSrc(next);
      // Restore selection after React commits the new value.
      requestAnimationFrame(() => {
        const node = inputRef.current;
        if (node) {
          node.focus();
          node.setSelectionRange(selStart, selEnd);
        }
      });
    },
    [src],
  );

  const wrap = React.useCallback(
    (kind: WrapKind) => runTransform((v, s, e) => applyWrap(v, s, e, kind)),
    [runTransform],
  );
  const prefix = React.useCallback(
    (kind: LinePrefix) => runTransform((v, s, e) => applyLinePrefix(v, s, e, kind)),
    [runTransform],
  );
  const link = React.useCallback(() => runTransform(applyLink), [runTransform]);

  const loadSample = React.useCallback(() => {
    setSrc(SAMPLE);
    inputRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setSrc("");
    inputRef.current?.focus();
  }, []);

  const doShare = React.useCallback(() => {
    if (src.trim()) void share.copyShareLink(src);
  }, [src, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file.text().then(setSrc).catch(() => undefined);
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+b": () => wrap("bold"),
    "mod+i": () => wrap("italic"),
    "mod+k": () => link(),
    "mod+shift+c": () => {
      if (html) void navigator.clipboard.writeText(html).catch(() => undefined);
    },
  });

  const words = React.useMemo(() => {
    const m = src.trim().match(/\S+/g);
    return m ? m.length : 0;
  }, [src]);
  const readMins = Math.max(1, Math.round(words / 225));

  const downloadHtml = React.useCallback(() => {
    const doc = `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${html}\n</body>\n</html>\n`;
    download("markdown.html", doc, "text/html;charset=utf-8");
  }, [html]);

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Formatting toolbar ────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton icon="Bold" label="Bold" kbd="mod+b" labelMode="icon" onClick={() => wrap("bold")} />
        <ToolbarButton icon="Italic" label="Italic" kbd="mod+i" labelMode="icon" onClick={() => wrap("italic")} />
        <ToolbarButton icon="Strikethrough" label="Strikethrough" labelMode="icon" onClick={() => wrap("strike")} />
        <ToolbarButton icon="Code" label="Inline code" labelMode="icon" onClick={() => wrap("code")} />
        <ToolbarButton icon="Link" label="Link" kbd="mod+k" labelMode="icon" onClick={link} />
        <ToolbarDivider />
        <ToolbarButton icon="Heading1" label="Heading 1" labelMode="icon" onClick={() => prefix("h1")} />
        <ToolbarButton icon="Heading2" label="Heading 2" labelMode="icon" onClick={() => prefix("h2")} />
        <ToolbarButton icon="List" label="Bulleted list" labelMode="icon" onClick={() => prefix("ul")} />
        <ToolbarButton icon="ListOrdered" label="Numbered list" labelMode="icon" onClick={() => prefix("ol")} />
        <ToolbarButton icon="Quote" label="Blockquote" labelMode="icon" onClick={() => prefix("quote")} />
        <ToolbarSpacer />
        <ToolbarButton icon="Sparkles" label="Sample" kbd="mod+enter" labelMode="responsive" onClick={loadSample} />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {/* ── Action row ────────────────────────────────────────────────────── */}
      <Toolbar>
        <CopyButton label="Copy Markdown" value={src} disabled={!src} labelMode="responsive" />
        <CopyButton
          label="Copy HTML"
          kbd="mod+shift+c"
          getValue={() => html}
          disabled={!html}
          labelMode="responsive"
        />
        <ToolbarButton
          icon="Download"
          label="Download .md"
          labelMode="responsive"
          disabled={!src}
          onClick={() => download("document.md", src, "text/markdown;charset=utf-8")}
        />
        <ToolbarButton
          icon="FileCode2"
          label="Download .html"
          labelMode="responsive"
          disabled={!html}
          onClick={downloadHtml}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link2"}
          label={share.justCopied ? "Link copied!" : "Share link"}
          variant={share.justCopied ? "active" : "default"}
          labelMode="responsive"
          onClick={doShare}
          disabled={!src.trim()}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          labelMode="responsive"
          onClick={clearAll}
          disabled={!src}
        />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}
      {renderError && <ErrorBanner error={renderError} />}

      {/* ── Stat strip ────────────────────────────────────────────────────── */}
      {src.trim() && (
        <div className="flex flex-wrap items-center gap-2">
          <StatBadge icon="Type" label="Words" value={words} />
          <StatBadge icon="AlignLeft" label="Characters" value={src.length} />
          <StatBadge icon="Clock" label="Read" value={`${readMins} min`} />
          <StatBadge tone="success" icon="ShieldCheck" label="Preview" value="Sanitised" />
        </div>
      )}

      {/* ── Split panes ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative">
          <CodePane
            ref={inputRef}
            id="markdown-input"
            value={src}
            onChange={setSrc}
            label="Markdown"
            placeholder="Type or paste Markdown here…"
            onDropText={setSrc}
            lineNumbers
            wrap
            showStats
            minHeight={420}
            maxHeight={640}
            fontSize={13.5}
            ariaLabel="Markdown source input"
          />
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
              <span className="flex items-center gap-2 text-sm font-medium text-primary">
                <Icon name="Upload" size={16} /> Drop a .md or .txt file
              </span>
            </div>
          )}
        </div>

        {/* Rendered, sanitised HTML preview */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className={cn("flex size-6 items-center justify-center rounded", accent.soft)}>
                <Icon name="Eye" size={14} />
              </span>
              Preview
            </div>
            <CopyButton label="Copy HTML" getValue={() => html} disabled={!html} labelMode="icon" />
          </div>

          {src.trim() ? (
            <div
              className="markdown-body min-h-[420px] max-h-[640px] overflow-auto px-4 py-3 text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:first:mt-0 [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-border [&_img]:max-w-full [&_img]:rounded [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-1.5 [&_th]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
               
              dangerouslySetInnerHTML={{ __html: html }}
              aria-label="Rendered Markdown preview"
            />
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <span className={cn("flex size-12 items-center justify-center rounded-full", accent.soft)}>
                <Icon name="FileText" size={22} />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Your live preview appears here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start typing Markdown, or load a sample to see tables, task lists and code blocks
                  render instantly. Everything stays in your browser.
                </p>
              </div>
              <button
                type="button"
                onClick={loadSample}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  accent.border,
                  accent.text,
                )}
              >
                <Icon name="Sparkles" size={14} /> Load sample document
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Your Markdown is rendered entirely in this browser tab and the HTML is sanitised with
          DOMPurify before it&apos;s shown. Scripts and unsafe attributes are stripped. Nothing is
          uploaded.
        </span>
      </p>
    </div>
  );
}
