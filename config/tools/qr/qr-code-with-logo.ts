import type { Tool } from "@/types";

/**
 * QR Code with Logo, a branding-first micro-site over the full QR Studio.
 *
 * Unlike the flagship generator (which opens neutral), this tool is tuned end to
 * end around dropping a logo into the centre of a QR code and keeping it
 * scannable: it opens with the logo panel prominent, seeds a logo-safe style
 * (higher error correction, protected quiet zone around the mark), and every
 * word of copy targets the exact queries people type when they want a *branded*
 * code: "qr code with logo in middle", "add logo to qr code", "branded qr code
 * that still scans". Any content type is available (URL, Wi-Fi, vCard, UPI and
 * 24 more), so a marketer, café or creator can put their mark on whatever the
 * code points to.
 *
 * Honest boundary baked into the copy: a logo hides modules, so error
 * correction (which repairs up to ~30% of a code) is what makes it work, past
 * that the code breaks. The tool recommends a safe logo size and level, runs a
 * live decode test, and never pretends a giant logo is fine. Everything is
 * encoded, styled and exported in the browser; nothing (including the logo
 * image) is uploaded.
 */
const qrCodeWithLogo: Tool = {
  slug: "qr-code-with-logo",
  title: "QR Code with Logo",
  description:
    "Put your logo in the centre of a QR code and keep it scannable. Drop in a PNG or SVG mark, auto-protect the area behind it, tune colors and shapes, and export high-res PNG, SVG or PDF. A live scan test proves it works before you print: 100% in your browser.",
  category: "qr-tools",
  icon: "ImagePlus",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-16",
  illustration: "qr-code-with-logo",

  h1: "QR Code with Logo: Branded Codes That Still Scan",
  tagline:
    "Drop your logo into the middle of a QR code and get a branded mark that phones still read on the first try. Auto-protected centre area, smart error-correction, live scan test, and razor-sharp PNG, SVG or PDF export. No sign-up, no watermark, nothing uploaded.",
  longDescription:
    "The GigAI QR Code with Logo tool is built for one job most generators fumble: placing your logo in the centre of a QR code without breaking it. A logo covers some of the code's modules, and if you cover too many, scanners simply fail, so this tool opens with the logo panel front and centre and does the hard part for you. Upload a PNG, SVG or JPG mark and it's placed in the middle with adjustable size and padding, a protect-area cut-out that clears the modules directly behind it, and an automatic error-correction bump to level H (the strongest) so the code's built-in redundancy can rebuild the hidden data. A live scannability check then runs a real jsQR decode on the rendered pixels plus a WCAG contrast test, so if your logo creeps too large or your colors lose contrast, you see the warning before you print. Not after a thousand cards come back unscannable. Around that, you get the full studio: encode any of 28 content types (a landing-page URL, a Wi-Fi network, a vCard, a UPI or PayPal payment, a calendar event, social links and more), pick dot and finder-eye shapes, apply a brand color or gradient, set a transparent background, and add a framed 'Scan me' call-to-action. When it's right, export a lossless PNG, a true vector SVG, a print-ready PDF or EPS, or a JPG/WEBP, from 256 up to 4096 pixels, including transparent PNG for overlays. Every step (reading your logo, encoding the payload, rendering, validating and exporting) happens locally on your device. The logo image and the data you encode never leave your browser, and there's no account, no watermark and no expiry.",

  ctaText: "Add Logo to QR Code",

  keywords: [
    "qr code with logo",
    "qr code with logo in middle",
    "add logo to qr code",
    "branded qr code",
    "qr code logo generator",
    "custom qr code with logo",
    "qr code with image in center",
    "logo qr code maker",
    "company logo qr code",
    "qr code with logo png",
    "qr code with logo svg",
    "free qr code with logo no watermark",
  ],

  seo: {
    title:
      "QR Code with Logo. Add Your Logo to a Scannable QR Code (PNG/SVG/PDF) | GigAI Tools",
    description:
      "Free QR code with logo generator. Drop your logo into the centre, auto-protect the area behind it, verify it still scans, and export high-res PNG, SVG or PDF. 100% in-browser, no watermark, no expiry, logo never uploaded.",
  },

  features: [
    {
      icon: "ImagePlus",
      title: "Logo panel front and centre",
      description:
        "The tool opens on the logo step: drop in a PNG, SVG or JPG mark and it lands in the middle with adjustable size, padding and optional rounding. No wrestling a design tool to fake a centred logo.",
    },
    {
      icon: "ShieldCheck",
      title: "Auto-protected centre area",
      description:
        "A protect-area cut-out clears the modules directly behind your logo and raises error correction to H, so the code's built-in redundancy rebuilds the hidden data and scanners still read it.",
    },
    {
      icon: "ScanLine",
      title: "Live logo-safety scan test",
      description:
        "A validator runs an actual jsQR decode on the rendered pixels and a WCAG contrast check as you resize the logo, warning you the instant it covers too much of the code to scan reliably.",
    },
    {
      icon: "Palette",
      title: "Match your brand exactly",
      description:
        "Set your brand color or a linear/radial gradient, choose dot and finder-eye shapes, tune the quiet-zone margin and corner radius, and add a 'Scan me' frame so the code reads as designed, not generic.",
    },
    {
      icon: "Layers",
      title: "Brand any content type",
      description:
        "Put your logo on a QR for any of 28 payloads (a campaign URL, Wi-Fi, a vCard, UPI/PayPal, a calendar event, social profiles and more) each with a guided form that builds the exact string scanners expect.",
    },
    {
      icon: "Download",
      title: "Print-ready, lossless export",
      description:
        "Export PNG, true vector SVG, print-ready PDF or EPS, plus JPG and WEBP, from 256 up to 4096px: including transparent PNG for overlays. Sharp on a business card and on a banner.",
    },
  ],

  benefits: [
    {
      title: "A code that looks like your brand",
      description:
        "A centred logo turns an anonymous black-and-white square into a recognisable mark on your packaging, poster or card, so people trust the code enough to actually scan it.",
    },
    {
      title: "Branding without the guesswork",
      description:
        "The protect-area, auto error-correction bump and live decode test mean you get the polish without gambling on whether phones can still read it. If it would break, you're told before you print.",
    },
    {
      title: "Crisp at any print size",
      description:
        "Vector SVG, PDF and EPS scale with zero pixelation and raster exports reach 4096px, so the same logo'd code is sharp on a name badge and on a trade-show backdrop.",
    },
    {
      title: "Private, free and unwatermarked",
      description:
        "Your logo image and the data you encode are processed entirely on your device, never uploaded, and there's no account, no watermark and no expiry on the codes you make.",
    },
  ],

  howTo: [
    {
      title: "Add your logo",
      description:
        "Drop a PNG, SVG or JPG of your logo into the logo panel. It's placed in the centre with a protected area behind it and error correction raised to H automatically.",
    },
    {
      title: "Choose what the code points to",
      description:
        "Pick a content type (URL, Wi-Fi, vCard, UPI and 24 more) and fill the guided form. The payload builds and the branded preview updates live as you type.",
    },
    {
      title: "Size the logo and brand the code",
      description:
        "Adjust the logo size and padding, set your brand colors or a gradient, choose dot and eye shapes, and add a 'Scan me' frame. Watch the scannability badge stay green.",
    },
    {
      title: "Verify it scans, then export",
      description:
        "Confirm the live scan test passes (test it with your own phone too), then download a high-res PNG or PDF for print, or an SVG for infinite scaling.",
    },
  ],

  formats: {
    input: ["Text", "URL", "Logo (PNG, SVG, JPG)"],
    output: ["PNG", "SVG", "PDF", "EPS", "JPG", "WEBP"],
  },

  useCases: [
    {
      audience: "Marketer / Brand",
      title: "Campaign QR with the brand mark",
      description:
        "Encode a landing-page URL, drop the company logo in the centre, match brand colors with a gradient, verify it scans, then export a vector SVG for print and a transparent PNG for the web.",
    },
    {
      audience: "Small business",
      title: "Logo'd code on cards & packaging",
      description:
        "Put your logo on a vCard or menu-link QR so a scan looks unmistakably yours on a business card, product box or shop window, printed at 4096px or as crisp vector.",
    },
    {
      audience: "Creator / Freelancer",
      title: "Branded link on every profile",
      description:
        "Turn your Linktree, portfolio or Instagram URL into a QR carrying your personal logo, so the code fits your feed and print collateral instead of clashing with it.",
    },
    {
      audience: "Event / Conference",
      title: "Sponsor-logo session codes",
      description:
        "Brand agenda, feedback or check-in codes with an event or sponsor logo, sized safely so every attendee's phone scans the first time under real venue lighting.",
    },
  ],

  troubleshooting: [
    {
      problem: "My QR code stopped scanning after I added the logo.",
      solution:
        "The logo is covering too many modules. Shrink it (keep it under ~25% of the code's width), make sure the protect-area / hide-dots option is on, and confirm error correction is set to H. The live scan-test badge tells you the moment it's safe again.",
    },
    {
      problem: "The logo looks blurry or pixelated in the export.",
      solution:
        "Upload a higher-resolution logo (or a vector SVG, which stays sharp at any size) and export at 2048–4096px, or as SVG/PDF. A small, low-res logo bitmap will always soften when the code is scaled up for print.",
    },
    {
      problem: "My logo has a white box around it that clashes with a colored background.",
      solution:
        "Use a logo with a transparent background (PNG or SVG), then enable a transparent QR background if you're overlaying on a colored section. Adjust the logo padding so the protect-area fits the mark without an obvious rectangle.",
    },
    {
      problem: "The SVG or EPS export lost my logo or gradient.",
      solution:
        "SVG and PDF preserve your logo, colors and shapes: use those for a fully branded vector. EPS is a plain module matrix for maximum print-software compatibility, so it can't carry a logo, gradient or custom shapes. Export SVG or PDF instead if you need the branding in vector form.",
    },
  ],

  tips: [
    "Keep the logo under about 25% of the code's width, big enough to recognise, small enough that error correction H can rebuild the modules behind it.",
    "Use a logo with a transparent background and a simple silhouette. Busy, full-color logos with fine detail get lost at small print sizes and can hurt contrast.",
    "Leave error correction on H whenever there's a logo. It's the redundancy that lets the code survive being partly covered.",
    "Test the printed code, not just the screen: print one, scan it under the lighting where it'll live, then run the full print job.",
    "For overlays on photos or colored sections, export a transparent PNG or SVG so only the code and your logo show, with the background coming through.",
  ],

  security:
    "Your logo image and the data you encode (URLs, contact details, payment strings and more) are read, styled, rendered and exported entirely in your browser using the canvas and Web APIs on your device. Nothing (not the logo, not the payload, not any export) is uploaded, logged or stored, and there is no account. The finished code is static: the data is baked into the pattern, so it keeps working as long as the destination stays valid, and you can print it anywhere without a server round-trip. Close the tab and no trace remains.",

  faq: [
    {
      question: "How do I put a logo in the middle of a QR code?",
      answer:
        "Open this tool, drop your logo (PNG, SVG or JPG) into the logo panel, and it's placed in the centre automatically with a protected area behind it and error correction raised to H. Then choose what the code encodes, size the logo so the live scan test stays green, and export. No design software or manual masking needed.",
    },
    {
      question: "Will a QR code with a logo still scan?",
      answer:
        "Yes, if the logo isn't too big. QR codes carry error-correction data that lets scanners rebuild the modules hidden behind a centred mark: up to roughly 30% of the code at level H. This tool bumps you to H, clears a protect-area behind the logo, and runs a real decode test as you resize, so it warns you before the logo covers too much to read. Keep it under about 25% of the width and it scans reliably.",
    },
    {
      question: "Is my logo image uploaded to a server?",
      answer:
        "No. The logo is read and composited into the QR code entirely in your browser on your own device. It's never uploaded, stored or logged, there's no account and nothing leaves your machine. The same is true of the URL, contact details or other data you encode.",
    },
    {
      question: "What logo format and size work best?",
      answer:
        "A vector SVG is ideal because it stays razor-sharp at any print size. Otherwise use a high-resolution PNG with a transparent background and a simple, high-contrast silhouette. Keep the placed logo under about 25% of the code's width so error correction can cover it, and avoid tiny, intricate, full-color marks that turn to mush when the code is printed small.",
    },
    {
      question: "Can I add a logo to a Wi-Fi, vCard or payment QR code?",
      answer:
        "Yes. This is the full studio, so you can brand any of 28 content types: a URL, a Wi-Fi network, a vCard contact, a UPI or PayPal payment, a calendar event, social profiles and more. Pick the type, fill the guided form, then drop your logo in the centre. The branding works the same across all of them.",
    },
    {
      question: "Is the QR code with logo dynamic: can I change where it points later?",
      answer:
        "No, and we're upfront about it: this makes static codes, where the data is baked into the pattern, because the tool has no server or database to redirect through. That's what keeps it free, private and expiry-free. If you need to re-target it after printing, encode a link you control (your own domain or a link-shortener you manage) and change where that link points on your side. The logo'd code stays the same.",
    },
    {
      question: "Do I need to raise the error-correction level myself when adding a logo?",
      answer:
        "No: the tool does it for you. Adding a logo automatically raises error correction to level H, the strongest, so the code has the maximum redundancy to survive being partly covered. You can still adjust it in the Design tab, but H is the right default for any logo'd code and we recommend leaving it there.",
    },
    {
      question: "Is it free, with no watermark or expiry?",
      answer:
        "Yes. Every logo'd QR code you make is free, has no watermark, and never expires. There's no account, no trial and no locked 'pro' features. Because everything runs in your browser with no server to pay for, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, logo-first QR studio: centre-logo drop-in with adjustable size and padding, automatic protect-area cut-out and error-correction bump to H, full color/gradient/dot/eye styling across all 28 content types, and PNG/SVG/PDF/EPS/JPG/WEBP export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added the real-time logo-safety scan test, an on-canvas jsQR re-decode plus a WCAG contrast check that warns live when a logo grows too large, and transparent-background support for overlaying branded codes.",
    },
    {
      date: "2026-06-30",
      change:
        "Added logo rounding, a 'Scan me' frame with a custom call-to-action label, and clearer guidance on logo format and safe sizing for reliable printing.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "vcard-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default qrCodeWithLogo;
