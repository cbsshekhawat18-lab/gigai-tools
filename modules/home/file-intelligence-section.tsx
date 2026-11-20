import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Container } from "@/components/shared/container";
import { FlagshipArt, type FlagshipArtKind } from "./flagship-art";

/**
 * The flagship band on the homepage.
 *
 * Deliberately NOT rendered as ordinary tool cards. These four are experiences
 * where you bring a file and state a goal, rather than picking a conversion off
 * a grid, and the section needs to read that way or they look like four more
 * entries in a 261-tool directory.
 *
 * Each card carries a concrete example sentence, because "make any file fit" is
 * abstract until you read "get this video under 20MB".
 */
const FLAGSHIPS = [
  {
    href: "/gigai-fit",
    art: "fit" as FlagshipArtKind,
    icon: "Zap",
    accent: "violet" as const,
    eyebrow: "GigAI Fit",
    title: "Make any file fit your target size",
    body: "Tell GigAI the size you need. It identifies the file, picks the right engine and searches for the best quality that fits.",
    example: "“Get this video under 20MB.”",
    cta: "Make it fit",
  },
  {
    href: "/gigai-verify",
    art: "verify" as FlagshipArtKind,
    icon: "Search",
    accent: "sky" as const,
    eyebrow: "GigAI Verify",
    title: "Inspect the signals behind a file",
    body: "Provenance, metadata, structure and compression: with the evidence and its alternative explanation, never a fake verdict.",
    example: "“What can this image actually tell me?”",
    cta: "Verify something",
  },
  {
    href: "/video-to-work",
    art: "video-work" as FlagshipArtKind,
    icon: "ListVideo",
    accent: "indigo" as const,
    eyebrow: "GigAI Video → Work",
    title: "Turn client recordings into developer tasks",
    body: "Bugs, features and design changes pulled out as tickets: each with the client's own words, a timestamp and the screenshot it happened on.",
    example: "“Twenty minutes of Loom, into a task list.”",
    cta: "Analyze a recording",
  },
  {
    href: "/video-intelligence",
    art: "transcribe" as FlagshipArtKind,
    icon: "AudioLines",
    accent: "emerald" as const,
    eyebrow: "GigAI Video Intelligence",
    title: "Transcribe video and audio, privately",
    body: "Whisper runs on your own machine, speaker labels, editable transcript, keywords and caption export, with the recording never uploaded.",
    example: "“Transcribe this interview without sending it anywhere.”",
    cta: "Transcribe something",
  },
  {
    href: "/icon-lab",
    art: "iconlab" as FlagshipArtKind,
    icon: "Shapes",
    accent: "orange" as const,
    eyebrow: "GigAI IconLab",
    title: "Build your own icon system",
    body: "Define a family's design language once and every icon you add later matches it: then export SVG, PNG, React, Vue and a sprite as one package.",
    example: "“98 matching icons from one design decision.”",
    cta: "Build a family",
    // Fifth card in a two-column grid: spanning the row reads as the newest
    // flagship rather than a straggler in an empty row.
    wide: true,
  },
];

/** The two products that justify featuring (spec phase 2); the other three
 *  flagships live at /assist, /video-intelligence and /icon-lab and keep their
 *  own pages - the homepage gives real space to the two differentiated bets. */
const FEATURED_HREFS = new Set(["/video-to-work", "/gigai-fit"]);

export function FileIntelligenceSection() {
  const featured = FLAGSHIPS.filter((f) => FEATURED_HREFS.has(f.href));
  return (
    <section className="border-t border-border bg-muted/30 py-20 md:py-32">
      <Container>
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Bring a file. Say what you need.
          </h2>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Two experiences that work out the method for you: no formats, codecs or
            quality settings to know. Both run in your browser.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((f) => {
            const style = accentStyle(f.accent);
            return (
              <Link
                key={f.href}
                href={f.href}
                className={cn(
                  "group flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm outline-none transition-all",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.border,
                  style.ring,
                  undefined,
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                      style.soft,
                    )}
                  >
                    <Icon name={f.icon} size={22} className={style.text} />
                  </span>
                  <span className={cn("text-sm font-semibold", style.text)}>{f.eyebrow}</span>
                </span>

                <span className="text-lg font-semibold text-foreground">{f.title}</span>
                <span className="text-sm text-muted-foreground">{f.body}</span>

                <FlagshipArt
                  kind={f.art}
                  accentClass={style.text}
                  className="my-1 h-16 w-full max-w-sm self-center text-muted-foreground/70"
                />

                <span className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm italic text-muted-foreground">
                  {f.example}
                </span>

                <span className={cn("mt-1 inline-flex items-center gap-1.5 text-sm font-medium", style.text)}>
                  {f.cta}
                  <Icon
                    name="ArrowRight"
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
