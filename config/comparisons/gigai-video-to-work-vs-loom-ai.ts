import type { Comparison } from "@/types";

/**
 * GigAI Video → Work vs Loom AI — the client-feedback-to-tasks comparison.
 *
 * Same rules as the other brand comparisons: Loom claims from Loom's own
 * published pages only; no prices; genuine credit where Loom wins (it IS the
 * recorder and host, with sharing, comments and viewer insights - we analyse
 * recordings, we don't make or host them). The wedge is precise: with Loom AI
 * the recording and its AI features live on Loom's servers by design; with
 * Video → Work the recording never leaves the device and only transcript
 * text goes to the disclosed analysis step - or nothing at all, via Ollama.
 */
const gigaiVideoToWorkVsLoomAi: Comparison = {
  slug: "gigai-video-to-work-vs-loom-ai",
  a: "GigAI Video → Work",
  b: "Loom AI",
  title: "GigAI Video → Work vs Loom AI: Client Feedback Into Tasks",
  description:
    "Loom AI summarises recordings hosted on Loom. GigAI Video → Work turns a recording into developer tasks while the video never leaves your machine. Different architectures for the same job.",
  seo: {
    title: "Loom AI Alternative for Client Feedback - Video to Tasks, No Upload",
    description:
      "Turn client recordings into tickets without uploading the video: GigAI Video → Work vs Loom AI, compared honestly - including what Loom does that we don't.",
  },
  accent: "amber",
  icon: "GitCompareArrows",

  intro: [
    "Loom made async video normal, and Loom AI adds titles, summaries, chapters and follow-up tasks to recordings in your Loom workspace. It's a genuinely good product - and it is also, by design, a hosting service: recordings live on Loom's servers, which is what makes sharing links and workspace AI possible.",
    "GigAI Video → Work starts from the opposite constraint. The recording - often a client's, often under NDA - is processed on your device: transcription and frame selection are local, and only the transcript text goes to the analysis step, with that trade stated on the page before you start. Run it against local Ollama and nothing leaves at all.",
    "Which is right depends on whose video it is. Your own walkthroughs, recorded in Loom for a team that lives there? Loom AI. A client's confidential recording that you need turned into a ticket list you can defend? That's the job Video → Work was built for.",
  ],

  dimensions: [
    {
      label: "Where the video lives",
      a: "On your device. It is never uploaded - the tool analyses a file or a link you provide.",
      b: "On Loom's servers - it's a recording and hosting platform. That's the product.",
    },
    {
      label: "What the AI step sees",
      a: "Transcript text and selected frames only, disclosed up front. With local Ollama, nothing leaves the machine.",
      b: "The recording in your workspace - Loom AI features run on Loom's infrastructure.",
    },
    {
      label: "Output",
      a: "Developer findings with the client's words, timestamps and screenshots. Exports to Markdown, Jira-compatible CSV and JSON.",
      b: "Titles, summaries, chapters and tasks attached to the recording in Loom.",
    },
    {
      label: "Recording and sharing",
      a: "Neither - it analyses recordings. It doesn't make or host them.",
      b: "Loom's core strength: record, share a link, comments, viewer insights.",
    },
    {
      label: "Evidence trail",
      a: "Every finding carries a timestamp that seeks the local video - a dev can hear the client say it in one click.",
      b: "AI summaries reference the recording. Chapters jump within Loom's player.",
    },
    {
      label: "Account",
      a: "None.",
      b: "Loom account. AI features sit in paid tiers.",
    },
  ],

  whenA: [
    "The recording is a client's and is confidential - NDA work where 'we uploaded it to our video vendor' is a conversation you'd rather not have.",
    "You need tickets a developer can act on without rewatching: verbatim quotes, timestamps, screenshots, exported to Markdown, CSV or JSON.",
    "You want the analysis fully local - point it at Ollama and no text leaves the machine either.",
    "The video came from anywhere - a phone recording, a Meet download, a WeTransfer - not just Loom.",
  ],

  whenB: [
    "You're recording the videos yourself and your team already lives in Loom - the record-share-comment loop is unmatched.",
    "You want summaries and chapters attached to a hosted video people can watch at a link.",
    "Viewer analytics matter - who watched, how far, what they skipped.",
    "You want one tool for making AND understanding the recording, and the content isn't sensitive.",
  ],

  verdict:
    "They overlap on one sentence - 'turn this recording into tasks' - and differ on everything structural. If the recording is yours and lives in Loom, use Loom AI. If it's a client's and shouldn't live anywhere, Video → Work does the analysis while the video stays on your machine - that's the entire point of it.",

  relatedToolSlugs: ["video-to-work", "video-intelligence", "video-compressor"],

  faq: [
    {
      question: "Is GigAI Video → Work a free Loom AI alternative?",
      answer:
        "For the analysis half of the job - recording in, task list out - yes, free with no account. It does not record, host or share video. If you need those, you need Loom or something like it, and the two work fine together.",
    },
    {
      question: "Can it analyse a Loom recording?",
      answer:
        "Yes - paste the share link or drop the downloaded file. Fetching happens through a fenced endpoint, transcription runs locally, and the findings carry timestamps into your local copy.",
    },
    {
      question: "What exactly is sent to the analysis model?",
      answer:
        "The transcript text and a selected frame - never the video file - and the page says so before you start. Choose the local Ollama provider instead and the analysis also stays on your machine entirely.",
    },
  ],

  relatedComparisonSlugs: ["gigai-vs-otter"],
};

export default gigaiVideoToWorkVsLoomAi;
