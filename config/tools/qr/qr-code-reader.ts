import type { Tool } from "@/types";

/**
 * QR Code Reader: the image-first companion to the platform's live scanner.
 * Where the QR Code Scanner leads with a webcam, this tool leads with a file:
 * the primary path is "drop or choose an image and read the code inside it",
 * with camera and clipboard paste as secondary paths. Every string of copy is
 * written for the *read-from-an-image* search intent: reading a QR out of a
 * screenshot, a downloaded photo, a PDF page or a saved picture, and is
 * deliberately distinct from the scanner tool so the two pages rank
 * independently. Decoding is 100% in-browser (jsQR on raw canvas pixels); no
 * image, frame or decoded value ever leaves the device.
 */
const qrCodeReader: Tool = {
  slug: "qr-code-reader",
  title: "QR Code Reader",
  description:
    "Read any QR code from an image in your browser. Drop or choose a photo, screenshot or saved picture and instantly reveal the link, Wi-Fi, contact or text inside. Camera and paste supported too. Nothing is uploaded.",
  category: "qr-tools",
  icon: "ScanLine",
  accent: "violet",
  status: "live",
  illustration: "qr-code-reader",
  featured: true,
  createdAt: "2026-06-20",

  h1: "QR Code Reader. Read a QR Code From Any Image, Online",
  tagline:
    "Have a QR code saved as a picture, a screenshot or inside a downloaded file? Drop it here (or choose it, paste it, or use your camera) and read exactly what it contains in an instant, decoded entirely on your own device.",
  longDescription:
    "The GigAI QR Code Reader is built around one everyday problem: you already have the QR code as an image, and you just need to know what's inside it. Maybe it arrived in an email, sits on a PDF invoice, was shared in a chat, or you saved it from a website, pointing a phone camera at a file you can already see makes no sense. So this reader is image-first: the moment you land, the drop zone is front and centre. Drag a picture straight onto the page, click to choose a file (PNG, JPG, WEBP or GIF), or paste a screenshot with Ctrl/Cmd+V, and it decodes the code from the raw pixels immediately. When the code is out in the physical world instead, a one-click camera path is right there too. Crucially, reading is genuinely local: powered by the jsQR engine running on a canvas in your browser, no image, camera frame or decoded value is ever uploaded, logged or transmitted. And it doesn't just spit out a raw string. It interprets the payload, recognising links, Wi-Fi credentials, vCard contacts, email, phone, SMS and geo-location codes, and laying them out as clean labelled fields with one-tap copy and a smart Open action. It is honest about what it can't do: it reads standard square QR codes, not one-dimensional retail barcodes or other 2D symbologies, and no reader can recover a genuinely damaged or unfocused code. There is no login, no account and no persistence: it's a single static page, so when you close the tab, every trace of what you read is gone.",

  ctaText: "Read a QR code image",

  keywords: [
    "qr code reader",
    "read qr code from image",
    "qr reader online",
    "read qr code from picture",
    "decode qr code from image",
    "qr code reader from photo",
    "read qr from screenshot",
    "qr code reader online free",
    "extract link from qr code image",
    "read qr code from pdf image",
    "qr image decoder",
    "qr code reader no app",
  ],

  seo: {
    title: "QR Code Reader. Read a QR Code From an Image Online (Free) | GigAI Tools",
    description:
      "Free online QR code reader. Drop, choose or paste an image (a screenshot, photo, or saved picture) and instantly decode the link, Wi-Fi, contact or text inside. Camera supported too. 100% in your browser, no app, no uploads.",
  },

  features: [
    {
      icon: "ImageUp",
      title: "Image-first: drop or choose a file",
      description:
        "The drop zone is the star. Drag a QR picture onto the page or click to select a PNG, JPG, WEBP or GIF, and it reads the code from the raw pixels the instant the file lands. No camera required.",
    },
    {
      icon: "Clipboard",
      title: "Paste a screenshot straight in",
      description:
        "Copied a QR to your clipboard? Press Ctrl/Cmd+V anywhere on the page and it decodes the pasted screenshot immediately: the fastest route when the code is already on your screen.",
    },
    {
      icon: "Camera",
      title: "Camera path when you need it",
      description:
        "For codes in the real world, a one-click webcam reader reads a QR the moment it enters frame, with an on-screen targeting guide. It's optional, the image path never touches your camera.",
    },
    {
      icon: "ScanLine",
      title: "Reads the meaning, not just the text",
      description:
        "It recognises URLs, Wi-Fi, vCard, email, phone, SMS and geo codes and renders them as clean, labelled fields, so you see a real contact or network, not a wall of raw characters.",
    },
    {
      icon: "Copy",
      title: "Copy or open in one tap",
      description:
        "Copy the decoded value to your clipboard, or hit Open to follow the link, dial the number, start the email or view the location on a map: the action adapts to what the code holds.",
    },
    {
      icon: "ShieldCheck",
      title: "Decoded on your device, never uploaded",
      description:
        "Reading runs on raw canvas pixels with jsQR in your browser. No image, camera frame or decoded result is ever sent to a server, stored or logged, safe even for Wi-Fi passwords and contacts.",
    },
  ],

  benefits: [
    {
      title: "Read the code you already have",
      description:
        "When the QR is a file (an email attachment, a saved image, a PDF page, a chat screenshot) you shouldn't have to photograph a screen. Drop the file straight in and get the answer.",
    },
    {
      title: "See where a code leads before you go",
      description:
        "The destination appears as plain text first, so you can inspect a link, spot a shortened or mismatched domain, and decide whether to open it: rather than blindly trusting a black-and-white square.",
    },
    {
      title: "Recover details trapped in a picture",
      description:
        "Pull the Wi-Fi password out of a printed-network photo, or the contact details out of a business-card QR, and copy them straight into whatever device or form you need them in.",
    },
    {
      title: "No install, no account, nothing to leak",
      description:
        "It's a single static page that reads locally. No app to download, no sign-up, no upload, which is exactly why it's safe to read codes that contain private information.",
    },
  ],

  howTo: [
    {
      title: "Bring in the image",
      description:
        "Drag a QR picture onto the drop zone, click to choose a file, or paste a screenshot with Ctrl/Cmd+V. Prefer a real-world code? Click the camera option instead.",
    },
    {
      title: "Let it decode",
      description:
        "The reader scans the pixels and pulls out the QR automatically. No shutter, no button. A clear image with the whole code visible reads fastest.",
    },
    {
      title: "Read the result",
      description:
        "It shows the code's type (link, Wi-Fi, contact and so on), a tidy field breakdown, and the exact raw value it contains.",
    },
    {
      title: "Copy or open",
      description:
        "Copy the value, or hit Open to follow the link, dial the number, start the email or view the location, whatever the code encodes.",
    },
    {
      title: "Read another",
      description:
        "Clear the result and drop in the next image. Nothing is remembered between reads.",
    },
  ],

  formats: {
    input: ["PNG", "JPG", "WEBP", "GIF", "Webcam"],
    output: ["Text", "URL", "Wi-Fi", "vCard"],
  },

  useCases: [
    {
      audience: "Anyone with a saved image",
      title: "Decode a QR you downloaded or were sent",
      description:
        "A friend shares a QR in a chat, or you save one from a page. Drop the picture in and read the link instantly instead of trying to aim a phone at your own screen.",
    },
    {
      audience: "Office / admin",
      title: "Pull a link out of a PDF or document",
      description:
        "An invoice, brochure or ticket PDF carries a QR you can't click. Export the page as an image, drop it here, and copy the underlying URL in seconds.",
    },
    {
      audience: "Traveller / guest",
      title: "Read a Wi-Fi code from a photo",
      description:
        "Snap the Wi-Fi QR taped to a café wall, drop the photo in, and read the exact network name and password to type into any laptop or console that can't scan.",
    },
    {
      audience: "Cautious clicker",
      title: "Vet a suspicious code as an image",
      description:
        "Save the QR from a flyer or sticker as a picture and read it here first. The real destination appears as text, so you can catch a dodgy domain before you ever visit it.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says no QR code was found in my image.",
      solution:
        "The code may be too small, blurry, low-contrast, angled or partly cropped. Use a sharper, straight-on picture where the whole code plus a little white margin is visible, and avoid heavily compressed or downscaled screenshots.",
    },
    {
      problem: "My screenshot won't paste.",
      solution:
        "Make sure the image is actually on your clipboard (copy it as an image, not a file link) and that you've clicked onto the page before pressing Ctrl/Cmd+V. Some browsers restrict clipboard image access. If paste is blocked, just choose or drag the file instead.",
    },
    {
      problem: "The camera won't start.",
      solution:
        "Browsers only allow camera access on secure (HTTPS or localhost) pages and after you grant permission. Click the camera icon in your address bar to allow it, or simply stick with the image path. Reading from a file needs no camera at all.",
    },
    {
      problem: "It won't read my barcode.",
      solution:
        "This is a QR-code reader for square 2D QR codes only. It does not decode 1D retail barcodes (UPC/EAN) or other 2D symbologies such as Data Matrix, Aztec or PDF417, which need a different decoding engine.",
    },
  ],

  tips: [
    "The quickest read on desktop: copy the QR image, click the page, and paste with Ctrl/Cmd+V.",
    "Keep a little white 'quiet zone' around the code in any image, decoders need that margin to lock on.",
    "Always read the decoded link as text before hitting Open, so you know exactly where it leads.",
    "A sharp, straight-on, well-lit image beats a high-resolution but glary or skewed one every time.",
    "No camera? You lose nothing here, the drop, choose and paste paths read just as accurately.",
  ],

  security:
    "Every read happens on your device. Uploaded images, pasted screenshots and camera frames are decoded in-browser with the jsQR engine on raw canvas pixels. No picture, frame or decoded value is ever uploaded, stored, logged or transmitted. Camera access is only ever requested when you explicitly choose the camera option, and the stream is released the moment a code is read or you stop. Close the tab and nothing remains.",

  faq: [
    {
      question: "How do I read a QR code from an image?",
      answer:
        "Drop the image onto the reader, click to choose the file, or paste a screenshot with Ctrl/Cmd+V. It accepts PNG, JPG, WEBP and GIF, decodes the QR from the raw pixels locally, and shows you exactly what's inside. No camera and no upload needed.",
    },
    {
      question: "Can I read a QR code from a screenshot?",
      answer:
        "Yes, it's one of the main uses. Take a screenshot of the QR, then paste it straight onto the page with Ctrl/Cmd+V, or save it and drop the file in. This is ideal for codes trapped inside emails, PDFs, slides or another screen where a phone camera can't help.",
    },
    {
      question: "Does the reader upload my image anywhere?",
      answer:
        "No. All decoding runs entirely in your browser with the jsQR engine on raw canvas pixels. No image, camera frame or decoded result is ever sent to a server, stored or logged, so it's completely private: safe even for codes containing Wi-Fi passwords or personal contact details.",
    },
    {
      question: "Can it read the Wi-Fi password from a QR image?",
      answer:
        "Yes. When you read a standard Wi-Fi QR code from a picture, the reader parses it and shows the network name (SSID), the security type and the actual password as plain readable text, so you can type the credentials into any device.",
    },
    {
      question: "What image formats can I read a QR code from?",
      answer:
        "PNG, JPG (JPEG), WEBP and GIF. If your QR lives in a PDF or document, export or screenshot the page as one of those image formats first, then drop it in. For best results use a clear, un-cropped image where the whole code is visible.",
    },
    {
      question: "Do I need to install an app or create an account?",
      answer:
        "No. The reader is a single static web page with no sign-up and no download. Open it, drop in an image, and read the code. It works in any modern browser on desktop or mobile, and there's nothing to install.",
    },
    {
      question: "What's the difference between this and the QR Code Scanner?",
      answer:
        "They share the same private, in-browser engine but are tuned differently. This QR Code Reader leads with reading a code out of an image you already have (drop, choose or paste a file first) while the QR Code Scanner leads with live webcam scanning of codes in the real world. Both support image, paste and camera. Pick whichever matches how your code reaches you.",
    },
    {
      question: "It can't read my QR image: what's wrong?",
      answer:
        "Almost always the picture, not the code. Very small, blurry, angled, low-contrast or cropped images are hard to decode. Try a sharper, straight-on image that includes the whole code plus a little white margin, and avoid heavily downscaled screenshots. A genuinely damaged QR can be unreadable by any reader.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: image-first QR reading with drag-and-drop, file choose and clipboard paste, plus an optional webcam path, all decoded in-browser with jsQR and typed result parsing for URL, Wi-Fi, vCard, email, phone, SMS and geo payloads.",
    },
    {
      date: "2026-06-27",
      change:
        "Improved decoding of low-contrast, compressed and slightly angled images, and added copy and context-aware Open actions on every parsed field.",
    },
  ],

  relatedTools: [
    "qr-code-scanner",
    "qr-code-generator",
    "wifi-qr-code-generator",
    "vcard-qr-code-generator",
    "barcode-generator",
  ],
};

export default qrCodeReader;
