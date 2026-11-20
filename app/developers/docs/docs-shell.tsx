import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/shared/container";
import { DocsSearch, type SearchItem } from "@/components/devdocs/search";
import { CopyPage, PageFeedback } from "@/components/devdocs/page-extras";
import { REQUEST_ERRORS, TASK_ERRORS } from "@/lib/devdocs/errors-data";
import { getEngines } from "@/lib/devdocs/engines";

/**
 * Docs frame, three columns on desktop: grouped left nav with search,
 * content, and an optional right panel (the code panel on reference and
 * tool pages). Existing pages keep working - panel is opt-in. The search
 * index is assembled here from the same sources the pages render from.
 */

type NavGroup = { label: string; items: { href: string; label: string }[] };

function navGroups(): NavGroup[] {
  return [
    {
      label: "Getting started",
      items: [
        { href: "/developers/docs", label: "Quickstart" },
        { href: "/developers/docs/jobs", label: "Jobs & tasks" },
        { href: "/developers/docs/webhooks", label: "Webhooks" },
      ],
    },
    {
      label: "Reference",
      items: [
        { href: "/developers/docs/api", label: "API reference" },
        { href: "/developers/docs/tools", label: "Tool catalog" },
        { href: "/developers/errors", label: "Error codes" },
        { href: "/developers/rate-limits", label: "Rate limits" },
      ],
    },
    {
      label: "Tools",
      items: getEngines().map((e) => ({
        href: `/developers/tools/${e.slug}`,
        label: e.name,
      })),
    },
    {
      label: "SDKs & agents",
      items: [
        { href: "/developers/docs/sdks", label: "Python, Node, CLI" },
        { href: "/developers/docs/mcp", label: "MCP server" },
        { href: "/developers/builder", label: "Request builder" },
        { href: "/site-audit", label: "Site Audit" },
      ],
    },
    {
      label: "Resources",
      items: [
        { href: "/developers/docs/recipes", label: "Recipes" },
        { href: "/developers/openapi.yaml", label: "openapi.yaml" },
        { href: "/developers/dashboard", label: "Dashboard" },
      ],
    },
  ];
}

function searchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const group of navGroups()) {
    for (const item of group.items) {
      items.push({ label: item.label, href: item.href, group: group.label });
    }
  }
  for (const engine of getEngines()) {
    const opts = Object.keys(engine.options_schema.properties ?? {}).join(" ");
    items.push({
      label: engine.slug,
      href: `/developers/tools/${engine.slug}`,
      group: "Tools",
      keywords: `${engine.name} ${engine.description} ${opts}`,
    });
    for (const opt of Object.keys(engine.options_schema.properties ?? {})) {
      items.push({
        label: `${opt} (${engine.slug})`,
        href: `/developers/tools/${engine.slug}`,
        group: "Options",
        keywords: opt,
      });
    }
  }
  for (const [code] of REQUEST_ERRORS) {
    items.push({ label: code, href: `/developers/errors#${code}`, group: "Errors" });
  }
  for (const [code] of TASK_ERRORS) {
    items.push({ label: code, href: `/developers/errors#${code}`, group: "Errors" });
  }
  return items;
}

function LeftNav({ current }: { current: string }) {
  return (
    <nav className="space-y-5">
      {navGroups().map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    item.href === current
                      ? "block border-l-2 border-primary py-0.5 pl-2 text-sm font-semibold text-foreground"
                      : "block border-l-2 border-transparent py-0.5 pl-2 text-sm text-muted-foreground hover:text-foreground"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="pt-2 text-[11px] text-muted-foreground">API version: v1</p>
    </nav>
  );
}

export function DocsShell({
  title,
  lead,
  current,
  children,
  panel,
}: {
  title: string;
  lead: string;
  current: string;
  children: ReactNode;
  panel?: ReactNode;
}) {
  const index = searchIndex();
  return (
    <section className="py-8">
      <Container>
        <div
          className={
            panel
              ? "gap-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_360px]"
              : "gap-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]"
          }
        >
          <aside className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
              <div className="mb-4">
                <DocsSearch items={index} />
              </div>
              <details className="lg:hidden" open={false}>
                <summary className="cursor-pointer text-sm font-semibold text-foreground">
                  Docs menu
                </summary>
                <div className="mt-3">
                  <LeftNav current={current} />
                </div>
              </details>
              <div className="hidden lg:block">
                <LeftNav current={current} />
              </div>
            </div>
          </aside>

          <div className="min-w-0 max-w-[760px]" data-docs-content>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  <Link href="/developers" className="hover:text-foreground hover:underline">
                    Developer API
                  </Link>
                  {" / docs"}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-foreground">{title}</h1>
              </div>
              <CopyPage />
            </div>
            <p className="mt-3 max-w-[70ch] text-muted-foreground">{lead}</p>
            <div className="mt-8 space-y-10">{children}</div>
            <div className="mt-12 border-t border-border pt-6">
              <PageFeedback page={current} />
            </div>
          </div>

          {panel ? (
            <aside className="mt-8 xl:mt-0">
              <div className="xl:sticky xl:top-20">{panel}</div>
            </aside>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export function Code({ children, label }: { children: string; label?: string }) {
  return (
    <div className="my-3">
      {label ? (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      ) : null}
      <pre className="overflow-x-auto rounded border border-border bg-muted/40 p-4 font-mono text-[13px] leading-relaxed text-foreground">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function DocH2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group scroll-mt-24 text-lg font-semibold text-foreground">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">{children}</p>;
}
