import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-add-a-watermark-to-a-pdf",
  title: "How to Add a Watermark to a PDF (Text or Image)",
  description:
    "Stamp DRAFT, CONFIDENTIAL or your logo across every page of a PDF, control the opacity, angle and position. A quick, private, browser-based guide.",
  accent: "indigo",
  icon: "Stamp",
  toolSlug: "document-watermark",
  seo: {
    title: "How to Add a Watermark to a PDF (Free, No Upload)",
    description:
      "Learn how to watermark a PDF with text or a logo. Set the opacity, rotation and position across every page. Free, private, runs in your browser. Step-by-step.",
    keywords: [
      "how to add a watermark to a pdf",
      "watermark pdf",
      "add watermark to pdf",
      "pdf watermark free",
      "confidential watermark pdf",
    ],
    canonical: "/how-to/how-to-add-a-watermark-to-a-pdf",
  },
  intro: [
    "A watermark is a semi-transparent label or logo laid over every page of a document, DRAFT, CONFIDENTIAL, a company name, or a brand mark. It signals status and ownership without obscuring the underlying text, which makes it useful for review copies, proofs, contracts and anything you share but want clearly attributed.",
    "You don't need Acrobat to add one. This guide uses our free document watermark tool, which runs entirely in your browser: your PDF is processed locally, never uploaded, and the result has no third-party branding. You control the text or image, the opacity, the angle and where it sits on the page.",
  ],
  steps: [
    {
      title: "Open the watermark tool",
      body: "Head to the document watermark tool. It loads instantly, works on desktop and mobile, and keeps your file on your own device.",
    },
    {
      title: "Add your PDF",
      body: "Drag your PDF onto the upload area or click to browse for it. The file loads into your browser locally. It is never sent to a server.",
    },
    {
      title: "Choose a text or image watermark",
      body: "Type the text you want stamped (like CONFIDENTIAL or your name), or upload a logo image to use as the mark. Text is best for status labels. An image is best for branding.",
    },
    {
      title: "Set opacity, angle and position",
      body: "Lower the opacity so the watermark sits behind the content without hiding it, rotate it to a diagonal if you want it across the page, and place it centre, tiled or in a corner.",
    },
    {
      title: "Apply it across the pages",
      body: "Choose whether the watermark appears on every page or just a range, then apply it. A live preview shows how it looks over your actual content before you commit.",
    },
    {
      title: "Download the watermarked PDF",
      body: "Download the finished file straight to your device. It keeps its original text and layout, now with the watermark applied and no tool branding added.",
    },
  ],
  tips: [
    "Keep opacity around 20–40%, light enough to read the document through it, strong enough to be unmistakable.",
    "A diagonal angle (roughly 45°) across the centre is the hardest watermark to crop out and reads clearly on every page.",
    "For a logo, use a PNG with a transparent background so only the mark shows, not a white box around it.",
    "A visible watermark deters casual copying but doesn't lock the file, if you need to prevent editing, also password-protect or flatten the PDF.",
  ],
  faq: [
    {
      question: "Can I watermark a PDF with my logo?",
      answer:
        "Yes. Upload a logo image (ideally a PNG with a transparent background) and place it as the watermark. You can set its opacity and position so it brands the document without covering the content.",
    },
    {
      question: "Will the watermark appear on every page?",
      answer:
        "You choose. Apply it to all pages for consistent branding or protection, or limit it to a specific range if only certain pages need marking, such as a cover or an appendix.",
    },
    {
      question: "Can the watermark be removed later?",
      answer:
        "A watermark added this way is merged into the page, so it can't be toggled off with a click. It deters casual reuse, but it isn't encryption, for stronger control, combine it with password protection.",
    },
    {
      question: "Does watermarking change the rest of my PDF?",
      answer:
        "No. The original text, images and layout stay exactly as they were. The watermark is simply overlaid on top. The document remains searchable and selectable underneath the mark.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The whole process runs in your browser on your own device, so the PDF never leaves your computer. That makes it safe to watermark confidential contracts and internal documents.",
    },
  ],
  relatedToolSlugs: [
    "compress-pdf",
    "merge-pdf",
    "pdf-password-protect",
    "video-watermark",
  ],
  relatedHowToSlugs: [],
};

export default howto;
