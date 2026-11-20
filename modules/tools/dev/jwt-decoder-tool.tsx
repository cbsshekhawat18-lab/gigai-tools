"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { decodeJwt, verifyHs256, type JwtDecoded } from "@/lib/dev/jwt";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  ShortcutsHelp,
  useShortcuts,
  useShareState,
  useFileDrop,
  type ShortcutHint,
} from "@/components/tool/dev";

/**
 * A well-known jwt.io sample (HS256, secret "your-256-bit-secret").
 * Its `exp` is far in the future so the demo reads as valid, but the tool always
 * recomputes validity against the live clock, so it stays honest either way.
 */
const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE3MTgyMzkwMjIsIm5iZiI6MTcxODIzOTAyMiwiZXhwIjo0MTAyNDQ0ODAwfQ." +
  "3Qs0m1x5t1n8Vqk3wq2m2H2m9Zq3xY0nJ8wZq1a2b3c";

const SAMPLE_SECRET = "your-256-bit-secret";

/** Registered time claims we translate into human dates. */
const TIME_CLAIMS: { key: "iat" | "nbf" | "exp"; label: string; hint: string }[] = [
  { key: "iat", label: "Issued at", hint: "When the token was created" },
  { key: "nbf", label: "Not before", hint: "Earliest time the token is valid" },
  { key: "exp", label: "Expires", hint: "When the token stops being valid" },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample token" },
  { combo: "mod+shift+c", description: "Copy the full decoded output" },
  { combo: "mod+backspace", description: "Clear the token" },
  { combo: "mod+shift+v", description: "Toggle signature verification" },
];

type Verify =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "valid" }
  | { state: "invalid" }
  | { state: "unsupported"; alg?: string };

/** Pretty-print a claims object as stable, 2-space JSON. */
function pretty(value: Record<string, unknown>): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** Full local + UTC + relative rendering of an epoch-seconds claim. */
function describeEpoch(seconds: number): { local: string; utc: string; relative: string } {
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) {
    return { local: "Invalid date", utc: "Invalid date", relative: "" };
  }
  const local = date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "long" });
  const utc = date.toLocaleString(undefined, {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "long",
  });
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  let relative = rtf.format(diffSec, "second");
  for (const [unit, secs] of units) {
    if (Math.abs(diffSec) >= secs) {
      relative = rtf.format(Math.round(diffSec / secs), unit);
      break;
    }
  }
  return { local, utc, relative };
}

/** Read an epoch-seconds claim from a decoded payload, if numeric. */
function claim(decoded: JwtDecoded, key: "iat" | "nbf" | "exp"): number | undefined {
  const raw = decoded.payload[key];
  return typeof raw === "number" ? raw : undefined;
}

