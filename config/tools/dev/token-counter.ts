import type { Tool } from "@/types";

/**
 * LLM Token Counter + Cost Estimator: paste a prompt and see exact token counts
 * (OpenAI, via the real BPE tokenizer) or estimates (Claude/Gemini) for every
 * model, with the input cost and an optional full per-call estimate. Runs in the
 * browser; the OpenAI tokenizer is lazy-loaded. Honest scope: Claude/Gemini are
 * estimates and pricing is approximate, the UI says so.
 */
const tokenCounter: Tool = {
  slug: "token-counter",
  title: "LLM Token Counter",
  description:
    "Count tokens and estimate the cost of a prompt across GPT-4o, Claude and Gemini, exact for OpenAI, live, and entirely in your browser. No sign-up.",
  category: "developer-tools",
  icon: "Calculator",
  accent: "emerald",
  status: "live",
  featured: false,
  createdAt: "2026-07-09",

  h1: "LLM Token Counter & Cost Estimator",
  tagline:
    "Paste a prompt and instantly see the token count and price across GPT-4o, GPT-4.1, Claude and Gemini, so you know what an API call will cost before you make it.",
  longDescription:
    "Every LLM API bills by the token, but 'how many tokens is this prompt?' is surprisingly hard to answer, tokenization isn't words or characters. The GigAI Token Counter runs the real OpenAI BPE tokenizer (o200k for GPT-4o/4.1/o-series, cl100k for GPT-3.5) directly in your browser for an exact count, and provides a clearly-labelled estimate for Claude and Gemini, whose tokenizers aren't publicly available. Paste any prompt, system message or document and a live table shows the token count and input cost for every model side by side, plus the percentage of each model's context window you're using. Add an expected reply length to see the full per-call cost including output tokens. Everything runs locally (your prompts never leave your device) and the OpenAI tokenizer is loaded only when you need it, so the page stays fast.",

  ctaText: "Count tokens",

  keywords: [
    "token counter",
    "llm token counter",
    "gpt token counter",
    "openai token counter",
    "count tokens",
    "chatgpt token calculator",
    "api cost calculator",
    "claude token counter",
    "gemini token counter",
    "prompt cost estimator",
  ],

  seo: {
    title: "LLM Token Counter & Cost Estimator (GPT, Claude, Gemini) | GigAI Tools",
    description:
      "Count tokens and estimate cost for GPT-4o, GPT-4.1, Claude and Gemini. Exact OpenAI tokenizer, live, free and private: runs in your browser, no upload.",
  },

  features: [
    {
      icon: "Hash",
      title: "Exact OpenAI token counts",
      description:
        "Runs the real BPE tokenizer (o200k / cl100k) in your browser, not a chars÷4 guess, so your GPT-4o and GPT-4.1 counts are accurate.",
    },
    {
      icon: "Table",
      title: "Every model, side by side",
      description:
        "One paste shows token count and input cost for GPT-4o, GPT-4.1, o4-mini, Claude and Gemini at once, so you can pick the cheapest fit.",
    },
    {
      icon: "CircleDollarSign",
      title: "Full per-call cost",
      description:
        "Add an expected reply length and it factors in output-token pricing to estimate the total cost of a request, not just the prompt.",
    },
    {
      icon: "Gauge",
      title: "Context-window usage",
      description:
        "See what percentage of each model's context window your prompt takes, so you know how much room is left for the conversation.",
    },
  ],

  benefits: [
    {
      title: "Budget before you build",
      description:
        "Estimate what a feature will cost per request across models before you write the integration, and spot when a mini model is plenty.",
    },
    {
      title: "Right-size your prompts",
      description:
        "See exactly how many tokens a system prompt or document adds, and trim what you don't need to cut cost and stay within the context window.",
    },
    {
      title: "Private by default",
      description:
        "Your prompts often contain proprietary instructions or data. Here they're tokenized locally in your browser and never uploaded.",
    },
  ],

  howTo: [
    {
      title: "Paste your prompt",
      description:
        "Drop in a prompt, system message or document. The OpenAI tokenizer loads on first use and counts run live as you type.",
    },
    {
      title: "Read the comparison table",
      description:
        "See the token count and input cost for every model. OpenAI counts are exact. Claude and Gemini are marked as estimates.",
    },
    {
      title: "Add the reply length (optional)",
      description:
        "Enter roughly how many tokens the model will reply with to include output-token pricing and get the full per-call cost.",
    },
    {
      title: "Choose the right model",
      description:
        "Compare costs and context usage, then pick the cheapest model that fits your prompt and quality needs.",
    },
  ],

  faq: [
    {
      question: "Are the token counts exact?",
      answer:
        "For OpenAI models, yes. The tool runs the actual BPE tokenizer (o200k_base for GPT-4o/4.1/o-series, cl100k_base for GPT-3.5) in your browser. For Claude and Gemini, whose tokenizers aren't published, the counts are clearly-labelled estimates based on a character heuristic.",
    },
    {
      question: "Why isn't a token just a word or a character?",
      answer:
        "Tokenizers split text into sub-word pieces using byte-pair encoding, so a token can be a whole word, part of a word, or punctuation. That's why an accurate count needs the real tokenizer, not a chars-divided-by-four guess.",
    },
    {
      question: "Is the pricing accurate?",
      answer:
        "It's approximate and can change at any time, so always confirm the current rate on the provider's pricing page. The tool shows USD per million tokens and computes cost from that, which makes it easy to update mentally if a price shifts.",
    },
    {
      question: "Does it count output tokens too?",
      answer:
        "It counts your input exactly. Add an expected reply length and it applies each model's output-token price to estimate the full per-call cost, since input and output are usually billed at different rates.",
    },
    {
      question: "Are my prompts uploaded?",
      answer:
        "No. Tokenization and costing happen entirely in your browser. Your prompts, which often contain proprietary instructions, never leave your device.",
    },
  ],

  relatedTools: ["character-counter", "word-counter", "json-formatter", "diff-checker"],
};

export default tokenCounter;
