import type { Tool } from "@/types";

/**
 * Image Sitemap Generator, the image-specific member of the GigAI "Sitemaps"
 * SEO group. Maps each page URL to the images it hosts and emits a valid
 * Google image-extension sitemap (`xmlns:image`), with optional per-image
 * title and caption, live validation, and one-click download of
 * image-sitemap.xml, entirely client-side, nothing crawled or uploaded.
 *
 * All copy here is written uniquely for image-sitemap / Google Images indexing
 * intent so the page ranks independently from the XML-sitemap, video-sitemap
 * and robots siblings.
 */
const imageSitemapGenerator: Tool = {
  slug: "image-sitemap-generator",
  title: "Image Sitemap Generator",
  description:
    "Map each page to the images it hosts and generate a valid Google image sitemap (image:image, image:title, image:caption) to get pictures indexed in Google Images. 100% in your browser.",
  category: "seo-tools",
  group: "Sitemaps",
  icon: "Image",
  accent: "cyan",
  status: "live",
  featured: false,
  createdAt: "2026-06-22",

  h1: "Image Sitemap Generator, Get Your Images Indexed by Google",
  tagline:
    "Pair each page URL with the images it contains, add optional titles and captions, and export a spec-valid image sitemap Google can crawl to surface your pictures in Google Images. Validated live, generated entirely in your browser. No crawl, no upload, no signup.",
  longDescription:
    "The GigAI Image Sitemap Generator builds a Google image-extension sitemap: an XML document where every <url> points at a page and lists the <image:image> entries hosted on it, so Googlebot can discover pictures that lazy-loading, CSS backgrounds, JavaScript galleries or CDN hosting would otherwise hide. Group your image URLs under the page that displays them, add an optional <image:title> and <image:caption> per image, and the tool emits a well-formed <urlset> that declares the xmlns:image namespace Google requires. As you type it validates the result, flagging pages with no images, non-HTTPS or non-absolute image URLs, duplicate image locations, and warning before you approach the 1,000-images-per-page and 50,000-URL protocol limits. XML-unsafe characters in URLs, titles and captions (&, <, >, quotes) are escaped automatically, so the file always parses. When it looks right, copy the XML or download image-sitemap.xml, place it at your domain root, and submit it in Google Search Console or reference it from robots.txt. Unlike crawler-based tools that spider your live site on a server (and cap free plans), this runs 100% in your browser from the image URLs you already have. There is no page limit we impose, nothing is uploaded, and unpublished or CDN-hosted assets never leave your machine.",

  ctaText: "Generate image sitemap",

  keywords: [
    "image sitemap generator",
    "image sitemap xml",
    "google image sitemap",
    "sitemap for images",
    "index images in google",
    "google images seo",
    "image:image sitemap",
    "image title caption sitemap",
    "create image sitemap",
    "seo image sitemap tool",
    "submit image sitemap",
    "image sitemap validator",
  ],

  seo: {
    title:
      "Image Sitemap Generator, Create a Valid Google Image Sitemap Free | GigAI Tools",
    description:
      "Free image sitemap generator: pair pages with their image URLs, add titles and captions, validate, and download image-sitemap.xml to get pictures into Google Images. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "Image",
      title: "Page → images, one valid sitemap",
      description:
        "Group image URLs under the page that hosts them and get a Google image-extension <urlset> with the xmlns:image namespace, escaped locations and clean indentation.",
    },
    {
      icon: "Captions",
      title: "Optional titles and captions",
      description:
        "Add an image:title and image:caption per image inline (image | Title | Caption) to give Google richer context for Google Images ranking and previews.",
    },
    {
      icon: "ShieldCheck",
      title: "Live protocol validation",
      description:
        "As you type we flag pages with no images, non-absolute or non-HTTPS image URLs, duplicate image locations, and warn before the 1,000-image-per-page and 50,000-URL limits.",
    },
    {
      icon: "Braces",
      title: "Automatic XML escaping",
      description:
        "Ampersands, angle brackets and quotes in image URLs, titles and captions are escaped for you, so the sitemap is always well-formed and never rejected as unreadable.",
    },
    {
      icon: "Download",
      title: "Copy or download image-sitemap.xml",
      description:
        "One click copies the XML or downloads a correctly-named image-sitemap.xml. Drop it at your site root and submit it in Search Console.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "No crawler, no server, no page cap. Your image URLs (including CDN-hosted and unpublished assets) are turned into XML locally and never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Surface images Google can't find",
      description:
        "Lazy-loaded, JavaScript-rendered, CSS-background and CDN-hosted images are often missed by the crawler. An image sitemap points Google straight at them.",
    },
    {
      title: "Win traffic from Google Images",
      description:
        "Image search is a real discovery channel for recipes, products, portfolios and how-tos. Titles and captions give Google the context to rank and preview them well.",
    },
    {
      title: "Ship well-formed XML every time",
      description:
        "Automatic escaping and live validation mean the file you download parses cleanly in Search Console. No 'could not read your sitemap' errors.",
    },
    {
      title: "Keep unpublished assets private",
      description:
        "Nothing is crawled or uploaded, so you can build a sitemap that references pre-launch, staging or CDN URLs without exposing them to a third party.",
    },
  ],

  howTo: [
    {
      title: "Add a page URL",
      description:
        "Start each block with an absolute page URL on its own line. This becomes the <loc>: the page Google associates the images with.",
    },
    {
      title: "List its images beneath it",
      description:
        "Indent (or prefix with '- ') each image URL on the following lines. Optionally append a title and caption: image-url | Title | Caption.",
    },
    {
      title: "Review validation",
      description:
        "Watch the live status: pages, total images, HTTPS coverage, duplicates and any per-page or protocol-limit warnings. Fix flagged rows before you export.",
    },
    {
      title: "Copy or download image-sitemap.xml",
      description:
        "Copy the XML or download image-sitemap.xml, upload it to your domain root (e.g. https://example.com/image-sitemap.xml), and submit that URL in Google Search Console.",
    },
    {
      title: "Reference it from robots.txt",
      description:
        "Add a 'Sitemap: https://example.com/image-sitemap.xml' line to robots.txt so every crawler discovers it automatically, not just Google.",
    },
  ],

  formats: {
    input: ["TXT", "URL list"],
    output: ["XML"],
  },

  useCases: [
    {
      audience: "E-commerce / product SEO",
      title: "Index every product photo",
      description:
        "List each product page with its gallery image URLs, titles and captions so product shots can rank in Google Images and drive shopping discovery.",
    },
    {
      audience: "Photographer / portfolio",
      title: "Get a JavaScript gallery crawled",
      description:
        "Lightbox and infinite-scroll galleries hide images from the crawler. An image sitemap lists every full-resolution URL explicitly so none are missed.",
    },
    {
      audience: "Publisher / blogger",
      title: "Add rich context to article imagery",
      description:
        "Give diagrams, infographics and hero images descriptive titles and captions so Google understands and previews them in image results.",
    },
    {
      audience: "Agency / freelancer",
      title: "Map CDN-hosted images to their pages",
      description:
        "When images live on a separate CDN or subdomain, an image sitemap ties them back to the page URL that displays them, privately, with no third-party crawl.",
    },
  ],

  troubleshooting: [
    {
      problem: "Search Console says my image sitemap couldn't be read.",
      solution:
        "Confirm the file is reachable at the URL you submitted (open it in a browser), is served as XML/text, and that it declares the image namespace (xmlns:image). This tool emits that namespace automatically, re-download if you hand-edited the file.",
    },
    {
      problem: "My images still aren't showing in Google Images.",
      solution:
        "A sitemap aids discovery, not guaranteed indexing. Make sure the image URLs return HTTP 200 and aren't blocked by robots.txt, that pages aren't noindex, and that images have relevant alt text and load fast. Then allow days-to-weeks for recrawl.",
    },
    {
      problem: "Some image lines were skipped.",
      solution:
        "Every image must be an absolute URL like https://example.com/photo.jpg. Relative paths (/img/photo.jpg) and non-http(s) entries are skipped and flagged. Fix or remove the highlighted lines.",
    },
    {
      problem: "One page has hundreds of images: is that ok?",
      solution:
        "Google allows up to 1,000 images per page in the sitemap. The tool warns as you approach it. If you exceed it, keep the most important images or split the gallery across paginated page URLs.",
    },
  ],

  tips: [
    "Only list images you actually want in Google Images, decorative icons and spacers add noise and waste crawl attention.",
    "Use absolute HTTPS image URLs. Relative paths and http:// entries are flagged and can be rejected by Search Console.",
    "Write real, human-readable titles and captions. They help Google understand the image and can appear alongside it in results.",
    "You can list images hosted on a different domain or CDN, but you must verify that host in Search Console for them to be attributed.",
    "Combine this with a standard URL sitemap: a page sitemap for crawling and an image sitemap for image discovery cover both bases.",
  ],

  security:
    "Your page and image URLs are turned into XML entirely in your browser. There is no crawler and no upload. Nothing is stored, logged or transmitted, so you can safely reference staging, pre-launch or CDN-hosted assets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is an image sitemap and do I need one?",
      answer:
        "An image sitemap is a standard XML sitemap extended with Google's image namespace, listing the images on each page so Googlebot can find pictures it might otherwise miss, lazy-loaded, JavaScript-rendered, CSS-background or CDN-hosted images. It's most valuable for image-heavy sites (e-commerce, portfolios, recipes, publishers) that want visibility in Google Images.",
    },
    {
      question: "How do I create an image sitemap?",
      answer:
        "Put each page URL on its own line, then list the image URLs it hosts on the following indented lines (optionally with a title and caption). The tool groups them into <url> blocks with <image:image> entries and generates a valid image sitemap you can copy or download, all in your browser, no crawl required.",
    },
    {
      question: "How many images can one page list?",
      answer:
        "Google allows up to 1,000 images per page URL in the sitemap, and a single sitemap file may contain up to 50,000 URLs (and 50 MB uncompressed). The tool warns you as you approach these limits so you can split large sets across paginated pages or multiple sitemap files.",
    },
    {
      question: "Do image title and caption help SEO?",
      answer:
        "They give Google extra context about each image, which can improve how it's understood and previewed in image results. They complement (but don't replace) good on-page alt text, descriptive filenames and fast-loading images, which remain the primary signals.",
    },
    {
      question: "Can I include images hosted on a CDN or another domain?",
      answer:
        "Yes. You can list image URLs on a different host from the page URL: common with CDNs. To have those images attributed to you, verify the image host in Google Search Console. Otherwise Google may not associate them with your property.",
    },
    {
      question: "How do I submit my image sitemap to Google?",
      answer:
        "Upload the downloaded image-sitemap.xml to your domain root (e.g. https://example.com/image-sitemap.xml), open Google Search Console, go to Sitemaps, enter the sitemap URL and click Submit. Also add a 'Sitemap:' line to robots.txt so other engines find it too.",
    },
    {
      question: "Does this tool crawl my website to find images?",
      answer:
        "No. It never spiders your site or makes any network request. You supply the page and image URLs and it generates the XML locally in your browser, which is why there's no page limit we impose and why nothing you paste, including unpublished URLs, is ever uploaded.",
    },
    {
      question: "Should I combine this with my regular sitemap?",
      answer:
        "You can either add image entries into your existing URL sitemap or keep a separate image-sitemap.xml, Google accepts both. A dedicated image sitemap keeps concerns tidy: one sitemap for page crawling and one for image discovery, each submitted in Search Console.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, page-grouped image URLs to a valid Google image-extension <urlset>, optional per-image title and caption, live validation, copy and download.",
    },
    {
      date: "2026-06-26",
      change:
        "Added duplicate-image detection, HTTPS coverage stats, and warnings as you approach the 1,000-images-per-page and 50,000-URL limits.",
    },
    {
      date: "2026-06-30",
      change:
        "Added drag-and-drop .txt import, keyboard shortcuts, shareable links and ready-made example image sets.",
    },
  ],

  relatedTools: [
    "xml-sitemap-generator",
    "video-sitemap-generator",
    "robots-txt-generator",
    "url-encoder",
  ],
};

export default imageSitemapGenerator;
