import type { Tool } from "@/types";

/**
 * vCard QR Code Generator: a flagship, single-purpose micro-site over the QR
 * Studio, locked to the "vcard" content type. It turns a full contact card -
 * name, job title, organization, phone(s), email, website and postal address -
 * into a single scannable QR that saves straight into a phone's address book.
 * One scan, "Add Contact", done: no typing a number off a business card, no
 * lost paper, no wrong digit.
 *
 * Every string here is written for the exact queries people search when they
 * want a contact / business-card QR: "vcard qr code generator", "qr code for
 * business card", "save contact qr code". Honest boundary baked in: this builds
 * a standard vCard 3.0 payload locally in the browser. It is a static contact
 * card (the details are encoded into the pattern), nothing is uploaded, and it
 * is not a re-editable dynamic code.
 */
const vcardQrCodeGenerator: Tool = {
  slug: "vcard-qr-code-generator",
  title: "vCard QR Code Generator",
  description:
    "Turn your name, title, phone, email, website and address into a vCard QR code that saves to a phone's contacts in one scan. Brand it, add a logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "Contact",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",
  illustration: "vcard",

  h1: "vCard QR Code Generator. Save Your Contact in One Scan",
  tagline:
    "Fill in your contact card once and get a QR code that drops your name, title, phone, email, website and address straight into any phone's address book. Brand it with your logo and colors, then print it on business cards, badges, email signatures and storefronts: generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI vCard QR Code Generator turns a business card into a single scan. Enter your details: first and last name, job title, company, mobile and work phone, email, website and full postal address, and the tool assembles a standard vCard 3.0 payload that iPhones and Android phones recognise natively: point the camera, tap the banner, choose 'Create New Contact', and every field lands in the address book pre-filled, correctly labelled, with zero typing. No more squinting at a card to key in a phone number, no transposed digits, no business card that gets thrown away. Once the data's in, make the code yours with our desktop-grade QR Studio: custom colors or a gradient, rounded dot and eye styles, your company logo dropped into the centre, a printable frame with a 'Scan to save my contact' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for a business card, a conference badge, a name-tag, an email signature or a shop window. A live scannability check watches contrast, quiet-zone and logo coverage as you design, and an on-canvas re-decode proves the finished code actually scans before you order a print run. Because every step (building the vCard, styling, rendering and exporting) happens locally in your browser, your name, number and address are never sent to a server, stored or logged, and there's no account. This is a static contact card: the details are encoded into the pattern itself, so it keeps working forever and reveals exactly what you typed to anyone who scans it. No tracking, no redirect, no expiry.",

  ctaText: "Create vCard QR Code",

  keywords: [
    "vcard qr code generator",
    "contact qr code",
    "business card qr code",
    "save contact qr code",
    "vcard qr code",
    "qr code contact information",
    "qr code for contact details",
    "create vcard qr code free",
    "vcard qr code with logo",
    "scan to save contact qr code",
  ],

  seo: {
    title:
      "vCard QR Code Generator, Scan to Save Contact (Free, No Signup) | GigAI Tools",
    description:
      "Free vCard QR code generator. Enter your name, title, phone, email, website and address to make a scan-to-save contact QR, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Contact",
      title: "One scan saves the whole card",
      description:
        "Encodes a standard vCard 3.0 that phone cameras read natively, so scanning shows an 'Add Contact' prompt with your name, title, numbers, email, website and address already filled in. No manual typing.",
    },
    {
      icon: "Phone",
      title: "Every contact field, labelled right",
      description:
        "Separate mobile and work phone, email, website and a full postal address (street, city, state, ZIP, country) all land in the correct address-book fields with the correct TYPE labels.",
    },
    {
      icon: "Palette",
      title: "Match your brand",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to save my contact' label so the code looks like part of your business card, not a generic square.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add a company logo to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so the code stays scannable with your mark on top.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator runs an actual jsQR decode on the rendered pixels plus a WCAG contrast test as you design, warning you the instant a color, logo size or long address would make the code hard to scan.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sized for a business card, badge, name-tag, email signature or window decal.",
    },
  ],

  benefits: [
    {
      title: "No more typing numbers off a card",
      description:
        "A scan drops your entire contact into someone's phone in seconds (correct number, correct spelling, correct email) so nobody keys in a wrong digit or loses your paper card in a drawer.",
    },
    {
      title: "One card that never runs out",
      description:
        "Add the QR to your business card, badge or email signature and share your full details an unlimited number of times without reprinting or handing over a physical card.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed call-to-action, the code fits your business card and collateral instead of looking like a black-and-white afterthought stuck in the corner.",
    },
    {
      title: "Private by design",
      description:
        "Your name, phone and address are encoded locally in your browser and never leave your device. No account, no upload, no server ever sees your contact details.",
    },
  ],

  howTo: [
    {
      title: "Fill in your contact card",
      description:
        "Enter your name and job title, your company, mobile and work phone, email and website, and your postal address. Only a name is required: add as much or as little as you like.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan to save my contact' frame, and drop your company logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview. Test the on-screen code with your own phone camera and confirm every field imports correctly before you print.",
    },
    {
      title: "Download and share",
      description:
        "Export a high-resolution PNG or PDF for a business card or badge, or an SVG for infinite scaling, and add it to your card, signature, badge or storefront.",
    },
  ],

  formats: {
    input: ["Contact details (name, phone, email, address)"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Sales / Networking",
      title: "QR on the business card",
      description:
        "Print the vCard code on the back of your business card so a new contact saves your full details with one scan at an event. No typing, and your card never ends up unsaved in a bin.",
    },
    {
      audience: "Conference / Event",
      title: "Badges and name-tags",
      description:
        "Put each speaker's or attendee's vCard QR on their badge so a quick scan swaps complete contact details instantly, faster and more accurate than a handshake and a business-card exchange.",
    },
    {
      audience: "Freelancer / Consultant",
      title: "Email signature & website",
      description:
        "Add the QR to your email signature or contact page so anyone can save your name, number and website to their phone in one tap, straight from the screen.",
    },
    {
      audience: "Shopfront / Reception",
      title: "Storefront contact card",
      description:
        "Display the code at your reception, on the door or on a poster so visitors and passers-by save your business's phone, email and address without writing anything down.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens a link or plain text instead of a contact card.",
      solution:
        "Make sure you're on the vCard content type (this tool locks to it) and that at least a name is filled in. A valid vCard payload begins with 'BEGIN:VCARD': if your scanner shows raw text, it isn't vCard-aware. Use the phone's built-in camera app, which recognises contacts natively.",
    },
    {
      problem: "Some fields are missing after I save the contact.",
      solution:
        "Only fields you filled in are encoded: leave a box blank and it's simply omitted. Also check phone and email formatting: enter the full number (with country code for international use) and a complete email address so the phone maps them to the right fields.",
    },
    {
      problem: "My code got dense and hard to scan.",
      solution:
        "A vCard with a long address, two phone numbers and a note holds a lot of data, so the pattern gets busy. Export at a larger size (1024px+), keep a generous quiet-zone margin and strong contrast, and trim optional fields like the note if you don't need them.",
    },
    {
      problem: "The address shows up on one line or in the wrong order.",
      solution:
        "Fill the separate street, city, state, ZIP and country boxes rather than cramming everything into one: the tool assembles them into the standard vCard address block so phones parse each part into the right field.",
    },
  ],

  tips: [
    "Include the country code on your phone number (e.g. +1, +91) so the saved contact works when someone dials you from abroad.",
    "Adding a logo or lots of fields? Bump error correction to Q or H (the tool does this for you with a logo) so the denser code still scans after printing.",
    "Keep strong contrast: a dark code on a light background scans far more reliably than pale-on-pale or a code sitting on a busy photo.",
    "Print a test card and scan it under real lighting before ordering a full run, a code that scans on screen can behave differently on matte or glossy card stock.",
    "Only fill the fields you want public. Every box you leave blank is left out of the QR, so you control exactly what a scan reveals.",
  ],

  security:
    "Your contact details are turned into a standard vCard 3.0 code entirely in your browser. They are never uploaded, stored or logged, and there is no account. Remember that the finished QR is a static contact card: it contains the real name, number, email and address you enter, so anyone who scans the printed code can save them, exactly like reading a business card. Only fill in the fields you're happy to share publicly, and place the printed code where you intend it to be seen.",

  faq: [
    {
      question: "What is a vCard QR code and how does it work?",
      answer:
        "A vCard QR code stores your contact details (name, title, phone, email, website and address) in a standard text format called vCard (starting with 'BEGIN:VCARD'). When a modern phone camera scans it, the operating system recognises that format and offers to create a new contact with every field already filled in, so the person saves your whole card with one tap instead of typing it.",
    },
    {
      question: "Will the contact save on both iPhone and Android?",
      answer:
        "Yes. iPhones and Android phones read vCard QR codes with the built-in camera app and offer an 'Add Contact' / 'Create New Contact' prompt with your details pre-filled. On older phones or third-party scanners that only show raw text, the person can still read the details and save them manually.",
    },
    {
      question: "Which contact fields can I include?",
      answer:
        "First and last name, a display name, job title, organization, a mobile phone and a separate work phone, email, website, a full postal address (street, city, state, ZIP, country) and a note. Only a name is required. Every other field is optional and is left out of the code if you leave it blank.",
    },
    {
      question: "Can I add my company logo and brand colors?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to save my contact' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code scanning, and it raises error correction automatically when you add a logo.",
    },
    {
      question: "Is my contact information uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your name, phone, email and address are never sent to a server, stored or logged. There is no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Can I edit the contact details later without reprinting the code?",
      answer:
        "No, and we're honest about that: this is a static vCard QR that encodes the exact details you type now, because the tool has no server or database to redirect through. If your number, email or job changes, regenerate the code and reprint it. The upside is total privacy and no expiry. Nothing is hosted or tracked, and the code works forever.",
    },
    {
      question: "Why did my vCard QR code get so dense?",
      answer:
        "vCard codes hold a lot of text (a name, title, company, two phone numbers, email, website and a full address add up) so the pattern becomes finer than a short URL code. That's normal. Export at 1024px or higher, keep a generous quiet-zone margin and strong contrast, and drop any optional fields you don't need to keep it comfortably scannable.",
    },
    {
      question: "What resolution should I export for a business card?",
      answer:
        "For a business card, badge or name-tag, export a PNG or PDF at 1024px or higher. The tool goes up to 4096px. For anything that may be resized (signage, large prints, or hand-off to a print shop), use the SVG or PDF export, which is vector and stays razor-sharp at any size.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, locked vCard content form (name, title, org, mobile & work phone, email, website, full postal address, note), standard vCard 3.0 payload, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to save my contact' frame with custom label, and the real-time jsQR re-decode + WCAG contrast scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved address-block assembly and special-character escaping for names and notes, plus clearer guidance for dense multi-field cards.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "upi-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default vcardQrCodeGenerator;
