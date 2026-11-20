/**
 * Office document internals, DOCX, PPTX, XLSX.
 *
 * An OOXML file is a ZIP. Two small XML parts inside it carry the interesting
 * provenance: `docProps/core.xml` (author, last modified by, created/modified
 * timestamps, revision number) and `docProps/app.xml` (the application that
 * wrote it, total editing time, word/slide counts).
 *
 * THE CLAIM DISCIPLINE, same as everywhere in Verify: "Application: Microsoft
 * Word" is a fact about which program saved the file. It is NOT evidence a
 * human wrote the content: AI-drafted text pasted into Word and saved looks
 * exactly like this. The signal is emitted as neutral for precisely that reason.
 *
 * SECURITY: parsing is bounded (entry count, per-entry size) and the XML is
 * read with regex against known tag names rather than a DOM parser, so a hostile
 * document cannot expand into an XXE or a billion-laughs bomb. Nothing extracted
 * is ever inserted into the page as markup.
 */

import type { Signal } from "./types";
import { findFingerprints } from "./image";

export interface OfficeForensics {
  kind: "docx" | "pptx" | "xlsx" | "unknown";
  creator?: string;
  lastModifiedBy?: string;
  created?: string;
  modified?: string;
  revision?: string;
  application?: string;
  appVersion?: string;
  /** Minutes the document was reportedly open for editing. */
  totalEditTime?: number;
  words?: number;
  pages?: number;
  slides?: number;
  /** Embedded media files found in the package. */
  mediaCount: number;
  /** True when the package declares macros (.docm-style content). */
  hasMacros: boolean;
  /** Extracted body text, for the text pipeline. */
  text: string;
  /** Strings scanned for generator fingerprints. */
  metaStrings: string[];
}

/** Hard caps: a hostile ZIP must not be able to exhaust memory. */
const MAX_ENTRIES = 2000;
const MAX_PART_BYTES = 8 * 1024 * 1024;

