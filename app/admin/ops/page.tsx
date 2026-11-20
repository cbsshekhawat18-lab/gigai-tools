"use client";

/** Admin ops: tool analytics, plan limits editor, docs feedback, audit log. */

import * as React from "react";

import { AdminShell } from "@/components/devadmin/shell";
import { DashTable, Td, Th } from "@/components/devdash/shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/devapi/client";

interface ToolRow {
  operation: string; tasks_30d: number; tasks_prev_30d: number; users_30d: number;
  errors_30d: number; avg_ms: number;
}
interface FeedbackData {
  by_page: { page: string; yes: number; no: number }[];
  recent: { page: string; helpful: boolean; comment: string | null; at: string }[];
}
interface AuditRow {
  account_id: string | null; actor: string; action: string; subject: string | null; at: string;
}

export default function AdminOpsPage() {
  const [tools, setTools] = React.useState<ToolRow[]>([]);
  const [feedback, setFeedback] = React.useState<FeedbackData | null>(null);
  const [audit, setAudit] = React.useState<AuditRow[]>([]);
  const [planDraft, setPlanDraft] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    void api<{ tools: ToolRow[] }>("/admin/tools").then((r) => r.ok && setTools(r.data.tools));
    void api<FeedbackData>("/admin/feedback").then((r) => r.ok && setFeedback(r.data));
    void api<{ audit: AuditRow[] }>("/admin/audit?limit=50").then((r) => r.ok && setAudit(r.data.audit));
    void api<{ limits: Record<string, number> }>("/account").then((r) => {
      if (r.ok) setPlanDraft(JSON.stringify(r.data.limits));
    });
  }, []);

  const savePlan = async () => {
    try {
      const fields = JSON.parse(planDraft);
      const r = await api("/admin/plans/free", { method: "PATCH", body: JSON.stringify(fields) });
      setMsg(r.ok ? "Free plan updated - applies to everyone without overrides." : (r as { error: { message: string } }).error.message);
    } catch {
      setMsg("Plan limits must be valid JSON.");
    }
  };

  return (
    <AdminShell title="Tools & operations">
      <h2 className="text-base font-semibold text-foreground">Tool analytics, 30 days</h2>
      <div className="mt-3">
        <DashTable
          head={<><Th>Tool</Th><Th>Tasks</Th><Th>vs prev 30d</Th><Th>Users</Th><Th>Errors</Th><Th>Avg</Th></>}
        >
          {tools.map((t) => {
            const trend = t.tasks_prev_30d
              ? Math.round(((t.tasks_30d - t.tasks_prev_30d) / t.tasks_prev_30d) * 100)
              : null;
            return (
              <tr key={t.operation}>
                <Td className="font-mono text-xs">{t.operation}</Td>
                <Td>{t.tasks_30d}</Td>
                <Td className={trend === null ? "text-muted-foreground" : trend >= 0 ? "text-emerald-700" : "text-red-600"}>
                  {trend === null ? "new" : `${trend >= 0 ? "+" : ""}${trend}%`}
                </Td>
                <Td>{t.users_30d}</Td>
                <Td className={t.errors_30d ? "text-red-600" : ""}>{t.errors_30d}</Td>
                <Td>{t.avg_ms} ms</Td>
              </tr>
            );
          })}
        </DashTable>
      </div>

      <h2 className="mt-10 text-base font-semibold text-foreground">Free plan limits</h2>
      <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
        Stored in the database, never hard-coded. Changes apply to every account
        without a per-user override.
      </p>
      <textarea
        value={planDraft}
        onChange={(e) => setPlanDraft(e.target.value)}
        rows={3}
        className="mt-2 w-full max-w-xl rounded border border-border bg-background p-2 font-mono text-xs"
      />
      <div className="mt-2">
        <Button variant="outline" size="sm" onClick={() => void savePlan()}>Save plan</Button>
        {msg ? <span className="ml-3 text-sm text-muted-foreground">{msg}</span> : null}
      </div>

      <h2 className="mt-10 text-base font-semibold text-foreground">Docs feedback</h2>
      {feedback && feedback.by_page.length ? (
        <div className="mt-3 grid gap-6 lg:grid-cols-2">
          <DashTable head={<><Th>Page</Th><Th>Yes</Th><Th>No</Th></>}>
            {feedback.by_page.map((p) => (
              <tr key={p.page}>
                <Td className="font-mono text-xs">{p.page}</Td>
                <Td>{p.yes}</Td>
                <Td className={p.no ? "text-red-600" : ""}>{p.no}</Td>
              </tr>
            ))}
          </DashTable>
          <div className="space-y-2">
            {feedback.recent
              .filter((f) => f.comment)
              .slice(0, 10)
              .map((f, i) => (
                <div key={i} className="rounded border border-border bg-card p-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {f.page} · {f.helpful ? "helpful" : "not helpful"} · {new Date(f.at).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-foreground">{f.comment}</p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No feedback yet.</p>
      )}

      <h2 className="mt-10 text-base font-semibold text-foreground">Audit log</h2>
      <div className="mt-3">
        <DashTable head={<><Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Subject</Th></>}>
          {audit.map((a, i) => (
            <tr key={i}>
              <Td className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</Td>
              <Td className="text-xs">{a.actor}</Td>
              <Td className="font-mono text-xs">{a.action}</Td>
              <Td className="font-mono text-xs text-muted-foreground">{a.subject ?? "-"}</Td>
            </tr>
          ))}
        </DashTable>
      </div>
    </AdminShell>
  );
}
