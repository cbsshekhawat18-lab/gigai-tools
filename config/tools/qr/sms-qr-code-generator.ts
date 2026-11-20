import type { Tool } from "@/types";

/**
 * SMS QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "sms" content type). It turns a phone number plus a
 * pre-written message into a scannable code that opens the phone's Messages app
 * with both the recipient and the text already filled in, the customer only
 * has to hit send. Every string here targets the exact queries people search
 * when they want a "text us" QR for a flyer, receipt, packaging insert, event
 * sign or contest keyword campaign.
 *
 * Honest boundary baked into the copy: the QR encodes a standard `SMSTO:` URI
 * (number + prefilled body) locally in the browser. It PRE-FILLS the message -
 * it never sends automatically, cannot verify the number is reachable, and
 * carries no message-cost or shortcode magic. It is a static code: the number
 * and text are fixed until you regenerate.
 */
const smsQrCodeGenerator: Tool = {
  slug: "sms-qr-code-generator",
  title: "SMS QR Code Generator",
  description:
    "Create a scannable SMS QR code that opens the texting app with your number and a pre-written message ready to send. Style it, add a logo, and download print-ready PNG, SVG or PDF: 100% in your browser.",
  category: "qr-tools",
  icon: "MessageSquare",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",
  illustration: "sms",

  h1: "SMS QR Code Generator, Text Us in One Tap",
  tagline:
    "Enter a phone number and a ready-made message, and get a QR code that opens the phone's Messages app with both already filled in, the person just taps send. Brand it, add your logo, and print it for flyers, receipts, packaging and event signs, generated entirely in your browser and never uploaded.",
  longDescription:
    "The GigAI SMS QR Code Generator turns a phone number and a pre-written text into a single scannable code that starts a conversation on the first tap. Someone points their camera at the code, and their phone's native Messages app opens with your number in the 'To' field and your message already typed in the body. All they do is press send. No dictating a number, no spelling out a keyword, no 'text OFFERS to 12345' that people fat-finger. Enter the destination number (in full international format for reliability), write the message you want pre-filled, a lead like 'JOIN', a support opener like 'I need help with order #', a review nudge, an RSVP, or an appointment request, and the tool builds the exact standard `SMSTO:number:message` payload that phone cameras and QR readers understand. Then it hands the code to our desktop-grade QR Studio so it looks like yours: custom colors or a gradient, rounded dot and eye styles, your brand logo dropped in the centre, a printable frame with a 'Text us to…' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF, or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so the code still scans on the first try under real-world lighting. Because encoding, styling and export all happen locally in your browser, nothing about your number or message is ever sent to a server, stored, or logged: there's no account and nothing to sign up for. Two honest notes we build into the design: the code pre-fills the message but never sends it (the person always taps send, which is exactly what keeps it compliant and spam-free), and it's a static code. The number and text are baked in until you regenerate and reprint.",

  ctaText: "Generate SMS QR Code",

  keywords: [
    "sms qr code generator",
    "text message qr code",
    "qr code for text message",
    "sms qr code",
    "generate sms qr code",
    "prefilled sms qr code",
    "text us qr code",
    "smsto qr code",
    "qr code with phone number and message",
    "create sms qr code free",
    "sms qr code with logo",
    "printable sms qr code",
  ],

  seo: {
    title: "SMS QR Code Generator, Pre-Filled Text Message QR (Free, No Signup) | GigAI Tools",
    description:
      "Free SMS QR code generator. Enter a phone number and a pre-written message to make a scan-to-text QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "MessageSquare",
      title: "Opens Messages, message ready",
      description:
        "Encodes the standard SMSTO: payload phone cameras read, so scanning opens the native texting app with your number in 'To' and your text pre-filled in the body, the person just hits send.",
    },
    {
      icon: "Phone",
      title: "Number + custom message",
      description:
        "Set the destination number in full international format for reliability, then write exactly the message you want pre-filled: a keyword, a support opener, an RSVP, or a review request.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Text us' label so the code looks designed, not like a default black square.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add your brand logo to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so the code still scans with art in the middle.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the moment a choice would make the code hard to scan.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp enough for a flyer, receipt footer, packaging insert, poster or window decal.",
    },
  ],

  benefits: [
    {
      title: "Start conversations in one tap",
      description:
        "Instead of 'text KEYWORD to 55555', people point their camera and the message is already written. You remove every step where a lead mistypes a number or forgets the keyword and drops off.",
    },
    {
      title: "Consent-friendly by design",
      description:
        "The QR pre-fills the text but never sends it, the person taps send themselves, so the very first message is theirs. That opt-in-first flow is exactly what keeps SMS marketing clean and compliant.",
    },
    {
      title: "Route texts where you want them",
      description:
        "Pre-seed the body with an order number, a campaign tag or a support code so inbound texts land pre-labelled and your team knows which flyer, product or event each reply came from.",
    },
    {
      title: "Private by design",
      description:
        "Your number and message are encoded locally in your browser and never leave your device. No account, no upload, no server ever sees the number or the text you pre-fill.",
    },
  ],

  howTo: [
    {
      title: "Enter number and message",
      description:
        "Type the destination phone number in full international format (for example +1 555 123 4567), then write the message you want pre-filled in the recipient's texting app.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Text us' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview. Test the on-screen code with your own phone camera and confirm the number and pre-filled text look right before printing.",
    },
    {
      title: "Download and place it",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, then put it on the flyer, receipt, package or sign where you want people to text you.",
    },
  ],

  formats: {
    input: ["Phone number + message text"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Retail / Marketing",
      title: "Text-to-join lead capture",
      description:
        "Print a 'Scan to text JOIN' code on flyers, receipts and packaging so shoppers opt into your SMS list themselves. No keyword to remember, no shortcode to mistype, and the first message is theirs.",
    },
    {
      audience: "Support / Service",
      title: "Scan-to-text support line",
      description:
        "Put a code on the product, the box or the manual that pre-fills 'I need help with order #' so customers reach the right queue instantly instead of hunting for a number or a chat widget.",
    },
    {
      audience: "Events / Hospitality",
      title: "RSVP and info-by-text",
      description:
        "Add a code to invitations, table signs or posters that pre-fills an RSVP or an 'INFO' request, so guests confirm or ask questions by text without typing anything but send.",
    },
    {
      audience: "Local business",
      title: "Reviews & appointment requests",
      description:
        "Drop a code on the counter or receipt that pre-fills a review link request or a 'Book me in' text, turning a happy moment into a reply while the customer is still standing there.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning opens the camera but nothing happens for the SMS.",
      solution:
        "Some default camera apps don't act on SMSTO: links, the user may need to tap the on-screen prompt, or use a QR reader. Always include a short 'Text us at …' line beside the code as a fallback so people can text manually.",
    },
    {
      problem: "The message app opens but the text isn't pre-filled.",
      solution:
        "A few phones open the number without the body, or truncate long messages. Keep the pre-filled text short and essential (a keyword or one line), and remember some carriers/OS combinations only reliably pre-fill the recipient, not the body.",
    },
    {
      problem: "The number doesn't work when someone scans it.",
      solution:
        "Use full international format with the country code and no spaces or brackets in the raw number (for example +15551234567). Local formats like (555) 123-4567 can fail for scanners outside your country.",
    },
    {
      problem: "The code looks great but won't scan.",
      solution:
        "A logo, low contrast or a tight margin can break scanning. Keep a dark code on a light background, leave the quiet-zone margin, and raise error correction to Q or H (the tool does this automatically when you add a logo).",
    },
  ],

  tips: [
    "Keep the pre-filled message short, a keyword or one clear line. Long bodies get truncated on some phones and are slower to read on a printed sign.",
    "Always print a plain-text 'or text us at +1 555…' line next to the code so anyone whose camera ignores SMS links can still reach you.",
    "Seed the message with a campaign tag (like 'FLYER-A' or an order code) so you can tell which sign, product or ad each inbound text came from.",
    "Because the recipient taps send, the first message is their opt-in: a clean, consent-first way to grow an SMS list without buying numbers.",
    "Test the printed code under the real lighting where it will live, then run the batch, a screen scan doesn't always match paper.",
  ],

  security:
    "Your phone number and message are encoded into the QR entirely in your browser using the standard SMSTO: format. They are never uploaded, stored or logged, and there is no account. Two honest points: the code pre-fills the message but never sends it (the person who scans always taps send themselves), and it is a static code. The number and text are fixed until you regenerate and reprint. Anyone who scans a printed code can see the destination number, so only publish a number you're happy to share.",

  faq: [
    {
      question: "What does an SMS QR code actually do when scanned?",
      answer:
        "It opens the phone's native Messages app with your number already in the recipient field and your pre-written message already typed into the body. The person just taps send. It stores this as a standard 'SMSTO:number:message' text that phone cameras and QR readers recognise.",
    },
    {
      question: "Does the SMS QR code send the text automatically?",
      answer:
        "No, and that's intentional. It only pre-fills the message. The person who scans always presses send themselves. That opt-in-first behaviour is what keeps SMS use compliant and spam-free, and it's why phones open the app rather than firing a text silently.",
    },
    {
      question: "How should I format the phone number?",
      answer:
        "Use full international format with the country code and no spaces or punctuation in the underlying number, for example +15551234567. Local formats such as (555) 123-4567 can fail when the code is scanned by a phone set to another country, so international format is the safest choice.",
    },
    {
      question: "Will the pre-filled message always show up?",
      answer:
        "On most modern iPhones and Android phones, yes: both the recipient and the message body pre-fill. A minority of phones or carriers only fill the recipient, or truncate very long bodies, so keep the pre-filled text short and always print a plain 'text us at …' line as a fallback.",
    },
    {
      question: "Is my number or message uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your number and message are never sent to a server, stored, or logged. There is no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Can I change the number or message later without reprinting?",
      answer:
        "No, and we're honest about that: this is a static QR that encodes the exact number and text you enter now, because the tool has no server or database to redirect through. If you change either, regenerate the code and reprint it. The upside is total privacy. Nothing is hosted or tracked.",
    },
    {
      question: "Can I add my logo and brand colors to the SMS QR?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Text us' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is it really free with no signup?",
      answer:
        "Yes. There's no account, no watermark and no limit: generate, brand and download as many SMS QR codes as you like. Because it all runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: locked SMS content form (phone number + pre-filled message), standard SMSTO: payload, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Text us' frame with a custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-07-01",
      change:
        "Clearer guidance on international number format and message-length limits, plus troubleshooting for phones that pre-fill only the recipient.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "whatsapp-qr-code-generator",
    "phone-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default smsQrCodeGenerator;
