/**
 * Task Hubs: job-to-be-done landing pages at `/task/<slug>`.
 *
 * Each hub aggregates every live tool that helps a visitor accomplish one
 * concrete task (compress files, convert files, create QR codes…). This is the
 * top user + SEO intent layer: someone who wants to "resize images" lands on a
 * single page listing every relevant tool, an AI-answer block, and an FAQ.
 *
 * DISK-LEAN: exactly 13 config-driven hubs. No per-tool wiring, no generated
 * near-duplicate pages. Tools are matched from the registry at build time by
 * their tags/keywords/category/slug, so hubs stay in sync as the library grows.
 *
 * The slugs / icons / accents / match tokens MIRROR the fixed task-hub
 * catalogue in `lib/seo/related-web.ts` so the cross-link chips and these
 * landing pages always agree.
 *
 * SERVER-SAFE: `getTaskTools` imports the registry, so it (like the config)
 * must only be used from server components / build-time code.
 */
import type { AccentKey, FaqItem, IconName, Tool } from "@/types";
import { getAllTools, isLiveTool } from "@/lib/registry";

export interface TaskHub {
  /** URL slug, one of the 13 fixed task slugs. */
  slug: string;
  /** Short label used in nav/cards, e.g. "Compress Files". */
  title: string;
  /** SEO H1 (may be longer/more descriptive than `title`). */
  h1: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  icon: IconName;
  accent: AccentKey;
  /** One-line lead-in shown above the tool grid. */
  intro: string;
  /** Entity-rich answer paragraph for the AI-answer block. */
  answer: string;
  faq: FaqItem[];
  /**
   * Tool-matching rule. A tool matches when its slug contains any of these
   * lower-case substrings. Kept slug-only (not keywords) so matching is precise
   * and predictable: tool slugs are already action-named (e.g. "compress-pdf",
   * "image-resizer"), so this reliably picks the right tools without the false
   * positives that broad keyword matching produces.
   */
  match: string[];
  /**
   * Optional category allow-list. When set, only tools in these categories are
   * eligible; a second guard that keeps, e.g., "convert" from pulling in an
   * unrelated tool. Omit to match across all categories by slug alone.
   */
  categories?: string[];
}

