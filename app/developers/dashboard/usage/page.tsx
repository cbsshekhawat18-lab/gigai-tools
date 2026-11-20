"use client";

/** Usage: daily chart, per-tool table, CSV export. Exact numbers, no "1.2k". */

import * as React from "react";

import { DashShell, DashTable, Td, Th } from "@/components/devdash/shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/devapi/client";

interface Day { day: string; tasks: number; errors: number }
interface ToolRow {
  operation: string; tasks: number; ok: number; errors: number; avg_ms: number;
  last_used: string | null;
}

export default function UsagePage() {
  const [days, setDays] = React.useState<Day[]>([]);
  const [range, setRange] = React.useState(30);
  const [tools, setTools] = React.useState<ToolRow[]>([]);

  React.useEffect(() => {
    void api<{ days: Day[] }>(`/account/usage/daily?days=${range}`).then((r) => r.ok && setDays(r.data.days));
  }, [range]);
  React.useEffect(() => {
    void api<{ tools: ToolRow[] }>("/account/usage/tools").then((r) => r.ok && setTools(r.data.tools));
  }, []);

  const exportCsv = () => {
    const lines = ["tool,tasks,success,errors,avg_ms,last_used"];
    for (const t of tools) {
      lines.push(`${t.operation},${t.tasks},${t.ok},${t.errors},${t.avg_ms},${t.last_used ?? ""}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gigai-usage.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const max = Math.max(...days.map((d) => d.tasks), 1);

  return (
    <DashShell title="Usage">
      <div className="flex items-center gap-2">
        {[7, 30, 90].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRange(n)}
            className={
              n === range
                ? "rounded bg-muted px-3 py-1 text-sm font-semibold text-foreground"
                : "rounded px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {n} days
          </button>
        ))}
        <span className="ml-auto">
          <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
        </span>
      </div>

      <div className="mt-4 rounded border border-border bg-card p-4">
        {days.length ? (
          <div className="flex h-32 items-end gap-[2px]">
            {days.map((d) => (
              <div
                key={d.day}
                title={`${d.day}: ${d.tasks} tasks, ${d.errors} errors`}
                className={`min-w-[3px] flex-1 rounded-t ${d.errors ? "bg-red-400" : "bg-primary"}`}
                style={{ height: `${Math.max(3, (d.tasks / max) * 100)}%` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tasks in this range.</p>
        )}
      </div>

      <h2 className="mt-8 text-base font-semibold text-foreground">By tool (all time)</h2>
      <div className="mt-3">
        <DashTable
          head={<><Th>Tool</Th><Th>Tasks</Th><Th>Success</Th><Th>Errors</Th><Th>Avg duration</Th><Th>Last used</Th></>}
        >
          {tools.length === 0 ? (
            <tr><Td className="text-muted-foreground">Nothing run yet.</Td><Td /><Td /><Td /><Td /><Td /></tr>
          ) : (
            tools.map((t) => (
              <tr key={t.operation}>
                <Td className="font-mono text-xs">{t.operation}</Td>
                <Td>{t.tasks}</Td>
                <Td>{t.ok}</Td>
                <Td className={t.errors ? "text-red-600" : ""}>{t.errors}</Td>
                <Td>{t.avg_ms} ms</Td>
                <Td className="text-muted-foreground">
                  {t.last_used ? new Date(t.last_used).toLocaleDateString() : "-"}
                </Td>
              </tr>
            ))
          )}
        </DashTable>
      </div>
    </DashShell>
  );
}
