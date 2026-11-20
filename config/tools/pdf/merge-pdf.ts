import type { Tool } from "@/types";

/**
 * Merge PDF: the REFERENCE PDF tool. Its shape (accent, full micro-site
 * content, useCases / troubleshooting / tips / security) is the template every
 * other PDF tool follows. All copy is unique to merging and kept honest: pages
 * are combined in the browser with pdf-lib, in the exact order you arrange
 * them, and nothing is ever uploaded.
 */
const mergePdf: Tool = {
  slug: "merge-pdf",
  title: "Merge PDF",
  notFor: [
    { text: "It does not convert images to PDF first - do that, then merge.", toolSlug: "jpg-to-pdf" },
    { text: "It does not compress the combined file.", toolSlug: "compress-pdf" },
  ],
  description:
    "Combine multiple PDF files into a single document, drag to set the order, then download. Free, fast and entirely in your browser.",
  category: "pdf-tools",
  group: "Organize PDF",
  icon: "Combine",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "Merge PDF Files Online: Free & Private",
  tagline:
    "Join two or more PDFs into one tidy document. Reorder pages by dragging, remove any file you don't need, and export in seconds. No uploads, no watermark.",
  longDescription:
    "The GigAI PDF Merger stitches several PDFs into a single file without ever sending them to a server. Drop in your documents, drag them into the order you want, and the tool assembles one continuous PDF using pdf-lib, right inside your browser tab. It preserves the original page content, works with dozens of files at once, and never adds a watermark or a page limit. Because everything runs locally, merging is instant even for large reports, contracts or scanned bundles, and your files stay completely private.",

  ctaText: "Merge PDFs",

  keywords: [
    "merge pdf",
    "combine pdf",
    "join pdf files",
    "pdf merger",
    "merge pdf online",
    "combine pdf files free",
    "concatenate pdf",
    "merge multiple pdfs",
    "pdf joiner",
  ],

  seo: {
    title: "Merge PDF, Combine PDF Files Online Free | GigAI Tools",
    description:
      "Merge PDF files into one document for free. Drag to reorder, combine as many PDFs as you like, and download: 100% private, no uploads, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "ListOrdered",
      title: "Drag-to-order merging",
      description:
        "Arrange your files exactly how the final document should read. Drag rows or use the keyboard. The order you set is the order they're joined.",
    },
    {
      icon: "Layers",
      title: "Unlimited files, no watermark",
      description:
        "Combine two PDFs or fifty. There's no file cap, no page limit and nothing stamped onto your output: just a clean, single document.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Files are read and merged locally with pdf-lib. They're never uploaded, stored or seen by anyone: the privacy promise holds for every page.",
    },
    {
      icon: "Zap",
      title: "Instant, even for big files",
      description:
        "No queue and no round-trip to a server. Assembly happens on your device, so large reports and scanned bundles merge in a moment.",
    },
    {
      icon: "FileCheck2",
      title: "Content preserved",
      description:
        "Text, images and vector graphics carry over intact. The merged PDF keeps each source page as-is, so nothing is re-rendered or degraded.",
    },
  ],

  benefits: [
    {
      title: "Private by design",
      description:
        "Merging runs entirely inside your browser tab. Your documents never leave your device, so there's nothing for us to upload, store or read.",
    },
    {
      title: "You control the order",
      description:
        "Nothing is auto-arranged. Drag files into place, remove any you don't need, and preview the sequence before you export a single page.",
    },
    {
      title: "Free with no catches",
      description:
        "No account, no daily limit, no paywall and no watermark. Combine as many PDFs as you like, as often as you like, at no cost.",
    },
    {
      title: "Works on any device",
      description:
        "It's a normal web page. No install, plugin or app. Merge from a laptop, tablet or phone and get the exact same clean result.",
    },
  ],

  howTo: [
    {
      title: "Add your PDFs",
      description:
        "Drag your PDF files onto the drop zone, or click to browse and select several at once. Add more at any time.",
    },
    {
      title: "Set the order",
      description:
        "Drag the files into the sequence you want, or use the up/down controls. Remove any file you added by mistake.",
    },
    {
      title: "Merge",
      description:
        "Hit Merge PDFs. The tool joins every file, in order, into one document: locally, in a moment, with no upload.",
    },
    {
      title: "Download",
      description:
        "Download your single combined PDF. Not quite right? Reorder and merge again: it's instant and unlimited.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Assemble a complete proposal",
      description:
        "Merge a cover letter, scope, pricing sheet and case studies into one polished PDF a client can read top-to-bottom in a single file.",
    },
    {
      audience: "Student",
      title: "Combine coursework into one submission",
      description:
        "Join separate chapters, appendices and the reference list into a single document that meets a one-file upload requirement.",
    },
    {
      audience: "Business",
      title: "Bundle invoices and receipts",
      description:
        "Pull a month of invoices, receipts and statements into one ordered PDF for accounting, expense claims or an audit trail.",
    },
  ],

  troubleshooting: [
    {
      problem: "The pages ended up in the wrong order.",
      solution:
        "The merge follows the file list top-to-bottom. Drag each file into place (or use the up/down arrows) before merging. The number on each row is its position in the final PDF.",
    },
    {
      problem: "One of my PDFs won't add or fails to merge.",
      solution:
        "The file may be password-protected or corrupted. Unlock it first with our Unlock PDF tool, or re-save it from its source, then add it again.",
    },
    {
      problem: "The merged file is very large.",
      solution:
        "Merging keeps every page's original data, so sizes add up, especially with scans. Run the result through our Compress PDF tool to shrink it without losing readability.",
    },
  ],

  tips: [
    "Name your files 1-cover, 2-body, 3-appendix before you drop them in: they'll sort naturally into the right order.",
    "Add a short title or divider page between sections so the merged document is easy to navigate.",
    "Merging scanned images? Convert them to PDF first with JPG to PDF, then combine them here for a cleaner result.",
    "If the final PDF feels heavy, compress it afterwards. Merging preserves quality, so you can always slim it down later.",
  ],

  security:
    "Your PDFs are merged entirely in your browser with pdf-lib and never uploaded to any server. Nothing is stored, logged or shared, when you close the tab, every file is gone.",

  faq: [
    {
      question: "Are my PDF files uploaded to a server?",
      answer:
        "No. The merger runs entirely in your browser using pdf-lib. Your files are read, combined and downloaded locally. They never leave your device, so there's nothing for us to store or see.",
    },
    {
      question: "How do I control the order pages appear in?",
      answer:
        "The merged PDF follows your file list from top to bottom. Drag each file into place, or use the up and down controls, before you merge. The number on each row shows exactly where that file will land in the final document.",
    },
    {
      question: "Is there a limit on how many PDFs I can merge?",
      answer:
        "There's no artificial cap. You can combine two files or dozens. The only practical limit is your device's memory, since all the files are held in the browser while they're joined together.",
    },
    {
      question: "Will merging add a watermark or reduce quality?",
      answer:
        "Never. No watermark is added, and each source page is copied over as-is, so text stays selectable and images keep their original quality. The tool concatenates pages rather than re-rendering them.",
    },
    {
      question: "Can I merge password-protected PDFs?",
      answer:
        "Not directly. An encrypted PDF has to be unlocked first. Use our Unlock PDF tool to remove the password (you'll need to know it), then add the unlocked file to the merger.",
    },
    {
      question: "Is it really free?",
      answer:
        "Yes, completely. There's no account, no daily limit and no paywall. Because the work happens on your device, we don't pay for servers to process your files, so we can offer it free with no strings attached.",
    },
  ],

  relatedTools: ["split-pdf", "compress-pdf", "jpg-to-pdf", "rotate-pdf"],
};

export default mergePdf;
