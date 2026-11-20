import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-generate-an-xml-sitemap",
  title: "How to Generate an XML Sitemap (and Submit It)",
  description:
    "Build a valid XML sitemap for your site, add it to robots.txt, and submit it to Google Search Console so every page gets discovered. A clear step-by-step guide.",
  accent: "emerald",
  icon: "Map",
  toolSlug: "xml-sitemap-generator",
  seo: {
    title: "How to Generate an XML Sitemap and Submit It to Google (Free)",
    description:
      "Learn how to create a valid XML sitemap, reference it in robots.txt and submit it to Google Search Console, free, step-by-step, so search engines crawl every page.",
    keywords: [
      "how to generate an xml sitemap",
      "create xml sitemap",
      "xml sitemap generator",
      "submit sitemap to google",
      "sitemap seo",
    ],
    canonical: "/how-to/how-to-generate-an-xml-sitemap",
  },
  intro: [
    "An XML sitemap is a machine-readable list of the URLs on your site that you want search engines to crawl and index. It doesn't guarantee indexing, but it gives crawlers a complete map of your pages, invaluable for large sites, new sites with few backlinks, and pages that aren't well linked internally.",
    "You don't need a plugin or CMS to make one. A sitemap is just a specific XML format any tool can produce. This guide walks through generating a valid sitemap, hosting it at the right URL, pointing robots.txt at it, and submitting it to Google Search Console so your pages get discovered faster.",
  ],
  steps: [
    {
      title: "Gather the URLs you want indexed",
      body: "Collect the canonical, public URLs you want search engines to crawl, skip admin pages, duplicate parameter URLs, and anything set to noindex. Include only pages that return a 200 status.",
    },
    {
      title: "Generate the sitemap",
      body: "Open the XML sitemap generator, add your URLs, and let it build a valid <urlset> document. Each entry gets a <loc>, and you can add optional <lastmod>, <changefreq> and <priority> hints.",
    },
    {
      title: "Set accurate lastmod dates",
      body: "Where you can, give each URL a truthful last-modified date. Google largely ignores changefreq and priority but does use a reliable lastmod to prioritise recrawling changed pages, so keep it honest.",
    },
    {
      title: "Save the file as sitemap.xml",
      body: "Download the generated file and name it sitemap.xml. If you have more than 50,000 URLs or the file exceeds 50 MB uncompressed, split it into multiple sitemaps and list them in a sitemap index.",
    },
    {
      title: "Upload it to your site root",
      body: "Place the file at the root of your domain so it's reachable at https://yourdomain.com/sitemap.xml. Load that URL in a browser to confirm it serves valid XML with a 200 status.",
    },
    {
      title: "Reference it in robots.txt",
      body: "Add a line like 'Sitemap: https://yourdomain.com/sitemap.xml' to your robots.txt file. This lets any crawler discover the sitemap automatically without you submitting it manually.",
    },
    {
      title: "Submit it in Google Search Console",
      body: "In Search Console, open the Sitemaps report, enter the sitemap URL and submit it. Google will fetch it, report how many URLs it read, and flag any parsing errors.",
    },
  ],
  tips: [
    "Only include canonical URLs: listing both a page and its duplicate sends mixed signals about which version to index.",
    "Keep the sitemap in sync with your site: remove URLs that now 404 or redirect, since a sitemap full of dead links erodes crawler trust.",
    "Use absolute URLs with the correct protocol (https) and host, relative paths aren't valid in a sitemap.",
    "For very large or frequently changing sites, automate sitemap generation so it always reflects the current set of live pages.",
  ],
  faq: [
    {
      question: "Do I really need an XML sitemap?",
      answer:
        "Small, well-linked sites can be crawled without one, but a sitemap helps on large sites, brand-new sites with few links, and sites with pages that are hard to reach through navigation. It rarely hurts and often helps discovery.",
    },
    {
      question: "How many URLs can a single sitemap contain?",
      answer:
        "A single sitemap file can hold up to 50,000 URLs and must stay under 50 MB uncompressed. If you exceed either limit, split the URLs across multiple sitemaps and list them all in a sitemap index file.",
    },
    {
      question: "Where should the sitemap file live?",
      answer:
        "Host it at your domain root, typically /sitemap.xml, so it's easy to find and can cover the whole site. A sitemap can only include URLs on the same host it's served from.",
    },
    {
      question: "How often should I update my sitemap?",
      answer:
        "Update it whenever you add, remove or significantly change pages. Automated generation is ideal so the sitemap always mirrors your live URLs. A stale sitemap pointing to dead pages can waste crawl budget.",
    },
    {
      question: "Does submitting a sitemap guarantee indexing?",
      answer:
        "No. A sitemap tells Google which pages exist and would like to be crawled, but indexing is still Google's decision based on quality, duplication and crawl priorities. It speeds discovery, not guaranteed inclusion.",
    },
  ],
  relatedToolSlugs: [
    "robots-txt-generator",
    "robots-txt-validator",
    "meta-tag-generator",
    "schema-generator",
  ],
  relatedHowToSlugs: [],
};

export default howto;
