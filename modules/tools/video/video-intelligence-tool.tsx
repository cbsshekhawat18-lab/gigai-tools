"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { notifyDoneInTitle } from "@/components/shared/working-state";
import { formatBytes } from "@/lib/pdf/core";
import type { ImageToolProps } from "@/components/tool/types";
import { useVideoIntel } from "@/hooks/use-video-intel";
import { Player, type PlayerHandle } from "@/components/tool/video-intel/player";
import { TranscriptView } from "@/components/tool/video-intel/transcript-view";
import {
  AnalyticsPanel,
  BookmarksPanel,
  ChaptersPanel,
  EntitiesPanel,
  GraphPanel,
  KeywordsPanel,
  SpeakersPanel,
} from "@/components/tool/video-intel/panels";
import {
  MAX_COMFORTABLE_MS,
  MODELS,
  hasWebGpu,
  transcribe,
  type ModelId,
  type TranscribeProgress,
} from "@/lib/video-intel/transcribe";
import { exportTranscript, toBlob, type ExportFormat } from "@/lib/video-intel/exports";
import { formatClock } from "@/lib/video-intel/types";
import { extractKeyFrames } from "@/lib/video-intel/frames";
import { buildReportPdf, ocrFrames } from "@/lib/video-intel/report";

const MEDIA_ACCEPT =
  ".mp4,.mov,.webm,.mkv,.avi,.m4v,.mpeg,.mpg,.mp3,.wav,.m4a,.aac,.ogg,.flac,video/*,audio/*";
const TRANSCRIPT_ACCEPT = ".srt,.vtt,.txt";

const EXPORTS: ReadonlyArray<{ format: ExportFormat; label: string }> = [
  { format: "txt", label: "Text" },
  { format: "md", label: "Markdown" },
  { format: "html", label: "HTML" },
  { format: "srt", label: "SRT" },
  { format: "vtt", label: "VTT" },
  { format: "csv", label: "CSV" },
  { format: "json", label: "JSON" },
  { format: "xml", label: "XML" },
];

type Tab = "transcript" | "insights" | "analytics" | "export";

/**
 * Video Intelligence workspace.
 *
 * Everything runs on the user's own machine: media never uploads, and speech
 * recognition is Whisper compiled to WebAssembly/WebGPU via transformers.js.
 *
 * The workspace deliberately ships the capabilities it can actually deliver
 * honestly, transcription, editing, structure, measured analytics, exports -
 * and does NOT include summarisation or chat, which would need a hosted language
 * model and would mean sending the transcript off-device. That trade is stated
 * in the UI rather than hidden.
 */
