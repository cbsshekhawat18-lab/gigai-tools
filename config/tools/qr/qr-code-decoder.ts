import type { Tool } from "@/types";

/**
 * QR Code Decoder: the developer's read tool.
 *
 * Where the QR Code Scanner is framed for anyone pointing a webcam at a code,
 * this is the paste-first, string-first decoder built for engineers, QA and
 * support: drop or paste a QR image and it surfaces the *exact raw payload* that
 * was encoded (byte-for-byte, unescaped, ready to copy) alongside a parsed
 * breakdown that classifies the scheme (URL, WIFI:, MATMSG:, BEGIN:VCARD,
 * upi://, geo:, tel:, mailto:, SMSTO:, …). Every string of copy below is written
 * for the "what's actually inside this QR" search intent, inspecting, testing
 * and debugging codes, and is deliberately non-overlapping with the scanner and
 * the generator tools. Decoding runs 100% in the browser on raw canvas pixels
 * via jsQR; nothing is uploaded.
 */
const qrCodeDecoder: Tool = {
  slug: "qr-code-decoder",
  title: "QR Code Decoder",
  description:
    "Decode any QR image to its exact raw payload in your browser. Paste, drop or upload a code and instantly see the byte-for-byte string it encodes, plus a parsed breakdown of the URL, Wi-Fi, vCard, UPI or geo scheme inside. Nothing is uploaded.",
  category: "qr-tools",
  icon: "FileSearch",
  accent: "violet",
  status: "live",
  illustration: "qr-code-decoder",
  featured: false,
  createdAt: "2026-06-24",

  h1: "QR Code Decoder, See the Exact Raw Data Inside Any QR Code",
  tagline:
    "Paste a QR image straight from your clipboard, or drop a PNG, and get the precise string it encodes (the full URL, the WIFI: block, the vCard, the upi:// URI) shown byte-for-byte and ready to copy, then parsed into clean, labelled fields.",
  longDescription:
    "The GigAI QR Code Decoder is a technical inspection tool for people who need the truth about a QR code, not just a link to tap. Feed it a code (Ctrl/Cmd+V a screenshot, drop a PNG/JPG/WEBP/GIF, upload a file, or use your webcam) and it returns two things at once: the raw decoded string exactly as it was written, unescaped and untruncated in a monospace field you can select and copy, and a structured breakdown that recognises the payload's scheme and lays out its parts as labelled key/value fields. It understands the standards that matter: http/https URLs (with the real destination exposed before you ever open it), WIFI: credential blocks (SSID, security type and the plaintext password), BEGIN:VCARD contact cards, mailto: and MATMSG: email, tel: phone, SMSTO:/sms: messages, geo: coordinates and upi:// payment URIs. Under the hood it decodes on raw canvas pixels with the jsQR engine and attempts both normal and inverted codes, so light-on-dark and dark-on-light both read. It's honest about scope: it reads square 2D QR codes, not 1D retail barcodes (UPC/EAN) or other symbologies like Data Matrix, Aztec or PDF417, and no decoder can recover a genuinely damaged code. Everything runs in one static page. No login, no persistence, no upload. The image, the camera frame and the decoded value never leave your machine, which makes it safe to inspect codes that carry Wi-Fi passwords, contact details or payment handles.",

  ctaText: "Decode a QR code",

  keywords: [
    "qr code decoder",
    "decode qr code online",
    "qr code data reader",
    "read raw qr code data",
    "qr code content viewer",
    "qr payload decoder",
    "decode qr from image",
    "paste qr code to decode",
    "qr code inspector",
    "what is inside a qr code",
    "qr code string decoder",
    "wifi qr code decoder",
  ],

  seo: {
    title: "QR Code Decoder: Read the Raw Data Inside Any QR Code Online | GigAI Tools",
    description:
      "Free online QR code decoder. Paste, drop or upload a QR image to reveal its exact raw payload (the full URL, WIFI: block, vCard, UPI or geo string) with a parsed field breakdown. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "Braces",
      title: "Byte-for-byte raw payload",
      description:
        "See the decoded string exactly as it was encoded, unescaped, untruncated and selectable in a monospace field. What the QR holds is what you get, ready to copy into a terminal, ticket or test case.",
    },
    {
      icon: "ListTree",
      title: "Scheme-aware parsing",
      description:
        "It classifies the payload (http/https, WIFI:, BEGIN:VCARD, mailto:/MATMSG:, tel:, SMSTO:, geo:, upi://) and breaks it into labelled key/value fields so you can read structure at a glance.",
    },
    {
      icon: "ClipboardPaste",
      title: "Paste-first workflow",
      description:
        "Screenshot a code and hit Ctrl/Cmd+V to decode it instantly. No file dialog, no save step. Drag-and-drop, file upload and live webcam paths are all there too.",
    },
    {
      icon: "Link",
      title: "Expose the true destination",
      description:
        "The decoded URL is shown as text first, so you can read exactly where a code points (full path, query string and all) and catch a shortened or spoofed domain before opening it.",
    },
    {
      icon: "Repeat",
      title: "Reads inverted & tricky codes",
      description:
        "Decoding attempts both normal and inverted pixels, so light-on-dark codes, styled dots and slightly imperfect scans still resolve where a naive reader would fail.",
    },
    {
      icon: "ShieldCheck",
      title: "Local-only, zero upload",
      description:
        "jsQR runs on raw canvas pixels in your browser. The image, the camera frame and the decoded value are never uploaded, stored or logged, safe for codes carrying passwords or payment handles.",
    },
  ],

  benefits: [
    {
      title: "Verify what you actually encoded",
      description:
        "Generated a QR in a pipeline or a design tool and need to confirm it holds the right URL or Wi-Fi block? Decode it here and diff the raw string against what you intended, character for character.",
    },
    {
      title: "Debug codes that won't scan on device",
      description:
        "When a QR fails in the field, the payload is usually the culprit, a stray space, wrong scheme, mis-escaped ampersand. Read the exact string here to see the flaw instead of guessing.",
    },
    {
      title: "Inspect before you trust",
      description:
        "Because the destination is revealed as plain text first, you can audit a suspicious code's real URL, query parameters and domain before choosing to open it, a genuine safety check.",
    },
    {
      title: "No install, no account, no leak",
      description:
        "It's a single static page that decodes locally. Nothing is uploaded and nothing persists, so inspecting a code full of credentials carries no exposure.",
    },
  ],

  howTo: [
    {
      title: "Bring the code in",
      description:
        "Paste a screenshot with Ctrl/Cmd+V, drop an image onto the page, click to upload a file, or use 'Scan with camera'. Whichever is fastest for where the code lives.",
    },
    {
      title: "Read the raw string",
      description:
        "The decoder shows the exact payload in a monospace field. Select and copy it as-is. This is the literal data the QR encodes, nothing added or trimmed.",
    },
    {
      title: "Check the parsed breakdown",
      description:
        "Above the raw value, the detected type (Link, Wi-Fi, Contact, Location, …) and its fields are laid out as labelled rows so you can verify structure quickly.",
    },
    {
      title: "Copy or open",
      description:
        "Copy the value to your clipboard, or use Open to follow the link, dial the number, start the email or view the location the code encodes.",
    },
    {
      title: "Decode the next one",
      description:
        "Hit 'Scan another' to clear and inspect the next code. Nothing is remembered between decodes.",
    },
  ],

  formats: {
    input: ["PNG", "JPG", "WEBP", "GIF", "Clipboard image", "Webcam"],
    output: ["Raw string", "URL", "Wi-Fi", "vCard", "UPI", "Geo"],
  },

  useCases: [
    {
      audience: "Developer / QA engineer",
      title: "Confirm a generated QR's payload",
      description:
        "Verify that a QR produced by your app, label printer or design export encodes the exact URL, deep link or WIFI: block you specified, decode it and compare the raw string byte-for-byte.",
    },
    {
      audience: "Support / ops",
      title: "Diagnose a code that won't scan",
      description:
        "A customer's QR fails on their device. Ask for a screenshot, paste it here, and read the raw payload to spot the malformed scheme, stray whitespace or bad escaping behind the failure.",
    },
    {
      audience: "Security reviewer",
      title: "Audit a code's real destination",
      description:
        "Reveal the full URL, query parameters and domain a suspicious flyer or sticker points to, as text, before anyone opens it, so a spoofed or shortened link is caught early.",
    },
    {
      audience: "Anyone with a screenshot",
      title: "Read a QR on your own screen",
      description:
        "A code sits in an email, PDF or slide with no phone in reach. Screenshot it, paste it in, and get the decoded contents without photographing your own monitor.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says no QR code was found in the image.",
      solution:
        "The code may be too small, blurry, low-contrast, skewed or cropped. Provide a sharper, straight-on image that includes the whole code plus a little white 'quiet zone' margin, and avoid heavily downscaled or over-compressed screenshots.",
    },
    {
      problem: "The raw value looks garbled or has odd characters.",
      solution:
        "That's usually the true payload, many QR codes store escaped or binary data, or non-URL schemes. The decoder shows it exactly as encoded. If it's a Wi-Fi, vCard or UPI code, use the parsed field breakdown above the raw string for the human-readable version.",
    },
    {
      problem: "It won't read my barcode / Data Matrix.",
      solution:
        "This decoder handles square 2D QR codes only. It does not read 1D retail barcodes (UPC/EAN) or other 2D symbologies such as Data Matrix, Aztec or PDF417, those need different decoding engines.",
    },
    {
      problem: "The camera won't start.",
      solution:
        "Browsers only allow camera access over HTTPS (or localhost) and after you grant permission. Click the camera icon in the address bar to allow it, or just paste/upload an image instead. No camera is required for the decode.",
    },
  ],

  tips: [
    "The fastest path on desktop: screenshot the code, then Ctrl/Cmd+V straight onto the page. No file to save.",
    "Always read the decoded URL as text before hitting Open, so you know the exact destination and query string.",
    "Keep a little white margin around the code in any image, decoders need that quiet zone to lock on.",
    "For Wi-Fi, vCard and UPI codes, use the parsed field rows for readability and the raw string for exactness.",
    "A straight-on, evenly lit shot decodes more reliably than a high-resolution but glary or angled one.",
  ],

  security:
    "Every decode happens on your device. Pasted, dropped and uploaded images, and any camera frames, are decoded in-browser with the jsQR engine on raw canvas pixels. No image, video frame or decoded value is ever uploaded, stored, logged or transmitted. Camera access is only requested when you explicitly start it, and the stream is released the instant a code is read. Close the tab and nothing remains, which is why it's safe to decode codes containing Wi-Fi passwords, contact cards or payment handles.",

  faq: [
    {
      question: "What does a QR code decoder actually show me?",
      answer:
        "The exact string encoded in the QR (the raw payload, byte-for-byte and unescaped) shown in a copyable monospace field. Above it, a parsed breakdown classifies the scheme (URL, Wi-Fi, contact, UPI, geo, phone, email, SMS) and lays out its parts as labelled fields, so you get both the literal data and a human-readable view.",
    },
    {
      question: "How is this different from a QR code scanner?",
      answer:
        "A scanner is built to point-and-open. Read a code and go where it leads. This decoder is built to inspect: it puts the raw string front and centre for developers, QA and support who need to verify, debug or audit exactly what a code contains, with a paste-first, screenshot-friendly workflow. Same local jsQR engine, different focus.",
    },
    {
      question: "Can I decode a QR code by pasting a screenshot?",
      answer:
        "Yes: that's the primary workflow. Capture the code with your OS screenshot tool, then press Ctrl/Cmd+V anywhere on the page and it decodes instantly. You can also drag an image file in, click to upload, or use your webcam. It's ideal for codes trapped in emails, PDFs, slides or on another screen.",
    },
    {
      question: "Is my image or decoded data uploaded anywhere?",
      answer:
        "No. All decoding runs entirely in your browser using the jsQR engine on raw canvas pixels. The image, any camera frame and the decoded value are never sent to a server, stored or logged. That makes it safe to decode codes that contain Wi-Fi passwords, personal contact details or payment handles.",
    },
    {
      question: "Can it reveal the Wi-Fi password inside a QR code?",
      answer:
        "Yes. Decode a standard Wi-Fi QR (a WIFI: payload) and it parses out the network name (SSID), the security type and the plaintext password as labelled fields (and also shows the full raw WIFI: string) so you can type the credentials into any device that can't scan.",
    },
    {
      question: "Why does the raw value look strange or contain escape characters?",
      answer:
        "Because that's genuinely what's stored. Wi-Fi and vCard payloads use structured formats with delimiters and escaping, and some codes hold non-URL schemes or binary data. The decoder shows the true bytes as encoded. For a readable view of structured codes, use the parsed field breakdown shown above the raw string.",
    },
    {
      question: "Does it decode barcodes or Data Matrix codes too?",
      answer:
        "No. It's a dedicated decoder for square 2D QR codes. It does not read 1D retail barcodes (UPC/EAN) or other 2D symbologies such as Data Matrix, Aztec or PDF417, those require entirely different decoding engines.",
    },
    {
      question: "It can't decode my code. Is the tool broken?",
      answer:
        "Almost always it's the image, not the tool. Very small, blurry, angled, low-contrast or cropped codes are hard to read. Try a sharper, straight-on image that shows the whole code plus a white margin, improve the lighting, and avoid heavily downscaled screenshots. A physically damaged QR can be unreadable by any decoder.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: paste / drag-drop / upload / webcam decoding via jsQR, with the byte-for-byte raw payload shown alongside a scheme-aware parsed breakdown for URL, Wi-Fi, vCard, email, phone, SMS, geo and UPI codes.",
    },
    {
      date: "2026-06-28",
      change:
        "Added inversion-aware decoding so light-on-dark and styled codes read reliably, plus copy-value and context-aware Open actions on the parsed result.",
    },
  ],

  relatedTools: ["qr-code-scanner", "qr-code-generator", "wifi-qr-code-generator", "barcode-generator"],
};

export default qrCodeDecoder;
