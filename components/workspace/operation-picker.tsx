/**
 * GigAI Workspace, the operation picker.
 *
 * A dropdown of the category's available operations. Choosing one appends a step
 * to the pipeline. Ops that can't run on any loaded asset kind are disabled with
 * an honest hint rather than hidden, so the catalog is discoverable.
 */

"use client";

import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AssetKind, Operation } from "@/lib/workspace/types";

export interface OperationPickerProps {
  operations: Operation[];
  /** Kinds currently present in the workspace (to enable/disable ops). */
  presentKinds: AssetKind[];
  onPick: (operationId: string) => void;
}

export function OperationPicker({ operations, presentKinds, onPick }: OperationPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Icon name="Plus" size={15} />
          Add step
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Add an operation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {operations.map((op) => {
          const runnable =
            presentKinds.length === 0 || op.accepts.some((k) => presentKinds.includes(k));
          return (
            <DropdownMenuItem
              key={op.id}
              disabled={!runnable}
              onSelect={() => runnable && onPick(op.id)}
              className="flex items-start gap-2.5 py-2"
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon name={op.icon} size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{op.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {op.description}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
