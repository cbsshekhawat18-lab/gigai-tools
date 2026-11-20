import type { Tool } from "@/types";

/**
 * Document Signature: sign a PDF in the browser. Draw a signature with your
 * mouse or finger, type your name in a signature-style font, or upload a PNG of
 * your ink, then drag it onto the exact spot on the exact page and resize it to
 * fit the signature line. Download a signed PDF, all on your device.
 *
 * It reuses the shared document engine's `addSignature` (pdfops.ts) to stamp the
 * mark into the PDF with pdf-lib, and pdf.js (lib/pdf/core) to render the page
 * preview you position on, so there is no duplicated PDF-writing or rendering
 * code behind this URL, only unique, honestly-scoped copy.
 *
 * Honesty: this is a stamped-image / typed-text e-signature for approving,
 * initialling and returning documents. It is NOT a cryptographic digital
 * signature (no PKI certificate, no tamper-evident hash), and it does not fill
 * AcroForm signature fields. Every string below reflects that boundary.
 */
const documentSignature: Tool = {
  slug: "document-signature",
  title: "Sign PDF",
  description:
    "Sign a PDF online for free. Draw your signature, type your name in a handwritten font, or upload a signature image, then drag it onto the page, resize it and download a signed PDF. 100% in your browser. Nothing is uploaded.",
  category: "pdf-tools",
  group: "PDF Security",
  icon: "PenLine",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-24",

  h1: "Sign PDF: Add Your Signature to a PDF Online",
  tagline:
    "Drop in a PDF and sign it in seconds. Draw your signature with a mouse or finger, type your name in a handwritten-style font, or upload a PNG of your ink, then drag it to the exact spot on the exact page, resize it to fit the signature line, and download a signed PDF. No account, no upload, nothing stored.",
  longDescription:
    "The GigAI Sign PDF tool lets you place a signature onto a PDF and download the signed file without printing, scanning, or handing your document to a signing service. Drop in a PDF and it renders page by page right in your browser so you can see exactly where your signature will land. Create the signature three ways: draw it freehand on a canvas with a mouse, trackpad or touchscreen. Type your name and pick a signature-style font, or upload a transparent PNG of a signature you already have. Then drag the signature anywhere on the page, resize it with a corner handle until it sits neatly on the signature line, and step through the pages to sign the right one, a contract's last page, an initial box, a form field, wherever it belongs. When it looks right, click Download and the tool bakes the signature into the PDF and hands you the signed file. Everything happens on your device: the page preview is rendered with pdf.js and the signed PDF is written with pdf-lib, so a confidential contract, an offer letter or an NDA is never uploaded, stored or logged. It is built for the everyday jobs where you just need to approve and return a document fast: signing an agreement a client emailed you, initialling a lease, adding your name to an invoice, or dropping an approval mark on a form. One honest boundary worth stating up front: this is a visual e-signature, a stamped image or typed text placed onto the page, for approving and returning documents. It is not a cryptographic digital signature: it does not attach a PKI certificate, embed a tamper-evident hash, or fill an AcroForm signature field, so it is not the tool for a qualified/eIDAS-style legally-binding digital certificate. For that specific need, use a dedicated certificate-based signing provider.",

  ctaText: "Sign PDF",

  keywords: [
    "sign pdf",
    "sign pdf online",
    "add signature to pdf",
    "pdf signature",
    "e-sign pdf",
    "esign pdf free",
    "draw signature on pdf",
    "sign a document online",
    "insert signature into pdf",
    "sign pdf free",
    "electronic signature pdf",
    "sign contract online",
  ],

  seo: {
    title: "Sign PDF: Add a Signature to a PDF Online Free | GigAI Tools",
    description:
      "Free online tool to sign a PDF. Draw, type or upload a signature, drag it onto the page, resize it, and download a signed PDF. 100% in your browser: nothing is uploaded or stored.",
  },

  features: [
    {
      icon: "PenLine",
      title: "Draw, type or upload",
      description:
        "Create your signature three ways, draw it freehand on a canvas with a mouse or finger, type your name in a handwritten-style font, or upload a transparent PNG of ink you already have.",
    },
    {
      icon: "Move",
      title: "Drag to the exact spot",
      description:
        "Place the signature anywhere on the page by dragging it, so it lands right on the signature line, the initial box or the form field. Not floating in the wrong corner.",
    },
    {
      icon: "Maximize2",
      title: "Resize to fit",
      description:
        "Grab a corner handle and scale the signature up or down until it sits neatly on the line, then fine-tune its position pixel by pixel before you export.",
    },
    {
      icon: "Files",
      title: "Sign the right page",
      description:
        "Step through a multi-page PDF and drop your signature on the page that needs it: a contract's last page, an appendix, or an initial box halfway through.",
    },
    {
      icon: "FileDown",
      title: "One-click signed PDF",
      description:
        "When it looks right, click Download and the signature is baked into the PDF with pdf-lib, giving you back a signed file ready to email or file. No flattening step required.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "The page is rendered and the signed PDF is written entirely on your device. Confidential contracts, offer letters and NDAs are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "No print, scan or app",
      description:
        "Sign and return a document in the browser instead of printing it, signing with a pen, scanning it back in, and re-attaching a blurry copy to an email.",
    },
    {
      title: "Keep confidential documents private",
      description:
        "Contracts, offer letters, leases and NDAs never leave your machine. There is no server round-trip, so sensitive documents are safe to sign here.",
    },
    {
      title: "Place it exactly where it belongs",
      description:
        "Drag-to-position and corner-resize mean the signature lands precisely on the line at the right size, so the returned document looks deliberate, not slapped on.",
    },
    {
      title: "Reuse a signature you already have",
      description:
        "Upload a PNG of your real ink once and stamp it onto any document, so every signed file looks consistent instead of a fresh shaky mouse-drawing each time.",
    },
  ],

  howTo: [
    {
      title: "Add your PDF",
      description:
        "Drop, paste or browse to the PDF you need to sign. It renders in your browser so you can see every page before you place anything.",
    },
    {
      title: "Create your signature",
      description:
        "Draw it freehand on the canvas, type your name and pick a signature-style font, or upload a transparent PNG of your existing signature.",
    },
    {
      title: "Position and resize it",
      description:
        "Drag the signature onto the right page and the right spot, then grab a corner handle to scale it until it fits the signature line.",
    },
    {
      title: "Download the signed PDF",
      description:
        "Click Download to bake the signature into the file and save a signed PDF, ready to email, file or return. Reset to sign another document in one click.",
    },
  ],

  formats: {
    input: ["PDF", "PNG"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Freelancer / Client",
      title: "Sign and return a contract",
      description:
        "A client emails an agreement as a PDF, draw or upload your signature, drop it on the last page, and send the signed file back without leaving the browser.",
    },
    {
      audience: "HR / Candidate",
      title: "Countersign an offer letter",
      description:
        "Add your signature to an offer letter or employment agreement and return a signed PDF, keeping the confidential document off any third-party server.",
    },
    {
      audience: "Tenant / Landlord",
      title: "Initial and sign a lease",
      description:
        "Place your signature on the signature line and your initials in each required box across a multi-page lease, then download the completed PDF.",
    },
    {
      audience: "Small business",
      title: "Approve an invoice or form",
      description:
        "Stamp an approval signature onto an invoice, purchase order or intake form and file the signed copy. No printer, no scanner, no signing subscription.",
    },
  ],

  troubleshooting: [
    {
      problem: "Is this a legally-binding digital signature?",
      solution:
        "This is a visual e-signature (a stamped image or typed text placed on the page) suitable for approving and returning everyday documents. It is not a certificate-based digital signature: it does not attach a PKI certificate, embed a tamper-evident hash, or fill an AcroForm signature field. For a qualified/eIDAS-style legally-binding signature, use a dedicated certificate-based signing provider.",
    },
    {
      problem: "My drawn signature has an ugly white box around it.",
      solution:
        "A drawn or typed signature is exported with a transparent background, so it should sit cleanly on the page. If you uploaded a JPG with a white background, re-upload a PNG that has real transparency around the ink so only the strokes show.",
    },
    {
      problem: "The signature landed on the wrong page or spot.",
      solution:
        "Step to the page you want using the page controls, then drag the signature to reposition it before downloading. Position and size are fully editable right up until you click Download, so nothing is baked in until then.",
    },
    {
      problem: "My PDF is password-protected and won't open.",
      solution:
        "Remove the password first with the Unlock PDF tool, then sign the unlocked copy here. Signing writes a new document, so an encrypted original can't be edited in place.",
    },
  ],

  tips: [
    "Upload a transparent PNG of your real ink once, and reuse it on every document so your signed files look consistent.",
    "Drawing with a trackpad is fiddly: a touchscreen or stylus gives a much cleaner freehand signature.",
    "Resize the signature so it sits just above the printed signature line rather than covering it, for a tidy result.",
    "Signing the last page? Use the page controls to jump straight there before placing the signature.",
    "Need to remove a password first? Run the file through Unlock PDF, then sign the unlocked copy here.",
  ],

  security:
    "Your PDF is rendered and signed entirely in your browser. It is never uploaded to any server. The page preview is drawn with pdf.js and the signed file is written with pdf-lib, all on your device. Nothing is stored, logged or transmitted. That means confidential contracts, offer letters, leases and NDAs are safe to sign here. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my PDF uploaded to a server?",
      answer:
        "No. The PDF is rendered and signed locally in your browser: pdf.js draws the page preview and pdf-lib writes the signed file, all on your device. Your document never leaves your machine, so there is nothing for us to store, log or see, and it is safe to sign confidential contracts and offer letters.",
    },
    {
      question: "Is this a legally-binding digital signature?",
      answer:
        "It's an honest e-signature: a signature image or typed name stamped onto the page, which is widely used and accepted for approving and returning everyday documents. It is not a certificate-based digital signature. It does not attach a PKI certificate, embed a tamper-evident cryptographic hash, or fill an AcroForm signature field. If you need a qualified, eIDAS-style legally-binding digital certificate, use a dedicated certificate-based provider.",
    },
    {
      question: "How do I create my signature?",
      answer:
        "Three ways. Draw it freehand on the canvas with a mouse, trackpad or touchscreen. Type your name and choose a signature-style font, or upload a transparent PNG of a signature you already have. Whichever you pick, you can drag it into position and resize it before exporting.",
    },
    {
      question: "Can I move and resize the signature?",
      answer:
        "Yes. Drag the signature anywhere on the page to position it, and grab a corner handle to scale it up or down until it fits the signature line. Position and size stay editable right up until you click Download: nothing is baked in before that.",
    },
    {
      question: "Can I sign a specific page of a multi-page PDF?",
      answer:
        "Yes. Step through the pages with the page controls and drop your signature on the page that needs it: a contract's last page, an appendix, or an initial box in the middle. You can place a signature on any page you choose.",
    },
    {
      question: "What file types can I use?",
      answer:
        "The document you sign must be a PDF. An uploaded signature image should be a PNG, ideally with a transparent background so only the ink shows on the page. Drawn and typed signatures are handled for you with transparency built in.",
    },
    {
      question: "Will the signature look clean, without a white box?",
      answer:
        "Drawn and typed signatures are exported with a transparent background, so they sit cleanly on the page. If you upload your own image, use a PNG with real transparency around the ink. A JPG or a PNG with a solid white fill will show a visible box behind the signature.",
    },
    {
      question: "Does it work with password-protected PDFs?",
      answer:
        "Not directly. An encrypted PDF has to be unlocked before it can be edited. Remove the password with the Unlock PDF tool first, then sign the unlocked copy here.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: sign a PDF in the browser by drawing, typing or uploading a signature, drag-to-position and corner-resize on a live page preview, multi-page navigation, one-click signed-PDF download and reset.",
    },
    {
      date: "2026-06-28",
      change:
        "Added typed-signature fonts and transparent-background export for drawn/typed signatures, plus a clearer honesty note distinguishing this visual e-signature from a certificate-based digital signature.",
    },
  ],

  relatedTools: [
    "merge-pdf",
    "split-pdf",
    "unlock-pdf",
    "pdf-password-protect",
    "document-comparer",
  ],
};

export default documentSignature;
