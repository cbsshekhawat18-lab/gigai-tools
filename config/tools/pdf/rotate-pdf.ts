import type { Tool } from "@/types";

/**
 * Rotate PDF, a single-document, page-aware PDF tool. It mirrors the Merge PDF
 * reference shape (accent, full micro-site content, useCases / troubleshooting /
 * tips / security) but every field is unique to rotation: pages are turned in
 * the browser with pdf-lib by writing a new /Rotate value per page, so the
 * orientation is baked into the file itself, not a display-only CSS trick, and
 * nothing is ever uploaded.
 */
const rotatePdf: Tool = {
  slug: "rotate-pdf",
  title: "Rotate PDF",
  description:
    "Turn PDF pages the right way up, rotate every page or just the sideways ones by 90°, 180° or 270°, then download. Free and 100% in your browser.",
  category: "pdf-tools",
  group: "Edit PDF",
  icon: "RotateCw",
  accent: "orange",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Rotate PDF Pages Online, Free & Private",
  tagline:
    "Fix a sideways scan or an upside-down page for good. Rotate the whole document at once, or spin individual pages 90°, 180° or 270°, previewed live, saved into the file, with no uploads and no watermark.",
  longDescription:
    "The GigAI PDF Rotator permanently changes the orientation of your pages without ever sending the file to a server. Upload one PDF, see every page as a thumbnail, and turn them however you need: click a page to rotate it on its own, or use the rotate-all control to spin the entire document 90°, 180° or 270°. The new orientation is written into each page's rotation value with pdf-lib, so it sticks when you open the file anywhere, email, print, mobile, another PDF reader. It never re-renders your content, so text stays selectable and scans keep their resolution. Because everything happens locally, even a heavy scanned document rotates in a moment and stays completely private.",

  ctaText: "Rotate PDF",

  keywords: [
    "rotate pdf",
    "rotate pdf pages",
    "rotate pdf online",
    "turn pdf sideways",
    "fix upside down pdf",
    "rotate and save pdf",
    "rotate pdf 90 degrees",
    "rotate single pdf page",
    "pdf orientation",
  ],

  seo: {
    title: "Rotate PDF, Turn & Save PDF Pages Online Free | GigAI Tools",
    description:
      "Rotate PDF pages 90°, 180° or 270° and save the new orientation into the file. Fix sideways scans, rotate all pages or just one, free, private, no uploads or watermark.",
  },

  features: [
    {
      icon: "RefreshCw",
      title: "Rotate all or one",
      description:
        "Spin the whole document in a single click, or rotate individual pages on their own. Mix and match until every page faces the right way.",
    },
    {
      icon: "RotateCw",
      title: "90°, 180° and 270°",
      description:
        "Choose any quarter-turn. A sideways scan needs 90° or 270°. An upside-down page just needs 180°. Pick the exact rotation from the controls.",
    },
    {
      icon: "Eye",
      title: "Live thumbnail preview",
      description:
        "Every page renders as a thumbnail that turns with your choices, so you confirm the result on screen before you download a single byte.",
    },
    {
      icon: "Save",
      title: "Saved into the file",
      description:
        "The rotation is written into each page with pdf-lib, not faked with CSS. Open the PDF anywhere and it stays turned the way you left it.",
    },
    {
      icon: "ShieldCheck",
      title: "Runs in your browser",
      description:
        "Your PDF is read and rotated locally. It's never uploaded, stored or seen by anyone, the file only ever exists on your device.",
    },
  ],

  benefits: [
    {
      title: "It actually sticks",
      description:
        "This isn't a preview hack. The orientation is baked into the PDF's page data, so it opens correctly in every reader, on print, and on mobile.",
    },
    {
      title: "Page-level precision",
      description:
        "One page scanned the wrong way in a fifty-page report? Rotate just that page and leave the rest untouched. No need to re-scan anything.",
    },
    {
      title: "Quality untouched",
      description:
        "Rotating changes an orientation flag, not the pixels. Text stays selectable, images keep their resolution, and the file size barely moves.",
    },
    {
      title: "Free, private, no sign-up",
      description:
        "No account, no watermark, no daily cap. Because the work runs on your device, we don't need a server, so it's genuinely free to use.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag a single PDF onto the drop zone or click to browse. Every page appears as a thumbnail you can rotate individually.",
    },
    {
      title: "Choose a rotation",
      description:
        "Use the rotate-all buttons for the whole document (90°, 180° or 270°), or click a page's rotate control to turn just that page.",
    },
    {
      title: "Check the preview",
      description:
        "The thumbnails turn live as you go. Keep clicking until every page is upright, then confirm the layout looks right.",
    },
    {
      title: "Rotate & download",
      description:
        "Hit Rotate PDF to write the new orientation into the file, then download your corrected document, instantly and privately.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Straighten a scanned contract",
      description:
        "A signed contract came back scanned landscape. Rotate every page to portrait so it reads and prints correctly before you file or forward it.",
    },
    {
      audience: "Student",
      title: "Fix a photographed lecture handout",
      description:
        "Pages you snapped with your phone landed sideways. Turn them upright so your notes are readable and print cleanly for revision.",
    },
    {
      audience: "Business",
      title: "Correct a mixed-orientation report",
      description:
        "A merged report has a few wide tables saved 90° off. Rotate only those pages so the whole document flows in one consistent direction.",
    },
  ],

  troubleshooting: [
    {
      problem: "The rotation didn't save: the page looks straight here but sideways elsewhere.",
      solution:
        "Make sure you clicked Rotate PDF and downloaded the new file, not the original. This tool writes the orientation into the page itself, so the downloaded copy will stay turned in any reader.",
    },
    {
      problem: "Only some pages are the wrong way and rotate-all would break the others.",
      solution:
        "Skip the rotate-all control and use each page's own rotate button. Turn only the pages that need it, the rest keep their current orientation.",
    },
    {
      problem: "My PDF won't open or the pages won't load.",
      solution:
        "The file may be password-protected or damaged. Remove the password with our Unlock PDF tool first, or re-save it from its source, then upload it again.",
    },
  ],

  tips: [
    "A sideways page needs 90° or 270°, not 180°, if one turn overshoots, click again to land on the correct quarter-turn.",
    "For a document scanned entirely upside-down, use rotate-all at 180° once instead of turning every page by hand.",
    "Rotate before you merge: fix each source PDF's orientation here, then combine them so the final document reads consistently.",
    "The preview thumbnails match the saved result exactly, so trust what you see on screen before downloading.",
  ],

  security:
    "Your PDF is rotated entirely in your browser with pdf-lib and never uploaded to any server. Nothing is stored, logged or shared, close the tab and every trace of the file is gone.",

  faq: [
    {
      question: "Does the rotation get saved into the PDF?",
      answer:
        "Yes. The tool writes a new rotation value into each page with pdf-lib, so the orientation is part of the file itself. Once you download it, the page stays turned in every PDF reader, on print and on mobile. It isn't a temporary on-screen preview.",
    },
    {
      question: "Can I rotate just one page instead of the whole document?",
      answer:
        "Absolutely. Each page thumbnail has its own rotate control, so you can turn a single sideways page and leave every other page exactly as it is. Use the rotate-all buttons only when the whole document needs the same turn.",
    },
    {
      question: "How much can I rotate a page?",
      answer:
        "In quarter-turns: 90°, 180° or 270° clockwise. Repeated clicks cycle through these, so a sideways scan usually needs one 90° or 270° turn, and an upside-down page needs 180°.",
    },
    {
      question: "Will rotating reduce the quality or change the text?",
      answer:
        "No. Rotation only flips an orientation flag on the page. It never re-renders the content. Text stays selectable and searchable, images keep their original resolution, and the file size is virtually unchanged.",
    },
    {
      question: "Is my file uploaded anywhere?",
      answer:
        "Never. The whole process runs locally in your browser using pdf-lib. Your PDF is read, rotated and downloaded on your own device, so there's nothing for us to upload, store or read.",
    },
    {
      question: "Can I rotate a password-protected PDF?",
      answer:
        "Not directly. An encrypted PDF has to be unlocked first. Use our Unlock PDF tool to remove the password (you'll need to know it), then upload the unlocked file here to rotate it.",
    },
  ],

  relatedTools: ["merge-pdf", "reorder-pdf-pages", "split-pdf", "crop-image"],
};

export default rotatePdf;
