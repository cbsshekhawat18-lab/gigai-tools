import type { Tool } from "@/types";

/**
 * Video Speed Changer, a sibling of the GigAI video suite's Edit tools. Drop a
 * clip, pick a speed from a fast-forward crawl (0.25×) up to a 4× sprint, decide
 * what happens to the audio, and re-time the whole thing in the browser with a
 * self-hosted FFmpeg WebAssembly core. Every string below is written for the
 * exact queries people type when they want to speed up or slow down a video
 * without uploading it. Nothing is shared with the trimmer/compressor copy, and
 * no claim outruns what the client-side engine actually does.
 */
const videoSpeed: Tool = {
  slug: "video-speed",
  title: "Video Speed Changer",
  description:
    "Speed up or slow down a video online in your browser: pick anything from 0.25× slow motion to a 4× fast-forward, keep the audio pitch natural or let it rise, then download. No uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "Gauge",
  accent: "amber",
  status: "live",
  featured: false,
  createdAt: "2026-06-16",

  h1: "Video Speed Changer: Speed Up or Slow Down Video Online, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV, choose a playback speed from 0.25× slow motion to a 4× fast-forward, and re-time video and audio together. Powered by FFmpeg compiled to WebAssembly, it runs 100% in your browser. Your footage is never uploaded, and the download carries no watermark.",
  longDescription:
    "The GigAI Video Speed Changer re-times a clip the way a proper editor does (by re-encoding the frames, not by asking a player to fake it) so the exported file actually plays back faster or slower everywhere you take it. Drop a video and it probes the file locally, then hands you a speed control that runs from a dreamy 0.25× slow motion through real-time up to a brisk 4× fast-forward, with one-tap presets for the common jobs (½× slow-mo, 1.5× lecture skim, 2× time-lapse feel). You decide what the audio does: keep it and let FFmpeg's tempo filter stretch the sound while holding the original pitch so voices still sound like themselves, let the pitch ride up or down with the speed for the classic chipmunk or slowed-and-reverbed effect, or drop the audio track entirely for a clean silent time-lapse. When you run it, a self-hosted FFmpeg WebAssembly core does the re-timing on your device and hands the result straight back as a download, showing the new duration and file size next to the original. Because everything happens on your own machine, personal recordings, client footage and anything under NDA never leave the tab: there's no upload bar, no queue, and no watermark stamped across your result. It's honest about the trade-offs: WASM FFmpeg is single-threaded and memory-bound, so it's slower than a desktop app and happiest with files up to roughly a few hundred megabytes, and a live progress bar shows exactly where the re-encode stands the whole way through. Close the tab and every trace is gone.",

  ctaText: "Change speed",

  keywords: [
    "video speed changer",
    "speed up video online",
    "slow down video online",
    "change video speed",
    "make video faster",
    "slow motion video maker",
    "video speed controller",
    "speed up mp4 online",
    "2x video speed online",
    "time lapse from video",
    "video speed changer no watermark",
    "change video speed without uploading",
  ],

  seo: {
    title:
      "Video Speed Changer, Speed Up or Slow Down Video Online Free (No Watermark) | GigAI Tools",
    description:
      "Free online video speed changer: set any speed from 0.25× slow motion to 4× fast-forward, keep the audio pitch natural or drop the sound, then download. MP4, MOV, WebM & MKV, 100% in your browser, no uploads, no watermark.",
  },

  features: [
    {
      icon: "Gauge",
      title: "0.25× to 4×: smooth or preset",
      description:
        "Drag the speed slider anywhere from a 0.25× slow-motion crawl to a 4× fast-forward, or tap a preset (½×, 1.5×, 2×, 3×) for the common jobs. A live readout shows the exact multiplier and the new duration before you run it.",
    },
    {
      icon: "AudioLines",
      title: "Three ways to handle audio",
      description:
        "Keep the sound and hold its natural pitch so voices still sound right, let the pitch ride with the speed for the classic sped-up or slowed-down effect, or drop the audio entirely for a clean silent time-lapse.",
    },
    {
      icon: "Timer",
      title: "See the new runtime up front",
      description:
        "The tool does the math as you choose: a 4-minute clip at 2× reads 2 minutes, at 0.5× reads 8 minutes. No surprises when the encode finishes. The target duration is on screen the whole time.",
    },
    {
      icon: "Activity",
      title: "Honest live progress",
      description:
        "A determinate progress bar tracks the re-encode from start to finish, and a one-time note covers the first-run engine download. No spinner that leaves you wondering whether it hung.",
    },
    {
      icon: "Download",
      title: "Preview, size delta & one-click download",
      description:
        "Play the re-timed result before you save it and see the new duration and file size next to the original, then download the clip. No sign-up, no email, no watermark.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the re-timing on your device. Your video is never uploaded, queued or stored, which makes it safe for personal, client and NDA footage alike.",
    },
  ],

  benefits: [
    {
      title: "Keep private footage private",
      description:
        "The usual way to speed up a clip online is to hand it to a random server. Here the re-encode runs on your machine, so recordings of your family, your clients or anything confidential never leave the tab.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free speed tools love to stamp a logo across your export or gate the download behind a sign-up. This one just gives you the re-timed clip, clean, unbranded, and as often as you like.",
    },
    {
      title: "Sound that still sounds right",
      description:
        "Naïve speed-ups turn every voice into a chipmunk. Pitch-preserving audio keeps speech natural at 1.5× or 2×, so a sped-up tutorial or podcast is still easy to follow, and it's a toggle away when you want the effect instead.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no plugin, no FFmpeg command line to memorise. Open the page in any modern browser and you're re-timing in seconds. It even works offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally: nothing is uploaded.",
    },
    {
      title: "Pick a speed",
      description:
        "Slide from 0.25× to 4× or tap a preset. The tool shows the exact multiplier and the resulting runtime so you know what you'll get before you commit.",
    },
    {
      title: "Choose what the audio does",
      description:
        "Keep the sound with its natural pitch, let the pitch change with the speed, or drop the audio for a silent time-lapse.",
    },
    {
      title: "Change speed & preview",
      description:
        "Hit Change speed and watch the progress bar. When it finishes, the re-timed clip plays back so you can confirm it before you save.",
    },
    {
      title: "Download",
      description:
        "Download the re-timed video, clean and watermark-free, and check the new duration and size against the original right on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Fake a time-lapse",
      description:
        "Speed a long build, unboxing or cooking clip to 3× or 4× so a ten-minute process becomes a punchy short, then drop the audio for a clean, music-ready silent time-lapse.",
    },
    {
      audience: "Student / Professional",
      title: "Skim a lecture faster",
      description:
        "Bump a recorded lecture or meeting to 1.5× or 2× with the pitch held natural, so the speaker stays perfectly understandable while you get through it in half the time.",
    },
    {
      audience: "Coach / Analyst",
      title: "Study the detail in slow motion",
      description:
        "Slow a sports rep, a golf swing or a UI interaction to 0.5× or 0.25× to see the frames that fly by at full speed, without a heavyweight editor or an upload.",
    },
    {
      audience: "Anyone",
      title: "Set the mood on a clip",
      description:
        "Slow a moment down for a dreamy feel or speed it up for energy, and let the pitch ride with it for the sped-up or slowed-and-reverbed sound people expect, all in the browser.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first run takes a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Subsequent runs skip it and start re-encoding immediately.",
    },
    {
      problem: "It slowed to a crawl or ran out of memory on a big file.",
      solution:
        "In-browser FFmpeg is single-threaded and works in your tab's memory, so very large or long high-bitrate clips are demanding, and slowing a clip down makes a longer, heavier output. Keep inputs loosely under a few hundred megabytes, or trim the clip first, then change its speed.",
    },
    {
      problem: "My sped-up video has no sound.",
      solution:
        "If the source had no audio track there's nothing to re-time, so the output is silent too. If you meant to keep sound from a clip that has it, make sure the audio mode isn't set to 'Remove audio' before you run.",
    },
    {
      problem: "The audio sounds a little different at extreme speeds.",
      solution:
        "Pitch-preserving audio stretches the sound with a tempo filter. At very high or very low multipliers that stretch can add faint artefacts. If it bothers you, switch to 'Let pitch change with speed' for a cleaner, if higher- or lower-pitched, result.",
    },
  ],

  tips: [
    "For skimming talks, 1.5× with natural pitch is the sweet spot, fast enough to save real time, slow enough to follow every word.",
    "Making a time-lapse? Speed the clip up and set audio to 'Remove audio', then add your own music track afterwards for a clean result.",
    "Slowing a clip down multiplies its length and file size. A 0.25× pass makes a clip four times longer, so keep the source short for the snappiest export.",
    "Want the classic effect? 'Let pitch change with speed' gives you chipmunk voices sped up and the slowed-and-reverbed sound slowed down.",
    "Keep inputs under a few hundred megabytes for the fastest run. The first run also downloads the engine once, so give the first change a moment.",
  ],

  security:
    "Your video is read, probed, previewed and re-timed entirely in your browser using a self-hosted FFmpeg WebAssembly core. It is never uploaded to any server, queued, logged or stored. That makes the speed changer safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The speed changer runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and re-encoding all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar reaching out to the cloud and no watermark on the result. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How large a video can I re-time in the browser?",
      answer:
        "Because everything runs in your tab's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. As a loose rule, files up to roughly a few hundred megabytes are comfortable on a typical laptop. Very long or high-bitrate 4K clips can strain memory or slow down. Remember that slowing a clip down makes a longer, heavier output, a 100 MB clip at 0.25× produces a much bigger file. If something struggles, trim the clip first, and the tool shows a live progress bar so you always know where the re-encode stands.",
    },
    {
      question: "Does keeping the audio also keep its pitch?",
      answer:
        "That's your choice. 'Keep audio (natural pitch)' uses FFmpeg's tempo filter to stretch the sound to the new speed while holding the original pitch, so a person's voice still sounds like themselves at 1.5× or 2×, ideal for tutorials, lectures and podcasts. 'Let pitch change with speed' skips the correction, so the audio rises when you speed up and drops when you slow down, giving you the classic chipmunk or slowed-and-reverbed effect. You can also remove the audio entirely.",
    },
    {
      question: "What speeds can I set?",
      answer:
        "Anywhere from 0.25× (quarter speed, deep slow motion) up to 4× (four times faster). You can drag the slider to any value in that range or tap a preset for the common jobs, half speed, 1.5×, 2× and 3×. The tool shows both the exact multiplier and the resulting runtime as you choose, so you can dial in exactly the pace you want.",
    },
    {
      question: "Will changing the speed reduce quality?",
      answer:
        "The picture stays as sharp as the source: the frames themselves aren't scaled or softened. To make the new pace play everywhere, the tool re-encodes the video, which is technically lossy but visually faithful. You won't see a difference in normal viewing. Speeding a clip up drops some frames' worth of motion (there's simply less time to show them), and slowing it down holds each existing frame longer rather than inventing new ones, so extreme slow motion can look slightly stepped on low-frame-rate sources.",
    },
    {
      question: "Why is the first run slower than the ones after it?",
      answer:
        "The first time you change a clip's speed, the tool downloads the FFmpeg WebAssembly engine once and caches it: you'll see a brief 'loading engine' note while that happens. Every run after that skips the download and starts re-encoding straight away. It's also why the tool can keep working offline once you've used it in a session.",
    },
    {
      question: "Which video formats does it accept?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. The output stays in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or process, for those, convert the file to MP4 or WebM first with the Video Converter, then change its speed.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop a clip in and set a speed. The FFmpeg engine is fetched once on first use and cached, after which re-timing works on demand, including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, drag-and-drop input, 0.25×–4× speed slider with presets, pitch-preserving or pitch-changing audio, remove-audio option, in-browser FFmpeg WebAssembly re-encoding, live progress, preview, before/after duration and size, and a watermark-free download.",
    },
    {
      date: "2026-06-22",
      change:
        "Added a live target-duration readout that updates as you change the speed, and clearer guidance that slowing a clip down produces a longer, heavier file.",
    },
    {
      date: "2026-06-29",
      change:
        "Made silent sources graceful, clips without an audio track now re-time cleanly instead of erroring when audio was requested, and improved MOV/MKV probing.",
    },
  ],

  relatedTools: ["video-trimmer", "video-compressor", "video-to-gif", "extract-audio"],
};

export default videoSpeed;
