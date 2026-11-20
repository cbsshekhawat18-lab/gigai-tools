import type { AccentKey, ComparisonDimension } from "@/types";
import { cn } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";

export interface ComparisonTableProps {
  /** Short label for side A (column header), e.g. "PNG". */
  a: string;
  /** Short label for side B (column header), e.g. "JPG". */
  b: string;
  /** The rows: one attribute per row, evaluated for each side. */
  dimensions: ComparisonDimension[];
  /** Accent for side A's header; defaults to sky. */
  accentA?: AccentKey;
  /** Accent for side B's header; defaults to amber. */
  accentB?: AccentKey;
  className?: string;
}

/**
 * The side-by-side comparison table for a /compare page. A three-column grid
 * (attribute · side A · side B) that stays scannable on desktop and scrolls
 * horizontally on small screens without ever forcing the page body to scroll.
 * Pure server component; premium, responsive, dark-mode.
 */
export function ComparisonTable({
  a,
  b,
  dimensions,
  accentA = "sky",
  accentB = "amber",
  className,
}: ComparisonTableProps) {
  const styleA = accentStyle(accentA);
  const styleB = accentStyle(accentB);

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          {a} versus {b} compared across {dimensions.length} dimensions
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th
              scope="col"
              className="w-[28%] px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Dimension
            </th>
            <th scope="col" className="px-5 py-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-semibold",
                  styleA.text,
                )}
              >
                <span className={cn("size-2 rounded-full", styleA.solid)} aria-hidden="true" />
                {a}
              </span>
            </th>
            <th scope="col" className="px-5 py-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-semibold",
                  styleB.text,
                )}
              >
                <span className={cn("size-2 rounded-full", styleB.solid)} aria-hidden="true" />
                {b}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim, index) => (
            <tr
              key={dim.label}
              className={cn(
                "align-top",
                index % 2 === 1 && "bg-muted/40",
                index < dimensions.length - 1 && "border-b border-border/60",
              )}
            >
              <th
                scope="row"
                className="px-5 py-4 font-medium text-foreground"
              >
                {dim.label}
              </th>
              <td className="px-5 py-4 text-muted-foreground">{dim.a}</td>
              <td className="px-5 py-4 text-muted-foreground">{dim.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface ChooseColumnsProps {
  a: string;
  b: string;
  whenA: string[];
  whenB: string[];
  accentA?: AccentKey;
  accentB?: AccentKey;
  className?: string;
}

/**
 * The paired "Choose A when / Choose B when" decision columns that sit under the
 * comparison table. Two accent-tinted cards, stacking on mobile.
 */
export function ChooseColumns({
  a,
  b,
  whenA,
  whenB,
  accentA = "sky",
  accentB = "amber",
  className,
}: ChooseColumnsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5", className)}>
      <ChooseCard label={a} items={whenA} accent={accentA} />
      <ChooseCard label={b} items={whenB} accent={accentB} />
    </div>
  );
}

function ChooseCard({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent: AccentKey;
}) {
  const a = accentStyle(accent);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          a.gradient,
        )}
      />
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        Choose <span className={a.text}>{label}</span> when
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Icon
              name="Check"
              size={16}
              className={cn("mt-0.5 shrink-0", a.text)}
            />
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
