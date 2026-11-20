"use client";

/** Admin health: the box's pressure numbers before the OOM killer sees them. */

import * as React from "react";

import { AdminShell, Stat } from "@/components/devadmin/shell";
import { api } from "@/lib/devapi/client";

interface Health {
  disk: { free_mb: number; total_mb: number; used_percent: number };
  memory: { available_mb: number; total_mb: number; swap_used_mb: number; swap_total_mb: number };
  load: string[];
  cpu_credits: number | null;
  cpu_credits_note: string;
  warn: { disk: boolean; memory: boolean };
}

export default function AdminHealthPage() {
  const [health, setHealth] = React.useState<Health | null>(null);

  React.useEffect(() => {
    const tick = () => void api<Health>("/admin/health").then((r) => r.ok && setHealth(r.data));
    tick();
    const timer = setInterval(tick, 15_000);
    return () => clearInterval(timer);
  }, []);

  if (!health) return <AdminShell title="Server health">{null}</AdminShell>;

  const anyWarn = health.warn.disk || health.warn.memory;
  return (
    <AdminShell title="Server health">
      {anyWarn ? (
        <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {health.warn.disk ? "Disk below the 800 MB threshold. " : ""}
          {health.warn.memory ? "Available memory below the 200 MB threshold." : ""}
        </p>
      ) : (
        <p className="mb-4 text-sm text-emerald-700">No pressure - both thresholds clear.</p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Disk free" value={`${health.disk.free_mb} MB (${100 - health.disk.used_percent}%)`} />
        <Stat label="Memory available" value={`${health.memory.available_mb} / ${health.memory.total_mb} MB`} />
        <Stat label="Swap used" value={`${health.memory.swap_used_mb} / ${health.memory.swap_total_mb} MB`} />
        <Stat label="Load (1/5/15m)" value={health.load.join(" ")} />
      </div>
      <p className="mt-4 max-w-[70ch] text-xs text-muted-foreground">
        Refreshes every 15 seconds. A cron on the box logs a journal warning at the
        same thresholds (disk &lt; 800 MB, memory &lt; 200 MB), so pressure is
        recorded even when nobody is watching. CPU credits: {health.cpu_credits_note}
      </p>
    </AdminShell>
  );
}
