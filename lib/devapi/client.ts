"use client";

/**
 * Browser client for the developer-API account endpoints (/v1 on this
 * origin). Session JWT lives in localStorage - dashboard convenience, not a
 * security boundary: the token is scoped to account management and expires
 * in 12 hours.
 */

const BASE = "/v1";
const KEY = "gigai-dev-session";

export function getSession(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setSession(token: string | null): void {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked */
  }
}

export interface ApiError {
  code: string;
  message: string;
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  // A FormData body must NOT get a JSON content-type: the browser sets the
  // multipart boundary itself (used by the poster image uploads).
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers: Record<string, string> = isForm ? {} : { "Content-Type": "application/json" };
  const token = auth ? getSession() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...init.headers } });
    if (res.status === 204) return { ok: true, data: undefined as T };
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const err = (body?.detail?.error ?? body?.error) as ApiError | undefined;
      return { ok: false, error: err ?? { code: "unknown", message: `Request failed (${res.status}).` } };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: { code: "network", message: "Could not reach the API. Check your connection and retry." } };
  }
}
