/**
 * GigAI Verify, PDF report.
 *
 * Reuses `reportHtmlToPdfBlob` (lib/seo-tools/report-pdf.ts), which renders in
 * an isolated iframe. That matters: html2canvas dies on the app's Tailwind v4
 * `oklch()` colors, so every color below is a plain hex literal and nothing
 * inherits from the page.
 *
 * The report is deliberately shaped like the on-screen result, assessment,
 * then evidence WITH its alternative explanations, then limitations. A PDF that
 * dropped the caveats would be the version people forward to someone else, and
 * that is exactly the version that must not overstate.
 */

import type { VerificationResult } from "./types";
import { CLASSIFICATION_META, RELIABILITY_LABEL, VERIFY_DISCLAIMER } from "./types";
import { formatSize } from "@/lib/file-intel/types";

const BAND_HEX: Record<string, string> = {
  "likely-human": "#059669",
  "likely-ai": "#0284c7",
  "likely-mixed": "#d97706",
  inconclusive: "#64748b",
};

const DIRECTION_HEX: Record<string, string> = {
  ai: "#0284c7",
  human: "#059669",
  edited: "#d97706",
  neutral: "#94a3b8",
};

/** Escape for safe interpolation: extracted file text is untrusted input. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildVerifyReportHtml(result: VerificationResult): string {
  const meta = CLASSIFICATION_META[result.classification];
  const accent = BAND_HEX[result.classification] ?? "#64748b";

  const evidence = result.signals
    .map(
      (s) => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:4px;background:${DIRECTION_HEX[s.direction] ?? "#94a3b8"};margin-right:8px;"></span>
          <strong style="font-size:13px;color:#0f172a;">${esc(s.title)}</strong>
          <span style="margin-left:auto;font-size:10px;color:#64748b;">${esc(RELIABILITY_LABEL[s.reliability])}</span>
        </div>
        <div style="font-size:12px;color:#334155;margin-bottom:6px;">${esc(s.finding)}</div>
        ${
          s.evidence
            ? `<div style="font-size:11px;color:#475569;margin-bottom:6px;">${Object.entries(s.evidence)
                .map(([k, v]) => `<span style="margin-right:12px;"><em>${esc(k)}:</em> ${esc(String(v))}</span>`)
                .join("")}</div>`
            : ""
        }
        ${
          s.alternative
            ? `<div style="font-size:11px;color:#64748b;background:#f8fafc;border-radius:6px;padding:8px;">
                 <strong style="color:#334155;">Alternative explanation:</strong> ${esc(s.alternative)}
               </div>`
            : ""
        }
      </div>`,
    )
    .join("");

  const timeline = result.timeline.length
    ? `<h2 style="font-size:14px;color:#0f172a;margin:20px 0 8px;">What the file records</h2>
       <ul style="margin:0;padding-left:18px;font-size:12px;color:#334155;">
         ${result.timeline
           .map(
             (t) =>
               `<li style="margin-bottom:4px;"><strong>${esc(t.label)}</strong>${t.when ? ` - ${esc(t.when)}` : ""}${t.detail ? `<br/><span style="color:#64748b;">${esc(t.detail)}</span>` : ""}</li>`,
           )
           .join("")}
       </ul>`
    : "";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;background:#ffffff;">
    <div style="border-bottom:2px solid ${accent};padding-bottom:10px;margin-bottom:16px;">
      <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b;">GigAI Verify: evidence report</div>
      <div style="font-size:20px;font-weight:700;color:${accent};margin-top:6px;">${esc(meta.label)}</div>
      <div style="font-size:12px;color:#475569;margin-top:2px;">Confidence: ${esc(result.confidence)}</div>
    </div>

    <p style="font-size:12px;line-height:1.55;color:#334155;margin:0 0 16px;">${esc(result.summary)}</p>

    <h2 style="font-size:14px;color:#0f172a;margin:0 0 8px;">File</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;color:#334155;margin-bottom:16px;">
      <tr><td style="padding:3px 0;color:#64748b;width:110px;">Name</td><td>${esc(result.file.name)}</td></tr>
      <tr><td style="padding:3px 0;color:#64748b;">Type</td><td>${esc(result.file.label)} (${esc(result.file.mime)})</td></tr>
      <tr><td style="padding:3px 0;color:#64748b;">Size</td><td>${formatSize(result.file.size)}</td></tr>
      ${result.file.width ? `<tr><td style="padding:3px 0;color:#64748b;">Dimensions</td><td>${result.file.width} × ${result.file.height}</td></tr>` : ""}
      ${result.file.pages ? `<tr><td style="padding:3px 0;color:#64748b;">Pages</td><td>${result.file.pages}</td></tr>`: ""}
 <tr><td style="padding:3px 0;color:#64748b;">Analysed</td><td>${esc(new Date(result.analysedAt).toLocaleString())}</td></tr>
 <tr><td style="padding:3px 0;color:#64748b;vertical-align:top;">SHA-256</td><td style="word-break:break-all;font-family:monospace;font-size:9px;">${esc(result.file.hash)}</td></tr>
 </table>

 <h2 style="font-size:14px;color:#0f172a;margin:0 0 8px;">Evidence: ${result.signals.length} signal${result.signals.length === 1 ? "" : "s"}</h2>
 ${evidence}

 ${timeline}

 <h2 style="font-size:14px;color:#0f172a;margin:20px 0 8px;">What we found</h2>
 <ul style="margin:0;padding-left:18px;font-size:12px;color:#334155;">
 ${result.found.map((f) => `<li style="margin-bottom:3px;">${f.ok === true ? "✓" : f.ok === false ? "⚠" : "—"} ${esc(f.text)}</li>`).join("")}
    </ul>

    <h2 style="font-size:14px;color:#0f172a;margin:20px 0 8px;">What we cannot know</h2>
    <ul style="margin:0;padding-left:18px;font-size:12px;color:#334155;">
      ${result.limitations.map((l) => `<li style="margin-bottom:4px;">${esc(l)}</li>`).join("")}
    </ul>

    <div style="margin-top:20px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:10px;line-height:1.5;color:#475569;">
      <strong style="color:#0f172a;">Important:</strong> ${esc(VERIFY_DISCLAIMER)}
    </div>

    <div style="margin-top:12px;font-size:9px;color:#94a3b8;">
      Generated by GigAI Verify · gigai.tools · analysed entirely in the browser, nothing uploaded
    </div>
  </div>`;
}

/** Render the report to a PDF Blob via the isolated-iframe renderer. */
export async function buildVerifyReportPdf(result: VerificationResult): Promise<Blob> {
  const { reportHtmlToPdfBlob } = await import("@/lib/seo-tools/report-pdf");
  return reportHtmlToPdfBlob(buildVerifyReportHtml(result));
}
