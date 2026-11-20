import type { Tool } from "@/types";

/**
 * Instagram QR Code Generator: a flagship, single-purpose micro-site over the
 * QR Studio (locked to the "instagram" content type). It turns an Instagram
 * username or full profile URL into a scannable QR that opens the profile in the
 * Instagram app (or the web), so a phone camera lands a new visitor one tap away
 * from the Follow button. Every string here is written for the exact queries
 * creators, shops and marketers search when they want a printable "follow us on
 * Instagram" code for a shop window, business card, packaging insert, table tent
 * or event booth.
 *
 * Honest boundary baked into the copy: the code encodes a normal
 * `https://instagram.com/<username>` link locally in the browser. It is a
 * static code, it points at your handle forever and never changes, and it does
 * NOT track scans, force the code to open inside the Instagram app on every
 * device, or auto-follow anyone. Nothing is uploaded, no account is needed.
 */
const instagramQrCodeGenerator: Tool = {
  slug: "instagram-qr-code-generator",
  title: "Instagram QR Code Generator",
  description:
    "Turn your Instagram username into a scannable QR code that opens your profile one tap from Follow. Brand it with your colors and logo, then download print-ready PNG, SVG or PDF, 100% in your browser.",
  category: "qr-tools",
  icon: "Instagram",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "instagram",

  h1: "Instagram QR Code Generator, Grow Followers Offline",
  tagline:
    "Type your @handle once and get a QR code that sends any phone straight to your Instagram profile, one tap from Follow. Brand it, add your logo, and print it for shop windows, packaging, business cards and events, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Instagram QR Code Generator turns your handle into a bridge between the real world and your feed. Type your username (or paste your full profile URL) and the tool builds a clean, permanent link to your Instagram profile, then hands it to our desktop-grade QR Studio so it looks unmistakably like your brand: pick your colors or a gradient, choose rounded dots and eye styles, drop your logo or profile picture into the centre, and wrap it in a printable frame with a 'Follow us on Instagram' call-to-action. Every person who points their camera at it lands directly on your profile. No searching your name, no guessing the spelling, no autocorrect sending them to an impostor account, so the only thing left to do is tap Follow. A live scannability check watches contrast, quiet zone and logo coverage while you design, so a beautiful code still scans on the first try under shop lighting. Export a crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px for anything from a business card to a shop-window decal or a trade-show banner. Because encoding, styling and export all happen locally in your browser, nothing about your account is ever uploaded, stored or logged, and there's no signup. We're honest about the trade-off: this is a static QR that always points at the handle you enter now. It doesn't count scans, doesn't force the Instagram app to open on every device, and can't auto-follow anyone, but it never expires, never depends on our servers, and never tracks the people who scan it.",

  ctaText: "Generate Instagram QR Code",

  keywords: [
    "instagram qr code generator",
    "instagram qr code",
    "qr code for instagram",
    "generate instagram qr code",
    "instagram profile qr code",
    "follow me on instagram qr code",
    "instagram username qr code",
    "instagram qr code with logo",
    "printable instagram qr code",
    "grow instagram followers qr code",
    "custom instagram qr code",
    "free instagram qr code maker",
  ],

  seo: {
    title:
      "Instagram QR Code Generator, Grow Followers, Free & No Signup | GigAI Tools",
    description:
      "Free Instagram QR code generator. Turn your @username into a scan-to-follow QR that opens your profile, add your logo and brand colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser: nothing uploaded.",
  },

  features: [
    {
      icon: "Instagram",
      title: "Handle or URL: either works",
      description:
        "Type just your @username or paste a full instagram.com link. The tool normalises it into one clean, permanent profile URL so every scan lands on the right account.",
    },
    {
      icon: "UserPlus",
      title: "One tap from Follow",
      description:
        "A phone camera opens your profile directly (no searching your name, no autocorrect sending someone to a lookalike account) so the only action left is to tap Follow.",
    },
    {
      icon: "Palette",
      title: "Brand it to your grid",
      description:
        "Custom colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Follow us on Instagram' label make the code match your feed instead of looking generic.",
    },
    {
      icon: "Image",
      title: "Logo or profile pic in the centre",
      description:
        "Drop your logo or avatar into the middle with adjustable size and a protected quiet zone. The tool auto-raises error correction so it keeps scanning.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the code hard to scan under real lighting.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for a business card, packaging insert, poster or window decal.",
    },
  ],

  benefits: [
    {
      title: "Turn foot traffic into followers",
      description:
        "Every customer at your counter, event booth or pop-up is a potential follower, a QR by the till or on the receipt lets them follow before they leave, no handle-typing required.",
    },
    {
      title: "No misspelled handles or fake accounts",
      description:
        "Reading a username aloud or printing it in tiny type invites typos and impostors. The QR carries the exact link, so scanners reach your real profile every time.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed call-to-action, the code fits your packaging, menu or lookbook instead of clashing as a black-and-white square.",
    },
    {
      title: "Private and free forever",
      description:
        "It's built locally in your browser with no account and no tracking. You don't pay, and the people who scan it aren't logged or profiled by us.",
    },
  ],

  howTo: [
    {
      title: "Enter your Instagram handle",
      description:
        "Type your username (with or without the @) or paste your full profile URL. The live preview updates instantly into a scannable code pointing at your profile.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Follow us on Instagram' frame, then drop your logo or avatar into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview. Point your own phone camera at the on-screen code to confirm it opens your profile before you commit to a print run.",
    },
    {
      title: "Download and place it",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, and put it where people already have their phones out, the counter, packaging, a stand or a story graphic.",
    },
  ],

  formats: {
    input: ["Instagram username or profile URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Creator / Influencer",
      title: "Scan-to-follow everywhere",
      description:
        "Put your code on a business card, a merch tag or a slide at the end of a talk so new fans follow you on the spot instead of trying to remember your handle later.",
    },
    {
      audience: "Small shop / Café",
      title: "Counter & packaging follow prompt",
      description:
        "Place a 'Follow us on Instagram' QR by the till, on the bag or on the receipt so happy customers follow your latest drops, specials and opening hours before they leave.",
    },
    {
      audience: "Restaurant / Bar",
      title: "Menu & table-tent social",
      description:
        "Add the code to menus and table tents so diners follow for events and daily specials while they wait, turning a printed menu into a follower funnel.",
    },
    {
      audience: "Events / Booths",
      title: "Trade-show & pop-up growth",
      description:
        "Blow the code up on a banner or stand so booth visitors follow with a glance, giving you a warm audience to re-engage long after the event ends.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens the browser instead of the Instagram app.",
      solution:
        "That's expected and normal. A QR encodes a web link, and each phone decides whether to open it in the app or the browser. No QR can force the app on every device. If the app is installed, Instagram usually hands the profile off to it. If not, the web profile still shows your Follow button.",
    },
    {
      problem: "The code goes to the wrong profile or a 'user not found' page.",
      solution:
        "Check the username is spelled exactly as on Instagram: handles are case-insensitive but every character counts, including dots and underscores. If you pasted a URL, make sure it's your profile link (instagram.com/yourhandle), not a link to a single post or a story.",
    },
    {
      problem: "The code scans but nothing happens.",
      solution:
        "Use the phone's built-in camera or a mainstream QR app, ensure the whole code is in frame with its white margin, and test under the lighting where it will live. If you added a large logo, raise error correction to Q or H so more of the code survives being covered.",
    },
  ],

  tips: [
    "Pair the code with a clear reason to follow: 'Scan for 10% off your first order' or 'Follow for weekly drops' converts far better than a bare code.",
    "Add your logo or profile picture to the centre so people recognise your brand before they even scan, the tool bumps error correction automatically so it still reads.",
    "Keep strong contrast: a dark code on a light background scans far more reliably than pale-on-pale or a code sitting on a busy photo.",
    "Export SVG for anything that gets resized (banners, window decals) so it stays razor-sharp, and PNG or PDF at 1024px+ for cards and packaging.",
    "Print one and scan it under the actual shop or booth lighting before running the full batch: screen scans can hide contrast problems that print reveals.",
  ],

  security:
    "Your Instagram handle is turned into a standard profile link and encoded into the QR entirely in your browser. Nothing is uploaded, stored or logged, and there is no account. The finished code is a static, public link to your profile (exactly the kind of link you'd share anywhere), so it's safe to print widely. It does not track who scans it, cannot follow anyone on their behalf, and never expires or depends on our servers to keep working.",

  faq: [
    {
      question: "How does an Instagram QR code work?",
      answer:
        "The code stores a normal web link to your Instagram profile (like instagram.com/yourhandle). When a phone camera scans it, the phone opens that link (usually handing it straight to the Instagram app if it's installed) landing the visitor on your profile, one tap from the Follow button. There's no special format. It's just your profile URL wrapped in a QR.",
    },
    {
      question: "Is this the same as Instagram's own 'nametag' QR?",
      answer:
        "It does the same job (sending a scanner to your profile) but it's independent of Instagram, so you can fully brand it with your own colors and logo, print it at any size, and export vector formats. Instagram's in-app QR only works well when scanned inside Instagram. This code works with any phone's regular camera.",
    },
    {
      question: "Will scanning it automatically follow me?",
      answer:
        "No, and no QR code can do that, following someone requires them to tap Follow while signed in. The code's job is to remove all the friction before that tap: it opens your exact profile instantly so there's nothing to search or type. Pairing it with a clear 'Follow for…' incentive is what lifts the follow rate.",
    },
    {
      question: "Can I add my logo and brand colors?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Follow us on Instagram' frame, and drop your logo or profile picture into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code scanning, and it raises error correction automatically when you add a logo.",
    },
    {
      question: "Does it track how many people scan the code?",
      answer:
        "No. This is a static QR generated entirely on your device, so there's no server counting scans and no analytics, which is exactly why it's private and free. If you need scan counts, use a URL you control (a link-in-bio or shortener page that reports clicks) as the destination and generate the QR for that link instead.",
    },
    {
      question: "Can I change where the code points after I've printed it?",
      answer:
        "Not directly. This is a static code that always points at the handle you enter now, because there's no server to redirect through. If your handle changes, regenerate and reprint. To make a code you can re-point later, encode a link you own (like a link-in-bio page) and change the destination there instead of reprinting.",
    },
    {
      question: "Will it work on both iPhone and Android?",
      answer:
        "Yes. Any modern iPhone or Android reads a link QR with the built-in camera app and opens your profile. If the Instagram app is installed, most devices open the profile there. If not, the web profile loads in the browser with the same Follow button.",
    },
    {
      question: "Is it really free with no signup or watermark?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many Instagram QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked Instagram content form with username-or-URL input and automatic profile-link normalisation, live preview, and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo/profile-picture drop-in with automatic error-correction bump, a 'Follow us on Instagram' frame with a custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer guidance on app-vs-browser open behaviour and using a trackable link-in-bio destination, plus refined defaults tuned for shop-window and packaging prints.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "facebook-qr-code-generator",
    "youtube-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default instagramQrCodeGenerator;
