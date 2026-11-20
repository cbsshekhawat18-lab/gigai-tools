"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import {
  epsToImages,
  epsPreviewToImages,
  probeEpsFile,
  EpsUnsupportedError,
  type EpsProbe,
} from "@/lib/vector/eps";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";

/** Render scales offered for real vector artwork. Bigger costs only time. */
const SCALES = [
  { value: 1, label: "1×", hint: "Screen / web" },
  { value: 2, label: "2×", hint: "Recommended" },
  { value: 4, label: "4×", hint: "Print quality" },
] as const;

/**
 * EPS / AI → PNG. Reuses the shared PDF tool harness: `usePdfTool` owns the
 * queue, progress, errors and ZIP bundling, and `PdfWorkspace` renders the
 * drop → ready → processing → done flow.
 *
 * We probe the file the moment it's added rather than waiting for the Convert
 * click, so the user learns UP FRONT what we can do with it, a real render, a
 * labelled low-res preview, or nothing, instead of pressing a button and
 * getting an error. The probe result also picks which path `process` takes.
 */
export default function EpsToPngTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [scale, setScale] = React.useState<number>(2);
  const [probe, setProbe] = React.useState<EpsProbe | null>(null);
  const [probing, setProbing] = React.useState(false);

  // Keep the freshest values available to the process callback.
  const scaleRef = React.useRef(scale);
  const probeRef = React.useRef(probe);
  React.useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  React.useEffect(() => {
    probeRef.current = probe;
  }, [probe]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: ".eps,.ai,application/postscript,application/illustrator",
    multiple: false,
    zipName: "eps-png-gigai",
    process: async (files: PdfInput[], onProgress): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) throw new Error("Add an EPS or AI file to convert.");

      const current = probeRef.current;

      // Opt-in fallback: no vector artwork, but a preview bitmap exists.
      if (current?.kind === "preview-only") {
        onProgress({ value: 0.4, label: "Extracting preview…" });
        return epsPreviewToImages(source.file, current.tiff);
      }

      // Nothing renderable, fail with the specific reason and its fix.
      if (current && current.kind !== "pdf") throw new EpsUnsupportedError(current.kind);

      const images = await epsToImages(source.file, {
        scale: scaleRef.current,
        onProgress: (value, label) => onProgress({ value, label }),
      });
      if (images.length === 0) {
        throw new Error("No artwork could be rendered from this file. It may be empty.");
      }
      return images;
    },
  });

  const source = state.files[0];
  const sourceFile = source?.file;

  // Probe as soon as a file lands, so the UI can tell the truth before any click.
  React.useEffect(() => {
    if (!sourceFile) {
      setProbe(null);
      return;
    }
    let cancelled = false;
    setProbing(true);
    probeEpsFile(sourceFile)
      .then((result) => {
        if (!cancelled) setProbe(result);
      })
      .catch(() => {
        if (!cancelled) setProbe({ kind: "unrecognised" });
      })
      .finally(() => {
        if (!cancelled) setProbing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sourceFile]);

  const kind = probe?.kind;
  const processLabel =
    kind === "preview-only" ? "Extract preview PNG" : "Convert to PNG";

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept=".eps,.ai,application/postscript,application/illustrator"
      multiple={false}
      dropIcon="Shapes"
      dropHint="Select one EPS or Illustrator AI file to render as a PNG"
      processLabel={processLabel}
      resultHint="Everything is read and rendered in your browser: nothing is uploaded."
    >
      {source ? (
        <div className="flex flex-col gap-6">
          {/* Source summary. */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <Icon name="Shapes" size={18} className={cn("shrink-0", style.text)} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-foreground">{source.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatBytes(source.size)}
                {probing ? " · checking file…" : null}
              </span>
            </span>
          </div>

          {/* Real vector artwork - offer a render scale. */}
          {kind === "pdf" ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="Layers" size={15} className={style.text} />
                Render scale
              </legend>
              <div role="radiogroup" aria-label="Render scale" className="grid grid-cols-3 gap-3">
                {SCALES.map((option) => {
                  const active = scale === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setScale(option.value)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-xl border p-3 text-center outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? cn("border-transparent", style.soft)
                          : "border-border bg-card hover:bg-accent",
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.hint}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                The source is vector, so a higher scale means genuinely sharper edges. Not
                an upscaled blur. Each artboard or page becomes its own PNG.
              </p>
            </fieldset>
          ) : null}

          {/* No vector artwork, but a preview bitmap exists - opt in, clearly labelled. */}
          {kind === "preview-only" ? (
            <div className="flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="TriangleAlert" size={15} className="shrink-0 text-amber-500" />
                No vector artwork in this file
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                This EPS holds only PostScript drawing code, which a browser can&apos;t
                render. It does contain a small preview bitmap that Illustrator embedded
                for on-screen display. We can save that instead.
                <strong className="font-medium text-foreground">
                  {" "}
                  It is a low-resolution proxy, not the real artwork
                </strong>
                , so expect it to be soft and unsuitable for print. For a true render,
                re-save the file from Illustrator with “Create PDF Compatible File” ticked.
              </p>
            </div>
          ) : null}

          {/* Nothing we can do - say so now, not after a click. */}
          {kind === "postscript-only" || kind === "unrecognised" ? (
            <div className="flex flex-col gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="TriangleAlert" size={15} className="shrink-0 text-destructive" />
                {kind === "unrecognised"
                  ? "This doesn't look like an EPS or AI file"
                  : "This file can't be rendered in a browser"}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {kind === "unrecognised"
                  ? "Check that you picked the right file and try again."
                  : "It contains only PostScript drawing code, with no embedded PDF and no preview image: typically output from LaTeX, gnuplot, matplotlib or older CAD software. Open it in Illustrator or Inkscape and re-save with “Create PDF Compatible File” ticked, or export it as PDF, and this tool will convert it."}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
