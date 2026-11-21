/**
 * GigAI Tools, document release pre-flight ("what leaks if I send this?").
 *
 * This is the QA step that sits *after* redaction and *before* the file leaves
 * the building. It does not redact anything; it attacks a finished file the way
 * a journalist or opposing counsel would, and reports what it recovers.
 *
 * The flagship check is a **render-vs-text-layer comparison**, not a hunt for
 * black rectangles. We render each page to a canvas, then walk the extractable
 * text layer and ask, for every run: *can a human actually see this?* If a run
 * carries real characters but the pixels where it sits are a flat, featureless
 * block, then something is painted over it and the text underneath is still
 * extractable, a failed redaction. Doing it this way catches every covering
 * method at once (black boxes, white-out, pasted images, opaque annotations,
 * invisible render modes) instead of the one method a rectangle-scanner knows.
 *
 * Everything runs on-device. A file you are afraid to leak is the last file you
 * should upload to a scanner, so this one never uploads.
 */

import type { PDFPageProxy } from "pdfjs-dist/types/src/display/api";

import { detect as detectIndianPii, mask as maskAllIndianPii, maskValue as maskIndianPii } from "@/lib/vendor/indian-pii/index";
import type { DetectionResult } from "@/lib/vendor/indian-pii/index";
import { openPdfDocument, loadPdfjs, pageToCanvas } from "@/lib/pdf/core";
import { auditImage, fileKind as basicFileKind } from "./audit";

/* ── Model ─────────────────────────────────────────────────────────────────── */

export type LeakSeverity = "critical" | "high" | "medium" | "low";

/** Verdict for a single file, and for a whole batch. */
export type Verdict = "blocked" | "review" | "clear" | "error";

export interface LeakFinding {
  /** Stable check id, also the key used for grouping across a batch. */
  check: string;
  title: string;
  /** Plain-language explanation of why this matters. */
  detail: string;
  severity: LeakSeverity;
  /** Human location, e.g. "Page 3" or "Sheet “Q4 Model”". */
  where?: string;
  /**
   * Recovered content that proves the finding. Held back behind a reveal in the
   * UI. The whole point is that this text was supposed to be unreadable.
   */
  evidence?: string;
  /** How many times this check fired (findings are collapsed per check). */
  count: number;
}

export type ScanKind = "pdf" | "docx" | "xlsx" | "pptx" | "image" | "other";

export interface FileScan {
  name: string;
  size: number;
  kind: ScanKind;
  verdict: Verdict;
  findings: LeakFinding[];
  /** Pages/slides/sheets actually inspected. */
  inspected?: number;
  /** Total present, when we stopped short of inspecting all of them. */
  total?: number;
  error?: string;
}

export interface ScanOptions {
  /** Hard cap on pages rendered per PDF. Anything beyond is reported, never dropped silently. */
  maxPages?: number;
  /** Progress callback: (fileIndex, fileName, phase). */
  onProgress?: (done: number, total: number, label: string) => void;
}

const DEFAULT_MAX_PAGES = 40;

/** Severity ordering, highest first. */
const SEVERITY_RANK: Record<LeakSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortFindings(findings: LeakFinding[]): LeakFinding[] {
  return [...findings].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.title.localeCompare(b.title),
  );
}

/** blocked = something is recoverable that shouldn't be. review = worth a look. */
export function verdictFor(findings: LeakFinding[]): Verdict {
  if (findings.some((f) => f.severity === "critical")) return "blocked";
  if (findings.some((f) => f.severity === "high" || f.severity === "medium")) return "review";
  return "clear";
}

/** The worst verdict across a batch. What the whole production set is worth. */
export function rollUpVerdict(scans: FileScan[]): Verdict {
  if (scans.some((s) => s.verdict === "blocked")) return "blocked";
  if (scans.some((s) => s.verdict === "error")) return "error";
  if (scans.some((s) => s.verdict === "review")) return "review";
  return "clear";
}

export function scanKind(file: File): ScanKind {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx") || name.endsWith(".docm")) return "docx";
  if (name.endsWith(".xlsx") || name.endsWith(".xlsm")) return "xlsx";
  if (name.endsWith(".pptx") || name.endsWith(".pptm")) return "pptx";
  const basic = basicFileKind(file);
  if (basic === "pdf") return "pdf";
  if (basic === "image") return "image";
  return "other";
}

