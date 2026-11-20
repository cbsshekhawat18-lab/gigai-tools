import type { Tool } from "@/types";

/**
 * JPG to PDF, combine one or many images (JPG, PNG, WebP…) into a single PDF,
 * one image per page. All copy is unique to image-to-PDF conversion and kept
 * honest: images are embedded at native resolution with pdf-lib entirely in the
 * browser, in the exact order you arrange them, and nothing is ever uploaded.
 */
const jpgToPdf: Tool = {
  slug: "jpg-to-pdf",
  title: "JPG to PDF",
  description:
    "Convert JPG, PNG and other images into a single PDF: reorder them, pick a page size, then download. Free, fast and fully in your browser.",
  category: "pdf-tools",
  group: "Convert to PDF",
  icon: "FileImage",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "JPG to PDF Converter, Free, Private & Watermark-Free",
  tagline:
    "Turn photos, screenshots and scans into one clean PDF. Add as many images as you like, drag them into order, choose A4 or Letter, and export in seconds. No uploads, no watermark.",
  longDescription:
    "The GigAI JPG to PDF converter wraps your images into a single, share-ready PDF without ever sending them to a server. Drop in JPGs, PNGs or WebP files, arrange them in the order you want, and the tool embeds each picture at its native resolution using pdf-lib, one image per page, right inside your browser tab. Choose a fixed A4 or Letter page (portrait or landscape) so scanned receipts and photos print cleanly, or use the 'fit page to image' option to keep every pixel edge-to-edge with no borders. Because the whole conversion runs locally, it's instant even for a stack of high-resolution photos, adds no watermark, and keeps your images completely private.",

  ctaText: "Convert to PDF",

  keywords: [
    "jpg to pdf",
    "image to pdf",
    "png to pdf",
    "convert jpg to pdf",
    "photos to pdf",
    "jpg to pdf converter",
    "combine images into pdf",
    "picture to pdf",
    "scan to pdf",
  ],

  seo: {
    title: "JPG to PDF, Convert Images to PDF Online Free | GigAI Tools",
    description:
      "Convert JPG, PNG and WebP images to PDF free. Combine multiple photos into one file, reorder pages, pick A4 or Letter: 100% private, no uploads, no watermark.",
  },

  features: [
    {
      icon: "Images",
      title: "Many images, one PDF",
      description:
        "Add a single photo or a whole batch of scans. Every image becomes its own page, combined into one continuous document you can share or print.",
    },
    {
      icon: "LayoutTemplate",
      title: "A4, Letter or fit-to-image",
      description:
        "Lay images out on a standard A4 or Letter page in portrait or landscape, or choose 'fit page to image' so each page matches the photo exactly. No borders.",
    },
    {
      icon: "FileImage",
      title: "JPG, PNG, WebP and more",
      description:
        "JPGs and PNGs embed directly, keeping full quality. Other formats like WebP, GIF or BMP are converted on the fly so the export never fails.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Images are read and packed into a PDF locally with pdf-lib. They're never uploaded, stored or seen by anyone, the privacy promise holds for every picture.",
    },
    {
      icon: "Sparkles",
      title: "No watermark, no limit",
      description:
        "Convert two images or two hundred. There's no file cap, no page ceiling and nothing stamped onto your output, just a clean, single PDF.",
    },
  ],

  benefits: [
    {
      title: "Native-resolution quality",
      description:
        "Each image is embedded at its original pixel dimensions, so text in scans stays sharp and photos keep their detail. No re-compression by default.",
    },
    {
      title: "You control the page order",
      description:
        "Nothing is auto-sorted. Drag images into the exact sequence you want and remove any you added by mistake before you export a single page.",
    },
    {
      title: "Private by design",
      description:
        "The conversion runs entirely inside your browser tab. Your photos never leave your device, so there's nothing for us to upload, store or read.",
    },
    {
      title: "Free on any device",
      description:
        "No account, no paywall, no install. Convert from a laptop, tablet or phone and get the same clean PDF every time, as often as you like.",
    },
  ],

  howTo: [
    {
      title: "Add your images",
      description:
        "Drag your JPG or PNG files onto the drop zone, or click to browse and pick several at once. Add more images at any point.",
    },
    {
      title: "Order and set the layout",
      description:
        "Drag images into the sequence you want, then choose a page size (A4, Letter or fit-to-image) and portrait or landscape orientation.",
    },
    {
      title: "Convert",
      description:
        "Hit Convert to PDF. The tool embeds each image, in order, into one document: locally, in a moment, with no upload.",
    },
    {
      title: "Download",
      description:
        "Download your single combined PDF. Need a change? Reorder or adjust the layout and convert again, it's instant and unlimited.",
    },
  ],

  formats: {
    input: ["JPG", "JPEG", "PNG", "WebP", "GIF", "BMP"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Turn a photographed contract into a PDF",
      description:
        "Snap each signed page with your phone, drop the photos in, set A4 portrait and export a single tidy PDF ready to email or file. No scanner needed.",
    },
    {
      audience: "Student",
      title: "Submit handwritten notes as one file",
      description:
        "Photograph each page of your worked solutions, arrange them in order, and hand in a single PDF that meets a one-file upload requirement.",
    },
    {
      audience: "Business",
      title: "Bundle expense receipts for a claim",
      description:
        "Combine a month of receipt photos into one ordered PDF for accounting, keeping each receipt on its own clearly separated page.",
    },
  ],

  troubleshooting: [
    {
      problem: "My images ended up in the wrong order in the PDF.",
      solution:
        "The PDF follows the image list top-to-bottom. Drag each image into place (or use the up/down arrows) before converting: the number on each row is its page number in the final document.",
    },
    {
      problem: "My photo looks small with wide white borders.",
      solution:
        "That happens when a portrait photo sits on a fixed A4/Letter page. Switch orientation to match the image, or pick 'fit page to image' so the page hugs the photo edge-to-edge with no margins.",
    },
    {
      problem: "The finished PDF is very large.",
      solution:
        "High-resolution photos carry a lot of data and each becomes a full page, so sizes add up. Run the result through our Compress PDF tool to shrink it while keeping it readable.",
    },
  ],

  tips: [
    "Rename files 1-front, 2-back, 3-signature before dropping them in: they'll sort naturally into the right page order.",
    "For document scans, choose A4 or Letter in portrait so pages print at the standard size a printer expects.",
    "Use 'fit page to image' for photo albums or artwork where you want each picture full-bleed with no white margin.",
    "Converting phone photos of paper? Crop and straighten them first, then convert here for a cleaner, scanner-like result.",
  ],

  security:
    "Your images are converted to PDF entirely in your browser with pdf-lib and never uploaded to any server. Nothing is stored, logged or shared, when you close the tab, every photo is gone for good.",

  faq: [
    {
      question: "Are my images uploaded to a server?",
      answer:
        "No. The conversion runs entirely in your browser using pdf-lib. Your images are read, embedded and downloaded locally. They never leave your device, so there's nothing for us to store or see.",
    },
    {
      question: "Can I combine several images into one PDF?",
      answer:
        "Yes. Add as many images as you like and each becomes its own page in a single combined PDF. Drag them into the order you want first. The row number shows which page each image will become.",
    },
    {
      question: "Which image formats can I convert?",
      answer:
        "JPG and PNG embed directly at full quality. Other browser-readable formats like WebP, GIF and BMP are automatically re-encoded to a lossless PNG during conversion, so the export works no matter what you drop in.",
    },
    {
      question: "What's the difference between A4/Letter and 'fit page to image'?",
      answer:
        "A4 and Letter place each image, centred and scaled to fit, on a fixed standard page: best for documents you'll print. 'Fit page to image' makes every page match its photo's exact pixel size, giving borderless, full-bleed results ideal for photos and artwork.",
    },
    {
      question: "Will converting add a watermark or reduce quality?",
      answer:
        "Never. No watermark is added, and images are embedded at their native resolution, so nothing is re-compressed by default (aside from non-standard formats that are losslessly converted to PNG). What you put in is what lands in the PDF.",
    },
    {
      question: "Is there a limit on how many images I can convert?",
      answer:
        "There's no artificial cap, convert two images or a few hundred. The only practical limit is your device's memory, since all the images are held in the browser while they're packed into the PDF.",
    },
  ],

  relatedTools: ["pdf-to-jpg", "merge-pdf", "compress-pdf", "word-to-pdf"],
};

export default jpgToPdf;