export default function JwtDecoderTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [token, setToken] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [showVerify, setShowVerify] = React.useState(false);
  const [showSecret, setShowSecret] = React.useState(false);
  const [verify, setVerify] = React.useState<Verify>({ state: "idle" });
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const share = useShareState({ onInit: (v) => setToken(v) });

  const trimmed = token.trim();
  const decoded = React.useMemo(
    () => (trimmed ? decodeJwt(trimmed) : null),
    [trimmed],
  );
  const ok = decoded?.ok === true ? (decoded as JwtDecoded) : null;
  const errorMsg = decoded && decoded.ok === false ? decoded.error.message : null;

  const loadSample = React.useCallback(() => {
    setToken(SAMPLE_TOKEN);
    setSecret(SAMPLE_SECRET);
    setShowVerify(true);
    inputRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setToken("");
    setSecret("");
    setVerify({ state: "idle" });
    inputRef.current?.focus();
  }, []);

  const fullOutput = React.useCallback(() => {
    if (!ok) return "";
    return [
      "// Header",
      pretty(ok.header),
      "",
      "// Payload",
      pretty(ok.payload),
      "",
      "// Signature",
      ok.signature || "(none)",
    ].join("\n");
  }, [ok]);

  // Live HS256 verification (debounced) whenever token/secret/panel change.
  React.useEffect(() => {
    if (!showVerify || !ok) {
      setVerify({ state: "idle" });
      return;
    }
    const alg = ok.alg;
    if (alg !== "HS256") {
      setVerify({ state: "unsupported", ...(alg !== undefined ? { alg } : {}) });
      return;
    }
    if (!secret) {
      setVerify({ state: "idle" });
      return;
    }
    let cancelled = false;
    setVerify({ state: "checking" });
    const id = window.setTimeout(() => {
      verifyHs256(trimmed, secret)
        .then((valid) => {
          if (!cancelled) setVerify({ state: valid ? "valid" : "invalid" });
        })
        .catch(() => {
          if (!cancelled) setVerify({ state: "invalid" });
        });
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [showVerify, ok, secret, trimmed]);

  const doShare = React.useCallback(() => {
    if (trimmed) void share.copyShareLink(trimmed);
  }, [trimmed, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file
      .text()
      .then((t) => setToken(t.trim()))
      .catch(() => undefined);
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+shift+c": () => {
      const out = fullOutput();
      if (out) void navigator.clipboard.writeText(out).catch(() => undefined);
    },
    "mod+shift+v": () => setShowVerify((s) => !s),
  });

  // ── Validity badge state (time-based, always live) ────────────────────────
  const expSec = ok ? claim(ok, "exp") : undefined;
  const nbfSec = ok ? claim(ok, "nbf") : undefined;
  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = expSec !== undefined && expSec <= nowSec;
  const notYetValid = nbfSec !== undefined && nbfSec > nowSec;

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton
          icon="Sparkles"
          label="Sample token"
          kbd="mod+enter"
          onClick={loadSample}
        />
        <ToolbarButton
          icon="ShieldCheck"
          label="Verify signature"
          kbd="mod+shift+v"
          variant={showVerify ? "active" : "default"}
          aria-pressed={showVerify}
          onClick={() => setShowVerify((s) => !s)}
        />
        <ToolbarDivider />
        <CopyButton
          label="Copy decoded"
          kbd="mod+shift+c"
          getValue={fullOutput}
          disabled={!ok}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share link"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={!trimmed}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={!token}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="relative">
        <CodePane
          ref={inputRef}
          id="jwt-input"
          value={token}
          onChange={setToken}
          label="Encoded token"
          placeholder="Paste a JSON Web Token here (xxxxx.yyyyy.zzzzz)…"
          onDropText={(t) => setToken(t.trim())}
          lineNumbers={false}
          wrap
          showStats
          minHeight={120}
          maxHeight={220}
          fontSize={13}
          ariaLabel="Encoded JWT input"
          errorLine={errorMsg ? 1 : null}
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop a .jwt or .txt file
            </span>
          </div>
        )}
      </div>

      {errorMsg && <ErrorBanner error={errorMsg} />}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!token && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              accent.soft,
            )}
          >
            <Icon name="KeyRound" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Paste a token to decode it instantly
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Its header, payload and signature will appear below. Decoding runs
              entirely in your browser and nothing is uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
              accent.border,
              accent.text,
            )}
          >
            <Icon name="Sparkles" size={14} /> Try a sample token
          </button>
        </div>
      )}

      {/* ── Decoded output ──────────────────────────────────────────────── */}
      {ok && (
        <>
          {/* Status strip */}
          <div className="flex flex-wrap items-center gap-2">
            {isExpired ? (
              <StatBadge tone="danger" icon="CircleX" label="Status" value="Expired" />
            ) : notYetValid ? (
              <StatBadge tone="warning" icon="Clock" label="Status" value="Not yet valid" />
            ) : expSec !== undefined ? (
              <StatBadge tone="success" icon="CircleCheck" label="Status" value="Valid" />
            ) : (
              <StatBadge tone="info" icon="Info" label="Status" value="No expiry claim" />
            )}
            {ok.alg && <StatBadge icon="Fingerprint" label="alg" value={ok.alg} />}
            {ok.typ && <StatBadge icon="FileType2" label="typ" value={ok.typ} />}
            {expSec !== undefined && (
              <StatBadge
                tone={isExpired ? "danger" : "default"}
                icon="CalendarClock"
                label={isExpired ? "Expired" : "Expires"}
                value={describeEpoch(expSec).relative}
                title={describeEpoch(expSec).local}
              />
            )}
          </div>

          {/* Three panes: header / payload / signature */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DecodedPane
              title="Header"
              subtitle="Algorithm & token type"
              icon="Braces"
              toneClass="text-rose-600 dark:text-rose-400"
              accentBg="bg-rose-500/10"
              value={pretty(ok.header)}
              copyValue={pretty(ok.header)}
            />
            <DecodedPane
              title="Payload"
              subtitle="Claims (data)"
              icon="Braces"
              toneClass="text-teal-600 dark:text-teal-400"
              accentBg="bg-teal-500/10"
              value={pretty(ok.payload)}
              copyValue={pretty(ok.payload)}
            />
          </div>

          {/* Time claims, expanded */}
          {TIME_CLAIMS.some(({ key }) => claim(ok, key) !== undefined) && (
            <div className="grid gap-3 rounded-lg border border-border bg-card/60 p-3 sm:grid-cols-3">
              {TIME_CLAIMS.map(({ key, label, hint }) => {
                const secs = claim(ok, key);
                if (secs === undefined) return null;
                const d = describeEpoch(secs);
                const bad =
                  (key === "exp" && secs <= nowSec) ||
                  (key === "nbf" && secs > nowSec);
                return (
                  <div key={key} className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {key}
                      </span>
                      <span className="text-xs text-muted-foreground">· {label}</span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-sm font-medium",
                        bad ? "text-destructive" : "text-foreground",
                      )}
                    >
                      {d.relative}
                    </p>
                    <p className="mt-0.5 break-words text-xs text-muted-foreground" title={hint}>
                      {d.local}
                    </p>
                    <p className="break-words text-[11px] text-muted-foreground/70">
                      {d.utc} · {secs}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Signature + verification */}
          <div className="overflow-hidden rounded-lg border border-border bg-card/60">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="flex size-6 items-center justify-center rounded bg-sky-500/10">
                  <Icon name="Signature" size={14} className="text-sky-600 dark:text-sky-400" />
                </span>
                Signature
              </div>
              <div className="flex items-center gap-1.5">
                <CopyButton
                  label="Copy"
                  value={ok.signature}
                  disabled={!ok.signature}
                  labelMode="responsive"
                />
                <ToolbarButton
                  icon={showVerify ? "ChevronUp" : "ChevronDown"}
                  label={showVerify ? "Hide verify" : "Verify"}
                  labelMode="responsive"
                  aria-expanded={showVerify}
                  onClick={() => setShowVerify((s) => !s)}
                />
              </div>
            </div>

            <div className="px-3 py-2.5">
              <code className="block break-all font-mono text-xs text-muted-foreground">
                {ok.signature || "(this token is unsigned. No signature to verify)"}
              </code>
            </div>

            {showVerify && (
              <div className="border-t border-border bg-muted/20 p-3">
                <VerifyPanel
                  alg={ok.alg}
                  secret={secret}
                  onSecret={setSecret}
                  showSecret={showSecret}
                  onToggleSecret={() => setShowSecret((s) => !s)}
                  verify={verify}
                />
              </div>
            )}
          </div>

          {/* Full copyable output */}
          <details className="group rounded-lg border border-border bg-card/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-foreground">
              <span className="flex items-center gap-2">
                <Icon
                  name="ChevronRight"
                  size={16}
                  className="transition-transform group-open:rotate-90"
                />
                Full decoded output
              </span>
              <CopyButton label="Copy all" getValue={fullOutput} labelMode="responsive" />
            </summary>
            <div className="border-t border-border p-2">
              <CodePane
                value={fullOutput()}
                readOnly
                lineNumbers
                wrap={false}
                showWrapToggle
                minHeight={160}
                maxHeight={360}
                ariaLabel="Full decoded token output"
              />
            </div>
          </details>
        </>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Your token and secret are decoded and verified entirely in this browser
          tab; nothing is uploaded. Decoding reveals a token&apos;s contents but
          does not prove it&apos;s authentic; treat any token you paste as a live
          credential.
        </span>
      </p>
    </div>
  );
}

/** A single labelled, color-tinted JSON output pane with a copy affordance. */
function DecodedPane({
  title,
  subtitle,
  icon,
  toneClass,
  accentBg,
  value,
  copyValue,
}: {
  title: string;
  subtitle: string;
  icon: string;
  toneClass: string;
  accentBg: string;
  value: string;
  copyValue: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("flex size-6 items-center justify-center rounded", accentBg)}>
            <Icon name={icon} size={14} className={toneClass} />
          </span>
          <div className="min-w-0">
            <p className={cn("text-sm font-semibold leading-tight", toneClass)}>{title}</p>
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <CopyButton label="Copy" value={copyValue} labelMode="icon" />
      </div>
      <CodePane
        value={value}
        readOnly
        wrap={false}
        showWrapToggle={false}
        showStats={false}
        minHeight={140}
        maxHeight={300}
        fontSize={12.5}
        ariaLabel={`${title} JSON`}
        className="rounded-none border-0 shadow-none"
      />
    </div>
  );
}

/** The opt-in, client-side HS256 secret field + live verdict. */
function VerifyPanel({
  alg,
  secret,
  onSecret,
  showSecret,
  onToggleSecret,
  verify,
}: {
  alg?: string;
  secret: string;
  onSecret: (v: string) => void;
  showSecret: boolean;
  onToggleSecret: () => void;
  verify: Verify;
}) {
  if (alg !== undefined && alg !== "HS256") {
    return (
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Icon name="Info" size={15} className="mt-0.5 shrink-0" />
        <p>
          This token uses <span className="font-medium text-foreground">{alg}</span>,
          which is signed with a key pair. Local secret-based verification here
          supports HS256 only, so the token is decoded but not cryptographically
          checked.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor="jwt-secret" className="text-xs font-medium text-muted-foreground">
        HS256 shared secret
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            id="jwt-secret"
            type={showSecret ? "text" : "password"}
            value={secret}
            onChange={(e) => onSecret(e.target.value)}
            placeholder="Paste the signing secret to verify locally…"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/20"
          />
          <button
            type="button"
            onClick={onToggleSecret}
            aria-label={showSecret ? "Hide secret" : "Show secret"} title={showSecret ? "Hide secret" : "Show secret"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name={showSecret ? "EyeOff" : "Eye"} size={15} />
          </button>
        </div>

        <div aria-live="polite" className="shrink-0">
          {verify.state === "checking" && (
            <StatBadge icon="LoaderCircle" value="Checking…" />
          )}
          {verify.state === "valid" && (
            <StatBadge tone="success" icon="CircleCheck" value="Signature verified" />
          )}
          {verify.state === "invalid" && (
            <StatBadge tone="danger" icon="CircleX" value="Signature invalid" />
          )}
          {verify.state === "idle" && secret === "" && (
            <span className="text-xs text-muted-foreground">Enter a secret to check</span>
          )}
        </div>
      </div>
      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <Icon name="ShieldCheck" size={12} className="mt-0.5 shrink-0" />
        The secret is used only in your browser with the Web Crypto API to recompute
        the HMAC. It is never sent anywhere.
      </p>
    </div>
  );
}
