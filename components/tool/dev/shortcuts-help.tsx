"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isApplePlatform } from "./use-shortcuts";

/** One documented shortcut for {@link ShortcutsHelp}. */
export interface ShortcutHint {
  /** Combo string, e.g. "mod+enter" (same syntax as useShortcuts). */
  combo: string;
  /** What it does. */
  description: string;
}

const KEY_LABELS: Record<string, string> = {
  mod: "",
  meta: "⌘",
  cmd: "⌘",
  command: "⌘",
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: "",
  option: "⌥",
  opt: "⌥",
  shift: "⇧",
  enter: "↵",
  esc: "Esc",
  escape: "Esc",
  space: "Space",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

function labelForToken(token: string, apple: boolean): string {
  const t = token.toLowerCase();
  if (t === "mod") return apple ? "⌘" : "Ctrl";
  if (t === "alt") return apple ? "⌥" : "Alt";
  const mapped = KEY_LABELS[t];
  if (mapped) return mapped;
  return token.length === 1 ? token.toUpperCase() : token[0]!.toUpperCase() + token.slice(1);
}

/** Render a combo string as styled `<kbd>` chips. */
export function Kbd({ combo, className }: { combo: string; className?: string }) {
  const apple = isApplePlatform();
  const tokens = combo.split("+").map((t) => t.trim()).filter(Boolean);
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {tokens.map((token, i) => (
        <kbd
          key={`${token}-${i}`}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground shadow-sm"
        >
          {labelForToken(token, apple)}
        </kbd>
      ))}
    </span>
  );
}

/** Props for {@link ShortcutsHelp}. */
export interface ShortcutsHelpProps {
  /** Shortcuts to list. */
  shortcuts: ShortcutHint[];
  /** Custom trigger. Defaults to a ghost "?" button. */
  trigger?: React.ReactNode;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A keyboard-shortcuts reference dialog. Pass the same combos you registered
 * with {@link useShortcuts}; they render as platform-correct `<kbd>` chips.
 */
export function ShortcutsHelp({
  shortcuts,
  trigger,
  open,
  onOpenChange,
}: ShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label="Keyboard shortcuts" title="Keyboard shortcuts"
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Icon name="Keyboard" size={16} />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Keyboard" size={18} />
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>Work faster without leaving the keyboard.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border">
          {shortcuts.map((s) => (
            <li key={s.combo} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-foreground">{s.description}</span>
              <Kbd combo={s.combo} />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