/* ── Finding accumulator ───────────────────────────────────────────────────── */

/**
 * Collapses repeated hits of the same check into one finding with a count and a
 * merged location list, so a 40-page document with a leak on every page reads as
 * one urgent line rather than forty.
 */
class Findings {
  private map = new Map<string, LeakFinding & { wheres: string[]; samples: string[] }>();

  add(f: Omit<LeakFinding, "count">): void {
    const existing = this.map.get(f.check);
    if (existing) {
      existing.count += 1;
      if (f.where && existing.wheres.length < 12 && !existing.wheres.includes(f.where)) {
        existing.wheres.push(f.where);
      }
      if (f.evidence && existing.samples.length < 8) existing.samples.push(f.evidence);
      return;
    }
    this.map.set(f.check, {
      ...f,
      count: 1,
      wheres: f.where ? [f.where] : [],
      samples: f.evidence ? [f.evidence] : [],
    });
  }

  list(): LeakFinding[] {
    return sortFindings(
      [...this.map.values()].map(({ wheres, samples, ...f }) => ({
        ...f,
        where: wheres.length ? wheres.join(", ") + (f.count > wheres.length ? ", …" : "") : undefined,
        evidence: samples.length ? samples.join("\n") : undefined,
      })),
    );
  }
}

/* ── PDF: render-vs-text-layer ─────────────────────────────────────────────── */

/**
 * A text run lifted into canvas pixel space, so it can be compared against what
 * was actually painted.
 */
interface PlacedRun {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** pdf.js text render mode; 3 = invisible (the OCR-layer trick). */
  invisible: boolean;
}

/** Luminance profile of a rectangular patch of the rendered page. */
interface Patch {
  min: number;
  max: number;
  mean: number;
}

function samplePatch(
  data: Uint8ClampedArray,
  W: number,
  H: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
): Patch | null {
  const left = Math.max(0, Math.floor(x0));
  const top = Math.max(0, Math.floor(y0));
  const right = Math.min(W, Math.ceil(x0 + w));
  const bottom = Math.min(H, Math.ceil(y0 + h));
  if (right - left < 2 || bottom - top < 2) return null;

  // Step so a very wide run costs the same as a short one.
  const stepX = Math.max(1, Math.floor((right - left) / 64));
  const stepY = Math.max(1, Math.floor((bottom - top) / 16));
  let min = 255;
  let max = 0;
  let sum = 0;
  let n = 0;
  for (let y = top; y < bottom; y += stepY) {
    for (let x = left; x < right; x += stepX) {
      const i = (y * W + x) * 4;
      // Rec. 601 luma is plenty for "is there ink here".
      const lum = ((data[i] ?? 0) * 299 + (data[i + 1] ?? 0) * 587 + (data[i + 2] ?? 0) * 114) / 1000;
      if (lum < min) min = lum;
      if (lum > max) max = lum;
      sum += lum;
      n += 1;
    }
  }
  return n ? { min, max, mean: sum / n } : null;
}

/**
 * Contrast floor below which we call a patch "featureless". Rendered glyphs put
 * dark strokes on a light ground (or the reverse), which comfortably clears 40
 * even for thin antialiased type; a solid fill sits near 0.
 */
const FLAT_CONTRAST = 34;
/** Runs smaller than this are too noisy to judge. */
const MIN_RUN_W = 6;
const MIN_RUN_H = 4;

function describeCover(mean: number): { label: string; detail: string } {
  if (mean < 90) {
    return {
      label: "black box",
      detail:
        "A dark shape is painted over the text, but the characters underneath were never deleted from the file.",
    };
  }
  if (mean > 200) {
    return {
      label: "white-out",
      detail:
        "The text is covered by a light fill, so it looks blank on screen while the characters remain in the file.",
    };
  }
  return {
    label: "opaque fill",
    detail:
      "A solid shape is painted over the text, but the characters underneath were never deleted from the file.",
  };
}

/**
 * Checksum-validated Indian identifiers inside RECOVERED text (indian-pii,
 * vendored - see lib/vendor/indian-pii/README.md). `requireValid` means an
 * Aadhaar must pass Verhoeff, a GSTIN its mod-36 check, and so on: a hit here
 * is a real identifier under a redaction, not a lookalike number. Evidence
 * shows the MASKED value - the report must not re-expose what leaked.
 */
