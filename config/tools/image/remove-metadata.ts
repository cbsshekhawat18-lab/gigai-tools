import type { Tool } from "@/types";

/**
 * Remove Metadata (privacy auditor): reads the EXIF/GPS inside a photo or the
 * info dictionary of a PDF, shows what it exposes (location, device, author,
 * dates), and downloads a cleaned copy. 100% on-device, the whole trust angle
 * is that these files are never uploaded. Honest scope: image cleaning
 * re-encodes to guarantee removal; PDF cleaning clears identifying fields.
 */
const removeMetadata: Tool = {
  slug: "remove-metadata",
  title: "Remove Metadata",
  description:
    "See the hidden data inside a photo or PDF (GPS location, your device, author, dates) and download a clean copy with it stripped. Private, in your browser.",
  category: "image-tools",
  icon: "ShieldCheck",
  accent: "emerald",
  status: "live",
  featured: false,
  createdAt: "2026-07-09",

  h1: "Remove Metadata & EXIF: Before You Share",
  tagline:
    "Photos and PDFs quietly carry your GPS location, device and name. See exactly what a file reveals about you, then download a cleaned copy: all on your device.",
  longDescription:
    "Every photo your phone takes can embed the exact GPS coordinates where you stood, your device model and serial number, and the date and time, and PDFs carry your name, the software you used and more. Post or send one and you may be sharing far more than you think. The GigAI metadata remover reads all of that hidden EXIF and document metadata, shows you in plain language what it exposes (with location flagged as high-risk), and lets you download a cleaned copy with the metadata stripped. Crucially, it runs entirely in your browser. The file is read and cleaned on your own device and is never uploaded, which is exactly how a privacy tool should work: you shouldn't have to hand a geotagged personal photo to a random website to remove its location. Cleaning an image re-encodes it (high-quality JPEG or lossless PNG) so every trace of metadata is gone. Cleaning a PDF clears the author, title, subject and producer fields.",

  ctaText: "Check a file",

  keywords: [
    "remove metadata",
    "remove exif data",
    "remove gps from photo",
    "strip exif online",
    "remove location from photo",
    "clean photo metadata",
    "remove metadata from pdf",
    "exif viewer",
    "check photo metadata",
    "remove geotag from image",
  ],

  seo: {
    title: "Remove Metadata & EXIF from Photos & PDFs: Free & Private | GigAI Tools",
    description:
      "See and remove hidden metadata (GPS location, device, author) from photos and PDFs before you share. 100% in your browser, never uploaded. Free, no sign-up.",
  },

  features: [
    {
      icon: "MapPinOff",
      title: "Catches your location first",
      description:
        "GPS coordinates are flagged as high-risk, the single most sensitive thing a photo can leak about where you live, work or travel.",
    },
    {
      icon: "ScanEye",
      title: "Shows everything it finds",
      description:
        "Device make and model, serial number, owner name, editing software and timestamps: in plain language, ranked by how sensitive each one is.",
    },
    {
      icon: "ShieldCheck",
      title: "One-click clean copy",
      description:
        "Download a stripped version, then a re-scan confirms the metadata is actually gone. No guessing.",
    },
    {
      icon: "Lock",
      title: "Never leaves your device",
      description:
        "A geotagged personal photo is the last thing you should upload to a random converter. Here it's read and cleaned locally in your browser.",
    },
  ],

  benefits: [
    {
      title: "Share photos without sharing your address",
      description:
        "Selling something online, posting a picture from home, sending a document: strip the location and personal details first so a public post doesn't map back to you.",
    },
    {
      title: "Clean documents before sending",
      description:
        "PDFs carry your name and the app you used. Remove that before a résumé, contract or report goes to someone you don't know.",
    },
    {
      title: "Private by design",
      description:
        "Because the file never leaves your browser, you're not trading one privacy risk (metadata) for another (uploading a sensitive file).",
    },
  ],

  howTo: [
    {
      title: "Drop in a photo or PDF",
      description:
        "Add a JPG, PNG, WebP, GIF or PDF. It's read in your browser. Nothing is uploaded.",
    },
    {
      title: "See what it reveals",
      description:
        "Review the findings: GPS location, device, author, dates and more, each ranked by sensitivity.",
    },
    {
      title: "Download the cleaned copy",
      description:
        "Click to strip the metadata and save a clean version. A re-scan confirms it's gone.",
    },
    {
      title: "Share with confidence",
      description:
        "Post or send the cleaned file knowing it no longer carries your location or personal details.",
    },
  ],

  faq: [
    {
      question: "What metadata does a photo contain?",
      answer:
        "EXIF data: often the exact GPS coordinates where the photo was taken, your camera or phone make and model, sometimes a serial number, the date and time, editing software, and occasionally an owner name. It's invisible in the picture but readable by anyone who receives the file.",
    },
    {
      question: "Is my photo or PDF uploaded?",
      answer:
        "No, and That is the point. The file is read and cleaned entirely in your browser. A privacy tool that uploaded your sensitive file would defeat its own purpose.",
    },
    {
      question: "Does removing metadata change the image?",
      answer:
        "The picture looks the same. To guarantee every trace of metadata is removed, the tool re-encodes the image, as high-quality JPEG (visually identical) or lossless PNG. The pixels you see are unchanged.",
    },
    {
      question: "Can I remove the location only?",
      answer:
        "The cleaned copy removes all embedded metadata, including GPS location, in one step. That's the safest default: partial removal can leave other identifying details behind.",
    },
    {
      question: "What about HEIC photos from iPhone?",
      answer:
        "HEIC can't be cleaned directly in the browser. Convert it to JPG first with the HEIC to JPG tool, then clean the JPG here.",
    },
  ],

  relatedTools: [
    "redaction-checker","image-compressor", "image-resizer", "heic-to-jpg"],
};

export default removeMetadata;
