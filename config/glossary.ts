/**
 * Glossary, the DEFINITIONAL layer at `/glossary/<slug>`.
 *
 * Tool pages are transactional and /solve pages are problem-first. This layer is
 * purely INFORMATIONAL: it answers "What is a PDF?", "What is WebP?", "What is
 * OCR?": the definitional / "what is X" / voice / AI-Overview keyword class
 * nothing else on the platform targets. Every term links out to the tools and
 * problems it relates to, so it feeds the internal-link web rather than sitting
 * apart from it.
 *
 * PURE DATA. Imports nothing server-only, so it is safe from client code.
 * `relatedTools` slugs are resolved to Tool objects by the SERVER page.
 *
 * GLOBAL AUDIENCE: definitions stay worldwide-neutral (no region-specific
 * currency/law/format assumptions).
 *
 * To add a term: append one object. The `/glossary/[slug]` route, the `/glossary`
 * index and the sitemap pick it up automatically.
 */
import type { FaqItem, IconName } from "@/types";

/** Display groups for the glossary index, in order. */
export const GLOSSARY_GROUPS = [
  "Documents & data",
  "Images & graphics",
  "Audio & video",
  "Web & SEO",
  "AI & search",
] as const;

export type GlossaryGroup = (typeof GLOSSARY_GROUPS)[number];

export interface GlossaryTerm {
  /** URL slug, `/glossary/<slug>`. */
  slug: string;
  /** The term as displayed, e.g. "WebP". */
  term: string;
  /** Short label for cards/chips (defaults to `term`). */
  label?: string;
  /** Other names people search for (helps search matching). */
  aliases?: string[];
  group: GlossaryGroup;
  icon: IconName;
  /**
   * Answer-first definition (~35–55 words); written to win the "what is X"
   * featured snippet / AI Overview. Rendered inside `#answer`, marked speakable.
   */
  definition: string;
  /** 2–4 explainer points: why it matters / when you'd use it. */
  points: string[];
  /** Tools that work with this term (live slugs). */
  relatedTools: string[];
  /** Problem pages (/solve slugs) this term relates to. */
  relatedProblems: string[];
  /** Other glossary slugs to cross-link. */
  relatedTerms: string[];
  /** SEO keywords. */
  keywords: string[];
  faq?: FaqItem[];
}

