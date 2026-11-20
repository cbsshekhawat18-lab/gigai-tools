import type { Tool } from "@/types";

/**
 * Video → Work: the flagship.
 *
 * HONEST SCOPE, stated in the page copy rather than buried:
 *   • THE RECORDING never leaves the device on any path: decode, Whisper
 *     transcription and frame selection all happen in the browser.
 *   • ANALYSIS has two paths and the page must say so. With a local Ollama
 *     vision model, it stays on the machine too. Without one, the transcript
 *  and the chosen frames are sent to our server, read, and discarded, so
 *     the flat "no uploads" badge would be a lie for most visitors. The tool is
 *     therefore classified `hybrid` in lib/privacy.ts rather than borrowing the
 *     green browser badge. `serverSide` stays false because it is not a
 *     server-processing tool; the level, not the flag, carries the nuance.
 *   • Pasted Loom/YouTube/Vimeo links are the one exception: a browser cannot
 *     read those streams, so the server fetches the file, passes it to the
 *     browser and deletes it. Said plainly on the page, not in a footnote.
 *   • The hosted tier currently runs on a free shared allowance (GROQ_API_KEY);
 *     setting ANTHROPIC_API_KEY upgrades it to a frontier model. Whichever is
 *     configured, the workspace names it and states plainly that the transcript
 *  and screenshots are sent, and pinning "on my machine" NEVER silently
 *     falls back to it.
 *   • Every finding carries the client's verbatim words, a timestamp and a
 *     confidence score, and uncertain readings are labelled as proposals rather
 *  than requirements, the one thing that must never be softened.
 */
