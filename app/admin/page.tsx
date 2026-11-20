"use client";

/** Admin overview: platform health at a glance. */

import * as React from "react";

import { AdminShell, Stat } from "@/components/devadmin/shell";
import { api } from "@/lib/devapi/client";

interface Stats {
  users_total: number;
  users_new_7d: number;
  users_active_30d: number;
  tasks_1d: number;
  tasks_30d: number;
  error_rate_7d: string;
  queue_depth: number;
  files_in_retention: number;
  bytes_in_retention: number;
  unverified_deletions: number;
  failing_webhooks: number;
}

export default function AdminOverview() {
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    void api<Stats>("/admin/stats").then((r) => r.ok && setStats(r.data));
  }, []);

  if (!stats) return <AdminShell title="Overview">{null}</AdminShell>;

  const alerts: string[] = [];
  if (stats.unverified_deletions > 0)
    alerts.push(`${stats.unverified_deletions} file deletions could not be verified.`);
  if (stats.failing_webhooks > 0)
    alerts.push(`${stats.failing_webhooks} webhook deliveries have failed 3+ attempts.`);
  if (Number(stats.error_rate_7d) > 10)
    alerts.push(`Task error rate is ${stats.error_rate_7d}% over 7 days.`);
  if (stats.queue_depth > 50) alerts.push(`Queue depth is ${stats.queue_depth}.`);

  return (
    <AdminShell title="Overview">
      {alerts.length ? (
        <div className="mb-6 rounded border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">Needs attention</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
            {alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-6 text-sm text-emerald-700">All quiet: deletions verified, webhooks healthy, queue clear.</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Users" value={stats.users_total} />
        <Stat label="New users, 7d" value={stats.users_new_7d} />
        <Stat label="Active users, 30d" value={stats.users_active_30d} />
        <Stat label="Tasks today" value={stats.tasks_1d} />
        <Stat label="Tasks, 30d" value={stats.tasks_30d} />
        <Stat label="Error rate, 7d" value={`${stats.error_rate_7d}%`} />
        <Stat label="Queue depth" value={stats.queue_depth} />
        <Stat
          label="Files in retention"
          value={`${stats.files_in_retention} (${Math.round(stats.bytes_in_retention / 1048576)} MB)`}
        />
      </div>
    </AdminShell>
  );
}
