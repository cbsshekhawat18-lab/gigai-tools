import type { Tool } from "@/types";

/**
 * UPI QR Code Generator: a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "upi" content type). It turns a UPI ID (VPA), payee
 * name and an optional fixed amount and note into a scannable `upi://pay` QR
 * that any Indian UPI app, Google Pay, PhonePe, Paytm, BHIM, Amazon Pay and
 * every bank app: opens straight to the payment screen. Every string here is
 * written for the exact queries Indian sellers, freelancers, NGOs and shop
 * owners search when they want a printed "Scan & Pay" code for a counter,
 * invoice, market stall or donation card.
 *
 * Honest boundary baked into the copy: we generate the STANDARD UPI intent
 * string locally in your browser. There is no bank integration, no merchant
 * onboarding and no settlement. Money flows through the payer's own UPI app
 * directly to your UPI ID, exactly as if they typed it in. This is a personal /
 * P2P collect QR, not a merchant QR issued by a payment aggregator.
 */
const upiQrCodeGenerator: Tool = {
  slug: "upi-qr-code-generator",
  title: "UPI QR Code Generator",
  description:
    "Create a Scan & Pay UPI QR code from your UPI ID, name and an optional amount: works with Google Pay, PhonePe, Paytm, BHIM and every bank app. Brand it, add a logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "IndianRupee",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",
  illustration: "upi",

  h1: "UPI QR Code Generator: Scan & Pay in Seconds",
  tagline:
    "Enter your UPI ID and name once and get a QR code that any UPI app scans to pay you instantly: add a fixed amount for a set price, or leave it open for customers to type. Brand it, add your logo, and print it for your shop, invoice or stall. Generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI UPI QR Code Generator turns your UPI ID into a single scannable code that opens the payment screen inside Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, WhatsApp Pay and every UPI-enabled bank app in India. Your customer points their camera, the app auto-fills your VPA and payee name, they enter (or confirm) the amount, and the money lands in your account. No reading out a UPI ID over a noisy counter, no wrong-digit failures, no fumbling with account numbers and IFSC. Enter your UPI ID / VPA (like yourname@okhdfcbank), your display name so payers see who they're paying, and optionally lock a fixed amount (₹499 for a product, a class fee, a donation) or leave it open so buyers type whatever they owe. You can even add a note that pre-fills the payment message (order number, table number, cause). The tool builds the exact standard `upi://pay?pa=…&pn=…&am=…&cu=INR&tn=…` intent string, then hands it to our desktop-grade QR Studio so it looks like yours: custom colors or a gradient, rounded dot and eye styles, your shop or brand logo in the centre, a printable frame with a 'Scan & Pay' or '₹ UPI Accepted' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so the pretty code still scans on the first try under harsh shop lighting. Because every step (encoding, styling and export) runs locally in your browser, your UPI ID is never sent to a server, stored or logged, and there is no signup. Be clear on what this is: a standard personal UPI collect QR that routes money through the payer's own app directly to your UPI ID. It is not a merchant QR provisioned by a payment aggregator, there is no bank integration or settlement layer here, and no transaction ever touches GigAI.",

  ctaText: "Generate UPI QR Code",

  keywords: [
    "upi qr code generator",
    "upi qr code",
    "scan and pay qr code",
    "create upi qr code",
    "upi qr code with amount",
    "generate upi payment qr",
    "qr code for upi payment",
    "google pay phonepe qr code",
    "bhim upi qr code",
    "upi id to qr code",
    "upi qr code for shop",
    "free upi qr code generator with logo",
  ],

  seo: {
    title: "UPI QR Code Generator, Scan & Pay QR from Your UPI ID (Free) | GigAI Tools",
    description:
      "Free UPI QR code generator. Turn your UPI ID (VPA) and name into a Scan & Pay QR, optional fixed amount and note, that works with Google Pay, PhonePe, Paytm & BHIM. Add a logo and download print-ready PNG, SVG or PDF. Runs 100% in your browser.",
  },

  features: [
    {
      icon: "IndianRupee",
      title: "Works with every UPI app",
      description:
        "Encodes the standard upi://pay intent, so scanning opens the pay screen in Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, WhatsApp Pay and all bank apps, your VPA and name pre-filled, no typing.",
    },
    {
      icon: "Calculator",
      title: "Fixed or open amount",
      description:
        "Lock a set price (₹499, a fee, a donation) so payers just confirm, or leave the amount blank so customers enter whatever they owe. Add a currency (INR by default) and a pre-filled payment note.",
    },
    {
      icon: "Palette",
      title: "Brand it to match your shop",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan & Pay' label so the code looks like your storefront, not a generic square.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add your shop, brand or the UPI mark to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so it still scans reliably.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the code hard to scan at a busy counter.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for a counter sticker, standee, invoice, visiting card or shop window.",
    },
  ],

  benefits: [
    {
      title: "Get paid without a POS machine",
      description:
        "No card terminal, no monthly rental, no merchant account to onboard. Print one code and start accepting UPI payments straight into your existing bank account today.",
    },
    {
      title: "Zero wrong-number failures",
      description:
        "Reading a UPI ID aloud across a loud counter invites typos and failed transfers. A QR carries the exact VPA every time, so payments land in the right account on the first tap.",
    },
    {
      title: "Faster queues, fewer questions",
      description:
        "A fixed-amount code means customers just scan and confirm (no asking 'what's your number?', no re-entering the amount) which clears lines at stalls, tuck shops and events fast.",
    },
    {
      title: "Private by design",
      description:
        "Your UPI ID is encoded locally in your browser and never leaves your device. No account, no upload, no server ever sees your VPA. Close the tab and nothing is stored.",
    },
  ],

  howTo: [
    {
      title: "Enter your UPI ID and name",
      description:
        "Type your UPI ID / VPA exactly as it appears in your app (for example yourname@okhdfcbank) and the payee name customers should see. Double-check the handle after the @. It routes the money.",
    },
    {
      title: "Set an amount (optional)",
      description:
        "Leave the amount blank for an open code where buyers type what they owe, or enter a fixed amount to lock a price. Add a note like an order number, table or cause to pre-fill the payment message.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan & Pay' frame, and drop your shop or brand logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans, then download",
      description:
        "Watch the live scannability badge, test the on-screen code with your own UPI app, then export a high-resolution PNG or PDF for print, or an SVG for infinite scaling.",
    },
  ],

  formats: {
    input: ["UPI ID (VPA) + payee name + optional amount & note"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Shop / Kirana / Café",
      title: "Counter Scan & Pay standee",
      description:
        "Print a branded open-amount code for the counter so customers pay by scanning. No card machine, no reading out your number, and it clears the queue during a rush.",
    },
    {
      audience: "Freelancer / Small business",
      title: "Fixed-amount invoice QR",
      description:
        "Drop a fixed-amount UPI code onto your invoice or WhatsApp message so a client scans and pays the exact figure in one tap. No bank transfer forms, no IFSC, no delays.",
    },
    {
      audience: "NGO / Temple / Fundraiser",
      title: "Donation collection card",
      description:
        "Put a 'Scan to Donate' code on posters, boxes and pamphlets with an optional suggested amount and a cause note, so supporters give instantly from any UPI app.",
    },
    {
      audience: "Market stall / Event",
      title: "Per-item price codes",
      description:
        "Generate a set of fixed-amount codes for common prices and stick one beside each item or on the tally board, so festival, exhibition and pop-up buyers scan the exact amount.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning shows an error or the wrong payee.",
      solution:
        "Re-check the UPI ID / VPA character by character, the handle after the @ (okhdfcbank, ybl, paytm, oksbi, etc.) must match your app exactly. One wrong letter routes to a different or non-existent account. Copy-paste it from your UPI app rather than typing it.",
    },
    {
      problem: "The amount isn't pre-filling in the payer's app.",
      solution:
        "Some UPI apps intentionally ignore a QR-encoded amount for personal (P2P) VPAs and let the payer type it, as a fraud-prevention measure. That's app behaviour, not a bad code: the payer can simply enter the amount. Merchant QRs from a payment provider are what enforce fixed amounts.",
    },
    {
      problem: "The code scans but no UPI app opens.",
      solution:
        "Native UPI QR handling needs a UPI-enabled app installed and a phone with an active UPI account. A generic web QR reader may just show the upi://pay text. Scan from inside a UPI app (or the camera app on a phone that has one), and make sure at least one bank is linked.",
    },
    {
      problem: "Symbols in my note look broken.",
      solution:
        "The payee name and note are URL-encoded to the UPI standard automatically, so spaces, &, # and Indian-language characters encode correctly. Type them normally: don't pre-encode them yourself, and keep the note short so it fits the payment message field.",
    },
  ],

  tips: [
    "Copy your UPI ID straight from your app (Google Pay, PhonePe, BHIM) and paste it here. It removes any chance of a typo in the handle that would misroute payments.",
    "Leave the amount blank for a shop counter so one code works for every purchase. Use a fixed amount only for a single price, a fee or a set donation.",
    "Bump error correction to Q or H (or add a logo: the tool does this for you) so the code still scans after a scuff, a fingerprint or a coffee ring on a printed sticker.",
    "Keep strong contrast: a dark code on a plain light background scans far faster under fluorescent shop lighting than pale-on-pale or a code over a busy photo.",
    "Print a small test sticker and scan it with two or three different UPI apps under your actual counter lighting before ordering a big batch of standees.",
  ],

  security:
    "Your UPI ID, name, amount and note are encoded into the QR entirely in your browser using the standard upi://pay format. They are never uploaded, stored or logged, and there is no account. Understand what the finished QR is: a standard personal UPI collect code that routes money through the payer's own app directly to your UPI ID. There is no bank integration, merchant onboarding or settlement layer here, and no transaction ever passes through GigAI. Because a UPI ID is designed to be shared publicly to receive money, printing this code is safe, but only display codes you generated for accounts you control, and treat any request to scan someone else's 'collect' code with caution, since scanning to pay sends money out.",

  faq: [
    {
      question: "How does a UPI QR code work?",
      answer:
        "The code stores your UPI ID (VPA), payee name and optional amount in the standard upi://pay text format. When a UPI app scans it, the app recognises that format and opens its payment screen with your details pre-filled, so the payer just confirms and pays, with no chance of mistyping your UPI ID.",
    },
    {
      question: "Which apps can scan the UPI QR code I generate?",
      answer:
        "Any UPI-enabled app in India: Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, WhatsApp Pay and virtually every bank's own app. Because it's the standard UPI intent, it isn't tied to one app: whoever scans it pays from whatever UPI app they already use.",
    },
    {
      question: "Is my UPI ID uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your UPI ID, name, amount and note are never sent to a server, stored, or logged. There is no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Can I set a fixed amount, or should I leave it open?",
      answer:
        "Both work. Enter a fixed amount to lock a single price, fee or donation so payers just confirm. Leave it blank for a shop counter so one code accepts any amount and the customer types what they owe. Note that some UPI apps let payers edit or re-enter the amount on personal QRs as a safety measure.",
    },
    {
      question: "Is this a merchant QR, and do you take any transaction fee?",
      answer:
        "No on both counts, and we're honest about it: this is a standard personal / P2P UPI collect QR that sends money straight to your UPI ID through the payer's own app. It is not a merchant QR issued by a payment aggregator, there's no bank integration or settlement here, and GigAI never touches the money or charges a fee. For high volumes you may want a proper merchant UPI account from your bank or a PSP for reconciliation and settlement.",
    },
    {
      question: "Can I add my shop logo and brand colors?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan & Pay' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Do I need to register or onboard as a merchant to use this?",
      answer:
        "No. If you already have any UPI ID linked to your bank account, you can receive money with this QR immediately. No KYC with us, no signup, no onboarding. You're simply sharing your existing UPI ID in scannable form, exactly like giving someone your UPI handle to pay you.",
    },
    {
      question: "What resolution should I export for printing?",
      answer:
        "For a counter sticker, standee or invoice, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For anything that may be resized, like a large standee or shop window decal, use the SVG export, which is vector and stays razor-sharp at any size.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: locked UPI content form (UPI ID / VPA, payee name, optional amount and note), standard upi://pay intent with automatic URL-encoding, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan & Pay' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check tuned for harsh shop lighting.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer P2P vs merchant guidance, INR-default currency handling and improved troubleshooting for apps that let payers re-enter the amount on personal QRs.",
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

export default upiQrCodeGenerator;
