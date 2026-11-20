/**
 * "Clean before you share" privacy auditor: reads the hidden metadata inside a
 * photo (EXIF/GPS) or PDF, flags what it exposes about you (location, device,
 * author, timestamps), and strips it. Everything runs in the browser: the file
 * is read and cleaned on your device and never uploaded, which is the whole
 * point, since this is exactly the kind of file people are afraid to upload.
 *
 * Honest scope: image stripping re-encodes the picture to guarantee every trace
 * of metadata is gone (JPEG at high quality; PNG is lossless). PDF stripping
 * clears the identifying document-info fields.
 */

export type Severity = "high" | "medium" | "low";

export interface MetaFinding {
  key: string;
  label: string;
  value: string;
  severity: Severity;
}

export type FileKind = "image" | "pdf" | "other";

export function fileKind(file: File): FileKind {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (file.type.startsWith("image/") || /\.(jpe?g|png|tiff?|webp|gif|heic|heif)$/i.test(file.name)) return "image";
  return "other";
}

/** True for images the browser can re-encode via <img> + canvas (to strip metadata). */
export function isStrippableImage(file: File): boolean {
  return /image\/(jpeg|png|webp|gif)/i.test(file.type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

/* ── Small typed helpers over exifr's untyped output ───────────────────────── */

function asString(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (v instanceof Date) return v.toISOString().replace("T", " ").slice(0, 19);
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function get(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = asString(data[k]);
    if (v) return v;
  }
  return undefined;
}

/* ── Image (EXIF / GPS) ────────────────────────────────────────────────────── */

export async function auditImage(file: File): Promise<MetaFinding[]> {
  const exifr = (await import("exifr")).default;
  let raw: unknown;
  try {
    raw = await exifr.parse(file, true);
  } catch {
    raw = null;
  }
  if (!raw || typeof raw !== "object") return [];
  const data = raw as Record<string, unknown>;
  const findings: MetaFinding[] = [];

  const lat = data.latitude;
  const lon = data.longitude;
  if (typeof lat === "number" && typeof lon === "number") {
    findings.push({
      key: "gps",
      label: "GPS location",
      value: `${lat.toFixed(5)}, ${lon.toFixed(5)} (reveals where the photo was taken)`,
      severity: "high",
    });
  }
  const serial = get(data, "SerialNumber", "BodySerialNumber", "InternalSerialNumber");
  if (serial) findings.push({ key: "serial", label: "Device serial number", value: serial, severity: "high" });

  const device = [get(data, "Make"), get(data, "Model")].filter(Boolean).join(" ");
  if (device) findings.push({ key: "device", label: "Camera / phone", value: device, severity: "medium" });

  const artist = get(data, "Artist", "Creator", "OwnerName", "XPAuthor");
  if (artist) findings.push({ key: "artist", label: "Author / owner name", value: artist, severity: "medium" });

  const lens = get(data, "LensModel", "Lens");
  if (lens) findings.push({ key: "lens", label: "Lens", value: lens, severity: "low" });

  const software = get(data, "Software", "ProcessingSoftware");
  if (software) findings.push({ key: "software", label: "Editing software", value: software, severity: "low" });

  const date = get(data, "DateTimeOriginal", "CreateDate", "ModifyDate", "DateTime");
  if (date) findings.push({ key: "date", label: "Date & time taken", value: date, severity: "low" });

  const copyright = get(data, "Copyright", "Rights");
  if (copyright) findings.push({ key: "copyright", label: "Copyright", value: copyright, severity: "low" });

  return findings;
}

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this image."));
    img.src = url;
  });
}

/** Strip all metadata from an image by re-encoding it through a canvas. */
export async function stripImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadHtmlImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available.");
    ctx.drawImage(img, 0, 0);
    const isPng = /png/i.test(file.type) || /\.png$/i.test(file.name);
    const mime = isPng ? "image/png" : "image/jpeg";
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode the cleaned image."))),
        mime,
        isPng ? undefined : 0.92,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ── PDF (document info) ───────────────────────────────────────────────────── */

export async function auditPdf(file: File): Promise<MetaFinding[]> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const findings: MetaFinding[] = [];
  const add = (key: string, label: string, value: string | undefined, severity: Severity) => {
    if (value && value.trim()) findings.push({ key, label, value: value.trim(), severity });
  };
  add("author", "Author", doc.getAuthor(), "medium");
  add("title", "Title", doc.getTitle(), "low");
  add("subject", "Subject", doc.getSubject(), "low");
  add("keywords", "Keywords", doc.getKeywords(), "low");
  add("creator", "Creating application", doc.getCreator(), "low");
  add("producer", "Producer", doc.getProducer(), "low");
  const created = doc.getCreationDate();
  if (created) add("created", "Created", created.toISOString().slice(0, 19).replace("T", " "), "low");
  const modified = doc.getModificationDate();
  if (modified) add("modified", "Last modified", modified.toISOString().slice(0, 19).replace("T", " "), "low");
  return findings;
}

/** Strip identifying document-info metadata from a PDF. */
export async function stripPdf(file: File): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("");
  doc.setProducer("");
  const out = await doc.save({ updateFieldAppearances: false });
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

/* ── Facade ────────────────────────────────────────────────────────────────── */

export async function auditFile(file: File): Promise<{ kind: FileKind; findings: MetaFinding[] }> {
  const kind = fileKind(file);
  if (kind === "image") return { kind, findings: await auditImage(file) };
  if (kind === "pdf") return { kind, findings: await auditPdf(file) };
  return { kind, findings: [] };
}

export async function stripFile(file: File): Promise<Blob> {
  return fileKind(file) === "pdf" ? stripPdf(file) : stripImage(file);
}
