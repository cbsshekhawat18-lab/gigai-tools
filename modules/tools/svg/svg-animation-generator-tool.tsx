"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { getSvgRoot, serialize } from "@/lib/svg-tools/core";
import { SvgWorkspace } from "@/components/tool/svg";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  ErrorBanner,
  ExamplesMenu,
  Field,
  SegmentedControl,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useHistory,
  useShortcuts,
  ShortcutsHelp,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * Animation model
 *
 * The engine is fully local + pure: it parses the incoming SVG, wraps the
 * drawable content in a class-tagged <g> so a single @keyframes rule drives the
 * whole graphic, centres transforms on the viewBox so spins/pulses stay in
 * frame, and emits either an inlined <style> block (CSS mode) or native SMIL
 * <animate>/<animateTransform> elements (SMIL mode). Nothing here touches the
 * network: it's all string/DOM work that runs in the browser.
 * ──────────────────────────────────────────────────────────────────────────── */

/** One animation in the library: metadata + its @keyframes body. */
interface AnimDef {
  label: string;
  icon: string;
  blurb: string;
  /** Category for browsing. */
  cat: "Loop" | "Attention" | "Entrance" | "Path";
  /** The inside of `@keyframes gigai-<key>{ … }`. */
  frames: string;
  /** True for transform animations that must be centred on the shape. */
  centered?: boolean;
}
type Preset = string;
type OutputMode = "css" | "smil";
type Easing = "linear" | "ease" | "ease-in-out" | "spring";
type Iteration = "infinite" | "1";

interface AnimSettings {
  preset: Preset;
  duration: number; // seconds
  delay: number; // seconds
  easing: Easing;
  iteration: Iteration;
  mode: OutputMode;
}

const DEFAULT_SETTINGS: AnimSettings = {
  preset: "spin",
  duration: 1.2,
  delay: 0,
  easing: "linear",
  iteration: "infinite",
  mode: "css",
};

/** Stable hook class the generated keyframes target. */
const HOOK_CLASS = "gigai-anim";

/** Spring-like cubic-bézier used for the "spring" easing choice. */
const SPRING_BEZIER = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/**
 * The animation LIBRARY, one engine, many motions. Each `frames` is the body of
 * `@keyframes gigai-<key>`; the classic six keep their keys so SMIL still works.
 */
