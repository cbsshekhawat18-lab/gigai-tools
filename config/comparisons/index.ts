import type { Comparison } from "@/types";

/**
 * THE COMPARISON REGISTRY: the single source of truth for /compare pages.
 *
 * Mirrors the tool registry: add a comparison by dropping a file under
 * config/comparisons/<slug>.ts (default-exporting a `Comparison`) and importing
 * it here. Everything else: routes, metadata, JSON-LD, the index grid, sitemap
 * entries and cross-links. Is generated from this array.
 */

// ── Image formats ─────────────────────────────────────────────────────────────
import pngVsJpg from "./png-vs-jpg";
import jpegVsWebp from "./jpeg-vs-webp";
import pngVsWebp from "./png-vs-webp";
import svgVsPng from "./svg-vs-png";
import jpgVsPngQuality from "./jpg-vs-png-quality";
import heicVsJpg from "./heic-vs-jpg";
import webpVsAvif from "./webp-vs-avif";
import tiffVsJpg from "./tiff-vs-jpg";

// ── Documents ─────────────────────────────────────────────────────────────────
import pdfVsDocx from "./pdf-vs-docx";
// Brand comparison. Every claim about the competitor is sourced from their own
// published privacy and pricing pages, see the file header before editing.
import gigaiVsIlovepdf from "./gigai-vs-ilovepdf";
import gigaiVsOtter from "./gigai-vs-otter";
import gigaiVideoToWorkVsLoomAi from "./gigai-video-to-work-vs-loom-ai";

// ── Data formats ──────────────────────────────────────────────────────────────
import csvVsJson from "./csv-vs-json";
import jsonVsXml from "./json-vs-xml";
import yamlVsJson from "./yaml-vs-json";
import csvVsExcel from "./csv-vs-excel";

// ── Video ─────────────────────────────────────────────────────────────────────
import mp4VsWebm from "./mp4-vs-webm";
import movVsMp4 from "./mov-vs-mp4";
import gifVsMp4 from "./gif-vs-mp4";
import h264VsH265 from "./h264-vs-h265";

// ── Audio ─────────────────────────────────────────────────────────────────────
import mp3VsWav from "./mp3-vs-wav";
import wavVsFlac from "./wav-vs-flac";
import aacVsMp3 from "./aac-vs-mp3";

// ── Color & encoding ──────────────────────────────────────────────────────────
import hexVsRgb from "./hex-vs-rgb";
import base64VsBinary from "./base64-vs-binary";
import markdownVsHtml from "./markdown-vs-html";

export const COMPARISONS: Comparison[] = [
  pngVsJpg,
  jpegVsWebp,
  pngVsWebp,
  svgVsPng,
  jpgVsPngQuality,
  heicVsJpg,
  webpVsAvif,
  tiffVsJpg,
  pdfVsDocx,
  gigaiVsIlovepdf,
  gigaiVsOtter,
  gigaiVideoToWorkVsLoomAi,
  csvVsJson,
  jsonVsXml,
  yamlVsJson,
  csvVsExcel,
  mp4VsWebm,
  movVsMp4,
  gifVsMp4,
  h264VsH265,
  mp3VsWav,
  wavVsFlac,
  aacVsMp3,
  hexVsRgb,
  base64VsBinary,
  markdownVsHtml,
];
