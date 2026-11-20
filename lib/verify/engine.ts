/**
 * Evidence Fusion + the Analysis Router.
 *
 * The classifier reads only the structured fields on each Signal, direction,
 * reliability, weight. It never asks a module what it thinks the answer is.
 * That is what keeps a single over-confident detector from deciding the verdict
 * and what makes new detectors safe to plug in later.
 *
 * THE RULE THAT SHAPES THE WHOLE THING: an "AI" conclusion may only come from
 * evidence the file itself declares: a C2PA manifest, or generator software
 * named in metadata. Nothing infers "AI" from pixels or prose, because nothing
 * honestly can in a browser. When the declarations are absent, the answer is
 * `inconclusive`, and that is a real answer rather than a failure.
 */

import { detectFile } from "@/lib/file-intel/detect";
import { analyseImageBytes, computeEla } from "./image";
import { computeTextStats, textSignals, TEXT_LIMITATIONS } from "./text";
import { analysePdf, pdfSignals } from "./document";
import { analyseOffice, officeSignals } from "./office";
import type {
  Classification,
  Confidence,
  ModuleRun,
  Reliability,
  Signal,
  TextStats,
  TimelineEvent,
  VerificationResult,
  VerifyFileInfo,
} from "./types";

/* ── Hash ─────────────────────────────────────────────────────────────────── */

