import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "pdf-vs-docx",
  a: "PDF",
  b: "DOCX",
  title: "PDF vs DOCX: Which Document Format Should You Send?",
  description:
    "PDF is a fixed, look-identical-everywhere format for final documents. DOCX is Word's editable working format. Here's exactly when to use each, and how to convert between them.",
  accent: "sky",
  icon: "FileText",
  seo: {
    title: "PDF vs DOCX: When to Use Each Document Format (2026)",
    description:
      "PDF vs DOCX explained: fixed layout vs editable, which preserves formatting, which to send a client, file compatibility, and free converters to switch either way.",
    keywords: [
      "pdf vs docx",
      "pdf vs word",
      "docx vs pdf",
      "should i send a pdf or word doc",
      "difference between pdf and docx",
      "pdf or word for resume",
    ],
    canonical: "/compare/pdf-vs-docx",
  },
  intro: [
    "PDF and DOCX both hold documents, but they're designed for opposite ends of a document's life. DOCX is Microsoft Word's format: an editable working file where text reflows, styles can change, and layout can shift depending on the fonts, Word version and printer settings on the machine that opens it. PDF is a finished-document format: it captures the exact page layout (fonts, spacing, images, everything) and freezes it so the document looks byte-for-byte identical on every device, forever.",
    "That single difference drives almost every decision. If you need someone to edit, comment on or continue writing the document, DOCX is the right format because it's meant to be changed. If you need someone to read, print, sign or file a document exactly as you laid it out (a resume, invoice, contract, report or anything going to a client) PDF is the right format because it guarantees the layout won't rearrange itself on their screen.",
    "Below is a clear breakdown of how the two differ, when each is the correct choice, and the honest verdict, plus the free converters to move a document either direction in your browser.",
  ],
  dimensions: [
    {
      label: "Primary purpose",
      a: "Final, fixed-layout document for reading, printing and sharing.",
      b: "Editable working document for writing and collaboration.",
    },
    {
      label: "Layout consistency",
      a: "Identical on every device: pixel-for-pixel the same.",
      b: "Can reflow or shift based on fonts, Word version and settings.",
    },
    {
      label: "Editing",
      a: "Not meant for editing. Changes need a PDF editor and are limited.",
      b: "Fully editable in Word, Google Docs and many other apps.",
    },
    {
      label: "Fonts & formatting",
      a: "Fonts embedded, always render exactly as designed.",
      b: "Depends on the reader having the same fonts installed.",
    },
    {
      label: "Compatibility",
      a: "Opens on virtually any device with a free reader or browser.",
      b: "Best in Word. Formatting can degrade in other editors.",
    },
    {
      label: "Signing & filing",
      a: "The standard for signatures, contracts and official submissions.",
      b: "Rarely accepted as a final, signed or archival document.",
    },
    {
      label: "File size",
      a: "Often larger due to embedded fonts and rendered graphics.",
      b: "Usually smaller for text-heavy documents.",
    },
  ],
  whenA: [
    "You're sending a finished document (resume, invoice, contract, report) for reading or printing.",
    "The layout must look identical to everyone, regardless of their device or software.",
    "The document will be signed, filed, submitted officially, or archived long-term.",
    "You want to prevent easy editing and keep the content as you finalised it.",
  ],
  whenB: [
    "The recipient needs to edit, comment on, or continue writing the document.",
    "You're collaborating on a draft that will go through revisions.",
    "You want a small, text-first working file that's easy to restyle.",
    "The document is a template others will fill in or adapt.",
  ],
  verdict:
    "Send DOCX when the document is meant to be edited or collaborated on, and send PDF when it's finished and must look identical, be printed, signed or filed. A resume, invoice or contract should almost always go out as a PDF so its layout is guaranteed. A shared draft or template should stay DOCX so people can actually work on it. When you receive the wrong one, converting between them takes seconds.",
  relatedToolSlugs: ["pdf-to-word", "word-to-pdf", "pdf-editor", "compress-pdf"],
  faq: [
    {
      question: "Should I send my resume as a PDF or DOCX?",
      answer:
        "Send a PDF. It guarantees your carefully-arranged layout, fonts and spacing look identical to every recruiter and applicant-tracking system, with no risk of text reflowing on their machine. Only send DOCX if a job posting or recruiter specifically asks for an editable Word file.",
    },
    {
      question: "Why does my Word document look different on another computer?",
      answer:
        "Because DOCX layout depends on the reader's environment. The fonts they have installed, their Word version, and even printer settings can shift spacing and pagination. PDF avoids this entirely by embedding fonts and freezing the layout, which is why final documents should be PDFs.",
    },
    {
      question: "Can I edit a PDF like a DOCX?",
      answer:
        "Not as freely. PDFs can be edited with dedicated PDF tools, but they're designed as final documents, so editing is more limited and fiddly than in Word. If you need to make substantial changes, the cleaner route is to convert the PDF to DOCX, edit it in Word, then export back to PDF.",
    },
    {
      question: "Does converting DOCX to PDF change the content?",
      answer:
        "It shouldn't change the content, the text and images stay the same, but it locks the layout exactly as Word renders it at conversion time and embeds the fonts. That's the point: the PDF becomes a faithful, unchangeable snapshot of how the document looked when you exported it.",
    },
    {
      question: "Which format is better for long-term archiving?",
      answer:
        "PDF, generally. It embeds everything needed to render the document and looks the same decades later regardless of software changes. DOCX depends on Word remaining compatible and the right fonts being available, which makes it a better format for active editing than for archiving.",
    },
  ],
  relatedComparisonSlugs: ["csv-vs-json", "json-vs-xml"],
};

export default comparison;
