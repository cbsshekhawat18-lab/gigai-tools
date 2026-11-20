import type { Comparison } from "@/types";

/**
 * GigAI Tools vs iLovePDF: the brand-comparison page.
 *
 * RULES FOR THIS PAGE, because getting it wrong is worse than not ranking:
 *
 *  1. Every claim about iLovePDF must come from their own published pages.
 *     Their privacy policy states files are processed on their servers and
 *     deleted within two hours, and that content is not used to train AI. Their
 *     pricing page states the free tier's per-task size caps and monthly task
 *     allowances. Those are the only sources used here.
 *  2. Say where they are genuinely better. They have desktop and mobile apps,
 *  an API, teams, e-signature and PDF/A; we have none of those. A comparison
 *     that pretends otherwise reads as marketing and converts worse than one
 *     that's straight with the reader.
 *  3. NO PRICES. They vary by region and change; quoting one would be wrong for
 *     most readers within months. Describe the structure instead.
 *  4. Never imply iLovePDF is careless with files. They aren't. The difference
 *  is architectural, server-side versus in-browser, not a question of who
 *     is more trustworthy.
 */
const gigaiVsIlovepdf: Comparison = {
  slug: "gigai-vs-ilovepdf",
  a: "GigAI Tools",
  b: "iLovePDF",
  title: "GigAI Tools vs iLovePDF: Which PDF Toolkit Should You Use?",
  description:
    "Both give you a complete set of PDF tools. The real difference is architectural: iLovePDF processes your file on its servers, GigAI processes it in your browser. Here's when each one is the right call.",

  seo: {
    title: "iLovePDF Alternative, GigAI Tools vs iLovePDF Compared (Free)",
    description:
      "An honest comparison of GigAI Tools and iLovePDF: server-side vs in-browser processing, free-tier limits, and where each one genuinely wins. No sign-up, no upload.",
  },

  accent: "rose",
  icon: "GitCompareArrows",

  intro: [
    "iLovePDF is one of the best-known PDF toolkits on the web, and deservedly so. It has been around for years, covers every common PDF job, and has desktop apps, mobile apps and an API around it. If you are looking for an alternative, it is worth being clear that you are not replacing something bad.",
    "The meaningful difference between the two is not the tool list, which is very similar. It is where the work happens. iLovePDF's privacy policy states that your file is processed on its servers and deleted within two hours. GigAI's PDF tools run inside your browser tab, so the file is never uploaded at all. There is nothing to delete, because nothing arrives.",
    "That single architectural difference drives almost everything else on this page: what the free tier can limit, what happens to a confidential document, whether the tools work offline, and (genuinely) which of the two you should pick. For a lot of jobs, either is fine. For some, only one of them makes sense.",
  ],

  dimensions: [
    {
      label: "Where your file is processed",
      a: "In your browser. The file is never uploaded, so nothing is stored, logged or transmitted.",
      b: "On iLovePDF's servers. Their privacy policy states files are deleted within two hours of processing.",
    },
    {
      label: "Account required",
      a: "No account, ever. No email, no sign-in, no verification step.",
      b: "Usable without an account, with a free Basic tier. An account unlocks higher limits.",
    },
    {
      label: "File size limits",
      a: "No server limit: the ceiling is your own device's memory, which on a modern laptop is generous.",
      b: "Free tier caps per task: their pricing page lists 15 MB for most conversions and OCR, 25 MB for PDF to JPG, 40 MB for image to PDF, 100 MB for merge, 200 MB for compress.",
    },
    {
      label: "How many files per month",
      a: "Unlimited. There is no per-task counter because the processing costs us nothing per file.",
      b: "Free tier task allowances per month, their pricing lists 25 merge tasks, 20 image-to-PDF tasks, and one task each for most conversions.",
    },
    {
      label: "Works offline",
      a: "Yes, once the page has loaded. Disconnect the network and the tools still run.",
      b: "No: the file has to reach their servers. Their desktop app is the offline option and is a paid feature.",
    },
    {
      label: "PDF tool coverage",
      a: "38 tools: organize, optimize, convert in and out, edit, sign, protect, redact, repair, forms, scan.",
      b: "Comparable coverage, plus PDF/A conversion, AI summarising and translation, which GigAI does not have.",
    },
    {
      label: "Desktop, mobile and API",
      a: "None. GigAI is a website only.",
      b: "Desktop app, iOS and Android apps, and a documented API. Desktop and mobile are premium features.",
    },
    {
      label: "Teams and workflows",
      a: "None. Built for individuals doing a job now.",
      b: "Team accounts, saved workflows and business features on the paid tiers.",
    },
    {
      label: "Adverts and watermarks",
      a: "No watermarks. The site carries advertising to stay free.",
      b: "No watermarks on output. An ad-free experience is a premium feature.",
    },
    {
      label: "Cost",
      a: "Free for everything, with no paid tier at all.",
      b: "Free tier with the limits above. Premium and Business tiers lift them and add apps, batch and AI features.",
    },
  ],

  whenA: [
    "The document is confidential, a contract, a medical record, a payslip, an ID scan, anything under NDA. Nothing is uploaded, so there is no retention window to think about at all.",
    "You need to redact something properly. GigAI's Redact PDF rasterises the page and discards the original text objects, so the removed words are genuinely gone rather than covered.",
    "You're working with big files or a lot of them. There are no per-task size caps and no monthly task counter.",
    "You want it to work on a plane, on hotel Wi-Fi, or behind a corporate firewall that blocks file uploads.",
    "You don't want to create an account, and you don't want to hit a limit halfway through a job.",
    "Your organization's policy simply forbids uploading company documents to third-party services, an in-browser tool sidesteps that conversation entirely.",
  ],

  whenB: [
    "You need PDF/A for archiving. GigAI doesn't offer it, because the standard open-source route would force us to change how the whole site is licensed.",
    "You want AI summarising or translation of a document. ILovePDF has both and GigAI deliberately doesn't.",
    "You want a desktop or mobile app rather than a website, especially for working offline on a phone.",
    "You're automating document processing and need an API to call from your own code.",
    "Your team needs shared accounts, saved workflows or a formal e-signature service with an audit trail.",
    "You need the very highest-fidelity Office conversions. A server running a real office engine will beat a browser at reproducing a complex Word layout: GigAI's Word conversions run in the browser and approximate intricate layouts.",
  ],

  verdict:
    "If your document is sensitive, or you keep bumping into free-tier limits, use GigAI, the file never leaves your device and nothing is metered. If you need PDF/A, AI features, a desktop or mobile app, an API or team workflows, iLovePDF genuinely does things GigAI does not, and you should use it. Plenty of people will sensibly use both: GigAI for the everyday jobs and anything confidential, iLovePDF for the specialist features it has and we don't.",

  relatedToolSlugs: ["merge-pdf", "compress-pdf", "redact-pdf", "pdf-to-word", "split-pdf", "scan-to-pdf"],

  faq: [
    {
      question: "Is GigAI Tools a free alternative to iLovePDF?",
      answer:
        "Yes, and it's free in a stronger sense: there is no paid tier at all, no account, no per-file size cap and no monthly task allowance. That's possible because the tools run on your own device, so each conversion costs us nothing. There is nothing to meter. The site is funded by advertising rather than subscriptions.",
    },
    {
      question: "Does iLovePDF upload my files?",
      answer:
        "Yes. That's how it works, and it's not a criticism. Their privacy policy states files are processed on their servers and deleted within two hours, and that content isn't used to train AI models. GigAI's PDF tools process the file inside your browser instead, so nothing is uploaded and there's no retention window to consider. Both are legitimate designs. They suit different documents.",
    },
    {
      question: "Which is better for confidential documents?",
      answer:
        "GigAI, on architecture rather than on trust. When a file is never transmitted, questions about retention periods, breach exposure and processor agreements simply don't arise. That matters for contracts, medical records, payslips, ID documents and anything covered by an NDA or an internal policy against third-party uploads.",
    },
    {
      question: "What can iLovePDF do that GigAI can't?",
      answer:
        "Several real things. PDF/A conversion for archiving, AI summarising and translation, desktop and mobile apps, a developer API, team accounts, saved workflows and a formal e-signature service. GigAI has none of those and isn't planning to pretend otherwise. It's also fair to say a server running a full office engine produces higher-fidelity Word conversions than a browser can.",
    },
    {
      question: "Are there file size limits on GigAI?",
      answer:
        "No server-imposed ones, because there's no server involved. The practical ceiling is your own device's memory, which on a modern laptop handles large documents comfortably. Very large files on an older phone are where you'd notice a limit, and it's your hardware rather than a policy.",
    },
    {
      question: "Does GigAI work offline?",
      answer:
        "Yes, once the page has loaded, the tools run locally, so you can disconnect the network and keep working. That's a side-effect of the architecture rather than a feature we built, and it's genuinely useful on a plane or behind a firewall that blocks uploads.",
    },
    {
      question: "Can I use both?",
      answer:
        "That's a perfectly sensible answer, and probably the most honest recommendation on this page. Use GigAI for everyday PDF work and anything confidential, and reach for iLovePDF when you need PDF/A, an API, an app or the AI features. Neither one has to be your only tool.",
    },
  ],

  relatedComparisonSlugs: ["pdf-vs-docx"],
};

export default gigaiVsIlovepdf;
