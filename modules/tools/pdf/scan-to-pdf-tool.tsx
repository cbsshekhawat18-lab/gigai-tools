"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { imagesToPdf } from "@/lib/pdf/convert";
import { downloadBlob, formatBytes } from "@/lib/pdf/core";
import { toPdfInput } from "@/lib/pdf/types";
import { Button } from "@/components/ui/button";
import type { ImageToolProps } from "@/components/tool/types";

interface Shot {
  id: string;
  file: File;
  url: string;
}

let shotId = 0;

/**
 * Scan to PDF: use the device camera as a document scanner.
 *
 * This is its own workspace rather than a `usePdfTool` file queue, because the
 * input is a live camera rather than dropped files. Everything still happens on
 * device: frames are captured to a canvas and assembled with the same
 * `imagesToPdf` engine JPG to PDF uses.
 *
 * Honest about what it is: it captures and assembles pages. It does not do
 * perspective correction or edge detection: claiming "auto-crop" and then
 * delivering a skewed photo would be worse than not offering it.
 */
export default function ScanToPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [shots, setShots] = React.useState<Shot[]>([]);
  const [live, setLive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ name: string; blob: Blob } | null>(null);

  const stop = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

  // Release the camera on unmount, leaving the light on after someone
  // navigates away is alarming and entirely avoidable.
  React.useEffect(() => stop, [stop]);

  const start = React.useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser doesn't provide camera access. You can still add photos from your device below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLive(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError"
          ? "Camera permission was declined. Allow it in your browser's address bar, or add photos from your device instead."
          : name === "NotFoundError"
            ? "No camera was found on this device. You can add photos from your device instead."
            : "The camera couldn't be started. You can add photos from your device instead.",
      );
      setLive(false);
    }
  }, []);

  const capture = React.useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const id = `shot-${++shotId}`;
        const file = new File([blob], `${id}.jpg`, { type: "image/jpeg" });
        setShots((prev) => [...prev, { id, file, url: URL.createObjectURL(blob) }]);
        setResult(null);
      },
      "image/jpeg",
      0.92,
    );
  }, []);

  const addFiles = React.useCallback((list: FileList | null) => {
    if (!list) return;
    const next: Shot[] = [];
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/")) continue;
      const id = `shot-${++shotId}`;
      next.push({ id, file, url: URL.createObjectURL(file) });
    }
    if (next.length) {
      setShots((prev) => [...prev, ...next]);
      setResult(null);
    }
  }, []);

  const remove = React.useCallback((id: string) => {
    setShots((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((s) => s.id !== id);
    });
    setResult(null);
  }, []);

  const build = React.useCallback(async () => {
    if (shots.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const out = await imagesToPdf(
        shots.map((s) => toPdfInput(s.file)),
        { pageSize: "A4", margin: 18, fileName: "scan-gigai.pdf" },
      );
      setResult({ name: out.name, blob: out.blob });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The PDF couldn't be assembled.");
    } finally {
      setBusy(false);
    }
  }, [shots]);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {/* ── Camera ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/40">
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn("block w-full", live ? "aspect-video object-cover" : "hidden")}
          />
          {!live ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
              <span className={cn("flex size-12 items-center justify-center rounded-xl", style.soft)}>
                <Icon name="Camera" size={24} className={style.text} />
              </span>
              <p className="text-sm text-muted-foreground">
                Point your camera at the page. Nothing is streamed anywhere: frames
                are captured and assembled on this device.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {live ? (
            <>
              <Button type="button" onClick={capture}>
                <Icon name="Camera" size={16} />
                Capture page
              </Button>
              <Button type="button" variant="outline" onClick={stop}>
                Stop camera
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => void start()}>
              <Icon name="Camera" size={16} />
              Start camera
            </Button>
          )}

          <Button type="button" variant="outline" asChild>
            <label className="cursor-pointer">
              <Icon name="ImagePlus" size={16} />
              Add photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </Button>
        </div>

        {error ? (
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
            <Icon name="TriangleAlert" size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            {error}
          </p>
        ) : null}
      </div>

      {/* ── Captured pages ─────────────────────────────────────────────── */}
      {shots.length > 0 ? (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">
            {shots.length} page{shots.length === 1 ? "" : "s"} captured
          </span>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {shots.map((shot, i) => (
              <li key={shot.id} className="group relative overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shot.url} alt={`Captured page ${i + 1}`} className="block aspect-[3/4] w-full object-cover" />
                <span
                  className={cn(
                    "absolute left-1 top-1 flex size-6 items-center justify-center rounded-md text-xs font-semibold",
                    style.solid,
                    "text-white",
                  )}
                >
                  {i + 1}
                </span>
                <button
                  type="button"
                  aria-label={`Remove page ${i + 1}`}
                  onClick={() => remove(shot.id)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-md bg-background/85 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Icon name="X" size={14} />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void build()} disabled={busy}>
              {busy ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : <Icon name="FileText" size={16} />}
              {busy ? "Building PDF…" : `Make PDF (${shots.length} page${shots.length === 1 ? "" : "s"})`}
            </Button>
            <button
              type="button"
              onClick={() => {
                shots.forEach((s) => URL.revokeObjectURL(s.url));
                setShots([]);
                setResult(null);
              }}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Result ─────────────────────────────────────────────────────── */}
      {result ? (
        <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4", style.border, style.soft)}>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon name="CircleCheck" size={16} className={style.text} />
            {result.name} · {formatBytes(result.blob.size)}
          </span>
          <Button type="button" onClick={() => downloadBlob(result.blob, result.name)}>
            <Icon name="Download" size={16} />
            Download PDF
          </Button>
        </div>
      ) : null}
    </div>
  );
}
