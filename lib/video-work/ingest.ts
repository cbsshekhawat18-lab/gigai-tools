/**
 * Video → Work: input validation and URL ingestion.
 *
 * Two ways in: a local file, or a share link.
 *
 * FILES never leave the device. They are decoded by the browser's own video
 * element, so whatever the browser can play, this can analyse.
 *
 * LINKS have to be retrieved server-side, and it is worth being precise about
 * why. A Loom or YouTube page cannot be read from a browser: the media sits
 * behind CORS and a signed manifest, so `fetch()` on a share link fails in a
 * way no amount of client code can fix. So the server does that one step -
 * downloads the recording to a temp directory, streams it straight back to the
 * browser, and deletes it as the response finishes. From the moment the file
 * arrives, the flow is identical to an upload: transcription, frame selection
 * and playback are all local.
 *
 * The server is asked whether fetching is available before the field offers it.
 * If yt-dlp isn't installed or fetching is switched off, the URL input says so
 * and points at the workaround that always works, rather than accepting a link
 * it cannot retrieve and failing later.
 */

import { API } from "@/config/constants";

import type { ProviderId } from "./types";

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  /** True when the server can retrieve this kind of link. */
  fetchable: boolean;
  /** Shown under the URL field once a provider is recognised. */
  note: string;
}

const PROVIDERS: Record<ProviderId, Omit<ProviderInfo, "id">> = {
  loom: {
    label: "Loom",
    fetchable: true,
    note: "The recording is fetched on our server and sent straight to your browser, then deleted. Private Looms can't be fetched, share the link publicly, or download the MP4 and add it here.",
  },
  youtube: {
    label: "YouTube",
    fetchable: true,
    // Verified in production: YouTube bot-gates datacenter IPs, so this
    // usually fails from any hosted server. Say so before the click rather
    // than after the error.
    note: "YouTube usually blocks downloads from servers, so this often won't work, you'll get a clear message if it doesn't. Downloading the video and adding the file always works.",
  },
  vimeo: {
    label: "Vimeo",
    fetchable: true,
    note: "Vimeo often refuses server-side downloads, so this may not work. If it doesn't, download the video and add the file instead.",
  },
  direct: {
    label: "Direct video link",
    fetchable: true,
    note: "Fetched on our server and passed to your browser, then deleted.",
  },
  unknown: {
    label: "Unrecognised link",
    fetchable: false,
    note: "That doesn't look like a video link. Paste a Loom, YouTube, Vimeo or direct video URL, or add the file itself.",
  },
};

/** Extensions that indicate a link points straight at a media file. */
const DIRECT_MEDIA = /\.(mp4|mov|webm|mkv|avi|m4v|mpe?g|mp3|wav|m4a|aac|ogg|flac)(\?|#|$)/i;

export interface UrlCheck {
  valid: boolean;
  provider: ProviderInfo;
  /**
   * The absolute form of the input, e.g. "loom.com/share/x" →
   * "https://loom.com/share/x". Always send THIS to the server: its parser
   * requires an explicit scheme and would reject the bare host the user typed.
   */
  normalized: string;
  /** Present when the URL is malformed rather than merely unfetchable. */
  error?: string;
}

/**
 * Identify a pasted URL. Never throws. A bad paste is a UI state, not an
 * exception.
 */
export function inspectUrl(raw: string): UrlCheck {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, provider: info("unknown"), normalized: "", error: "Paste a link first." };
  }

  // Only assume https when the input carries no scheme at all. Prepending it
  // unconditionally turns "ftp://host/a.mp4" into "https://ftp://host/a.mp4",
  // which parses cleanly as an https URL with the host "ftp", so a scheme we
  // mean to reject would sail through as valid.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  if (hasScheme && !/^https?:\/\//i.test(trimmed)) {
    return {
      valid: false,
      provider: info("unknown"),
      normalized: "",
      error: "Only http and https links are supported.",
    };
  }

  let url: URL;
  try {
    // Accept "loom.com/share/..." as readily as a full URL.
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return { valid: false, provider: info("unknown"), normalized: "", error: "That isn't a valid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      valid: false,
      provider: info("unknown"),
      normalized: "",
      error: "Only http and https links are supported.",
    };
  }

  return { valid: true, provider: info(detectProvider(url)), normalized: url.href };
}

/** Which service a URL belongs to, by host and path shape. */
export function detectProvider(url: URL): ProviderId {
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();

  if (host === "loom.com" || host.endsWith(".loom.com")) return "loom";
  if (
    host === "youtube.com" ||
    host.endsWith(".youtube.com") ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  ) {
    return "youtube";
  }
  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return "vimeo";
  // Awesome Screenshot and similar share hosts serve the file directly.
  if (DIRECT_MEDIA.test(url.pathname)) return "direct";
  if (host === "awesomescreenshot.com" || host.endsWith(".awesomescreenshot.com")) {
    return "direct";
  }
  return "unknown";
}

function info(id: ProviderId): ProviderInfo {
  return { id, ...PROVIDERS[id] };
}

/* ── Server-side retrieval ────────────────────────────────────────────────── */

export interface ResolvedUrl {
  title: string;
  durationMs: number;
  /** Which extractor matched, "Loom", "Youtube", "Vimeo", "generic". */
  extractor: string;
  /** Best-effort size estimate in bytes; 0 when the source doesn't report one. */
  approxBytes: number;
  isLive: boolean;
}

/**
 * Ask the server what a link is, without downloading it.
 *
 * Cheap enough to run the moment a URL is pasted, and it is where the failures
 * worth catching early surface: a private Loom, an expired share link, a live
 * stream, or a recording longer than the fetch limit. Showing the real title
 * and duration before the download also means the user can tell at a glance
 * that they pasted the right link.
 */
