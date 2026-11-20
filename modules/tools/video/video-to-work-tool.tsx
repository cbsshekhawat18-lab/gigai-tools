"use client";

import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackTool, track } from "@/lib/analytics";
import type { ImageToolProps } from "@/components/tool/types";

import { type PriorFindingRef } from "@/lib/video-work/analyze";
import {
  describeProvider,
  resolveCapability,
  type ProviderCapability,
} from "@/lib/video-work/provider";
import { probeMedia } from "@/lib/video-work/ingest";
import { mergeFindings, resolveConflict } from "@/lib/video-work/merge";
import { initialStages, runPipeline, type Stage } from "@/lib/video-work/pipeline";
import { runAnalysis } from "@/lib/video-work/provider";
import { notifyDoneInTitle } from "@/components/shared/working-state";
import { buildReportPdf } from "@/lib/video-work/report";
import { downloadExport, exportProject, slugify, type ExportFormat } from "@/lib/video-work/exports";
import {
  deleteEverything,
  getRetention,
  saveProject,
  setRetention,
  type Retention,
} from "@/lib/video-work/storage";
import {
  computeStats,
  emptyProject,
  formatClock,
  type ChangeRecord,
  type Finding,
  type FindingStatus,
  type Project,
  type VideoAsset,
} from "@/lib/video-work/types";

import { IngestPanel } from "@/components/tool/video-work/ingest-panel";
import { PipelineView } from "@/components/tool/video-work/pipeline-view";
import { WorkPlayer, type WorkPlayerHandle } from "@/components/tool/video-work/player";
import {
  ConflictPanel,
  IntentMap,
  ProjectOverview,
  Timeline,
} from "@/components/tool/video-work/panels";
import {
  DEFAULT_FILTERS,
  FindingsBoard,
  type BoardFilters,
} from "@/components/tool/video-work/findings-board";
import { ProviderPanel } from "@/components/tool/video-work/provider-panel";
import { SpeakerTagging, TicketBoard } from "@/components/tool/video-work/ticket-board";
import { ContextPanel } from "@/components/tool/video-work/context-panel";
import { ExportTrackerPanel } from "@/components/tool/video-work/export-tracker-panel";
import { extractTickets } from "@/lib/video-to-work/run";
import { ollamaChat } from "@/lib/video-to-work/llm";
import {
  assignSpeakerRoles,
  loadSpeakerRoles,
  saveSpeakerRoles,
} from "@/lib/video-to-work/speakers";
import type {
  ExtractionResult,
  Speaker as TicketSpeaker,
  TranscriptSegment,
} from "@/lib/video-to-work/types";
import { getOllamaHost, getOllamaModel } from "@/lib/video-work/provider";
import {
  DEMO_DURATION_MS,
  DEMO_RESULT,
  DEMO_SAMPLE_URL,
  DEMO_SEGMENTS,
  DEMO_SPEAKERS,
} from "@/lib/video-to-work/demo";

type Tab = "overview" | "findings" | "tickets" | "evidence" | "export";

/**
 * Video → Work.
 *
 * The pipeline is split deliberately: the recording is decoded, transcribed and
 * sampled for key frames entirely on the user's machine, and only the resulting
 * transcript plus a handful of frames are sent for analysis. The video itself
 * never leaves the device when it arrives as a file. That is the most that can
 * be kept local while still doing the thing the tool exists for: turning a
 * vague client sentence into a requirement with acceptance criteria needs a
 * language model, and there is no honest way to fake that with heuristics.
 *
 * Links are the one exception and are labelled as such: a browser cannot read a
 * Loom or YouTube stream, so the server fetches it and passes it straight to
 * the browser.
 *
 * Nothing here presents an uncertain reading as a settled requirement. The
 * client's verbatim words, the AI's interpretation and the confidence score are
 * kept structurally separate all the way through the UI, the exports and the
 * PDF, because a developer who cannot tell which is which will eventually build
 * from the wrong one.
 */
