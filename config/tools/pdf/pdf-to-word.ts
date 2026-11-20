import type { Tool } from "@/types";

/**
 * PDF to Word, an IN-BROWSER converter (pdf.js text extraction → `docx`).
 *
 * The module still tries `convertOnServer(file, "pdf-to-word")` first, so a
 * LibreOffice endpoint would light up automatically if one were deployed again.
 * It is NOT deployed today (/api/convert/pdf-to-word returns 404) so every
 * conversion in practice runs in the browser, and this copy describes that path
 * because it is the one users actually get.
 *
 * The page previously led with "high-fidelity LibreOffice conversion" and
 * carried `serverSide: true`, which put a red "we upload your file" badge on a
 * tool that uploads nothing, while promising layout reconstruction it does not
 * currently perform. Both are fixed here.
 *
 * HONEST LIMITS, stated on the page rather than discovered: the browser path
 * recovers TEXT, not layout, paragraphs come across editable, but tables are
 * not rebuilt as Word tables and columns are linearised. Scanned PDFs have no
 * text layer at all and need OCR first. If LibreOffice ever returns, restore
 * the layout claims, but not before.
 */
const pdfToWord: Tool = {
  slug: "pdf-to-word",
  title: "PDF to Word",
  description:
    "Turn a PDF into an editable Microsoft Word (.docx) document, text extracted into clean, editable paragraphs, entirely in your browser with no upload.",
  category: "pdf-tools",
  group: "Convert from PDF",
  icon: "FileType2",
  accent: "sky",
  status: "live",
  serverSide: false,
  featured: true,
  createdAt: "2026-07-02",

  h1: "PDF to Word Converter, Editable.docx, Free",
  tagline:
    "Convert a PDF into an editable Word document you can open, rewrite and reformat, extracted in your browser, so the file is never uploaded.",
  longDescription:
    "GigAI's PDF to Word converter turns a PDF into an editable.docx you can open straight in Microsoft Word, Google Docs, LibreOffice Writer or Pages, and it does the whole job inside your browser tab, so the PDF is never uploaded, stored or logged. That is the point of it: the PDFs people most often need back in Word are contracts, invoices, reports, statements and coursework, which are exactly the files you should not hand to an anonymous converter. Be clear about what you get, because a lot of converters are not. This recovers your TEXT, as real editable paragraphs you can retype, restyle and reflow. Not a picture of text, and not a locked scan. What it does not do is rebuild page layout: tables come across as text rather than as Word tables, multi-column pages are linearised into a single reading order, and precise positioning is not reproduced. For pulling the words out of a document so you can rewrite it, that is exactly right and usually what people actually want. For recreating a designed page pixel-for-pixel, no browser tool will do that, and you are better off rebuilding it. One more thing worth knowing: a scanned PDF is images, with no text layer to extract, so run it through OCR PDF first and then convert. Free, unlimited, no account and no watermark.",

  ctaText: "Convert to Word",

  keywords: [
    "pdf to word",
    "convert pdf to word",
    "pdf to word converter",
    "editable word from pdf",
    "pdf to word online free",
    "pdf to microsoft word",
    "pdf to doc",
    "extract text from pdf to word",
  ],

  seo: {
    title: "PDF to Word Converter: Free Editable.docx | GigAI Tools",
    description:
      "Convert PDF to an editable Word (.docx) document free, entirely in your browser. Your file is never uploaded. Text becomes editable paragraphs. No watermark, no sign-up.",
  },

  features: [
    {
      icon: "CloudOff",
      title: "Your PDF is never uploaded",
      description:
        "The text is extracted and the .docx assembled inside your browser tab, so a contract, invoice or statement never touches a server. It works with the network disconnected.",
    },
    {
      icon: "PenLine",
      title: "Real editable text, not a picture",
      description:
        "Every paragraph arrives as genuine Word text you can retype, restyle and reflow. Nothing is flattened into an image, so there's no re-typing from scratch.",
    },
    {
      icon: "TriangleAlert",
      title: "Honest about what it recovers",
      description:
        "It recovers text, not page layout: tables come across as text rather than Word tables, and columns are linearised. Said up front rather than found out after you open the file.",
    },
    {
      icon: "ScanText",
      title: "Tells you when a PDF is a scan",
      description:
        "A scanned page is an image with no text to extract. Rather than handing you an empty document, the tool says so and points you at OCR PDF to add a text layer first.",
    },
    {
      icon: "PenLine",
      title: "Genuinely editable output",
      description:
        "Open the result in Word, Google Docs or LibreOffice and edit every line. No re-typing, no locked scans, no watermark stamped across your pages.",
    },
  ],

  benefits: [
    {
      title: "Edit instead of retype",
      description:
        "Reuse the words already in a PDF. Convert once and rework the copy in Word rather than manually transcribing a report, contract or brief line by line.",
    },
    {
      title: "Two paths, one guarantee",
      description:
        "You get an editable.docx every time, without a queue, an account or an upload, and you know exactly what was recovered before you open it.",
    },
    {
      title: "Free with no watermark",
      description:
        "No account, no daily quota, no paywall and nothing stamped onto your document, convert as many PDFs to Word as you need at no cost.",
    },
    {
      title: "Honest about the trade-offs",
      description:
        "We tell you which engine produced your file and what each does well, so you know whether to expect full layout or clean text-only output.",
    },
  ],

  howTo: [
    {
      title: "Add your PDF",
      description:
        "Drag a PDF onto the drop zone or click to browse. One file at a time keeps the conversion focused and fast.",
    },
    {
      title: "Convert",
      description:
        "Hit Convert to Word. The text is extracted and the.docx assembled right here in the tab. Nothing is uploaded and there's no queue to wait in.",
    },
    {
      title: "Check which engine ran",
      description:
        "The result names the path that produced your document, so you always know what to expect before you open it.",
    },
    {
      title: "Download the .docx",
      description:
        "Save your editable Word file and open it in Word, Google Docs or LibreOffice Writer to start editing right away.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["DOCX"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Repurpose a finished report",
      description:
        "Convert a signed-off PDF report back to Word so you can update figures, refresh a section and re-export next quarter without rebuilding it from scratch.",
    },
    {
      audience: "Student",
      title: "Quote from a source cleanly",
      description:
        "Pull a passage from a lecture handout or journal PDF into an editable document so you can excerpt and cite it accurately instead of retyping by hand.",
    },
    {
      audience: "Business",
      title: "Update a contract template",
      description:
        "Turn a PDF agreement into Word to adjust terms, party names and dates in tracked changes, then send it on for review as a live document.",
    },
  ],

  troubleshooting: [
    {
      problem: "The output says it used the fast in-browser fallback.",
      solution:
        "That's the normal path, extraction happens in your browser, which is why the PDF is never uploaded. It recovers text as editable paragraphs but doesn't rebuild tables as Word tables or preserve multi-column positioning. If a page comes out empty, the PDF is almost certainly a scan: run OCR PDF over it first to add a text layer, then convert.",
    },
    {
      problem: "My scanned PDF converted to an empty or garbled document.",
      solution:
        "Scanned pages are images with no selectable text. Run the file through our OCR PDF tool first to add a text layer, then convert that searchable PDF to Word.",
    },
    {
      problem: "Some formatting shifted in the Word file.",
      solution:
        "Complex multi-column layouts and unusual fonts can reflow during conversion. Tidy up in Word after opening, or simplify the source PDF's layout before converting for a closer match.",
    },
  ],

  tips: [
    "For the best formatting, use a text-based PDF exported from Word, Google Docs or InDesign rather than a scan or screenshot.",
    "If a PDF is a scan, OCR it first so the converter has real text to work with instead of a flat image.",
    "Converting a form? Expect labels and values as editable text, interactive form fields don't survive as fillable fields in Word.",
    "Getting an empty document? The PDF is almost certainly a scan with no text layer: run OCR PDF over it first, then convert.",
  ],

  security:
    "Your PDF is read and converted entirely inside your browser tab and is never uploaded. There is no server copy to store, index or log, and nothing to delete afterwards. You can confirm it by disconnecting from the network and converting anyway. That makes it safe for contracts, invoices, statements and anything under NDA. The trade-off is stated plainly on this page: it recovers text rather than page layout.",

  faq: [
    {
      question: "Is the Word file actually editable, or just a picture of the PDF?",
      answer:
        "Genuinely editable. Every paragraph arrives as real Word text you can retype, restyle and reflow. Nothing is flattened into an image, so you never re-type a document from scratch. What isn't rebuilt is the page layout: tables arrive as text rather than as Word tables, and multi-column pages are linearised into one reading order.",
    },
    {
      question: "Why is my table not a table in Word?",
      answer:
        "Because the conversion recovers text, not page structure. A PDF stores a table as lines and separately-positioned text runs rather than as rows and cells, and rebuilding that into a real Word table reliably needs a full office layout engine, which can't run in a browser tab. The cell contents come across as text in reading order, so nothing is lost, but you'll need to re-form the grid in Word if you want it back as a table.",
    },
    {
      question: "Are my files uploaded, and are they kept?",
      answer:
        "Not uploaded, and there's nothing to keep. The PDF is read and the Word file assembled on your own device, so no copy is ever created anywhere else. No account, no storage, no logging of your content, because the content never arrives. Disconnect from the network and it still converts.",
    },
    {
      question: "Can it convert a scanned PDF to editable Word?",
      answer:
        "Not on its own. A scan is just an image with no selectable text, so it can come out blank or garbled. Run it through our OCR PDF tool first to add a text layer, then convert that searchable PDF to Word.",
    },
    {
      question: "Which Word format do I get, and what can open it?",
      answer:
        "You get a modern .docx file, which opens in Microsoft Word, Google Docs, LibreOffice Writer, Pages and most other word processors. There's no watermark and no page limit.",
    },
    {
      question: "Why did my columns or fonts move around?",
      answer:
        "Very complex layouts, custom fonts and multi-column designs can reflow when a fixed-page PDF becomes an editable, reflowable document. Minor cleanup in Word after opening usually gets you the rest of the way.",
    },
  ],

  relatedTools: ["word-to-pdf", "pdf-to-jpg", "ocr-pdf", "compress-pdf"],
};

export default pdfToWord;
