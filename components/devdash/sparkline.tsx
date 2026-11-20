import * as React from "react";

export interface Bar {
  key: string;
  value: number;
  title: string;
  alert?: boolean;
}

/**
 * Small single-series bar chart: baseline-anchored bars, one colour, a native
 * tooltip per bar. One series means the heading names it - no legend.
 */
export function Bars({ bars, label, empty = "No activity yet.", width = 320, height = 64 }: {
  bars: Bar[]; label: string; empty?: string; width?: number; height?: number;
}) {
  if (!bars.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const gap = 2;
  const bar = Math.max(2, Math.floor(width / bars.length) - gap);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mt-1 max-w-full" role="img" aria-label={label}>
      {bars.map((b, i) => {
        const h = Math.max(2, Math.round((b.value / max) * (height - 8)));
        return (
          <rect key={b.key} x={i * (bar + gap)} y={height - h} width={bar} height={h} rx={Math.min(2, bar / 2)} className={b.alert ? "fill-red-400" : "fill-primary"}>
            <title>{b.title}</title>
          </rect>
        );
      })}
    </svg>
  );
}
