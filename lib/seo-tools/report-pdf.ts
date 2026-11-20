/**
 * GigAI SEO tools, render a self-contained report HTML string to a PDF Blob.
 *
 * Why not reuse `lib/document-tools/render-pdf`? That helper injects the HTML
 * into the LIVE app body, so html2canvas inherits the app's Tailwind v4 theme -
 * whose colors are authored in `oklch()`, which html2canvas 1.4.x cannot parse
 * (it throws "unsupported color function oklch"). Rendering inside an isolated
 * iframe (only the report's own inline, hex-colored styles) sidesteps that
 * entirely and keeps the output pixel-faithful to the branded report.
 *
 * Everything is heavy (html2canvas + jspdf) so it's all dynamic-imported and
 * only pulled in when a user actually exports.
 */

/** Rasterise a complete report HTML document to a paginated A4 PDF Blob. */
export async function reportHtmlToPdfBlob(html: string): Promise<Blob> {
  if (typeof document === "undefined") throw new Error("PDF export runs in the browser only.");

  const WIDTH = 794; // ≈ A4 width at 96dpi
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${WIDTH}px`,
    height: "1123px",
    border: "0",
    background: "#ffffff",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(iframe);

  try {
    // Load the report into the isolated document (same-origin srcdoc).
    await new Promise<void>((resolve, reject) => {
      iframe.onload = () => resolve();
      iframe.onerror = () => reject(new Error("Report failed to render."));
      iframe.srcdoc = html;
    });
    const doc = iframe.contentDocument;
    if (!doc || !doc.body) throw new Error("Report document unavailable.");
    // Let layout/fonts settle, then size the frame to the full content height.
    await new Promise((r) => setTimeout(r, 120));
    const fullH = Math.max(doc.body.scrollHeight, doc.body.offsetHeight, 200);
    iframe.style.height = `${fullH}px`;

    // Keep the raster under the GPU texture ceiling (~16k px) on tall reports.
    const scale = Math.max(1, Math.min(2, Math.floor(15000 / Math.max(fullH, 1))));

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(doc.body, {
      backgroundColor: "#ffffff",
      scale,
      width: WIDTH,
      height: fullH,
      windowWidth: WIDTH,
      windowHeight: fullH,
      useCORS: true,
    });

    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    // Full-bleed image, paged by shifting it up one page height at a time.
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    return pdf.output("blob");
  } finally {
    iframe.remove();
  }
}
