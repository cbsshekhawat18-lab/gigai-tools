"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import {
  scanSecrets,
  redactSecrets,
  summarize,
  type Severity,
} from "@/lib/dev/secrets";
import {
  CodePane,
  CopyButton,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSpacer,
} from "@/components/tool/dev";

/**
 * Demo input: every value here is fabricated / non-functional. The key
 * prefixes are joined at runtime so the source holds no key-shaped string
 * that a repository secret scanner would (rightly) refuse.
 */
const FAKE = { aws: "AKIA", stripe: "sk_" + "live_", openai: "sk-" + "proj-" };
const SAMPLE = `#.env (example: all values below are fake)
AWS_ACCESS_KEY_ID=${FAKE.aws}IOSFODNN7EXAMPLE
STRIPE_SECRET_KEY=${FAKE.stripe}abcdefghij1234567890ABCD
DATABASE_URL=postgres://admin:s3cr3tpassword@db.example.com:5432/prod
OPENAI_API_KEY=${FAKE.openai}abcdefghijklmnop1234567890QRSTUV
password = "hunter2superSecret"
const publicUrl = "https://example.com/api"; // not a secret
`;

const SEV: Record<Severity, { label: string; chip: string; dot: string; order: number }> = {
  high: { label: "High", chip: "bg-rose-500/10 text-rose-600 border-rose-500/20", dot: "bg-rose-500", order: 0 },
  medium: { label: "Medium", chip: "bg-amber-500/10 text-amber-600 border-amber-500/20", dot: "bg-amber-500", order: 1 },
  low: { label: "Low", chip: "bg-sky-500/10 text-sky-600 border-sky-500/20", dot: "bg-sky-500", order: 2 },
};

/**
 * Secret / API-key scanner. Paste code, config or logs and it flags exposed
 * credentials (AWS, Stripe, GitHub, OpenAI, database URLs, private keys…) with a
 * severity, the line, a masked preview and a fix hint. Also produces a redacted
 * copy safe to share. 100% in the browser: nothing is uploaded. Heuristic, not
 * a guarantee, so the UI says to review findings yourself.
 */
export default function SecretScannerTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [text, setText] = React.useState("");

  const findings = React.useMemo(() => scanSecrets(text), [text]);
  const counts = React.useMemo(() => summarize(findings), [findings]);
  const redacted = React.useMemo(
    () => (findings.length ? redactSecrets(text, findings) : text),
    [text, findings],
  );
  const scanned = text.trim().length > 0;

  return (
    <section aria-label="Secret and API-key scanner" className="flex flex-col gap-4">
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton icon="FlaskConical" label="Load sample" onClick={() => setText(SAMPLE)} />
          <ToolbarButton
            icon="Trash2"
            label="Clear"
            onClick={() => setText("")}
            disabled={!text}
          />
        </ToolbarGroup>
        <ToolbarSpacer />
        {scanned ? (
          <div className="flex flex-wrap items-center gap-2">
            <StatBadge
              icon={findings.length ? "ShieldAlert" : "ShieldCheck"}
              label={findings.length ? "Findings" : "Clean"}
              value={findings.length ? String(findings.length) : "0"}
              tone={findings.length ? "danger" : "success"}
            />
            {counts.high > 0 && <StatBadge icon="OctagonAlert" label="High" value={String(counts.high)} tone="danger" />}
            {counts.medium > 0 && <StatBadge icon="TriangleAlert" label="Medium" value={String(counts.medium)} tone="warning" />}
          </div>
        ) : null}
      </Toolbar>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="secret-input" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Paste code, config or logs
        </label>
        <textarea
          id="secret-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder="Paste a .env file, source code, a log snippet or a config… it's scanned instantly, in your browser. Nothing is uploaded."
          className={cn(
            "min-h-[220px] w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed outline-none",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            accent.ring,
          )}
        />
      </div>

      {/* Results */}
      {scanned && findings.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
          <Icon name="ShieldCheck" size={20} className="shrink-0" />
          <span>No known secret patterns found. Still review sensitive values yourself; this is a heuristic, not a guarantee.</span>
        </div>
      ) : null}

      {findings.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon name="ShieldAlert" size={18} className="text-rose-500" />
            Potential secrets found
          </div>
          <ul className="flex flex-col gap-2">
            {findings.map((f, i) => {
              const sev = SEV[f.severity];
              return (
                <li
                  key={`${f.ruleId}-${f.line}-${i}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-border bg-card p-3"
                >
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold", sev.chip)}>
                    <span className={cn("size-1.5 rounded-full", sev.dot)} />
                    {sev.label}
                  </span>
                  <span className="font-medium text-foreground">{f.label}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">line {f.line}</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground" title="Masked for safety">
                    {f.masked}
                  </code>
                  <span className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">{f.note}</span>
                </li>
              );
            })}
          </ul>

          {/* Redacted output */}
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Redacted copy, safe to share
              </span>
              <ToolbarSpacer />
              <CopyButton getValue={() => redacted} label="Copy redacted" />
            </div>
            <CodePane value={redacted} readOnly wrap ariaLabel="Redacted output" minHeight={120} maxHeight={280} />
          </div>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        <Icon name="Lock" size={12} className="mr-1 inline align-[-1px]" />
        Everything runs in your browser. Your code is never uploaded. This is a pattern-based heuristic:
        it can miss custom or obfuscated secrets and occasionally flag a lookalike, so always review findings yourself.
      </p>
    </section>
  );
}
