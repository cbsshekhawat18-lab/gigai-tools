"use client";

import { useEffect, useRef } from "react";

/** A single keyboard shortcut spec: `combo` like "mod+enter" -> handler. */
export type ShortcutMap = Record<string, (event: KeyboardEvent) => void>;

/** Options for {@link useShortcuts}. */
export interface UseShortcutsOptions {
  /**
   * Allow shortcuts to fire while a text input/textarea/contentEditable is
   * focused. By default only combos using the platform mod key (Cmd/Ctrl) fire
   * inside editors; plain keys are ignored so typing isn't hijacked. Default false.
   */
  allowInInputs?: boolean;
  /** Disable all handling (e.g. while a modal owns the keyboard). Default false. */
  disabled?: boolean;
  /** Target to attach the listener to. Default `window`. */
  target?: Window | HTMLElement | null;
}

/** True on macOS/iOS, where the mod key is Cmd rather than Ctrl. */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
}

/** Human label for the mod key on this platform. */
export function modKeyLabel(): string {
  return isApplePlatform() ? "⌘" : "Ctrl";
}

const MODIFIER_ALIASES: Record<string, string> = {
  mod: "mod",
  cmd: "meta",
  command: "meta",
  meta: "meta",
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  option: "alt",
  opt: "alt",
  shift: "shift",
};

interface ParsedCombo {
  mod: boolean;
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

function parseCombo(combo: string): ParsedCombo {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim()).filter(Boolean);
  const parsed: ParsedCombo = {
    mod: false,
    meta: false,
    ctrl: false,
    alt: false,
    shift: false,
    key: "",
  };
  for (const part of parts) {
    const alias = MODIFIER_ALIASES[part];
    if (alias === "mod") parsed.mod = true;
    else if (alias === "meta") parsed.meta = true;
    else if (alias === "ctrl") parsed.ctrl = true;
    else if (alias === "alt") parsed.alt = true;
    else if (alias === "shift") parsed.shift = true;
    else parsed.key = part;
  }
  return parsed;
}

function normalizeKey(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();
  if (key === " ") return "space";
  if (key === "escape") return "esc";
  if (key === "arrowup") return "up";
  if (key === "arrowdown") return "down";
  if (key === "arrowleft") return "left";
  if (key === "arrowright") return "right";
  return key;
}

function eventMatches(event: KeyboardEvent, combo: ParsedCombo, apple: boolean): boolean {
  if (normalizeKey(event) !== combo.key) return false;

  // `mod` maps to Cmd on Apple, Ctrl elsewhere.
  const wantMeta = combo.meta || (combo.mod && apple);
  const wantCtrl = combo.ctrl || (combo.mod && !apple);

  if (event.metaKey !== wantMeta) return false;
  if (event.ctrlKey !== wantCtrl) return false;
  if (event.altKey !== combo.alt) return false;
  if (event.shiftKey !== combo.shift) return false;
  return true;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Register keyboard shortcuts. Combos are strings like `"mod+enter"`,
 * `"mod+shift+z"`, `"esc"` where `mod` is Cmd on Apple platforms and Ctrl
 * elsewhere. When a matching combo fires, the handler runs and the event's
 * default + propagation are prevented.
 *
 * The listener is stable across `map` changes (handlers are read from a ref),
 * so passing an inline object each render is fine.
 */
export function useShortcuts(map: ShortcutMap, options: UseShortcutsOptions = {}): void {
  const { allowInInputs = false, disabled = false, target } = options;
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (disabled) return;
    const node: Window | HTMLElement =
      target ?? (typeof window !== "undefined" ? window : null!);
    if (!node) return;

    const apple = isApplePlatform();

    const handler = (event: KeyboardEvent) => {
      const entries = Object.entries(mapRef.current);
      const editable = isEditableTarget(event.target);

      for (const [combo, fn] of entries) {
        const parsed = parseCombo(combo);
        if (!eventMatches(event, parsed, apple)) continue;

        // In editable fields, only fire mod/meta/ctrl combos unless opted in.
        const usesMod = parsed.mod || parsed.meta || parsed.ctrl;
        if (editable && !allowInInputs && !usesMod) continue;

        event.preventDefault();
        event.stopPropagation();
        fn(event);
        return;
      }
    };

    node.addEventListener("keydown", handler as EventListener);
    return () => node.removeEventListener("keydown", handler as EventListener);
  }, [allowInInputs, disabled, target]);
}
