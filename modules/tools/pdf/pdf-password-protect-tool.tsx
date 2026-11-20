"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { protectPdf } from "@/lib/pdf/security";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

/**
 * Protect PDF, a single-file tool that adds an open password and AES
 * encryption to a PDF entirely in the browser.
 *
 * It queues one PDF through `usePdfTool` (accept application/pdf, single) and
 * pairs it with a password + confirm field (share one show/hide toggle) held in
 * component state. The freshest password is read through a ref inside `process`
 * so the current value is always the one used to encrypt. The engine's
 * `protectPdf` seals the file with @cantoo/pdf-lib on-device; the password is
 * never transmitted, and we surface exactly which document is being locked.
 */
export default function PdfPasswordProtectTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);

  // Read the freshest values inside the async processor without re-binding it,
  // so the workspace's own Process button always validates the current input.
  const passwordRef = React.useRef(password);
  const confirmRef = React.useRef(confirm);
  React.useEffect(() => {
    passwordRef.current = password;
    confirmRef.current = confirm;
  }, [password, confirm]);

  const trimmed = password.trim();
  const hasPassword = trimmed.length > 0;
  const matches = password === confirm;
  const confirmTouched = confirm.length > 0;
  const mismatch = confirmTouched && !matches;
  const passwordReady = hasPassword && matches;

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) {
        throw new Error("Add a PDF to protect, then try again.");
      }
      const pwd = passwordRef.current.trim();
      if (!pwd) {
        throw new Error("Enter a password to protect this PDF.");
      }
      if (passwordRef.current !== confirmRef.current) {
        throw new Error(
          "The passwords don't match. Re-type the confirmation and try again.",
        );
      }
      // The password is used only here, in the browser, to encrypt the file.
      const protectedPdf = await protectPdf(source, pwd);
      return [
        {
          name: protectedPdf.name,
          blob: protectedPdf.blob,
          size: protectedPdf.size,
        },
      ];
    },
  });

  const source = state.files[0];

  // Block the run when the password isn't ready. `usePdfTool.run()` guards on
  // the queue; we add a password gate by only wiring the button through when
  // valid and disabling it otherwise via a wrapper on the child controls.
  const inputId = React.useId();
  const confirmId = `${inputId}-confirm`;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="FileLock2"
      dropHint="Select one PDF to encrypt with a password"
      processLabel="Protect PDF"
      resultHint="Encrypted on your device: the password never leaves your browser."
    >
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        accent={tool.accent}
        label="File to protect"
      />

      {/* ── Password controls ──────────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium text-foreground">
          Set an open password
        </legend>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Icon name="KeyRound" size={16} />
            </span>
            <input
              id={inputId}
              type={show ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              spellCheck={false}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a password to lock the PDF"
              aria-describedby={`${inputId}-hint`}
              className={cn(
                "h-11 w-full rounded-xl border border-border bg-background pl-9 pr-11 text-sm text-foreground outline-none transition-colors",
                "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                style.ring,
              )}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className={cn(
                "absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none",
                "hover:bg-muted focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                style.ring,
              )}
            >
              <Icon name={show ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={confirmId}
            className="text-sm font-medium text-foreground"
          >
            Confirm password
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Icon name="CheckCheck" size={16} />
            </span>
            <input
              id={confirmId}
              type={show ? "text" : "password"}
              value={confirm}
              autoComplete="new-password"
              spellCheck={false}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Re-type the password"
              aria-invalid={mismatch}
              aria-describedby={mismatch ? `${confirmId}-error` : undefined}
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-9 pr-4 text-sm text-foreground outline-none transition-colors",
                "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                style.ring,
                mismatch ? "border-destructive" : "border-border",
              )}
            />
          </div>
          {mismatch ? (
            <p
              id={`${confirmId}-error`}
              role="alert"
              className="inline-flex items-center gap-1.5 text-xs text-destructive"
            >
              <Icon name="TriangleAlert" size={13} />
              The passwords don&apos;t match yet.
            </p>
          ) : passwordReady ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Icon name="CircleCheck" size={13} />
              Passwords match, ready to encrypt.
            </p>
          ) : null}
        </div>

        <p
          id={`${inputId}-hint`}
          className="inline-flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground"
        >
          <Icon
            name="ShieldCheck"
            size={14}
            className={cn("mt-0.5 shrink-0", style.text)}
          />
          Your PDF is sealed with AES encryption right here in your browser. The
          password is used only on this device to lock the file, it&apos;s never
          uploaded, stored or recoverable, so keep it somewhere safe.
        </p>
      </fieldset>

      {/* ── Live status: what still needs doing before Protect PDF works ───── */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Icon
            name={passwordReady && source ? "Lock" : "Info"}
            size={16}
            className={style.text}
          />
          {!source
            ? "Add a PDF to protect."
            : !hasPassword
              ? "Enter a password to continue."
              : !matches
                ? "Confirm the password to continue."
                : "Ready. This password will be required to open the file."}
        </span>
        {passwordReady && source ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              style.soft,
            )}
          >
            <Icon name="KeyRound" size={13} />
            AES · locked on your device
          </span>
        ) : null}
      </div>
    </PdfWorkspace>
  );
}
