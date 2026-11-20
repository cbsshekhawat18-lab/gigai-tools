import type { FaqItem, HowToStep, IconName } from "@/types";

/**
 * GigAI Workspaces: the single source of truth for the workspace ROUTES.
 *
 * A "workspace" lets a user drop multiple files and chain a pipeline of tools
 * across them without leaving the page (a Figma/Canva feel, not a pile of
 * separate tool pages). Each live workspace has its own SEO page; the seven not
 * yet built are surfaced honestly as "coming soon" on the hub.
 *
 * This is server-only config data (copy + slugs). It carries NO React and NO
 * engine imports, so both the server workspace pages and the hub read from it
 * without pulling anything heavy into a bundle. The interactive islands live in
 * `modules/workspace/*` and mount via `components/workspace/workspace-mount`.
 */

/** A single "how it works" step rendered on a workspace page. */
export interface WorkspaceStepCopy extends HowToStep {
  icon: IconName;
}

/** A value-prop feature chip. */
export interface WorkspaceFeature {
  icon: IconName;
  title: string;
  description: string;
}

/** A workspace that is live now. Has an interactive island + its own SEO page. */
export interface LiveWorkspace {
  status: "live";
  /** URL slug prefix → route is `/<slug>-workspace`. Also the mount id. */
  slug:
    | "image"
    | "pdf"
    | "svg"
    | "audio"
    | "video"
    | "document"
    | "developer"
    | "qr"
    | "seo";
  /** H1 / nav / card title, e.g. "Image Workspace". */
  title: string;
  /** Short one-liner for cards + meta description seeds. */
  tagline: string;
  /** lucide icon name for the card + hero. */
  icon: IconName;
  /** SEO */
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  /** Hero */
  heroEyebrow: string;
  heroLead: string;
  /** Which operations this workspace chains (shown as chips). */
  operations: string[];
  /** "How it works" steps (also emitted as HowTo JSON-LD). */
  how: WorkspaceStepCopy[];
  /** Value props. */
  features: WorkspaceFeature[];
  /** Page FAQ (also emitted as FAQPage JSON-LD). */
  faq: FaqItem[];
  /** Slugs of standalone tools to cross-link at the bottom (registry lookups). */
  relatedToolSlugs: string[];
}

/** A workspace announced but not yet built, shown greyed-out on the hub. */
export interface ComingSoonWorkspace {
  status: "coming-soon";
  slug: string;
  title: string;
  tagline: string;
  icon: IconName;
}

/** Shared FAQ entries true for every workspace (privacy, persistence, cost). */
const COMMON_FAQ: FaqItem[] = [
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. Every operation runs entirely in your browser using the same client-side engines that power our standalone tools. Your files never leave your device. There is nothing to upload and nothing for us to store or delete.",
  },
  {
    question: "Does my work survive a page refresh?",
    answer:
      "Your pipeline, the ordered list of steps you set up, is saved locally in your browser and comes back after a refresh. The files themselves live in memory only (that is what keeps them private), so you re-add them after a reload. The workspace tells you this honestly instead of pretending nothing was lost.",
  },
  {
    question: "Is the workspace free?",
    answer:
      "Yes. Like the rest of GigAI Tools it is free to use with no sign-up, no watermarks, and no paywall on the core operations.",
  },
  {
    question: "How large a file can I process?",
    answer:
      "There is no hard server limit because everything is local, but very large files are bound by your device's memory and CPU. Big batches and high-resolution images or long PDFs will be slower. We surface progress so you always know what is happening.",
  },
];

