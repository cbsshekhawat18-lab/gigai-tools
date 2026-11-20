import type { Tool } from "@/types";

/**
 * Zoom QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "zoom" content type). It turns a Zoom meeting *join*
 * URL into a scannable QR so attendees open the meeting on their phone by
 * pointing the camera at a screen, badge, poster or invite. No typing a nine
 * or ten-digit Meeting ID and a passcode by hand. Every string here targets the
 * exact queries people search when they want a "scan to join" code for a
 * webinar, a hybrid all-hands, a lobby sign or a printed conference badge.
 *
 * Honest boundary baked into the copy: the QR encodes the real Zoom join link
 * you paste (the `https://zoom.us/j/…?pwd=…` URL, personal room, or webinar
 * registration link) as a static code, built locally in the browser. It is not
 * "dynamic". It can't rotate to a new meeting after printing, and it doesn't
 * host or track scans, but it is exactly the link you provide, so anyone who
 * scans it lands in that meeting's join flow.
 */
const zoomQrCodeGenerator: Tool = {
  slug: "zoom-qr-code-generator",
  title: "Zoom QR Code Generator",
  description:
    "Turn a Zoom meeting join link into a scannable QR code so people open the meeting on their phone in one tap. No typing Meeting IDs or passcodes. Brand it, add a logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "Video",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "zoom",

  h1: "Zoom QR Code Generator, Scan to Join the Meeting",
  tagline:
    "Paste your Zoom join link once and get a QR code that opens the meeting the instant a phone scans it. No nine-digit Meeting ID, no passcode typed by hand. Brand it, add your logo, and print it for webinars, hybrid rooms, lobby signs and event badges, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Zoom QR Code Generator turns a Zoom meeting join URL into a single scannable code that iPhones and Android phones open natively: point the camera, tap the banner, and the Zoom app (or the browser) launches straight into that meeting's join flow. No reading out a ten-digit Meeting ID, no dictating a passcode, no attendees fumbling to type both correctly before the session starts. Paste any real Zoom link: a standard meeting invite like https://zoom.us/j/1234567890?pwd=… with the passcode embedded, your Personal Meeting Room link, a company vanity URL such as https://yourco.zoom.us/j/…, or a webinar registration link, and the tool hands it to our desktop-grade QR Studio so you can make it look like yours: custom colors or a gradient, rounded dot and eye styles, your company or event logo dropped into the centre, a printable frame with a 'Scan to join' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a code that looks great on a dark keynote slide still scans on the first try from the back of the room. Because everything (encoding, styling and export) happens locally in your browser, the link you paste is never sent to a server, stored or logged. Two honest notes: embed the passcode in the link (Zoom's default one-click links do this via the ?pwd= parameter) so scanners don't get stopped by a passcode prompt, and remember this is a static code. It encodes the exact link you paste now, so if you spin up a new meeting for next week, generate a fresh QR.",

  ctaText: "Generate Zoom QR Code",

  keywords: [
    "zoom qr code generator",
    "zoom qr code",
    "qr code for zoom meeting",
    "scan to join zoom",
    "zoom meeting qr code",
    "zoom join link qr code",
    "generate zoom qr code",
    "webinar qr code",
    "zoom qr code with logo",
    "printable zoom qr code",
    "qr code for zoom link",
    "hybrid meeting qr code",
  ],

  seo: {
    title: "Zoom QR Code Generator: Scan to Join a Meeting (Free, No Signup) | GigAI Tools",
    description:
      "Free Zoom QR code generator. Paste your Zoom meeting join link to make a scan-to-join QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser: your link is never uploaded.",
  },

  features: [
    {
      icon: "Video",
      title: "One-tap scan-to-join",
      description:
        "Encodes your Zoom join URL so a phone camera shows a tap-to-open banner that launches the meeting in the Zoom app. No ten-digit Meeting ID or passcode typed by hand before the session starts.",
    },
    {
      icon: "KeyRound",
      title: "Passcode baked into the link",
      description:
        "Paste a one-click link with the ?pwd= parameter (Zoom generates these by default) and the QR opens straight through: attendees skip the separate passcode prompt entirely.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to join' label so the code looks designed for your webinar, not generic.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add your company or event logo to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so it still scans reliably.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, vital when the code lives on a dark slide and gets scanned from across a room.",
    },
    {
      icon: "Download",
      title: "Print- and slide-ready exports",
      description:
        "Download PNG, transparent PNG (perfect over a keynote background), scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp on a projector, a poster, a badge or a lobby screen.",
    },
  ],

  benefits: [
    {
      title: "Attendees join in seconds",
      description:
        "Drop the code on a slide, a lobby sign or a printed badge and people join by pointing their camera. No reading a Meeting ID aloud digit by digit while the clock runs on your session.",
    },
    {
      title: "Zero typos on IDs and passcodes",
      description:
        "A ten-digit ID plus a passcode is easy to fat-finger. The QR carries the exact link, so nobody mistypes a 0 for an O or lands in the wrong meeting and blames the invite.",
    },
    {
      title: "Looks like part of your event",
      description:
        "With your colors, logo and a framed 'Scan to join' call-to-action, the code fits a conference deck or a branded stage backdrop instead of looking like a raw black-and-white square.",
    },
    {
      title: "Private by design",
      description:
        "Your Zoom link is encoded locally in your browser and never leaves your device. No account, no upload, no server ever sees which meeting you're sharing.",
    },
  ],

  howTo: [
    {
      title: "Copy your Zoom join link",
      description:
        "In Zoom, open the meeting and use 'Copy Invite Link' (or copy your Personal Meeting Room / webinar registration URL). Use the one-click link with the passcode embedded so scanners join without a second prompt.",
    },
    {
      title: "Paste it in",
      description:
        "Drop the link into the field. The live preview builds the QR instantly, verify it's the full https://…zoom.us/j/… URL, including the ?pwd= part if your meeting has a passcode.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan to join' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge, then test the on-screen code with your own phone: confirm it opens the right meeting before you put it on a slide or send it to print.",
    },
    {
      title: "Download and share",
      description:
        "Export a transparent PNG for slides, a high-resolution PNG or PDF for print, or an SVG for infinite scaling. Add it to your deck, badge, poster or lobby screen.",
    },
  ],

  formats: {
    input: ["Zoom meeting join URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Webinar / Event Host",
      title: "'Scan to join' holding slide",
      description:
        "Put the QR on the pre-session holding slide and a poster by the door so latecomers and walk-ups join on their phone without hunting for the invite email or typing the ID.",
    },
    {
      audience: "Hybrid Office",
      title: "Meeting-room join card",
      description:
        "Print a code for a recurring room link or a stand-up, and stick it by the conference-room display so in-person and remote colleagues jump into the same call in one tap.",
    },
    {
      audience: "Educator / Trainer",
      title: "Class or office-hours link",
      description:
        "Add a QR to your syllabus, slide deck or classroom sign so students open your Zoom room instantly, great for office hours, guest lectures and hybrid sessions.",
    },
    {
      audience: "Conference / Trade Show",
      title: "Badge & booth 'join the session'",
      description:
        "Route booth visitors or badge holders into a live demo, panel or virtual session by scanning a branded code on signage, a lanyard card or a handout.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning opens Zoom but still asks for a passcode.",
      solution:
        "Your link probably doesn't include the embedded passcode. In Zoom use 'Copy Invite Link' (the one-click link) so the URL ends with ?pwd=…, or enable 'Embed passcode in invite link for one-click join' in Meeting settings, then regenerate the QR.",
    },
    {
      problem: "The QR opens the browser instead of the Zoom app.",
      solution:
        "That's expected on devices without the Zoom app installed, Zoom's web page then offers 'Launch Meeting' or 'Join from browser'. For a smoother experience, tell attendees to install the Zoom app first. The same link deep-links straight into it when present.",
    },
    {
      problem: "It joins the wrong meeting or an old one.",
      solution:
        "This is a static code. It encodes the exact link you pasted. If you scheduled a new meeting (a new Meeting ID), the old QR still points at the previous one, so generate a fresh code from the new join link.",
    },
    {
      problem: "The code won't scan from my slide.",
      solution:
        "Keep strong contrast and quiet-zone margin: a light QR on a dark slide often needs a solid light panel behind it. Watch the live scannability badge, raise error correction, and make the code large enough to read from the back of the room.",
    },
  ],

  tips: [
    "Always use Zoom's one-click 'Copy Invite Link' so the passcode is embedded in the URL, attendees then join in a single tap with no passcode prompt.",
    "For slides, export a transparent PNG so the code sits cleanly over any keynote background without an ugly white box around it.",
    "Bump error correction to Q or H (or add your logo. The tool does this for you) so the code still scans if a projector is slightly out of focus or a printed badge gets creased.",
    "Make it big: a code on a stage screen or lobby sign should be large with a clear margin so people can scan it from several metres away.",
    "For a recurring room, use your Personal Meeting Room link or a scheduled recurring-meeting link so one printed QR keeps working session after session.",
  ],

  security:
    "Your Zoom join link is encoded into the QR entirely in your browser. It is never uploaded, stored or logged, and there is no account. Remember the finished QR is a static link: anyone who scans the printed or displayed code can attempt to join that meeting, exactly like forwarding the invite URL. If your link has the passcode embedded (via ?pwd=), the passcode travels with the code too, so display or print it only where your intended audience will see it, and protect sensitive meetings with a waiting room or registration rather than relying on the passcode alone.",

  faq: [
    {
      question: "How does a Zoom QR code work?",
      answer:
        "It stores your Zoom meeting join URL as a QR. When a modern phone camera scans it, the OS recognises the link and offers a one-tap banner. Tapping it opens the Zoom app (or Zoom in the browser) straight into that meeting's join flow, so nobody has to type a ten-digit Meeting ID or a passcode by hand.",
    },
    {
      question: "Will the passcode be included automatically?",
      answer:
        "Only if it's part of the link you paste. Zoom's one-click 'Copy Invite Link' produces a URL with the passcode embedded as a ?pwd= parameter, and a QR of that link joins in a single tap. If you paste a bare zoom.us/j/<id> link without ?pwd=, the scanner will open Zoom but still prompt for the passcode.",
    },
    {
      question: "Is my Zoom link uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. The link you paste is never sent to a server, stored, or logged. There is no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Will it work on both iPhone and Android?",
      answer:
        "Yes. Recent iPhones and Android phones read QR codes with the built-in camera app and show a tap-to-open banner. If the Zoom app is installed the link deep-links straight into it. If not, Zoom's web page offers 'Launch Meeting' or joining from the browser.",
    },
    {
      question: "Can I use my Personal Meeting Room or a webinar link?",
      answer:
        "Absolutely. Paste any real Zoom URL: a standard meeting invite, your Personal Meeting Room link, a company vanity link like yourco.zoom.us/j/…, or a webinar registration link. The QR encodes whatever join URL you provide.",
    },
    {
      question: "Is the Zoom QR code dynamic: can I point it at a new meeting later without reprinting?",
      answer:
        "No, and we're honest about that: this is a static QR that encodes the exact link you paste now, because the tool has no server or database to redirect through. If you schedule a new meeting with a new Meeting ID, generate and reprint a fresh code. For a link that never changes, use your Personal Meeting Room or a recurring-meeting URL. The upside is total privacy: nothing is hosted or tracked.",
    },
    {
      question: "Can I add my logo and brand colors to the Zoom QR?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to join' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "What should I export for slides versus print?",
      answer:
        "For a keynote or webinar slide, export a transparent PNG so the code sits over any background cleanly. For a badge, poster or handout, export PNG or PDF at 1024px or higher (up to 4096px), or use SVG for signage that may be resized, since it's vector and stays razor-sharp at any size.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: locked Zoom join-URL form, live preview, and print- and slide-ready PNG/transparent PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px, all generated in the browser.",
    },
    {
      date: "2026-06-25",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to join' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check tuned for dark presentation slides.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved guidance on embedding the passcode via one-click links, plus clearer troubleshooting for app-vs-browser join behaviour and static-link reuse.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "url-qr-code-generator",
    "vcard-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default zoomQrCodeGenerator;