function addPiiFindings(text: string, where: string, add: (f: Omit<LeakFinding, "count">) => void): void {
  let hits: DetectionResult[] = [];
  try {
    hits = detectIndianPii(text, { requireValid: true });
  } catch {
    return;
  }
  if (hits.length === 0) return;
  const types = [...new Set(hits.map((h) => h.type))].join(", ");
  add({
    check: "indian-pii-recovered",
    title: `Validated Indian ID recoverable (${types})`,
    detail:
      "The recoverable text contains identifiers that pass their official checksums - exactly the data a redaction exists to remove. Under India's DPDP Act this is the kind of disclosure that must be reported. Re-redact so the characters are genuinely deleted.",
    severity: "critical",
    where,
    evidence: `${where}: ${hits.map((h) => `${h.type} ${maskIndianPii(h.type, h.value)}`).join(", ")}`,
  });
}

/**
 * Trim recovered text for display: enough to prove the leak, not a data dump.
 * Checksum-valid identifiers are masked first - the report must prove the
 * text is recoverable without itself re-publishing an Aadhaar or PAN.
 */
function evidenceSnippet(text: string, where: string): string {
  let safe = text;
  try {
    safe = maskAllIndianPii(text, { requireValid: true });
  } catch {
    /* advisory only - never block the real finding */
  }
  const clean = safe.replace(/\s+/g, " ").trim();
  const cut = clean.length > 140 ? `${clean.slice(0, 140)}…` : clean;
  return `${where}: “${cut}”`;
}

async function placedRuns(
  page: PDFPageProxy,
  viewport: { transform: number[]; scale: number },
): Promise<PlacedRun[]> {
  const pdfjs = await loadPdfjs();
  const content = await page.getTextContent();
  const runs: PlacedRun[] = [];
  for (const raw of content.items) {
    const item = raw as {
      str?: string;
      width?: number;
      height?: number;
      transform?: number[];
      hasEOL?: boolean;
    };
    const text = item.str ?? "";
    if (!text.trim() || !item.transform) continue;

    // Into viewport (canvas) space: (m[4], m[5]) is the glyph baseline origin.
    const m = pdfjs.Util.transform(viewport.transform, item.transform);
    const h = Math.hypot(m[2], m[3]) || (item.height ?? 0) * viewport.scale;
    const w = (item.width ?? 0) * viewport.scale;
    if (w < MIN_RUN_W || h < MIN_RUN_H) continue;

    runs.push({
      text,
      x: m[4],
      y: m[5] - h,
      w,
      h,
      // pdf.js does not surface render mode on text items in every build; a run
      // that renders nothing at all is caught by the pixel comparison anyway.
      invisible: false,
    });
  }
  return runs;
}

/**
 * Scan one PDF. Renders each page (up to `maxPages`) and cross-examines the
 * extractable text layer against the pixels a reader would actually see.
 */
