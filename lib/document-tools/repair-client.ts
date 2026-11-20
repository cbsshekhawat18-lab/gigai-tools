/**
 * Client for the server-side PDF text repair (render + OCR for PDFs whose
 * broken font maps damage the extracted text - any of 30+ languages, with
 * script auto-detection server-side; see lib/document-tools/records.ts).
 *
 * This is one of the platform's rare server-side steps, so the rules are the
 * standing ones: the UI DISCLOSES the upload before it happens, the server
 * deletes the file the moment processing ends, and the result is returned
 * exactly once. The endpoint self-reports availability so the option simply
 * doesn't render when the server can't do it.
 */

import { API } from "@/config/constants";
import type { RecordToken, TokenPage } from "./records";
import { type Result, fail, ok } from "./shared";

export interface RepairProgress {
  page: number;
  pages: number;
}

interface ServerPage {
  width: number;
  height: number;
  tokens: RecordToken[];
}

/** Native-script display names for the picker, keyed by traineddata code. */
export const OCR_LANG_LABELS: Record<string, string> = {
  ara: "العربية (Arabic)", asm: "অসমীয়া (Assamese)", ben: "বাংলা (Bengali)",
  chi_sim: "简体中文 (Chinese, Simplified)", chi_tra: "繁體中文 (Chinese, Traditional)",
  deu: "Deutsch (German)", ell: "Ελληνικά (Greek)", eng: "English",
  fra: "Français (French)", guj: "ગુજરાતી (Gujarati)", heb: "עברית (Hebrew)",
  hin: "हिन्दी (Hindi)", ita: "Italiano (Italian)", jpn: "日本語 (Japanese)",
  kan: "ಕನ್ನಡ (Kannada)", kor: "한국어 (Korean)", mal: "മലയാളം (Malayalam)",
  mar: "मराठी (Marathi)", nep: "नेपाली (Nepali)", nld: "Nederlands (Dutch)",
  ori: "ଓଡ଼ିଆ (Odia)", pan: "ਪੰਜਾਬੀ (Punjabi)", pol: "Polski (Polish)",
  por: "Português (Portuguese)", rus: "Русский (Russian)", san: "संस्कृतम् (Sanskrit)",
  spa: "Español (Spanish)", tam: "தமிழ் (Tamil)", tel: "తెలుగు (Telugu)",
  tha: "ไทย (Thai)", tur: "Türkçe (Turkish)", urd: "اردو (Urdu)",
  vie: "Tiếng Việt (Vietnamese)",
};

export interface RepairStatus {
  enabled: boolean;
  /** Traineddata codes installed on the server, for the language picker. */
  langs: string[];
}

/** Is the repair endpoint up, and with which languages? (5s cap.) */
export async function repairStatus(): Promise<RepairStatus> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${API.baseUrl}/pdf-repair/status`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return { enabled: false, langs: [] };
    const body = (await res.json()) as { enabled?: boolean; langs?: string[] };
    return { enabled: body.enabled === true, langs: body.langs ?? [] };
  } catch {
    return { enabled: false, langs: [] };
  }
}

/**
 * Upload the PDF, poll the job to completion, return repaired token pages.
 * `onProgress` fires on every poll so the UI can show "page 12 of 67".
 */
export async function repairPdfText(
  file: Blob,
  onProgress: (p: RepairProgress) => void,
  langs = "auto",
): Promise<Result<TokenPage[]>> {
  try {
    const form = new FormData();
    form.append("file", file, "document.pdf");
    form.append("langs", langs);
    const created = await fetch(`${API.baseUrl}/pdf-repair/jobs`, {
      method: "POST",
      body: form,
    });
    if (!created.ok) {
      const detail = (await created.json().catch(() => null)) as { detail?: string } | null;
      return fail(detail?.detail ?? `The repair service returned ${created.status}.`);
    }
    const { job_id: jobId } = (await created.json()) as { job_id: string };

    // Poll every 2.5s; a 67-page roll takes ~10 minutes, so the ceiling is 30.
    const deadline = Date.now() + 30 * 60 * 1000;
    for (;;) {
      if (Date.now() > deadline) return fail("The repair job timed out.");
      await new Promise((r) => setTimeout(r, 2500));
      const res = await fetch(`${API.baseUrl}/pdf-repair/jobs/${jobId}`);
      if (!res.ok) return fail(`Lost the repair job (${res.status}).`);
      const body = (await res.json()) as {
        status: string;
        page?: number;
        pages?: number;
        error?: string;
        result?: { pages: ServerPage[] };
      };
      if (body.status === "error") return fail(body.error ?? "Repair failed.");
      if (body.status === "done" && body.result) {
        return ok(body.result.pages.map((p) => ({ tokens: p.tokens })));
      }
      onProgress({ page: body.page ?? 0, pages: body.pages ?? 0 });
    }
  } catch (err) {
    return fail(err instanceof Error ? err.message : "The repair service is unreachable.");
  }
}
