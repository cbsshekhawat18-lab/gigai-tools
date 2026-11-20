/**
 * Video → Work: choosing where the analysis runs.
 *
 * Two providers, and the difference between them is a privacy decision the user
 * should make knowingly rather than inherit:
 *
 *  LOCAL Ollama on the user's own machine. Nothing leaves the device. Not
 *           the video, not the transcript, not the screenshots. Free, offline,
 *           unmetered. Rougher output, because a 7B model reads evidence less
 *           reliably than a frontier one.
 *
 *   SERVER  Our backend calls a frontier model. The video still never leaves
 *           the device, but the transcript and the selected frames do. Sharper
 *           requirements, and it costs us money per analysis.
 *
 * Default is `auto`: use the local model when one is actually there, otherwise
 * fall back to the server. That way the privacy-maximal path is the one you get
 * for free by having Ollama installed, rather than something you have to find a
 * setting to turn on.
 */

import { checkAnalysisStatus, type AnalysisResult, type PriorFindingRef } from "./analyze";
import { analyzeLocally, checkOllama, DEFAULT_OLLAMA_HOST, type OllamaStatus } from "./ollama";
import type { CapturedFrame } from "@/lib/video-intel/frames";
import type { Segment } from "@/lib/video-intel/types";
import type { VideoAsset } from "./types";

export type ProviderChoice = "auto" | "local" | "server";
export type ResolvedProvider = "local" | "server" | "none";

const PREF_KEY = "gigai.video-work.provider";
const HOST_KEY = "gigai.video-work.ollama-host";
const MODEL_KEY = "gigai.video-work.ollama-model";

/* ── Preferences ──────────────────────────────────────────────────────────── */

export function getProviderChoice(): ProviderChoice {
  if (typeof localStorage === "undefined") return "auto";
  const value = localStorage.getItem(PREF_KEY);
  return value === "local" || value === "server" ? value : "auto";
}

export function setProviderChoice(choice: ProviderChoice): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(PREF_KEY, choice);
}

export function getOllamaHost(): string {
  if (typeof localStorage === "undefined") return DEFAULT_OLLAMA_HOST;
  return localStorage.getItem(HOST_KEY) || DEFAULT_OLLAMA_HOST;
}

export function setOllamaHost(host: string): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(HOST_KEY, host.trim() || DEFAULT_OLLAMA_HOST);
  }
}

export function getOllamaModel(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(MODEL_KEY) ?? "";
}

export function setOllamaModel(model: string): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(MODEL_KEY, model);
}

/* ── Capability ───────────────────────────────────────────────────────────── */

export interface ProviderCapability {
  choice: ProviderChoice;
  /** What will actually run given the preference and what's available. */
  resolved: ResolvedProvider;
  ollama: OllamaStatus;
  /** The local model that will be used, when one is available. */
  localModel: string;
  serverConfigured: boolean;
  serverModel: string;
  /** True when the hosted tier is a shared free allowance rather than paid. */
  serverFreeTier: boolean;
  /** True when the server can fetch Loom/YouTube links (independent of analysis). */
  fetchEnabled: boolean;
}

/**
 * Work out what is available and what will run.
 *
 * Both probes are cheap and run in parallel; neither failing is an error, since
 * a user with only one of the two configured is the normal case.
 */
export async function resolveCapability(): Promise<ProviderCapability> {
  const choice = getProviderChoice();
  const host = getOllamaHost();

  const [ollama, server] = await Promise.all([
    choice === "server" ? Promise.resolve(offlineOllama()) : checkOllama(host),
    checkAnalysisStatus(),
  ]);

  const preferredModel = getOllamaModel();
  // Honour an explicit model choice only if it's still installed, so a model the
  // user deleted doesn't produce a confusing "not found" at analysis time.
  const localModel =
    preferredModel && ollama.visionModels.includes(preferredModel)
      ? preferredModel
      : (ollama.visionModels[0] ?? "");

  const localUsable = ollama.reachable && localModel !== "";

  return {
    choice,
    resolved: decideProvider(choice, localUsable, server.configured),
    ollama,
    localModel,
    serverConfigured: server.configured,
    serverModel: server.model,
    serverFreeTier: server.freeTier,
    fetchEnabled: server.fetchEnabled,
  };
}

function offlineOllama(): OllamaStatus {
  return { reachable: false, visionModels: [], allModels: [] };
}

/**
 * The selection rule, isolated so it can be tested without a network.
 *
 * An explicit choice is honoured strictly, if you pinned "on my machine" and
 * Ollama isn't running, you get an error telling you so, NOT a silent fallback
 * that ships your client's transcript to a server you deliberately opted out
 * of. Falling back quietly there would be the single worst bug this tool could
 * have. `auto` is the only mode allowed to substitute, and it prefers local.
 */
export function decideProvider(
  choice: ProviderChoice,
  localUsable: boolean,
  serverConfigured: boolean,
): ResolvedProvider {
  if (choice === "local") return localUsable ? "local" : "none";
  if (choice === "server") return serverConfigured ? "server" : "none";
  if (localUsable) return "local";
  return serverConfigured ? "server" : "none";
}

/* ── Dispatch ─────────────────────────────────────────────────────────────── */

export interface RunAnalysisOptions {
  provider: ResolvedProvider;
  localModel: string;
  video: VideoAsset;
  segments: Segment[];
  frames: CapturedFrame[];
  priorFindings?: PriorFindingRef[];
  projectContext?: string;
  onProgress?: (note: string) => void;
  signal?: AbortSignal;
}

/** Run the analysis on whichever provider was resolved. */
export async function runAnalysis(options: RunAnalysisOptions): Promise<AnalysisResult> {
  if (options.provider === "local") {
    return analyzeLocally({
      video: options.video,
      segments: options.segments,
      frames: options.frames,
      model: options.localModel,
      host: getOllamaHost(),
      priorFindings: options.priorFindings,
      projectContext: options.projectContext,
      onProgress: options.onProgress,
      signal: options.signal,
    });
  }

  if (options.provider === "server") {
    const { analyzeVideo } = await import("./analyze");
    options.onProgress?.("Sending transcript and screenshots for analysis…");
    return analyzeVideo({
      video: options.video,
      segments: options.segments,
      frames: options.frames,
      priorFindings: options.priorFindings,
      projectContext: options.projectContext,
      signal: options.signal,
    });
  }

  throw new Error(
    "No analysis provider is available. Install Ollama to analyse on your own machine, or use a server that has analysis configured.",
  );
}

/** One line describing what will happen, for the pipeline view. */
export function describeProvider(capability: ProviderCapability): string {
  switch (capability.resolved) {
    case "local":
      return `${capability.localModel} on your machine, nothing leaves your device`;
    case "server":
      return capability.serverFreeTier
        ? `${capability.serverModel} on a shared free tier: transcript and screenshots are sent, then discarded`
        : `${capability.serverModel || "a hosted model"}: transcript and screenshots are sent, then discarded`;
    default:
      return "No analysis provider available";
  }
}
