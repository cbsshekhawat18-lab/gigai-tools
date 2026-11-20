import type { Tool } from "@/types";

/**
 * Data URI to SVG, the decoder counterpart to the SVG→Data URI converter. It
 * takes a `data:image/svg+xml,…` URI (base64 or URL-encoded): the kind you
 * find buried in a CSS `background-image`, an `<img src>`, a Tailwind class or a
 * minified bundle, and turns it back into clean, readable SVG markup you can
 * preview, edit and download as a `.svg` file. Every string below is unique to
 * the decode workflow and written for the exact queries developers type when
 * they need to pull an inlined SVG back out of a data URI.
 */
const dataUriToSvg: Tool = {
  slug: "data-uri-to-svg",
  title: "Data URI to SVG",
  category: "svg-tools",
  group: "Convert",
  icon: "Link2",
  accent: "rose",
  status: "live",
  createdAt: "2026-06-21",

  description:
    "Decode a data:image/svg+xml URI back into raw SVG in your browser, handles base64 and URL-encoded payloads, with a live preview and one-click.svg download. Nothing is uploaded.",

  h1: "Data URI to SVG Decoder",
  tagline:
    "Paste a data:image/svg+xml URI and get the original SVG back: base64 or URL-encoded, decoded instantly with a live preview and a clean.svg download. 100% in your browser.",
  longDescription:
    "The GigAI Data URI to SVG decoder reverses the inlining that hides so many SVGs inside stylesheets, HTML and JavaScript bundles. Paste any data URI that begins with data:image/svg+xml. Whether it is base64-encoded (…;base64,PHN2Zy…) or the URL-encoded, percent-escaped form that CSS tooling prefers (…,%3Csvg…), and it detects the encoding, decodes the payload with the browser's own primitives, and hands you back the exact SVG source. The recovered markup renders live in a checkerboard preview so you can confirm it is the right graphic, sits in an editor you can copy from, and downloads as a real.svg file in one click. It gracefully strips an optional;charset=utf-8 marker, tolerates the surrounding url(\"…\") and quotes people paste by accident, and tells you plainly when a string is a PNG/JPEG data URI or simply malformed rather than silently producing garbage. Because every byte is decoded on your device with no network round-trip, a data URI pulled from a private stylesheet, an internal component or a client's bundle never leaves your machine. It is the fast, honest way to get editable SVG back out of a URI someone else inlined.",

  ctaText: "Decode Data URI",

  keywords: [
    "data uri to svg",
    "data url to svg",
    "decode svg data uri",
    "svg data uri decoder",
    "base64 to svg",
    "convert data uri to svg",
    "extract svg from css",
    "data:image/svg+xml decode",
    "url encoded svg to svg",
    "inline svg to file",
    "svg data url converter",
    "unescape svg data uri",
  ],

  seo: {
    title:
      "Data URI to SVG: Decode a data:image/svg+xml URI to SVG Online | GigAI Tools",
    description:
      "Free online Data URI to SVG decoder. Paste a base64 or URL-encoded data:image/svg+xml URI and get clean SVG markup back, with a live preview and.svg download: 100% in your browser, no uploads.",
  },

  formats: {
    input: ["Data URI"],
    output: ["SVG"],
  },

  features: [
    {
      icon: "Binary",
      title: "Base64 and URL-encoded, auto-detected",
      description:
        "Paste either flavour, the base64 form ending in;base64,PHN2Zy… or the percent-escaped %3Csvg… form CSS tools emit, and the decoder recognises the encoding for you and applies the right transform.",
    },
    {
      icon: "Eye",
      title: "Live preview of the decoded graphic",
      description:
        "The recovered SVG renders in a checkerboard canvas with light/dark backgrounds and zoom, so you can confirm you decoded the right icon before you save it. Not just a wall of markup.",
    },
    {
      icon: "Scissors",
      title: "Tolerant of real-world paste",
      description:
        "A stray url(\"…\") wrapper, surrounding quotes or an optional;charset=utf-8 marker won't trip it up, the decoder unwraps the noise and focuses on the payload.",
    },
    {
      icon: "Download",
      title: "Copy or download as .svg",
      description:
        "Copy the clean markup to your clipboard or download it straight to a real .svg file, ready to open in a design app, drop into a repo, or run through the SVG Optimizer.",
    },
    {
      icon: "ShieldAlert",
      title: "Honest, specific errors",
      description:
        "If you paste a PNG or JPEG data URI, a broken base64 string, or something that isn't a data URI at all, it says so clearly instead of returning a blank or corrupt result.",
    },
    {
      icon: "ShieldCheck",
      title: "Decoded entirely on your device",
      description:
        "Every byte is decoded in your browser with native APIs. The URI and the SVG it hides never touch a server, so private or client artwork stays private.",
    },
  ],

  benefits: [
    {
      title: "Recover editable SVG from anywhere it's inlined",
      description:
        "CSS backgrounds, img src attributes, Tailwind arbitrary values and minified bundles all hide SVGs as data URIs. This pulls the original markup back out so you can edit, re-theme or re-export it.",
    },
    {
      title: "Confirm what a URI actually contains",
      description:
        "A data URI is opaque until you decode it. The live preview shows you the real graphic instantly, so you can verify an asset in a stylesheet or component without guessing.",
    },
    {
      title: "One step in a round-trip workflow",
      description:
        "Decode a URI here, tidy it in the SVG Optimizer, then re-inline it with the SVG to Data URI tool: a clean loop for maintaining inlined artwork.",
    },
    {
      title: "Private by design",
      description:
        "Decoding runs locally in your browser. A data URI copied from an internal stylesheet or a client's bundle is never uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Paste your data URI",
      description:
        "Drop in a string that starts with data:image/svg+xml. Base64 or URL-encoded. You can paste the raw URI or the whole url(\"…\") wrapper. The decoder handles both.",
    },
    {
      title: "Watch it decode instantly",
      description:
        "The tool detects the encoding, decodes the payload, and shows the recovered SVG markup beside a live preview of the graphic. No button to press.",
    },
    {
      title: "Check the preview",
      description:
        "Confirm the decoded artwork is what you expected. Switch the background or zoom to inspect a thin stroke or a transparent fill.",
    },
    {
      title: "Copy or download the SVG",
      description:
        "Copy the clean markup, or download it as a .svg file ready to open, commit, or optimize further.",
    },
  ],

  useCases: [
    {
      audience: "Frontend developer",
      title: "Extract an icon from a CSS background",
      description:
        "Grab the data:image/svg+xml URI out of a background-image rule, decode it here, and get an editable .svg you can move into your icon set instead of leaving it buried in a stylesheet.",
    },
    {
      audience: "Design-system engineer",
      title: "Audit inlined assets in a bundle",
      description:
        "Paste data URIs pulled from a minified build to see exactly which SVGs they contain and whether any are duplicated or oversized before you refactor.",
    },
    {
      audience: "Designer / illustrator",
      title: "Reopen an inlined graphic",
      description:
        "Turn a data URI a developer sent you back into a real .svg file you can open in Figma or Illustrator, tweak, and hand back.",
    },
    {
      audience: "Technical writer / educator",
      title: "Show what a data URI holds",
      description:
        "Decode a sample URI live to demonstrate how base64 and URL-encoded SVG payloads map back to plain markup.",
    },
  ],

  tips: [
    "You can paste the whole url(\"data:image/svg+xml,…\") wrapper, the decoder strips url(), quotes and an optional;charset before decoding.",
    "URL-encoded (percent-escaped) SVG data URIs are usually smaller than base64 ones. Both decode to the identical SVG here.",
    "Run the decoded markup through the SVG Optimizer to clean editor metadata before re-inlining it with SVG to Data URI.",
    "If the preview looks blank, the source SVG may lack a viewBox or paint a white shape, switch the preview to a dark background to check.",
    "Only image/svg+xml URIs decode to SVG. A PNG or JPEG data URI is raster data and won't produce markup here.",
  ],

  troubleshooting: [
    {
      problem: "It says the string isn't an SVG data URI.",
      solution:
        "The URI must begin with data:image/svg+xml (optionally followed by ;charset=utf-8 and/or ;base64) and then a comma. Remove any text before data: and make sure you copied the whole string, including the comma that separates the header from the payload.",
    },
    {
      problem: "The decoded payload isn't recognised as SVG.",
      solution:
        "The header claims image/svg+xml but the decoded bytes don't contain an <svg> element. The URI is likely truncated or was corrupted on copy. Re-copy the complete URI from its source and paste it again.",
    },
    {
      problem: "My PNG or JPEG data URI won't decode.",
      solution:
        "This tool decodes SVG (vector) data URIs only. A data:image/png or data:image/jpeg URI is raster image data, not markup, there's no SVG inside it to recover.",
    },
    {
      problem: "Decoding fails on a base64 URI.",
      solution:
        "The base64 payload may be incomplete or contain whitespace/line breaks that broke it during copy. Ensure you pasted the full …;base64,<payload> string with no missing characters, then try again.",
    },
  ],

  security:
    "Decoding happens entirely in your browser using its native APIs, the data URI and the SVG it contains are never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely decode URIs pulled from internal stylesheets, private components or client bundles. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my data URI uploaded to a server?",
      answer:
        "No. Detection and decoding happen entirely in your browser with its built-in APIs. The URI you paste and the SVG it decodes to never leave your device, so there's nothing for us to store, log or see, it's safe for confidential or client assets.",
    },
    {
      question: "Does it handle both base64 and URL-encoded SVG data URIs?",
      answer:
        "Yes. It reads the header to tell the two apart: a …;base64,PHN2Zy… string is decoded from base64, while the percent-escaped …,%3Csvg… form is URL-decoded. Both produce the identical original SVG markup.",
    },
    {
      question: "What exactly is a data:image/svg+xml URI?",
      answer:
        "It's a way to embed an SVG directly inside CSS, HTML or JavaScript instead of linking to a separate file. The URI carries a small header (data:image/svg+xml[;charset][;base64]) followed by the encoded SVG, so the graphic travels inline with your code.",
    },
    {
      question: "Can I paste a url(\"…\") wrapper straight from my CSS?",
      answer:
        "Yes. The decoder tolerates a surrounding url(\"…\") wrapper, stray quotes and an optional;charset=utf-8 marker. It focuses on the data URI itself, so you can copy the value directly out of a background-image rule.",
    },
    {
      question: "Why won't my PNG or JPEG data URI decode to SVG?",
      answer:
        "Only image/svg+xml URIs contain SVG markup. A data:image/png or data:image/jpeg URI holds raster (bitmap) image data, so there is no SVG source to recover. To go the other way (from a raster image to vector) use a PNG-to-SVG tracer instead.",
    },
    {
      question: "Can I download the result as a file?",
      answer:
        "Yes. Once the URI is decoded you can copy the SVG markup to your clipboard or download it as a real .svg file, ready to open in a design app, commit to a repo, or run through the SVG Optimizer.",
    },
    {
      question: "The URI decodes but the preview is empty, what's wrong?",
      answer:
        "The markup may be valid but render invisibly: an SVG without a viewBox, with zero-size dimensions, or painting a white shape can look blank on a light background. Switch the preview to a dark or checkerboard background, and check the source has a sensible viewBox.",
    },
    {
      question: "How do I re-inline the SVG after editing it?",
      answer:
        "Use the SVG to Data URI tool. Decode here, edit or optimize the markup, then convert it back to a data URI, a clean round trip for maintaining inlined assets.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release: decode base64 and URL-encoded data:image/svg+xml URIs to raw SVG, with encoding auto-detection, a live preview, and copy/download as.svg.",
    },
    {
      date: "2026-06-26",
      change:
        "Added tolerant paste (url(\"…\") wrappers, surrounding quotes, optional ;charset marker), curated examples, keyboard shortcuts and undo/redo.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer, more specific error messages that distinguish a non-SVG data URI, a raster (PNG/JPEG) URI, and a truncated or corrupt payload.",
    },
  ],

  relatedTools: [
    "svg-to-react",
    "svg-optimizer",
    "svg-viewer",
    "image-compressor",
  ],
};

export default dataUriToSvg;
