import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "base64-vs-binary",
  a: "Base64",
  b: "Binary",
  title: "Base64 vs Binary: When Should You Encode Your Data?",
  description:
    "Binary is the raw, compact form of data. Base64 is a text-safe encoding of it that's ~33% larger. Here's when encoding to Base64 helps and when it just wastes bytes.",
  accent: "indigo",
  icon: "Binary",
  seo: {
    title: "Base64 vs Binary: When Should You Encode Your Data? (2026)",
    description:
      "Base64 vs binary explained: what Base64 encoding does, the 33% size overhead, when to embed data as Base64 vs serve raw binary, and how it affects performance.",
    keywords: [
      "base64 vs binary",
      "what is base64 encoding",
      "base64 size overhead",
      "when to use base64",
      "base64 data uri",
      "binary vs base64",
    ],
    canonical: "/compare/base64-vs-binary",
  },
  intro: [
    "Base64 versus binary isn't a fight between two data formats, it's the difference between raw data and a text-safe representation of that same data. Binary is how information actually lives on disk and in memory: a compact stream of bytes, each holding any of 256 values. Base64 takes that binary and re-expresses it using only 64 safe printable characters (A–Z, a–z, 0–9, plus a couple of symbols), so it can survive systems that were built for text and would otherwise mangle raw bytes.",
    "The catch is size. Because Base64 uses four characters to represent every three bytes, the encoded output is always about 33% larger than the original binary. So encoding is never about saving space, it's about compatibility. You reach for Base64 when data has to travel through a text-only channel: embedding an image directly in HTML or CSS as a data URI, putting a small binary blob inside JSON, sending attachments through email, or stashing a token in a plain-text config.",
    "Below is a side-by-side breakdown, a clear rule for choosing, and an honest verdict, plus tools to encode and decode Base64 in your browser.",
  ],
  dimensions: [
    {
      label: "What it is",
      a: "A text encoding of binary using 64 safe characters.",
      b: "The raw bytes themselves, the native form of the data.",
    },
    {
      label: "Size",
      a: "About 33% larger than the source binary.",
      b: "The smallest form. No encoding overhead.",
    },
    {
      label: "Safe in text channels",
      a: "Yes: survives JSON, HTML, CSS, email, URLs and config files.",
      b: "No. Raw bytes can be corrupted by text-only transports.",
    },
    {
      label: "Human readability",
      a: "A long opaque string, not meaningfully readable.",
      b: "Not readable at all without a viewer.",
    },
    {
      label: "Extra HTTP request",
      a: "Avoids one: data can be inlined directly into the page.",
      b: "Usually served as its own file via a separate request.",
    },
    {
      label: "Caching",
      a: "Inlined data can't be cached independently of the page.",
      b: "Served as a file, so it caches and reuses across pages.",
    },
    {
      label: "Best for",
      a: "Small assets embedded in text: data URIs, JSON blobs, email.",
      b: "Any real file transfer or storage where size and caching matter.",
    },
  ],
  whenA: [
    "You need to embed a tiny image, font or icon directly in HTML/CSS as a data URI.",
    "You're putting small binary data inside a JSON payload or a text config file.",
    "The transport is text-only: email attachments, some APIs, URL parameters.",
    "Avoiding one extra HTTP request for a small asset outweighs the size overhead.",
  ],
  whenB: [
    "You're transferring or storing any file of real size: the 33% overhead adds up fast.",
    "You want the asset cached separately and reused across many pages.",
    "You're serving images, video or downloads over HTTP where binary is native.",
    "Performance and bandwidth matter more than text-channel compatibility.",
  ],
  verdict:
    "Serve real files as raw binary, it's smaller, cacheable and the way the web is meant to deliver assets. Reserve Base64 for small pieces of data that must live inside text: a tiny inlined icon, a blob in a JSON field, or an email attachment. Encoding a large file to Base64 just inflates it by a third for no benefit.",
  relatedToolSlugs: ["base64-encoder", "base64-decoder", "svg-to-data-uri"],
  faq: [
    {
      question: "Does Base64 make files smaller?",
      answer:
        "No. It makes them about 33% larger. Base64 is an encoding for compatibility, not compression. It exists to let binary data pass safely through text-only channels, and it always adds overhead rather than removing it.",
    },
    {
      question: "Why is Base64 exactly 33% bigger?",
      answer:
        "Base64 represents every 3 bytes of binary with 4 text characters, a 4:3 ratio that works out to roughly a 33% increase. Padding characters at the end can add a byte or two more, so the encoded output is always somewhat larger than the original.",
    },
    {
      question: "When should I embed an image as Base64 instead of a file?",
      answer:
        "Only for very small images where saving an extra HTTP request is worth the size overhead: think tiny icons or a single hero placeholder inlined in CSS. For anything larger, or images reused across pages, serve a real file so it can be cached independently.",
    },
    {
      question: "Is Base64 a form of encryption?",
      answer:
        "No. Base64 is fully reversible with no secret key: anyone can decode it instantly. It only makes binary safe to move through text systems. It provides zero security, so never treat Base64 as a way to hide or protect data.",
    },
    {
      question: "Can Base64 hurt page performance?",
      answer:
        "It can. Inlining large assets as Base64 bloats your HTML or CSS, delays the initial render, and prevents the asset from being cached separately. For big or reused assets, a normal binary file with its own cacheable request is usually faster.",
    },
  ],
  relatedComparisonSlugs: [],
};

export default comparison;