export const TASK_HUBS: TaskHub[] = [
  {
    slug: "compress-files",
    title: "Compress Files",
    h1: "Compress Files Online, Free File Compressors",
    seoTitle: "Compress Files Online: Free Image, PDF, Video & Audio Compressors",
    seoDescription:
      "Shrink images, PDFs, videos and audio without losing quality. Free file compressors that run in your browser. No upload, no sign-up, no watermark.",
    keywords: ["compress files", "file compressor", "reduce file size", "shrink files", "compress online"],
    icon: "Minimize2",
    accent: "sky",
    intro: "Make any file smaller without wrecking its quality: pick the compressor for your format.",
    answer:
      "To compress a file online, choose the compressor that matches your format: an image compressor for JPG, PNG and WebP. A PDF compressor for documents. A video compressor for MP4 and WebM, and an audio compressor for MP3. Each tool re-encodes the file at a lower bitrate or quality level to cut its size, often by 50–90%, while keeping it visually and audibly close to the original. GigAI's compressors run entirely in your browser, so files never leave your device, there are no upload limits, and results are instant.",
    faq: [
      {
        question: "Does compressing a file reduce its quality?",
        answer:
          "Only as much as you allow. Every compressor exposes a quality or target-size control, so you can trade a little fidelity for a big size drop, or keep quality high and accept a smaller reduction. Lossless options exist for PNG and PDF where structure allows.",
      },
      {
        question: "Is there an upload or file-size limit?",
        answer:
          "No. Compression happens locally in your browser, so there is no server upload and no artificial file-size cap beyond what your device's memory allows.",
      },
      {
        question: "Are my files private?",
        answer:
          "Yes. Nothing is uploaded: the file is processed on your own device and never touches a server, so your documents, photos and videos stay completely private.",
      },
      {
        question: "Which file types can I compress here?",
        answer:
          "Images (JPG, PNG, WebP), PDFs, video (MP4, WebM) and audio (MP3, WAV). Pick the tool for your format from the list below.",
      },
    ],
    match: ["compress", "-minifier", "reduce-", "optimize-image"],
  },
  {
    slug: "convert-files",
    title: "Convert Files",
    h1: "Convert Files Online: Free File Format Converters",
    seoTitle: "Convert Files Online, Free Image, Document, Video & Audio Converters",
    seoDescription:
      "Change any file from one format to another: images, documents, video and audio. Free converters that run in your browser with no upload and no sign-up.",
    keywords: ["convert files", "file converter", "format converter", "change file format", "convert online"],
    icon: "Repeat",
    accent: "violet",
    intro: "Turn one format into another, grab the converter for the file type you have.",
    answer:
      "To convert a file, pick the converter for your source and target formats: image converters swap between JPG, PNG, WebP and SVG. Document converters move between PDF, DOCX, TXT and Markdown, and media converters transcode video (MP4, WebM, GIF) and audio (MP3, WAV). Each tool decodes the original and re-encodes it in the new container/codec so the result opens cleanly in any app that supports the target format. GigAI's converters process everything in-browser. No uploads, no queues, and no watermarks on the output.",
    faq: [
      {
        question: "How do I convert a file to another format?",
        answer:
          "Open the converter that matches your source and target format, drop your file in, choose the output type, and download. The whole conversion runs on your device.",
      },
      {
        question: "Will converting change how my file looks?",
        answer:
          "For most conversions the content is preserved exactly. Only the container/codec changes. Lossy targets (like JPG or MP3) re-encode the data, so you can pick a quality level to control the trade-off.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. Every converter runs in your browser. There is nothing to download or install, and nothing is uploaded to a server.",
      },
      {
        question: "Is there a limit on how many files I can convert?",
        answer:
          "No. There are no daily caps, no sign-up, and no watermarks: convert as many files as you like.",
      },
    ],
    match: ["-to-", "converter", "convert-"],
  },
  {
    slug: "edit-pdf",
    title: "Edit PDFs",
    h1: "Edit PDF Online: Free PDF Editing Tools",
    seoTitle: "Edit PDF Online Free, Merge, Split, Compress, Sign & Annotate",
    seoDescription:
      "Edit PDFs in your browser, merge, split, compress, rotate, sign, watermark and convert. Free PDF tools with no upload, no sign-up and no watermark.",
    keywords: ["edit pdf", "pdf editor", "pdf tools", "merge pdf", "sign pdf online"],
    icon: "FileText",
    accent: "rose",
    intro: "Do more than read a PDF, merge, split, sign, compress and reorganize it right here.",
    answer:
      "To edit a PDF online, use a focused tool for the change you need: merge combines several PDFs into one file, split extracts or separates pages, compress shrinks the file size, rotate fixes page orientation, and sign/watermark add signatures or stamps. Converters also move PDFs to and from Word, images and text. GigAI's PDF editors run entirely client-side using in-browser PDF libraries, so your documents are never uploaded, there is no page limit, and edits happen instantly and privately.",
    faq: [
      {
        question: "Can I edit a PDF for free?",
        answer:
          "Yes. Every PDF tool here is free with no sign-up, no trial and no watermark on the result.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. PDFs are processed locally in your browser, so sensitive contracts, statements and forms never leave your device.",
      },
      {
        question: "Can I merge or split PDF pages?",
        answer:
          "Yes: use the merge tool to combine multiple PDFs into one, and the split tool to extract specific pages or break a file into parts.",
      },
      {
        question: "How do I sign a PDF?",
        answer:
          "Open the PDF signing tool, place your signature or initials on the page, and download the signed file: all without uploading the document.",
      },
    ],
    match: ["pdf"],
    categories: ["pdf-tools"],
  },
  {
    slug: "create-qr-codes",
    title: "Create QR Codes",
    h1: "Create QR Codes Online: Free QR Code Generators",
    seoTitle: "Create QR Codes Online Free, URL, WiFi, vCard & Custom QR Generators",
    seoDescription:
      "Generate QR codes for URLs, WiFi, vCards, payments and more. Free, customizable QR code generators that run in your browser. No sign-up, no watermark.",
    keywords: ["create qr code", "qr code generator", "wifi qr code", "vcard qr code", "custom qr code"],
    icon: "QrCode",
    accent: "indigo",
    intro: "Turn a link, WiFi network, contact or payment into a scannable QR code in seconds.",
    answer:
      "To create a QR code, pick the generator for what you want it to do: a URL QR code opens a website, a WiFi QR code joins a network without typing the password, a vCard QR code shares contact details, and payment QR codes (PayPal.me, Bitcoin, UPI and others) start a transaction. You can style the code with colors, logos, frames and custom eye shapes. GigAI's QR generators build the code in your browser and export crisp PNG or SVG files, free, unlimited, and with no tracking pixel or expiry baked in.",
    faq: [
      {
        question: "Do these QR codes expire?",
        answer:
          "No. The codes are static. They encode your data directly, so they never expire and never route through a tracking redirect.",
      },
      {
        question: "Can I add a logo or brand colors?",
        answer:
          "Yes. The generators support custom colors, a center logo, frames and styled corners so your QR code matches your brand while staying scannable.",
      },
      {
        question: "What can a QR code contain?",
        answer:
          "URLs, plain text, WiFi credentials, vCard contacts, email, phone numbers, calendar events and payment links, among others. Pick the matching generator below.",
      },
      {
        question: "In what format can I download the QR code?",
        answer:
          "Export as PNG for everyday use or SVG for print and large-format work: both are generated locally and are free of watermarks.",
      },
    ],
    match: ["qr"],
    categories: ["qr-tools"],
  },
  {
    slug: "resize-images",
    title: "Resize Images",
    h1: "Resize Images Online, Free Image Resizer",
    seoTitle: "Resize Images Online Free, Change Image Dimensions & Scale",
    seoDescription:
      "Resize images to exact pixel dimensions or scale by percentage. Free image resizer that runs in your browser. No upload, no sign-up, no quality loss.",
    keywords: ["resize image", "image resizer", "change image size", "scale image", "resize photo"],
    icon: "Scaling",
    accent: "sky",
    intro: "Set exact pixel dimensions or scale by percentage: for social, print or the web.",
    answer:
      "To resize an image, open the image resizer, enter the target width and height in pixels (or a scale percentage), and choose whether to keep the aspect ratio locked. The tool redraws the picture at the new dimensions using high-quality resampling, so edges stay smooth and text stays legible. This is the fast way to fit a photo to a social profile, an email header, a print size or a web layout. GigAI's resizer works entirely in your browser. No upload, no size cap, and the original stays untouched.",
    faq: [
      {
        question: "How do I resize an image to exact dimensions?",
        answer:
          "Open the image resizer, type the width and height you need in pixels, and download. Lock the aspect ratio to avoid stretching, or unlock it to fit an exact box.",
      },
      {
        question: "Will resizing blur my image?",
        answer:
          "Downscaling (making an image smaller) stays sharp. Upscaling beyond the original resolution can soften detail. Use the dedicated upscaler for that instead.",
      },
      {
        question: "Can I resize by percentage instead of pixels?",
        answer:
          "Yes. Enter a scale percentage (e.g. 50%) and the tool computes the new dimensions for you while preserving the aspect ratio.",
      },
      {
        question: "Is my photo uploaded anywhere?",
        answer:
          "No. Resizing happens on your device in the browser, so your photos are never uploaded and stay private.",
      },
    ],
    match: ["resiz", "upscal"],
    categories: ["image-tools", "video-tools"],
  },
  {
    slug: "optimize-svg",
    title: "Optimize SVG",
    h1: "Optimize SVG Online: Free SVG Minifier & Cleaner",
    seoTitle: "Optimize SVG Online Free: Minify, Clean & Compress SVG Files",
    seoDescription:
      "Minify and clean SVG files to cut their size and strip editor cruft. Free SVG optimizers that run in your browser. No upload, no sign-up.",
    keywords: ["optimize svg", "svg minifier", "compress svg", "clean svg", "svgo online"],
    icon: "PenTool",
    accent: "orange",
    intro: "Strip editor bloat and shrink SVG markup so your vector art loads fast.",
    answer:
      "To optimize an SVG, run it through an SVG minifier that removes editor metadata, redundant attributes, hidden elements and excess precision, then collapses whitespace. The result is a smaller file that renders identically but downloads faster and diffs cleanly in code. Related SVG tools convert between SVG and PNG/JPG, edit paths, and generate favicons or sprites. GigAI's SVG optimizers process the markup in your browser, nothing is uploaded, and let you copy the cleaned code or download the minified file directly.",
    faq: [
      {
        question: "What does optimizing an SVG do?",
        answer:
          "It removes bloat that design tools leave behind (metadata, comments, unused defs and over-precise coordinates) and minifies the markup, cutting file size without changing how the graphic looks.",
      },
      {
        question: "Will optimization break my SVG?",
        answer:
          "No. Safe optimizations preserve the rendered result exactly. You can review the cleaned markup before downloading to confirm nothing important was stripped.",
      },
      {
        question: "Can I convert SVG to PNG or vice versa?",
        answer:
          "Yes: dedicated SVG-to-raster and raster-to-SVG converters are listed below alongside the optimizer.",
      },
      {
        question: "Is my SVG code sent to a server?",
        answer:
          "No. Everything runs in your browser, so your vector artwork and its code stay on your device.",
      },
    ],
    match: ["svg"],
    categories: ["svg-tools"],
  },
  {
    slug: "generate-meta-tags",
    title: "Generate Meta Tags",
    h1: "Generate Meta Tags Online, Free SEO Meta Tag Generator",
    seoTitle: "Generate Meta Tags Online Free, SEO, Open Graph & Twitter Card",
    seoDescription:
      "Build title, description, Open Graph and Twitter Card meta tags with live previews. Free SEO meta tag generators. No sign-up, copy-and-paste ready.",
    keywords: ["generate meta tags", "meta tag generator", "open graph tags", "twitter card generator", "seo meta tags"],
    icon: "Tags",
    accent: "emerald",
    intro: "Write title, description, Open Graph and Twitter Card tags with live search and social previews.",
    answer:
      "To generate meta tags, use an SEO meta tag generator to fill in your page title and description, then add Open Graph and Twitter Card tags so links preview correctly on Google, Facebook, X and LinkedIn. Good generators show a live snippet preview and warn when a title or description is too long. The output is a block of HTML `<meta>` tags you paste into your page `<head>`. GigAI's SEO tools also cover structured data (JSON-LD schema), sitemaps and robots.txt: all generated in-browser and ready to copy.",
    faq: [
      {
        question: "What meta tags does my page need?",
        answer:
          "At minimum a title and a meta description. Add Open Graph and Twitter Card tags so shared links show a proper title, description and image on social platforms.",
      },
      {
        question: "How long should my title and description be?",
        answer:
          "Aim for roughly 50–60 characters for the title and 150–160 for the description so they don't get truncated in search results. The generator flags when you exceed these.",
      },
      {
        question: "Can I preview how my page looks in search and social?",
        answer:
          "Yes. The generator renders a live Google snippet and social-card preview as you type so you can tune the copy before publishing.",
      },
      {
        question: "Do I just copy the tags into my site?",
        answer:
          "Exactly, copy the generated `<meta>` block and paste it inside your page's `<head>`. No account or install needed.",
      },
    ],
    match: ["meta-tag", "open-graph", "opengraph", "twitter-card", "schema", "json-ld", "og-image", "social-media-preview"],
    categories: ["seo-tools"],
  },
  {
    slug: "format-json",
    title: "Format JSON",
    h1: "Format JSON Online, Free JSON Formatter & Validator",
    seoTitle: "Format JSON Online Free, Beautify, Minify & Validate JSON",
    seoDescription:
      "Beautify, minify and validate JSON with instant error highlighting. Free JSON formatter that runs in your browser. No upload, no sign-up.",
    keywords: ["format json", "json formatter", "json beautifier", "json validator", "minify json"],
    icon: "Braces",
    accent: "violet",
    intro: "Beautify messy JSON, minify it back down, or validate and find the exact error.",
    answer:
      "To format JSON, paste it into a JSON formatter and choose beautify to add consistent indentation and line breaks, or minify to strip whitespace for the smallest possible payload. A validator parses the input and pinpoints the line and character of any syntax error: a missing comma, an unquoted key, a trailing bracket. Related developer tools convert JSON to CSV/YAML, diff two documents, and generate TypeScript types. GigAI's JSON tools run entirely in your browser, so config files, API responses and payloads never leave your machine.",
    faq: [
      {
        question: "How do I make ugly JSON readable?",
        answer:
          "Paste it into the JSON formatter and click beautify. It re-indents the structure with consistent spacing so nested objects and arrays are easy to scan.",
      },
      {
        question: "How do I find the error in invalid JSON?",
        answer:
          "The validator parses your input and highlights the exact line and column of the first syntax problem, with a message describing what it expected.",
      },
      {
        question: "Can I minify JSON to shrink an API payload?",
        answer:
          "Yes. The minify option removes all non-essential whitespace, producing the smallest valid JSON for storage or transfer.",
      },
      {
        question: "Is my data sent anywhere?",
        answer:
          "No. Parsing and formatting happen locally in your browser, so sensitive JSON never touches a server.",
      },
    ],
    match: ["json"],
    categories: ["developer-tools"],
  },
  {
    slug: "generate-passwords",
    title: "Generate Passwords",
    h1: "Generate Passwords Online: Free Secure Password Generator",
    seoTitle: "Generate Passwords Online Free: Strong, Random & Secure",
    seoDescription:
      "Create strong, random passwords and passphrases with adjustable length and character sets. Free password generator that runs entirely in your browser.",
    keywords: ["generate password", "password generator", "random password", "strong password", "passphrase generator"],
    icon: "KeyRound",
    accent: "amber",
    intro: "Create strong, random passwords and passphrases: generated locally and never stored.",
    answer:
      "To generate a strong password, use a password generator to set the length and choose which character sets to include (uppercase, lowercase, numbers and symbols) or switch to a passphrase of random memorable words. The tool uses the browser's cryptographically secure random source, so each result is unpredictable and unique. Because generation happens entirely on your device, the password is never transmitted or logged. Pair it with the strength checker and hash tools listed below to audit and store credentials safely.",
    faq: [
      {
        question: "Are these passwords safe to use?",
        answer:
          "Yes. They are produced with the browser's cryptographically secure random generator and never leave your device, so they are safe for real accounts.",
      },
      {
        question: "How long should my password be?",
        answer:
          "12–16 characters with mixed character types is a solid baseline. Longer is stronger. For memorability, a passphrase of four or more random words is both long and easy to recall.",
      },
      {
        question: "Is the password stored or sent anywhere?",
        answer:
          "No. Generation is entirely local. Nothing is transmitted, saved or logged, so only you ever see the result.",
      },
      {
        question: "What's the difference between a password and a passphrase?",
        answer:
          "A password is a random string of characters. A passphrase strings together random words. Both can be very strong: passphrases trade a little length for far easier memorability.",
      },
    ],
    match: ["password", "passphrase", "hash-", "uuid", "nanoid", "-secret", "token-generator"],
    categories: ["developer-tools"],
  },
  {
    slug: "merge-documents",
    title: "Merge Documents",
    h1: "Merge Documents Online, Free File Merging Tools",
    seoTitle: "Merge Documents Online Free, Combine PDF, Images & Files",
    seoDescription:
      "Combine multiple PDFs, images or files into a single document. Free merge tools that run in your browser. No upload, no sign-up, no watermark.",
    keywords: ["merge documents", "merge pdf", "combine files", "join pdf", "combine documents"],
    icon: "Combine",
    accent: "rose",
    intro: "Combine several files into one. Merge PDFs, stitch images and join documents.",
    answer:
      "To merge documents, open a merge tool, add the files in the order you want, and export a single combined file. PDF merge stacks pages from multiple PDFs into one document. Image tools stitch photos into a single sheet or PDF, and document mergers concatenate text and pages. You can reorder items before merging so the final sequence is exactly right. GigAI's merge tools run in your browser. Files are never uploaded, there is no page or file-count limit, and the merged output carries no watermark.",
    faq: [
      {
        question: "How do I merge several PDFs into one?",
        answer:
          "Open the PDF merge tool, drop in the files, drag them into the order you want, and download the single combined PDF.",
      },
      {
        question: "Can I control the page order when merging?",
        answer:
          "Yes. Reorder the files (and pages, where supported) before merging so the final document flows exactly as intended.",
      },
      {
        question: "Is there a limit on how many files I can merge?",
        answer:
          "No. There is no file-count or page cap, and no watermark on the merged result.",
      },
      {
        question: "Are my documents uploaded to merge them?",
        answer:
          "No. Merging happens locally in your browser, so your files stay private on your device.",
      },
    ],
    match: ["merge", "-merger", "combine"],
    categories: ["pdf-tools", "document-tools", "image-tools", "video-tools", "audio-tools"],
  },
  {
    slug: "split-documents",
    title: "Split Documents",
    h1: "Split Documents Online, Free Document Splitting Tools",
    seoTitle: "Split Documents Online Free, Extract & Separate PDF Pages",
    seoDescription:
      "Split a PDF or document into separate files or extract specific pages. Free splitting tools that run in your browser. No upload, no sign-up.",
    keywords: ["split documents", "split pdf", "extract pdf pages", "separate pdf", "divide document"],
    icon: "Split",
    accent: "cyan",
    intro: "Break a big file into parts or pull out just the pages you need.",
    answer:
      "To split a document, open a split tool and choose how to divide it: extract a specific page range, separate every page into its own file, or break the document at set intervals. PDF split is the most common. It lets you pull a single chapter, invoice or form out of a large file without retyping anything. GigAI's split tools process the file in your browser, so nothing is uploaded, there is no page limit, and each output piece downloads instantly and watermark-free.",
    faq: [
      {
        question: "How do I extract specific pages from a PDF?",
        answer:
          "Open the split tool, enter the page range you want (e.g. 3–7), and download just those pages as a new PDF.",
      },
      {
        question: "Can I split a document into single pages?",
        answer:
          "Yes. Choose the option to separate every page, and each page is exported as its own file.",
      },
      {
        question: "Does splitting reduce quality?",
        answer:
          "No. Splitting copies the original pages exactly into new files. Text, images and formatting are preserved without re-encoding.",
      },
      {
        question: "Is my file uploaded to split it?",
        answer:
          "No. The document is processed locally in your browser, so it never leaves your device.",
      },
    ],
    match: ["split", "splitter", "extract-pdf", "extract-pages", "delete-pdf-pages", "organize"],
    categories: ["pdf-tools", "document-tools", "video-tools", "audio-tools"],
  },
  {
    slug: "crop-images",
    title: "Crop Images",
    h1: "Crop Images Online, Free Image Cropper",
    seoTitle: "Crop Images Online Free: Cut, Trim & Frame Photos",
    seoDescription:
      "Crop images to any aspect ratio or exact selection. Free image cropper that runs in your browser. No upload, no sign-up, no quality loss.",
    keywords: ["crop image", "image cropper", "crop photo", "trim image", "cut image"],
    icon: "Crop",
    accent: "indigo",
    intro: "Cut an image down to the part that matters, free-form or to a fixed ratio.",
    answer:
      "To crop an image, open the image cropper, drag a selection box over the area you want to keep, and optionally lock it to a preset aspect ratio (1:1 for avatars, 16:9 for video, 4:5 for social). The tool discards everything outside the box and exports just the framed region at full quality. Cropping is the quickest way to remove distractions, fit a photo to a required shape, or focus attention on a subject. GigAI's cropper works entirely in-browser, so your photo is never uploaded and the original stays intact.",
    faq: [
      {
        question: "How do I crop an image to a square or specific ratio?",
        answer:
          "Open the cropper, pick a preset aspect ratio (or set a custom one), position the selection box, and download the cropped result.",
      },
      {
        question: "Does cropping lower the image quality?",
        answer:
          "No. Cropping keeps the selected pixels at their original resolution, you're removing area, not compressing what remains.",
      },
      {
        question: "Can I crop to exact pixel dimensions?",
        answer:
          "Yes. Enter precise width and height for the selection to crop to an exact size, or resize afterward with the image resizer.",
      },
      {
        question: "Is my photo uploaded when I crop it?",
        answer:
          "No. Cropping happens on your device in the browser, so the image stays private.",
      },
    ],
    match: ["crop"],
    categories: ["image-tools", "video-tools"],
  },
  {
    slug: "rotate-images",
    title: "Rotate Images",
    h1: "Rotate Images Online, Free Image Rotator & Flipper",
    seoTitle: "Rotate Images Online Free, Turn & Flip Photos",
    seoDescription:
      "Rotate images by 90°, straighten a tilt, or flip them horizontally and vertically. Free image rotator that runs in your browser. No upload, no sign-up.",
    keywords: ["rotate image", "image rotator", "flip image", "turn image", "straighten photo"],
    icon: "RotateCw",
    accent: "cyan",
    intro: "Fix a sideways photo, straighten a tilt, or mirror an image in one click.",
    answer:
      "To rotate an image, open the image rotator and turn it 90° left or right, flip it 180°, or nudge it by a custom angle to straighten a crooked horizon. You can also mirror the picture horizontally or vertically. The tool re-renders the photo at the new orientation and exports it losslessly where the format allows. This is the fastest fix for photos that came off a phone or scanner in the wrong direction. GigAI's rotator runs in your browser. No upload, no watermark, and the original is left untouched.",
    faq: [
      {
        question: "How do I rotate a sideways photo?",
        answer:
          "Open the rotator, click rotate left or right to turn it 90° at a time until it's upright, and download the corrected image.",
      },
      {
        question: "Can I flip or mirror an image?",
        answer:
          "Yes. The tool offers horizontal and vertical flips to mirror the image, in addition to rotation.",
      },
      {
        question: "Can I straighten a slightly tilted photo?",
        answer:
          "Yes. Set a custom rotation angle to level a crooked horizon, then crop off any empty corners if needed.",
      },
      {
        question: "Does rotating reduce image quality?",
        answer:
          "90° and 180° rotations are lossless. Arbitrary angles re-sample the image, but the tool uses high-quality rendering to keep it sharp.",
      },
    ],
    match: ["rotate"],
    categories: ["image-tools", "pdf-tools", "video-tools"],
  },
];

