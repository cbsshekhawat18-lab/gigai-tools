/**
 * Branded, category-based blog cover images. Each tool category has a couple of
 * on-brand cover variants (in /public/images/blog); an article gets one
 * deterministically from its slug, so articles of the same type share a
 * consistent look without needing a bespoke image each. Pure + client-safe.
 */
const COVERS: Record<string, string[]> = {
  "image-tools": [
    "/images/blog/image-tools-cover.svg",
    "/images/blog/image-tools-cover-2.svg",
  ],
  "pdf-tools": [
    "/images/blog/pdf-tools-cover.svg",
    "/images/blog/pdf-tools-cover-2.svg",
  ],
  "developer-tools": [
    "/images/blog/developer-tools-cover.svg",
    "/images/blog/developer-tools-cover-2.svg",
  ],
  "qr-tools": [
    "/images/blog/qr-tools-cover.svg",
    "/images/blog/qr-tools-cover-2.svg",
  ],
  "seo-tools": [
    "/images/blog/seo-tools-cover.svg",
    "/images/blog/seo-tools-cover-2.svg",
  ],
  "svg-tools": [
    "/images/blog/svg-tools-cover.svg",
    "/images/blog/svg-tools-cover-2.svg",
  ],
  "document-tools": [
    "/images/blog/document-tools-cover.svg",
    "/images/blog/document-tools-cover-2.svg",
  ],
  "video-tools": [
    "/images/blog/video-tools-cover.svg",
    "/images/blog/video-tools-cover-2.svg",
  ],
  "audio-tools": [
    "/images/blog/audio-tools-cover.svg",
    "/images/blog/audio-tools-cover-2.svg",
  ],
  "ai-tools": [
    "/images/blog/ai-tools-cover.svg",
    "/images/blog/ai-tools-cover-2.svg",
  ],
};

const DEFAULT_COVER = "/images/blog/default-cover.svg";

/** Resolve a cover image for a post from its category + slug. */
export function getBlogCover(post: { slug: string; category?: string }): string {
  const set = post.category ? COVERS[post.category] : undefined;
  if (!set || set.length === 0) return DEFAULT_COVER;
  const sum = [...post.slug].reduce((total, ch) => total + ch.charCodeAt(0), 0);
  return set[sum % set.length] ?? DEFAULT_COVER;
}
