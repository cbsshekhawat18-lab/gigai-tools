import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Which workspace silhouette to mimic while a tool's chunk loads:
 * - "upload": file tools (image/pdf/document/video/audio), a dashed drop zone.
 * - "editor": text tools (dev/seo/svg): toolbar + tall code/text pane.
 * - "studio": QR studio, form column + square preview panel.
 */
export type ToolSkeletonKind = "upload" | "editor" | "studio";

/**
 * Loading placeholder for the lazy tool mount (tool-ui-registry). Shaped like
 * the workspace that will replace it, so the swap doesn't jump, unlike a
 * generic card skeleton, the page keeps its silhouette while the chunk loads.
 */
export function ToolMountSkeleton({
  kind = "upload",
  className,
}: {
  kind?: ToolSkeletonKind;
  className?: string;
}) {
  return (
    <Card
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("overflow-hidden rounded-2xl p-4 sm:p-6", className)}
    >
      <span className="sr-only">Loading tool…</span>

      {kind === "upload" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border px-6 py-16">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-52 max-w-full" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="h-3 w-44 max-w-full" />
          <Skeleton className="h-7 w-36 rounded-full" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
      ) : null}

      {kind === "editor" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card/60 p-1.5">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <span className="flex-1" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ) : null}

      {kind === "studio" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card/60 p-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-2/3 rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 flex-1 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