/** All task-hub slugs (for generateStaticParams / sitemap). */
export const TASK_HUB_SLUGS = TASK_HUBS.map((t) => t.slug);

/** Look up a task hub by slug. */
export function getTaskBySlug(slug: string): TaskHub | undefined {
  return TASK_HUBS.find((t) => t.slug === slug);
}

/** All task hubs, in catalogue order. */
export function getTaskHubs(): TaskHub[] {
  return TASK_HUBS;
}

/**
 * Resolve every LIVE tool that matches a task hub from the registry.
 *
 * A tool matches when its slug contains any of the hub's `match` substrings AND
 * (when the hub sets `categories`) its category is in that allow-list. Slug-only
 * matching keeps results precise because tool slugs are already action-named
 * (e.g. "compress-pdf", "image-resizer", "merge-pdf").
 *
 * SERVER-ONLY: imports the registry, call at build time only.
 */
export function getTaskTools(task: TaskHub): Tool[] {
  const needles = task.match.map((m) => m.toLowerCase());
  const cats = task.categories ? new Set(task.categories) : null;
  return getAllTools()
    .filter(isLiveTool)
    .filter((tool) => (cats ? cats.has(tool.category) : true))
    .filter((tool) => {
      const slug = tool.slug.toLowerCase();
      return needles.some((n) => slug.includes(n));
    });
}
