/**
 * GigAI Fit, PDF report.
 *
 * Rendered through `reportHtmlToPdfBlob` (isolated iframe), so every color here
 * is a plain hex literal: html2canvas dies on the app's Tailwind `oklch()`.
 *
 * The report carries the SAME honesty the screen does: the quality verdict, the
 * full attempt log, and (when the target wasn't reachable) the best-effort
 * notice. A PDF is the artefact people forward to someone else, so it must not
 * quietly read as an unqualified success.
 */

import type { FitResult, QualityVerdict } from "./types";
import { formatSize, reductionPercent } from "./types";
import { impossibleTargetMessage } from "./target-size";

const BAND_HEX: Record<QualityVerdict["band"], string> = {
  excellent: "#059669",
  noticeable: "#d97706",
  heavy: "#e11d48",
};

function esc(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildFitReportHtml(result: FitResult, verdict: QualityVerdict): string {
  const accent = BAND_HEX[verdict.band];
  const saved = reductionPercent(result.source.bytes, result.size);
  const missed = result.outcome === "best-effort";

  const dims = (w?: number, h?: number) => (w && h ? `${w} × ${h}` : "—");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;background:#ffffff;">
    <div style="border-bottom:2px solid ${accent};padding-bottom:10px;margin-bottom:16px;">
      <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b;">GigAI Fit, compression report</div>
      <div style="font-size:20px;font-weight:700;margin-top:6px;">${esc(result.name)}</div>
      <div style="font-size:12px;color:#475569;margin-top:2px;">
        Target ≤ ${formatSize(result.targetBytes)} · Result ${formatSize(result.size)} · ${saved.toFixed(1)}% smaller
      </div>
    </div>

    ${
      missed
        ? `<div style="border:1px solid #fcd34d;background:#fffbeb;border-radius:8px;padding:12px;margin-bottom:16px;font-size:12px;color:#78350f;">
             <strong>Best achievable result.</strong> ${esc(impossibleTargetMessage(result))}
           </div>`
        : ""
    }

    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
      <tr style="background:#f8fafc;">
        <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;width:33%;"></th>
        <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Before</th>
        <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">After</th>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b;">Size</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${formatSize(result.source.bytes)}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;font-weight:700;color:${accent};">${formatSize(result.size)}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b;">Dimensions</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${dims(result.source.width, result.source.height)}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${dims(result.facts.width, result.facts.height)}</td>
      </tr>
      ${
        result.source.bitrate || result.facts.bitrate
          ? `<tr>
               <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b;">Bitrate</td>
               <td style="padding:8px;border:1px solid #e2e8f0;">${result.source.bitrate ? `${Math.round(result.source.bitrate)} kbps` : "—"}</td>
               <td style="padding:8px;border:1px solid #e2e8f0;">${result.facts.bitrate ? `${Math.round(result.facts.bitrate)} kbps` : "—"}</td>
             </tr>`
          : ""
      }
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;color:#64748b;">Format</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${esc(result.source.label)}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${esc(result.facts.mime ?? result.source.mime)}</td>
      </tr>
    </table>

    <div style="border:1px solid ${accent};border-radius:8px;padding:12px;margin-bottom:16px;">
      <div style="font-size:13px;font-weight:700;color:${accent};">Quality: ${esc(verdict.label)}</div>
      <div style="font-size:12px;color:#334155;margin-top:4px;">${esc(verdict.detail)}</div>
    </div>

    ${
      result.changed.length
        ? `<h2 style="font-size:14px;margin:0 0 8px;">What changed</h2>
           <ul style="margin:0 0 16px;padding-left:18px;font-size:12px;color:#334155;">
             ${result.changed.map((c) => `<li style="margin-bottom:3px;">${esc(c)}</li>`).join("")}
           </ul>`
        : ""
    }

    ${
      result.attempts.length > 1
        ? `<h2 style="font-size:14px;margin:0 0 8px;">How it got there</h2>
           <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px;">
             <tr style="background:#f8fafc;">
               <th style="text-align:left;padding:6px;border:1px solid #e2e8f0;">Attempt</th>
               <th style="text-align:left;padding:6px;border:1px solid #e2e8f0;">Setting</th>
               <th style="text-align:left;padding:6px;border:1px solid #e2e8f0;">Output</th>
             </tr>
             ${result.attempts
               .map(
                 (a, i) =>
                   `<tr><td style="padding:6px;border:1px solid #e2e8f0;">${i + 1}</td><td style="padding:6px;border:1px solid #e2e8f0;">${Math.round(a.knob * 100)}%</td><td style="padding:6px;border:1px solid #e2e8f0;">${formatSize(a.size)}</td></tr>`,
               )
               .join("")}
           </table>`
        : ""
    }

    <div style="padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:10px;line-height:1.5;color:#475569;">
      Compressed entirely in the browser: the original file was never uploaded and was not modified.
      Quality is a measured verdict from the change in pixels, bitrate and bytes, not an estimate.
    </div>

    <div style="margin-top:12px;font-size:9px;color:#94a3b8;">
      Generated by GigAI Fit · gigai.tools · ${esc(new Date().toLocaleString())}
    </div>
  </div>`;
}

/** Render the Fit report to a PDF Blob. */
export async function buildFitReportPdf(result: FitResult, verdict: QualityVerdict): Promise<Blob> {
  const { reportHtmlToPdfBlob } = await import("@/lib/seo-tools/report-pdf");
  return reportHtmlToPdfBlob(buildFitReportHtml(result, verdict));
}
