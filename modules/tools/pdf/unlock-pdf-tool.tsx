"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { unlockPdf } from "@/lib/pdf/security";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Unlock PDF, a single-file tool that removes the open password from an
 * encrypted PDF the user already knows the password to.
 *
 * It queues one PDF through `usePdfTool` (accept application/pdf, single) and
 * pairs it with a password field. On process it calls the engine's `unlockPdf`,
 * which validates the password (surfacing "Incorrect password" as a clear,
 * typed error the workspace shows) and then rebuilds a fresh, unencrypted copy.
 * The password lives in component state and is read through a ref inside
 * `process` so the current value is always used without re-binding the callback.
 */
export default function UnlockPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [password, setPassword] = React.useState("");
  const [reveal, setReveal] = React.useState(false);

  // Read the freshest password inside the async processor without re-binding it.
  const passwordRef = React.useRef(password);
  React.useEffect(() => {
    passwordRef.current = password;
  }, [password]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) {
        throw new Error("Add the password-protected PDF you want to unlock.");
      }
      if (!passwordRef.current.trim()) {
        throw new Error(
          "Enter the password for this PDF. Unlocking needs the password you already use to open it.",
        );
      }
      // `unlockPdf` throws a clear "Incorrect password." on a wrong password,
      // which the workspace surfaces verbatim in its error state.
      const unlocked = await unlockPdf(source, passwordRef.current);
      return [{ name: unlocked.name, blob: unlocked.blob, size: unlocked.size }];
    },
  });

  const source = state.files[0];
  const result = state.results[0];
  const inputId = React.useId();
  const hasPassword = password.trim().length > 0;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="LockOpen"
      dropHint="Select one password-protected PDF you own and know the password to"
      processLabel="Unlock PDF"
      resultHint="Decrypted in your browser with the password you enter: nothing is uploaded."
    >
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        accent={tool.accent}
        label="File to unlock"
      />

      {/* ── Password control ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor={inputId}>
            <Icon name="KeyRound" size={15} className={style.text} />
            Current PDF password
          </Label>
          <div className="relative">
            <Input
              id={inputId}
              type={reveal ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter the password you use to open this PDF"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={`${inputId}-hint`}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-pressed={reveal}
              aria-label={reveal ? "Hide password" : "Show password"}
              className={cn(
                "absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors outline-none hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                style.ring,
              )}
            >
              <Icon name={reveal ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
        </div>

        <p
          id={`${inputId}-hint`}
          className="inline-flex items-start gap-2 text-xs text-muted-foreground"
        >
          <Icon
            name="ShieldCheck"
            size={14}
            className={cn("mt-0.5 shrink-0", style.text)}
          />
          The password is used only in your browser to decrypt this file. It&apos;s
          never uploaded, stored or logged; this is for PDFs you own and already
          know the password to.
        </p>

        {source && !hasPassword ? (
          <p className="inline-flex items-start gap-2 text-xs text-muted-foreground">
            <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
            Enter the password above to enable unlocking.
          </p>
        ) : null}
      </div>

      {/* ── Result readout (only meaningful after a successful unlock) ────────── */}
      {result ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon name="LockOpen" size={16} className={style.text} />
            Password removed
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Unlocked file</span>
              <span className="truncate text-sm font-semibold text-foreground">
                {result.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Size</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatBytes(result.size)}
              </span>
            </div>
          </div>
          <p className="inline-flex items-start gap-2 text-xs text-muted-foreground">
            <Icon
              name="FileCheck2"
              size={14}
              className={cn("mt-0.5 shrink-0", style.text)}
            />
            The downloaded copy opens with no password prompt and keeps its
            selectable text and layout.
          </p>
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