export const LIVE_WORKSPACES: LiveWorkspace[] = [
  {
    status: "live",
    slug: "image",
    title: "Image Workspace",
    tagline: "Compress, resize, convert and upscale, all in one canvas.",
    icon: "Image",
    seoTitle: "Image Workspace, Chain Image Tools in Your Browser",
    seoDescription:
      "A browser image workspace: drop multiple images and chain compress, resize, convert and upscale in one place. 100% private, no uploads, free.",
    keywords: [
      "image workspace",
      "batch image editor",
      "compress resize convert images",
      "upscale image browser",
      "image pipeline tool",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Drop a batch of images and run a pipeline across all of them (compress, resize, convert format and upscale) without ever leaving the page or uploading a file.",
    operations: [
      "Compress",
      "Resize",
      "Convert format",
      "Upscale",
    ],
    how: [
      {
        icon: "Upload",
        title: "Add your images",
        description:
          "Drag in one image or a whole batch of PNG, JPG or WebP files. They load straight into the canvas. Nothing is uploaded.",
      },
      {
        icon: "ListPlus",
        title: "Build a pipeline",
        description:
          "Stack operations like compress → resize → convert. Tune each step's options live and reorder them however you like.",
      },
      {
        icon: "Play",
        title: "Apply to one or all",
        description:
          "Run a step on the selected image or apply the whole pipeline across every file at once, with per-image undo and redo.",
      },
      {
        icon: "Download",
        title: "Download the results",
        description:
          "Export a single image, or grab everything as a ZIP. The processed files are generated locally in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "Images are decoded and edited on a canvas in your browser. No uploads, no server copies.",
      },
      {
        icon: "Layers",
        title: "Real pipelines",
        description:
          "Chain multiple operations and apply them across a whole batch. Not one tool at a time.",
      },
      {
        icon: "Sparkles",
        title: "Best-in-class engines",
        description:
          "MozJPEG/WebP compression and Lanczos resampling, with graceful fallbacks.",
      },
      {
        icon: "Undo2",
        title: "Undo anything",
        description:
          "Every step is reversible per image with keyboard undo/redo: experiment freely.",
      },
    ],
    faq: [
      {
        question: "Which image formats can I use?",
        answer:
          "You can add PNG, JPG and WebP images and convert freely between them.",
      },
      {
        question: "Can I apply the same edits to many images at once?",
        answer:
          "Yes. That is the point. Build your pipeline once, then Apply to all to run it across every image you have loaded, then download the batch as a ZIP.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "image-compressor",
      "image-resizer",
      "webp-converter",
      "image-upscaler",
      "crop-image",
    ],
  },
  {
    status: "live",
    slug: "pdf",
    title: "PDF Workspace",
    tagline: "Merge, split, reorder, rotate, delete pages and compress: one document.",
    icon: "FileText",
    seoTitle: "PDF Workspace: Edit & Assemble PDFs in Your Browser",
    seoDescription:
      "A browser PDF workspace: merge, split, reorder, rotate, delete pages and compress, visually, page by page, without uploads. 100% private and free.",
    keywords: [
      "pdf workspace",
      "edit pdf online",
      "merge split pdf browser",
      "reorder pdf pages",
      "rotate delete pdf pages",
      "compress pdf private",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Assemble and edit a PDF page by page. Merge files together, reorder and rotate pages, delete the ones you don't need and compress the result: entirely in your browser.",
    operations: ["Merge", "Split", "Reorder", "Rotate", "Delete pages", "Compress"],
    how: [
      {
        icon: "Upload",
        title: "Add your PDFs",
        description:
          "Drop in one or several PDFs. They open into a live page grid: read locally, never uploaded.",
      },
      {
        icon: "LayoutGrid",
        title: "Work page by page",
        description:
          "Merge files, then reorder, rotate or delete individual pages visually with instant thumbnails.",
      },
      {
        icon: "WandSparkles",
        title: "Refine the document",
        description:
          "Split out ranges or compress the whole file, with full undo/redo as you go.",
      },
      {
        icon: "Download",
        title: "Export the PDF",
        description:
          "Download the finished document (or split outputs) generated entirely in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Never uploaded",
        description:
          "PDFs are parsed and rewritten with pdf-lib and pdfjs in your browser. Your documents stay on your device.",
      },
      {
        icon: "LayoutGrid",
        title: "Visual page editing",
        description:
          "See every page as a thumbnail and merge, reorder, rotate or delete by clicking. No page-number guessing.",
      },
      {
        icon: "Combine",
        title: "One continuous flow",
        description:
          "Merge, edit and compress the same document without hopping between separate single-purpose tools.",
      },
      {
        icon: "Undo2",
        title: "Full history",
        description:
          "Every edit is undoable, so you can assemble complex documents with confidence.",
      },
    ],
    faq: [
      {
        question: "Can I combine several PDFs into one?",
        answer:
          "Yes. Add multiple PDFs and merge them into a single document, then reorder or rotate the combined pages exactly how you want before exporting.",
      },
      {
        question: "Can I remove or reorder specific pages?",
        answer:
          "Yes. The workspace shows every page as a thumbnail, so you can select pages to delete, drag them into a new order, or rotate individual pages visually.",
      },
      {
        question: "Does compressing change the layout?",
        answer:
          "No. Compression re-encodes page imagery at a lower quality while preserving the original page dimensions, and it never hands back a file larger than the one you started with.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "merge-pdf",
      "split-pdf",
      "rotate-pdf",
      "delete-pdf-pages",
      "reorder-pdf-pages",
      "compress-pdf",
    ],
  },
  {
    status: "live",
    slug: "svg",
    title: "SVG Workspace",
    tagline: "Optimize, minify, rasterize and inline vectors, all in one canvas.",
    icon: "PenTool",
    seoTitle: "SVG Workspace, Optimize & Convert SVGs in Your Browser",
    seoDescription:
      "A browser SVG workspace: drop vectors and chain optimize, minify, prettify, convert to PNG/JPG and inline as a data-URI in one place. 100% private, no uploads, free.",
    keywords: [
      "svg workspace",
      "optimize svg online",
      "minify svg browser",
      "svg to png converter",
      "svg to data uri",
      "batch svg optimizer",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Drop a batch of SVGs and run a pipeline across all of them (optimize, minify or prettify the markup, rasterize to PNG/JPG and inline as a data-URI) without ever leaving the page or uploading a file.",
    operations: [
      "Optimize",
      "Minify / Prettify",
      "Convert to PNG / JPG",
      "Convert to data-URI",
    ],
    how: [
      {
        icon: "Upload",
        title: "Add your SVGs",
        description:
          "Drag in one SVG or a whole batch. Each vector loads straight into the canvas with a live preview: nothing is uploaded.",
      },
      {
        icon: "ListPlus",
        title: "Build a pipeline",
        description:
          "Stack operations like optimize → minify → rasterize. Tune each step's options live and reorder them however you like.",
      },
      {
        icon: "Play",
        title: "Apply to one or all",
        description:
          "Run a step on the selected SVG or apply the whole pipeline across every file at once, with per-file undo and redo.",
      },
      {
        icon: "Download",
        title: "Download the results",
        description:
          "Export a single optimized SVG, a rasterized PNG, or grab everything as a ZIP: all generated locally in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "SVGs are parsed and rewritten in your browser with SVGO. No uploads, no server copies of your artwork.",
      },
      {
        icon: "Minimize2",
        title: "Real optimization",
        description:
          "SVGO plugins strip metadata, collapse groups and round paths, honest byte savings, not a wrapper.",
      },
      {
        icon: "Image",
        title: "Rasterize on demand",
        description:
          "Render any vector to a crisp PNG or JPG at your chosen scale, straight from the same canvas.",
      },
      {
        icon: "Code2",
        title: "Inline-ready output",
        description:
          "Emit URL-optimized or Base64 data-URIs to paste directly into CSS or HTML.",
      },
    ],
    faq: [
      {
        question: "What does the optimize step actually do?",
        answer:
          "It runs SVGO in your browser (the same engine used by build tools) to remove editor metadata, collapse redundant groups, round path coordinates and drop unused attributes, shrinking the file without changing how it renders.",
      },
      {
        question: "Can I convert an SVG to a PNG or JPG?",
        answer:
          "Yes. The rasterize step draws the vector onto a canvas at a scale you choose and exports a PNG or JPG, so you get a pixel image from your vector without any external service.",
      },
      {
        question: "What is the data-URI output for?",
        answer:
          "It encodes the SVG as an inline string you can paste straight into CSS (as a background) or HTML, removing an extra network request. You can choose a compact URL-optimized encoding or Base64.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "svg-optimizer",
      "svg-minifier",
      "svg-prettifier",
      "svg-to-png",
      "svg-to-css",
      "svg-viewer",
    ],
  },
  {
    status: "live",
    slug: "audio",
    title: "Audio Workspace",
    tagline: "Convert, trim, normalize, adjust volume and fade, all in one canvas.",
    icon: "AudioLines",
    seoTitle: "Audio Workspace, Convert & Edit Audio in Your Browser",
    seoDescription:
      "A browser audio workspace: drop tracks and chain convert, trim, normalize, volume and fade in one place. Runs on ffmpeg.wasm locally, private, no uploads, free.",
    keywords: [
      "audio workspace",
      "convert audio online",
      "trim audio browser",
      "normalize audio",
      "batch audio converter",
      "audio pipeline tool",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Drop your tracks and run a pipeline across all of them (convert format, trim, normalize loudness, adjust volume and add fades) entirely in your browser, with no uploads.",
    operations: [
      "Convert format",
      "Trim",
      "Normalize",
      "Change volume",
      "Fade in / out",
    ],
    how: [
      {
        icon: "Upload",
        title: "Add your audio",
        description:
          "Drag in one track or a batch of MP3, WAV, OGG, FLAC, M4A or AAC files. They load with an inline player. Nothing is uploaded.",
      },
      {
        icon: "ListPlus",
        title: "Build a pipeline",
        description:
          "Stack operations like trim → normalize → convert. Tune each step's options live and reorder them however you like.",
      },
      {
        icon: "Play",
        title: "Apply to one or all",
        description:
          "Run a step on the selected track or apply the whole pipeline across every file at once, with per-file undo and redo.",
      },
      {
        icon: "Download",
        title: "Download the results",
        description:
          "Export a single processed track, or grab the whole batch as a ZIP, all encoded locally in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "Audio is decoded and re-encoded in your browser with ffmpeg.wasm. No uploads, no server copies.",
      },
      {
        icon: "Layers",
        title: "Real pipelines",
        description:
          "Chain multiple operations and apply them across a whole batch. Not one tool at a time.",
      },
      {
        icon: "Gauge",
        title: "Honest processing",
        description:
          "The ffmpeg WASM core loads once on first use, so the very first operation is slower. After that it stays cached.",
      },
      {
        icon: "Undo2",
        title: "Undo anything",
        description:
          "Every step is reversible per track with keyboard undo/redo: experiment freely.",
      },
    ],
    faq: [
      {
        question: "Which audio formats are supported?",
        answer:
          "You can add and convert between MP3, WAV, OGG, FLAC, M4A and AAC. The convert step lets you also choose a target bitrate for compressed formats.",
      },
      {
        question: "Why is the first operation slower?",
        answer:
          "Audio is processed with ffmpeg compiled to WebAssembly, which loads a one-time core the first time you run a step. It downloads once, is cached, and every operation after that is fast, all still 100% local.",
      },
      {
        question: "What does normalize do?",
        answer:
          "Normalize raises or lowers the whole track to a consistent level. You can pick peak normalization (to a target peak) or RMS/loudness normalization for a more even perceived volume across tracks.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "audio-format-converter",
      "audio-trimmer",
      "audio-normalizer",
      "mp3-converter",
      "audio-volume-booster",
      "audio-fade",
    ],
  },
  {
    status: "live",
    slug: "video",
    title: "Video Workspace",
    tagline: "Convert, trim, compress, mute and extract audio, all in one canvas.",
    icon: "Video",
    seoTitle: "Video Workspace, Convert & Edit Video in Your Browser",
    seoDescription:
      "A browser video workspace: drop clips and chain convert, trim, compress, mute and extract audio in one place. Runs on ffmpeg.wasm locally: private, no uploads, free.",
    keywords: [
      "video workspace",
      "convert video online",
      "trim video browser",
      "compress video",
      "extract audio from video",
      "video pipeline tool",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Drop your clips and run a pipeline across all of them (convert format, trim, compress, mute and extract the audio track) entirely in your browser, with no uploads.",
    operations: ["Convert format", "Trim", "Compress", "Mute", "Extract audio"],
    how: [
      {
        icon: "Upload",
        title: "Add your clips",
        description:
          "Drag in one clip or a batch of MP4 or WebM files. Each loads with an inline video preview. Nothing is uploaded.",
      },
      {
        icon: "ListPlus",
        title: "Build a pipeline",
        description:
          "Stack operations like trim → compress → convert. Tune each step's options live and reorder them however you like.",
      },
      {
        icon: "Play",
        title: "Apply to one or all",
        description:
          "Run a step on the selected clip or apply the whole pipeline across every file at once, with per-clip undo and redo.",
      },
      {
        icon: "Download",
        title: "Download the results",
        description:
          "Export a single processed clip, or grab the whole batch as a ZIP, all encoded locally in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "Video is decoded and re-encoded in your browser with ffmpeg.wasm. No uploads, no server copies.",
      },
      {
        icon: "Layers",
        title: "Real pipelines",
        description:
          "Chain multiple operations and apply them across a whole batch. Not one clip at a time.",
      },
      {
        icon: "Gauge",
        title: "Honest processing",
        description:
          "The ffmpeg WASM core loads once on first use and video is memory-bound, so long or high-resolution clips are slower.",
      },
      {
        icon: "Undo2",
        title: "Undo anything",
        description:
          "Every step is reversible per clip with keyboard undo/redo, experiment freely.",
      },
    ],
    faq: [
      {
        question: "Which video formats are supported?",
        answer:
          "The convert step targets MP4 (H.264) and WebM (VP9), and you can add clips in those container formats. Extract-audio can output MP3, WAV, AAC, M4A or OGG.",
      },
      {
        question: "Why is video processing slow for large files?",
        answer:
          "Everything runs locally with ffmpeg compiled to WebAssembly. A one-time core loads on your first operation, and because encoding is bound by your device's CPU and memory, long or high-resolution clips take longer. We show progress so you always know what's happening.",
      },
      {
        question: "Can I pull just the audio out of a video?",
        answer:
          "Yes. The extract-audio step decodes the clip and exports only its audio track in the format you choose, so you can grab the soundtrack without any external service.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "video-converter",
      "video-trimmer",
      "video-compressor",
      "video-mute",
      "extract-audio",
      "video-to-gif",
    ],
  },
  {
    status: "live",
    slug: "document",
    title: "Document Workspace",
    tagline: "Convert CSV, JSON, Excel and text, clean and reshape in one canvas.",
    icon: "FileType",
    seoTitle: "Document Workspace, Convert CSV, JSON & Excel in Your Browser",
    seoDescription:
      "A browser document workspace: drop CSV, JSON, Excel or text and chain conversions (CSV↔JSON, CSV↔Excel, to plain text, format JSON) in one place. Private, no uploads, free.",
    keywords: [
      "document workspace",
      "csv to json converter",
      "json to csv browser",
      "csv to excel online",
      "excel to csv",
      "format json online",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Drop your data files and run a pipeline across all of them: convert CSV to JSON, JSON to CSV, CSV to Excel and back, flatten to plain text and format JSON, entirely in your browser, with no uploads.",
    operations: [
      "CSV → JSON",
      "JSON → CSV",
      "CSV → Excel",
      "Excel → CSV",
      "To Plain Text",
      "Format JSON",
    ],
    how: [
      {
        icon: "Upload",
        title: "Add your files",
        description:
          "Drag in one file or a batch of CSV, JSON, Excel or text documents. They load straight into the workspace. Nothing is uploaded.",
      },
      {
        icon: "ListPlus",
        title: "Build a pipeline",
        description:
          "Stack conversions like CSV → JSON → format. Tune each step's options live and reorder them however you like.",
      },
      {
        icon: "Play",
        title: "Apply to one or all",
        description:
          "Run a step on the selected file or apply the whole pipeline across every document at once, with per-file undo and redo.",
      },
      {
        icon: "Download",
        title: "Download the results",
        description:
          "Export a single converted file, or grab the whole batch as a ZIP: all generated locally in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "CSV, JSON and spreadsheets are parsed and rewritten in your browser. No uploads, no server copies of your data.",
      },
      {
        icon: "ArrowRightLeft",
        title: "Round-trip conversions",
        description:
          "Move between CSV, JSON and Excel in either direction, choosing delimiters and object vs. array shapes.",
      },
      {
        icon: "Braces",
        title: "Clean, valid output",
        description:
          "Format JSON pretty or minified, and flatten spreadsheets to plain text, honest, standards-based parsing.",
      },
      {
        icon: "Undo2",
        title: "Undo anything",
        description:
          "Every step is reversible per file with keyboard undo/redo, experiment freely.",
      },
    ],
    faq: [
      {
        question: "Which conversions are supported?",
        answer:
          "You can convert CSV to JSON and back, CSV to Excel and Excel to CSV, flatten a file to plain text, and pretty-print or minify JSON. You choose delimiters and whether JSON rows become objects (using the header) or arrays.",
      },
      {
        question: "How are Excel files handled?",
        answer:
          "Spreadsheets are read and written entirely in your browser with the xlsx engine, so an.xlsx file is parsed locally into rows you can convert: nothing is sent to a server.",
      },
      {
        question: "Will conversion preserve my column headers?",
        answer:
          "Yes. When converting CSV to JSON you can use the header row as object keys, and JSON to CSV writes the keys back out as a header, so round-tripping keeps your columns intact.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "csv-to-json",
      "json-to-csv",
      "csv-to-excel",
      "excel-to-csv",
      "pdf-to-txt",
      "document-viewer",
    ],
  },
  {
    status: "live",
    slug: "developer",
    title: "Developer Workspace",
    tagline: "Format, minify, convert, encode and hash code: one scratchpad.",
    icon: "Braces",
    seoTitle: "Developer Workspace, Format, Convert & Encode Code in Your Browser",
    seoDescription:
      "A browser developer workspace: paste or drop code and format, minify, convert JSON↔YAML, generate TS types, encode Base64/URL and hash: all in one scratchpad. Private, no uploads, free.",
    keywords: [
      "developer workspace",
      "format json yaml xml",
      "minify js css html",
      "json to typescript",
      "base64 url encode",
      "hash generator browser",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Paste or drop your code and run it through a chain of developer utilities, format and minify, convert JSON to YAML, infer TypeScript types, encode Base64 or URL and hash, entirely in your browser, with no uploads.",
    operations: [
      "Format / Beautify",
      "Minify",
      "JSON ↔ YAML",
      "JSON → TS types",
      "Encode / Decode",
      "Hash",
      "Escape / Unescape",
    ],
    how: [
      {
        icon: "Upload",
        title: "Add your code",
        description:
          "Paste a snippet or drop a JSON, YAML, XML, JS, CSS or HTML file. It loads into the scratchpad. Nothing is uploaded.",
      },
      {
        icon: "ListPlus",
        title: "Pick an operation",
        description:
          "Choose format, minify, convert, encode, hash or escape. The workspace detects the language and applies the right engine.",
      },
      {
        icon: "Play",
        title: "Run and refine",
        description:
          "Transform the buffer, review the result inline, and keep chaining operations until the output is exactly what you need.",
      },
      {
        icon: "Download",
        title: "Copy or download",
        description:
          "Copy the result to your clipboard or download it as a file, all generated locally in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "Prettier, terser, csso and the hashing run in your browser. No code is uploaded or logged anywhere.",
      },
      {
        icon: "Sparkles",
        title: "Best-in-class engines",
        description:
          "Real Prettier formatting, terser/csso minification and standards-based JSON, YAML and XML handling.",
      },
      {
        icon: "ArrowRightLeft",
        title: "Convert & infer",
        description:
          "Flip JSON to YAML and back, or infer clean TypeScript interfaces straight from a JSON payload.",
      },
      {
        icon: "Hash",
        title: "Encode & hash",
        description:
          "Base64/URL encode and decode, escape string literals, and hash with MD5 or SHA-1/256/384/512.",
      },
    ],
    faq: [
      {
        question: "Which languages can it format and minify?",
        answer:
          "Formatting uses Prettier for JSON, JS, CSS and HTML plus a dedicated XML pretty-printer, and minification uses terser for JS, csso for CSS, and native minifiers for JSON and HTML. The workspace picks the engine from the file type or pasted content.",
      },
      {
        question: "Can it convert JSON to TypeScript types?",
        answer:
          "Yes. Paste a JSON object and the JSON → TS types step infers a set of TypeScript interfaces describing its shape, which you can copy straight into your codebase.",
      },
      {
        question: "Which hashes are supported?",
        answer:
          "The hash step computes MD5 and SHA-1, SHA-256, SHA-384 and SHA-512 digests of your input, all in the browser using the Web Crypto API where available.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "json-formatter",
      "yaml-formatter",
      "xml-formatter",
      "json-to-typescript",
      "base64-encoder",
      "hash-generator",
    ],
  },
  {
    status: "live",
    slug: "qr",
    title: "QR & Barcode Workspace",
    tagline: "Generate, style, add logos and batch-export QR codes, one canvas.",
    icon: "QrCode",
    seoTitle: "QR Code Workspace: Generate & Style QR Codes in Your Browser",
    seoDescription:
      "A browser QR workspace: create styled QR codes, drop in a logo, batch-generate from a list and export PNG or SVG, all in one place. Private, no uploads, free.",
    keywords: [
      "qr code workspace",
      "styled qr code generator",
      "qr code with logo",
      "bulk qr code generator",
      "batch qr export",
      "wifi vcard qr code",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Design QR codes on one canvas, style the dots and eyes, drop in a logo, batch-generate a whole list at once and export crisp PNG or SVG, entirely in your browser, with no uploads.",
    operations: [
      "Generate",
      "Style dots & eyes",
      "Add a logo",
      "Batch generate",
      "Export PNG / SVG",
    ],
    how: [
      {
        icon: "Type",
        title: "Enter your content",
        description:
          "Type a URL, text, Wi-Fi credentials or a vCard, or paste a whole list to batch-generate many codes at once. Nothing is uploaded.",
      },
      {
        icon: "Palette",
        title: "Style the code",
        description:
          "Choose dot and eye shapes, colors and an error-correction level, and drop in a logo for branded codes.",
      },
      {
        icon: "Play",
        title: "Generate & preview",
        description:
          "See every code render live and scannable, with a grid preview when you batch-generate from a list.",
      },
      {
        icon: "Download",
        title: "Export PNG or SVG",
        description:
          "Download a single code or grab the whole batch as a ZIP: all rendered locally in your browser.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "QR codes are rendered in your browser with qr-code-styling. No content is uploaded or stored.",
      },
      {
        icon: "Palette",
        title: "Fully styled",
        description:
          "Square, rounded, dots or classy modules, custom eye frames and colors. Not a plain black grid.",
      },
      {
        icon: "Layers",
        title: "Batch at once",
        description:
          "Paste a list and generate a whole set of codes together, then export them all as a ZIP.",
      },
      {
        icon: "Image",
        title: "Logo & vector export",
        description:
          "Embed a centre logo with high error correction and export as a crisp PNG or scalable SVG.",
      },
    ],
    faq: [
      {
        question: "Can I add a logo to my QR code?",
        answer:
          "Yes. Drop an image in as the centre logo and raise the error-correction level to H (~30% recovery) so the code still scans reliably with the logo in place.",
      },
      {
        question: "Can I generate many QR codes at once?",
        answer:
          "Yes. Paste a list of URLs or values and the workspace batch-generates a code for each, shows them in a preview grid, and lets you download the whole set as a ZIP.",
      },
      {
        question: "Which formats can I export?",
        answer:
          "You can export each QR code as a raster PNG or as a scalable SVG, so you get pixel images for the web and vectors for print, all rendered locally.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "qr-code-generator",
      "qr-code-with-logo",
      "bulk-qr-code-generator",
      "vcard-qr-code-generator",
      "wifi-qr-code-generator",
      "qr-code-reader",
    ],
  },
  {
    status: "live",
    slug: "seo",
    title: "SEO Workspace",
    tagline: "Draft meta tags, Open Graph and schema side by side, one canvas.",
    icon: "Search",
    seoTitle: "SEO Workspace, Draft Meta Tags, OG & Schema in Your Browser",
    seoDescription:
      "A browser SEO workspace: enter your page facts once and generate meta tags, Open Graph, Twitter cards and JSON-LD schema with a live SERP preview. Private, no uploads, free.",
    keywords: [
      "seo workspace",
      "meta tag generator",
      "open graph generator",
      "json-ld schema generator",
      "serp preview tool",
      "meta description length",
    ],
    heroEyebrow: "GigAI Workspace",
    heroLead:
      "Enter your page facts once and generate everything a page needs to rank and share (meta tags, Open Graph and Twitter cards, JSON-LD schema) with a live SERP and social preview, entirely in your browser.",
    operations: [
      "Meta tags",
      "Open Graph",
      "Twitter card",
      "JSON-LD schema",
      "SERP preview",
    ],
    how: [
      {
        icon: "Type",
        title: "Enter your page facts",
        description:
          "Fill in the title, description, URL and image once, or start from a template. Nothing is uploaded.",
      },
      {
        icon: "Gauge",
        title: "Check length & scores",
        description:
          "See live truncation warnings and field scores so your title and description fit the SERP without being cut off.",
      },
      {
        icon: "Eye",
        title: "Preview everywhere",
        description:
          "Watch the Google result and social share cards update live as you type, so you know exactly how the page will look.",
      },
      {
        icon: "Download",
        title: "Copy the markup",
        description:
          "Copy or download the generated meta tags, Open Graph and JSON-LD, ready to paste into your page head.",
      },
    ],
    features: [
      {
        icon: "ShieldCheck",
        title: "Private by design",
        description:
          "Everything is generated in your browser from the facts you type. No page content is uploaded or stored.",
      },
      {
        icon: "Code2",
        title: "Complete markup",
        description:
          "Meta tags, Open Graph, Twitter cards and valid JSON-LD schema from a single set of inputs.",
      },
      {
        icon: "Gauge",
        title: "Length-aware",
        description:
          "Live truncation checks and field scores keep your title and description inside search-result limits.",
      },
      {
        icon: "Eye",
        title: "Live previews",
        description:
          "A Google SERP preview and social card show how your page renders before you ship it.",
      },
    ],
    faq: [
      {
        question: "What does the SEO workspace generate?",
        answer:
          "From one set of page facts it produces the standard meta tags, Open Graph and Twitter card markup, and JSON-LD structured data, alongside a live Google SERP preview and social share preview.",
      },
      {
        question: "How does it help with title and description length?",
        answer:
          "As you type it flags when your title or meta description is likely to be truncated in search results and scores each field, so you can trim them to a safe length before publishing.",
      },
      {
        question: "Can I copy the markup straight into my site?",
        answer:
          "Yes. Each generated block (meta tags, Open Graph and JSON-LD) can be copied or downloaded so you can paste it directly into your page's head.",
      },
      ...COMMON_FAQ,
    ],
    relatedToolSlugs: [
      "meta-tag-generator",
      "open-graph-generator",
      "schema-generator",
      "google-serp-preview",
      "meta-description-generator",
      "robots-txt-generator",
    ],
  },
];

/**
 * The workspaces we've announced but not yet shipped: greyed out on the hub.
 * All nine workspaces are now live, so this list is intentionally empty (the hub
 * guards the empty case and drops the "Coming soon" section entirely).
 */
export const COMING_SOON_WORKSPACES: ComingSoonWorkspace[] = [];

/** Look up a live workspace by its slug (used by the route pages). */
export function getWorkspaceBySlug(
  slug: string,
): LiveWorkspace | undefined {
  return LIVE_WORKSPACES.find((w) => w.slug === slug);
}
