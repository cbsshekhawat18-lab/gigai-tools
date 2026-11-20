/**
 * GigAI Workspace: full-cover "drop files to add" overlay.
 *
 * Rendered by a workspace root (which must be `position: relative`) while the
 * user is dragging files over the page. Pairs with `useFileDrop`, which owns the
 * window-level drag/drop handling; this component is purely visual and never
 * intercepts the drop itself.
 */

"use client";

import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function DropOverlay({
  show,
  label = "Drop files to add them",
  hint = "Nothing is uploaded: everything stays on your device.",
}: {
  show: boolean;
  label?: string;
  hint?: string;
}) {
  if (!show) return null;
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-30 flex items-center justify-center",
        "rounded-2xl border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm",
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon name="Upload" size={26} />
        </span>
        <p className="text-base font-semibold text-foreground">{label}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
