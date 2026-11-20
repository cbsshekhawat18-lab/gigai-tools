import type { Tool } from "@/types";

/**
 * Audio Volume Booster, increase (or reduce) the loudness of a clip by an exact
 * dB amount, with real clip protection, entirely in the browser. Drop a file,
 * push the gain slider up to make a quiet recording louder (or down to tame a
 * hot one), and the native Web Audio engine measures the source, tells you the
 * exact headroom before it would clip, and applies the gain to every sample in
 * one pass. A "prevent clipping" guard caps the boost at the safe maximum so a
 * loud lift never turns into digital distortion. Every string below is written
 * for the queries people type when a track is "too quiet", "not loud enough",
 * "needs more volume", "make audio louder": nothing is shared with the
 * normaliser, trimmer, video or image copy, and no claim outruns what a simple
 * gain-in-dB tool actually does (it makes audio louder or quieter and clamps
 * safely. It is not a compressor, a limiter-based maximiser or a LUFS matcher,
 * and it can't recover detail already lost to clipping in the source).
 */
const audioVolumeBooster: Tool = {
  slug: "audio-volume-booster",
  title: "Audio Volume Booster",
  category: "audio-tools",
  group: "Edit",
  icon: "Volume2",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  description:
    "Boost audio volume in your browser: push a too-quiet MP3, WAV or M4A louder by an exact dB amount with built-in clip protection, or turn a hot track down. See the headroom, preview the result, then download WAV or MP3. Nothing is uploaded.",

  h1: "Audio Volume Booster. Make Audio Louder Online with dB Gain",
  tagline:
    "Drop a recording that's too quiet and push it up by an exact amount in decibels: with a clip guard that stops a loud boost from distorting. Or pull a track that's too hot back down. Real Web Audio gain with a live headroom readout, a preview player and lossless WAV or MP3 export, all in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Volume Booster runs on the native Web Audio engine your browser already ships with, so it can decode a clip, measure its true peak, and apply an exact gain to every sample without ever sending your audio to a server. A voice memo taped across a room, a song exported several dB too quiet, an interview where one mic sat low, a video's audio track that plays too soft, all share the same fix: they need more level. Reaching for a full DAW just to turn something up is overkill, and most \"volume booster\" sites make you upload the file first. Here you drop your file, drag the gain slider to the number of decibels you want to add (or subtract), and the tool shows you the source's current peak and exactly how many dB of headroom you have before it would clip. Turn on \"prevent clipping\" and the boost is automatically capped at that safe ceiling, so even a heavy lift stays clean. Turn it off and you can push past the ceiling deliberately, with the samples hard-clamped to prevent digital overflow and an honest warning that some peaks were flattened. When it finishes you get a preview player to confirm it sounds right and the measured before/after peak, then download a lossless 16-bit WAV to keep every sample for further editing or an MP3 encoded locally in your browser for a smaller, share-ready file. Because everything is client-side there's no upload wait and no privacy tradeoff: personal recordings, unreleased mixes and confidential interviews never leave your machine. Be honest about what this is: it multiplies the whole signal by one gain factor to make it louder or quieter and clamps safely. It is not a compressor or a loudness maximiser that squeezes dynamics to sound \"bigger,\" it can't un-clip audio that was already recorded too hot, and dB gain is not the same as the LUFS integrated-loudness spec streaming platforms measure. Close the tab and every sample is gone.",

  ctaText: "Boost volume",

  keywords: [
    "audio volume booster",
    "boost audio volume",
    "increase audio volume online",
    "make audio louder",
    "make mp3 louder",
    "increase mp3 volume",
    "audio gain online",
    "raise volume of audio",
    "turn up audio volume",
    "reduce audio volume",
    "lower audio volume",
    "amplify audio online",
    "volume booster wav",
    "boost quiet recording",
  ],

  seo: {
    title: "Audio Volume Booster: Make Audio Louder Online Free | GigAI Tools",
    description:
      "Free online audio volume booster on the native Web Audio engine. Increase a quiet MP3, WAV or M4A by an exact dB amount with built-in clip protection, or reduce a hot track, preview it, then export WAV or MP3. 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "Volume2",
      title: "Boost or cut by exact decibels",
      description:
        "Drag one slider to add the precise gain you want (a gentle +3 dB or a big +12 dB lift for a quiet clip) or go negative to pull a track that's too hot back down. The exact dB is always on screen, no guesswork.",
    },
    {
      icon: "ShieldCheck",
      title: "Clip protection built in",
      description:
        "The tool measures your source's true peak and shows the headroom you have before a boost would distort. Leave 'prevent clipping' on and any lift is capped at that safe ceiling, so a loud boost never turns into crackly digital overflow.",
    },
    {
      icon: "Gauge",
      title: "Live headroom readout",
      description:
        "See the current peak in dBFS and the maximum clean gain available before you commit, so you know instantly whether you can add 3 dB or 10, and whether the level you asked for will stay clean.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you download",
      description:
        "The boosted result plays right in the page on a waveform player, so you confirm it's loud enough and nothing distorts before you export, the safety net a command-line 'gain' filter never gives you.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or local MP3",
      description:
        "Export a clean 16-bit PCM WAV to keep every sample for further editing, or an MP3 encoded entirely in your browser for a smaller share-ready file. Neither path loads any heavyweight codec.",
    },
    {
      icon: "Lock",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, measuring, gaining and encoding all happen on your device with the native Web Audio engine. Voice memos, interviews and unreleased mixes are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Rescue a recording that's too quiet",
      description:
        "A voice memo taped across a room or a bounce that came out low is painful at normal volume. Add the dB you need with the clip guard on and it lifts to a full, clean level in one pass. No DAW, no upload.",
    },
    {
      title: "Never distort by accident",
      description:
        "Most boosters just multiply the signal and let it clip. Here you see your headroom and can cap the boost at the safe maximum, so a heavy lift stays clean instead of turning into crackle you can't undo.",
    },
    {
      title: "Turn things down too, precisely",
      description:
        "Gain works both ways. Pull a hot clip back by an exact number of decibels to sit it under a voiceover or match it to quieter material, the same one slider, in reverse.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server boosters make you upload the file first and trust them with it. Here the audio never leaves your browser, so there's no upload bar and nothing to trust, safe for private or confidential recordings.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It's decoded locally and you'll see its waveform, duration and current peak level right away.",
    },
    {
      title: "Set the gain in dB",
      description:
        "Drag the slider up to make it louder or down to make it quieter. The live readout shows the exact dB and how much clean headroom you have before clipping.",
    },
    {
      title: "Keep the clip guard on (or push past)",
      description:
        "Leave 'prevent clipping' enabled to auto-cap the boost at the safe maximum. Turn it off only if you want to drive past the ceiling deliberately, the tool clamps peaks and warns you when it does.",
    },
    {
      title: "Preview and boost",
      description:
        "Press Boost volume. The whole track is re-gained on your device in one fast pass, then plays in a preview player so you can confirm it's louder and still clean.",
    },
    {
      title: "Download or start over",
      description:
        "Check the before/after peak, download a lossless WAV or a browser-encoded MP3, or reset and try a different amount.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Interviewer",
      title: "Lift a buried guest track",
      description:
        "One guest recorded far quieter than the host. Add the dB needed with the clip guard on to bring their track up to a comfortable, clean level before you mix, without touching the louder tracks.",
    },
    {
      audience: "Content creator",
      title: "Make a quiet video's audio louder",
      description:
        "Extracted audio that plays too soft under a voiceover or on phone speakers. Boost it by a precise amount, preview it, and drop the louder WAV back into your edit.",
    },
    {
      audience: "Musician / Producer",
      title: "Raise a low export to reference level",
      description:
        "A bounce came out several dB under where it should sit. Push it up to just below full scale with clipping protection so you get a full-level reference without re-exporting from the session.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Boost a sensitive recording locally",
      description:
        "A confidential memo or personal voice note that's too quiet shouldn't be uploaded to a stranger's server to be amplified. Do it entirely in your browser so nothing ever leaves the device.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. All decoding, measuring, gaining and encoding happen locally in your browser using the native Web Audio engine (AudioContext). Your file never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for personal, confidential or unreleased audio. MP3 export is encoded in your browser too, so even the download reaches out to no server.",
    },
    {
      question: "How does the clip protection actually work?",
      answer:
        "Before you boost, the tool scans your file and finds its true peak: the single loudest sample. From that it knows exactly how much gain you can add before that peak would hit 0 dBFS and start clipping. With 'prevent clipping' on, the boost you set is automatically capped at that safe maximum, so the result is as loud as it can be without distorting. Turn the guard off and you can push further deliberately. Then the engine hard-clamps any samples that exceed the ceiling to prevent digital overflow and warns you that some peaks were flattened.",
    },
    {
      question: "Can I make audio quieter with this, not just louder?",
      answer:
        "Yes. The slider goes negative as well as positive, so setting, say, −6 dB reduces the whole track's level by exactly that amount. Reducing volume never clips, so the clip guard simply doesn't engage, it's only relevant when you're boosting. Cutting is handy for sitting a clip under a voiceover or matching it to quieter material.",
    },
    {
      question: "Why did my boost stop at a smaller number than I set?",
      answer:
        "Because 'prevent clipping' capped it. If your source already peaks close to full scale, there's little clean headroom to add, asking for +10 dB on a track that only has +2 dB of room will apply +2 dB and tell you so. That's the guard doing its job: keeping the result clean. To push past it, switch the guard off (accepting some clamped peaks) or reduce the source's peak first: for example by re-exporting it lower.",
    },
    {
      question: "Is boosting the same as normalising or matching loudness for streaming?",
      answer:
        "Not quite. Boosting lets you add or remove any exact amount of gain you choose: total manual control. Normalising instead measures the track and computes the gain for you to hit a chosen peak or RMS target. Both apply a single gain factor, and neither is LUFS loudness matching, which uses a perceptual, frequency-weighted model averaged over time (the −14 LUFS many platforms target). Use the booster when you know how much louder you want it. Use the normaliser to auto-hit a level. Use a dedicated LUFS meter when a platform mandates an exact integrated-loudness spec.",
    },
    {
      question: "Will boosting a quiet recording also make the hiss and noise louder?",
      answer:
        "Yes. This is a uniform gain, so it raises everything equally, including any background hiss or hum in the source. Boosting makes a quiet recording usable, but it can't separate voice from noise. If the noise floor is high, a louder version is simply louder noise too. For the cleanest result, start with the best source you can and boost only as much as you need. Noise reduction is a different job than gain.",
    },
    {
      question: "Which formats can I boost, and what do I get back?",
      answer:
        "You can drop anything your browser can decode, MP3, WAV, M4A/AAC, OGG and, on most browsers, FLAC. The output is a lossless 16-bit PCM WAV (which keeps every sample for further editing) or an MP3 encoded locally in your browser at your chosen bitrate. Neither export loads any heavyweight codec, so both are fast and fully on-device.",
    },
    {
      question: "How long a clip can I boost in the browser?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. Songs, podcast segments and voice memos of many minutes run comfortably on a typical laptop. Very long recordings hold every sample in memory and can briefly pause the tab while measuring and re-rendering. For the longest files, trim them down first to keep everything responsive.",
    },
  ],

  tips: [
    "Leave 'prevent clipping' on for anything you care about. It gets you the loudest clean result and takes the guesswork out of how far you can push.",
    "Watch the headroom readout: if it says you only have +2 dB of clean gain, the source is already near full scale and a bigger boost will either be capped or start clamping peaks.",
    "Boosting raises noise too. If a recording is quiet because of a distant mic, expect the hiss to come up with the voice, capture closer next time for a cleaner lift.",
    "Use a small negative gain (a dB or two) to gently duck a clip under narration instead of fighting it in your editor.",
    "Keep a lossless WAV as your master if you'll edit further, and only encode to MP3 as the final step so you don't stack lossy generations.",
  ],

  troubleshooting: [
    {
      problem: "It barely got louder even though I set a big boost.",
      solution:
        "'Prevent clipping' capped the gain because your source already peaks near full scale, there's little clean headroom to add. Check the headroom readout for the real maximum. If you need it louder still, the source's own peak is the limit. Reduce that peak first (re-export lower) or accept some clamped peaks by turning the guard off.",
    },
    {
      problem: "The boosted audio sounds crackly or distorted.",
      solution:
        "That's clipping. You likely turned the guard off and pushed past the headroom, so peaks were hard-clamped. Turn 'prevent clipping' back on and re-run for a clean lift. If the distortion was already in the original file, boosting can't remove it. The source itself is clipped.",
    },
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively, most often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's an exotic format, convert it first with the Audio Converter, then boost the result here.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big file.",
      solution:
        "In-browser audio holds the whole decoded track in RAM. Close other heavy tabs and retry. If it still struggles, the file is likely too large for this device. Trim it into parts first, or boost on a machine with more memory.",
    },
  ],

  security:
    "Your audio is decoded, measured, re-gained and encoded entirely in your browser using the native Web Audio engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely boost personal, confidential or unreleased recordings. WAV and MP3 export both happen on-device with no exotic codec download. There's no upload step and no cloud copy, so close the tab and every sample is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: native Web Audio dB gain with a live peak/headroom readout, automatic clip-protection cap, a before/after peak comparison, a preview player and one-click lossless WAV download.",
    },
    {
      date: "2026-06-25",
      change:
        "Added in-browser MP3 export with a bitrate selector (encoded locally, no engine download), a toggle to intentionally push past the clip ceiling with an honest clamped-peaks warning, and negative gain for reducing volume.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the headroom math for very hot sources, improved the silent-track guard, and added drag-and-drop plus reset-and-retry to the workspace.",
    },
  ],

  relatedTools: [
    "audio-normalizer",
    "audio-trimmer",
    "mp3-converter",
    "audio-recorder",
  ],
};

export default audioVolumeBooster;
