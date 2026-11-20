/**
 * GigAI Workspace, a single file row in the left sidebar files list.
 *
 * Shows a live thumbnail (the asset's preview object URL: works for images
 * directly; PDF assets carry a rendered first-page preview blob), the name,
 * size, and quick actions (download, remove). Selection + multi-select toggle
 * are driven by the store.
 */

"use client";

import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/image/engine";
import type { Asset, AssetKind, IconName } from "@/lib/workspace/types";

export interface AssetThumbProps {
  asset: Asset;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onRemove: () => void;
  onDownload: () => void;
  /**
   * Category-supplied fallback icon (from `WorkspaceCategory.thumbIcon`) for
   * kinds whose `previewUrl` isn't an <img>-renderable raster. Ignored for
   * image/svg (they use the real thumbnail).
   */
  thumbIcon?: IconName;
}

/**
 * Kinds whose `previewUrl` is an <img>-renderable raster: image/svg render
 * their file directly, and pdf carries a rendered first-page preview blob.
 */
const RASTER_KINDS: readonly AssetKind[] = ["image", "svg", "pdf"];

/** Sensible fallback thumbnail icon per non-raster kind. */
const KIND_ICON: Record<AssetKind, IconName> = {
  image: "Image",
  svg: "Image",
  pdf: "FileText",
  audio: "Music",
  video: "Video",
  document: "FileText",
  text: "FileType",
};

/** Short corner badge shown over the thumbnail per kind. */
const KIND_BADGE: Partial<Record<AssetKind, string>> = {
  pdf: "PDF",
  audio: "AUD",
  video: "VID",
  document: "DOC",
  text: "TXT",
};

export function AssetThumb({
  asset,
  selected,
  onSelect,
  onToggle,
  onRemove,
  onDownload,
  thumbIcon,
}: AssetThumbProps) {
  const isRaster = RASTER_KINDS.includes(asset.kind);
  const fallbackIcon = thumbIcon ?? KIND_ICON[asset.kind];
  const badge = KIND_BADGE[asset.kind];
  const dims =
    asset.kind === "image" && asset.meta.width && asset.meta.height
      ? `${asset.meta.width}×${asset.meta.height}`
      : (asset.kind === "pdf" || asset.kind === "document") && asset.meta.pageCount
        ? `${asset.meta.pageCount} page${asset.meta.pageCount === 1 ? "" : "s"}`
        : undefined;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border p-2 transition-colors",
        selected
          ? "border-primary/50 bg-primary/5"
          : "border-transparent hover:border-border hover:bg-muted/50",
      )}
    >
      <button
        type="button"
        onClick={(e) => (e.metaKey || e.ctrlKey ? onToggle() : onSelect())}
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
        aria-pressed={selected}
      >
        <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          {isRaster ? (
            // image/svg (and pdf, which carries a rendered first-page raster)
            // expose an <img>-renderable preview via previewUrl.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.previewUrl}
              alt=""
              className="size-full object-cover"
              draggable={false}
            />
          ) : (
            // Non-raster kinds (audio/video/document/text): render an icon tile
            // instead of a broken <img>.
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <Icon name={fallbackIcon} size={20} />
            </span>
          )}
          {badge && (
            <span className="absolute bottom-0 right-0 rounded-tl bg-background/90 px-1 text-[9px] font-semibold text-muted-foreground">
              {badge}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{asset.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {formatBytes(asset.meta.size)}
            {dims ? ` · ${dims}` : ""}
            {asset.history.length > 0 ? ` · edited` : ""}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={onDownload}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Download ${asset.name}`} title={`Download ${asset.name}`}
        >
          <Icon name="Download" size={15} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Remove ${asset.name}`} title={`Remove ${asset.name}`}
        >
          <Icon name="X" size={15} />
        </button>
      </div>
    </div>
  );
}
