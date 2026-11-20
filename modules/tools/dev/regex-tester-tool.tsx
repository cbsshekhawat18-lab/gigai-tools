"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { runRegex, type RegexMatch } from "@/lib/dev/regex";
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
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * Static reference data
 * ──────────────────────────────────────────────────────────────────────────── */

/** The six ECMAScript RegExp flags, each with a plain-English tooltip. */
const FLAGS: { flag: string; label: string; hint: string }[] = [
  { flag: "g", label: "global", hint: "Find every match, not just the first" },
  { flag: "i", label: "ignore case", hint: "Match regardless of upper/lowercase" },
  { flag: "m", label: "multiline", hint: "^ and $ match at every line break" },
  { flag: "s", label: "dotAll", hint: "The dot . also matches newlines" },
  { flag: "u", label: "unicode", hint: "Full Unicode + \\p{…} property escapes" },
  { flag: "y", label: "sticky", hint: "Match only from the current position" },
];

/** One-click, vetted patterns to insert into the pattern field. */
const LIBRARY: { label: string; pattern: string; flags: string; sample: string }[] = [
  {
    label: "Email",
    pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
    flags: "g",
    sample: "Reach us at hello@gigai.dev or support+billing@example.co.uk.",
  },
  {
    label: "URL",
    pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*",
    flags: "gi",
    sample: "See https://gigai.dev/tools and http://example.com/path?q=1#top for more.",
  },
  {
    label: "IPv4",
    pattern: "\\b(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\b",
    flags: "g",
    sample: "Allowed hosts: 10.0.0.1, 192.168.1.255 and 8.8.8.8 (not 999.1.1.1).",
  },
  {
    label: "UUID",
    pattern:
      "\\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\b",
    flags: "gi",
    sample: "id=3F2504E0-4F89-41D3-9A0C-0305E82C3301 ref=550e8400-e29b-41d4-a716-446655440000",
  },
  {
    label: "Hex color",
    pattern: "#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b",
    flags: "g",
    sample: "Palette: #fff, #1E293B, #4f46e5 and the invalid #12g on the last swatch.",
  },
  {
    label: "Slug",
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    flags: "m",
    sample: "regex-tester\njson-formatter\nInvalid Slug\ntoo--many--dashes",
  },
  {
    label: "Date (named)",
    pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})",
    flags: "g",
    sample: "Shipped 2026-06-24, updated 2026-06-30, expires 2027-01-01.",
  },
];

/** Collapsible cheat-sheet groups. */
const CHEAT_SHEET: { title: string; rows: { token: string; meaning: string }[] }[] = [
  {
    title: "Anchors",
    rows: [
      { token: "^", meaning: "Start of string (or line with m)" },
      { token: "$", meaning: "End of string (or line with m)" },
      { token: "\\b", meaning: "Word boundary" },
      { token: "\\B", meaning: "Not a word boundary" },
    ],
  },
  {
    title: "Character classes",
    rows: [
      { token: ".", meaning: "Any char (except newline, unless s)" },
      { token: "\\d \\D", meaning: "Digit / non-digit" },
      { token: "\\w \\W", meaning: "Word char / non-word char" },
      { token: "\\s \\S", meaning: "Whitespace / non-whitespace" },
      { token: "[abc] [^abc]", meaning: "Any of / none of a set" },
      { token: "[a-z]", meaning: "Range within a set" },
    ],
  },
  {
    title: "Quantifiers",
    rows: [
      { token: "* + ?", meaning: "0+, 1+, 0 or 1" },
      { token: "{n} {n,} {n,m}", meaning: "Exactly / at least / between" },
      { token: "*? +? ??", meaning: "Lazy (as few as possible)" },
    ],
  },
  {
    title: "Groups & references",
    rows: [
      { token: "(…)", meaning: "Capturing group" },
      { token: "(?:…)", meaning: "Non-capturing group" },
      { token: "(?<name>…)", meaning: "Named capturing group" },
      { token: "\\1  \\k<name>", meaning: "Backreference (in pattern)" },
      { token: "a|b", meaning: "Alternation (a or b)" },
    ],
  },
  {
    title: "Lookaround",
    rows: [
      { token: "(?=…)", meaning: "Positive lookahead" },
      { token: "(?!…)", meaning: "Negative lookahead" },
      { token: "(?<=…)", meaning: "Positive lookbehind" },
      { token: "(?<!…)", meaning: "Negative lookbehind" },
    ],
  },
  {
    title: "Replacement",
    rows: [
      { token: "$1 $2", meaning: "Numbered group" },
      { token: "$<name>", meaning: "Named group" },
      { token: "$&", meaning: "The whole match" },
      { token: "$$", meaning: "A literal $ sign" },
    ],
  },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load a sample pattern & text" },
  { combo: "mod+shift+c", description: "Copy the full /pattern/flags literal" },
  { combo: "mod+backspace", description: "Clear pattern, flags and text" },
  { combo: "mod+/", description: "Toggle the cheat-sheet" },
];