/** SHA-256 of the file, so a user can prove exactly which bytes were analysed. */
export async function hashFile(file: Blob): Promise<string> {
  if (!crypto?.subtle) return "unavailable";
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── Fusion ───────────────────────────────────────────────────────────────── */

const RELIABILITY_FACTOR: Record<Reliability, number> = {
  strong: 1,
  moderate: 0.55,
  weak: 0.2,
};

export function fuse(signals: Signal[]): {
  classification: Classification;
  confidence: Confidence;
  summary: string;
} {
  let ai = 0;
  let human = 0;
  let edited = 0;

  for (const s of signals) {
    const w = s.weight * RELIABILITY_FACTOR[s.reliability];
    if (s.direction === "ai") ai += w;
    else if (s.direction === "human") human += w;
    else if (s.direction === "edited") edited += w;
  }

  // A declaration is the only thing that can carry an AI verdict.
  const declared = signals.some(
    (s) => s.direction === "ai" && s.reliability === "strong" && s.weight >= 0.5,
  );
  const cameraEvidence = signals.some(
    (s) => s.direction === "human" && s.reliability !== "weak" && s.weight >= 0.4,
  );

  let classification: Classification;
  let confidence: Confidence;
  let summary: string;

  if (declared && edited > 0.15) {
    classification = "likely-mixed";
    confidence = ai >= 0.7 ? "high" : "moderate";
    summary =
      "The file declares AI involvement in its own metadata or provenance, and also carries signs of editing afterwards. That combination is consistent with AI-assisted work, generated or partly generated, then worked on.";
  } else if (declared) {
    classification = "likely-ai";
    confidence = ai >= 0.8 ? "high" : "moderate";
    summary =
      "The file's own metadata or provenance names generative software. That is a declaration by the file rather than an inference from its content, which makes it the strongest kind of evidence available here.";
  } else if (cameraEvidence && edited > 0.25) {
    classification = "likely-mixed";
    confidence = "low";
    summary =
      "There is capture evidence consistent with a real device, alongside evidence the file was edited afterwards. This is the ordinary signature of an edited photograph. It is not evidence of AI, and no AI declaration was found.";
  } else if (cameraEvidence) {
    classification = "likely-human";
    confidence = human >= 0.6 ? "moderate" : "low";
    summary =
      "The file carries capture metadata consistent with a camera, and nothing declares AI involvement. Note that such metadata is editable, so this raises confidence rather than settling the question.";
  } else {
    classification = "inconclusive";
    confidence = "low";
    summary =
      "Nothing in this file declares how it was made, and there is no camera evidence either way. That is the normal state of almost any file downloaded from the internet, because platforms strip metadata. It is not a sign that anything is wrong. There simply isn't enough evidence here to say.";
  }

  return { classification, confidence, summary };
}

/* ── Limitations ──────────────────────────────────────────────────────────── */

function limitationsFor(kind: string, ranText: boolean): string[] {
  const base = [
    "Metadata can be removed, edited or copied between files, so both its presence and its absence can mislead.",
    "GigAI Verify reports what the file declares and what its structure shows. It cannot determine authorship or intent.",
    "No evidence of AI is not the same as evidence of no AI. Most files simply carry no provenance information at all.",
  ];

  if (kind === "image") {
    base.push(
      "Content Credentials are not cryptographically verified here. Presence is detected, the signature is not validated against a trust list.",
      "Error Level Analysis highlights differences in compression. Editing, exporting, screenshotting and social-media recompression all produce the same patterns as manipulation.",
    );
  }
  if (kind === "pdf" || kind === "document") {
    base.push(
      "Document metadata records the software that wrote the file, not who or what wrote the content inside it.",
    );
  }
  if (ranText) base.push(...TEXT_LIMITATIONS);

  return base;
}

/* ── Router ───────────────────────────────────────────────────────────────── */

export interface VerifyFileOptions {
  /** Run the slower passes (currently ELA on images). */
  deep?: boolean;
  /** Progress reporting: a note for the current stage, plus completed stages. */
  onStage?: (note: string, completed?: string[]) => void;
}

/** Analyse a file end to end. Every module failure degrades, never aborts. */
export async function verifyFile(
  file: File,
  opts: VerifyFileOptions = {},
): Promise<VerificationResult> {
  const stage = opts.onStage ?? (() => {});

  const modulesRun: ModuleRun[] = [];
  const signals: Signal[] = [];
  const timeline: TimelineEvent[] = [];
  let ela: VerificationResult["ela"];
  let textStats: TextStats | undefined;

  stage("Identifying file…");
  const detected = await detectFile(file);
  const hash = await hashFile(file);
  modulesRun.push({ module: "identification", ok: true });

  const info: VerifyFileInfo = {
    name: file.name,
    size: file.size,
    mime: detected.mime,
    label: detected.label,
    kind: detected.kind,
    hash,
  };

  if (detected.extensionMismatch) {
    signals.push({
      id: "extension-mismatch",
      category: "structure",
      title: "File extension doesn't match its contents",
      finding: `The name suggests one format but the file's bytes are ${detected.label}.`,
      direction: "neutral",
      reliability: "moderate",
      weight: 0,
      alternative:
        "Renaming a file by hand, or saving from an app that ignores extensions, causes this routinely. It is worth knowing but is not by itself suspicious.",
      module: "identification",
    });
  }

  /* ── Images ─────────────────────────────────────────────────────────── */
  if (detected.kind === "image") {
    stage("Reading metadata and provenance…", ["Identified file"]);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const analysis = analyseImageBytes(bytes);
      signals.push(...analysis.signals);
      modulesRun.push({ module: "exif", ok: true });
      modulesRun.push({ module: "c2pa", ok: true });
      modulesRun.push({ module: "structure", ok: true });

      if (analysis.exif?.dateTimeOriginal) {
        timeline.push({
          label: "Captured",
          when: analysis.exif.dateTimeOriginal,
          detail:
            [analysis.exif.make, analysis.exif.model].filter(Boolean).join(" ") || undefined,
        });
      }
      if (analysis.exif?.software) {
        timeline.push({ label: "Processed", detail: analysis.exif.software });
      }
      if (analysis.exif?.dateTimeModified) {
        timeline.push({ label: "Modified", when: analysis.exif.dateTimeModified });
      }
      if (analysis.c2pa.present) {
        timeline.push({
          label: "Content Credentials attached",
          detail: analysis.c2pa.claims[0],
        });
      }

      const bitmap = await createImageBitmap(file).catch(() => null);
      if (bitmap) {
        info.width = bitmap.width;
        info.height = bitmap.height;
        bitmap.close();
      }
    } catch (err) {
      modulesRun.push({
        module: "image",
        ok: false,
        reason: err instanceof Error ? err.message : "Image bytes could not be read.",
      });
    }

    if (opts.deep) {
      stage("Running Error Level Analysis…", ["Identified file", "Read metadata"]);
      try {
        ela = (await computeEla(file)) ?? undefined;
        modulesRun.push({
          module: "ela",
          ok: Boolean(ela),
          reason: ela ? undefined : "The image could not be re-encoded for ELA.",
        });
      } catch {
        modulesRun.push({
          module: "ela",
          ok: false,
          reason: "ELA could not run on this image.",
        });
      }
    }
  } else if (detected.kind === "pdf") {
    /* ── PDFs ───────────────────────────────────────────────────────── */
    stage("Reading document metadata and structure…", ["Identified file"]);
    try {
      const forensics = await analysePdf(file);
      signals.push(...pdfSignals(forensics));
      info.pages = forensics.pages;
      modulesRun.push({ module: "pdf-metadata", ok: true });
      modulesRun.push({ module: "pdf-structure", ok: true });

      if (forensics.created) {
        timeline.push({
          label: "Created",
          when: forensics.created,
          detail: forensics.creator,
        });
      }
      if (forensics.modified && forensics.modified !== forensics.created) {
        timeline.push({
          label: "Modified",
          when: forensics.modified,
          detail: forensics.producer,
        });
      }
      if (forensics.incrementalUpdates > 0) {
        timeline.push({
          label: "Re-saved",
          detail: `${forensics.incrementalUpdates} incremental update${
            forensics.incrementalUpdates === 1 ? "" : "s"
          }`,
        });
      }

      if (forensics.text.length > 200) {
        stage("Analysing text…", ["Identified file", "Read metadata"]);
        textStats = computeTextStats(forensics.text);
        signals.push(...textSignals(textStats));
        modulesRun.push({ module: "text", ok: true });
      } else {
        modulesRun.push({
          module: "text",
          ok: false,
          reason: "This PDF has little or no extractable text. It may be a scan.",
        });
      }
    } catch (err) {
      modulesRun.push({
        module: "pdf",
        ok: false,
        reason: err instanceof Error ? err.message : "The PDF could not be read.",
      });
    }
  } else if (detected.kind === "video" || detected.kind === "audio") {
    /* ── Media ──────────────────────────────────────────────────────── */
    stage("Reading media properties…", ["Identified file"]);
    try {
      const bytes = new Uint8Array(await file.slice(0, 2 * 1024 * 1024).arrayBuffer());
      const analysis = analyseImageBytes(bytes); // reuses provenance + fingerprint scan

      // Only the provenance and fingerprint signals are meaningful for media;
      // the JPEG-structure signal is not, so it is filtered out.
      signals.push(
        ...analysis.signals.filter(
          (s) =>
            s.id !== "jpeg-structure" && s.id !== "exif-absent" && s.id !== "camera-absent",
        ),
      );
      modulesRun.push({ module: "c2pa", ok: true });

      if (detected.kind === "video") {
        const { getMetadata } = await import("@/lib/video-tools/probe");
        const meta = await getMetadata(file);
        info.width = meta.width;
        info.height = meta.height;
        info.duration = meta.durationSec;
        modulesRun.push({ module: "video-properties", ok: true });
      } else {
        const { getAudioMetadata } = await import("@/lib/audio-tools/metadata");
        const meta = await getAudioMetadata(file);
        info.duration = meta.duration;
        modulesRun.push({ module: "audio-properties", ok: true });
      }

      signals.push({
        id: "media-no-model",
        category: "content",
        title: "No synthetic-media detector available",
        finding:
          "GigAI Verify does not run a deepfake or synthetic-voice model in your browser, so the media itself was not assessed: only its provenance and metadata.",
        direction: "neutral",
        reliability: "weak",
        weight: 0,
        alternative:
          "A model that ran here would have to be small enough to download, and small detectors are unreliable enough that reporting their output would mislead more than it helped.",
        module: "media",
      });
    } catch (err) {
      modulesRun.push({
        module: detected.kind,
        ok: false,
        reason: err instanceof Error ? err.message : "Media properties could not be read.",
      });
    }
  } else if (/word|presentation|spreadsheet/.test(detected.mime)) {
    /* ── Office packages (DOCX / PPTX / XLSX) ───────────────────────── */
    stage("Reading document properties…", ["Identified file"]);
    const kind = /word/.test(detected.mime)
      ? "docx"
      : /presentation/.test(detected.mime)
        ? "pptx"
        : "xlsx";
    try {
      const office = await analyseOffice(file, kind);
      signals.push(...officeSignals(office));
      modulesRun.push({ module: "office", ok: true });

      if (office.created) {
        timeline.push({ label: "Created", when: office.created, detail: office.creator });
      }
      if (office.modified && office.modified !== office.created) {
        timeline.push({ label: "Last saved", when: office.modified, detail: office.lastModifiedBy });
      }
      if (office.application) {
        timeline.push({ label: "Written by", detail: office.application });
      }

      if (office.text.length > 200) {
        stage("Analysing text…", ["Identified file", "Read properties"]);
        textStats = computeTextStats(office.text);
        signals.push(...textSignals(textStats));
        modulesRun.push({ module: "text", ok: true });
      } else {
        modulesRun.push({
          module: "text",
          ok: false,
          reason: "This document has little or no extractable text.",
        });
      }
    } catch (err) {
      modulesRun.push({
        module: "office",
        ok: false,
        reason: err instanceof Error ? err.message : "The document could not be read.",
      });
    }
  } else {
    /* ── Everything else ────────────────────────────────────────────── */
    stage("Reading content…", ["Identified file"]);
    try {
      const bytes = new Uint8Array(await file.slice(0, 4 * 1024 * 1024).arrayBuffer());
      const analysis = analyseImageBytes(bytes);
      signals.push(
        ...analysis.signals.filter(
          (s) => s.category === "provenance" || s.id === "generator-fingerprint",
        ),
      );
      modulesRun.push({ module: "c2pa", ok: true });

      const firstWord = detected.label.split(" ")[0]?.toLowerCase() ?? "";
      if (/^text\/|json|csv|markdown/.test(detected.mime) || ["txt", "md", "csv"].includes(firstWord)) {
        const text = await file.slice(0, 2 * 1024 * 1024).text();
        if (text.trim().length > 0) {
          textStats = computeTextStats(text);
          signals.push(...textSignals(textStats));
          modulesRun.push({ module: "text", ok: true });
        }
      } else {
        modulesRun.push({
          module: "document",
          ok: false,
          reason: `${detected.label} contents can't be inspected in the browser yet. Only provenance and file identity were checked.`,
        });
      }
    } catch (err) {
      modulesRun.push({
        module: "content",
        ok: false,
        reason: err instanceof Error ? err.message : "The file could not be read.",
      });
    }
  }

  stage("Weighing the evidence…", ["Identified file", "Read metadata", "Checked provenance"]);

  const fused = fuse(signals);
  const supporting = signals.filter((s) => s.direction !== "neutral" && s.weight > 0);
  const conflicting = supporting.filter((s) =>
    fused.classification === "likely-ai" ? s.direction === "human" : s.direction === "ai",
  );
  const neutral = signals.filter((s) => s.direction === "neutral" || s.weight === 0);

  return {
    file: info,
    analysedAt: new Date().toISOString(),
    classification: fused.classification,
    confidence: fused.confidence,
    summary: fused.summary,
    signals,
    supporting: supporting.filter((s) => !conflicting.includes(s)),
    conflicting,
    neutral,
    timeline,
    found: buildFound(signals, modulesRun),
    limitations: limitationsFor(detected.kind, Boolean(textStats)),
    modulesRun,
    ela,
    textStats,
  };
}

