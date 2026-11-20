import type { IntentRule } from "@/lib/assistant/types";

/**
 * The curated INTENT MAP, natural-language problems/tasks/synonyms → a real
 * tool. Every `tool` / `related` / `workflow` slug here is validated against the
 * registry at resolve time (lib/assistant/intent), so a typo or a retired tool
 * is silently dropped rather than surfaced. Patterns are lower-case; matching is
 * substring + whole-word aware, so include plurals/abbreviations explicitly
 * where they matter.
 *
 * Ordering matters only as a tie-breaker: earlier rules win on an equal score.
 * Keep the highest-signal, most-specific rules toward the top of each block.
 */
export const INTENT_MAP: IntentRule[] = [
  /* ── PDF ─────────────────────────────────────────────────────────────────── */
  {
    patterns: [
      "pdf too big", "pdf too large", "shrink pdf", "reduce pdf size",
      "reduce pdf", "make pdf smaller", "compress pdf", "pdf size", "pdf heavy",
      "lower pdf size", "pdf file size",
    ],
    tool: "compress-pdf",
    related: ["merge-pdf", "split-pdf"],
    workflow: "publish-a-pdf",
    note: "Shrinks a PDF in your browser, nothing leaves your device.",
  },
  {
    patterns: [
      "combine pdf", "combine documents", "join pdf", "join documents",
      "merge pdf", "merge documents", "combine files into pdf", "one pdf",
      "put pdfs together", "concatenate pdf",
    ],
    tool: "merge-pdf",
    related: ["compress-pdf", "split-pdf", "document-page-number"],
    workflow: "publish-a-pdf",
    note: "Merges any number of PDFs into one, in the order you choose.",
  },
  {
    patterns: [
      "split pdf", "separate pdf", "break pdf", "divide pdf",
      "one pdf per page", "pdf into pages", "split document",
    ],
    tool: "split-pdf",
    related: ["extract-pdf-pages", "merge-pdf", "reorder-pdf-pages"],
    note: "Splits a PDF into separate files or page ranges.",
  },
  {
    patterns: [
      "pdf to word", "pdf to editable", "editable pdf", "pdf into word",
      "pdf to docx", "convert pdf to word", "edit pdf text in word",
    ],
    tool: "pdf-to-word",
    related: ["pdf-to-word", "pdf-editor", "ocr-pdf"],
    note: "Converts a PDF into an editable Word document.",
  },
  {
    patterns: [
      "word to pdf", "docx to pdf", "doc to pdf", "convert word to pdf",
      "save word as pdf",
    ],
    tool: "word-to-pdf",
    related: ["word-to-pdf", "compress-pdf", "merge-pdf"],
    note: "Turns a Word document into a shareable PDF.",
  },
  {
    patterns: [
      "edit pdf", "change pdf text", "modify pdf", "fill pdf", "annotate pdf",
      "write on pdf", "add text to pdf",
    ],
    tool: "pdf-editor",
    related: ["pdf-to-word", "document-signature", "document-watermark"],
    note: "Edits existing PDF text and adds new content, right in the browser.",
  },
  {
    patterns: [
      "password protect pdf", "encrypt pdf", "lock pdf", "secure pdf",
      "pdf password", "add password to pdf",
    ],
    tool: "pdf-password-protect",
    related: ["unlock-pdf", "compress-pdf", "document-watermark"],
    note: "Adds a password so only the right people can open your PDF.",
  },
  {
    patterns: [
      "unlock pdf", "remove pdf password", "decrypt pdf", "pdf locked",
      "open protected pdf",
    ],
    tool: "unlock-pdf",
    related: ["pdf-password-protect", "compress-pdf"],
    note: "Removes a known password so the PDF opens freely.",
  },
  {
    patterns: [
      "scanned pdf", "pdf ocr", "ocr pdf", "make pdf searchable",
      "extract text from pdf", "recognize text pdf", "pdf text recognition",
    ],
    tool: "ocr-pdf",
    related: ["pdf-to-word", "pdf-to-txt"],
    note: "Runs OCR so a scanned PDF becomes selectable, searchable text.",
  },
  {
    patterns: [
      "rotate pdf", "turn pdf", "pdf sideways", "fix pdf orientation",
    ],
    tool: "rotate-pdf",
    related: ["reorder-pdf-pages", "delete-pdf-pages"],
    note: "Rotates pages so your PDF reads the right way up.",
  },
  {
    patterns: [
      "delete pdf pages", "remove pdf pages", "drop pages from pdf",
    ],
    tool: "delete-pdf-pages",
    related: ["extract-pdf-pages", "split-pdf", "reorder-pdf-pages"],
    note: "Removes the pages you don't need from a PDF.",
  },
  {
    patterns: [
      "extract pdf pages", "pull pages from pdf", "save pdf pages",
      "grab pdf pages",
    ],
    tool: "extract-pdf-pages",
    related: ["split-pdf", "delete-pdf-pages"],
    note: "Pulls selected pages out of a PDF into a new file.",
  },
  {
    patterns: [
      "reorder pdf", "rearrange pdf", "sort pdf pages", "move pdf pages",
    ],
    tool: "reorder-pdf-pages",
    related: ["merge-pdf", "delete-pdf-pages"],
    note: "Drag pages into the order you want.",
  },
  {
    patterns: [
      "images to pdf", "jpg to pdf", "photos to pdf", "png to pdf",
      "scan to pdf", "pictures to pdf", "image to pdf",
    ],
    tool: "jpg-to-pdf",
    related: ["merge-pdf", "compress-pdf", "pdf-to-jpg"],
    workflow: "publish-a-pdf",
    note: "Combines images or scans into a single PDF.",
  },
  {
    patterns: [
      "pdf to jpg", "pdf to image", "pdf to png", "export pdf pages as images",
      "save pdf as image",
    ],
    tool: "pdf-to-jpg",
    related: ["pdf-to-word", "compress-pdf"],
    note: "Exports each PDF page as an image.",
  },
  {
    patterns: [
      "page numbers pdf", "number pdf pages", "add page numbers",
    ],
    tool: "document-page-number",
    related: ["merge-pdf", "document-watermark"],
    note: "Stamps page numbers onto every page.",
  },
  {
    patterns: [
      "watermark pdf", "watermark document", "add watermark", "stamp pdf",
    ],
    tool: "document-watermark",
    related: ["document-signature", "document-page-number"],
    note: "Overlays a text or image watermark on your document.",
  },
  {
    patterns: [
      "sign pdf", "signature pdf", "e-sign", "esign", "add signature",
      "sign document",
    ],
    tool: "document-signature",
    related: ["pdf-password-protect", "document-watermark"],
    note: "Draws or types a signature and stamps it on the document.",
  },
  {
    patterns: [
      "html to pdf", "webpage to pdf", "web page to pdf", "save webpage as pdf",
    ],
    tool: "html-to-pdf",
    related: ["markdown-to-pdf", "compress-pdf"],
    note: "Renders HTML into a clean PDF.",
  },
  {
    patterns: [
      "markdown to pdf", "md to pdf", "readme to pdf",
    ],
    tool: "markdown-to-pdf",
    related: ["markdown-preview", "html-to-pdf"],
    note: "Turns Markdown into a formatted PDF.",
  },

  /* ── Images ──────────────────────────────────────────────────────────────── */
  {
    patterns: [
      "image too big", "image too large", "photo too big", "heavy image",
      "compress image", "shrink image", "reduce image size", "optimize image",
      "make image smaller", "picture too big", "reduce photo size",
    ],
    tool: "image-compressor",
    related: ["image-resizer", "webp-converter", "crop-image"],
    workflow: "optimize-images",
    note: "Compresses images with a quality you control, all in the browser.",
  },
  {
    patterns: [
      "resize image", "change image size", "image dimensions", "scale image",
      "resize photo", "shrink dimensions", "resize picture",
    ],
    tool: "image-resizer",
    related: ["crop-image", "image-compressor"],
    workflow: "optimize-images",
    note: "Resizes to exact pixel dimensions or a percentage.",
  },
  {
    patterns: [
      "blurry", "low res", "low resolution", "enhance image", "upscale",
      "upscale image", "sharpen", "increase resolution", "make image bigger",
      "improve image quality", "hd image", "enlarge photo",
    ],
    tool: "image-upscaler",
    related: ["image-resizer", "image-compressor"],
    note: "Uses an AI model to upscale and sharpen without the blur.",
  },
  {
    patterns: [
      "crop image", "crop photo", "trim image", "cut image", "crop picture",
    ],
    tool: "crop-image",
    related: ["image-resizer", "image-compressor", "png-to-jpg"],
    note: "Crop to any aspect ratio or a free selection.",
  },
  {
    patterns: [
      "instagram", "instagram story", "instagram post", "social size",
      "social media size", "thumbnail", "post size", "story size",
      "profile picture size", "banner size", "twitter size", "facebook size",
    ],
    tool: "image-resizer",
    related: ["crop-image", "image-compressor", "png-to-jpg"],
    note: "Resize + crop to the exact size each platform expects.",
  },
  {
    patterns: [
      "convert png", "png to jpg", "png to jpeg", "png smaller", "flatten png",
    ],
    tool: "png-to-jpg",
    related: ["webp-converter", "jpg-to-png", "image-compressor"],
    note: "Flattens a PNG to a lightweight JPG.",
  },
  {
    patterns: [
      "jpg to png", "jpeg to png", "convert jpg", "make jpg transparent",
    ],
    tool: "jpg-to-png",
    related: ["png-to-jpg", "webp-converter", "image-compressor"],
    note: "Converts a JPG to PNG (needed before transparency).",
  },
  {
    patterns: [
      "webp", "convert to webp", "webp converter", "modern image format",
      "faster image format",
    ],
    tool: "webp-converter",
    related: ["image-compressor", "png-to-jpg", "image-resizer"],
    note: "WebP is smaller than PNG/JPG at the same quality: great for the web.",
  },

  /* ── SVG / vectors ───────────────────────────────────────────────────────── */
  {
    patterns: [
      "png to svg", "vectorize", "trace image", "logo to svg", "raster to vector",
      "image to svg", "convert to vector", "bitmap to vector",
    ],
    tool: "png-to-svg",
    related: ["svg-optimizer", "svg-editor"],
    note: "Traces a raster image into a scalable SVG vector.",
  },
  {
    patterns: [
      "optimize svg", "svg too big", "minify svg", "clean svg", "shrink svg",
      "compress svg", "reduce svg size",
    ],
    tool: "svg-optimizer",
    related: ["svg-minifier", "svg-to-react", "svg-to-data-uri"],
    note: "Strips bloat from an SVG so it's tiny and clean.",
  },
  {
    patterns: [
      "svg to react", "svg component", "svg to jsx", "react icon from svg",
    ],
    tool: "svg-to-react",
    related: ["svg-optimizer", "svg-to-vue"],
    note: "Turns an SVG into a ready-to-drop React component.",
  },
  {
    patterns: [
      "blob shape", "blob generator", "organic shape", "svg blob",
    ],
    tool: "svg-blob-generator",
    related: ["svg-wave-generator", "svg-shape-generator", "svg-pattern-generator"],
    note: "Generates smooth organic blob shapes as SVG.",
  },
  {
    patterns: [
      "svg wave", "wave divider", "section divider", "wavy shape",
    ],
    tool: "svg-wave-generator",
    related: ["svg-blob-generator", "svg-pattern-generator"],
    note: "Creates wave dividers for section transitions.",
  },
  {
    patterns: [
      "svg gradient", "gradient generator",
    ],
    tool: "svg-gradient-generator",
    related: ["svg-color-editor", "svg-pattern-generator"],
    note: "Builds SVG gradients you can copy straight into your markup.",
  },

  /* ── QR codes ────────────────────────────────────────────────────────────── */
  {
    patterns: [
      "qr", "qr code", "qrcode", "make a qr", "generate qr", "create qr code",
      "qr code for link", "url qr", "website qr",
    ],
    tool: "qr-code-generator",
    related: ["qr-code-with-logo", "bulk-qr-code-generator", "qr-code-scanner"],
    workflow: "make-a-qr-campaign",
    note: "Generates a crisp QR code for any link or text.",
  },
  {
    patterns: [
      "qr not scanning", "qr doesn't scan", "qr does not scan", "qr won't scan",
      "qr wont scan", "broken qr", "qr not working", "fix qr code",
      "qr code unreadable",
    ],
    tool: "qr-code-generator",
    related: ["qr-code-scanner", "qr-code-with-logo"],
    note: "Bump the error-correction level and quiet-zone so it scans reliably.",
  },
  {
    patterns: [
      "qr with logo", "branded qr", "logo qr", "custom qr", "qr code logo",
    ],
    tool: "qr-code-with-logo",
    related: ["qr-code-generator", "bulk-qr-code-generator"],
    note: "Drops your logo in the centre without breaking the scan.",
  },
  {
    patterns: [
      "bulk qr", "many qr codes", "batch qr", "qr codes from csv",
      "generate lots of qr",
    ],
    tool: "bulk-qr-code-generator",
    related: ["qr-code-generator", "qr-code-with-logo"],
    workflow: "make-a-qr-campaign",
    note: "Batch-generates a whole set of QR codes at once.",
  },
  {
    patterns: [
      "scan qr", "read qr", "decode qr", "qr scanner", "qr reader",
      "what's in this qr",
    ],
    tool: "qr-code-scanner",
    related: ["qr-code-decoder", "qr-code-reader", "qr-code-generator"],
    note: "Scans a QR image and reveals what it encodes.",
  },
  {
    patterns: [
      "wifi qr", "wifi qr code", "share wifi", "qr for wifi", "wifi password qr",
    ],
    tool: "wifi-qr-code-generator",
    related: ["qr-code-generator", "qr-code-with-logo"],
    note: "Guests scan to join your Wi-Fi. No password typing.",
  },
  {
    patterns: [
      "vcard qr", "contact qr", "business card qr", "qr for contact details",
    ],
    tool: "vcard-qr-code-generator",
    related: ["business-card-qr-code-generator", "qr-code-generator"],
    note: "Encodes your contact card so a scan saves you to Contacts.",
  },
  {
    patterns: [
      "upi qr", "payment qr", "qr for payment", "pay qr", "collect payment qr",
    ],
    tool: "upi-qr-code-generator",
    related: ["payment-qr-code-generator", "qr-code-generator"],
    note: "Generates a UPI payment QR that opens the payer's app pre-filled.",
  },
  {
    patterns: [
      "whatsapp qr", "qr for whatsapp", "chat qr",
    ],
    tool: "whatsapp-qr-code-generator",
    related: ["qr-code-generator", "phone-qr-code-generator"],
    note: "Scanning opens a WhatsApp chat with you.",
  },

  /* ── Developer ───────────────────────────────────────────────────────────── */
  {
    patterns: [
      "format json", "beautify json", "pretty json", "prettify json",
      "json formatter", "indent json", "json pretty print",
    ],
    tool: "json-formatter",
    related: ["json-validator", "json-to-csv", "json-to-typescript"],
    note: "Formats and validates JSON with proper indentation.",
  },
  {
    patterns: [
      "json invalid", "validate json", "json error", "check json", "is json valid",
    ],
    tool: "json-validator",
    related: ["json-formatter", "json-tree-viewer"],
    note: "Pinpoints exactly where your JSON breaks.",
  },
  {
    patterns: [
      "decode jwt", "jwt", "json web token", "decode token", "read token",
      "inspect jwt", "parse jwt",
    ],
    tool: "jwt-decoder",
    related: ["base64-decoder", "hash-generator"],
    note: "Decodes a JWT's header + payload without sending it anywhere.",
  },
  {
    patterns: [
      "base64", "encode base64", "base64 encode", "to base64", "b64",
    ],
    tool: "base64-encoder",
    related: ["base64-decoder", "url-encoder", "hash-generator"],
    note: "Encodes text or files to Base64.",
  },
  {
    patterns: [
      "decode base64", "base64 decode", "from base64",
    ],
    tool: "base64-decoder",
    related: ["base64-encoder", "jwt-decoder"],
    note: "Decodes Base64 back to text.",
  },
  {
    patterns: [
      "uuid", "generate uuid", "guid", "unique id", "random id",
    ],
    tool: "uuid-generator",
    related: ["nanoid-generator", "hash-generator", "password-generator"],
    note: "Generates RFC-compliant UUIDs in bulk.",
  },
  {
    patterns: [
      "hash", "md5", "sha256", "sha1", "generate hash", "checksum",
    ],
    tool: "hash-generator",
    related: ["base64-encoder", "uuid-generator"],
    note: "Computes MD5 / SHA hashes locally.",
  },
  {
    patterns: [
      "regex", "test regex", "regular expression", "regex tester", "match pattern",
    ],
    tool: "regex-tester",
    related: ["diff-checker", "json-formatter"],
    note: "Test a regular expression against sample text with live matches.",
  },
  {
    patterns: [
      "diff", "compare text", "text difference", "compare code", "diff checker",
      "what changed",
    ],
    tool: "diff-checker",
    related: ["json-diff", "document-comparer"],
    note: "Highlights every difference between two blocks of text.",
  },
  {
    patterns: [
      "format sql", "beautify sql", "sql formatter", "pretty sql",
    ],
    tool: "sql-formatter",
    related: ["json-formatter", "xml-formatter"],
    note: "Formats SQL into a readable, consistent style.",
  },
  {
    patterns: [
      "url encode", "encode url", "percent encode", "escape url",
    ],
    tool: "url-encoder",
    related: ["url-decoder", "base64-encoder"],
    note: "Percent-encodes text so it's URL-safe.",
  },
  {
    patterns: [
      "cron", "crontab", "cron expression", "schedule expression", "cron generator",
    ],
    tool: "cron-generator",
    related: ["unix-timestamp-converter"],
    note: "Build and explain a cron schedule in plain English.",
  },
  {
    patterns: [
      "timestamp", "unix time", "epoch", "epoch converter", "convert timestamp",
    ],
    tool: "unix-timestamp-converter",
    related: ["cron-generator"],
    note: "Convert between Unix timestamps and human dates.",
  },
  {
    patterns: [
      "password", "generate password", "strong password", "random password",
      "password generator",
    ],
    tool: "password-generator",
    related: ["uuid-generator", "hash-generator"],
    note: "Generates strong, random passwords to your rules.",
  },

  /* ── SEO / marketing ─────────────────────────────────────────────────────── */
  {
    patterns: [
      "meta tags", "seo tags", "meta tag", "html head tags", "title and description",
      "seo meta", "generate meta tags",
    ],
    tool: "meta-tag-generator",
    related: ["open-graph-generator", "schema-generator", "google-serp-preview"],
    workflow: "create-website",
    note: "Generates title, description and all the meta a page needs.",
  },
  {
    patterns: [
      "open graph", "og tags", "og image", "social preview", "share preview",
      "facebook preview", "social card",
    ],
    tool: "open-graph-generator",
    related: ["twitter-card-generator", "open-graph-preview", "meta-tag-generator"],
    workflow: "create-website",
    note: "Builds Open Graph tags so shares look great everywhere.",
  },
  {
    patterns: [
      "twitter card", "x card", "twitter preview", "twitter meta",
    ],
    tool: "twitter-card-generator",
    related: ["open-graph-generator", "twitter-preview"],
    note: "Generates Twitter/X card markup with a live preview.",
  },
  {
    patterns: [
      "schema", "structured data", "json-ld", "json ld", "rich results",
      "schema markup", "seo schema",
    ],
    tool: "schema-generator",
    related: ["rich-results-preview", "schema-validator", "faq-schema-generator"],
    workflow: "create-website",
    note: "Generates JSON-LD structured data for rich results.",
  },
  {
    patterns: [
      "sitemap", "xml sitemap", "generate sitemap", "site map", "sitemap.xml",
    ],
    tool: "xml-sitemap-generator",
    related: ["robots-txt-generator", "sitemap-validator", "html-sitemap-generator"],
    workflow: "create-website",
    note: "Builds an XML sitemap to submit to search engines.",
  },
  {
    patterns: [
      "robots.txt", "robots txt", "crawl rules", "block crawlers", "robots file",
    ],
    tool: "robots-txt-generator",
    related: ["xml-sitemap-generator", "robots-txt-validator"],
    note: "Generates a robots.txt with the crawl rules you want.",
  },
  {
    patterns: [
      "serp preview", "google preview", "search result preview", "snippet preview",
      "how it looks in google",
    ],
    tool: "google-serp-preview",
    related: ["meta-tag-generator", "meta-title-preview"],
    note: "Preview exactly how your page appears in Google results.",
  },
  {
    patterns: [
      "utm", "utm builder", "campaign url", "tracking link", "utm tags",
      "utm parameters",
    ],
    tool: "utm-builder",
    related: ["campaign-url-builder", "qr-code-generator"],
    workflow: "make-a-qr-campaign",
    note: "Builds trackable campaign URLs with proper UTM tags.",
  },

  /* ── Video ───────────────────────────────────────────────────────────────── */
  {
    patterns: [
      "compress video", "video too big", "video too large", "shrink video",
      "reduce video size", "smaller video", "make video smaller",
    ],
    tool: "video-compressor",
    related: ["video-trimmer", "video-converter", "video-to-gif"],
    workflow: "produce-a-video-clip",
    note: "Compresses video right in the browser via FFmpeg WASM.",
  },
  {
    patterns: [
      "trim video", "cut video", "clip video", "shorten video", "video trimmer",
    ],
    tool: "video-trimmer",
    related: ["video-compressor", "video-to-gif", "video-splitter"],
    workflow: "produce-a-video-clip",
    note: "Trim a clip to the exact in/out points you want.",
  },
  {
    patterns: [
      "video to gif", "gif from video", "make a gif", "convert video to gif",
      "mp4 to gif",
    ],
    tool: "video-to-gif",
    related: ["video-trimmer", "video-compressor", "gif-to-video"],
    note: "Turns a clip into a shareable GIF.",
  },
  {
    patterns: [
      "video thumbnail", "grab a frame", "video poster", "thumbnail from video",
    ],
    tool: "video-thumbnail-generator",
    related: ["video-frame-extractor", "video-trimmer"],
    note: "Grabs a still frame to use as a thumbnail.",
  },
  {
    patterns: [
      "mute video", "remove audio from video", "silence video", "strip audio",
    ],
    tool: "video-mute",
    related: ["extract-audio", "video-compressor"],
    note: "Removes the audio track from a video.",
  },
  {
    patterns: [
      "convert video", "mov to mp4", "mkv to mp4", "webm to mp4", "avi to mp4",
      "change video format",
    ],
    tool: "video-converter",
    related: ["video-compressor", "mp4-to-webm"],
    note: "Converts between common video formats in the browser.",
  },

  /* ── Audio ───────────────────────────────────────────────────────────────── */
  {
    patterns: [
      "extract audio", "audio from video", "rip audio", "get audio from video",
      "video to audio", "pull audio",
    ],
    tool: "extract-audio",
    related: ["audio-trimmer", "mp3-converter", "audio-normalizer"],
    note: "Pulls a clean audio track out of any video.",
  },
  {
    patterns: [
      "trim audio", "cut audio", "clip audio", "shorten audio", "audio trimmer",
    ],
    tool: "audio-trimmer",
    related: ["audio-cutter", "ringtone-maker", "mp3-converter"],
    note: "Trim audio to the exact section you need.",
  },
  {
    patterns: [
      "convert to mp3", "to mp3", "mp3 converter", "make mp3", "audio to mp3",
      "wav to mp3",
    ],
    tool: "mp3-converter",
    related: ["audio-to-mp3", "audio-format-converter", "audio-trimmer"],
    note: "Converts audio to MP3 at the quality you choose.",
  },
  {
    patterns: [
      "ringtone", "make ringtone", "phone ringtone", "custom ringtone",
    ],
    tool: "ringtone-maker",
    related: ["audio-trimmer", "mp3-converter", "audio-fade"],
    note: "Cuts a clip into a phone-ready ringtone.",
  },
  {
    patterns: [
      "normalize audio", "audio too quiet", "even out volume", "loudness",
      "audio normalizer",
    ],
    tool: "audio-normalizer",
    related: ["audio-volume-booster", "audio-trimmer"],
    note: "Evens out loudness to a consistent level.",
  },
  {
    patterns: [
      "merge audio", "join audio", "combine audio", "stitch audio", "audio joiner",
    ],
    tool: "audio-merger",
    related: ["audio-joiner", "audio-trimmer"],
    note: "Joins multiple audio files into one.",
  },
  {
    patterns: [
      "remove silence", "cut silence", "trim silence", "silence remover",
    ],
    tool: "audio-silence-remover",
    related: ["audio-trimmer", "audio-normalizer"],
    note: "Automatically strips silent gaps from audio.",
  },

  /* ── Data / documents ────────────────────────────────────────────────────── */
  {
    patterns: [
      "csv to json", "csv into json", "convert csv to json",
    ],
    tool: "csv-to-json",
    related: ["json-formatter", "json-to-csv", "csv-to-excel"],
    note: "Converts CSV rows into structured JSON.",
  },
  {
    patterns: [
      "json to csv", "json into csv", "flatten json to csv", "json to spreadsheet",
    ],
    tool: "json-to-csv",
    related: ["csv-to-json", "json-formatter"],
    note: "Flattens JSON into a CSV spreadsheet.",
  },
  {
    patterns: [
      "csv to excel", "csv to xlsx", "open csv in excel",
    ],
    tool: "csv-to-excel",
    related: ["excel-to-csv", "csv-to-json", "excel-to-pdf"],
    note: "Converts a CSV into a proper Excel workbook.",
  },
  {
    patterns: [
      "excel to pdf", "xlsx to pdf", "spreadsheet to pdf",
    ],
    tool: "excel-to-pdf",
    related: ["csv-to-excel", "pdf-to-excel"],
    note: "Turns a spreadsheet into a clean PDF.",
  },
  {
    patterns: [
      "word count", "count words", "word counter", "how many words",
      "character count", "count characters",
    ],
    tool: "word-counter",
    related: ["character-counter", "reading-time-calculator"],
    note: "Counts words, characters, sentences and reading time.",
  },
  {
    patterns: [
      "compare documents", "compare two documents", "document diff",
      "what changed in document",
    ],
    tool: "document-comparer",
    related: ["diff-checker", "merge-pdf"],
    note: "Highlights differences between two documents.",
  },
  {
    patterns: [
      "slug", "url slug", "slugify", "make a slug", "slug generator",
    ],
    tool: "slug-generator",
    related: ["url-encoder", "canonical-url-generator"],
    note: "Turns any title into a clean, URL-safe slug.",
  },
];
