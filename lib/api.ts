import { API } from "@/config/constants";

/**
 * Client for the ephemeral server-conversion endpoints (LibreOffice-backed).
 * The server processes the upload in a temp dir and DELETES it immediately after
 * streaming the result back: nothing is stored. Used only by the two tools that
 * genuinely need server fidelity (pdf-to-word, word-to-pdf); everything else is
 * 100% client-side. Callers should catch failures and fall back to the
 * in-browser path so the tool still works if the API is unavailable.
 */
export type ConvertEndpoint = "pdf-to-word" | "word-to-pdf";

/**
 * True only when the backend runs the LibreOffice converter
 * (NEXT_PUBLIC_SERVER_CONVERT=true). Off by default, so a file is never sent
 * to a server that cannot convert it: the tools go straight to the browser path.
 */
export const SERVER_CONVERT_ENABLED = process.env.NEXT_PUBLIC_SERVER_CONVERT === "true";

export async function convertOnServer(
  file: File,
  endpoint: ConvertEndpoint,
  opts?: { signal?: AbortSignal },
): Promise<Blob> {
  if (!SERVER_CONVERT_ENABLED) throw new Error("Server conversion is not enabled on this site.");
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await fetch(`${API.baseUrl}/convert/${endpoint}`, {
    method: "POST",
    body: form,
    signal: opts?.signal,
    headers: { Accept: "application/octet-stream" },
  });

  if (!res.ok) {
    let detail = `Server conversion failed (${res.status}).`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) detail = data.detail;
    } catch {
      /* non-JSON error body: keep the generic message */
    }
    throw new Error(detail);
  }

  return res.blob();
}

/** True when a server conversion endpoint is configured/reachable-ish. */
export function serverConversionConfigured(): boolean {
  return Boolean(API.baseUrl);
}

/**
 * Ephemeral same-origin fetch proxy (`/api/fetch` → nginx → local service).
 * Lets browser tools read public URLs (sitemaps, article pages) that CORS
 * would otherwise block. Nothing is stored server-side, request → stream →
 * forget, same doctrine as the document converters. Throws with a readable
 * message on any failure, including when the proxy isn't deployed.
 */
export async function proxyFetchText(url: string, timeoutMs = 15000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`/api/fetch?url=${encodeURIComponent(url)}`, {
      signal: ctrl.signal,
      headers: { Accept: "text/html,application/xml,text/plain,*/*" },
    });
    if (!res.ok) {
      let detail = `Could not fetch that URL (${res.status}).`;
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) detail = data.error;
      } catch { /* keep generic */ }
      throw new Error(detail);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}
