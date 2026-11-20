"use client";

/**
 * QR Studio, scanner / reader.
 *
 * Decode QR codes three ways: a live camera (getUserMedia + jsQR loop), an
 * uploaded/dragged/pasted image, or… nothing faked. All decoding runs in
 * `lib/qr/decode`; bytes never leave the browser. The decoded value is parsed
 * into a friendly view (URL, Wi-Fi, vCard, email, phone, geo, …) with copy and
 * "open" actions. Fully graceful when there's no camera or permission is denied.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { decodeFromFile, startCameraScan, type CameraScan } from "@/lib/qr/decode";
import { FileDropZone, Toolbar, ToolbarButton, ToolbarSpacer } from "@/components/tool/dev";

/* ────────────────────────── result parsing ────────────────────────── */

type ParsedKind = "url" | "wifi" | "vcard" | "email" | "phone" | "sms" | "geo" | "text";

interface ParsedResult {
  kind: ParsedKind;
  label: string;
  icon: string;
  /** A best-effort openable href (tel:, mailto:, https:, geo:) when relevant. */
  href?: string;
  /** Field breakdown for structured payloads. */
  fields?: Array<{ key: string; value: string }>;
}

/** Parse a decoded string into a friendly, typed view. */
function parseDecoded(text: string): ParsedResult {
  const upper = text.toUpperCase();

  if (upper.startsWith("WIFI:")) {
    const get = (k: string) => new RegExp(`(?:^|;)${k}:((?:[^;\\\\]|\\\\.)*)`).exec(text)?.[1]?.replace(/\\(.)/g, "$1") ?? "";
    return {
      kind: "wifi",
      label: "Wi-Fi network",
      icon: "Wifi",
      fields: [
        { key: "Network (SSID)", value: get("S") },
        { key: "Password", value: get("P") || "(none)" },
        { key: "Security", value: get("T") || "WPA" },
      ],
    };
  }
  if (upper.startsWith("BEGIN:VCARD")) {
    const line = (k: RegExp) => k.exec(text)?.[1]?.trim() ?? "";
    return {
      kind: "vcard",
      label: "Contact card",
      icon: "Contact",
      fields: [
        { key: "Name", value: line(/FN:(.+)/) },
        { key: "Phone", value: line(/TEL[^:]*:(.+)/) },
        { key: "Email", value: line(/EMAIL[^:]*:(.+)/) },
        { key: "Org", value: line(/ORG:(.+)/) },
      ].filter((f) => f.value),
    };
  }
  if (/^mailto:/i.test(text)) {
    const to = text.replace(/^mailto:/i, "").split("?")[0] ?? "";
    return { kind: "email", label: "Email address", icon: "Mail", href: text, fields: [{ key: "To", value: to }] };
  }
  if (/^tel:/i.test(text)) {
    return { kind: "phone", label: "Phone number", icon: "Phone", href: text, fields: [{ key: "Number", value: text.replace(/^tel:/i, "") }] };
  }
  if (/^smsto:/i.test(text) || /^sms:/i.test(text)) {
    const rest = text.replace(/^smsto:/i, "").replace(/^sms:/i, "");
    const [num, msg] = rest.split(/[:?]/, 2);
    return { kind: "sms", label: "SMS", icon: "MessageSquare", fields: [{ key: "Number", value: num ?? "" }, ...(msg ? [{ key: "Message", value: msg }] : [])] };
  }
  if (/^geo:/i.test(text)) {
    const coords = text.replace(/^geo:/i, "").split("?")[0] ?? "";
    return { kind: "geo", label: "Location", icon: "MapPin", href: `https://maps.google.com/?q=${encodeURIComponent(coords)}`, fields: [{ key: "Coordinates", value: coords }] };
  }
  if (/^https?:\/\//i.test(text) || /^upi:\/\//i.test(text) || /^[a-z]+:\/\//i.test(text)) {
    return { kind: "url", label: "Link", icon: "Link", href: /^https?:/i.test(text) ? text : undefined };
  }
  return { kind: "text", label: "Text", icon: "Type" };
}

