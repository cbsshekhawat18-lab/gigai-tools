import type { Tool } from "@/types";

/**
 * Telegram QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "telegram" content type). It turns a Telegram username,
 * @handle, channel or invite link into a scannable t.me QR that opens the chat,
 * channel, group or bot the instant a phone camera reads it. Every string here
 * is written for the exact queries people search when they want to grow a
 * channel, put a bot on a flyer, or let someone add them without typing an
 * @username: for a stream overlay, a business card, a shop window, a conference
 * badge or a link-in-bio.
 *
 * Honest boundary baked into the copy: the QR encodes a real, public `t.me`
 * link locally in the browser; it is a static code that always points at that
 * exact username or invite, with nothing uploaded, tracked or shortened. It
 * cannot follow, message or reveal anyone on its own; it just opens Telegram at
 * the destination you type.
 */
const telegramQrCodeGenerator: Tool = {
  slug: "telegram-qr-code-generator",
  title: "Telegram QR Code Generator",
  description:
    "Turn a Telegram username, channel or invite link into a scannable t.me QR code. Point a phone camera at it to open your profile, channel, group or bot instantly. Style it, add a logo, and download PNG, SVG or PDF: 100% in your browser.",
  category: "qr-tools",
  icon: "Send",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "telegram",

  h1: "Telegram QR Code Generator, Scan to Open Your Chat, Channel or Bot",
  tagline:
    "Type your @username or paste a t.me invite link and get a QR code that opens your Telegram profile, channel, group or bot the moment someone scans it. Brand it with your colors and logo, then print or post it: generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Telegram QR Code Generator turns any Telegram destination (your personal @username, a public channel, a group invite, or a bot's deep link) into a single scannable code that opens Telegram straight at that spot. No spelling out an @handle on a livestream, no dictating 't dot me slash' on a call, no hoping a viewer types the username correctly. Enter your username (with or without the @) and the tool builds the exact `https://t.me/…` link phones understand, or paste a full t.me / joinchat / bot-start link and it uses it verbatim. From there it hands off to our desktop-grade QR Studio so the code looks like your brand rather than a generic black square: Telegram-blue or fully custom colors and gradients, rounded dot and eye styles, your channel or company logo dropped into the centre, a printable frame with a 'Scan to open Telegram' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF, JPG, WEBP or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a good-looking code still scans on the first try. Because encoding, styling and export all happen locally in your browser, nothing you type is ever sent to a server, stored or logged. There is no account and no tracking. This is a static QR: it always points at the exact username or invite link you enter, so if you rename your channel or rotate an invite link, regenerate the code. That is also the privacy upside. Nothing is hosted, redirected or counted on our side.",

  ctaText: "Generate Telegram QR Code",

  keywords: [
    "telegram qr code generator",
    "telegram qr code",
    "qr code for telegram",
    "t.me qr code",
    "telegram channel qr code",
    "telegram username qr code",
    "telegram invite link qr code",
    "telegram bot qr code",
    "generate telegram qr code",
    "telegram qr code with logo",
    "scan to open telegram",
    "telegram group qr code",
  ],

  seo: {
    title: "Telegram QR Code Generator: Scan to Open Chat, Channel or Bot (Free) | GigAI Tools",
    description:
      "Free Telegram QR code generator. Enter your @username or paste a t.me invite link to make a scan-to-open Telegram QR, add a logo and brand colors, and download PNG, SVG or PDF. Runs 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Send",
      title: "Username or invite link",
      description:
        "Type your @username (the @ is optional) and the tool builds the correct t.me link, or paste a full t.me/joinchat or bot-start URL and it's used exactly as-is, profile, channel, group or bot.",
    },
    {
      icon: "Smartphone",
      title: "Opens Telegram in one scan",
      description:
        "A phone camera reads the code and opens the Telegram app straight at your destination, or the web fallback if the app isn't installed. No typing an @handle, no typos, no lost followers.",
    },
    {
      icon: "Palette",
      title: "Telegram-blue or your brand",
      description:
        "Start on an on-brand Telegram-blue look or set fully custom colors and gradients with rounded dot and eye styles and a 'Scan to open Telegram' frame, so the code matches your channel art.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Place your channel avatar or company logo in the centre with adjustable size and a protected quiet zone, the tool auto-raises error correction so the code still scans cleanly.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the code hard to scan.",
    },
    {
      icon: "Download",
      title: "Print & stream-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF, JPG, WEBP or vector EPS at up to 4096px, sharp for a business card, shop window, conference badge or a stream overlay.",
    },
  ],

  benefits: [
    {
      title: "Grow your channel faster",
      description:
        "Put the code on a stream overlay, flyer, slide or shop window and viewers join by pointing their camera. You stop losing the people who never bother to type a t.me link by hand.",
    },
    {
      title: "Zero typos on your @handle",
      description:
        "Reading an @username aloud invites mistakes, a dropped letter, an underscore missed, the wrong person followed. A QR carries the exact link so scanners land on you, every time.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With Telegram-blue or your own colors, your avatar in the centre and a framed call-to-action, the code fits your channel art and marketing instead of looking like a generic afterthought.",
    },
    {
      title: "Private and free by design",
      description:
        "The link is encoded locally in your browser and never uploaded. No account, no tracking pixel, no shortener counting your scans. What you type is all the QR ever contains.",
    },
  ],

  howTo: [
    {
      title: "Enter your Telegram destination",
      description:
        "Type your @username (with or without the @), or paste a full t.me link, a channel, group invite (t.me/+… or /joinchat/…), or a bot start link like t.me/YourBot?start=code.",
    },
    {
      title: "Brand and style it",
      description:
        "Open the Design tab for Telegram-blue or custom colors and dot/eye styles, add a 'Scan to open Telegram' frame, and drop your channel avatar or logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview, then test the on-screen code with your own phone camera to confirm it opens the right chat before you commit to a print run.",
    },
    {
      title: "Download and share",
      description:
        "Export a high-resolution PNG or PDF for print, a transparent PNG for a stream overlay, or an SVG for infinite scaling, then place it wherever your audience will see it.",
    },
  ],

  formats: {
    input: ["Telegram @username or t.me link"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Creator / Streamer",
      title: "Grow a channel from a stream overlay",
      description:
        "Drop a transparent-PNG code onto your overlay or end screen so viewers join your Telegram channel mid-stream without leaving the video to hunt for the link in your bio.",
    },
    {
      audience: "Business / Support",
      title: "Chat with a bot from a flyer",
      description:
        "Encode a bot start link (t.me/YourBot?start=…) on a leaflet, receipt or shop sign so customers open a support or ordering bot with the right context, no typing required.",
    },
    {
      audience: "Community / Event",
      title: "Join a group at the door",
      description:
        "Print a group invite QR for a meetup, conference or class so attendees join the community chat as they arrive, one scan instead of ten people asking 'what's the link?'.",
    },
    {
      audience: "Personal / Networking",
      title: "Add me on a business card",
      description:
        "Put your @username code on a card or badge so new contacts open your Telegram profile and message you directly, without swapping phone numbers first.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens the wrong profile or a 'user not found' page.",
      solution:
        "Telegram usernames are case-insensitive but every character counts: check for a missing underscore, an extra letter, or a typo. Public usernames must be at least 5 characters and already claimed. A username that doesn't exist yet will show 'user not found'.",
    },
    {
      problem: "My private group / channel invite QR doesn't let people in.",
      solution:
        "Use the full invite link Telegram generates (it looks like t.me/+AbC123… or t.me/joinchat/AbC123…), not the private @name. Invite links can expire or be revoked in Telegram, if you rotate the link, regenerate the QR, because this is a static code.",
    },
    {
      problem: "The code scans but opens a browser page instead of the app.",
      solution:
        "That's expected when Telegram isn't installed or the OS opens links in the browser first, the t.me web page then offers an 'Open in Telegram' button. It's the standard t.me behaviour. The destination is still correct.",
    },
    {
      problem: "My bot's start parameter seems to be ignored.",
      solution:
        "Paste the whole deep link including the query, e.g. t.me/YourBot?start=welcome. Keep the start value to letters, numbers, hyphen and underscore (Telegram's allowed set) and don't URL-encode it yourself: paste it exactly as Telegram gives it.",
    },
  ],

  tips: [
    "You don't need to type 'https://' or 't.me/'. Just the @username is enough. The tool builds the correct t.me link for you.",
    "For a livestream, export a transparent PNG so the code sits cleanly on any overlay background without a white box around it.",
    "Add your channel avatar as the centre logo and the tool bumps error correction automatically, so the code stays scannable and instantly recognisable.",
    "Bot links carry context: use t.me/YourBot?start=flyer2026 so scans from a specific flyer land the user in the right flow (and you can tell campaigns apart in your bot).",
    "Test the printed code under the real lighting where it'll live, then run the batch, a code that scans on screen can struggle on glossy or dark stock.",
  ],

  security:
    "Your Telegram username or link is encoded into the QR entirely in your browser and is never uploaded, stored or logged. There is no account and no analytics. The finished QR is a static code that always points at the exact public t.me destination you entered. It cannot follow, message or reveal anyone on its own, and we never shorten or redirect it, so no third party counts your scans. Because it is static, a renamed channel or a revoked invite link means you should regenerate the code. The upside is that nothing about your audience is hosted or tracked on our side.",

  faq: [
    {
      question: "How does a Telegram QR code work?",
      answer:
        "The code stores a standard https://t.me/… link. When a phone camera or QR reader scans it, the operating system opens that link, and Telegram (or the t.me web page) takes over to show your profile, channel, group invite or bot, the same as tapping the link, just without anyone typing your @username.",
    },
    {
      question: "Do I have to include the @ or the full t.me link?",
      answer:
        "No. Just type your username and the tool adds the rest, '@yourname', 'yourname' and 'https://t.me/yourname' all produce the same code. If you already have a full link, such as a channel or private-group invite, paste it and it's used exactly as-is.",
    },
    {
      question: "Can I make a QR code for a Telegram channel, group or bot?",
      answer:
        "Yes. For a public channel or bot, enter its @username. For a private group or channel, paste the invite link Telegram generates (t.me/+… or t.me/joinchat/…). For a bot with a start parameter, paste the whole deep link, e.g. t.me/YourBot?start=welcome, and the QR preserves it.",
    },
    {
      question: "Is anything I type uploaded or tracked?",
      answer:
        "No. The QR is built entirely in your browser on your own device. Your username or link is never sent to a server, and we don't shorten or redirect it, so no one counts your scans. There is no account, no tracking pixel and nothing stored, close the tab and no trace remains.",
    },
    {
      question: "Can I add my logo and brand colors to the Telegram QR?",
      answer:
        "Absolutely. Use the Design tab for Telegram-blue or fully custom colors, gradients and rounded dot/eye styles, add a 'Scan to open Telegram' frame, and drop your channel avatar or logo into the centre from the Logo tab. The live scannability check keeps your branding from breaking the scan, and error correction auto-raises when you add a logo.",
    },
    {
      question: "Is the Telegram QR code dynamic: can I change where it points later?",
      answer:
        "No, and we're upfront about it: this is a static QR that encodes the exact link you type now, because the tool has no server to redirect through. If you change your @username or revoke an invite link, regenerate and reprint the code. The trade-off is total privacy. Nothing is hosted, redirected or counted.",
    },
    {
      question: "What if someone scans it and doesn't have Telegram installed?",
      answer:
        "The t.me link opens in their browser and shows an 'Open in Telegram' page with a link to install the app or continue on Telegram Web. So the code still works as a graceful fallback. It never dead-ends, it just prompts them to get Telegram.",
    },
    {
      question: "What size should I export for print or a stream?",
      answer:
        "For a card, flyer or poster, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For a stream overlay, use a transparent PNG so there's no white box. For signage that may be resized, use the SVG export, which stays razor-sharp at any scale.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked Telegram content form that accepts a bare @username or a full t.me link, builds the correct https://t.me/… payload in the browser, with live preview and PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-25",
      change:
        "Added logo drop-in with automatic error-correction bump, a 'Scan to open Telegram' frame, a Telegram-blue default look, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-07-01",
      change:
        "Improved handling of private-group invite links (t.me/+… and /joinchat/…) and bot start deep links, plus clearer troubleshooting for username, invite and app-fallback edge cases.",
    },
  ],

  relatedTools: [
    "whatsapp-qr-code-generator",
    "qr-code-generator",
    "instagram-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default telegramQrCodeGenerator;
