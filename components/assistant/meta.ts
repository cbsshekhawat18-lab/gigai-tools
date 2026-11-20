import type { Processing } from "@/lib/assistant/types";

/**
 * Presentation metadata shared by the assistant panel, kept out of the panel
 * component so both the primary card and alternative rows stay DRY.
 *
 * `Processing` tells the user WHERE their file is handled, which is a privacy
 * signal on this platform: Browser = never leaves the device, Server = uploaded,
 * AI = run through a model. Each gets a distinct (semantic, not accent) tint and
 * a lucide icon name resolved through `@/lib/icons`.
 */
export interface ProcessingMeta {
  /** Short label rendered in the badge. */
  label: Processing;
  /** lucide icon name (resolved via <Icon name />). */
  icon: string;
  /** One-line tooltip / aria description. */
  hint: string;
  /** Tailwind classes for the badge (token- + semantic-color based). */
  className: string;
}

export const PROCESSING_META: Record<Processing, ProcessingMeta> = {
  Browser: {
    label: "Browser",
    icon: "ShieldCheck",
    hint: "Runs 100% in your browser, your files never leave this device.",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  Server: {
    label: "Server",
    icon: "Cloud",
    hint: "Processed on our server: your file is uploaded, then deleted.",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  AI: {
    label: "AI",
    icon: "Sparkles",
    hint: "Powered by an AI model for the best result.",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
};
