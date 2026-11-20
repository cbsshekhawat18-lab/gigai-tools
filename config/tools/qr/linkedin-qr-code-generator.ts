import type { Tool } from "@/types";

/**
 * LinkedIn QR Code Generator: a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "linkedin" content type). It turns a LinkedIn profile,
 * company page or custom public URL into a scannable QR that connections open by
 * pointing a phone camera, the fastest way to swap profiles at an event without
 * spelling out a vanity URL or fumbling with the app's own scanner. Every string
 * here targets the exact queries people search when they want a QR for a
 * conference badge, a business card, an email signature, a slide or a booth.
 *
 * Honest boundary baked into the copy: the QR encodes your real LinkedIn URL in
 * plain text locally in the browser. It is a static link code, not a tracked or
 * "dynamic" redirect, and nothing (not the URL, not a scan count) is uploaded.
 */
const linkedinQrCodeGenerator: Tool = {
  slug: "linkedin-qr-code-generator",
  title: "LinkedIn QR Code Generator",
  description:
    "Turn your LinkedIn profile or company page into a scannable QR code people open with one tap. Style it, add your logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "Linkedin",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "linkedin",

  h1: "LinkedIn QR Code Generator: Get Connected in One Scan",
  tagline:
    "Paste your LinkedIn profile or company URL once and get a QR code people scan to open it instantly. Brand it, add your logo, and print it on business cards, conference badges, slides and booths, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI LinkedIn QR Code Generator turns your LinkedIn URL into a single scannable code that any phone camera opens straight to your profile or company page. No dictating a vanity URL, no asking someone to search your name among a dozen namesakes, no digging through the LinkedIn app to find its built-in scanner. Paste your profile link (linkedin.com/in/your-name), a company page (linkedin.com/company/your-brand), a newsletter, a job post or any public LinkedIn URL, and the tool encodes it exactly as-is, then hands it to our desktop-grade QR Studio so the code looks like you: LinkedIn-blue or fully custom colors and gradients, rounded dot and eye styles, your headshot or company logo dropped into the centre, a printable frame with a 'Connect on LinkedIn' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a beautiful branded code still scans on the first try from across a networking table. Because every step (encoding, styling and export) happens locally in your browser, your URL is never sent to a server, stored or logged, and there is no account and no scan tracking. This is a static link code: it points at whatever LinkedIn URL you paste now, so if your vanity URL changes you simply regenerate: the upside is total privacy and a code that works forever with nothing hosted behind it.",

  ctaText: "Generate LinkedIn QR Code",

  keywords: [
    "linkedin qr code generator",
    "linkedin qr code",
    "qr code for linkedin",
    "linkedin profile qr code",
    "generate linkedin qr code",
    "linkedin company page qr code",
    "qr code linkedin business card",
    "linkedin qr code with logo",
    "conference badge linkedin qr",
    "create linkedin qr code free",
    "linkedin qr code for email signature",
    "networking qr code linkedin",
  ],

  seo: {
    title: "LinkedIn QR Code Generator, Scan to Connect (Free, No Signup) | GigAI Tools",
    description:
      "Free LinkedIn QR code generator. Paste your profile or company URL to make a scan-to-connect LinkedIn QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, nothing uploaded, no tracking.",
  },

  features: [
    {
      icon: "Linkedin",
      title: "Profile or company page",
      description:
        "Encodes any public LinkedIn URL (your personal profile, a company or showcase page, a newsletter, a job listing or a post) so a scan opens exactly the page you intend.",
    },
    {
      icon: "ScanLine",
      title: "One-tap camera scan",
      description:
        "Any modern phone camera opens the link natively. No in-app scanner, no typing a vanity URL, no hunting for your name among identical ones on LinkedIn search.",
    },
    {
      icon: "Palette",
      title: "Brand it your way",
      description:
        "LinkedIn-blue or fully custom colors and gradients, rounded dot and eye styles, and a printable frame with a 'Connect on LinkedIn' label so it looks designed, not generic.",
    },
    {
      icon: "Image",
      title: "Add your headshot or logo",
      description:
        "Drop a profile photo or company mark into the centre with adjustable size and a protected quiet zone: the tool auto-raises error correction so it still scans cleanly.",
    },
    {
      icon: "ShieldCheck",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the moment a choice would make the code hard to scan.",
    },
    {
      icon: "Download",
      title: "Print-ready everywhere",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp on a business card, a conference badge, a slide, a poster or a booth banner.",
    },
  ],

  benefits: [
    {
      title: "Connect faster than typing a name",
      description:
        "At an event, one scan opens your exact profile. No spelling your vanity URL, no 'is that with two Ns?', and no scrolling past strangers who share your name in LinkedIn search.",
    },
    {
      title: "Works without the LinkedIn app",
      description:
        "LinkedIn's own QR lives inside the app and needs both people to have it open. A camera-readable code works from any phone's default camera, so nobody has to launch anything first.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, headshot or logo and a framed call-to-action, the code fits a polished business card, a booth or a speaker slide instead of looking like a plain black square.",
    },
    {
      title: "Private by design, no tracking",
      description:
        "Your URL is encoded locally in your browser and never leaves your device. No account, no upload, and no scan analytics, unlike link-shortener QR codes that log every tap.",
    },
  ],

  howTo: [
    {
      title: "Paste your LinkedIn URL",
      description:
        "Open your profile or company page, copy the full URL from the address bar (or the 'Contact info' / 'Share via' link), and paste it in. The live preview renders instantly.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set LinkedIn-blue or custom colors, dot and eye styles and a 'Connect on LinkedIn' frame, then drop your headshot or logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge, then point your own phone camera at the on-screen code to confirm it opens your profile before you commit to a design or a print run.",
    },
    {
      title: "Download and share",
      description:
        "Export a high-resolution PNG or PDF for print, an SVG for infinite scaling, or a transparent PNG to drop into an email signature or slide deck. Then put it where people will scan it.",
    },
  ],

  formats: {
    input: ["LinkedIn profile or company URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Job seeker / Professional",
      title: "Business card & résumé QR",
      description:
        "Put a code on your business card, résumé or portfolio so recruiters open your full LinkedIn profile in a tap, richer than a paper CV and always up to date.",
    },
    {
      audience: "Speaker / Exhibitor",
      title: "Conference slide & booth",
      description:
        "Drop the QR on your closing slide, table sign or booth banner so the whole room can connect at once, instead of a queue of people typing your name into search.",
    },
    {
      audience: "Company / Recruiter",
      title: "Company page & hiring signage",
      description:
        "Link a careers or company page from posters, job fairs and swag so candidates follow your brand and see open roles without hunting for the right page.",
    },
    {
      audience: "Sales / Networking",
      title: "Email signature & name badge",
      description:
        "Add a transparent-background QR to your email signature or event name badge so every contact can grow their network with you in one scan, hands-free.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens the LinkedIn app's login or a 'page not found'.",
      solution:
        "Make sure you used your public profile URL (linkedin.com/in/your-name or /company/your-brand), not an internal link copied while logged in, those often contain session parameters or point to pages only you can see. Open the URL in a private browser window to confirm it loads for anyone.",
    },
    {
      problem: "It opens my profile in a browser instead of the LinkedIn app.",
      solution:
        "That is normal and expected, a QR encodes a plain web link, and whether it opens in the app or the browser is decided by the scanner's phone settings, not the code. Anyone with the LinkedIn app installed will usually get an 'Open in app' prompt automatically.",
    },
    {
      problem: "The code scans but nothing happens.",
      solution:
        "Use a recent OS (iOS 11+ / Android 10+) and the built-in camera app, which detects link QR codes automatically. On older phones, install any free QR reader. Also re-check contrast, a very pale code on a busy background can fail. Keep a dark code on a light, plain area.",
    },
    {
      problem: "My vanity URL changed and the printed code is now wrong.",
      solution:
        "Because this is a static, private code with no redirect, it always points at the exact URL you pasted. If you edit your LinkedIn vanity URL, regenerate the QR with the new link and reprint. Set your vanity URL before printing a large batch so you only do it once.",
    },
  ],

  tips: [
    "Set a clean custom vanity URL in LinkedIn (linkedin.com/in/firstname-lastname) before generating. It's shorter, so the QR has fewer modules and scans faster from a distance.",
    "Use a transparent-background PNG when placing the QR in an email signature, a slide or over a colored card so it blends in instead of sitting in a white box.",
    "Add your headshot as the centre logo for a personal profile, or your company mark for a page, the tool bumps error correction so it still scans reliably.",
    "For a booth banner or poster, export SVG or a 4096px PNG so the code stays razor-sharp when blown up large.",
    "Test the printed code under the actual lighting where it'll live: a glossy business card or a spotlit booth can add glare that a matte print avoids.",
  ],

  security:
    "Your LinkedIn URL is encoded into the QR entirely in your browser. It is never uploaded, stored or logged, there is no account, and unlike link-shortener QR codes, no scan is ever counted or tracked. The finished QR is a static link: it points at exactly the URL you paste, so anyone who scans it is sent to that public LinkedIn page (which is fine, it's meant to be shared). If your vanity URL changes, just regenerate and reprint. Nothing is hosted behind the code, so it can never break, expire or start redirecting somewhere else.",

  faq: [
    {
      question: "How do I get the QR code for my LinkedIn profile?",
      answer:
        "Open your LinkedIn profile in a browser and copy the full URL from the address bar (it looks like linkedin.com/in/your-name), then paste it into the generator. You can also grab it from the 'Share via' or 'Contact info' options in the app. The QR renders instantly and opens straight to your profile when scanned.",
    },
    {
      question: "What's the difference between this and LinkedIn's own QR code?",
      answer:
        "LinkedIn's built-in QR lives inside the mobile app and generally needs both people to be in the app to work. This generator makes a standard link QR that any phone's default camera opens directly, no app required to scan, and lets you brand it with colors, a logo and a printable frame, then download it for cards, badges, slides and print. It's ideal for anything offline or shared with people who may not have the app open.",
    },
    {
      question: "Can I make a QR code for a LinkedIn company page, not just a profile?",
      answer:
        "Yes. Paste any public LinkedIn URL, a personal profile (/in/), a company or showcase page (/company/), a newsletter, a job post or a specific post. The code encodes exactly what you paste, so it works for recruiting signage, brand pages and campaigns just as well as personal networking.",
    },
    {
      question: "Is my LinkedIn URL uploaded or is my scan activity tracked?",
      answer:
        "No to both. The QR is generated entirely in your browser on your device: your URL is never sent to a server, stored or logged, and there's no account. Because there's no redirect or shortener in the middle, no scan is ever counted or tracked, unlike many marketing QR services that log every tap.",
    },
    {
      question: "Can I add my headshot or company logo and brand colors?",
      answer:
        "Absolutely. Use the Design tab for LinkedIn-blue or fully custom colors, gradients and rounded dot/eye styles, add a 'Connect on LinkedIn' frame, and drop your headshot or logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Will the QR code still work if I change my LinkedIn vanity URL later?",
      answer:
        "The code points at the exact URL you paste, so if you change your vanity URL the old printed code will no longer resolve. We're honest that this is a static code with no redirect. The trade-off is complete privacy and a link that never expires. Set your preferred vanity URL first, then generate and print once.",
    },
    {
      question: "What size and format should I export for a business card or badge?",
      answer:
        "For a business card, badge or slide, a PNG or PDF at 1024px or higher is plenty. The tool goes up to 4096px. For a large booth banner or poster, use the SVG export (vector, stays sharp at any size). Choose a transparent PNG when you want the code to sit directly on a colored background.",
    },
    {
      question: "Is it really free with no signup or watermark?",
      answer:
        "Yes. There's no account, no watermark and no limit: generate, brand and download as many LinkedIn QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: locked LinkedIn URL form (profile, company, page or post), instant plain-link encoding, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-25",
      change:
        "Added centre logo/headshot drop-in with auto error-correction bump, a 'Connect on LinkedIn' frame with custom call-to-action label, LinkedIn-blue style preset and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved guidance for public vs. session URLs and app-vs-browser open behaviour, plus clearer troubleshooting for vanity-URL changes and older-phone scanning.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "vcard-qr-code-generator",
    "instagram-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default linkedinQrCodeGenerator;
