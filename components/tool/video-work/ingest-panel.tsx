"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropZone } from "@/components/tool/dev";
import {
  ACCEPTED_MEDIA,
  fetchUrlAsFile,
  inspectFile,
  inspectUrl,
  resolveUrl,
  type ResolvedUrl,
} from "@/lib/video-work/ingest";
import { formatClock } from "@/lib/video-work/types";

interface IngestPanelProps {
  /** True when the project already has videos: switches to the compact form. */
  compact: boolean;
  busy: boolean;
  /** Whether the server can retrieve share links. Independent of analysis. */
  fetchEnabled: boolean;
  onFiles: (files: File[]) => void;
  onError: (message: string) => void;
}

/**
 * How a recording gets in: a file, or a link.
 *
 * The two paths converge deliberately. A link is fetched server-side (a browser
 * cannot read a Loom or YouTube stream) and handed back as a real File, so from
 * the caller's point of view there is exactly one input type and one code path
 * downstream. The privacy difference between the two is stated plainly rather
 * than buried: an uploaded file never leaves the device, a linked one is
 * retrieved by our server and deleted the moment it has been passed on.
 *
 * The URL is resolved before it is fetched, so a private Loom or an expired
 * link fails in a second with a specific reason, instead of after a two-minute
 * download with a generic one.
 */
