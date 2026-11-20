import type { Tool } from "@/types";

/**
 * Payment QR Code Generator: a flagship, single-purpose micro-site over the QR
 * Studio, built around a three-way payment-method selector: UPI, PayPal.me or
 * Bitcoin. Pick one method, fill only that method's fields, and get a scannable
 * "scan to pay" QR whose payload is the exact, standard string each wallet
 * expects (`upi://pay?…`, a `paypal.me/…` link, or a BIP-21 `bitcoin:…` URI).
 *
 * Every string here is written for the queries people search when they want to
 * *collect* money with a code, a market stall's UPI code, a freelancer's
 * PayPal.me link on an invoice, or a donation address on a stream overlay.
 *
 * Honest boundary baked into the copy: this is a STATIC payment QR generated in
 * the browser. It encodes the payee details (VPA / PayPal handle / BTC address)
 * you type; it does not process, hold, confirm or track a single payment, and
 * nothing is uploaded. Money always moves inside the payer's own banking, PayPal
 * or wallet app; the QR just pre-fills who to pay.
 */
const paymentQrCodeGenerator: Tool = {
  slug: "payment-qr-code-generator",
  title: "Payment QR Code Generator",
  description:
    "Get paid with a scannable QR code. Pick UPI, PayPal.me or Bitcoin, enter your payee details and an optional amount, then download a print-ready PNG, SVG or PDF. Encoded locally in your browser. Nothing is uploaded and no payment is ever processed by us.",
  category: "qr-tools",
  icon: "CreditCard",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "upi",

  h1: "Payment QR Code Generator, UPI, PayPal & Bitcoin",
  tagline:
    "One tool, three ways to get paid. Choose UPI, PayPal.me or Bitcoin, type your handle or address and an optional amount, and get a branded scan-to-pay QR your customers open straight in their own banking, PayPal or wallet app. Styled, verified-scannable and exported print-ready: all in your browser, with no account and nothing uploaded.",
  longDescription:
    "The GigAI Payment QR Code Generator turns 'how do I take payment?' into a single scannable square. Start by picking how you want to be paid: UPI (India's instant bank-to-bank rails), PayPal.me (a shareable PayPal payment link used worldwide), or Bitcoin (an on-chain wallet address), and the tool shows only the fields that method needs. For UPI, enter your VPA (like name@bank), your display name and an optional amount and note. The tool builds the standard `upi://pay?pa=…&pn=…&am=…` string that Google Pay, PhonePe, Paytm, BHIM and every UPI app open directly to a pre-filled payment screen. For PayPal, enter your paypal.me username and an optional amount and currency, and it builds your `paypal.me/you/25USD` link. For Bitcoin, paste your wallet address and an optional amount, label and message, and it produces a BIP-21 `bitcoin:` URI that opens the payer's wallet with the address (and amount) already filled in. Whichever you pick, the payload is handed to our desktop-grade QR Studio: brand it with your colors or a gradient, rounded dot and eye styles, your business logo in the centre, and a printable 'Scan to pay' frame, then export a crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px for a counter sign, invoice, table tent or stream overlay. A live scannability check watches contrast, quiet-zone and logo coverage so the pretty code still scans on the first tap. Everything (building the payment string, styling, validating and exporting) happens locally in your browser, so your VPA, PayPal handle or wallet address is never uploaded, stored or logged. Be clear on what this is: a static payment QR that pre-fills the payee. It never touches, holds, confirms or reports the money, the payer's own app moves the funds, and you confirm receipt in your bank, PayPal or wallet as usual.",

  ctaText: "Generate Payment QR Code",

  keywords: [
    "payment qr code generator",
    "paypal qr code",
    "bitcoin qr code generator",
    "scan to pay qr code",
    "qr code to receive payment",
    "paypal me qr code",
    "crypto payment qr code",
    "donation qr code",
    "qr code for payment free",
    "business payment qr code",
  ],

  seo: {
    title:
      "Payment QR Code Generator, UPI, PayPal & Bitcoin Scan-to-Pay (Free) | GigAI Tools",
    description:
      "Free payment QR code generator. Pick UPI, PayPal.me or Bitcoin, enter your payee details and amount, brand it, and download print-ready PNG, SVG or PDF. Runs 100% in your browser. No signup, no payment processed, nothing uploaded.",
  },

  features: [
    {
      icon: "Wallet",
      title: "Three payment methods, one tool",
      description:
        "Switch between UPI, PayPal.me and Bitcoin with a tap. Each shows only its own fields and builds the exact payload wallets expect. No juggling three separate single-purpose generators.",
    },
    {
      icon: "IndianRupee",
      title: "UPI with a pre-filled amount",
      description:
        "Encode your VPA, display name, amount and note into the standard upi://pay string, so Google Pay, PhonePe, Paytm and BHIM open straight to a payment screen with your details already in.",
    },
    {
      icon: "Bitcoin",
      title: "BIP-21 Bitcoin URIs",
      description:
        "Paste your BTC address plus an optional amount, label and message. The tool builds a standard bitcoin: URI so the payer's wallet opens with the address (and amount) already filled in.",
    },
    {
      icon: "Palette",
      title: "Brand it to your counter",
      description:
        "Custom colors or a gradient, rounded dot and eye styles, your business logo in the centre and a printable 'Scan to pay' frame so the code looks like part of your shopfront, not a generic square.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning the instant a choice would make the payment code hard for a phone to scan.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp enough for a counter sign, an invoice, a table tent or a stream overlay.",
    },
  ],

  benefits: [
    {
      title: "Get paid in one scan",
      description:
        "Customers point their camera and their own banking, PayPal or wallet app opens to a pre-filled payment. No reading out a VPA, spelling a PayPal handle, or copy-pasting a 34-character Bitcoin address by hand.",
    },
    {
      title: "Zero typos on the payee",
      description:
        "A mistyped UPI ID or wallet address sends money to the wrong place, sometimes irreversibly. The QR carries the exact string you verify once, so every payer hits the same correct destination.",
    },
    {
      title: "Looks like your business",
      description:
        "With your colors, logo and a framed 'Scan to pay' call-to-action, the code fits a shop counter, an invoice footer or a market stall instead of looking like a black-and-white afterthought.",
    },
    {
      title: "Private, and we never touch the money",
      description:
        "Your payee details are encoded locally in your browser and never uploaded. We don't process, hold or see any payment, funds move entirely inside the payer's own app, exactly as if they'd typed your details.",
    },
  ],

  howTo: [
    {
      title: "Choose your payment method",
      description:
        "Pick UPI, PayPal.me or Bitcoin at the top. The form instantly shows only the fields that method needs, so you never fill in anything irrelevant.",
    },
    {
      title: "Enter your payee details",
      description:
        "Type your UPI VPA and name, your paypal.me username, or your Bitcoin address: plus an optional amount. Double-check it, because the QR encodes exactly what you type.",
    },
    {
      title: "Brand and verify",
      description:
        "Open the Design tab for colors, dot/eye styles, a 'Scan to pay' frame and your logo. Watch the live scannability badge and test the on-screen code with your own phone.",
    },
    {
      title: "Download and display",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, then place it on your counter, invoice, table tent or stream overlay where payers will see it.",
    },
  ],

  formats: {
    input: ["UPI VPA", "PayPal.me handle", "Bitcoin address"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Shop / Market stall",
      title: "Counter 'Scan to Pay' UPI code",
      description:
        "Print a branded UPI code for the till so customers pay by scanning with any UPI app. No card machine fees, no reading your VPA aloud, and it works even when the line is long.",
    },
    {
      audience: "Freelancer / Invoice",
      title: "PayPal.me on every invoice",
      description:
        "Drop a PayPal.me QR (optionally with the invoice amount pre-filled) into your invoice footer so clients pay in one scan instead of hunting for your PayPal email.",
    },
    {
      audience: "Creator / Streamer",
      title: "Bitcoin donation overlay",
      description:
        "Turn your wallet address into a clean, on-brand Bitcoin QR for a stream overlay or tip jar, so supporters send BTC without copy-pasting a long address from chat.",
    },
    {
      audience: "Event / Fundraiser",
      title: "Donation code on the poster",
      description:
        "Add a UPI or PayPal donation QR to flyers and posters so attendees give on the spot with their phone, instead of finding an ATM or your banking details.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning the UPI code doesn't open a payment app.",
      solution:
        "UPI QR codes are opened by UPI apps (Google Pay, PhonePe, Paytm, BHIM), not always by the plain camera, scan from inside the app's 'Scan QR' if the camera does nothing. Also confirm your VPA is in the correct name@bank format. A typo there produces a code no app will accept.",
    },
    {
      problem: "The amount I set isn't showing in the payer's app.",
      solution:
        "A pre-filled amount is a request, and some apps (especially for PayPal and certain UPI apps) let the payer edit or ignore it, or only honour it for verified-merchant VPAs. Treat the amount as a convenience, always confirm the received sum in your own app, and leave it blank if you want the payer to enter it.",
    },
    {
      problem: "My Bitcoin QR opens the wallet but the address looks off.",
      solution:
        "Paste the full address exactly, with no spaces or line breaks, and check it starts with a valid prefix (1, 3 or bc1). The tool encodes precisely what you enter. It can't validate that an address is yours, so verify it against your wallet before you print and share the code.",
    },
    {
      problem: "The styled payment code won't scan reliably.",
      solution:
        "Watch the live scannability badge. The usual culprits are low contrast, too small a quiet-zone margin, or a logo covering too much of the code. Keep a dark code on a light background, keep the margin, shrink the logo, and set error correction to Q or H when adding a logo.",
    },
  ],

  tips: [
    "Verify your VPA, PayPal handle or Bitcoin address by scanning your own finished code and checking the payment screen before you print, the QR carries exactly what you typed, mistakes included.",
    "Leave the amount blank for a reusable code (a counter sign or tip jar) and set an amount only for a specific one-off request like a single invoice.",
    "Add your logo and set error correction to Q or H so the code still scans after it picks up a scuff or a coffee ring on a printed counter card.",
    "Keep strong contrast: a dark code on a light background scans far more reliably than pale-on-pale or a busy photo behind it.",
    "For anything printed, export SVG or PDF, vectors stay razor-sharp from a small invoice footer up to a large window decal.",
  ],

  security:
    "Your payment details (UPI VPA, PayPal.me handle or Bitcoin address, plus any amount or note) are encoded into the QR entirely in your browser, and never uploaded, stored or logged. There is no account. Crucially, we never process, hold, route, confirm or track any payment: the QR only pre-fills who to pay, and the money moves entirely inside the payer's own banking, PayPal or wallet app. Because the code is static, anyone who scans it can start a payment to that payee, so treat a printed payment QR like your published payment details: display it where you intend people to pay you, and always confirm receipts in your own bank, PayPal or wallet.",

  faq: [
    {
      question: "How does a payment QR code work?",
      answer:
        "It stores your payee details in the exact format the payer's app understands, a upi://pay string for UPI, a paypal.me link for PayPal, or a bitcoin: URI for Bitcoin. When someone scans it, their banking, PayPal or wallet app opens with your details (and any amount) already filled in, so they just confirm and send. The QR only starts the payment. It doesn't move the money itself.",
    },
    {
      question: "Does GigAI process or take a cut of the payment?",
      answer:
        "No. We never touch the money. This tool only generates a static QR that encodes your payee details locally in your browser. The actual payment happens entirely inside the payer's own UPI, PayPal or Bitcoin app, straight to you. There is no GigAI account, no middleman, no fee and no payment data sent to us.",
    },
    {
      question: "Can I set a fixed amount in the payment QR?",
      answer:
        "Yes, for all three methods, enter an optional amount (and currency for PayPal) and it's encoded into the code. Be aware that a pre-filled amount is a request the payer can sometimes edit, and some apps only lock the amount for verified merchants. For a reusable code like a counter sign or tip jar, leave the amount blank and let the payer enter it.",
    },
    {
      question: "Which UPI apps will scan this code?",
      answer:
        "Any standard UPI app (Google Pay, PhonePe, Paytm, BHIM, Amazon Pay and bank apps) because the tool encodes the official upi://pay format. Scan it from the app's built-in 'Scan QR' option. Some phone cameras open UPI links directly, but scanning inside the app is the most reliable.",
    },
    {
      question: "Is my Bitcoin address or UPI ID uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your VPA, PayPal handle and Bitcoin address are never sent to a server, stored or logged, and there's no account. Close the tab and nothing remains.",
    },
    {
      question: "Can I change the amount or payee later without reprinting?",
      answer:
        "No, and we're honest about it: this is a static QR that encodes exactly what you type now, because the tool has no server or database to redirect through. If your VPA, PayPal handle, wallet address or the amount changes, regenerate the code and reprint it. The upside is total privacy. Nothing is hosted, tracked or able to expire.",
    },
    {
      question: "Can I add my logo and brand colors to a payment QR?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to pay' frame, and drop your business logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is it really free with no signup?",
      answer:
        "Yes. No account, no watermark, no expiry and no limit: generate, brand and download as many payment QR codes as you like. Because it all runs client-side with no payment processing, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, three-way payment-method selector (UPI, PayPal.me, Bitcoin) with per-method forms, standard upi://pay, paypal.me and BIP-21 bitcoin: payloads, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-25",
      change:
        "Added logo drop-in with automatic error-correction bump, a 'Scan to pay' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer honesty guidance on pre-filled amounts across apps, added method-specific troubleshooting, and improved Bitcoin address and UPI VPA input hints.",
    },
  ],

  relatedTools: [
    "upi-qr-code-generator",
    "qr-code-generator",
    "wifi-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default paymentQrCodeGenerator;
