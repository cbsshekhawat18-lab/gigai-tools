import type { Tool } from "@/types";
import type { LiveWorkspace } from "@/config/workspaces";
import { ROUTES } from "@/config/constants";
import { absoluteUrl } from "@/lib/utils";
import { getToolBySlug } from "@/lib/registry";
import { Icon } from "@/lib/icons";
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { RelatedTools } from "@/components/shared/related-tools";
import { Badge } from "@/components/ui/badge";
import { WorkspaceMount, type WorkspaceId } from "@/components/workspace/workspace-mount";

/**
 * The SEO shell shared by every live workspace route (image + pdf). It is a
 * SERVER component: it renders all the crawlable content (breadcrumb, hero,
 * how-it-works, features, FAQ, related tools, CTA) and every JSON-LD node from
 * the `LiveWorkspace` config, then mounts the interactive workspace as a
 * code-split, client-only island via {@link WorkspaceMount}. Heavy engines are
 * lazy-imported deep inside that island, so this page's initial payload stays a
 * fast, indexable shell.
 *
 * Keeping this in one component (rather than duplicating markup in each route)
 * follows the platform's DRY rule: a new workspace becomes a ~10-line route
 * plus one config entry.
 */

interface WorkspacePageProps {
  workspace: LiveWorkspace;
}

/** Maps a workspace slug to its standalone tools category slug. */
const WORKSPACE_CATEGORY: Record<LiveWorkspace["slug"], string> = {
  image: "image-tools",
  pdf: "pdf-tools",
  svg: "svg-tools",
  audio: "audio-tools",
  video: "video-tools",
  document: "document-tools",
  developer: "developer-tools",
  qr: "qr-tools",
  seo: "seo-tools",
};

/** As a SoftwareApplication for schema. The workspace is a browser app. */
function workspaceAppJsonLd(ws: LiveWorkspace): object {
  return softwareApplicationJsonLd({
    slug: `${ws.slug}-workspace`,
    title: ws.title,
    description: ws.seoDescription,
    category: WORKSPACE_CATEGORY[ws.slug],
    keywords: ws.keywords,
  } as Tool);
}

export function WorkspacePage({ workspace }: WorkspacePageProps) {
  const route = ROUTES.workspace(workspace.slug);
  const url = absoluteUrl(route);

  const crumbs = [
    { label: "Home", href: ROUTES.home },
    { label: "Workspaces", href: ROUTES.workspaces },
    { label: workspace.title, href: route },
  ];

  // Resolve related standalone tools from the registry (server-side lookup, so
  // no client registry import). Silently skips any slug not currently live.
  const relatedTools = workspace.relatedToolSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => Boolean(t && t.status === "live"));

  return (
    <div className="pb-20">
      <JsonLd
        data={[
          webPageJsonLd({ name: workspace.title, description: workspace.seoDescription, url }),
          workspaceAppJsonLd(workspace),
          howToJsonLd({
            name: `How to use the ${workspace.title}`,
            description: workspace.seoDescription,
            steps: workspace.how,
          }),
          faqJsonLd(workspace.faq),
          breadcrumbJsonLd(crumbs),
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <Container className="py-8 sm:py-12">
          <Breadcrumb items={crumbs} className="mb-6" />

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={workspace.icon} size={22} />
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                {workspace.heroEyebrow}
              </span>
            </div>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {workspace.title}
            </h1>
            <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              {workspace.heroLead}
            </p>

            <div className="flex flex-wrap gap-2">
              {workspace.operations.map((op) => (
                <Badge key={op} variant="secondary" className="font-medium">
                  {op}
                </Badge>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── The interactive workspace (client island) ────────────────────── */}
      <section aria-label={`${workspace.title} editor`} className="border-b border-border/60">
        <Container size="wide" className="py-8 sm:py-10">
          <WorkspaceMount id={workspace.slug as WorkspaceId} />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            All processing happens in your browser and your files are never uploaded.
          </p>
        </Container>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <Container className="py-14 sm:py-16">
        <SectionHeading
          title={`Four steps, one canvas`}
          description="No sign-up, no uploads, build a pipeline and run it across your files."
          align="center"
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {workspace.how.map((step, i) => (
            <li
              key={step.title}
              className="relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name={step.icon} size={20} />
                </span>
                <span className="text-2xl font-semibold text-muted-foreground/30">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <Container className="py-4 sm:py-6">
        <SectionHeading
          title="Built for real, chained work"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workspace.features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-5"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={feature.icon} size={18} />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Container size="narrow" className="py-14 sm:py-16">
        <FAQ items={workspace.faq} />
      </Container>

      {/* ── Related standalone tools ─────────────────────────────────────── */}
      {relatedTools.length > 0 ? (
        <Container className="py-6">
          <RelatedTools
            tools={relatedTools}
            title="Prefer a single tool?"
          />
        </Container>
      ) : null}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <Container className="py-14 sm:py-16">
        <CTA
          title="Explore every GigAI Workspace"
          description="Chain multiple tools on your files without leaving the page: private, free, and fast."
          primary={{ label: "Browse workspaces", href: ROUTES.workspaces }}
          secondary={{ label: "All tools", href: ROUTES.home }}
        />
      </Container>
    </div>
  );
}
