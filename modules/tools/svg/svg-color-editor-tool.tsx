"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  download,
  ExamplesMenu,
  Field,
  NumberStepper,
  ShortcutsHelp,
  StatBadge,
  ToolbarButton,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import { SvgWorkspace, svgToPng, readSvgDimensions } from "@/components/tool/svg";

/* ────────────────────────────────────────────────────────────────────────────
 * Color detection & remap engine (self-contained, token-accurate)
 *
 * We only ever rewrite color values that live in color-bearing *attributes*
 * (fill, stroke, stop-color, flood-color, lighting-color, color) and in the
 * color declarations of inline `style` attributes. Path data, IDs, class names
 * and unrelated markup are never touched, so a remap can't corrupt geometry.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Attributes whose value is a paint/color token we may recolor. */
const COLOR_ATTRS = [
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
  "color",
] as const;

/** style-property names that carry a color we may recolor. */
const COLOR_STYLE_PROPS = COLOR_ATTRS;

/** Tokens that are valid in a color attribute but carry no paintable color. */
const NON_COLOR_TOKENS = new Set(["none", "inherit", "transparent", "currentcolor"]);

/** One detected color and everywhere it is used. */
interface Swatch {
  /** Canonical key (lower-cased original token) used for de-duplication. */
  key: string;
  /** The original token exactly as written the first time we saw it. */
  original: string;
  /** How many attribute/style occurrences use this color. */
  count: number;
}

/** Minimal CSS named-color table, enough to render swatches + drive a picker. */
const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  navy: "#000080",
  teal: "#008080",
  aqua: "#00ffff",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  fuchsia: "#ff00ff",
  lime: "#00ff00",
  maroon: "#800000",
  olive: "#808000",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  gold: "#ffd700",
  indigo: "#4b0082",
  violet: "#ee82ee",
  crimson: "#dc143c",
  salmon: "#fa8072",
  coral: "#ff7f50",
  turquoise: "#40e0d0",
  tan: "#d2b48c",
  beige: "#f5f5dc",
};

/**
 * A single regex that matches a color-bearing attribute (e.g. `fill="#abc"`)
 * OR a color declaration inside a style attribute. We reuse it for both
 * detection and replacement so the two can never drift apart.
 *
 * Groups: 1 = attr name, 2 = quote, 3 = attr value | 4 = style prop, 5 = style value.
 */
function makeColorRegex(): RegExp {
  const attrs = COLOR_ATTRS.join("|");
  const props = COLOR_STYLE_PROPS.join("|");
  // attribute form: name="value"  |  style property form: prop: value
  // The style property must be preceded by a boundary so we never match a
  // substring of another word, a `;`, `{`, whitespace, a style-attr opening
  // quote (`style="fill:…"` → the first prop), or the very start of input.
  return new RegExp(
    `(${attrs})\\s*=\\s*(["'])([^"']*)\\2` +
      `|(?:^|[;{\\s"'])(${props})\\s*:\\s*([^;}"']+)`,
    "gi",
  );
}

/** True if a token is an actual paintable color (not none/inherit/url(...)). */
function isPaintColor(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  if (!t) return false;
  if (NON_COLOR_TOKENS.has(t)) return false;
  if (t.startsWith("url(")) return false;
  return (
    /^#[0-9a-f]{3,8}$/i.test(t) ||
    /^rgba?\(/i.test(t) ||
    /^hsla?\(/i.test(t) ||
    Object.prototype.hasOwnProperty.call(NAMED_COLORS, t)
  );
}

/** Detect every distinct paint color and its usage count. */
function detectSwatches(svg: string): Swatch[] {
  const re = makeColorRegex();
  const map = new Map<string, Swatch>();
  let m: RegExpExecArray | null;

  const consider = (raw: string) => {
    const token = raw.trim();
    if (!isPaintColor(token)) return;
    const key = token.toLowerCase();
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { key, original: token, count: 1 });
  };

  while ((m = re.exec(svg))) {
    if (m[3] !== undefined) {
      // Attribute value, a single color token.
      consider(m[3]);
    } else if (m[5] !== undefined) {
      // style declaration value, a single color token.
      consider(m[5]);
    }
  }

  // Sort by usage (dominant colors first), then by token for stability.
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.key.localeCompare(b.key),
  );
}

