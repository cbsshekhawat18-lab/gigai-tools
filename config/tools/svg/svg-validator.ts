import type { Tool } from "@/types";

/**
 * SVG Validator, the correctness-and-safety gate of the GigAI SVG suite. It
 * parses pasted SVG with the browser's own XML engine to prove it is
 * well-formed, then runs a pragmatic linter for the things that actually break
 * or endanger real SVGs: a missing xmlns or viewBox, zero/absurd dimensions,
 * and the classic stored-XSS vectors (<script>, inline on* handlers,
 * <foreignObject>, javascript: URLs, external references). Every string below
 * targets the exact query people type when an SVG "won't render", "won't
 * scale", or a security reviewer flags an inline asset, nothing overlaps the
 * optimizer/viewer copy, and no claim outruns the client-side linter, which is
 * advisory, not a sanitizer.
 */
const svgValidator: Tool = {
  slug: "svg-validator",
  title: "SVG Validator",
  description:
    "Validate SVG online. Check well-formedness, xmlns and viewBox, dimension sanity, and flag <script>, on* handlers, <foreignObject> and javascript: XSS vectors. A pass/fail checklist plus composition report, all in your browser.",
  category: "svg-tools",
  group: "Optimize",
  icon: "CircleCheck",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "SVG Validator. Check & Lint SVG Online for Errors and Security",
  tagline:
    "Paste or drop an SVG and get an instant pass/fail checklist: is it well-formed XML, does it declare xmlns and a viewBox, are its dimensions sane, and does it hide a <script>, an onload handler or a <foreignObject> that would make it a stored-XSS risk? A live preview and composition report sit right beside the findings, all in your browser, never uploaded.",
  longDescription:
    "The GigAI SVG Validator is a correctness-and-safety linter for SVG markup that runs entirely in your browser. When an SVG silently fails to render, refuses to scale, or gets rejected by a CMS or a security review, the cause is almost always one of a handful of specific problems, and this tool checks for each of them explicitly instead of leaving you to guess. It first parses your markup with the browser's native XML engine to prove the document is well-formed, surfacing the exact parser error (unclosed tag, stray ampersand, mismatched quote) when it isn't. Then it runs a structured checklist: is there a real <svg> root, is xmlns declared so the file works as a standalone asset, is a viewBox present so the graphic scales responsively, and are the width/height values sane rather than zero, negative or wildly out of range? Alongside correctness it runs a security pass for the vectors that make SVG a genuine stored-XSS risk when rendered inline, embedded <script> elements, inline event handlers like onload and onclick, <foreignObject> that can smuggle arbitrary HTML, javascript: URLs, and external URL references that can leak requests or break offline. Every finding is shown as a clear pass, warning or error with a one-line explanation of why it matters and what to do, so a junior developer and a security reviewer read the same report the same way. A live checkerboard preview renders the SVG beside the findings so you can see the artwork while you read the verdict, and a composition report breaks down elements, colors, gradients, filters and animation. Because it is 100% client-side, unreleased logos, customer-supplied uploads and internal icons never leave your machine. Note that this is an advisory linter, not a sanitizer. It tells you an SVG is dangerous to embed. It does not rewrite it to make it safe.",

  ctaText: "Validate SVG",

  keywords: [
    "svg validator",
    "validate svg online",
    "svg checker",
    "svg linter",
    "is my svg valid",
    "svg xml validator",
    "check svg for errors",
    "svg security scan",
    "svg xss check",
    "svg viewbox check",
    "svg well-formed",
    "svg xmlns missing",
  ],

  seo: {
    title: "SVG Validator. Check & Lint SVG Online (Errors + XSS) | GigAI Tools",
    description:
      "Free online SVG validator. Check well-formed XML, xmlns and viewBox, dimension sanity, and flag <script>, on* handlers, <foreignObject> and javascript: XSS risks, pass/fail checklist and live preview, 100% in your browser.",
  },

  features: [
    {
      icon: "FileCheck2",
      title: "Real XML well-formedness check",
      description:
        "Parses your SVG with the browser's own DOMParser and reports the exact syntax error (an unclosed tag, a bare ampersand, a mismatched quote) instead of a vague 'invalid file'.",
    },
    {
      icon: "ListChecks",
      title: "Structured pass/fail checklist",
      description:
        "Every check (<svg> root, xmlns, viewBox, dimension sanity) is a distinct row with a pass, warning or error state and a one-line reason, so the verdict is unambiguous at a glance.",
    },
    {
      icon: "ShieldAlert",
      title: "Security / XSS scan",
      description:
        "Flags the vectors that make inline SVG dangerous: <script>, inline on* handlers, <foreignObject>, javascript: URLs and external references: the exact things a security review will catch.",
    },
    {
      icon: "Frame",
      title: "viewBox & scaling diagnosis",
      description:
        "Tells you whether a viewBox is present and warns when it is missing, because that single attribute is why an SVG scales to its container, or renders at one fixed, wrong size.",
    },
    {
      icon: "Eye",
      title: "Live preview beside the report",
      description:
        "The SVG renders on a transparency checkerboard next to the findings, so you can see the artwork while you read the verdict and confirm a 'valid' file actually looks right.",
    },
    {
      icon: "ScanSearch",
      title: "Composition breakdown",
      description:
        "Beyond pass/fail, it reports element counts, distinct colors, and whether the SVG uses gradients, filters or animation, useful context when you're deciding whether to trust or ship it.",
    },
  ],

  benefits: [
    {
      title: "Stop guessing why an SVG won't render",
      description:
        "Instead of staring at markup that produces a blank box, get the specific parser error or the missing attribute named, with the fix stated in plain language.",
    },
    {
      title: "Catch XSS before it ships",
      description:
        "Screen customer-supplied or third-party SVGs for the script, handler and foreignObject vectors that turn an innocent-looking icon into stored XSS when you inline it.",
    },
    {
      title: "Fix responsive scaling at the source",
      description:
        "A missing viewBox is the number-one reason an SVG won't scale. The validator names it explicitly so you add the one attribute that fixes fluid sizing everywhere.",
    },
    {
      title: "Nothing leaves your browser",
      description:
        "Validate unreleased logos, internal icons and untrusted user uploads without sending a single byte to a server. The whole linter runs on your device.",
    },
  ],

  howTo: [
    {
      title: "Add your SVG",
      description:
        "Paste markup into the editor, drop a.svg file onto the workspace, or click Open. Load a sample, including a deliberately broken and a deliberately unsafe one, to see the report in action.",
    },
    {
      title: "Read the checklist",
      description:
        "Scan the pass/warning/error rows: well-formedness, <svg> root, xmlns, viewBox, dimensions, and the security scan. Each row explains what it means and why it matters.",
    },
    {
      title: "Confirm against the preview",
      description:
        "Glance at the live checkerboard preview to confirm a valid SVG actually renders the way you expect, and check the composition report for gradients, filters or animation.",
    },
    {
      title: "Fix and re-validate",
      description:
        "Edit the source in place and watch the checklist update live, or copy the markup into the Optimizer once it's clean. Share a link to reopen the tool with your SVG pre-loaded.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Debug a blank-box SVG",
      description:
        "An inlined SVG renders as an empty box. Paste it and the validator names the culprit, a missing viewBox, an absent xmlns, or a well-formedness error the browser swallowed silently.",
    },
    {
      audience: "Security engineer",
      title: "Screen user-uploaded SVGs",
      description:
        "Before allowing SVG uploads to render inline, run samples through the security scan to see exactly which files carry <script>, on* handlers or <foreignObject> and must be sanitized.",
    },
    {
      audience: "Design systems engineer",
      title: "Gate icons before the registry",
      description:
        "Validate every icon for a clean <svg> root, a viewBox and sane dimensions so your sprite or icon library stays consistent and nothing lands broken in the design system.",
    },
    {
      audience: "CMS / Platform team",
      title: "Explain a rejected upload",
      description:
        "When a CMS rejects an SVG, the validator's specific error and security findings tell you whether it's a syntax problem or an unsafe construct, and what the author needs to change.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says my SVG is not well-formed but it opens fine in my browser.",
      solution:
        "Browsers are lenient and auto-repair some markup on display. A strict XML parse is stricter. The validator reports the exact error (an unescaped &, an unclosed tag, a stray quote). Fix that character and re-validate. The file will be portable to tools that aren't so forgiving.",
    },
    {
      problem: "The security scan flagged my own trusted SVG.",
      solution:
        "The scan is intentionally conservative: it flags any <script>, on* handler, <foreignObject> or external reference regardless of intent, because those are real vectors when a file is embedded inline. If you authored and trust the file the warning is informational, but strip those constructs before rendering any SVG you didn't create.",
    },
    {
      problem: "It warns about a missing viewBox even though width/height are set.",
      solution:
        "width and height set a fixed pixel box. The viewBox is what defines the internal coordinate system and lets the SVG scale to its container. Add a viewBox that matches your artwork's coordinate space (e.g. viewBox=\"0 0 24 24\") to fix responsive scaling.",
    },
    {
      problem: "The validator passes but the preview is blank.",
      solution:
        "A file can be well-formed and still draw nothing, shapes painted with fill=\"none\" and no stroke, elements positioned outside the viewBox, or zero width/height. Check the composition report for element counts and use the Viewer or Optimizer preview to inspect it more closely.",
    },
  ],

  tips: [
    "Treat any warning in the security scan as blocking for SVGs you didn't author yourself: the scan flags the vector, but you decide the trust.",
    "A missing viewBox is the single most common cause of an SVG that won't scale. Add one before you debug anything else.",
    "Remember this is an advisory linter, not a sanitizer. It tells you a file is unsafe to embed but does not rewrite it. Use a dedicated sanitizer for that.",
    "Once an SVG validates clean, send it straight to the Optimizer to shrink it before you inline or ship it.",
    "If well-formedness fails, fix the first reported error and re-validate, a single unescaped ampersand often cascades into several confusing parser messages.",
  ],

  security:
    "Your SVG is parsed and linted entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely validate unreleased brand marks, internal icons and untrusted user uploads. Note that the validator is an advisory linter that identifies risky constructs. It does not sanitize or rewrite your SVG. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. All parsing and linting happen locally in your browser using the native DOMParser and in-page checks. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to validate confidential logos and untrusted user uploads alike.",
    },
    {
      question: "What does the validator actually check?",
      answer:
        "Four things. Well-formedness: it parses the markup as XML and reports the exact syntax error if it fails. Structure: whether there's a real <svg> root, an xmlns declaration and a viewBox. Dimensions: whether width/height are sane rather than zero, negative or absurd. Security: whether the file contains <script>, inline on* handlers, <foreignObject>, javascript: URLs or external references that make it risky to embed.",
    },
    {
      question: "Does this make my SVG safe to use?",
      answer:
        "No, and this is important. The validator is an advisory linter, not a sanitizer. It tells you which dangerous constructs a file contains, but it does not remove them or rewrite the file. If you need to render untrusted SVG, run it through a dedicated SVG sanitizer (or strip the flagged constructs manually) after the validator tells you what's there.",
    },
    {
      question: "Why does it warn that my SVG is missing a viewBox?",
      answer:
        "The viewBox defines the SVG's internal coordinate system and is what lets it scale to whatever container it's placed in. Without one, the SVG renders at a single fixed size and won't respond to CSS width or its parent, which is the most common reason an SVG 'won't scale'. Adding a viewBox that matches your artwork's coordinate space fixes it.",
    },
    {
      question: "My browser renders the SVG fine. Why does the validator call it invalid?",
      answer:
        "Browsers are deliberately forgiving and repair some malformed markup on the fly when displaying it. A strict XML parse is stricter, and tools, build pipelines and other renderers may not be as lenient. The validator reports the precise problem so your SVG is correct everywhere, not just in one browser.",
    },
    {
      question: "How is an SVG a security / XSS risk?",
      answer:
        "SVG is XML that can carry executable content. When you inline an untrusted SVG into a page, an embedded <script>, an onload/onclick handler, a <foreignObject> with HTML, or a javascript: URL can run in your origin, that's stored XSS. The validator's security scan flags exactly these constructs so you know a file needs sanitizing before you render it inline.",
    },
    {
      question: "Can it validate SVGs with gradients, filters or animation?",
      answer:
        "Yes. Those are all valid SVG and the validator treats them as such, the composition report even tells you the file uses them. Animation via SMIL (<animate>) or CSS is reported for context, not flagged as an error. Only genuinely risky constructs raise a security warning.",
    },
    {
      question: "What's the difference between this and the SVG Viewer?",
      answer:
        "The Viewer focuses on rendering and inspecting an SVG's composition: canvas, zoom, colors, elements. The Validator focuses on a verdict: is this file correct, will it scale, and is it safe to embed? They share a live preview, and the fastest workflow is to validate first, then optimize a clean file.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, client-side well-formedness check, structured pass/fail checklist (svg root, xmlns, viewBox, dimensions), security/XSS scan, live checkerboard preview, composition report, copy, download, undo/redo and shareable links.",
    },
    {
      date: "2026-06-25",
      change:
        "Added deliberately broken and deliberately unsafe sample SVGs, per-finding explanations, and clearer guidance that the tool is an advisory linter and not a sanitizer.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the security scan to separately surface external-URL references as info, tightened dimension-sanity thresholds, and added keyboard shortcuts.",
    },
  ],

  relatedTools: [
    "svg-viewer",
    "svg-optimizer",
    "svg-to-react",
    "image-compressor",
    "json-formatter",
  ],
};

export default svgValidator;
