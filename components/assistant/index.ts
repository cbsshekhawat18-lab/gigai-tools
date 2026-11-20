/**
 * GigAI ASSISTANT, public entry point.
 *
 * Mount `<GigaiAssistant />` ONCE, globally (in app/layout.tsx, inside <body>
 * after <main>). It renders only the tiny floating launcher; the panel and the
 * intent engine (and thus the tool registry) are lazy-loaded on first open, so
 * nothing heavy enters the initial page bundle.
 *
 * The launcher itself is a client component; because it only ships the button on
 * first paint, importing it from a server layout is safe.
 */
export { AssistantButton as GigaiAssistant } from "./assistant-button";
export { AssistantButton } from "./assistant-button";
export type { AssistantPanelProps } from "./assistant-panel";
