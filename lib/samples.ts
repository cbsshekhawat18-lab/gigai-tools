/**
 * On-demand SAMPLE FILES. "Try a sample" for file-based tools, so a visitor
 * can test-drive a tool instantly without hunting for a file.
 *
 * Everything is generated CLIENT-SIDE at click time (canvas → PNG, pdf-lib →
 * PDF, string templates → CSV/JSON/SVG): no hosted assets, no network, works
 * offline, zero bytes until requested. The kind is INFERRED from a dropzone's
 * `accept` string, so any tool using the shared uploader gets the right sample
 * with no per-tool wiring, and tools whose accept doesn't match get nothing
 * (the spec's "never on tools where unnecessary").
 */

export type SampleKind = "image" | "pdf" | "csv" | "json" | "svg";

/** Map an <input accept> string to a sample kind, or null for "no sample". */
export function sampleKindFor(accept: string | undefined): SampleKind | null {
  if (!accept) return null;
  const a = accept.toLowerCase();
  if (a.includes("pdf")) return "pdf";
  if (a.includes("csv")) return "csv";
  if (a.includes("json")) return "json";
  if (a.includes("svg") && !a.includes("image/*")) return "svg";
  if (a.includes("image")) return "image";
  return null;
}

/** Human label for the button, e.g. "Try a sample image". */
export const SAMPLE_LABEL: Record<SampleKind, string> = {
  image: "Try a sample image",
  pdf: "Try a sample PDF",
  csv: "Try a sample CSV",
  json: "Try a sample JSON",
  svg: "Try a sample SVG",
};

/* ── generators ──────────────────────────────────────────────────────────── */

async function sampleImage(): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  // Sky gradient + sun + mountains + label: a friendly, obviously-sample photo.
  const sky = ctx.createLinearGradient(0, 0, 0, 800);
  sky.addColorStop(0, "#7dd3fc");
  sky.addColorStop(1, "#e0f2fe");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1200, 800);
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(920, 190, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f766e";
  ctx.beginPath();
  ctx.moveTo(0, 800);
  ctx.lineTo(380, 330);
  ctx.lineTo(700, 800);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#115e59";
  ctx.beginPath();
  ctx.moveTo(430, 800);
  ctx.lineTo(800, 420);
  ctx.lineTo(1200, 800);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText("GigAI Tools, sample image", 60, 90);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) throw new Error("Could not encode sample image");
  return new File([blob], "sample-image.png", { type: "image/png" });
}

async function samplePdf(): Promise<File> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= 2; i++) {
    const page = doc.addPage([595, 842]); // A4
    page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(0.31, 0.27, 0.9) });
    page.drawText("GigAI Tools, sample PDF", { x: 40, y: 810, size: 16, font: bold, color: rgb(1, 1, 1) });
    page.drawText(`Page ${i} of 2`, { x: 40, y: 750, size: 12, font: bold, color: rgb(0.2, 0.2, 0.25) });
    const lines = [
      "This two-page document was generated in your browser so you can",
      "test this tool instantly: merge it, split it, compress it, convert",
      "it or edit it. Nothing was uploaded. Nothing ever is.",
    ];
    lines.forEach((l, j) =>
      page.drawText(l, { x: 40, y: 710 - j * 18, size: 11, font, color: rgb(0.25, 0.25, 0.3) }),
    );
  }
  const bytes = await doc.save();
  return new File([bytes as unknown as BlobPart], "sample-document.pdf", { type: "application/pdf" });
}

const SAMPLE_CSV = `name,role,city,tools_used
Ada Lovelace,Engineer,London,12
Grace Hopper,Admiral,Arlington,9
Linus Torvalds,Maintainer,Helsinki,15
Margaret Hamilton,Director,Boston,11
`;

const SAMPLE_JSON = JSON.stringify(
  {
    project: "GigAI Tools sample",
    version: 2,
    features: ["format", "validate", "convert"],
    owner: { name: "Ada", active: true },
    stats: { tools: 260, categories: 11 },
  },
  null,
  2,
);

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
  <rect width="200" height="120" rx="12" fill="#eef2ff"/>
  <circle cx="150" cy="34" r="18" fill="#f59e0b"/>
  <path d="M0 120 L70 50 L130 120 Z" fill="#0f766e"/>
  <path d="M80 120 L140 66 L200 120 Z" fill="#115e59"/>
  <text x="12" y="24" font-family="sans-serif" font-size="12" fill="#312e81">Sample SVG</text>
</svg>
`;

/** Generate the sample file for `kind` (client-only; lazy, on demand). */
export async function getSampleFile(kind: SampleKind): Promise<File> {
  switch (kind) {
    case "image":
      return sampleImage();
    case "pdf":
      return samplePdf();
    case "csv":
      return new File([SAMPLE_CSV], "sample-data.csv", { type: "text/csv" });
    case "json":
      return new File([SAMPLE_JSON], "sample-data.json", { type: "application/json" });
    case "svg":
      return new File([SAMPLE_SVG], "sample-graphic.svg", { type: "image/svg+xml" });
  }
}
