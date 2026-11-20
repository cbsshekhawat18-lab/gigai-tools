import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "tiff-vs-jpg",
  a: "TIFF",
  b: "JPG",
  title: "TIFF vs JPG: Which for Photography and Print?",
  description:
    "TIFF is lossless and archival with huge files. JPG is compressed and universal. Here's when to keep TIFF for print and editing, and when JPG is the right call.",
  accent: "violet",
  icon: "Image",
  seo: {
    title: "TIFF vs JPG: Which Format for Print & Photography? (2026)",
    description:
      "TIFF vs JPG explained: lossless quality vs file size, print and archiving, web compatibility, and exactly when to use TIFF or convert to JPG.",
    keywords: [
      "tiff vs jpg",
      "tiff vs jpeg",
      "tiff or jpg",
      "tiff vs jpg for printing",
      "is tiff better than jpg",
      "convert tiff to jpg",
    ],
    canonical: "/compare/tiff-vs-jpg",
  },
  intro: [
    "TIFF versus JPG is the classic trade-off between fidelity and practicality. TIFF (Tagged Image File Format) is a high-quality, typically lossless format that preserves every pixel. It's the standard in professional photography, scanning, printing and archiving, where keeping maximum detail matters more than file size, and TIFF files are big, often tens of megabytes.",
    "JPG (JPEG) goes the other way: it uses lossy compression to make photos small and universally openable. A JPG is a fraction of a TIFF's size and works on every device, browser and website, at the cost of discarding some detail during encoding, and losing a little more each time you re-save it.",
    "The practical answer is to work and archive in TIFF, and deliver in JPG. Keep the lossless master for editing and print. Export a JPG whenever you need to share, upload or display online. Below is the breakdown and the tools to convert a TIFF to JPG in your browser.",
  ],
  dimensions: [
    {
      label: "Compression",
      a: "Lossless (or uncompressed). Keeps every pixel.",
      b: "Lossy, discards detail to shrink the file.",
    },
    {
      label: "File size",
      a: "Very large, often tens of megabytes.",
      b: "Small, a fraction of a TIFF.",
    },
    {
      label: "Quality over edits",
      a: "No degradation when re-saved.",
      b: "Loses a little more quality each re-save.",
    },
    {
      label: "Web / device support",
      a: "Poor: browsers generally can't display TIFF.",
      b: "Universal, opens everywhere.",
    },
    {
      label: "Extra features",
      a: "Layers, multiple pages, high bit depth.",
      b: "Single flattened image.",
    },
    {
      label: "Best for",
      a: "Print, editing masters, scanning, archiving.",
      b: "Sharing, web, everyday photos.",
    },
  ],
  whenA: [
    "You're preparing images for professional print.",
    "You're editing and want a lossless master with no re-save loss.",
    "You're scanning or archiving where maximum detail matters.",
    "You need layers, high bit depth or multi-page images.",
  ],
  whenB: [
    "You're sharing, uploading or displaying photos online.",
    "You need small files that open on any device.",
    "You're emailing or posting where TIFF would be rejected or huge.",
    "The photo is 'final' and doesn't need further lossless editing.",
  ],
  verdict:
    "Keep TIFF as your editing and archival master for print and professional work, and export JPG for everything you share or display. TIFF wins on fidelity and flexibility. JPG wins on size and universal support. Since browsers can't even show TIFF, converting to JPG is the standard step before a photo goes online.",
  relatedToolSlugs: ["image-compressor", "png-to-jpg", "image-resizer", "webp-converter"],
  faq: [
    {
      question: "Is TIFF better quality than JPG?",
      answer:
        "Yes: TIFF is typically lossless, so it keeps every pixel with no compression artefacts, while JPG discards detail to shrink the file. TIFF is better for editing and print. JPG is better for sharing because it's tiny and universal.",
    },
    {
      question: "Should I use TIFF or JPG for printing?",
      answer:
        "For professional print, TIFF preserves the most detail and doesn't degrade. For everyday home or online printing, a high-quality JPG is usually indistinguishable and far more convenient.",
    },
    {
      question: "Why can't I open a TIFF in my browser?",
      answer:
        "Most browsers don't support TIFF display. Convert it to JPG (or PNG) to view and share it online, that's the normal step before putting a TIFF image on the web.",
    },
    {
      question: "Does converting TIFF to JPG lose quality?",
      answer:
        "Some, because JPG is lossy, but at a high quality setting the loss is usually invisible, and the file becomes dramatically smaller and universally openable. Keep the TIFF master if you'll edit or print later.",
    },
  ],
  relatedComparisonSlugs: ["png-vs-jpg", "jpg-vs-png-quality"],
};

export default comparison;
