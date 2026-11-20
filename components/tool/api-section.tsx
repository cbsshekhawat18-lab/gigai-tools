import Link from "next/link";

import { CodePanel } from "@/components/devdocs/code-panel";
import { Container } from "@/components/shared/container";
import { engineForSiteTool } from "@/lib/devdocs/engines";
import { LANGS, LANG_LABELS, runSample } from "@/lib/devdocs/samples";

/**
 * "Use this tool via the API" - rendered on a tool page only when a real
 * API engine backs it (same manifest as the docs, so this section can never
 * advertise an endpoint that doesn't run). Same card styling as the rest of
 * the page on purpose: information, not an ad.
 */
export function ToolApiSection({ toolSlug, toolTitle }: { toolSlug: string; toolTitle: string }) {
  const engine = engineForSiteTool(toolSlug);
  if (!engine) return null;
  const request: Record<string, string> = {};
  for (const lang of LANGS) request[lang] = runSample(engine, lang);

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Use {toolTitle} in your code
              </h2>
              <p className="mt-3 max-w-[60ch] text-sm text-muted-foreground">
                The same engine runs behind the free API: send files, get signed
                download links back, and everything is deleted after the retention
                you choose. 1,000 tasks a month, no card.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li>
                  <Link href={`/developers/tools/${engine.slug}`} className="text-primary hover:underline">
                    API docs for this tool
                  </Link>
                </li>
                <li>
                  <Link href="/developers" className="text-primary hover:underline">
                    Get a free API key
                  </Link>
                </li>
                <li>
                  <Link href={`/developers/builder#${engine.slug}`} className="text-primary hover:underline">
                    Open in the request builder
                  </Link>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Also runs as a task inside a job - chain it with the other engines.{" "}
                <Link href="/developers/docs/recipes" className="text-primary hover:underline">
                  See the recipes
                </Link>
                .
              </p>
            </div>
            <div className="mt-6 min-w-0 lg:mt-0">
              <CodePanel
                samples={{
                  langs: LANGS.map((id) => ({ id, label: LANG_LABELS[id] })),
                  request,
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
