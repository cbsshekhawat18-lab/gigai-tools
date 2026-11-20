"use client";

import * as React from "react";

import { ToolbarButton, type ToolbarButtonProps } from "./toolbar";

/** Props for {@link CopyButton}. */
export interface CopyButtonProps
  extends Omit<ToolbarButtonProps, "onClick" | "icon" | "label"> {
  /** Static text to copy. */
  value?: string;
  /** Getter evaluated at click time (for live/large content). Takes priority. */
  getValue?: () => string;
  /** Label shown normally. Default "Copy". */
  label?: string;
  /** Label shown for 1.5s after copying. Default "Copied". */
  copiedLabel?: string;
  /** Called after a successful copy. */
  onCopied?: (value: string) => void;
}

/**
 * Copy-to-clipboard button with a 1.5s success state (icon + label swap) and an
 * accessible live announcement. Disabled when there is nothing to copy.
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      value,
      getValue,
      label = "Copy",
      copiedLabel = "Copied",
      onCopied,
      disabled,
      ...rest
    },
    ref,
  ) {
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      [],
    );

    const handle = React.useCallback(async () => {
      const text = getValue ? getValue() : value ?? "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopied?.(text);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      } catch {
        // Clipboard blocked (insecure context / permissions), stay silent in
        // the button; callers relying on copy should surface their own error.
      }
    }, [getValue, value, onCopied]);

    const isEmpty = !getValue && !value;

    return (
      <>
        <ToolbarButton
          ref={ref}
          icon={copied ? "Check" : "Copy"}
          label={copied ? copiedLabel : label}
          variant={copied ? "active" : rest.variant}
          onClick={handle}
          disabled={disabled || isEmpty}
          {...rest}
        />
        <span aria-live="polite" className="sr-only">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </>
    );
  },
);
