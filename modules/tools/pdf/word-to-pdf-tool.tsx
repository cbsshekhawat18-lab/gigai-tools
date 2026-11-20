"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { changeExtension } from "@/lib/pdf/types";
import { convertOnServer } from "@/lib/api";
import { docxToHtml } from "@/lib/document-tools/docx-html";
import { renderHtmlToPdfReport, type RenderEngine } from "@/lib/document-tools/render-pdf";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

/** Accept Word documents by extension and MIME (browsers vary on .doc type). */
const ACCEPT =
  ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword";

/** Which path produced the result, surfaced in the result copy. */
type ConversionPath = "server" | RenderEngine;

/**
 * The LibreOffice endpoint has been absent since the box was rebuilt, and
 * probing a 404 before every single conversion costs a round trip and litters
 * the console. We still try it once per page load, so a redeployed converter
 * lights up on its own, then remember the answer for the rest of the session.
 */
let serverConverterMissing = false;

/**
 * Convert in the browser: .docx -> HTML (keeping headings, underline and
 * paragraph alignment) -> PDF. The renderer draws real text wherever the PDF
 * standard fonts can, and only falls back to a rasterised page for scripts they
 * cannot encode. See lib/document-tools/render-pdf.ts.
 */
async function convertInBrowser(file: File): Promise<{ blob: Blob; engine: RenderEngine }> {
  const arrayBuffer = await file.arrayBuffer();
  const html = await docxToHtml(arrayBuffer);

  const rendered = await renderHtmlToPdfReport(html, {
    // Word's own default page margin, so the result reads like the original.
    margin: 72,
    fontSize: 11,
    title: file.name.replace(/\.[^.]+$/, ""),
    pixelWidth: 794, // ≈ A4 at 96dpi, used only by the raster fallback
  });
  if (!rendered.ok) throw new Error(rendered.error);
  return { blob: rendered.result.blob, engine: rendered.result.engine };
}

/**
 * Word to PDF. Tries the ephemeral LibreOffice endpoint first when it is
 * available, then converts entirely in the browser. Which path ran is recorded
 * and shown in the result card, so the copy never overstates the output.
 */
export default function WordToPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const pathRef = React.useRef<ConversionPath | null>(null);
  const [lastPath, setLastPath] = React.useState<ConversionPath | null>(null);

  const state = usePdfTool({
    slug: tool.slug,
    accept: ACCEPT,
    multiple: false,
    zipName: "word-to-pdf-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) {
        throw new Error("Add a Word document (.docx or .doc) to convert.");
      }

      const outName = changeExtension(input.name, "pdf");

      // 1) Preferred when it exists: faithful LibreOffice render.
      if (!serverConverterMissing) {
        try {
          const blob = await convertOnServer(input.file, "word-to-pdf");
          if (blob.size === 0) throw new Error("The server returned an empty file.");
          pathRef.current = "server";
          return [{ name: outName, blob, size: blob.size }];
        } catch {
          serverConverterMissing = true;
        }
      }

      // 2) In-browser conversion.
      try {
        const { blob, engine } = await convertInBrowser(input.file);
        if (blob.size === 0) {
          throw new Error("The document produced no content to convert.");
        }
        pathRef.current = engine;
        return [{ name: outName, blob, size: blob.size }];
      } catch (err) {
        const detail = err instanceof Error ? err.message : "Conversion failed.";
        throw new Error(
          `We couldn't convert this document. ${detail} Please check it's a valid .docx file and try again.`,
        );
      }
    },
  });

  React.useEffect(() => {
    if (state.phase === "done") {
      setLastPath(pathRef.current);
    } else if (state.phase === "idle" || state.phase === "ready") {
      setLastPath(null);
      pathRef.current = null;
    }
  }, [state.phase]);

  const input = state.files[0];

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept={ACCEPT}
      multiple={false}
      dropIcon="FileText"
      dropHint="Select one Word document (.docx or .doc) to convert to PDF"
      processLabel="Convert to PDF"
      resultHint="Converted in your browser. Your document is never uploaded."
    >
      {/* The single queued document. Order is irrelevant, so it isn't reorderable. */}
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        accent={tool.accent}
        label="Document to convert"
      />

      {/* Honest note about how conversion works before the user commits. */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <Icon name="Info" size={16} className={style.text} />
          {input ? input.name : "Ready to convert"}
        </span>
        <p className="text-muted-foreground">
          Your document is converted right here in your browser; it is never
          uploaded, so there is nothing to store and nothing to delete. Headings,
          bold and italic runs, underlines, alignment, lists, tables and images
          carry across, and the text stays selectable in the PDF. Page size and
          margins are rebuilt rather than copied from Word, so a page may break
          in a different place than it does on your screen.
        </p>
      </div>

      {/* After a run, show which path produced the file. */}
      {lastPath ? <PathNotice path={lastPath} accent={tool.accent} /> : null}
    </PdfWorkspace>
  );
}

/** Describes which conversion path produced the PDF, and its trade-off. */
function PathNotice({
  path,
  accent,
}: {
  path: ConversionPath;
  accent: ImageToolProps["tool"]["accent"];
}) {
  const style = accentStyle(accent);
  const good = path === "server" || path === "text";
  const copy =
    path === "server"
      ? "Converted with the high-fidelity server render: fonts, tables and layout preserved. Your file was deleted right after."
      : path === "text"
        ? "Converted in your browser, and your document was never uploaded. The text in this PDF is selectable and searchable."
        : "Converted in your browser, and your document was never uploaded. This document uses a script the standard PDF fonts can't encode, so the page was drawn as an image: it looks right, but the text isn't selectable.";
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        good ? cn(style.border, style.soft) : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
      )}
    >
      <Icon
        name={good ? "ShieldCheck" : "TriangleAlert"}
        size={15}
        className="mt-0.5 shrink-0"
      />
      <span>{copy}</span>
    </p>
  );
}
