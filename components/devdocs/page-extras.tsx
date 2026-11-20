"use client";

import { useState } from "react";

/** "Was this page helpful?" - stores to the API for the admin panel. */
export function PageFeedback({ page }: { page: string }) {
  const [state, setState] = useState<"idle" | "comment" | "done">("idle");
  const [helpful, setHelpful] = useState(true);
  const [comment, setComment] = useState("");

  const send = async (vote: boolean, text?: string) => {
    try {
      await fetch("/v1/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ page, helpful: vote, comment: text || undefined }),
      });
    } catch {
      /* feedback is best-effort */
    }
    setState("done");
  };

  if (state === "done") {
    return <p className="text-sm text-muted-foreground">Thanks - noted.</p>;
  }
  if (state === "comment") {
    return (
      <div className="max-w-md">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What was missing or wrong? (optional)"
          rows={3}
          className="w-full rounded border border-border bg-background p-2 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={() => send(helpful, comment)}
          className="mt-2 rounded border border-border px-3 py-1 text-sm text-foreground hover:border-foreground/40"
        >
          Send
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>Was this page helpful?</span>
      <button
        type="button"
        onClick={() => send(true)}
        className="rounded border border-border px-3 py-0.5 hover:border-foreground/40 hover:text-foreground"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => {
          setHelpful(false);
          setState("comment");
        }}
        className="rounded border border-border px-3 py-0.5 hover:border-foreground/40 hover:text-foreground"
      >
        No
      </button>
    </div>
  );
}

/** Copies the page's main content as readable markdown-ish text. */
export function CopyPage() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        const main = document.querySelector("[data-docs-content]");
        if (!main) return;
        const md = extractMarkdown(main);
        navigator.clipboard.writeText(md).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground"
    >
      {copied ? "Copied" : "Copy page"}
    </button>
  );
}

function extractMarkdown(root: Element): string {
  const out: string[] = [];
  root.querySelectorAll("h1, h2, h3, p, pre, li").forEach((el) => {
    const text = (el.textContent ?? "").trim();
    if (!text) return;
    if (el.tagName === "H1") out.push(`# ${text}`);
    else if (el.tagName === "H2") out.push(`## ${text}`);
    else if (el.tagName === "H3") out.push(`### ${text}`);
    else if (el.tagName === "PRE") out.push("```\n" + text + "\n```");
    else if (el.tagName === "LI") out.push(`- ${text}`);
    else out.push(text);
  });
  return out.join("\n\n");
}
