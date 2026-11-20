import type { Tool } from "@/types";

/**
 * PDF to TXT: extract the plain-text layer from a PDF, entirely in the browser.
 *
 * This is a "read a PDF" tool: pdf.js walks every page's text layer and
 * concatenates it into clean UTF-8 plain text you can copy, edit and download
 * as a .txt file. Every string below is written for the searches people type
 * when they need the *words* out of a PDF. Not shared with the pdf-to-word or
 * pdf-to-html copy, and no claim outruns what a text-layer extractor can do:
 * this reads embedded text, it does NOT OCR scanned or image-only pages.
 */
const pdfToTxt: Tool = {
  slug: "pdf-to-txt",
  title: "PDF to TXT",
  description:
    "Extract all the text from a PDF into clean, editable plain text: copy it or download a.txt file. Reads every page's text layer in your browser. Nothing is uploaded. Scanned or image-only PDFs need OCR first.",
  category: "pdf-tools",
  group: "Convert from PDF",
  icon: "FileText",
  accent: "sky",
  status: "live",
  createdAt: "2026-06-18",

  h1: "PDF to TXT, Extract Plain Text From a PDF Online",
  tagline:
    "Drop a PDF and pull out every page of its text as clean, editable plain text, then copy it or save a.txt file in one click. It reads the PDF's embedded text layer right in your browser, so nothing is ever uploaded. Scanned or image-only PDFs have no text to extract until they're run through OCR.",
  longDescription:
    "The GigAI PDF to TXT extractor lifts the words out of a PDF and hands you clean, editable UTF-8 plain text. No formatting, no markup, just the content ready to reuse. Drop or paste a PDF and the tool walks every page's embedded text layer with pdf.js, concatenates it page by page, and shows the full result in a live pane you can read, select and copy immediately. Download it as a.txt file, copy the whole thing to your clipboard, or grab live word, character, line and page counts to check the extraction at a glance. It's built for the everyday jobs where you need the text and not the layout: pulling a quote out of a contract, feeding a report into a language model or a search index, salvaging body copy from a locked-down brochure, or turning a PDF ebook chapter into something you can edit in any plain-text editor. Because everything runs on your device with a PDF engine loaded on demand, confidential contracts, financial statements and unreleased documents never leave your machine, close the tab and every trace is gone. One honest, important boundary: this extracts a PDF's *existing* text layer. A PDF that is really a scan or a set of page images has no text layer to read, so it will come back empty, those need Optical Character Recognition (OCR) to turn the pixels into characters first, and the sibling OCR PDF tool does exactly that. Extraction also recovers reading order and words, not the original columns, tables, headers, footers or fonts. When you need the styling back, pdf-to-word or pdf-to-html rebuild rough structure instead of stripping it away.",

  ctaText: "Extract text",

  keywords: [
    "pdf to txt",
    "pdf to text",
    "extract text from pdf",
    "pdf to txt converter",
    "convert pdf to text",
    "pdf text extractor",
    "copy text from pdf",
    "pdf to plain text",
    "get text out of pdf",
    "pdf to txt online",
    "pdf to txt free",
    "save pdf as text",
  ],

  seo: {
    title: "PDF to TXT, Extract Text From PDF Online Free | GigAI Tools",
    description:
      "Free online PDF to TXT converter. Extract all the text from a PDF into clean, editable plain text and download a.txt file, 100% in your browser, nothing uploaded. Reads the PDF text layer. Scanned PDFs need OCR first.",
  },

  features: [
    {
      icon: "FileText",
      title: "Every page's text, in order",
      description:
        "pdf.js walks each page's embedded text layer and concatenates it into one clean plain-text document, page by page in reading order. No markup, no styling, just the words.",
    },
    {
      icon: "Eye",
      title: "Live preview you can read & select",
      description:
        "The full extracted text appears in a scrollable pane the moment the PDF loads, so you can read it, select passages and confirm the extraction before you copy or download anything.",
    },
    {
      icon: "Copy",
      title: "Copy or download .txt",
      description:
        "Copy the entire text to your clipboard with one click, or download a UTF-8.txt file named after your PDF, ready to paste into an editor, a search index or a language-model prompt.",
    },
    {
      icon: "Hash",
      title: "Live word, character & page counts",
      description:
        "See exactly how much text came out (words, characters, lines and page count) so you can spot an empty scan or a partial extraction at a glance.",
    },
    {
      icon: "Lock",
      title: "Handles password-protected PDFs",
      description:
        "If a PDF is encrypted, enter its open password and the tool decrypts it locally to read the text: the password and the file never leave your browser.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing and extraction happen entirely in your browser with a PDF engine loaded on demand. Contracts, statements and private documents are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Get the words, skip the layout",
      description:
        "When you only need the content (a quote, a clause, a chapter) this strips away columns, fonts and page furniture and gives you clean text you can immediately edit and reuse.",
    },
    {
      title: "Feed PDFs into anything text",
      description:
        "Plain text is the universal input: paste extracted PDF text into a language model, a search index, a translator or a spreadsheet without wrestling with PDF-specific tooling.",
    },
    {
      title: "Private by default",
      description:
        "Because extraction is local, confidential PDFs never touch a server. No upload, no account, no retention. Ideal for legal, financial and internal documents.",
    },
    {
      title: "Honest about scans",
      description:
        "It tells you plainly when a PDF has no text layer to read and points you at OCR, instead of silently returning gibberish or an empty file.",
    },
  ],

  howTo: [
    {
      title: "Add your PDF",
      description:
        "Drop a PDF onto the drop zone, click to browse, or paste one from your clipboard. If it's password-protected, enter the open password when prompted.",
    },
    {
      title: "Let it extract the text",
      description:
        "The tool reads every page's text layer in your browser and shows the full plain-text result in the preview pane, along with word, character, line and page counts.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the whole text to your clipboard, or download a .txt file named after your PDF. Reset in one click to extract text from another document.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["TXT", "Plain text"],
  },

  useCases: [
    {
      audience: "Legal & compliance",
      title: "Pull clauses out of contracts",
      description:
        "Extract the text of an agreement to quote a clause, run a keyword search, or paste sections into a review tool: without retyping and without uploading the contract anywhere.",
    },
    {
      audience: "Data / AI engineer",
      title: "Feed PDFs into models & indexes",
      description:
        "Turn a report or datasheet into clean plain text to embed, index, or drop into a language-model prompt, skipping the noise that PDF-specific parsers add.",
    },
    {
      audience: "Student / Researcher",
      title: "Get quotable text from papers",
      description:
        "Extract the body text of a journal article or ebook chapter into a plain-text file you can annotate, quote and cite in any editor.",
    },
    {
      audience: "Writer / Editor",
      title: "Salvage copy from a PDF",
      description:
        "Recover the words from a brochure, whitepaper or press release that only exists as a PDF, so you can edit and repurpose the copy without rebuilding it by hand.",
    },
  ],

  troubleshooting: [
    {
      problem: "My PDF came back empty or with almost no text.",
      solution:
        "That PDF is almost certainly a scan or made of page images, which have no text layer to read. Run it through the OCR PDF tool first to recognise the characters, then extract the text here.",
    },
    {
      problem: "The line breaks and spacing look odd.",
      solution:
        "Extraction preserves the words and reading order but not the original layout, so wrapped lines, columns, tables and headers can produce uneven breaks. Clean the text up in any editor, or use pdf-to-word / pdf-to-html if you need rough structure restored instead of stripped.",
    },
    {
      problem: "It asks for a password.",
      solution:
        "The PDF is encrypted. Enter its open (user) password and extraction runs locally: nothing is sent anywhere. If you don't have the password, unlock it first with the Unlock PDF tool.",
    },
    {
      problem: "Some characters or ligatures look wrong.",
      solution:
        "A few PDFs embed fonts with non-standard character maps, so exotic glyphs, ligatures or symbols can extract imperfectly. The bulk of the body text is reliable. Spot-fix the odd character in your editor.",
    },
  ],

  tips: [
    "Only need a passage? Extract everything, then select and copy just the lines you want from the preview pane.",
    "Check the page count against your PDF, if it's lower than expected, a page may be an image that needs OCR.",
    "For a scanned PDF, run OCR PDF first, then bring the searchable result back here for clean text.",
    "Extracted text is UTF-8, so accented and non-Latin characters copy across into editors and prompts intact.",
    "Need the formatting back instead of stripped away? Try pdf-to-word or pdf-to-html rather than this text-only extractor.",
  ],

  security:
    "Your PDF is parsed and its text extracted entirely in your browser using a PDF engine loaded on demand: the file is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely extract text from contracts, financial statements and confidential documents. Password-protected PDFs are decrypted locally. The password never leaves your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The PDF is read and its text extracted locally in your browser using a PDF engine loaded on demand. Your file never leaves your device, so there is nothing for us to store, log or see: it's safe for confidential contracts and internal documents.",
    },
    {
      question: "Why did my PDF come back empty?",
      answer:
        "Because it has no text layer to read. Many PDFs are actually scans or page images. The words are pixels, not characters, so there is nothing to extract. Run the file through the OCR PDF tool first to recognise the text, then extract it here. This tool is honest about that instead of returning an empty or garbled file silently.",
    },
    {
      question: "What's the difference between PDF to TXT and PDF to Word?",
      answer:
        "PDF to TXT gives you clean plain text with the formatting stripped away: ideal when you just need the words. PDF to Word (and PDF to HTML) instead try to rebuild rough structure like paragraphs and headings. Choose this tool when you want editable text, and the others when you want to keep some layout.",
    },
    {
      question: "Does it extract text from every page?",
      answer:
        "Yes. It walks every page in the document, in order, and concatenates each page's text into one plain-text result. The live page count lets you confirm all pages were read. A lower-than-expected count usually means a page is an image that needs OCR.",
    },
    {
      question: "Can it handle password-protected PDFs?",
      answer:
        "Yes, if you know the open (user) password. Enter it when prompted and the PDF is decrypted locally to read the text. The password and file never leave your browser. If you don't have the password, unlock the PDF first with the Unlock PDF tool.",
    },
    {
      question: "Is the extracted text accurate?",
      answer:
        "For PDFs with a proper embedded text layer, extraction is faithful and reliable. Words and reading order are preserved, though the original layout (columns, tables, headers) is not, so line breaks may need tidying. A small number of PDFs embed fonts with unusual character maps, which can garble the odd glyph or ligature.",
    },
    {
      question: "Will the layout, columns and tables be preserved?",
      answer:
        "No. This is a plain-text extractor, so it recovers the words and their reading order but deliberately drops columns, tables, fonts and page furniture. If you need structure restored rather than stripped, use pdf-to-word or pdf-to-html, which reconstruct rough paragraphs and headings.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Once the page and its on-demand PDF engine have loaded, extraction is entirely local, so it keeps working without a connection and your documents stay on your machine.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drop/paste a PDF and extract every page's text layer to clean UTF-8 plain text, with a live preview, copy-to-clipboard,.txt download and live word/character/line/page counts.",
    },
    {
      date: "2026-06-24",
      change:
        "Added support for password-protected PDFs (decrypted locally) and a clearer empty-result notice that points scanned or image-only PDFs to the OCR PDF tool.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved page-boundary handling for cleaner separation between pages and added the live page count to help spot image-only pages that need OCR.",
    },
  ],

  relatedTools: ["pdf-to-word", "ocr-pdf", "text-to-pdf", "unlock-pdf"],
};

export default pdfToTxt;
