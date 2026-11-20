import type { Tool } from "@/types";

/**
 * PDF QR Code Generator, a single-purpose micro-site over the QR Studio, locked
 * to the "pdf" content type. It takes the public URL of a PDF you host (a menu,
 * brochure, price list, manual, resume, ticket or report) and turns it into a
 * branded, print-ready QR code that opens the document the instant someone scans
 * it. No app, no typing a long link.
 *
 * Honest boundary baked into every string: we do NOT host or store your file.
 * You supply the link to a PDF you have already published (Drive, Dropbox, S3,
 * your own website, etc.), and the code encodes that exact URL locally in the
 * browser. Need to prepare the PDF first? Our /pdf-tools suite compresses,
 * merges, splits and converts, then you host it and paste the link here.
 */
const pdfQrCodeGenerator: Tool = {
  slug: "pdf-qr-code-generator",
  title: "PDF QR Code Generator",
  description:
    "Turn a link to your hosted PDF into a branded QR code that opens the document on any phone. No app, no typing. Style it, add a logo, verify it scans, then export print-ready PNG, SVG or PDF. 100% in your browser. We never host your file.",
  category: "qr-tools",
  icon: "FileText",
  accent: "rose",
  status: "live",
  createdAt: "2026-06-18",
  illustration: "pdf",

  h1: "PDF QR Code Generator, Scan to Open Your Document",
  tagline:
    "Paste the link to a PDF you host and get a QR code that opens it the moment someone scans, perfect for menus, brochures, manuals, price lists and resumes. Brand it, add your logo, confirm it scans, and print it razor-sharp. Everything runs in your browser. Your file is never uploaded to us.",
  longDescription:
    "The GigAI PDF QR Code Generator connects a printed surface to a digital document. Instead of reprinting a menu, spec sheet or brochure every time the details change, you host the PDF once and put a scannable code on your table tent, packaging, flyer, shelf label, business card or trade-show banner, a quick camera scan opens the current file on the reader's phone. Paste the public URL of a PDF you have already published (Google Drive, Dropbox, OneDrive, Amazon S3, Notion, your own website or any host that serves a direct link), and the tool encodes that exact address into the code: then hands it to our desktop-grade QR Studio so it looks like yours: custom foreground and background colors or a gradient, rounded dot and finder-eye styles, a centre logo with automatic error-correction guidance, and a printable frame with a 'Scan to view PDF' call-to-action. A live preview renders as you type across desktop, mobile, dark and print modes, and a real-time validator runs an actual on-canvas decode plus a WCAG contrast check so you know the styled code scans before you send it to print. Export a crisp PNG, a transparent PNG for overlays, a scalable SVG, a print-ready PDF or a vector EPS at up to 4096 pixels. One honest limit worth stating plainly: we do not host, upload or store your document, the QR encodes the link you provide, so the PDF must live at a publicly reachable URL for scanners to open it. If you still need to prepare that file, our companion PDF tools compress, merge, split, rotate and convert it first. Then upload it to your host and paste the resulting link here. Encoding, styling, validating and exporting all happen locally on your device, so the URL you enter is never sent to a server, logged or stored.",

  ctaText: "Generate PDF QR Code",

  keywords: [
    "pdf qr code generator",
    "qr code for pdf",
    "pdf to qr code",
    "qr code that opens pdf",
    "link pdf to qr code",
    "scan qr code to open pdf",
    "qr code for menu pdf",
    "brochure qr code",
    "document qr code",
    "qr code for resume pdf",
    "create pdf qr code free",
    "pdf qr code with logo",
  ],

  seo: {
    title:
      "PDF QR Code Generator: Scan to Open a PDF (Free, No Signup) | GigAI Tools",
    description:
      "Free PDF QR code generator. Paste the link to your hosted PDF to make a scan-to-open QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser. We never host or upload your file.",
  },

  features: [
    {
      icon: "FileText",
      title: "Any hosted PDF, one scan away",
      description:
        "Point the code at a menu, brochure, manual, price list, catalogue, ticket or resume you host anywhere with a direct link, scanning opens it instantly in the phone's browser or PDF viewer, no app required.",
    },
    {
      icon: "RefreshCw",
      title: "Update the file, keep the code",
      description:
        "Host at a stable link and replace the file behind it whenever prices, hours or specs change, the same printed QR always opens your latest PDF, so you reprint the document, not the code.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom colors or a gradient, rounded dot and eye styles, and a printable 'Scan to view PDF' frame make the code look like part of your menu, packaging or collateral. Not a generic black square.",
    },
    {
      icon: "Image",
      title: "Add your logo",
      description:
        "Drop a restaurant, brand or company logo into the centre with an adjustable size and a protected quiet zone. The tool auto-recommends higher error correction so the code stays reliably scannable.",
    },
    {
      icon: "ScanLine",
      title: "Live scan & contrast check",
      description:
        "A real-time validator runs an actual decode on the rendered pixels plus a WCAG contrast test, warning you the moment a color, logo size or margin choice would stop phones reading the code.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for a table tent, shelf label, flyer, poster or trade-show banner.",
    },
  ],

  benefits: [
    {
      title: "Paper meets your live document",
      description:
        "Put a small code on any printed surface and readers reach the full PDF (a multi-page menu, a 40-page manual or a rich brochure) without you cramming it onto the paper or reprinting when it changes.",
    },
    {
      title: "No app, no typing a long link",
      description:
        "Modern iPhone and Android cameras open the PDF from a scan in seconds. Nobody squints at a bit.ly slug or mistypes a Drive URL. They point, tap the banner and read.",
    },
    {
      title: "On-brand and print-sharp",
      description:
        "With your colors, logo and a framed call-to-action, plus vector SVG/PDF export, the code fits a boutique menu or a product box and stays crisp from a business card up to a banner.",
    },
    {
      title: "Private by design",
      description:
        "The link you paste is encoded locally in your browser and never sent to us. No account, no upload of the PDF itself, and nothing stored on a server.",
    },
  ],

  howTo: [
    {
      title: "Host your PDF and copy its link",
      description:
        "Upload the PDF to Google Drive, Dropbox, S3, Notion or your own site and get a public, direct link. Not ready? Prepare the file first with our PDF tools, then host it and copy the URL.",
    },
    {
      title: "Paste the URL",
      description:
        "Drop the PDF link into the field. The tool encodes that exact address and renders a scannable preview live, scan it with your phone to confirm the document opens.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab for colors or a gradient and dot/eye styles, add a 'Scan to view PDF' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Verify it scans",
      description:
        "Watch the live scan-test and contrast badges. If a color, logo size or margin would break scanning, the validator flags it so you can fix it before printing.",
    },
    {
      title: "Download and print",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, then place the code where your readers will see it.",
    },
  ],

  formats: {
    input: ["Public PDF URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Café / Restaurant",
      title: "A table-tent menu that updates itself",
      description:
        "Host your menu PDF and print a branded 'Scan for menu' code for every table. When prices or specials change, swap the file behind the link, the printed codes still open today's menu.",
    },
    {
      audience: "Manufacturer / Retail",
      title: "Manuals and spec sheets on the box",
      description:
        "Put a code on packaging or a shelf label that opens the product manual, warranty or spec-sheet PDF, so customers get full documentation without you printing a booklet for every unit.",
    },
    {
      audience: "Job seeker / Freelancer",
      title: "A resume or portfolio a scan away",
      description:
        "Add a code to a business card or networking badge that opens your resume or portfolio PDF, so a recruiter has your full, formatted document on their phone the moment you meet.",
    },
    {
      audience: "Events / Real estate",
      title: "Brochures on flyers and signage",
      description:
        "Link a property brochure, event programme or price list PDF from a flyer, yard sign or trade-show banner, letting people take the full document with a scan instead of grabbing a paper copy.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning shows a login page or 'access denied' instead of the PDF.",
      solution:
        "The link isn't public. On Google Drive/Dropbox/OneDrive, set sharing to 'Anyone with the link' and use the direct/preview link, not a private or edit URL. Anything requiring a sign-in will block scanners who aren't logged into your account.",
    },
    {
      problem: "The code opens a folder or download prompt, not the document.",
      solution:
        "Some hosts wrap PDFs in a viewer page or force a download. Link to a direct 'view' URL that ends in the file (or use a host that serves the PDF inline). For Drive, the '/preview' link opens the document in-browser rather than forcing a download.",
    },
    {
      problem: "My styled or logo'd PDF code won't scan.",
      solution:
        "Check the live scan-test badge. Usual causes are low contrast, too small a quiet-zone margin, or a logo covering too much of the code. Raise contrast, keep the margin, shrink the logo, and set error correction to Q or H when using a logo.",
    },
    {
      problem: "The exported code looks blurry when printed.",
      solution:
        "Export a vector format (SVG, PDF or EPS) which scales to any size without pixelation, or raise the raster size to 2048 or 4096px. A small PNG stretched to print size always looks soft.",
    },
  ],

  tips: [
    "Host at a stable link (your own domain or a fixed Drive/S3 URL) so you can update the PDF later without reprinting the code.",
    "Test the exact link in a private/incognito window first, if it opens the PDF there without logging in, the QR will work for strangers too.",
    "Add a logo? Set error correction to Q or H and keep the logo under ~25% of the width so a coffee ring or scuff on a printed card doesn't break scanning.",
    "Prepare the PDF before hosting, compress it with our PDF tools so it opens fast on mobile data, and merge or split pages so the code opens exactly what you want.",
    "Frame the code with a clear 'Scan for menu' or 'Scan for the manual' label so people know what they'll get before they point their camera.",
  ],

  security:
    "The PDF's link is encoded into the QR entirely in your browser. The URL is never uploaded to us, stored or logged, and there is no account. We also never receive or host the document itself. It lives at the link you provide, on your host. Because the finished QR is static, it always points at that URL: keep the file public at a stable address, and remember that anyone who scans the printed code can open whatever the link serves. Host sensitive documents behind access controls rather than a plain public link.",

  faq: [
    {
      question: "Does this upload or host my PDF?",
      answer:
        "No, and we're upfront about that. This tool encodes a link to a PDF you host yourself. It never uploads, receives or stores the document. You publish the file somewhere public (Google Drive, Dropbox, S3, Notion, your own website) and paste that link here, and we turn the link into a QR code entirely in your browser. If you need to prepare the PDF first, use our PDF tools, then host it and paste the resulting URL.",
    },
    {
      question: "How do I get a direct link to my PDF?",
      answer:
        "Upload the PDF to a host and set it to be publicly accessible: on Google Drive choose 'Anyone with the link' and use the '/preview' URL, on Dropbox use the shared link (swapping the trailing '?dl=0' for a direct view), or upload to S3 / your own web server for a clean permanent URL. Test the link in a private browser window first, if the PDF opens there without a login, it will open from the QR too.",
    },
    {
      question: "Can I change the PDF later without reprinting the QR code?",
      answer:
        "Yes, if you host it at a stable link. The QR encodes a fixed URL, so as long as you keep that address the same and replace the file behind it, every printed code opens your newest PDF. This is the honest way to get 'dynamic' behaviour without a paid redirect service: control the link yourself and update what it points to.",
    },
    {
      question: "Will the PDF open without the reader installing an app?",
      answer:
        "Yes. Modern iPhone (iOS 11+) and Android (10+) cameras read the QR and open the link in the phone's browser, which renders the PDF inline or in the built-in PDF viewer. No separate app needed. On older phones, any standard QR reader opens the same link.",
    },
    {
      question: "Is there a file-size or page limit on the PDF?",
      answer:
        "There's no limit from us, because we never touch the file, the QR just stores its link. In practice, keep the PDF reasonably small so it opens quickly on mobile data. Compress it with our PDF compressor if it's heavy, and split very large documents so the code opens just the section you want.",
    },
    {
      question: "Can I add my logo and brand colors to the PDF QR code?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot and eye styles, add a 'Scan to view PDF' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Which format should I download for printing?",
      answer:
        "For a table tent, flyer, card or label, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For signage or anything that may be resized, use the SVG or EPS export, which is vector and stays razor-sharp at any physical size.",
    },
    {
      question: "Is it really free with no signup or watermark?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many PDF QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: locked PDF-link content form, live preview, full color/gradient/dot/eye customization, and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-25",
      change:
        "Added logo drop-in with automatic error-correction guidance, a 'Scan to view PDF' frame with a custom call-to-action label, and the real-time on-canvas decode + WCAG contrast scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Expanded hosting guidance for Google Drive, Dropbox and S3 direct links, plus clearer troubleshooting for login-gated and download-forcing URLs.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "qr-code-with-logo",
    "menu-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default pdfQrCodeGenerator;