/**
 * Analyse a public web page by its URL.
 *
 * SCOPE, stated honestly and reflected in the UI: this reads the page's TEXT.
 * It does not fetch or inspect the images on the page: the proxy returns text,
 * and pretending otherwise would produce an assessment of something we never
 * looked at. To check an image, download it and drop the file in.
 *
 * The fetch goes through the existing same-origin proxy, which is already
 * SSRF-fenced. The page content is not stored anywhere.
 */
export async function verifyUrl(url: string, opts: VerifyFileOptions = {}): Promise<VerificationResult> {
  const stage = opts.onStage ?? (() => {});
  stage("Fetching the page…");

  const { proxyFetchText } = await import("@/lib/api");
  const html = await proxyFetchText(url);

  stage("Reading the page…", ["Fetched the page"]);

  // Strip scripts and styles before tags, or their contents leak into the text.
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const signals: Signal[] = [];
  const modulesRun: ModuleRun[] = [{ module: "fetch", ok: true }];

  // A generator meta tag names the publishing platform, and occasionally an
  // AI writing tool. Same rule as everywhere: a declaration counts, a guess
  // does not.
  const generatorMeta = /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']{2,120})["']/i.exec(html)?.[1];
  const { generators } = (await import("./image")).findFingerprints([generatorMeta ?? "", html.slice(0, 4000)]);

  if (generators.length) {
    signals.push({
      id: "url-generator",
      category: "metadata",
      title: "Generative software named in the page",
      finding: `The page's markup references ${generators.join(", ")}.`,
      direction: "ai",
      reliability: "moderate",
      weight: 0.5,
      evidence: { references: generators.join(", "), ...(generatorMeta ? { generatorMeta } : {}) },
      alternative:
        "A page can mention an AI tool because it is writing ABOUT one. This is far weaker than the same name found inside a file's own metadata.",
      module: "url",
    });
  } else if (generatorMeta) {
    signals.push({
      id: "url-platform",
      category: "metadata",
      title: "Publishing platform declared",
      finding: `The page declares it was generated by ${generatorMeta}.`,
      direction: "neutral",
      reliability: "weak",
      weight: 0,
      evidence: { generator: generatorMeta },
      alternative: "This names the CMS or site builder, which says nothing about who wrote the words.",
      module: "url",
    });
  }

  let textStats: VerificationResult["textStats"];
  if (text.length > 200) {
    stage("Analysing text…", ["Fetched the page", "Read the page"]);
    textStats = computeTextStats(text);
    signals.push(...textSignals(textStats));
    modulesRun.push({ module: "text", ok: true });
  } else {
    modulesRun.push({
      module: "text",
      ok: false,
      reason: "Too little readable text was returned, the page may render its content with JavaScript, which this fetch does not run.",
    });
  }

  modulesRun.push({
    module: "images",
    ok: false,
    reason: "Images on the page were not fetched or inspected. To check an image, download it and drop the file in.",
  });

  const fused = fuse(signals);
  const supporting = signals.filter((s) => s.direction !== "neutral" && s.weight > 0);

  return {
    file: {
      name: url,
      size: html.length,
      mime: "text/html",
      label: "Web page",
      kind: "url",
      hash: await hashFile(new Blob([html])),
    },
    analysedAt: new Date().toISOString(),
    classification: fused.classification,
    confidence: fused.confidence,
    summary: fused.summary,
    signals,
    supporting,
    conflicting: [],
    neutral: signals.filter((s) => s.direction === "neutral" || s.weight === 0),
    timeline: [],
    found: buildFound(signals, modulesRun),
    limitations: [
      "Only the page's text was analysed. Images, video and embedded files on the page were not fetched or inspected.",
      "The fetch does not run JavaScript, so a page that renders its content client-side may yield little or no text.",
      ...limitationsFor("text", Boolean(textStats)),
    ],
    modulesRun,
    textStats,
  };
}

