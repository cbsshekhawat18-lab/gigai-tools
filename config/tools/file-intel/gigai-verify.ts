import type { Tool } from "@/types";

/**
 * GigAI Verify, evidence, not verdicts.
 *
 * THE CLAIM DISCIPLINE, which is the whole product:
 *
 *  • Never "100% accurate AI detection". Never a percentage at all.
 *  • An "AI" reading comes ONLY from what the file declares about itself -
 *    a C2PA manifest, or generator software named in its metadata. Nothing
 *    infers AI from pixels or prose, because nothing honestly can in a browser.
 *  • Missing metadata is NEVER evidence of AI. It is the normal state of any
 *    file that has been through a social platform.
 *  • "Inconclusive" is a first-class, common, correct answer.
 *
 * The SEO copy follows the same rule: it sells evidence-based analysis, not
 * certainty, because certainty is the thing every competitor overclaims.
 */
const gigaiVerify: Tool = {
  slug: "gigai-verify",
  title: "GigAI Verify",
  description:
    "Inspect the signals behind a file (provenance, metadata, structure and compression) and see the evidence rather than a yes/no verdict.",
  category: "file-intelligence",
  icon: "Search",
  accent: "sky",
  processor: "convert",
  status: "live",
  featured: true,
  serverSide: false,
  createdAt: "2026-08-12",

  h1: "GigAI Verify: Analyze the Evidence Behind a File",
  tagline: "AI or human? Analyze the evidence.",
  ctaText: "Verify something",
  titleNoun: "GigAI Verify",
  featuresHeading: "What GigAI Verify checks",

  longDescription:
    "Everyone wants a button that says whether something was made by AI. Nobody can honestly build one, and the tools that claim to have done it are the reason teachers have wrongly failed students and hiring managers have wrongly rejected candidates. GigAI Verify takes the opposite approach: it shows you the evidence a file carries about itself, explains what each piece does and does not mean, and lets you decide. Drop in an image, PDF, audio file, video or document, or paste text, and it reads what is actually there. Content Credentials (C2PA) if the file carries them, which is the strongest provenance evidence that exists. EXIF metadata: the camera, the lens, capture and modification timestamps, whether GPS was recorded, and which software touched the file. Generator fingerprints, because image models routinely write their own name into the files they produce, and a file naming Midjourney or Stable Diffusion is telling you something a pixel analysis never could. JPEG structure: quantization tables, chroma subsampling, progressive versus baseline, embedded thumbnails. For PDFs: creator and producer, incremental updates showing the document was re-saved after creation, how many fonts are embedded versus merely referenced, and whether JavaScript or attachments are present. For text: sentence-length variation, vocabulary range and repeated phrasing. Every finding arrives as a card with three things attached: what was observed, how reliable that kind of evidence is, and the innocent explanation. Because \"editing software detected\" usually means somebody cropped a photo, and a tool that lets you read it as \"this is fake\" has failed you. The assessment lands in one of four buckets (Likely Human, Likely AI-Generated, Likely AI-Assisted, or Inconclusive) with confidence stated as low, moderate or high rather than a fabricated percentage. Inconclusive is common and it is correct: most files carry no provenance at all, because every social platform strips it. That absence is not suspicious, and Verify says so instead of filling the silence with a guess. Everything runs in your browser. The file is never uploaded, and you get a SHA-256 hash so you can prove exactly which bytes were examined.",

  keywords: [
    "c2pa checker",
    "content credentials checker",
    "image metadata checker",
    "exif viewer online",
    "image forensics online",
    "jpeg ela analyzer",
    "pdf metadata checker",
    "pdf forensics",
    "check image for editing",
    "file provenance checker",
    "ai content checker",
    "image authenticity signals",
  ],

  tags: ["forensics", "metadata", "provenance", "c2pa", "flagship", "privacy"],
  fileTypes: ["jpg", "png", "webp", "pdf", "mp4", "mp3", "txt", "md"],
  audiences: ["journalists", "legal", "business", "educators", "developers"],

  seo: {
    title: "GigAI Verify, File Metadata, C2PA & Forensic Signal Checker",
    description:
      "Inspect a file's provenance, metadata, structure and compression signals in your browser. Evidence-based analysis with alternative explanations. Not a fake AI verdict.",
  },

  features: [
    {
      icon: "ShieldCheck",
      title: "Content Credentials (C2PA)",
      description:
        "Detects embedded provenance manifests and reads their claims. The strongest evidence a file can carry about how it was made. Presence is detected. The signature is not validated, and the report says so.",
    },
    {
      icon: "Camera",
      title: "EXIF and generator fingerprints",
      description:
        "Camera, lens, timestamps, GPS presence and the software that touched the file: plus the names image models write into their own output, which is a declaration rather than a guess.",
    },
    {
      icon: "FileSearch",
      title: "PDF structure and internals",
      description:
        "Creator and producer, incremental updates showing a re-save after creation, embedded versus referenced fonts, and whether JavaScript or attachments are present. Nothing embedded is ever executed.",
    },
    {
      icon: "Layers",
      title: "Error Level Analysis",
      description:
        "An optional deep check that visualises differing compression across the image, clearly labelled as a visualisation, since editing, exporting and screenshots produce the same patterns as manipulation.",
    },
    {
      icon: "Scale",
      title: "Every finding shows its counter-argument",
      description:
        "Each card carries the innocent explanation alongside the observation. \"Editing software detected\" usually means someone cropped a photo, and you should be told that.",
    },
    {
      icon: "Chrome",
      title: "Also a Chrome extension",
      description:
        "Same product, other surface. The web tool checks a file you have. GigAI Verify for Chrome checks the article, image or video you're looking at, without leaving the page.",
    },
    {
      icon: "CircleHelp",
      title: "\"Inconclusive\" is a real answer",
      description:
        "Most files carry no provenance because platforms strip it. Where evidence is absent or conflicting, Verify says so rather than inventing a verdict to look decisive.",
    },
  ],

  benefits: [
    {
      title: "You can check the reasoning",
      description:
        "A verdict you can't interrogate is worth nothing. Every signal shows what was observed, how strong that kind of evidence is, and what else explains it.",
    },
    {
      title: "It won't get someone wrongly accused",
      description:
        "No fabricated percentages, and no AI verdict inferred from writing style or pixels. The failure mode of confident detectors is a person being punished for something they didn't do.",
    },
    {
      title: "Sensitive files stay yours",
      description:
        "Documents you need to check are often exactly the ones you can't upload. Nothing leaves your browser, and a SHA-256 hash proves which file was examined.",
    },
  ],

  howTo: [
    {
      title: "Drop a file or paste text",
      description:
        "Images, PDFs, audio, video and documents are read from their own bytes. Text can be pasted directly.",
    },
    {
      title: "Optionally turn on Deep check",
      description: "Adds Error Level Analysis for images. Everything still runs locally.",
    },
    {
      title: "Read the assessment, then the evidence",
      description:
        "One of four outcomes with a stated confidence, then every signal that produced it: each expandable to its raw values and its alternative explanation.",
    },
    {
      title: "Check what can't be known",
      description:
        "The limitations section adapts to the file type. Read it before acting on anything, that's the part most tools leave out.",
    },
  ],

  formats: {
    input: ["JPG", "PNG", "WebP", "PDF", "MP4", "MP3", "WAV", "TXT", "MD", "Pasted text"],
    output: ["JSON report", "Copied summary"],
  },

  useCases: [
    {
      audience: "Journalists",
      title: "Checking an image before publishing",
      description:
        "Read whatever provenance and capture evidence the file carries, and see plainly where the evidence runs out rather than being handed false certainty.",
    },
    {
      audience: "Educators",
      title: "Understanding what a submission can and can't tell you",
      description:
        "Verify deliberately will not label an essay AI-written from writing style. It shows what document metadata records, and says clearly that this cannot establish authorship.",
    },
    {
      audience: "Legal & compliance",
      title: "Documenting a file's technical characteristics",
      description:
        "A hash, a timestamp, structural findings and an exportable JSON record: with the limitations stated in the export as well as on screen.",
    },
    {
      audience: "Marketplaces & moderation",
      title: "Triaging suspicious uploads",
      description:
        "Generator fingerprints and provenance manifests are quick, strong signals when present: useful for prioritising review, not for automated punishment.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says Inconclusive. Is the file suspicious?",
      solution:
        "No. Inconclusive means the file carries no provenance and no camera evidence, which describes almost every image saved from a website or received through a messaging app, because those platforms strip metadata on upload. It is the honest answer to \"there isn't enough here to tell\", and a tool that gave you a verdict anyway would be guessing.",
    },
    {
      problem: "There's no metadata at all",
      solution:
        "Completely normal. Screenshots have none, social platforms remove it, and many export paths drop it. Missing metadata is not evidence of AI generation and Verify never treats it as such. It is recorded as a neutral observation.",
    },
    {
      problem: "Why won't it tell me if text was written by AI?",
      solution:
        "Because no tool can do that reliably, including the ones that claim to. Detectors misfire badly on non-native English and technical writing, and paraphrasing defeats them. Real people have been wrongly accused on their output. Verify measures sentence variation, vocabulary range and repetition, presents them as observations, and refuses to convert them into a verdict.",
    },
    {
      problem: "The ELA image looks alarming",
      solution:
        "ELA almost always looks alarming, which is why it is so often misread. Bright regions mean differing compression, which is produced by editing, resizing, exporting, screenshotting and every social platform's recompression. It is a starting point for a human to look closer. Never proof of manipulation.",
    },
    {
      problem: "Content Credentials were found. Does that prove the file is genuine?",
      solution:
        "It is strong evidence, with one caveat stated in the report: the manifest's presence is detected here, but its cryptographic signature is not validated against a trust list. A manifest could in principle be copied from another file. Presence raises confidence considerably. It is not proof.",
    },
  ],

  tips: [
    "Read the alternative explanation on every card before drawing a conclusion: it's there because the observation alone is usually not enough.",
    "Absent evidence is not evidence of absence. No provenance means unknown, not fake.",
    "Content Credentials are the only strong provenance signal that exists. Everything else is circumstantial.",
    "Export the JSON if you need a record. It includes the hash, the findings and the limitations.",
  ],

  security:
    "Every module runs inside your browser on the file's own bytes. Nothing is uploaded, stored or logged, and you can analyze a file with the network disconnected. That matters because the files people most need to check are usually the ones they are least able to send anywhere. Uploaded content is treated as untrusted throughout: embedded JavaScript in a PDF is detected and reported but never executed, extracted text is never injected into the page as markup, and parsing is bounded so a malformed file cannot hang the tab. A SHA-256 hash of the exact bytes analyzed is shown and included in every export, so a report can always be tied back to the specific file it describes. Your original file is only ever read.",

  faq: [
    {
      question: "Can GigAI Verify tell me if something was made by AI?",
      answer:
        "Only when the file says so. If it carries Content Credentials or names generative software in its metadata, that is a declaration and Verify reports it as strong evidence. If it doesn't, Verify will not guess from the pixels or the prose, because no browser tool can do that reliably. You'll get Inconclusive, which is the truthful answer.",
    },
    {
      question: "Why don't you show a percentage like '87% AI'?",
      answer:
        "Because that number would be invented. A percentage implies a calibrated, validated model behind it. Without one it is theatre that makes people confident about something they shouldn't be. Verify reports confidence as low, moderate or high, and shows every signal that produced it so you can judge for yourself.",
    },
    {
      question: "Does missing metadata mean a file is fake?",
      answer:
        "No, and this is the single most common misreading. Every major social platform and messaging app strips metadata on upload, screenshots never have any, and many export paths drop it. Missing metadata is the normal condition of a file from the internet. Verify records it as neutral and says so explicitly.",
    },
    {
      question: "Is my file uploaded?",
      answer:
        "No. Metadata parsing, provenance detection, structural analysis and ELA all run in your browser on the file's bytes. Nothing is transmitted, stored or logged. You can disconnect from the network and it still works.",
    },
    {
      question: "Can I use this to decide whether to fail a student or reject a candidate?",
      answer:
        "No, and please don't. Verify shows technical signals and their alternative explanations. It cannot establish authorship or intent, and it says so on every result. Treat it as one input for a human conversation, never as the basis for a decision that affects someone's job or education.",
    },
    {
      question: "What's the difference between this and the Chrome extension?",
      answer:
        "They're the same product with two entry points. GigAI Verify on the web (this page) checks a file you already have: an image, PDF, video or document you drop in. GigAI Verify for Chrome checks what you're currently looking at, so you can read an article or view an image and ask about it without leaving the page. Both apply the same discipline: evidence with alternative explanations, no fabricated percentages, and no verdict the evidence doesn't support.",
    },
    {
      question: "What does the SHA-256 hash do?",
      answer:
        "It fingerprints the exact bytes analyzed. If you export a report and later need to show which file it describes, the hash proves it: a renamed or re-saved copy produces a different hash.",
    },
  ],

  changelog: [
    { date: "2026-08-12", change: "GigAI Verify released, C2PA, EXIF, generator fingerprints, JPEG structure, PDF forensics, ELA and text statistics." },
  ],

  relatedTools: ["redaction-checker", "remove-metadata", "document-metadata-editor", "gigai-fit"],
};

export default gigaiVerify;
