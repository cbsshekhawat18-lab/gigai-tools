/**
 * Curated "what next?" chains shown in tool done-states (see
 * components/tool/next-steps.tsx). After a successful run, the natural next
 * step is one click away: Compress PDF → Protect → Merge; Resize image →
 * Compress → Convert; Format JSON → Validate → Diff.
 *
 * DELIBERATELY a small hand-written map (NOT derived from config/tools) so
 * client bundles never pull in the ~250 full tool configs (the same reason
 * ToolCardData exists). Icons/labels mirror each target tool's registry entry.
 * Every slug must be a LIVE top-level tool route.
 */

export interface NextStep {
  slug: string;
  label: string;
  /** Lucide icon name (matches the target tool's registry icon). */
  icon: string;
  /** Short "why" shown as the chip's tooltip. */
  why?: string;
}

const step = (slug: string, label: string, icon: string, why?: string): NextStep => ({
  slug,
  label,
  icon,
  why,
});

/* Shared steps referenced from several chains. */
const COMPRESS_IMAGE = step("image-compressor", "Compress image", "Minimize2", "Shrink the file size for web or email");
const RESIZE_IMAGE = step("image-resizer", "Resize image", "Scaling", "Fit exact dimensions for any platform");
const TO_WEBP = step("webp-converter", "Convert to WebP", "Repeat2", "Smaller, modern format for the web");
const STRIP_EXIF = step("remove-metadata", "Remove metadata", "ShieldCheck", "Strip location & camera info before sharing");
const COMPRESS_PDF = step("compress-pdf", "Compress PDF", "FileArchive", "Shrink it for email and upload limits");
const MERGE_PDF = step("merge-pdf", "Merge PDFs", "Combine", "Combine with other documents");
const PROTECT_PDF = step("pdf-password-protect", "Protect with password", "Lock", "Lock the file before sharing");

export const WORKFLOWS: Record<string, NextStep[]> = {
  // ── Image chains ────────────────────────────────────────────────────────────
  "image-compressor": [TO_WEBP, RESIZE_IMAGE, STRIP_EXIF],
  "image-resizer": [COMPRESS_IMAGE, TO_WEBP, step("crop-image", "Crop image", "Crop")],
  "crop-image": [RESIZE_IMAGE, COMPRESS_IMAGE],
  "png-to-jpg": [COMPRESS_IMAGE, RESIZE_IMAGE],
  "jpg-to-png": [COMPRESS_IMAGE, RESIZE_IMAGE],
  "webp-converter": [COMPRESS_IMAGE, RESIZE_IMAGE],
  "heic-to-jpg": [COMPRESS_IMAGE, RESIZE_IMAGE, STRIP_EXIF],
  "image-upscaler": [step("crop-image", "Crop image", "Crop"), COMPRESS_IMAGE],
  "remove-metadata": [COMPRESS_IMAGE, RESIZE_IMAGE],

  // ── PDF chains ──────────────────────────────────────────────────────────────
  "compress-pdf": [PROTECT_PDF, MERGE_PDF, step("pdf-to-word", "Convert to Word", "FileType2")],
  "merge-pdf": [COMPRESS_PDF, step("reorder-pdf-pages", "Reorder pages", "ArrowDownUp"), PROTECT_PDF],
  "split-pdf": [MERGE_PDF, COMPRESS_PDF],
  "jpg-to-pdf": [MERGE_PDF, COMPRESS_PDF, PROTECT_PDF],
  "pdf-to-jpg": [COMPRESS_IMAGE, RESIZE_IMAGE],
  "word-to-pdf": [COMPRESS_PDF, MERGE_PDF, PROTECT_PDF],
  "rotate-pdf": [COMPRESS_PDF, MERGE_PDF],
  "extract-pdf-pages": [MERGE_PDF, COMPRESS_PDF],
  "delete-pdf-pages": [COMPRESS_PDF, MERGE_PDF],
  "reorder-pdf-pages": [MERGE_PDF, COMPRESS_PDF],
  "unlock-pdf": [COMPRESS_PDF, MERGE_PDF],
  "ocr-pdf": [step("pdf-to-word", "Convert to Word", "FileType2"), COMPRESS_PDF],

  // ── JSON chains ─────────────────────────────────────────────────────────────
  "json-formatter": [
    step("json-validator", "Validate", "FileCheck2"),
    step("json-diff", "Compare", "GitCompareArrows"),
    step("json-to-typescript", "Generate types", "Braces"),
  ],
  "json-validator": [
    step("json-formatter", "Format & beautify", "Braces"),
    step("json-tree-viewer", "Explore as tree", "ListTree"),
  ],
  "json-diff": [step("json-formatter", "Format & beautify", "Braces")],
  "json-to-typescript": [step("json-formatter", "Format & beautify", "Braces")],

  // ── Video / audio chains ────────────────────────────────────────────────────
  "video-compressor": [
    step("video-converter", "Convert format", "RefreshCw"),
    step("extract-audio", "Extract audio", "Music"),
    step("video-resizer", "Resize video", "Scaling"),
  ],
  "video-converter": [
    step("video-compressor", "Compress video", "Minimize2"),
    step("video-resizer", "Resize video", "Scaling"),
  ],
  "extract-audio": [
    step("audio-to-mp3", "Convert to MP3", "FileAudio"),
    step("audio-trimmer", "Trim audio", "Scissors"),
  ],
  "audio-trimmer": [
    step("audio-format-converter", "Convert format", "RefreshCw"),
    step("audio-normalizer", "Normalize volume", "Gauge"),
  ],
  "audio-to-mp3": [
    step("audio-compressor", "Compress audio", "Minimize2"),
    step("audio-trimmer", "Trim audio", "Scissors"),
  ],

  // ── QR chains ───────────────────────────────────────────────────────────────
  "qr-code-generator": [
    step("qr-code-with-logo", "Add your logo", "ImagePlus"),
    step("bulk-qr-code-generator", "Generate in bulk", "Layers"),
  ],
};

