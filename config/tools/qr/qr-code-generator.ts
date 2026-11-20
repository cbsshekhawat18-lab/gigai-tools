import type { Tool } from "@/types";

/**
 * QR Code Generator: the flagship QR micro-site. This is the full desktop-grade
 * QR STUDIO entry point: every content type unlocked (URL, Wi-Fi, vCard, UPI,
 * email, SMS, WhatsApp, geo, calendar, app-store and 18 more), full visual
 * customization (dot/eye shapes, gradients, colors, quiet zone, corner radius),
 * a centred logo with error-correction guidance, real-time scannability +
 * WCAG contrast validation, CSV → ZIP batch generation, and lossless exports to
 * PNG / SVG / PDF / EPS / JPG / WEBP (plus transparent PNG/SVG) at up to 4096px.
 *
 * All copy below is unique to this generator and written to win the exact
 * queries people type when they want to *make* a QR code and actually get a
 * clean, on-brand, verified-scannable file out. Not another watermarked PNG.
 * Everything runs in the browser; nothing is uploaded.
 */
const qrCodeGenerator: Tool = {
  slug: "qr-code-generator",
  title: "QR Code Generator",
  description:
    "Design branded, high-resolution QR codes in your browser, custom dot & eye shapes, color gradients, a centre logo and real-time scan checks. Encode URLs, Wi-Fi, vCards, UPI and 24 more, then export PNG, SVG, PDF or EPS. Nothing is uploaded.",
  category: "qr-tools",
  icon: "QrCode",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-12",

  h1: "QR Code Generator, Custom, Branded & High-Resolution",
  tagline:
    "A desktop-grade QR studio in your browser. Encode 28 kinds of content, style every dot, eye and color, drop in your logo, and export razor-sharp PNG, SVG, PDF or EPS: with a live scan test that proves it works before you print. No sign-up, no watermark, nothing uploaded.",
  longDescription:
    "The GigAI QR Code Generator is a full QR studio, not a throwaway generator that spits out a fuzzy black-and-white square. Start by choosing what to encode: a plain link, a Wi-Fi network guests can join in one tap, a vCard that saves your full contact card, a UPI or PayPal payment string, a calendar event, an email, an SMS, a WhatsApp chat, a map pin, an app-store link and 18 more, and purpose-built forms handle the fiddly payload syntax so scanners read it perfectly. Then make it yours: pick dot shapes (rounded, dots, classy, extra-rounded), style the three finder eyes independently, apply a linear or radial color gradient, set a transparent background, tune the quiet-zone margin and corner radius, and add a centred logo with automatic error-correction guidance so the code still scans. A live preview renders as you type across desktop, mobile, dark and print modes, and a real-time validator runs an actual jsQR decode on the rendered pixels plus a WCAG contrast check, so you know it scans before you commit. When you're happy, export a lossless PNG, a true vector SVG, a print-ready PDF or EPS, or a JPG/WEBP, at 256 up to 4096 pixels, including transparent PNG/SVG for overlays. Need hundreds at once? The batch panel turns a CSV into a ZIP of individually styled codes. Everything (encoding, styling, rendering, validating, exporting) happens locally on your device using the browser's canvas and Web APIs, so the data you encode is never uploaded, logged or stored.",

  ctaText: "Create QR Code",

  keywords: [
    "qr code generator",
    "custom qr code",
    "qr code maker",
    "create qr code",
    "high resolution qr code",
    "qr code svg",
    "qr code png transparent",
    "qr code for url",
    "free qr code generator no expiry",
    "qr code generator no watermark",
    "vector qr code",
    "qr code with color gradient",
  ],

  seo: {
    title:
      "QR Code Generator, Custom Branded QR Codes with Logo (PNG/SVG/PDF) | GigAI Tools",
    description:
      "Free QR code generator with logo, colors, gradients and custom shapes. Encode URL, Wi-Fi, vCard, UPI and more, verify it scans, and export high-res PNG, SVG, PDF or EPS. 100% in-browser, no watermark, no expiry.",
  },

  features: [
    {
      icon: "Shapes",
      title: "Shape QR: your code inside an icon",
      description:
        "Pick a popular silhouette (heart, star, shield, trophy...), search a catalog of 1,900 shapes, or paste any emoji - the code is drawn inside the shape from its own modules. The corner squares stay intact, a warning appears when a shape can't hold your link cleanly, and every design is decoded back with our own scanner before download, so a too-stylized code can never ship.",
    },
    {
      icon: "Palette",
      title: "Full visual customization",
      description:
        "Choose dot shapes and style the three finder eyes independently, apply linear or radial gradients, set a transparent background, and tune the quiet-zone margin and corner radius: a code that matches your brand, not a plain square.",
    },
    {
      icon: "Image",
      title: "Centre logo, done right",
      description:
        "Drop your logo into the middle with adjustable size, padding and a protect-area cut-out. The tool recommends the error-correction level so the code stays reliably scannable even with your mark on top.",
    },
    {
      icon: "ScanLine",
      title: "Live scan & contrast check",
      description:
        "A validator runs an actual jsQR decode on the rendered pixels and a WCAG contrast test as you design, warning you the moment a color choice, logo size or inverted palette would stop scanners reading it.",
    },
    {
      icon: "Layers",
      title: "28 content encoders",
      description:
        "Purpose-built forms for URL, text, Wi-Fi, vCard, email, SMS, WhatsApp, UPI, PayPal, Bitcoin, geo, Google Maps, calendar events, app-store links, social profiles and more. The payload syntax is handled for you.",
    },
    {
      icon: "Download",
      title: "Lossless, high-res exports",
      description:
        "Export PNG, true vector SVG, print-ready PDF or EPS, plus JPG and WEBP, from 256 up to 4096 pixels, including transparent PNG and SVG for overlays. Copy straight to the clipboard, too.",
    },
    {
      icon: "Table",
      title: "CSV → ZIP batch mode",
      description:
        "Upload a spreadsheet of links or values, apply one shared style, and download a ZIP of individually generated QR codes, perfect for events, tables, assets or a product catalogue.",
    },
  ],

  benefits: [
    {
      title: "On-brand codes that still scan",
      description:
        "Colors, gradients and a logo make a QR code look like it belongs to you, and the built-in decode test means you get that polish without gambling on whether phones can actually read it.",
    },
    {
      title: "Print without pixelation",
      description:
        "Vector SVG, PDF and EPS scale to any size with crisp edges, and raster exports go up to 4096px, so the same code is sharp on a business card and on a billboard.",
    },
    {
      title: "One tool for every payload",
      description:
        "Wi-Fi, vCard, UPI, calendar, maps and social encoders replace a dozen single-purpose generators, and each builds the exact string scanners expect so nothing is typed by hand.",
    },
    {
      title: "Private and free, forever",
      description:
        "No account, no watermark and no expiry. Everything runs on your device, so the URLs, credentials and contact details you encode never leave your browser.",
    },
  ],

  howTo: [
    {
      title: "Pick what to encode",
      description:
        "Choose a content type (URL, Wi-Fi, vCard, UPI, email and 23 more) and fill the guided form. The payload is built and previewed live as you type.",
    },
    {
      title: "Style it to your brand",
      description:
        "Set your colors or a gradient, choose dot and eye shapes, adjust the margin and corner radius, and drop in a centre logo. The design tab updates the preview instantly.",
    },
    {
      title: "Verify it scans",
      description:
        "Watch the live scan-test and contrast badges. If a color, logo size or inversion would break scanning, the validator flags it so you can fix it before exporting.",
    },
    {
      title: "Export or batch",
      description:
        "Download PNG, SVG, PDF, EPS, JPG or WEBP at up to 4096px (or transparent PNG/SVG), copy to the clipboard, or switch to batch mode to turn a CSV into a ZIP of codes.",
    },
  ],

  formats: {
    input: ["Text", "URL", "CSV", "PNG", "JPG", "SVG"],
    output: ["PNG", "SVG", "PDF", "EPS", "JPG", "WEBP", "ZIP"],
  },

  useCases: [
    {
      audience: "Marketer",
      title: "A branded QR for a campaign",
      description:
        "Encode a landing-page URL, match the code to brand colors with a gradient and centre logo, verify it scans, then export a vector SVG for print and a transparent PNG for the web.",
    },
    {
      audience: "Café / restaurant owner",
      title: "Table Wi-Fi and menu codes",
      description:
        "Generate a one-tap Wi-Fi join code for guests and a menu-link code, style them to match your signage, and export high-resolution PDFs ready to print and laminate.",
    },
    {
      audience: "Small business / freelancer",
      title: "A vCard on every card",
      description:
        "Turn your name, phone, email and website into a vCard QR so a single scan saves your full contact card to a phone. No typing, no lost business cards.",
    },
    {
      audience: "Event organizer",
      title: "Hundreds of codes at once",
      description:
        "Upload a CSV of attendee or asset links, apply one consistent style, and download a ZIP of individually generated QR codes in a single pass with the batch panel.",
    },
  ],

  troubleshooting: [
    {
      problem: "My styled QR code won't scan.",
      solution:
        "Check the live scan-test badge. The usual causes are low contrast (light code on light background, or a dark background), too small a quiet-zone margin, or a logo covering too much of the code. Raise the contrast, keep the margin, shrink the logo, and set error correction to H when using a logo.",
    },
    {
      problem: "The logo hides part of the code and breaks it.",
      solution:
        "Reduce the logo size, enable the protect-area / hide-background-dots option, and raise the error-correction level to Q or H. QR error correction can rebuild data behind a centred mark, but only up to roughly 30% of the modules: the tool recommends a safe level for your logo size.",
    },
    {
      problem: "The exported image looks blurry when printed.",
      solution:
        "Export a vector format (SVG, PDF or EPS) which scales to any size with no pixelation, or raise the raster size to 2048 or 4096px. Small PNGs stretched to print size will always look soft.",
    },
    {
      problem: "The EPS export lost my gradient, logo and dot shapes.",
      solution:
        "EPS is generated as a plain vector module matrix for maximum print-software compatibility, so it can't carry gradients, custom dot/eye shapes, logos or frames. For a fully styled vector, export SVG or PDF instead: both preserve your design.",
    },
  ],

  tips: [
    "Using a centre logo? Set error correction to H and keep the logo under ~25% of the width so the code stays reliably scannable.",
    "Export SVG or PDF for anything printed, vectors stay crisp at any size, from a business card to a poster.",
    "Keep a generous quiet-zone margin: scanners need clear space around the code to lock onto it, especially on busy backgrounds.",
    "Prefer a dark code on a light background. Inverted (light-on-dark) codes work on fewer scanners. The validator will warn you.",
    "For overlays on photos or colored sections, export a transparent PNG or SVG so the background shows through.",
  ],

  security:
    "Every QR code is built, styled, rendered and exported entirely in your browser using the canvas and Web APIs on your device. The URLs, Wi-Fi passwords, contact details and payment strings you encode are never uploaded, logged or stored. There is no server round-trip and no account. Uploaded logos and batch CSVs are read locally and never leave the tab. Close it and everything is gone.",

  faq: [
    {
      question: "Is this QR code generator really free, with no watermark or expiry?",
      answer:
        "Yes. Every QR code you make here is free, watermark-free and never expires. There is no account, no trial and no 'pro' tier hiding the good features. Because the codes are static (the data is encoded directly into the pattern) they keep working forever as long as the destination (your URL, Wi-Fi, etc.) stays valid.",
    },
    {
      question: "Can I add my logo to the QR code?",
      answer:
        "Yes. Upload a logo and it's placed in the centre with adjustable size, padding, a protect-area cut-out and optional rounding. QR codes carry error-correction data that lets scanners rebuild the modules hidden behind a centred mark, so the code still reads. The tool recommends the right error-correction level for your logo size and warns you live if the logo is getting too large.",
    },
    {
      question: "Will my customized, colored QR code still scan?",
      answer:
        "It will if it passes the built-in checks. A live validator runs a real decode on the rendered pixels and a WCAG contrast test as you design, flagging low contrast, an inverted palette, a too-small margin or an oversized logo before you export. Follow its guidance (dark code on a light background, generous margin, error correction H with a logo) and your styled code scans reliably.",
    },
    {
      question: "What's the difference between a static and a dynamic QR code?",
      answer:
        "A static QR code, which is what this tool makes, encodes the data (like a URL) directly into the pattern. It's free, private, has no expiry and needs no account, but you can't change the destination after printing. A 'dynamic' QR code points at a short redirect URL you can re-target later, which requires a hosted server and database with a login and usually a subscription. This tool is fully in-browser with no server, so it doesn't offer editable-after-print dynamic codes. The honest way to get that flexibility here is to encode a link you control (your own domain or a link-shortener you manage) and change where it points on your side.",
    },
    {
      question: "Which format should I download, PNG, SVG, PDF or EPS?",
      answer:
        "Use PNG for web and screens (choose transparent PNG to overlay on a colored background). Use SVG for the web when you want infinite scaling and small file size. Use PDF or EPS for print and hand-off to a designer or print shop, since they stay razor-sharp at any physical size. Note that EPS is a plain vector matrix and doesn't carry gradients, logos or custom shapes. Use SVG or PDF if you need those preserved in vector form.",
    },
    {
      question: "What resolution should I use for printing?",
      answer:
        "For print, export a vector format (SVG, PDF or EPS) whenever you can. It scales to any size with zero pixelation. If you need a raster image, use 1024px for small items like cards and 2048–4096px for posters, packaging or signage. Avoid stretching a small PNG up to print size, which always looks blurry.",
    },
    {
      question: "What kinds of content can I turn into a QR code?",
      answer:
        "28 types: website URLs, plain text, phone numbers, email, SMS, WhatsApp chats, Wi-Fi network credentials, vCard contact cards, UPI and PayPal payments, Bitcoin, geo coordinates, Google Maps locations, calendar events, YouTube, Spotify, Zoom, Discord, Telegram, Facebook, Instagram, LinkedIn, app-store and Google Play links, an app-download smart link, and PDF/image/video links. Each has a guided form that builds the exact payload scanners expect.",
    },
    {
      question: "Is my data uploaded when I generate a QR code?",
      answer:
        "No. All encoding, styling, rendering, validating and exporting happen locally in your browser using the canvas and Web APIs. The links, Wi-Fi passwords, contact details and payment strings you encode, and any logo or CSV you add, never leave your device. There's nothing for us to store, log or see.",
    },
  ],

  changelog: [
    {
      date: "2026-06-12",
      change:
        "Initial release, full QR studio: 28 content encoders, dot/eye shape styling, color gradients, transparent background, centre logo with error-correction guidance, live preview and PNG/SVG/PDF/EPS/JPG/WEBP export up to 4096px.",
    },
    {
      date: "2026-06-21",
      change:
        "Added real-time scannability validation, an on-canvas jsQR re-decode plus a WCAG contrast check with live warnings, and transparent PNG/SVG exports.",
    },
    {
      date: "2026-06-28",
      change:
        "Added CSV → ZIP batch generation, copy-to-clipboard for PNG, and desktop/mobile/dark/print preview modes with zoom.",
    },
  ],

  relatedTools: [
    "wifi-qr-code-generator",
    "vcard-qr-code-generator",
    "upi-qr-code-generator",
    "menu-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default qrCodeGenerator;
