"use client";

/** API keys: create (secret shown once), list, revoke. */

import * as React from "react";

import { DashShell, DashTable, Td, Th } from "@/components/devdash/shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/devapi/client";

interface KeyRow {
  id: string;
  name: string;
  masked: string;
  scopes: string[];
  sandbox: boolean;
  last_used_at: string | null;
  revoked: boolean;
  created_at: string;
}

export default function KeysPage() {
  const [keys, setKeys] = React.useState<KeyRow[]>([]);
  const [name, setName] = React.useState("");
  const [sandbox, setSandbox] = React.useState(false);
  const [freshSecret, setFreshSecret] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const r = await api<{ data: KeyRow[] }>("/keys");
    if (r.ok) setKeys(r.data.data);
  }, []);
  React.useEffect(() => void load(), [load]);

  const createKey = async () => {
    setErr(null);
    const r = await api<{ secret: string }>("/keys", {
      method: "POST",
      body: JSON.stringify({ name: name || "Default", sandbox }),
    });
    if (r.ok) {
      setFreshSecret(r.data.secret);
      setName("");
      void load();
    } else setErr(r.error.message);
  };

  const revoke = async (k: KeyRow) => {
    if (!window.confirm(`Revoke '${k.name}' (${k.masked})? Code using it stops working now.`)) return;
    await api(`/keys/${k.id}`, { method: "DELETE" });
    void load();
  };

  return (
    <DashShell title="API keys">
      {freshSecret ? (
        <div className="mb-6 rounded border border-primary/40 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground">
            Copy this key now. It is never shown again.
          </p>
          <code className="mt-2 block select-all break-all rounded bg-background p-3 font-mono text-sm">
            {freshSecret}
          </code>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setFreshSecret(null)}>
            I saved it
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-foreground">
          Key name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Production"
            className="mt-1 block h-10 w-56 rounded border border-border bg-background px-3 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={sandbox} onChange={(e) => setSandbox(e.target.checked)} />
          Sandbox (gk_test_, nothing counts against quota)
        </label>
        <Button onClick={() => void createKey()}>Create key</Button>
      </div>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}

      <div className="mt-6">
        <DashTable
          head={<><Th>Name</Th><Th>Key</Th><Th>Scopes</Th><Th>Last used</Th><Th>Status</Th><Th /></>}
        >
          {keys.length === 0 ? (
            <tr>
              <Td className="text-muted-foreground">No keys yet. Create one above.</Td>
              <Td /><Td /><Td /><Td /><Td />
            </tr>
          ) : (
            keys.map((k) => (
              <tr key={k.id}>
                <Td>{k.name}{k.sandbox ? <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">sandbox</span> : null}</Td>
                <Td className="font-mono text-xs">{k.masked}</Td>
                <Td>
                  <span className="flex flex-wrap gap-1">
                    {k.scopes.map((s) => (
                      <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                    ))}
                  </span>
                </Td>
                <Td className="text-muted-foreground">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}
                </Td>
                <Td>{k.revoked ? "revoked" : "active"}</Td>
                <Td className="text-right">
                  {!k.revoked ? (
                    <Button variant="outline" size="sm" onClick={() => void revoke(k)}>
                      Revoke
                    </Button>
                  ) : null}
                </Td>
              </tr>
            ))
          )}
        </DashTable>
      </div>
    </DashShell>
  );
}
