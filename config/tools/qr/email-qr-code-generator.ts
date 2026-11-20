import type { Tool } from "@/types";

/**
 * Email QR Code Generator: a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "email" content type). It turns a recipient address, a
 * subject and a message body into a scannable QR that opens a phone's mail app
 * with everything pre-filled, the person just taps Send. Every string here is
 * written for the exact queries people search when they want a "scan to email
 * us" code for a flyer, a business card, a support poster or a feedback form.
 *
 * Honest boundary baked into the copy: the QR encodes a standard `mailto:`
 * link (address + optional subject + body) locally in the browser. It composes
 * a draft in whatever mail app the scanner uses. It does NOT send the email
 * itself, and nothing is uploaded, hosted or tracked.
 */
const emailQrCodeGenerator: Tool = {
  slug: "email-qr-code-generator",
  title: "Email QR Code Generator",
  description:
    "Create a scannable QR code that opens a pre-filled email, recipient, subject and message ready to send. Style it, add a logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "Mail",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",
  illustration: "email",

  h1: "Email QR Code Generator, Scan to Compose an Email",
  tagline:
    "Enter an address, a subject and a message once and get a QR code that opens a ready-to-send email draft in the scanner's mail app. Brand it, add your logo, and print it on flyers, cards and posters, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Email QR Code Generator turns a `mailto:` link into a single scannable code so people reach your inbox without typing your address, guessing the spelling, or forgetting what to write. Enter the recipient email, an optional subject line and a pre-written message body (for a support desk, a job application, a feedback request or a simple 'say hello') and the tool builds the exact standard `mailto:you@example.com?subject=…&body=…` payload that phone cameras understand. Scan it and the phone opens its native mail app (Apple Mail, Gmail, Outlook) with the To, Subject and Body fields already filled in. The person just reviews and taps Send. From there our desktop-grade QR Studio makes it look like yours: custom colors or a gradient, rounded dot and eye styles, your company logo dropped into the centre, a printable frame with a 'Scan to email us' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a beautiful code still scans on the first try. Because encoding, styling and export all happen locally in your browser, nothing about your address or message is sent to a server, stored or logged, and to be completely honest, the QR composes a draft in the scanner's mail app, it does not send the email for them, so they stay in control of what actually goes out.",

  ctaText: "Generate Email QR Code",

  keywords: [
    "email qr code generator",
    "email qr code",
    "qr code for email",
    "mailto qr code",
    "generate email qr code",
    "scan to email qr code",
    "qr code that opens email",
    "email address qr code",
    "create email qr code free",
    "email qr code with logo",
    "printable email qr code",
    "contact us qr code",
  ],

  seo: {
    title: "Email QR Code Generator, Scan to Compose an Email (Free, No Signup) | GigAI Tools",
    description:
      "Free email QR code generator. Enter an address, subject and message to make a scan-to-email (mailto) QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser: nothing uploaded.",
  },

  features: [
    {
      icon: "Mail",
      title: "Pre-fill the whole email",
      description:
        "Encode the recipient, a subject line and a full message body. Scanning opens a ready-to-send draft in the phone's mail app, the person just reviews and taps Send.",
    },
    {
      icon: "ScanLine",
      title: "Native scan-to-compose",
      description:
        "Uses the standard mailto: format phone cameras read directly, so a scan launches Apple Mail, Gmail or Outlook with your fields filled. No app to install, no typing your address.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to email us' label so the code looks designed, not generic.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add a company or team logo to the centre with adjustable size and a protected quiet zone: the tool auto-recommends higher error correction so it still scans cleanly.",
    },
    {
      icon: "ShieldCheck",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the code hard to scan.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp enough for a business card, flyer, poster or window decal.",
    },
  ],

  benefits: [
    {
      title: "No mistyped addresses",
      description:
        "Long or unusual email addresses get misspelled constantly. A QR transfers the exact string, so messages actually reach your inbox instead of bouncing off a typo.",
    },
    {
      title: "Fewer, better-formatted replies",
      description:
        "Pre-fill the subject and body ('Support request', 'Job application: [role]', 'Event RSVP') and every message arrives labelled and structured, so you triage faster.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed call-to-action, the code fits your business card, flyer or storefront instead of looking like a black-and-white afterthought.",
    },
    {
      title: "Private by design",
      description:
        "Your address and message are encoded locally in your browser and never leave your device. No account, no upload, and no server ever sees or tracks who scans it.",
    },
  ],

  howTo: [
    {
      title: "Enter the email details",
      description:
        "Type the recipient address, then add an optional subject line and a pre-written message body. Leave subject and body blank for a plain 'open a blank email to this address' code.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan to email us' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans and composes",
      description:
        "Watch the live scannability badge, then test the on-screen code with your own phone camera: confirm your mail app opens with the To, Subject and Body pre-filled.",
    },
    {
      title: "Download and print",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, and place it where people will see it: a card, a flyer, a support poster or a checkout counter.",
    },
  ],

  formats: {
    input: ["Recipient email + optional subject + body"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Support / Help desk",
      title: "Scan-to-email support",
      description:
        "Put a code on packaging, a receipt or a poster with subject 'Support request' pre-filled, so customers reach the right inbox with a labelled message instead of hunting for your address.",
    },
    {
      audience: "Business card / Networking",
      title: "One-tap 'email me'",
      description:
        "Add an email QR to your card or badge so a new contact scans it and lands in a draft addressed to you. No re-typing an address they'll get wrong half the time.",
    },
    {
      audience: "Events / RSVP",
      title: "RSVP and enquiries",
      description:
        "Print a code on invitations or signage with subject 'RSVP, [event]' so guests reply from their phone in seconds, and every response arrives pre-tagged for easy counting.",
    },
    {
      audience: "Recruiting / Jobs",
      title: "Apply-by-email posters",
      description:
        "Add a code to a 'We're hiring' flyer with subject 'Application: [role]' pre-set, so candidates open a correctly-addressed email and you can filter applications at a glance.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning opens a website search instead of an email.",
      solution:
        "That happens when a scanner app doesn't recognise mailto:. Use the phone's built-in camera app, which handles mailto: natively and offers to open your mail app. Make sure a default mail app (Gmail, Apple Mail, Outlook) is installed and set.",
    },
    {
      problem: "The subject or body text looks broken or cut off.",
      solution:
        "Special characters, line breaks and spaces are URL-encoded automatically to the mailto: standard, so type your subject and body normally: don't pre-encode them. Very long bodies increase QR density, so keep the message concise for the most reliable scan.",
    },
    {
      problem: "The email opens but nothing is pre-filled.",
      solution:
        "A few older mail clients ignore the subject/body parameters of a mailto: link and only honour the address. The recipient will always be correct. If pre-fill matters, keep the message short and test on the mail apps your audience actually uses.",
    },
    {
      problem: "It composes a draft but never sends automatically.",
      solution:
        "That's intentional and unavoidable: a QR can only open a pre-filled draft. It cannot send an email on someone's behalf. The scanner reviews the message and taps Send, which also keeps them in control of what leaves their account.",
    },
  ],

  tips: [
    "Pre-fill a clear subject line (like 'Support request' or 'RSVP') so incoming mail is self-labelling and easy to filter or auto-route.",
    "Keep the message body short. A long pre-written body makes the QR denser and harder to scan from a distance or on a small print.",
    "Bump error correction to Q or H (or add a logo: the tool does this for you) so the code still scans after a scuff, fold or coffee ring on printed material.",
    "Maintain strong contrast: a dark code on a light background scans far more reliably than pale-on-pale or a busy photo behind it.",
    "Test the printed code, not just the screen. Print one, scan it under the actual lighting where it'll live, then run the full batch.",
  ],

  security:
    "Your recipient address, subject and message are encoded into the QR entirely in your browser using the standard mailto: format. They are never uploaded, stored or logged, and there is no account. The finished QR is a static link: it opens a pre-filled draft in the scanner's own mail app but never sends anything automatically, so the person always reviews and taps Send themselves. Because the address is embedded in the code, anyone who scans it can email that inbox, which is exactly the point for a public 'contact us' code, but worth noting before you print one for a private address.",

  faq: [
    {
      question: "How does an email QR code work?",
      answer:
        "The code stores a standard mailto: link containing your email address and, optionally, a subject and message body. When a modern phone camera scans it, the operating system recognises the mailto: format and opens the phone's mail app with the To, Subject and Body already filled in, the person just reviews and taps Send.",
    },
    {
      question: "Does scanning the code actually send the email?",
      answer:
        "No, and we're honest about that: a QR code can only open a pre-filled draft in the scanner's mail app. It cannot send an email on someone else's behalf. The scanner reviews the message and presses Send themselves. That's a feature as much as a limit: they stay in full control of what actually leaves their account.",
    },
    {
      question: "Can I pre-fill the subject and message body?",
      answer:
        "Yes. Enter a subject line and a message body and both are encoded into the mailto: link, so the draft opens ready to send with your text in place. You can also leave them blank for a code that simply opens a new, empty email addressed to you.",
    },
    {
      question: "Is my email address or message uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your address, subject and body are never sent to a server, stored, or logged: there's no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Will this work on both iPhone and Android?",
      answer:
        "Yes. iPhones and Android phones read mailto: QR codes with the built-in camera app and open the default mail app with your fields pre-filled, as long as a mail app (Apple Mail, Gmail, Outlook) is installed and set as the default. No extra scanner app is required.",
    },
    {
      question: "Can I add my logo and brand colors to the email QR?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to email us' frame, and drop your logo into the centre from the Logo tab. The live scannability check ensures your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is the email QR code dynamic. Can I change the address later without reprinting?",
      answer:
        "No, and we're upfront about it: this is a static QR that encodes the exact address and message you type now, because the tool has no server or database to redirect through. If you change the address, regenerate the code and reprint it. The upside is total privacy. Nothing is hosted, tracked or trackable.",
    },
    {
      question: "What resolution should I export for printing?",
      answer:
        "For a business card, flyer or poster, export a PNG or PDF at 1024px or higher. The tool goes up to 4096px. For anything that may be resized (large signage, banners), use the SVG export, which is vector and stays razor-sharp at any size.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: locked email content form (recipient, subject, message body), standard mailto: payload with automatic URL-encoding of subject and body, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to email us' frame with a custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer guidance on mailto: client support (pre-fill quirks on older mail apps) and improved troubleshooting for scanners that don't natively handle email links.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "vcard-qr-code-generator",
    "wifi-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default emailQrCodeGenerator;
