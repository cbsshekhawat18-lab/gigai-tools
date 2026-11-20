"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatClock, type Finding, type VideoAsset } from "@/lib/video-work/types";

export interface WorkPlayerHandle {
  seekTo: (ms: number) => void;
  play: () => void;
  pause: () => void;
}

interface WorkPlayerProps {
  video: VideoAsset;
  /** Findings from this video, rendered as markers on the scrub bar. */
  findings: Finding[];
  /** Clicking a marker opens that finding. */
  onOpenFinding: (id: string) => void;
  className?: string;
}

const MARKER_COLOR: Record<Finding["type"], string> = {
  BUG: "bg-rose-500",
  FEATURE: "bg-emerald-500",
  DESIGN_CHANGE: "bg-teal-500",
  CONTENT_CHANGE: "bg-amber-500",
  TASK: "bg-sky-500",
  QUESTION: "bg-orange-500",
  DECISION: "bg-blue-500",
  REQUIREMENT: "bg-cyan-500",
  REFERENCE: "bg-muted-foreground",
};

/**
 * The evidence player.
 *
 * A plain `<video>` rather than a player library: everything needed here is
 * native, and clicking a timestamp anywhere in the workspace must land on the
 * exact frame, which is easier to guarantee without a wrapper in the way.
 *
 * The scrub bar carries a marker per finding, so the recording doubles as an
 * index: a client video is not a story to watch start-to-finish, it's a set of
 * moments where something was asked for.
 *
 * When a project is reopened from storage the file is gone by design (see
 * lib/video-work/storage.ts), so this renders an explicit "re-add the file to
 * scrub" state rather than a broken player.
 */
export const WorkPlayer = React.forwardRef<WorkPlayerHandle, WorkPlayerProps>(
  function WorkPlayer({ video, findings, onOpenFinding, className }, ref) {
    const mediaRef = React.useRef<HTMLVideoElement>(null);
    const [currentMs, setCurrentMs] = React.useState(0);
    const [playing, setPlaying] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
      seekTo: (ms: number) => {
        const media = mediaRef.current;
        if (!media) return;
        media.currentTime = Math.max(0, ms / 1000);
        setCurrentMs(ms);
        void media.play().catch(() => {
          /* autoplay policy: the seek still landed, which is the point */
        });
      },
      play: () => void mediaRef.current?.play().catch(() => {}),
      pause: () => mediaRef.current?.pause(),
    }));

    const duration = video.durationMs || 1;

    if (!video.objectUrl) {
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center",
            className,
          )}
        >
          <Icon name="FileVideo" className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Screenshots kept, video not stored</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Recordings are never written to storage. They often contain client data. Every finding,
            screenshot and timestamp was saved. Re-add the file if you want to scrub the video again.
          </p>
        </div>
      );
    }

    return (
      <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
        <video
          ref={mediaRef}
          src={video.objectUrl}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full bg-black"
          onTimeUpdate={(event) => setCurrentMs(event.currentTarget.currentTime * 1000)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        <div className="space-y-2 p-3">
          {/* Marker track - the recording as an index of moments. */}
          <div className="relative h-7">
            <div className="absolute inset-x-0 top-3 h-1 rounded-full bg-muted" />
            <div
              className="absolute top-3 h-1 rounded-full bg-primary/60"
              style={{ width: `${Math.min(100, (currentMs / duration) * 100)}%` }}
            />
            {findings.map((finding) => {
              const left = Math.min(99.5, (finding.evidence.timestampMs / duration) * 100);
              return (
                <button
                  key={finding.id}
                  type="button"
                  onClick={() => onOpenFinding(finding.id)}
                  title={`${finding.id}, ${finding.title} (${formatClock(finding.evidence.timestampMs)})`}
                  aria-label={`Open ${finding.id} at ${formatClock(finding.evidence.timestampMs)}`}
                  className={cn(
                    "absolute top-1.5 size-4 -translate-x-1/2 rounded-full border-2 border-background transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    MARKER_COLOR[finding.type],
                  )}
                  style={{ left: `${left}%` }}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              {formatClock(currentMs)} / {formatClock(video.durationMs)}
            </span>
            <span>
              {findings.length} marker{findings.length === 1 ? "" : "s"}
              {playing ? " · playing" : ""}
            </span>
          </div>
        </div>
      </div>
    );
  },
);
