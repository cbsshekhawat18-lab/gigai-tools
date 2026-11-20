"use client";

import * as React from "react";

import { Icon } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarButton } from "./toolbar";

/** A sample input the user can load with one click. */
export interface Example<T = string> {
  /** Menu entry label. */
  label: string;
  /** Optional secondary description. */
  description?: string;
  /** The value loaded when picked (usually the input string). */
  value: T;
  /** Optional lucide icon. */
  icon?: string;
}

/** Props for {@link ExamplesMenu}. */
export interface ExamplesMenuProps<T = string> {
  examples: ReadonlyArray<Example<T>>;
  onPick: (value: T, example: Example<T>) => void;
  /** Menu heading. Default "Load an example". */
  heading?: string;
  /** Trigger button label. Default "Examples". */
  label?: string;
}

/**
 * A dropdown that loads sample inputs into a tool. Great for onboarding and for
 * demonstrating edge cases. Purely presentational: the parent decides what
 * happens on pick (usually `history.set(value)`).
 */
export function ExamplesMenu<T = string>({
  examples,
  onPick,
  heading = "Load an example",
  label = "Examples",
}: ExamplesMenuProps<T>) {
  if (examples.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton icon="Lightbulb" label={label} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56 max-w-72">
        <DropdownMenuLabel>{heading}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {examples.map((ex, i) => (
          <DropdownMenuItem
            key={`${ex.label}-${i}`}
            onSelect={() => onPick(ex.value, ex)}
            className="flex-col items-start gap-0.5"
          >
            <span className="flex items-center gap-2 font-medium">
              {ex.icon && <Icon name={ex.icon} size={14} />}
              {ex.label}
            </span>
            {ex.description && (
              <span className="pl-0 text-sm text-muted-foreground">
                {ex.description}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
