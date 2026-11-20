/**
 * Shared SSRF fence: used by the import/url fetcher AND the Site Audit
 * crawler. Both fetch user-supplied URLs from a box that hosts Postgres
 * and the cloud metadata endpoint - one guard, one set of tests.
 */

import { lookup } from "node:dns/promises";
import net from "node:net";

import { EngineError } from "./engines.mjs";

/**
 * SSRF fence for import/url. This process runs beside Postgres, the API
 * itself, and the cloud metadata endpoint - a fetch must never reach any of
 * them. Every hostname is resolved and every resolved address must be
 * public, re-checked on every redirect hop. (A determined DNS-rebinding
 * attacker could still race resolve-vs-connect; pinning the socket would
 * close that and is deliberately out of scope at this tier.)
 */
export function isPublicIp(ip) {
  const kind = net.isIP(ip);
  if (kind === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 169 && b === 254) return false; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
    if (a >= 224) return false; // multicast + reserved
    return true;
  }
  if (kind === 6) {
    const low = ip.toLowerCase();
    if (low === "::" || low === "::1") return false;
    if (low.startsWith("fe80") || low.startsWith("fc") || low.startsWith("fd")) return false;
    if (low.startsWith("::ffff:")) return isPublicIp(low.slice(7)); // v4-mapped
    return true;
  }
  return false;
}

export async function assertPublicHost(rawUrl) {
  let host;
  try {
    host = new URL(rawUrl).hostname.replace(/^\[|\]$/g, "");
  } catch {
    throw new EngineError("download_blocked", "The import URL is not a valid URL.");
  }
  const addrs = net.isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true, verbatim: true }).catch(() => []);
  if (!addrs.length || !addrs.every((a) => isPublicIp(a.address))) {
    throw new EngineError("download_blocked",
      "URLs that resolve to private or internal addresses are not fetched.");
  }
}

