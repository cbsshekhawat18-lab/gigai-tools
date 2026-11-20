import type { AccentKey, HowToGuideStep } from "@/types";
import { cn } from "@/lib/utils";
import { accentStyle } from "@/lib/design";

export interface HowToStepsProps {
  steps: HowToGuideStep[];
  /** Accent for the numbered markers + connector line; defaults to sky. */
  accent?: AccentKey;
  className?: string;
}

/**
 * The numbered, vertically-connected step list for a /how-to guide. Each step is
 * an accent-numbered marker plus a heading and body, joined by a vertical
 * connector so the sequence reads as a clear, ordered walkthrough. Pure server
 * component; premium, responsive, dark-mode, and accessible as an ordered list.
 */
export function HowToSteps({ steps, accent = "sky", className }: HowToStepsProps) {
  const a = accentStyle(accent);

  return (
    <ol className={cn("relative space-y-8", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.title} className="relative flex gap-5">
            {/* Marker + connector */}
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  "z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm",
                  a.solid,
                )}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute top-10 h-[calc(100%+2rem)] w-px bg-border"
                />
              ) : null}
            </div>

            <div className="flex-1 pb-1">
              <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                <span className="sr-only">{`Step ${index + 1}: `}</span>
                {step.title}
              </h3>
              <p className="mt-1.5 text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
