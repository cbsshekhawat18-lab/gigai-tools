/**
 * GigAI Tools, document text extraction + comparison.
 *
 * `extractText` normalises many document formats down to plain text so they can
 * be diffed uniformly:
 *   - .pdf         → pdf.js text layer (reuses the PDF engine's `pdfToText`)
 *   - .docx        → mammoth (raw text)
 *   - .rtf         → the dependency-free RTF parser (`rtfToText`)
 *   - .txt/.md/.csv/.json/.html and anything else → decoded as UTF-8 text
 *
 * `compareDocuments` then diffs two extracted strings by REUSING the existing
 * `computeDiff` engine from `lib/dev/textdiff`, so there's a single diff
 * implementation across the whole product.
 *
 * mammoth is dynamic-imported; PDF/RTF go through their own engines.
 */

import { computeDiff, type DiffMode, type DiffResult } from "@/lib/dev/textdiff";
import { pdfToText } from "./convert";
import { rtfToText } from "./rtf";
import { type Result, fail, message, ok } from "./shared";

export type { DiffMode, DiffResult };

/** File extension → extraction strategy. */
type Kind = "pdf" | "docx" | "rtf" | "text";

/** Pick an extraction strategy from filename + MIME type. */
function kindOf(name: string, type: string): Kind {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf") || type === "application/pdf") return "pdf";
  if (
    lower.endsWith(".docx") ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (lower.endsWith(".rtf") || type === "application/rtf" || type === "text/rtf") return "rtf";
  return "text";
}

/**
 * Extract plain text from a document file. Dispatches on extension/MIME to the
 * right engine. A `File` is preferred (its `.name` drives detection); a bare
 * `Blob` falls back to MIME sniffing and finally to UTF-8 decoding.
 */
export async function extractText(
  file: File | Blob,
  opts: { password?: string } = {},
): Promise<Result<string>> {
  try {
    const name = "name" in file ? file.name : "";
    const kind = kindOf(name, file.type);

    switch (kind) {
      case "pdf":
        return pdfToText(file, { password: opts.password });
      case "docx": {
        const mammoth = (await import("mammoth")).default;
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        return ok(value.trim());
      }
      case "rtf": {
        const raw = await file.text();
        return ok(rtfToText(raw));
      }
      case "text":
      default:
        return ok((await file.text()).replace(/\r\n?/g, "\n"));
    }
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Compare two already-extracted text strings and return a diff. `mode` selects
 * char/word/line granularity (default "lines"). This is a thin, honest wrapper
 * over the shared `computeDiff` engine so the document tools and the dev diff
 * tool share one implementation.
 */
export async function compareDocuments(
  aText: string,
  bText: string,
  opts: { mode?: DiffMode } = {},
): Promise<Result<DiffResult>> {
  try {
    const result = await computeDiff(aText ?? "", bText ?? "", { mode: opts.mode ?? "lines" });
    return ok(result);
  } catch (err) {
    return fail(message(err));
  }
}

/**
 * Convenience: extract text from two files and diff them in one call. Fails fast
 * with a per-file error message if either extraction fails.
 */
export async function compareFiles(
  a: File | Blob,
  b: File | Blob,
  opts: { mode?: DiffMode; password?: string } = {},
): Promise<Result<DiffResult>> {
  const [ta, tb] = await Promise.all([
    extractText(a, { password: opts.password }),
    extractText(b, { password: opts.password }),
  ]);
  if (!ta.ok) return fail(`Couldn't read the first document: ${ta.error}`);
  if (!tb.ok) return fail(`Couldn't read the second document: ${tb.error}`);
  return compareDocuments(ta.result, tb.result, { mode: opts.mode });
}
