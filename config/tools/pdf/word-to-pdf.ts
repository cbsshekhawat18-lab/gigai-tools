import type { Tool } from "@/types";

/**
 * Word to PDF, an IN-BROWSER converter (.docx → HTML → text PDF).
 *
 * The module still tries `convertOnServer(file, "word-to-pdf")` first, so a
 * LibreOffice endpoint would light up automatically if one were deployed again.
 * It is NOT deployed today, /api/convert/word-to-pdf returns 404, so in
 * practice every conversion runs in the browser, and this copy describes that
 * path because it is the one users actually get.
 *
 * The page previously promised LibreOffice fidelity and carried
 * `serverSide: true`, which put a red "we upload your file" badge on a tool
 * that uploads nothing: it overstated the output AND understated the privacy.
 * Both are fixed here.
 *
 * As of 2026-09-19 the renderer draws REAL TEXT (lib/document-tools/pdf-layout.ts)
 * rather than screenshotting the page, so the output is selectable, searchable
 * and sharp, and pages break between lines. The copy below says so. The one
 * exception is a document written in a script the standard PDF fonts cannot
 * encode (Devanagari, CJK, Arabic, Cyrillic, Greek): those still take the
 * raster path, which the tool states in its result card. Keep the two cases
 * distinct in any future copy edit, and do not re-add a blanket "text is not
 * selectable" claim.
 */
