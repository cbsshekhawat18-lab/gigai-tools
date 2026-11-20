"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import type { Stage } from "@/lib/video-work/pipeline";

interface PipelineViewProps {
  stages: Stage[];
  videoLabel: string;
  onCancel?: () => void;
  className?: string;
}

const STATE_ICON: Record<Stage["state"], { name: string; className: string }> = {
  pending: { name: "Circle", className: "text-muted-foreground/40" },
  active: { name: "LoaderCircle", className: "text-primary animate-spin" },
  done: { name: "CircleCheck", className: "text-emerald-500" },
  skipped: { name: "CircleMinus", className: "text-muted-foreground/60" },
  failed: { name: "CircleX", className: "text-rose-500" },
};

/**
 * Live processing status.
 *
 * Every number on this screen is measured. Stages that can report a fraction do
 * (transcription, frame scanning, OCR); the one that cannot: a single model
 * call. Shows an indeterminate state and says what it is doing, rather than
 * animating a bar toward a completion time nobody knows. Faking that is an easy
 * way to make a tool feel responsive and a reliable way to make it feel like a
 * liar the first time the fake bar sits at 90% for a minute.
 *
 * Each row also says where the work happens, on the device or on the server.
 * That is the one thing a user handing over a client recording most wants to
 * know, so it is on the main screen rather than in a privacy page.
 */
export function PipelineView({ stages, videoLabel, onCancel, className }: PipelineViewProps) {
  const active = stages.find((stage) => stage.state === "active");
  const done = stages.filter((s) => s.state === "done" || s.state === "skipped").length;

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{videoLabel}</p>
          <p className="text-xs text-muted-foreground">
            {active ? active.label : done === stages.length ? "Finished" : "Preparing…"} · step{" "}
            {Math.min(done + (active ? 1 : 0), stages.length)} of {stages.length}
          </p>
        </div>
        {onCancel ? (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>

      <ol className="space-y-3">
        {stages.map((stage) => {
          const icon = STATE_ICON[stage.state];
          return (
            <li key={stage.id} className="flex gap-3">
              <Icon name={icon.name} className={cn("mt-0.5 size-4 shrink-0", icon.className)} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      stage.state === "pending" && "text-muted-foreground",
                      stage.state === "skipped" && "text-muted-foreground line-through",
                    )}
                  >
                    {stage.label}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1 py-px text-[10px] font-medium uppercase tracking-wide",
                      stage.where === "device"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                    )}
                  >
                    {stage.where === "device" ? "on your device" : "on our server"}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stage.error ?? stage.note ?? stage.detail}
                </p>

                {stage.state === "active" ? (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-primary transition-[width] duration-300",
                        // No measurable fraction, pulse instead of inventing one.
                        stage.progress === 0 && "w-1/3 animate-pulse",
                      )}
                      style={stage.progress > 0 ? { width: `${stage.progress * 100}%` } : undefined}
                    />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
