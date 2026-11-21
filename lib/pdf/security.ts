/**
 * GigAI Tools: PDF password protection & unlocking (client-side).
 *
 * `protectPdf` uses @cantoo/pdf-lib's `encrypt()` to add AES encryption plus
 * per-permission restrictions. `unlockPdf` opens an encrypted PDF with pdf.js
 * (which decrypts in the worker) then rebuilds an unencrypted copy by copying
 * every page into a fresh document, so the output opens with no password.
 *
 * Both are dynamic-imported. We never store or transmit passwords or files;
 * everything happens in memory in the user's browser.
 */

import { openPdfDocument, pdfDocToBlob } from "./core";
import type { NamedBlob, PdfInput } from "./types";
import { namedBlob } from "./types";

/** Which actions a user opening with the *user* password may still perform. */
export interface PdfPermissions {
  printing?: boolean;
  copying?: boolean;
  modifying?: boolean;
  annotating?: boolean;
  fillingForms?: boolean;
  documentAssembly?: boolean;
}

export interface ProtectOptions {
  /**
   * Optional owner password granting full control. If omitted, the user
   * password doubles as the owner password (common for simple "lock" flows).
   */
  ownerPassword?: string;
  /** Permissions granted to holders of the user password. Default: view-only. */
  permissions?: PdfPermissions;
}

/**
 * Encrypt a PDF so it requires `password` to open. Restrictions default to
 * "view only" (no printing/copying/editing) unless the caller opens them up.
 */
export async function protectPdf(
  input: PdfInput,
  password: string,
  opts: ProtectOptions = {},
): Promise<NamedBlob> {
  const pwd = password.trim();
  if (!pwd) throw new Error("Enter a password to protect this PDF.");

  // @cantoo/pdf-lib is a drop-in fork of pdf-lib that adds `encrypt()`.
  const { PDFDocument } = await import("@cantoo/pdf-lib");

  let doc;
  try {
    doc = await PDFDocument.load(await input.file.arrayBuffer(), { ignoreEncryption: true });
  } catch {
    throw new Error(`Couldn't read "${input.name}". It may already be encrypted or corrupt.`);
  }

  const perms = opts.permissions ?? {};
  doc.encrypt({
    userPassword: pwd,
    ownerPassword: (opts.ownerPassword ?? pwd).trim() || pwd,
    permissions: {
      printing: perms.printing ? "highResolution" : false,
      copying: perms.copying ?? false,
      modifying: perms.modifying ?? false,
      annotating: perms.annotating ?? false,
      fillingForms: perms.fillingForms ?? false,
      contentAccessibility: true, // keep accessible to screen readers by default
      documentAssembly: perms.documentAssembly ?? false,
    },
  });

  const base = input.name.replace(/\.pdf$/i, "");
  return namedBlob(`${base}-protected.pdf`, await pdfDocToBlob(doc));
}

/**
 * Remove a PDF's open password. @cantoo/pdf-lib genuinely *decrypts* the file
 * when we pass the `password` load option, so re-saving without calling
 * `encrypt()` yields a real unencrypted copy that preserves selectable text
 * and vectors (nothing is rasterised).
 *
 * A wrong or missing password surfaces as a clear, typed error.
 */
export async function unlockPdf(input: PdfInput, password: string): Promise<NamedBlob> {
  const pwd = password.trim();

  // Validate the password up front with pdf.js so we can give a precise error
  // (openPdfDocument already normalises "incorrect password" messages).
  const probe = await openPdfDocument(input.file, pwd);
  await probe.loadingTask.destroy();

  // Load WITH the password (real decryption in @cantoo/pdf-lib), then re-save
  // without encryption. copyPages into a fresh doc guarantees no residual
  // encryption dictionary survives in the output.
  const { PDFDocument } = await import("@cantoo/pdf-lib");
  let src;
  try {
    src = await PDFDocument.load(await input.file.arrayBuffer(), {
      password: pwd,
      ignoreEncryption: false,
    });
  } catch (err) {
    if (/password/i.test((err as Error).message)) {
      throw new Error("Incorrect password. Please check it and try again.");
    }
    throw new Error("Couldn't unlock this PDF. It may use an unsupported cipher.");
  }

  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, src.getPageIndices());
  for (const page of copied) out.addPage(page);

  const base = input.name.replace(/\.pdf$/i, "");
  return namedBlob(`${base}-unlocked.pdf`, await pdfDocToBlob(out));
}

/**
 * Best-effort check for whether a PDF is encrypted (needs a password to open).
 * Returns true if opening with no password throws a password error.
 */
export async function isEncrypted(input: PdfInput): Promise<boolean> {
  try {
    const doc = await openPdfDocument(input.file);
    await doc.loadingTask.destroy();
    return false;
  } catch (err) {
    return /password/i.test((err as Error).message);
  }
}