export const GLOSSARY: GlossaryTerm[] = [
  /* ── Documents & data ────────────────────────────────────────────────────── */
  {
    slug: "pdf",
    term: "PDF",
    aliases: ["portable document format", ".pdf"],
    group: "Documents & data",
    icon: "FileText",
    definition:
      "A PDF (Portable Document Format) is a file type that preserves a document's exact layout (fonts, images and formatting) so it looks identical on any device or printer. It's the standard for sharing finished documents like reports, contracts, invoices and resumes.",
    points: [
      "PDFs are fixed-layout: unlike a Word file, they won't reflow or shift between apps, which is why they're used for anything final.",
      "A PDF can hold real, selectable text (exported from a document) or just an image of text (a scan): the latter needs OCR to become searchable.",
      "You can compress, merge, split, sign, protect and convert PDFs without special software. It all runs in a modern browser.",
    ],
    relatedTools: ["compress-pdf", "pdf-editor", "merge-pdf", "pdf-to-word"],
    relatedProblems: ["pdf-too-large", "edit-text-in-a-pdf", "convert-pdf-to-word"],
    relatedTerms: ["ocr", "json"],
    keywords: ["what is a pdf", "pdf meaning", "pdf format", "portable document format"],
    faq: [
      { question: "What does PDF stand for?", answer: "Portable Document Format. It was created so a document looks the same everywhere, regardless of the device, app or operating system used to open it." },
      { question: "Can you edit a PDF?", answer: "Yes: a browser PDF editor lets you change text, fill forms, sign and annotate. For heavy rewrites, convert the PDF to Word, edit, then convert back." },
    ],
  },
  {
    slug: "csv",
    term: "CSV",
    aliases: ["comma-separated values", ".csv"],
    group: "Documents & data",
    icon: "Table",
    definition:
      "CSV (Comma-Separated Values) is a plain-text format for tabular data: each line is a row and commas separate the columns. It's the simplest, most universal way to move spreadsheet data between programs, databases and code.",
    points: [
      "Because it's plain text, almost every spreadsheet, database and programming language can read and write CSV.",
      "The 'comma' isn't guaranteed: some files use semicolons or tabs, which is the most common cause of a mangled import.",
      "CSV holds only values, not formatting or formulas. Convert it to JSON for code, or open it in a viewer when it's too big for a spreadsheet.",
    ],
    relatedTools: ["csv-viewer", "csv-to-json", "csv-editor", "excel-to-csv"],
    relatedProblems: ["open-a-large-csv", "convert-csv-to-json"],
    relatedTerms: ["json"],
    keywords: ["what is csv", "csv file", "comma separated values", "csv format"],
    faq: [
      { question: "How do I open a CSV file?", answer: "Any spreadsheet app opens CSV, but for large or messy files a browser CSV viewer is faster. It shows the data as a searchable, sortable table with no row limits." },
      { question: "What's the difference between CSV and Excel?", answer: "CSV is plain text holding only values. An Excel file (.xlsx) also stores formatting, multiple sheets and formulas. CSV is more portable. Excel is richer." },
    ],
  },
  {
    slug: "json",
    term: "JSON",
    aliases: ["javascript object notation", ".json"],
    group: "Documents & data",
    icon: "Braces",
    definition:
      "JSON (JavaScript Object Notation) is a lightweight, text-based format for structured data, built from key–value pairs and lists. It's the standard way apps and APIs exchange data because it's easy for both humans and machines to read.",
    points: [
      "JSON uses double quotes around keys and string values, and allows no trailing commas or comments, the top causes of 'invalid JSON'.",
      "It maps naturally to objects and arrays in almost every programming language, which is why APIs return JSON.",
      "Minified JSON is one long line. A formatter re-indents it so you can read and debug the structure.",
    ],
    relatedTools: ["json-formatter", "json-validator", "csv-to-json", "json-tree-viewer"],
    relatedProblems: ["fix-invalid-json", "convert-csv-to-json", "format-messy-code"],
    relatedTerms: ["csv", "base64"],
    keywords: ["what is json", "json meaning", "json format", "javascript object notation"],
    faq: [
      { question: "What is JSON used for?", answer: "Mostly for exchanging data between a server and an app (APIs), and for config files. Its simple structure works across virtually every programming language." },
      { question: "Why is my JSON invalid?", answer: "Usually a trailing comma, single quotes instead of double, an unquoted key, or a comment, all illegal in JSON. A validator points to the exact spot." },
    ],
  },
  {
    slug: "ocr",
    term: "OCR",
    aliases: ["optical character recognition", "text recognition"],
    group: "Documents & data",
    icon: "ScanText",
    definition:
      "OCR (Optical Character Recognition) is technology that reads the text inside an image or scanned document and turns it into real, selectable, searchable text. It's what makes a photo of a page copyable instead of just a picture.",
    points: [
      "A scanned PDF is an image. You can't select or search its words until OCR recognises them.",
      "OCR quality depends on the source: sharp, straight, high-contrast scans convert far better than blurry or skewed photos.",
      "After OCR, a scanned document becomes searchable and its text can be extracted, copied or converted to Word.",
    ],
    relatedTools: ["ocr-pdf", "pdf-to-word", "pdf-to-excel", "extract-audio"],
    relatedProblems: ["convert-pdf-to-word", "extract-table-from-pdf"],
    relatedTerms: ["pdf"],
    keywords: ["what is ocr", "optical character recognition", "ocr meaning", "scan to text"],
    faq: [
      { question: "What does OCR do?", answer: "It converts the text in an image or scan into machine-readable text, so a scanned document becomes searchable and its words can be copied, edited or exported." },
      { question: "When do I need OCR?", answer: "Whenever you have a scan or photo of text you want to search, copy or convert: for example turning a scanned PDF into an editable Word file." },
    ],
  },
  {
    slug: "base64",
    term: "Base64",
    aliases: ["base 64 encoding", "base64 encode"],
    group: "Documents & data",
    icon: "Binary",
    definition:
      "Base64 is a way of encoding binary data (like an image or file) into plain ASCII text using 64 safe characters. It lets you embed or transmit binary content through systems that only handle text, such as email, JSON or data URIs.",
    points: [
      "Base64 is encoding, not encryption: it's fully reversible and provides no security, only text-safe transport.",
      "Encoding inflates the size by roughly 33%, so it's used for small assets (icons, tokens), not large files.",
      "A common use is inlining a small image into HTML/CSS as a data URI so it doesn't need a separate request.",
    ],
    relatedTools: ["base64-encoder", "base64-decoder", "hash-generator", "url-encoder"],
    relatedProblems: [],
    relatedTerms: ["json", "svg"],
    keywords: ["what is base64", "base64 encoding", "base64 meaning", "base64 encode decode"],
    faq: [
      { question: "Is Base64 encryption?", answer: "No. Base64 is reversible encoding with no secret key. Anyone can decode it. It makes binary data text-safe. It does not protect or hide it." },
      { question: "Why does Base64 make files bigger?", answer: "It represents every 3 bytes as 4 text characters, so encoded data is about 33% larger than the original. That's why it suits small assets, not big files." },
    ],
  },
  {
    slug: "regex",
    term: "Regex",
    aliases: ["regular expression", "regexp", "pattern matching"],
    group: "Documents & data",
    icon: "Regex",
    definition:
      "A regex (regular expression) is a compact pattern that describes and matches text, for example, all email addresses or every date in a document. Developers use it to search, validate and replace text with precision.",
    points: [
      "Regex is expressive but easy to get subtly wrong, so testing it against real sample text is essential.",
      "Small syntax differences exist between languages (JavaScript, Python, PCRE), a pattern isn't always portable.",
      "Common uses: validating input (emails, phone numbers), find-and-replace, and extracting structured bits from messy text.",
    ],
    relatedTools: ["regex-tester", "diff-checker", "json-validator", "url-parser"],
    relatedProblems: [],
    relatedTerms: ["json"],
    keywords: ["what is regex", "regular expression", "regex meaning", "regexp"],
    faq: [
      { question: "What is a regular expression used for?", answer: "Searching, validating and transforming text by pattern. Like checking an email is well-formed, or extracting every number from a block of text." },
      { question: "Why test a regex?", answer: "Patterns are terse and easy to get wrong. Testing against real examples confirms it matches what you want and skips what you don't before you ship it." },
    ],
  },

  /* ── Images & graphics ───────────────────────────────────────────────────── */
  {
    slug: "png",
    term: "PNG",
    aliases: ["portable network graphics", ".png"],
    group: "Images & graphics",
    icon: "Image",
    definition:
      "PNG (Portable Network Graphics) is a lossless image format that supports transparency. Because it never degrades on save and keeps sharp edges, it's the go-to format for logos, icons, screenshots and any graphic with text or a transparent background.",
    points: [
      "PNG is lossless, it preserves every pixel, which makes it crisp for graphics but larger than JPG for photos.",
      "It supports an alpha channel (transparency), so a cut-out subject can sit on any background.",
      "For photographs, JPG or WebP are usually far smaller. Reserve PNG for graphics, transparency and screenshots.",
    ],
    relatedTools: ["png-to-jpg", "image-compressor", "webp-converter"],
    relatedProblems: ["image-too-large"],
    relatedTerms: ["jpg", "webp", "transparency"],
    keywords: ["what is png", "png format", "png meaning", "png vs jpg"],
    faq: [
      { question: "When should I use PNG?", answer: "For logos, icons, screenshots and any image needing transparency or crisp text. For photos, JPG or WebP give a much smaller file at similar quality." },
      { question: "Does PNG support transparency?", answer: "Yes. PNG has an alpha channel, so it can have a transparent background. JPG cannot, which is why cut-outs are saved as PNG." },
    ],
  },
  {
    slug: "jpg",
    term: "JPG (JPEG)",
    label: "JPG / JPEG",
    aliases: ["jpeg", ".jpg", ".jpeg"],
    group: "Images & graphics",
    icon: "Image",
    definition:
      "JPG (also written JPEG) is the most common photo format. It uses lossy compression to make photographs small by discarding detail your eye barely notices, which is why it's ideal for pictures but poor for sharp graphics, text or transparency.",
    points: [
      "JPG is lossy: each save throws away a little more detail, so avoid repeatedly re-saving the same file.",
      "It has no transparency support: a JPG always has a solid background.",
      "For photos it's tiny and universal. For logos, screenshots or line art, PNG or SVG look cleaner.",
    ],
    relatedTools: ["image-compressor", "png-to-jpg", "jpg-to-png", "webp-converter"],
    relatedProblems: ["image-too-large", "convert-webp-to-jpg"],
    relatedTerms: ["png", "webp", "image-compression"],
    keywords: ["what is jpg", "jpeg format", "jpg vs jpeg", "jpg meaning"],
    faq: [
      { question: "Are JPG and JPEG the same?", answer: "Yes, identical format, two spellings. The '.jpg' extension is a leftover from old systems that limited extensions to three letters; '.jpeg' is the same thing." },
      { question: "Why does my JPG look worse each time I save it?", answer: "JPG is lossy, so every re-save compresses again and loses more detail. Keep an original and export a fresh JPG rather than editing the same one repeatedly." },
    ],
  },
  {
    slug: "webp",
    term: "WebP",
    aliases: ["webp image", ".webp"],
    group: "Images & graphics",
    icon: "Image",
    definition:
      "WebP is a modern image format from Google that makes photos and graphics significantly smaller than JPG or PNG at similar quality. It's designed for the web to speed up page loads, and supports both lossy and lossless compression plus transparency.",
    points: [
      "WebP typically saves 25–35% over JPG/PNG, so it's excellent for website performance.",
      "Support is now broad in browsers, but some older apps and offline editors still can't open it: hence the frequent need to convert it to JPG.",
      "It handles transparency (like PNG) and photos (like JPG), making it a versatile single choice for web images.",
    ],
    relatedTools: ["webp-converter", "image-compressor", "png-to-jpg", "image-resizer"],
    relatedProblems: ["convert-webp-to-jpg", "image-too-large"],
    relatedTerms: ["jpg", "png", "image-compression"],
    keywords: ["what is webp", "webp format", "webp vs jpg", "webp meaning"],
    faq: [
      { question: "Why won't my WebP open?", answer: "Some older or offline apps don't support WebP yet. Convert it to JPG or PNG and it opens in virtually any program." },
      { question: "Is WebP better than JPG?", answer: "For the web, usually: it's smaller at similar quality and supports transparency. For maximum compatibility with old software, JPG/PNG are safer." },
    ],
  },
  {
    slug: "svg",
    term: "SVG",
    aliases: ["scalable vector graphics", ".svg"],
    group: "Images & graphics",
    icon: "Spline",
    definition:
      "SVG (Scalable Vector Graphics) is an image format that describes graphics as mathematical shapes and paths rather than pixels. Because it's vector-based, an SVG stays perfectly sharp at any size (from a favicon to a billboard) and is usually a small, text-based file.",
    points: [
      "SVGs scale infinitely without blurring, which makes them ideal for logos, icons and illustrations.",
      "They're actually text (XML), so they can be edited in code, styled with CSS and animated, and optimized to strip editor bloat.",
      "SVG suits flat graphics, not photographs. A detailed photo traced to SVG becomes huge and messy.",
    ],
    relatedTools: ["svg-optimizer", "png-to-svg", "svg-editor", "svg-to-png"],
    relatedProblems: ["optimize-svg", "vectorize-an-image", "make-a-favicon"],
    relatedTerms: ["vector-vs-raster", "png"],
    keywords: ["what is svg", "scalable vector graphics", "svg format", "svg meaning"],
    faq: [
      { question: "What is an SVG used for?", answer: "Logos, icons and illustrations on the web, because it stays razor-sharp at any size and is usually a tiny file you can style and animate." },
      { question: "Can I convert a photo to SVG?", answer: "You can trace it, but only flat, high-contrast art (logos, icons) converts cleanly. Photos produce huge, messy vectors and should stay as JPG/PNG." },
    ],
  },
  {
    slug: "gif",
    term: "GIF",
    aliases: ["graphics interchange format", ".gif", "animated gif"],
    group: "Images & graphics",
    icon: "Film",
    definition:
      "A GIF (Graphics Interchange Format) is an image format best known for short, silent, looping animations. It's limited to 256 colors, which keeps simple loops small but makes it a poor choice for detailed video or photographs.",
    points: [
      "GIFs loop automatically and play everywhere, which is why they're popular for reactions and quick demos.",
      "They're inefficient for anything long or detailed, a few seconds of video as a GIF can be surprisingly large.",
      "For longer or higher-quality motion, a short muted MP4/WebM is smaller and smoother than a GIF.",
    ],
    relatedTools: ["video-to-gif", "gif-to-video", "video-trimmer", "video-compressor"],
    relatedProblems: ["video-to-gif"],
    relatedTerms: ["mp4"],
    keywords: ["what is a gif", "gif format", "gif meaning", "animated gif"],
    faq: [
      { question: "Why is my GIF so large?", answer: "GIF is inefficient for motion: file size grows fast with length, size and frame rate. Keep GIFs short and small, or use a muted MP4 for longer clips." },
      { question: "GIF or video for a short clip?", answer: "A GIF suits a tiny, simple loop. For anything longer or detailed, a muted MP4/WebM is smaller and looks better." },
    ],
  },
  {
    slug: "favicon",
    term: "Favicon",
    aliases: ["website icon", "site icon", "tab icon"],
    group: "Images & graphics",
    icon: "AppWindow",
    definition:
      "A favicon is the small square icon that represents a website: shown in the browser tab, bookmarks and history. It's typically a simple logo or letter exported at tiny sizes (16, 32 and 48 pixels) so it stays legible when shrunk.",
    points: [
      "Favicons are tiny, so a simple, high-contrast mark reads far better than a detailed logo.",
      "Modern browsers accept PNG (and SVG) favicons: the old.ico format is no longer required.",
      "You add it to a page by referencing the file in the HTML head with a link rel=\"icon\" tag.",
    ],
    relatedTools: ["image-resizer", "crop-image", "svg-icon-generator", "png-to-jpg"],
    relatedProblems: ["make-a-favicon"],
    relatedTerms: ["png", "svg"],
    keywords: ["what is a favicon", "favicon meaning", "favicon size", "website icon"],
    faq: [
      { question: "What size should a favicon be?", answer: "The core sizes are 16×16, 32×32 and 48×48 pixels. Providing at least a 32×32 PNG covers most browsers, which scale it as needed." },
      { question: "Can a favicon be a PNG?", answer: "Yes. Modern browsers support PNG and SVG favicons, so you no longer strictly need the old .ico format." },
    ],
  },
  {
    slug: "aspect-ratio",
    term: "Aspect ratio",
    aliases: ["image ratio", "16:9", "1:1"],
    group: "Images & graphics",
    icon: "RectangleHorizontal",
    definition:
      "Aspect ratio is the proportional relationship between an image or video's width and height, written like 16:9 or 1:1. It defines the shape of the frame, and matching the required ratio is what stops a platform from awkwardly cropping or stretching your content.",
    points: [
      "Common ratios: 1:1 (square posts), 4:5 (portrait posts), 9:16 (stories/reels), 16:9 (video and thumbnails).",
      "Cropping to the right ratio yourself keeps control of the framing instead of letting a platform chop the edges.",
      "Resizing changes the pixel dimensions. Cropping changes the ratio. You often do both to hit a spec.",
    ],
    relatedTools: ["crop-image", "image-resizer", "video-crop", "video-resizer"],
    relatedProblems: ["resize-for-instagram", "youtube-thumbnail", "passport-size-photo"],
    relatedTerms: ["image-resolution"],
    keywords: ["what is aspect ratio", "aspect ratio meaning", "16:9 ratio", "image ratio"],
    faq: [
      { question: "What is a 16:9 aspect ratio?", answer: "A widescreen shape 16 units wide for every 9 tall: the standard for video and YouTube thumbnails (e.g. 1280×720). It fills modern screens without black bars." },
      { question: "How do I stop a platform cropping my image?", answer: "Crop it to the exact aspect ratio the platform uses before uploading, so there's nothing left for it to trim." },
    ],
  },
  {
    slug: "image-resolution",
    term: "Resolution (DPI/pixels)",
    label: "Image resolution",
    aliases: ["dpi", "ppi", "pixels", "megapixels"],
    group: "Images & graphics",
    icon: "Scaling",
    definition:
      "An image's resolution is how many pixels it contains, its width × height (e.g. 1920×1080). More pixels mean more detail and a larger file. DPI/PPI describes how densely those pixels print or display. It only matters relative to physical output size.",
    points: [
      "On screen, what matters is pixel dimensions. DPI is only meaningful for print at a given physical size.",
      "You can shrink resolution freely, but enlarging can't add detail that wasn't captured. It just stretches pixels (an AI upscaler helps).",
      "Higher resolution looks sharper but inflates file size. Match the resolution to where the image will actually be shown.",
    ],
    relatedTools: ["image-resizer", "image-upscaler", "image-compressor", "crop-image"],
    relatedProblems: ["enlarge-a-blurry-photo", "image-too-large", "passport-size-photo"],
    relatedTerms: ["aspect-ratio", "image-compression"],
    keywords: ["what is image resolution", "dpi meaning", "ppi vs dpi", "pixels resolution"],
    faq: [
      { question: "Does higher DPI mean a better image on screen?", answer: "No, screens care about pixel dimensions, not DPI. DPI only affects how large and sharp an image prints at a given physical size." },
      { question: "Can I increase a photo's resolution?", answer: "You can enlarge it, but you can't recover detail that was never captured. A plain resize stretches pixels. An AI upscaler reconstructs detail for a cleaner result." },
    ],
  },
  {
    slug: "vector-vs-raster",
    term: "Vector vs raster",
    aliases: ["vector graphics", "raster image", "bitmap"],
    group: "Images & graphics",
    icon: "PenTool",
    definition:
      "Raster images (JPG, PNG, GIF) are grids of pixels. They have a fixed resolution and blur when enlarged. Vector images (SVG) are defined by mathematical shapes, so they scale to any size without losing sharpness. The right choice depends on whether you need photos or scalable graphics.",
    points: [
      "Use raster for photographs, they're made of continuous tones no vector can capture efficiently.",
      "Use vector for logos, icons and illustrations you need at many sizes, from favicon to banner.",
      "You can trace simple raster art into vector (SVG), but photos don't vectorise cleanly.",
    ],
    relatedTools: ["png-to-svg", "svg-to-png", "svg-optimizer", "image-upscaler"],
    relatedProblems: ["vectorize-an-image", "make-a-favicon", "enlarge-a-blurry-photo"],
    relatedTerms: ["svg", "png", "image-resolution"],
    keywords: ["vector vs raster", "raster image", "vector graphics", "bitmap vs vector"],
    faq: [
      { question: "What's the difference between vector and raster?", answer: "Raster is pixels with a fixed resolution (photos). Vector is math-defined shapes that scale infinitely (logos, icons). Vectors stay sharp at any size. Rasters blur when enlarged." },
      { question: "Which should a logo be?", answer: "Vector (SVG), so it stays crisp everywhere from a tiny favicon to a large banner, and remains a small, editable file." },
    ],
  },
  {
    slug: "image-compression",
    term: "Image compression",
    aliases: ["lossy", "lossless", "compress image"],
    group: "Images & graphics",
    icon: "Minimize2",
    definition:
      "Image compression reduces an image's file size. Lossy compression (JPG, WebP) discards detail your eye barely notices for big savings. Lossless compression (PNG) shrinks the file while keeping every pixel. The right kind depends on whether small size or perfect fidelity matters more.",
    points: [
      "Lossy is best for photos, where a smaller file with minor, invisible detail loss is a great trade.",
      "Lossless is best for graphics, screenshots and anything with crisp edges or text you can't afford to soften.",
      "Over-compressing shows visible artefacts (blocky patches, halos), preview and ease off if you see them.",
    ],
    relatedTools: ["image-compressor", "webp-converter", "png-to-jpg", "image-resizer"],
    relatedProblems: ["image-too-large", "email-attachment-too-large"],
    relatedTerms: ["jpg", "png", "webp"],
    keywords: ["what is image compression", "lossy vs lossless", "compress image meaning"],
    faq: [
      { question: "What's the difference between lossy and lossless?", answer: "Lossy compression permanently discards some detail for a much smaller file (JPG, WebP). Lossless keeps every pixel while still shrinking the file (PNG). Photos suit lossy. Graphics suit lossless." },
      { question: "Does compressing always reduce quality?", answer: "Lossless doesn't. Lossy does slightly, but at moderate settings the loss is invisible. Only extreme compression produces obvious artefacts." },
    ],
  },
  {
    slug: "transparency",
    term: "Transparency (alpha)",
    label: "Transparency",
    aliases: ["alpha channel", "transparent background", "transparent png"],
    group: "Images & graphics",
    icon: "Blend",
    definition:
      "Transparency (the alpha channel) is the part of an image that has no color, letting whatever is behind it show through. A transparent PNG of a cut-out subject can be placed on any background, a color, a photo, or a web page.",
    points: [
      "PNG, WebP and SVG support transparency. JPG does not. Save a cut-out as PNG to keep it.",
      "Removing a background produces a transparent image so the subject can sit on any new backdrop.",
      "Saving a transparent image as JPG fills the empty area with a solid color, losing the cut-out.",
    ],
    relatedTools: ["png-to-jpg", "webp-converter", "image-resizer"],
    relatedProblems: ["passport-size-photo"],
    relatedTerms: ["png", "webp"],
    keywords: ["what is transparency image", "alpha channel", "transparent png", "transparent background"],
    faq: [
      { question: "Which formats support transparency?", answer: "PNG, WebP and SVG. JPG does not. It always has a solid background, so transparent cut-outs must be saved as PNG (or WebP)." },
      { question: "How do I get a transparent background?", answer: "Remove the background from the image, which cuts out the subject and leaves transparency behind it, then export as a PNG to preserve it." },
    ],
  },

  {
    slug: "heic",
    term: "HEIC",
    aliases: ["heif", ".heic", "high efficiency image container"],
    group: "Images & graphics",
    icon: "Smartphone",
    definition:
      "HEIC (High-Efficiency Image Container) is the format Apple devices use to save photos. It stores images at high quality in roughly half the size of a JPG, but it isn't supported everywhere, which is why non-Apple devices often can't open.heic files.",
    points: [
      "HEIC saves storage on your phone by compressing more efficiently than JPG at the same quality.",
      "Support is still patchy: many Windows PCs, older apps and upload forms can't open HEIC, so you convert to JPG to share.",
      "You don't need to disable HEIC on your device: just convert the specific photos you need in a universal format.",
    ],
    relatedTools: ["heic-to-jpg", "image-compressor", "image-resizer", "png-to-jpg"],
    relatedProblems: ["convert-heic-to-jpg", "image-too-large"],
    relatedTerms: ["jpg", "png", "webp"],
    keywords: ["what is heic", "heic format", "heic meaning", "heic vs jpg"],
    faq: [
      { question: "What is a HEIC file?", answer: "The high-efficiency photo format Apple devices use by default. It keeps quality high at about half the size of JPG, but isn't supported everywhere." },
      { question: "How do I open a HEIC file?", answer: "On non-Apple devices, convert it to JPG, a HEIC to JPG tool decodes it in your browser and gives you a file that opens anywhere." },
    ],
  },

  /* ── Audio & video ───────────────────────────────────────────────────────── */
  {
    slug: "mp4",
    term: "MP4",
    aliases: ["mpeg-4", ".mp4", "h.264"],
    group: "Audio & video",
    icon: "Video",
    definition:
      "MP4 is the most widely supported video format, a container that holds video and audio together. Because virtually every device, editor, browser and platform plays MP4, it's the safe default for sharing, uploading and playing video anywhere.",
    points: [
      "If a video won't play or upload, converting it to MP4 usually fixes it, because compatibility is MP4's strength.",
      "MP4 is a container. The video inside is typically H.264, which balances quality and file size well.",
      "iPhones often record MOV (sometimes HEVC), which some devices can't play: converting to MP4 solves that.",
    ],
    relatedTools: ["video-converter", "video-compressor", "mov-to-mp4", "webm-to-mp4"],
    relatedProblems: ["convert-mov-to-mp4", "compress-a-video"],
    relatedTerms: ["gif", "bitrate", "mp3"],
    keywords: ["what is mp4", "mp4 format", "mp4 meaning", "mov vs mp4"],
    faq: [
      { question: "Why is MP4 so common?", answer: "It plays on virtually every device, browser, editor and platform, and balances quality against file size well, which makes it the safe default for video." },
      { question: "My video won't play. Will MP4 fix it?", answer: "Usually. Converting a MOV, AVI, MKV or WebM that won't open into MP4 makes it play almost everywhere, because MP4 has the broadest support." },
    ],
  },
  {
    slug: "mp3",
    term: "MP3",
    aliases: ["mpeg audio", ".mp3"],
    group: "Audio & video",
    icon: "FileAudio2",
    definition:
      "MP3 is the most universal audio format. It uses lossy compression to shrink sound files to a fraction of their original size with little audible difference, which is why it plays on virtually every device, player and phone.",
    points: [
      "MP3 is lossy: great for portability, but keep a WAV/FLAC original if you need perfect quality for editing or archiving.",
      "Bitrate controls the quality/size trade-off: 256–320 kbps for music, ~128 kbps is fine for speech.",
      "When an audio file won't play or upload, converting it to MP3 is the most reliable fix.",
    ],
    relatedTools: ["mp3-converter", "audio-to-mp3", "extract-audio", "audio-compressor"],
    relatedProblems: ["convert-audio-to-mp3", "extract-audio-from-video", "make-a-ringtone"],
    relatedTerms: ["bitrate", "mp4"],
    keywords: ["what is mp3", "mp3 format", "mp3 meaning", "mp3 bitrate"],
    faq: [
      { question: "Is MP3 good quality?", answer: "At higher bitrates (256–320 kbps) most people can't distinguish it from the original. It's lossy, so for editing or archiving keep a lossless master too." },
      { question: "How do I convert audio to MP3?", answer: "Use an audio converter: drop in a WAV, M4A or OGG file, choose a bitrate, and export an MP3 that plays virtually everywhere." },
    ],
  },
  {
    slug: "bitrate",
    term: "Bitrate",
    aliases: ["kbps", "bit rate", "audio quality"],
    group: "Audio & video",
    icon: "AudioLines",
    definition:
      "Bitrate is how much data is used per second of audio or video, measured in kbps or Mbps. A higher bitrate means more detail and a larger file. A lower bitrate means a smaller file with more compression. It's the main dial for the quality-versus-size trade-off.",
    points: [
      "For audio: ~128 kbps is fine for speech, 256–320 kbps is good for music.",
      "For video, lowering the bitrate (or the resolution) is the main way to shrink a file for email or upload.",
      "Beyond a point, more bitrate adds size without audible or visible improvement. Match it to the content.",
    ],
    relatedTools: ["video-compressor", "mp3-converter", "audio-compressor", "video-resizer"],
    relatedProblems: ["compress-a-video", "convert-audio-to-mp3", "email-attachment-too-large"],
    relatedTerms: ["mp3", "mp4"],
    keywords: ["what is bitrate", "bitrate meaning", "kbps", "audio bitrate"],
    faq: [
      { question: "What bitrate is good for music?", answer: "256–320 kbps MP3 sounds excellent to most listeners. Speech and podcasts are fine at around 128 kbps, which keeps files smaller." },
      { question: "How does bitrate affect file size?", answer: "Directly. Bitrate is data per second, so halving it roughly halves the file. Lowering bitrate (or resolution) is the main way to compress video and audio." },
    ],
  },

  /* ── Web & SEO ───────────────────────────────────────────────────────────── */
  {
    slug: "qr-code",
    term: "QR code",
    aliases: ["quick response code", "qr"],
    group: "Web & SEO",
    icon: "QrCode",
    definition:
      "A QR code is a square barcode that a phone camera can scan to instantly open a link, connect to WiFi, save a contact or show text. It bridges the physical and digital worlds: print one on a poster, menu or card and people reach your content in a tap.",
    points: [
      "A standard (static) QR code encodes the data directly, so it never expires and works as long as the destination exists.",
      "Keep good contrast and a clear margin, and don't over-decorate, phones need to read the pattern reliably.",
      "You can read a QR code from a saved image or screenshot too, not just with a live camera.",
    ],
    relatedTools: ["qr-code-generator", "wifi-qr-code-generator", "qr-code-scanner", "qr-code-with-logo"],
    relatedProblems: ["qr-code-for-wifi", "scan-a-qr-code", "restaurant-menu-qr-code"],
    relatedTerms: ["favicon"],
    keywords: ["what is a qr code", "qr code meaning", "quick response code", "how qr codes work"],
    faq: [
      { question: "Do QR codes expire?", answer: "A standard (static) QR code doesn't. It encodes the data directly, so it works as long as the destination (e.g. the linked page) stays online." },
      { question: "Can I scan a QR code from an image?", answer: "Yes, upload the screenshot or photo to an online QR reader and it decodes the link or text without needing a live camera." },
    ],
  },
  {
    slug: "open-graph",
    term: "Open Graph",
    aliases: ["og tags", "og:image", "social preview"],
    group: "Web & SEO",
    icon: "Share2",
    definition:
      "Open Graph is a set of meta tags (og:title, og:description, og:image) that control how a link looks when shared on social media and messaging apps. They produce the title, description and preview image in the share card, without them, a shared link often appears blank.",
    points: [
      "The og:image is what makes a shared link show a picture. The recommended size is 1200×630 pixels.",
      "Open Graph is separate from your SEO title tag. You can tune the social preview independently of search.",
      "Missing Open Graph tags are the usual reason a link shares with no image or the wrong text.",
    ],
    relatedTools: ["open-graph-generator", "meta-tag-generator", "open-graph-preview", "meta-tag-analyzer"],
    relatedProblems: ["add-meta-tags", "audit-page-seo"],
    relatedTerms: ["meta-description", "structured-data"],
    keywords: ["what is open graph", "og tags", "og:image", "social media preview tags"],
    faq: [
      { question: "Why does my shared link have no preview?", answer: "The page is missing Open Graph tags (og:title, og:description, og:image). Add them to the page's head so social platforms have a title, description and image to show." },
      { question: "What size should an og:image be?", answer: "1200×630 pixels is the recommended size for a crisp, correctly-cropped preview across most platforms." },
    ],
  },
  {
    slug: "meta-description",
    term: "Meta description",
    aliases: ["meta desc", "seo description", "description tag"],
    group: "Web & SEO",
    icon: "Tags",
    definition:
      "A meta description is a short HTML tag summarising a page's content. Search engines often show it as the snippet under your title in results, so a clear, unique description acts like ad copy. It doesn't directly boost rankings but strongly affects whether people click.",
    points: [
      "Keep it around 150–160 characters so Google doesn't truncate it in results.",
      "Make each one unique and specific to the page. Duplicate descriptions waste the opportunity.",
      "Write it to earn the click, describe what the page delivers, not a keyword-stuffed list.",
    ],
    relatedTools: ["meta-description-generator", "meta-tag-generator", "google-serp-preview", "character-counter"],
    relatedProblems: ["add-meta-tags", "count-words", "audit-page-seo"],
    relatedTerms: ["open-graph", "sitemap"],
    keywords: ["what is a meta description", "meta description length", "seo description", "meta desc"],
    faq: [
      { question: "How long should a meta description be?", answer: "Around 150–160 characters. Beyond that Google truncates it in search results, so keep the key message within that limit." },
      { question: "Does the meta description affect rankings?", answer: "Not directly, but it's the snippet under your title in search results, so a compelling one improves click-through, which matters." },
    ],
  },
  {
    slug: "sitemap",
    term: "XML sitemap",
    label: "Sitemap",
    aliases: ["xml sitemap", "sitemap.xml"],
    group: "Web & SEO",
    icon: "FolderTree",
    definition:
      "An XML sitemap is a file listing a website's URLs so search engines can discover and index them efficiently. It doesn't guarantee ranking, but it helps Google and Bing find every important page (especially on large or new sites) and speeds up indexing of fresh content.",
    points: [
      "List only canonical, indexable pages. Not redirects, error pages or noindex URLs.",
      "Place it at your site root (e.g. /sitemap.xml), reference it in robots.txt, and submit it in Search Console.",
      "Regenerate it as you add or remove pages so it stays accurate.",
    ],
    relatedTools: ["xml-sitemap-generator", "sitemap-validator", "robots-txt-generator", "html-sitemap-generator"],
    relatedProblems: ["create-a-sitemap", "audit-page-seo"],
    relatedTerms: ["robots-txt", "structured-data"],
    keywords: ["what is a sitemap", "xml sitemap", "sitemap.xml", "sitemap meaning"],
    faq: [
      { question: "Do I need an XML sitemap?", answer: "It's strongly recommended, especially for larger or newer sites. It helps search engines find every page and index new content faster, then submit it in Search Console." },
      { question: "Where does the sitemap go?", answer: "At your site root (e.g. yoursite.com/sitemap.xml), referenced by a line in robots.txt and submitted in Google Search Console." },
    ],
  },
  {
    slug: "robots-txt",
    term: "robots.txt",
    aliases: ["robots file", "robots exclusion"],
    group: "Web & SEO",
    icon: "Bot",
    definition:
      "robots.txt is a plain-text file at a site's root that tells search-engine crawlers which URLs they may or may not crawl. It's used to keep crawlers out of admin, duplicate or low-value areas and to point them at the sitemap, but it controls crawling, not privacy.",
    points: [
      "It must live at the domain root (yoursite.com/robots.txt) to take effect.",
      "'Disallow: /' blocks your entire site from search engines, the most common and damaging mistake, so always validate.",
      "robots.txt stops crawling, not access or indexing. Use noindex or authentication for genuinely private pages.",
    ],
    relatedTools: ["robots-txt-generator", "robots-txt-validator", "xml-sitemap-generator", "meta-tag-generator"],
    relatedProblems: ["create-robots-txt", "audit-page-seo"],
    relatedTerms: ["sitemap", "structured-data"],
    keywords: ["what is robots.txt", "robots txt meaning", "robots exclusion", "disallow robots"],
    faq: [
      { question: "What does robots.txt do?", answer: "It tells search-engine crawlers which URLs they can and can't crawl, and points them to your sitemap. It must sit at the domain root to work." },
      { question: "Can robots.txt hide a page from Google?", answer: "Not reliably. It blocks crawling, not indexing or access. Use a noindex tag to keep a page out of results, or authentication to keep it private." },
    ],
  },
  {
    slug: "structured-data",
    term: "Structured data (Schema)",
    label: "Structured data",
    aliases: ["schema markup", "json-ld", "rich results", "schema.org"],
    group: "Web & SEO",
    icon: "CodeXml",
    definition:
      "Structured data is machine-readable markup (usually Schema.org JSON-LD) that describes a page's content to search engines. It makes a page eligible for rich results (FAQ drop-downs, star ratings, recipe cards, article listings) that stand out in search and can lift click-through.",
    points: [
      "The common format is JSON-LD placed in the page. It labels things like FAQs, products, articles and reviews.",
      "It makes a page eligible for rich results but doesn't guarantee them, search engines decide when to show them.",
      "Markup must reflect content actually visible on the page, or it can be ignored or penalised.",
    ],
    relatedTools: ["schema-generator", "faq-schema-generator", "rich-results-preview", "article-schema-generator"],
    relatedProblems: ["add-structured-data", "audit-page-seo"],
    relatedTerms: ["open-graph", "meta-description"],
    keywords: ["what is structured data", "schema markup", "json-ld", "rich results", "schema.org"],
    faq: [
      { question: "What is structured data used for?", answer: "It describes your page to search engines so it can qualify for rich results (FAQ drop-downs, ratings, recipe cards and more) which stand out and can improve click-through." },
      { question: "Does structured data guarantee rich results?", answer: "No. It makes a page eligible, but search engines choose when to show them. Valid markup that matches visible content gives the best chance." },
    ],
  },

  /* ── Documents & data (batch 2) ──────────────────────────────────────────── */
  {
    slug: "xml",
    term: "XML",
    aliases: ["extensible markup language", ".xml"],
    group: "Documents & data",
    icon: "FileCode",
    definition:
      "XML (eXtensible Markup Language) is a text format that stores data in nested, custom tags, like HTML but for arbitrary data rather than web pages. It's used for configuration, data exchange, sitemaps and document formats, prized for being both human-readable and strictly structured.",
    points: [
      "XML is verbose but self-describing: every value sits inside a named tag, so the structure is explicit.",
      "It's stricter than HTML: every tag must be closed and properly nested, or a parser rejects it.",
      "JSON has largely replaced XML for web APIs, but XML is still everywhere in sitemaps, office documents and enterprise systems.",
    ],
    relatedTools: ["xml-formatter", "xml-sitemap-generator", "sitemap-validator", "json-formatter"],
    relatedProblems: ["create-a-sitemap", "fix-invalid-json"],
    relatedTerms: ["json", "yaml", "sitemap"],
    keywords: ["what is xml", "xml format", "xml meaning", "xml vs json"],
    faq: [
      { question: "What is XML used for?", answer: "Configuration files, data exchange, sitemaps and document formats (like .docx and .xlsx internally). It stores data in nested, named tags that are readable and strictly structured." },
      { question: "What's the difference between XML and JSON?", answer: "Both structure data as text. XML uses verbose named tags and is stricter. JSON is lighter and now standard for web APIs. XML persists in sitemaps and office formats." },
    ],
  },
  {
    slug: "yaml",
    term: "YAML",
    aliases: ["yaml ain't markup language", ".yml", ".yaml"],
    group: "Documents & data",
    icon: "FileCode2",
    definition:
      "YAML is a human-friendly data format that uses indentation instead of brackets, making it easy to read and write. It's the go-to for configuration files (CI pipelines, Docker Compose, Kubernetes) where clarity matters more than compactness.",
    points: [
      "YAML relies on indentation for structure, so consistent spaces (never tabs) are essential: mis-indentation is the top error.",
      "It's a superset of JSON: any JSON is valid YAML, but YAML adds comments and cleaner syntax.",
      "Great for config humans edit by hand. Less suited to high-volume machine data exchange, where JSON is faster to parse.",
    ],
    relatedTools: ["yaml-formatter", "json-formatter", "json-validator", "json-to-typescript"],
    relatedProblems: ["fix-invalid-json", "format-messy-code"],
    relatedTerms: ["json", "xml"],
    keywords: ["what is yaml", "yaml format", "yaml meaning", "yaml vs json"],
    faq: [
      { question: "What is YAML used for?", answer: "Configuration files that people edit by hand (CI/CD pipelines, Docker Compose, Kubernetes and app config) because its indentation-based syntax is easy to read." },
      { question: "Why does my YAML keep breaking?", answer: "Almost always indentation. YAML uses spaces (never tabs) to define structure, so a single misaligned line changes the meaning or fails to parse." },
    ],
  },
  {
    slug: "markdown",
    term: "Markdown",
    aliases: ["md", ".md", "markdown syntax"],
    group: "Documents & data",
    icon: "FileText",
    definition:
      "Markdown is a lightweight way to format plain text using simple symbols (# for headings, * for emphasis, - for lists) that convert to clean HTML. It lets you write formatted documents fast without a word processor, which is why READMEs, notes and docs use it.",
    points: [
      "You write in plain text with a few symbols, and it renders as formatted HTML. No toolbar needed.",
      "It's portable and future-proof: a Markdown file is readable as-is and converts to HTML, PDF or slides.",
      "Different flavours add tables, task lists and more, but the core syntax is universal.",
    ],
    relatedTools: ["markdown-preview", "markdown-to-pdf", "html-to-pdf", "txt-to-pdf"],
    relatedProblems: ["format-messy-code"],
    relatedTerms: ["pdf", "docx"],
    keywords: ["what is markdown", "markdown syntax", "markdown meaning", "md file"],
    faq: [
      { question: "What is Markdown used for?", answer: "Writing formatted text quickly in plain files, READMEs, documentation, notes and forum posts. It converts to clean HTML and can be exported to PDF." },
      { question: "How do I open a .md file?", answer: "Any text editor opens it as plain text. A Markdown previewer renders the formatting, and you can convert it to a PDF for sharing." },
    ],
  },
  {
    slug: "docx",
    term: "DOCX (Word)",
    label: "DOCX / Word",
    aliases: ["word document", ".docx", "microsoft word"],
    group: "Documents & data",
    icon: "FileType",
    definition:
      "DOCX is the standard Microsoft Word document format. It stores editable text, formatting, images and layout, and opens in Word, Google Docs and Pages. It's the format for documents you're still working on. Unlike PDF, which is for finished, fixed files.",
    points: [
      "DOCX is editable and can reflow between apps and versions, which is exactly why final documents are shared as PDF instead.",
      "Convert a PDF to DOCX to edit it, and DOCX back to PDF when it's ready to send.",
      "It's actually a zipped bundle of XML files under the hood, which is why an odd export can occasionally misbehave.",
    ],
    relatedTools: ["word-to-pdf", "pdf-to-word", "merge-pdf", "compress-pdf"],
    relatedProblems: ["convert-pdf-to-word", "resume-as-pdf"],
    relatedTerms: ["pdf", "markdown"],
    keywords: ["what is docx", "docx format", "word document", "docx vs pdf"],
    faq: [
      { question: "What's the difference between DOCX and PDF?", answer: "DOCX is an editable Word document that can shift between apps. PDF is a fixed, finished file that looks identical everywhere. Edit in DOCX, share as PDF." },
      { question: "How do I edit a PDF as a Word document?", answer: "Convert the PDF to DOCX, edit it in Word or Google Docs, then convert back to PDF when you're done." },
    ],
  },
  {
    slug: "jwt",
    term: "JWT",
    aliases: ["json web token", "jwt token", "bearer token"],
    group: "Documents & data",
    icon: "ShieldCheck",
    definition:
      "A JWT (JSON Web Token) is a compact, signed token used to prove identity between systems: most commonly to keep a user logged in via an API. It packs claims (like a user ID and expiry) into a Base64 string with a signature that lets the server verify it wasn't tampered with.",
    points: [
      "A JWT has three dot-separated parts (header, payload, signature) each Base64-encoded.",
      "The payload is encoded, not encrypted: anyone can read it, so never put secrets in a JWT.",
      "The signature is what matters. It proves the token is authentic and unmodified.",
    ],
    relatedTools: ["jwt-decoder", "base64-decoder", "hash-generator", "json-formatter"],
    relatedProblems: [],
    relatedTerms: ["base64", "json"],
    keywords: ["what is jwt", "json web token", "jwt meaning", "decode jwt"],
    faq: [
      { question: "What is a JWT used for?", answer: "Authentication between systems: typically to keep a user signed in. The server issues a signed token. The client sends it back, and the signature proves it's valid." },
      { question: "Is the data in a JWT secure?", answer: "The payload is only Base64-encoded, so anyone can read it. Never store secrets there. Its security comes from the signature, which proves it wasn't tampered with." },
    ],
  },
  {
    slug: "uuid",
    term: "UUID",
    aliases: ["universally unique identifier", "guid"],
    group: "Documents & data",
    icon: "Fingerprint",
    definition:
      "A UUID (Universally Unique Identifier) is a 128-bit value (written as 36 characters like 550e8400-e29b-41d4-a716-446655440000) designed to be unique across space and time without a central authority. Developers use it as an ID that won't collide even when generated on different machines.",
    points: [
      "UUIDs are generated independently yet are practically guaranteed not to clash, so systems can create IDs offline.",
      "Version 4 (random) is the most common. Other versions embed a timestamp or namespace.",
      "They're great as database keys and file names when you can't rely on a sequential counter.",
    ],
    relatedTools: ["uuid-generator", "nanoid-generator", "hash-generator", "password-generator"],
    relatedProblems: [],
    relatedTerms: ["base64", "json"],
    keywords: ["what is uuid", "uuid meaning", "guid", "generate uuid"],
    faq: [
      { question: "What is a UUID used for?", answer: "As a unique identifier that different machines can generate independently without collisions, commonly for database keys, file names and request IDs." },
      { question: "Are UUIDs really unique?", answer: "Not guaranteed, but the odds of a collision are astronomically small. For practical purposes a version-4 UUID is treated as unique." },
    ],
  },

  /* ── Images & graphics (batch 2) ─────────────────────────────────────────── */
  {
    slug: "avif",
    term: "AVIF",
    aliases: ["av1 image format", ".avif"],
    group: "Images & graphics",
    icon: "Image",
    definition:
      "AVIF is a modern image format based on the AV1 video codec. It compresses photos even smaller than WebP at the same quality and supports transparency and HDR, making it one of the best formats for fast-loading websites, though support is still slightly behind WebP.",
    points: [
      "AVIF often beats both JPG and WebP on file size at equal quality, so it's excellent for web performance.",
      "Browser support is broad now but not universal, so a JPG/WebP fallback is still wise for the web.",
      "It handles transparency and high dynamic range, unlike JPG.",
    ],
    relatedTools: ["image-compressor", "webp-converter", "png-to-jpg", "image-resizer"],
    relatedProblems: ["image-too-large", "convert-webp-to-jpg"],
    relatedTerms: ["webp", "jpg", "image-compression"],
    keywords: ["what is avif", "avif format", "avif vs webp", "avif meaning"],
    faq: [
      { question: "Is AVIF better than WebP?", answer: "On file size, usually, AVIF compresses smaller at the same quality. WebP still has slightly wider support, so many sites serve AVIF with a WebP or JPG fallback." },
      { question: "Should I use AVIF for my website?", answer: "It's excellent for speed. Serve AVIF where supported with a WebP/JPG fallback for older browsers to be safe." },
    ],
  },
  {
    slug: "tiff",
    term: "TIFF",
    aliases: ["tagged image file format", ".tif", ".tiff"],
    group: "Images & graphics",
    icon: "Image",
    definition:
      "TIFF (Tagged Image File Format) is a high-quality, typically lossless image format used in photography, printing and scanning. It preserves maximum detail and supports layers and multiple pages, but the files are large, so it's an archival/print format, not a web one.",
    points: [
      "TIFF is prized for fidelity: it's often lossless, keeping every detail for print and archiving.",
      "The files are big, and web browsers generally can't display TIFF, convert to JPG or PNG to share online.",
      "It can store multiple pages, which is why some scanners output multi-page TIFFs.",
    ],
    relatedTools: ["image-compressor", "png-to-jpg", "image-resizer", "webp-converter"],
    relatedProblems: ["image-too-large", "convert-webp-to-jpg"],
    relatedTerms: ["png", "jpg", "image-compression"],
    keywords: ["what is tiff", "tiff format", "tif file", "tiff vs jpg"],
    faq: [
      { question: "What is a TIFF file used for?", answer: "High-quality photography, professional printing, scanning and archiving, where preserving every detail matters more than file size." },
      { question: "How do I open or share a TIFF online?", answer: "Most browsers can't display TIFF. Convert it to JPG (smaller) or PNG (lossless) to view and share it on the web." },
    ],
  },

  /* ── Audio & video (batch 2) ─────────────────────────────────────────────── */
  {
    slug: "wav",
    term: "WAV",
    aliases: ["waveform audio", ".wav"],
    group: "Audio & video",
    icon: "AudioWaveform",
    definition:
      "WAV is an uncompressed, lossless audio format that stores sound at full quality. It's the standard for recording, editing and mastering because nothing is discarded, but the files are large, so you convert to MP3 for everyday listening and sharing.",
    points: [
      "WAV is lossless and uncompressed: perfect fidelity, but big files (roughly 10× an MP3).",
      "Use WAV while recording and editing. Export to MP3 or AAC when you're done, for portability.",
      "It carries no compression artefacts, which is why studios master in WAV.",
    ],
    relatedTools: ["wav-converter", "audio-to-mp3", "mp3-converter", "audio-compressor"],
    relatedProblems: ["convert-audio-to-mp3"],
    relatedTerms: ["mp3", "bitrate"],
    keywords: ["what is wav", "wav format", "wav vs mp3", "wav file"],
    faq: [
      { question: "What's the difference between WAV and MP3?", answer: "WAV is uncompressed and lossless (perfect quality, large files). MP3 is compressed and lossy (smaller, tiny quality loss). Edit in WAV, share as MP3." },
      { question: "Why is my WAV file so large?", answer: "WAV stores audio uncompressed, so it's roughly ten times the size of an MP3. Convert to MP3 to shrink it dramatically for sharing." },
    ],
  },
  {
    slug: "webm",
    term: "WebM",
    aliases: [".webm", "webm video"],
    group: "Audio & video",
    icon: "Video",
    definition:
      "WebM is an open, royalty-free video format built for the web. It typically produces smaller files than MP4 at similar quality, which makes it great for fast-loading web video, though MP4 still has broader support across devices and editors.",
    points: [
      "WebM is often smaller than MP4 at the same quality, ideal for websites and background video.",
      "Support is strong in modern browsers but weaker in some apps and older devices. MP4 is the safe universal choice.",
      "Converting between WebM and MP4 is common depending on where the video needs to play.",
    ],
    relatedTools: ["webm-to-mp4", "video-converter", "mp4-to-webm", "video-compressor"],
    relatedProblems: ["convert-mov-to-mp4", "compress-a-video"],
    relatedTerms: ["mp4", "gif", "bitrate"],
    keywords: ["what is webm", "webm format", "webm vs mp4", "webm file"],
    faq: [
      { question: "WebM or MP4, which should I use?", answer: "WebM is smaller and great for web video. MP4 has the broadest compatibility across devices, apps and editors. Use WebM online, MP4 when you need it to play everywhere." },
      { question: "How do I open a WebM file?", answer: "Modern browsers play WebM. If an app won't open it, convert it to MP4, which plays virtually everywhere." },
    ],
  },
  {
    slug: "mov",
    term: "MOV",
    aliases: [".mov", "quicktime", "apple video"],
    group: "Audio & video",
    icon: "Film",
    definition:
      "MOV is Apple's QuickTime video format, the default for videos recorded on iPhones and Macs. It's high quality and works natively in Apple's ecosystem, but some Windows PCs, apps and platforms can't play it, which is why MOV is often converted to MP4.",
    points: [
      "MOV is what iPhones and Macs record by default, often using the HEVC (H.265) codec.",
      "It can trip up Windows and some editors/platforms, converting to MP4 (H.264) fixes playback almost everywhere.",
      "MOV and MP4 are similar containers. The compatibility difference is why people convert.",
    ],
    relatedTools: ["mov-to-mp4", "video-converter", "video-compressor", "extract-audio"],
    relatedProblems: ["convert-mov-to-mp4", "compress-a-video"],
    relatedTerms: ["mp4", "codec"],
    keywords: ["what is mov", "mov format", "mov vs mp4", "quicktime file"],
    faq: [
      { question: "Why won't my MOV file play on Windows?", answer: "iPhone/Mac MOV files often use the HEVC codec that some Windows setups don't support. Convert to MP4 (H.264) and it plays almost everywhere." },
      { question: "What's the difference between MOV and MP4?", answer: "Both are similar video containers. MOV is Apple's QuickTime format. MP4 is the universal standard. Convert MOV to MP4 for maximum compatibility." },
    ],
  },
  {
    slug: "codec",
    term: "Codec",
    aliases: ["h.264", "h.265", "hevc", "av1", "video codec"],
    group: "Audio & video",
    icon: "Binary",
    definition:
      "A codec is the method used to compress and decompress audio or video: it's the 'how' inside a file. H.264, H.265 (HEVC) and AV1 are common video codecs. A file's container (MP4, MOV) is separate from its codec, which is why two MP4s can behave differently.",
    points: [
      "The container (MP4, MOV, WebM) is the box. The codec (H.264, HEVC, AV1) is how the video inside is encoded.",
      "Newer codecs like HEVC and AV1 compress smaller but need more support and processing power.",
      "'The file won't play' is often a codec issue, not the container, re-encoding to H.264 usually fixes it.",
    ],
    relatedTools: ["video-converter", "video-compressor", "mp3-converter", "extract-audio"],
    relatedProblems: ["convert-mov-to-mp4", "compress-a-video"],
    relatedTerms: ["mp4", "bitrate", "mov"],
    keywords: ["what is a codec", "codec meaning", "h.264 vs h.265", "video codec"],
    faq: [
      { question: "What's the difference between a codec and a format?", answer: "The format/container (MP4, MOV) is the file wrapper. The codec (H.264, HEVC, AV1) is how the media inside is compressed. A file needs both to play." },
      { question: "Why won't my video play even though it's an MP4?", answer: "Often the codec, not the container. If your player doesn't support the codec (e.g. HEVC), re-encode the video to H.264 and it should play." },
    ],
  },

  /* ── Web & SEO (batch 2) ─────────────────────────────────────────────────── */
  {
    slug: "canonical-url",
    term: "Canonical URL",
    aliases: ["canonical tag", "rel canonical", "canonical link"],
    group: "Web & SEO",
    icon: "Link",
    definition:
      "A canonical URL tells search engines which version of a page is the 'main' one when the same or similar content is reachable at several addresses. Set with a rel=\"canonical\" tag, it consolidates ranking signals onto one URL and prevents duplicate-content dilution.",
    points: [
      "Use it when the same content lives at multiple URLs (tracking parameters, http/https, trailing slashes, print versions).",
      "The canonical points to the preferred URL, so search engines index and rank that one and merge the signals.",
      "A wrong canonical can deindex the wrong page, so point it at the true primary URL.",
    ],
    relatedTools: ["canonical-url-generator", "meta-tag-generator", "url-parser", "meta-tag-analyzer"],
    relatedProblems: ["audit-page-seo", "add-meta-tags"],
    relatedTerms: ["sitemap", "meta-description", "structured-data"],
    keywords: ["what is a canonical url", "canonical tag", "rel canonical", "canonical seo"],
    faq: [
      { question: "What does a canonical tag do?", answer: "It names the preferred version of a page when duplicates exist, so search engines rank that URL and combine the ranking signals instead of splitting them." },
      { question: "When do I need a canonical URL?", answer: "Whenever the same content is reachable at multiple URLs (tracking parameters, http vs https, or product pages in several categories) point them all at the primary URL." },
    ],
  },
  {
    slug: "utm",
    term: "UTM parameters",
    label: "UTM parameters",
    aliases: ["utm tags", "utm codes", "campaign tracking"],
    group: "Web & SEO",
    icon: "Link2",
    definition:
      "UTM parameters are tags added to a link's end (utm_source, utm_medium, utm_campaign…) that tell your analytics where a click came from. They let you measure which campaign, channel or post drove traffic and conversions, without changing the page the link opens.",
    points: [
      "They're added to the URL, so analytics can attribute a visit to a specific source, medium and campaign.",
      "Keep naming consistent (lowercase, no spaces) so your reports don't fragment the same campaign.",
      "Use a builder to generate them correctly rather than hand-editing URLs.",
    ],
    relatedTools: ["utm-builder", "campaign-url-builder", "url-parser", "url-encoder"],
    relatedProblems: ["audit-page-seo"],
    relatedTerms: ["canonical-url", "meta-description"],
    keywords: ["what is utm", "utm parameters", "utm tracking", "utm codes"],
    faq: [
      { question: "What are UTM parameters for?", answer: "Tracking where your traffic comes from. Tags on a link (source, medium, campaign) let analytics show which channel or campaign drove each visit and conversion." },
      { question: "Do UTM parameters affect SEO?", answer: "They don't help rankings and can create duplicate URLs, which is why pages with UTM links should point a canonical tag at the clean URL." },
    ],
  },

  /* ── AI & search ──────────────────────────────────────────────────────────
     The definitional layer under the GEO Studio. These are the "what is X"
     questions people ask assistants directly, so each definition is written to
     be lifted verbatim: one sentence, concrete, no dependence on the rest of
     the page. Claims here must stay consistent with the tools that implement
     them (config/tools/geo/*), because a contradiction between our glossary
     and our own tool is exactly what an assistant will surface. ───────────── */
  {
    slug: "generative-engine-optimization",
    term: "Generative Engine Optimization (GEO)",
    label: "GEO",
    aliases: ["geo", "ai seo", "llm seo", "answer engine optimization", "aeo"],
    group: "AI & search",
    icon: "Radar",
    definition:
      "Generative Engine Optimization (GEO) is the practice of making a website usable by AI answer engines like ChatGPT, Claude, Perplexity and Google's AI features, so they can crawl it, read it without JavaScript, and quote it as a source. It overlaps with SEO but optimizes for being cited rather than ranked.",
    points: [
      "GEO and SEO diverge in three concrete places: most AI crawlers don't run JavaScript, retrieval reads your page as isolated fragments rather than as a document, and citation favors specific sourced claims over keyword coverage.",
      "The measurable factors come from published research. A 2024 study (Aggarwal et al., KDD) tested content edits across 10,000 queries and found adding statistics, quotable statements and cited sources produced the largest visibility gains.",
      "Most of the GEO industry sells citation monitoring, which tracks how often you are mentioned. That is an outcome metric. It cannot fix a robots.txt rule or a client-rendered page, which is where the actual technical wins are.",
      "No tool can guarantee a citation. Competition, query demand and model behavior are outside anyone's control. What you can control is whether anything technically prevents you being cited.",
    ],
    relatedTools: ["geo-audit", "content-citability-scorer", "ai-crawler-access-checker", "retrieval-chunk-preview"],
    relatedProblems: ["ai-cannot-see-my-website", "make-content-ai-citable"],
    relatedTerms: ["ai-crawler", "retrieval-augmented-generation", "llms-txt", "gptbot"],
    keywords: ["what is geo", "generative engine optimization", "ai seo meaning", "llm seo", "answer engine optimization"],
    faq: [
      { question: "Is GEO different from SEO?", answer: "It overlaps heavily but diverges where AI systems behave differently from search engines: they mostly don't execute JavaScript, they retrieve fragments of your page rather than the whole thing, and they favor specific sourced claims they can quote. Good SEO is a prerequisite, not a substitute." },
      { question: "What actually improves AI visibility?", answer: "In order: let AI crawlers reach the page (robots.txt and any CDN bot-blocking), make the content exist in the raw HTML without JavaScript, then give models something quotable, meaning concrete numbers, self-contained sentences and cited sources." },
      { question: "Do I need to pay for a GEO tool?", answer: "Not for the technical layer. Checking crawler access, JavaScript rendering, content citability and retrieval chunking can all be done free and in your browser. Paid products in this category mostly monitor how often you are mentioned over time." },
    ],
  },
  {
    slug: "ai-crawler",
    term: "AI crawler",
    aliases: ["ai bot", "llm crawler", "ai web crawler", "ai user agent"],
    group: "AI & search",
    icon: "Bot",
    definition:
      "An AI crawler is an automated bot that fetches web pages on behalf of an AI company, either to train a model, to build a search index that AI answers cite from, or to read a page live when a user asks about it. Each purpose is a separate bot with its own name in robots.txt.",
    points: [
      "The three jobs matter because they have different consequences. Blocking a training bot keeps your content out of future models. Blocking a search-index bot removes you from AI answers that link back to you, which is direct lost traffic.",
      "OpenAI alone runs three: GPTBot trains models, OAI-SearchBot builds the ChatGPT Search index, and ChatGPT-User fetches a page when someone shares your link. Treating them as one decision is the most common policy mistake.",
      "Bingbot matters more than its name suggests, because ChatGPT Search and Microsoft Copilot retrieve through Bing's index. Blocking it removes you from those answers even if every OpenAI bot is allowed.",
      "robots.txt is a request, not a lock. The major operators document compliance, but a CDN can also block AI crawlers at the firewall before robots.txt is ever read.",
    ],
    relatedTools: ["ai-crawler-access-checker", "ai-robots-txt-generator", "ai-crawler-log-analyzer", "geo-audit"],
    relatedProblems: ["ai-cannot-see-my-website", "are-ai-crawlers-visiting-my-site", "should-i-block-ai-crawlers"],
    relatedTerms: ["gptbot", "robots-txt", "generative-engine-optimization"],
    keywords: ["what is an ai crawler", "ai bot user agent", "llm crawler", "ai crawlers list", "ai bots robots.txt"],
    faq: [
      { question: "Which AI crawlers should I know about?", answer: "GPTBot, OAI-SearchBot and ChatGPT-User (OpenAI). ClaudeBot, Claude-SearchBot and Claude-User (Anthropic). PerplexityBot and Perplexity-User. Googlebot and the Google-Extended control token. Bingbot. Applebot-Extended. Meta-externalagent. Bytespider, and CCBot for Common Crawl." },
      { question: "Do AI crawlers run JavaScript?", answer: "As a rule, no. Googlebot renders pages in a headless browser, but the AI crawlers generally read the raw HTML response and move on, so content injected client-side is invisible to them." },
      { question: "How do I see which ones visit my site?", answer: "Your server's access log is the only authoritative record, because bots don't execute the JavaScript that analytics tools rely on. Search it for the user-agent strings, or parse the log in your browser." },
    ],
  },
  {
    slug: "gptbot",
    term: "GPTBot",
    aliases: ["gpt bot", "openai crawler", "chatgpt crawler"],
    group: "AI & search",
    icon: "Bot",
    definition:
      "GPTBot is OpenAI's web crawler that collects pages as training data for future models. It is not the bot behind ChatGPT Search results, and blocking it does not remove you from ChatGPT's answers. That is a different bot called OAI-SearchBot.",
    points: [
      "Blocking GPTBot is a content-control decision: future OpenAI models learn nothing from your site, so ChatGPT is less likely to describe your brand from memory.",
      "It does not affect ChatGPT Search, which retrieves through OAI-SearchBot and Bing's index. Many sites block all three OpenAI bots by accident and lose citations they wanted.",
      "You allow or block it with a robots.txt group naming the exact token: 'User-agent: GPTBot' followed by 'Disallow: /' to block, or 'Allow: /' to permit.",
      "robots.txt only governs future crawling. It cannot remove your content from a model that has already been trained on it.",
    ],
    relatedTools: ["ai-crawler-access-checker", "ai-robots-txt-generator", "ai-crawler-log-analyzer"],
    relatedProblems: ["should-i-block-ai-crawlers", "ai-cannot-see-my-website"],
    relatedTerms: ["ai-crawler", "robots-txt", "generative-engine-optimization"],
    keywords: ["what is gptbot", "gptbot robots.txt", "block gptbot", "openai crawler user agent", "is gptbot blocked"],
    faq: [
      { question: "How do I block GPTBot?", answer: "Add a group to your robots.txt at the domain root: 'User-agent: GPTBot' on one line, then 'Disallow: /' on the next. Check the live file afterwards, because CDNs and plugins sometimes rewrite robots.txt." },
      { question: "Does blocking GPTBot remove me from ChatGPT?", answer: "No. ChatGPT Search retrieves through OAI-SearchBot and Bing's index, both separate from GPTBot. Blocking GPTBot only stops your pages being used to train future OpenAI models." },
      { question: "Does GPTBot respect robots.txt?", answer: "OpenAI documents that it does, and server-log studies generally bear that out. It publishes its IP ranges so you can verify a request genuinely came from OpenAI rather than a spoofed user-agent." },
    ],
  },
  {
    slug: "llms-txt",
    term: "llms.txt",
    aliases: ["llms txt", "llmstxt", "llms.txt file"],
    group: "AI & search",
    icon: "FileText",
    definition:
      "llms.txt is a proposed convention for a Markdown file at your domain root that gives AI systems a curated map of your site: a name, a one-line summary and grouped links. It is optional, and Google has stated its AI search does not use it.",
    points: [
      "It is not robots.txt. robots.txt is a decades-old standard that genuinely controls crawler access, llms.txt only suggests content and carries no enforcement, so ignoring it has no consequence.",
      "The honest evidence is thin. No major AI operator documents llms.txt as a retrieval or ranking input, and sites that do well in AI answers overwhelmingly do so without one.",
      "It is still occasionally useful. Some coding assistants and documentation agents fetch it deliberately, which makes it most worthwhile for sites with developer docs.",
      "The format is a curated map, not an index. A 30-link file a model will actually read beats a 300-link dump. You already have a sitemap for completeness.",
    ],
    relatedTools: ["llms-txt-generator", "geo-audit", "xml-sitemap-generator"],
    relatedProblems: ["make-content-ai-citable"],
    relatedTerms: ["robots-txt", "sitemap", "generative-engine-optimization", "ai-crawler"],
    keywords: ["what is llms.txt", "llms txt file", "does llms.txt work", "llms.txt seo", "create llms.txt"],
    faq: [
      { question: "Does llms.txt actually do anything?", answer: "Less than its marketing suggests. Google has said its AI search does not use it, and no major AI company documents it as a ranking input. Some agents and documentation tools do fetch it, so it is a cheap extra rather than a lever." },
      { question: "Should I create one?", answer: "If it takes five minutes, there is no downside, and the case is strongest for documentation sites. Just do not prioritize it above crawler access, JavaScript-free rendering or citable content, which have direct measurable effects." },
      { question: "Where does the file go?", answer: "At your domain root, served as a static file: yourdomain.com/llms.txt. Each subdomain would need its own, exactly like robots.txt." },
    ],
  },
  {
    slug: "retrieval-augmented-generation",
    term: "Retrieval-Augmented Generation (RAG)",
    label: "RAG",
    aliases: ["rag", "retrieval augmented generation", "ai retrieval"],
    group: "AI & search",
    icon: "Puzzle",
    definition:
      "Retrieval-Augmented Generation (RAG) is how an AI answers using sources it was never trained on: it splits documents into chunks, finds the chunks that match the question, and hands only those fragments to the model. It is why your page is read as pieces rather than as a whole.",
    points: [
      "Documents are split before they are stored, typically by heading section and then into token windows of a few hundred tokens with a small overlap.",
      "The model sees one chunk at a time, without your heading hierarchy, your introduction or the paragraph above it. A sentence starting 'It also supports…' becomes meaningless.",
      "This is why self-contained writing matters more for AI than for humans. Naming the subject again instead of writing 'it', and deleting phrases like 'as mentioned above', directly changes whether a fragment is usable.",
      "Sections longer than the chunk window get split, and only the first piece keeps its heading. Shorter sections are therefore safer.",
    ],
    relatedTools: ["retrieval-chunk-preview", "content-citability-scorer", "answer-snippet-checker", "geo-audit"],
    relatedProblems: ["make-content-ai-citable"],
    relatedTerms: ["generative-engine-optimization", "ai-crawler"],
    keywords: ["what is rag", "retrieval augmented generation", "how ai reads my page", "ai chunking", "rag chunks"],
    faq: [
      { question: "How does RAG change how I should write?", answer: "Write every section so it survives being read alone. Restate the subject rather than relying on pronouns, avoid references to text elsewhere on the page, and keep sections short enough to stay a single chunk." },
      { question: "What chunk size do systems use?", answer: "It varies, but a few hundred tokens with roughly 10 to 20% overlap is the mainstream default, and heading-aware splitting is common. The exact numbers matter less than the consequence: long sections get split and lose their heading." },
      { question: "Can I see how my page would be chunked?", answer: "Yes. A chunk preview performs the same heading-then-token-window splitting and shows each fragment in isolation, flagging the ones that stop making sense without their surroundings." },
    ],
  },
  {
    slug: "ai-search",
    term: "AI search",
    aliases: ["answer engine", "ai overviews", "generative search", "ai answers"],
    group: "AI & search",
    icon: "Sparkles",
    definition:
      "AI search is any system that answers a question in prose instead of returning a list of links, usually citing the sources it drew on. ChatGPT Search, Perplexity, Claude's web search and Google's AI Overviews are all examples, and each retrieves live pages rather than answering purely from training.",
    points: [
      "Being cited is the new click. These systems link their sources, so appearing as a citation is a real referral channel rather than a vanity metric.",
      "Most of them retrieve through an existing search index. ChatGPT Search and Copilot lean on Bing, which is why ordinary search hygiene still matters for AI visibility.",
      "Answers are assembled from fragments, so a page that opens with a direct answer in its first sentences is far more usable than one that warms up for two paragraphs.",
      "Citation is not guaranteed by anything. What you control is whether crawlers can reach you, whether the content exists without JavaScript, and whether there is anything specific enough to quote.",
    ],
    relatedTools: ["geo-audit", "answer-snippet-checker", "content-citability-scorer", "ai-crawler-access-checker"],
    relatedProblems: ["ai-cannot-see-my-website", "make-content-ai-citable"],
    relatedTerms: ["generative-engine-optimization", "retrieval-augmented-generation", "ai-crawler"],
    keywords: ["what is ai search", "answer engine", "ai overviews", "generative search", "chatgpt search"],
    faq: [
      { question: "How do I appear in AI search results?", answer: "Three things in order: let the relevant crawlers reach your pages, make sure the content exists in the raw HTML without JavaScript, and write sections that open with a direct self-contained answer containing concrete facts." },
      { question: "Does AI search send real traffic?", answer: "Yes, when the system cites sources with links, which ChatGPT Search, Perplexity and Google's AI features all do. That is why blocking a search-index crawler is more costly than blocking a training crawler." },
      { question: "Is AI search replacing traditional SEO?", answer: "It is adding a layer rather than replacing one. Most AI systems retrieve through search indexes, so ranking well still helps. What changes is that being quotable matters alongside being ranked." },
    ],
  },
];

/* ── Pure helpers (client-safe) ────────────────────────────────────────────── */

/** Look up a term by slug. */
export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}

/** All terms, alphabetical by display term. */
export function getAllGlossaryTerms(): GlossaryTerm[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
}

/** Terms grouped by `group`, in GLOSSARY_GROUPS order (empty groups dropped). */
export function getGlossaryByGroup(): { group: GlossaryGroup; terms: GlossaryTerm[] }[] {
  return GLOSSARY_GROUPS.map((group) => ({
    group,
    terms: GLOSSARY.filter((t) => t.group === group).sort((a, b) => a.term.localeCompare(b.term)),
  })).filter((g) => g.terms.length > 0);
}

/** Resolve a term's `relatedTerms` slugs to full terms (dropping misses). */
export function getRelatedGlossaryTerms(term: GlossaryTerm): GlossaryTerm[] {
  return term.relatedTerms
    .map((slug) => getGlossaryTerm(slug))
    .filter((t): t is GlossaryTerm => Boolean(t));
}
