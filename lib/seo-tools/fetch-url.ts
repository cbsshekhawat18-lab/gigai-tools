/**
 * GigAI SEO tools, shared URL fetch (via the edge proxy).
 *
 * Browsers can't fetch another site's HTML/headers (CORS), so a server-side
 * proxy does it. Two exist, and this module hides the difference:
 *
 *  1. The JSON proxy (`NEXT_PUBLIC_INSPECTOR_PROXY`, e.g. `/api/social-fetch`)
 *     returns `{html, headers, status, finalUrl}`. Response headers are what
 *     let the AI crawler checker detect Cloudflare, so this one is preferred.
 *  2. The plain-text proxy (`/api/fetch`) returns the raw body only. It is what
 *     is actually deployed on gigai.tools today, so it is the fallback that
 *     keeps URL mode working rather than leaving every tool paste-only.
 *
 * Both are stateless: they fetch, return, and store nothing.
 *
 * When a fetch came from the text proxy, `headersAvailable` is false and
 * `headers` is empty. Callers MUST NOT report "no Cloudflare detected" from an
 * empty header map; say the check was unavailable instead.
 */

const JSON_PROXY = process.env.NEXT_PUBLIC_INSPECTOR_PROXY;
/** Same-origin plain-text proxy that is deployed in production. */
const TEXT_PROXY = "/api/fetch";

/** True when live URL fetching is available by either route. */
export function urlFetchEnabled(): boolean {
  return Boolean(JSON_PROXY) || typeof window !== "undefined";
}

/** What a fetch returns, whichever proxy served it. */
export interface FetchedPage {
  /** The page's HTML (or the raw body, for robots.txt / sitemap fetches). */
  html: string;
  /** Selected response headers (lower-cased). Empty when `headersAvailable` is false. */
  headers: Record<string, string>;
  /** Final HTTP status. 200 is assumed when the text proxy served the body. */
  status: number;
  /** URL after redirects (the requested URL when the text proxy served it). */
  finalUrl: string;
  /**
   * False when the body came from the plain-text proxy, which cannot expose
   * response headers. Header-derived checks must be reported as unavailable,
   * never as negative.
   */
  headersAvailable: boolean;
}

/** Normalise a user-typed URL: add https:// when the scheme is missing. */
export function normalizeUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/** Fetch through the JSON proxy. Returns null when that proxy isn't deployed. */
async function fetchViaJsonProxy(clean: string): Promise<FetchedPage | null> {
  if (!JSON_PROXY) return null;
  let res: Response;
  try {
    res = await fetch(`${JSON_PROXY}?url=${encodeURIComponent(clean)}`, {
      headers: { Accept: "application/json", "X-GigAI-Inspector": "1" },
    });
  } catch {
    return null;
  }
  // 404 means the endpoint isn't on this deployment: fall back rather than fail.
  if (res.status === 404) return null;
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; html?: string; headers?: Record<string, string>; status?: number; finalUrl?: string; error?: string }
    | null;
  if (!res.ok || !data || data.ok === false || typeof data.html !== "string" || !data.html) {
    throw new Error(data?.error || `Couldn't fetch that URL (${res.status}). The site may block automated requests.`);
  }
  return {
    html: data.html,
    headers: data.headers ?? {},
    status: data.status ?? 200,
    finalUrl: data.finalUrl ?? clean,
    headersAvailable: true,
  };
}

/** Fetch through the plain-text proxy. Body only, no headers. */
async function fetchViaTextProxy(clean: string): Promise<FetchedPage> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`${TEXT_PROXY}?url=${encodeURIComponent(clean)}`, {
      signal: ctrl.signal,
      headers: { Accept: "text/html,application/xml,text/plain,*/*" },
    });
    if (!res.ok) {
      let detail =
        res.status === 404
          ? "Live URL fetching isn't enabled on this deployment. Paste the content below instead. Every check works on pasted input."
          : `Couldn't fetch that URL (${res.status}). The site may block automated requests.`;
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) detail = data.error;
      } catch {
        /* keep the generic message */
      }
      throw new Error(detail);
    }
    const html = await res.text();
    if (!html) throw new Error("That URL returned an empty response.");
    return { html, headers: {}, status: 200, finalUrl: clean, headersAvailable: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch a page through whichever proxy is available, preferring the JSON one
 * so response headers survive. Throws a readable Error on failure so callers
 * can show it and offer paste instead.
 */
export async function fetchPage(url: string): Promise<FetchedPage> {
  const clean = normalizeUrl(url);
  if (!/^https?:\/\/.+/i.test(clean)) throw new Error("Enter a full URL, e.g. https://example.com/page");
  const viaJson = await fetchViaJsonProxy(clean);
  if (viaJson) return viaJson;
  return fetchViaTextProxy(clean);
}

/** Build a raw "Name: value" header block (for tools whose input is headers). */
export function headersToText(status: number, headers: Record<string, string>): string {
  const lines: string[] = [];
  if (status) lines.push(`HTTP/1.1 ${status}`);
  for (const [k, v] of Object.entries(headers)) lines.push(`${k}: ${v}`);
  return lines.join("\n");
}
