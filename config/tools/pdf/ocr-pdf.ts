import type { Tool } from "@/types";

/**
 * OCR PDF, turns a scanned (image-only) PDF into a searchable one, entirely in
 * the browser with tesseract.js. Unlike the "convert" tools, OCR reads the text
 * OFF the page pixels and lays an invisible, selectable text layer back over the
 * original scan, so the file looks identical but can now be searched, copied and
 * indexed. All copy below is unique to recognition, and honest about the
 * first-use language-model download and in-browser processing.
 */
const ocrPdf: Tool = {
  slug: "ocr-pdf",
  title: "OCR PDF",
  description:
    "Turn a scanned PDF into searchable, selectable text with in-browser OCR. Get a searchable PDF plus the extracted text: free, private, no uploads.",
  category: "pdf-tools",
  group: "Optimize PDF",
  icon: "ScanText",
  accent: "cyan",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "OCR a PDF: Make Scanned Documents Searchable",
  tagline:
    "Recognise the text inside a scanned PDF and get it back two ways: a searchable copy that looks identical to your scan, and the plain text ready to copy. It all runs in your browser with Tesseract: nothing is uploaded.",
  longDescription:
    "A scanned PDF is really just a picture of a page: you can see the words, but you can't search, select or copy them. GigAI's OCR PDF fixes that by running Tesseract (a mature open-source recognition engine) directly in your browser tab. It rasterises each page, reads the characters, and rebuilds your PDF with an invisible text layer laid precisely over the original scan, so the file looks exactly the same but is now fully searchable. You also get the raw extracted text to copy in one click. The first time you use a language, its recognition model (a few megabytes) downloads to your browser and is cached for next time. Because everything happens on your device, even confidential contracts, receipts and records never leave your computer.",

  ctaText: "Run OCR",

  keywords: [
    "ocr pdf",
    "scanned pdf to searchable",
    "make pdf searchable",
    "extract text from scanned pdf",
    "pdf ocr online free",
    "tesseract pdf ocr",
    "searchable pdf converter",
    "recognise text in pdf",
    "image pdf to text",
  ],

  seo: {
    title: "OCR PDF. Make Scanned PDFs Searchable Free | GigAI Tools",
    description:
      "Run OCR on a scanned PDF for free in your browser. Get a searchable PDF and the extracted text, with Tesseract. No uploads, no sign-up and nothing stored.",
  },

  features: [
    {
      icon: "ScanText",
      title: "Real character recognition",
      description:
        "Tesseract reads the actual letters off each scanned page, so 'blurry image' becomes text you can search, select, copy and index. Not just a picture.",
    },
    {
      icon: "Layers",
      title: "Invisible text layer",
      description:
        "Your scan is preserved pixel-for-pixel. We lay a transparent, selectable text layer over each page, positioned word by word, so the file looks identical but is searchable.",
    },
    {
      icon: "Languages",
      title: "Pick your language",
      description:
        "Choose the document's language so Tesseract loads the matching model: English, French, German, Spanish and more, each tuned for that script's characters.",
    },
    {
      icon: "Clipboard",
      title: "Copy the raw text",
      description:
        "Alongside the searchable PDF you get the plain recognised text in a panel, ready to copy into a doc, spreadsheet or note in a single click.",
    },
    {
      icon: "ShieldCheck",
      title: "Runs on your device",
      description:
        "Recognition happens in your browser with WebAssembly. Your PDF is never uploaded, a genuine advantage for contracts, IDs, medical notes and anything private.",
    },
  ],

  benefits: [
    {
      title: "Search a document you couldn't before",
      description:
        "Once OCR runs, Ctrl+F actually finds words inside your former image-only PDF. No more scrolling page by page hunting for a clause or figure.",
    },
    {
      title: "Nothing leaves your computer",
      description:
        "Unlike server OCR services, recognition runs locally. The model downloads to you. Your document never travels the other way, so sensitive scans stay private.",
    },
    {
      title: "Two useful outputs",
      description:
        "You don't have to choose. Download the searchable PDF for archiving and sharing, and copy the extracted text when you just need the words themselves.",
    },
    {
      title: "Free, cached and offline-friendly",
      description:
        "No account or quota. After the first-use model download, the language stays cached in your browser, so repeat runs start instantly, even offline.",
    },
  ],

  howTo: [
    {
      title: "Upload your scanned PDF",
      description:
        "Drop in the PDF you want to make searchable, or click to browse. Image-only scans and photographed documents are exactly what OCR is for.",
    },
    {
      title: "Choose the language",
      description:
        "Pick the language the document is written in so Tesseract loads the right model. On first use that model downloads to your browser and is then cached.",
    },
    {
      title: "Run OCR",
      description:
        "Start recognition and watch the progress bar move page by page. Larger documents and higher accuracy take a little longer, it's your CPU doing the work.",
    },
    {
      title: "Download or copy",
      description:
        "Save the searchable PDF, or copy the extracted text from the panel. Not quite right? Try a different language or a cleaner scan and run it again.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF", "TXT"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Make a signed contract searchable",
      description:
        "Turn a scanned, signed agreement into a searchable PDF so you can jump straight to a clause, effective date or party name instead of reading every page.",
    },
    {
      audience: "Student",
      title: "Quote from a scanned journal article",
      description:
        "Extract the text from a photocopied paper or library scan so you can copy exact quotations into your essay and cite them without retyping by hand.",
    },
    {
      audience: "Business",
      title: "Index scanned invoices and receipts",
      description:
        "Run OCR across scanned expense paperwork so supplier names, totals and dates become searchable and your archive is finally findable, not just stored.",
    },
  ],

  troubleshooting: [
    {
      problem: "The recognised text has lots of mistakes or gibberish.",
      solution:
        "Accuracy depends on the scan. Re-scan or re-photograph the page straight-on, well-lit and at 300 DPI or higher, and make sure you picked the correct language, a mismatched model produces nonsense.",
    },
    {
      problem: "The first run is slow to start.",
      solution:
        "The very first time you use a language, its recognition model downloads to your browser (a few megabytes). That happens once. After it's cached, later runs in that language begin immediately.",
    },
    {
      problem: "My searchable PDF is bigger than the original.",
      solution:
        "OCR re-embeds each page image plus a text layer, so the file can grow. Run the result through our Compress PDF tool to shrink it. The invisible text layer is tiny and stays intact.",
    },
  ],

  tips: [
    "Higher-resolution scans read far better than screenshots. Aim for 300 DPI so letters have enough detail for Tesseract to recognise.",
    "Straighten and de-skew crooked pages before OCR. Text on a tilted line is much harder for the engine to read accurately.",
    "Pick the single language that matches the document. If it's genuinely bilingual, run it once per language and keep the cleaner result.",
    "For a purely photographic scan, OCR first to add searchable text, then compress. Do it in that order so the text layer survives.",
  ],

  security:
    "OCR runs entirely in your browser with tesseract.js (WebAssembly). Your PDF is read, recognised and rebuilt on your device and is never uploaded. Only the open-source language model is downloaded to you, and it's cached locally, your document travels nowhere and nothing is stored or logged.",

  faq: [
    {
      question: "What does OCR actually do to my PDF?",
      answer:
        "It reads the text out of your scanned page images and adds an invisible, selectable text layer on top of them. The page still looks exactly like your scan, but you can now search it, select words and copy them: the picture and the text coexist in one file.",
    },
    {
      question: "Is my document uploaded to a server?",
      answer:
        "No. Recognition runs in your browser using tesseract.js compiled to WebAssembly. Your PDF never leaves your device. The only thing downloaded is the language model, which comes to you and is cached locally for next time.",
    },
    {
      question: "Why is there a download the first time I run OCR?",
      answer:
        "Each language needs a trained recognition model, a few megabytes. Your browser fetches it once on first use for that language and then caches it, so subsequent OCR runs in the same language start straight away, even offline.",
    },
    {
      question: "Which languages are supported?",
      answer:
        "The selector offers common languages such as English, French, German, Spanish, Italian and Portuguese. Choose the one that matches your document so Tesseract loads the right model, using the wrong language badly hurts accuracy.",
    },
    {
      question: "How accurate is the recognition?",
      answer:
        "It's very good on clean, high-resolution, straight scans of ordinary print, and weaker on faint, skewed, handwritten or low-resolution pages. For the best results, scan at 300 DPI or higher, keep pages flat and pick the correct language.",
    },
    {
      question: "Can it read handwriting?",
      answer:
        "Not reliably. Tesseract is built for printed and typed text. Handwriting recognition is a different, much harder problem. You may get some words from very neat print-style writing, but cursive and casual handwriting won't come out cleanly.",
    },
  ],

  relatedTools: ["pdf-to-word", "pdf-to-jpg", "compress-pdf", "extract-pdf-pages"],
};

export default ocrPdf;
