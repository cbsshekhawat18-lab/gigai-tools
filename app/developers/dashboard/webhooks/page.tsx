"use client";

/** Webhooks: endpoints, secret-shown-once, delivery log, test event. */

import * as React from "react";

import { DashShell, DashTable, Td, Th } from "@/components/devdash/shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/devapi/client";

interface Hook {
  id: string; url: string; events: string[]; created_at: string;
  disabled: boolean; delivered: number; failing: number;
}
interface Delivery {
  id: number; event: string; job_id: string | null; attempt: number;
  status_code: number | null; delivered_at: string | null; next_retry_at: string | null;
}

export default function WebhooksPage() {
  const [hooks, setHooks] = React.useState<Hook[]>([]);
  const [url, setUrl] = React.useState("");
  const [secret, setSecret] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [openLog, setOpenLog] = React.useState<string | null>(null);
  const [deliveries, setDeliveries] = React.useState<Delivery[]>([]);
  const [note, setNote] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const r = await api<{ webhooks: Hook[] }>("/account/webhooks");
    if (r.ok) setHooks(r.data.webhooks);
  }, []);
  React.useEffect(() => void load(), [load]);

  const create = async () => {
    setErr(null);
    const r = await api<{ secret: string }>("/account/webhooks", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    if (r.ok) {
      setSecret(r.data.secret);
      setUrl("");
      void load();
    } else setErr(r.error.message);
  };

  const remove = async (h: Hook) => {
    if (!window.confirm(`Remove the endpoint ${h.url}?`)) return;
    await api(`/account/webhooks/${h.id}`, { method: "DELETE" });
    void load();
  };

  const showLog = async (id: string) => {
    if (openLog === id) {
      setOpenLog(null);
      return;
    }
    const r = await api<{ deliveries: Delivery[] }>(`/account/webhooks/${id}/deliveries`);
    if (r.ok) {
      setDeliveries(r.data.deliveries);
      setOpenLog(id);
    }
  };

  const sendTest = async (id: string) => {
    const r = await api<{ queued: boolean }>(`/account/webhooks/${id}/test`, { method: "POST" });
    setNote(r.ok ? "Test queued - it arrives within about 20 seconds." : "Could not queue the test.");
    setTimeout(() => setNote(null), 5000);
  };

  return (
    <DashShell title="Webhooks">
      {secret ? (
        <div className="mb-6 rounded border border-primary/40 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground">
            Signing secret - copy it now, it is never shown again.
          </p>
          <code className="mt-2 block select-all break-all rounded bg-background p-3 font-mono text-sm">
            {secret}
          </code>
          <p className="mt-2 text-xs text-muted-foreground">
            Verify deliveries with it - the docs show working code.
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setSecret(null)}>
            I saved it
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <label className="grow text-sm font-medium text-foreground">
          Endpoint URL (https)
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/hooks/gigai"
            className="mt-1 block h-10 w-full max-w-md rounded border border-border bg-background px-3 font-mono text-sm"
          />
        </label>
        <Button onClick={() => void create()}>Add endpoint</Button>
      </div>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}

      <div className="mt-6">
        <DashTable head={<><Th>URL</Th><Th>Events</Th><Th>Recent</Th><Th /></>}>
          {hooks.length === 0 ? (
            <tr><Td className="text-muted-foreground">No endpoints. Add one above.</Td><Td /><Td /><Td /></tr>
          ) : (
            hooks.map((h) => (
              <React.Fragment key={h.id}>
                <tr className={h.disabled ? "opacity-50" : ""}>
                  <Td className="max-w-[280px] truncate font-mono text-xs">{h.url}</Td>
                  <Td className="text-xs text-muted-foreground">{h.events.join(", ")}</Td>
                  <Td className="text-xs">
                    <span className="text-emerald-700">{h.delivered} ok</span>
                    {h.failing ? <span className="ml-2 text-red-600">{h.failing} failing</span> : null}
                  </Td>
                  <Td className="text-right">
                    <span className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => void sendTest(h.id)}>
                        Send test
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void showLog(h.id)}>
                        {openLog === h.id ? "Hide log" : "Log"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void remove(h)}>
                        Remove
                      </Button>
                    </span>
                  </Td>
                </tr>
                {openLog === h.id ? (
                  <tr>
                    <td colSpan={4} className="bg-muted/20 px-4 py-3">
                      {deliveries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No deliveries yet.</p>
                      ) : (
                        <ul className="space-y-1 text-xs">
                          {deliveries.map((d) => (
                            <li key={d.id} className="flex flex-wrap gap-3">
                              <span className="font-mono">{d.event}</span>
                              <span className="text-muted-foreground">{d.job_id}</span>
                              <span className={d.delivered_at ? "text-emerald-700" : "text-red-600"}>
                                {d.delivered_at
                                  ? `delivered (HTTP ${d.status_code})`
                                  : d.attempt
                                    ? `attempt ${d.attempt} failed${d.status_code ? ` (HTTP ${d.status_code})` : ""}${d.next_retry_at ? `, retries ${new Date(d.next_retry_at).toLocaleTimeString()}` : ""}`
                                    : "queued"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
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
