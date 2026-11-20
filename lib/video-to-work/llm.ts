/**
 * The one LLM adapter the ticket pipeline uses. Local Ollama only for now:
 * the server analysis endpoint speaks a fixed findings contract and cannot run
 * these prompts until the backend grows a pass-through route - until then,
 * server-provider users stay on the existing Findings flow (lib/video-work/).
 *
 * Temperature 0 everywhere: the spec's determinism acceptance test is "same
 * video twice = same ticket count", and sampling noise is the first thing
 * that breaks it.
 */

import type { ChatFn } from "./types";

export const DEFAULT_OLLAMA_HOST = "http://localhost:11434";

/** Build a ChatFn backed by a local Ollama chat endpoint. */
export function ollamaChat(host: string, model: string): ChatFn {
  const base = host.replace(/\/+$/, "");
  return async (system, user) => {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature: 0 },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`Ollama replied ${res.status}. Is the model "${model}" pulled?`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content ?? "";
  };
}