/** The "What we found" checklist, ticks, warnings and dashes, never a verdict. */
function buildFound(
  signals: Signal[],
  modules: ModuleRun[],
): { ok: boolean | null; text: string }[] {
  const has = (id: string) => signals.some((s) => s.id === id);
  const out: { ok: boolean | null; text: string }[] = [];

  out.push(
    has("c2pa-present")
      ? { ok: true, text: "Content Credentials present" }
      : { ok: null, text: "No Content Credentials (normal: most files have none)" },
  );

  if (has("camera-present")) {
    out.push({ ok: true, text: "Camera information available" });
  } else if (has("exif-absent")) {
    out.push({ ok: null, text: "No metadata (routinely stripped by platforms)" });
  }

  if (has("generator-fingerprint") || has("pdf-generator")) {
    out.push({ ok: false, text: "Generative software named in metadata" });
  }
  if (has("editor-fingerprint") || has("pdf-editor")) {
    out.push({ ok: false, text: "Editing software detected" });
  }
  if (has("pdf-incremental")) {
    out.push({ ok: false, text: "Document modified after creation" });
  }
  if (has("extension-mismatch")) {
    out.push({ ok: false, text: "Extension doesn't match contents" });
  }
  if (has("jpeg-structure") || has("pdf-fonts")) {
    out.push({ ok: true, text: "File structure read successfully" });
  }

  for (const m of modules.filter((m) => !m.ok)) {
    out.push({ ok: null, text: m.reason ?? `${m.module} could not run` });
  }

  return out;
}
