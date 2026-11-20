import type { Tool } from "@/types";

/**
 * SVG Compressor: the transfer-size sibling of the Optimizer. Where the
 * Optimizer's story is "clean, tunable SVGO output," the Compressor is framed
 * entirely around what actually crosses the wire: it optimizes the markup and
 * then models the *compressed* payload (gzip and an estimated Brotli figure)
 * because that, not the raw byte count, is the number that hits a user's
 * connection when your server negotiates Content-Encoding. Every string below
 * is written for people searching "how small will my SVG gzip to" and
 * "reduce SVG transfer size," and none of it is shared with the Optimizer,
 * Minifier or JSON copy. No claim outruns the client-side engine: the gzip and
 * Brotli figures are clearly labeled ESTIMATES modeled from entropy, not a
 * live compressor, and that honesty is baked into the copy.
 */
const svgCompressor: Tool = {
  slug: "svg-compressor",
  title: "SVG Compressor",
  description:
    "Compress SVG in your browser and see the real transfer size, optimized bytes plus estimated gzip and Brotli payloads, the numbers that actually cross the wire. Nothing is uploaded.",
  category: "svg-tools",
  group: "Optimize",
  icon: "Archive",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-17",

  h1: "SVG Compressor, Shrink SVG & See gzip / Brotli Transfer Size",
  tagline:
    "Paste or drop an SVG and watch it compress. This tool optimizes the markup and then models the real shipping weight (raw, gzip and estimated Brotli) so you know the exact payload that crosses the wire, not just the on-disk number. 100% in your browser, never uploaded.",
  longDescription:
    "The GigAI SVG Compressor is built around one number most tools ignore: the size that actually travels over the network. When an SVG is served on the modern web it almost never ships raw, your CDN or server compresses it with gzip or Brotli via Content-Encoding, and that compressed figure, not the on-disk byte count, is what lands on a visitor's connection and moves your Largest Contentful Paint. This tool first optimizes your SVG in the browser, stripping editor metadata, collapsing redundant groups and transforms, rounding coordinates to a precision you control and removing hidden layers, and then models the compressed payload: raw optimized bytes, an estimated gzip size, and an estimated Brotli size (Brotli typically edges out gzip on text markup by roughly 10–20%). A live transfer meter shows all three side by side, before and after, with the percentage saved, so you can see the win in the units that matter. A checkerboard preview renders the compressed result next to the code so you can confirm the artwork is pixel-identical before you ship it. Because SVG is such repetitive, highly compressible markup, the raw savings and the compressed savings are not the same number: a file that drops 40% on disk can drop far more once redundant path data is collapsed and the whole thing is gzipped, and this is the only GigAI tool that surfaces that distinction directly. To be honest about the model: the gzip and Brotli figures are estimates derived from byte count and character entropy, not a live compressor run in your tab, and the UI labels them as such. Treat them as a tight, comparative guide, and confirm the exact byte count with your server's real Content-Encoding for production budgets. Everything runs client-side, so unreleased logos, brand marks and internal icon sets never leave your machine. Close the tab and every trace is gone.",

  ctaText: "Compress SVG",

  keywords: [
    "svg compressor",
    "compress svg",
    "svg gzip size",
    "svg brotli size",
    "reduce svg transfer size",
    "svg file size reducer",
    "shrink svg for web",
    "svg payload size",
    "optimize svg for lcp",
    "svg compression online",
    "how small will my svg gzip",
    "svg content-encoding size",
  ],

  seo: {
    title: "SVG Compressor: Shrink SVG & Estimate gzip / Brotli Size | GigAI Tools",
    description:
      "Free online SVG compressor. Optimize your SVG and see the real transfer size (raw, estimated gzip and Brotli payloads with before/after savings) 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Gauge",
      title: "Real transfer-size meter",
      description:
        "See raw optimized bytes, an estimated gzip size and an estimated Brotli size side by side: the compressed payload your server actually serves, not just the number on disk.",
    },
    {
      icon: "Archive",
      title: "Optimize, then compress-model",
      description:
        "The markup is optimized first (editor cruft, hidden layers and over-precise coordinates removed) so the compressed estimate reflects a file that's already been cleaned, the way a build pipeline would.",
    },
    {
      icon: "Ruler",
      title: "Tunable coordinate precision",
      description:
        "Slide precision from lossless to aggressive and watch the gzip and Brotli estimates fall in real time. Fewer decimals means more repetition, which compresses harder. The preview shows when you've gone too far.",
    },
    {
      icon: "TrendingDown",
      title: "Before / after savings",
      description:
        "Every figure is paired with its original so you can read the exact percentage saved on raw, gzip and Brotli: the win in the units your performance budget is measured in.",
    },
    {
      icon: "Eye",
      title: "Live checkerboard preview",
      description:
        "The compressed SVG renders on a transparency checkerboard beside the code, so you can confirm the artwork is pixel-identical before it ships, the safety net a size number alone can't give you.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Optimization and size modeling happen entirely on your device. Unreleased logos, brand marks and internal icons are never uploaded, stored or logged. A fallback optimizer keeps it working offline too.",
    },
  ],

  benefits: [
    {
      title: "Budget in the units that ship",
      description:
        "Performance budgets are measured in transferred bytes, not on-disk bytes. Seeing the estimated gzip and Brotli payload lets you size an SVG against a real budget instead of guessing from the raw number.",
    },
    {
      title: "Squeeze more than raw minifying shows",
      description:
        "Because SVG is so repetitive, collapsing redundant path data and coordinates makes the file compress far better than the raw saving suggests. This tool surfaces that second, larger win most minifiers hide.",
    },
    {
      title: "Confirm nothing broke",
      description:
        "The live preview shows the compressed result next to the source, so the rare case where an aggressive precision clips a gradient or clip-path is caught before it reaches production.",
    },
    {
      title: "No install, no upload, no config",
      description:
        "Get compression-aware, SVGO-quality output without wiring up a build plugin or sending a confidential asset to a third-party server, paste, tune, copy.",
    },
  ],

  howTo: [
    {
      title: "Add your SVG",
      description:
        "Paste markup into the editor, drop a .svg file anywhere on the workspace, or click Import. A sample loads in one click if you just want to see the transfer meter move.",
    },
    {
      title: "Tune the compression",
      description:
        "Set coordinate precision and choose whether to keep the viewBox, strip width/height, remove IDs, drop title/desc or run multipass. The raw, gzip and Brotli estimates re-compute live as you change a knob.",
    },
    {
      title: "Read the transfer meter",
      description:
        "Glance at the before/after badges for raw, gzip and Brotli, confirm the percentage saved, and check the checkerboard preview to make sure the artwork is unchanged.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the compressed SVG to your clipboard, download it as a .svg, or share a link that reopens the tool with your source pre-loaded.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Performance engineer",
      title: "Fit an icon under a byte budget",
      description:
        "Check the estimated gzip/Brotli payload of a hero SVG against your transfer budget and tune precision until it fits, without waiting on a full build to measure the real Content-Encoding size.",
    },
    {
      audience: "Frontend developer",
      title: "Shrink an inline logo",
      description:
        "Compress the SVG logo you inline on every page and see how much the gzipped payload (the bytes that ship on every request) actually drops, nudging LCP in the right direction.",
    },
    {
      audience: "Design systems engineer",
      title: "Compare two export settings",
      description:
        "Paste two variants of the same icon and compare their gzip/Brotli estimates to pick the export that compresses smallest before it enters the sprite or the React library.",
    },
    {
      audience: "Email / Marketer",
      title: "Squeeze a decorative SVG",
      description:
        "Compress a decorative SVG hard enough to embed or attach without bloating the payload, using the transfer meter to confirm it's genuinely small once compressed.",
    },
  ],

  troubleshooting: [
    {
      problem: "The gzip / Brotli number doesn't exactly match my server's response.",
      solution:
        "Those figures are estimates modeled from byte count and character entropy, not a live compressor: they're a tight comparative guide, not a promise. For a production budget, confirm the exact size from your server's real Content-Encoding response header. Expect the estimate to land within a small margin.",
    },
    {
      problem: "My SVG stopped scaling after compressing.",
      solution:
        "You almost certainly removed the viewBox. Turn 'Keep viewBox' back on. The viewBox is what lets an SVG scale to its container. For fluid sizing, keep the viewBox and enable 'Remove width/height' instead.",
    },
    {
      problem: "Raw dropped a lot but gzip barely moved (or vice-versa).",
      solution:
        "That's expected: compressed size tracks repetition, not raw bytes. Removing unique metadata cuts raw a lot but compresses away anyway. Collapsing repeated path data cuts the compressed size more than the raw figure suggests. Read both meters together.",
    },
    {
      problem: "A sprite icon or CSS reference went blank.",
      solution:
        "IDs were probably removed while something still points at them (a <use xlink:href>, a gradient, a clip-path or a CSS selector). Disable 'Remove IDs'. The engine can't see references that live outside the file.",
    },
  ],

  tips: [
    "Optimize aggressively for repetition: dropping precision a decimal or two often shrinks the gzip/Brotli estimate more than it shrinks the raw bytes, because repeated coordinates compress harder.",
    "Budget against the Brotli figure if your CDN serves Brotli, it's usually the smallest of the three and the closest to what modern browsers actually download.",
    "Keep the viewBox on and enable 'Remove width/height' when you want the SVG to scale fluidly to its container.",
    "Leave 'Remove IDs' off for anything used in a sprite, referenced by <use>, or targeted by CSS/JS. The engine can't see external references.",
    "Compress before converting to a data-URI: base64 inflates bytes and data-URIs are often served without compression, so start from the smallest possible markup.",
  ],

  security:
    "Your SVG is optimized and size-modeled entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely compress unreleased logos, brand marks and internal icon sets. The gzip and Brotli figures are computed locally as estimates, and if the optimizer's chunk can't load a built-in fallback runs locally too. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. All optimization and size modeling happen locally in your browser, with a built-in fallback optimizer if the main engine can't load. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to compress confidential logos and brand assets.",
    },
    {
      question: "What's the difference between the raw, gzip and Brotli numbers?",
      answer:
        "Raw is the optimized SVG's size on disk. gzip and Brotli are estimates of how small that file becomes once your server compresses it with Content-Encoding, which is what a browser actually downloads. Brotli usually beats gzip on text markup by roughly 10–20%. Because SVG is so repetitive, the compressed figures are much smaller than the raw one, and they're the numbers your performance budget really cares about.",
    },
    {
      question: "Are the gzip and Brotli sizes exact?",
      answer:
        "They're estimates, and the tool labels them as such. They're modeled from the file's byte count and character entropy rather than run through a live compressor, so they're a tight, consistent guide for comparing options and hitting a budget, but for a production number, confirm the exact size from your server's real Content-Encoding response. Expect the estimate to land within a small margin for typical SVGs.",
    },
    {
      question: "How much smaller will my SVG get?",
      answer:
        "It depends on the source, but design-tool exports commonly optimize 40–70% on raw bytes, and the compressed payload often drops even further because collapsing repeated path data makes the file gzip and Brotli harder. The transfer meter shows the exact before/after for all three so you can see the real shipping weight.",
    },
    {
      question: "Why does compressing help my page speed?",
      answer:
        "An SVG served inline or as a file counts toward the bytes a browser must download before it can render. Cutting the transferred size (especially for an inline logo or icon that ships on every request) reduces network time and can improve Largest Contentful Paint. The gzip/Brotli meter shows the real transferred weight, so you're optimizing the number that actually affects load time.",
    },
    {
      question: "Should I compress before making a data-URI or React component?",
      answer:
        "Yes. Compress first so the markup you embed or inline starts as small as possible. Note that base64 data-URIs inflate byte count and are often served without Content-Encoding, so for those the raw figure matters more than the gzip estimate. The meter lets you weigh both.",
    },
    {
      question: "Will compressing change how my SVG looks?",
      answer:
        "The defaults are lossless, the artwork renders identically. The one setting that can visibly change things is coordinate precision: rounding too aggressively can subtly shift curves or gradients. That's exactly why the tool shows a live preview, so you can push precision until you just start to notice and then back off a step.",
    },
    {
      question: "Is this different from the SVG Optimizer?",
      answer:
        "They share the same client-side engine, but the framing is different. The Optimizer is about clean, tunable SVGO output. The Compressor is about transfer size. It foregrounds the estimated gzip and Brotli payload and the before/after savings in those units, so you're optimizing directly against what crosses the wire and hits your performance budget.",
    },
  ],

  changelog: [
    {
      date: "2026-06-17",
      change:
        "Initial release, client-side SVG optimization with a raw / gzip / Brotli transfer meter, tunable precision, keep-viewBox / remove-dimensions / remove-IDs / remove-title toggles, multipass, live checkerboard preview, before/after savings, copy, download, undo/redo and shareable links.",
    },
    {
      date: "2026-06-24",
      change:
        "Added the estimated Brotli figure alongside gzip, clarified in-UI that both are entropy-based estimates, and tuned the model against a corpus of real icon and logo exports.",
    },
    {
      date: "2026-06-30",
      change:
        "Added a dependency-free fallback optimizer so the tool keeps working when the main engine can't load, plus keyboard shortcuts and a curated set of sample SVGs.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-minifier",
    "svg-to-data-uri",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgCompressor;
