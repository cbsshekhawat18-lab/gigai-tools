import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-merge-pdf-files",
  title: "How to Merge PDF Files Into One (Free, No Upload)",
  description:
    "Combine several PDFs into a single document in seconds: reorder pages, no software, no watermark. A step-by-step guide to merging PDF files in your browser.",
  accent: "rose",
  icon: "Files",
  toolSlug: "merge-pdf",
  seo: {
    title: "How to Merge PDF Files Free (Combine PDFs, No Upload)",
    description:
      "Learn how to merge multiple PDF files into one document in your browser, free, private and instant. Step-by-step, with tips for ordering pages correctly.",
    keywords: [
      "how to merge pdf files",
      "combine pdf files",
      "merge pdf online free",
      "join pdf files",
      "put pdfs together",
    ],
    canonical: "/how-to/how-to-merge-pdf-files",
  },
  intro: [
    "Sending someone five separate PDFs is a hassle. They arrive out of order, get lost between emails, and have to be opened one at a time. Merging them into a single document solves all of that: one file, in the exact order you want, easy to email, print or archive. It's one of the most common PDF tasks, whether you're assembling a report, a contract with its appendices, or a set of scanned receipts.",
    "You don't need Acrobat or any paid software. The guide below uses our free Merge PDF tool, which runs entirely in your browser: your files never leave your device, there's no sign-up, and the combined PDF has no watermark. The whole process takes under a minute even for a dozen files.",
  ],
  steps: [
    {
      title: "Open the Merge PDF tool",
      body: "Head to the Merge PDF tool. It loads instantly and works on desktop and mobile: nothing to install and no account required.",
    },
    {
      title: "Add your PDF files",
      body: "Drag all the PDFs you want to combine onto the drop zone, or click to browse and select several at once. Each file is loaded locally in your browser and is never uploaded to a server.",
    },
    {
      title: "Arrange the files in the right order",
      body: "The tool lists your files as a set of tiles or rows. Drag them to reorder. The merged document will follow this sequence top to bottom, so put the cover or first document at the very top.",
    },
    {
      title: "Remove or double-check any files",
      body: "Scan the list to make sure every file belongs and nothing is duplicated. Remove anything you added by mistake before merging so you don't have to redo it.",
    },
    {
      title: "Merge the PDFs",
      body: "Click Merge and the tool stitches every page from every file into one continuous PDF in the order you set. It happens in seconds, entirely on your device.",
    },
    {
      title: "Download the combined PDF",
      body: "Save the single merged PDF to your device. It has no watermark and preserves the original page quality, so it's ready to send, print or store straight away.",
    },
  ],
  tips: [
    "Name your files with a number prefix (01-cover, 02-report) before you upload, they're easier to drop into the right order.",
    "If a document has pages you don't want in the final file, split or delete those pages first, then merge the trimmed version.",
    "Merging doesn't re-compress your pages, so the combined file is roughly the sum of the originals. Run it through a PDF compressor afterward if it's too large to email.",
    "Check the page order once in the preview before downloading, it's much quicker to fix the sequence now than after you've sent it.",
  ],
  faq: [
    {
      question: "How many PDFs can I merge at once?",
      answer:
        "You can combine many files in a single pass, there's no hard limit imposed by the tool. Because everything runs in your browser, the practical ceiling is your device's memory, which comfortably handles dozens of ordinary documents.",
    },
    {
      question: "Will merging change the quality of my PDFs?",
      answer:
        "No. Merging copies the original pages as-is into a new document without re-compressing them, so text stays sharp and images keep their original quality. Only the file structure changes, not the content.",
    },
    {
      question: "Can I reorder the pages before merging?",
      answer:
        "Yes. You can drag the files into any order before combining them, and the merged PDF follows that sequence. If you need to rearrange individual pages within a file, do that first with a page-reordering tool, then merge.",
    },
    {
      question: "Is it safe to merge PDFs online?",
      answer:
        "With this tool, yes. The merge happens entirely in your browser, so your documents are processed on your own device and never uploaded to a server. Nothing is stored or logged, making it safe even for confidential files.",
    },
    {
      question: "Do I need to install any software?",
      answer:
        "No. Everything happens in your web browser, there's nothing to download or install, no account to create and no watermark on the merged result.",
    },
  ],
  relatedToolSlugs: ["split-pdf", "compress-pdf", "reorder-pdf-pages", "delete-pdf-pages"],
  relatedHowToSlugs: [],
};

export default howto;
