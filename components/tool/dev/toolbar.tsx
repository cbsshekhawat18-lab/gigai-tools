"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "./shortcuts-help";

/** Container for tool actions. Wraps responsively and scrolls if it must. */
export const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Toolbar({ className, role = "toolbar", children, ...props }, ref) {
  return (
    <div
      ref={ref}
      role={role}
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card/60 p-1.5 backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

/** Groups related buttons with tighter spacing. */
export function ToolbarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-0.5", className)} {...props} />;
}

/** Vertical rule between toolbar groups. */
export function ToolbarDivider({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mx-1 h-5 w-px shrink-0 self-center bg-border", className)}
    />
  );
}

/** Pushes following items to the far edge of the toolbar. */
export function ToolbarSpacer() {
  return <span className="flex-1" aria-hidden="true" />;
}

const toolbarButtonVariants = cva(
  "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium outline-none transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-foreground hover:bg-accent hover:text-accent-foreground",
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        active: "bg-accent text-accent-foreground",
        destructive:
          "text-destructive hover:bg-destructive/10 hover:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/** Props for {@link ToolbarButton}. */
export interface ToolbarButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    VariantProps<typeof toolbarButtonVariants> {
  /** Lucide icon name (rendered via the shared Icon component). */
  icon: string;
  /** Visible label; collapsed to icon-only on narrow screens. */
  label: string;
  /** Shortcut hint shown in the tooltip, e.g. "mod+enter". */
  kbd?: string;
  /**
   * Force the label to always/never show. By default it hides below `sm`.
   * "icon" keeps it icon-only everywhere (label still used for aria/tooltip).
   */
  labelMode?: "responsive" | "always" | "icon";
  /** Show a spinner instead of the icon (e.g. while running). */
  loading?: boolean;
  /** Extra classes for the icon (e.g. an export-format tint). */
  iconClassName?: string;
}

/**
 * A compact toolbar action: icon + label, with an optional keyboard hint and a
 * tooltip. On narrow viewports the label collapses to icon-only while remaining
 * accessible (aria-label + tooltip preserve the text).
 */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      icon,
      label,
      kbd,
      variant,
      labelMode = "responsive",
      loading = false,
      iconClassName,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const button = (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-keyshortcuts={kbd}
        disabled={disabled || loading}
        className={cn(toolbarButtonVariants({ variant }), className)}
        {...props}
      >
        <Icon
          name={loading ? "LoaderCircle" : icon}
          size={16}
          className={cn(loading && "animate-spin", iconClassName)}
        />
        {labelMode !== "icon" && (
          <span className={cn(labelMode === "responsive" && "hidden sm:inline")}>
            {label}
          </span>
        )}
      </button>
    );

    return (
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            <span>{label}</span>
            {kbd && <Kbd combo={kbd} className="opacity-90" />}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
