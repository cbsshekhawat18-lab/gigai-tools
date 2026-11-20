import type { Tool } from "@/types";

/**
 * WhatsApp QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "whatsapp" content type). It turns an international phone
 * number and an optional pre-written first message into a scannable code that
 * opens a WhatsApp chat with you already addressed. No saving a contact, no
 * typing a number, no wondering what to say first. Every string here is written
 * for the exact queries people search when they want a "click to chat" QR for a
 * shop counter, a flyer, a business card, an Instagram bio or a support page.
 *
 * Honest boundary baked into the copy: the QR encodes a standard `https://wa.me/`
 * click-to-chat link built entirely in the browser. It is a static link. It
 * carries whatever number and message you type now, opens WhatsApp for the
 * scanner (they still tap send), and nothing is uploaded, hosted or tracked.
 */
const whatsappQrCodeGenerator: Tool = {
  slug: "whatsapp-qr-code-generator",
  title: "WhatsApp QR Code Generator",
  description:
    "Turn your phone number and a ready-to-send message into a QR code that opens a WhatsApp chat instantly. Brand it, add a logo, and download print-ready PNG, SVG or PDF: 100% in your browser.",
  category: "qr-tools",
  icon: "MessageCircle",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "whatsapp",

  h1: "WhatsApp QR Code Generator: Scan to Start a Chat",
  tagline:
    "Enter your number and a pre-filled message once, and get a QR that opens WhatsApp with your chat ready to send. Brand it, add your logo, and print it for shop counters, flyers, packaging and business cards, built entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI WhatsApp QR Code Generator turns your business number into a one-scan doorway to a conversation. Instead of a customer saving your contact, opening WhatsApp, searching, and staring at an empty message box, they point their camera, tap the banner, and land in a chat that is already addressed to you: with an optional opening message like 'Hi, I'd like to book a table' or 'I saw your flyer, tell me more' pre-typed so they only have to hit send. Enter your number in full international format (country code, no plus, no spaces), write the message you want pre-filled, and the tool builds the exact standard `https://wa.me/<number>?text=<message>` click-to-chat link that WhatsApp recognises on every phone. Then it hands that link to our desktop-grade QR Studio so the code looks like your brand, not a generic black square: custom colors or a gradient, rounded dot and eye styles, your logo dropped into the centre, a printable frame with a 'Message us on WhatsApp' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage while you design, so a good-looking code still scans on the first try. Because encoding, styling and export all happen locally in your browser, nothing about your number, your message or your design is ever sent to a server, stored or logged. There is no account and no tracking. Be clear on what it is: a static link. The scanner still taps send, and if you change your number you regenerate and reprint the code, but in exchange you get complete privacy and a code that works forever with no subscription.",

  ctaText: "Generate WhatsApp QR Code",

  keywords: [
    "whatsapp qr code generator",
    "whatsapp qr code",
    "qr code for whatsapp",
    "click to chat qr code",
    "wa.me qr code",
    "whatsapp business qr code",
    "generate whatsapp qr code",
    "whatsapp link qr code",
    "scan to chat whatsapp",
    "whatsapp qr code with message",
    "whatsapp qr code with logo",
    "free whatsapp qr code",
  ],

  seo: {
    title:
      "WhatsApp QR Code Generator: Scan to Chat (Free, No Signup) | GigAI Tools",
    description:
      "Free WhatsApp QR code generator. Turn your number and a pre-filled message into a scan-to-chat QR, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "MessageCircle",
      title: "Scan straight into a chat",
      description:
        "Encodes the standard wa.me click-to-chat link phone cameras open natively, so scanning drops the customer into a WhatsApp conversation already addressed to your number. No saving a contact first.",
    },
    {
      icon: "MessageSquare",
      title: "Pre-fill the first message",
      description:
        "Seed the conversation with a ready-to-send opener like 'Hi, I'd like to order' so scanners only tap send. You get qualified, on-topic messages instead of a blank 'hey'.",
    },
    {
      icon: "Globe",
      title: "Any country, one format",
      description:
        "Works with any WhatsApp number worldwide. Enter it in full international format (country code first, no plus or spaces) and the link resolves for scanners anywhere on the planet.",
    },
    {
      icon: "Palette",
      title: "Match your brand",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Message us on WhatsApp' label so the code looks designed, not generic.",
    },
    {
      icon: "Image",
      title: "Add your logo",
      description:
        "Drop a shop, brand or WhatsApp-green logo into the centre with adjustable size and a protected quiet zone, the tool auto-raises error correction so the code still scans.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp enough for a counter sign, flyer, packaging insert, business card or window decal.",
    },
  ],

  benefits: [
    {
      title: "Remove every step before a message",
      description:
        "No dictating a number, no 'save my contact then text me', no hunting through WhatsApp. One scan and the customer is in a chat with you, which is the difference between an enquiry and a missed one.",
    },
    {
      title: "Start conversations on your terms",
      description:
        "A pre-filled opener frames what people ask ('Book a table', 'Track my order', 'Get a quote') so replies land in the right context and your team answers faster.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed call-to-action, the code fits your packaging, menu or storefront instead of looking like a stock black-and-white square stuck on as an afterthought.",
    },
    {
      title: "Private and free forever",
      description:
        "Your number and message are encoded locally in your browser and never leave your device. No account, no upload, no subscription, and no analytics watching who scans.",
    },
  ],

  howTo: [
    {
      title: "Enter your WhatsApp number",
      description:
        "Type your number in full international format, country code first, no plus sign, no spaces or dashes (for example 15551234567 or 447700900123). This must be a WhatsApp-registered number.",
    },
    {
      title: "Write the pre-filled message",
      description:
        "Add the opening message you want to appear ready-to-send in the chat, like 'Hi, I saw your flyer and want to know more.' Leave it blank for a plain, empty chat if you prefer.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab for colors, a gradient and dot/eye styles, add a 'Message us on WhatsApp' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans, then download",
      description:
        "Watch the live scannability badge, test the on-screen code with your own phone, then export a high-resolution PNG or PDF for print, or an SVG for infinite scaling.",
    },
  ],

  formats: {
    input: ["WhatsApp number + optional message"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Shop / Restaurant",
      title: "Counter 'message us' sign",
      description:
        "Put a QR on the counter, menu or window so customers ask about bookings, orders or opening hours over WhatsApp in one scan. No phone number to copy down, no call to place.",
    },
    {
      audience: "Small business / Freelancer",
      title: "Business card & invoice",
      description:
        "Add a click-to-chat code to your card, quote or invoice so clients reach you on WhatsApp with the project already referenced in a pre-filled opener, not a cold blank message.",
    },
    {
      audience: "Marketing / Flyers",
      title: "Flyer & packaging insert",
      description:
        "Print the code on flyers, packaging or posters with a message like 'Hi, I saw your ad' so you can tell exactly which campaign a lead came from by the opener they send.",
    },
    {
      audience: "Support / Events",
      title: "Instant support channel",
      description:
        "Place the code at a stand, help desk or on a product so visitors open a support chat instantly, faster than a form and friendlier than a hotline, right where the question arises.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning opens WhatsApp but says the number is invalid.",
      solution:
        "The number must be in full international format with the country code and no plus sign, spaces, dashes or leading zeros. Use 447700900123, not 07700 900123 or +44 7700 900123. It also has to be a number that is actually registered on WhatsApp.",
    },
    {
      problem: "The chat opens but my pre-filled message is missing.",
      solution:
        "Very long messages or unusual characters can be truncated by WhatsApp. Keep the opener short and plain. Emojis and basic punctuation are fine, but avoid pasting formatted or multi-line blocks and don't pre-encode the text yourself, the tool escapes it for you.",
    },
    {
      problem: "Nothing happens, or a browser opens instead of the app.",
      solution:
        "If WhatsApp isn't installed, the wa.me link opens WhatsApp Web in a browser instead, expected behaviour. On a phone, make sure WhatsApp (or WhatsApp Business) is installed and set as the handler, then rescan.",
    },
    {
      problem: "The code looks great on screen but won't scan when printed.",
      solution:
        "Keep strong contrast and enough quiet-zone margin, and don't shrink it too small. If you added a logo, keep error correction at Q or H (the tool does this automatically) and reprint at a higher resolution so the modules stay crisp.",
    },
  ],

  tips: [
    "Write the pre-filled message from the customer's point of view ('Hi, I'd like to book…'), so it reads naturally the second it lands in their chat and they only tap send.",
    "Use a WhatsApp Business number if you can. You get away messages, quick replies and a catalogue, which pairs perfectly with a high-traffic scan-to-chat code.",
    "Bump error correction to Q or H (or add a logo: the tool does it for you) so the code still scans through a scuff, a fold or a coffee ring on a printed flyer.",
    "Keep dark-on-light contrast: a green or dark code on a light background scans far more reliably than pale-on-pale or a code laid over a busy photo.",
    "Test the printed code under the real lighting where it will live (a counter, a window, a flyer in hand) before you commit to a full print run.",
  ],

  security:
    "Your WhatsApp number and pre-filled message are turned into a standard wa.me link entirely in your browser. They are never uploaded, stored or logged, and there is no account or analytics. Remember the finished QR is a static, public link: anyone who scans the printed code can open a chat to your number, exactly like reading it off a sign. Use a business number for anything public, and know that the scanner still has to tap send, the code starts the conversation, it doesn't message you automatically or share their details until they do.",

  faq: [
    {
      question: "How does a WhatsApp QR code work?",
      answer:
        "The code stores a standard 'click to chat' web link (https://wa.me/yournumber) with your optional message attached. When a phone camera scans it, the OS opens the link, WhatsApp launches into a chat already addressed to your number, and any pre-filled message appears ready to send: the customer just taps send.",
    },
    {
      question: "What format should my phone number be in?",
      answer:
        "Full international format: country code first, then the number, with no plus sign, no spaces and no dashes, and no leading zero. A UK mobile 07700 900123 becomes 447700900123. A US number becomes 1 followed by the ten digits. This is the format the wa.me link requires to work worldwide.",
    },
    {
      question: "Can I pre-fill the first message?",
      answer:
        "Yes: that's the point. Type any opening message and it appears in the chat ready to send the moment someone scans, so you get relevant, on-topic first messages ('Hi, I'd like to order') instead of empty 'hi' texts. Leave the message blank if you'd rather open a plain, empty chat.",
    },
    {
      question: "Does the customer's message send automatically when they scan?",
      answer:
        "No, and that's by design. Scanning opens WhatsApp and pre-fills the chat, but the person still has to tap send, so nothing is sent, and you receive no message or contact details, until they choose to. It's an invitation to chat, not an automatic message.",
    },
    {
      question: "Do I need WhatsApp Business, or does a personal number work?",
      answer:
        "Any WhatsApp-registered number works. Personal or Business. WhatsApp Business is worth it for shops and support because it adds away messages, quick replies, labels and a catalogue, but the QR code itself is identical either way.",
    },
    {
      question: "Can I add my logo and brand colors to the WhatsApp QR?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Message us on WhatsApp' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is the WhatsApp QR code dynamic. Can I change the number later without reprinting?",
      answer:
        "No, and we're upfront about it: this is a static QR that encodes the exact number and message you type now, because the tool has no server or database to redirect through. If you change your number or wording, regenerate and reprint the code. The trade-off is total privacy and a code that never expires or costs a subscription.",
    },
    {
      question: "Is it free, and is my number uploaded anywhere?",
      answer:
        "It's completely free with no signup, no watermark and no limit, and nothing is uploaded. The link is built entirely in your browser on your own device. Your number and message are never sent to a server, stored or logged. Close the tab and no trace remains.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked WhatsApp content form (international number + pre-filled message), standard wa.me click-to-chat payload with automatic message escaping, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-25",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Message us on WhatsApp' frame with a custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer international-number guidance and validation hints, plus expanded troubleshooting for invalid numbers, truncated messages and WhatsApp Web fallback on devices without the app.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "sms-qr-code-generator",
    "phone-qr-code-generator",
    "qr-code-scanner",
    "vcard-qr-code-generator",
  ],
};

export default whatsappQrCodeGenerator;
