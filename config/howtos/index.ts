import type { HowTo } from "@/types";

/**
 * THE HOW-TO REGISTRY, the single source of truth for /how-to pages.
 *
 * Mirrors the tool registry: add a guide by dropping a file under
 * config/howtos/<slug>.ts (default-exporting a `HowTo`) and importing it here.
 * Everything else, routes, metadata, HowTo + FAQPage JSON-LD, the index grid,
 * sitemap entries and cross-links; is generated from this array.
 */

// ── PDF ───────────────────────────────────────────────────────────────────────
import howToCompressAPdf from "./how-to-compress-a-pdf";
import howToMergePdfFiles from "./how-to-merge-pdf-files";
import howToAddAWatermarkToAPdf from "./how-to-add-a-watermark-to-a-pdf";

// ── Images ────────────────────────────────────────────────────────────────────
import howToConvertPngToJpg from "./how-to-convert-png-to-jpg";
import howToResizeAnImageForInstagram from "./how-to-resize-an-image-for-instagram";
import howToOptimizeAnSvg from "./how-to-optimize-an-svg";
import howToCompressAnImage from "./how-to-compress-an-image";

// ── Media ─────────────────────────────────────────────────────────────────────
import howToConvertAVideoToGif from "./how-to-convert-a-video-to-gif";
import howToExtractAudioFromAVideo from "./how-to-extract-audio-from-a-video";
import howToMakeARingtone from "./how-to-make-a-ringtone";

// ── Data & developer ──────────────────────────────────────────────────────────
import howToFormatJson from "./how-to-format-json";
import howToConvertCsvToJson from "./how-to-convert-csv-to-json";
import howToDecodeAJwt from "./how-to-decode-a-jwt";

// ── SEO ───────────────────────────────────────────────────────────────────────
import howToCreateAQrCode from "./how-to-create-a-qr-code";
import howToAddSchemaMarkupToAPage from "./how-to-add-schema-markup-to-a-page";
import howToGenerateAnXmlSitemap from "./how-to-generate-an-xml-sitemap";

export const HOWTOS: HowTo[] = [
  howToCompressAPdf,
  howToMergePdfFiles,
  howToAddAWatermarkToAPdf,
  howToConvertPngToJpg,
  howToResizeAnImageForInstagram,
  howToOptimizeAnSvg,
  howToCompressAnImage,
  howToConvertAVideoToGif,
  howToExtractAudioFromAVideo,
  howToMakeARingtone,
  howToFormatJson,
  howToConvertCsvToJson,
  howToDecodeAJwt,
  howToCreateAQrCode,
  howToAddSchemaMarkupToAPage,
  howToGenerateAnXmlSitemap,
];
