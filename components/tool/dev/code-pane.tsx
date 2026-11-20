"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

/** UTF-8 byte length of a string (matches server/file size, not char count). */
function byteLength(text: string): string {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Props for {@link CodePane}. */
export interface CodePaneProps {
  /** Controlled value. */
  value: string;
  /** Change handler; omit (or set readOnly) for an output pane. */
  onChange?: (value: string) => void;
  /** Small heading above the pane. */
  label?: React.ReactNode;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Read-only output styling; disables editing. */
  readOnly?: boolean;
  /** Show a line-number gutter (synced to scroll). Default false. */
  lineNumbers?: boolean;
  /** Soft-wrap long lines. Controlled/uncontrolled via `onWrapChange`. Default true. */
  wrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /** Show the wrap toggle in the footer. Default true. */
  showWrapToggle?: boolean;
  /** Show the char/line/byte footer. Default true. */
  showStats?: boolean;
  /** 1-based line to highlight (e.g. a parse error). */
  errorLine?: number | null;
  /** Files dropped/pasted onto the pane. When set, a drop overlay is shown. */
  onDropText?: (text: string) => void;
  /** Min/max height for the internal scroll area. */
  minHeight?: number;
  maxHeight?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** Accessible name when `label` is not a plain string. */
  ariaLabel?: string;
  /** Monospace font size in px. Default 13. */
  fontSize?: number;
  id?: string;
}

const LINE_HEIGHT = 1.6;

/**
 * A desktop-grade monospace editor/output pane: optional synced line-number
 * gutter, live char/line/byte footer, a wrap toggle, drag-over highlight,
 * error-line marker, internal scrolling with min/max height, and clean
 * dark-mode styling. Fully controlled via `value`/`onChange`.
 */
export const CodePane = React.forwardRef<HTMLTextAreaElement, CodePaneProps>(
  function CodePane(
    {
      value,
      onChange,
      label,
      placeholder,
      readOnly = false,
      lineNumbers = false,
      wrap: wrapProp,
      onWrapChange,
      showWrapToggle = true,
      showStats = true,
      errorLine = null,
      onDropText,
      // Developers work with BIG payloads, default to a tall, viewport-scaled
      // editor on desktop (was a cramped 180–460px). Tools can still override.
      minHeight = 320,
      maxHeight,
      className,
      ariaLabel,
      fontSize = 13,
      id,
    },
    ref,
  ) {
    const [wrapState, setWrapState] = React.useState(wrapProp ?? true);
    const wrap = wrapProp ?? wrapState;
    const setWrap = (next: boolean) => {
      onWrapChange?.(next);
      if (wrapProp === undefined) setWrapState(next);
    };

    const [dragging, setDragging] = React.useState(false);
    const gutterRef = React.useRef<HTMLDivElement>(null);
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const lineCount = React.useMemo(
      () => (value.length === 0 ? 1 : value.split("\n").length),
      [value],
    );
    const charCount = value.length;

    // Keep the gutter vertically aligned with the textarea's scroll.
    const syncScroll = React.useCallback(() => {
      if (gutterRef.current && innerRef.current) {
        gutterRef.current.scrollTop = innerRef.current.scrollTop;
      }
    }, []);

    const handleDrop = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        if (!onDropText) return;
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
          file.text().then(onDropText).catch(() => undefined);
          return;
        }
        const text = e.dataTransfer.getData("text/plain");
        if (text) onDropText(text);
      },
      [onDropText],
    );

    const gutterWidth = `${String(lineCount).length + 1}ch`;

    return (
      <div
        className={cn(
          "group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors",
          "focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20",
          // Tall by default (developers paste BIG payloads) and drag-resizable.
          "resize-y",
          dragging && "border-primary ring-2 ring-primary/30",
          className,
        )}
        style={{
          height: maxHeight ? undefined : "clamp(320px, 52vh, 860px)",
          minHeight,
          ...(maxHeight ? { maxHeight } : {}),
        }}
        onDragOver={
          onDropText
            ? (e) => {
                e.preventDefault();
                setDragging(true);
              }
            : undefined
        }
        onDragLeave={onDropText ? () => setDragging(false) : undefined}
        onDrop={handleDrop}
      >
        {label && (
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="truncate">{label}</span>
          </div>
        )}

        <div className="relative flex min-h-0 flex-1">
          {lineNumbers && (
            <div
              ref={gutterRef}
              aria-hidden="true"
              className="select-none overflow-hidden border-r border-border bg-muted/30 py-3 text-right font-mono text-muted-foreground/90"
              style={{
                width: gutterWidth,
                fontSize,
                lineHeight: LINE_HEIGHT,
                paddingRight: 8,
                paddingLeft: 8,
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    errorLine === i + 1 && "bg-destructive/20 text-destructive",
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          <textarea
            id={id}
            ref={innerRef}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            onScroll={lineNumbers ? syncScroll : undefined}
            readOnly={readOnly || !onChange}
            placeholder={placeholder}
            aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
            aria-invalid={errorLine != null || undefined}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            className={cn(
              "min-h-0 flex-1 resize-none bg-transparent px-3 py-3 font-mono text-foreground outline-none placeholder:text-muted-foreground/60",
              "selection:bg-primary/25",
              wrap ? "whitespace-pre-wrap break-words" : "overflow-x-auto whitespace-pre",
              readOnly && "cursor-default",
            )}
            style={{ fontSize, lineHeight: LINE_HEIGHT }}
          />

          {dragging && onDropText && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-md border border-primary/50 bg-card px-3 py-2 text-sm font-medium text-primary shadow">
                <Icon name="Upload" size={16} />
                Drop to load
              </div>
            </div>
          )}
        </div>

        {(showStats || showWrapToggle) && (
          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
            {showStats ? (
              <div className="flex items-center gap-3 tabular-nums">
                <span>{lineCount.toLocaleString()} lines</span>
                <span>{charCount.toLocaleString()} chars</span>
                <span>{byteLength(value)}</span>
              </div>
            ) : (
              <span />
            )}
            {showWrapToggle && (
              <button
                type="button"
                onClick={() => setWrap(!wrap)}
                aria-pressed={wrap}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="WrapText" size={13} />
                {wrap ? "Wrap" : "No wrap"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);
