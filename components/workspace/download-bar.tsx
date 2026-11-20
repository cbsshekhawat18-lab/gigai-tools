/**
 * GigAI Workspace: bottom panel: progress, per-file downloads, and Download-all.
 *
 * A ZIP is offered whenever more than one asset is present; a single asset
 * downloads directly. Everything is built in-browser (fflate), nothing leaves
 * the machine.
 */

"use client";

import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/image/engine";
import { ProgressBar } from "./progress-bar";
import type { RunProgress } from "@/lib/workspace/store";
import type { Asset } from "@/lib/workspace/types";

export interface DownloadBarProps {
  assets: Asset[];
  busy: boolean;
  progress: RunProgress | null;
  error: string | null;
  onDownloadAll: () => void;
  onDownloadOne: (id: string) => void;
}

export function DownloadBar({
  assets,
  busy,
  progress,
  error,
  onDownloadAll,
  onDownloadOne,
}: DownloadBarProps) {
  const totalSize = assets.reduce((sum, a) => sum + a.meta.size, 0);

  return (
    <div className="flex flex-col gap-2">
      {progress && <ProgressBar progress={progress} />}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive"
        >
          <Icon name="TriangleAlert" size={14} />
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {assets.length === 0
              ? "No files yet"
              : `${assets.length} file${assets.length === 1 ? "" : "s"} · ${formatBytes(totalSize)}`}
          </span>
          {/* Per-file quick download chips (scrollable so the bar never grows). */}
          {assets.length > 1 && (
            <div className="flex max-w-full items-center gap-1 overflow-x-auto">
              {assets.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onDownloadOne(a.id)}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title={`Download ${a.name}`}
                >
                  <Icon name="Download" size={11} />
                  <span className="max-w-[9rem] truncate">{a.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          size="sm"
          disabled={assets.length === 0 || busy}
          onClick={onDownloadAll}
          className="shrink-0"
        >
          <Icon name={assets.length > 1 ? "FileArchive" : "Download"} size={15} />
          {assets.length > 1 ? "Download all (ZIP)" : "Download"}
        </Button>
      </div>
    </div>
  );
}
