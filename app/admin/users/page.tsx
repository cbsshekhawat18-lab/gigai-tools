"use client";

/**
 * Admin users: search table + full drill-down. The detail view answers
 * "which tools does this user call and how much" in one table, and edits
 * limits or suspension in place. Every action is audit-logged server-side.
 */

import * as React from "react";

import { AdminShell } from "@/components/devadmin/shell";
import { DashTable, StatusPill, Td, Th } from "@/components/devdash/shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/devapi/client";

interface UserRow {
  id: string; email: string; plan: string; suspended: boolean; created_at: string;
  keys: number; tasks_30d: number; last_job_at: string | null; has_overrides: boolean;
}

interface Detail {
  id: string; email: string; plan: string; suspended: string | null;
  created_at: string; retention_default_s: number;
  limits: { defaults: Record<string, number>; overrides: Record<string, number>; effective: Record<string, number> };
  tools_used: { operation: string; tasks_30d: number; tasks_all: number; ok: number; errors: number; avg_ms: number; first_used: string; last_used: string }[];
  keys: { id: string; name: string; masked: string; sandbox: boolean; last_used_at: string | null; revoked: boolean }[];
  jobs: { id: string; tag: string | null; status: string; created_at: string }[];
  webhooks: { id: string; url: string; disabled: boolean }[];
  usage_daily: { day: string; tasks: number }[];
  audit: { actor: string; action: string; subject: string | null; at: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [q, setQ] = React.useState("");
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [overridesDraft, setOverridesDraft] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const r = await api<{ total: number; users: UserRow[] }>(
      `/admin/users?limit=100${q ? `&q=${encodeURIComponent(q)}` : ""}`,
    );
    if (r.ok) {
      setUsers(r.data.users);
      setTotal(r.data.total);
    }
  }, [q]);
  React.useEffect(() => void load(), [load]);

  const openDetail = async (id: string) => {
    const r = await api<Detail>(`/admin/users/${id}`);
    if (r.ok) {
      setDetail(r.data);
      setOverridesDraft(JSON.stringify(r.data.limits.overrides));
      setMsg(null);
    }
  };

  const saveOverrides = async () => {
    if (!detail) return;
    try {
      const overrides = JSON.parse(overridesDraft || "{}");
      const r = await api(`/admin/users/${detail.id}/limits`, {
        method: "PATCH",
        body: JSON.stringify({ overrides }),
      });
      setMsg(r.ok ? "Limits saved - effective immediately." : (r as { error: { message: string } }).error.message);
      if (r.ok) void openDetail(detail.id);
    } catch {
      setMsg("Overrides must be valid JSON, e.g. {\"tasks_per_month\": 5000}.");
    }
  };

  const toggleSuspend = async () => {
    if (!detail) return;
    const action = detail.suspended ? "unsuspend" : "suspend";
    if (!window.confirm(`${action} ${detail.email}?`)) return;
    await api(`/admin/users/${detail.id}/${action}`, { method: "POST" });
    void openDetail(detail.id);
    void load();
  };

  if (detail) {
    return (
      <AdminShell title={detail.email}>
        <button
          type="button"
          onClick={() => setDetail(null)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; All users
        </button>
        <p className="mt-2 text-sm text-muted-foreground">
          {detail.plan} plan · joined {new Date(detail.created_at).toLocaleDateString()} ·
          retention default {detail.retention_default_s}s
          {detail.suspended ? (
            <span className="ml-2 rounded bg-red-600/10 px-2 py-0.5 text-xs font-semibold text-red-700">
              suspended
            </span>
          ) : null}
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void toggleSuspend()}>
            {detail.suspended ? "Unsuspend" : "Suspend"}
          </Button>
        </div>
        {msg ? <p className="mt-3 text-sm text-muted-foreground">{msg}</p> : null}

        <h2 className="mt-8 text-base font-semibold text-foreground">Tools used</h2>
        <div className="mt-3">
          <DashTable
            head={<><Th>Tool</Th><Th>30d</Th><Th>All time</Th><Th>OK</Th><Th>Errors</Th><Th>Avg</Th><Th>First</Th><Th>Last</Th></>}
          >
            {detail.tools_used.length === 0 ? (
              <tr><Td className="text-muted-foreground">Never ran a tool.</Td><Td /><Td /><Td /><Td /><Td /><Td /><Td /></tr>
            ) : (
              detail.tools_used.map((t) => (
                <tr key={t.operation}>
                  <Td className="font-mono text-xs">{t.operation}</Td>
                  <Td>{t.tasks_30d}</Td>
                  <Td>{t.tasks_all}</Td>
                  <Td>{t.ok}</Td>
                  <Td className={t.errors ? "text-red-600" : ""}>{t.errors}</Td>
                  <Td>{t.avg_ms} ms</Td>
                  <Td className="text-xs text-muted-foreground">{new Date(t.first_used).toLocaleDateString()}</Td>
                  <Td className="text-xs text-muted-foreground">{new Date(t.last_used).toLocaleDateString()}</Td>
                </tr>
              ))
            )}
          </DashTable>
        </div>

        <h2 className="mt-8 text-base font-semibold text-foreground">Limits</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="rounded border border-border bg-card p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Effective</p>
            <ul className="mt-2 space-y-1">
              {Object.entries(detail.limits.effective).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="font-mono text-xs">{k}</span>
                  <span className={detail.limits.overrides[k] !== undefined ? "font-semibold text-primary" : ""}>
                    {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Overrides (JSON, wins over plan)
            </p>
            <textarea
              value={overridesDraft}
              onChange={(e) => setOverridesDraft(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded border border-border bg-background p-2 font-mono text-xs"
            />
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void saveOverrides()}>
              Save limits
            </Button>
          </div>
        </div>

        <h2 className="mt-8 text-base font-semibold text-foreground">Keys</h2>
        <div className="mt-3">
          <DashTable head={<><Th>Name</Th><Th>Key</Th><Th>Last used</Th><Th>Status</Th></>}>
            {detail.keys.map((k) => (
              <tr key={k.id}>
                <Td>{k.name}{k.sandbox ? " (sandbox)" : ""}</Td>
                <Td className="font-mono text-xs">{k.masked}</Td>
                <Td className="text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}</Td>
                <Td>{k.revoked ? "revoked" : "active"}</Td>
              </tr>
            ))}
          </DashTable>
        </div>

        <h2 className="mt-8 text-base font-semibold text-foreground">Recent jobs</h2>
        <div className="mt-3">
          <DashTable head={<><Th>Job</Th><Th>Tag</Th><Th>Status</Th><Th>Created</Th></>}>
            {detail.jobs.map((j) => (
              <tr key={j.id}>
                <Td className="font-mono text-xs">{j.id.slice(0, 18)}...</Td>
                <Td>{j.tag ?? "-"}</Td>
                <Td><StatusPill status={j.status} /></Td>
                <Td className="text-muted-foreground">{new Date(j.created_at).toLocaleString()}</Td>
              </tr>
            ))}
          </DashTable>
        </div>

        <h2 className="mt-8 text-base font-semibold text-foreground">Staff activity on this account</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {detail.audit
            .filter((a) => a.actor.startsWith("admin:"))
            .slice(0, 10)
            .map((a, i) => (
              <li key={i}>
                {new Date(a.at).toLocaleString()} · {a.actor} · {a.action}
              </li>
            ))}
          {detail.audit.filter((a) => a.actor.startsWith("admin:")).length === 0 ? (
            <li>None.</li>
          ) : null}
        </ul>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Users (${total})`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search email or account id"
        className="h-10 w-full max-w-sm rounded border border-border bg-background px-3 text-sm"
      />
      <div className="mt-4">
        <DashTable
          head={<><Th>Email</Th><Th>Plan</Th><Th>Keys</Th><Th>Tasks 30d</Th><Th>Last job</Th><Th>Joined</Th></>}
        >
          {users.map((u) => (
            <tr
              key={u.id}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => void openDetail(u.id)}
            >
              <Td>
                {u.email}
                {u.suspended ? <span className="ml-2 text-xs text-red-600">suspended</span> : null}
                {u.has_overrides ? <span className="ml-2 text-xs text-primary">custom limits</span> : null}
              </Td>
              <Td>{u.plan}</Td>
              <Td>{u.keys}</Td>
              <Td>{u.tasks_30d}</Td>
              <Td className="text-muted-foreground">
                {u.last_job_at ? new Date(u.last_job_at).toLocaleDateString() : "-"}
              </Td>
              <Td className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</Td>
            </tr>
          ))}
        </DashTable>
      </div>
    </AdminShell>
  );
}
