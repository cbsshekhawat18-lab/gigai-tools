/**
 * GigAI Tools: bundle several output blobs into a single ZIP (client-side).
 *
 * Used by tools that emit many files (split-to-pages, pdf-to-images) so the
 * user gets one download. fflate is dynamic-imported and the whole archive is
 * built in memory. Nothing is uploaded. Duplicate filenames are de-conflicted
 * with numeric suffixes so no entry is silently overwritten.
 */

import type { NamedBlob } from "./types";
import { namedBlob } from "./types";

/**
 * Zip a list of `NamedBlob`s. Already-compressed inputs (PDF/JPEG/PNG) are
 * stored (level 0) since re-deflating them wastes CPU for near-zero savings.
 */
export async function zipBlobs(files: NamedBlob[], zipName = "gigai-tools.zip"): Promise<NamedBlob> {
  if (files.length === 0) throw new Error("There are no files to zip.");
  const { zip } = await import("fflate");

  const used = new Set<string>();
  const entries: Record<string, [Uint8Array, { level: 0 | 6 }]> = {};

  for (const file of files) {
    const name = uniqueName(file.name || "file", used);
    const bytes = new Uint8Array(await file.blob.arrayBuffer());
    // Store already-compressed formats; deflate everything else at a mild level.
    const level = isPrecompressed(name) ? 0 : 6;
    entries[name] = [bytes, { level }];
  }

  const zipped = await new Promise<Uint8Array>((resolve, reject) => {
    zip(entries, (err, data) => {
      if (err) reject(new Error("Couldn't build the ZIP archive."));
      else resolve(data);
    });
  });

  // Copy into a standalone buffer so the Blob owns exact-typed bytes.
  const copy = new Uint8Array(zipped.byteLength);
  copy.set(zipped);
  const blob = new Blob([copy], { type: "application/zip" });
  return namedBlob(ensureZipExt(zipName), blob);
}

/** True for formats that are already compressed and shouldn't be deflated. */
function isPrecompressed(name: string): boolean {
  return /\.(pdf|jpe?g|png|webp|gif|zip|docx|xlsx|pptx)$/i.test(name);
}

/** Ensure the archive name ends in `.zip`. */
function ensureZipExt(name: string): string {
  return /\.zip$/i.test(name) ? name : `${name}.zip`;
}

/** Return a filename not already in `used`, appending "-2", "-3"… on clash. */
function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 2;
  let candidate = `${base}-${i}${ext}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${base}-${i}${ext}`;
  }
  used.add(candidate);
  return candidate;
}
