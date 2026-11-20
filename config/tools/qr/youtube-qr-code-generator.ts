import type { Tool } from "@/types";

/**
 * YouTube QR Code Generator: a flagship, single-purpose micro-site over the QR
 * Studio, locked to the "youtube" content type. It turns any YouTube channel,
 * video, Short, playlist or @handle URL into a scannable QR that opens the video
 * or channel in the viewer's YouTube app, the fastest way to convert a poster,
 * end-card, business card, product box or on-stream overlay into a new
 * subscriber or view. Every string is written for the exact queries creators
 * search when they want a branded "Scan to subscribe" or "Scan to watch" code.
 *
 * Honest boundary baked into the copy: this is a STATIC QR. It encodes the exact
 * URL you paste, generated locally in your browser; it cannot count scans,
 * cannot be re-pointed to a different video later, and doesn't force the native
 * app (that's up to the viewer's OS). Nothing is uploaded.
 */
const youtubeQrCodeGenerator: Tool = {
  slug: "youtube-qr-code-generator",
  title: "YouTube QR Code Generator",
  description:
    "Turn any YouTube channel, video, Short or playlist link into a branded, scannable QR code. Add your colors and logo, run a live scan check, and download print-ready PNG, SVG or PDF. 100% in your browser: nothing uploaded.",
  category: "qr-tools",
  icon: "Youtube",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "youtube",

  h1: "YouTube QR Code Generator, Scan to Watch & Subscribe",
  tagline:
    "Paste your channel or video link and get a QR code that opens YouTube straight to your content. Brand it with your colors and logo, verify it scans, and print it on posters, end-cards, business cards and packaging, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI YouTube QR Code Generator turns any YouTube link (a channel, a single video, a Short, a playlist or a modern @handle URL) into one scannable code that sends viewers straight to your content with a camera tap, no typing a long 'youtube.com/watch?v=…' string or spelling out a channel name on camera. Paste the link and the tool normalises it (stripping tracking params, keeping the video ID and timestamp), then hands it to our desktop-grade QR Studio so it looks like your channel, not a generic square: YouTube-red or your own brand colors, a linear or radial gradient, rounded dot and finder-eye styles, your logo or channel avatar dropped into the centre, and a printable frame carrying a 'Scan to subscribe' or 'Scan to watch' call-to-action. A live scannability check runs a real decode on the rendered pixels and a WCAG contrast test as you design, so the pretty code still scans on the first try from a poster across a room or a phone screen mid-stream. Export a crisp PNG, a transparent PNG for overlays and lower-thirds, a true-vector SVG, a print-ready PDF or EPS, or a JPG/WEBP, at 256 up to 4096 pixels, sharp enough for a billboard, a thumbnail, a business card or a shipping box. Because every step (normalising the URL, styling, rendering, validating and exporting) happens locally on your device, the link you encode is never uploaded, logged or stored, and there's no account, watermark or limit. One honest note: this is a static QR that points at the exact URL you paste, so it can't count scans or be re-pointed to a different video after it's printed, regenerate it if your target changes.",

  ctaText: "Generate YouTube QR Code",

  keywords: [
    "youtube qr code generator",
    "youtube qr code",
    "qr code for youtube channel",
    "youtube video qr code",
    "scan to subscribe qr code",
    "qr code for youtube video",
    "youtube channel qr code",
    "subscribe qr code",
    "youtube shorts qr code",
    "qr code with logo youtube",
    "printable youtube qr code",
    "grow youtube subscribers qr",
  ],

  seo: {
    title: "YouTube QR Code Generator, Scan to Subscribe (Free, No Signup) | GigAI Tools",
    description:
      "Free YouTube QR code generator. Paste any channel, video, Short or playlist link to make a scan-to-subscribe QR code, add your logo and brand colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Youtube",
      title: "Any YouTube link, one code",
      description:
        "Channels, single videos, Shorts, playlists and @handle URLs all work. The tool cleans the link (keeps the video ID and start time, drops tracking junk) so scanners land exactly where you want.",
    },
    {
      icon: "UserPlus",
      title: "Built to grow subscribers",
      description:
        "Frame it as 'Scan to subscribe' with a printable call-to-action so a poster, end-card or business card turns a passer-by into a subscriber without them typing your channel name.",
    },
    {
      icon: "Palette",
      title: "Brand it your way",
      description:
        "YouTube-red or your own colors, linear or radial gradients, rounded dot and finder-eye styles, and a framed label, so the code matches your channel art instead of looking generic.",
    },
    {
      icon: "Image",
      title: "Drop in your logo or avatar",
      description:
        "Place your channel avatar or logo in the centre with adjustable size and a protected quiet zone. The tool auto-raises error correction so the code stays scannable.",
    },
    {
      icon: "ScanLine",
      title: "Live scan + contrast check",
      description:
        "A real-time validator decodes the rendered code and checks WCAG contrast and quiet-zone as you design, warning you the instant a color or logo choice would break the scan.",
    },
    {
      icon: "Download",
      title: "Print & stream-ready exports",
      description:
        "Download PNG, transparent PNG (great for overlays and lower-thirds), scalable SVG, print-ready PDF or vector EPS at up to 4096px, for posters, thumbnails, cards or packaging.",
    },
  ],

  benefits: [
    {
      title: "More subscribers from offline reach",
      description:
        "Every flyer, event booth, product box and end-screen becomes a one-tap route to your channel. No one has to remember a handle or squint at a URL, so more of them actually arrive.",
    },
    {
      title: "Zero-friction on stream and on screen",
      description:
        "A transparent QR overlay on a video, livestream or presentation lets viewers point their phone at the screen and subscribe without pausing to type. Friction that quietly loses conversions is gone.",
    },
    {
      title: "Looks like part of your channel",
      description:
        "With your palette, avatar and a framed 'Scan to subscribe' label, the code fits your thumbnails and channel banner instead of clashing as a black-and-white afterthought.",
    },
    {
      title: "Private and free, no account",
      description:
        "The link is encoded locally in your browser and never uploaded. No signup, no watermark, no limit, and no tracking pixel on you or your viewers.",
    },
  ],

  howTo: [
    {
      title: "Paste your YouTube link",
      description:
        "Copy your channel, video, Short or playlist URL from the address bar or the Share button and paste it in. The tool normalises it so the QR opens the right content.",
    },
    {
      title: "Brand and frame it",
      description:
        "Open the Design tab to set YouTube-red or your own colors, pick dot and eye styles, and add a 'Scan to subscribe' frame. Drop your logo or avatar in from the Logo tab.",
    },
    {
      title: "Confirm it scans",
      description:
        "Watch the live scannability badge, then test the on-screen code with your own phone camera before you print. Check it works at the distance viewers will actually scan from.",
    },
    {
      title: "Download and place it",
      description:
        "Export a high-res PNG or PDF for print, a transparent PNG for a video overlay, or an SVG for infinite scaling, then add it to your poster, end-card, card or packaging.",
    },
  ],

  formats: {
    input: ["YouTube channel / video / Short / playlist URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Creator / YouTuber",
      title: "End-card & thumbnail 'subscribe' code",
      description:
        "Add a QR to your video end-screen, community posts or merch so viewers on a second device subscribe in one tap, turning watch-time into a channel following you keep.",
    },
    {
      audience: "Business / Marketing",
      title: "Product & packaging how-to videos",
      description:
        "Print a QR on the box, manual or shelf-talker that opens your unboxing or setup video, so customers watch the demo instead of calling support or leaving a confused review.",
    },
    {
      audience: "Events / Speakers",
      title: "Talk recording & booth reel",
      description:
        "Put a 'Scan to watch the recording' code on slides, a booth banner or a handout so attendees save your session or showreel to their phone before they walk away.",
    },
    {
      audience: "Musician / Podcaster",
      title: "Poster & flyer to the latest drop",
      description:
        "Send fans from a gig poster, sticker or flyer straight to your newest music video or episode playlist. No searching, no wrong channel, just an instant play.",
    },
  ],

  troubleshooting: [
    {
      problem: "The code opens the browser instead of the YouTube app.",
      solution:
        "That's the viewer's OS choice, not the QR, Android and iOS decide whether a youtube.com link opens in-app or in the browser based on the user's installed apps and settings. The link still lands on the exact video or channel either way. There's no way for any static QR to force the native app.",
    },
    {
      problem: "The scan goes to the wrong video or a channel homepage.",
      solution:
        "Paste the full link from the Share button rather than a shortened or hand-typed one, and re-copy after you set a start time or pick a specific video. For a single video use the watch URL. For the channel use its /@handle URL so it doesn't default to a search.",
    },
    {
      problem: "The code scans but nothing happens.",
      solution:
        "Increase contrast (a dark code on a light background scans best), enlarge the quiet-zone margin, and if you added a logo let the tool raise error correction to Q or H. Then re-run the live scan check and test with a real phone camera.",
    },
    {
      problem: "My timestamp (start at 1:30) is being ignored.",
      solution:
        "Use a link that carries the time parameter (e.g. ends in '&t=90s'). Some Shorts and channel URLs don't support a start time. If the '&t=' part is stripped, the platform doesn't accept it for that link type, not the QR.",
    },
  ],

  tips: [
    "Add a short 'Scan to subscribe' label with the frame option: telling people what the code does measurably lifts scan rate over a bare square.",
    "For a video overlay or lower-third, export a transparent PNG so the code sits cleanly over your footage without an ugly white box.",
    "Bump error correction to Q or H (or add your avatar. The tool does it for you) so the code survives a fold, a scuff or compression on a thumbnail.",
    "Test the scan from the real distance: a poster code needs to be far larger than a business-card code to read from across a room.",
    "Link a playlist rather than one video when you want binge-watching: the QR sends fans into a queue instead of a single clip.",
  ],

  security:
    "Your YouTube link is normalised and encoded into the QR entirely in your browser. It is never uploaded, stored or logged, and there is no account. The finished code is a static QR: it points at the exact URL you paste, so it cannot count scans, cannot be edited to a new video after printing, and carries no tracking of you or the people who scan it. If your target changes, regenerate the code. Because a YouTube URL is public by nature, there's nothing sensitive in the code itself, anyone who scans it simply opens the public page you chose.",

  faq: [
    {
      question: "How do I make a QR code for my YouTube channel?",
      answer:
        "Open your channel, copy its URL from the address bar or the Share button (the modern form looks like youtube.com/@yourhandle), and paste it here. The tool builds a scannable QR that opens your channel directly, and you can brand it and download a print-ready file in seconds.",
    },
    {
      question: "Can I make a QR code for a specific video or a Short?",
      answer:
        "Yes. Paste any single-video watch link, a Short URL or a playlist link. The generator keeps the video ID (and a start time if the link includes one), so scanning takes viewers to that exact video or Short rather than your channel homepage.",
    },
    {
      question: "Will scanning the code open the YouTube app or a browser?",
      answer:
        "That depends on the viewer's phone. Android and iOS decide whether a youtube.com link opens in the installed app or the browser based on the user's apps and settings. No static QR code can override that. Either way the scan lands on the exact video or channel you encoded.",
    },
    {
      question: "Can I add my logo or channel avatar and brand colors?",
      answer:
        "Absolutely. Use the Design tab for YouTube-red or your own colors, gradients and rounded dot/eye styles, add a 'Scan to subscribe' frame, and drop your logo or avatar into the centre from the Logo tab. The live scannability check keeps your branding from breaking the scan and auto-raises error correction when you add a logo.",
    },
    {
      question: "Does this QR code track how many people scan or subscribe?",
      answer:
        "No, and we're upfront about it. This is a static QR that encodes your link directly, with no server or redirect in the middle, so it can't count scans or measure conversions. That also means total privacy: nothing about you or your viewers is tracked. For scan analytics you'd need a dynamic-QR service that routes through its own domain.",
    },
    {
      question: "Can I change the video the code points to after I've printed it?",
      answer:
        "No. Because it's a static QR with no redirect, the code always opens the exact URL you paste now. If you need to point it somewhere new, generate a fresh code and reprint. The upside is that it never expires, never depends on a third-party service staying online, and can't be hijacked.",
    },
    {
      question: "What size and format should I export for a poster or a video overlay?",
      answer:
        "For print (posters, cards, packaging) export a PNG or PDF at 1024px or higher (the tool goes to 4096px), or an SVG that stays razor-sharp at any size. For a video overlay or livestream lower-third, export a transparent PNG so the code layers cleanly over your footage.",
    },
    {
      question: "Is it really free, with no signup or watermark?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many YouTube QR codes as you like. Everything runs client-side in your browser, so there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: locked YouTube link form with URL normalisation (channel, video, Short, playlist, @handle), live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-25",
      change:
        "Added a 'Scan to subscribe' frame with custom call-to-action label, logo/avatar drop-in with automatic error-correction bump, and the real-time decode + WCAG contrast scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved handling of Shorts and timestamped links, transparent-PNG export tuned for video overlays, and clearer guidance on app-vs-browser open behaviour.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "instagram-qr-code-generator",
    "url-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default youtubeQrCodeGenerator;