async function scanPdf(file: File, opts: Required<Pick<ScanOptions, "maxPages">>): Promise<FileScan> {
  const found = new Findings();
  const base: FileScan = {
    name: file.name,
    size: file.size,
    kind: "pdf",
    verdict: "clear",
    findings: [],
  };

  const doc = await openPdfDocument(file);
  try {
    const total = doc.numPages;
    const limit = Math.min(total, opts.maxPages);

    // ── Document-level checks (metadata, attachments, scripts) ───────────────
    try {
      const meta = (await doc.getMetadata()) as unknown as {
        info?: Record<string, unknown>;
        metadata?: { getAll?: () => Record<string, string> };
      };
      const info = meta.info ?? {};
      const author = String(info.Author ?? "").trim();
      if (author) {
        found.add({
          check: "pdf-author",
          title: "Author name embedded",
          detail:
            "The document properties name the person or organization that made this file. That travels with it to whoever receives it.",
          severity: "medium",
          evidence: author,
        });
      }
      const producer = [info.Producer, info.Creator]
        .map((v) => String(v ?? "").trim())
        .filter(Boolean)
        .join(" · ");
      if (producer) {
        found.add({
          check: "pdf-producer",
          title: "Authoring software recorded",
          detail:
            "The tool chain used to build the file is stored inside it. It can fingerprint an internal workflow, and sometimes leaks a file path or an internal server name.",
          severity: "low",
          evidence: producer,
        });
      }
      const xmp = meta.metadata?.getAll?.();
      if (xmp && Object.keys(xmp).length) {
        const trail = Object.entries(xmp)
          .filter(([k]) => /history|docid|instanceid|creatortool|author|manager/i.test(k))
          .slice(0, 4)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" · ");
        if (trail) {
          found.add({
            check: "pdf-xmp",
            title: "XMP edit history present",
            detail:
              "An XMP packet is carrying document identifiers and an editing trail. It can link this file to earlier drafts and to the machine that produced them.",
            severity: "medium",
            evidence: trail,
          });
        }
      }
    } catch {
      /* metadata is best-effort */
    }

    try {
      const attachments = (await doc.getAttachments()) as Record<string, unknown> | null;
      const names = attachments ? Object.keys(attachments) : [];
      if (names.length) {
        found.add({
          check: "pdf-attachment",
          title: "Embedded file attachment",
          detail:
            "This PDF carries other files inside it. They are shipped with the document and are frequently forgotten, an attached spreadsheet or source draft goes out with the release.",
          severity: "high",
          evidence: names.slice(0, 6).join(", "),
        });
      }
    } catch {
      /* not all builds expose attachments */
    }

    try {
      const js = (await (doc as unknown as { getJSActions?: () => Promise<unknown> }).getJSActions?.()) ?? null;
      if (js && Object.keys(js as Record<string, unknown>).length) {
        found.add({
          check: "pdf-js",
          title: "Embedded JavaScript",
          detail:
            "The document contains scripts. Many recipients' viewers block them, and some mail gateways quarantine the file outright.",
          severity: "medium",
        });
      }
    } catch {
      /* optional API */
    }

    // ── Page-level checks ────────────────────────────────────────────────────
    for (let n = 1; n <= limit; n += 1) {
      const page = await doc.getPage(n);
      const where = `Page ${n}`;
      try {
        // Annotations first; they are cheap and high-signal.
        try {
          const annots = (await page.getAnnotations()) as Array<Record<string, unknown>>;
          for (const a of annots) {
            const subtype = String(a.subtype ?? "");
            if (subtype === "Redact") {
              found.add({
                check: "pdf-redact-pending",
                title: "Redaction marked but never applied",
                detail:
                  "The file contains redaction annotations that were placed but not applied. Until they are applied, they are only marks on top. The content they cover is fully intact.",
                severity: "critical",
                where,
              });
            }
            const contents = String(a.contents ?? "").trim();
            if (contents && /Text|Popup|FreeText|Highlight|StrikeOut|Underline|Square|Ink/.test(subtype)) {
              found.add({
                check: "pdf-comment",
                title: "Reviewer comments left in the file",
                detail:
                  "Sticky notes and mark-ups stay in the PDF and are readable by anyone who opens it. Internal review chatter is a routine source of accidental disclosure.",
                severity: "high",
                where,
                evidence: evidenceSnippet(contents, where),
              });
              addPiiFindings(contents, where, (f) => found.add(f));
            }
            const title = String((a.titleObj as { str?: string } | undefined)?.str ?? a.title ?? "").trim();
            if (title) {
              found.add({
                check: "pdf-annot-author",
                title: "Comment author names",
                detail:
                  "Mark-ups carry the name of whoever made them, which discloses who worked on the document and when.",
                severity: "medium",
                where,
                evidence: title,
              });
            }
            const fieldValue = a.fieldValue;
            if (fieldValue != null && String(fieldValue).trim() && subtype === "Widget") {
              found.add({
                check: "pdf-form-value",
                title: "Filled form fields",
                detail:
                  "Form fields still hold their entered values. Flattening the form is what removes them. Printing to PDF usually does not.",
                severity: "high",
                where,
                evidence: evidenceSnippet(String(fieldValue), where),
              });
              addPiiFindings(String(fieldValue), where, (f) => found.add(f));
            }
          }
        } catch {
          /* annotations are best-effort */
        }

        // The flagship: is every extractable run actually visible?
        const viewport = page.getViewport({ scale: 1 });
        // ~900px wide is enough to resolve glyph strokes without a big cost.
        const scale = viewport.width > 0 ? Math.min(2, Math.max(0.75, 900 / viewport.width)) : 1;
        const scaled = page.getViewport({ scale });
        const runs = await placedRuns(page, {
          transform: scaled.transform as unknown as number[],
          scale,
        });
        if (runs.length) {
          const canvas = await pageToCanvas(page, scale);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const { data, width: W, height: H } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (const run of runs) {
              const patch = samplePatch(data, W, H, run.x, run.y, run.w, run.h);
              if (!patch) continue;
              if (patch.max - patch.min >= FLAT_CONTRAST) continue; // visibly rendered - fine

              const cover = describeCover(patch.mean);
              found.add({
                check: "text-under-cover",
                title: `Readable text hidden under a ${cover.label}`,
                detail: `${cover.detail} Anyone can recover it by selecting the page, running text extraction, or pasting the file into an AI assistant.`,
                severity: "critical",
                where,
                evidence: evidenceSnippet(run.text, where),
              });
              addPiiFindings(run.text, where, (f) => found.add(f));
            }
          }
          // Free the page bitmap promptly. Batches can be large.
          canvas.width = 0;
          canvas.height = 0;
        }
      } finally {
        page.cleanup();
      }
    }

    base.inspected = limit;
    base.total = total;
    if (limit < total) {
      found.add({
        check: "scan-truncated",
        title: `Only the first ${limit} of ${total} pages were checked`,
        detail:
          "Rendering every page in the browser gets slow on long documents, so this scan stopped early. The unchecked pages are not cleared: raise the page limit and re-run before you rely on this result.",
        severity: "medium",
      });
    }
  } finally {
    await doc.loadingTask.destroy();
  }

  base.findings = found.list();
  base.verdict = verdictFor(base.findings);
  return base;
}

