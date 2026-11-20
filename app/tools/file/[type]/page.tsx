import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { AccentKey, FaqItem, IconName } from "@/types";
import { ROUTES } from "@/config/constants";
import { absoluteUrl, pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqJsonLd,
  itemListJsonLd,
} from "@/lib/schema";
import {
  getAllFileTypes,
  getToolsByFileType,
  FILE_TYPE_MIN_INDEXED,
} from "@/lib/discovery";
import { getAllPosts } from "@/lib/blog";
import { getRelatedWeb } from "@/lib/seo/related-web";
import { Container } from "@/components/shared/container";
import { RelatedWeb } from "@/components/shared/related-web";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolGrid } from "@/components/shared/tool-grid";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { DiscoveryHero } from "@/components/discovery/discovery-hero";
import {
  DiscoveryCardGrid,
  type DiscoveryCardItem,
} from "@/components/discovery/discovery-card-grid";

/**
 * File-type navigation. Every tool that works with a given file type (PDF,
 * PNG, CSV, MP4…). Derived from `getAllFileTypes()`, so it auto-scales as tools
 * are added. Ships CollectionPage + ItemList + FAQ + Breadcrumb JSON-LD.
 * Server-rendered, fully static.
 */

interface FileTypePageProps {
  params: Promise<{ type: string }>;
}

/**
 * Per-extension presentation (icon + accent + a human display name). Unknown
 * types fall back to a neutral default so a page always renders sensibly.
 */
const TYPE_META: Record<string, { icon: IconName; accent: AccentKey; label: string }> = {
  pdf: { icon: "FileText", accent: "rose", label: "PDF" },
  png: { icon: "Image", accent: "sky", label: "PNG" },
  jpg: { icon: "Image", accent: "sky", label: "JPG" },
  webp: { icon: "Image", accent: "cyan", label: "WebP" },
  gif: { icon: "Image", accent: "violet", label: "GIF" },
  svg: { icon: "PenTool", accent: "orange", label: "SVG" },
  ico: { icon: "Image", accent: "amber", label: "ICO" },
  avif: { icon: "Image", accent: "cyan", label: "AVIF" },
  heic: { icon: "Image", accent: "indigo", label: "HEIC" },
  bmp: { icon: "Image", accent: "sky", label: "BMP" },
  tiff: { icon: "Image", accent: "indigo", label: "TIFF" },
  docx: { icon: "FileText", accent: "indigo", label: "Word (DOCX)" },
  doc: { icon: "FileText", accent: "indigo", label: "Word (DOC)" },
  csv: { icon: "Table", accent: "emerald", label: "CSV" },
  tsv: { icon: "Table", accent: "emerald", label: "TSV" },
  xlsx: { icon: "Table", accent: "emerald", label: "Excel (XLSX)" },
  xls: { icon: "Table", accent: "emerald", label: "Excel (XLS)" },
  json: { icon: "Braces", accent: "violet", label: "JSON" },
  yaml: { icon: "Braces", accent: "amber", label: "YAML" },
  xml: { icon: "FileCode", accent: "orange", label: "XML" },
  sql: { icon: "Database", accent: "sky", label: "SQL" },
  md: { icon: "FileText", accent: "sky", label: "Markdown" },
  html: { icon: "FileCode", accent: "orange", label: "HTML" },
  txt: { icon: "FileText", accent: "indigo", label: "Text (TXT)" },
  epub: { icon: "BookOpen", accent: "emerald", label: "EPUB" },
  pptx: { icon: "FileText", accent: "amber", label: "PowerPoint (PPTX)" },
  ppt: { icon: "FileText", accent: "amber", label: "PowerPoint (PPT)" },
  mp4: { icon: "Video", accent: "cyan", label: "MP4" },
  webm: { icon: "Video", accent: "violet", label: "WebM" },
  mov: { icon: "Video", accent: "indigo", label: "MOV" },
  mkv: { icon: "Video", accent: "rose", label: "MKV" },
  avi: { icon: "Video", accent: "amber", label: "AVI" },
  flv: { icon: "Video", accent: "orange", label: "FLV" },
  mp3: { icon: "AudioLines", accent: "rose", label: "MP3" },
  wav: { icon: "AudioLines", accent: "cyan", label: "WAV" },
  flac: { icon: "AudioLines", accent: "violet", label: "FLAC" },
  aac: { icon: "AudioLines", accent: "amber", label: "AAC" },
  ogg: { icon: "AudioLines", accent: "emerald", label: "OGG" },
  m4a: { icon: "AudioLines", accent: "indigo", label: "M4A" },
  opus: { icon: "AudioLines", accent: "sky", label: "Opus" },
  css: { icon: "FileCode", accent: "sky", label: "CSS" },
  js: { icon: "Braces", accent: "amber", label: "JavaScript" },
  ts: { icon: "Braces", accent: "sky", label: "TypeScript" },
};

function metaFor(type: string): { icon: IconName; accent: AccentKey; label: string } {
  return TYPE_META[type] ?? { icon: "File", accent: "indigo", label: type.toUpperCase() };
}

