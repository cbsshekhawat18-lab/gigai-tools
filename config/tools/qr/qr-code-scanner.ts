import type { Tool } from "@/types";

/**
 * QR Code Scanner, the platform's flagship QR *reader*. Where the rest of the
 * QR studio generates codes, this tool decodes them: a live camera scanner
 * (getUserMedia + jsQR), image upload / drag-drop, and clipboard paste, all
 * running 100% in the browser with zero uploads. Every string of copy below is
 * unique to *reading* and *decoding* QR codes, deliberately non-overlapping
 * with the generator tools, and is written to rank for the exact things people
 * search when they need to scan a QR from a laptop, a screenshot, or a photo.
 */
const qrCodeScanner: Tool = {
  slug: "qr-code-scanner",
  title: "QR Code Scanner",
  description:
    "Scan and decode any QR code in your browser. Use your webcam live, upload or drag an image, or paste a screenshot. Instantly reveals the link, Wi-Fi, contact or text inside. Nothing is uploaded.",
  category: "qr-tools",
  icon: "ScanLine",
  accent: "cyan",
  status: "live",
  illustration: "qr-code-scanner",
  featured: true,
  createdAt: "2026-06-16",

  h1: "QR Code Scanner. Read Any QR Code Online, Right in Your Browser",
  tagline:
    "No app to install. Point your webcam at a QR code, drop in a screenshot, or paste an image, and instantly see exactly what's inside (a link, a Wi-Fi password, a contact card or plain text) decoded entirely on your device.",
  longDescription:
    "The GigAI QR Code Scanner is a true QR reader for the desktop, built for the moments when the code is on your screen (an email, a PDF invoice, a slide, a website) and the phone-in-hand ritual makes no sense. It decodes three ways: a live webcam scanner that reads a code the instant it enters frame, an image path that accepts uploads, drag-and-drop and clipboard paste (Ctrl/Cmd+V a screenshot straight in), and a graceful fallback the moment a camera isn't available or permission is declined. Under the hood it uses the jsQR engine on raw canvas pixels, so decoding is genuinely local: no frame, photo or decoded value is ever uploaded, logged or transmitted. Beyond dumping the raw string, it *understands* the payload. It recognises URLs, Wi-Fi credentials, vCard contacts, email, phone, SMS and geo-location codes and lays them out as clean, labelled fields with one-click copy and a context-aware Open action (dial a number, start an email, view a map, follow a link). It is honest about its limits: it reads standard QR codes, not one-dimensional retail barcodes, and (like every scanner on Earth) it cannot invent a destination for a broken or heavily damaged code. Everything runs in a single static page with no login and no persistence: close the tab and every trace is gone.",

  ctaText: "Scan a QR code",

  keywords: [
    "qr code scanner",
    "scan qr code online",
    "scan qr code from screenshot",
    "qr scanner webcam",
    "decode qr code",
    "qr code scanner online free",
    "upload qr code image to scan",
    "scan qr code on computer",
    "wifi qr code reader",
    "qr code scanner no app",
  ],

  seo: {
    title: "QR Code Scanner, Scan & Read QR Codes Online (Webcam or Image) | GigAI Tools",
    description:
      "Free online QR code scanner and reader. Scan with your webcam, upload or drag a QR image, or paste a screenshot to decode links, Wi-Fi, contacts and text: 100% in your browser, no app, no uploads.",
  },

  features: [
    {
      icon: "Camera",
      title: "Live webcam scanning",
      description:
        "Grant camera access and the scanner reads a QR the instant it enters the frame, using a real-time jsQR loop with an on-screen targeting guide. No shutter button, no app.",
    },
    {
      icon: "ImageUp",
      title: "Scan from an image or screenshot",
      description:
        "Upload a PNG/JPG/WEBP/GIF, drag a file straight onto the page, or paste a screenshot with Ctrl/Cmd+V. Ideal when the code lives in an email, PDF or on another screen.",
    },
    {
      icon: "ScanLine",
      title: "Understands the payload",
      description:
        "It doesn't just show raw text. It recognises URLs, Wi-Fi, vCard, email, phone, SMS and geo codes and renders them as labelled fields with a context-aware Open action.",
    },
    {
      icon: "Copy",
      title: "Copy & open in one click",
      description:
        "Copy the decoded value to your clipboard, or Open it directly: follow a link, dial a number, start an email, or view a location on the map, depending on what the code contains.",
    },
    {
      icon: "Wifi",
      title: "Reveal hidden Wi-Fi passwords",
      description:
        "Point it at a printed Wi-Fi QR and it lays out the network name, security type and the actual password in plain text, so you can type it in on any device.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, in your browser",
      description:
        "Decoding runs on raw canvas pixels with jsQR on your device. No camera frame, uploaded photo or decoded value is ever sent to a server, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Scan without reaching for your phone",
      description:
        "When the QR is already on your computer screen (a checkout page, a ticket, a slide) decode it in place with your webcam or a screenshot instead of awkwardly photographing your own monitor.",
    },
    {
      title: "Read codes trapped inside files",
      description:
        "PDFs, email attachments and images often hide a QR you can't tap. Drag the file in and get the destination instantly, so you can vet a link before you ever visit it.",
    },
    {
      title: "Check a link before you trust it",
      description:
        "Because the decoded URL is shown as text first, you can read exactly where a code leads and spot a suspicious or shortened destination before choosing to open it.",
    },
    {
      title: "Nothing to install, nothing to leak",
      description:
        "No app download, no account, no upload. It's a single static page that decodes locally, so it's safe to scan codes containing Wi-Fi passwords or personal contact details.",
    },
  ],

  howTo: [
    {
      title: "Pick how you'll scan",
      description:
        "Click 'Scan with camera' to use your webcam, or use the drop zone below to upload, drag or paste an image of the QR code.",
    },
    {
      title: "Present the code",
      description:
        "For the camera, hold the QR steady inside the on-screen frame with good light. For an image, choose a clear, un-cropped picture where the whole code is visible.",
    },
    {
      title: "Read the decoded result",
      description:
        "The scanner shows the code's type (link, Wi-Fi, contact, etc.), a clean field breakdown and the exact raw value it contains.",
    },
    {
      title: "Copy or open",
      description:
        "Copy the value to your clipboard, or hit Open to follow the link, dial the number, start the email or view the location, whatever the code encodes.",
    },
    {
      title: "Scan another",
      description:
        "Click 'Scan another' to clear the result and read the next code. Nothing is remembered between scans.",
    },
  ],

  formats: {
    input: ["Webcam", "PNG", "JPG", "WEBP", "GIF"],
    output: ["Text", "URL", "Wi-Fi", "vCard"],
  },

  useCases: [
    {
      audience: "Anyone on a laptop",
      title: "Scan a code on your own screen",
      description:
        "A QR appears on a website, a Zoom slide or an email and you have no phone handy. Screenshot it, paste it in, and get the link without leaving your desk.",
    },
    {
      audience: "Traveller / café guest",
      title: "Get onto Wi-Fi from a printed code",
      description:
        "Photograph the Wi-Fi QR taped to the wall, drop the photo in, and read the exact network name and password to type into any laptop or console that can't scan.",
    },
    {
      audience: "Security-conscious user",
      title: "Vet a QR before trusting it",
      description:
        "Suspicious flyer or parking-meter sticker? Scan it here to reveal the real destination as text and check for a shady or mismatched domain before you ever open it.",
    },
    {
      audience: "Office worker",
      title: "Extract a link buried in a PDF",
      description:
        "An invoice or brochure PDF contains a QR you can't click. Export the page as an image, drag it in, and copy the underlying URL in seconds.",
    },
  ],

  troubleshooting: [
    {
      problem: "The camera won't start or shows a permission error.",
      solution:
        "Your browser blocks camera access unless the page is served over HTTPS (or localhost) and you've allowed the permission. Click the camera icon in the address bar to grant access, then retry, or just upload/paste an image instead, which needs no camera.",
    },
    {
      problem: "It says no QR code was found in my image.",
      solution:
        "The code may be too small, blurry, low-contrast, angled or partly cropped. Use a sharper, straight-on image where the whole code and a little white margin around it are visible, and avoid heavy compression or screenshots scaled down too far.",
    },
    {
      problem: "It won't read my barcode / UPC.",
      solution:
        "This is a QR-code scanner, which reads square 2D QR codes only. It does not decode 1D retail barcodes (UPC/EAN) or other 2D symbologies like Data Matrix or PDF417, those use a different decoding engine.",
    },
    {
      problem: "The live camera is slow or laggy.",
      solution:
        "Real-time decoding is CPU-bound and depends on your webcam resolution and lighting. Improve the light, hold the code steady and fill the frame. If it still struggles, capture a photo and use the image-upload path, which decodes a single clean frame.",
    },
  ],

  tips: [
    "On desktop, the fastest path is a screenshot: capture the QR, then paste with Ctrl/Cmd+V directly onto the page.",
    "Leave a little white 'quiet zone' around the code in any image you upload, decoders need that margin to lock on.",
    "Always read the decoded URL as text before hitting Open, so you know exactly where a code leads.",
    "Good, even lighting and a straight-on angle beat a high-resolution but glary or skewed shot every time.",
    "No webcam? You lose nothing, the upload, drag-and-drop and paste paths decode just as accurately.",
  ],

  security:
    "Every scan happens on your device. Camera frames and uploaded images are decoded in-browser with the jsQR engine on raw canvas pixels. No photo, video frame or decoded value is ever uploaded, stored, logged or transmitted. Camera access is only ever requested when you explicitly click 'Scan with camera', and the stream is released the moment a code is read or you stop. Close the tab and nothing remains.",

  faq: [
    {
      question: "How do I scan a QR code on my computer without a phone?",
      answer:
        "Two ways, both here. Click 'Scan with camera' to use your laptop's webcam and hold the code up to it, or (if the QR is already on your screen) take a screenshot and paste it in with Ctrl/Cmd+V (you can also upload or drag the image). The scanner decodes it locally and shows you exactly what's inside.",
    },
    {
      question: "Can I scan a QR code from a screenshot or an image file?",
      answer:
        "Yes. This is one of the main use cases. Upload a PNG, JPG, WEBP or GIF, drag the file onto the page, or paste a screenshot from your clipboard. It's perfect for QR codes trapped inside emails, PDFs, slides or on another screen where you can't point a phone.",
    },
    {
      question: "Is my camera feed or image uploaded anywhere?",
      answer:
        "No. All decoding runs entirely in your browser using the jsQR engine on raw canvas pixels. No camera frame, uploaded image or decoded result is ever sent to a server, stored or logged. It's completely private, which means it's safe to scan codes containing Wi-Fi passwords or personal details.",
    },
    {
      question: "Can this reveal the Wi-Fi password inside a QR code?",
      answer:
        "Yes. When you scan a standard Wi-Fi QR code, the scanner parses it and displays the network name (SSID), the security type and the actual password as readable text, so you can type the credentials into any device that can't scan the code itself.",
    },
    {
      question: "Why won't the camera turn on?",
      answer:
        "Browsers only allow camera access on secure (HTTPS or localhost) pages and only after you grant permission. If it's blocked, click the camera/site icon in your address bar, allow the camera, and try again. If your device has no webcam, use the image upload, drag-and-drop or paste options instead. They need no camera at all.",
    },
    {
      question: "Does it work on iPhone, Android and all major browsers?",
      answer:
        "Yes. It runs in any modern browser: Chrome, Safari, Firefox and Edge on desktop and mobile. Camera scanning uses the standard getUserMedia API. Where a camera isn't available the upload, drag and paste paths work everywhere. On mobile it can use the rear-facing camera for easier scanning.",
    },
    {
      question: "Can it read barcodes as well as QR codes?",
      answer:
        "No. It's a dedicated QR-code reader for square 2D QR codes. It does not decode 1D retail barcodes (UPC/EAN) or other 2D formats such as Data Matrix, Aztec or PDF417, which require entirely different decoding engines.",
    },
    {
      question: "It can't read my code: is it broken?",
      answer:
        "Usually the image is the issue, not the code. Very small, blurry, angled, low-contrast or cropped codes are hard to decode. Try a sharper, straight-on shot that includes the whole code plus a little white margin, improve the lighting, and avoid heavily downscaled screenshots. A genuinely damaged QR can be unreadable by any scanner.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: live webcam scanning (getUserMedia + jsQR), image upload with drag-and-drop and clipboard paste, and typed result parsing for URL, Wi-Fi, vCard, email, phone, SMS and geo payloads with copy and context-aware Open actions.",
    },
    {
      date: "2026-06-23",
      change:
        "Added rear-camera preference on mobile, an on-screen targeting frame, and clearer permission/error messaging with an image fallback when a camera is unavailable.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved decoding of low-contrast and slightly angled codes, and refined the Wi-Fi field breakdown to reveal SSID, security type and password.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "vcard-qr-code-generator",
    "upi-qr-code-generator",
    "barcode-generator",
  ],
};

export default qrCodeScanner;
