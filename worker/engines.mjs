/**
 * GigAI Developer API - engine implementations.
 *
 * Each engine: async run(inputs, options) -> [{filename, mime, data}].
 * inputs arrive as [{id, filename, size, data(Buffer)}] in task-input order.
 * Throw EngineError(code, message) for user-facing failures - messages may
 * name filenames and sizes, NEVER file contents.
 *
 * Library choices mirror the browser tools where a library exists that runs
 * in Node (pdf-lib, svgo, marked). sharp replaces canvas-based image work -
 * it is a native dependency, installed on the server next to the bundle and
 * deliberately NOT bundled (see build step in package.json). It is loaded
 * lazily so the worker still boots - and every other engine still works -
 * if sharp is missing.
 */

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { marked } from "marked";
import { optimize as svgoOptimize } from "svgo";
import QRCode from "qrcode";
import { dump as yamlDump, load as yamlLoad } from "js-yaml";
import Papa from "papaparse";
import CleanCSS from "clean-css";
import { minify as terserMinify } from "terser";
import { minify as htmlMinify } from "html-minifier-terser";
import TurndownService from "turndown";
// The site's vendored build of our own indian-pii library (MIT, same owner) -
// one vendored copy in the repo, baked into the worker bundle at build time.
import {
  detect as piiDetect, detectorMap as piiDetectors, mask as piiMask,
} from "../lib/vendor/indian-pii/index.js";

export class EngineError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

/** First line of a parser error - position info without content echoes. */
function firstLine(err) {
  return String(err?.message ?? err).split("\n")[0].slice(0, 160);
}

/** Shared option handling for the two indian-pii engines. */
function piiOptions(options) {
  const opts = {};
  if (options.types) {
    const types = String(options.types).split(",").map((t) => t.trim()).filter(Boolean);
    const unknown = types.filter((t) => !piiDetectors.has(t));
    if (unknown.length) {
      throw new EngineError("invalid_option",
        `Unknown PII type(s) ${unknown.join(", ")}. Valid: ${[...piiDetectors.keys()].join(", ")}.`);
    }
    opts.types = types;
  }
  if (options.require_valid) opts.requireValid = true;
  return opts;
}

let _sharp = null;
async function getSharp() {
  if (!_sharp) {
    try {
      _sharp = (await import("sharp")).default;
    } catch {
      throw new EngineError("engine_unavailable", "Image processing is temporarily unavailable.");
    }
    _sharp.concurrency(1); // 2-vCPU box shared with the site - never fan out
  }
  return _sharp;
}

// Refuse decompression bombs before sharp allocates for them (small servers).
const MAX_PIXELS = 50_000_000;

