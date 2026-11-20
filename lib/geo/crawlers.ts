/**
 * GigAI GEO engine: the AI crawler directory.
 *
 * One authoritative table of the crawlers and user-agent tokens that matter
 * for Generative Engine Optimization, shared by the crawler access checker,
 * the AI robots.txt generator, the log analyzer and the GEO audit. Keeping the
 * data in one place is the point: every tool quotes the same names, the same
 * roles and the same plain-language cost of blocking each bot.
 *
 * Pure data + tiny lookups. No network, no DOM.
 */

/** What a crawler's visits are used for. */
export type CrawlerRole =
  /** Fetches pages to train future models. */
  | "training"
  /** Builds/refreshes a retrieval index that AI answers cite from. */
  | "search-index"
  /** Fetches a page live because a user asked the assistant about it. */
  | "user-fetch"
  /** Not a crawler: a robots.txt token that controls how another bot's crawl may be used. */
  | "control-token";

export interface AiCrawler {
  /** Stable id, kebab-case. */
  id: string;
  /** The exact product token to match in robots.txt (also the display name). */
  token: string;
  /** Operator (company). */
  operator: string;
  role: CrawlerRole;
  /** One sentence: what this bot actually does. */
  does: string;
  /** Plain-language answer to "what does blocking this cost me?" */
  blockCost: string;
  /** Case-insensitive regex fragment that identifies this bot in an access-log user-agent string. */
  logPattern: RegExp;
  /** Official documentation URL. */
  docs: string;
  /**
   * True for the bots whose absence most hurts AI visibility, the checker
   * weighs these heaviest and the generator recommends allowing them.
   */
  keyForVisibility?: boolean;
}

