"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Max encoded length we'll place in the URL before refusing (browsers/servers choke past ~8k). */
const MAX_HASH_LENGTH = 6000;

/** Result of a copy-share-link attempt. */
export interface ShareResult {
  ok: boolean;
  /** Present when `ok`, the full shareable URL. */
  url?: string;
  /** Present when `!ok`, a human-readable reason. */
  error?: string;
}

/** base64url encode a UTF-8 string (no padding, URL-safe alphabet). */
export function encodeShare(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Inverse of {@link encodeShare}; returns null on malformed input. */
export function decodeShare(encoded: string): string | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Read the current `#s=…` payload from the location hash, if any. */
function readHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const s = params.get("s");
  if (!s) return null;
  return decodeShare(s);
}

/** Options for {@link useShareState}. */
export interface UseShareStateOptions {
  /** Called once on mount if a shared value was present in the URL hash. */
  onInit?: (value: string) => void;
}

/** Return shape of {@link useShareState}. */
export interface ShareState {
  /** Whether a value would fit in a share link (informational). */
  canShare: (value: string) => boolean;
  /** Encode `value` into `#s=…`, update the URL, and copy the link. */
  copyShareLink: (value: string) => Promise<ShareResult>;
  /** True for 1.5s after a successful copy, for button feedback. */
  justCopied: boolean;
  /** Non-null after a failed share, until the next attempt. */
  shareError: string | null;
}

/**
 * URL-based state sharing. Encodes an arbitrary string into a base64url payload
 * in the location hash (`#s=…`) and copies a deep link to the clipboard. Reads
 * any inbound shared value on mount (SSR-safe: window is only touched in an
 * effect). Large payloads are refused with a clear message rather than
 * producing a broken URL.
 *
 * For JSON state, `JSON.stringify` before passing in and `JSON.parse` in
 * `onInit`.
 */
export function useShareState({ onInit }: UseShareStateOptions = {}): ShareState {
  const [justCopied, setJustCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const onInitRef = useRef(onInit);
  onInitRef.current = onInit;

  useEffect(() => {
    const incoming = readHash();
    if (incoming !== null) onInitRef.current?.(incoming);
  }, []);

  useEffect(() => {
    if (!justCopied) return;
    const t = setTimeout(() => setJustCopied(false), 1500);
    return () => clearTimeout(t);
  }, [justCopied]);

  const canShare = useCallback(
    (value: string) => encodeShare(value).length <= MAX_HASH_LENGTH,
    [],
  );

  const copyShareLink = useCallback(
    async (value: string): Promise<ShareResult> => {
      const encoded = encodeShare(value);
      if (encoded.length > MAX_HASH_LENGTH) {
        const error =
          "Input is too large to share via link. Download or copy the content instead.";
        setShareError(error);
        return { ok: false, error };
      }

      const url = `${window.location.origin}${window.location.pathname}${window.location.search}#s=${encoded}`;
      try {
        history.replaceState(null, "", url);
        await navigator.clipboard.writeText(url);
        setShareError(null);
        setJustCopied(true);
        return { ok: true, url };
      } catch {
        const error =
          "Couldn't copy the link. The URL was updated: copy it from the address bar.";
        setShareError(error);
        return { ok: false, error, url };
      }
    },
    [],
  );

  return { canShare, copyShareLink, justCopied, shareError };
}