/** Default demo the empty state offers. */
const SAMPLE = LIBRARY[0]!;

/* ────────────────────────────────────────────────────────────────────────────
 * Share encoding: pattern + flags + replacement + text in one URL payload
 * ──────────────────────────────────────────────────────────────────────────── */

interface ShareShape {
  p: string;
  f: string;
  r: string;
  t: string;
}

function encodeState(s: ShareShape): string {
  return JSON.stringify(s);
}

function decodeState(raw: string): Partial<ShareShape> {
  try {
    const v = JSON.parse(raw) as Partial<ShareShape>;
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Highlighted-text renderer
 * ──────────────────────────────────────────────────────────────────────────── */

/** Split text into plain / matched segments so we can render highlights. */
function segmentText(
  text: string,
  matches: RegexMatch[],
): { text: string; matchIndex: number | null }[] {
  if (matches.length === 0) return [{ text, matchIndex: null }];
  const segs: { text: string; matchIndex: number | null }[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    // Skip matches that overlap an already-consumed region (defensive).
    if (m.index < cursor) return;
    if (m.index > cursor) segs.push({ text: text.slice(cursor, m.index), matchIndex: null });
    const end = m.index + m.length;
    segs.push({ text: text.slice(m.index, end), matchIndex: i });
    cursor = end;
  });
  if (cursor < text.length) segs.push({ text: text.slice(cursor), matchIndex: null });
  return segs;
}

/** Apply a JS-style replacement across all matches, honouring $1/$<name>/$&/$$. */
function applyReplacement(
  text: string,
  matches: RegexMatch[],
  replacement: string,
): string {
  if (matches.length === 0) return text;
  let out = "";
  let cursor = 0;
  for (const m of matches) {
    if (m.index < cursor) continue;
    out += text.slice(cursor, m.index);
    out += expandReplacement(replacement, m);
    cursor = m.index + m.length;
  }
  out += text.slice(cursor);
  return out;
}

function expandReplacement(replacement: string, m: RegexMatch): string {
  return replacement.replace(/\$(\$|&|<([^>]+)>|\d{1,2})/g, (whole, token: string, named?: string) => {
    if (token === "$") return "$";
    if (token === "&") return m.value;
    if (named) return m.groups[named] ?? "";
    const n = Number(token);
    return m.captures[n] ?? "";
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────────── */

export default function RegexTesterTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);

  const [pattern, setPattern] = React.useState("");
  const [flagSet, setFlagSet] = React.useState<Set<string>>(() => new Set(["g"]));
  const [replacement, setReplacement] = React.useState("");
  const [showReplace, setShowReplace] = React.useState(false);
  const [text, setText] = React.useState("");
  const [showCheat, setShowCheat] = React.useState(false);

  const patternRef = React.useRef<HTMLInputElement>(null);

  const share = useShareState({
    onInit: (raw) => {
      const s = decodeState(raw);
      if (typeof s.p === "string") setPattern(s.p);
      if (typeof s.f === "string") setFlagSet(new Set(s.f.split("").filter(Boolean)));
      if (typeof s.r === "string" && s.r) {
        setReplacement(s.r);
        setShowReplace(true);
      }
      if (typeof s.t === "string") setText(s.t);
    },
  });

  const flags = React.useMemo(
    () => FLAGS.map((f) => f.flag).filter((f) => flagSet.has(f)).join(""),
    [flagSet],
  );

  const toggleFlag = React.useCallback((flag: string) => {
    setFlagSet((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }, []);

  // Live evaluation. `runRegex` forces the global flag internally so every
  // match surfaces; it never throws, invalid patterns return a typed error.
  const result = React.useMemo(
    () => (pattern ? runRegex(pattern, flags, text) : null),
    [pattern, flags, text],
  );
  // Memoized so the `[]` fallback can't mint a new array every render
  // (it feeds the useMemo dependency arrays below).
  const matches = React.useMemo(
    () => (result?.ok ? result.matches : []),
    [result],
  );
  const errorMsg = result && !result.ok ? result.error.message : null;

  const hasNamedGroups = React.useMemo(
    () => matches.some((m) => Object.keys(m.groups).length > 0),
    [matches],
  );
  const maxCaptures = React.useMemo(
    () => matches.reduce((n, m) => Math.max(n, m.captures.length - 1), 0),
    [matches],
  );

  const segments = React.useMemo(() => segmentText(text, matches), [text, matches]);

  const replacedText = React.useMemo(
    () => (result?.ok ? applyReplacement(text, matches, replacement) : text),
    [result, text, matches, replacement],
  );

  /* ── Actions ─────────────────────────────────────────────────────────────── */

  const literal = React.useCallback(() => {
    if (!pattern) return "";
    return `/${pattern}/${flags}`;
  }, [pattern, flags]);

  const loadSample = React.useCallback(() => {
    setPattern(SAMPLE.pattern);
    setFlagSet(new Set(SAMPLE.flags.split("")));
    setText(SAMPLE.sample);
    patternRef.current?.focus();
  }, []);

  const insertPattern = React.useCallback((entry: (typeof LIBRARY)[number]) => {
    setPattern(entry.pattern);
    setFlagSet(new Set(entry.flags.split("")));
    // Seed the sample only if the user hasn't typed their own test string.
    setText((cur) => (cur.trim() ? cur : entry.sample));
    patternRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setPattern("");
    setFlagSet(new Set(["g"]));
    setReplacement("");
    setText("");
    patternRef.current?.focus();
  }, []);

  const doShare = React.useCallback(() => {
    if (!pattern && !text) return;
    void share.copyShareLink(encodeState({ p: pattern, f: flags, r: replacement, t: text }));
  }, [pattern, flags, replacement, text, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file
      .text()
      .then((t) => setText(t))
      .catch(() => undefined);
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+shift+c": () => {
      const out = literal();
      if (out) void navigator.clipboard.writeText(out).catch(() => undefined);
    },
    "mod+/": () => setShowCheat((s) => !s),
  });

  const isEmpty = !pattern && !text;

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton icon="Sparkles" label="Sample" kbd="mod+enter" onClick={loadSample} />
        <ToolbarButton
          icon="Replace"
          label="Replace"
          variant={showReplace ? "active" : "default"}
          aria-pressed={showReplace}
          onClick={() => setShowReplace((s) => !s)}
        />
        <ToolbarButton
          icon="BookOpen"
          label="Cheat-sheet"
          kbd="mod+/"
          variant={showCheat ? "active" : "default"}
          aria-pressed={showCheat}
          onClick={() => setShowCheat((s) => !s)}
        />
        <ToolbarDivider />
        <CopyButton
          label="Copy /regex/"
          kbd="mod+shift+c"
          getValue={literal}
          disabled={!pattern}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={!pattern && !text}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={isEmpty}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Pattern + flags row ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label htmlFor="regex-pattern" className="text-xs font-medium text-muted-foreground">
          Regular expression
        </label>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div
            className={cn(
              "flex flex-1 items-center gap-2 rounded-md border bg-background px-2.5 font-mono text-sm transition-colors focus-within:ring-2 focus-within:ring-ring/20",
              errorMsg ? "border-destructive/60" : "border-border focus-within:border-ring/60",
            )}
          >
            <span aria-hidden className="select-none text-muted-foreground/60">/</span>
            <input
              id="regex-pattern"
              ref={patternRef}
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="\b\w+@\w+\.\w+\b"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={errorMsg ? true : undefined}
              className="min-w-0 flex-1 bg-transparent py-2 text-foreground outline-none placeholder:text-muted-foreground/50"
            />
            <span aria-hidden className="select-none text-muted-foreground/60">/{flags}</span>
          </div>

          {/* Flag toggle buttons */}
          <div className="flex flex-wrap gap-1" role="group" aria-label="Regex flags">
            {FLAGS.map(({ flag, label, hint }) => {
              const on = flagSet.has(flag);
              return (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  aria-pressed={on}
                  title={`${flag} · ${label}, ${hint}`}
                  className={cn(
                    "flex size-9 flex-col items-center justify-center rounded-md border font-mono text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    on
                      ? cn(accent.soft, accent.border)
                      : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {flag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {errorMsg && <ErrorBanner error={errorMsg} />}

      {/* ── Pattern library ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Icon name="Library" size={13} /> Library
        </span>
        {LIBRARY.map((entry) => (
          <button
            key={entry.label}
            type="button"
            onClick={() => insertPattern(entry)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Plus" size={11} />
            {entry.label}
          </button>
        ))}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span className={cn("flex size-12 items-center justify-center rounded-full", accent.soft)}>
            <Icon name="Regex" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Write a pattern to see it match, live
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every match highlights inside your test string, with a full breakdown of
              capture groups. Everything runs in your browser: nothing is uploaded.
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
            <Icon name="Sparkles" size={14} /> Try a sample
          </button>
        </div>
      )}

      {/* ── Test string + highlighted output ────────────────────────────────── */}
      {!isEmpty && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Editable test string */}
            <div className="relative">
              <CodePane
                id="regex-test"
                value={text}
                onChange={setText}
                label="Test string"
                placeholder="Paste or type the text to match against…"
                onDropText={setText}
                lineNumbers
                wrap
                showStats
                minHeight={200}
                maxHeight={420}
                fontSize={13}
                ariaLabel="Test string"
              />
              {isDragging && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
                  <span className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Icon name="Upload" size={16} /> Drop a .txt or .log file
                  </span>
                </div>
              )}
            </div>

            {/* Highlighted matches */}
            <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon name="Highlighter" size={14} className={accent.text} />
                  Matches
                </div>
                {pattern && !errorMsg && (
                  <StatBadge
                    tone={matches.length ? "success" : "default"}
                    icon={matches.length ? "Check" : "Search"}
                    value={
                      matches.length === 1
                        ? "1 match"
                        : `${matches.length} matches`
                    }
                  />
                )}
              </div>
              <div
                aria-live="polite"
                className="min-h-[200px] max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-relaxed text-foreground"
              >
                {text.length === 0 ? (
                  <span className="text-muted-foreground/60">
                    Matches will be highlighted here.
                  </span>
                ) : matches.length === 0 ? (
                  <span className="text-muted-foreground">
                    {pattern
                      ? "No matches for this pattern."
                      : "Enter a pattern to highlight matches."}
                  </span>
                ) : (
                  segments.map((seg, i) =>
                    seg.matchIndex === null ? (
                      <span key={i}>{seg.text}</span>
                    ) : (
                      <mark
                        key={i}
                        title={`Match ${seg.matchIndex + 1}`}
                        className={cn(
                          "rounded-[3px] px-0.5",
                          accent.soft,
                          "ring-1",
                          accent.border,
                        )}
                      >
                        {seg.text.length === 0 ? "∅" : seg.text}
                      </mark>
                    ),
                  )
                )}
              </div>
            </div>
          </div>

          {/* ── Replace panel ─────────────────────────────────────────────────── */}
          {showReplace && (
            <div className="overflow-hidden rounded-lg border border-border bg-card/60">
              <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                <Icon name="Replace" size={14} className={accent.text} />
                Replace with
                <span className="font-normal text-muted-foreground">
                  - use $1, $&lt;name&gt;, $&amp; or $$
                </span>
              </div>
              <div className="flex flex-col gap-3 p-3">
                <input
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Replacement, e.g. [$&] or $<year>"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Replacement string"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/20"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Preview</span>
                  <CopyButton
                    label="Copy result"
                    value={replacedText}
                    disabled={!result?.ok}
                    labelMode="responsive"
                  />
                </div>
                <div className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background p-3 font-mono text-[13px] leading-relaxed text-foreground">
                  {replacedText.length === 0 ? (
                    <span className="text-muted-foreground/60">(empty result)</span>
                  ) : (
                    replacedText
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Match / group table ───────────────────────────────────────────── */}
          {pattern && !errorMsg && matches.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border bg-card/60">
              <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon name="Table2" size={14} className={accent.text} />
                  Match details
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {maxCaptures > 0 && (
                    <StatBadge
                      icon="Parentheses"
                      value={`${maxCaptures} group${maxCaptures === 1 ? "" : "s"}`}
                    />
                  )}
                  {hasNamedGroups && (
                    <StatBadge tone="info" icon="Tag" value="named groups" />
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-semibold">#</th>
                      <th className="px-3 py-2 font-semibold">Match</th>
                      <th className="px-3 py-2 font-semibold">Index</th>
                      <th className="px-3 py-2 font-semibold">Len</th>
                      {maxCaptures > 0 && (
                        <th className="px-3 py-2 font-semibold">Groups</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {matches.slice(0, 500).map((m, i) => (
                      <tr
                        key={`${m.index}-${i}`}
                        className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-3 py-2 align-top text-muted-foreground">{i + 1}</td>
                        <td className="max-w-[22rem] px-3 py-2 align-top">
                          <span
                            className={cn(
                              "rounded px-1 py-0.5",
                              accent.soft,
                            )}
                          >
                            {m.value.length === 0 ? "∅ (empty)" : m.value}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top text-muted-foreground">{m.index}</td>
                        <td className="px-3 py-2 align-top text-muted-foreground">{m.length}</td>
                        {maxCaptures > 0 && (
                          <td className="px-3 py-2 align-top">
                            <GroupCells match={m} accentText={accent.text} />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {matches.length > 500 && (
                <p className="border-t border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  Showing the first 500 of {matches.length} matches in the table - highlighting
                  covers them all.
                </p>
              )}
            </div>
          )}

          {/* ── Cheat-sheet ───────────────────────────────────────────────────── */}
          {showCheat && (
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="BookOpen" size={14} className={accent.text} />
                Regex quick reference
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CHEAT_SHEET.map((group) => (
                  <div key={group.title} className="min-w-0">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.title}
                    </p>
                    <dl className="flex flex-col gap-1">
                      {group.rows.map((row) => (
                        <div key={row.token} className="flex items-baseline gap-2">
                          <dt
                            className={cn(
                              "shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
                              accent.text,
                            )}
                          >
                            {row.token}
                          </dt>
                          <dd className="min-w-0 text-xs text-muted-foreground">{row.meaning}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Your pattern and test string are evaluated entirely in this browser tab using the
          native RegExp engine. The same one that runs your JavaScript. Nothing is uploaded,
          so it&apos;s safe to test against real log lines or tokens.
        </span>
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Capture-group cell renderer
 * ──────────────────────────────────────────────────────────────────────────── */

function GroupCells({ match, accentText }: { match: RegexMatch; accentText: string }) {
  const numbered = match.captures.slice(1); // group 0 is the full match
  const namedEntries = Object.entries(match.groups);

  return (
    <div className="flex flex-col gap-1">
      {numbered.map((cap, gi) => (
        <div key={`n-${gi}`} className="flex items-baseline gap-1.5">
          <span className={cn("shrink-0 text-xs font-semibold", accentText)}>${gi + 1}</span>
          <GroupValue value={cap} />
        </div>
      ))}
      {namedEntries.map(([name, cap]) => (
        <div key={`g-${name}`} className="flex items-baseline gap-1.5">
          <span className={cn("shrink-0 break-all text-xs font-semibold", accentText)}>
            {"$<"}
            {name}
            {">"}
          </span>
          <GroupValue value={cap} />
        </div>
      ))}
    </div>
  );
}

function GroupValue({ value }: { value: string | undefined }) {
  return (
    <span className="min-w-0 break-all text-xs text-muted-foreground">
      {value === undefined ? (
        <span className="italic opacity-60">undefined</span>
      ) : value.length === 0 ? (
        <span className="italic opacity-60">(empty)</span>
      ) : (
        value
      )}
    </span>
  );
}
