"use client";

import dynamic from "next/dynamic";

import type { SmartAssistProps } from "@/components/assist/smart-assist";

/**
 * Client mount for GigAI Smart Assist.
 *
 * Smart Assist is an interactive, browser-only surface: it lazy-imports the
 * planner (which pulls the tool registry) and the WASM/model engines only when
 * the user acts. There is nothing to server-render, so we code-split it via
 * `next/dynamic({ ssr:false })`, permitted only inside a Client Component,
 * hence this thin wrapper. Server pages (the homepage hero, `/assist`) render
 * `<SmartAssistMount/>` directly and stay fast, SEO-rich shells; the assistant
 * streams in as its own chunk. This mirrors `components/workspace/workspace-mount`.
 */

/**
 * Pre-hydration skeleton at the component's REAL mounted height (measured
 * live 2026-08-21: ~1341px at 360w, ~1138px at 1280w), so the sections below
 * do not jump ~1200px when the chunk lands. The blocks sketch the actual
 * layout: dropzone, goal chips, helper text.
 */
function SmartAssistSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[1300px] animate-pulse space-y-6 lg:min-h-[1100px]"
    >
      <div className="h-56 rounded-xl border-2 border-dashed border-border bg-muted/40" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-muted" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

const SmartAssist = dynamic(
  () => import("@/components/assist/smart-assist").then((m) => m.SmartAssist),
  {
    ssr: false,
    loading: () => <SmartAssistSkeleton />,
  },
);

export function SmartAssistMount(props: SmartAssistProps) {
  return <SmartAssist {...props} />;
}
