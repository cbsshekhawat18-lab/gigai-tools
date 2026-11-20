import type { Tool } from "@/types";

/**
 * Business Card QR Code Generator, a flagship, single-purpose micro-site over
 * the QR Studio, locked to the "vcard" content type. It turns a person's contact
 * details (name, title, company, phone, email, website, address) into a scannable
 * QR that phones save straight to Contacts: the "digital business card" you print
 * on a real card, add to an email signature, or stick on a name badge so a single
 * scan replaces a stack of paper cards. Every string is written for the exact
 * queries people search when they want a vCard/contact QR for networking.
 *
 * Honest boundary baked into the copy: the QR encodes a standard vCard 3.0 record
 * locally in the browser. It is a static contact card: the details are baked in,
 * not hosted, so editing your title later means regenerating and reprinting. No
 * account, no upload, no server ever sees your contact information.
 */
const businessCardQrCodeGenerator: Tool = {
  slug: "business-card-qr-code-generator",
  title: "Business Card QR Code Generator",
  description:
    "Turn your contact details into a scannable QR code that saves straight to a phone's Contacts. Add your logo, brand the colors, and download print-ready PNG, SVG or PDF for business cards and badges, 100% in your browser.",
  category: "qr-tools",
  icon: "IdCard",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",
  illustration: "vcard",

  h1: "Business Card QR Code Generator, Your Digital Contact Card",
  tagline:
    "Enter your name, title, company and contact details once and get a vCard QR code that saves to a phone's address book in one scan. Add your logo, match your brand, and print it on business cards, name badges and email signatures: generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Business Card QR Code Generator turns everything on a paper business card (your full name, job title, company, mobile and work phone, email, website and address) into a single scannable QR that iPhones and Android phones read with the built-in camera and offer to save straight to Contacts. No app to install, no typing a phone number off a card, no lost stack of cards in a jacket pocket: someone scans, taps 'Add Contact', and you're in their phone with every field filled in correctly. Fill out the contact form once and the tool builds a standard vCard 3.0 payload (the same `BEGIN:VCARD` format Apple and Google Contacts import natively), then hands it to our desktop-grade QR Studio so it looks like part of your brand rather than a generic black square: custom colors or a gradient, rounded dot and eye styles, your company logo dropped into the centre, a printable frame with a 'Scan to save my details' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough to sit on the back of a business card, a conference badge, a shop window or a slide. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a good-looking code still scans on the first try under real lighting. Because encoding, styling and export all happen locally in your browser, your personal contact details are never sent to a server, stored or logged, there's no account and nothing to sign up for. One honest note: this is a static vCard, so the details are baked into the code. When your title or number changes, regenerate the QR and reprint. The upside is total privacy and a code that keeps working forever with no subscription, no tracking pixel and no link that can expire.",

  ctaText: "Generate Business Card QR Code",

  keywords: [
    "business card qr code generator",
    "contact qr code generator",
    "digital business card qr code",
    "qr code for business card",
    "qr code contact card",
    "add to contacts qr code",
    "networking qr code",
    "qr code business card free",
    "business card qr code with logo",
  ],

  seo: {
    title:
      "Business Card QR Code Generator: vCard, Add to Contacts (Free) | GigAI Tools",
    description:
      "Free business card QR code generator. Enter your name and contact details to make a vCard QR that saves to a phone's Contacts in one scan, add your logo and brand colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, details never uploaded.",
  },

  features: [
    {
      icon: "IdCard",
      title: "One-scan save to Contacts",
      description:
        "Encodes a standard vCard 3.0 record, so a phone camera offers 'Add Contact' with your name, title, phone, email, website and address already filled in. No manual typing, no transcription errors.",
    },
    {
      icon: "UserPlus",
      title: "Every field a card carries",
      description:
        "Full name, job title, company, mobile and work phone, email, website and a full postal address, the whole business card, structured so it imports cleanly into iOS and Android address books.",
    },
    {
      icon: "Palette",
      title: "Match your brand",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to save my details' label so the code looks designed to sit alongside your logo.",
    },
    {
      icon: "Image",
      title: "Drop in your company logo",
      description:
        "Add your company or personal mark to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so the code still scans with a logo in it.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the code hard to scan on a printed card.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, crisp enough for the back of a business card, a lanyard badge, a booth banner or an email signature.",
    },
  ],

  benefits: [
    {
      title: "Never run out of cards",
      description:
        "One printed QR on your card, badge or phone screen replaces a finite stack: everyone you meet scans the same code and saves your details instantly, even after the paper cards are gone.",
    },
    {
      title: "Land in the phone with zero typos",
      description:
        "People rarely type a card into their phone, and when they do they get the number wrong. A scan transfers every field exactly, so your contact is saved correctly the first time and never lost in a drawer.",
    },
    {
      title: "Looks like part of your identity",
      description:
        "With your colors, logo and a framed call-to-action, the code fits a designed business card or slide instead of looking like a bolted-on afterthought. It reads as professional, not generic.",
    },
    {
      title: "Private by design",
      description:
        "Your name, number, email and address are encoded locally in your browser and never leave your device. No account, no upload, no server ever sees your personal contact details.",
    },
  ],

  howTo: [
    {
      title: "Fill in your contact details",
      description:
        "Enter your full name, job title and company, then add the phone, email, website and address you want on the card. Only the name is required: include as much or as little as you like.",
    },
    {
      title: "Brand and add your logo",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan to save my details' frame, then drop your company logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview, then test the on-screen code with your own phone camera, confirm your name and number appear in the 'Add Contact' sheet before you print.",
    },
    {
      title: "Download and print",
      description:
        "Export a high-resolution PNG or PDF for the printer, or an SVG for infinite scaling on large signage. Put it on the back of your card, a name badge, your slides or your email signature.",
    },
  ],

  formats: {
    input: ["Name + contact details (vCard)"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Founder / Salesperson",
      title: "The back of your business card",
      description:
        "Print the QR on the reverse of your card so a prospect scans once and saves your name, company, mobile and email. No chance of the card ending up in a bin with your details never entered.",
    },
    {
      audience: "Conference / Networking",
      title: "Name-badge and lanyard scan",
      description:
        "Add the code to your event badge or lanyard so people you meet on the floor save your full contact in seconds: far faster and more accurate than swapping paper cards in a crowded hall.",
    },
    {
      audience: "Freelancer / Consultant",
      title: "Email signature & portfolio",
      description:
        "Drop the QR into your email signature, invoice footer or portfolio PDF so anyone reading on a phone can add you to their contacts and reach your website with a single scan.",
    },
    {
      audience: "Real estate / Field agent",
      title: "Yard sign & storefront",
      description:
        "Put your contact QR on a for-sale sign, shop window or vehicle wrap so passers-by save your direct line and email instantly, capturing leads who'd never stop to write down a number.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens a website instead of offering to add a contact.",
      solution:
        "Make sure you're on the Business Card (vCard) form and have filled in at least a name: a bare website URL encodes as a link, not a contact. When the vCard payload is present, phones show an 'Add Contact' sheet rather than opening a browser.",
    },
    {
      problem: "Some fields are missing after saving the contact.",
      solution:
        "Only the fields you fill in are encoded. If the phone number or address is blank on the saved contact, add it in the form and regenerate. Enter phone numbers in full international format (e.g. +1 555 123 4567) so they dial correctly from any country.",
    },
    {
      problem: "The code has a lot of tiny squares and is hard to scan.",
      solution:
        "vCards hold more data than a URL, so a full card produces a denser QR. Print it a little larger, keep strong dark-on-light contrast, and let the tool raise error correction, or trim optional fields like the postal address to reduce density.",
    },
    {
      problem: "My name with accents or special characters looks broken.",
      solution:
        "Names with accented letters, commas or semicolons are escaped automatically to the vCard standard, so 'José, García' encodes correctly. Type your name exactly as it should appear and don't pre-escape it yourself.",
    },
  ],

  tips: [
    "Include a website or LinkedIn URL in the contact so a single scan saves your details and gives people a link to learn more.",
    "Add your logo (the tool bumps error correction automatically) so the code carries your brand while staying scannable on a small card.",
    "Keep the QR at least 2 cm × 2 cm on a printed card: denser vCard codes need a little more physical size than a plain URL to scan reliably.",
    "Test the printed card, not just the screen: print one, scan it under the lighting where you'll hand it out, then confirm the contact saves correctly before your print run.",
    "Changing jobs or numbers? Regenerate and reprint, the vCard bakes in whatever details you type now, so keep a copy of your fields to update quickly.",
  ],

  security:
    "Your name, phone numbers, email, website and address are encoded into the QR entirely in your browser as a standard vCard record. They are never uploaded, stored or logged, and there is no account. Remember that the finished QR is a static contact card: it contains the exact details you enter, so anyone who scans the printed code can save them, just like reading them off a paper business card. Only put on the code the information you're comfortable handing to anyone who scans it, and regenerate when your details change.",

  faq: [
    {
      question: "How does a business card QR code work?",
      answer:
        "It stores your contact details in a standard text format called a vCard (starting with 'BEGIN:VCARD'). When a modern phone camera scans it, the operating system recognises that format and offers an 'Add Contact' sheet with your name, title, phone, email, website and address already filled in, so the person saves you to their address book in one tap, with no typing.",
    },
    {
      question: "Is my contact information uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your name, number, email and address are never sent to a server, stored, or logged. There is no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Will the contact save on both iPhone and Android?",
      answer:
        "Yes. iPhones and Android phones with a recent OS read vCard QR codes with the built-in camera app and offer to add the contact directly to Apple Contacts or Google Contacts. On older devices, users can install a QR reader that supports vCards, or read the details the scan reveals as text and add them manually.",
    },
    {
      question: "Which fields should I put on a business card QR?",
      answer:
        "At minimum your name. Then the essentials you'd print on a card, job title, company, mobile phone, email and website. Add a work phone and full address if relevant. Fewer fields make a lighter, easier-to-scan code, so include what matters for how people will reach you and leave out the rest.",
    },
    {
      question: "Can I add my company logo and brand colors?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to save my details' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question:
        "Is the business card QR dynamic: can I update my details later without reprinting?",
      answer:
        "No, and we're honest about that: this is a static vCard that encodes the exact details you type now, because the tool has no server or database to redirect through. If your title, number or email changes, regenerate the code and reprint. The upside is total privacy and a code that never expires. Nothing is hosted, tracked or able to break.",
    },
    {
      question: "Why is my vCard QR code so dense compared to a URL one?",
      answer:
        "A vCard packs many fields (name, title, company, phones, email, website, address) so it holds far more data than a single link, which makes the QR pattern denser. That's normal. To keep it scannable, print it a bit larger, keep strong contrast, and trim optional fields you don't need.",
    },
    {
      question: "Is it really free with no signup?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many business card QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: locked vCard contact form (name, title, company, phone, work phone, email, website, address, note), standard vCard 3.0 payload with automatic character escaping, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added company-logo drop-in with automatic error-correction bump, a 'Scan to save my details' frame with a custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved handling of accented names and special characters, added guidance on QR density for full vCards, and clearer troubleshooting for saving contacts on older phones.",
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

export default businessCardQrCodeGenerator;
