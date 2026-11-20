import type { Tool } from "@/types";

/**
 * Video QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio, locked to the "video" content type. It turns the URL of a hosted or
 * streamed video, an MP4 on your own server or CDN, a Vimeo or Wistia link, a
 * Loom, a Google Drive or Dropbox share, an HLS/embed page: into a scannable
 * QR that opens the clip in the viewer's browser or player with a camera tap.
 * Every string is written for the exact queries people search when they want a
 * "scan to watch" code on packaging, a poster, a wedding invite, a manual, a
 * product hang-tag or a real-estate sign.
 *
 * Honest boundary baked into the copy: this is a STATIC QR. It encodes the exact
 * video URL you paste, generated locally in the browser; it does NOT host or
 * upload your video, cannot count scans, and cannot be re-pointed after it's
 * printed. The clip must already live somewhere reachable (your CDN, a video
 * host, a cloud-share link) and stay public for the code to keep working.
 */
const videoQrCodeGenerator: Tool = {
  slug: "video-qr-code-generator",
  title: "Video QR Code Generator",
  description:
    "Turn a hosted or streamed video link into a branded, scannable QR code so anyone can scan to watch. Add your colors and logo, run a live scan check, and export print-ready PNG, SVG or PDF. 100% in your browser. The link is never uploaded and your video isn't hosted here.",
  category: "qr-tools",
  icon: "Video",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-16",
  illustration: "video",

  h1: "Video QR Code Generator: Scan to Watch, Anywhere",
  tagline:
    "Paste the link to a video you've already hosted (an MP4 on your CDN, a Vimeo, Loom, Wistia, Drive or Dropbox share) and get a QR code that opens it with a camera tap. Brand it with your colors and logo, verify it scans, and print it on packaging, posters, invites and manuals, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Video QR Code Generator turns a link to a video you've already put online into a single scannable code that plays the clip the moment someone points their camera at it. No typing a long URL, no 'search for our channel'. Paste the address of a self-hosted MP4/WEBM on your own server or CDN, a Vimeo or Wistia page, a Loom recording, an unlisted stream, or a shared file on Google Drive, Dropbox or OneDrive, and the tool hands that URL to our desktop-grade QR Studio so it looks like yours, not a generic square: brand colors or a linear/radial gradient, rounded dot and finder-eye styles, your logo or a play-button mark dropped into the centre, and a printable frame carrying a 'Scan to watch' call-to-action. A live scannability check runs a real jsQR decode on the rendered pixels plus a WCAG contrast test as you design, so the styled code still scans on the first try, off a product box, a poster across a room, or a phone screen. Export a crisp PNG, a transparent PNG for overlays, a true-vector SVG, a print-ready PDF or EPS, or a JPG/WEBP, from 256 up to 4096 pixels (sharp enough for a billboard, a hang-tag or a business card. Because every step) building the payload, styling, rendering, validating and exporting, happens locally on your device, the link you encode is never uploaded, logged or stored, and there's no account, watermark or limit. One honest, important note: this tool encodes a link to your video. It does not host, upload or stream the video itself. Your clip must already live somewhere reachable on the web, and the QR is static, so it points at the exact URL you paste and can't be re-targeted or scan-counted after printing. If you might move the file later, encode a stable link on a domain you control and change where it points on your side.",

  ctaText: "Generate Video QR Code",

  keywords: [
    "video qr code generator",
    "qr code for video",
    "scan to watch qr code",
    "qr code to play video",
    "mp4 qr code",
    "vimeo qr code",
    "loom qr code",
    "qr code video link",
    "qr code for hosted video",
    "video qr code with logo",
    "qr code for product video",
    "wedding video qr code",
  ],

  seo: {
    title:
      "Video QR Code Generator, Scan to Watch a Hosted Video (Free, No Signup) | GigAI Tools",
    description:
      "Free video QR code generator. Paste a hosted or streamed video link (MP4, Vimeo, Loom, Drive) to make a scan-to-watch QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, link never uploaded, video not hosted here.",
  },

  features: [
    {
      icon: "Video",
      title: "Scan straight to your video",
      description:
        "Encodes your video's URL so a camera scan opens it in the phone's browser or the host's player: a product demo, tutorial, testimonial or highlight reel is one tap away, with no link to type.",
    },
    {
      icon: "Link",
      title: "Works with any video host",
      description:
        "Self-hosted MP4/WEBM on your CDN, Vimeo, Wistia, Loom, an unlisted stream, or a Google Drive / Dropbox / OneDrive share. If it has a public URL, this turns it into a QR.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to watch' label so the code looks designed, not like an afterthought.",
    },
    {
      icon: "Image",
      title: "Drop in a logo or play mark",
      description:
        "Add your logo or a play-button glyph to the centre with adjustable size and a protected quiet zone: the tool auto-recommends higher error correction so it still scans reliably.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator runs an on-canvas decode and a WCAG contrast test, warning you the instant a color choice, logo size or inversion would stop scanners from reading the code.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for packaging, a poster, a hang-tag, a manual page or a shipping box.",
    },
  ],

  benefits: [
    {
      title: "Bridge print to a moving picture",
      description:
        "A flat page can't play a demo. A video QR lets a poster, box, flyer or business card open a real clip on the viewer's phone, turning static print into a play button.",
    },
    {
      title: "No typing, no wrong link",
      description:
        "Video URLs are long and easy to mistype. A scan transfers the exact address, so viewers land on your clip instead of a 404 or a search page for the wrong upload.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, a logo and a framed 'Scan to watch' call-to-action, the code fits your packaging or collateral instead of sitting there as a plain black-and-white square.",
    },
    {
      title: "Private and free, forever",
      description:
        "The link is encoded locally in your browser and never uploaded, and there's no account, watermark or expiry. The static code keeps working as long as your video URL stays live.",
    },
  ],

  howTo: [
    {
      title: "Host your video first",
      description:
        "Upload the clip to your own server/CDN, Vimeo, Wistia, Loom, or a cloud share, and copy its public link. This tool encodes that link. It doesn't host the video itself.",
    },
    {
      title: "Paste the video URL",
      description:
        "Drop the link into the field and the QR previews live. Use the direct, shareable URL, the one that actually plays in a browser, not an admin or 'edit' page.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab for colors or a gradient and dot/eye styles, add a 'Scan to watch' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans, then export",
      description:
        "Watch the live scannability badge and test the on-screen code with your phone. When it passes, download a high-res PNG or PDF for print, or an SVG for infinite scaling.",
    },
  ],

  formats: {
    input: ["Hosted / streamed video URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Brand / Packaging",
      title: "Scan-to-watch product demo",
      description:
        "Print a QR on the box or hang-tag that opens an unboxing or how-to-use video, so shoppers see the product in action at the shelf without hunting for your channel.",
    },
    {
      audience: "Real-estate agent",
      title: "Video walkthrough on the yard sign",
      description:
        "Put a code on the 'For Sale' board or the flyer that opens a full walkthrough tour, letting buyers preview the whole home from the kerb before they book a viewing.",
    },
    {
      audience: "Couples / Events",
      title: "Wedding & event highlight reel",
      description:
        "Add a QR to thank-you cards or the guest book that plays your highlight film or a message, so friends and family watch the moment straight from a printed keepsake.",
    },
    {
      audience: "Manuals / Support",
      title: "Setup tutorial on the instruction sheet",
      description:
        "Replace a wall of text with a 'Scan to watch setup' code on the quick-start guide, cutting support tickets by showing the assembly or install as a short video.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens a page but the video won't play.",
      solution:
        "You likely encoded a share/edit page instead of a playable link. Open the URL yourself in a fresh browser tab: if it doesn't play there, it won't after scanning. Use the direct video URL or the host's public 'watch' page, and make sure the video's sharing is set to public or 'anyone with the link'.",
    },
    {
      problem: "It worked at first, now the code is dead.",
      solution:
        "A static QR points at the exact URL you encoded. If you deleted, moved or re-uploaded the video, or the file/host link expired, the code breaks. Re-host at a stable address and regenerate the QR, or, for anything you'll reprint, encode a permanent link on a domain you control and redirect it on your side.",
    },
    {
      problem: "My cloud-share link downloads the file instead of playing it.",
      solution:
        "Google Drive, Dropbox and OneDrive often serve a preview or download page rather than a direct stream. Use each service's 'preview'/'watch' link (or a proper video host like Vimeo) so phones play it inline. Test on both an iPhone and an Android before printing.",
    },
    {
      problem: "My styled or logo'd code won't scan.",
      solution:
        "Check the live scan-test badge. Raise the contrast (dark code on a light background), keep a generous quiet-zone margin, shrink the logo, and set error correction to Q or H when using a logo: the tool bumps it for you and warns the moment a choice would break scanning.",
    },
  ],

  tips: [
    "Encode a stable link you control (your own domain or a permanent host URL) so you can move or replace the actual video later without reprinting the QR.",
    "Test the exact link in a private browser window first: if it plays there for a stranger, it'll play after a scan. If it asks to log in, viewers will hit the same wall.",
    "Prefer a real video host (Vimeo, Wistia) or a direct MP4 over Drive/Dropbox share pages, which sometimes force a download instead of inline playback on phones.",
    "Adding a logo or a play-button mark? Keep it under ~25% of the width and let the tool raise error correction to H so the code still scans.",
    "For print, export SVG or PDF so the code stays razor-sharp on packaging, posters and signage at any size.",
  ],

  security:
    "Your video link is turned into a QR code entirely in your browser. It is never uploaded, stored or logged, and there is no account. Just as importantly, your video itself is never sent here: this tool only encodes a link to a clip you host elsewhere, so nothing of yours passes through a server. Remember the finished code is static and public: anyone who scans the printed QR reaches whatever the URL points to, so only encode a video you're comfortable sharing, and keep its host link private (unlisted/link-only) if it isn't meant for everyone.",

  faq: [
    {
      question: "Does this host or upload my video?",
      answer:
        "No, and this is the key thing to understand. This tool does not host, upload or store your video. It only turns a link to a video you've already put online into a QR code. Your clip must already live somewhere reachable (your own server or CDN, Vimeo, Wistia, Loom, or a cloud-share link) and that page is what the scan opens. Nothing of yours (not the video, not even the link) leaves your browser.",
    },
    {
      question: "What video links work with this generator?",
      answer:
        "Any public URL that plays a video: a self-hosted MP4 or WEBM on your website/CDN, a Vimeo or Wistia page, a Loom recording, an unlisted or embed stream, or a shared file on Google Drive, Dropbox or OneDrive. If you can open the link in a browser and it plays, the QR will take viewers to the same place. Direct video files and dedicated video hosts play most reliably on phones.",
    },
    {
      question: "Why not just use a YouTube QR code?",
      answer:
        "If your video is on YouTube, use our YouTube QR Code Generator. It normalises YouTube links and can open the app. This tool is for videos hosted anywhere else: an MP4 on your own CDN, a Vimeo/Wistia/Loom link, or a cloud-share URL. Use it when you want your video to open directly in the browser or the host's player rather than routing through YouTube.",
    },
    {
      question: "Will the QR play the video automatically when scanned?",
      answer:
        "Scanning opens the URL you encoded in the phone's browser (or, for some hosts, their app). Whether the video then autoplays depends entirely on the host and the phone's settings: many browsers require a tap to start playback to save data. A direct MP4 or a proper video-host page gives the smoothest 'scan and it's right there' experience.",
    },
    {
      question: "Can I change the video later without reprinting the code?",
      answer:
        "Not directly. This is a static QR that encodes the exact link you paste, because the tool has no server or database to redirect through. If you move or replace the video, the code breaks. The honest workaround is to encode a permanent link on a domain or link-shortener you control, then repoint that link on your side whenever the target changes. The printed QR keeps working.",
    },
    {
      question: "Can I track how many people scan my video QR code?",
      answer:
        "Not from this tool: a static QR has no analytics, and we don't run a server to count scans, which is exactly why it's private and free. If you need scan counts, encode a link you own that has its own analytics (your website page, or a tracking-capable short link you manage), and put that link's URL into the generator.",
    },
    {
      question: "Can I add my logo and brand colors to the video QR?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to watch' frame, and drop your logo or a play-button mark into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "What resolution should I export for printing on packaging?",
      answer:
        "For a box, hang-tag, flyer or poster, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For anything that may be resized, or for professional print, use the SVG or PDF export, which are vector and stay razor-sharp at any physical size.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: locked video content form (hosted/streamed video URL), live preview, and print-ready PNG/transparent-PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-23",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to watch' frame with a custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer host guidance for direct-MP4 vs. Drive/Dropbox share links, plus troubleshooting for cloud links that download instead of playing inline.",
    },
  ],

  relatedTools: [
    "youtube-qr-code-generator",
    "qr-code-generator",
    "instagram-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default videoQrCodeGenerator;
