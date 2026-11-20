"use client";

/**
 * QR Studio, small shared UI primitives used across the panels.
 *
 * Kept here (not in the dev harness) because they are QR-specific: a color
 * swatch + hex input, a collapsible titled section, a labelled slider, and a
 * chip-style option picker. All accessible, dark-mode aware, and controlled.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

/* ────────────────────────── collapsible section ────────────────────────── */

/** A titled, collapsible panel section (native <details> for zero-JS a11y). */
export function Section({
  title,
  icon,
  defaultOpen = true,
  right,
  children,
}: {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-lg border border-border bg-card/50">
      <summary className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring">
        {icon && <Icon name={icon} size={15} className="shrink-0 text-primary" />}
        <span className="flex-1">{title}</span>
        {right}
        <Icon
          name="ChevronDown"
          size={16}
          className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-border p-3.5">{children}</div>
    </details>
  );
}

/* ────────────────────────── color control ────────────────────────── */

/** A color swatch bound to a hex text field. */
export function ColorControl({
  id,
  value,
  onChange,
  ariaLabel,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex h-9 items-center gap-2", disabled && "opacity-50")}>
      <input
        id={id}
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        disabled={disabled}
        className="h-10 w-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5 disabled:cursor-not-allowed"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${ariaLabel ?? "Color"} hex value`}
        spellCheck={false}
        disabled={disabled}
        className="h-10 w-24 rounded-md border border-border bg-background px-2 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
      />
    </div>
  );
}

/* ────────────────────────── slider ────────────────────────── */

/** A labelled range slider that shows its current value. */
export function Slider({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  disabled,
}: {
  id?: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  const auto = React.useId();
  const inputId = id ?? auto;
  return (
    <div className={cn("flex flex-col gap-1.5", disabled && "opacity-50")}>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
      />
    </div>
  );
}

/* ────────────────────────── chip picker ────────────────────────── */

/** One option in a {@link ChipPicker}. */
export interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
  /** Optional inline SVG preview (e.g. a dot-style swatch). */
  preview?: React.ReactNode;
}

/**
 * A wrapping grid of selectable chips, better than a <select> when the choices
 * benefit from a visual preview (dot styles, eye styles, frames).
 */
export function ChipPicker<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  columns = 3,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<ChipOption<T>>;
  ariaLabel?: string;
  columns?: number;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {opt.preview ?? (opt.icon && <Icon name={opt.icon} size={16} />)}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