const ANIMS: Record<string, AnimDef> = {
  // ── Loop / idle ─────────────────────────────────────────
  spin: { label: "Spin", icon: "RotateCw", cat: "Loop", centered: true, blurb: "Continuous rotation: loaders & spinners.", frames: "from{transform:rotate(0)}to{transform:rotate(360deg)}" },
  spinReverse: { label: "Spin reverse", icon: "RotateCcw", cat: "Loop", centered: true, blurb: "Rotation, the other way.", frames: "from{transform:rotate(0)}to{transform:rotate(-360deg)}" },
  pulse: { label: "Pulse", icon: "Radio", cat: "Loop", centered: true, blurb: "Scale in and out to draw attention.", frames: "0%,100%{transform:scale(1)}50%{transform:scale(1.12)}" },
  morph: { label: "Breathe", icon: "Shrink", cat: "Loop", centered: true, blurb: "Gentle scale + rotate idle.", frames: "0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.06) rotate(2deg)}" },
  float: { label: "Float", icon: "ArrowUp", cat: "Loop", blurb: "Soft hover up and down.", frames: "0%,100%{transform:translateY(0)}50%{transform:translateY(-8%)}" },
  sway: { label: "Sway", icon: "MoveHorizontal", cat: "Loop", blurb: "Drift side to side.", frames: "0%,100%{transform:translateX(0)}50%{transform:translateX(6%)}" },
  blink: { label: "Blink", icon: "Eye", cat: "Loop", blurb: "Fade fully out and back.", frames: "0%,100%{opacity:1}50%{opacity:0}" },
  glow: { label: "Glow", icon: "Sparkle", cat: "Loop", blurb: "Soft opacity throb.", frames: "0%,100%{opacity:0.65}50%{opacity:1}" },
  ping: { label: "Ping", icon: "Radar", cat: "Loop", centered: true, blurb: "Expand and fade, like a radar ping.", frames: "0%{transform:scale(1);opacity:1}75%,100%{transform:scale(1.6);opacity:0}" },
  heartbeat: { label: "Heartbeat", icon: "Heart", cat: "Loop", centered: true, blurb: "Double-thump pulse.", frames: "0%,100%{transform:scale(1)}14%{transform:scale(1.15)}28%{transform:scale(1)}42%{transform:scale(1.15)}70%{transform:scale(1)}" },
  // ── Attention ───────────────────────────────────────────
  bounce: { label: "Bounce", icon: "ArrowDownUp", cat: "Attention", blurb: "Playful vertical bob.", frames: "0%,100%{transform:translateY(0)}50%{transform:translateY(-12%)}" },
  shake: { label: "Shake", icon: "Vibrate", cat: "Attention", centered: true, blurb: "Horizontal shake for errors/alerts.", frames: "0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8%)}40%,80%{transform:translateX(8%)}" },
  wobble: { label: "Wobble", icon: "Waves", cat: "Attention", centered: true, blurb: "Rock left and right.", frames: "0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}" },
  wiggle: { label: "Wiggle", icon: "Wind", cat: "Attention", centered: true, blurb: "Quick playful jiggle.", frames: "0%,100%{transform:rotate(0)}30%{transform:rotate(-4deg)}70%{transform:rotate(4deg)}" },
  swing: { label: "Swing", icon: "Anchor", cat: "Attention", centered: true, blurb: "Pendulum swing.", frames: "0%,100%{transform:rotate(0)}25%{transform:rotate(12deg)}75%{transform:rotate(-8deg)}" },
  jello: { label: "Jello", icon: "Cherry", cat: "Attention", centered: true, blurb: "Wobbly skew, like jelly.", frames: "0%,100%{transform:skewX(0) skewY(0)}30%{transform:skewX(-8deg) skewY(-8deg)}60%{transform:skewX(4deg) skewY(4deg)}" },
  tada: { label: "Tada", icon: "PartyPopper", cat: "Attention", centered: true, blurb: "Celebratory pop + shake.", frames: "0%,100%{transform:scale(1) rotate(0)}10%,20%{transform:scale(0.9) rotate(-3deg)}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg)}40%,60%,80%{transform:scale(1.1) rotate(-3deg)}" },
  rubberBand: { label: "Rubber band", icon: "Maximize2", cat: "Attention", centered: true, blurb: "Stretch and settle.", frames: "0%,100%{transform:scale(1,1)}30%{transform:scale(1.25,0.75)}50%{transform:scale(0.85,1.15)}70%{transform:scale(1.05,0.95)}" },
  flash: { label: "Flash", icon: "Zap", cat: "Attention", blurb: "Blink twice fast.", frames: "0%,50%,100%{opacity:1}25%,75%{opacity:0}" },
  pop: { label: "Pop", icon: "Sparkles", cat: "Attention", centered: true, blurb: "Scale-up entrance.", frames: "0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}" },
  // ── Entrance ────────────────────────────────────────────
  fade: { label: "Fade in", icon: "Eclipse", cat: "Entrance", blurb: "Opacity reveal.", frames: "from{opacity:0}to{opacity:1}" },
  fadeUp: { label: "Fade up", icon: "ChevronUp", cat: "Entrance", blurb: "Rise and fade in.", frames: "from{opacity:0;transform:translateY(20%)}to{opacity:1;transform:translateY(0)}" },
  fadeDown: { label: "Fade down", icon: "ChevronDown", cat: "Entrance", blurb: "Drop and fade in.", frames: "from{opacity:0;transform:translateY(-20%)}to{opacity:1;transform:translateY(0)}" },
  fadeLeft: { label: "Fade left", icon: "ChevronLeft", cat: "Entrance", blurb: "Slide in from the right.", frames: "from{opacity:0;transform:translateX(20%)}to{opacity:1;transform:translateX(0)}" },
  fadeRight: { label: "Fade right", icon: "ChevronRight", cat: "Entrance", blurb: "Slide in from the left.", frames: "from{opacity:0;transform:translateX(-20%)}to{opacity:1;transform:translateX(0)}" },
  zoomIn: { label: "Zoom in", icon: "ZoomIn", cat: "Entrance", centered: true, blurb: "Grow from small.", frames: "from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}" },
  zoomOut: { label: "Zoom out", icon: "ZoomOut", cat: "Entrance", centered: true, blurb: "Settle from large.", frames: "from{opacity:0;transform:scale(1.5)}to{opacity:1;transform:scale(1)}" },
  flipX: { label: "Flip X", icon: "FlipVertical", cat: "Entrance", centered: true, blurb: "Flip on the horizontal axis.", frames: "from{transform:scaleY(-1);opacity:0}to{transform:scaleY(1);opacity:1}" },
  flipY: { label: "Flip Y", icon: "FlipHorizontal", cat: "Entrance", centered: true, blurb: "Flip on the vertical axis.", frames: "from{transform:scaleX(-1);opacity:0}to{transform:scaleX(1);opacity:1}" },
  dropIn: { label: "Drop in", icon: "ArrowDownToLine", cat: "Entrance", blurb: "Fall in with a small bounce.", frames: "0%{opacity:0;transform:translateY(-30%)}60%{transform:translateY(4%)}100%{opacity:1;transform:translateY(0)}" },
  rollIn: { label: "Roll in", icon: "RefreshCw", cat: "Entrance", centered: true, blurb: "Roll in from the left.", frames: "from{opacity:0;transform:translateX(-40%) rotate(-90deg)}to{opacity:1;transform:translateX(0) rotate(0)}" },
  // ── Path ────────────────────────────────────────────────
  draw: { label: "Draw line", icon: "PenLine", cat: "Path", blurb: "Trace strokes on like a signature.", frames: "to{stroke-dashoffset:0}" },
};