/* ── Office Open XML (docx / xlsx / pptx) ──────────────────────────────────── */

async function unzip(file: File): Promise<Record<string, string>> {
  const { unzipSync, strFromU8 } = await import("fflate");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(bytes);
  const out: Record<string, string> = {};
  for (const [path, data] of Object.entries(entries)) {
    // Only the XML parts carry the metadata we care about; skip media blobs.
    if (!/\.(xml|rels)$/i.test(path)) continue;
    try {
      out[path] = strFromU8(data);
    } catch {
      /* binary-ish part; skip */
    }
  }
  return out;
}

function textOf(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return (m?.[1] ?? "").replace(/<[^>]+>/g, "").trim();
}

function countMatches(xml: string, re: RegExp): number {
  return (xml.match(re) ?? []).length;
}

/** Strip tags to get the human-readable run of text inside an XML fragment. */
function plainText(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function scanOffice(file: File, kind: ScanKind): Promise<FileScan> {
  const found = new Findings();
  const parts = await unzip(file);
  const all = Object.entries(parts);

  // ── docProps: who made it, how long they spent, which template ───────────
  const core = parts["docProps/core.xml"] ?? "";
  const app = parts["docProps/app.xml"] ?? "";
  const creator = textOf(core, "dc:creator");
  const modifier = textOf(core, "cp:lastModifiedBy");
  const names = [...new Set([creator, modifier].filter(Boolean))];
  if (names.length) {
    found.add({
      check: "office-authors",
      title: "Author and last-editor names",
      detail:
        "Office files record who created the document and who saved it last. On an outgoing draft this quietly discloses your internal staffing.",
      severity: "medium",
      evidence: names.join(" · "),
    });
  }
  const revision = textOf(core, "cp:revision");
  const company = textOf(app, "Company");
  const template = textOf(app, "Template");
  if (company) {
    found.add({
      check: "office-company",
      title: "Company name embedded",
      detail: "The organization registered in the authoring copy of Office is stored in the file.",
      severity: "low",
      evidence: company,
    });
  }
  if (template && template.toLowerCase() !== "normal.dotm") {
    found.add({
      check: "office-template",
      title: "Source template recorded",
      detail:
        "The template this document was built from is named in the file, sometimes as a full path that exposes an internal share or a client matter name.",
      severity: "medium",
      evidence: template,
    });
  }
  if (revision && Number(revision) > 1) {
    found.add({
      check: "office-revision",
      title: `Revision number ${revision}`,
      detail:
        "The save count is retained. Combined with the edit-time field it reveals how much reworking a document went through before it was sent.",
      severity: "low",
    });
  }

  // ── Tracked changes and comments: the classic legal leak ─────────────────
  for (const [path, xml] of all) {
    if (/^word\/comments?\d*\.xml$/i.test(path) || /^xl\/comments\d*\.xml$/i.test(path)) {
      const bodies = xml.match(/<(w:comment|comment)\b[\s\S]*?<\/(w:comment|comment)>/g) ?? [];
      if (bodies.length) {
        found.add({
          check: "office-comments",
          title: `${bodies.length} comment${bodies.length === 1 ? "" : "s"} still in the file`,
          detail:
            "Review comments ship with the document. Deleting the visible balloons in the margin is not the same as removing them from the file.",
          severity: "high",
          evidence: bodies
            .slice(0, 4)
            .map((b) => plainText(b).slice(0, 120))
            .filter(Boolean)
            .join("\n"),
        });
      }
    }
  }

  const documentXml = parts["word/document.xml"] ?? "";
  if (documentXml) {
    const insertions = countMatches(documentXml, /<w:ins\b/g);
    const deletions = countMatches(documentXml, /<w:del\b/g);
    if (insertions + deletions > 0) {
      // Deleted text is the dangerous half: it is invisible but fully present.
      const deletedText = (documentXml.match(/<w:delText[^>]*>([\s\S]*?)<\/w:delText>/g) ?? [])
        .map((m) => plainText(m))
        .filter(Boolean)
        .slice(0, 5)
        .join(" / ");
      found.add({
        check: "office-tracked-changes",
        title: `Tracked changes present (${insertions} insertion${insertions === 1 ? "" : "s"}, ${deletions} deletion${deletions === 1 ? "" : "s"})`,
        detail:
          "Every earlier wording is still in the file. Accepting changes in the view is not enough: the recipient can switch mark-up back on and read what you took out. This is the single most common way a negotiating position leaks.",
        severity: "critical",
        evidence: deletedText ? `Deleted text still recoverable: ${deletedText}` : undefined,
      });
    }
    if (/<w:vanish\b/.test(documentXml)) {
      found.add({
        check: "office-hidden-text",
        title: "Hidden text formatting",
        detail:
          "Some text is formatted as hidden. It does not print or display by default, but it is in the file and shows up the moment someone toggles hidden text on.",
        severity: "high",
      });
    }
  }

  // ── XLSX: hidden sheets, rows, columns, and the defined-name trail ────────
  if (kind === "xlsx") {
    const workbook = parts["xl/workbook.xml"] ?? "";
    const hiddenSheets = [...workbook.matchAll(/<sheet[^>]*name="([^"]*)"[^>]*state="(hidden|veryHidden)"/g)]
      .map((m) => m[1] ?? "")
      .filter(Boolean);
    if (hiddenSheets.length) {
      found.add({
        check: "xlsx-hidden-sheets",
        title: `${hiddenSheets.length} hidden sheet${hiddenSheets.length === 1 ? "" : "s"}`,
        detail:
          "Hidden worksheets open with one right-click. They routinely hold the source model, the pricing build-up, or the tab someone meant to delete.",
        severity: "critical",
        evidence: hiddenSheets.join(", "),
      });
    }
    for (const [path, xml] of all) {
      if (!/^xl\/worksheets\/sheet\d+\.xml$/i.test(path)) continue;
      const hiddenRows = countMatches(xml, /<row[^>]*hidden="(1|true)"/g);
      const hiddenCols = countMatches(xml, /<col[^>]*hidden="(1|true)"/g);
      if (hiddenRows + hiddenCols > 0) {
        found.add({
          check: "xlsx-hidden-cells",
          title: "Hidden rows or columns",
          detail:
            "Hidden rows and columns keep their values and are one “unhide” away. Margin columns and staff cost rows are the usual casualties.",
          severity: "high",
          where: path.replace("xl/worksheets/", ""),
          evidence: `${hiddenRows} hidden row(s), ${hiddenCols} hidden column(s)`,
        });
      }
    }
  }

  // ── PPTX: speaker notes and hidden slides ────────────────────────────────
  if (kind === "pptx") {
    const notes = all.filter(([p]) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(p));
    const withText = notes.filter(([, xml]) => plainText(xml).length > 0);
    if (withText.length) {
      found.add({
        check: "pptx-notes",
        title: `Speaker notes on ${withText.length} slide${withText.length === 1 ? "" : "s"}`,
        detail:
          "Presenter notes are not shown on screen but travel inside the deck. Sending a deck externally usually means sending your talking points with it.",
        severity: "high",
        evidence: withText
          .slice(0, 3)
          .map(([p, xml]) => `${p.replace("ppt/notesSlides/", "")}: ${plainText(xml).slice(0, 120)}`)
          .join("\n"),
      });
    }
    const hiddenSlides = all.filter(([p, xml]) => /^ppt\/slides\/slide\d+\.xml$/i.test(p) && /show="0"/.test(xml));
    if (hiddenSlides.length) {
      found.add({
        check: "pptx-hidden-slides",
        title: `${hiddenSlides.length} hidden slide${hiddenSlides.length === 1 ? "" : "s"}`,
        detail:
          "Hidden slides are skipped in the show but remain in the file: typically the backup pricing or the internal-only appendix.",
        severity: "critical",
        evidence: hiddenSlides.map(([p]) => p.replace("ppt/slides/", "")).join(", "),
      });
    }
  }

  // ── Embedded objects across all Office kinds ──────────────────────────────
  const embeds = all.filter(([p]) => /embeddings\//i.test(p));
  if (embeds.length) {
    found.add({
      check: "office-embeds",
      title: "Embedded objects",
      detail:
        "Another document is embedded inside this one. Embedded workbooks keep their full data even when only one chart is visible.",
      severity: "high",
      evidence: embeds
        .slice(0, 5)
        .map(([p]) => p.split("/").pop() ?? p)
        .join(", "),
    });
  }

  const findings = found.list();
  return {
    name: file.name,
    size: file.size,
    kind,
    verdict: verdictFor(findings),
    findings,
  };
}

/* ── Images ────────────────────────────────────────────────────────────────── */

async function scanImage(file: File): Promise<FileScan> {
  const found = new Findings();
  const meta = await auditImage(file);
  for (const m of meta) {
    // GPS in a released image is a genuine disclosure, not a nicety.
    const severity: LeakSeverity = m.key === "gps" ? "critical" : m.severity === "high" ? "high" : m.severity;
    found.add({
      check: `image-${m.key}`,
      title: m.label,
      detail:
        m.key === "gps"
          ? "The image records the exact coordinates where it was taken. On a released photo this maps a person, a property, or a site visit."
          : "This is embedded in the image file and travels with it to every recipient.",
      severity,
      evidence: m.value,
    });
  }
  const findings = found.list();
  return {
    name: file.name,
    size: file.size,
    kind: "image",
    verdict: verdictFor(findings),
    findings,
  };
}

/* ── Facade ────────────────────────────────────────────────────────────────── */

export async function scanFile(file: File, options: ScanOptions = {}): Promise<FileScan> {
  const kind = scanKind(file);
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  try {
    if (kind === "pdf") return await scanPdf(file, { maxPages });
    if (kind === "docx" || kind === "xlsx" || kind === "pptx") return await scanOffice(file, kind);
    if (kind === "image") return await scanImage(file);
    return {
      name: file.name,
      size: file.size,
      kind,
      verdict: "error",
      findings: [],
      error: "Unsupported file type. Add a PDF, Word, Excel, PowerPoint or image file.",
    };
  } catch (err) {
    return {
      name: file.name,
      size: file.size,
      kind,
      verdict: "error",
      findings: [],
      error: err instanceof Error ? err.message : "This file could not be read.",
    };
  }
}

/** Scan a batch in sequence, reporting progress. Sequential on purpose: page rendering is memory-hungry. */
export async function scanBatch(files: File[], options: ScanOptions = {}): Promise<FileScan[]> {
  const out: FileScan[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file) continue;
    options.onProgress?.(i, files.length, file.name);
    out.push(await scanFile(file, options));
  }
  options.onProgress?.(files.length, files.length, "");
  return out;
}

export const ACCEPTED_TYPES =
  ".pdf,.docx,.docm,.xlsx,.xlsm,.pptx,.pptm,.jpg,.jpeg,.png,.webp,.gif,.tif,.tiff," +
  "application/pdf,image/jpeg,image/png,image/webp,image/gif";
