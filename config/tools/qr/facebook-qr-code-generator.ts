import type { Tool } from "@/types";

/**
 * Facebook QR Code Generator: a single-purpose micro-site over the QR Studio,
 * locked to the "url" content type and framed entirely around turning a Facebook
 * profile, Page, Group or event link into a branded, scannable QR code. The copy
 * targets the exact queries people search when they want a printable "follow us
 * on Facebook" or "like our Page" code for a shopfront, flyer, packaging, a
 * business card or a livestream lower-third.
 *
 * Honest boundary baked into the copy: this encodes the Facebook URL you paste
 * directly into the pattern (a static code). There is no server, no click
 * tracking, no editable-after-print redirect, and nothing is uploaded. If the
 * scanner has the Facebook app installed the link deep-links into it; otherwise
 * it opens in the browser, which is standard Facebook link behaviour we don't
 * control.
 */
const facebookQrCodeGenerator: Tool = {
  slug: "facebook-qr-code-generator",
  title: "Facebook QR Code Generator",
  description:
    "Turn any Facebook profile, Page, Group or event link into a branded, scannable QR code. Add your colors and logo, verify it scans, then download print-ready PNG, SVG or PDF. 100% in your browser: nothing uploaded.",
  category: "qr-tools",
  icon: "Facebook",
  accent: "sky",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",
  illustration: "facebook",

  h1: "Facebook QR Code Generator, Grow Your Page & Followers",
  tagline:
    "Paste your Facebook Page, profile, Group or event link and get a QR code people scan to follow, like or RSVP in one tap. Brand it with your colors and logo, confirm it scans, and export print-ready PNG, SVG or PDF, built in your browser, never uploaded.",
  longDescription:
    "The GigAI Facebook QR Code Generator turns the link to your Facebook Page, personal profile, Group or event into a single scannable code, so anyone can find and follow you by pointing their phone camera instead of typing your name into search and picking the right account from a list of look-alikes. Paste any facebook.com link, a vanity URL like facebook.com/yourbusiness, a Page, a Group, an event invite, a Marketplace listing or even a specific post, and the tool validates it as a real Facebook destination, auto-adds https:// if you leave it off, and builds a clean static QR that opens the Facebook app when it's installed (falling back to the browser when it isn't). Then make it look like it belongs to your brand in the desktop-grade QR Studio: set your foreground and background colors or a gradient, choose rounded or classy dot and eye shapes, drop your Page's profile picture or logo into the centre with automatic error-correction guidance, add a printable 'Follow us on Facebook' frame, and watch a live scannability check test contrast, quiet-zone and logo coverage as you design so the finished code actually scans first time. Export a crisp PNG, a transparent PNG for overlays, an infinitely scalable SVG, or a print-ready PDF or EPS at up to 4096px: sharp enough for a shop-window decal, a flyer, product packaging, a business card or a video overlay. Everything (validating the link, styling, rendering and exporting) happens locally in your browser, so nothing you paste is uploaded, logged or tracked. Because it's a static code, it always points at whatever URL you enter now. To change the destination later, generate a fresh code.",

  ctaText: "Generate Facebook QR Code",

  keywords: [
    "facebook qr code generator",
    "facebook qr code",
    "qr code for facebook page",
    "facebook page qr code",
    "qr code for facebook profile",
    "facebook follow qr code",
    "facebook group qr code",
    "facebook event qr code",
    "scan to follow facebook",
    "facebook qr code with logo",
    "printable facebook qr code",
    "free facebook qr code no watermark",
  ],

  seo: {
    title:
      "Facebook QR Code Generator, Scan to Follow Your Page (Free, No Signup) | GigAI Tools",
    description:
      "Free Facebook QR code generator. Paste your Page, profile, Group or event link to make a scan-to-follow QR code, add a logo and brand colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser: nothing uploaded.",
  },

  features: [
    {
      icon: "Facebook",
      title: "Any Facebook link works",
      description:
        "Pages, personal profiles, Groups, events, Marketplace listings or a single post. Paste any facebook.com URL and the tool validates it and builds a scan-to-open code, auto-adding https:// if you forget it.",
    },
    {
      icon: "Smartphone",
      title: "Deep-links into the app",
      description:
        "When the scanner has Facebook installed, the code opens your destination right inside the app for a one-tap follow, like or RSVP. On phones without it, the same link opens cleanly in the browser.",
    },
    {
      icon: "Palette",
      title: "Brand it to your Page",
      description:
        "Custom foreground and background colors or a gradient, rounded or classy dot and eye styles, and a printable 'Follow us on Facebook' frame so the code matches your signage instead of looking generic.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Place your Page's profile picture or brand logo in the centre with adjustable size and a protected quiet zone, the tool auto-raises error correction so the code still scans with your mark on top.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator runs an actual decode on the rendered pixels and a WCAG contrast test as you design, warning you the moment a color, logo size or inversion would stop phones reading it.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: crisp on a window decal, a flyer, packaging, a business card or a livestream overlay.",
    },
  ],

  benefits: [
    {
      title: "Followers find the right account",
      description:
        "Searching your name on Facebook surfaces impersonators, old profiles and similarly named Pages. A QR code sends every scan to the exact account you chose. No wrong likes, no confusion.",
    },
    {
      title: "Turn offline attention into follows",
      description:
        "A code on your storefront, menu, receipt, flyer or van converts the people already in front of you into Facebook followers in one tap, without asking them to stop and type.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, your logo and a framed call-to-action, the code fits your printed collateral and video overlays instead of standing out as a plain black-and-white square.",
    },
    {
      title: "Private, free and no expiry",
      description:
        "No account, no watermark and no expiry. The link you paste is validated and encoded locally in your browser, so nothing is uploaded, tracked or ever able to stop working on our end.",
    },
  ],

  howTo: [
    {
      title: "Copy your Facebook link",
      description:
        "Open your Page, profile, Group or event on Facebook and copy the URL from the address bar (or the 'Copy link' menu). A vanity URL like facebook.com/yourbusiness is easiest for people to trust.",
    },
    {
      title: "Paste it in",
      description:
        "Paste the link into the field. The tool checks it's a valid Facebook destination and previews the QR live. You don't need to type https://, it's added for you.",
    },
    {
      title: "Brand and check it",
      description:
        "Open the Design tab for colors, a gradient and dot/eye shapes, add a 'Follow us' frame, and drop your logo in the centre. Watch the live scannability badge stay green as you style.",
    },
    {
      title: "Download and place it",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, then put it where your audience already is, your counter, packaging, flyer, business card or stream.",
    },
  ],

  formats: {
    input: ["Facebook Page / profile / Group / event URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Local business / shopfront",
      title: "Scan to like our Page",
      description:
        "Put a branded 'Follow us on Facebook' code on the door, counter or menu so walk-in customers like your Page and see your posts, offers and opening-hours changes.",
    },
    {
      audience: "Creator / community manager",
      title: "Grow a Facebook Group",
      description:
        "Add the code to a flyer, event backdrop or livestream overlay so new members join your Group in a single scan instead of searching and requesting the wrong one.",
    },
    {
      audience: "Event host",
      title: "RSVP to a Facebook event",
      description:
        "Print the event's QR on invitations, posters and tickets so guests open the event page, mark themselves Going and get every schedule update automatically.",
    },
    {
      audience: "Restaurant / café",
      title: "Reviews and photos",
      description:
        "Drop the code on receipts, table tents or takeaway bags so happy diners jump straight to your Page to leave a recommendation or tag their photos.",
    },
  ],

  troubleshooting: [
    {
      problem: "The code opens the browser instead of the Facebook app.",
      solution:
        "That's expected on phones without the Facebook app, or when the OS is set to open links in the browser. The destination is still correct. A logged-in user tapping 'Follow' or 'Like' in the browser works the same. There's no app-only redirect a QR code can force.",
    },
    {
      problem: "Scanning lands on a login or 'content unavailable' screen.",
      solution:
        "Your Page, Group or event may be private, region-restricted or require sign-in. Use a public Page or your Group's public preview/invite link, and test the code while logged out to confirm strangers can reach it.",
    },
    {
      problem: "My branded QR won't scan.",
      solution:
        "Check the live scan-test badge. Usual causes are low contrast, too small a quiet-zone margin, or a logo covering too much of the code. Increase contrast (dark code on a light background), keep the margin, shrink the logo, and set error correction to Q or H when using a logo.",
    },
    {
      problem: "I changed my Facebook vanity URL and the printed code is dead.",
      solution:
        "This is a static QR: it encodes the exact URL you entered, so a renamed Page or changed username breaks old prints. Generate a fresh code from the new link and reprint. To avoid this, point the code at a stable link you control and redirect from there.",
    },
  ],

  tips: [
    "Use your Page's vanity URL (facebook.com/yourbusiness) rather than a long numeric link. It's shorter, so the QR is less dense and scans faster.",
    "Add a clear 'Follow us on Facebook' label or frame. A bare code gets far fewer scans than one that tells people what they'll get.",
    "Drop your Page's profile picture into the centre and bump error correction to H so the code is instantly recognisable and still scannable.",
    "Export SVG or PDF for anything printed large, window decals and posters stay razor-sharp at any size, unlike a stretched PNG.",
    "Test the finished code logged out on both an iPhone and an Android phone before a print run, so you know strangers reach the right place.",
  ],

  security:
    "Your Facebook link is validated and encoded into the QR entirely in your browser. It is never uploaded, stored or logged, and there is no account or click tracking on our side. The finished code is static: it contains the exact URL you paste, so anyone who scans it goes straight to that public destination, and changing your Page's username later means regenerating the code. Uploaded logos are read locally and never leave the tab.",

  faq: [
    {
      question: "How do I make a QR code for my Facebook Page?",
      answer:
        "Open your Page on Facebook, copy its URL from the address bar (ideally the vanity link like facebook.com/yourbusiness), and paste it into the field here. The tool validates it, builds the QR live, and lets you brand and download it. Scanning the finished code opens your Page so people can like and follow in one tap.",
    },
    {
      question: "Can I make a QR code for a Facebook profile, Group or event too?",
      answer:
        "Yes. Any facebook.com link works: a personal profile, a Group, an event, a Marketplace listing or a specific post. Just paste the link you want people to land on. For a Group or event, make sure it's public or use its invite/preview link so people who aren't members can still open it.",
    },
    {
      question: "Will the QR code open the Facebook app or the web browser?",
      answer:
        "It opens the Facebook app when the person scanning has it installed and their phone is set to deep-link Facebook URLs. Otherwise the same link opens in the mobile browser, where they can still view and follow your Page while logged in. This is standard Facebook link behaviour: a QR code encodes a URL and can't force an app-only path.",
    },
    {
      question: "Is this Facebook QR code generator free, with no watermark or expiry?",
      answer:
        "Yes. Every code is free, watermark-free and never expires. There's no account and no 'pro' tier. Because the code is static, your Facebook URL is encoded directly into the pattern, it keeps working for as long as that link stays valid, with nothing hosted on our side that could lapse.",
    },
    {
      question: "Can I add my logo and brand colors to the Facebook QR code?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded/classy dot and eye styles, add a 'Follow us on Facebook' frame, and drop your Page's profile picture or logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't break scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Can I change where the QR code points after I've printed it?",
      answer:
        "Not directly. This is a static code that encodes the exact URL you enter, because there's no server or redirect involved (which is what keeps it private and free). If your Facebook link changes, generate and reprint a new code. To get editable-after-print behaviour, point the code at a link you control, such as your own domain or a redirect you manage, and change the target on your side.",
    },
    {
      question: "Is my link or logo uploaded anywhere when I generate the code?",
      answer:
        "No. Validating the link, styling, rendering and exporting all happen locally in your browser using the canvas and Web APIs. The URL you paste and any logo you add never leave your device, and there's no click tracking or analytics attached to the code, there's nothing for us to store or see.",
    },
    {
      question: "What format and size should I export for printing?",
      answer:
        "For flyers, packaging or a window decal, export a PNG or PDF at 1024px or higher (the tool goes up to 4096px). For anything that may be resized (large signage or a video overlay) use the SVG or PDF export, which are vector and stay crisp at any size. Avoid stretching a small PNG, which always looks blurry.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked to Facebook URL input with facebook.com validation and automatic https:// prefixing, live preview, and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Follow us on Facebook' frame with editable call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Broadened link support to Groups, events, Marketplace and single posts, and added clearer guidance on app-vs-browser deep-linking and public-link requirements.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "qr-code-with-logo",
    "business-card-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default facebookQrCodeGenerator;
