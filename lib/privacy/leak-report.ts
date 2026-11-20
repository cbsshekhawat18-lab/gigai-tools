/**
 * GigAI Tools, release-check report export.
 *
 * The on-screen result answers "is this safe?". The report answers "prove it,
 * later", the thing you attach to a production log, hand to a supervising
 * partner, or keep on file when someone asks six months from now what was
 * checked before a document went out.
 *
 * Two formats, deliberately:
 *  • HTML, a single self-contained file, no network requests, opens anywhere
 *     and prints to PDF from the browser. (Rendering our own PDF here would
 *     mean html2canvas, which chokes on the site's oklch() colors; the browser
 *     print path is both simpler and higher fidelity.)
 *  • JSON: the machine-readable record, for anyone wiring this into a
 *     workflow or diffing two runs of the same set.
 *
 * Evidence strings are included, because a report that hides what leaked cannot
 * be used to confirm the leak was fixed. Treat an exported report as being as
 * sensitive as the documents it describes.
 */

import type { FileScan, LeakFinding, LeakSeverity, Verdict } from "./leak-scan";
import { rollUpVerdict } from "./leak-scan";

export interface ReportMeta {
  /** Optional free-text label, matter number, release name, ticket id. */
  reference?: string;
  generatedAt: Date;
  /** Page cap the scan ran with, so the report states its own limits. */
  maxPages: number;
}

const VERDICT_COPY: Record<Verdict, { label: string; blurb: string; color: string }> = {
  blocked: {
    label: "Do not release",
    blurb: "Content that should not be readable is recoverable from these files.",
    color: "#b42318",
  },
  review: {
    label: "Review before release",
    blurb: "Nothing is directly recoverable, but these files disclose more than they need to.",
    color: "#b54708",
  },
  clear: {
    label: "No issues found",
    blurb: "The checks below found nothing recoverable or identifying in these files.",
    color: "#067647",
  },
  error: {
    label: "Incomplete",
    blurb: "At least one file could not be read, so this set has not been fully checked.",
    color: "#475467",
  },
};