export function generateStaticParams(): { type: string }[] {
  return getAllFileTypes().map((facet) => ({ type: facet.type }));
}

export async function generateMetadata({
  params,
}: FileTypePageProps): Promise<Metadata> {
  const { type } = await params;
  const tools = getToolsByFileType(type);
  if (tools.length === 0) {
    return { title: "File type not found", robots: { index: false, follow: false } };
  }
  const { label } = metaFor(type);
  const meta = buildMetadata({
    title: `${label} Tools, ${pluralize(tools.length, "Free Online Tool")}`,
    description: `Every free ${label} tool in one place, convert, compress, edit and more. ${pluralize(
      tools.length,
      "tool",
    )}, all running privately in your browser with no sign-up.`,
    canonical: `/tools/file/${type}`,
  });
  // Thin-content guard: a hub with too few tools stays reachable (no 404) but is
  // kept out of the index, still `follow` so any link equity flows onward.
  if (tools.length < FILE_TYPE_MIN_INDEXED) {
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

function buildFaq(label: string, count: number, firstTool?: string): FaqItem[] {
  return [
    {
      question: `What can I do with ${label} files here?`,
      answer: `We host ${pluralize(
        count,
        "free tool",
      )} that work with ${label} files: converting, compressing, editing and more${firstTool ? `, such as ${firstTool}` : ""}. Open any tool to get started.`,
    },
    {
      question: `Are the ${label} tools free?`,
      answer:
        "Yes. Every tool is completely free with no account, no trial and no usage limit: nothing is watermarked or paywalled.",
    },
    {
      question: `Are my ${label} files uploaded anywhere?`,
      answer:
        "No. These tools run entirely in your browser, so your files are processed on your own device and never uploaded, logged or stored.",
    },
  ];
}

export default async function FileTypePage({ params }: FileTypePageProps) {
  const { type } = await params;
  const tools = getToolsByFileType(type);
  if (tools.length === 0) notFound();

  const { icon, accent, label } = metaFor(type);

  // Related file types: the next most-supported types (excluding this one).
  const related = getAllFileTypes()
    .filter((facet) => facet.type !== type)
    .slice(0, 6);

  const relatedItems: DiscoveryCardItem[] = related.map((facet) => {
    const m = metaFor(facet.type);
    return {
      href: `/tools/file/${facet.type}`,
      icon: m.icon,
      accent: m.accent,
      title: `${m.label} tools`,
      description: `Convert, compress and edit ${m.label} files.`,
      meta: pluralize(facet.count, "tool"),
    };
  });

  const firstTool = tools[0];
  const faq = buildFaq(label, tools.length, firstTool?.title);

  // Slim internal-linking web for this file-type hub: seed matching with the
  // type, its label, and the categories the matching tools belong to.
  const relatedWeb = getRelatedWeb({
    kind: "hub",
    title: `${label} tools`,
    fileTypes: [type],
    tags: [...new Set(tools.map((t) => t.category))],
    allPosts: await getAllPosts(),
  });

  const breadcrumb = [
    { label: "Home", href: ROUTES.home },
    { label: "By File Type", href: `/tools/file/${type}` },
    { label: `${label} tools`, href: `/tools/file/${type}` },
  ];

  return (
    <div className="pb-16 sm:pb-24">
      <DiscoveryHero
        breadcrumb={breadcrumb}
        icon={icon}
        accent={accent}
        title={`${label} tools`}
        description={`Every free tool that works with ${label} files: convert, compress, edit and more, all in one place.`}
        badge={{ icon: "File", label: pluralize(tools.length, "tool") }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={`${pluralize(tools.length, "tool")} for ${label} files`}
            description="All free, all private. Open any tool to get started."
          />
          <div className="mt-8">
            <ToolGrid tools={tools} columns={4} />
          </div>
        </Container>
      </section>

      {relatedItems.length > 0 ? (
        <section className="py-10 sm:py-14">
          <Container>
            <SectionHeading title="Browse by file type" />
            <div className="mt-8">
              <DiscoveryCardGrid items={relatedItems} columns={3} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── Related web (slim internal-linking bundle) ───────────────────── */}
      <section className="py-10 sm:py-14">
        <Container>
          <RelatedWeb bundle={relatedWeb} title="Keep exploring" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container size="narrow">
          <FAQ items={faq} />
        </Container>
      </section>

      {firstTool ? (
        <section className="pt-2 sm:pt-6">
          <Container>
            <CTA
              title={`Start with ${firstTool.title}`}
              description="Free, private and instant. Everything runs in your browser."
              primary={{ label: `Try ${firstTool.title}`, href: ROUTES.tool(firstTool.slug) }}
              secondary={{ label: "All collections", href: ROUTES.collections }}
            />
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          collectionPageJsonLd({
            name: `${label} tools`,
            description: `Free online tools for ${label} files, convert, compress and edit.`,
            url: `/tools/file/${type}`,
          }),
          itemListJsonLd(
            tools.map((t) => ({
              name: t.title,
              url: absoluteUrl(ROUTES.tool(t.slug)),
            })),
          ),
          faqJsonLd(faq),
        ]}
      />
    </div>
  );
}
