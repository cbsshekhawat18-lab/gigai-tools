import { execFileSync } from "node:child_process";

/**
 * Real `lastmod` dates for the sitemap.
 *
 * WHY THIS EXISTS: every sitemap entry used to carry `new Date()` — the build
 * timestamp — so each deploy told Google all ~770 URLs had just changed. Ship
 * ten builds in a week and Google is told the whole site changed ten times,
 * which is false. Google treats `lastmod` as a scheduling hint and discounts it
 * when it proves unreliable, and the constant "everything changed" churn pushed
 * pages back into re-evaluation, and index coverage fell during the period of
 * heaviest deploys (Aug 2026).
 *
 * The fix: date each URL from the last commit that touched the file it is
 * generated from. Unchanged content keeps a stable date across rebuilds, which
 * is exactly what the protocol expects.
 *
 * Sitemap generation runs in Node at build time (`force-static`), so git is
 * available here. Everything degrades safely: no git, no repo, or an untracked
 * file all fall back to BUILD_FALLBACK_DATE rather than throwing or silently
 * reintroducing `now`.
 */

/**
 * Used when git can't date a file (untracked, shallow clone, tarball deploy).
 * A fixed date, deliberately NOT `new Date()` — a wrong-but-stable date is far
 * better for crawl scheduling than a date that moves on every build. Bump it
 * when doing a genuine sitewide content pass.
 */
const BUILD_FALLBACK_DATE = new Date("2026-08-29T00:00:00Z");

/** repoPath -> ISO commit date, filled lazily on first use. */
let gitDates: Map<string, string> | null = null;

/**
 * One `git log` pass over the whole history, mapping each file to the date of
 * the most recent commit that touched it. Reading the log once is dramatically
 * cheaper than spawning git per URL.
 */
function loadGitDates(): Map<string, string> {
  const map = new Map<string, string>();
  try {
    const out = execFileSync(
      "git",
      ["log", "--no-merges", "--name-only", "--format=@@%cI", "-n", "4000"],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
    );
    let current = "";
    for (const line of out.split("\n")) {
      // "@@" prefixes each commit's date line; no file path starts with it.
      if (line.startsWith("@@")) {
        current = line.slice(2).trim();
        continue;
      }
      const file = line.trim();
      // First sighting wins: git log is newest-first, so that is the latest
      // commit touching this path.
      if (file && current && !map.has(file)) map.set(file, current);
    }
  } catch {
    /* git unavailable — every lookup falls back */
  }
  return map;
}

/**
 * Last-modified date for a repo-relative source path, e.g.
 * `gigai-tools/config/tools/pdf/merge-pdf.ts`. Accepts several candidate paths
 * and uses the newest match, for pages generated from more than one file.
 */
export function lastModifiedFor(...repoPaths: string[]): Date {
  if (!gitDates) gitDates = loadGitDates();
  let newest: string | null = null;
  for (const p of repoPaths) {
    const iso = gitDates.get(p) ?? gitDates.get(`gigai-tools/${p}`);
    if (iso && (!newest || iso > newest)) newest = iso;
  }
  return newest ? new Date(newest) : BUILD_FALLBACK_DATE;
}

/** Newest commit date across a whole directory prefix (e.g. all tool configs). */
export function lastModifiedForPrefix(prefix: string): Date {
  if (!gitDates) gitDates = loadGitDates();
  const withRepo = `gigai-tools/${prefix}`;
  let newest: string | null = null;
  for (const [file, iso] of gitDates) {
    if (file.startsWith(prefix) || file.startsWith(withRepo)) {
      if (!newest || iso > newest) newest = iso;
    }
  }
  return newest ? new Date(newest) : BUILD_FALLBACK_DATE;
}
