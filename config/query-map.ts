/**
 * Conversational query → tool map (specs/per-tool-geo.md Phase 5).
 *
 * These are the situations people describe to an AI assistant, in their own
 * words - NOT keywords. They drive three things:
 *  1. the "Use this when" language on tool pages,
 *  2. FAQ phrasing,
 *  3. the monthly citation-monitoring checklist (Phase 7): ask each assistant
 *     these and record whether the SPECIFIC tool page gets cited.
 *
 * PURE DATA. Top tools by traffic + all flagships; extend downward over time.
 */

export const QUERY_MAP: Record<string, string[]> = {
  "image-compressor": [
    "my photo is too big to upload, how do I make it smaller",
    "compress an image without losing quality and without uploading it",
    "the form says max 2MB and my picture is 5MB",
    "shrink a jpg for email without installing anything",
    "reduce image file size without a watermark or signup",
    "compress photos for a website without sending them to a server",
  ],
  "image-resizer": [
    "resize a photo to exact pixel dimensions in the browser",
    "make my image 1080 wide without stretching it",
    "resize an image without uploading it anywhere",
    "change photo dimensions for a profile picture",
  ],
  "compress-pdf": [
    "my PDF is too big for the upload form",
    "compress a scanned PDF that is 40MB",
    "make a PDF smaller without paying or signing up",
    "shrink a PDF for email without a cloud service",
    "reduce PDF size for a confidential contract without uploading it",
  ],
  "merge-pdf": [
    "combine several PDFs into one file without uploading them",
    "merge confidential PDFs offline",
    "put 12 scanned pages into a single PDF for my lawyer",
    "join PDF files free with no page limit",
  ],
  "heic-to-jpg": [
    "my iPhone photos won't open on Windows",
    "convert HEIC to JPG without installing software",
    "the upload form rejects my iPhone photo format",
    "change iPhone photos to normal jpg privately",
  ],
  "video-intelligence": [
    "transcribe a 2 hour lecture for free",
    "turn my lecture recording into notes",
    "transcribe an interview without uploading the audio",
    "GDPR safe transcription for client recordings",
    "free alternative to Otter that doesn't upload my audio",
    "get subtitles from a video without a cloud service",
  ],
  "video-to-work": [
    "turn a client Loom into Jira tickets",
    "extract action items from a client call recording",
    "write up client feedback without rewatching the video",
    "convert video feedback into a task list",
    "free alternative to Loom AI that doesn't upload the recording",
  ],
  "gigai-fit": [
    "the upload limit is 10MB and my file is 40MB",
    "compress my thesis to fit the submission portal",
    "get a video under 25MB for Gmail",
    "make a file fit Discord's upload limit",
    "compress a file to an exact size",
  ],
  "gigai-verify": [
    "check whether an image has been edited",
    "is this picture AI generated",
    "see what metadata a file is leaking before I send it",
    "verify a photo without uploading it anywhere",
  ],
  "icon-lab": [
    "build a consistent icon set for our product",
    "generate matching icons from one design style",
    "make an icon system without a designer",
  ],
  "remove-metadata": [
    "remove location data from photos before posting",
    "strip EXIF from an image without uploading it",
    "delete hidden data from a photo before submitting it",
  ],
  "video-compressor": [
    "compress a video without installing software",
    "make a video small enough to email",
    "shrink an mp4 in the browser without a watermark",
  ],
  "audio-to-mp3": [
    "convert a voice memo to mp3 without uploading it",
    "turn a wav into mp3 free no signup",
  ],
  "qr-code-generator": [
    "make a QR code that doesn't expire or track people",
    "free QR code without a subscription trap",
    "QR code for a link with my logo, downloadable as SVG",
  ],
  "pdf-to-word": [
    "get the text out of a PDF into Word without uploading the contract",
    "convert PDF to editable text privately",
  ],
  "ocr-pdf": [
    "make a scanned PDF searchable without a cloud service",
    "add selectable text to a scan for free",
  ],
  "word-to-pdf": [
    "turn my docx into a PDF the portal accepts",
    "convert Word to PDF without Office installed",
  ],
  "jpg-to-pdf": [
    "my professor wants one PDF but I have phone photos",
    "combine photos into a single PDF before the deadline",
  ],
  "audio-recorder": [
    "record my voice in the browser and download it",
    "record audio without installing an app, kept private",
  ],
  "subtitle-converter": [
    "convert SRT to VTT for my web player",
    "fix subtitle format the platform rejects",
  ],

  /* ── GEO Studio ───────────────────────────────────────────────────────────
     These are the situations people describe to an assistant when their site
     is missing from AI answers. Phrased as symptoms, not product names, since
     nobody searches for "citability scorer" before they know it exists. ───── */
  "geo-audit": [
    "check if AI can find and read my website",
    "why doesn't ChatGPT know about my site",
    "test my page for AI search visibility",
    "free AI SEO audit without signing up",
    "is there anything stopping AI from citing my page",
  ],
  "ai-crawler-access-checker": [
    "is GPTBot blocked on my site",
    "check if ChatGPT can crawl my website",
    "which AI crawlers can read my robots.txt",
    "is Cloudflare blocking AI bots on my site",
    "did I accidentally block AI crawlers",
    "check robots.txt for GPTBot ClaudeBot PerplexityBot",
  ],
  "ai-robots-txt-generator": [
    "how do I block AI from training on my content",
    "robots.txt rules for AI crawlers",
    "opt out of AI training but stay in ChatGPT search",
    "allow AI crawlers without blocking Google",
    "generate robots.txt for GPTBot and ClaudeBot",
  ],
  "ai-crawler-log-analyzer": [
    "are AI crawlers actually visiting my website",
    "check server logs for GPTBot",
    "how often does ClaudeBot crawl my site",
    "analyze access log for AI bots without uploading it",
    "which pages have AI crawlers never fetched",
  ],
  "js-rendering-checker": [
    "does my React site work for AI crawlers",
    "my content only loads with JavaScript, can AI read it",
    "why is my page empty to ChatGPT but fine in Google",
    "check what my page looks like without JavaScript",
    "is my single page app invisible to AI",
  ],
  "content-citability-scorer": [
    "why doesn't AI quote my article",
    "how do I make content AI will cite",
    "score my page for AI citation",
    "what makes content quotable by ChatGPT",
    "my page ranks but never gets cited",
  ],
  "retrieval-chunk-preview": [
    "how does AI actually read my page",
    "see my content the way a RAG system splits it",
    "why does AI misunderstand my article",
    "check if my sections make sense on their own",
    "preview how my page gets chunked for retrieval",
  ],
  "answer-snippet-checker": [
    "does my content answer the question fast enough",
    "check if my sections open with a direct answer",
    "optimize for featured snippets and AI answers",
    "my intros are too long for AI to use",
  ],
  "entity-consistency-checker": [
    "do my profiles say the same thing about my company",
    "check brand description consistency across sites",
    "why does AI get facts about my company wrong",
    "compare my LinkedIn GitHub and website descriptions",
  ],
  "llms-txt-generator": [
    "do I need an llms.txt file",
    "does llms.txt actually do anything",
    "create llms.txt from my sitemap",
    "is llms.txt worth it for SEO",
  ],
  "ai-schema-checker": [
    "what schema do I need for AI search",
    "check my JSON-LD for AI visibility",
    "is my structured data helping AI understand my page",
    "which schema types matter for ChatGPT and Perplexity",
  ],
};