/** Next-step chips for a tool slug; empty when no chain is curated. */
/* Traffic top-20 coverage (P4, 2026-08-21): chains for the most-visited tools
   that lacked one. Every slug verified against the registry. */
const P4_CHAINS: Record<string, NextStep[]> = {
  "video-player": [
    step("video-trimmer", "Trim video", "Scissors"),
    step("video-compressor", "Compress video", "FileVideo"),
    step("extract-audio", "Extract audio", "AudioLines"),
  ],
  "video-metadata": [
    step("video-compressor", "Compress video", "FileVideo"),
    step("video-converter", "Convert format", "RefreshCw"),
    step("video-trimmer", "Trim video", "Scissors"),
  ],
  "video-resizer": [
    step("video-compressor", "Compress video", "FileVideo"),
    step("video-trimmer", "Trim video", "Scissors"),
    step("video-to-gif", "Make a GIF", "Film"),
  ],
  "video-frame-extractor": [
    step("image-compressor", "Compress frame", "ImageDown"),
    step("image-resizer", "Resize frame", "Scaling"),
    step("video-to-gif", "Make a GIF", "Film"),
  ],
  "video-trimmer": [
    step("video-compressor", "Compress video", "FileVideo"),
    step("video-merger", "Merge clips", "Combine"),
    step("video-to-gif", "Make a GIF", "Film"),
  ],
  "svg-gradient-generator": [
    step("svg-optimizer", "Optimize SVG", "Minimize2"),
    step("svg-editor", "Edit SVG", "PenTool"),
    step("svg-to-png", "Export PNG", "ImageDown"),
  ],
  "svg-animation-generator": [
    step("svg-optimizer", "Optimize SVG", "Minimize2"),
    step("svg-viewer", "Preview SVG", "Eye"),
    step("svg-editor", "Edit SVG", "PenTool"),
  ],
  "svg-viewer": [
    step("svg-optimizer", "Optimize SVG", "Minimize2"),
    step("svg-editor", "Edit SVG", "PenTool"),
    step("svg-to-png", "Export PNG", "ImageDown"),
  ],
  "barcode-generator": [
    step("qr-code-generator", "Make a QR code", "QrCode"),
    step("svg-to-png", "Export PNG", "ImageDown"),
  ],
  "audio-waveform": [
    step("audio-trimmer", "Trim audio", "Scissors"),
    step("audio-normalizer", "Normalize loudness", "AudioWaveform"),
    step("audio-to-mp3", "Convert to MP3", "Music"),
  ],
  "audio-volume-booster": [
    step("audio-normalizer", "Normalize loudness", "AudioWaveform"),
    step("audio-compressor", "Compress audio", "FileAudio"),
    step("audio-trimmer", "Trim audio", "Scissors"),
  ],
  "audio-cutter": [
    step("audio-joiner", "Join clips", "Combine"),
    step("audio-format-converter", "Convert format", "RefreshCw"),
    step("audio-volume-booster", "Boost volume", "Volume2"),
  ],
  "url-parser": [
    step("url-encoder", "Encode a URL", "Link"),
    step("utm-builder", "Build UTM links", "Link2"),
    step("jwt-decoder", "Decode a JWT", "KeyRound"),
  ],
};

export function nextStepsFor(slug: string): NextStep[] {
  return WORKFLOWS[slug] ?? P4_CHAINS[slug] ?? [];
}
