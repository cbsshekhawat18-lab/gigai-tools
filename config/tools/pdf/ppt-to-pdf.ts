import type { Tool } from "@/types";

/**
 * PowerPoint to PDF, a genuinely-honest, in-browser best-effort converter.
 *
 * There is no LibreOffice/Office headless renderer running behind this URL, and
 * PowerPoint's true rendering (fonts, animations, exact geometry, SmartArt,
 * charts, embedded video) cannot be reproduced faithfully by a browser. So this
 * tool does the honest thing: it opens the .pptx (which is a ZIP of XML) with
 * fflate, reads each slide's XML, pulls out the text runs *and* the embedded
 * slide images, and lays them out one slide per page onto a real PDF via jsPDF.
 *
 * Every string below states that boundary plainly; it is a readable, printable,
 * shareable text-and-image capture of a deck, not a pixel-perfect export, and
 * points people to the one path that IS pixel-perfect (File → Export as PDF in
 * PowerPoint, or File → Download → PDF in Google Slides). No claim outruns what
 * the client-side extractor actually produces.
 */
const pptToPdf: Tool = {
  slug: "ppt-to-pdf",
  title: "PPT to PDF",
  description:
    "Turn a PowerPoint.pptx into a readable, printable PDF right in your browser, one slide per page, with each slide's text and embedded images extracted and laid out. Honest best-effort (not a pixel-perfect render). Nothing is uploaded.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "Presentation",
  accent: "orange",
  status: "live",
  featured: false,
  createdAt: "2026-06-24",

  h1: "PPT to PDF, Convert PowerPoint to PDF Online (In Your Browser)",
  tagline:
    "Drop a.pptx and get a clean, one-slide-per-page PDF you can read, print and share, the tool opens the PowerPoint file on your device, extracts each slide's text and embedded images, and lays them out onto real PDF pages. 100% in your browser, nothing uploaded. Need a pixel-perfect export with fonts and animations intact? We tell you exactly how to get that, honestly.",
  longDescription:
    "The GigAI PPT to PDF converter turns a PowerPoint deck into a shareable PDF without an account, an install, or an upload, and it is honest about what that means. A.pptx file is really a ZIP archive of XML and media, so the tool opens it in your browser with fflate, walks every slide in order, pulls out the text runs (titles, bullets, body copy, speaker-facing text) and the images embedded on each slide, and paints them one slide per page onto a genuine PDF using jsPDF. The result is a readable, printable, searchable-where-text-exists document that captures what a slide says and shows: perfect for emailing a deck to someone who doesn't have PowerPoint, printing handouts, attaching slides to a ticket, archiving a talk, or reading a presentation on a device that can only open PDFs. What it is NOT, and we won't pretend otherwise, is a pixel-perfect render of PowerPoint's own layout engine. Faithful PowerPoint-to-PDF conversion (exact fonts, precise positioning, gradients, shadows, SmartArt, charts, transitions, animations, embedded audio/video, theme master graphics) requires a real Office renderer such as LibreOffice or Microsoft's, which is a server-side dependency this 100%-in-browser tool deliberately does not run. So think of this as a fast, private capture of a deck's content and imagery, not a design-accurate replica. When you need the exact-looking PDF, the reliable, free path is built into the app you already have: in PowerPoint choose File → Export → Create PDF/XPS (or Save As → PDF), and in Google Slides choose File → Download → PDF Document, both render every slide exactly. Everything here runs on your machine: the.pptx is unzipped, parsed and rendered locally, so confidential board decks, unreleased pitch decks and internal all-hands slides never leave your device and nothing is stored or logged. Drop or browse to a file, preview the extracted PDF, download it, and reset to convert another, all client-side, all private.",

  ctaText: "Convert to PDF",

  keywords: [
    "ppt to pdf",
    "pptx to pdf",
    "powerpoint to pdf",
    "convert powerpoint to pdf",
    "ppt to pdf converter",
    "presentation to pdf",
    "pptx to pdf online",
    "powerpoint to pdf free",
    "slides to pdf",
    "convert pptx to pdf browser",
    "ppt to pdf no upload",
    "export powerpoint as pdf",
  ],

  seo: {
    title: "PPT to PDF: Convert PowerPoint (.pptx) to PDF Online Free | GigAI Tools",
    description:
      "Free in-browser PPT to PDF converter. Extracts each PowerPoint slide's text and embedded images into a clean, one-slide-per-page PDF: honest best-effort, not a pixel-perfect render. Nothing is uploaded. Includes the exact steps for a design-perfect export.",
  },

  features: [
    {
      icon: "Presentation",
      title: "One slide per page",
      description:
        "Each slide in the.pptx becomes its own PDF page, in order, with a slide-number heading, so the deck reads as a clean, sequential document you can page through, print or attach.",
    },
    {
      icon: "Type",
      title: "Text extracted from every slide",
      description:
        "Titles, bullets and body copy are pulled straight from each slide's XML and drawn as real text, so the content is readable and, where text exists, searchable in the finished PDF.",
    },
    {
      icon: "Image",
      title: "Embedded images included",
      description:
        "Pictures placed on your slides are read out of the PowerPoint package and rendered onto the matching PDF page, so the visual content of the deck comes along with the words.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "The .pptx is unzipped, parsed and rendered entirely on your device with fflate and jsPDF. Nothing is uploaded, stored or logged, so confidential and unreleased decks stay private.",
    },
    {
      icon: "MessageSquareWarning",
      title: "Honest about fidelity",
      description:
        "This is a content-and-image capture, not a pixel-perfect Office render. We say so plainly and give you the exact, free steps to get a design-accurate PDF when you need one.",
    },
    {
      icon: "Zap",
      title: "Fast, no install, no account",
      description:
        "Drop a file and download a PDF in seconds. No LibreOffice, no cloud service, no sign-up. Everything you need is already in the browser tab you have open.",
    },
  ],

  benefits: [
    {
      title: "Share a deck with people who don't have PowerPoint",
      description:
        "Hand a reviewer, client or stakeholder a universal PDF of the slides' content and images instead of a .pptx they may not be able to open or may reflow differently on their machine.",
    },
    {
      title: "Keep confidential decks on your device",
      description:
        "Board decks, pitch decks and internal all-hands slides are unzipped and converted locally, there's no server round-trip, so sensitive presentations never leave your machine.",
    },
    {
      title: "No toolchain, no upload, no wait",
      description:
        "Skip installing LibreOffice or trusting a cloud converter with your file. The conversion runs in the tab you already have open, and honestly tells you where its limits are.",
    },
    {
      title: "You always know the right path to perfect output",
      description:
        "When you truly need a design-accurate export, the tool points you to the free, reliable route built into PowerPoint and Google Slides, so you're never stuck guessing.",
    },
  ],

  howTo: [
    {
      title: "Add your PowerPoint file",
      description:
        "Drop a .pptx onto the drop zone, paste it from your clipboard, or click to browse. The file is opened and unzipped entirely in your browser.",
    },
    {
      title: "Let it extract the slides",
      description:
        "The tool reads each slide's XML and embedded images in order and lays them out one slide per page onto a real PDF: you'll see progress as it works.",
    },
    {
      title: "Preview the result",
      description:
        "Check the generated PDF in the built-in preview to confirm the text and images from your deck came through the way you expect.",
    },
    {
      title: "Download the PDF",
      description:
        "Save the one-slide-per-page PDF to email, print or archive. Reset in one click to convert another deck.",
    },
    {
      title: "Need pixel-perfect? Export from the app",
      description:
        "For a design-accurate PDF with exact fonts and layout, use File → Export → PDF in PowerPoint or File → Download → PDF in Google Slides, the tool reminds you of these steps.",
    },
  ],

  formats: {
    input: ["PPTX"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Presenter / Speaker",
      title: "Send slides as a readable handout",
      description:
        "Turn your talk into a one-slide-per-page PDF so attendees who don't run PowerPoint can still read the content and see the images, on any device.",
    },
    {
      audience: "Student / Educator",
      title: "Print lecture decks to revise from",
      description:
        "Convert a lecture .pptx into a PDF you can print or annotate, capturing the text and figures of each slide without needing the Office app to open it.",
    },
    {
      audience: "Business / Consulting",
      title: "Archive and circulate decks privately",
      description:
        "Keep a PDF snapshot of a board or client deck for the record and email it to people outside your Office ecosystem, all without the confidential file leaving your machine.",
    },
    {
      audience: "Reviewer / Approver",
      title: "Attach slides to a ticket or review",
      description:
        "Drop the deck in and get a PDF you can attach to a Jira ticket, a design review or an approval thread, so reviewers see the slides' content without a PowerPoint license.",
    },
  ],

  troubleshooting: [
    {
      problem: "The PDF doesn't look exactly like my PowerPoint (fonts, layout, colors differ).",
      solution:
        "That's expected and we're upfront about it: this tool extracts each slide's text and images and lays them out, rather than reproducing PowerPoint's rendering engine. Exact fonts, positioning, gradients, SmartArt, charts and animations need a real Office renderer. For a design-accurate PDF, open the deck in PowerPoint and choose File → Export → Create PDF/XPS, or in Google Slides choose File → Download → PDF Document.",
    },
    {
      problem: "My .ppt (old binary format) won't convert.",
      solution:
        "The tool reads the modern Office Open XML .pptx format, which is a ZIP of XML it can parse in the browser. The legacy binary .ppt format isn't supported. Open it in PowerPoint or Google Slides and save/export it as .pptx (or straight to PDF), then use that.",
    },
    {
      problem: "A chart, SmartArt graphic or embedded video didn't appear.",
      solution:
        "Charts, SmartArt and embedded media are drawn by PowerPoint's own engine and aren't raster images inside the file, so a browser can't reproduce them faithfully. Their text may still be captured, but the visual won't. Export directly from PowerPoint or Google Slides when those elements must appear exactly.",
    },
    {
      problem: "Some text is missing or in an unexpected order.",
      solution:
        "Text is pulled from each slide's XML in reading order, which can differ from the on-screen visual arrangement of overlapping text boxes, tables or grouped shapes. The words are captured, but complex layouts may reflow. For a layout-faithful result, use the app's own File → Export → PDF path.",
    },
  ],

  tips: [
    "For a truly pixel-perfect PDF, use File → Export → Create PDF/XPS in PowerPoint or File → Download → PDF Document in Google Slides. This tool is a fast, private content capture, not a replacement for those.",
    "Save legacy .ppt files as .pptx first (in PowerPoint or Google Slides). This converter reads the modern .pptx package, not the old binary format.",
    "Decks that are mostly text and simple images convert most cleanly. Slides heavy in charts, SmartArt or animations are where the app's own export wins.",
    "Nothing uploads, so it's safe to convert a confidential board or pitch deck here. The file is unzipped and rendered entirely on your device.",
    "Preview the generated PDF before downloading to confirm the slides' text and images came through as you expect.",
  ],

  security:
    "Your PowerPoint file is opened, unzipped, parsed and rendered to PDF entirely in your browser. It is never uploaded to any server. The.pptx is read with fflate and the PDF is built with jsPDF, all on your device. Nothing is stored, logged or transmitted. That means confidential board decks, unreleased pitch decks and internal presentations are safe to convert here. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PowerPoint file uploaded to a server?",
      answer:
        "No. The.pptx is opened, unzipped and converted locally in your browser, fflate reads the ZIP package and jsPDF builds the PDF, all on your device. Your file never leaves your machine, so there's nothing for us to store, log or see, and it's safe to convert confidential decks.",
    },
    {
      question: "Will the PDF look exactly like my slides?",
      answer:
        "Honestly, no, and we won't pretend it does. This tool extracts each slide's text and embedded images and lays them out one slide per page. It does not reproduce PowerPoint's own rendering engine, so exact fonts, positioning, gradients, SmartArt, charts and animations won't be pixel-perfect. For a design-accurate PDF, export directly from PowerPoint (File → Export → Create PDF/XPS) or Google Slides (File → Download → PDF Document).",
    },
    {
      question: "Why can't a browser render PowerPoint perfectly?",
      answer:
        "A faithful PowerPoint-to-PDF conversion needs a real Office layout engine (such as LibreOffice or Microsoft's) running on a server, because it must reflow fonts, resolve theme masters, and draw charts, SmartArt and effects exactly. This tool is 100% in-browser and deliberately runs no server, so instead of faking that fidelity it gives you an honest text-and-image capture and points you to the exact-render path.",
    },
    {
      question: "What actually gets included in the PDF?",
      answer:
        "The text from each slide (titles, bullets and body copy) drawn as real text, plus the images embedded on each slide, laid out one slide per page in order with a slide-number heading. Charts, SmartArt, embedded video/audio and animations are not reproduced, though the text within some of them may still be captured.",
    },
    {
      question: "Can I convert an old .ppt file?",
      answer:
        "Not directly. This converter reads the modern .pptx (Office Open XML) format, which is a ZIP of XML the browser can parse. For a legacy binary .ppt, open it in PowerPoint or Google Slides and save it as .pptx (or export straight to PDF), then use that.",
    },
    {
      question: "Is the text in the PDF selectable and searchable?",
      answer:
        "The text this tool extracts from your slides is drawn as real text, so it is selectable and searchable in the PDF. Text that lives inside images, charts or SmartArt is part of the picture, not extractable text, so it won't be searchable.",
    },
    {
      question: "Does it work offline and with private decks?",
      answer:
        "Once the page and its on-demand libraries have loaded, the conversion is entirely local, so private and confidential decks stay on your machine with no connection required. Nothing about the file is transmitted.",
    },
    {
      question: "What's the best free way to get a perfect PDF instead?",
      answer:
        "Use the export built into the app you already have. In PowerPoint: File → Export → Create PDF/XPS (or Save As → PDF). In Google Slides: File → Download → PDF Document. Both render every slide exactly, for free, and are the right tool when you need design-accurate output.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release. Open a.pptx in the browser with fflate, extract each slide's text and embedded images, and lay them out one slide per page onto a real PDF with jsPDF. Drag-drop/paste input, live preview, download and reset, with a clearly-stated fidelity limitation and the exact steps for a pixel-perfect export.",
    },
    {
      date: "2026-06-28",
      change:
        "Improved slide-image extraction and placement, added a slide-number heading per page, and made the honesty note and app-export guidance more prominent on the result screen.",
    },
    {
      date: "2026-07-01",
      change:
        "Better handling of text-only and image-heavy slides, clearer messaging for unsupported legacy .ppt files, and refined page sizing so wide slide images fit the printable area.",
    },
  ],

  relatedTools: [
    "word-to-pdf",
    "excel-to-pdf",
    "markdown-to-pdf",
    "merge-pdf",
  ],
};

export default pptToPdf;