const SEVERITY_COLOR: Record<LeakSeverity, string> = {
  critical: "#b42318",
  high: "#b54708",
  medium: "#a15c07",
  low: "#475467",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stamp(d: Date): string {
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function fileSlug(d: Date): string {
  return d.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/** Every check the scanner runs, so a clean report still shows its work. */
const CHECKLIST = [
  "Text hidden under black boxes, white-out or other opaque covers",
  "Redaction annotations marked but never applied",
  "Tracked changes and deleted text still recoverable",
  "Review comments and mark-up author names",
  "Hidden worksheets, rows and columns",
  "Hidden slides and speaker notes",
  "Filled form-field values",
  "Embedded files, objects and scripts",
  "Document author, company, template and edit history",
  "Image EXIF and GPS coordinates",
];

export function buildHtmlReport(scans: FileScan[], meta: ReportMeta): string {
  const verdict = rollUpVerdict(scans);
  const v = VERDICT_COPY[verdict];
  const totalFindings = scans.reduce((n, s) => n + s.findings.length, 0);
  const critical = scans.reduce((n, s) => n + s.findings.filter((f) => f.severity === "critical").length, 0);

  const fileSection = (s: FileScan): string => {
    const fv = VERDICT_COPY[s.verdict];
    const rows = s.findings.length
      ? s.findings.map((f: LeakFinding) => `
          <tr>
            <td><span class="sev" style="background:${SEVERITY_COLOR[f.severity]}">${esc(f.severity)}</span></td>
            <td>
              <div class="ft">${esc(f.title)}${f.count > 1 ? ` <span class="ct">×${f.count}</span>` : ""}</div>
              <div class="fd">${esc(f.detail)}</div>
              ${f.where ? `<div class="fw">${esc(f.where)}</div>` : ""}
              ${f.evidence ? `<pre class="fe">${esc(f.evidence)}</pre>` : ""}
            </td>
          </tr>`).join("")
      : `<tr><td colspan="2" class="none">No issues found in this file.</td></tr>`;

    const scope = s.inspected != null && s.total != null && s.inspected < s.total
      ? `<p class="scope">Checked ${s.inspected} of ${s.total} pages.</p>`
      : "";

    return `
      <section class="file">
        <h3>${esc(s.name)}</h3>
        <p class="meta">
          ${esc(s.kind.toUpperCase())} · ${(s.size / 1024).toFixed(0)} KB ·
          <span style="color:${fv.color};font-weight:600">${esc(fv.label)}</span>
        </p>
        ${s.error ? `<p class="err">${esc(s.error)}</p>` : ""}
        ${scope}
        <table>${rows}</table>
      </section>`;
  };

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Release check, ${esc(meta.reference || stamp(meta.generatedAt))}</title>
<style>
:root{color-scheme:light}
 *{box-sizing:border-box}
 body{margin:0;padding:40px 24px;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#101828;background:#fff}
.wrap{max-width:820px;margin:0 auto}
 h1{font-size:24px;margin:0 0 4px}
 h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#475467;margin:36px 0 12px;padding-bottom:6px;border-bottom:1px solid #eaecf0}
 h3{font-size:16px;margin:0 0 2px;word-break:break-word}
.sub{color:#475467;margin:0 0 24px;font-size:13px}
.verdict{border:1px solid #eaecf0;border-left:4px solid ${v.color};border-radius:8px;padding:16px 18px;background:#fcfcfd}
.verdict.vl{font-size:18px;font-weight:700;color:${v.color}}
.verdict p{margin:4px 0 0;color:#344054}
.stats{display:flex;gap:28px;margin:16px 0 0;padding-top:14px;border-top:1px solid #eaecf0;flex-wrap:wrap}
.stat b{display:block;font-size:20px}
.stat span{font-size:12px;color:#475467}
.file{border:1px solid #eaecf0;border-radius:8px;padding:16px 18px;margin-bottom:14px;break-inside:avoid}
.meta{color:#475467;font-size:12px;margin:0 0 10px}
.scope{font-size:12px;color:#b54708;margin:0 0 8px}
.err{font-size:13px;color:#b42318;margin:0 0 8px}
 table{width:100%;border-collapse:collapse}
 td{padding:9px 0;border-top:1px solid #f2f4f7;vertical-align:top}
 td:first-child{width:74px;padding-right:10px}
.sev{display:inline-block;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 7px;border-radius:99px}
.ft{font-weight:600}
.ct{color:#475467;font-weight:500}
.fd{color:#344054;font-size:13px;margin-top:2px}
.fw{color:#475467;font-size:12px;margin-top:3px}
.fe{background:#f9fafb;border:1px solid #eaecf0;border-radius:6px;padding:8px 10px;margin:7px 0 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word;color:#101828}
.none{color:#067647;font-size:13px}
 ul{margin:0;padding-left:20px;color:#344054;font-size:13px}
 li{margin:3px 0}
 footer{margin-top:36px;padding-top:14px;border-top:1px solid #eaecf0;color:#667085;font-size:12px}
 @media print{body{padding:0}.file{break-inside:avoid}}
</style></head><body><div class="wrap">
 <h1>Document release check</h1>
 <p class="sub">
 ${meta.reference ? `Reference: <strong>${esc(meta.reference)}</strong> · ` : ""}
    Generated ${esc(stamp(meta.generatedAt))} · ${scans.length} file${scans.length === 1 ? "" : "s"}
  </p>

  <div class="verdict">
    <div class="vl">${esc(v.label)}</div>
    <p>${esc(v.blurb)}</p>
    <div class="stats">
      <div class="stat"><b>${scans.length}</b><span>files checked</span></div>
      <div class="stat"><b>${totalFindings}</b><span>findings</span></div>
      <div class="stat"><b style="color:${SEVERITY_COLOR.critical}">${critical}</b><span>critical</span></div>
    </div>
  </div>

  <h2>Findings by file</h2>
  ${scans.map(fileSection).join("")}

  <h2>What was checked</h2>
  <ul>${CHECKLIST.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>

  <h2>Scope and limits</h2>
  <ul>
    <li>Files were read entirely in the browser on the operator's own device. Nothing was uploaded.</li>
    <li>PDF pages were rendered and compared against the extractable text layer, up to ${meta.maxPages} pages per file.</li>
    <li>A clean result means these checks found nothing. It is not a warranty that a file is safe to release, and it does not replace a human review.</li>
    <li>Scanned or image-only documents have no text layer to recover, so a cover over an image cannot be evaluated this way.</li>
    <li>This report reproduces recovered content as evidence. Handle it as sensitively as the documents it describes.</li>
  </ul>

  <footer>Generated by the GigAI Tools redaction checker, gigai.tools/redaction-checker</footer>
</div></body></html>`;
}

export function buildJsonReport(scans: FileScan[], meta: ReportMeta): string {
  return JSON.stringify(
    {
      report: "gigai.document-release-check",
      version: 1,
      reference: meta.reference || null,
      generatedAt: meta.generatedAt.toISOString(),
      verdict: rollUpVerdict(scans),
      limits: { maxPagesPerFile: meta.maxPages, processedLocally: true },
      checksPerformed: CHECKLIST,
      summary: {
        files: scans.length,
        findings: scans.reduce((n, s) => n + s.findings.length, 0),
        critical: scans.reduce((n, s) => n + s.findings.filter((f) => f.severity === "critical").length, 0),
      },
      files: scans.map((s) => ({
        name: s.name,
        bytes: s.size,
        kind: s.kind,
        verdict: s.verdict,
        pagesInspected: s.inspected ?? null,
        pagesTotal: s.total ?? null,
        error: s.error ?? null,
        findings: s.findings.map((f) => ({
          check: f.check,
          severity: f.severity,
          title: f.title,
          detail: f.detail,
          where: f.where ?? null,
          occurrences: f.count,
          evidence: f.evidence ?? null,
        })),
      })),
    },
    null,
    2,
  );
}

function download(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadHtmlReport(scans: FileScan[], meta: ReportMeta): void {
  download(buildHtmlReport(scans, meta), `release-check-${fileSlug(meta.generatedAt)}.html`, "text/html");
}

export function downloadJsonReport(scans: FileScan[], meta: ReportMeta): void {
  download(buildJsonReport(scans, meta), `release-check-${fileSlug(meta.generatedAt)}.json`, "application/json");
}
