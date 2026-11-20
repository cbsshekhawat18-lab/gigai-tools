"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ElapsedNote, useWorkTier } from "@/components/shared/working-state";

/** Props for {@link FfmpegProgress}. */
export interface FfmpegProgressProps {
  /**
   * Processing progress from ffmpeg's `progress` event, 0–1. Pass a value < 0
   * (or leave `busy` true with no progress) for an indeterminate bar.
   */
  progress?: number;
  /** Whether work is in flight. When false the component renders nothing. */
  busy: boolean;
  /**
   * True while the ~31 MB wasm core is downloading/instantiating for the first
   * time this session. Shows the one-time engine-loading note.
   */
  loadingEngine?: boolean;
  /** Optional current phase label, e.g. "Encoding", "Extracting audio". */
  label?: string;
  /** Optional cancel handler; renders a Cancel button when provided. */
  onCancel?: () => void;
  className?: string;
}

/**
 * An honest progress panel for ffmpeg.wasm work. Handles two states: the
 * one-time engine download ("loading the video engine (~31 MB)") and the actual
 * encode, with a determinate bar when ffmpeg reports progress and an
 * indeterminate shimmer otherwise. Always reminds the user that processing is
 * local and to keep the tab open. Renders nothing when `busy` is false.
 */
export function FfmpegProgress({
  progress,
  busy,
  loadingEngine = false,
  label,
  onCancel,
  className,
}: FfmpegProgressProps) {
  // Rule 1 (de-ai-ux): nothing at all inside the first second - fast encodes
  // must not flash progress UI. The hook must run before any early return.
  const { tier } = useWorkTier(busy);
  if (!busy || tier === "instant") return null;

  const determinate =
    !loadingEngine && typeof progress === "number" && progress >= 0 && progress <= 1;
  const pct = determinate ? Math.round((progress ?? 0) * 100) : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border border-border bg-muted/40 p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon
              name={loadingEngine ? "Download" : "Loader"}
              size={16}
              className="animate-spin [animation-duration:1.5s]"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {loadingEngine
                ? "Loading the video engine…"
                : label ?? "Processing in your browser…"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {loadingEngine
                ? "One-time ~31 MB download: cached after this."
                : "Runs entirely on your device. Larger files take a while. Keep this tab open."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {pct != null && (
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {pct}%
            </span>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
        {determinate ? (
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="h-full w-2/5 animate-[ffmpeg-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
        )}
      </div>

      <style>{`
        @keyframes ffmpeg-indeterminate {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
      <ElapsedNote busy={busy} progress={determinate ? progress : null} />
    </div>
  );
}
