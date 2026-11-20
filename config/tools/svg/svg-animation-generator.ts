import type { Tool } from "@/types";

/**
 * SVG Animation Generator: the "Generate" tool that turns a static SVG into a
 * moving one. Paste or drop any SVG, pick an animation preset (spin, pulse,
 * bounce, fade, draw-line, morph), tune duration / easing / delay / iteration,
 * and copy back a single self-contained animated SVG (a real <style> block or
 * SMIL <animate> elements) plus the standalone CSS keyframes. Every string
 * below is written for the exact searches people type when they want an icon or
 * logo to move without opening After Effects, and it never claims a capability
 * the in-browser engine doesn't have (no timeline scrubbing, no video export).
 */
const svgAnimationGenerator: Tool = {
  slug: "svg-animation-generator",
  title: "SVG Animation Generator",
  category: "svg-tools",
  group: "Generate",
  icon: "Wand2",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-26",

  description:
    "Animate any SVG in your browser. Pick a preset (spin, pulse, bounce, fade, draw-line, morph), tune duration, easing and iterations, watch it live, then copy a self-contained animated SVG or the CSS keyframes. Nothing is uploaded.",

  h1: "SVG Animation Generator: Animate SVG with CSS or SMIL, Free",
  tagline:
    "Paste an SVG, choose a preset, and watch it come alive. Dial in the duration, easing, delay and loop count, preview it on any background, then copy a single self-contained animated SVG, or just the CSS keyframes. All in your browser, no sign-up, no watermark.",
  longDescription:
    "The GigAI SVG Animation Generator adds motion to a static SVG without a timeline editor, a plugin, or a single upload. Drop in an icon, logo or illustration and pick a ready-made preset: spin for loaders, pulse for attention, bounce for playful entrances, fade for reveals, draw-line to trace strokes on like a signature, or morph to breathe between shapes: then shape the feel with duration, easing (linear, ease, ease-in-out or a smooth spring-like cubic-bézier), start delay, and iteration count (loop forever or run once). The tool writes the animation two ways so it fits any workflow: a self-contained animated SVG with an inlined <style> block of real @keyframes (drop it straight into a webpage, an <img>, or a component and it just moves), and a clean standalone CSS snippet you can paste into your own stylesheet to drive an external SVG. For maximum portability it can also emit SMIL <animate>/<animateTransform> elements that animate inside the file itself: handy where CSS on an SVG is stripped. A big live preview plays the result on a checkerboard, light or dark surface with a replay button so you can judge the timing against your real background, and undo/redo lets you walk back a setting you liked better. The draw-line preset measures each path so the stroke draws on cleanly, and every transform animates around the shape's own centre so spins and pulses don't drift off-frame. Because the entire engine (parsing, keyframe generation and preview) runs locally, your unreleased logos and client assets never leave the tab, and the exported file works offline forever.",

  ctaText: "Animate an SVG",

  keywords: [
    "svg animation generator",
    "animate svg online",
    "svg animation maker",
    "css svg animation",
    "svg keyframes generator",
    "animated svg generator",
    "svg spin animation",
    "svg draw line animation",
    "svg morph animation",
    "smil animation generator",
    "svg loading animation",
    "svg pulse animation",
  ],

  seo: {
    title: "SVG Animation Generator: Animate SVG with CSS/SMIL Online | GigAI Tools",
    description:
      "Free SVG animation generator. Add spin, pulse, bounce, fade, draw-line or morph to any SVG with duration, easing and loop controls, preview it live, then copy a self-contained animated SVG or CSS keyframes. 100% in your browser.",
  },

  features: [
    {
      icon: "Sparkles",
      title: "Six motion presets",
      description:
        "Spin, pulse, bounce, fade, draw-line and morph cover loaders, attention cues, entrances, reveals and stroke-tracing, one click applies the preset, then you fine-tune it.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Full timing control",
      description:
        "Set duration in seconds, choose linear / ease / ease-in-out / spring easing, add a start delay, and loop forever or run the animation exactly once.",
    },
    {
      icon: "FileCode",
      title: "Self-contained animated SVG",
      description:
        "Output is one file with an inlined <style> block of real @keyframes. Paste it into a page, an <img> or a component and it moves on its own, no external CSS required.",
    },
    {
      icon: "Braces",
      title: "Copy the CSS keyframes too",
      description:
        "Prefer to drive an external SVG from your stylesheet? Copy just the standalone @keyframes and animation shorthand, scoped to a class you can rename.",
    },
    {
      icon: "RadioTower",
      title: "SMIL fallback mode",
      description:
        "Emit native <animate>/<animateTransform> elements that live inside the SVG itself for environments where CSS applied to an SVG gets stripped.",
    },
    {
      icon: "PlayCircle",
      title: "Live preview with replay",
      description:
        "Watch the animation loop on a checkerboard, light or dark surface, hit replay to restart the run-once presets, and undo/redo any setting you change your mind about.",
    },
  ],

  benefits: [
    {
      title: "Ship motion without motion software",
      description:
        "Get a spinning loader, a pulsing badge or a drawing-on logo without After Effects, Lottie or a paid plugin: just paste the SVG and copy the animated result.",
    },
    {
      title: "Two outputs, any workflow",
      description:
        "Take the self-contained animated SVG when you want a drop-in file, or the standalone CSS keyframes when you'd rather keep markup and motion separate in your codebase.",
    },
    {
      title: "Predictable, centred transforms",
      description:
        "Spins and pulses animate around the shape's own centre and draw-line measures each path, so animations stay in-frame and look intentional instead of drifting.",
    },
    {
      title: "Private and offline",
      description:
        "Parsing, keyframe generation and preview all run on your device. Your unreleased logos and client work never leave the tab, and the exported file plays offline.",
    },
  ],

  howTo: [
    {
      title: "Add your SVG",
      description:
        "Paste SVG markup, drop a .svg file, or load one of the built-in samples. The static artwork appears in the live preview immediately.",
    },
    {
      title: "Pick a preset",
      description:
        "Choose spin, pulse, bounce, fade, draw-line or morph. The preview starts animating so you can see the motion right away.",
    },
    {
      title: "Tune the timing",
      description:
        "Adjust duration, easing, delay and iteration count. Switch output between an inlined CSS <style> block and native SMIL if a target strips CSS.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the self-contained animated SVG, grab just the CSS keyframes, or download the .svg. Everything is generated locally in your browser.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG", "CSS"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Loading & progress states",
      description:
        "Turn a plain spinner or logo into a smooth spinning or pulsing loader, then paste the self-contained SVG straight into a component. No extra CSS file to wire up.",
    },
    {
      audience: "Brand & marketing designer",
      title: "Logo reveal on landing pages",
      description:
        "Use draw-line to trace a monoline logo on, or fade to reveal it, and hand engineers a single animated SVG that behaves the same everywhere without a video export.",
    },
    {
      audience: "Product designer",
      title: "Micro-interactions & attention cues",
      description:
        "Add a subtle pulse to a notification badge or a bounce to an empty-state illustration, tune the loop and delay, and drop the copy-ready markup into the design system.",
    },
    {
      audience: "Email & docs author",
      title: "SMIL for restrictive renderers",
      description:
        "When CSS on an SVG gets stripped, switch to SMIL so the motion lives inside the file itself and survives in environments that ignore external or inline styles.",
    },
  ],

  troubleshooting: [
    {
      problem: "The draw-line preset shows nothing or a solid shape.",
      solution:
        "Draw-line animates stroke-dashoffset, so it needs a stroked path: an outline, not a filled solid. Give your path a stroke (and no fill, or fill applied after) so there's a line to trace on. Closed filled icons won't show a drawing effect.",
    },
    {
      problem: "My animation is stripped when I paste the SVG somewhere.",
      solution:
        "Some renderers drop inline CSS applied to SVG. Switch the output mode to SMIL so the <animate> elements live inside the file, or reference the standalone CSS from a real stylesheet in environments that allow it.",
    },
    {
      problem: "The spin drifts off to one side instead of rotating in place.",
      solution:
        "That happens when a transform-origin is off-centre. This tool centres rotations on the shape's own bounding box, so re-apply the preset here. If you hand-edited the transform afterwards, remove your override and let the generated centre take over.",
    },
    {
      problem: "Morph does nothing.",
      solution:
        "Morph tweens scale/shape subtly on the whole graphic. On a single tiny path the movement can be hard to see. Increase the duration, raise the loop count, or apply it to a shape with more visible area to read the effect.",
    },
  ],

  tips: [
    "Keep loader spins between 0.8s and 1.5s, faster reads as frantic, slower as sluggish.",
    "Use ease-in-out or the spring easing for entrances (bounce, fade). Reserve linear for continuous spins so they don't stutter at the loop seam.",
    "Draw-line looks best on monoline / outline icons where every path has a stroke and no heavy fill.",
    "Set iterations to 'once' for reveals you only want on load, and 'infinite' only for ambient loaders.",
    "Grab the standalone CSS when your SVG already lives in the DOM. It keeps markup and motion cleanly separated.",
  ],

  security:
    "Your SVG is parsed, animated and previewed entirely in your browser, the keyframe generation, the SMIL injection and the live preview all run locally on your device. Nothing is uploaded, stored or logged, so unreleased logos and client assets stay private. The preview strips executable content (scripts, event handlers, javascript: URLs) for safety, it works offline, and closing the tab leaves nothing behind.",

  faq: [
    {
      question: "How do I animate an SVG without After Effects or a plugin?",
      answer:
        "Paste your SVG here, pick a preset like spin, pulse or draw-line, and adjust the duration, easing and loop count. The tool writes the animation for you as real CSS @keyframes (or SMIL) and hands back a self-contained animated SVG you can drop straight into a page. No motion software, no upload, no watermark.",
    },
    {
      question: "What's the difference between the CSS and SMIL output modes?",
      answer:
        "CSS mode inlines a <style> block of @keyframes into the SVG, which is the modern, widely-supported way to animate and is easy to tweak. SMIL mode uses native <animate>/<animateTransform> elements that live inside the SVG itself. Prefer CSS in general. Switch to SMIL for environments that strip CSS applied to an SVG, so the motion survives inside the file.",
    },
    {
      question: "Can I copy just the CSS keyframes to use in my own stylesheet?",
      answer:
        "Yes. Alongside the self-contained animated SVG, the tool gives you a standalone CSS snippet, the @keyframes plus an animation shorthand scoped to a class, so you can keep your SVG markup untouched in the DOM and drive the motion entirely from your stylesheet.",
    },
    {
      question: "Why doesn't the draw-line (stroke) animation show up?",
      answer:
        "Draw-line animates stroke-dashoffset, which only produces a visible 'drawing on' effect when the path has a stroke to trace. Filled, solid shapes with no outline have nothing to draw. Add a stroke to your path (outline icons work best) and the trace effect appears.",
    },
    {
      question: "Will the animated SVG work in an <img> tag or as a background?",
      answer:
        "The inlined-CSS animated SVG animates when placed inline in the DOM or referenced as an <img> in most modern browsers. Some contexts (certain email clients, or SVG used purely as a CSS background) restrict animation. For the most portable result across restrictive renderers, use the SMIL output.",
    },
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. The entire pipeline (parsing your SVG, generating the keyframes, injecting SMIL and rendering the live preview) runs in your browser. Nothing is sent anywhere, stored or logged, so it's private by design and works offline. Close the tab and there's nothing left behind.",
    },
    {
      question: "Can I control speed, easing and how many times it loops?",
      answer:
        "Yes. Set the duration in seconds, choose the easing curve (linear, ease, ease-in-out or a spring-like cubic-bézier), add a start delay, and pick whether the animation loops forever or runs exactly once. The preview updates live and includes a replay button to re-run run-once presets.",
    },
    {
      question: "Is it free for commercial use?",
      answer:
        "Yes. The animated SVGs you export are plain markup with no licence attached: use them in commercial products, client work and open-source projects. There's no watermark, sign-up or attribution requirement.",
    },
  ],

  changelog: [
    {
      date: "2026-06-26",
      change:
        "Initial release, spin, pulse, bounce, fade, draw-line and morph presets with duration, easing, delay and iteration controls, live preview and self-contained animated SVG output.",
    },
    {
      date: "2026-06-29",
      change:
        "Added standalone CSS keyframe export, SMIL output mode for restrictive renderers, and centred transforms so spins and pulses stay in-frame.",
    },
    {
      date: "2026-07-01",
      change:
        "Added undo/redo, keyboard shortcuts, a replay button for run-once animations, and checkerboard/light/dark preview surfaces.",
    },
  ],

  relatedTools: [
    "svg-blob-generator",
    "svg-optimizer",
    "svg-to-react",
    "svg-viewer",
    "svg-to-css",
  ],
};

export default svgAnimationGenerator;
