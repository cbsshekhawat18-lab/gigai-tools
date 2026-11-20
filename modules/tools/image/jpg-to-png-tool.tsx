"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  convertFormat,
  formatBytes,
  type LoadedImage,
  type ProcessResult,
} from "@/lib/image/engine";
import { useImageTool } from "@/hooks/use-image-tool";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import type { ImageToolProps } from "@/components/tool/types";

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/**
 * JPG to PNG; a deliberately settings-free converter. PNG is lossless, so there
 * is no quality dial to tune: the control panel simply explains what conversion
 * does, and `convertFormat` re-encodes the decoded JPEG as PNG. The result panel
 * reports the new dimensions, the PNG size and how the file size changed.
 */
export default function JpgToPngTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const state = useImageTool({
    slug: tool.slug,
    accept: "image/jpeg,image/jpg,image/png,image/*",
    process: (img: LoadedImage): Promise<ProcessResult> =>
      convertFormat(img, { format: "image/png" }),
    outputName: (img) => `${baseName(img.file.name)}-gigai.png`,
  });

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel="Convert to PNG"
      formatsHint="JPG or JPEG in, lossless PNG out"
      controls={
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3.5",
              style.border,
              style.soft,
            )}
          >
            <Icon
              name="ShieldCheck"
              size={18}
              className={cn("mt-0.5 shrink-0", style.text)}
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">
                Lossless conversion
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                PNG keeps every pixel exactly as it is, so there are no quality
                settings to choose. Your JPG is re-encoded once, with no further
                compression.
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-2" aria-label="What conversion does">
            {[
              { icon: "Layers", text: "Ready to edit and layer in design tools" },
              { icon: "Scissors", text: "First step before removing a background" },
              { icon: "Type", text: "Keeps text and flat color razor-sharp" },
            ].map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <Icon
                  name={item.icon}
                  size={15}
                  className={cn("shrink-0", style.text)}
                />
                {item.text}
              </li>
            ))}
          </ul>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Note: a PNG of a photo is usually larger than the JPG, that&apos;s the
            cost of perfect, lossless fidelity.
          </p>
        </div>
      }
      resultMeta={(result, image) => {
        const original = image.file.size;
        const delta = result.size - original;
        const pct = original > 0 ? Math.round((Math.abs(delta) / original) * 100) : 0;
        const bigger = delta > 0;

        return (
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Dimensions</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {result.width}&times;{result.height}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">PNG size</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(result.size)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">
                {bigger ? "Larger" : "Smaller"}
              </dt>
              <dd
                className={cn(
                  "inline-flex items-center justify-center gap-1 text-sm font-semibold tabular-nums",
                  bigger ? "text-muted-foreground" : style.text,
                )}
              >
                <Icon
                  name={bigger ? "TrendingUp" : "TrendingDown"}
                  size={14}
                />
                {pct === 0 ? "no change" : `${pct}%`}
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
