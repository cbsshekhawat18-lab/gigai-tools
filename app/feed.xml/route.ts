import { SITE } from "@/config/constants";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/utils";

/**
 * RSS 2.0 feed of the latest blog posts. Prerendered at build time for the
 * static export, served from /feed.xml. Linked from the site's <head> and the
 * footer so readers can subscribe without an account or email capture.
 */
export const dynamic = "force-static";

/** Number of most-recent posts to include. */
const MAX_ITEMS = 30;

/** Escape text for inclusion in XML (element text or attribute values). */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC-822 date string, as required by the RSS <pubDate> element. */
function toRfc822(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export async function GET(): Promise<Response> {
  const posts = (await getAllPosts()).slice(0, MAX_ITEMS);
  const feedUrl = absoluteUrl("/feed.xml");
  const blogUrl = absoluteUrl("/blog");
  const lastBuild = posts[0] ? toRfc822(posts[0].date) : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/blog/${post.slug}`);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.description)}</description>`,
        post.author ? `      <dc:creator>${escapeXml(post.author)}</dc:creator>` : "",
        post.category ? `      <category>${escapeXml(post.category)}</category>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${SITE.name} - Blog`)}</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${escapeXml(SITE.language)}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