let _pdfjs = null;
async function getPdfjs() {
  if (!_pdfjs) {
    // pdfjs constructs a DOMMatrix at import time for its (unused here)
    // renderer; text extraction never touches it. Stub it where Node lacks it.
    if (typeof globalThis.DOMMatrix === "undefined") {
      globalThis.DOMMatrix = class DOMMatrix {
        constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
      };
    }
    _pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return _pdfjs;
}

/* ---------- input sniffing (magic bytes, not extensions) ---------- */

const sniffers = {
  pdf: (b) => b.subarray(0, 1024).includes("%PDF"),
  png: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP",
  gif: (b) => b.subarray(0, 4).toString() === "GIF8",
  avif: (b) => b.subarray(4, 12).toString().startsWith("ftyp"),
  svg: (b) => b.subarray(0, 4096).toString("utf8").includes("<svg"),
  md: () => true,
  txt: () => true,
  // Text families: the engines do the real parsing and answer invalid_input
  // with a precise message - the sniff just refuses obvious binaries.
  json: (b) => /^[\s]*[{["\d-tfn]/.test(b.subarray(0, 64).toString("utf8")),
  yaml: (b) => !b.subarray(0, 512).includes(0),
  csv: (b) => !b.subarray(0, 512).includes(0),
  html: (b) => !b.subarray(0, 512).includes(0),
  srt: (b) => !b.subarray(0, 512).includes(0),
  vtt: (b) => !b.subarray(0, 512).includes(0),
  css: (b) => !b.subarray(0, 512).includes(0),
  js: (b) => !b.subarray(0, 512).includes(0),
};

export function checkInputFormat(input, formats) {
  if (!formats.some((f) => sniffers[f]?.(input.data))) {
    throw new EngineError(
      "invalid_input",
      `'${input.filename}' does not look like a ${formats.join("/")} file.`,
    );
  }
}

/* ---------- pdf helpers ---------- */

async function loadPdf(input) {
  try {
    return await PDFDocument.load(input.data, { ignoreEncryption: false });
  } catch {
    throw new EngineError("invalid_input",
      `'${input.filename}' is not a readable PDF (corrupt or password-protected).`);
  }
}

/** "1-3,7,9-10" -> zero-based page indices, validated against pageCount. */
function parsePageRanges(spec, pageCount) {
  const out = [];
  for (const part of String(spec).split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new EngineError("invalid_option", `'${part}' is not a page or range like 2 or 4-7.`);
    const a = Number(m[1]), b = Number(m[2] ?? m[1]);
    if (a < 1 || b > pageCount || a > b)
      throw new EngineError("invalid_option",
        `Range '${part}' is outside this ${pageCount}-page document.`);
    for (let p = a; p <= b; p++) out.push(p - 1);
  }
  if (!out.length) throw new EngineError("invalid_option", "The 'pages' option selected no pages.");
  return out;
}

/* ---------- image helpers ---------- */

const IMG_MIME = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif" };
const IMG_EXT = { png: "png", jpeg: "jpg", webp: "webp", avif: "avif" };

function outName(input, ext) {
  return `${(input.filename || "file").replace(/\.[^.]+$/, "")}.${ext}`;
}

async function imageOf(input) {
  const sharp = await getSharp();
  const img = sharp(input.data, { limitInputPixels: MAX_PIXELS });
  try {
    return { img, meta: await img.metadata() };
  } catch {
    throw new EngineError("invalid_input", `'${input.filename}' is not a readable image.`);
  }
}

/* ---------- engines ---------- */

export const engines = {
  "merge-pdf": async (inputs) => {
    if (inputs.length < 2) throw new EngineError("needs_two_inputs", "merge-pdf needs at least 2 input PDFs.");
    const out = await PDFDocument.create();
    for (const input of inputs) {
      const src = await loadPdf(input);
      for (const p of await out.copyPages(src, src.getPageIndices())) out.addPage(p);
    }
    return [{ filename: "merged.pdf", mime: "application/pdf", data: Buffer.from(await out.save()) }];
  },

  "split-pdf": async (inputs, options) => {
    const src = await loadPdf(inputs[0]);
    const indices = parsePageRanges(options.pages, src.getPageCount());
    const out = await PDFDocument.create();
    for (const p of await out.copyPages(src, indices)) out.addPage(p);
    return [{ filename: outName(inputs[0], "pdf").replace(/\.pdf$/, "-pages.pdf"),
              mime: "application/pdf", data: Buffer.from(await out.save()) }];
  },

  "rotate-pdf": async (inputs, options) => {
    const src = await loadPdf(inputs[0]);
    const indices = options.pages
      ? parsePageRanges(options.pages, src.getPageCount())
      : src.getPageIndices();
    for (const i of indices) {
      const page = src.getPage(i);
      page.setRotation(degrees((page.getRotation().angle + options.angle) % 360));
    }
    return [{ filename: outName(inputs[0], "pdf"), mime: "application/pdf",
              data: Buffer.from(await src.save()) }];
  },

  "pdf-to-text": async (inputs) => {
    const pdfjs = await getPdfjs();
    let doc;
    try {
      doc = await pdfjs.getDocument({
        data: new Uint8Array(inputs[0].data), isEvalSupported: false,
        useSystemFonts: true, verbosity: 0,
        // Deployed beside the bundle (see package.json deploy note): pdfjs
        // resolves its worker module relative to the running script, and
        // CID-keyed PDFs (Indic, CJK) need the cmap tables for text extraction.
        cMapUrl: process.env.GIGAI_PDFJS_ASSETS ? `${process.env.GIGAI_PDFJS_ASSETS}/cmaps/` : undefined,
        cMapPacked: true,
        standardFontDataUrl: process.env.GIGAI_PDFJS_ASSETS
          ? `${process.env.GIGAI_PDFJS_ASSETS}/standard_fonts/` : undefined,
      }).promise;
    } catch (err) {
      // Operational log: the pdfjs error NAME only - never document content.
      console.error("pdf-to-text getDocument failed:", err?.name, err?.message);
      throw new EngineError("invalid_input",
        `'${inputs[0].filename}' is not a readable PDF (corrupt or password-protected).`);
    }
    const pages = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const content = await (await doc.getPage(p)).getTextContent();
      pages.push(content.items.map((it) => it.str).join(" ").replace(/\s+/g, " ").trim());
    }
    await doc.destroy();
    return [{ filename: outName(inputs[0], "txt"), mime: "text/plain",
              data: Buffer.from(pages.join("\n\n"), "utf8") }];
  },

  "convert-image": async (inputs, options) => {
    const { img } = await imageOf(inputs[0]);
    const fmt = options.format;
    const data = await img.toFormat(fmt, options.quality ? { quality: options.quality } : {}).toBuffer();
    return [{ filename: outName(inputs[0], IMG_EXT[fmt]), mime: IMG_MIME[fmt], data }];
  },

  "resize-image": async (inputs, options) => {
    if (!options.width && !options.height)
      throw new EngineError("invalid_option", "Give a width, a height, or both.");
    const { img, meta } = await imageOf(inputs[0]);
    const fmt = options.format || (IMG_MIME[meta.format] ? meta.format : "png");
    const data = await img
      .resize({ width: options.width, height: options.height, fit: options.fit || "inside" })
      .toFormat(fmt).toBuffer();
    return [{ filename: outName(inputs[0], IMG_EXT[fmt]), mime: IMG_MIME[fmt], data }];
  },

  "compress-image": async (inputs, options) => {
    const { img, meta } = await imageOf(inputs[0]);
    const fmt = options.format || (["jpeg", "webp", "avif"].includes(meta.format) ? meta.format : "jpeg");
    const encode = (q) => img.clone().toFormat(fmt, { quality: q }).toBuffer();
    if (!options.target_kb) {
      const data = await encode(options.quality ?? 75);
      return [{ filename: outName(inputs[0], IMG_EXT[fmt]), mime: IMG_MIME[fmt], data }];
    }
    // Target size: binary-search quality for the best result under target_kb.
    const target = options.target_kb * 1024;
    let lo = 5, hi = 95, best = null;
    for (let i = 0; i < 8; i++) {
      const q = Math.floor((lo + hi) / 2);
      const data = await encode(q);
      if (data.length <= target) { best = data; lo = q + 1; } else { hi = q - 1; }
      if (lo > hi) break;
    }
    if (!best) {
      const floor = await encode(5);
      throw new EngineError("target_unreachable",
        `Cannot reach ${options.target_kb} KB: even at the lowest quality this image is ${Math.ceil(floor.length / 1024)} KB. Resize it smaller first or raise target_kb.`);
    }
    return [{ filename: outName(inputs[0], IMG_EXT[fmt]), mime: IMG_MIME[fmt], data: best }];
  },

  "optimize-svg": async (inputs, options) => {
    const src = inputs[0].data.toString("utf8");
    let result;
    try {
      result = svgoOptimize(src, {
        multipass: true,
        floatPrecision: options.precision ?? 3,
      });
    } catch {
      throw new EngineError("invalid_input", `'${inputs[0].filename}' is not a readable SVG.`);
    }
    return [{ filename: outName(inputs[0], "svg"), mime: "image/svg+xml",
              data: Buffer.from(result.data, "utf8") }];
  },

  "markdown-to-html": async (inputs, options) => {
    const body = marked.parse(inputs[0].data.toString("utf8"));
    const title = options.title || (inputs[0].filename || "document").replace(/\.[^.]+$/, "");
    const html = `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${title.replace(/</g, "&lt;")}</title>\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
    return [{ filename: outName(inputs[0], "html"), mime: "text/html",
              data: Buffer.from(html, "utf8") }];
  },

  /* ---------- pdf, continued ---------- */

  "delete-pdf-pages": async (inputs, options) => {
    const src = await loadPdf(inputs[0]);
    const drop = new Set(parsePageRanges(options.pages, src.getPageCount()));
    if (drop.size >= src.getPageCount())
      throw new EngineError("invalid_option", "Deleting every page would leave an empty document.");
    const keep = src.getPageIndices().filter((i) => !drop.has(i));
    const out = await PDFDocument.create();
    for (const p of await out.copyPages(src, keep)) out.addPage(p);
    return [{ filename: outName(inputs[0], "pdf"), mime: "application/pdf",
              data: Buffer.from(await out.save()) }];
  },

  "add-page-numbers": async (inputs, options) => {
    const doc = await loadPdf(inputs[0]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const size = options.size ?? 11;
    const start = options.start ?? 1;
    const position = options.position ?? "bottom-center";
    doc.getPages().forEach((page, i) => {
      const label = String(start + i);
      const w = font.widthOfTextAtSize(label, size);
      const { width, height } = page.getSize();
      const x = position.endsWith("left") ? 36
        : position.endsWith("right") ? width - 36 - w
        : (width - w) / 2;
      const y = position.startsWith("top") ? height - 30 : 22;
      page.drawText(label, { x, y, size, font, color: rgb(0.25, 0.25, 0.25) });
    });
    return [{ filename: outName(inputs[0], "pdf"), mime: "application/pdf",
              data: Buffer.from(await doc.save()) }];
  },

  "watermark-pdf": async (inputs, options) => {
    const doc = await loadPdf(inputs[0]);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const size = options.size ?? 48;
    const angle = options.angle ?? 45;
    const opacity = options.opacity ?? 0.15;
    const w = font.widthOfTextAtSize(options.text, size);
    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(options.text, {
        x: (width - w * Math.cos((angle * Math.PI) / 180)) / 2,
        y: (height - w * Math.sin((angle * Math.PI) / 180)) / 2,
        size, font, color: rgb(0.5, 0.5, 0.5), opacity, rotate: degrees(angle),
      });
    }
    return [{ filename: outName(inputs[0], "pdf"), mime: "application/pdf",
              data: Buffer.from(await doc.save()) }];
  },

  "pdf-metadata": async (inputs, options) => {
    const doc = await loadPdf(inputs[0]);
    if (options.strip) {
      doc.setTitle(""); doc.setAuthor(""); doc.setSubject(""); doc.setKeywords([]);
      doc.setProducer(""); doc.setCreator("");
    }
    if (options.title !== undefined) doc.setTitle(String(options.title));
    if (options.author !== undefined) doc.setAuthor(String(options.author));
    if (options.subject !== undefined) doc.setSubject(String(options.subject));
    if (options.keywords !== undefined)
      doc.setKeywords(String(options.keywords).split(",").map((k) => k.trim()).filter(Boolean));
    return [{ filename: outName(inputs[0], "pdf"), mime: "application/pdf",
              data: Buffer.from(await doc.save()) }];
  },

  "image-to-pdf": async (inputs, options) => {
    const doc = await PDFDocument.create();
    const a4 = options.page === "a4";
    for (const input of inputs) {
      let bytes = input.data;
      let kind = sniffers.png(bytes) ? "png" : sniffers.jpg(bytes) ? "jpg" : null;
      if (!kind) {
        // webp/avif/gif: normalize through sharp - pdf-lib embeds only png/jpg.
        const sharp = await getSharp();
        bytes = await sharp(bytes, { limitInputPixels: MAX_PIXELS }).png().toBuffer();
        kind = "png";
      }
      const image = kind === "png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
      if (a4) {
        const page = doc.addPage([595.28, 841.89]);
        const margin = 24;
        const scale = Math.min((595.28 - margin * 2) / image.width, (841.89 - margin * 2) / image.height);
        const w = image.width * scale, h = image.height * scale;
        page.drawImage(image, { x: (595.28 - w) / 2, y: (841.89 - h) / 2, width: w, height: h });
      } else {
        const w = image.width * 0.75, h = image.height * 0.75; // px at 96dpi -> pt
        doc.addPage([w, h]).drawImage(image, { x: 0, y: 0, width: w, height: h });
      }
    }
    return [{ filename: "images.pdf", mime: "application/pdf",
              data: Buffer.from(await doc.save()) }];
  },

  "pdf-to-jpg": async (inputs, options) => {
    const pdfjs = await getPdfjs();
    let createCanvas;
    try {
      ({ createCanvas } = await import("@napi-rs/canvas"));
    } catch {
      throw new EngineError("engine_unavailable", "PDF rendering is temporarily unavailable.");
    }
    let doc;
    try {
      doc = await pdfjs.getDocument({
        data: new Uint8Array(inputs[0].data), isEvalSupported: false,
        useSystemFonts: true, verbosity: 0,
        cMapUrl: process.env.GIGAI_PDFJS_ASSETS ? `${process.env.GIGAI_PDFJS_ASSETS}/cmaps/` : undefined,
        cMapPacked: true,
        standardFontDataUrl: process.env.GIGAI_PDFJS_ASSETS
          ? `${process.env.GIGAI_PDFJS_ASSETS}/standard_fonts/` : undefined,
      }).promise;
    } catch {
      throw new EngineError("invalid_input",
        `'${inputs[0].filename}' is not a readable PDF (corrupt or password-protected).`);
    }
    const indices = parsePageRanges(options.pages ?? "1", doc.numPages);
    if (indices.length > 20)
      throw new EngineError("invalid_option", "At most 20 pages per task - split larger jobs into ranges.");
    const scale = options.scale ?? 2;
    const format = options.format ?? "jpg";
    const outputs = [];
    for (const i of indices) {
      const page = await doc.getPage(i + 1);
      const viewport = page.getViewport({ scale });
      if (viewport.width * viewport.height > MAX_PIXELS)
        throw new EngineError("invalid_option", `Page ${i + 1} at scale ${scale} is too large - lower the scale.`);
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, viewport.width, viewport.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      outputs.push({
        filename: `page-${i + 1}.${format === "png" ? "png" : "jpg"}`,
        mime: format === "png" ? "image/png" : "image/jpeg",
        data: canvas.toBuffer(format === "png" ? "image/png" : "image/jpeg"),
      });
    }
    await doc.destroy();
    return outputs;
  },

  /* ---------- image, continued ---------- */

  "crop-image": async (inputs, options) => {
    const { img, meta } = await imageOf(inputs[0]);
    const left = options.left ?? 0, top = options.top ?? 0;
    if (left + options.width > (meta.width ?? 0) || top + options.height > (meta.height ?? 0))
      throw new EngineError("invalid_option",
        `The crop box exceeds the ${meta.width}x${meta.height} image.`);
    const fmt = ["jpeg", "png", "webp", "avif"].includes(meta.format) ? meta.format : "png";
    const data = await img.extract({ left, top, width: options.width, height: options.height })
      .toFormat(fmt).toBuffer();
    return [{ filename: outName(inputs[0], IMG_EXT[fmt] ?? "png"), mime: IMG_MIME[fmt] ?? "image/png", data }];
  },

  "rotate-image": async (inputs, options) => {
    const { img, meta } = await imageOf(inputs[0]);
    const fmt = ["jpeg", "png", "webp", "avif"].includes(meta.format) ? meta.format : "png";
    const data = await img
      .rotate(options.angle, { background: { r: 255, g: 255, b: 255, alpha: fmt === "jpeg" ? 1 : 0 } })
      .toFormat(fmt).toBuffer();
    return [{ filename: outName(inputs[0], IMG_EXT[fmt] ?? "png"), mime: IMG_MIME[fmt] ?? "image/png", data }];
  },

  "flip-image": async (inputs, options) => {
    const { img, meta } = await imageOf(inputs[0]);
    const fmt = ["jpeg", "png", "webp", "avif"].includes(meta.format) ? meta.format : "png";
    const flipped = options.direction === "vertical" ? img.flip() : img.flop();
    const data = await flipped.toFormat(fmt).toBuffer();
    return [{ filename: outName(inputs[0], IMG_EXT[fmt] ?? "png"), mime: IMG_MIME[fmt] ?? "image/png", data }];
  },

  "grayscale-image": async (inputs) => {
    const { img, meta } = await imageOf(inputs[0]);
    const fmt = ["jpeg", "png", "webp", "avif"].includes(meta.format) ? meta.format : "png";
    const data = await img.grayscale().toFormat(fmt).toBuffer();
    return [{ filename: outName(inputs[0], IMG_EXT[fmt] ?? "png"), mime: IMG_MIME[fmt] ?? "image/png", data }];
  },

  "blur-image": async (inputs, options) => {
    const { img, meta } = await imageOf(inputs[0]);
    const fmt = ["jpeg", "png", "webp", "avif"].includes(meta.format) ? meta.format : "png";
    const data = await img.blur(options.sigma).toFormat(fmt).toBuffer();
    return [{ filename: outName(inputs[0], IMG_EXT[fmt] ?? "png"), mime: IMG_MIME[fmt] ?? "image/png", data }];
  },

  "strip-image-metadata": async (inputs) => {
    // Re-encoding without withMetadata() drops EXIF, GPS, ICC and XMP.
    const { img, meta } = await imageOf(inputs[0]);
    const fmt = ["jpeg", "png", "webp", "avif", "gif"].includes(meta.format) ? meta.format : "png";
    const data = await img.toFormat(fmt).toBuffer();
    const ext = fmt === "gif" ? "gif" : (IMG_EXT[fmt] ?? "png");
    return [{ filename: outName(inputs[0], ext),
              mime: fmt === "gif" ? "image/gif" : (IMG_MIME[fmt] ?? "image/png"), data }];
  },

  "svg-to-png": async (inputs, options) => {
    const sharp = await getSharp();
    let img = sharp(inputs[0].data, {
      limitInputPixels: MAX_PIXELS,
      density: 72 * (options.scale ?? 2),
    });
    if (options.width || options.height) {
      img = img.resize({ width: options.width, height: options.height, fit: "inside" });
    }
    let data;
    try {
      data = await img.png().toBuffer();
    } catch {
      throw new EngineError("invalid_input", `'${inputs[0].filename}' is not a readable SVG.`);
    }
    return [{ filename: outName(inputs[0], "png"), mime: "image/png", data }];
  },

  /* ---------- data & text ---------- */

  "json-to-yaml": async (inputs) => {
    let parsed;
    try {
      parsed = JSON.parse(inputs[0].data.toString("utf8"));
    } catch (e) {
      throw new EngineError("invalid_input", `'${inputs[0].filename}' is not valid JSON: ${firstLine(e)}`);
    }
    return [{ filename: outName(inputs[0], "yaml"), mime: "text/yaml",
              data: Buffer.from(yamlDump(parsed), "utf8") }];
  },

  "yaml-to-json": async (inputs, options) => {
    let parsed;
    try {
      parsed = yamlLoad(inputs[0].data.toString("utf8"));
    } catch (e) {
      throw new EngineError("invalid_input", `'${inputs[0].filename}' is not valid YAML: ${firstLine(e)}`);
    }
    return [{ filename: outName(inputs[0], "json"), mime: "application/json",
              data: Buffer.from(JSON.stringify(parsed, null, options.indent ?? 2), "utf8") }];
  },

  "csv-to-json": async (inputs) => {
    const result = Papa.parse(inputs[0].data.toString("utf8"), {
      header: true, skipEmptyLines: true, dynamicTyping: true,
    });
    if (!result.data.length)
      throw new EngineError("invalid_input", `'${inputs[0].filename}' parsed to zero rows.`);
    return [{ filename: outName(inputs[0], "json"), mime: "application/json",
              data: Buffer.from(JSON.stringify(result.data, null, 2), "utf8") }];
  },

  "json-to-csv": async (inputs, options) => {
    let parsed;
    try {
      parsed = JSON.parse(inputs[0].data.toString("utf8"));
    } catch (e) {
      throw new EngineError("invalid_input", `'${inputs[0].filename}' is not valid JSON: ${firstLine(e)}`);
    }
    if (!Array.isArray(parsed) || !parsed.length || typeof parsed[0] !== "object")
      throw new EngineError("invalid_input", "Expected a JSON array of objects (one object per row).");
    const rows = parsed.map((row) =>
      Object.fromEntries(Object.entries(row).map(([k, v]) =>
        [k, v !== null && typeof v === "object" ? JSON.stringify(v) : v])));
    const delimiter = options.delimiter === "tab" ? "\t" : options.delimiter ?? ",";
    return [{ filename: outName(inputs[0], "csv"), mime: "text/csv",
              data: Buffer.from(Papa.unparse(rows, { delimiter }), "utf8") }];
  },

  "format-json": async (inputs, options) => {
    let parsed;
    try {
      parsed = JSON.parse(inputs[0].data.toString("utf8"));
    } catch (e) {
      throw new EngineError("invalid_input", `'${inputs[0].filename}' is not valid JSON: ${firstLine(e)}`);
    }
    const indent = options.indent ?? 2;
    return [{ filename: outName(inputs[0], "json"), mime: "application/json",
              data: Buffer.from(indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent), "utf8") }];
  },

  "minify-css": async (inputs) => {
    const result = new CleanCSS({ returnPromise: false }).minify(inputs[0].data.toString("utf8"));
    if (result.errors.length)
      throw new EngineError("invalid_input", `CSS did not parse: ${result.errors[0]}`);
    return [{ filename: outName(inputs[0], "min.css"), mime: "text/css",
              data: Buffer.from(result.styles, "utf8") }];
  },

  "minify-js": async (inputs) => {
    let result;
    try {
      result = await terserMinify(inputs[0].data.toString("utf8"));
    } catch (e) {
      throw new EngineError("invalid_input", `JavaScript did not parse: ${firstLine(e)}`);
    }
    return [{ filename: outName(inputs[0], "min.js"), mime: "text/javascript",
              data: Buffer.from(result.code ?? "", "utf8") }];
  },

  "minify-html": async (inputs) => {
    let out;
    try {
      out = await htmlMinify(inputs[0].data.toString("utf8"), {
        collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true,
      });
    } catch (e) {
      throw new EngineError("invalid_input", `HTML did not parse: ${firstLine(e)}`);
    }
    return [{ filename: outName(inputs[0], "min.html"), mime: "text/html",
              data: Buffer.from(out, "utf8") }];
  },

  "html-to-markdown": async (inputs) => {
    const md = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" })
      .turndown(inputs[0].data.toString("utf8"));
    return [{ filename: outName(inputs[0], "md"), mime: "text/markdown",
              data: Buffer.from(md, "utf8") }];
  },

  "convert-subtitles": async (inputs, options) => {
    const text = inputs[0].data.toString("utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n");
    const isVtt = /^WEBVTT/m.test(text);
    if (options.format === "vtt") {
      if (isVtt) return [{ filename: outName(inputs[0], "vtt"), mime: "text/vtt", data: Buffer.from(text, "utf8") }];
      // srt -> vtt: header, drop cue numbers, comma -> dot in timestamps
      const body = text
        .replace(/^\d+\s*\n(?=\d{2}:\d{2}:\d{2},\d{3})/gm, "")
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
      return [{ filename: outName(inputs[0], "vtt"), mime: "text/vtt",
                data: Buffer.from("WEBVTT\n\n" + body.trim() + "\n", "utf8") }];
    }
    // -> srt
    if (!isVtt) return [{ filename: outName(inputs[0], "srt"), mime: "text/plain", data: Buffer.from(text, "utf8") }];
    const cues = text
      .replace(/^WEBVTT.*?\n\n/s, "")
      .replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, "$1,$2")
      .split(/\n\n+/)
      .filter((c) => c.includes("-->"))
      .map((cue, i) => `${i + 1}\n${cue.replace(/^(?!.*-->).*\n(?=.*-->)/, "")}`);
    if (!cues.length)
      throw new EngineError("invalid_input", `'${inputs[0].filename}' has no subtitle cues.`);
    return [{ filename: outName(inputs[0], "srt"), mime: "text/plain",
              data: Buffer.from(cues.join("\n\n") + "\n", "utf8") }];
  },

  /* ---------- ocr (bridges the on-box tesseract repair service) ---------- */

  "ocr-pdf": async (inputs, options) => {
    const base = process.env.GIGAI_OCR_BASE || "http://127.0.0.1:8000/api/pdf-repair";
    const form = new FormData();
    form.append("file", new Blob([inputs[0].data], { type: "application/pdf" }), inputs[0].filename);
    form.append("langs", options.langs ? String(options.langs).replaceAll(",", "+") : "auto");
    let created;
    try {
      created = await fetch(`${base}/jobs`, { method: "POST", body: form });
    } catch {
      throw new EngineError("engine_unavailable", "OCR is temporarily unavailable.");
    }
    if (created.status === 400) {
      const detail = (await created.json().catch(() => ({}))).detail ?? "";
      if (String(detail).includes("language"))
        throw new EngineError("invalid_option",
          "Invalid language selection. Use comma-separated tesseract codes (eng, hin, tam, ara, chi_sim, ...) or omit for auto-detect.");
      throw new EngineError("invalid_input", `'${inputs[0].filename}' is not a readable PDF.`);
    }
    if (created.status === 413)
      throw new EngineError("file_too_large", "OCR accepts PDFs up to 30 MB.");
    if (!created.ok)
      throw new EngineError("engine_unavailable", "OCR is temporarily unavailable.");
    const { job_id: ocrId } = await created.json();

    // Poll the service; the manifest's 600 s is the outer budget, this inner
    // deadline gives up first with the friendlier message.
    const deadline = Date.now() + 590 * 1000;
    let result = null;
    for (;;) {
      await new Promise((r) => setTimeout(r, 2000));
      const answer = await fetch(`${base}/jobs/${ocrId}`).then((r) => r.json()).catch(() => null);
      if (answer?.status === "done") { result = answer.result; break; }
      if (answer?.status === "error")
        throw new EngineError("engine_failed", String(answer.error ?? "OCR failed.").slice(0, 200));
      if (!answer || Date.now() > deadline)
        throw new EngineError("timeout", "OCR ran past its time budget. Try fewer pages or name the languages.");
    }

    if ((options.format ?? "text") === "json") {
      return [{ filename: outName(inputs[0], "ocr.json"), mime: "application/json",
                data: Buffer.from(JSON.stringify(result, null, 2), "utf8") }];
    }
    // Reconstruct reading order: cluster tokens into lines by y, sort by x.
    // Token y is PDF bottom-origin (larger = higher on the page), so reading
    // order is DESCENDING y.
    const pagesText = result.pages.map((page) => {
      const tokens = [...(page.tokens ?? [])].sort((a, b) => b.y - a.y || a.x - b.x);
      const lines = [];
      for (const token of tokens) {
        const line = lines.find((l) => Math.abs(l.y - token.y) <= Math.max(3, (token.h ?? 10) * 0.6));
        if (line) { line.parts.push(token); line.y = (line.y + token.y) / 2; }
        else lines.push({ y: token.y, parts: [token] });
      }
      return lines
        .sort((a, b) => b.y - a.y)
        .map((l) => l.parts.sort((a, b) => a.x - b.x).map((t) => t.str).join(" "))
        .join("\n");
    });
    return [{ filename: outName(inputs[0], "txt"), mime: "text/plain",
              data: Buffer.from(pagesText.join("\n\n"), "utf8") }];
  },

  /* ---------- privacy (indian-pii) ---------- */

  "detect-pii": async (inputs, options) => {
    const opts = piiOptions(options);
    const findings = piiDetect(inputs[0].data.toString("utf8"), opts).map((hit) => {
      const det = piiDetectors.get(hit.type);
      return {
        type: hit.type,
        label: det?.label ?? hit.type,
        category: det?.category ?? "unknown",
        severity: det?.severity ?? "unknown",
        index: hit.index,
        length: hit.value.length,
        valid: hit.valid,
        confidence: hit.confidence,
        // Masked stand-in only - the report never repeats the raw identifier.
        masked: det ? det.mask(hit.value) : "",
      };
    });
    const by = (key) => {
      const acc = {};
      for (const f of findings) acc[f[key]] = (acc[f[key]] ?? 0) + 1;
      return acc;
    };
    const report = {
      file: inputs[0].filename,
      scanned_chars: inputs[0].data.toString("utf8").length,
      summary: { total: findings.length, by_type: by("type"), by_severity: by("severity") },
      findings,
    };
    return [{ filename: outName(inputs[0], "pii.json"), mime: "application/json",
              data: Buffer.from(JSON.stringify(report, null, 2), "utf8") }];
  },

  "redact-pii": async (inputs, options) => {
    const opts = piiOptions(options);
    if (options.mask_char) opts.maskChar = String(options.mask_char)[0];
    const out = piiMask(inputs[0].data.toString("utf8"), opts);
    const ext = (inputs[0].filename.match(/\.([a-z0-9]+)$/i)?.[1] ?? "txt").toLowerCase();
    return [{ filename: outName(inputs[0], `redacted.${ext}`), mime: "text/plain",
              data: Buffer.from(out, "utf8") }];
  },

  "generate-qr": async (_inputs, options) => {
    const opts = {
      errorCorrectionLevel: options.ecc || "M",
      margin: options.margin ?? 2,
      width: options.size ?? 512,
    };
    if ((options.format ?? "png") === "svg") {
      const svg = await QRCode.toString(options.text, { ...opts, type: "svg" });
      return [{ filename: "qr.svg", mime: "image/svg+xml", data: Buffer.from(svg, "utf8") }];
    }
    const data = await QRCode.toBuffer(options.text, { ...opts, type: "png" });
    return [{ filename: "qr.png", mime: "image/png", data }];
  },
};
