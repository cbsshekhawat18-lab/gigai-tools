import type { Tool } from "@/types";

/**
 * Video Schema Generator: a dedicated, single-type structured-data tool for
 * VideoObject. It turns a video's title, thumbnail, upload date, duration and
 * content/embed URLs into valid schema.org JSON-LD, with a live eligibility
 * check for Google's video rich results (thumbnail carousel, key moments and
 * the Videos tab). Duration is entered as plain minutes/seconds and converted
 * to the ISO-8601 `PTnMnS` format Google expects, so nobody has to hand-write
 * `PT6M12S`. Everything runs on `lib/seo-tools/schema.ts` in the browser. No
 * video URL, thumbnail or description is ever uploaded. Copy is unique to video
 * markup and written to rank for the exact queries people search when they want
 * their videos to appear in Google.
 */
const videoSchemaGenerator: Tool = {
  slug: "video-schema-generator",
  title: "Video Schema Generator",
  description:
    "Generate valid VideoObject JSON-LD structured data (name, thumbnail, upload date, duration and content URL) with a live check for Google video rich results. ISO-8601 duration handled for you, 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "Video",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-22",

  h1: "Video Schema Generator, VideoObject JSON-LD for Google Video Rich Results",
  tagline:
    "Add the details of your video once and get valid VideoObject JSON-LD instantly. We convert duration to the ISO-8601 format Google needs, validate the properties required for video rich results, and hand you the exact <script> tag to paste, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Video Schema Generator builds schema.org VideoObject markup as JSON-LD, the structured-data format that makes your videos eligible for Google's video features, the thumbnail carousel, video thumbnails beside regular results, key-moments clips and the Videos tab. Instead of hand-writing braces and remembering that `duration` has to be an ISO-8601 string, you fill a focused form: the video's name, a thumbnail URL, the upload date, a description, and the content and/or embed URLs. Enter the runtime as plain minutes and seconds and the tool converts it to the `PTnMnS` value Google expects. As you type, the JSON-LD regenerates live with empty fields stripped, and an inline validity check grades your markup against the properties Google requires for video rich results (name, thumbnailUrl and uploadDate) while flagging recommended fields like description, contentUrl and duration that materially improve eligibility. There's a one-click YouTube helper that turns a watch or share link into the matching thumbnail and embed URLs, a realistic preset to learn from, and a minified/pretty toggle. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON, then confirm on Google's own Rich Results Test. Because generation and validation happen entirely on your device using the browser's native JSON engine, your video URLs, thumbnails and descriptions never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate video schema",

  keywords: [
    "video schema generator",
    "videoobject schema generator",
    "video json-ld generator",
    "video structured data generator",
    "schema.org video markup",
    "youtube video schema",
    "video rich results markup",
    "video seo schema",
    "videoobject json-ld",
    "video duration iso 8601 generator",
    "google video schema",
    "embed video structured data",
  ],

  seo: {
    title:
      "Video Schema Generator, Free VideoObject JSON-LD Tool | GigAI Tools",
    description:
      "Free VideoObject schema markup generator: create valid JSON-LD for name, thumbnail, upload date, duration and content URL. Live check for Google video rich results, ISO-8601 duration handled, copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "Video",
      title: "Purpose-built for VideoObject",
      description:
        "A focused form for exactly the fields a video needs (name, thumbnail, upload date, description, content and embed URLs) with no unrelated schema noise to wade through.",
    },
    {
      icon: "Timer",
      title: "Duration in minutes & seconds",
      description:
        "Type the runtime as plain minutes and seconds and the tool emits the ISO-8601 `PTnMnS` value Google requires. No more hand-writing `PT6M12S` or guessing the format.",
    },
    {
      icon: "ShieldCheck",
      title: "Live video rich-results check",
      description:
        "Every field is graded against the properties Google needs for video features: name, thumbnailUrl and uploadDate are required, description, contentUrl and duration are recommended, so you know eligibility before you publish.",
    },
    {
      icon: "Youtube",
      title: "One-click YouTube helper",
      description:
        "Paste a YouTube watch or share link and the tool fills the thumbnail and embed URLs for you, so a hosted video becomes valid markup in seconds.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON (with a pretty/minified toggle) no hand-editing braces or guessing where it goes.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Your video URLs, thumbnails and descriptions are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Make your videos eligible for Google's video features",
      description:
        "Video thumbnails in results, the video carousel, key-moment clips and the Videos tab all depend on correct VideoObject markup. This tool produces it cleanly so you skip the syntax errors that silently disqualify a page.",
    },
    {
      title: "Stop fighting ISO-8601 duration",
      description:
        "The single field that trips most people up is `duration`. Enter minutes and seconds and the tool converts them, so a common validity error disappears before it happens.",
    },
    {
      title: "Know it's valid before you ship",
      description:
        "The inline check flags missing required properties as errors and missing recommended ones as warnings, so you fix eligibility problems in the tool instead of discovering them later in Search Console.",
    },
    {
      title: "Safe for unlisted or unpublished videos",
      description:
        "Because everything runs locally, you can build markup for private, unlisted or pre-launch videos without any URL or thumbnail ever leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Enter the video's basics",
      description:
        "Add the video name, a thumbnail URL and the upload date, the three properties Google requires. Load the example first if you want a realistic starting point.",
    },
    {
      title: "Add duration, description and URLs",
      description:
        "Type the runtime in minutes and seconds, write a short description, and paste the content URL (the raw file) and/or the embed URL. A YouTube link fills the thumbnail and embed for you.",
    },
    {
      title: "Read the validity check",
      description:
        "Watch the required/recommended report: green means eligible, warnings point to recommended fields that strengthen rich-result chances, and errors flag anything mandatory that's still missing.",
    },
    {
      title: "Copy the script tag & paste it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON) and paste it into the `<head>` or body of the page the video lives on.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Paste the same markup into Google's Rich Results Test to confirm video eligibility on Google's own live checker before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "Video / content marketer",
      title: "Get tutorial videos into Google's video results",
      description:
        "Mark up embedded how-to and product videos with VideoObject so they qualify for video thumbnails, the carousel and the Videos tab, driving more clicks to the page they live on.",
    },
    {
      audience: "E-commerce / product team",
      title: "Add product video markup for richer listings",
      description:
        "Generate VideoObject JSON-LD for product demo and unboxing videos hosted on your product pages, giving Google the structured data it needs to surface them.",
    },
    {
      audience: "SEO specialist",
      title: "Fix duration and thumbnail errors at scale",
      description:
        "Produce consistent, valid video markup with correct ISO-8601 duration and required thumbnail/upload-date fields, then hand developers a validated snippet to template across the site.",
    },
    {
      audience: "Creator / educator",
      title: "Mark up embedded YouTube lessons",
      description:
        "Turn a YouTube link into VideoObject markup for a course or blog page so the embedded lesson is eligible for Google's video enhancements.",
    },
  ],

  troubleshooting: [
    {
      problem: "The check shows an error for thumbnailUrl or uploadDate.",
      solution:
        "Both are required for a video rich result. Google needs a thumbnail image URL and the date the video was first published. Fill them in and the error clears. A name is required too.",
    },
    {
      problem: "My duration looks wrong or won't validate.",
      solution:
        "Enter the runtime using the minutes and seconds fields and the tool writes the ISO-8601 value (for example 6 minutes 12 seconds becomes PT6M12S). If you paste your own value, it must be an ISO-8601 duration, not `6:12`.",
    },
    {
      problem: "Should I set contentUrl, embedUrl, or both?",
      solution:
        "Provide at least one so Google can access the video: contentUrl points at the raw media file (an .mp4), embedUrl points at a player page (a YouTube embed). Both is best. For a hosted YouTube video, the embed URL is usually what you have.",
    },
    {
      problem: "Google's test flags an issue my tool didn't.",
      solution:
        "This tool is a pragmatic linter for VideoObject's required/recommended properties, not a full schema.org validator. Always confirm with Google's Rich Results Test. It applies Google-specific eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "Put the VideoObject script on the page where the video is actually embedded or hosted (not site-wide) and make sure the video is visible on that page.",
    "Use a high-quality thumbnail at least 60×30px (larger is better) and a direct image URL Googlebot can fetch, not a link behind a login.",
    "uploadDate should be the date the video was first published, in ISO-8601 (YYYY-MM-DD or with a time and timezone): the date pickers here produce a valid value.",
    "Add a contentUrl or embedUrl (ideally both) so Google can access the media. Markup without either is far less likely to earn a video result.",
    "After copying, always run the markup through Google's Rich Results Test: passing this tool's check is necessary, but Google adds its own eligibility rules.",
  ],

  security:
    "Your video markup is generated and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. No video URLs, thumbnails, descriptions or dates are stored, logged or transmitted, so you can safely build markup for private, unlisted or pre-launch videos. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is video schema and why do I need it?",
      answer:
        "Video schema is VideoObject structured data, a machine-readable description of a video using the schema.org vocabulary, added to a page as JSON-LD. Google reads it to understand that a page contains a video and to power video features like thumbnails in search results, the video carousel, key-moment clips and the Videos tab. Correct markup makes a video eligible for these enhanced listings, which can improve visibility and clicks.",
    },
    {
      question: "Which properties does Google require for a video rich result?",
      answer:
        "At minimum, VideoObject needs name (the video's title), thumbnailUrl (a direct image URL) and uploadDate (when it was first published). This tool marks those three as required and reports an error until they're present. Description, contentUrl or embedUrl, and duration are strongly recommended. They materially improve eligibility even though they aren't strictly mandatory.",
    },
    {
      question: "What's the difference between contentUrl and embedUrl?",
      answer:
        "contentUrl is a direct link to the raw media file (for example an.mp4 that Google can access), while embedUrl is a link to a player page that embeds the video (for example a YouTube embed URL). Google recommends providing at least one, ideally both. For a video hosted on YouTube and embedded on your page, the embed URL is usually what you have.",
    },
    {
      question: "How do I write the duration in the right format?",
      answer:
        "The `duration` property must be an ISO-8601 duration string like PT6M12S (6 minutes, 12 seconds), not a clock value like 6:12. You don't have to remember that, enter the runtime using the minutes and seconds fields and the tool generates the correct ISO-8601 value for you automatically.",
    },
    {
      question: "Can I use this for a YouTube video embedded on my page?",
      answer:
        "Yes. Paste a YouTube watch or share link into the YouTube helper and the tool fills the thumbnail and embed URLs for you. Add the title, upload date and duration, and you have valid VideoObject markup for the page where the video is embedded. Mark up the video on the page it actually appears on.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the page where the video is embedded or hosted, either in the `<head>` or anywhere in the `<body>` works for Google. In a CMS, add it via a custom-HTML block, a theme template, or a plugin field. Don't add it site-wide unless every page really contains that video.",
    },
    {
      question: "Does this guarantee my video will show in Google?",
      answer:
        "No tool can guarantee a rich result, Google decides whether and when to show video features based on markup validity, whether it can access the video, content quality and its own eligibility rules. What this tool guarantees is syntactically valid VideoObject JSON-LD with the required properties present, which is the prerequisite. Always confirm final eligibility with Google's Rich Results Test.",
    },
    {
      question: "Is my video data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your video URLs, thumbnails, descriptions and dates never leave your device, there's nothing for us to upload, store or log. It's safe to build markup for private, unlisted or unpublished videos.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, dedicated VideoObject generator with a focused form, live JSON-LD, required/recommended validity check for Google video rich results, minutes/seconds → ISO-8601 duration conversion, copy-ready script tag, download, example preset, undo/redo and share links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added the one-click YouTube helper (watch/share link → thumbnail + embed URLs) and a pretty/minified output toggle.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report with grouped required errors vs. recommended warnings and a link to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "meta-tag-generator",
    "faq-schema-generator",
    "article-schema-generator",
    "url-encoder",
  ],
};

export default videoSchemaGenerator;