export default function VideoIntelligenceTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);
  const vi = useVideoIntel();
  const playerRef = React.useRef<PlayerHandle>(null);

  const [tab, setTab] = React.useState<Tab>("transcript");
  const [currentMs, setCurrentMs] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [model, setModel] = React.useState<ModelId>("Xenova/whisper-base");
  const [progress, setProgress] = React.useState<TranscribeProgress | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState(false);
  const recorderRef = React.useRef<MediaRecorder | null>(null);

  const seek = React.useCallback((ms: number) => {
    playerRef.current?.seekTo(ms);
    setCurrentMs(ms);
  }, []);

  /* ── input ─────────────────────────────────────────────────────────────── */

  const onMediaPicked = React.useCallback(
    (file: File) => {
      setError(null);
      vi.loadMedia(file);
    },
    [vi],
  );

  const onTranscriptPicked = React.useCallback(
    async (file: File) => {
      try {
        setError(null);
        vi.importTranscript(await file.text(), file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "That transcript couldn't be read.");
      }
    },
    [vi],
  );

  /** Capture the screen or camera straight into the workspace. */
  const startRecording = React.useCallback(
    async (source: "screen" | "camera") => {
      try {
        setError(null);
        const stream =
          source === "screen"
            ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            : await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        const chunks: BlobPart[] = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => {
          for (const track of stream.getTracks()) track.stop();
          const blob = new Blob(chunks, { type: "video/webm" });
          onMediaPicked(new File([blob], `${source}-recording.webm`, { type: "video/webm" }));
          setRecording(false);
        };
        recorder.start();
        recorderRef.current = recorder;
        setRecording(true);
      } catch {
        setError(
          source === "screen"
            ? "Screen recording was blocked or cancelled."
            : "Camera access was blocked or cancelled.",
        );
      }
    },
    [onMediaPicked],
  );

  /* ── transcription ─────────────────────────────────────────────────────── */

  const runTranscription = React.useCallback(async () => {
    const file = vi.media?.file;
    if (!file) return;
    setError(null);
    try {
      const result = await transcribe(file, { model, onProgress: setProgress });
      vi.setSegments(
        result.segments,
        { kind: "transcribed", model: result.model, language: result.language },
        result.durationMs,
      );
      setTab("transcript");
      notifyDoneInTitle("Transcript ready");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Transcription failed. Try a shorter clip or the faster model.",
      );
    } finally {
      setProgress(null);
    }
  }, [model, vi]);

  const download = React.useCallback(
    (format: ExportFormat) => {
      const file = exportTranscript(format, {
        transcript: vi.transcript,
        analytics: vi.analytics,
        keywords: vi.keywords,
        entities: vi.entities,
      });
      const url = URL.createObjectURL(toBlob(file));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    [vi.analytics, vi.entities, vi.keywords, vi.transcript],
  );

  /* ── video report ──────────────────────────────────────────────────────── */

  const [reportStage, setReportStage] = React.useState<{ label: string; value: number } | null>(
    null,
  );
  const [userSummary, setUserSummary] = React.useState("");
  const [runOcr, setRunOcr] = React.useState(true);

  /**
   * Build the illustrated PDF report. Four measurable stages, each reporting
   * real progress. No fake spinner. Nothing here calls a language model: the
   * report says so on its own first page.
   */
  const generateReport = React.useCallback(async () => {
    if (!vi.media) return;
    setError(null);
    try {
      setReportStage({ label: "Scanning frames…", value: 0.02 });
      let frames = await extractKeyFrames(vi.media.url, vi.transcript.durationMs, {
        forcedTimes: vi.transcript.chapters.map((c) => c.start),
        onProgress: (fraction, label) => setReportStage({ label, value: fraction * 0.5 }),
      });

      if (runOcr && frames.length > 0) {
        frames = await ocrFrames(frames, (fraction, label) =>
          setReportStage({ label, value: 0.5 + fraction * 0.35 }),
        );
      }

      setReportStage({ label: "Building the PDF…", value: 0.9 });
      const pdf = await buildReportPdf({
        transcript: vi.transcript,
        analytics: vi.analytics,
        keywords: vi.keywords,
        entities: vi.entities,
        frames,
        userSummary: userSummary.trim() || undefined,
      });

      const url = URL.createObjectURL(pdf);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${vi.media.file.name.replace(/\.[^.]+$/, "")}-report.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The report could not be generated.",
      );
    } finally {
      setReportStage(null);
    }
  }, [runOcr, userSummary, vi.analytics, vi.entities, vi.keywords, vi.media, vi.transcript]);

  const hasTranscript = vi.transcript.segments.length > 0;
  const tooLong = vi.transcript.durationMs > MAX_COMFORTABLE_MS;

  /* ── empty state ───────────────────────────────────────────────────────── */

  if (!vi.media) {
    return (
      <div className="flex flex-col gap-4">
        <FileDrop accept={MEDIA_ACCEPT} onFile={onMediaPicked} accentText={style.text} />

        <div className="grid gap-3 sm:grid-cols-3">
          <ActionCard
            icon="Monitor"
            title="Record screen"
            body="Capture a tab, window or your whole screen with audio."
            onClick={() => void startRecording("screen")}
          />
          <ActionCard
            icon="Video"
            title="Record camera"
            body="Record straight from your webcam and microphone."
            onClick={() => void startRecording("camera")}
          />
          <label className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border bg-card p-4 text-left outline-none transition-colors hover:bg-accent focus-within:ring-2 focus-within:ring-ring">
            <Icon name="FileText" size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Import a transcript</span>
            <span className="text-xs text-muted-foreground">
              Already have SRT, VTT or text? Skip transcription entirely.
            </span>
            <input
              type="file"
              accept={TRANSCRIPT_ACCEPT}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onTranscriptPicked(file);
              }}
            />
          </label>
        </div>

        {error ? <Alert tone="error">{error}</Alert> : null}

        <Alert tone="info">
          Everything here runs in your browser. Your recording is never uploaded. Speech
          recognition downloads a model once ({MODELS.find((m) => m.id === model)?.sizeMb}MB), then
          works offline.{" "}
          {hasWebGpu()
            ? "Your browser supports WebGPU, so it'll run at a good pace."
            : "Your browser has no WebGPU, so transcription will be noticeably slower, best for short clips."}
        </Alert>
      </div>
    );
  }

  /* ── workspace ─────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {vi.media.file.name}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {formatBytes(vi.media.file.size)}
          </span>
        </span>

        {recording ? (
          <button
            type="button"
            onClick={() => recorderRef.current?.stop()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="size-2 animate-pulse rounded-full bg-current motion-reduce:animate-none" />
            Stop recording
          </button>
        ) : null}

        {/* Undo/Redo mean nothing until something has been edited. */}
        {vi.canUndo || vi.canRedo ? (
          <>
        <button
          type="button"
          onClick={vi.undo}
          disabled={!vi.canUndo}
          className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-accent disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={vi.redo}
          disabled={!vi.canRedo}
          className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-accent disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          Redo
        </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={vi.reset}
          className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start over
        </button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className={cn("grid gap-4", hasTranscript && "lg:grid-cols-[minmax(0,1fr)_20rem]")}>
        {/* Centre: player + tabs */}
        <div className="flex min-w-0 flex-col gap-3">
          <Player
            ref={playerRef}
            src={vi.media.url}
            kind={vi.media.kind}
            chapters={vi.transcript.chapters}
            bookmarks={vi.transcript.bookmarks}
            onTime={setCurrentMs}
            onDuration={vi.setDuration}
            onAddBookmark={(ms) => vi.addBookmark(ms, `Bookmark at ${formatClock(ms)}`)}
          />

          {/* ONE obvious next step. Everything optional (model choice, caveats)
              is folded behind "Options" - the old layout showed all of it at
              once and the actual action got lost in the middle. */}
          {!hasTranscript ? (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-center">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Get the words out of this video
                </h2>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                  Runs on your device. Nothing is uploaded.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void runTranscription()}
                disabled={Boolean(progress)}
                className="mx-auto inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon
                  name={progress ? "LoaderCircle" : "Sparkles"}
                  size={18}
                  className={progress ? "animate-spin motion-reduce:animate-none" : ""}
                />
                {progress ? "Working\u2026" : "Transcribe"}
              </button>

              {progress ? (
                <div className="mx-auto flex w-full max-w-md flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.label}</span>
                    {progress.value !== null ? (
                      <span className="tabular-nums">{Math.round(progress.value * 100)}%</span>
                    ) : null}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-primary transition-all",
                        progress.value === null && "w-1/3 animate-pulse motion-reduce:animate-none",
                      )}
                      style={progress.value !== null ? { width: `${progress.value * 100}%` } : undefined}
                    />
                  </div>
                </div>
              ) : (
                <details className="mx-auto w-full max-w-md text-left">
                  <summary className="cursor-pointer list-none text-center text-xs text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground">
                    Options
                  </summary>
                  <div className="mt-3 flex flex-col gap-2">
                    <label htmlFor="vi-model" className="text-xs font-medium text-foreground">
                      Speech model
                    </label>
                    <select
                      id="vi-model"
                      value={model}
                      onChange={(event) => setModel(event.target.value as ModelId)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {MODELS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} \u2014 {option.sizeMb}MB
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {MODELS.find((m) => m.id === model)?.note}
                    </p>
                    {tooLong ? (
                      <Alert tone="warn">
                        This clip is {formatClock(vi.transcript.durationMs)} long, so expect a wait.
                        Trimming first, or importing a transcript you already have, is quicker.
                      </Alert>
                    ) : null}
                  </div>
                </details>
              )}
            </div>
          ) : null}


          {/* Tabs */}
          <div className="flex flex-col rounded-xl border border-border bg-card">
            <div role="tablist" aria-label="Workspace" className="flex gap-1 border-b border-border p-1.5">
              {(
                [
                  ["transcript", "Transcript", "FileText"],
                  ...(hasTranscript
                    ? ([
                        ["insights", "Insights", "Sparkles"],
                        ["analytics", "Analytics", "ChartColumn"],
                      ] as const)
                    : []),
                  ["export", "Export", "Download"],
                ] as const
              ).map(([id, label, icon]) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    tab === id ? cn(style.soft, "text-foreground") : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon name={icon} size={13} />
                  {label}
                </button>
              ))}
            </div>

            {tab === "transcript" ? (
              <>
                <div className="border-b border-border p-2">
                  <label className="sr-only" htmlFor="vi-search">
                    Search the transcript
                  </label>
                  <div className="relative">
                    <Icon
                      name="Search"
                      size={14}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="vi-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search the transcript…"
                      className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div className="h-[28rem]">
                  <TranscriptView
                    segments={vi.transcript.segments}
                    speakers={vi.transcript.speakers}
                    speakerById={vi.speakerById}
                    currentMs={currentMs}
                    query={query}
                    onSeek={seek}
                    onEdit={(id, text) => vi.updateSegment(id, { text })}
                    onAssignSpeaker={(id, speakerId) =>
                      vi.updateSegment(id, { speakerId: speakerId || undefined })
                    }
                  />
                </div>
              </>
            ) : null}

            {tab === "insights" ? (
              <div className="max-h-[28rem] overflow-y-auto">
                <KeywordsPanel keywords={vi.keywords} onSeek={seek} />
                <EntitiesPanel entities={vi.entities} onSeek={seek} />
                <GraphPanel edges={vi.graph} />
              </div>
            ) : null}

            {tab === "analytics" ? (
              <div className="max-h-[28rem] overflow-y-auto">
                <AnalyticsPanel analytics={vi.analytics} />
              </div>
            ) : null}

            {tab === "export" ? (
              <div className="p-4">
                <p className="mb-3 text-xs text-muted-foreground">
                  Everything is generated in your browser. Captions go through the same serialiser as
                  the subtitle tools, so timings match exactly.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {EXPORTS.map(({ format, label }) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => download(format)}
                      disabled={!hasTranscript}
                      className="rounded-lg border border-border bg-card px-2 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {!hasTranscript ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Transcribe or import a transcript first.
                  </p>
                ) : null}

                {/* Illustrated PDF report. */}
                <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Video report</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      An illustrated PDF: screenshots chosen by scene-change and sharpness
                      scoring, on-screen text read by OCR, sections, notable passages,
                      detected action items and the full transcript. Everything is measured
                      or pattern-matched; nothing is written by an AI, and the report says
                      so on its first page.{" "}
                      {!hasTranscript ? (
                        <strong className="text-foreground">
                          Works without a transcript too, you&apos;ll get the screenshots,
                          OCR text and gallery.
                        </strong>
                      ) : null}
                    </p>
                  </div>

                  <label className="flex items-start gap-2 text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={runOcr}
                      onChange={(event) => setRunOcr(event.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <span>
                      Read on-screen text with OCR
                      <span className="block text-muted-foreground">
                        Catches slide and UI text the audio never mentions. Adds a one-time
                        engine download and roughly a second per screenshot.
                      </span>
                    </span>
                  </label>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="vi-summary" className="text-xs font-medium text-foreground">
                      Executive summary <span className="font-normal text-muted-foreground">(optional: your words)</span>
                    </label>
                    <textarea
                      id="vi-summary"
                      value={userSummary}
                      onChange={(event) => setUserSummary(event.target.value)}
                      rows={3}
                      placeholder="Write a short summary to open the report with. Left blank, the report simply omits this section rather than inventing one."
                      className="w-full resize-y rounded-lg border border-border bg-background p-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Deliberately NOT gated on a transcript: screenshots + OCR
                      alone make a useful visual report, and gating it hid the
                      feature entirely from anyone whose transcription hadn't
                      finished. */}
                  <button
                    type="button"
                    onClick={() => void generateReport()}
                    disabled={!vi.media || Boolean(reportStage)}
                    className="inline-flex items-center gap-1.5 self-start rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon
                      name={reportStage ? "LoaderCircle" : "FileText"}
                      size={15}
                      className={reportStage ? "animate-spin motion-reduce:animate-none" : ""}
                    />
                    {reportStage ? "Generating…" : "Generate video report"}
                  </button>

                  {reportStage ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{reportStage.label}</span>
                        <span className="tabular-nums">{Math.round(reportStage.value * 100)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${reportStage.value * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: context panel */}
        {hasTranscript ? (
        <aside className="flex max-h-[52rem] flex-col overflow-y-auto rounded-xl border border-border bg-card lg:sticky lg:top-20">
          <ChaptersPanel chapters={vi.transcript.chapters} currentMs={currentMs} onSeek={seek} />
          <SpeakersPanel
            speakers={vi.transcript.speakers}
            analytics={vi.analytics}
            onAdd={vi.addSpeaker}
            onRename={vi.renameSpeaker}
            onMerge={vi.mergeSpeakers}
          />
          <BookmarksPanel
            bookmarks={vi.transcript.bookmarks}
            onSeek={seek}
            onRemove={vi.removeBookmark}
          />
        </aside>
        ) : null}
      </div>
    </div>
  );
}

/* ── small shared pieces ─────────────────────────────────────────────────── */

function FileDrop({
  accept,
  onFile,
  accentText,
}: {
  accept: string;
  onFile: (file: File) => void;
  accentText: string;
}) {
  const [over, setOver] = React.useState(false);
  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
        over ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/50",
      )}
    >
      <Icon name="Upload" size={26} className={accentText} />
      <span className="text-sm font-medium text-foreground">
        Drop a video or audio file, or click to browse
      </span>
      <span className="text-xs text-muted-foreground">
        MP4, MOV, WebM, MKV, AVI, MP3, WAV, M4A and more: nothing is uploaded
      </span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function ActionCard({
  icon,
  title,
  body,
  onClick,
}: {
  icon: string;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name={icon} size={18} className="text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{body}</span>
    </button>
  );
}

function Alert({ tone, children }: { tone: "info" | "warn" | "error"; children: React.ReactNode }) {
  const styles = {
    info: "border-border bg-muted/40 text-muted-foreground",
    warn: "border-amber-500/40 bg-amber-500/5 text-foreground",
    error: "border-destructive/40 bg-destructive/5 text-foreground",
  } as const;
  const icons = { info: "Info", warn: "TriangleAlert", error: "TriangleAlert" } as const;
  return (
    <p className={cn("flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed", styles[tone])}>
      <Icon name={icons[tone]} size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
