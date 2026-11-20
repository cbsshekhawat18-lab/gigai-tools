/**
 * Gigai Social Fetch — Cloudflare Worker edge proxy for the Social Share Inspector.
 *
 * Browsers can't fetch another site's HTML (cross-origin security). This Worker
 * does it at Cloudflare's edge: given ?url=<target>, it fetches the page
 * server-side and returns the HTML + the response headers the inspector needs
 * (so URL mode also lights up the cache / header / redirect checks).
 *
 * PRIVACY: stateless. It fetches, returns, and stores nothing — no logging of
 * content, no persistence. Matches the platform's "process → return → discard".
 *
 * SAFETY (it's an open-ish fetch endpoint, so it's guarded):
 *   • Only http/https targets.
 *   • Blocks localhost / private / link-local / cloud-metadata hosts (SSRF).
 *   • Only serves requests coming from the tools site (Origin/Referer check).
 *   • Caps response size (3 MB) and total time (12 s).
 */

const ALLOWED_ORIGINS = new Set([
  "https://gigai.tools",
  "http://localhost:3000",
]);
const SITE_PREFIX = "https://gigai.tools";
const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 12000;

/** Headers the inspector's cache / header analysis reads. */
const HEADER_ALLOWLIST = [
  "content-type", "cache-control", "etag", "expires", "last-modified",
  "server", "content-encoding", "content-length", "age", "vary",
  "x-cache", "cf-cache-status",
  "content-security-policy", "strict-transport-security",
  "x-frame-options", "x-content-type-options", "referrer-policy",
];

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405, cors);

    // Abuse guard: only serve the tools site.
    const referer = request.headers.get("Referer") || "";
    if (!ALLOWED_ORIGINS.has(origin) && !referer.startsWith(SITE_PREFIX)) {
      return json({ ok: false, error: "Forbidden" }, 403, cors);
    }

    const target = new URL(request.url).searchParams.get("url");
    if (!target) return json({ ok: false, error: "Missing ?url" }, 400, cors);

    let parsed;
    try { parsed = new URL(target); } catch { return json({ ok: false, error: "Invalid URL" }, 400, cors); }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return json({ ok: false, error: "Only http/https URLs are supported" }, 400, cors);
    }
    if (isBlockedHost(parsed.hostname)) {
      return json({ ok: false, error: "That host isn't allowed" }, 400, cors);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res;
    try {
      res = await fetch(parsed.toString(), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GigaiSocialInspector/1.0; +https://gigai.tools/social-share-inspector)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    } catch {
      clearTimeout(timer);
      return json({ ok: false, error: "The site didn't respond (timeout or blocked)." }, 502, cors);
    }
    clearTimeout(timer);

    // Read the body with a hard size cap.
    const buf = await readCapped(res.body, MAX_BYTES);
    const html = new TextDecoder("utf-8").decode(buf);

    const headers = {};
    for (const name of HEADER_ALLOWLIST) {
      const v = res.headers.get(name);
      if (v) headers[name] = v;
    }

    return json({
      ok: true,
      status: res.status,
      finalUrl: res.url,
      redirected: res.redirected,
      headers,
      html,
    }, 200, cors);
  },
};

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : SITE_PREFIX;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store",
  };
}

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
  if (h === "0.0.0.0" || h === "::1" || h === "::") return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true; // link-local + AWS/GCP metadata
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (/^fc00:/i.test(h) || /^fe80:/i.test(h)) return true; // IPv6 private/link-local
  return false;
}

async function readCapped(body, max) {
  if (!body) return new Uint8Array(0);
  const reader = body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (total + value.length > max) {
      chunks.push(value.subarray(0, max - total));
      total = max;
      try { await reader.cancel(); } catch { /* ignore */ }
      break;
    }
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}
