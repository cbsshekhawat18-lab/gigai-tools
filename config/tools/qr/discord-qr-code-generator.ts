import type { Tool } from "@/types";

/**
 * Discord QR Code Generator, a single-purpose micro-site over the QR Studio,
 * locked to the "discord" content type. It turns a Discord invite link into a
 * branded, scannable "join our server" QR that people point their phone camera
 * at to open the invite in the Discord app. No typing a discord.gg/xxxx code,
 * no pasting links in a DM, no dead invite because someone mistyped it.
 *
 * Honest boundary baked into the copy: the QR encodes the exact invite URL you
 * paste, locally in your browser. It is a static code; it always points at
 * whatever invite you enter now. If that invite expires or hits its use limit,
 * regenerate it. Nothing is uploaded, tracked, or hosted on our side.
 */
const discordQrCodeGenerator: Tool = {
  slug: "discord-qr-code-generator",
  title: "Discord QR Code Generator",
  description:
    "Turn a Discord invite link into a scannable QR code so people join your server by pointing their camera. No typing discord.gg codes. Brand it, add your logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "MessageSquare",
  accent: "indigo",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",
  illustration: "discord",

  h1: "Discord QR Code Generator: Scan to Join Your Server",
  tagline:
    "Paste your discord.gg invite link once and get a QR code that opens the invite the moment someone scans it. Brand it with your server's colors and logo, then print it on flyers, merch, stream overlays and event banners, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Discord QR Code Generator converts your server's invite link into a single scannable code that phone cameras open straight into the Discord invite screen, one tap and they're in, no reading out 'discord.gg slash' and hoping nobody fat-fingers the code. Paste any Discord invite (discord.gg/abc123, discord.com/invite/abc123, or a full custom-vanity URL), and the tool hands it to our desktop-grade QR Studio so you can make it look like your community: your server's brand colors or a gradient, rounded 'blurple'-style dots and eyes, your community logo or emote dropped into the centre, and a printable frame with a 'Scan to join' call-to-action. Export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF, JPG, WEBP or vector EPS at up to 4096px, sharp enough for a con banner, a sticker sheet, a T-shirt, a Twitch panel or a business card. A live scannability check watches contrast, quiet-zone and logo coverage while you design, so the code that looks great still scans on the first try under real lighting. Because encoding, styling and export all happen locally in your browser, your invite link is never sent to a server, stored or logged, there's no account and nothing to sign up for. One honest note: this is a static QR, so it always points at the exact invite you paste. If you want the code to outlive a single event, set your invite to 'never expire' with no use limit in Discord's server settings before you generate. If an invite lapses, just paste a fresh one and re-download.",

  ctaText: "Generate Discord QR Code",

  keywords: [
    "discord qr code generator",
    "discord qr code",
    "qr code for discord",
    "discord invite qr code",
    "discord server qr code",
    "join discord qr code",
    "scan to join discord",
    "generate discord qr code",
    "discord invite link qr",
    "discord qr code with logo",
    "printable discord qr code",
    "discord.gg qr code",
  ],

  seo: {
    title: "Discord QR Code Generator: Scan to Join a Server (Free, No Signup) | GigAI Tools",
    description:
      "Free Discord QR code generator. Paste your invite link to make a scan-to-join QR code, add your logo and brand colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, link never uploaded.",
  },

  features: [
    {
      icon: "MessageSquare",
      title: "Scan straight into the invite",
      description:
        "Encodes your discord.gg invite so a phone camera opens the Discord invite screen with one tap. No typing an invite code, no pasting links, no dead codes from typos.",
    },
    {
      icon: "Link",
      title: "Any invite format works",
      description:
        "Paste discord.gg/abc123, discord.com/invite/abc123, or a custom vanity URL. The tool normalises it into a clean, scannable link that opens the app or the web invite.",
    },
    {
      icon: "Palette",
      title: "Match your server's brand",
      description:
        "Custom colors or a gradient (blurple-friendly by default), rounded dot and eye styles, and a printable frame with a 'Scan to join' label so it looks like part of your community.",
    },
    {
      icon: "Image",
      title: "Drop in your server logo",
      description:
        "Add your community icon or emote to the centre with adjustable size and a protected quiet zone, the tool auto-raises error correction so the code still scans around it.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator tracks color contrast, quiet-zone margin and logo coverage as you design, warning you the moment a choice would make the code hard to scan.",
    },
    {
      icon: "Download",
      title: "Print & stream-ready exports",
      description:
        "Download PNG, transparent PNG, SVG, PDF, JPG, WEBP or vector EPS at up to 4096px: sized for flyers, stickers, merch, Twitch panels, overlays and event banners.",
    },
  ],

  benefits: [
    {
      title: "Grow your server offline",
      description:
        "Put a QR on a con table, a flyer, a sticker or a T-shirt and anyone can join in seconds. You reach people who'd never type out a discord.gg code from a poster.",
    },
    {
      title: "Zero broken invite links",
      description:
        "Reading an invite code aloud on stream or printing it in tiny text guarantees typos. A QR transfers the exact link, so every scan lands on the real invite, not a 404.",
    },
    {
      title: "Looks like your community",
      description:
        "With your brand colors, logo and a framed 'Scan to join', the code fits your server's identity and merch instead of looking like a generic black-and-white square.",
    },
    {
      title: "Private by design",
      description:
        "Your invite link is encoded locally in your browser and never leaves your device. No account, no upload, and no server ever sees where your community lives.",
    },
  ],

  howTo: [
    {
      title: "Create an invite in Discord",
      description:
        "In your server, open a channel's invite menu, click 'Edit invite link', and set it to 'never expire' with no maximum uses if you want the QR to last. Copy the link.",
    },
    {
      title: "Paste your invite link",
      description:
        "Drop the discord.gg or discord.com/invite link into the field. The live preview renders a scannable code instantly. No other details needed.",
    },
    {
      title: "Brand and check it",
      description:
        "Open the Design tab for colors, a gradient and a 'Scan to join' frame, add your server logo from the Logo tab, and watch the live scannability badge stay green.",
    },
    {
      title: "Download and share",
      description:
        "Export a high-res PNG or PDF for print, an SVG for infinite scaling, or a transparent PNG for a stream overlay. Test it with your phone before a print run.",
    },
  ],

  formats: {
    input: ["Discord invite link"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Streamers / Creators",
      title: "Twitch panel & overlay",
      description:
        "Add a transparent-background 'Scan to join' QR to a stream overlay, ending screen or Twitch panel so viewers hop into your Discord from the couch without alt-tabbing.",
    },
    {
      audience: "Events / Conventions",
      title: "Booth & flyer sign-ups",
      description:
        "Print the code on a con table tent, banner or handout so foot traffic joins your community on the spot, far more conversions than a typed-out invite in tiny font.",
    },
    {
      audience: "Communities / Clubs",
      title: "Poster & sticker campaigns",
      description:
        "Slap a branded QR on campus posters, café corkboards or sticker packs so local members find and join your Discord without you spelling out the invite code.",
    },
    {
      audience: "Brands / Games",
      title: "Merch & packaging inserts",
      description:
        "Drop the code onto T-shirts, box inserts or product packaging so customers scan their way into your official server, community, or support channel.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens a page saying the invite is invalid or expired.",
      solution:
        "The QR encodes whatever invite you pasted, so this means the invite itself lapsed or hit its use limit in Discord. In your server settings, create a link set to 'never expire' with no maximum uses, then paste that fresh link and re-download the code.",
    },
    {
      problem: "Scanning opens a browser instead of the Discord app.",
      solution:
        "That's Discord's own behaviour, not the QR, the link opens the web invite, which then offers to launch the installed app. If the app is installed, tapping 'Open Discord' hands off correctly. Without it, the invite still works in the browser.",
    },
    {
      problem: "My vanity URL (discord.gg/myserver) won't render a code.",
      solution:
        "Vanity URLs work, but they only stay valid while your server keeps its Level 3 boost perk. Paste the full link exactly as Discord shows it. If it stops working, switch to a standard discord.gg/abc123 invite from the channel invite menu.",
    },
    {
      problem: "The code scans but looks cramped after adding my logo.",
      solution:
        "A large centre logo eats into the code's data area. The tool auto-raises error correction, but if the scannability badge warns you, shrink the logo, add margin, or bump error correction to H in the Design tab until it turns green again.",
    },
  ],

  tips: [
    "Set the invite to 'never expire' with unlimited uses before you generate, so a printed or on-stream QR keeps working long after the event.",
    "Use a transparent-background PNG export for stream overlays and dark Twitch panels so the code blends into your layout instead of sitting on a white box.",
    "Keep strong contrast, a dark code on a light background scans far more reliably than blurple-on-blurple or a code laid over a busy artwork.",
    "Bump error correction to Q or H (or add your logo. The tool does it for you) so the code survives a scuff, a fold or a low-res reprint.",
    "Test the exported code on the actual medium: scan the printed flyer or the on-stream overlay from a few feet away before you commit to a run.",
  ],

  security:
    "Your Discord invite link is encoded into the QR entirely in your browser. It is never uploaded, stored or logged, and there is no account. Remember the finished QR is a static code: it points at the exact invite you paste, so anyone who scans it can open that invite, exactly like clicking the link. If you need to revoke access, delete or expire the invite inside Discord's server settings. The printed code will then simply lead to an 'invalid invite' screen.",

  faq: [
    {
      question: "How do I make a QR code for my Discord server?",
      answer:
        "Create an invite link in your Discord server (open a channel's invite menu and copy the discord.gg link), paste it into this generator, and a scannable QR appears instantly. Optionally brand it with your colors and logo, then download it as PNG, SVG or PDF. Anyone who scans the code opens your server's invite.",
    },
    {
      question: "Is my invite link uploaded or stored anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your invite link is never sent to a server, stored, or logged. There is no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Will the QR code stop working when my invite expires?",
      answer:
        "Yes, the QR points at the exact invite you paste, and if that invite expires or hits its use limit in Discord, the code leads to an 'invalid invite' page. To make a QR that lasts, set your invite to 'never expire' with no maximum uses before generating. If one lapses, paste a fresh invite and re-download the code.",
    },
    {
      question: "Does scanning open the Discord app or a website?",
      answer:
        "Scanning opens the standard Discord invite link. On a phone with the Discord app installed, it hands off to the app's join screen. Without the app, it opens the web invite, which still lets people join or prompts them to install Discord. That behaviour is controlled by Discord, not by the QR.",
    },
    {
      question: "Can I add my server's logo and brand colors?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to join' frame, and drop your server icon or emote into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Can I use my server's vanity URL (discord.gg/myname)?",
      answer:
        "Yes, paste the vanity URL exactly as Discord shows it and the code will encode it. Just remember vanity URLs only stay active while your server keeps its Level 3 boost perk: if you lose it, the vanity link (and any QR pointing at it) stops working, so switch to a standard channel invite.",
    },
    {
      question: "What size should I export for stickers, flyers or a Twitch panel?",
      answer:
        "For stickers, flyers or panels, export a PNG at 1024px or higher: the tool goes up to 4096px. For a stream overlay use a transparent PNG so it sits cleanly on your layout. For anything that may be resized (banners, large prints), use the SVG export, which is vector and stays razor-sharp at any size.",
    },
    {
      question: "Is it really free with no signup or watermark?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many Discord QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked Discord invite form with automatic normalisation of discord.gg, discord.com/invite and vanity URLs, live preview, and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-25",
      change:
        "Added server-logo drop-in with auto error-correction bump, a 'Scan to join' frame with custom call-to-action label, and transparent-background export tuned for stream overlays and Twitch panels.",
    },
    {
      date: "2026-06-30",
      change:
        "Added the real-time contrast + quiet-zone scannability check and clearer guidance on making invites never expire so printed and on-stream codes keep working.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "telegram-qr-code-generator",
    "instagram-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default discordQrCodeGenerator;
