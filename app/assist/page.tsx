import type { Metadata } from "next";

import type { BreadcrumbItem, FaqItem } from "@/types";
import { ROUTES } from "@/config/constants";
import { buildMetadata } from "@/lib/seo";
import { Icon } from "@/lib/icons";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";
import { Container } from "@/components/shared/container";
import { AskBanner } from "@/components/shared/ask-banner";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQ } from "@/components/shared/faq";
import { CTA } from "@/components/shared/cta";
import { SmartAssistMount } from "@/components/assist/smart-assist-mount";

/**
 * /assist, the dedicated GigAI Smart Assist page.
 *
 * A fast, SEO-rich server shell around the Smart Assist island: upload a file,
 * describe your goal, and GigAI analyses it, plans the steps, and runs the right
 * existing tools: entirely in the browser. Additive to the platform (no tool
 * changed, no URL moved), so it strengthens SEO rather than breaking it.
 */

export const metadata: Metadata = buildMetadata({
  title: "GigAI Smart Assist, Upload a File, Describe Your Goal, Done",
  description:
    "Drop any file (image, PDF, document, audio, video or data) tell GigAI what you need in plain words, and it works out the steps and runs the right tools for you. Free, private, entirely in your browser. No sign-up.",
  keywords: [
    "smart file assistant",
    "what tool do i need",
    "compress file",
    "prepare image for instagram",
    "reduce pdf size",
    "online file helper",
    "privacy-first file tools",
  ],
  canonical: ROUTES.assist,
});

const CRUMBS: BreadcrumbItem[] = [
  { label: "Home", href: ROUTES.home },
  { label: "Smart Assist", href: ROUTES.assist },
];

const HOW_IT_WORKS = [
  { icon: "Upload", title: "Upload", description: "Drop a file, paste from your clipboard, or browse. Nothing is uploaded to a server, it's read on your device." },
  { icon: "ScanLine", title: "GigAI reads it", description: "It checks the type, size, dimensions, pages, transparency, metadata and more, then scores its health." },
  { icon: "Sparkles", title: "Tell it your goal", description: "“Under 2 MB for email”, “prepare for Instagram”, “convert to a PDF”: plain words, no tool names." },
  { icon: "CircleCheck", title: "Get the result", description: "GigAI runs the right tools in order and hands back your finished file, with helpful next steps." },
] as const;

const SUPPORTED = [
  { icon: "Image", label: "Images", note: "PNG · JPG · WebP · GIF · SVG" },
  { icon: "FileText", label: "PDFs & docs", note: "PDF · DOCX · TXT · RTF" },
  { icon: "Sheet", label: "Data", note: "CSV · JSON · XML · XLSX" },
  { icon: "Music", label: "Audio", note: "MP3 · WAV · M4A · FLAC" },
  { icon: "Video", label: "Video", note: "MP4 · WebM · MOV · MKV" },
  { icon: "Code", label: "Code & web", note: "HTML · CSS · JS · SVG" },
] as const;

const ASSIST_FAQ: FaqItem[] = [
  {
    question: "What is GigAI Smart Assist?",
    answer:
      "It's a single place to get file tasks done without knowing which tool to pick. You upload a file and describe your goal in plain language. GigAI analyses the file, works out the steps, and runs the right existing tools for you, then offers useful next steps.",
  },
  {
    question: "Are my files uploaded anywhere?",
    answer:
      "No. Smart Assist reads and processes your files entirely in your browser. Nothing is sent to a server, stored, or logged. When a task genuinely needs more than the browser can do, GigAI tells you and points you to the right tool instead of silently uploading anything.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No sign-up, no login, no cost. Your recent workflows are remembered privately on your own device so you can reuse them, and you can clear them any time.",
  },
  {
    question: "What kinds of goals can it handle?",
    answer:
      "Things like “make this under 2 MB”, “prepare this image for Instagram”, “convert this to a PDF” or “compress this PDF” run right here. For tasks that belong in a dedicated tool, GigAI opens the exact right one with your file ready to go.",
  },
  {
    question: "Is it using AI?",
    answer:
      "Understanding your goal is done with a fast, private, on-device matcher. Not a chatbot and nothing is sent to any AI service. The actual work is done by the same proven, browser-based tools the rest of GigAI uses.",
  },
];

export default function AssistPage() {
  return (
    <div className="pb-20">
      <JsonLd
        data={[breadcrumbJsonLd(CRUMBS), faqJsonLd(ASSIST_FAQ)]}
      />

      {/* Hero + the assistant */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/10 to-transparent"
        />
        <Container className="py-10 sm:py-14">
          <Breadcrumb items={CRUMBS} className="mb-6" />
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Icon name="Sparkles" size={13} className="text-primary" />
              GigAI Smart Assist
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Beta
              </span>
            </span>
            <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Upload once. Tell us your goal.{" "}
              <span className="text-primary">
                GigAI does the rest.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Stop hunting for the right tool. Drop a file, say what you need, and GigAI
              analyses it, plans the steps, and runs them, privately, in your browser.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-xl text-left">
            <AskBanner context="Smart Assist" />
          </div>

          <div className="mt-8">
            <SmartAssistMount variant="page" />
          </div>
        </Container>
      </section>

      {/* How it works */}
      <Container className="py-14 sm:py-16">
        <SectionHeading
          title="How it works"
          description="Four steps, no tool names to memorise."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border/60 bg-card p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={s.icon} size={22} />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Supported files */}
      <Container className="py-4 sm:py-6">
        <SectionHeading
          title="Works with your files"
          description="Every file gets a health report and the right next step, many run start-to-finish right here."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTED.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon name={s.icon} size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Privacy strip */}
      <Container className="py-8">
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="ShieldCheck" size={22} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">Private by design</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Your files never leave your device. Analysis and processing happen in your browser,
              there are no accounts, and nothing is stored or logged. If a task ever needs more than
              the browser can do, GigAI says so. It never uploads anything quietly.
            </p>
          </div>
        </div>
      </Container>

      {/* FAQ */}
      <Container size="narrow" className="py-14 sm:py-16">
        <FAQ items={ASSIST_FAQ} />
      </Container>

      {/* CTA */}
      <Container className="py-6">
        <CTA
          title="Prefer to pick a tool yourself?"
          description="Browse the full library of fast, free, privacy-first tools. Every one runs right in your browser."
          primary={{ label: "Browse all tools", href: ROUTES.search }}
          secondary={{ label: "Explore workspaces", href: ROUTES.workspaces }}
        />
      </Container>
    </div>
  );
}
