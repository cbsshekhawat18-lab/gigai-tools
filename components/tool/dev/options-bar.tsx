"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

/** A labelled wrapper that keeps option controls compact and aligned. */
export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* The hint trigger lives OUTSIDE the <label> (interactive content isn't
          valid inside a label) and uses a real tooltip that opens instantly on
          hover AND on keyboard focus - the old native `title` had a ~1s delay
          and read as "nothing happens". */}
      <div className="flex items-center gap-1">
        <label htmlFor={htmlFor} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        {hint && (
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={typeof label === "string" ? `${label}: more info` : "More info"}
                  className="inline-flex cursor-help items-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="Info" size={12} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px]">{hint}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
    </div>
  );
}

/** One option in a {@link SegmentedControl}. */
export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: string;
}

/** Props for {@link SegmentedControl}. */
export interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SegmentOption<T>>;
  /** Accessible group label. */
  ariaLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A radio-style segmented toggle for a small set of mutually-exclusive options
 * (e.g. Encode/Decode, 2/4-space indent). Keyboard-navigable via arrow keys.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  const move = (dir: 1 | -1) => {
    const idx = options.findIndex((o) => o.value === value);
    const next = options[(idx + dir + options.length) % options.length];
    if (next) onChange(next.value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        }
      }}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              size === "sm" ? "px-2 py-0.5 text-sm" : "px-2.5 py-1 text-sm",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.icon && <Icon name={opt.icon} size={size === "sm" ? 12 : 14} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Props for {@link Toggle}. */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** An accessible switch with an optional inline label. */
export function Toggle({ checked, onChange, label, disabled, id, className }: ToggleProps) {
  const auto = React.useId();
  const switchId = id ?? auto;
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
          checked ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-background shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
      {label != null && (
        <label htmlFor={switchId} className="cursor-pointer select-none text-sm text-foreground">
          {label}
        </label>
      )}
    </div>
  );
}

/** Props for {@link NumberStepper}. */
export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/** A compact numeric input with −/+ steppers and clamping. */
export function NumberStepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  ariaLabel,
  id,
  className,
  disabled,
}: NumberStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const commit = (n: number) => {
    if (Number.isFinite(n)) onChange(clamp(n));
  };
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center rounded-md border border-border bg-background",
        disabled && "opacity-50",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || value <= min}
        onClick={() => commit(value - step)}
        className="grid h-full w-7 place-items-center rounded-l-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        <Icon name="Minus" size={14} />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={Number.isFinite(value) ? value : ""}
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        step={step}
        disabled={disabled}
        onChange={(e) => commit(e.target.valueAsNumber)}
        className="h-full w-12 border-x border-border bg-transparent text-center font-mono text-sm text-foreground outline-none [appearance:textfield] focus-visible:bg-accent/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled || value >= max}
        onClick={() => commit(value + step)}
        className="grid h-full w-7 place-items-center rounded-r-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        <Icon name="Plus" size={14} />
      </button>
    </div>
  );
}

/** One option in a {@link SelectField}. */
export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

/** Props for {@link SelectField}. */
export interface SelectFieldProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  ariaLabel?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/** A styled native `<select>`, reliable, keyboard-first, zero-dependency. */
export function SelectField<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  id,
  className,
  disabled,
}: SelectFieldProps<T>) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 w-full appearance-none rounded-md border border-border bg-background pl-2.5 pr-8 text-sm text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="ChevronsUpDown"
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/** A horizontal container that wraps option controls neatly. */
export function OptionsBar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-end gap-x-4 gap-y-2", className)}
      {...props}
    />
  );
}