/** Preset key → def, guarded so an unknown key falls back to spin. */
function animDef(preset: Preset): AnimDef {
  return ANIMS[preset] ?? ANIMS.spin!;
}

const CATEGORY_ORDER: AnimDef["cat"][] = ["Loop", "Attention", "Entrance", "Path"];
const PRESET_ORDER: Preset[] = Object.keys(ANIMS);
/** Presets with a hand-tuned SMIL path; others use the CSS engine in SMIL mode. */
const SMIL_PRESETS = new Set(["spin", "pulse", "bounce", "fade", "draw", "morph"]);

function easingValue(easing: Easing): string {
  return easing === "spring" ? SPRING_BEZIER : easing;
}

/** The `animation` shorthand suffix shared by CSS mode. */
function animationShorthand(name: string, s: AnimSettings): string {
  const count = s.iteration === "infinite" ? "infinite" : "1";
  const fill = s.iteration === "infinite" ? "" : " both";
  return `${name} ${s.duration}s ${easingValue(s.easing)} ${s.delay}s ${count}${fill}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * CSS keyframes per preset (transform-box + transform-origin keep it centred).
 * ──────────────────────────────────────────────────────────────────────────── */

function keyframesFor(preset: Preset): { name: string; css: string } {
  const name = `gigai-${preset}`;
  return { name, css: `@keyframes ${name}{${animDef(preset).frames}}` };
}

/** The rule body applied to the hook class for a given preset + settings. */
function targetRuleBody(preset: Preset, s: AnimSettings): string {
  const kf = keyframesFor(preset);
  const shorthand = animationShorthand(kf.name, s);
  // Centre transforms on the group's own box so spins/pulses don't drift.
  const centring = animDef(preset).centered
    ? "transform-box:fill-box;transform-origin:center;"
    : "";
  // draw-line needs a dash array/offset seed so there's a line to reveal.
  const draw = preset === "draw" ? "stroke-dasharray:1;stroke-dashoffset:1;pathLength:1;" : "";
  return `${centring}${draw}animation:${shorthand};`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * SVG assembly. We parse, collect the drawable children into a wrapper <g>
 * carrying the hook class, then inject either a <style> block or SMIL elements.
 * If parsing fails we surface a typed error instead of emitting garbage.
 * ──────────────────────────────────────────────────────────────────────────── */

interface BuildResult {
  animatedSvg: string;
  css: string;
  error: string | null;
}

const EMPTY_BUILD: BuildResult = { animatedSvg: "", css: "", error: null };

/** Move the root's element children into a class-tagged <g>; returns the group. */
function wrapChildren(doc: Document, root: SVGSVGElement): SVGElement {
  const svgNS = "http://www.w3.org/2000/svg";
  const g = doc.createElementNS(svgNS, "g") as unknown as SVGElement;
  g.setAttribute("class", HOOK_CLASS);
  // Move every existing child (except <defs>/<style> which should stay at root)
  // into the animated group so one rule drives the whole drawing.
  const keepAtRoot = new Set(["defs", "style", "title", "desc", "metadata"]);
  const children = Array.from(root.childNodes);
  for (const node of children) {
    if (node.nodeType === 1) {
      const name = (node as Element).tagName.toLowerCase();
      if (keepAtRoot.has(name)) continue;
    }
    g.appendChild(node);
  }
  root.appendChild(g);
  return g;
}

function buildCssSvg(root: SVGSVGElement, doc: Document, s: AnimSettings): void {
  const svgNS = "http://www.w3.org/2000/svg";
  wrapChildren(doc, root);
  const kf = keyframesFor(s.preset);
  const rule = `.${HOOK_CLASS}{${targetRuleBody(s.preset, s)}}`;
  const style = doc.createElementNS(svgNS, "style");
  style.textContent = `\n${kf.css}\n${rule}\n`;
  // Style first so it applies before content renders.
  root.insertBefore(style, root.firstChild);
}

function buildSmilSvg(root: SVGSVGElement, doc: Document, s: AnimSettings): void {
  const svgNS = "http://www.w3.org/2000/svg";
  const g = wrapChildren(doc, root);
  const dur = `${s.duration}s`;
  const begin = s.delay > 0 ? `${s.delay}s` : "0s";
  const repeat = s.iteration === "infinite" ? "indefinite" : "1";
  const fill = s.iteration === "infinite" ? "remove" : "freeze";

  const make = (tag: string, attrs: Record<string, string>) => {
    const el = doc.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute("begin", begin);
    el.setAttribute("dur", dur);
    el.setAttribute("repeatCount", repeat);
    el.setAttribute("fill", fill);
    return el;
  };

  switch (s.preset) {
    case "spin":
      g.appendChild(
        make("animateTransform", {
          attributeName: "transform",
          type: "rotate",
          from: "0",
          to: "360",
          additive: "sum",
        }),
      );
      break;
    case "pulse":
    case "morph":
      g.appendChild(
        make("animateTransform", {
          attributeName: "transform",
          type: "scale",
          values: "1;1.1;1",
          additive: "sum",
        }),
      );
      break;
    case "bounce":
      g.appendChild(
        make("animateTransform", {
          attributeName: "transform",
          type: "translate",
          values: "0 0;0 -12;0 0",
          additive: "sum",
        }),
      );
      break;
    case "fade":
      g.appendChild(make("animate", { attributeName: "opacity", values: "0;1" }));
      break;
    case "draw":
      g.setAttribute("stroke-dasharray", "1");
      g.setAttribute("pathLength", "1");
      g.appendChild(make("animate", { attributeName: "stroke-dashoffset", values: "1;0" }));
      break;
  }
}

function buildAnimation(input: string, s: AnimSettings): BuildResult {
  const source = input.trim();
  if (source.length === 0) return EMPTY_BUILD;
  if (typeof window === "undefined") return EMPTY_BUILD;

  const root = getSvgRoot(source);
  if (!root) {
    return { ...EMPTY_BUILD, error: "That doesn't look like a valid <svg>. Check the markup and try again." };
  }

  // Work on a fresh parse so we own the document for serialisation.
  const doc = root.ownerDocument;
  try {
    // SMIL only for the hand-tuned classics; every other preset uses the CSS
    // engine (which covers the whole library) even when SMIL is selected.
    if (s.mode === "smil" && SMIL_PRESETS.has(s.preset)) buildSmilSvg(root, doc, s);
    else buildCssSvg(root, doc, s);
  } catch {
    return { ...EMPTY_BUILD, error: "Couldn't animate this SVG, its structure may be unusual. Try a simpler shape." };
  }

  const animatedSvg = serialize(root);

  // Standalone CSS snippet (only meaningful in CSS mode).
  const kf = keyframesFor(s.preset);
  const css =
    s.mode === "css"
      ? `${kf.css}\n.${HOOK_CLASS}{${targetRuleBody(s.preset, s)}}`
      : `/* SMIL mode animates inside the SVG itself. No external CSS needed. */`;

  return { animatedSvg, css, error: null };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Curated samples so the empty state is one click from a moving result.
 * ──────────────────────────────────────────────────────────────────────────── */

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Loader ring",
    description: "Stroked ring, perfect for spin",
    icon: "LoaderCircle",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#06b6d4" stroke-width="8" stroke-linecap="round"><circle cx="40" cy="40" r="30" stroke-opacity="0.2"/><path d="M40 10 a30 30 0 0 1 30 30"/></svg>',
  },
  {
    label: "Signature stroke",
    description: "Monoline path, great for draw-line",
    icon: "PenLine",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60" fill="none" stroke="#0891b2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 40 C 20 8, 34 8, 40 40 S 60 8, 72 40 88 20, 112 24"/></svg>',
  },
  {
    label: "Notification bell",
    description: "Filled glyph: try pulse or bounce",
    icon: "Bell",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#0e7490"><path d="M12 2a6 6 0 0 0-6 6c0 4-2 6-2 6h16s-2-2-2-6a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z"/></svg>',
  },
  {
    label: "Star badge",
    description: "Solid shape. Try morph or fade",
    icon: "Star",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#22d3ee"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>',
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * SVG Animation Generator, adds CSS or SMIL motion to a static SVG. Six presets
 * (spin, pulse, bounce, fade, draw-line, morph) with duration / easing / delay /
 * iteration controls drive a fully in-browser engine that returns a
 * self-contained animated SVG plus standalone CSS keyframes. Live preview via
 * {@link SvgWorkspace} (output pane shows the animated result), undo/redo,
 * examples, shortcuts and a replay button round out a desktop-grade experience.
 */
export default function SvgAnimationGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const svg = useHistory<string>("");
  const [settings, setSettings] = React.useState<AnimSettings>(DEFAULT_SETTINGS);
  const [dismissedError, setDismissedError] = React.useState(false);
  // Bump to force the preview to re-mount and replay run-once animations.
  const [replayKey, setReplayKey] = React.useState(0);

  const setField = React.useCallback(
    <K extends keyof AnimSettings>(key: K, value: AnimSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const build = React.useMemo(() => buildAnimation(svg.state, settings), [svg.state, settings]);

  React.useEffect(() => {
    setDismissedError(false);
  }, [build.error]);

  const replay = React.useCallback(() => setReplayKey((k) => k + 1), []);

  const reset = React.useCallback(() => {
    svg.reset("");
    setSettings(DEFAULT_SETTINGS);
  }, [svg]);

  useShortcuts({
    "mod+z": (e) => {
      e.preventDefault();
      svg.undo();
    },
    "mod+shift+z": (e) => {
      e.preventDefault();
      svg.redo();
    },
    "mod+enter": (e) => {
      e.preventDefault();
      replay();
    },
    escape: () => setDismissedError(true),
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Replay the animation" },
    { combo: "mod+z", description: "Undo" },
    { combo: "mod+shift+z", description: "Redo" },
    { combo: "esc", description: "Dismiss error" },
  ];

  const hasInput = svg.state.trim().length > 0;
  const showError = build.error != null && !dismissedError;

  const options = (
    <div className="flex flex-col gap-4">
      {/* Preset picker - a categorised library of {PRESET_ORDER.length} animations */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Animation library <span className="text-muted-foreground/60">({PRESET_ORDER.length})</span>
          </span>
          <span className="truncate text-[11px] text-muted-foreground">{animDef(settings.preset).blurb}</span>
        </div>
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
          {CATEGORY_ORDER.map((catName) => {
            const presets = PRESET_ORDER.filter((p) => animDef(p).cat === catName);
            if (presets.length === 0) return null;
            return (
              <div key={catName} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{catName}</span>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {presets.map((p) => {
                    const meta = animDef(p);
                    const active = settings.preset === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setField("preset", p)}
                        aria-pressed={active}
                        title={meta.blurb}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? cn("border-transparent text-white", style.solid)
                            : "border-border bg-background text-foreground hover:bg-accent/50",
                        )}
                      >
                        <Icon name={meta.icon} size={13} className={active ? "text-white" : style.text} />
                        <span className="truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-t border-border pt-4">
        {/* Duration */}
        <Field label={`Duration, ${settings.duration.toFixed(1)}s`} htmlFor="anim-duration">
          <input
            id="anim-duration"
            type="range"
            min={0.2}
            max={5}
            step={0.1}
            value={settings.duration}
            onChange={(e) => setField("duration", Number(e.target.value))}
            aria-label="Animation duration in seconds"
            className={cn(
              "h-2 w-44 cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
              style.text,
            )}
          />
        </Field>

        {/* Delay */}
        <Field label={`Delay, ${settings.delay.toFixed(1)}s`} htmlFor="anim-delay">
          <input
            id="anim-delay"
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={settings.delay}
            onChange={(e) => setField("delay", Number(e.target.value))}
            aria-label="Start delay in seconds"
            className={cn(
              "h-2 w-36 cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
              style.text,
            )}
          />
        </Field>

        {/* Easing */}
        <Field label="Easing" htmlFor="anim-easing">
          <SegmentedControl<Easing>
            value={settings.easing}
            onChange={(v) => setField("easing", v)}
            ariaLabel="Easing curve"
            size="sm"
            options={[
              { value: "linear", label: "Linear" },
              { value: "ease", label: "Ease" },
              { value: "ease-in-out", label: "In-out" },
              { value: "spring", label: "Spring" },
            ]}
          />
        </Field>

        {/* Iteration */}
        <Field label="Loop" htmlFor="anim-loop">
          <SegmentedControl<Iteration>
            value={settings.iteration}
            onChange={(v) => setField("iteration", v)}
            ariaLabel="Iteration count"
            size="sm"
            options={[
              { value: "infinite", label: "Forever", icon: "Infinity" },
              { value: "1", label: "Once", icon: "Milestone" },
            ]}
          />
        </Field>

        {/* Output mode */}
        <Field label="Output" hint="SMIL animates inside the file" htmlFor="anim-mode">
          <SegmentedControl<OutputMode>
            value={settings.mode}
            onChange={(v) => setField("mode", v)}
            ariaLabel="Output mode"
            size="sm"
            options={[
              { value: "css", label: "CSS", icon: "Braces" },
              { value: "smil", label: "SMIL", icon: "RadioTower" },
            ]}
          />
        </Field>
      </div>
    </div>
  );

  const workspaceExtra = (
    <>
      <ExamplesMenu
        examples={EXAMPLES}
        onPick={(value) => svg.reset(value)}
        heading="Load a sample SVG"
      />
      <ToolbarDivider />
      <ToolbarButton icon="Play" label="Replay" onClick={replay} disabled={!hasInput} />
      <ToolbarButton icon="Undo2" label="Undo" onClick={svg.undo} disabled={!svg.canUndo} />
      <ToolbarButton icon="Redo2" label="Redo" onClick={svg.redo} disabled={!svg.canRedo} />
      <ToolbarDivider />
      <ShortcutsHelp shortcuts={shortcuts} />
    </>
  );

  // Preview target: the animated SVG when it built cleanly, else the raw input
  // so users still see their static artwork while fixing an error.
  const previewOutput = build.error ? svg.state : build.animatedSvg || svg.state;

  return (
    <div className="flex flex-col gap-4">
      {/* key forces re-mount so run-once animations replay on demand. */}
      <SvgWorkspace
        key={replayKey}
        input={svg.state}
        onInputChange={svg.set}
        output={previewOutput}
        inputLabel="SVG source"
        placeholder='Paste SVG markup, drop a.svg file, or load a sample: e.g. <svg viewBox="0 0 24 24">…</svg>'
        filename="animated.svg"
        copyTarget="output"
        options={options}
        toolbarExtra={workspaceExtra}
        onReset={reset}
        emptyLabel="Your animation plays here"
      />

      {hasInput && (
        <div className="flex flex-col gap-2">
          {showError ? (
            <ErrorBanner error={build.error} onDismiss={() => setDismissedError(true)} />
          ) : null}

          {settings.mode === "css" ? (
            <>
              <Toolbar>
                <span className="px-1 text-sm font-medium text-foreground">
                  CSS keyframes{" "}
                  <span className="font-mono text-xs text-muted-foreground">
                    {animDef(settings.preset).label.toLowerCase()}
                  </span>
                </span>
                <ToolbarDivider />
                <CopyButton getValue={() => build.css} label="Copy CSS" />
                <DownloadButton
                  filename={`${settings.preset}-animation.css`}
                  getValue={() => build.css}
                  mime="text/css;charset=utf-8"
                  label="Download"
                />
                <ToolbarSpacer />
                <StatBadge
                  label="Applies to"
                  value={`.${HOOK_CLASS}`}
                  icon="Braces"
                  tone="info"
                />
              </Toolbar>

              <CodePane
                value={build.css || "/* Add an SVG above to generate keyframes. */"}
                readOnly
                label={`${settings.preset}-animation.css, standalone keyframes`}
                lineNumbers
                wrap
                minHeight={160}
                ariaLabel="Generated CSS keyframes"
              />

              <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
                <span>
                  The <strong className="font-medium text-foreground">animated SVG</strong> above
                  is self-contained, copy it and it moves on its own. This standalone CSS is for
                  driving an <em>external</em> SVG: wrap your content in{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">
                    &lt;g class=&quot;{HOOK_CLASS}&quot;&gt;
                  </code>{" "}
                  and include these rules.
                </span>
              </p>
            </>
          ) : (
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              <Icon name="RadioTower" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
              <span>
                <strong className="font-medium text-foreground">SMIL mode</strong> writes native{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">&lt;animate&gt;</code>{" "}
                elements inside the SVG itself, so there&rsquo;s no separate CSS to copy: the
                animated SVG above is everything you need, and it survives renderers that strip
                inline CSS. Copy or download it from the preview toolbar.
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