/**
 * Rewrite the SVG so that any color whose lower-cased token is a key in
 * `mapping` is replaced by the mapped value: only inside color-bearing
 * attributes and style declarations.
 */
function applyMapping(svg: string, mapping: Map<string, string>): string {
  if (mapping.size === 0) return svg;
  const re = makeColorRegex();

  return svg.replace(re, (match, attrName, quote, attrValue, styleProp, styleValue) => {
    if (attrValue !== undefined) {
      const next = mapping.get(String(attrValue).trim().toLowerCase());
      if (next === undefined) return match;
      return `${attrName}=${quote}${next}${quote}`;
    }
    if (styleValue !== undefined) {
      const next = mapping.get(String(styleValue).trim().toLowerCase());
      if (next === undefined) return match;
      // Keep whatever boundary char/whitespace the regex matched before the
      // property name (`;`, `{`, or leading space), then rewrite `prop: value`.
      const prefix = match.slice(0, match.indexOf(String(styleProp)));
      return `${prefix}${styleProp}: ${next}`;
    }
    return match;
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Color math for palette-wide actions
 * ──────────────────────────────────────────────────────────────────────────── */

/** Resolve a token to {r,g,b,a} in 0-255 / 0-1, or null if not resolvable. */
function toRgb(token: string): { r: number; g: number; b: number; a: number } | null {
  const t = token.trim().toLowerCase();
  const named = NAMED_COLORS[t];
  const hex = named ?? t;
  const hm = /^#([0-9a-f]{3,8})$/i.exec(hex);
  if (hm) {
    const h = hm[1]!;
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0]! + h[0]!, 16);
      const g = parseInt(h[1]! + h[1]!, 16);
      const b = parseInt(h[2]! + h[2]!, 16);
      const a = h.length === 4 ? parseInt(h[3]! + h[3]!, 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }
  const rm = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\s*\)$/i.exec(t);
  if (rm) {
    const a = rm[4]
      ? rm[4].endsWith("%")
        ? parseFloat(rm[4]) / 100
        : parseFloat(rm[4])
      : 1;
    return {
      r: Math.round(parseFloat(rm[1]!)),
      g: Math.round(parseFloat(rm[2]!)),
      b: Math.round(parseFloat(rm[3]!)),
      a,
    };
  }
  return null;
}

/** {r,g,b} → #rrggbb (drops alpha; picker/preview friendly). */
function toHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * A picker-safe #rrggbb for a token (native <input type=color> only accepts
 * 6-digit hex). Falls back to a neutral gray for tokens we can't resolve.
 */
function pickerHex(token: string): string {
  const rgb = toRgb(token);
  return rgb ? toHex(rgb.r, rgb.g, rgb.b) : "#888888";
}

/** A CSS-safe swatch background; transparent for un-paintable tokens. */
function swatchBackground(token: string): string {
  const t = token.trim().toLowerCase();
  if (!t || NON_COLOR_TOKENS.has(t)) return "transparent";
  return token;
}

