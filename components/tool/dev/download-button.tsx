"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { exportStyleFor } from "@/lib/export-styles";

import { ToolbarButton, type ToolbarButtonProps } from "./toolbar";

/** Data that {@link download} can save. */
export type Downloadable = string | Blob | ArrayBuffer | Uint8Array;

/**
 * Trigger a client-side file download. Works fully in-browser (no server):
 * builds a Blob, creates an object URL, clicks a synthetic link, and revokes.
 *
 * @param filename Suggested name, e.g. "output.json".
 * @param data     String, Blob, ArrayBuffer, or Uint8Array.
 * @param mime     MIME type (default "text/plain;charset=utf-8").
 */
export function download(
  filename: string,
  data: Downloadable,
  mime = "text/plain;charset=utf-8",
): void {
  if (typeof window === "undefined") return;

  const blob =
    data instanceof Blob
      ? data
      : new Blob(
          [
            data instanceof Uint8Array
              ? (data.buffer.slice(
                  data.byteOffset,
                  data.byteOffset + data.byteLength,
                ) as ArrayBuffer)
              : data,
          ],
          { type: mime },
        );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the click has been dispatched.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Props for {@link DownloadButton}. */
export interface DownloadButtonProps
  extends Omit<ToolbarButtonProps, "onClick" | "icon" | "label" | "value"> {
  /** File name to save as. */
  filename: string;
  /** Static content, or a getter evaluated on click (for large/live data). */
  value?: Downloadable;
  getValue?: () => Downloadable;
  /** MIME type. Default "text/plain;charset=utf-8". */
  mime?: string;
  /** Button label. Default "Download {FORMAT}" from the filename extension. */
  label?: string;
  /** Icon name. Defaults to the export format's identity icon. */
  icon?: string;
}

/**
 * Toolbar button that saves its `value` (or `getValue()`) as a file. Disabled
 * automatically when there is nothing to download. Carries the export format's
 * identity (lib/export-styles): "Download JSON" with an amber braces glyph,
 * "Download CSV" with a green table. Not the same generic button everywhere.
 */
export const DownloadButton = React.forwardRef<HTMLButtonElement, DownloadButtonProps>(
  function DownloadButton(
    { filename, value, getValue, mime, label, icon, disabled, variant, iconClassName, ...rest },
    ref,
  ) {
    const style = exportStyleFor(filename);
    const handle = React.useCallback(() => {
      const data = getValue ? getValue() : value;
      if (data === undefined || data === null) return;
      if (typeof data === "string" && data.length === 0) return;
      download(filename, data, mime);
    }, [filename, value, getValue, mime]);

    const isEmpty =
      !getValue &&
      (value === undefined ||
        value === null ||
        (typeof value === "string" && value.length === 0));

    return (
      <ToolbarButton
        ref={ref}
        icon={icon ?? style.icon}
        label={label ?? `Download ${style.tag}`}
        variant={variant}
        /* Tint the glyph with the format identity: except on filled primary,
           where a colored icon would fight the solid background. */
        iconClassName={cn(variant !== "primary" && style.text, iconClassName)}
        onClick={handle}
        disabled={disabled || isEmpty}
        {...rest}
      />
    );
  },
);
