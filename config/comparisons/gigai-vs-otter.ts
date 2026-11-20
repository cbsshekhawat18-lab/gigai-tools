import type { Comparison } from "@/types";

/**
 * GigAI Video Intelligence vs Otter.ai — the transcription comparison.
 *
 * Same discipline as gigai-vs-ilovepdf (read the rules there): claims about
 * Otter come only from their own published pages; no prices, allowance NUMBERS
 * described structurally because they change; genuine credit where Otter is
 * better (live meeting capture, automatic speaker ID, AI summaries, mobile
 * apps, team features). The difference we sell is architectural — their
 * pipeline requires upload, ours runs Whisper in the browser — not a claim
 * that anyone mishandles audio.
 */
const gigaiVsOtter: Comparison = {
  slug: "gigai-vs-otter",
  a: "GigAI Video Intelligence",
  b: "Otter.ai",
  title: "GigAI vs Otter.ai: Transcription Without Uploading Your Audio?",
  description:
    "Otter is a cloud meeting-transcription service. GigAI runs Whisper inside your browser so the recording never uploads. Which fits depends on whether the audio can leave your machine.",
  seo: {
    title: "Otter.ai Alternative That Doesn't Upload Audio - GigAI vs Otter",
    description:
      "Free alternative to Otter.ai for confidential recordings: GigAI transcribes with Whisper in your browser - no upload, no minute allowance. Honest comparison, including where Otter is better.",
  },
  accent: "emerald",
  icon: "GitCompareArrows",

  intro: [
    "Otter.ai is the best-known name in meeting transcription for good reason: it joins your calls live, tells speakers apart automatically, writes summaries, and syncs it all to a searchable workspace. If you're comparing alternatives, be clear that you're not replacing something bad.",
    "The meaningful difference is where the audio goes. Otter's product is built on processing recordings on its servers - that's what enables live capture and team features. GigAI Video Intelligence runs OpenAI's Whisper model inside your browser via transformers.js: the recording is transcribed on your own device and is never uploaded at all.",
    "For an interview under embargo, a client call under NDA, or anything a policy says can't go to a third-party service, that architectural difference is the whole decision. For everyday meeting notes with consent all round, it mostly isn't.",
  ],

  dimensions: [
    {
      label: "Where the audio is processed",
      a: "On your device. Whisper runs in the browser. The recording is never transmitted.",
      b: "On Otter's servers - upload is how the service works, enabling live capture and sync.",
    },
    {
      label: "Live meeting capture",
      a: "No. It transcribes recordings you already have.",
      b: "Yes - joins Zoom, Meet and Teams calls and transcribes in real time.",
    },
    {
      label: "Speaker identification",
      a: "Manual labels you assign. It never invents speaker names it can't verify.",
      b: "Automatic diarisation that learns voices, one of Otter's genuine strengths.",
    },
    {
      label: "Summaries and action items",
      a: "Deliberately none - that needs a language model, which would mean sending text somewhere.",
      b: "Automatic AI summaries, outlines and action items.",
    },
    {
      label: "Usage limits",
      a: "None. No minute allowance, no per-recording cap. Long files just take longer on your hardware.",
      b: "Free tier has a monthly minute allowance and per-conversation caps. Paid tiers raise them.",
    },
    {
      label: "Account",
      a: "None, ever.",
      b: "Required.",
    },
    {
      label: "Works offline",
      a: "Yes - after the one-time model download, transcription needs no connection.",
      b: "No. It's a cloud service.",
    },
    {
      label: "Export formats",
      a: "TXT, Markdown, HTML, SRT, VTT, CSV, JSON, XML.",
      b: "TXT, DOCX, PDF, SRT and clipboard, plus its own workspace.",
    },
  ],

  whenA: [
    "The recording is confidential: interviews under embargo, legal or medical conversations, client calls under NDA. Nothing is uploaded, so there is no retention policy to evaluate at all.",
    "GDPR or company policy forbids sending recordings to third-party processors - local transcription sidesteps the processor question entirely.",
    "You've hit a monthly minute allowance and just need a long recording transcribed without a plan upgrade.",
    "You want captions files (SRT/VTT) from a video without a cloud round-trip.",
    "You're offline or on hostile Wi-Fi - after the first model download, it keeps working.",
  ],

  whenB: [
    "You want live transcription DURING meetings - GigAI only works on recordings after the fact.",
    "Automatic speaker identification matters and manual labelling is a dealbreaker.",
    "You want automatic summaries and action items in the same tool.",
    "Your team shares a transcript workspace with search across all past meetings.",
    "You live on mobile - Otter's phone apps are polished. GigAI is a browser tool.",
  ],

  verdict:
    "If the audio must not leave your machine - or you keep hitting minute allowances - GigAI transcribes it locally with no caps and no account. If you want live meeting capture, automatic speakers and AI summaries in a team workspace, Otter genuinely does things GigAI deliberately doesn't. Confidential recordings local, routine meetings wherever your team already is.",

  relatedToolSlugs: ["video-intelligence", "subtitle-converter", "audio-to-mp3", "video-to-work"],

  faq: [
    {
      question: "Is GigAI a free alternative to Otter.ai?",
      answer:
        "For transcribing recordings you already have - yes, with no minute allowance and no account, because your own device does the work. It is not an alternative for live meeting capture or automatic summaries. Otter's cloud architecture is what makes those possible.",
    },
    {
      question: "Is in-browser Whisper as accurate as Otter?",
      answer:
        "They're built on the same generation of speech models. Clear single-speaker audio transcribes comparably. Otter's server hardware is faster, and its automatic diarisation handles crosstalk better. GigAI trades speed and automation for the recording never leaving your device.",
    },
    {
      question: "Why doesn't GigAI summarise the transcript?",
      answer:
        "Summarisation needs a language model, and running one means sending the text somewhere - which would quietly break the no-upload promise. For client recordings specifically, GigAI Video → Work does that step with explicit disclosure of exactly what is sent.",
    },
    {
      question: "Can it handle a 2-hour lecture?",
      answer:
        "Yes - it warns you honestly that long recordings take a while on browser hardware (that's the trade for locality), then works through it. There is no cap that cuts you off partway.",
    },
  ],

  relatedComparisonSlugs: ["gigai-video-to-work-vs-loom-ai", "mp3-vs-wav"],
};

export default gigaiVsOtter;
