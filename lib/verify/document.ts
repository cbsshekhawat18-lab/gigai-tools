/**
 * PDF forensics, metadata, structure, fonts and embedded risk.
 *
 * Reuses the existing pdf.js loader rather than parsing PDFs by hand. What this
 * adds is the *structural* read that no other GigAI tool does: incremental
 * updates, embedded vs referenced fonts, attachments and JavaScript.
 *
 * The honesty line, same as everywhere else: "Producer: Microsoft Word" is a
 * fact and a weak signal. It is not proof a human wrote the document, and the
 * copy never says it is.
 */

import type { Signal } from "./types";
import { findFingerprints } from "./image";

export interface PdfForensics {
  pages: number;
  version?: string;
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  created?: string;
  modified?: string;
  fontsTotal: number;
  fontsEmbedded: number;
  /** Number of `%%EOF` markers; more than one means incremental updates. */
  incrementalUpdates: number;
  hasJavaScript: boolean;
  hasAttachments: boolean;
  hasAcroForm: boolean;
  hasXmp: boolean;
  /** Text extracted from the first pages, for the text pipeline. */
  text: string;
  /** Strings scanned for generator fingerprints. */
  metaStrings: string[];
}

/** Parse a PDF's metadata and structure. Throws with a readable message. */
export async function analysePdf(file: File): Promise<PdfForensics> {
  const { openPdfDocument } = await import("@/lib/pdf/core");
  const bytes = new Uint8Array(await file.arrayBuffer());

  // Raw-byte facts first, these survive even when pdf.js won't fully parse.
  const raw = latin1(bytes);
  const eofCount = (raw.match(/%%EOF/g) ?? []).length;
  const version = /^%PDF-(\d\.\d)/.exec(raw)?.[1];
  const hasJavaScript = /\/JavaScript|\/JS\s*[<(\[]/.test(raw);
  const hasAttachments = /\/EmbeddedFiles|\/Filespec/.test(raw);
  const hasXmp = /<x:xmpmeta/.test(raw);

  const doc = await openPdfDocument(file);
  try {
    const meta = await doc.getMetadata().catch(() => null);
    const info = (meta?.info ?? {}) as Record<string, string>;

    // Fonts across the first pages, enough to characterise the document
    // without walking a 500-page file.
    const fontKeys = new Set<string>();
    const embedded = new Set<string>();
    let text = "";
    const scanPages = Math.min(doc.numPages, 10);

    for (let n = 1; n <= scanPages; n++) {
      const page = await doc.getPage(n);
      try {
        const ops = await page.getOperatorList().catch(() => null);
        void ops;
        const content = await page.getTextContent().catch(() => null);
        if (content) {
          for (const item of content.items as { str?: string; fontName?: string }[]) {
            if (item.str) text += item.str + " ";
          }
        }
        // pdf.js exposes the page's font objects on its internal cache; the
        // public surface is `commonObjs`, keyed by font id.
        const objs = (page as unknown as { commonObjs?: { _objs?: Record<string, unknown> } }).commonObjs?._objs ?? {};
        for (const [key, value] of Object.entries(objs)) {
          if (!key.startsWith("g_") && !/^[a-z]\d+$/i.test(key)) continue;
          const font = (value as { data?: { name?: string; file?: unknown; loadedName?: string } })?.data;
          if (!font?.name) continue;
          fontKeys.add(font.name);
          if (font.file) embedded.add(font.name);
        }
      } finally {
        page.cleanup();
      }
      if (text.length > 40000) break;
    }

    const metaStrings = [
      info.Creator ?? "",
      info.Producer ?? "",
      info.Title ?? "",
      info.Author ?? "",
      info.Subject ?? "",
      info.Keywords ?? "",
    ].filter(Boolean);

    // XMP often names the generating tool even when Info doesn't.
    const xmp = /<x:xmpmeta[\s\S]{0,20000}?<\/x:xmpmeta>/.exec(raw)?.[0];
    if (xmp) {
      for (const m of xmp.matchAll(/>([^<>]{4,90})</g)) metaStrings.push(m[1]!.trim());
    }

    return {
      pages: doc.numPages,
      version,
      title: info.Title,
      author: info.Author,
      creator: info.Creator,
      producer: info.Producer,
      created: pdfDate(info.CreationDate),
      modified: pdfDate(info.ModDate),
      fontsTotal: fontKeys.size,
      fontsEmbedded: embedded.size,
      incrementalUpdates: Math.max(0, eofCount - 1),
      hasJavaScript,
      hasAttachments,
      hasAcroForm: /\/AcroForm/.test(raw),
      hasXmp,
      text: text.trim(),
      metaStrings,
    };
  } finally {
    await doc.destroy();
  }
}

/** "D:20260812093000+01'00'" → "2026-08-12 09:30:00". */
function pdfDate(value?: string): string | undefined {
  if (!value) return undefined;
  const m = /^D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/.exec(value);
  if (!m) return value;
  const [, y, mo, d, h = "00", mi = "00", s = "00"] = m;
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

function latin1(bytes: Uint8Array): string {
  let out = "";
  const CHUNK = 0x8000;
  // Cap the scan: structural markers live near the start and end anyway, and
  // stringifying a 200MB PDF would exhaust memory for no benefit.
  const limit = Math.min(bytes.length, 8 * 1024 * 1024);
  for (let i = 0; i < limit; i += CHUNK) {
    out += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, limit)));
  }
  if (bytes.length > limit) {
    out += String.fromCharCode(...bytes.subarray(bytes.length - CHUNK));
  }
  return out;
}

