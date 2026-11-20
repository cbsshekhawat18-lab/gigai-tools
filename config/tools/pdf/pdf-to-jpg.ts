import type { Tool } from "@/types";

/**
 * PDF to JPG, rasterises every page of a single PDF into an image (JPG or PNG)
 * entirely in the browser with pdf.js. One image per page, a quality dial for
 * JPG, and a single-click ZIP of the whole set. All copy is unique to
 * converting pages into pictures and stays honest: rendering is local, so text
 * becomes a flat image and nothing is ever uploaded.
 */
const pdfToJpg: Tool = {
  slug: "pdf-to-jpg",
  title: "PDF to JPG",
  description:
    "Turn every page of a PDF into a JPG or PNG image, right in your browser. Pick a quality, preview the pages, and download them all as a ZIP.",
  category: "pdf-tools",
  group: "Convert from PDF",
  icon: "Image",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "PDF to JPG, Convert PDF Pages to Images Free",
  tagline:
    "Render each page of a PDF as a crisp JPG or PNG image. Choose the format and quality, see a live preview of every page, then grab them individually or as one ZIP. No uploads, no watermark.",
  longDescription:
    "The GigAI PDF to JPG converter opens your document with pdf.js and paints each page onto a canvas, then exports it as a standalone image: JPG for small, shareable files or PNG for pixel-perfect, lossless output. Everything happens inside your browser tab: the file is never sent to a server, so even large or sensitive PDFs convert privately and instantly. You control the quality, preview every rendered page before you commit, and download a single page or the entire set bundled into one ZIP. Because pages are rasterised, the result is a true picture of what's on the page, perfect for embedding in slides, posting online, or pulling a chart out of a report.",

  ctaText: "Convert to JPG",

  keywords: [
    "pdf to jpg",
    "pdf to image",
    "convert pdf to jpg",
    "pdf to png",
    "pdf pages to images",
    "export pdf as jpg",
    "pdf to jpg online",
    "extract images from pdf",
    "pdf page to picture",
  ],

  seo: {
    title: "PDF to JPG: Convert PDF to Images Online Free | GigAI Tools",
    description:
      "Convert PDF pages to JPG or PNG images for free. Choose quality, preview every page, and download them all as a ZIP: 100% in your browser, no uploads, no watermark.",
  },

  features: [
    {
      icon: "Images",
      title: "One image per page",
      description:
        "Every page in your PDF becomes its own JPG or PNG, numbered in order. A ten-page document gives you ten clean, ready-to-use images.",
    },
    {
      icon: "SlidersHorizontal",
      title: "JPG or PNG, your quality",
      description:
        "Pick JPG with a quality slider for small, sharable files, or PNG for lossless, pixel-perfect output. You set the trade-off between size and fidelity.",
    },
    {
      icon: "Eye",
      title: "Preview before you download",
      description:
        "See a thumbnail of every rendered page in a grid first, so you can confirm the format and quality look right before saving anything.",
    },
    {
      icon: "FileArchive",
      title: "Download all as one ZIP",
      description:
        "Grab a single page, or bundle the whole set into one ZIP archive with a single click. No downloading pages one by one.",
    },
    {
      icon: "ShieldCheck",
      title: "Renders locally with pdf.js",
      description:
        "Your PDF is opened and rasterised entirely in the browser. It's never uploaded, stored or seen by anyone: conversion is completely private.",
    },
  ],

  benefits: [
    {
      title: "Truly private",
      description:
        "Rendering runs inside your browser tab using pdf.js. Your document never leaves your device, so confidential reports and scans stay yours alone.",
    },
    {
      title: "Format on your terms",
      description:
        "Choose JPG for lightweight images or PNG for sharp, lossless pages, and dial the JPG quality up or down to hit the exact size you need.",
    },
    {
      title: "No watermark, no cap",
      description:
        "Convert a one-pager or a hundred-page report. Nothing is stamped on the output, there's no page limit, and no account is required.",
    },
    {
      title: "Works everywhere",
      description:
        "It's a normal web page. No plugin, install or desktop app. Convert from a laptop, tablet or phone and get identical results.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag a single PDF onto the drop zone, or click to browse and select one. It's read locally: nothing is uploaded.",
    },
    {
      title: "Choose format & quality",
      description:
        "Pick JPG or PNG. For JPG, slide the quality control to balance sharpness against file size.",
    },
    {
      title: "Convert & preview",
      description:
        "Hit Convert. Each page is rendered to an image and shown as a thumbnail so you can check the result.",
    },
    {
      title: "Download",
      description:
        "Save any single page, or download the whole set as one ZIP. Change the settings and re-run any time.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["JPG", "PNG"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Pull a figure out of a report",
      description:
        "Convert a data-heavy PDF to images and drop the exact chart or diagram straight into an email, deck or design mockup. No re-drawing required.",
    },
    {
      audience: "Student",
      title: "Turn lecture notes into images",
      description:
        "Render a PDF handout to JPGs you can annotate on a tablet, paste into a study doc, or post to a group chat without a PDF viewer.",
    },
    {
      audience: "Business",
      title: "Publish a brochure page online",
      description:
        "Export brochure or menu pages as web-ready JPGs to embed on a site or social post, where an image loads faster and looks native.",
    },
  ],

  troubleshooting: [
    {
      problem: "The images look blurry or low-resolution.",
      solution:
        "Switch to PNG for lossless output, or bump the JPG quality higher. Pages are rendered at roughly 150 DPI by default, plenty for screens, though very fine print may need the sharper PNG option.",
    },
    {
      problem: "My PDF won't open or convert.",
      solution:
        "The file may be password-protected or corrupted. Remove the password first with our Unlock PDF tool, or re-save the PDF from its source, then try converting again.",
    },
    {
      problem: "The ZIP or images are larger than expected.",
      solution:
        "PNG is lossless and can be big for photo-heavy pages. Choose JPG and lower the quality for much smaller files. Text-only pages compress best as JPG.",
    },
  ],

  tips: [
    "Use JPG at 80–90 quality for the best balance of sharpness and small file size on most pages.",
    "Pick PNG only when you need lossless edges, diagrams, screenshots or pages with crisp line art.",
    "Converting a long PDF? Rendering happens page by page, so give big documents a moment to finish.",
    "Need just one chart? Convert the whole PDF, then download only the page image you want from the preview grid.",
  ],

  security:
    "Your PDF is opened and rasterised entirely in your browser with pdf.js, it's never uploaded to any server. No page, image or ZIP is stored, logged or shared, and everything is discarded the moment you close the tab.",

  faq: [
    {
      question: "Is my PDF uploaded to a server to convert it?",
      answer:
        "No. The converter runs completely in your browser using pdf.js. Each page is rendered to an image on your own device and downloaded locally, the file never leaves your computer, so there's nothing for us to store or see.",
    },
    {
      question: "Should I choose JPG or PNG?",
      answer:
        "Choose JPG for small, shareable images: it's ideal for pages with photos or lots of text, and the quality slider lets you trade a little sharpness for a much smaller file. Choose PNG when you need lossless, pixel-perfect output, such as diagrams, screenshots or crisp line art.",
    },
    {
      question: "How many pages will I get?",
      answer:
        "Exactly one image per page. A five-page PDF produces five images, numbered in order (page-01, page-02, and so on), so they stay in sequence when you download and open them.",
    },
    {
      question: "Can I download all the pages at once?",
      answer:
        "Yes. After converting you can save any single page, or click Download all to bundle every image into one ZIP archive. No need to save them one at a time.",
    },
    {
      question: "Will the text in the images still be selectable?",
      answer:
        "No: converting a page to JPG or PNG turns it into a flat picture, so the text becomes part of the image and can't be selected or searched. If you need editable text, use our PDF to Word tool instead.",
    },
    {
      question: "What resolution are the images?",
      answer:
        "Pages render at roughly 150 DPI by default, which is sharp on any screen. For finer detail, choose PNG for lossless output, a good fit when the images will be zoomed in or printed.",
    },
  ],

  relatedTools: ["jpg-to-pdf", "pdf-to-word", "compress-pdf", "split-pdf"],
};

export default pdfToJpg;
