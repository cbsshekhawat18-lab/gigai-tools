import type { Tool } from "@/types";

/**
 * Spotify QR Code Generator: a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "spotify" content type). It turns any Spotify link: a
 * track, album, artist, playlist, podcast or episode URL: into a scannable QR
 * that opens straight in the Spotify app or the web player. Every string here is
 * written for the exact queries people search when they want to put "scan to
 * listen" on a poster, a gig flyer, a merch table, an album insert, a wedding
 * playlist card or an Instagram Story.
 *
 * Honest boundary baked into the copy: this encodes the real Spotify URL you
 * paste as a standard QR locally in the browser. It is NOT the official Spotify
 * Code (the colored scannable bar you screenshot inside the app) and it does
 * not track scans. It is a plain, private, permanent QR pointing at your link.
 */
const spotifyQrCodeGenerator: Tool = {
  slug: "spotify-qr-code-generator",
  title: "Spotify QR Code Generator",
  description:
    "Turn any Spotify track, album, artist or playlist link into a scannable QR code. Style it, add your cover art or logo, and download print-ready PNG, SVG or PDF. 100% in your browser: free, no signup.",
  category: "qr-tools",
  icon: "Music",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "spotify",

  h1: "Spotify QR Code Generator. Share Music People Can Scan",
  tagline:
    "Paste a Spotify track, album, artist or playlist link and get a QR code that opens it in the Spotify app on the first tap. Brand it with your cover art, colors and a 'Scan to listen' frame, then download it print-ready, all generated in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Spotify QR Code Generator turns any Spotify link into a QR code your audience can scan to jump straight into the music. No searching your artist name, no typing a playlist title, no dictating a link. Copy the share URL of a track, album, artist, playlist, podcast show or single episode from the Spotify app or web player, paste it in, and the tool encodes it as a standard, universally scannable QR that opens in the Spotify app when it's installed and falls back to the web player when it isn't. From there our desktop-grade QR Studio makes it look like your release instead of a generic black square: pull your palette from the cover art, apply a gradient, round the dots and eyes, drop your album artwork or logo into the centre, wrap it in a printable 'Scan to listen' frame, and export crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for a vinyl insert, a stage backdrop, a tour poster or a business card. A live scannability check watches contrast, quiet-zone and logo coverage as you design so the code stays readable across a dim venue or a phone held at arm's length. Everything (encoding, styling and export) happens locally in your browser, so your link is never uploaded, there's no account, and the QR carries no tracker: it's a plain, private, permanent code that points at your Spotify URL and keeps working as long as that link does. Note this is a standard QR, not Spotify's own in-app colored 'Spotify Code': the trade-off is that you can brand it freely, print it anywhere, and it will scan from any camera or QR app, not just from inside Spotify.",

  ctaText: "Generate Spotify QR Code",

  keywords: [
    "spotify qr code generator",
    "spotify qr code",
    "qr code for spotify",
    "spotify playlist qr code",
    "spotify song qr code",
    "spotify album qr code",
    "scan to listen qr code",
    "generate spotify qr code free",
    "spotify link qr code",
    "spotify artist qr code",
    "music qr code generator",
    "spotify qr code with logo",
  ],

  seo: {
    title: "Spotify QR Code Generator, Scan to Listen (Free, No Signup) | GigAI Tools",
    description:
      "Free Spotify QR code generator. Paste any track, album, artist or playlist link to make a scan-to-listen QR, add your cover art and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser.",
  },

  features: [
    {
      icon: "Music",
      title: "Any Spotify link, one QR",
      description:
        "Works with tracks, albums, artists, playlists, podcast shows and episodes. Paste the share URL and get a code that opens the Spotify app on scan, or the web player if it isn't installed.",
    },
    {
      icon: "Palette",
      title: "Match your cover art",
      description:
        "Pull your release palette in with custom colors or a gradient, round the dots and eyes, and add a 'Scan to listen' frame so the code looks designed to sit next to your artwork.",
    },
    {
      icon: "Image",
      title: "Drop in your artwork or logo",
      description:
        "Place your album cover, artist mark or label logo in the centre with an adjustable size and a protected quiet zone: the tool auto-raises error correction so it still scans.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches contrast, quiet-zone margin and logo coverage as you design, warning you the moment a choice would make the code hard to scan in a dim venue.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: crisp enough for a vinyl insert, tour poster, merch tag, stage screen or story sticker.",
    },
    {
      icon: "ShieldCheck",
      title: "Private, permanent, no tracker",
      description:
        "The QR encodes your real link locally in the browser with no redirect service, no account and no scan tracking. It keeps working for as long as your Spotify link does.",
    },
  ],

  benefits: [
    {
      title: "Fans reach the play button faster",
      description:
        "Put a code on a poster, flyer or merch and listeners point their camera to land on your track or playlist. No spelling your artist name into a search box or copying a long link.",
    },
    {
      title: "One code for the whole release",
      description:
        "A single QR can point at an album, an artist page or a curated playlist, so the same printed asset works across the gig, the merch table and the record insert.",
    },
    {
      title: "Looks like part of your artwork",
      description:
        "With your cover-art colors, logo and a framed call-to-action, the code fits a release's visual identity instead of looking like a black-and-white afterthought slapped on the corner.",
    },
    {
      title: "Private by design",
      description:
        "Your link is encoded locally in your browser and never uploaded. No account, no redirect domain in the middle, and nothing counting who scanned or when.",
    },
  ],

  howTo: [
    {
      title: "Copy your Spotify link",
      description:
        "In Spotify, open the track, album, artist or playlist, tap Share, then 'Copy link'. On the web player you can copy the URL straight from the address bar.",
    },
    {
      title: "Paste it in",
      description:
        "Drop the link into the field and the live preview renders a scannable QR instantly. Any open.spotify.com URL works: track, album, artist, playlist, show or episode.",
    },
    {
      title: "Brand it to your release",
      description:
        "Open the Design tab for colors, a gradient and dot/eye styles, add a 'Scan to listen' frame, and drop your cover art or logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans, then download",
      description:
        "Watch the live scannability badge and test the on-screen code with your phone. Then export a high-resolution PNG or PDF for print, or an SVG for infinite scaling.",
    },
  ],

  formats: {
    input: ["Spotify share link (track / album / artist / playlist / show / episode)"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Musicians / Bands",
      title: "Gig posters & merch",
      description:
        "Add a 'Scan to listen' code to tour posters, flyers, T-shirts and vinyl inserts so people at the show can save your latest single before they've even left the venue.",
    },
    {
      audience: "Playlist curators",
      title: "Shareable playlist cards",
      description:
        "Print a code for a themed playlist (a wedding set, a café mix, a workout list) so guests and customers open the exact playlist without hunting for it by name.",
    },
    {
      audience: "Podcasters",
      title: "Show & episode promotion",
      description:
        "Put a QR on show art, a business card or a slide so listeners jump straight to your podcast or a specific episode instead of searching a crowded directory.",
    },
    {
      audience: "Brands / Cafés",
      title: "In-store ambience & campaigns",
      description:
        "Let customers scan to play the in-store playlist at home, or tie a code into a campaign so a poster or product opens the branded soundtrack you curated.",
    },
  ],

  troubleshooting: [
    {
      problem: "The QR opens a browser instead of the Spotify app.",
      solution:
        "That's expected when the app isn't installed, the link falls back to the Spotify web player. If the app is installed but still opens the browser, the phone's default-app settings are overriding it. The user can choose 'Open in Spotify' from the browser prompt.",
    },
    {
      problem: "Scanning does nothing or opens the wrong page.",
      solution:
        "Make sure you pasted a full open.spotify.com share link, not a shortened link, a search result or an app-only URI. Re-copy it with Share → 'Copy link' inside Spotify, then paste the whole URL.",
    },
    {
      problem: "The code won't scan once I add my cover art.",
      solution:
        "A large logo can cover too many modules. Shrink the logo, keep strong contrast between the code and its background, and let the tool raise error correction to Q or H: the live scannability badge tells you when it's safe.",
    },
    {
      problem: "This doesn't look like the Spotify Code I see in the app.",
      solution:
        "It isn't meant to. Spotify's in-app colored 'Spotify Code' scans only from inside Spotify. This is a standard QR of your link, so it scans from any camera or QR app and you can fully brand and print it, a deliberate, more flexible trade-off.",
    },
  ],

  tips: [
    "Point the code at an artist or playlist page rather than a single track when you want the printed asset to stay relevant after your next release drops.",
    "Sample two or three colors from your cover art for the foreground and gradient so the QR reads as part of the artwork, not an add-on.",
    "Bump error correction to Q or H (or add a logo. The tool does this for you) so the code still scans on textured merch, a folded insert or under stage lighting.",
    "Export SVG for anything that gets resized (stage screens, large-format posters) so it stays razor-sharp at any dimension.",
    "Test the printed code under the real lighting where it'll live (a dim venue, a sunny window) before you commit to a full print run.",
  ],

  security:
    "Your Spotify link is encoded into the QR entirely in your browser. It is never uploaded, stored or logged, there is no account, and the code contains no tracker or redirect domain. Because it points directly at your public Spotify URL, the QR keeps working for as long as that link does, and anyone who scans it simply opens the same page you'd share. This is a standard QR of a public link, not Spotify's in-app colored code, so it can't be revoked or edited after printing: regenerate a new one if your link changes.",

  faq: [
    {
      question: "How do I make a QR code for a Spotify song or playlist?",
      answer:
        "In Spotify, open the track, album, artist or playlist, tap Share, then 'Copy link'. Paste that link into this generator and it instantly renders a scannable QR. Style it if you like, then download a print-ready PNG, SVG or PDF. No signup and nothing is uploaded.",
    },
    {
      question: "Is this the same as a Spotify Code?",
      answer:
        "No. Spotify's own 'Spotify Code' is the colored bar you screenshot inside the app, and it only scans from within Spotify. This tool makes a standard QR code of your link. It scans from any phone camera or QR app, and you can fully brand, color and print it, which the in-app code doesn't allow.",
    },
    {
      question: "Will the QR open the Spotify app or a web page?",
      answer:
        "If the person scanning has the Spotify app installed, the link opens directly in the app. If they don't, it falls back gracefully to the Spotify web player in their browser, so nobody hits a dead end either way.",
    },
    {
      question: "Does it work for artists, podcasts and albums too?",
      answer:
        "Yes. Any open.spotify.com share link works, tracks, albums, artist pages, playlists, podcast shows and individual episodes. Paste whichever URL you want people to land on and the QR points straight at it.",
    },
    {
      question: "Is my link uploaded or is scanning tracked?",
      answer:
        "No. The QR is generated entirely in your browser, so your link is never sent to a server, and there is no redirect domain or analytics counting scans. It's a plain, private QR that points directly at your public Spotify URL.",
    },
    {
      question: "Can I add my cover art or logo to the code?",
      answer:
        "Absolutely. Use the Logo tab to drop your album cover, artist mark or label logo into the centre, and the Design tab for cover-art colors, a gradient and rounded styles. The live scannability check keeps your branding from breaking the code and raises error correction automatically when you add a logo.",
    },
    {
      question: "Will the QR still work after I release new music?",
      answer:
        "Yes, the code points at whatever Spotify URL you encoded, permanently. If you point it at an artist or playlist page, new releases appear there automatically. If you encoded a single track and later want a different destination, just generate a fresh QR for the new link.",
    },
    {
      question: "Is it really free with no signup or watermark?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many Spotify QR codes as you like. Because it all runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked Spotify link form (track / album / artist / playlist / show / episode), live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-25",
      change:
        "Added cover-art logo drop-in with automatic error-correction bump, a 'Scan to listen' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer guidance on app-vs-web-player fallback and the difference from Spotify's in-app codes, plus refined troubleshooting for shortened and app-only links.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "youtube-qr-code-generator",
    "instagram-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default spotifyQrCodeGenerator;