export const AI_CRAWLERS: AiCrawler[] = [
  // ── OpenAI ────────────────────────────────────────────────────────────────
  {
    id: "gptbot",
    token: "GPTBot",
    operator: "OpenAI",
    role: "training",
    does: "Crawls pages as training data for future OpenAI models.",
    blockCost:
      "Future GPT models learn nothing from your site, so they are less likely to know and mention your brand unprompted. Does not affect ChatGPT Search results today.",
    logPattern: /GPTBot/i,
    docs: "https://platform.openai.com/docs/bots",
  },
  {
    id: "oai-searchbot",
    token: "OAI-SearchBot",
    operator: "OpenAI",
    role: "search-index",
    does: "Builds the index behind ChatGPT Search. Cited answers link back to your pages.",
    blockCost:
      "Your pages can't appear as linked sources in ChatGPT Search answers, that's lost referral traffic, not just lost training.",
    logPattern: /OAI-SearchBot/i,
    docs: "https://platform.openai.com/docs/bots",
    keyForVisibility: true,
  },
  {
    id: "chatgpt-user",
    token: "ChatGPT-User",
    operator: "OpenAI",
    role: "user-fetch",
    does: "Fetches a page live when a ChatGPT user asks about it or pastes your link.",
    blockCost:
      "When someone asks ChatGPT about your page, it can't read it and answers from stale memory, or says it can't access the site.",
    logPattern: /ChatGPT-User/i,
    docs: "https://platform.openai.com/docs/bots",
    keyForVisibility: true,
  },

  // ── Anthropic ─────────────────────────────────────────────────────────────
  {
    id: "claudebot",
    token: "ClaudeBot",
    operator: "Anthropic",
    role: "training",
    does: "Crawls pages as training data for future Claude models.",
    blockCost:
      "Future Claude models won't have learned from your content, so Claude is less likely to describe or recommend you from memory.",
    logPattern: /ClaudeBot/i,
    docs: "https://support.claude.com/en/articles/8896518",
  },
  {
    id: "claude-searchbot",
    token: "Claude-SearchBot",
    operator: "Anthropic",
    role: "search-index",
    does: "Indexes pages so Claude's web search can rank and cite them.",
    blockCost:
      "Claude's search can't surface your pages as citations, losing you a growing referral channel.",
    logPattern: /Claude-SearchBot/i,
    docs: "https://support.claude.com/en/articles/8896518",
    keyForVisibility: true,
  },
  {
    id: "claude-user",
    token: "Claude-User",
    operator: "Anthropic",
    role: "user-fetch",
    does: "Fetches a page live when a Claude user asks about it.",
    blockCost:
      "Claude can't open your links for users who share them, so it answers about your site without reading it.",
    logPattern: /Claude-User/i,
    docs: "https://support.claude.com/en/articles/8896518",
    keyForVisibility: true,
  },

  // ── Perplexity ────────────────────────────────────────────────────────────
  {
    id: "perplexitybot",
    token: "PerplexityBot",
    operator: "Perplexity",
    role: "search-index",
    does: "Indexes pages for Perplexity's answer engine. Sources are cited with links.",
    blockCost:
      "Perplexity stops citing your pages as sources. Perplexity is citation-first, so a block here is directly visible lost traffic.",
    logPattern: /PerplexityBot/i,
    docs: "https://docs.perplexity.ai/guides/bots",
    keyForVisibility: true,
  },
  {
    id: "perplexity-user",
    token: "Perplexity-User",
    operator: "Perplexity",
    role: "user-fetch",
    does: "Fetches a page live when a Perplexity user asks about that specific URL.",
    blockCost:
      "Perplexity can't read a page users explicitly point it at, and tells them so.",
    logPattern: /Perplexity-User/i,
    docs: "https://docs.perplexity.ai/guides/bots",
  },

  // ── Google ────────────────────────────────────────────────────────────────
  {
    id: "google-extended",
    token: "Google-Extended",
    operator: "Google",
    role: "control-token",
    does: "Not a crawler. A robots.txt token that controls whether Googlebot's existing crawl may be used for Gemini training and grounding.",
    blockCost:
      "Gemini loses permission to train on or ground answers in your content. Blocking it does NOT affect Google Search rankings or AI Overviews.",
    logPattern: /Google-Extended/i,
    docs: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
  },
  {
    id: "googlebot",
    token: "Googlebot",
    operator: "Google",
    role: "search-index",
    does: "Google's main crawler. Its index also powers AI Overviews and AI Mode in Search.",
    blockCost:
      "Blocking Googlebot removes you from Google Search entirely, including AI Overviews. Almost never what you want.",
    logPattern: /Googlebot/i,
    docs: "https://developers.google.com/search/docs/crawling-indexing/googlebot",
    keyForVisibility: true,
  },

  // ── Microsoft ─────────────────────────────────────────────────────────────
  {
    id: "bingbot",
    token: "Bingbot",
    operator: "Microsoft",
    role: "search-index",
    does: "Bing's crawler. ChatGPT Search and Copilot retrieve from Bing's index.",
    blockCost:
      "You disappear from Bing AND from the retrieval layer ChatGPT Search and Microsoft Copilot depend on, one of the most expensive AI-era blocks there is.",
    logPattern: /bingbot/i,
    docs: "https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0",
    keyForVisibility: true,
  },

  // ── Apple ─────────────────────────────────────────────────────────────────
  {
    id: "applebot-extended",
    token: "Applebot-Extended",
    operator: "Apple",
    role: "control-token",
    does: "Not a crawler. Controls whether Applebot's crawl may be used to train Apple's foundation models.",
    blockCost:
      "Apple Intelligence models can't train on your content. Doesn't affect Siri/Spotlight search results from the normal Applebot crawl.",
    logPattern: /Applebot-Extended/i,
    docs: "https://support.apple.com/en-us/119829",
  },

  // ── Meta ──────────────────────────────────────────────────────────────────
  {
    id: "meta-externalagent",
    token: "meta-externalagent",
    operator: "Meta",
    role: "training",
    does: "Crawls pages for training Meta's AI models and improving its products.",
    blockCost:
      "Meta AI (in WhatsApp, Instagram, Facebook) learns nothing from your site and is less likely to reference it.",
    logPattern: /meta-externalagent/i,
    docs: "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/",
  },

  // ── ByteDance ─────────────────────────────────────────────────────────────
  {
    id: "bytespider",
    token: "Bytespider",
    operator: "ByteDance",
    role: "training",
    does: "Crawls pages for ByteDance's AI models (Doubao and TikTok-adjacent products). Historically aggressive and inconsistent about obeying robots.txt.",
    blockCost:
      "ByteDance's models don't learn from your content. Many sites block it purely for crawl-load reasons.",
    logPattern: /Bytespider/i,
    docs: "https://www.bytedance.com",
  },

  // ── Common Crawl ──────────────────────────────────────────────────────────
  {
    id: "ccbot",
    token: "CCBot",
    operator: "Common Crawl",
    role: "training",
    does: "Builds the open Common Crawl dataset that many AI labs train on.",
    blockCost:
      "Your content drops out of the most widely used open training corpus, affecting many current and future models at once, not just one vendor's.",
    logPattern: /CCBot/i,
    docs: "https://commoncrawl.org/ccbot",
  },
];

/** Look up a crawler by id. */
export function getCrawler(id: string): AiCrawler | undefined {
  return AI_CRAWLERS.find((c) => c.id === id);
}

/** Human label for a role, used across verdict UIs. */
export const ROLE_LABELS: Record<CrawlerRole, string> = {
  training: "Model training",
  "search-index": "AI search index",
  "user-fetch": "On-demand user fetch",
  "control-token": "Usage control token",
};

/** Operators in display order (the directory's grouping). */
export function crawlersByOperator(): { operator: string; crawlers: AiCrawler[] }[] {
  const order: string[] = [];
  const map = new Map<string, AiCrawler[]>();
  for (const c of AI_CRAWLERS) {
    if (!map.has(c.operator)) {
      map.set(c.operator, []);
      order.push(c.operator);
    }
    map.get(c.operator)!.push(c);
  }
  return order.map((operator) => ({ operator, crawlers: map.get(operator)! }));
}

/** Identify which AI crawler (if any) a raw user-agent string belongs to. */
export function crawlerForUserAgent(ua: string): AiCrawler | undefined {
  // Control tokens never appear as user agents, skip them so e.g. a literal
  // "Google-Extended" string in a log (spoofed) isn't reported as a visit.
  return AI_CRAWLERS.find((c) => c.role !== "control-token" && c.logPattern.test(ua));
}