const videoToWork: Tool = {
  slug: "video-to-work",
  title: "Video → Work",
  description:
    "Turn client Looms, screen recordings and voice notes into developer-ready tasks, bugs, design changes, screenshots and acceptance criteria: each traceable to the moment it was asked for.",
  category: "video-tools",
  icon: "ListVideo",
  accent: "indigo",
  processor: "convert",
  status: "live",
  featured: true,
  serverSide: false,
  createdAt: "2026-08-09",

  h1: "Video → Work, Turn Client Videos Into Developer Tasks",
  tagline: "Stop watching client videos. Start building.",
  ctaText: "Analyze a client video",
  // "Video → Work" isn't a noun phrase, so the generated sentence templates
  // ("how to use the {x}") need something that reads as one.
  titleNoun: "Video → Work tool",
  featuresHeading: "What Video → Work does",

  longDescription:
    "A client sends a twenty-minute Loom. Somewhere in it are four bugs, two feature requests, a handful of design tweaks and one question, mixed in with throat-clearing, a phone call, and a bit where they scroll around looking for the thing they meant. Someone has to watch all of it, take notes, screenshot the bits that matter, work out what was actually being asked for, and turn that into tickets the team can build from. Then the next video arrives and half of it changes. GigAI Video → Work does that job. It transcribes the recording, picks out the moments where the screen actually changed, reads the on-screen text, and produces structured findings: bugs with observed-versus-expected behaviour, feature requests with implementation notes, design changes with the element named, plus questions, decisions and dependencies. Each one arrives as a ticket with testable acceptance criteria, a priority, the screenshot that evidences it, and the client's own sentence quoted verbatim next to the timestamp they said it: click it and the video jumps there. Where the client was vague, the tool says so: every AI interpretation is shown separately from the client's words, carries a confidence score, and is marked as needing confirmation rather than being presented as a settled requirement. That distinction is the whole point, because the expensive failure in this workflow isn't missing a request, it's building the wrong version of one. Add several videos to one project and it reconciles them, spotting where a later recording changed a requirement, repeated it, or contradicted it outright, and asking you which version stands instead of quietly picking the newest. Export a developer handoff, a client-ready PDF with screenshots, Markdown, or JSON built for Jira and Linear integrations. The recording itself never leaves your computer on any path: Whisper transcribes it in the browser and the screenshots are chosen in the browser. Only the reading step can travel, install a local Ollama vision model and even that stays on your machine, and if you haven't, the transcript and the chosen screenshots are sent to be analyzed and then discarded. The workspace tells you which of the two is about to run before it runs, and choosing \"on my machine\" will stop with an error rather than quietly send anything. Audio-only recordings work the same way: drop in a voice note or a recorded client call as MP3, WAV or M4A and you get the same structured findings with the same verbatim quotes and timestamps: the screenshot and on-screen-text steps simply report that there was no picture to read, rather than inventing one. It's free with no account and no per-video limit, and once set up it works with your network switched off.",

  keywords: [
    "loom to jira",
    // Audio intent is deliberately "recording -> WORK", never "audio -> text":
    // transcription keywords belong to /video-intelligence, and competing with
    // our own page for them would split the rankings rather than add any.
    "client call to tasks",
    "voice note to tasks",
    "meeting recording to action items",
    "client feedback audio to tickets",
    "turn a client call into a task list",
    "loom to tasks",
    "client video to tasks",
    "video to developer tasks",
    "screen recording to documentation",
    "loom requirements generator",
    "client feedback automation",
    "loom to developer handoff",
    "video requirements extractor",
    "ai client feedback tool",
    "video to project requirements",
    "turn client videos into tickets",
  ],

  tags: ["ai", "video", "productivity", "requirements", "agency", "handoff"],
  fileTypes: ["mp4", "mov", "webm", "mkv", "avi", "m4v", "mp3", "wav", "m4a"],
  audiences: ["developers", "agencies", "product-teams", "freelancers", "designers"],

  seo: {
    title: "Loom & Client Video to Developer Tasks, Free, No Sign-Up | GigAI Tools",
    description:
      "Turn client Looms, screen recordings and voice notes into developer-ready bugs, features and design changes, with acceptance criteria, screenshots and the client's exact words on every task. Free, runs in your browser.",
  },

  features: [
    {
      icon: "HardDrive",
      title: "Free, and the recording never leaves your computer",
      description:
        "Free with no account and no per-video limit. The video is decoded, transcribed and screenshotted on your device. It is never uploaded. Install a local Ollama model and the analysis stays on your machine too, so nothing at all leaves. Without one, only the transcript and the chosen screenshots are sent, then discarded.",
    },
    {
      icon: "ScanSearch",
      title: "Watches the screen, not just the words",
      description:
        "Frames are chosen where the picture actually changed, then read with OCR, so a finding can name the exact button, error message or field the client was pointing at, not just repeat what they said.",
    },
    {
      icon: "AudioLines",
      title: "Voice notes and calls, not just video",
      description:
        "Drop in an MP3, WAV or M4A and it works the same way: a client's rambling voice note or a recorded call becomes the same structured bugs, features and questions, each quoted and timestamped. The screenshot steps simply skip themselves.",
    },
    {
      icon: "Quote",
      title: "Every task carries its evidence",
      description:
        "The client's verbatim sentence, the timestamp they said it, and the screenshot that was on screen. Click the timestamp and the video seeks there. Nothing is asserted without a source.",
    },
    {
      icon: "GitCompare",
      title: "Client language → developer language",
      description:
        "“Make it smaller and move it down” becomes a change with a named element and testable criteria, shown beside the original quote, with a confidence score, so you can judge the reading yourself.",
    },
    {
      icon: "TriangleAlert",
      title: "Says when it isn't sure",
      description:
        "Ambiguous requests are marked “needs confirmation” with the confidence attached, in the workspace and in every export. A guess is never dressed up as a requirement.",
    },
    {
      icon: "Layers",
      title: "Reconciles multiple videos",
      description:
        "Add every recording from a project. Later videos that change, repeat or contradict an earlier requirement are flagged as a decision for you. It never silently picks the newest.",
    },
    {
      icon: "FileDown",
      title: "Handoff, PDF, Markdown, JSON",
      description:
        "A developer handoff ordered by dependency, a client-ready PDF with screenshots, and versioned JSON built as the mapping layer for Jira, Linear and GitHub Issues.",
    },
  ],

  benefits: [
    {
      title: "Get the hour back",
      description:
        "A twenty-minute video becomes a reviewed task list in the time it takes to read one. Nobody has to scrub back through it looking for the bit about the checkout.",
    },
    {
      title: "Stop building the wrong thing",
      description:
        "Vague requests are surfaced as questions instead of quietly resolved into confident-sounding tickets. The clarifying question costs a message. The wrong build costs a sprint.",
    },
    {
      title: "The client's words survive the handoff",
      description:
        "Whoever picks up the ticket sees exactly what was asked for and can check the interpretation without rewatching anything or asking you what they meant.",
    },
    {
      title: "The recording never has to be uploaded",
      description:
        "Transcription and screenshots always run locally, and with a local model the analysis does too, enough for work under NDA or recordings full of customer data, and you can prove it by pulling the network cable. The tool states which path it is on before each run instead of leaving you to assume.",
    },
  ],

  howTo: [
    {
      title: "Add the recording",
      description:
        "Drop in an MP4, MOV, WebM or MKV, or an audio-only file (MP3, WAV, M4A) if the client sent a voice note or a recorded call. You can also paste a Loom or direct video link and we'll fetch it, though YouTube and Vimeo usually block server-side downloads.",
    },
    {
      title: "Watch it process",
      description:
        "Transcription and frame selection always run on your device, with real progress at each step. No fake bars. Before the reading step starts, the tool names where it will run: on a local Ollama model if you have one, otherwise on our server, which is told the transcript and screenshots only.",
    },
    {
      title: "Review the findings",
      description:
        "Each task shows the client's own words, the screenshot, the AI's reading and its confidence. Approve, edit or reject, in bulk where it's obvious.",
    },
    {
      title: "Export the work",
      description:
        "Developer handoff, PDF report with screenshots, Markdown or JSON. Add more videos to the project and later requests are reconciled against what's already there.",
    },
  ],

  formats: {
    input: [
      "MP4", "MOV", "WebM", "MKV", "AVI", "M4V", "MPEG",
      "MP3", "WAV", "M4A", "AAC", "OGG", "FLAC",
      "Loom", "Direct video links",
    ],
    output: ["PDF", "Markdown", "JSON", "TXT"],
  },

  useCases: [
    {
      audience: "Agencies",
      title: "Client feedback rounds",
      description:
        "Four revision videos across three weeks become one reconciled task list, with the contradictions between them surfaced instead of discovered mid-build.",
    },
    {
      audience: "Freelance developers",
      title: "Scoping a change request",
      description:
        "Turn a rambling walkthrough into a costed list of specific changes, with the client's own words attached to each one for when the scope is questioned later.",
    },
    {
      audience: "Product teams",
      title: "User testing sessions",
      description:
        "Pull the bugs and friction points out of a recorded session, each with the screenshot and the moment it happened, ready to triage.",
    },
    {
      audience: "Anyone on calls",
      title: "Recorded client calls and voice notes",
      description:
        "A rambling ten-minute voice note becomes a checked list of what was actually asked for: with the client's own sentence beside each item, so nothing is lost to \"I thought you said…\" a fortnight later.",
    },
    {
      audience: "QA and support",
      title: "Bug reports by video",
      description:
        "A customer's screen recording becomes a reproducible ticket with observed and expected behaviour, and the exact error message read off the screen.",
    },
  ],

  troubleshooting: [
    {
      problem: "I uploaded audio and the findings have no screenshots",
      solution:
        "That's correct behaviour, not a failure. An audio file has no picture, so the screenshot and on-screen-text steps skip themselves and say so instead of leaving a blank. Findings still carry the client's verbatim sentence and the timestamp, and you can click the timestamp to hear it. Because there's no screen to name an element from, expect slightly more items flagged as needing confirmation, which is the honest outcome when the client said \"move that bit down\" and there was no \"that bit\" on screen.",
    },
    {
      problem: "It says no analysis provider is available",
      solution:
        "Ollama isn't running, or isn't accepting requests from this site. Install it, run `ollama pull qwen2.5vl:7b`, then start it with `OLLAMA_ORIGINS=https://gigai.tools ollama serve`: Ollama only accepts local callers unless you tell it otherwise, and that variable is the step people miss. The tool re-checks when you press Re-check.",
    },
    {
      problem: "Ollama is running but the tool can't see a model",
      solution:
        "You probably have text-only models installed. Analysis needs a model that can read screenshots, `ollama pull qwen2.5vl:7b` is the recommended one. The tool lists only vision-capable models, which is why a `llama3.2` you already have won't appear.",
    },
    {
      problem: "The local model runs out of memory",
      solution:
        "Use a smaller one, `qwen2.5vl:3b` needs about 3GB instead of 6GB. Expect rougher interpretations and more findings flagged for confirmation, which is the correct trade rather than a fault. Shorter recordings also help, since fewer screenshots are held in memory at once.",
    },
    {
      problem: "The Loom link won't fetch",
      solution:
        "Private Looms can't be retrieved. The link has to be viewable without signing in. Either change its sharing setting, or use Loom's Download button and add the MP4 directly, which always works.",
    },
    {
      problem: "A YouTube or Vimeo link won't fetch",
      solution:
        "Both increasingly block downloads that come from a server rather than a browser, YouTube answers with a bot check, and there's no way around it from our side. You'll get a message saying exactly that rather than a vague failure. Download the video and add the file, which is never blocked and keeps it on your machine.",
    },
    {
      problem: "Transcription is slow",
      solution:
        "Whisper runs on your own hardware. With WebGPU it's several times faster than realtime. Without it, slower. For a long recording, trim to the section that matters first.",
    },
    {
      problem: "Findings reference the wrong part of the screen",
      solution:
        "This happens when the client talks about something they aren't currently showing. Those findings usually carry a low confidence score and a needs-confirmation flag, edit the interpretation and it's marked as human-confirmed in every export.",
    },
    {
      problem: "The audio is poor and the transcript is rough",
      solution:
        "Analysis still works from a rough transcript plus the frames, but confidence scores will be lower and more findings will be flagged for confirmation. That's the honest outcome: treat them as leads to verify.",
    },
    {
      problem: "Two videos contradict each other",
      solution:
        "That's detected and shown on the Overview tab with both statements and their timestamps. Pick which one stands, the tool deliberately won't choose for you, because the later video isn't always the client's final word.",
    },
  ],

  tips: [
    "Name each video as you add it (“Homepage feedback”, “Mobile review”): the labels appear on every finding and in the exports.",
    "Add the project context in one line before analyzing. Telling it “this is the checkout rebuild” measurably sharpens the area labels.",
    "Work the “Needs confirmation” filter first. Those are the findings where building from the AI's reading would be a gamble.",
    "Approve in bulk, but read the low-confidence ones individually, that's where the value of the review step actually is.",
    "Export the JSON if you want to push into Jira or Linear later. It's versioned specifically so integrations stay stable.",
  ],

  security:
    "Your recording is decoded, transcribed and sampled for screenshots inside your browser, and the video file is never uploaded. That holds on every path. The analysis step is the one that can leave your device, and the tool is explicit about which way it is going. If you run a vision model locally through Ollama, nothing leaves at all and it works with the network disconnected, which is the simplest way to verify it. If you do not, the transcript and the handful of chosen screenshots are sent to our server to be read, then discarded. Not stored, not logged, and not used to train anything. You can pin the analysis to your own machine, and if the local model is then unavailable the run stops with an error instead of quietly sending your client's words somewhere else. Pasting a Loom or direct link is the other server step: a browser cannot read those streams, so our server fetches the file, streams it to your browser and deletes it immediately. Findings, transcripts and screenshots are kept locally in your own browser, never on our servers, and the Export tab deletes everything at any time.",

  faq: [
    {
      question: "Is my client's video uploaded?",
      answer:
        "The video file is never uploaded. When you add a file it is decoded, transcribed and sampled for screenshots entirely in your browser. The analysis step is the only thing that can leave, and what leaves is the transcript plus the small number of screenshots the free tier allows, currently one per run, which are read and immediately discarded, never stored or logged. Install a vision model in Ollama and even that stays on your machine. Pin the setting to \"on my machine\" and a run will fail with an error rather than fall back to sending anything. The other server step is a pasted Loom or direct link: a browser physically cannot read those streams, so our server fetches the file, hands it to your browser and deletes it. Download the recording and add it as a file if you would rather that never happened.",
    },
    {
      question: "What do I need to set up, and does it cost anything?",
      answer:
        "Nothing, and no. Open it and add a recording. It runs on a free shared analysis tier with no account and no card. That tier is genuinely shared, so it is capped (one screenshot per run today) and can be busy at peak times, and it means the transcript and that screenshot are sent to us to be read and then discarded. If you would rather nothing left your machine, or you want more screenshots read per run, install Ollama once, run `ollama pull qwen2.5vl:7b` (about 6GB) and start it with OLLAMA_ORIGINS set so it accepts this site. The tool shows all three commands, detects Ollama automatically and tells you which step is missing. After that it is unmetered and works offline, because the model is running on your hardware and there is nothing for anyone to meter.",
    },
    {
      question: "Why does it need a model at all. Can't you just use keywords?",
      answer:
        "Because the job is understanding, not transcription. Turning “this button looks weird, make it smaller and move it down” into a change with a named element and testable acceptance criteria needs a vision-language model. We could have shipped regex that pattern-matches phrases and called it AI, but it would produce confident nonsense: worse than useless when a developer builds from it. Running a real model locally is the honest version of free.",
    },
    {
      question: "How good is a local model compared to a big cloud one?",
      answer:
        "Rougher, and the tool doesn't pretend otherwise. A 7B model reads the same evidence less reliably than a frontier model, so interpretations are vaguer and confidence is noisier. Rather than hiding that, findings analyzed locally are held to a stricter bar: anything below 70% confidence is flagged for your confirmation, versus 50% for a large model. You still get the client's verbatim quote, the timestamp and the screenshot on every finding, so you can check any interpretation in seconds. If you have a strong GPU, `qwen2.5vl:72b` closes most of the gap.",
    },
    {
      question: "How accurate is it?",
      answer:
        "Accurate enough to save the hour, not accurate enough to skip the review, which is why the review step isn't optional. Every finding shows the client's verbatim sentence next to the AI's reading of it, with a confidence score, and anything ambiguous is flagged “needs confirmation” rather than presented as settled. Clear requests demonstrated on screen come out well. A client describing something off-screen in vague terms comes out as a low-confidence proposal, correctly.",
    },
    {
      question: "Can it handle multiple videos from the same project?",
      answer:
        "Yes, and that's where most of the value is. Add every recording to one project and later videos are reconciled against what's already there: it flags requirements that changed, ones that were merely repeated, and ones that contradict an earlier video. Contradictions are shown as a decision for you with both statements and timestamps. It deliberately never picks the newest automatically, because clients float ideas and walk them back.",
    },
    {
      question: "Can I use an audio file instead of a video?",
      answer:
        "Yes: MP3, WAV, M4A, AAC, OGG and FLAC all work, and the flow is identical. A voice note or a recorded client call is transcribed in your browser and turned into the same bugs, features, design changes and questions, each with the client's exact words and the timestamp they said it. The screenshot and on-screen-text steps skip themselves and tell you why, so nothing pretends to have seen a screen that was never there. Audio-only recordings often produce better results per minute than video, because everything the client wants is in what they said.",
    },
    {
      question: "What if the recording has no speech?",
      answer:
        "It still works, from the frames alone. A silent walkthrough where someone clicks a broken button has demonstrated a bug just as clearly as one where they narrate it. You'll get fewer findings and lower confidence, and the summary will say the recording had no speech rather than pretending otherwise.",
    },
    {
      question: "Does it export to Jira or Linear?",
      answer:
        "Not directly yet. The JSON export is versioned and built specifically as the mapping layer those integrations need (every field a tracker wants is already in it, including evidence and acceptance criteria) so the integration is a mapping rather than a rewrite. For now, the developer handoff Markdown pastes cleanly into any tracker.",
    },
    {
      question: "How long can the video be?",
      answer:
        "Transcription runs on your hardware, so it's bounded by patience rather than a hard cap, several times faster than realtime with WebGPU, slower without. Fetched links are capped at 90 minutes. For anything long, trimming to the section that matters is faster than waiting, and the results are usually better because the analysis isn't diluted by twenty minutes of small talk.",
    },
  ],

  changelog: [
    {
      date: "2026-08-09",
      change:
        "First release: on-device transcription and frame selection, multimodal analysis, evidence-linked findings, acceptance criteria, multi-video reconciliation with conflict detection, and PDF/Markdown/JSON export.",
    },
  ],

  relatedTools: ["video-intelligence", "subtitle-converter", "video-trimmer", "extract-audio"],
};

export default videoToWork;
