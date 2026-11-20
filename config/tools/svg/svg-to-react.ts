import type { Tool } from "@/types";

/**
 * SVG to React: the flagship converter of the SVG suite. It turns raw SVG
 * markup into a clean, idiomatic React component: camelCased attributes, a
 * typed props spread, and optional TypeScript / memo / forwardRef / React
 * Native output, rendered live next to a real preview, entirely in the
 * browser. Every line of copy below is unique to the SVG→React workflow and
 * written to rank for the exact queries developers type when they paste an
 * icon into a codebase and the JSX won't compile.
 */
const svgToReact: Tool = {
  slug: "svg-to-react",
  title: "SVG to React",
  category: "svg-tools",
  group: "Convert",
  icon: "Braces",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-18",

  description:
    "Convert SVG to a clean React component in your browser, camelCased attributes, TypeScript or JS, memo, forwardRef and React Native output, with a live preview. Nothing is uploaded.",

  h1: "SVG to React Component Converter",
  tagline:
    "Paste any SVG and get a production-ready React component instantly: attributes camelCased, props spread through, TypeScript typings, memo and forwardRef on demand. Live preview, one-click copy, 100% in your browser.",
  longDescription:
    "The GigAI SVG to React converter transforms raw SVG markup into an idiomatic React component you can drop straight into a codebase, without the copy-paste-then-fix-the-JSX ritual. It rewrites every DOM attribute to its camelCase JSX form (class → className, stroke-width → strokeWidth, xlink:href → xlinkHref, fill-rule → fillRule and dozens more), spreads a typed props object onto the root so callers can pass size, color, aria-* and event handlers, and gives you real toggles for the choices that actually matter: TypeScript vs plain JavaScript, a custom PascalCase component name, React.memo wrapping, forwardRef for the SVG ref, and a React Native (react-native-svg) target for mobile apps. The generated code renders live in a syntax-highlighted pane beside a checkerboard preview of the actual icon, so you can confirm it still looks right before you copy or download it as a.tsx /.jsx file. Because the conversion runs entirely on your device with the browser's native parser, your artwork (brand marks, unreleased icons, client assets) is never uploaded, stored or logged. It's the fast, private path from a designer's export to a component that compiles.",

  ctaText: "Convert SVG to React",

  keywords: [
    "svg to react",
    "svg to jsx",
    "svg to react component",
    "convert svg to react",
    "svg to tsx",
    "svg react converter",
    "svgr online",
    "svg to react native",
    "camelcase svg attributes",
    "svg jsx converter",
    "react svg component generator",
    "svg to typescript component",
  ],

  seo: {
    title: "SVG to React, Convert SVG to a JSX/TSX Component Online | GigAI Tools",
    description:
      "Free online SVG to React converter. Paste SVG, get a clean React (or React Native) component with camelCased attributes, TypeScript, memo and forwardRef, plus a live preview: 100% in your browser, no uploads.",
  },

  formats: {
    input: ["SVG"],
    output: ["JSX", "TSX"],
  },

  features: [
    {
      icon: "Braces",
      title: "Attributes camelCased for JSX",
      description:
        "class becomes className, stroke-width becomes strokeWidth, xlink:href becomes xlinkHref, every hyphenated and namespaced SVG attribute is rewritten to the JSX form React expects, so the component compiles first try.",
    },
    {
      icon: "FileType2",
      title: "TypeScript or JavaScript",
      description:
        "Flip a single toggle to emit a fully typed .tsx with React.SVGProps<SVGSVGElement>, or a lean .jsx with no annotations. The import lines and prop signatures adjust to match.",
    },
    {
      icon: "Share2",
      title: "Props spread & custom name",
      description:
        "The root SVG receives a spread of your props, so callers pass width, height, fill, className, aria-label or onClick without editing the file. Name the component anything, it's sanitised to a valid PascalCase identifier.",
    },
    {
      icon: "Repeat2",
      title: "memo & forwardRef on demand",
      description:
        "Wrap the export in React.memo to skip re-renders, and forwardRef the SVG element so parents can measure or animate it. Both are opt-in and generate correct, ref-typed code.",
    },
    {
      icon: "Smartphone",
      title: "React Native target",
      description:
        "Switch to react-native-svg output and the DOM tags become Svg, Path, Circle, G and friends with the right imports: the same icon, ready for an Expo or bare React Native app.",
    },
    {
      icon: "Eye",
      title: "Live preview beside the code",
      description:
        "A checkerboard preview renders the actual SVG next to the generated JSX, with light/dark backgrounds and zoom, so you catch a broken path or clipped viewBox before it ships.",
    },
  ],

  benefits: [
    {
      title: "Skip the manual JSX fixups",
      description:
        "Pasting raw SVG into a component throws a wall of 'Unknown DOM property' warnings. This does every rename at once, so a designer's export becomes a working component in one click instead of ten edits.",
    },
    {
      title: "Reusable, themeable icons",
      description:
        "Because props spread onto the root, one generated component covers every size and color you need: pass className for Tailwind, fill for theming, or aria-label for accessibility, no forks required.",
    },
    {
      title: "One tool, web and native",
      description:
        "The same paste produces a DOM component or a react-native-svg component, so design systems that ship to web and mobile keep a single source of truth for each icon.",
    },
    {
      title: "Private by design",
      description:
        "Conversion happens locally in your browser. Unreleased logos, client artwork and internal icons never leave your machine. Nothing is uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Paste or import your SVG",
      description:
        "Paste SVG markup into the editor, drop a .svg file anywhere on the workspace, or load a built-in example to see the output instantly.",
    },
    {
      title: "Set the component options",
      description:
        "Name the component, choose TypeScript or JavaScript, and toggle memo, forwardRef or the React Native target. The code regenerates live as you change anything.",
    },
    {
      title: "Check the live preview",
      description:
        "Confirm the icon still renders correctly in the preview pane, switch backgrounds or zoom if you need to inspect a thin stroke or a transparent fill.",
    },
    {
      title: "Copy or download the component",
      description:
        "Copy the JSX to your clipboard or download it as a .tsx / .jsx file named after your component, then drop it into your project.",
    },
  ],

  useCases: [
    {
      audience: "Frontend developer",
      title: "Turn a Figma export into a component",
      description:
        "Paste the SVG a designer handed off and get a typed, props-spread React component that drops into your icon library and compiles without a single warning.",
    },
    {
      audience: "Design-system engineer",
      title: "One icon, web and native",
      description:
        "Generate a DOM component for the web app and a react-native-svg component for the mobile app from the same source, keeping both platforms visually in sync.",
    },
    {
      audience: "Open-source maintainer",
      title: "Ship a tree-shakeable icon set",
      description:
        "Convert each SVG to a memoised, forwardRef component so consumers import only what they use and can attach refs for animation or measurement.",
    },
    {
      audience: "Student / bootcamp learner",
      title: "Learn how SVG maps to JSX",
      description:
        "See exactly which attributes React renames and how props flow onto an element, using a real icon instead of a contrived example.",
    },
  ],

  tips: [
    "Run your SVG through the SVG Optimizer first, fewer nodes and no editor metadata means a smaller, cleaner component.",
    "Turn on forwardRef when a parent needs the element ref, e.g. for GSAP/Framer Motion animation or getBoundingClientRect measurements.",
    "Give the component a descriptive PascalCase name (IconArrowRight, LogoMark). It becomes both the identifier and the download filename.",
    "Leave the props spread on so one component serves every size and color. Pass className, fill or aria-label at the call site instead of editing the file.",
    "Switching to the React Native target? Install react-native-svg in your app, the generated imports assume it's present.",
  ],

  troubleshooting: [
    {
      problem: "The generated component won't parse or shows an error.",
      solution:
        "The input must be a single well-formed <svg>…</svg> root. Strip any leading XML/doctype declaration or surrounding HTML, and make sure every tag is closed. Running the markup through the SVG Validator first will pinpoint the issue.",
    },
    {
      problem: "The icon renders black or the wrong color in my app.",
      solution:
        "If the SVG hard-codes fill or stroke, that color wins over CSS. Set fill=\"currentColor\" (or stroke=\"currentColor\") in the source so the icon inherits the surrounding text color, then re-convert.",
    },
    {
      problem: "React warns about a style string or an unknown attribute.",
      solution:
        "Inline style=\"…\" strings and a few exotic attributes can't be auto-converted to React's object form. Move such styling to props or a stylesheet, or replace inline styles with plain presentation attributes before converting.",
    },
    {
      problem: "React Native output references components I don't have.",
      solution:
        "The native target emits react-native-svg tags (Svg, Path, Circle, G…). Add react-native-svg to your project. A handful of web-only features (filters, some gradients) have limited native support and may need manual tweaks.",
    },
  ],

  security:
    "Every conversion runs entirely in your browser using its native SVG parser. Your markup is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert unreleased logos, client artwork or internal icons. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Parsing and code generation happen entirely in your browser with its built-in SVG engine. Your artwork never leaves your device, so there's nothing for us to store, log or see: it's safe to convert confidential logos or unreleased icons.",
    },
    {
      question: "What does the converter change in my SVG?",
      answer:
        "It rewrites every attribute to the JSX form React requires: class → className, stroke-width → strokeWidth, fill-rule → fillRule, xlink:href → xlinkHref, and so on, wraps the markup in a component function, and spreads a props object onto the root so callers can pass size, color and other attributes. The shape of the artwork itself is untouched.",
    },
    {
      question: "Can I get TypeScript output?",
      answer:
        "Yes. Toggle TypeScript to emit a .tsx component typed with React.SVGProps<SVGSVGElement> (or react-native-svg's SvgProps for the native target), including correctly typed forwardRef code. Toggle it off for a plain .jsx with no annotations.",
    },
    {
      question: "How do I make the icon inherit my text color?",
      answer:
        "Set fill=\"currentColor\" (and/or stroke=\"currentColor\") in the SVG source before converting. The generated component then adopts the CSS color of its surroundings, so the same icon adapts to light and dark themes without editing the file.",
    },
    {
      question: "What do memo and forwardRef do?",
      answer:
        "React.memo skips re-rendering the icon when its props are unchanged, which helps in large lists. forwardRef exposes the underlying SVG element to a parent so it can attach a ref: useful for animation libraries or measuring the element. Both are optional and generate correct, fully-typed code.",
    },
    {
      question: "Does it support React Native?",
      answer:
        "Yes. Switch to the React Native target and the output uses react-native-svg components (Svg, Path, Circle, G…) with the right imports, ready for an Expo or bare React Native project. Install react-native-svg in your app to use it.",
    },
    {
      question: "Why won't my SVG convert?",
      answer:
        "The input needs to be a single, well-formed <svg> element. Remove any XML prolog, doctype or surrounding HTML, and ensure all tags are closed. If it still fails, run the markup through the SVG Validator to find the malformed part.",
    },
    {
      question: "Can I change the component name?",
      answer:
        "Yes, type any name and it's sanitised to a valid PascalCase identifier used for both the exported component and the download filename. Empty or invalid names fall back to a sensible default.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: live SVG→React conversion with camelCased attributes, TypeScript/JavaScript toggle, custom component name, props spread, memo, forwardRef, a React Native target, live preview, and copy/download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added undo/redo history, keyboard shortcuts, curated examples, and a shareable-link option that reopens the tool with your SVG pre-loaded.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved React Native tag mapping and forwardRef typings, and clearer errors when the input isn't a single well-formed <svg> root.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-minifier",
    "svg-to-data-uri",
    "svg-viewer",
    "json-formatter",
  ],
};

export default svgToReact;
