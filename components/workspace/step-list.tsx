/**
 * GigAI Workspace, the pipeline step list (left sidebar).
 *
 * Renders the ordered steps the user has added. Each row shows the operation,
 * lets them select it (to reveal its controls in the center/right), reorder it,
 * apply just that step, or remove it. The whole pipeline can be run at once from
 * the shell's run button. This list is per-step control.
 */

"use client";

import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Operation, WorkspaceStep } from "@/lib/workspace/types";

export interface StepListProps {
  steps: WorkspaceStep[];
  operationsById: Map<string, Operation>;
  activeStepId: string | null;
  busy: boolean;
  onSelect: (stepId: string) => void;
  onMove: (stepId: string, dir: -1 | 1) => void;
  onRemove: (stepId: string) => void;
  onApply: (stepId: string) => void;
}

export function StepList({
  steps,
  operationsById,
  activeStepId,
  busy,
  onSelect,
  onMove,
  onRemove,
  onApply,
}: StepListProps) {
  if (steps.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
        No steps yet. Add operations to build a pipeline you can run across every file.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-1.5">
      {steps.map((step, i) => {
        const op = operationsById.get(step.operationId);
        const active = step.id === activeStepId;
        return (
          <li
            key={step.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg border p-1.5 transition-colors",
              active
                ? "border-primary/50 bg-primary/5"
                : "border-transparent hover:border-border hover:bg-muted/50",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(step.id)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-none"
              aria-pressed={active}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon name={op?.icon ?? "Wrench"} size={15} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {op?.label ?? step.operationId}
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                disabled={busy}
                onClick={() => onApply(step.id)}
                className="flex size-7 items-center justify-center rounded-md text-primary hover:bg-primary/10 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Apply ${op?.label ?? "step"}`}
                title="Apply this step to the selected files"
              >
                <Icon name="Play" size={14} />
              </button>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => onMove(step.id, -1)}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Move step up"
              >
                <Icon name="ChevronUp" size={14} />
              </button>
              <button
                type="button"
                disabled={i === steps.length - 1}
                onClick={() => onMove(step.id, 1)}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Move step down"
              >
                <Icon name="ChevronDown" size={14} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(step.id)}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Remove step"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
