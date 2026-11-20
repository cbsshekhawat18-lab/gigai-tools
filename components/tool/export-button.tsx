"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { exportStyleFor } from "@/lib/export-styles";

const exportButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium outline-none transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 gap-1.5 px-3 text-xs",
        default: "h-9 gap-2 px-4 text-sm",
        lg: "h-11 gap-2 px-6 text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export interface ExportButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof exportButtonVariants> {
  /**
   * What's being exported: an extension ("pdf"), a filename ("report.pdf")
   * or a MIME type ("image/png"). Drives the icon, color and default label.
   */
  format?: string;
  /** Visible label. Default: "Download PDF" (from the resolved format tag). */
  label?: string;
  /** Lighter trailing detail, e.g. "1.2 MB". */
  meta?: string;
  /** "solid" = filled identity (primary download); "outline" = quieter row action. */
  emphasis?: "solid" | "outline";
  /** Override the format-derived icon. */
  icon?: string;
  /** Show a spinner and disable while an export is being produced. */
  loading?: boolean;
}

/**
 * A download/export action with a per-format identity (see lib/export-styles):
 * PDF reads as a document, CSV as a spreadsheet, JSON as code, ZIP as an
 * archive, instead of every export looking like the same generic button.
 */
export const ExportButton = React.forwardRef<HTMLButtonElement, ExportButtonProps>(
  function ExportButton(
    {
      format,
      label,
      meta,
      emphasis = "solid",
      icon,
      loading = false,
      size,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const style = exportStyleFor(format);
    const iconSize = size === "lg" ? 18 : size === "sm" ? 14 : 16;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        className={cn(
          exportButtonVariants({ size }),
          emphasis === "solid"
            ? cn(style.solid, "shadow-sm")
            : cn("border bg-background", style.outline),
          className,
        )}
        {...props}
      >
        <Icon
          name={loading ? "LoaderCircle" : (icon ?? style.icon)}
          size={iconSize}
          className={cn(loading && "animate-spin")}
        />
        {label ?? `Download ${style.tag}`}
        {meta ? (
          <span
            className={cn(
              "font-normal tabular-nums",
              emphasis === "solid" ? "text-white/75" : "opacity-70",
            )}
          >
            · {meta}
          </span>
        ) : null}
      </button>
    );
  },
);
