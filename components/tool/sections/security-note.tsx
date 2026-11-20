import * as React from "react";

import type { AccentKey } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Container } from "@/components/shared/container";
import type { ProcessingLevel } from "@/lib/privacy";

export interface SecurityNoteProps {
  /** Optional per-tool override; falls back to the default privacy statement. */
  note?: string;
  /**
   * Where the tool actually processes data, from `toolProcessingLevel`. Drives
   * both the default wording and the badges, so this banner can never claim
   * "no uploads" for a tool that sends anything. Defaults to fully-local.
   */
  level?: ProcessingLevel;
  /** Tool accent; falls back to the platform default when omitted. */
  accent?: AccentKey;
  className?: string;
}

const CLIENT_SIDE_NOTE =
  "Everything runs 100% in your browser. Your files are never uploaded to a server, never stored, and never seen by anyone but you.";

/**
 * One entry per processing level, so the promise on the page is generated from
 * how the tool runs rather than written by hand and left to drift.
 */
const LEVEL_COPY: Record<
  ProcessingLevel,
  { note: string; badges: { icon: string; label: string }[] }
> = {
  browser: {
    note: CLIENT_SIDE_NOTE,
    badges: [
      { icon: "MonitorSmartphone", label: "Runs in your browser" },
      { icon: "CloudOff", label: "No uploads" },
      { icon: "Lock", label: "Nothing stored" },
    ],
  },
  "browser-ai": {
    note: CLIENT_SIDE_NOTE,
    badges: [
      { icon: "MonitorSmartphone", label: "Runs in your browser" },
      { icon: "CloudOff", label: "No uploads" },
      { icon: "Lock", label: "Nothing stored" },
    ],
  },
  storage: {
    note: "Everything runs in your browser. Your files are never uploaded. Your work is saved locally on this device so you can come back to it, and clearing your browser data removes it.",
    badges: [
      { icon: "MonitorSmartphone", label: "Runs in your browser" },
      { icon: "CloudOff", label: "No uploads" },
      { icon: "Database", label: "Saved on this device" },
    ],
  },
  "optional-upload": {
    note: "By default everything happens in your browser and the file is not uploaded. One clearly-marked optional feature works differently: choose it, and the PDF is sent to our server for that step, processed, and deleted the moment it finishes - never stored, never logged, never used for anything else. The page tells you before it happens, and skipping it keeps the tool fully local.",
    badges: [
      { icon: "MonitorSmartphone", label: "Local by default" },
      { icon: "ShieldHalf", label: "Server step is opt-in and disclosed" },
      { icon: "Trash2", label: "Deleted after processing" },
    ],
  },
  hybrid: {
    note: "Your recording is decoded, transcribed and screenshotted on your own device, and the file itself is never uploaded. The one step that can leave is the analysis: without a local model, the transcript and the chosen screenshots are sent to be read, then discarded. Never stored, never logged, never used for training. Run a local model and even that stays on your machine.",
    badges: [
      { icon: "MonitorSmartphone", label: "Your file stays local" },
      { icon: "ShieldHalf", label: "Only text + screenshots sent" },
      { icon: "Trash2", label: "Discarded after analysis" },
    ],
  },
  server: {
    note: "Your file is processed on a secure server and deleted immediately after conversion, it's never stored, never logged, and never shared.",
    badges: [
      { icon: "ServerCog", label: "Ephemeral processing" },
      { icon: "Trash2", label: "Deleted instantly" },
      { icon: "EyeOff", label: "Never logged" },
    ],
  },
};

/**
 * Privacy & security reassurance banner. Always rendered on tool pages. Uses the
 * per-tool `security` override when provided, otherwise a sensible default based
 * on whether the tool runs client-side or on an ephemeral server. Server
 * component: pure render.
 */
export function SecurityNote({
  note,
  level = "browser",
  accent,
  className,
}: SecurityNoteProps) {
  const style = accentStyle(accent);
  const copy = LEVEL_COPY[level] ?? LEVEL_COPY.browser;
  const message = note ?? copy.note;
  const badges = copy.badges;

  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <Container>
        <div
          className={cn(
            "flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-8",
            style.border,
          )}
        >
          <span
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl border",
              style.soft,
              style.border,
            )}
          >
            <Icon name="ShieldCheck" size={28} />
          </span>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Your privacy is built in
              </h2>
              <p className="max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <li
                  key={badge.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
                    style.soft,
                    style.border,
                  )}
                >
                  <Icon name={badge.icon} size={13} />
                  {badge.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
