"use client";

/** Jobs: filterable list, expandable task detail with files, delete-now. */

import * as React from "react";

import { DashShell, DashTable, StatusPill, Td, Th } from "@/components/devdash/shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/devapi/client";

interface TaskRow {
  id: string; name: string; operation: string; status: string;
  duration_ms?: number; error?: { code: string; message: string };
  result?: { files: { id: string; filename: string; size: number; url: string }[] };
}
interface Job {
  id: string; tag: string | null; status: string; retention_s: number;
  sandbox: boolean; created_at: string; finished_at: string | null; tasks: TaskRow[];
}

export default function JobsPage() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [status, setStatus] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const qs = status ? `?status=${status}&limit=50` : "?limit=50";
    const r = await api<{ jobs: Job[] }>(`/account/jobs${qs}`);
    if (r.ok) setJobs(r.data.jobs);
  }, [status]);
  React.useEffect(() => void load(), [load]);

  const remove = async (job: Job) => {
    if (!window.confirm(`Cancel job ${job.id} and delete its files now?`)) return;
    await api(`/account/jobs/${job.id}`, { method: "DELETE" });
    void load();
  };

  return (
    <DashShell title="Jobs">
      <div className="flex items-center gap-2">
        {["", "finished", "error", "processing", "waiting"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatus(s)}
            className={
              s === status
                ? "rounded bg-muted px-3 py-1 text-sm font-semibold text-foreground"
                : "rounded px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {s || "all"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <DashTable
          head={<><Th>Job</Th><Th>Tag</Th><Th>Status</Th><Th>Tools</Th><Th>Created</Th><Th /></>}
        >
          {jobs.length === 0 ? (
            <tr><Td className="text-muted-foreground">No jobs match.</Td><Td /><Td /><Td /><Td /><Td /></tr>
          ) : (
            jobs.map((j) => (
              <React.Fragment key={j.id}>
                <tr
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setOpen(open === j.id ? null : j.id)}
                >
                  <Td className="font-mono text-xs">{j.id.slice(0, 18)}...</Td>
                  <Td>{j.tag ?? "-"}</Td>
                  <Td><StatusPill status={j.status} /></Td>
                  <Td className="font-mono text-xs">
                    {j.tasks
                      .filter((t) => !t.operation.includes("/"))
                      .map((t) => t.operation)
                      .join(", ") || "-"}
                  </Td>
                  <Td className="text-muted-foreground">{new Date(j.created_at).toLocaleString()}</Td>
                  <Td className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        void remove(j);
                      }}
                    >
                      Delete now
                    </Button>
                  </Td>
                </tr>
                {open === j.id ? (
                  <tr>
                    <td colSpan={6} className="bg-muted/20 px-4 py-3">
                      <div className="space-y-2">
                        {j.tasks.map((t) => (
                          <div key={t.id} className="flex flex-wrap items-baseline gap-3 text-sm">
                            <span className="font-mono text-xs text-foreground">{t.name}</span>
                            <span className="font-mono text-xs text-muted-foreground">{t.operation}</span>
                            <StatusPill status={t.status} />
                            {t.duration_ms !== undefined ? (
                              <span className="text-xs text-muted-foreground">{t.duration_ms} ms</span>
                            ) : null}
                            {t.error ? (
                              <span className="text-xs text-red-600">
                                {t.error.code}: {t.error.message}{" "}
                                <a
                                  href={`/developers/errors#${t.error.code}`}
                                  className="underline"
                                >
                                  docs
                                </a>
                              </span>
                            ) : null}
                            {t.result?.files.map((f) => (
                              <a
                                key={f.id}
                                href={f.url}
                                className="text-xs text-primary hover:underline"
                                rel="noopener"
                              >
                                {f.filename} ({f.size} B)
                              </a>
                            ))}
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">
                          retention {j.retention_s}s
                          {j.finished_at
                            ? ` · files expire ${new Date(new Date(j.finished_at).getTime() + j.retention_s * 1000).toLocaleString()}`
                            : ""}
                          {j.sandbox ? " · sandbox" : ""}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))
          )}
        </DashTable>
      </div>
    </DashShell>
  );
}