const wordToPdf: Tool = {
  slug: "word-to-pdf",
  title: "Word to PDF",
  description:
    "Convert a Word document (.docx or.doc) into a clean, shareable PDF that looks the same on every device, converted in your browser, so the file is never uploaded.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "FileText",
  accent: "indigo",
  status: "live",
  serverSide: false,
  featured: true,
  createdAt: "2026-07-02",

  h1: "Convert Word to PDF Online, Free & Layout-Perfect",
  tagline:
    "Turn a.docx or.doc into a clean, universally-readable PDF without uploading it anywhere. Headings, lists, tables and images carry across: download in seconds, no sign-up, no watermark.",
  longDescription:
    "The GigAI Word to PDF converter turns your.docx or.doc into a shareable PDF entirely inside your browser tab: the document is read, laid out and written to PDF on your own machine, and no copy of it is ever uploaded, stored or logged. That matters more than it sounds: contracts, invoices, medical letters, signed agreements and coursework are exactly the documents people convert most, and exactly the ones that should not be sitting in someone else's temporary folder. Your headings keep their hierarchy, bold and italic runs survive, bullet and numbered lists stay structured, tables stay tabular and embedded images come across. Text in the finished PDF stays real text, so you can select it, search it and copy from it, and it stays sharp at any zoom. Two limits are worth knowing before you commit, because you will notice them and it is better to hear it here: page size and margins are rebuilt rather than read from Word, so a page can break in a different place than it does on your screen, and intricate multi-column layouts, floating text boxes and unusual fonts are approximated rather than reproduced pixel-for-pixel. Documents written in Devanagari, Chinese, Japanese, Korean, Arabic, Cyrillic or Greek are drawn as an image instead, because the standard PDF fonts cannot encode those scripts: the page looks right, but its text is not selectable, and the tool tells you when that happens. For a letter, CV, report, memo or invoice that is a fair trade for never uploading the file. For a print-shop master where every kerning pair matters, use Word's own File → Save As → PDF, which has the full layout engine already on your desktop. It is free, unlimited, needs no account and stamps no watermark.",

  ctaText: "Convert to PDF",

  keywords: [
    "word to pdf",
    "convert word to pdf",
    "doc to pdf",
    "word to pdf converter",
    "docx to pdf online",
    "word document to pdf free",
    "export word as pdf",
    "microsoft word to pdf",
  ],

  seo: {
    title: "Word to PDF: Convert DOCX to PDF Online Free | GigAI Tools",
    description:
      "Convert Word (.docx /.doc) to PDF free, entirely in your browser. Your document is never uploaded. Headings, lists, tables and images preserved. No watermark, no sign-up.",
  },

  features: [
    {
      icon: "CloudOff",
      title: "Your document is never uploaded",
      description:
        "The .docx is read and converted inside your browser tab, so a contract, invoice or signed letter never touches a server. Switch your Wi-Fi off and it still works.",
    },
    {
      icon: "Type",
      title: "Fonts and styling preserved",
      description:
        "Headings, bold and italic runs, colors and standard fonts carry through to the PDF, so the exported file reads like the original document.",
    },
    {
      icon: "TriangleAlert",
      title: "Honest about what it can't do",
      description:
        "Page size and margins are rebuilt rather than read from Word, so a page may break in a different place, and complex columns and unusual fonts are approximated. Said here rather than discovered after you've sent the file on.",
    },
    {
      icon: "WifiOff",
      title: "In-browser fallback",
      description:
        "If the conversion service is offline, the tool builds a readable PDF locally from your document's text and formatting, clearly labelled so you know which path ran.",
    },
    {
      icon: "FileCheck2",
      title: "One clean, flattened PDF",
      description:
        "You get a single PDF with no watermark and no page limit, ready to email, print, sign or archive on any device that can open a PDF.",
    },
  ],

  benefits: [
    {
      title: "Looks the same everywhere",
      description:
        "A PDF freezes your layout. Recipients see the exact fonts, spacing and page breaks you intended, even if they don't own Word or have your fonts installed.",
    },
    {
      title: "Nothing to delete, because nothing was sent",
      description:
        "Other converters promise to erase your upload afterwards. This one has nothing to erase: the document never leaves your device, so there's no retention policy to take on trust and no account attached to it.",
    },
    {
      title: "Free with no watermark",
      description:
        "No subscription, no per-file charge and nothing stamped across your pages. Convert one document or a dozen, back to back, at no cost.",
    },
    {
      title: "Works on any device",
      description:
        "It's a normal web page. No Office install, add-in or app. Convert a.docx from a Chromebook, a phone or a locked-down work laptop and get the same result.",
    },
  ],

  howTo: [
    {
      title: "Add your Word file",
      description:
        "Drag a single .docx or .doc onto the drop zone, or click to browse. One document is converted at a time for a clean, predictable result.",
    },
    {
      title: "Convert",
      description:
        "Press Convert to PDF. The document is converted right here in the tab: nothing is uploaded, and there's no queue to wait in.",
    },
    {
      title: "Check the result",
      description:
        "The result card shows the finished PDF's size, and names the path that produced it so you always know how the file was made.",
    },
    {
      title: "Download",
      description:
        "Download your PDF. Need a change? Edit the Word file, drop it in again and convert, it's instant and unlimited.",
    },
  ],

  formats: {
    input: ["DOCX", "DOC"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Send a contract that won't reflow",
      description:
        "Export a drafted agreement to PDF before emailing it, so clause numbering, signature blocks and page breaks stay fixed no matter what app the other party opens it in.",
    },
    {
      audience: "Student",
      title: "Submit an essay in the required format",
      description:
        "Most portals demand PDF uploads. Convert your finished.docx so margins, citations and the reference list arrive exactly as your tutor expects. No font substitution surprises.",
    },
    {
      audience: "Business",
      title: "Freeze a proposal before it circulates",
      description:
        "Turn a team-edited proposal into a locked PDF for stakeholders, so pricing tables and branding render identically for everyone and can't be casually re-edited.",
    },
  ],

  troubleshooting: [
    {
      problem: "The result says it used the in-browser fallback and looks simpler than my document.",
      solution:
        "That's the normal path, conversion happens in your browser, which is why the file is never uploaded. It also means the layout is rebuilt rather than reproduced by a desktop office engine, so complex columns, floating text boxes and embedded objects can be simplified. If the document's layout has to be exact, use Word's own File → Save As → PDF.",
    },
    {
      problem: "A custom or unusual font looks different in the PDF.",
      solution:
        "The converter can only draw fonts your own browser can resolve, so an unusual typeface is substituted with the closest available match. Sticking to common fonts (Calibri, Arial, Times New Roman, Georgia) gives the most predictable result. If a specific typeface is essential to the document, Word's own File → Save As → PDF embeds it properly.",
    },
    {
      problem: "My file is rejected or won't convert.",
      solution:
        "Make sure it's a real Word document ending in .docx, not a renamed file or a Pages/Google Docs export. Re-save it as .docx from Word, Pages or Google Docs (File → Download → Microsoft Word) and try again. Password-protected documents have to be unlocked first, since the converter can't read an encrypted file.",
    },
  ],

  tips: [
    "Run a final spell-check and layout pass in Word first: a PDF is a snapshot, so anything unfixed is frozen in place.",
    "Turn on 'Embed fonts in the file' in Word's save options if your document relies on a distinctive typeface, so the render matches exactly.",
    "Set your page size (A4 vs Letter) in Word before converting. The PDF inherits whatever the document is set to.",
    "Converting a long report? Convert here first, then run the PDF through Compress PDF if you need to email it under a size cap.",
  ],

  security:
    "Your document is converted entirely inside your browser tab and is never uploaded. There is no server copy to store, index or log, and nothing to delete afterwards, the file simply never leaves your device, which you can confirm by disconnecting from the network and converting anyway. That makes it safe for contracts, invoices, medical letters, signed agreements and anything under NDA. The trade-off is stated plainly on this page: the layout is rebuilt in the browser rather than reproduced by a desktop office engine, so page breaks can fall differently and intricate layouts are approximated.",

  faq: [
    {
      question: "Is my document uploaded anywhere?",
      answer:
        "No. The.docx is read, laid out and written to PDF inside your browser tab, so it never reaches a server, ours or anyone else's. The simplest way to prove it to yourself is to disconnect from the network and convert anyway. It still works. That also means there is no upload queue, no file-size ceiling imposed by a server, and no retention policy you have to take on trust.",
    },
    {
      question: "Is my document kept or seen by anyone?",
      answer:
        "No, and there is nothing to keep. The conversion happens on your own machine, so no copy of the document is ever created anywhere else. There is no account, no storage and no logging of your content, because the content never arrives.",
    },
    {
      question: "Will my fonts and layout be preserved?",
      answer:
        "Mostly, with two honest caveats. Headings, bold, italic and underlined runs, alignment, bullet and numbered lists, tables and images all carry across, standard fonts look right, and the text stays selectable and searchable. But page size and margins are rebuilt rather than read from the document, so a page can break in a different place than it does in Word, and intricate multi-column layouts, floating text boxes and unusual fonts are approximated rather than reproduced exactly. If the layout has to be perfect (a print master, a legal filing with strict formatting) use Word's own File → Save As → PDF, which has the full layout engine on your desktop.",
    },
    {
      question: "Can I convert an old .doc file, not just .docx?",
      answer:
        "Both are accepted, but.docx is the format the in-browser converter reads properly. The legacy.doc format is a completely different binary structure, and results from it are unreliable. If you have an old.doc, open it in Word (or any office suite) and re-save it as.docx first. That one step gives a far cleaner PDF than converting the.doc directly.",
    },
    {
      question: "Is there a watermark or a file-size limit?",
      answer:
        "There's no watermark, ever, and no server limit to bump into, since the work happens on your own machine, the only real ceiling is your device's memory on a very large document. Ordinary letters, essays, contracts and reports convert without issue, and you can do as many as you like, one after another.",
    },
    {
      question: "Is it really free?",
      answer:
        "Yes, completely. No account, no paywall, no per-file charge and no watermark. Word to PDF is free like the rest of the GigAI PDF toolkit, and because the conversion runs on your own device there is no per-conversion cost for anyone to meter.",
    },
  ],

  relatedTools: ["pdf-to-word", "jpg-to-pdf", "merge-pdf", "compress-pdf"],
};

export default wordToPdf;
