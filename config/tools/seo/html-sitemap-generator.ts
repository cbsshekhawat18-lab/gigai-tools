import type { Tool } from "@/types";

/**
 * HTML Sitemap Generator: the human-facing sibling of the XML sitemap tool in
 * the GigAI "Sitemaps" group. Where an XML sitemap talks to crawlers, an HTML
 * sitemap is a real, linkable page for visitors: a clean nested <ul> that maps
 * every URL by its path so people (and search engines that follow links) can
 * reach any page in a click or two.
 *
 * All copy is written uniquely for HTML-sitemap-page intent (navigation,
 * internal linking, orphan-page discovery, accessibility) so it ranks
 * independently from the XML sitemap, robots and meta siblings.
 */
const htmlSitemapGenerator: Tool = {
  slug: "html-sitemap-generator",
  title: "HTML Sitemap Generator",
  description:
    "Turn a list of URLs into a clean, nested HTML sitemap page, a linkable <ul> tree grouped by path that you can paste straight into any site. Boosts internal linking and navigation. 100% in your browser.",
  category: "seo-tools",
  group: "Sitemaps",
  icon: "List",
  accent: "cyan",
  status: "live",
  featured: false,
  createdAt: "2026-06-20",

  h1: "HTML Sitemap Generator, Build a Nested Sitemap Page Online",
  tagline:
    "Paste your URLs and get a clean, nested HTML sitemap, a linkable list grouped by folder that you can drop into any page. Great for navigation, internal linking and helping users (and crawlers) reach every page. Generated entirely in your browser: no crawl, no upload, no signup.",
  longDescription:
    "The GigAI HTML Sitemap Generator turns a plain list of page URLs (one per line, pasted or dropped from a.txt file) into a human-readable sitemap page: a nested <ul> that mirrors your site's folder structure, with every page as a real anchor link. Unlike an XML sitemap, which is a machine file for search engines, an HTML sitemap is a page your visitors actually see: it gives people a single index of your whole site, surfaces deep or 'orphan' pages that aren't linked from the main navigation, and hands search engines a dense block of crawlable internal links from one authoritative page. As you type, URLs are grouped by their path segments so /blog/2026/post nests neatly under /blog, and XML/HTML special characters in your URLs are escaped so the markup is always well-formed. Choose whether to emit just the semantic <ul> fragment (to paste inside your own template) or a complete, styled standalone HTML page you can save and publish as sitemap.html. When it looks right, copy the markup, download the file, or preview the rendered tree live. Because everything runs 100% in your browser from the URLs you already have, there is no page limit we impose, nothing is uploaded, and your staging or unpublished URLs never leave your machine.",

  ctaText: "Generate HTML sitemap",

  keywords: [
    "html sitemap generator",
    "html sitemap",
    "sitemap page generator",
    "nested sitemap list",
    "internal linking sitemap",
    "url list to html",
    "sitemap html page",
    "site index generator",
    "visitor sitemap",
    "sitemap for users",
    "accessible sitemap page",
    "seo internal links",
  ],

  seo: {
    title: "HTML Sitemap Generator, Create a Nested Sitemap Page Free | GigAI Tools",
    description:
      "Free HTML sitemap generator: paste your URLs and get a clean nested list of links grouped by path, as a fragment or a full styled sitemap.html page. Improves navigation and internal linking. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "ListTree",
      title: "URL list → nested link tree",
      description:
        "Paste one URL per line and get a semantic <ul>/<li> tree that mirrors your folder structure, with each page rendered as a real, clickable anchor link.",
    },
    {
      icon: "FolderTree",
      title: "Automatic path grouping",
      description:
        "URLs are grouped by their path segments, so /blog/2026/guide nests under /blog under the root. No manual indentation or ordering required.",
    },
    {
      icon: "FileCode",
      title: "Fragment or full page",
      description:
        "Emit just the semantic <ul> to paste inside your own template, or a complete styled standalone HTML document you can publish as sitemap.html.",
    },
    {
      icon: "Eye",
      title: "Live rendered preview",
      description:
        "See the actual clickable, indented sitemap as it will appear on your page, alongside the raw markup. No guessing how the list nests.",
    },
    {
      icon: "Link",
      title: "Internal-linking boost",
      description:
        "One HTML sitemap gives search engines a dense hub of crawlable links to every page, helping deep and orphan pages get discovered and indexed.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "No crawler, no server, no page cap. Your URLs, including staging and unpublished pages, are turned into markup locally and never uploaded or logged.",
    },
  ],

  benefits: [
    {
      title: "Help visitors find any page",
      description:
        "A single indexed list of every URL gives people a fast way to reach deep pages that the main navigation doesn't expose, reducing dead ends and bounce.",
    },
    {
      title: "Strengthen internal linking",
      description:
        "Search engines follow the links on an HTML sitemap, so one page can pass crawl signals to your entire site and surface pages that are otherwise orphaned.",
    },
    {
      title: "Ship accessible, semantic markup",
      description:
        "The output is a plain nested <ul> of anchors: screen-reader friendly, keyboard-navigable, and easy to style to match your brand.",
    },
    {
      title: "Keep unpublished URLs private",
      description:
        "Nothing is crawled or uploaded, so you can build a sitemap page from staging or pre-launch URLs without exposing them to a third-party server.",
    },
  ],

  howTo: [
    {
      title: "Paste your URLs",
      description:
        "Enter one absolute URL per line, or drop a .txt file. Lines starting with # are ignored, so you can annotate or comment out URLs.",
    },
    {
      title: "Choose fragment or full page",
      description:
        "Pick 'Fragment' to get just the <ul> to embed in your own template, or 'Full HTML page' for a complete, lightly-styled sitemap.html you can publish as-is.",
    },
    {
      title: "Preview the rendered tree",
      description:
        "Check the live preview to confirm the nesting and link labels look right, then tweak your URL list until the structure matches your site.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the markup into your page template, or download the .html file. Link to it from your footer so both users and crawlers can find it.",
    },
  ],

  formats: {
    input: ["TXT", "URL list"],
    output: ["HTML"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Rescue orphan pages",
      description:
        "Add every canonical URL, including deep pages not in the nav, to one HTML sitemap so crawlers can reach and index pages that had no internal links.",
    },
    {
      audience: "Web developer",
      title: "Ship a /sitemap page fast",
      description:
        "Paste your route list, export the styled full page, and publish it as /sitemap.html or drop the fragment into an existing template. No hand-writing lists.",
    },
    {
      audience: "Content / marketing",
      title: "Give readers a full site index",
      description:
        "Offer visitors a single, scannable directory of every article and landing page, grouped by section, so they can browse the whole site at a glance.",
    },
    {
      audience: "Agency / freelancer",
      title: "Add a sitemap page to client sites",
      description:
        "Generate a clean, brandable sitemap page for each client from their URL list (including pre-launch staging URLs) without anything touching a server.",
    },
  ],

  troubleshooting: [
    {
      problem: "My link labels are just slugs like 'guide' instead of nice titles.",
      solution:
        "Labels are derived from each URL's last path segment, because the tool only knows the URLs you paste. It can't fetch page titles (that needs a server we don't run). Publish the fragment, then edit the anchor text in your template, or rename your slugs to be more descriptive.",
    },
    {
      problem: "The nesting isn't grouped the way I expected.",
      solution:
        "Grouping follows the URL path, not your visual menu. /blog/post nests under /blog. If two pages should sit together, make sure their URLs share a common path prefix. Query strings and hashes don't affect nesting.",
    },
    {
      problem: "Should this replace my XML sitemap?",
      solution:
        "No. They serve different jobs. Keep the XML sitemap for Search Console submission and crawl hints, and add the HTML sitemap as a real page for users and internal linking. Use both together for the best coverage.",
    },
  ],

  tips: [
    "Link to your HTML sitemap from the footer on every page. That single internal link is how both users and crawlers discover it.",
    "List only canonical, indexable URLs. Leave out noindex, redirected and duplicate pages so the page sends clean signals.",
    "Use descriptive slugs, because labels come from the last path segment, /pricing reads better than /p?id=42.",
    "Keep an XML sitemap as well: the HTML page is for humans and internal links, the XML file is for Search Console.",
    "For very large sites, split the sitemap page by section (one per top-level folder) so each stays scannable.",
  ],

  security:
    "Your URLs are turned into HTML entirely in your browser. There is no crawler and no upload. Nothing is stored, logged or transmitted, so you can safely build a sitemap page that includes staging, pre-launch or internal URLs. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is an HTML sitemap and how is it different from an XML sitemap?",
      answer:
        "An HTML sitemap is a normal web page that lists links to your site's pages for human visitors to browse. An XML sitemap is a machine-readable file that search engines read to discover URLs. This tool builds the HTML version (a nested list of clickable links) which you publish as a real page and link from your footer.",
    },
    {
      question: "How do I create an HTML sitemap from a list of URLs?",
      answer:
        "Paste your URLs into the input, one absolute URL per line. The tool groups them by path into a nested list of anchor links and shows a live preview. Choose a fragment or a full styled page, then copy the markup or download the .html file and publish it.",
    },
    {
      question: "Does an HTML sitemap help SEO?",
      answer:
        "Indirectly, yes. It creates a single page full of internal links to every URL, which helps search engines discover and crawl deep or orphaned pages, and improves navigation for users. It isn't a direct ranking factor, but better internal linking and crawlability support indexing.",
    },
    {
      question: "Should I use an HTML sitemap or an XML sitemap?",
      answer:
        "Use both. The XML sitemap is submitted in Google Search Console and gives crawl hints. The HTML sitemap is a page for users and passes internal-linking signals. They complement each other. This tool builds the HTML one. Our XML Sitemap Generator builds the other.",
    },
    {
      question: "Can I style the generated sitemap?",
      answer:
        "Yes. The fragment output is a plain semantic <ul>/<li> tree of anchors with no inline styles, so you can style it with your own CSS. The full-page output includes light, editable styles you can override or replace to match your brand.",
    },
    {
      question: "Where do the link labels come from?",
      answer:
        "Each link's text is the last segment of its URL path (so /blog/2026/guide shows 'guide'), because the tool only has the URLs you paste and never fetches your pages. Rename slugs or edit the anchor text after generating if you want friendlier labels.",
    },
    {
      question: "Is there a limit on how many URLs I can add?",
      answer:
        "We impose no limit: the whole page is built in your browser, so you can paste thousands of URLs. For usability, very large sites read better when split into several section-specific sitemap pages rather than one enormous list.",
    },
    {
      question: "Does this tool crawl my website?",
      answer:
        "No. It makes no network request and does not spider your site. You supply the URLs and it generates the HTML locally in your browser, which is why nothing you paste, including unpublished URLs, is ever uploaded.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, URL-list to nested HTML sitemap, automatic path grouping, escaped anchors, live rendered preview, copy and download.",
    },
    {
      date: "2026-06-26",
      change:
        "Added full standalone page output with editable styles, drag-and-drop .txt import, and duplicate-URL detection.",
    },
    {
      date: "2026-06-30",
      change:
        "Added keyboard shortcuts, shareable links and ready-made example URL sets, plus a page-title field for the full-page mode.",
    },
  ],

  relatedTools: [
    "xml-sitemap-generator",
    "robots-txt-generator",
    "meta-tag-generator",
    "url-encoder",
  ],
};

export default htmlSitemapGenerator;