function tag(xml: string, name: string): string | undefined {
  // Attributes are allowed on the open tag; the value is taken verbatim.
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]{0,4000}?)</${name}>`).exec(xml);
  const raw = m?.[1]?.trim();
  if (!raw) return undefined;
  return raw
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Parse an OOXML package. Throws with a readable message. */
export async function analyseOffice(file: File, kind: OfficeForensics["kind"]): Promise<OfficeForensics> {
  const { unzipSync } = await import("fflate");
  const bytes = new Uint8Array(await file.arrayBuffer());

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes, {
      // Only the parts we actually read, plus body/media for counting. Skipping
      // everything else keeps a 200MB deck from being fully inflated in memory.
      filter: (f) =>
        f.name.startsWith("docProps/") ||
        f.name.startsWith("word/media/") ||
        f.name.startsWith("ppt/media/") ||
        f.name.startsWith("xl/media/") ||
        f.name === "word/document.xml" ||
        f.name === "word/vbaProject.bin" ||
        /^ppt\/slides\/slide\d+\.xml$/.test(f.name) ||
        f.name === "xl/sharedStrings.xml",
    });
  } catch {
    throw new Error("This file isn't a readable Office package. It may be corrupt or password-protected.");
  }

  const names = Object.keys(entries);
  if (names.length > MAX_ENTRIES) {
    throw new Error("This document contains an unusual number of parts and wasn't parsed, as a safety precaution.");
  }

  const decode = (name: string): string => {
    const part = entries[name];
    if (!part || part.length > MAX_PART_BYTES) return "";
    return new TextDecoder("utf-8").decode(part);
  };

  const core = decode("docProps/core.xml");
  const app = decode("docProps/app.xml");

  // Body text: enough to characterise the writing without holding a whole book.
  let text = "";
  const bodyParts = names.filter(
    (n) => n === "word/document.xml" || /^ppt\/slides\/slide\d+\.xml$/.test(n) || n === "xl/sharedStrings.xml",
  );
  for (const name of bodyParts) {
    const xml = decode(name);
    for (const m of xml.matchAll(/<(?:w|a):t[^>]*>([\s\S]{0,2000}?)<\/(?:w|a):t>/g)) {
      text += m[1] + " ";
    }
    for (const m of xml.matchAll(/<t[^>]*>([\s\S]{0,2000}?)<\/t>/g)) text += m[1] + " ";
    if (text.length > 200_000) break;
  }

  const totalEditTime = Number.parseInt(tag(app, "TotalTime") ?? "", 10);
  const words = Number.parseInt(tag(app, "Words") ?? "", 10);
  const pages = Number.parseInt(tag(app, "Pages") ?? "", 10);
  const slides = Number.parseInt(tag(app, "Slides") ?? "", 10);

  const metaStrings = [
    tag(core, "dc:creator"),
    tag(core, "cp:lastModifiedBy"),
    tag(core, "dc:title"),
    tag(core, "dc:subject"),
    tag(core, "cp:keywords"),
    tag(app, "Application"),
    tag(app, "Company"),
  ].filter((v): v is string => Boolean(v));

  return {
    kind,
    creator: tag(core, "dc:creator"),
    lastModifiedBy: tag(core, "cp:lastModifiedBy"),
    created: tag(core, "dcterms:created"),
    modified: tag(core, "dcterms:modified"),
    revision: tag(core, "cp:revision"),
    application: tag(app, "Application"),
    appVersion: tag(app, "AppVersion"),
    totalEditTime: Number.isFinite(totalEditTime) ? totalEditTime : undefined,
    words: Number.isFinite(words) ? words : undefined,
    pages: Number.isFinite(pages) ? pages : undefined,
    slides: Number.isFinite(slides) ? slides : undefined,
    mediaCount: names.filter((n) => /\/media\//.test(n)).length,
    hasMacros: names.some((n) => n.endsWith("vbaProject.bin")),
    text: text.replace(/\s+/g, " ").trim(),
    metaStrings,
  };
}

export function officeSignals(f: OfficeForensics): Signal[] {
  const signals: Signal[] = [];
  const { generators, editors } = findFingerprints(f.metaStrings);

  if (generators.length) {
    signals.push({
      id: "office-generator",
      category: "metadata",
      title: "Generative software named in document properties",
      finding: `The document's properties reference ${generators.join(", ")}.`,
      direction: "ai",
      reliability: "strong",
      weight: 0.8,
      evidence: { software: generators.join(", ") },
      alternative: "Document properties are editable, and a tool that merely processed the file can write its own name in.",
      module: "office",
    });
  }

  if (f.application) {
    signals.push({
      id: "office-application",
      category: "metadata",
      title: "Authoring application recorded",
      finding: `Saved by ${f.application}${f.appVersion ? ` (version ${f.appVersion})` : ""}.`,
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      evidence: {
        application: f.application,
        ...(f.appVersion ? { version: f.appVersion } : {}),
        ...(f.creator ? { creator: f.creator } : {}),
        ...(f.lastModifiedBy ? { lastModifiedBy: f.lastModifiedBy } : {}),
      },
      alternative:
        "This names the program that wrote the file, not who or what wrote the content. Text drafted anywhere and pasted into Word saves exactly like this.",
      module: "office",
    });
  }

  if (f.creator && f.lastModifiedBy && f.creator !== f.lastModifiedBy) {
    signals.push({
      id: "office-authors-differ",
      category: "metadata",
      title: "Created and last modified by different people",
      finding: `Created by "${f.creator}", last saved by "${f.lastModifiedBy}".`,
      direction: "edited",
      reliability: "weak",
      weight: 0.2,
      evidence: { creator: f.creator, lastModifiedBy: f.lastModifiedBy },
      alternative:
        "Completely normal for any shared or reviewed document: a colleague opening and saving it produces this.",
      module: "office",
    });
  }

  // Editing time is the one genuinely interesting number in an OOXML package.
  if (typeof f.totalEditTime === "number" && typeof f.words === "number" && f.words > 300) {
    const wordsPerMinute = f.totalEditTime > 0 ? f.words / f.totalEditTime : Infinity;
    if (f.totalEditTime <= 1 || wordsPerMinute > 500) {
      signals.push({
        id: "office-edit-time",
        category: "metadata",
        title: "Very little editing time for the amount of text",
        finding:
          f.totalEditTime <= 1
            ? `${f.words.toLocaleString()} words with essentially no recorded editing time.`
            : `${f.words.toLocaleString()} words across ${f.totalEditTime} minutes of recorded editing, about ${Math.round(wordsPerMinute)} words per minute.`,
        direction: "neutral",
        reliability: "weak",
        weight: 0,
        evidence: {
          words: f.words,
          totalEditTimeMinutes: f.totalEditTime,
          ...(Number.isFinite(wordsPerMinute) ? { wordsPerMinute: Math.round(wordsPerMinute) } : {}),
        },
        alternative:
          "Text written elsewhere and pasted in records almost no editing time, which is equally true of a human drafting in another app, converting from PDF, or restoring from a template. Editing time is also trivially reset by a single save in another program. Interesting, not conclusive.",
        module: "office",
      });
    }
  }

  if (f.hasMacros) {
    signals.push({
      id: "office-macros",
      category: "structure",
      title: "Document contains macros",
      finding: "A VBA macro project is embedded. GigAI Verify never executes it.",
      direction: "neutral",
      reliability: "moderate",
      weight: 0,
      alternative:
        "Macros are a legitimate Office feature, though they are also the classic malware vector, worth knowing before you open this in Word.",
      module: "office",
    });
  }

  if (editors.length) {
    signals.push({
      id: "office-editor",
      category: "metadata",
      title: "Additional software fingerprints",
      finding: `The document references ${editors.join(", ")}.`,
      direction: "edited",
      reliability: "weak",
      weight: 0.2,
      evidence: { software: editors.join(", ") },
      alternative: "Normal document preparation involves several tools.",
      module: "office",
    });
  }

  signals.push({
    id: "office-structure",
    category: "structure",
    title: "Package contents read",
    finding: `${f.kind.toUpperCase()} package${f.mediaCount ? ` with ${f.mediaCount} embedded media file${f.mediaCount === 1 ? "" : "s"}` : " with no embedded media"}${f.revision ? `, revision ${f.revision}` : ""}.`,
    direction: "neutral",
    reliability: "weak",
    weight: 0,
    evidence: {
      mediaFiles: f.mediaCount,
      ...(f.revision ? { revision: f.revision } : {}),
      ...(f.pages ? { pages: f.pages } : {}),
      ...(f.slides ? { slides: f.slides } : {}),
      ...(f.words ? { words: f.words } : {}),
    },
    alternative: "Package structure describes how the file was assembled, not who authored its content.",
    module: "office",
  });

  return signals;
}
