"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Small visual vocabulary of the public poster page, shared with the owner's
 * preview: white rounded cards, numbered accent badges, big gradient buttons.
 * Colours come from CSS variables --pp / --ps set by the page's theme, so a
 * blue campaign and a saffron one share one stylesheet.
 */

export function StepCard({ n, title, subtitle, aside, children, className }: {
  n: number; title: string; subtitle?: string; aside?: React.ReactNode; children?: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6", className)}>
      <div className={cn("flex flex-wrap items-start gap-4", aside && "justify-between")}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[var(--pp)] text-sm font-bold text-white shadow">{n}</span>
          <div>
            <h2 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {aside}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export function BigButton({ tone, icon, children, className, ...props }: {
  tone: "primary" | "whatsapp" | "outline"; icon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    primary: "bg-[linear-gradient(90deg,var(--pp),color-mix(in_srgb,var(--pp)_70%,#f59e0b))] text-white shadow-lg shadow-[color-mix(in_srgb,var(--pp)_35%,transparent)]",
    whatsapp: "bg-[linear-gradient(90deg,#25D366,#128C7E)] text-white shadow-lg shadow-emerald-500/30",
    outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
  } as const;
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-60",
        tones[tone], className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ label, children, className, ...props }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn("grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95", className)}
    >
      {children}
    </button>
  );
}

export function Slider({ label, value, display, min, max, step, onChange, leftIcon, rightIcon, onLeft, onRight, leftLabel, rightLabel }: {
  label: string; value: number; display: string; min: number; max: number; step: number;
  onChange: (v: number) => void; leftIcon: React.ReactNode; rightIcon: React.ReactNode;
  onLeft: () => void; onRight: () => void; leftLabel: string; rightLabel: string;
}) {
  const id = React.useId();
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-bold text-slate-800">{label}</label>
        <span className="text-sm font-bold text-[var(--pp)]">{display}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={onLeft} aria-label={leftLabel} className="text-slate-500 hover:text-slate-900">{leftIcon}</button>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-[var(--pp)]"
        />
        <button type="button" onClick={onRight} aria-label={rightLabel} className="text-slate-500 hover:text-slate-900">{rightIcon}</button>
      </div>
    </div>
  );
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5 fill-current", className)}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8m8.4-18.2A11.8 11.8 0 0 0 12 .1C5.5.1.2 5.4.2 11.9c0 2.1.5 4.1 1.6 5.9L.1 24l6.3-1.7a11.8 11.8 0 0 0 5.6 1.4c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.3" />
    </svg>
  );
}
