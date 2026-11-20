/**
 * Gigai Social Fetch — self-hosted Node port of worker.js, for your own server.
 *
 * Same contract as the Cloudflare Worker (JSON: ok/status/finalUrl/redirected/
 * headers/html), same privacy posture (stateless: fetch → return → discard,
 * nothing logged, nothing stored), same abuse guards — plus two hardenings the
 * edge version could not do:
 *   • DNS results are checked against private ranges (anti-rebinding), not
 *     just the hostname string.
 *   • Redirects are followed manually (max 5) and EVERY hop is re-validated,
 *     so a public page can't bounce the proxy into a private address.
 *
 * Runs on 127.0.0.1:$PORT (default 8787) behind a reverse proxy that maps
 * /api/social-fetch to it. Requires Node 18+ (global fetch).
 */
import http from "node:http";
import { lookup } from "node:dns/promises";

const PORT = Number(process.env.PORT) || 8787;
const HOST = "127.0.0.1";
const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 12000;
const MAX_REDIRECTS = 5;

const ALLOWED_ORIGINS = new Set([
  "https://gigai.tools",
  "http://localhost:3000",
]);
const SITE_PREFIX = "https://gigai.tools";

const HEADER_ALLOWLIST = [
  "content-type", "cache-control", "etag", "expires", "last-modified",
  "server", "content-encoding", "content-length", "age", "vary",
  "x-cache", "cf-cache-status",
  "content-security-policy", "strict-transport-security",
  "x-frame-options", "x-content-type-options", "referrer-policy",
];

function blockedHostname(hostname) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
  if (h === "0.0.0.0" || h === "::1" || h === "::") return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true; // link-local + cloud metadata
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (/^fc00:/i.test(h) || /^fd/i.test(h) || /^fe80:/i.test(h)) return true;
  return false;
}

function blockedIp(addr) {
  const a = addr.toLowerCase();
  if (a === "::1" || a === "::" || a === "0.0.0.0") return true;
  if (/^127\./.test(a) || /^10\./.test(a) || /^192\.168\./.test(a) || /^169\.254\./.test(a)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(a)) return true;
  if (/^fc/.test(a) || /^fd/.test(a) || /^fe80:/.test(a)) return true;
  if (/^::ffff:/.test(a)) return blockedIp(a.slice(7)); // v4-mapped v6
  return false;
}

/** Reject hosts whose DNS answers include any private/link-local address. */
async function assertPublicHost(hostname) {
  if (blockedHostname(hostname)) throw new Error("That host isn't allowed");
  // Literal IPs never hit DNS; the string checks above already covered them.
  if (/^[0-9.]+$/.test(hostname) || hostname.includes(":")) return;
  let answers;
  try {
    answers = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("That host could not be resolved");
  }
  for (const { address } of answers) {
    if (blockedIp(address)) throw new Error("That host isn't allowed");
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : SITE_PREFIX,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function send(res, status, body, cors) {
  res.writeHead(status, cors);
  res.end(JSON.stringify(body));
}

async function readCapped(body, max) {
  if (!body) return new Uint8Array(0);
  const reader = body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      chunks.push(value.subarray(0, value.byteLength - (total - max)));
      reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(Math.min(total, max));
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.byteLength; }
  return out;
}

/** Follow redirects by hand so every hop passes the SSRF checks. */
async function guardedFetch(startUrl, signal) {
  let url = new URL(startUrl);
  let redirected = false;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertPublicHost(url.hostname);
    const res = await fetch(url.toString(), {
      method: "GET",
      redirect: "manual",
      signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GigaiSocialInspector/1.0; +https://gigai.tools/social-share-inspector)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { res, finalUrl: url.toString(), redirected };
      res.body?.cancel?.().catch(() => {});
      url = new URL(loc, url);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Redirected to an unsupported protocol");
      }
      redirected = true;
      continue;
    }
    return { res, finalUrl: url.toString(), redirected };
  }
  throw new Error("Too many redirects");
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") { res.writeHead(204, cors); res.end(); return; }
  if (req.method !== "GET") return send(res, 405, { ok: false, error: "Method not allowed" }, cors);

  const referer = req.headers.referer || "";
  if (!ALLOWED_ORIGINS.has(origin) && !referer.startsWith(SITE_PREFIX)) {
    return send(res, 403, { ok: false, error: "Forbidden" }, cors);
  }

  const target = new URL(req.url, "http://x").searchParams.get("url");
  if (!target) return send(res, 400, { ok: false, error: "Missing ?url" }, cors);

  let parsed;
  try { parsed = new URL(target); } catch { return send(res, 400, { ok: false, error: "Invalid URL" }, cors); }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return send(res, 400, { ok: false, error: "Only http/https URLs are supported" }, cors);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const { res: upstream, finalUrl, redirected } = await guardedFetch(parsed.toString(), controller.signal);
    const buf = await readCapped(upstream.body, MAX_BYTES);
    const html = new TextDecoder("utf-8").decode(buf);
    const headers = {};
    for (const name of HEADER_ALLOWLIST) {
      const v = upstream.headers.get(name);
      if (v) headers[name] = v;
    }
    send(res, 200, { ok: true, status: upstream.status, finalUrl, redirected, headers, html }, cors);
  } catch (err) {
    const msg = err && err.name === "AbortError"
      ? "The site didn't respond (timeout or blocked)."
      : (err instanceof Error && err.message) || "Fetch failed";
    send(res, 502, { ok: false, error: msg }, cors);
  } finally {
    clearTimeout(timer);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`gigai-social-fetch listening on http://${HOST}:${PORT}`);
});
