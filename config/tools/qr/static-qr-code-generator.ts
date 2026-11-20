import type { Tool } from "@/types";

/**
 * Static QR Code Generator: the full QR studio framed around *permanence*.
 *
 * A static QR code encodes its data (a URL, Wi-Fi network, vCard, payment
 * string, etc.) directly into the black-and-white module pattern. There is no
 * short redirect link in the middle, so there is no server to keep alive, no
 * account to renew, no expiry timer and no scan-tracking pixel. Print it once
 * and it keeps working for as long as the destination it points to exists -
 * on a wall, a business card, a headstone or a machine part decades from now.
 *
 * This page is the same desktop-grade studio as the flagship generator (every
 * content encoder, full styling, centre logo, live scan + contrast validation,
 * PNG/SVG/PDF/EPS/JPG/WEBP export up to 4096px), but all of the copy below is
 * written for people who specifically want a *permanent, never-expiring,
 * untracked* code, and who are trying to understand static vs dynamic. Every
 * field is unique to this tool. Everything runs in the browser; nothing is
 * uploaded, because a static code has no back end to upload to.
 */
const staticQrCodeGenerator: Tool = {
  slug: "static-qr-code-generator",
  title: "Static QR Code Generator",
  description:
    "Make a permanent, never-expiring QR code that lives entirely in the pattern. No redirect link, no account, no scan tracking. Encode a URL, Wi-Fi, vCard, payment or 24 more, style it to your brand, verify it scans, and export PNG, SVG, PDF or EPS. 100% in-browser.",
  category: "qr-tools",
  icon: "QrCode",
  accent: "emerald",
  status: "live",
  createdAt: "2026-06-18",

  h1: "Static QR Code Generator: Permanent Codes That Never Expire",
  tagline:
    "A static QR code encodes your data straight into the pattern. No short link, no server, no login, no expiry and no tracking. Design one in a full in-browser studio, prove it scans with a live decode test, and export razor-sharp PNG, SVG, PDF or EPS that keeps working forever. No sign-up, no watermark, nothing uploaded.",
  longDescription:
    "The GigAI Static QR Code Generator builds true static QR codes: the destination is baked directly into the black-and-white modules, not hidden behind a redirect URL you have to keep paying to host. That single design choice is the whole point. Because there is no short link and no back end, a static code cannot expire, cannot be paused when a trial ends, cannot silently break when a QR company shuts down or gets acquired, and cannot log who scanned it, when or where. What you print is exactly what the phone reads. Inside the studio you get the same full toolkit as our flagship generator, 28 content encoders (URL, Wi-Fi, vCard, UPI, PayPal, email, SMS, WhatsApp, geo, calendar, app-store, social and more), custom dot and finder-eye shapes, color and gradient control, a transparent background, an adjustable quiet-zone margin and corner radius, and a centred logo with automatic error-correction guidance. A live preview renders as you type across desktop, mobile, dark and print modes, and a real-time validator runs an actual jsQR decode on the rendered pixels plus a WCAG contrast check, so you confirm the code scans before it ever hits a printer. When you're happy, export a lossless PNG, a true vector SVG, a print-ready PDF or EPS, or a JPG/WEBP, from 256 up to 4096 pixels, including transparent variants for overlays. The trade-off, stated honestly: you cannot change a static code's destination after it's printed, if you need to re-point it later, encode a link you control (your own domain or a shortener you manage) and redirect on your side, or use a hosted dynamic code instead. Everything here happens locally on your device. The data you encode is never uploaded, logged or stored.",

  ctaText: "Create Static QR Code",

  keywords: [
    "static qr code generator",
    "permanent qr code",
    "qr code that never expires",
    "no expiry qr code generator",
    "qr code no tracking",
    "static vs dynamic qr code",
    "free qr code no account",
    "qr code no watermark permanent",
    "offline qr code generator",
    "qr code direct url no redirect",
    "high resolution static qr code",
    "static qr code svg",
    "forever qr code",
    "qr code no subscription",
  ],

  seo: {
    title:
      "Static QR Code Generator: Permanent, No-Expiry, No-Tracking QR Codes | GigAI Tools",
    description:
      "Create a permanent static QR code that encodes data directly into the pattern. Never expires, no account, no redirect, no scan tracking. Style it, verify it scans, and export high-res PNG, SVG, PDF or EPS. 100% in-browser, free, no watermark.",
  },

  features: [
    {
      icon: "Infinity",
      title: "Never expires, ever",
      description:
        "The data lives in the pattern, not behind a short link on someone's server. There's no subscription to lapse and no trial to end. The code keeps resolving for as long as the URL, network or contact it encodes stays valid.",
    },
    {
      icon: "ShieldCheck",
      title: "Zero tracking, zero middleman",
      description:
        "A static code has no redirect hop, so no analytics pixel counts scans, no company sits between you and your audience, and no third party can pause, hijack or monetise your code later. What you print is what people reach.",
    },
    {
      icon: "ScanLine",
      title: "Live scan & contrast check",
      description:
        "A validator runs a real jsQR decode on the rendered pixels plus a WCAG contrast test as you design, flagging low contrast, an inverted palette, a thin quiet zone or an oversized logo before you commit the code to print.",
    },
    {
      icon: "Layers",
      title: "28 content encoders",
      description:
        "Bake a URL, plain text, Wi-Fi, vCard, UPI or PayPal payment, email, SMS, WhatsApp, geo pin, calendar event, app-store link or social profile straight into a permanent code. Each has a guided form that builds the exact payload.",
    },
    {
      icon: "Palette",
      title: "Brand it without breaking it",
      description:
        "Custom dot and eye shapes, color gradients, a transparent background, margin and corner radius, and a centre logo with error-correction guidance: style a permanent code to match your brand while the validator keeps it scannable.",
    },
    {
      icon: "Download",
      title: "Print-forever exports",
      description:
        "Export vector SVG, PDF or EPS that stay crisp at any physical size, or raster PNG/JPG/WEBP up to 4096px including transparent PNG/SVG, the right archival file for engraving, packaging, signage or a card that outlives the trend.",
    },
  ],

  benefits: [
    {
      title: "Print once, trust it for years",
      description:
        "Because nothing points through a rented link, a static code you engrave, laminate or emboss today still works long after any QR startup's servers are gone: ideal for anything permanent or hard to reprint.",
    },
    {
      title: "Nobody watches your scans",
      description:
        "No redirect means no scan log. For privacy-sensitive uses (a home Wi-Fi code, a personal vCard, a payment string) the connection is directly between the code and the phone, with no analytics company in between.",
    },
    {
      title: "No account, no cost, no watermark",
      description:
        "There's no login wall and no 'pro' tier hiding real features, because there's no server to gate. Generate as many permanent codes as you like, unbranded, and keep every file.",
    },
    {
      title: "Verified before it's permanent",
      description:
        "A code you can't reprint is a code you can't afford to get wrong. The live decode and contrast checks let you prove it scans across your styling and logo choices before anything is committed to a surface.",
    },
  ],

  howTo: [
    {
      title: "Choose what to bake in",
      description:
        "Pick a content type (URL, Wi-Fi, vCard, UPI, email and 23 more) and fill the guided form. The data is encoded directly into the pattern and previewed live as you type.",
    },
    {
      title: "Style it to your brand",
      description:
        "Set colors or a gradient, choose dot and eye shapes, tune the margin and corner radius, and drop in a centre logo. The preview updates instantly across desktop, mobile, dark and print modes.",
    },
    {
      title: "Prove it scans",
      description:
        "Watch the live scan-test and contrast badges. Since a static code can't be edited after printing, fix any warning now (raise contrast, widen the margin or shrink the logo) before you export.",
    },
    {
      title: "Export the permanent file",
      description:
        "Download a vector SVG, PDF or EPS for print and engraving, or a PNG/JPG/WEBP up to 4096px (or a transparent variant), and copy straight to the clipboard. That file works forever.",
    },
  ],

  formats: {
    input: ["Text", "URL", "Wi-Fi", "vCard", "PNG", "SVG"],
    output: ["PNG", "SVG", "PDF", "EPS", "JPG", "WEBP"],
  },

  useCases: [
    {
      audience: "Manufacturer / engraver",
      title: "Codes etched into metal or plastic",
      description:
        "Encode a spec sheet, manual or serial URL directly into the pattern and export a high-contrast vector SVG or EPS to laser-engrave onto a part. A static code has no link to expire, so it stays readable for the product's whole life.",
    },
    {
      audience: "Homeowner / host",
      title: "A guest Wi-Fi code on the wall",
      description:
        "Bake your network name and password into a static Wi-Fi code, style it to match your décor, and print a framed card. No app tracks who joined, and it never stops working. No server sits behind it.",
    },
    {
      audience: "Freelancer / professional",
      title: "A vCard on a card you'll reprint rarely",
      description:
        "Turn your name, phone, email and website into a static vCard code so one scan saves your full contact card. Because it's permanent, the same business-card batch keeps working for years without a subscription.",
    },
    {
      audience: "Publisher / author",
      title: "A code printed in a book or on packaging",
      description:
        "Ink a static code into a print run that can't be recalled, a book, a poster, a product box. With no redirect to maintain, it resolves to the same destination on the first day and the ten-thousandth.",
    },
  ],

  troubleshooting: [
    {
      problem: "I need to change where my printed code points: can I edit a static code?",
      solution:
        "No. A static code's destination is fixed in the pattern and can't be changed after printing. If you might need to re-point it, don't hard-code the final URL: encode a link you control (your own domain path or a self-managed shortener) and change the redirect on your side, or use a hosted dynamic QR code, which trades permanence and privacy for editability.",
    },
    {
      problem: "My styled static code won't scan.",
      solution:
        "Check the live scan-test badge. The usual causes are low contrast (light code on a light background, or an inverted palette), too thin a quiet-zone margin, or a logo covering too much of the code. Raise the contrast, keep a generous margin, shrink the logo, and set error correction to Q or H when using a logo: then re-verify before printing, since you can't fix it afterwards.",
    },
    {
      problem: "The code looks blurry when engraved or printed large.",
      solution:
        "Export a vector format (SVG, PDF or EPS) which scales to any physical size with zero pixelation and is what engravers and print shops prefer. If you must use a raster image, set the size to 2048 or 4096px. A small PNG stretched up will always look soft.",
    },
    {
      problem: "Does a static code work offline?",
      solution:
        "The code itself is fully offline: the phone reads the encoded data straight from the pattern with no network needed. Whether the *result* needs a connection depends on the content: a Wi-Fi, vCard, phone, SMS or plain-text code works with no internet at all, while a URL still needs the phone online to open the page.",
    },
  ],

  tips: [
    "Static codes can't be edited after printing: always run the live scan test at your final style and logo size before you export.",
    "For anything engraved, embossed or printed at large size, export SVG, PDF or EPS so the code stays crisp on any surface.",
    "Encoding a URL you might change later? Point the static code at your own domain (e.g. a /go path) so you can redirect it yourself without reprinting.",
    "Keep a generous quiet-zone margin and a dark-on-light palette: the two things scanners most need to lock onto a permanent code.",
    "Using a centre logo? Set error correction to H and keep the logo under ~25% of the width so the code stays reliably readable for years.",
  ],

  security:
    "Static QR codes have no server, so there is genuinely nothing to upload. Every code is built, styled, rendered, validated and exported entirely in your browser using the canvas and Web APIs on your device. The URLs, Wi-Fi passwords, contact details and payment strings you encode, plus any logo you add, never leave the tab, are never logged, and cannot be tracked, because there is no redirect hop between your code and the phone that scans it. Close the page and everything is gone.",

  faq: [
    {
      question: "What is a static QR code?",
      answer:
        "A static QR code stores its data (a URL, Wi-Fi network, contact card, payment string or plain text) directly inside the black-and-white module pattern. When a phone scans it, it reads that data straight from the image with no intermediary. Because nothing points through a redirect link or a hosted server, a static code is free, private, works offline for offline content, and never expires. The one trade-off is that its destination is fixed once printed.",
    },
    {
      question: "What's the difference between a static and a dynamic QR code?",
      answer:
        "A static code encodes the final data in the pattern itself, permanent, private, no account and no expiry, but you can't change the destination after printing. A dynamic code instead encodes a short redirect URL that lives on a company's server. You can re-point it and see scan analytics later, but that requires a login, a subscription, and trust that the provider keeps the link alive and doesn't track or lose your codes. This tool makes static codes. If you need editable-after-print behaviour without a paid provider, the honest workaround is to encode a link you control and redirect it yourself.",
    },
    {
      question: "Does a static QR code ever expire?",
      answer:
        "No. There is no timer, no trial and no subscription to lapse, because there is no server hosting a redirect. A static code keeps resolving to exactly what you encoded for as long as that destination exists, the pattern you print today reads the same way in ten years. This is why static codes are the right choice for anything permanent, like engravings, packaging, signage or printed books.",
    },
    {
      question: "Can I change where a static QR code points after I've printed it?",
      answer:
        "Not directly. The destination is baked into the pattern, so editing it means generating and printing a new code. If there's any chance you'll need to change it, encode a URL you own (for example a path on your own domain, or a shortener you manage) rather than the final address, then update the redirect on your side. That gives you a permanent code image whose destination you can still control.",
    },
    {
      question: "Are static QR codes tracked?",
      answer:
        "No. A static code has no redirect hop, so no analytics pixel and no third-party company sits between the code and the phone. Nobody counts your scans, records locations or builds a profile. If you specifically want scan analytics, you'd need a dynamic code (which routes every scan through a server) or your own analytics on a URL you control.",
    },
    {
      question: "Is this static QR code generator free, with no watermark or account?",
      answer:
        "Yes. Every code is free, unbranded and unlimited, with no sign-up. Because static codes have no back end to gate behind a paywall, there's no 'pro' tier and nothing to renew. Generate as many permanent codes as you like and keep every exported file.",
    },
    {
      question: "Can I add a logo and colors to a static code?",
      answer:
        "Yes. The studio supports custom dot and finder-eye shapes, color and gradient fills, a transparent background, an adjustable margin and corner radius, and a centred logo with error-correction guidance. QR error correction lets scanners rebuild the modules behind a centred logo, and the live validator warns you the moment a color or logo choice would stop the code scanning: important, since a static code can't be fixed after printing.",
    },
    {
      question: "What format should I export a static code in for printing or engraving?",
      answer:
        "Use a vector format (SVG, PDF or EPS) for anything printed large, engraved or handed to a print shop, since vectors scale to any size with no pixelation. Use PNG (or transparent PNG) for web and screens. If you need a raster file for print, export at 2048–4096px. Note that EPS is a plain vector matrix and won't carry gradients, logos or custom shapes. Use SVG or PDF to preserve a styled design in vector form.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: full static-QR studio: 28 content encoders baked directly into the pattern, dot/eye styling, gradients, transparent background, centre logo with error-correction guidance, live preview and PNG/SVG/PDF/EPS/JPG/WEBP export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added real-time scannability validation (on-canvas jsQR re-decode plus WCAG contrast check) and a clearer static-vs-dynamic explainer with a link to the dynamic generator.",
    },
    {
      date: "2026-06-30",
      change:
        "Added transparent PNG/SVG exports, copy-to-clipboard, and desktop/mobile/dark/print preview modes with zoom.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "vcard-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default staticQrCodeGenerator;
