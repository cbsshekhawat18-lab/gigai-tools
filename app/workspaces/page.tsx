import type { Metadata } from "next";
import Link from "next/link";

import type { FaqItem } from "@/types";
import { ROUTES } from "@/config/constants";
import {
  COMING_SOON_WORKSPACES,
  LIVE_WORKSPACES,
  type ComingSoonWorkspace,
  type LiveWorkspace,
} from "@/config/workspaces";
import { absoluteUrl, cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { Icon } from "@/lib/icons";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqJsonLd,
} from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { Badge } from "@/components/ui/badge";

/**
 * /workspaces, the GigAI Workspaces hub.
 *
 * Explains what a workspace is (chain multiple tools on your files without
 * leaving the page), links to each live workspace, and lists the ones still
 * coming. Fully server-rendered with CollectionPage + Breadcrumb + FAQ JSON-LD.
 */

export const metadata: Metadata = buildMetadata({
  title: "GigAI Workspaces, Chain Tools on Your Files, No Uploads",
  description:
    "GigAI Workspaces let you drop your files and chain multiple tools in one place, like Figma for utilities. Image, PDF, SVG, audio, video, document, developer, QR and SEO workspaces are live now. Private, free, browser-based.",
  keywords: [
    "online workspace",
    "chain tools",
    "batch file editor",
    "image workspace",
    "pdf workspace",
    "browser file tools",
  ],
  canonical: ROUTES.workspaces,
});

const HUB_FAQ: FaqItem[] = [
  {
    question: "What is a GigAI Workspace?",
    answer:
      "A workspace lets you drop one or many files and run a whole pipeline of tools across them (compress then resize then convert, or merge then reorder then compress) without hopping between separate single-purpose pages. It feels like a lightweight Figma or Canva for everyday file tasks.",
  },
  {
    question: "How is that different from the individual tools?",
    answer:
      "The standalone tools each do one job. A workspace loads your files once and lets you chain several operations, apply them across a batch, undo any step, and download everything together: all on a single page.",
  },
  {
    question: "Are workspaces private?",
    answer:
      "Yes. Workspaces use the same client-side engines as our tools, so your files are processed entirely in your browser and never uploaded. Your pipeline (the steps you configured) is saved locally so it survives a refresh. The files stay in memory and are re-added after a reload.",
  },
  {
    question: "Which workspaces are available?",
    answer:
      "All nine are live now: Image, PDF, SVG, audio, video, document, developer, QR & barcode, and SEO: each chaining the real client-side tools from its category.",
  },
];

export default function WorkspacesHubPage() {
  const crumbs = [
    { label: "Home", href: ROUTES.home },
    { label: "Workspaces", href: ROUTES.workspaces },
  ];

  return (
    <div className="pb-20">
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "GigAI Workspaces",
            description:
              "Chain multiple tools on your files without leaving the page. Image and PDF workspaces are live now.",
            url: absoluteUrl(ROUTES.workspaces),
          }),
          breadcrumbJsonLd(crumbs),
          faqJsonLd(HUB_FAQ),
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <Container className="py-10 sm:py-14">
          <Breadcrumb items={crumbs} className="mb-6" />
          <div className="flex max-w-2xl flex-col gap-5">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              GigAI Workspaces
            </span>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Chain tools on your files: without leaving the page
            </h1>
            <p className="text-pretty text-base text-muted-foreground sm:text-lg">
              A workspace is a single canvas where you drop your files and run a
              pipeline of operations across all of them at once. No uploads, no
              tab-hopping, no re-importing between steps, just a fast, private,
              Figma-style flow for everyday file work.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Live workspaces ──────────────────────────────────────────────── */}
      <Container className="py-14 sm:py-16">
        <SectionHeading
          title="Live workspaces"
          description="Pick a workspace and start chaining tools on your files right away."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {LIVE_WORKSPACES.map((ws) => (
            <LiveWorkspaceCard key={ws.slug} workspace={ws} />
          ))}
        </div>
      </Container>

      {/* ── Coming soon ──────────────────────────────────────────────────── */}
      {COMING_SOON_WORKSPACES.length > 0 ? (
        <Container className="py-4 sm:py-6">
          <SectionHeading
            title="Coming soon"
            description="More categories are getting the workspace treatment."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMING_SOON_WORKSPACES.map((ws) => (
              <ComingSoonCard key={ws.slug} workspace={ws} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Container size="narrow" className="py-14 sm:py-16">
        <FAQ items={HUB_FAQ} />
      </Container>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <Container className="py-6">
        <CTA
          title="Just need one tool?"
          description="Browse 240+ fast, free, privacy-first tools: every one runs right in your browser."
          primary={{ label: "Browse all tools", href: ROUTES.home }}
          secondary={{ label: "View collections", href: ROUTES.collections }}
        />
      </Container>
    </div>
  );
}

/** A clickable card for a workspace that is live. */
function LiveWorkspaceCard({ workspace }: { workspace: LiveWorkspace }) {
  return (
    <Link
      href={ROUTES.workspace(workspace.slug)}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6",
        "transition-all hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={workspace.icon} size={24} />
        </span>
        <Icon
          name="ArrowRight"
          size={20}
          className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-foreground">{workspace.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {workspace.tagline}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {workspace.operations.map((op) => (
          <Badge key={op} variant="secondary" className="text-xs font-normal">
            {op}
          </Badge>
        ))}
      </div>
    </Link>
  );
}

/**
 * A greyed-out card for a workspace that isn't built yet. All nine workspaces
 * are live today, so this is currently unused. It stays so that re-adding a
 * future workspace to COMING_SOON_WORKSPACES renders correctly with no changes.
 */
function ComingSoonCard({ workspace }: { workspace: ComingSoonWorkspace }) {
  return (
    <div
      aria-disabled="true"
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-5"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon name={workspace.icon} size={20} />
        </span>
        <Badge variant="outline" className="text-xs">
          Coming soon
        </Badge>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">{workspace.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {workspace.tagline}
        </p>
      </div>
    </div>
  );
}