function invertToken(token: string): string {
  const rgb = toRgb(token);
  if (!rgb) return token;
  return toHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

function desaturateToken(token: string): string {
  const rgb = toRgb(token);
  if (!rgb) return token;
  const y = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return toHex(y, y, y);
}

function randomHex(): string {
  return toHex(
    Math.random() * 255,
    Math.random() * 255,
    Math.random() * 255,
  );
}

/** Trim a long token for display without losing meaning. */
function shortToken(c: string): string {
  return c.length > 22 ? `${c.slice(0, 21)}…` : c;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Starter SVGs, one click from a real, multi-color graphic to recolor.
 * ──────────────────────────────────────────────────────────────────────────── */

const STARTER_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect x="8" y="8" width="104" height="104" rx="24" fill="#6366f1"/>
  <path d="M40 78 L60 34 L80 78 Z" fill="#f8fafc"/>
  <circle cx="60" cy="86" r="7" fill="#22d3ee"/>
</svg>`;

const STARTER_GRADIENT = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#g)"/>
  <circle cx="60" cy="60" r="26" fill="#ffffff" fill-opacity="0.9"/>
</svg>`;

const STARTER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" fill="#fde047" stroke="#ca8a04"/>
</svg>`;

const STARTER_STYLED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect x="10" y="10" width="80" height="80" rx="16" style="fill: #10b981. Stroke: #065f46. Stroke-width: 4"/>
  <path d="M32 52 L46 66 L70 38" style="fill:none; stroke:#ffffff; stroke-width:6"/>
</svg>`;

const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Multi-color logo",
    description: "Three flat fills to remap",
    value: STARTER_LOGO,
    icon: "Hexagon",
  },
  {
    label: "Gradient mark",
    description: "Recolor via gradient stops",
    value: STARTER_GRADIENT,
    icon: "Blend",
  },
  {
    label: "Two-tone icon",
    description: "Fill + stroke colors",
    value: STARTER_ICON,
    icon: "Star",
  },
  {
    label: "Inline-styled",
    description: "Colors set in style=…",
    value: STARTER_STYLED,
    icon: "Braces",
  },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+z", description: "Undo recolor" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+shift+c", description: "Swap all to currentColor" },
  { combo: "mod+shift+r", description: "Reset all colors" },
  { combo: "mod+shift+k", description: "Shuffle palette" },
  { combo: "mod+shift+backspace", description: "Clear the editor" },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Swatch row
 * ──────────────────────────────────────────────────────────────────────────── */

