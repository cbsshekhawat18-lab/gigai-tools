import type { Tool } from "@/types";

/**
 * Phone QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "phone" content type). It turns a phone number into a
 * scannable `tel:` QR: point a camera, tap the banner, and the dialler opens
 * with the number pre-filled: one tap to call, no reading digits aloud or
 * mistyping an area code. Every string here targets the exact queries people
 * search when they want a "scan to call" code for a business card, storefront
 * window, flyer, van wrap, real-estate sign or support poster.
 *
 * Honest boundary baked into the copy: the QR encodes a static `tel:+…` string
 * locally in the browser. It opens the dialler pre-filled; it does not auto-
 * place the call, and it can't be re-pointed to a new number after printing
 * (regenerate to change it). Nothing is uploaded.
 */
const phoneQrCodeGenerator: Tool = {
  slug: "phone-qr-code-generator",
  title: "Phone QR Code Generator",
  description:
    "Turn any phone number into a scan-to-call QR code. Customers point their camera, tap once, and your number is dialling. No typos, no reading digits aloud. Brand it, add a logo, and export print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "Phone",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",
  illustration: "phone",

  h1: "Phone QR Code Generator: Scan to Call in One Tap",
  tagline:
    "Enter a phone number in full international format and get a QR code that opens the dialler pre-filled with a single scan. Brand it with your colors and logo, verify it scans, and print it on cards, windows, flyers and signs: generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Phone QR Code Generator turns a phone number into a scannable `tel:` code that iPhone and Android cameras recognise natively: point, tap the 'Call' prompt, and the phone opens its dialler with your number already typed: the caller just hits the green button. No squinting at a flyer, no fat-fingering a digit, no losing a lead because someone gave up copying the number. Type the number in full international format (country code included, e.g. +1 555 123 4567), and the tool builds the exact standard `tel:+15551234567` payload that dialers understand, stripping spaces, dashes and brackets so it works on every device. Then make it yours in our desktop-grade QR Studio: custom foreground and background colors or a gradient, rounded dot and eye styles, your company logo dropped in the centre, a printable frame with a 'Scan to call' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so the code still scans on the first try under real-world lighting. Because every step (encoding, styling, validating and exporting) happens locally in your browser, the number you enter is never sent to a server, stored or logged. Being honest about the limits: this is a static QR that encodes the exact number you type. Scanning opens the dialler pre-filled but does not automatically place the call (the user confirms), and you can't re-point a printed code to a new number, if your number changes, regenerate and reprint.",

  ctaText: "Generate Phone QR Code",

  keywords: [
    "phone qr code generator",
    "phone number qr code",
    "scan to call qr code",
    "qr code for phone number",
    "call qr code",
    "tel qr code",
    "click to call qr code",
    "qr code phone number free",
    "business phone qr code",
    "phone qr code with logo",
    "printable phone qr code",
    "dial qr code",
  ],

  seo: {
    title:
      "Phone QR Code Generator: Scan to Call, Free & No Signup (PNG/SVG/PDF) | GigAI Tools",
    description:
      "Free phone QR code generator. Enter a phone number to make a scan-to-call QR that opens the dialler pre-filled, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser: number never uploaded.",
  },

  features: [
    {
      icon: "Phone",
      title: "One-tap scan-to-call",
      description:
        "Encodes the standard tel: payload phone cameras read natively, so scanning shows a 'Call this number?' prompt with the dialler pre-filled. No reading digits aloud, no fat-fingered area codes, no lost leads.",
    },
    {
      icon: "Globe",
      title: "International-format aware",
      description:
        "Type the number with its country code and the tool strips spaces, dashes and brackets to build a clean tel:+ string that dials correctly whether the scanner is in the next town or another country.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground and background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to call' label so the code looks designed into your card or signage, not stuck on as an afterthought.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add your business logo to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so the code stays reliably scannable with your mark on top.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator runs an actual decode on the rendered pixels plus a WCAG contrast test, warning you the instant a color, logo size or margin choice would make the code hard for a phone to read.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for a business card, storefront window decal, flyer, poster or vehicle wrap.",
    },
  ],

  benefits: [
    {
      title: "Callers dial in one tap",
      description:
        "Put the code on a card, window or flyer and prospects reach you by pointing their camera. No manually typing a ten-digit number, no transcription errors, no giving up halfway.",
    },
    {
      title: "Zero misdials on your number",
      description:
        "A QR transfers the exact digits, so nobody drops a number, swaps two figures or misses the country code and rings a stranger: every scan lands on you.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed 'Scan to call' prompt, the code fits a polished business card or shopfront instead of looking like a generic black-and-white square.",
    },
    {
      title: "Private by design",
      description:
        "The number is encoded locally in your browser and never leaves your device. No account, no upload, no server that ever sees the phone number you're publishing.",
    },
  ],

  howTo: [
    {
      title: "Enter the phone number",
      description:
        "Type the number in full international format with its country code (for example +1 555 123 4567). Spaces, dashes and brackets are fine, the tool cleans them into a valid tel: string.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan to call' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans and dials",
      description:
        "Watch the live scannability badge, then test the on-screen code with your own phone: confirm it opens the dialler pre-filled with the right number before you commit to a print run.",
    },
    {
      title: "Download and place it",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, and put it where people decide to call: a card, a window, a flyer, a service van or a support poster.",
    },
  ],

  formats: {
    input: ["Phone number (international format)"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Small business / trades",
      title: "Scan-to-call on the shopfront",
      description:
        "Put a 'Scan to call' code on the window, the van or a flyer so a plumber, salon or takeaway gets an instant tap-to-dial from anyone walking past after hours.",
    },
    {
      audience: "Sales / networking",
      title: "Business card that dials you",
      description:
        "Add the code to your card so a new contact saves a call to you in one tap during a busy event. No reading your number back digit by digit across a loud room.",
    },
    {
      audience: "Real estate / auto",
      title: "Yard signs and window stickers",
      description:
        "Print the agent's or dealer's number as a scan-to-call code on a for-sale board or a car windscreen sticker so a passer-by rings the listing the moment they're interested.",
    },
    {
      audience: "Support / reception",
      title: "One-tap helpline poster",
      description:
        "Post a scan-to-call code by a lift, kiosk or reception desk so visitors reach the front desk, security or a support line without hunting for the right extension.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning shows the number but doesn't offer to call.",
      solution:
        "Use the phone's built-in camera app, which recognises tel: codes and shows a 'Call' prompt, some third-party scanners only display the text. If it still won't, confirm the number includes the country code so the OS treats it as a valid dialable number.",
    },
    {
      problem: "The dialler opens with the wrong or partial number.",
      solution:
        "Enter the full international format with the country code (e.g. +1 for the US/Canada, +44 for the UK). Don't include extensions or letters: 'x123' or a vanity number like 1-800-FLOWERS won't dial. Type the digits the extension resolves to instead.",
    },
    {
      problem: "It opens the dialler but never actually rings.",
      solution:
        "That's expected: a tel: QR pre-fills the number and waits for the user to tap the call button. It can't and shouldn't auto-place a call. The scan gets them one tap away. They confirm the call themselves.",
    },
    {
      problem: "My styled or logo'd phone code won't scan.",
      solution:
        "Check the live scan-test badge. Keep strong dark-on-light contrast, a clear quiet-zone margin, and a logo under about 25% of the width, and set error correction to Q or H: the tool bumps it automatically when you add a logo.",
    },
  ],

  tips: [
    "Always include the country code (+1, +44, +91…) so the code dials correctly for scanners anywhere, not just locals.",
    "Pair a 'Scan to call' frame label with the visible number in print, so people who don't scan can still read and dial it.",
    "Bump error correction to Q or H (or add a logo: the tool does it for you) so the code still scans through a scuff or a coffee ring on a printed card.",
    "Keep strong contrast: a dark code on a light background scans far more reliably than pale-on-pale or a code sitting on a busy photo.",
    "Test the printed code under the actual lighting where it'll live (a window in daylight, a dim reception wall) before you run the full batch.",
  ],

  security:
    "The phone number you enter is encoded into the QR entirely in your browser using the standard tel: format. It is never uploaded, stored or logged, and there is no account. Remember the finished QR is static and public: it contains the exact number you type, so anyone who scans the printed code can call it, exactly like reading the number off a sign (only faster and typo-free). Publish it where you're happy to receive calls, and regenerate the code if your number ever changes.",

  faq: [
    {
      question: "How does a phone-number QR code work?",
      answer:
        "It stores your number in a standard 'tel:' text format (for example tel:+15551234567). When a modern phone camera scans it, the operating system recognises that format and shows a one-tap prompt that opens the dialler with your number already filled in: the person just taps the call button, with no chance of a mistyped digit.",
    },
    {
      question: "Does scanning the QR code call the number automatically?",
      answer:
        "No, and that's by design. Scanning opens the phone's dialler pre-filled with your number and waits for the user to tap 'Call'. A QR code can't (and for safety shouldn't) place a call on its own. It just removes the typing so the person is a single tap away from ringing you.",
    },
    {
      question: "What format should I enter the phone number in?",
      answer:
        "Enter it in full international format with the country code, like +1 555 123 4567 or +44 20 7946 0958. You can include spaces, dashes or brackets for readability, the tool strips them and builds a clean tel:+ string. Including the country code ensures the code dials correctly for someone scanning from anywhere, not only local callers.",
    },
    {
      question: "Will it work on both iPhone and Android?",
      answer:
        "Yes. Recent iPhones and Android phones read tel: QR codes with the built-in camera app and show a 'Call' prompt. If a particular scanner only shows the number as text rather than a call button, switch to the phone's native camera app, which handles tel: codes directly.",
    },
    {
      question: "Can I add my logo and brand colors to the phone QR?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to call' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code scanning, and it automatically raises error correction when you add a logo.",
    },
    {
      question: "Can I add an extension or a vanity number like 1-800-FLOWERS?",
      answer:
        "Enter only dialable digits. Letters in a vanity number won't dial, so type the numeric equivalent instead. Extensions ('x123') aren't reliably supported by dialers from a tel: code, encode the direct number where possible, or use a text QR that shows the extension for the caller to enter after connecting.",
    },
    {
      question: "Is the phone QR code dynamic: can I change the number later without reprinting?",
      answer:
        "No, and we're upfront about it: this is a static QR that encodes the exact number you type now, because the tool has no server or database to redirect through. If your number changes, regenerate the code and reprint it. The trade-off is total privacy: nothing is hosted, tracked or editable after the fact.",
    },
    {
      question: "Is it really free with no signup?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many phone QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, locked phone content form with international-format input, automatic cleaning to a valid tel:+ payload, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to call' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer guidance on country codes, extensions and vanity numbers, plus improved troubleshooting for scanners that show the number as text instead of a call prompt.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "vcard-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default phoneQrCodeGenerator;
