"use client";

/** Dashboard overview: plan usage, daily activity, tools used, recent jobs. */

import Link from "next/link";
import * as React from "react";

import { DashShell, DashTable, StatusPill, Td, Th } from "@/components/devdash/shell";
import { Bars } from "@/components/devdash/sparkline";
import { api } from "@/lib/devapi/client";

interface Account {
  email: string;
  plan: string;
  limits: { tasks_per_month: number; concurrent_jobs: number; webhook_endpoints: number };
  usage_this_month: { tasks_run: number; bytes_in: number; bytes_out: number };
}
interface Day { day: string; tasks: number; errors: number }
interface ToolRow { operation: string; tasks: number; ok: number; errors: number; avg_ms: number }
interface Job { id: string; tag: string | null; status: string; created_at: string }

export default function OverviewPage() {
  const [account, setAccount] = React.useState<Account | null>(null);
  const [days, setDays] = React.useState<Day[]>([]);
  const [tools, setTools] = React.useState<ToolRow[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [keysCount, setKeysCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    void api<Account>("/account").then((r) => r.ok && setAccount(r.data));
    void api<{ days: Day[] }>("/account/usage/daily?days=30").then((r) => r.ok && setDays(r.data.days));
    void api<{ tools: ToolRow[] }>("/account/usage/tools").then((r) => r.ok && setTools(r.data.tools));
    void api<{ jobs: Job[] }>("/account/jobs?limit=10").then((r) => r.ok && setJobs(r.data.jobs));
    void api<{ data: unknown[] }>("/keys").then((r) => r.ok && setKeysCount(r.data.data.length));
  }, []);

  const used = account?.usage_this_month.tasks_run ?? 0;
  const cap = account?.limits.tasks_per_month ?? 1000;

  return (
    <DashShell title="Overview">
      {keysCount === 0 ? (
        <div className="mb-6 rounded border border-border bg-card p-4 text-sm">
          <p className="font-semibold text-foreground">Get started</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>
              <Link href="/developers/dashboard/keys" className="text-primary hover:underline">
                Create an API key
              </Link>
            </li>
            <li>
              <Link href="/developers/docs" className="text-primary hover:underline">
                Run the quickstart
              </Link>{" "}
              or use the{" "}
              <Link href="/developers/builder" className="text-primary hover:underline">
                request builder
              </Link>
            </li>
            <li>
              <Link href="/developers/dashboard/webhooks" className="text-primary hover:underline">
                Add a webhook
              </Link>{" "}
              to hear about finished jobs
            </li>
          </ol>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tasks this month
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {used}
            <span className="text-sm font-normal text-muted-foreground"> of {cap}</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, (used / cap) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {account?.plan ?? "free"} plan · resets on the 1st
          </p>
        </div>
        <div className="rounded border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last 30 days
          </p>
          <Bars label="Tasks per day" bars={days.map((d) => ({ key: d.day, value: d.tasks, alert: d.errors > 0, title: `${d.day}: ${d.tasks} tasks${d.errors ? `, ${d.errors} errors` : ""}` }))} />
        </div>
      </div>

      <h2 className="mt-8 text-base font-semibold text-foreground">Tools you use</h2>
      {tools.length ? (
        <div className="mt-3">
          <DashTable
            head={<><Th>Tool</Th><Th>Tasks</Th><Th>OK</Th><Th>Errors</Th><Th>Avg time</Th></>}
          >
            {tools.map((t) => (
              <tr key={t.operation}>
                <Td className="font-mono text-xs">{t.operation}</Td>
                <Td>{t.tasks}</Td>
                <Td>{t.ok}</Td>
                <Td className={t.errors ? "text-red-600" : ""}>{t.errors}</Td>
                <Td>{t.avg_ms} ms</Td>
              </tr>
            ))}
          </DashTable>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Nothing run yet.</p>
      )}

      <h2 className="mt-8 text-base font-semibold text-foreground">Recent jobs</h2>
      {jobs.length ? (
        <div className="mt-3">
          <DashTable head={<><Th>Job</Th><Th>Tag</Th><Th>Status</Th><Th>Created</Th></>}>
            {jobs.map((j) => (
              <tr key={j.id}>
                <Td className="font-mono text-xs">
                  <Link href="/developers/dashboard/jobs" className="text-primary hover:underline">
                    {j.id.slice(0, 16)}...
                  </Link>
                </Td>
                <Td>{j.tag ?? "-"}</Td>
                <Td><StatusPill status={j.status} /></Td>
                <Td className="text-muted-foreground">{new Date(j.created_at).toLocaleString()}</Td>
              </tr>
            ))}
          </DashTable>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No jobs yet.</p>
      )}
    </DashShell>
  );
}
