import type { MetadataRoute } from "next";

import { SITE } from "@/config/constants";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-static";

// AI *training* crawlers we block outright. Search crawlers (Googlebot,
// Bingbot, Applebot, etc.) are NOT here; they stay fully allowed via the "*"
// rule so rankings are unaffected. Google-Extended / Applebot-Extended are the
// AI-training tokens, distinct from their search bots, so blocking them keeps
// search intact.
//
// Deliberately NOT blocked: these are answer-engine *citation* crawlers, not
// training corpora. They index pages in order to link them in AI answers, which
// is a real referral channel for "free online <tool>" queries, and blocking
// them only removes us from those answers:
//   OAI-SearchBot (ChatGPT Search index), ChatGPT-User (user-initiated fetch),
//   PerplexityBot, Claude-SearchBot, YouBot.
// The training-side tokens for the same vendors (GPTBot, ClaudeBot, CCBot)
// remain blocked below, so content is still kept out of model training.
// POLICY FLIP 2026-08-22 (specs/geo-strategy.md Phase 1): the assistants'
// crawlers are now a first-class referral channel and are explicitly ALLOWED -
// GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, meta-externalagent
// moved out of this list. Being citable by ChatGPT/Claude/Gemini answers is
// worth more to this site than keeping pages out of training corpora.
// Still blocked: pure scrapers with no answer/referral surface.
const BLOCKED_AI_BOTS = [
  "CCBot",
  "Amazonbot",
  "Bytespider",
  "Omgilibot",
  "Diffbot",
  "ImagesiftBot",
  "Timpibot",
];

// Explicitly allowed answer-engine and assistant crawlers. Named ALLOW rules
// make the policy legible even when a CDN injects its own robots content
// above ours (Cloudflare's managed section currently does exactly that - it
// must be switched off in the Cloudflare dashboard or its Disallow lines win
// for these agents).
const ALLOWED_AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Query result pages are thin/duplicative, and /workspace is a private
        // per-device dashboard; keep both out of the index.
        // `/*.txt$` blocks Next.js RSC payload files - a machine-readable
        // duplicate of every page (/about.txt, /blog.txt, 1,267 of them).
        // Googlebot was fetching ~20/day of pure duplicate content, spending
        // crawl budget that should go to real pages. Browsers ignore
        // robots.txt, so client-side navigation is unaffected.
        // The four real .txt endpoints are re-allowed below; a longer, more
        // specific rule wins, so ads.txt stays crawlable for AdSense.
        disallow: ["/search?", "/workspace", "/*.txt$"],
        allow: ["/", "/ads.txt", "/ai.txt", "/llms.txt", "/robots.txt"],
      },
      ...ALLOWED_AI_BOTS.map((userAgent) => ({ userAgent, allow: "/" as const })),
      ...BLOCKED_AI_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    host: SITE.url,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