function SwatchRow({
  swatch,
  current,
  changed,
  onChange,
  onReset,
}: {
  swatch: Swatch;
  current: string;
  changed: boolean;
  onChange: (next: string) => void;
  onReset: () => void;
}) {
  const [text, setText] = React.useState(current);
  React.useEffect(() => setText(current), [current]);

  const commitText = React.useCallback(() => {
    const v = text.trim();
    if (v && v !== current) onChange(v);
    else setText(current);
  }, [text, current, onChange]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
      {/* Picker + live swatch (native color input for accessibility) */}
      <label
        className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border/70"
        style={{ background: swatchBackground(current) }}
        title={`Pick a color for ${swatch.original}`}
      >
        {swatchBackground(current) === "transparent" && (
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#0002 25%,transparent 25%,transparent 75%,#0002 75%,#0002),linear-gradient(45deg,#0002 25%,transparent 25%,transparent 75%,#0002 75%,#0002)",
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0,4px 4px",
            }}
          />
        )}
        <input
          type="color"
          value={pickerHex(current)}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={`Color for ${swatch.original}`}
        />
      </label>

      {/* Hex / token field + meta */}
      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText();
            }
          }}
          spellCheck={false}
          className="w-full rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
          aria-label={`New color value for ${swatch.original}`}
        />
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="tabular-nums">×{swatch.count}</span>
          {changed && (
            <span
              className="truncate font-mono"
              title={`Original: ${swatch.original}`}
            >
              was {shortToken(swatch.original)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        disabled={!changed}
        className={cn(
          "shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors",
          changed
            ? "hover:bg-muted hover:text-foreground"
            : "cursor-default opacity-30",
        )}
        title="Reset this color to the original"
        aria-label={`Reset ${swatch.original} to original`}
      >
        <Icon name="RotateCcw" size={14} />
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * SVG Color Editor tool
 *
 * Source of truth is the *original* SVG plus a `mapping` of lower-cased
 * original-token → new value. The recolored SVG shown/exported is derived by
 * `applyMapping`. Each mapping change is one undoable history step, so undo/redo
 * moves through recolors, not keystrokes.
 * ──────────────────────────────────────────────────────────────────────────── */

/** History state: original source + the active color remap. */
interface EditorState {
  source: string;
  /** original-token(lower) → replacement value. */
  mapping: Record<string, string>;
}

const EMPTY_STATE: EditorState = { source: "", mapping: {} };

export default function SvgColorEditorTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<EditorState>(EMPTY_STATE, { debounceMs: 250 });
  const { source, mapping } = history.state;

  const share = useShareState({
    onInit: (value) => {
      // Deep links carry the raw SVG source only; recolors start fresh.
      history.reset({ source: value, mapping: {} });
    },
  });

  const [pngScale, setPngScale] = React.useState(2);
  const [exporting, setExporting] = React.useState(false);
  const [pngError, setPngError] = React.useState<string | null>(null);
  const hasContent = source.trim().length > 0;

  // Detected swatches from the ORIGINAL source (stable identity for the list).
  const swatches = React.useMemo<Swatch[]>(
    () => (hasContent ? detectSwatches(source) : []),
    [source, hasContent],
  );

  // The recolored SVG that drives the preview, copy, download and export.
  const mappingRef = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const [k, v] of Object.entries(mapping)) m.set(k, v);
    return m;
  }, [mapping]);

  const output = React.useMemo(
    () => (hasContent ? applyMapping(source, mappingRef) : source),
    [source, mappingRef, hasContent],
  );

  const changedCount = React.useMemo(
    () => swatches.filter((s) => mapping[s.key] !== undefined).length,
    [swatches, mapping],
  );

  /* ── State transitions (each is one undoable step) ── */

  const setSource = React.useCallback(
    (next: string) => {
      history.set({ source: next, mapping: {} });
    },
    [history],
  );

  const setColor = React.useCallback(
    (swatch: Swatch, next: string) => {
      const nextMapping = { ...history.state.mapping };
      if (next.trim().toLowerCase() === swatch.key) {
        delete nextMapping[swatch.key];
      } else {
        nextMapping[swatch.key] = next.trim();
      }
      history.set({ source: history.state.source, mapping: nextMapping });
    },
    [history],
  );

  const resetColor = React.useCallback(
    (swatch: Swatch) => {
      const nextMapping = { ...history.state.mapping };
      delete nextMapping[swatch.key];
      history.set({ source: history.state.source, mapping: nextMapping });
    },
    [history],
  );

  const currentValue = React.useCallback(
    (swatch: Swatch) => mapping[swatch.key] ?? swatch.original,
    [mapping],
  );

  /** Rebuild the whole mapping from a per-swatch transform of the CURRENT value. */
  const remapAll = React.useCallback(
    (fn: (currentToken: string, swatch: Swatch) => string) => {
      if (swatches.length === 0) return;
      const cur = history.state.mapping;
      const next: Record<string, string> = {};
      for (const s of swatches) {
        const token = cur[s.key] ?? s.original;
        const mapped = fn(token, s);
        if (mapped.trim().toLowerCase() !== s.key) next[s.key] = mapped;
      }
      history.set({ source: history.state.source, mapping: next });
    },
    [swatches, history],
  );

  const swapCurrentColor = React.useCallback(
    () => remapAll(() => "currentColor"),
    [remapAll],
  );
  const invertAll = React.useCallback(
    () => remapAll((t) => invertToken(t)),
    [remapAll],
  );
  const desaturateAll = React.useCallback(
    () => remapAll((t) => desaturateToken(t)),
    [remapAll],
  );
  const shuffleAll = React.useCallback(
    () => remapAll(() => randomHex()),
    [remapAll],
  );
  const resetAll = React.useCallback(() => {
    if (Object.keys(history.state.mapping).length === 0) return;
    history.set({ source: history.state.source, mapping: {} });
  }, [history]);

  const reset = React.useCallback(() => {
    history.reset(EMPTY_STATE);
  }, [history]);

  const handleShare = React.useCallback(() => {
    if (hasContent) void share.copyShareLink(source);
  }, [hasContent, source, share]);

  const exportPng = React.useCallback(async () => {
    if (!hasContent || exporting) return;
    setExporting(true);
    setPngError(null);
    try {
      const dims = readSvgDimensions(output);
      const baseW = dims.width ?? dims.viewBox?.[2] ?? 512;
      const baseH = dims.height ?? dims.viewBox?.[3] ?? 512;
      const blob = await svgToPng(output, baseW * pngScale, baseH * pngScale, undefined);
      download(`recolored@${pngScale}x.png`, blob, "image/png");
    } catch {
      setPngError("Couldn't render a PNG from this SVG. Check that it's valid markup.");
    } finally {
      setExporting(false);
    }
  }, [output, pngScale, hasContent, exporting]);

  /* ── Keyboard ── */
  useShortcuts(
    {
      "mod+z": (e) => {
        e.preventDefault();
        history.undo();
      },
      "mod+shift+z": (e) => {
        e.preventDefault();
        history.redo();
      },
      "mod+y": (e) => {
        e.preventDefault();
        history.redo();
      },
      "mod+shift+c": (e) => {
        e.preventDefault();
        swapCurrentColor();
      },
      "mod+shift+r": (e) => {
        e.preventDefault();
        resetAll();
      },
      "mod+shift+k": (e) => {
        e.preventDefault();
        shuffleAll();
      },
      "mod+shift+backspace": (e) => {
        e.preventDefault();
        history.reset(EMPTY_STATE);
      },
    },
    { allowInInputs: true },
  );

  /* ── Options panel: palette actions + swatch list ── */
  const optionControls = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Palette
        </span>
        <ToolbarButton
          icon="Type"
          label="currentColor"
          onClick={swapCurrentColor}
          disabled={swatches.length === 0}
        />
        <ToolbarButton
          icon="Contrast"
          label="Invert"
          onClick={invertAll}
          disabled={swatches.length === 0}
        />
        <ToolbarButton
          icon="Droplet"
          label="Grayscale"
          onClick={desaturateAll}
          disabled={swatches.length === 0}
        />
        <ToolbarButton
          icon="Shuffle"
          label="Shuffle"
          onClick={shuffleAll}
          disabled={swatches.length === 0}
        />
        <ToolbarButton
          icon="RotateCcw"
          label="Reset all"
          variant={changedCount > 0 ? "active" : "default"}
          onClick={resetAll}
          disabled={changedCount === 0}
        />
      </div>

      {swatches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <StatBadge label="Colors" value={swatches.length} icon="Palette" tone="info" />
          {changedCount > 0 && (
            <StatBadge label="Changed" value={changedCount} icon="Pencil" tone="success" />
          )}
        </div>
      )}

      {pngError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <Icon name="TriangleAlert" size={13} className="shrink-0" />
          {pngError}
        </p>
      )}

      {swatches.length > 0 ? (
        <div className="border-t border-border/60 pt-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Colors. Click a swatch or type a value
          </h4>
          <div className="flex max-h-[26rem] flex-col gap-1.5 overflow-y-auto pr-1">
            {swatches.map((s) => (
              <SwatchRow
                key={s.key}
                swatch={s}
                current={currentValue(s)}
                changed={mapping[s.key] !== undefined}
                onChange={(next) => setColor(s, next)}
                onReset={() => resetColor(s)}
              />
            ))}
          </div>
        </div>
      ) : hasContent ? (
        <p className="flex items-center gap-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <Icon name="Info" size={13} className="shrink-0" />
          No editable colors found. This SVG may only use url(#…) gradient
          references, edit the gradient stops, or inherit its color.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Paste SVG markup, drop a.svg file, or load a sample, every fill,
          stroke and gradient-stop color becomes a swatch you can recolor live.
        </p>
      )}
    </div>
  );

  const toolbarExtra = (
    <>
      <ToolbarButton
        icon="Undo2"
        label="Undo"
        onClick={history.undo}
        disabled={!history.canUndo}
      />
      <ToolbarButton
        icon="Redo2"
        label="Redo"
        onClick={history.redo}
        disabled={!history.canRedo}
      />
      <ToolbarButton
        icon="Image"
        label="PNG"
        onClick={() => void exportPng()}
        disabled={!hasContent}
        loading={exporting}
      />
      <ExamplesMenu
        examples={EXAMPLES}
        onPick={(value) => setSource(value)}
        label="Samples"
      />
      <ShortcutsHelp shortcuts={SHORTCUTS} />
    </>
  );

  const previewToolbarExtra = (
    <Field label="PNG scale">
      <NumberStepper
        value={pngScale}
        onChange={setPngScale}
        min={1}
        max={8}
        step={1}
        ariaLabel="PNG export scale"
      />
    </Field>
  );

  return (
    <SvgWorkspace
      input={source}
      onInputChange={setSource}
      output={output}
      inputLabel="SVG source"
      placeholder="Paste SVG markup, drop a .svg file, or load a sample…"
      filename="recolored.svg"
      copyTarget="output"
      options={optionControls}
      toolbarExtra={toolbarExtra}
      previewToolbarExtra={previewToolbarExtra}
      onReset={reset}
      onShare={handleShare}
      shareJustCopied={share.justCopied}
      emptyLabel="Recolored preview appears here"
    />
  );
}