export function pdfSignals(f: PdfForensics): Signal[] {
  const signals: Signal[] = [];
  const { generators, editors } = findFingerprints(f.metaStrings);

  if (generators.length) {
    signals.push({
      id: "pdf-generator",
      category: "metadata",
      title: "Generative software named in document metadata",
      finding: `The document's metadata references ${generators.join(", ")}.`,
      direction: "ai",
      reliability: "strong",
      weight: 0.8,
      evidence: { software: generators.join(", ") },
      alternative: "Metadata can be edited, and a tool that merely processed the file can leave its name behind.",
      module: "pdf-metadata",
    });
  }

  if (f.creator || f.producer) {
    signals.push({
      id: "pdf-authoring",
      category: "metadata",
      title: "Authoring software recorded",
      finding: `Created with ${f.creator ?? "an unnamed tool"}${f.producer && f.producer !== f.creator ? `, produced by ${f.producer}` : ""}.`,
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      evidence: {
        ...(f.creator ? { creator: f.creator } : {}),
        ...(f.producer ? { producer: f.producer } : {}),
        ...(f.author ? { author: f.author } : {}),
        ...(f.version ? { pdfVersion: f.version } : {}),
      },
      alternative:
        "A familiar name like Microsoft Word tells you which program wrote the file, not who or what wrote the content. AI-drafted text exported from Word looks identical here.",
      module: "pdf-metadata",
    });
  } else {
    signals.push({
      id: "pdf-no-authoring",
      category: "metadata",
      title: "No authoring software recorded",
      finding: "The PDF carries no Creator or Producer metadata.",
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      alternative: "Many exporters and privacy tools strip these fields. It is not evidence of anything.",
      module: "pdf-metadata",
    });
  }

  if (editors.length) {
    signals.push({
      id: "pdf-editor",
      category: "metadata",
      title: "Editing software detected",
      finding: `The document references ${editors.join(", ")}.`,
      direction: "edited",
      reliability: "moderate",
      weight: 0.3,
      evidence: { software: editors.join(", ") },
      alternative: "Normal document preparation involves editing tools.",
      module: "pdf-metadata",
    });
  }

  if (f.incrementalUpdates > 0) {
    signals.push({
      id: "pdf-incremental",
      category: "structure",
      title: "Document was modified after creation",
      finding: `${f.incrementalUpdates} incremental update${f.incrementalUpdates === 1 ? "" : "s"} found; the file was saved again after it was first written.`,
      direction: "edited",
      reliability: "moderate",
      weight: 0.3,
      evidence: { incrementalUpdates: f.incrementalUpdates },
      alternative:
        "Filling a form, signing, annotating or simply re-saving all append an incremental update. It is normal and does not imply anything was concealed.",
      module: "pdf-structure",
    });
  }

  if (f.fontsTotal > 0) {
    const missing = f.fontsTotal - f.fontsEmbedded;
    signals.push({
      id: "pdf-fonts",
      category: "structure",
      title: "Font embedding",
      finding: `${f.fontsTotal} font${f.fontsTotal === 1 ? "" : "s"} detected, ${f.fontsEmbedded} embedded, ${missing} not embedded.`,
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      evidence: { total: f.fontsTotal, embedded: f.fontsEmbedded, notEmbedded: missing },
      alternative:
        "Non-embedded fonts mean the document relies on the reader's system fonts: common, and a portability issue rather than a provenance one.",
      module: "pdf-structure",
    });
  }

  if (f.hasJavaScript) {
    signals.push({
      id: "pdf-javascript",
      category: "structure",
      title: "Embedded JavaScript present",
      finding: "This PDF contains JavaScript. GigAI Verify never executes it.",
      direction: "neutral",
      reliability: "moderate",
      weight: 0,
      alternative:
        "Interactive forms legitimately use JavaScript for validation. It is worth knowing about before opening the file in a reader that runs it.",
      module: "pdf-structure",
    });
  }

  if (f.hasAttachments) {
    signals.push({
      id: "pdf-attachments",
      category: "structure",
      title: "Embedded file attachments",
      finding: "This PDF carries embedded files.",
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      alternative: "Attachments are a normal PDF feature, used for source data and invoices.",
      module: "pdf-structure",
    });
  }

  if (f.created && f.modified && f.created !== f.modified) {
    signals.push({
      id: "pdf-timestamps",
      category: "metadata",
      title: "Creation and modification times differ",
      finding: `Created ${f.created}, modified ${f.modified}.`,
      direction: "edited",
      reliability: "weak",
      weight: 0.15,
      evidence: { created: f.created, modified: f.modified },
      alternative: "Any re-save updates the modification date.",
      module: "pdf-metadata",
    });
  }

  return signals;
}
