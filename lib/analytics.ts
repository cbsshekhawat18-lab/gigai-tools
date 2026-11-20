/**
 * GigAI Tools, lightweight, provider-agnostic analytics.
 *
 * Events are pushed to Google Tag Manager's `dataLayer` and/or forwarded to
 * `gtag` when either is present on `window`. When neither is available (local
 * dev, tests, or a consent-less session) events are logged to the console in
 * development and otherwise silently dropped. Everything here is SSR-safe:
 * during server rendering `window` is undefined and every call is a no-op.
 *
 * No PII is collected: tools run entirely client-side and we only record the
 * shape of interactions (which tool, which phase), never file contents.
 */

/** The tool-workspace lifecycle events emitted by the image tools. */
export type ToolEventName =
  | "tool_view"
  | "file_selected"
  | "paste"
  | "process_started"
  | "process_completed"
  | "process_failed"
  | "download"
  | "reset";

/** Minimal shape of the globals we optionally talk to. */
interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

/** True only in a browser with a real `window`. */
function hasWindow(): boolean {
  return typeof window !== "undefined";
}

/** True when running a Node/dev build (used to gate console logging). */
function isDev(): boolean {
  return (
    typeof process !== "undefined" && process.env?.NODE_ENV !== "production"
  );
}

/**
 * Record an analytics event. Safe to call from anywhere (server or client):
 * on the server it does nothing. On the client it forwards to `dataLayer`
 * and/or `gtag`, falling back to a dev-only console log.
 */
export function track(event: string, props: Record<string, unknown> = {}): void {
  if (!hasWindow()) return;

  const w = window as AnalyticsWindow;
  const payload = { event, ...props };
  let delivered = false;

  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push(payload);
    delivered = true;
  }

  if (typeof w.gtag === "function") {
    w.gtag("event", event, props);
    delivered = true;
  }

  if (!delivered && isDev()) {
     
    console.debug("[analytics]", event, props);
  }
}

/**
 * Record a tool-workspace event, automatically tagging it with the tool slug
 * and a stable `category: "image_tool"` so events group cleanly in GA4/GTM.
 */
export function trackTool(
  event: ToolEventName,
  slug: string,
  props: Record<string, unknown> = {},
): void {
  track(event, { tool: slug, category: "image_tool", ...props });
}
