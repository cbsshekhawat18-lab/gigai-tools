import type { Tool } from "@/types";

/**
 * EPUB Viewer, a premium, private in-browser e-reader.
 *
 * Drop an .epub and read it in a paginated, book-like rendition powered by
 * epubjs (via `openEpub`): a real table-of-contents sidebar, next/previous page
 * turns, adjustable font size, and light / sepia / dark reading themes. The
 * whole archive is opened, parsed and rendered in memory; nothing is uploaded.
 *
 * Every string is written for the exact "open / read an epub online" intent and
 * is NOT shared with the epub-to-pdf or epub-to-text sibling copy. It stays
 * honest about what a reflowable web rendition can and can't do (no DRM books,
 * publisher pagination is re-flowed, not reproduced).
 */
const epubViewer: Tool = {
  slug: "epub-viewer",
  title: "EPUB Viewer",
  description:
    "Open and read any.epub book right in your browser, a paginated, book-like reader with a table-of-contents sidebar, adjustable font size and light, sepia or dark themes. Nothing is uploaded. Your book never leaves your device.",
  category: "document-tools",
  group: "Viewers",
  icon: "BookOpen",
  accent: "amber",
  status: "live",
  createdAt: "2026-06-18",

  h1: "EPUB Viewer. Read EPUB Books Online, Privately",
  tagline:
    "Drop an.epub and it opens into a real reader: paginated pages you turn like a book, a clickable table of contents, adjustable font size, and light, sepia or dark themes for comfortable reading. Keyboard arrows flip pages, your place is remembered as you go, and the whole book stays on your device, never uploaded.",
  longDescription:
    "The GigAI EPUB Viewer turns any EPUB file into a comfortable, distraction-free reading experience without installing an app or handing your book to a website. Drop an.epub onto the page (or click to browse) and it opens instantly into a paginated rendition that reflows to fit your screen. You turn pages with the on-screen controls, your keyboard's arrow keys, or a tap on either side. A collapsible table-of-contents panel lists every chapter and section pulled straight from the book's own navigation, so one click jumps you anywhere in the text. Reading long-form? Bump the font size up or down until it's easy on your eyes, and switch between a clean light theme, a warm sepia page for evening reading, or a true dark theme that's kind on OLED screens at night. The book's title, author and cover metadata are shown up top so you always know what you're in, and your reading position is tracked as you move through the spine. Because everything runs on epubjs inside your browser, the entire archive (text, images, styles and fonts) is parsed and rendered in memory on your machine. The file is never uploaded, stored or logged, which makes it safe for review copies, unpublished manuscripts, personal libraries and anything you'd rather not send to a server. Two honest notes: EPUB is a reflowable format, so this is a faithful web rendition of the book's content, not a pixel-for-pixel reproduction of a specific print edition's page breaks: chapters, headings, emphasis, lists and inline images all render, but the exact typeset pagination of a paper book is re-flowed to your screen. And DRM-protected EPUBs (encrypted store purchases from some retailers) can't be opened by any in-browser reader, this one included. Use a DRM-free.epub. When you'd rather have a fixed, shareable file than an on-screen reader, the sibling EPUB to PDF tool linearises the same book into a downloadable PDF, and EPUB to Text extracts the raw prose.",

  ctaText: "Open EPUB",

  keywords: [
    "epub viewer",
    "epub reader",
    "read epub online",
    "open epub file",
    "epub viewer online",
    "epub reader online free",
    "view epub in browser",
    "epubjs reader",
    "read ebook online",
    "epub reader no download",
    "online epub reader dark mode",
    "free epub viewer",
  ],

  seo: {
    title: "EPUB Viewer: Read EPUB Books Online Free (Private) | GigAI Tools",
    description:
      "Free online EPUB viewer and reader. Open any.epub and read it in a paginated, book-like view with a table of contents, adjustable font size and light, sepia or dark themes. 100% in your browser: your book is never uploaded.",
  },

  features: [
    {
      icon: "BookOpen",
      title: "Paginated, book-like reading",
      description:
        "Your EPUB reflows into real turn-the-page columns that fit the screen, flip forward and back with the on-screen controls, your keyboard's arrow keys, or a tap on either side, just like a dedicated e-reader.",
    },
    {
      icon: "ListTree",
      title: "Table-of-contents navigation",
      description:
        "A collapsible sidebar lists every chapter and section straight from the book's own navigation. Click any entry to jump there instantly. The panel tucks away when you want a clean, full-width page.",
    },
    {
      icon: "AArrowUp",
      title: "Adjustable font size",
      description:
        "Scale the type up or down to whatever's comfortable, the page reflows around your choice, so long reading sessions stay easy on the eyes without squinting or zooming the whole browser.",
    },
    {
      icon: "Moon",
      title: "Light, sepia & dark themes",
      description:
        "Read on a crisp light page by day, a warm sepia sheet in the evening, or a true dark theme that's gentle on OLED screens at night: switch instantly without reloading the book.",
    },
    {
      icon: "BookMarked",
      title: "Metadata & reading position",
      description:
        "The book's title, author and details are shown up top so you always know what you're reading, and your place is tracked as you move through the spine while the tab stays open.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, in-browser",
      description:
        "The entire archive is opened and rendered locally with epubjs. Review copies, drafts and personal libraries are never uploaded, stored or logged: close the tab and nothing remains.",
    },
  ],

  benefits: [
    {
      title: "Read an EPUB without installing anything",
      description:
        "No Calibre, no Kindle app, no browser extension. Drop the file and read, perfect for a locked-down work laptop, a borrowed machine, or a quick look at a book someone just sent you.",
    },
    {
      title: "Your book never leaves your device",
      description:
        "Unlike upload-based readers, nothing is sent to a server. Unpublished manuscripts, ARC review copies and private notes stay entirely on your machine, which matters when the content is confidential.",
    },
    {
      title: "Comfortable for long-form reading",
      description:
        "Adjustable type size and warm sepia or true-dark themes make a full chapter pleasant to read on screen, not just skimmable. This is a reader, not a raw file dump.",
    },
    {
      title: "Jump anywhere in one click",
      description:
        "The real table of contents means you never scroll blindly. Land in the exact chapter or section you want, then flip pages naturally from there.",
    },
  ],

  howTo: [
    {
      title: "Open your EPUB",
      description:
        "Drop an .epub file onto the page or click to browse. The book is opened in memory and its title, author and table of contents appear right away.",
    },
    {
      title: "Turn the pages",
      description:
        "Use the on-screen previous / next controls, your keyboard's left and right arrow keys, or tap either side of the page to move through the book.",
    },
    {
      title: "Navigate with the contents",
      description:
        "Open the table-of-contents sidebar and click any chapter or section to jump straight there. Collapse the panel for a clean, full-width reading page.",
    },
    {
      title: "Tune your reading comfort",
      description:
        "Increase or decrease the font size and pick a light, sepia or dark theme until the page is easy on your eyes: changes apply instantly.",
    },
  ],

  formats: {
    input: ["EPUB"],
    output: ["On-screen reading view"],
  },

  useCases: [
    {
      audience: "Reader / Book lover",
      title: "Read a DRM-free ebook anywhere",
      description:
        "Open a public-domain classic, an itch.io or Standard Ebooks download, or a book a friend shared, and read it comfortably without buying into one store's app ecosystem.",
    },
    {
      audience: "Author / Editor",
      title: "Proof a manuscript privately",
      description:
        "Check how an exported.epub actually renders (chapter breaks, headings, images) before publishing, with the confidence that the draft never touches a third-party server.",
    },
    {
      audience: "Reviewer / Blogger",
      title: "Read an ARC review copy",
      description:
        "Open an advance review copy in the browser to read and reference on any machine, keeping the embargoed file on your own device instead of an upload service.",
    },
    {
      audience: "Student / Researcher",
      title: "Read course texts on any device",
      description:
        "Open an assigned .epub on a lab or library computer with nothing to install, bump the font up, and switch to a dark theme for late-night sessions.",
    },
  ],

  troubleshooting: [
    {
      problem: "My EPUB won't open. It says it can't be read.",
      solution:
        "The most common cause is DRM: encrypted purchases from some stores can't be opened by any in-browser reader. Confirm the file is a DRM-free .epub. Also make sure the file is a real EPUB (a ZIP archive) and not a renamed .mobi/.azw or a corrupted download.",
    },
    {
      problem: "The pages don't match my paperback's page numbers.",
      solution:
        "EPUB is a reflowable format, so pagination depends on your screen size and font settings rather than a fixed print edition. That's expected: the content, chapters and order are faithful, but exact page breaks are re-flowed to your device, not reproduced from a specific paper edition.",
    },
    {
      problem: "Some images or fancy layout look plain.",
      solution:
        "Standard inline images, headings, emphasis and lists render. Very complex fixed-layout EPUBs (heavily designed cookbooks, comics, textbooks) rely on precise CSS that a reflowable reader simplifies. For those, the sibling EPUB to PDF export may better preserve a continuous reading flow.",
    },
    {
      problem: "The table of contents is empty or thin.",
      solution:
        "The sidebar is built from the book's own embedded navigation. Some older or hand-made EPUBs ship an incomplete or missing table of contents. You can still read the whole book by turning pages, even when the chapter list is sparse.",
    },
  ],

  tips: [
    "Use your keyboard's left and right arrow keys to turn pages hands-free while you read.",
    "Switch to the sepia theme for evening reading and the dark theme at night. Both are easier on the eyes than stark white.",
    "Bump the font size up a notch or two on a large screen. The page reflows so nothing gets cut off.",
    "Collapse the table-of-contents sidebar for a wider, distraction-free page, and reopen it only when you need to jump.",
    "Only DRM-free.epub files open in any browser reader, if a store book won't load, that's the reason.",
  ],

  security:
    "Your EPUB is opened, parsed and rendered entirely in your browser with epubjs. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely read review copies, unpublished manuscripts and private books. The whole archive, including its text, images and fonts, stays in memory on your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my EPUB uploaded to a server?",
      answer:
        "No. The file is opened and rendered locally in your browser using epubjs, loaded on demand. The book's contents never leave your device, so there is nothing for us to store, log or see. It is safe to read confidential drafts, review copies and personal libraries.",
    },
    {
      question: "Can it open DRM-protected EPUBs?",
      answer:
        "No. DRM-encrypted EPUBs (for example, protected purchases from some retailers) cannot be opened by any in-browser reader, including this one. You need a DRM-free.epub. This isn't a limitation we can work around: the encryption is designed to prevent exactly this.",
    },
    {
      question: "Why don't the page numbers match my paperback?",
      answer:
        "EPUB is reflowable: pages are generated to fit your screen and font size, not fixed like a printed book. The chapters, order and content are faithful, but exact page breaks are re-flowed to your device rather than reproduced from a specific print edition. That's normal for every EPUB reader.",
    },
    {
      question: "Can I change the font size and theme?",
      answer:
        "Yes. Scale the font up or down for comfortable reading, and switch between a light page, a warm sepia sheet or a true dark theme. Changes apply instantly and the page reflows around them without reloading the book.",
    },
    {
      question: "How do I navigate between chapters?",
      answer:
        "Open the table-of-contents sidebar, which is built from the book's own navigation, and click any chapter or section to jump straight there. You can also turn pages continuously with the on-screen controls or your keyboard's arrow keys.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Once the page and its on-demand reader library have loaded, opening and reading a local .epub is entirely on-device and works without a connection. Only images referenced by a remote URL inside the book would need the network to load.",
    },
    {
      question: "Can I download the book as a PDF from here?",
      answer:
        "This tool is a reader, not a converter. If you want a fixed, shareable file, use the sibling EPUB to PDF tool, which linearises the same book into a downloadable PDF, or EPUB to Text to pull out the raw prose.",
    },
    {
      question: "Is my reading position saved?",
      answer:
        "Your place is tracked as you move through the book while the tab stays open, so page turns and chapter jumps stay in sync. Because nothing is stored on a server (or persisted), reopening the file starts you fresh at the beginning.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, in-browser EPUB reader with paginated page turns, a table-of-contents sidebar, adjustable font size, light/sepia/dark themes and book metadata, powered entirely by epubjs on-device.",
    },
    {
      date: "2026-06-24",
      change:
        "Added keyboard arrow-key page navigation, a true dark reading theme tuned for OLED screens, and a clearer honesty note about DRM and reflowable pagination.",
    },
    {
      date: "2026-06-29",
      change:
        "Improved table-of-contents jump accuracy for nested sections and reduced initial render time for large books.",
    },
  ],

  relatedTools: ["epub-to-pdf", "epub-to-text", "pdf-viewer", "document-comparer"],
};

export default epubViewer;
