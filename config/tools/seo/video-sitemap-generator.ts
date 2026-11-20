import type { Tool } from "@/types";

/**
 * Video Sitemap Generator, a "Sitemaps"-group SEO tool that turns a list of
 * hosted videos into a Google-spec `<urlset>` with the
 * `xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"` namespace.
 *
 * Google's Video sitemap extension has its own required and recommended tags
 * (thumbnail_loc, title, description are required; player_loc/content_loc,
 * duration and publication_date are strongly recommended) that a plain XML
 * sitemap can't express. This tool builds that structure correctly, escapes
 * special characters, and validates the specifics Google enforces, duration
 * bounds (1–28,800s), the 100-character title limit, at least one of
 * player_loc/content_loc, ISO 8601 publication dates: entirely in the browser.
 *
 * Copy is written uniquely for video-indexing intent (Google Video search,
 * video rich results, watch pages) so this page ranks independently from the
 * XML / image / news sitemap siblings.
 */
const videoSitemapGenerator: Tool = {
  slug: "video-sitemap-generator",
  title: "Video Sitemap Generator",
  description:
    "Turn your hosted videos into a Google-valid video sitemap: thumbnail, title, description, player/content URL, duration and publish date per video: validated live and downloadable. 100% in your browser.",
  category: "seo-tools",
  group: "Sitemaps",
  icon: "Film",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-22",

  h1: "Video Sitemap Generator: Build a Google-Valid Video XML Sitemap",
  tagline:
    "Add each video's watch-page URL, thumbnail, title, description, player or content URL, duration and publish date, and get a spec-valid video sitemap with the video: namespace, validated against Google's rules and downloadable as sitemap.xml. Built entirely in your browser: no crawl, no upload, no signup.",
  longDescription:
    "The GigAI Video Sitemap Generator produces the specialised sitemap Google needs to discover, index and show your videos in Google Video search and video rich results. A normal XML sitemap only lists page URLs. A video sitemap wraps each watch page in a <video:video> block carrying the metadata Google reads: a thumbnail image, a title (max 100 characters), a description (max 2,048 characters), the video's player URL (an embed/watch player) and/or a raw content URL (a downloadable.mp4/.webm file), the runtime in seconds, and the ISO 8601 publication date. This tool builds that structure with the correct xmlns:video namespace and escapes every ampersand, angle bracket and quote in your URLs and text so the file is always well-formed. As you fill it in, it validates the parts Google actually enforces: it requires a thumbnail, title and description on every entry. Requires at least one of player_loc or content_loc (a video with neither is invisible to Google). Flags durations outside the allowed 1–28,800 second (8-hour) range. Warns when a title exceeds 100 characters or a description exceeds 2,048, and checks that publication dates are valid W3C/ISO 8601. When it's clean, copy the XML or download sitemap.xml, place it at your domain root, and submit it in Google Search Console or reference it from robots.txt. Unlike server-side crawlers that fetch your pages (and cap free plans), everything here runs locally from the video details you provide, so there's no page limit we impose, nothing is uploaded, and unpublished or members-only video URLs never leave your machine.",

  ctaText: "Generate video sitemap",

  keywords: [
    "video sitemap generator",
    "video xml sitemap",
    "google video sitemap",
    "create video sitemap",
    "video sitemap example",
    "video:video sitemap tag",
    "video sitemap thumbnail",
    "video sitemap player_loc content_loc",
    "video seo sitemap",
    "submit video sitemap google",
    "video rich results sitemap",
    "sitemap video namespace",
  ],

  seo: {
    title: "Video Sitemap Generator, Google-Valid Video XML Sitemap Free | GigAI Tools",
    description:
      "Free video sitemap generator: add each video's thumbnail, title, description, player/content URL, duration and publish date and download a Google-valid video sitemap.xml. Live validation, 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "Film",
      title: "Video entries → valid video sitemap",
      description:
        "Each video becomes a <url> with a nested <video:video> block carrying thumbnail_loc, title, description, player/content URL, duration and publication_date, under the correct xmlns:video namespace.",
    },
    {
      icon: "ShieldCheck",
      title: "Validates Google's real rules",
      description:
        "We require thumbnail, title and description. Require at least one of player_loc or content_loc. Enforce the 1–28,800s duration range, and warn on title >100 or description >2,048 characters.",
    },
    {
      icon: "Image",
      title: "Thumbnail, player and content URLs",
      description:
        "Provide a thumbnail image, an embeddable player_loc (your watch/embed player) and/or a direct content_loc (the raw .mp4/.webm). Google needs the thumbnail plus at least one of the two.",
    },
    {
      icon: "Clock",
      title: "Duration and publish date done right",
      description:
        "Enter duration in seconds and a publish date. The tool emits <video:duration> and an ISO 8601 <video:publication_date> in the exact form Google parses, and flags out-of-range values.",
    },
    {
      icon: "Download",
      title: "Copy or download sitemap.xml",
      description:
        "One click copies the escaped XML or downloads a correctly-named sitemap.xml: drop it at your site root and submit it in Google Search Console.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "No crawler, no server, no page cap. Your video URLs (including unlisted, gated or pre-launch videos) are turned into XML locally and never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Get videos into Google Video search",
      description:
        "A correct video sitemap is the most direct way to tell Google which pages host videos and hand it the metadata needed for video rich results and the Videos tab.",
    },
    {
      title: "Avoid the errors that hide your videos",
      description:
        "Missing thumbnails, no player/content URL, or bad durations are the top reasons Google skips a video. Live validation catches them before you ever submit.",
    },
    {
      title: "No arbitrary video limits",
      description:
        "Because you supply the details, you can build a sitemap for as many videos as you host in one pass. No free-plan cap imposed by us.",
    },
    {
      title: "Keep unlisted videos private",
      description:
        "Nothing is crawled or uploaded, so you can generate a sitemap that includes members-only, unlisted or pre-launch video URLs without exposing them to a third party.",
    },
  ],

  howTo: [
    {
      title: "Add each video",
      description:
        "For every video, enter the watch-page URL and, on the same line, its thumbnail, title, description, and a player and/or content URL, separated by pipes.",
    },
    {
      title: "Add duration and publish date",
      description:
        "Include the runtime in seconds and the publication date so Google can show length and freshness. Both are optional but strongly recommended.",
    },
    {
      title: "Review validation",
      description:
        "Watch the live checks: every entry needs a thumbnail, title, description and at least one of player/content URL. Durations must be 1–28,800s. Titles ≤100 chars.",
    },
    {
      title: "Copy or download sitemap.xml",
      description:
        "Copy the XML or download sitemap.xml, upload it to your domain root, and submit that URL in Google Search Console under Sitemaps.",
    },
    {
      title: "Reference it from robots.txt",
      description:
        "Add a 'Sitemap: https://example.com/video-sitemap.xml' line to robots.txt so crawlers discover it automatically.",
    },
  ],

  formats: {
    input: ["Video details", "URL list"],
    output: ["XML"],
  },

  useCases: [
    {
      audience: "Video / media publisher",
      title: "Index a video library",
      description:
        "List every watch page with its thumbnail, title, duration and publish date so a whole catalogue of tutorials or episodes becomes eligible for Google Video search in one submission.",
    },
    {
      audience: "SEO specialist",
      title: "Win video rich results",
      description:
        "Pair a valid video sitemap with VideoObject schema on each page to give Google both the crawl signal and the structured data it needs for video thumbnails in search.",
    },
    {
      audience: "Web developer",
      title: "Sitemap self-hosted MP4s",
      description:
        "For videos served as raw files, set content_loc to the .mp4/.webm and player_loc to your watch page so Google can both fetch and link the video correctly.",
    },
    {
      audience: "Course / e-learning site",
      title: "Surface public lesson previews",
      description:
        "Generate a sitemap for the free, indexable preview lessons while keeping gated course videos out: since nothing is crawled, you control exactly what's listed.",
    },
  ],

  troubleshooting: [
    {
      problem: "Search Console reports 'No video found' or 'Missing thumbnail'.",
      solution:
        "Every <video:video> must have a thumbnail_loc, a title, a description, and at least one of player_loc or content_loc. Make sure the thumbnail URL returns a real image and each field is filled, the tool flags any entry missing these before you export.",
    },
    {
      problem: "My duration is rejected or ignored.",
      solution:
        "Duration must be an integer number of seconds between 1 and 28,800 (8 hours). Convert mm:ss to seconds (e.g. 3:45 → 225) and remove decimals. Values outside the range are flagged as errors here.",
    },
    {
      problem: "The video appears in the sitemap but not in Google.",
      solution:
        "A sitemap gets a video discovered, not guaranteed indexed. Ensure the watch page is indexable (not noindex/blocked), the video is visible to Googlebot without a login, the thumbnail and content are reachable, and ideally add VideoObject structured data to the page.",
    },
    {
      problem: "The XML looks broken when a URL has '&' in it.",
      solution:
        "That's handled automatically: the tool escapes &, <, >, ' and \" in every URL and text field, so query strings like ?v=abc&t=10 are written as valid XML. If you still see errors, check for stray pipe characters inside a field.",
    },
  ],

  tips: [
    "Give each video a unique, descriptive title under 100 characters and a full description (up to 2,048), Google uses both directly in video results.",
    "Provide a high-quality thumbnail (Google recommends at least 160×90, up to 1920×1080) that genuinely represents the video, not a generic placeholder.",
    "Set player_loc to your embeddable/watch player and content_loc to the raw file when self-hosting. Supplying both gives Google the most to work with.",
    "Pair the sitemap with VideoObject JSON-LD on each page. The sitemap aids discovery while structured data powers the rich result.",
    "List one video per watch page. If a page has several videos, that's an advanced case, most pages should map to a single primary video.",
  ],

  security:
    "Your video details are turned into XML entirely in your browser. There is no crawler and no upload. Nothing is stored, logged or transmitted, so you can safely generate sitemaps that include unlisted, members-only or pre-launch video URLs. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is a video sitemap and do I need one?",
      answer:
        "A video sitemap is an XML sitemap that uses Google's video: namespace to describe each video on your pages: thumbnail, title, description, player/content URL, duration and publish date. It's the most reliable way to get videos discovered for Google Video search and video rich results, especially for self-hosted videos or pages where the video isn't obvious in the HTML.",
    },
    {
      question: "What's the difference between player_loc and content_loc?",
      answer:
        "content_loc is the URL of the actual video file (e.g. https://example.com/video.mp4), while player_loc is the URL of a player that plays the video (an embed or watch page). Google requires at least one of the two. For self-hosted videos, supply both: content_loc for the file and player_loc for your watch page.",
    },
    {
      question: "Which video sitemap tags are required?",
      answer:
        "For every video, <video:thumbnail_loc>, <video:title> and <video:description> are required, plus at least one of <video:player_loc> or <video:content_loc>. <video:duration> and <video:publication_date> are optional but strongly recommended. This tool enforces the required set and warns on the recommended ones.",
    },
    {
      question: "What duration format does a video sitemap use?",
      answer:
        "Duration is expressed as a whole number of seconds inside <video:duration>, and must be between 1 and 28,800 (8 hours). A 3-minute-45-second video is 225. Enter seconds here and the tool emits the correct tag and flags anything out of range.",
    },
    {
      question: "How long can the title and description be?",
      answer:
        "The video title can be up to 100 characters and the description up to 2,048 characters. Longer values are truncated or ignored by Google, so the tool warns you as you approach each limit. Write them for humans. Google can display both in video results.",
    },
    {
      question: "How do I submit a video sitemap to Google?",
      answer:
        "Download the sitemap.xml, upload it to your domain (e.g. https://example.com/video-sitemap.xml), then open Google Search Console, go to Sitemaps, enter the sitemap URL and click Submit. You can also add a 'Sitemap:' line to robots.txt so it's discovered automatically.",
    },
    {
      question: "Can one video sitemap contain both videos and normal pages?",
      answer:
        "Yes. A video sitemap is a standard <urlset> where each <url> may include a <video:video> block. You can keep videos in their own dedicated sitemap or mix them into a general one. Keeping a separate video sitemap makes video-specific coverage easier to monitor in Search Console.",
    },
    {
      question: "Does this tool crawl my site to find videos?",
      answer:
        "No. It makes no network requests and does not spider your pages. You provide the video details and it builds the XML locally in your browser, which is why there's no limit imposed by us and why unlisted or gated video URLs you enter are never uploaded.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, video entries to a Google-valid <urlset> with the video: namespace, per-video thumbnail/title/description/player/content/duration/publish-date, live validation, copy and download.",
    },
    {
      date: "2026-06-27",
      change:
        "Added duration-range (1–28,800s) and title/description length validation, required-field checks for player_loc/content_loc, and drag-and-drop import.",
    },
    {
      date: "2026-06-30",
      change:
        "Added keyboard shortcuts, shareable links, ready-made example video sets, and per-entry error line numbers.",
    },
  ],

  relatedTools: [
    "video-schema-generator",
    "xml-sitemap-generator",
    "image-sitemap-generator",
    "news-sitemap-generator",
    "html-sitemap-generator",
  ],
};

export default videoSitemapGenerator;