/* ────────────────────────── component ────────────────────────── */

/** Props for {@link QRScanner}. */
export interface QRScannerProps {
  /** Optional callback whenever a code is decoded. */
  onResult?: (text: string) => void;
}

/** Camera + image + paste QR reader with a parsed, actionable result. */
export function QRScanner({ onResult }: QRScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scanRef = React.useRef<CameraScan | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const stopCamera = React.useCallback(() => {
    scanRef.current?.stop();
    scanRef.current = null;
    setScanning(false);
  }, []);

  // Always release the camera on unmount.
  React.useEffect(() => () => stopCamera(), [stopCamera]);

  const handleResult = React.useCallback(
    (text: string) => {
      setResult(text);
      setError(null);
      onResult?.(text);
    },
    [onResult],
  );

  const startCamera = React.useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);
    setResult(null);
    setScanning(true);
    try {
      scanRef.current = await startCameraScan(
        videoRef.current,
        (text) => {
          handleResult(text);
          stopCamera();
        },
        {
          once: true,
          onError: (message) => {
            setError(message);
            setScanning(false);
          },
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the camera.");
      setScanning(false);
    }
  }, [handleResult, stopCamera]);

  const onFiles = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError(null);
      const res = await decodeFromFile(file);
      if (res.ok) {
        handleResult(res.text);
      } else {
        setError(res.error.message);
        setResult(null);
      }
    },
    [handleResult],
  );

  const copy = React.useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Couldn't access the clipboard.");
    }
  }, [result]);

  const parsed = result ? parseDecoded(result) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Camera stage */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-neutral-950">
        <video ref={videoRef} className={cn("aspect-video w-full object-cover", !scanning && "hidden")} muted playsInline />
        {scanning && (
          <>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="h-40 w-40 rounded-lg border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
            <button
              type="button"
              onClick={stopCamera}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-sm font-medium text-white outline-none backdrop-blur hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white"
            >
              <Icon name="X" size={13} /> Stop
            </button>
          </>
        )}
        {!scanning && (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 text-center">
            <Icon name="ScanLine" size={40} className="text-white/40" />
            <button
              type="button"
              onClick={() => void startCamera()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="Camera" size={16} /> Scan with camera
            </button>
            <p className="text-sm text-white/50">Point your camera at a QR code; nothing is uploaded.</p>
          </div>
        )}
      </div>

      {/* Or upload */}
      <FileDropZone onFiles={(f) => void onFiles(f)} accept="image/*" icon="ImageUp" label="Or drop / paste a QR image, or click to browse" hint="PNG, JPG, WEBP, GIF" />

      {error && (
        <p role="alert" className="flex items-start gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      {/* Result */}
      {parsed && result && (
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <Icon name={parsed.icon} size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">{parsed.label}</span>
            <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">Decoded ✓</span>
          </div>
          <div className="flex flex-col gap-3 p-3">
            {parsed.fields && parsed.fields.length > 0 && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                {parsed.fields.map((f) => (
                  <React.Fragment key={f.key}>
                    <dt className="text-muted-foreground">{f.key}</dt>
                    <dd className="min-w-0 break-words font-medium text-foreground">{f.value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/40 p-2.5 font-mono text-sm text-foreground">{result}</pre>
            <Toolbar>
              <ToolbarButton icon={copied ? "Check" : "Copy"} label={copied ? "Copied!" : "Copy value"} variant={copied ? "active" : "default"} onClick={() => void copy()} />
              {parsed.href && (
                <a
                  href={parsed.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="ExternalLink" size={16} /> Open
                </a>
              )}
              <ToolbarSpacer />
              <button type="button" onClick={() => setResult(null)} className="px-2 text-sm text-muted-foreground hover:text-foreground">
                Scan another
              </button>
            </Toolbar>
          </div>
        </div>
      )}
    </div>
  );
}