export function IngestPanel({ compact, busy, fetchEnabled, onFiles, onError }: IngestPanelProps) {
  const [mode, setMode] = React.useState<"file" | "url">("file");
  const [url, setUrl] = React.useState("");
  const [resolving, setResolving] = React.useState(false);
  const [resolved, setResolved] = React.useState<ResolvedUrl | null>(null);
  const [fetching, setFetching] = React.useState(false);
  const [received, setReceived] = React.useState(0);
  const [total, setTotal] = React.useState<number | null>(null);

  const check = inspectUrl(url);

  const handleFiles = (files: File[]) => {
    const accepted: File[] = [];
    for (const file of files) {
      const result = inspectFile(file);
      if (!result.ok) {
        onError(result.error ?? "That file can't be used.");
        continue;
      }
      if (result.warning) onError(result.warning);
      accepted.push(file);
    }
    if (accepted.length > 0) onFiles(accepted);
  };

  const doResolve = async () => {
    setResolved(null);
    if (!check.valid) {
      onError(check.error ?? "That isn't a valid link.");
      return;
    }
    setResolving(true);
    try {
      // Send the normalized href, the server's parser requires an explicit
      // scheme and would reject the bare host a user typically types.
      setResolved(await resolveUrl(check.normalized));
    } catch (err) {
      onError(err instanceof Error ? err.message : "That link couldn't be inspected.");
    } finally {
      setResolving(false);
    }
  };

  const doFetch = async () => {
    setFetching(true);
    setReceived(0);
    setTotal(null);
    try {
      const file = await fetchUrlAsFile(check.normalized, {
        onProgress: (got, size) => {
          setReceived(got);
          setTotal(size);
        },
      });
      onFiles([file]);
      setUrl("");
      setResolved(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "That recording couldn't be fetched.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={cn("grid gap-5", !compact && "lg:grid-cols-[1fr_320px]")}>
        <div className="order-2 space-y-5 lg:order-1">
      {/* ── Input card ───────────────────────────────────────────────────────
          One bordered surface instead of loose controls floating on the page.
          The mode switch sits in its header so the two ways in read as one
          decision, and the drop target below is the largest thing on screen  -
          it is the actual workspace, not a link to one. ── */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center gap-1 border-b bg-muted/30 p-1.5">
          <ModeButton active={mode === "file"} onClick={() => setMode("file")} icon="Upload">
            Upload video
          </ModeButton>
          <ModeButton active={mode === "url"} onClick={() => setMode("url")} icon="Link">
            Paste a link
          </ModeButton>
        </div>

        <div className="p-3 sm:p-4">
          {mode === "file" ? (
            <div className="space-y-3">
              <FileDropZone
                onFiles={handleFiles}
                accept={ACCEPTED_MEDIA}
                multiple
                disabled={busy}
                maxSizeMb={2048}
                icon="FileVideo"
                label="Drop a client recording"
                hint="or click to browse. Add several to build one project"
                className="min-h-[168px]"
              />
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-1 text-[11px] text-muted-foreground">Works with</span>
                {["MP4", "MOV", "WebM", "MKV", "AVI", "MP3", "WAV", "M4A"].map((f) => (
                  <span
                    key={f}
                    className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!fetchEnabled ? (
                <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                  <Icon name="TriangleAlert" className="mt-px size-4 shrink-0" />
                  <p>
                    <strong>Link fetching is unavailable on this server right now.</strong> Download
                    the recording from Loom, YouTube or Vimeo and add the file instead. That always
                    works and keeps the video on your device.
                  </p>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setResolved(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !resolving) void doResolve();
                  }}
                  placeholder="https://www.loom.com/share/…"
                  disabled={busy || fetching || !fetchEnabled}
                  aria-label="Video URL"
                />
                <Button
                  onClick={() => void doResolve()}
                  disabled={!url.trim() || resolving || fetching || busy || !fetchEnabled}
                >
                  {resolving ? (
                    <Icon name="LoaderCircle" className="size-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>

              {/* Which hosts work is genuinely useful before pasting, and it is
                  where the honest limits live: Loom works, YouTube usually
                  won't. Shown up front rather than as a post-failure excuse. */}
              {!url.trim() && fetchEnabled ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="Check" className="size-3 text-emerald-500" /> Loom
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="Check" className="size-3 text-emerald-500" /> Direct video links
                  </span>
                  <span className="inline-flex items-center gap-1 opacity-70">
                    <Icon name="Minus" className="size-3" /> YouTube &amp; Vimeo usually block
                    servers
                  </span>
                </div>
              ) : null}

              {url.trim() && fetchEnabled ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{check.provider.label}</span> -{" "}
                  {check.error ?? check.provider.note}
                </p>
              ) : null}

          {resolved ? (
            <div className="space-y-3 rounded-lg border bg-card p-3">
              <div className="flex items-start gap-3">
                <Icon name="CircleCheck" className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{resolved.title || "Untitled recording"}</p>
                  <p className="text-xs text-muted-foreground">
                    {resolved.extractor}
                    {resolved.durationMs ? ` · ${formatClock(resolved.durationMs)}` : ""}
                    {resolved.approxBytes
                      ? ` · about ${Math.round(resolved.approxBytes / (1024 * 1024))}MB`
                      : ""}
                  </p>
                </div>
              </div>

              {fetching ? (
                <div className="space-y-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-primary transition-[width]",
                        total === null && "animate-pulse",
                      )}
                      style={{ width: total ? `${Math.round((received / total) * 100)}%` : "40%" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {total
                      ? `Fetching, ${Math.round(received / (1024 * 1024))}MB of ${Math.round(total / (1024 * 1024))}MB`
                      : `Fetching, ${Math.round(received / (1024 * 1024))}MB received`}
                  </p>
                </div>
              ) : (
                <Button size="sm" onClick={() => void doFetch()} disabled={busy}>
                  <Icon name="Download" className="size-3.5" />
                  Fetch this recording
                </Button>
              )}

              <p className="text-[11px] text-muted-foreground">
                Fetched on our server, streamed straight to your browser, then deleted. Everything
                after that (transcription, screenshots, analysis prep) happens on your device.
              </p>
            </div>
          ) : null}
            </div>
          )}
        </div>
      </div>

          {/* Privacy is the reason to choose this tool, so it sits under the
              input as a plain statement rather than a badge row. */}
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Icon name="ShieldCheck" className="mt-px size-3.5 shrink-0 text-emerald-500" />
            <span>
              {mode === "file"
                ? "Your file never leaves this device, it's decoded, transcribed and screenshotted right here in the browser."
                : "We fetch the link, hand the file to your browser, then delete it. Everything after that happens on your device."}
            </span>
          </p>
        </div>

        {/* On a wide screen the steps become a column beside the input rather
            than a row above it: the drop target gets the width it deserves, and
            three short cards stay readable instead of stretching into mostly
            empty boxes. Below lg they stack back underneath. */}
        {!compact ? (
          <div className="order-1 lg:order-2">
            <Steps />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Landing ──────────────────────────────────────────────────────────────── */

/**
 * Three steps, not five chips.
 *
 * The old strip listed the pipeline's internal stages, transcript,
 * screenshots, tasks, export formats, which describes what the tool *does*
 * rather than what the user *gets*, and five abstract pills read as decoration.
 * A first-time visitor needs one answer: what goes in, what comes out, and who
 * does the work. Numbered steps carry that; pills didn't.
 *
 * Note what is NOT here: no repeated headline (ToolLayout already renders the
 * tagline directly above), no gradient, no illustration.
 */
const STEPS: ReadonlyArray<{ icon: string; title: string; detail: string }> = [
  {
    icon: "Video",
    title: "Add the recording",
    detail: "A file, or a Loom link",
  },
  {
    icon: "ScanSearch",
    title: "It reads and watches",
    detail: "Transcript + the moments the screen changed",
  },
  {
    icon: "ListChecks",
    title: "You get tickets",
    detail: "Evidence, criteria, timestamps, export anywhere",
  },
];

function Steps() {
  return (
    <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
      {STEPS.map((step, index) => (
        <li
          key={step.title}
          className="flex gap-2.5 rounded-lg border bg-card/50 p-3 sm:flex-col sm:gap-2 lg:flex-row lg:items-start lg:gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold tabular-nums text-primary">
              {index + 1}
            </span>
            <Icon
              name={step.icon}
              className="size-4 shrink-0 text-muted-foreground sm:hidden lg:block"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{step.title}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors sm:flex-none",
        active
          ? "bg-background text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
      )}
    >
      <Icon name={icon} className="size-4" />
      {children}
    </button>
  );
}