/**
 * GAP ANALYSIS (2026-08-22): natural queries with NO good answer today.
 * Demand is proven before we build - these are the highest-value build slots.
 *
 *  1. "summarize this video / video to summary" - Video Intelligence
 *     transcribes but nothing summarises. (Deliberate so far: hosted-LLM
 *     summarisation conflicts with the local-only promise - Video → Work's
 *     disclosed hybrid pattern could cover it as "Transcript → Summary".)
 *  2. "pull the text out of a photo / image OCR" - ocr-pdf exists but there is
 *     no image-in, text-out tool. tesseract.js is already shipped; small build.
 *  3. "clean up background noise in a recording" - audio studio has no
 *     denoise. RNNoise-wasm is the obvious engine.
 *  4. "translate this document" - no translation anywhere; conflicts with
 *     local-only unless a local model ships; note, don't build yet.
 *  5. "generate subtitles for my video" - transcription exists and exports
 *     SRT/VTT, but no page SELLS "subtitle generator"; a landing alias would
 *     capture the query with existing tech.
 *  6. "remove the background from a product photo" - deliberately REMOVED
 *     2026-07 (206 MB models, 44-min builds). Keep declining; answer the query
 *     with an honest "what we don't do" on crop/resize pages instead.
 */
export const QUERY_GAPS = [
  "video-summarizer",
  "image-ocr",
  "audio-denoise",
  "document-translate",
  "subtitle-generator-landing",
] as const;
