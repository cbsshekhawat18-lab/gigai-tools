/**
 * Sibling-tool disambiguation. The on-page answer to "we have two or three
 * tools that sound alike; which one do I need?". Rendered by
 * components/tool/sibling-tools.tsx on each listed tool's page.
 *
 * WHY: the keyword de-cannibalization sweep gave every near-duplicate pair
 * distinct search keywords; this block does the same for USERS (and adds
 * honest cross-links that reinforce each page's distinct intent). Every
 * `when` line must stay truthful to the sibling tool's real capability.
 *
 * PURE DATA. Titles/icons are resolved from the registry server-side.
 */

export interface SiblingChoice {
  /** Live tool slug. */
  slug: string;
  /** Honest one-line "use this when…", the differentiator. */
  when: string;
}

export const TOOL_SIBLINGS: Record<string, SiblingChoice[]> = {
  /* ── Transcript route: recognise speech vs re-time captions you already have ── */
  "video-intelligence": [
    { slug: "video-to-work", when: "You don't want to read the recording at all \u2014 you want the bugs, changes and questions in it pulled out as tickets." },
    { slug: "subtitle-converter", when: "You already have captions and just need SRT\u2194VTT conversion or a timing shift \u2014 no model download." },
    { slug: "extract-audio", when: "You only want the audio track as a file, not a transcript of it." },
  ],

  /* ── The flagship's real near-neighbour: transcript-as-the-product vs
       transcript-as-an-input. Both transcribe; only one produces work items. ── */
  "video-to-work": [
    { slug: "video-intelligence", when: "The transcript IS what you want \u2014 to read, edit, label speakers and export as text or captions." },
    { slug: "subtitle-converter", when: "You only need caption files converted or re-timed, not a recording understood." },
  ],
  "subtitle-converter": [
    { slug: "video-intelligence", when: "You have no captions yet and need speech turned into a transcript, in your browser." },
  ],

  /* ── Vector \u2192 PNG: which source format you actually hold ─────────────────── */
  "eps-to-png": [
    { slug: "svg-to-png", when: "Your artwork is an SVG \u2014 rendered natively, at any size, with no PDF payload needed." },
    { slug: "png-to-svg", when: "You have the opposite problem: a bitmap you want traced into real vector paths." },
  ],
  "svg-to-png": [
    { slug: "eps-to-png", when: "Your file is an Illustrator .eps or .ai rather than an SVG." },
  ],

  /* ── QR trio: same family, three genuinely different entry points ────────── */
  "qr-code-scanner": [
    { slug: "qr-code-reader", when: "You have the code as a saved image or screenshot rather than in front of your camera." },
    { slug: "qr-code-decoder", when: "You want the exact raw payload and a breakdown of the scheme inside (URL, Wi-Fi, vCard…)." },
  ],
  "qr-code-reader": [
    { slug: "qr-code-scanner", when: "The code is on a physical surface and you want to point your camera at it live." },
    { slug: "qr-code-decoder", when: "You need the byte-for-byte string the code encodes, not just the opened result." },
  ],
  "qr-code-decoder": [
    { slug: "qr-code-scanner", when: "You just want to scan a code live with your camera and follow it." },
    { slug: "qr-code-reader", when: "You just want to read a code from a photo and open what's inside." },
  ],

  /* ── PDF passwords: add / remove / both ───────────────────────────────────── */
  "pdf-password-protect": [
    { slug: "unlock-pdf", when: "You want to REMOVE a password you already know, not add one." },
  ],
  "unlock-pdf": [
    { slug: "pdf-password-protect", when: "You want to ADD a password and encryption, not remove one." },
  ],

  /* ── PDF ↔ Word: fidelity vs fully-local ──────────────────────────────────── */
  "pdf-to-word": [
  ],
  "word-to-pdf": [
  ],

  /* ── Merging / splitting PDFs: two workspaces, pick your style ────────────── */
  "merge-pdf": [
  ],
  "split-pdf": [
  ],

  /* ── UTM pair ─────────────────────────────────────────────────────────────── */
  "utm-builder": [
    { slug: "campaign-url-builder", when: "You want channel presets and custom parameters beyond the five standard UTM fields." },
  ],
  "campaign-url-builder": [
    { slug: "utm-builder", when: "You just need the five standard UTM fields in a quick, no-frills form." },
  ],

  /* ── Audio joining ────────────────────────────────────────────────────────── */
  "audio-joiner": [
    { slug: "audio-merger", when: "You want an optional crossfade to smooth the transitions between clips." },
  ],
  "audio-merger": [
    { slug: "audio-joiner", when: "You want strict gap-free concatenation with no blending between clips." },
  ],

  /* ── SVG size family: four different jobs ─────────────────────────────────── */
  "svg-minifier": [
    { slug: "svg-optimizer", when: "You want SVGO-style structural cleanup, metadata, hidden layers, coordinate rounding." },
    { slug: "svg-size-optimizer", when: "You need to hit a specific target file size with a precision slider." },
  ],
  "svg-optimizer": [
    { slug: "svg-minifier", when: "You just want the markup aggressively squeezed to one line, nothing structural." },
    { slug: "svg-compressor", when: "You care about the real transfer size, gzip and Brotli payload estimates." },
  ],
  "svg-compressor": [
    { slug: "svg-optimizer", when: "You want the file itself cleaned and optimized, not just measured." },
    { slug: "svg-size-optimizer", when: "You need to reach an exact byte target, decimal by decimal." },
  ],
  "svg-size-optimizer": [
    { slug: "svg-optimizer", when: "You want a one-click SVGO cleanup without chasing a specific byte target." },
    { slug: "svg-compressor", when: "You want to see the gzip/Brotli size that actually crosses the wire." },
  ],
  "svg-prettifier": [
    { slug: "svg-code-formatter", when: "You want configurable indentation and formatting options for SVG source." },
  ],
  "svg-code-formatter": [
    { slug: "svg-prettifier", when: "You just want minified SVG expanded back to readable form in one click." },
  ],

  /* ── GEO Studio: the three genuine confusions ─────────────────────────────
       1. robots.txt health (any crawler) vs AI-crawler policy vs generating it;
       2. content scored as a whole vs judged as retrieved fragments vs judged
          section-opening by section-opening;
       3. permission to crawl (robots.txt) vs proof of crawling (server logs).
       Every `when` line stays truthful to what the sibling actually does. ──── */
  "ai-crawler-access-checker": [
    { slug: "ai-robots-txt-generator", when: "You already know something is blocked and want to write the correct policy instead of diagnosing it." },
    { slug: "ai-crawler-log-analyzer", when: "robots.txt looks fine and you need proof of whether crawlers actually arrived, which only server logs hold." },
    { slug: "robots-txt-validator", when: "You want general robots.txt health (syntax, stray Disallow, missing sitemap) for all crawlers, not an AI-specific verdict." },
  ],
  "ai-robots-txt-generator": [
    { slug: "ai-crawler-access-checker", when: "You want to know what your CURRENT file does before changing it, with the deciding rule quoted." },
    { slug: "robots-txt-generator", when: "You need ordinary crawl rules (path disallows, crawl-delay, custom groups) rather than an AI-bot policy." },
  ],
  "ai-crawler-log-analyzer": [
    { slug: "ai-crawler-access-checker", when: "You want to know whether crawlers are ALLOWED, rather than whether they showed up." },
    { slug: "geo-audit", when: "You want the whole picture for one page instead of site-wide crawler traffic." },
  ],
  "content-citability-scorer": [
    { slug: "retrieval-chunk-preview", when: "You want to see the page split into fragments and read each one alone, rather than scored as a whole." },
    { slug: "answer-snippet-checker", when: "You only care whether each section opens with a direct answer, and want a rewrite target per section." },
  ],
  "retrieval-chunk-preview": [
    { slug: "content-citability-scorer", when: "You want a scored verdict on fact density, sources and quotability rather than a fragment-by-fragment read." },
    { slug: "answer-snippet-checker", when: "Your sections are self-contained already and the question is whether they answer fast enough." },
  ],
  "answer-snippet-checker": [
    { slug: "content-citability-scorer", when: "You want the whole page scored across six factors, not just its section openings." },
    { slug: "retrieval-chunk-preview", when: "You suspect the problem is fragments losing context, not slow openings." },
  ],
  "geo-audit": [
    { slug: "ai-crawler-access-checker", when: "You only need the robots.txt answer and want it in ten seconds without fetching the page." },
    { slug: "content-citability-scorer", when: "Access and rendering are already fine and the question is purely whether the content is quotable." },
  ],
  "ai-schema-checker": [
    { slug: "jsonld-validator", when: "You have a specific JSON-LD block with a syntax error and need the exact line pinpointed." },
    { slug: "schema-generator", when: "You already know which type you need and just want valid markup generated." },
  ],
  "js-rendering-checker": [
    { slug: "geo-audit", when: "You want crawler access and content checked in the same pass, not just rendering." },
    { slug: "html-validator", when: "You're chasing malformed markup rather than content that's missing without JavaScript." },
  ],
};

/** Chooser entries for a tool page; empty array when none are curated. */
export function siblingsFor(slug: string): SiblingChoice[] {
  return TOOL_SIBLINGS[slug] ?? [];
}
