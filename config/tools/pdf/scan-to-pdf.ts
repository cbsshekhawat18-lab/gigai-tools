import type { Tool } from "@/types";

/**
 * Scan to PDF: camera capture, assembled with the shared imagesToPdf engine.
 *
 * Keyword lane is the CAMERA ("scan to pdf", "scan document with phone"),
 * deliberately distinct from `jpg-to-pdf`, which owns converting images you
 * already have. Both end in the same engine; only the input differs.
 *
 * No claim of edge detection or perspective correction anywhere. It captures
 * and assembles. Promising "auto-crop" and delivering a skewed photo would be
 * worse than not offering the feature.
 */
const scanToPdf: Tool = {
  slug: "scan-to-pdf",
  title: "Scan to PDF",
  description:
    "Use your phone or laptop camera as a document scanner, capture pages and get one PDF, with nothing ever uploaded.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "Camera",
  accent: "cyan",
  processor: "convert",
  status: "live",
  serverSide: false,
  createdAt: "2026-08-11",

  h1: "Scan to PDF, Turn Your Camera Into a Document Scanner",
  tagline: "Photograph the pages. Get one PDF. Nothing uploaded.",
  ctaText: "Scan a document",

  longDescription:
    "You need to send someone a signed page, a receipt, a form or a certificate, and the only scanner in the building is your phone. The usual route is a free scanner app that wants an account, shows adverts, watermarks the output and, most importantly, uploads your document to somebody's cloud so it can be 'processed'. For a receipt that's irritating. For a passport page, a payslip or a signed contract, it's a genuinely bad idea. GigAI Scan to PDF turns the camera you already have into a scanner without any of that. Grant camera access, point at the page, and capture. Each shot appears as a numbered thumbnail you can review and remove, so a page that came out blurry gets retaken rather than discovered later. Capture as many pages as the document has, in order, then build a single A4 PDF ready to email or upload. You can mix in photos already on your device too, which is handy when half the pages were shot earlier or someone sent you an image of the missing one. Everything happens on the device: frames are captured to a canvas in the browser and assembled with the same engine our JPG to PDF tool uses, so no image and no page is ever transmitted anywhere, and the camera stream is released the moment you stop or navigate away. What this deliberately does not claim is automatic edge detection or perspective correction. It captures what the camera sees and assembles it faithfully. A tool that promised to auto-straighten your page and then delivered a skewed photograph would be worse than one that was honest about being a careful camera, so for the cleanest results, lay the page flat, get even light with no shadow from your own hand, and hold the camera square above it. If you need the finished PDF to be searchable, run it through OCR PDF afterwards to add a real text layer. Free, unlimited, no account and no watermark.",

  keywords: [
    "scan to pdf",
    "scan document to pdf",
    "phone camera to pdf",
    "scan with camera online",
    "document scanner online",
    "scan receipt to pdf",
    "webcam to pdf",
    "scan to pdf free",
  ],

  tags: ["pdf", "scan", "camera", "mobile", "documents"],
  fileTypes: ["pdf", "jpg", "png"],
  audiences: ["business", "students", "freelancers"],

  seo: {
    title: "Scan to PDF Online Free: Use Your Camera, Nothing Uploaded",
    description:
      "Scan documents to PDF with your phone or laptop camera. Multi-page, no account, no watermark, and nothing is ever uploaded. It all runs in your browser.",
  },

  features: [
    {
      icon: "Camera",
      title: "Your camera, no app to install",
      description:
        "Works with the phone or laptop camera you already have, straight from the browser. No download, no account, no advertising in the middle of your document.",
    },
    {
      icon: "CloudOff",
      title: "Nothing is uploaded, including the frames",
      description:
        "Captures go to a canvas in the tab and are assembled on your device. Scanner apps routinely upload your pages to process them. This never sends a single byte.",
    },
    {
      icon: "Files",
      title: "Multi-page in one go",
      description:
        "Capture page after page and they queue as numbered thumbnails. Retake a blurry one before you build, rather than discovering it after you've sent the file.",
    },
    {
      icon: "ImagePlus",
      title: "Mix in photos you already have",
      description:
        "Add images from your device alongside live captures. Useful when some pages were shot earlier or someone sent you the one you were missing.",
    },
    {
      icon: "ShieldCheck",
      title: "The camera is released properly",
      description:
        "The stream stops when you stop it and when you leave the page. No indicator light left on after you've moved away.",
    },
  ],

  benefits: [
    {
      title: "A scanner wherever you are",
      description:
        "Sign a page, photograph it and send a proper PDF back in a minute, without finding an office or a printer.",
    },
    {
      title: "Safe for documents that matter",
      description:
        "Passport pages, payslips, bank letters and signed contracts stay on your device, the exact documents you should never hand to a free cloud scanner.",
    },
    {
      title: "One clean file, not eight photos",
      description:
        "Recipients get a single ordered PDF rather than a message full of loose images in the wrong order.",
    },
  ],

  howTo: [
    {
      title: "Start the camera",
      description:
        "Allow camera access when your browser asks. On a phone the rear camera is selected automatically, since it's the sharper one.",
    },
    {
      title: "Capture each page",
      description:
        "Lay the page flat with even light and hold the camera square above it. Each capture appears as a numbered thumbnail you can remove and retake.",
    },
    {
      title: "Build the PDF",
      description:
        "Press Make PDF and the captures are assembled into one A4 document, in order, on your device.",
    },
    {
      title: "Download, and OCR if you need it searchable",
      description:
        "Save the file. To make the text selectable and searchable, run it through OCR PDF afterwards.",
    },
  ],

  formats: {
    input: ["Camera", "JPG", "PNG", "WebP", "HEIC"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Business",
      title: "Signed contracts and invoices",
      description:
        "Photograph a signed page and return a proper PDF the same minute, without the document passing through a third-party scanner service.",
    },
    {
      audience: "Freelancers",
      title: "Receipts and expenses",
      description:
        "Capture a stack of receipts as one multi-page PDF for an expense claim, instead of attaching a dozen separate photos.",
    },
    {
      audience: "Students",
      title: "Handwritten notes and handouts",
      description:
        "Turn lecture notes or a marked-up worksheet into a single shareable PDF for a study group.",
    },
    {
      audience: "Anyone",
      title: "ID and official documents",
      description:
        "Scan a passport page or utility bill for an application, knowing the image was never uploaded to anyone's server to be 'enhanced'.",
    },
  ],

  troubleshooting: [
    {
      problem: "The camera won't start",
      solution:
        "Check the permission prompt, if you dismissed it, re-allow camera access from the icon in your browser's address bar and press Start camera again. Camera access also requires a secure connection, which this site uses. If the device has no camera, add photos from your device instead. Everything after that step is identical.",
    },
    {
      problem: "The scan is blurry or dark",
      solution:
        "Phone cameras need light and a moment to focus. Lay the page flat, use even light, and make sure your own shadow isn't falling across it. Hold still for a second before capturing, and hold the camera square above the page rather than at an angle.",
    },
    {
      problem: "The page is skewed or has the desk in it",
      solution:
        "This tool captures what the camera sees. It doesn't detect page edges or correct perspective, and it doesn't claim to. Frame the page to fill the view before capturing. If a shot came out badly, remove that thumbnail and retake it rather than accepting it.",
    },
    {
      problem: "I can't select the text in my scanned PDF",
      solution:
        "A scan is a picture of a page, so there's no text in it to select. Run the finished PDF through OCR PDF, which recognises the words and adds a real text layer, and it becomes searchable and copyable.",
    },
    {
      problem: "The PDF is large",
      solution:
        "Photographs are heavy, and a multi-page scan adds up quickly. Run the result through Compress PDF, scanned pages usually shrink a lot with very little visible difference.",
    },
  ],

  tips: [
    "Even light and no hand-shadow matter more than megapixels for a readable scan.",
    "Check each thumbnail as you go. Retaking a page now is far easier than after you've sent it.",
    "Run OCR PDF afterwards if the document needs to be searchable.",
    "Compress PDF after scanning: photographed pages shrink dramatically with almost no visible loss.",
  ],

  security:
    "Nothing is uploaded. Not the camera stream, not the captured frames, not the finished PDF. Each capture is drawn to a canvas inside the browser tab and the pages are assembled on your device, so a passport page, payslip or signed contract never reaches a server. This is the specific reason the tool exists: free scanner apps routinely send your documents to their cloud to 'process' them, which is exactly what you don't want for the documents people most often need to scan. The camera stream is stopped when you stop it and released automatically when you leave the page. Nothing is stored, logged or transmitted, there's no account, and closing the tab discards everything.",

  faq: [
    {
      question: "Are my scans uploaded anywhere?",
      answer:
        "No. The camera frames are captured to a canvas in your browser and the PDF is assembled on your device. Nothing is transmitted, stored or logged. That is all there is to it: free scanner apps usually upload your pages to process them, and the documents people scan most (ID, payslips, signed contracts) are precisely the ones that shouldn't be sent anywhere.",
    },
    {
      question: "Does it detect page edges and straighten the scan?",
      answer:
        "No, and we won't claim it does. It captures what the camera sees and assembles those images faithfully. Auto-cropping that guesses wrong ruins a document more thoroughly than no auto-cropping at all. Frame the page to fill the view, keep the camera square above it, and check each thumbnail before you build.",
    },
    {
      question: "Can I make the scanned PDF searchable?",
      answer:
        "Yes. Run the finished file through OCR PDF. A scan is a picture of a page, so there's no text in it until optical character recognition reads the words and adds a text layer. After that you can search and copy from it like any normal PDF.",
    },
    {
      question: "Can I add photos I already took?",
      answer:
        "Yes. Use Add photos to bring in images from your device, and mix them with live captures in any order. They're all assembled into the same PDF.",
    },
    {
      question: "Why is my scanned PDF so big?",
      answer:
        "Because photographs are much heavier than text. A few pages at full camera resolution add up fast. Run it through Compress PDF: scanned pages typically shrink a great deal with very little visible difference.",
    },
    {
      question: "Does it work on a laptop?",
      answer:
        "Yes, using the webcam, though a phone's rear camera is usually far sharper for documents. On a phone the rear camera is chosen automatically for that reason.",
    },
  ],

  changelog: [
    { date: "2026-08-11", change: "Scan to PDF released, in-browser camera capture, multi-page, nothing uploaded." },
  ],

  relatedTools: ["jpg-to-pdf", "ocr-pdf", "compress-pdf", "merge-pdf"],
};

export default scanToPdf;
