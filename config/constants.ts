/**
 * Global, non-secret constants. Anything environment-specific reads from
 * NEXT_PUBLIC_* with a sensible production default.
 */
export const SITE = {
  name: "GigAI Tools",
  shortName: "GigAI Tools",
  brand: "Gigai Kripa Services",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gigai.tools",
  parentUrl: "https://gigaikripaservices.com",
  // NOTE: this must stay literally true. Two tools (PDF→Word, Word→PDF) do use
  // a server, so a blanket "everything runs in your browser" would be false -
  // and this string is the site-wide meta description, the most-read claim we
  // make. Each tool states its own processing mode via ProcessingBadge.
  description:
    "The privacy-first browser productivity platform: hundreds of free tools for images, PDFs, documents, video, audio, QR, SVG, SEO and developers. Almost every tool runs entirely in your browser. The few that need a server say so and delete your file straight after.",
  // Brand positioning (2026-08-12). The second line is the differentiator:
  // GigAI picks the right technology per job rather than labelling
  // everything "AI", and the copy must keep earning that distinction.
  tagline: "Tools that think before they work.",
  positioning: "AI-powered when useful. Local when possible.",
  locale: "en_US",
  language: "en",
  ogImage: "/images/og-default.png",
  logo: "/images/logo.svg",
  email: "hello@gigaikripaservices.com",
  twitterHandle: "@gigaikripa",
} as const;

export const API = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? `${SITE.url}/api`,
  timeoutMs: 30_000,
} as const;

export const PAGINATION = {
  toolsPerPage: 24,
  blogPerPage: 9,
  searchResults: 8,
  relatedTools: 6,
} as const;

/** Feature flags, flip a feature on/off platform-wide. */
export const FEATURES = {
  darkMode: true,
  search: true,
  blog: true,
} as const;

export const TRENDING_SEARCHES = [
  "compress pdf",
  "merge pdf",
  "image resizer",
  "json formatter",
  "word counter",
  "qr code generator",
  "password generator",
] as const;

export const ROUTES = {
  home: "/",
  search: "/search",
  // GigAI Smart Assist, upload a file, describe a goal, get it done.
  assist: "/assist",
  category: (slug: string) => `/category/${slug}`,
  // Tools live at the top level for short, memorable, SEO-friendly URLs
  // e.g. /image-compressor, /word-counter.
  tool: (slug: string) => `/${slug}`,
  // Discovery hubs (collections, audience use-cases, guided workflows, learning).
  collections: "/collections",
  collection: (slug: string) => `/collections/${slug}`,
  useCases: "/use-cases",
  forUseCase: (slug: string) => `/use-cases/${slug}`,
  // Task hubs: job-to-be-done landing pages (the top user + SEO intent layer).
  tasks: "/task",
  task: (slug: string) => `/task/${slug}`,
  // Problem hubs: the user-intent database ("my PDF is too large") that routes
  // real problems to the existing tools that solve them.
  solve: "/solve",
  solveProblem: (slug: string) => `/solve/${slug}`,
  // Glossary. The definitional "what is X" layer.
  glossary: "/glossary",
  glossaryTerm: (slug: string) => `/glossary/${slug}`,
  // "For [context]": destination-specific transactional landing pages.
  forIndex: "/for",
  forContext: (slug: string) => `/for/${slug}`,
  workflows: "/workflows",
  workflow: (slug: string) => `/workflows/${slug}`,
  learn: "/learn",
  // GigAI Workspaces, chain multiple tools on your files without leaving the page.
  workspaces: "/workspaces",
  workspace: (slug: string) => `/${slug}-workspace`,
  // My Workspace: the personal, local-first dashboard (pinned/favorites/history).
  myWorkspace: "/workspace",
  // Long-form SEO content, topic-cluster comparison + how-to pages.
  compare: "/compare",
  comparison: (slug: string) => `/compare/${slug}`,
  howToIndex: "/how-to",
  howTo: (slug: string) => `/how-to/${slug}`,
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  changelog: "/changelog",
  // GigAI Copilot, the companion browser extension.
  extension: "/extension",
  // GigAI Verify: ONE product, three surfaces:
  //   verifyTool      the web tool: check a FILE you have
  //   verifyExtension the Chrome extension: check what you're LOOKING AT
  //   verify          the full report view the extension hands off to
  // They must cross-link, or a visitor who lands on one never learns the
  // other exists, which is how one product ends up reading as two.
  verifyTool: "/gigai-verify",
  // extension's own landing page.
  verify: "/verify",
  verifyExtension: "/verify/extension",
  about: "/about",
  openSource: "/open-source",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  // Trust / editorial pages (E-E-A-T + AdSense).
  editorial: "/editorial",
  aiPolicy: "/ai-policy",
  cookies: "/cookies",
  disclaimer: "/disclaimer",
  dmca: "/dmca",
  accessibility: "/accessibility",
} as const;

/** Where the site's own source code and documentation live. */
export const OPEN_SOURCE = {
  repo: "https://github.com/cbsshekhawat18-lab/gigai-tools",
  docs: "https://cbsshekhawat18-lab.github.io/gigai-tools/",
  license: "Apache-2.0",
} as const;
