/**
 * GigAI Tools, Markdown engine.
 *
 * GitHub-Flavoured Markdown via marked, then sanitised with DOMPurify so the
 * rendered HTML is safe to inject. Both are dynamic-imported. Safe by default:
 * scripts, event handlers, and dangerous URLs are stripped.
 */

/**
 * Render Markdown (GFM) to sanitised HTML. The output is DOMPurify-cleaned and
 * safe to assign to `innerHTML`. Returns an empty string for empty input.
 */
export async function renderMarkdown(src: string): Promise<string> {
  if (!src) return "";
  const { marked } = await import("marked");
  const DOMPurify = (await import("dompurify")).default;

  // `async:false` keeps marked synchronous so we get a string, not a Promise.
  const rawHtml = marked.parse(src, { gfm: true, breaks: false, async: false });
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
}