export async function resolveUrl(url: string, signal?: AbortSignal): Promise<ResolvedUrl> {
  const res = await postJson("/video-work/resolve", { url }, signal);
  const data = (await res.json()) as {
    title: string;
    duration_seconds: number;
    extractor: string;
    approx_bytes: number;
    is_live: boolean;
  };
  return {
    title: data.title,
    durationMs: Math.max(0, Math.round(data.duration_seconds * 1000)),
    extractor: data.extractor,
    approxBytes: data.approx_bytes,
    isLive: data.is_live,
  };
}

/**
 * Retrieve the recording and hand back a real `File`.
 *
 * Progress is read from the response stream, so the bar reflects bytes actually
 * received rather than a timer. When the server doesn't send a Content-Length
 * (common for a streamed download) `received` still ticks up and `total` stays
 * null; the UI shows an indeterminate state instead of inventing a percentage.
 */
export async function fetchUrlAsFile(
  url: string,
  options: {
    onProgress?: (received: number, total: number | null) => void;
    signal?: AbortSignal;
  } = {},
): Promise<File> {
  const res = await postJson("/video-work/fetch", { url }, options.signal);

  const header = res.headers.get("Content-Length");
  const total = header ? Number(header) || null : null;
  const filename = filenameFrom(res.headers.get("Content-Disposition")) ?? "recording.mp4";

  // Without a readable stream there is no progress to report, take the blob.
  if (!res.body) {
    return new File([await res.blob()], filename, { type: "video/mp4" });
  }

  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value as unknown as BlobPart);
      received += value.byteLength;
      options.onProgress?.(received, total);
    }
  }

  const blob = new Blob(chunks, { type: "video/mp4" });
  if (blob.size === 0) {
    throw new Error("The fetched recording was empty. Try downloading it and adding the file.");
  }
  return new File([blob], filename, { type: "video/mp4" });
}

async function postJson(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API.baseUrl}${path}`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new Error(
      "Couldn't reach the server to fetch that link. Download the recording and add the file instead.",
    );
  }

  if (!res.ok) {
    // The API's error messages are written for users, so surface them verbatim.
    let detail = `That link couldn't be fetched (${res.status}).`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) detail = data.detail;
    } catch {
      /* non-JSON body: keep the generic message */
    }
    throw new Error(detail);
  }
  return res;
}

/** Pull the server's suggested filename out of Content-Disposition. */
function filenameFrom(header: string | null): string | undefined {
  if (!header) return undefined;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      /* fall through to the plain form */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1];
}

/* ── Files ────────────────────────────────────────────────────────────────── */

/** Container formats a browser can decode, plus audio-only recordings. */
export const ACCEPTED_MEDIA =
  ".mp4,.mov,.webm,.mkv,.avi,.m4v,.mpeg,.mpg,.mp3,.wav,.m4a,.aac,.ogg,.flac,video/*,audio/*";

const MEDIA_EXT = /\.(mp4|mov|webm|mkv|avi|m4v|mpe?g|mp3|wav|m4a|aac|ogg|flac)$/i;

/**
 * Videos above this warn before starting. Not a hard block, a long recording
 * still works, it just takes proportionally longer to transcribe on-device.
 */
export const LARGE_FILE_MB = 750;

/** Past this, local transcription stops being a reasonable wait. */
export const LONG_VIDEO_MS = 45 * 60 * 1000;

export interface FileCheck {
  ok: boolean;
  /** Blocking problem, the file cannot be used at all. */
  error?: string;
  /** Non-blocking caution shown before the user commits to a long job. */
  warning?: string;
}

export function inspectFile(file: File): FileCheck {
  const looksLikeMedia =
    file.type.startsWith("video/") || file.type.startsWith("audio/") || MEDIA_EXT.test(file.name);

  if (!looksLikeMedia) {
    return { ok: false, error: `“${file.name}” doesn't look like a video or audio file.` };
  }
  if (file.size === 0) {
    return { ok: false, error: `“${file.name}” is empty.` };
  }

  const megabytes = file.size / (1024 * 1024);
  if (megabytes > LARGE_FILE_MB) {
    return {
      ok: true,
      warning: `That's a ${Math.round(megabytes)}MB file. It will work, but decoding and transcribing it in your browser will take a while, trimming to the part that matters is usually faster.`,
    };
  }
  return { ok: true };
}

/**
 * Read duration and a poster frame with a native `<video>`. No ffmpeg, so it
 * returns almost instantly and works for audio-only files too (poster is null).
 */
export async function probeMedia(
  objectUrl: string,
): Promise<{ durationMs: number; posterDataUrl?: string; hasVideo: boolean }> {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () =>
      reject(
        new Error(
          "Your browser couldn't decode that file. Converting it to MP4 or WebM usually fixes it.",
        ),
      );
  });

  const durationMs = Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : 0;
  const hasVideo = video.videoWidth > 0 && video.videoHeight > 0;
  if (!hasVideo) return { durationMs, hasVideo };

  // Grab a frame a little in: the first frame of a screen recording is very
  // often a blank desktop or a fade-in.
  const posterDataUrl = await captureAt(video, Math.min(2, (durationMs / 1000) * 0.1));
  return { durationMs, posterDataUrl, hasVideo };
}

async function captureAt(video: HTMLVideoElement, seconds: number): Promise<string | undefined> {
  try {
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("seek failed"));
      // Same hang guard as lib/video-intel/frames.ts: a missed `seeked` event
      // must never wedge ingestion over a poster image.
      window.setTimeout(() => resolve(), 5000);
      video.currentTime = seconds;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = Math.round((video.videoHeight / video.videoWidth) * 480) || 270;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    // A poster is a nicety; never fail ingestion over one.
    return undefined;
  }
}