export default function VideoToWorkTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [project, setProject] = React.useState<Project>(() => emptyProject("Client project"));
  const [capability, setCapability] = React.useState<ProviderCapability | null>(null);
  const [tab, setTab] = React.useState<Tab>("findings");
  const [stages, setStages] = React.useState<Stage[] | null>(null);
  const [processingLabel, setProcessingLabel] = React.useState("");
  const [activeVideoId, setActiveVideoId] = React.useState<string | null>(null);
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<BoardFilters>(DEFAULT_FILTERS);
  const [retention, setRetentionState] = React.useState<Retention>("keep");
  const [busy, setBusy] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const playerRef = React.useRef<WorkPlayerHandle>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  // Object URLs are revoked on unmount; keeping them in a ref avoids re-running
  // cleanup every time the project state changes.
  const urlsRef = React.useRef<string[]>([]);

  /* ── Boot ──────────────────────────────────────────────────────────────── */

  React.useEffect(() => {
    trackTool("tool_view", tool.slug);
    setRetentionState(getRetention());
    void resolveCapability().then(setCapability);
    return () => {
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
    };
  }, [tool.slug]);

  // Persist after every change, honouring the retention setting (the write path
  // itself is a no-op under session-only, so this stays a single call).
  React.useEffect(() => {
    if (project.findings.length === 0 && project.videos.length === 0) return;
    void saveProject(project).catch(() => {
      /* storage can be blocked in private browsing. Never break the workspace */
    });
  }, [project]);

  /** Re-probe after the user changes provider, host or model. */
  const refreshCapability = React.useCallback(() => {
    void resolveCapability().then(setCapability);
  }, []);

  const activeVideo =
    project.videos.find((v) => v.id === activeVideoId) ?? project.videos[0] ?? null;

  /* ── Ingestion + pipeline ──────────────────────────────────────────────── */

  const addFiles = React.useCallback(
    async (files: File[]) => {
      // P9: be honest up front on low-memory devices instead of crashing at 80%.
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      if (mem !== undefined && mem <= 4) {
        toast.warning(
          "This device reports " + mem + " GB of memory. Long recordings may not survive in-browser transcription here - a desktop is the safer bet.",
        );
      }
      if (busy) return;
      setBusy(true);

      // Resolve the provider BEFORE the pipeline starts. The capability probe
      // races an Ollama check that waits up to 3s for a connection that usually
      // isn't there, and the drop zone is the first thing anyone touches, so a
      // file dropped in those first seconds used to run with provider "none"
      // and silently skip analysis, on a site where analysis is configured and
      // working. Awaiting here costs nothing on a warm load (the status call is
      // cached) and removes the race entirely.
      let active = capability;
      if (!active || active.resolved === "none") {
        active = await resolveCapability();
        setCapability(active);
      }

      for (const file of files) {
        const controller = new AbortController();
        abortRef.current = controller;

        const objectUrl = URL.createObjectURL(file);
        urlsRef.current.push(objectUrl);

        try {
          trackTool("file_selected", tool.slug, { size: file.size });

          const probed = await probeMedia(objectUrl);
          const video: VideoAsset = {
            id: `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            label: cleanLabel(file.name),
            source: { kind: "upload", fileName: file.name, sizeBytes: file.size },
            durationMs: probed.durationMs,
            objectUrl,
            segments: [],
            frames: [],
            posterDataUrl: probed.posterDataUrl,
            addedAt: new Date().toISOString(),
            analyzed: false,
          };

          setProject((prev) => ({ ...prev, videos: [...prev.videos, video] }));
          setActiveVideoId(video.id);
          setProcessingLabel(video.label);
          setStages(initialStages());
          trackTool("process_started", tool.slug);

          // Give the analyser what the project already knows, so a follow-up
          // video amends the work rather than duplicating it.
          const priorFindings: PriorFindingRef[] = project.findings.map((finding) => ({
            id: finding.id,
            type: finding.type,
            title: finding.title,
            area: finding.area,
            videoLabel:
              project.videos.find((v) => v.id === finding.evidence.videoId)?.label ?? "",
          }));

          const result = await runPipeline({
            video,
            objectUrl,
            model: "Xenova/whisper-base",
            runOcr: true,
            audioOnly: !probed.hasVideo,
            provider: active?.resolved ?? "none",
            localModel: active?.localModel,
            priorFindings,
            projectContext: project.context,
            onStage: setStages,
            signal: controller.signal,
          });

          setProject((prev) => {
            const withMedia = prev.videos.map((v) =>
              v.id === video.id
                ? {
                    ...v,
                    segments: result.segments,
                    frames: result.frames,
                    analyzed: Boolean(result.analysis),
                    analysisError: result.analysisError,
                  }
                : v,
            );

            if (!result.analysis) return { ...prev, videos: withMedia };

            const merged = mergeFindings(prev.findings, result.analysis.findings);
            return {
              ...prev,
              videos: withMedia,
              findings: merged.findings,
              changes: [...prev.changes, ...merged.changes],
              // The newest analysis writes the project summary; earlier ones stay
              // available inside each finding's evidence.
              summary: result.analysis.summary,
              updatedAt: new Date().toISOString(),
            };
          });

          if (result.analysisError) {
            toast.warning("Analysis unavailable", { description: result.analysisError });
            trackTool("process_failed", tool.slug, { stage: "analyze" });
          } else if (result.analysis) {
            notifyDoneInTitle("Analysis ready");
            const count = result.analysis.findings.length;
            toast.success(`${count} finding${count === 1 ? "" : "s"} extracted`, {
              description: `${video.label} · ${formatClock(video.durationMs)}`,
            });
            trackTool("process_completed", tool.slug, { findings: count });
            setTab("findings");
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            toast.info("Cancelled");
          } else {
            const message = err instanceof Error ? err.message : "That recording couldn't be processed.";
            toast.error("Processing failed", { description: message });
            trackTool("process_failed", tool.slug);
          }
        } finally {
          abortRef.current = null;
        }
      }

      setStages(null);
      setBusy(false);
    },
    [busy, capability, project.context, project.findings, project.videos, tool.slug],
  );

  /* ── Finding actions ───────────────────────────────────────────────────── */

  const seek = React.useCallback(
    (videoId: string, ms: number) => {
      if (videoId !== activeVideo?.id) setActiveVideoId(videoId);
      setTab("evidence");
      // Let the player mount for a newly-selected video before seeking it.
      requestAnimationFrame(() => playerRef.current?.seekTo(ms));
    },
    [activeVideo?.id],
  );

  /* ── Verbatim tickets (lib/video-to-work, local Ollama only) ──────────── */

  /** Stable "same file" key: VideoAsset keeps no File object (blob URL only). */
  const ticketVideoHash = (v: VideoAsset): string =>
    v.source.kind === "upload"
      ? `${v.source.fileName}-${v.source.sizeBytes}`
      : v.source.url;

  const [ticketSpeakers, setTicketSpeakers] = React.useState<TicketSpeaker[] | null>(null);
  const [ticketResult, setTicketResult] = React.useState<ExtractionResult | null>(null);
  const [ticketBusy, setTicketBusy] = React.useState(false);
  const [ticketProgress, setTicketProgress] = React.useState("");
  const [ticketError, setTicketError] = React.useState<string | null>(null);
  const ticketVideoRef = React.useRef<string | null>(null);
  const ticketPlayerRef = React.useRef<WorkPlayerHandle>(null);
  const debugTickets =
    typeof window !== "undefined" && window.location.search.includes("debug=1");
  const [demoActive, setDemoActive] = React.useState(false);
  const ticketsAvailable =
    demoActive ||
    Boolean(capability && capability.ollama.reachable && capability.ollama.allModels.length > 0);

  /** P9: "See it work - no upload". Loads the bundled 115s sample call and its
   *  precomputed tickets, so the first impression costs nothing and uploads
   *  nothing. The banner in the tickets tab says the result is precomputed. */
  const loadDemo = React.useCallback(async () => {
    try {
      setBusy(true);
      const res = await fetch(DEMO_SAMPLE_URL);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      urlsRef.current.push(objectUrl);
      const video: VideoAsset = {
        id: "demo-sample",
        label: "Sample client call (demo)",
        source: {
          kind: "upload",
          fileName: "client-feedback-demo.m4a",
          sizeBytes: blob.size,
        },
        durationMs: DEMO_DURATION_MS,
        objectUrl,
        segments: DEMO_SEGMENTS.map((seg) => ({
          id: seg.id,
          start: Math.round(seg.startSec * 1000),
          end: Math.round(seg.endSec * 1000),
          text: seg.text,
          speakerId: seg.speakerId,
        })),
        frames: [],
        addedAt: new Date().toISOString(),
        analyzed: true,
      };
      setProject((prev) => ({ ...prev, videos: [video], updatedAt: new Date().toISOString() }));
      setActiveVideoId(video.id);
      ticketVideoRef.current = video.id;
      setTicketSpeakers(DEMO_SPEAKERS);
      setTicketResult(DEMO_RESULT);
      setDemoActive(true);
      setTab("tickets");
      track("video_work_demo_loaded", {});
    } catch {
      toast.error("Couldn't load the sample. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  /** video-intel segments (ms) -> spec transcript segments (sec). */
  const ticketSegments = React.useMemo<TranscriptSegment[]>(() => {
    if (!activeVideo) return [];
    return activeVideo.segments.map((seg) => ({
      id: seg.id,
      startSec: seg.start / 1000,
      endSec: seg.end / 1000,
      text: seg.text,
      speakerId: seg.speakerId ?? "",
    }));
  }, [activeVideo]);

  // (Re)build the speaker list when the tickets tab meets a new video,
  // restoring roles the user already tagged for this exact file.
  React.useEffect(() => {
    if (tab !== "tickets" || !activeVideo || ticketSegments.length === 0) return;
    if (ticketVideoRef.current === activeVideo.id) return;
    ticketVideoRef.current = activeVideo.id;
    setTicketResult(null);
    setTicketError(null);
    const speakers = assignSpeakerRoles(ticketSegments);
    const stored = loadSpeakerRoles(ticketVideoHash(activeVideo));
    setTicketSpeakers(
      stored
        ? speakers.map((sp) => (stored[sp.id] ? { ...sp, ...stored[sp.id] } : sp))
        : speakers,
    );
  }, [tab, activeVideo, ticketSegments]);

  const runTicketExtraction = React.useCallback(async () => {
    if (!activeVideo || !ticketSpeakers || ticketSegments.length === 0) return;
    setTicketBusy(true);
    setTicketError(null);
    try {
      saveSpeakerRoles(ticketVideoHash(activeVideo), ticketSpeakers);
      const model = getOllamaModel() || capability?.ollama.allModels[0] || "";
      const chat = ollamaChat(getOllamaHost(), model);
      const result = await extractTickets(ticketSegments, ticketSpeakers, {
        chat,
        onProgress: (label, done, total) => setTicketProgress(`${label} (${done}/${total})`),
      });
      setTicketResult(result);
      track("video_work_tickets_extracted", { count: result.stats.finalCount });
    } catch (err) {
      setTicketError(
        err instanceof Error ? err.message : "Extraction failed. Is Ollama still running?",
      );
    } finally {
      setTicketBusy(false);
      setTicketProgress("");
    }
  }, [activeVideo, capability, ticketSegments, ticketSpeakers]);

  /** Re-run JUST the analysis for a video whose transcription already
   *  succeeded - the transcript and frames are kept, so this takes seconds,
   *  not minutes. Born from a live failure where the only signal was a toast
   *  and the only recovery was re-uploading the whole recording. */
  const reanalyzeVideo = React.useCallback(
    async (video: VideoAsset) => {
      if (busy) return;
      setBusy(true);
      setProcessingLabel(`Re-running analysis for ${video.label}…`);
      try {
        const active = capability ?? (await resolveCapability());
        const analysis = await runAnalysis({
          provider: active.resolved,
          localModel: active.localModel,
          video,
          segments: video.segments,
          frames: video.frames,
          priorFindings: project.findings.map((f) => ({
            id: f.id,
            type: f.type,
            title: f.title,
            area: f.area,
            videoLabel:
              project.videos.find((v) => v.id === f.evidence.videoId)?.label ?? "",
          })),
          projectContext: project.context,
          onProgress: (note) => setProcessingLabel(note),
        });
        if (analysis.refusal) throw new Error(analysis.refusal);
        setProject((prev) => {
          const merged = mergeFindings(prev.findings, analysis.findings);
          return {
            ...prev,
            videos: prev.videos.map((v) =>
              v.id === video.id ? { ...v, analyzed: true, analysisError: undefined } : v,
            ),
            findings: merged.findings,
            changes: [...prev.changes, ...merged.changes],
            summary: analysis.summary,
            updatedAt: new Date().toISOString(),
          };
        });
        toast.success(
          `${analysis.findings.length} finding${analysis.findings.length === 1 ? "" : "s"} extracted`,
        );
        setTab("findings");
      } catch (err) {
        const message = err instanceof Error ? err.message : "The analysis step failed again.";
        setProject((prev) => ({
          ...prev,
          videos: prev.videos.map((v) =>
            v.id === video.id ? { ...v, analysisError: message } : v,
          ),
        }));
        toast.error("Analysis failed", { description: message });
      } finally {
        setBusy(false);
        setProcessingLabel("");
      }
    },
    [busy, capability, project.context, project.findings, project.videos],
  );

  const updateFinding = React.useCallback((id: string, patch: Partial<Finding>) => {
    setProject((prev) => ({
      ...prev,
      findings: prev.findings.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      updatedAt: new Date().toISOString(),
    }));
    track("video_work_task_edited", { id });
  }, []);

  const setStatuses = React.useCallback((ids: string[], next: FindingStatus) => {
    const wanted = new Set(ids);
    setProject((prev) => ({
      ...prev,
      findings: prev.findings.map((f) =>
        wanted.has(f.id)
          ? { ...f, status: next, needsConfirmation: next === "approved" ? false : f.needsConfirmation }
          : f,
      ),
      updatedAt: new Date().toISOString(),
    }));
    track(next === "approved" ? "video_work_task_approved" : "video_work_task_rejected", {
      count: ids.length,
    });
  }, []);

  const onResolveConflict = React.useCallback(
    (index: number, choice: NonNullable<ChangeRecord["resolution"]>) => {
      setProject((prev) => {
        const resolved = resolveConflict(prev.findings, prev.changes, index, choice);
        return { ...prev, ...resolved, updatedAt: new Date().toISOString() };
      });
    },
    [],
  );

  /* ── Export ────────────────────────────────────────────────────────────── */

  const doExport = React.useCallback(
    async (format: ExportFormat | "pdf") => {
      setExporting(true);
      try {
        if (format === "pdf") {
          const blob = await buildReportPdf(project);
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `${slugify(project.name) || "video-to-work"}.pdf`;
          anchor.click();
          URL.revokeObjectURL(url);
        } else {
          downloadExport(exportProject(format, project));
        }
        trackTool("download", tool.slug, { format });
      } catch (err) {
        toast.error("Export failed", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setExporting(false);
      }
    },
    [project, tool.slug],
  );

  /* ── Render ────────────────────────────────────────────────────────────── */

  const stats = computeStats(project);
  const hasWork = project.videos.length > 0;

  return (
    <div style={style} className="space-y-6">
      {/* Server capability notice - surfaced before a long local job, not after. */}
      {capability && capability.resolved === "none" ? (
        <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex gap-2 text-sm text-amber-700 dark:text-amber-400">
            <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>One free setup step before findings can be generated.</strong> Transcription
              and screenshots already run in your browser and are exportable, turning them into
              tickets needs a vision model. Run one on your own machine below: it&rsquo;s free,
              unmetered, works offline, and no part of your client&rsquo;s recording leaves your
              computer.
            </p>
          </div>
          <ProviderPanel capability={capability} busy={busy} onChanged={refreshCapability} />
        </div>
      ) : capability?.resolved === "local" ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="HardDrive" className="size-3.5 shrink-0 text-emerald-500" />
          Analyzing on your machine with{" "}
          <code className="font-mono">{capability.localModel}</code> - nothing about these
          recordings leaves your device.
        </p>
      ) : null}

      {!hasWork ? (
        <>
          {DEMO_SAMPLE_URL ? (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => void loadDemo()} disabled={busy}>
                <Icon name="Play" size={15} />
                See it work - no upload
              </Button>
            </div>
          ) : null}
          <IngestPanel
            compact={false}
            busy={busy}
            fetchEnabled={capability?.fetchEnabled ?? false}
            onFiles={(files) => void addFiles(files)}
            onError={(message) => toast.error(message)}
          />

          {/* Where analysis will run, stated before the work starts rather than
              discovered afterwards. Collapsed by default so it doesn't compete
              with the drop zone, but present: a visitor served by a hosted
              tier should still find out they can run it locally for free,
              unlimited, and without sending anything. */}
          {capability && capability.resolved !== "none" ? (
            <details className="rounded-lg border text-sm">
              {/* Was `truncate`, which cut the sentence mid-clause ("…are sent,
                  …") and hid the very disclosure it exists to make. It wraps
                  now; two lines is a fair price for a complete sentence. */}
              <summary className="flex cursor-pointer items-start gap-2 p-3 text-xs text-muted-foreground">
                <Icon
                  name={capability.resolved === "local" ? "HardDrive" : "Cloud"}
                  className={cn(
                    "mt-px size-3.5 shrink-0",
                    capability.resolved === "local" && "text-emerald-500",
                  )}
                />
                <span className="min-w-0 flex-1 text-pretty">
                  Analysis runs on {describeProvider(capability)}
                </span>
                <span className="shrink-0 font-medium text-foreground">Change</span>
              </summary>
              <div className="border-t p-3">
                <ProviderPanel
                  capability={capability}
                  busy={busy}
                  onChanged={refreshCapability}
                />
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <>
          {/* ── Project header ─────────────────────────────────────────── */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Input
                value={project.name}
                onChange={(e) => setProject((prev) => ({ ...prev, name: e.target.value }))}
                aria-label="Project name"
                className="h-auto border-0 bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
              />
              <p className="text-xs text-muted-foreground">
                {stats.videoCount} video{stats.videoCount === 1 ? "" : "s"} ·{" "}
                {Math.round(stats.totalDurationMs / 60000)} minutes · {stats.findingCount} findings
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => {
                if (
                  !window.confirm(
                    "Start a new project? This one stays saved on this device.",
                  )
                )
                  return;
                for (const url of urlsRef.current) URL.revokeObjectURL(url);
                urlsRef.current = [];
                setProject(emptyProject("Client project"));
                setActiveVideoId(null);
                setStages(null);
                setTicketResult(null);
                setTicketSpeakers(null);
                ticketVideoRef.current = null;
                setDemoActive(false);
                setTab("findings");
              }}
            >
              <Icon name="Plus" size={14} />
              New project
            </Button>
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-1 border-b">
            <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon="LayoutDashboard">
              Overview
            </TabButton>
            <TabButton active={tab === "findings"} onClick={() => setTab("findings")} icon="ListChecks">
              Findings {stats.findingCount > 0 ? `(${stats.findingCount})` : ""}
            </TabButton>
            {ticketsAvailable ? (
              <TabButton active={tab === "tickets"} onClick={() => setTab("tickets")} icon="Quote">
                Verbatim tickets
              </TabButton>
            ) : null}
            <TabButton active={tab === "evidence"} onClick={() => setTab("evidence")} icon="Video">
              Evidence
            </TabButton>
            <TabButton active={tab === "export"} onClick={() => setTab("export")} icon="Download">
              Export
            </TabButton>
          </div>

          {stages ? (
            <PipelineView
              stages={stages}
              videoLabel={processingLabel}
              onCancel={() => abortRef.current?.abort()}
            />
          ) : null}

          {/* ── Panels ─────────────────────────────────────────────────── */}
          {tab === "overview" ? (
            <div className="space-y-6">
              <ProjectOverview project={project} />
              <ContextPanel />
              {project.findings.length > 0 ? (
                <ExportTrackerPanel project={project} findings={project.findings} />
              ) : null}
              <ConflictPanel project={project} onResolve={onResolveConflict} onSeek={seek} />
              <IntentMap
                project={project}
                onOpenFinding={(id) => {
                  setFocusId(id);
                  setTab("findings");
                }}
              />
              <Timeline project={project} onSeek={seek} />
            </div>
          ) : null}

          {tab === "findings" ? (
            <>
              {/* Honest failure state: the analysis step died but the local
                  work (transcript, frames) survived. Explain + offer a fast
                  re-run instead of a toast that vanished (live bug 2026-08-21:
                  three 503s left users with "0 findings" and no way back). */}
              {project.videos
                .filter((v) => !v.analyzed && (v.analysisError || v.segments.length > 0))
                .map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm text-foreground">
                      <p className="font-medium">
                        The analysis step didn&apos;t finish for &ldquo;{v.label}&rdquo;.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {v.analysisError ??
                          "The transcription succeeded and is saved - only the analysis is missing."}{" "}
                        Your transcript and screenshots are kept, so re-running takes seconds.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void reanalyzeVideo(v)}
                      className="shrink-0"
                    >
                      <Icon name={busy ? "LoaderCircle" : "RotateCcw"} size={14} className={busy ? "animate-spin" : ""} />
                      Re-run analysis
                    </Button>
                  </div>
                ))}
              {/* Honest zero-findings state: the analysis RAN and found no
                  actionable requests - say that, never "analyze a recording"
                  as if nothing happened. */}
              {stats.findingCount === 0 &&
              project.videos.some((v) => v.analyzed) &&
              project.videos.every((v) => v.analyzed) ? (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  The analysis ran and found no actionable requests in this recording. That
                  usually means it&apos;s a walkthrough or demo rather than client feedback -
                  nobody asked for anything. If you wanted the transcript itself, Video
                  Intelligence gives you exactly that.
                </div>
              ) : null}
              <FindingsBoard
              project={project}
              filters={filters}
              onFilters={setFilters}
              onSeek={seek}
              onUpdate={updateFinding}
              onStatus={setStatuses}
              focusId={focusId}
            />
            </>
          ) : null}

          {tab === "tickets" ? (
            <div className="space-y-6">
              {!activeVideo || ticketSegments.length === 0 ? (
                <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                  Add and analyse a recording first - tickets are extracted from its
                  transcript, and every quote is verified against it word for word.
                </p>
              ) : (
                <>
                  {activeVideo.objectUrl ? (
                    <WorkPlayer
                      ref={ticketPlayerRef}
                      video={activeVideo}
                      findings={[]}
                      onOpenFinding={() => {}}
                    />
                  ) : null}
                  {!ticketResult ? (
                    <SpeakerTagging
                      speakers={ticketSpeakers ?? []}
                      onChange={setTicketSpeakers}
                      onConfirm={() => void runTicketExtraction()}
                      busy={ticketBusy}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                          Every quote below is a verified span of the transcript - click a
                          timestamp to hear the client say it.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTicketResult(null);
                          }}
                        >
                          <Icon name="RotateCcw" size={14} />
                          Re-run
                        </Button>
                      </div>
                      {demoActive ? (
                        <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                          This is the bundled sample recording with a precomputed result, so
                          you can see the output instantly. Every quote below is still a real
                          span of the sample transcript, and every timestamp seeks the audio.
                          Drop your own recording to run the live extraction.
                        </p>
                      ) : null}
                      <TicketBoard
                        result={ticketResult}
                        debug={debugTickets}
                        onSeek={(sec) => ticketPlayerRef.current?.seekTo(sec * 1000)}
                        onDismiss={(id, dismissed) =>
                          setTicketResult((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  tickets: prev.tickets.map((t) =>
                                    t.id === id ? { ...t, dismissed } : t,
                                  ),
                                }
                              : prev,
                          )
                        }
                      />
                    </>
                  )}
                  {ticketBusy && ticketProgress ? (
                    <p className="text-xs tabular-nums text-muted-foreground">{ticketProgress}</p>
                  ) : null}
                  {ticketError ? (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                      {ticketError}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          {tab === "evidence" ? (
            <div className="space-y-4">
              {project.videos.length > 1 ? (
                <div className="flex flex-wrap gap-1.5">
                  {project.videos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setActiveVideoId(video.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        video.id === activeVideo?.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {video.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {activeVideo ? (
                <WorkPlayer
                  ref={playerRef}
                  video={activeVideo}
                  findings={project.findings.filter((f) => f.evidence.videoId === activeVideo.id)}
                  onOpenFinding={(id) => {
                    setFocusId(id);
                    setTab("findings");
                  }}
                />
              ) : null}

              <IngestPanel
                compact
                busy={busy}
                fetchEnabled={capability?.fetchEnabled ?? false}
                onFiles={(files) => void addFiles(files)}
                onError={(message) => toast.error(message)}
              />
            </div>
          ) : null}

          {tab === "export" ? (
            <ExportPanel
              project={project}
              exporting={exporting}
              onExport={doExport}
              capability={capability}
              busy={busy}
              onProviderChanged={refreshCapability}
              retention={retention}
              onRetention={async (next) => {
                await setRetention(next);
                setRetentionState(next);
                toast.success(
                  next === "session-only"
                    ? "Stored projects deleted. Nothing will be saved from now on."
                    : "Projects will be kept on this device until you delete them.",
                );
              }}
              onDeleteAll={async () => {
                await deleteEverything();
                for (const url of urlsRef.current) URL.revokeObjectURL(url);
                urlsRef.current = [];
                setProject(emptyProject("Client project"));
                setActiveVideoId(null);
                toast.success("Everything deleted from this device.");
              }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

/* ── Export + privacy ─────────────────────────────────────────────────────── */

function ExportPanel({
  project,
  exporting,
  onExport,
  capability,
  busy,
  onProviderChanged,
  retention,
  onRetention,
  onDeleteAll,
}: {
  project: Project;
  exporting: boolean;
  onExport: (format: ExportFormat | "pdf") => void;
  capability: ProviderCapability | null;
  busy: boolean;
  onProviderChanged: () => void;
  retention: Retention;
  onRetention: (next: Retention) => Promise<void>;
  onDeleteAll: () => Promise<void>;
}) {
  const stats = computeStats(project);
  const unresolved = project.changes.filter((c) => c.kind === "contradicted" && !c.resolution).length;

  return (
    <div className="space-y-6">
      {stats.needsConfirmation > 0 || unresolved > 0 ? (
        <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
          <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0" />
          <p>
            Exports mark uncertain interpretations and unresolved contradictions in place, so
            whoever receives this can see what still needs confirming. Rejected findings and the
            losing side of a resolved conflict are left out.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <ExportCard
          icon="FileText"
          title="Developer handoff"
          description="Everything a developer needs, ordered by dependency and priority, with the open questions pulled to the top."
          action="Download Markdown"
          disabled={exporting}
          onClick={() => onExport("handoff")}
        />
        <ExportCard
          icon="FileType"
          title="PDF report"
          description="A client-ready document with screenshots, evidence quotes, timeline and acceptance criteria."
          action="Download PDF"
          disabled={exporting}
          onClick={() => onExport("pdf")}
        />
        <ExportCard
          icon="Braces"
          title="JSON"
          description="Versioned, machine-readable output, the shape Jira, Linear and GitHub Issues integrations map from."
          action="Download JSON"
          disabled={exporting}
          onClick={() => onExport("json")}
        />
        <ExportCard
          icon="Hash"
          title="Markdown"
          description="The full findings list grouped by type, with evidence and criteria inline."
          action="Download Markdown"
          disabled={exporting}
          onClick={() => onExport("md")}
        />
      </div>

      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-2">
          <Icon name="Sparkles" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Execute with a GigAI agent, coming soon</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Approved tasks will be handed to an agent that implements, tests and screenshots the
              change, then reports back for review. Human approval stays a required step: nothing
              runs from an unconfirmed interpretation.
            </p>
          </div>
        </div>
      </div>

      {/* ── Where analysis runs ────────────────────────────────────────── */}
      <div className="rounded-xl border p-4">
        <ProviderPanel capability={capability} busy={busy} onChanged={onProviderChanged} />
      </div>

      {/* ── Privacy ────────────────────────────────────────────────────── */}
      <div className="space-y-3 rounded-xl border p-4">
        <h3 className="text-sm font-semibold">Your data</h3>
        <p className="text-xs text-muted-foreground">
          Findings, transcripts and screenshots are stored in this browser only. The recording
          itself is never stored: client videos routinely contain admin panels, customer records
          and inboxes, so keeping one in browser storage past the session isn&rsquo;t a trade worth
          making.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={retention === "keep" ? "default" : "outline"}
            onClick={() => void onRetention("keep")}
          >
            Keep until I delete
          </Button>
          <Button
            size="sm"
            variant={retention === "session-only" ? "default" : "outline"}
            onClick={() => void onRetention("session-only")}
          >
            Keep nothing after this session
          </Button>
          <Button size="sm" variant="destructive" onClick={() => void onDeleteAll()}>
            <Icon name="Trash2" className="size-3.5" />
            Delete everything now
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExportCard({
  icon,
  title,
  description,
  action,
  disabled,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  action: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-4">
      <Icon name={icon} className="size-5 text-primary" />
      <p className="mt-2 font-medium">{title}</p>
      <p className="mt-1 flex-1 text-xs text-muted-foreground">{description}</p>
      <Button size="sm" variant="outline" className="mt-3 self-start" disabled={disabled} onClick={onClick}>
        {action}
      </Button>
    </div>
  );
}

function TabButton({
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
      className={cn(
        "min-h-11 -mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon name={icon} className="size-4" />
      {children}
    </button>
  );
}

/** File name minus extension and separators, a readable default video label. */
function cleanLabel(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 80) || "Recording";
}
