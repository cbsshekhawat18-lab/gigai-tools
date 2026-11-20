/**
 * Problem / Solution Hub: the USER-INTENT DATABASE at `/solve/<slug>`.
 *
 * The rest of the platform is organized around *tools* and *tasks*. This layer
 * is organized around *problems*, the words people actually type when they hit
 * a wall ("my PDF is too large", "email attachment too large", "QR code for
 * WiFi"). Each entry answers the problem first, then routes the visitor to the
 * EXISTING tool(s) that solve it. No new tools, no duplicate content: every
 * problem is a distinct long-tail intent mapped onto the tools we already ship.
 *
 * PURE DATA; this module imports nothing server-only (no registry), so it is
 * safe to import from client code (e.g. `lib/search.ts`). Tool objects are
 * resolved from `primaryTool`/`tools` slugs by the SERVER page at build time.
 *
 * GLOBAL AUDIENCE: framing is worldwide: passport photos, email limits, online
 * forms, social sizes. Never region-specific currency/law/portal names.
 *
 * To add a problem: append one typed object below. The `/solve/[slug]` route,
 * the `/solve` index, the sitemap and problem-aware search pick it up
 * automatically. Keep `primaryTool`/`tools` slugs in sync with real live tools.
 */
import type { AccentKey, FaqItem, HowToStep, IconName } from "@/types";

/** Thematic buckets used to group the `/solve` directory. Order = display order. */
export const PROBLEM_GROUPS = [
  "Documents & PDF",
  "Images & Photos",
  "QR Codes",
  "Developers & Data",
  "Web & SEO",
  "Video & Audio",
  "SVG & Vectors",
  "Privacy & Limits",
] as const;

export type ProblemGroup = (typeof PROBLEM_GROUPS)[number];

export interface ProblemSolution {
  /** URL slug, `/solve/<slug>`. Phrased as intent, not a tool name. */
  slug: string;
  /** Which section of the `/solve` directory this belongs to. */
  group: ProblemGroup;
  /** The problem in the user's own words, the H1 and the search phrasing. */
  problem: string;
  /** Short label for cards, chips and nav. */
  label: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  icon: IconName;
  accent: AccentKey;
  /**
   * Answer-first paragraph (~40–65 words). Written to win featured snippets,
   * People-Also-Ask and voice answers; it states the fix in the first sentence.
   * Rendered inside `#answer` and marked `speakable`.
   */
  answer: string;
  /** One-line lead shown under the hero title. */
  intro: string;
  /** The single best tool to solve this, the primary CTA. Must be a live slug. */
  primaryTool: string;
  /** Every tool that helps (include the primary). All must be live slugs. */
  tools: string[];
  /** Step-by-step fix, powers the on-page guide + HowTo JSON-LD. */
  steps: HowToStep[];
  /** Honest "watch out for" list: powers the Common mistakes section. */
  mistakes: string[];
  faq: FaqItem[];
  /** Related problem slugs (2–4) for the "More problems we solve" rail. */
  related: string[];
  /** Tokens that seed the RelatedWeb internal-link engine + search matching. */
  tags: string[];
  /** File types this problem concerns (drives file-hub cross-links). */
  fileTypes?: string[];
}

export const PROBLEMS: ProblemSolution[] = [
  /* ── Documents & PDF ─────────────────────────────────────────────────────── */
  {
    slug: "pdf-too-large",
    group: "Documents & PDF",
    problem: "My PDF is too large",
    label: "PDF too large",
    seoTitle: "PDF Too Large? Compress a PDF File in Your Browser, Free",
    seoDescription:
      "Your PDF is too big to upload or email? Compress it below 2MB (or 100KB) in seconds, free and private. Nothing leaves your browser. No sign-up, no watermark.",
    keywords: [
      "pdf too large",
      "reduce pdf size",
      "compress pdf",
      "pdf under 2mb",
      "make pdf smaller",
      "shrink pdf file",
    ],
    icon: "FileArchive",
    accent: "rose",
    answer:
      "To make a PDF smaller, run it through a PDF compressor: it re-encodes the images and strips unused data so the file shrinks (often by 50–90%) while the pages stay readable. Our Compress PDF tool does this entirely in your browser, so the file is never uploaded. Pick a target size and download in seconds.",
    intro:
      "Upload limits are usually 2MB, 5MB or 10MB. The steps to get any PDF safely under the line without wrecking the quality.",
    primaryTool: "compress-pdf",
    tools: ["compress-pdf", "split-pdf", "merge-pdf", "pdf-to-word"],
    steps: [
      { title: "Open the Compress PDF tool", description: "Drag your PDF onto the drop zone. It loads in your browser. The file is never sent to a server." },
      { title: "Choose a compression level", description: "Higher compression = smaller file. If a form demands 'under 2MB', start with the strongest setting and check the result." },
      { title: "Compress and preview", description: "The tool re-encodes images and removes bloat, then shows the new size so you can confirm it clears the limit." },
      { title: "Download the smaller PDF", description: "Save it and upload. Still too big for a strict cap? Split out the pages you don't need first, then compress." },
    ],
    mistakes: [
      "Compressing a PDF that's mostly text. Text is already tiny. If the file is huge it's the embedded images or scans driving the size.",
      "Re-compressing an already-compressed PDF over and over: each pass gives less and can visibly degrade scans. Compress once from the original.",
      "Emailing a 9MB file to beat a 10MB cap. Leave headroom, because email encoding can add ~30% to the attachment size.",
    ],
    faq: [
      { question: "How do I get a PDF under 2MB?", answer: "Open the Compress PDF tool, choose a strong compression level, and check the output size. If it's still over, remove pages you don't need (Split PDF) before compressing the rest." },
      { question: "Will compressing ruin the quality?", answer: "Text stays crisp. Photos and scans lose a little detail at high compression, but for uploads and email it's rarely noticeable. Start moderate and increase only if you need to." },
      { question: "Is it safe to compress a private PDF here?", answer: "Yes. Compression runs entirely in your browser. Your document is never uploaded, stored or logged." },
    ],
    related: ["email-attachment-too-large", "pdf-wont-upload", "combine-pdf-files"],
    tags: ["pdf", "compress", "reduce", "size", "upload"],
    fileTypes: ["pdf"],
  },
  {
    slug: "email-attachment-too-large",
    group: "Documents & PDF",
    problem: "My email attachment is too large",
    label: "Attachment too large",
    seoTitle: "Email Attachment Too Large? Shrink Any File to Send It: Free",
    seoDescription:
      "'Attachment size exceeds the limit'? Compress PDFs, images and videos below your email cap (usually 25MB) right in your browser. Free, private, no sign-up.",
    keywords: [
      "email attachment too large",
      "attachment size limit",
      "reduce file size for email",
      "file too big to email",
      "compress file for email",
    ],
    icon: "Mail",
    accent: "sky",
    answer:
      "Most email providers cap attachments at around 25MB. To send a file that's over the limit, compress it: shrink a PDF with a PDF compressor, an image with an image compressor, or a clip with a video compressor. Each runs in your browser and can cut the size by half or more, so the attachment slides under the cap.",
    intro:
      "Gmail, Outlook and most providers reject attachments over ~25MB. Compress the file to the right type and send it normally. No cloud links needed.",
    primaryTool: "compress-pdf",
    tools: ["compress-pdf", "image-compressor", "video-compressor", "split-pdf"],
    steps: [
      { title: "Identify what you're sending", description: "A document → Compress PDF. A photo → Image Compressor. A video → Video Compressor. Match the tool to the file type." },
      { title: "Compress it in your browser", description: "Drop the file in and pick a compression level. The tool reports the new size so you can confirm it's under your provider's limit." },
      { title: "Check against the cap", description: "Aim well below the limit (e.g. under 20MB for a 25MB cap): email encoding inflates attachments slightly." },
      { title: "Attach and send", description: "Add the smaller file to your email as usual. For very large videos, trim to the part you actually need first." },
    ],
    mistakes: [
      "Zipping a JPEG or MP4 to shrink it. Those formats are already compressed, so a ZIP barely helps. Re-compress the file itself instead.",
      "Sending right at the limit. The base64 encoding email uses adds roughly a third, so a 24MB file can be rejected by a 25MB cap.",
      "Forgetting you can split a long PDF and send the relevant pages only, instead of the whole document.",
    ],
    faq: [
      { question: "What's the usual email attachment limit?", answer: "Around 25MB for Gmail and Outlook combined across all attachments. Some corporate servers are stricter (10MB). Compress below the number your provider shows." },
      { question: "How do I email a video that's too big?", answer: "Compress it with the Video Compressor, or trim it to the part you need. Both run locally in your browser and can dramatically cut the size." },
      { question: "Do these tools upload my file?", answer: "No. Compression happens on your device: your attachment is never sent to us." },
    ],
    related: ["pdf-too-large", "image-too-large", "compress-a-video"],
    tags: ["email", "attachment", "compress", "size", "upload"],
    fileTypes: ["pdf"],
  },
  {
    slug: "combine-pdf-files",
    group: "Documents & PDF",
    problem: "I need to combine several PDFs into one",
    label: "Combine PDFs",
    seoTitle: "Combine PDF Files Into One, Free Merge PDF Tool (In-Browser)",
    seoDescription:
      "Merge multiple PDFs into a single file in the order you choose. Free, private and instant: the PDFs never leave your browser. No sign-up, no watermark.",
    keywords: [
      "combine pdf",
      "merge pdf files",
      "join pdfs into one",
      "put pdfs together",
      "combine documents into one pdf",
    ],
    icon: "Combine",
    accent: "rose",
    answer:
      "To combine PDFs into one file, use a merge tool: add each PDF, drag them into the order you want, and export a single document. Our Merge PDF tool does this in your browser, so nothing is uploaded. It's the fastest way to bundle scans, chapters or forms into one file for submission.",
    intro:
      "Applications and submissions often want a single PDF. Merge your files in the right order, in seconds, without any software.",
    primaryTool: "merge-pdf",
    tools: ["merge-pdf", "compress-pdf", "reorder-pdf-pages", "split-pdf"],
    steps: [
      { title: "Open the Merge PDF tool", description: "Drop in every PDF you want to combine. They all load locally in your browser." },
      { title: "Set the order", description: "Drag the files into the sequence you want them to appear in the final document." },
      { title: "Merge into one PDF", description: "The tool stitches them together into a single file, page for page, with no quality loss." },
      { title: "Compress if needed", description: "If the combined file is large, run it through Compress PDF before you upload or email it." },
    ],
    mistakes: [
      "Merging first and worrying about size later. A bundle of scans can balloon past upload limits, so compress the result if it's big.",
      "Losing the order: check the sequence before exporting, especially when combining a cover letter, resume and certificates.",
      "Combining password-protected PDFs: unlock them first (if you have the password) or the merge can fail.",
    ],
    faq: [
      { question: "Can I reorder pages after merging?", answer: "Yes. Use Reorder PDF Pages to drag any page anywhere, or set the file order before you merge so it's right the first time." },
      { question: "Is there a limit on how many PDFs I can combine?", answer: "Practically, no, it's bounded by your device's memory. Very large batches of high-resolution scans are the main thing to watch." },
      { question: "Are my files uploaded when I merge?", answer: "No. Merging runs entirely in your browser. Your PDFs are never sent anywhere." },
    ],
    related: ["pdf-too-large", "resume-as-pdf", "pdf-wont-upload"],
    tags: ["pdf", "merge", "combine", "join", "documents"],
    fileTypes: ["pdf"],
  },
  {
    slug: "pdf-wont-upload",
    group: "Documents & PDF",
    problem: "My PDF won't upload to a form or portal",
    label: "PDF won't upload",
    seoTitle: "PDF Won't Upload? Fix the 3 Most Common Reasons, Free Tools",
    seoDescription:
      "An online form keeps rejecting your PDF? It's almost always the size, a password, or extra pages. Fix all three in your browser, free, private, no sign-up.",
    keywords: [
      "pdf won't upload",
      "pdf upload failed",
      "can't upload pdf",
      "pdf rejected by form",
      "pdf file not accepted",
    ],
    icon: "FileUp",
    accent: "amber",
    answer:
      "When a form rejects a PDF, it's almost always one of three things: the file is over the size limit, it's password-protected, or it has more pages than allowed. Compress it to get under the cap, unlock it if it's secured, and split out the pages the form doesn't want. Each fix runs in your browser.",
    intro:
      "'Upload failed' rarely means the file is broken. Work through the three usual culprits (size, security and page count) and it'll go through.",
    primaryTool: "compress-pdf",
    tools: ["compress-pdf", "unlock-pdf", "split-pdf", "pdf-editor"],
    steps: [
      { title: "Check the size against the limit", description: "Most forms state a max (e.g. 2MB). If your file is over, compress it with Compress PDF until it clears the cap." },
      { title: "Remove any password", description: "Portals often reject secured PDFs. If yours is protected and you know the password, use Unlock PDF to remove it." },
      { title: "Trim to the required pages", description: "If the form wants a set number of pages, use Split PDF to keep only those and drop the rest." },
      { title: "Confirm the format and re-upload", description: "Make sure it's a real .pdf (not a renamed image). Re-export via the PDF editor if a scan app produced an odd file." },
    ],
    mistakes: [
      "Assuming the file is corrupt when it's simply too big: check the size limit first, it's the number-one cause.",
      "Uploading a password-protected PDF to a system that can't open it, then getting a vague error with no reason.",
      "Renaming a.jpg to.pdf: the form reads the real contents and rejects it. Convert it properly instead.",
    ],
    faq: [
      { question: "Why does the form say my PDF is invalid?", answer: "Usually it's over the size limit, password-protected, or not actually a PDF (a renamed image). Compress, unlock, or convert it correctly and try again." },
      { question: "How do I remove a password so it will upload?", answer: "Use Unlock PDF and enter the password you already have. It removes the protection so the portal can read the file. It can't bypass a password you don't know." },
      { question: "Do these fixes upload my document?", answer: "No. Compressing, unlocking and splitting all happen locally in your browser." },
    ],
    related: ["pdf-too-large", "password-protect-a-pdf", "combine-pdf-files"],
    tags: ["pdf", "upload", "compress", "unlock", "split"],
    fileTypes: ["pdf"],
  },
  {
    slug: "edit-text-in-a-pdf",
    group: "Documents & PDF",
    problem: "I need to edit the text in a PDF",
    label: "Edit PDF text",
    seoTitle: "Edit Text in a PDF Without Acrobat: Free Online PDF Editor",
    seoDescription:
      "Fix a typo, update a date or fill in a PDF without buying Acrobat. Edit text, add notes and sign: free and private, right in your browser. No sign-up.",
    keywords: [
      "edit pdf text",
      "change text in pdf",
      "edit pdf online free",
      "fix typo in pdf",
      "pdf editor no acrobat",
    ],
    icon: "FileText",
    accent: "rose",
    answer:
      "You can edit a PDF's text directly in your browser with a PDF editor: click a line to change wording, fix a typo, update a date, add text or sign it, then export a new PDF. Our PDF Editor runs locally, so the document is never uploaded. It's the free way to make quick edits without Acrobat.",
    intro:
      "You don't need expensive software to change a word or fill in a form. Edit the PDF in place and download the updated file.",
    primaryTool: "pdf-editor",
    tools: ["pdf-editor", "document-signature", "document-watermark", "pdf-to-word"],
    steps: [
      { title: "Open your PDF in the editor", description: "Drop the file onto the PDF Editor. It renders every page in your browser, nothing is uploaded." },
      { title: "Edit the text", description: "Click near the text to change wording, add new text boxes, or fill in form fields. Whiteout-and-retype handles awkward scans." },
      { title: "Add signatures or notes", description: "Drop in a signature, initials, a date or annotations where you need them." },
      { title: "Export the updated PDF", description: "Download the edited document. For heavy rewriting, convert to Word first, edit there, then convert back." },
    ],
    mistakes: [
      "Expecting to reflow a scanned page like a Word doc. A scan is an image, so run OCR first or use whiteout-and-retype for edits.",
      "Editing a signed or certified PDF and breaking its signature. Keep an original copy before you change anything.",
      "Doing a full rewrite in a PDF editor when converting to Word, editing, and converting back would be far faster.",
    ],
    faq: [
      { question: "Can I edit a PDF for free without Acrobat?", answer: "Yes. The PDF Editor lets you change text, fill forms, annotate and sign in your browser at no cost. No Acrobat, no account." },
      { question: "How do I edit a scanned PDF?", answer: "A scan is an image of text. Run OCR PDF to make it selectable, or use the editor's whiteout-and-retype to replace specific words." },
      { question: "For big changes, what's easier?", answer: "Convert the PDF to Word, do your editing in a familiar word processor, then convert back to PDF." },
    ],
    related: ["convert-pdf-to-word", "password-protect-a-pdf", "resume-as-pdf"],
    tags: ["pdf", "edit", "editor", "text", "sign"],
    fileTypes: ["pdf"],
  },
  {
    slug: "password-protect-a-pdf",
    group: "Documents & PDF",
    problem: "I need to password-protect a PDF (or remove a password)",
    label: "Protect / unlock PDF",
    seoTitle: "Password-Protect a PDF (or Remove One): Free & Private",
    seoDescription:
      "Add a password to secure a PDF before you send it, or remove one you already know. Runs in your browser with real AES encryption, free, no sign-up, no upload.",
    keywords: [
      "password protect pdf",
      "encrypt pdf",
      "secure pdf",
      "remove pdf password",
      "unlock pdf",
    ],
    icon: "FileLock2",
    accent: "indigo",
    answer:
      "To secure a PDF, use a protect tool to add a password. It encrypts the file so only people with the password can open it. To remove protection you already have the password for, use an unlock tool. Both run in your browser with genuine AES encryption. The file and password are never uploaded.",
    intro:
      "Sending something confidential? Lock it with a password. Received a protected file you own? Remove the password so you can work with it.",
    primaryTool: "pdf-password-protect",
    tools: ["pdf-password-protect", "unlock-pdf", "document-signature", "compress-pdf"],
    steps: [
      { title: "Choose protect or unlock", description: "Use Password-Protect PDF to add a password, or Unlock PDF to remove one you already know." },
      { title: "Add your file", description: "Drop the PDF in. It's processed locally in your browser: the document and the password stay on your device." },
      { title: "Set or enter the password", description: "To protect, pick a strong password and confirm it. To unlock, type the current password so the tool can decrypt the file." },
      { title: "Download the result", description: "Save the encrypted (or now-open) PDF. Share the password over a separate channel, never in the same email." },
    ],
    mistakes: [
      "Emailing the protected PDF and its password in the same message. That defeats the whole point. Send them separately.",
      "Expecting to 'unlock' a PDF whose password you don't have. These tools remove protection you're entitled to. They don't crack unknown passwords.",
      "Choosing a weak password like a name or 1234: use a long, random one from a password generator for anything sensitive.",
    ],
    faq: [
      { question: "Is the encryption real?", answer: "Yes, the protect tool applies standard AES encryption, the same scheme used across the industry. It runs in your browser, so the file is never uploaded." },
      { question: "Can you remove a password I don't know?", answer: "No, and no honest tool can for strong encryption. Unlock PDF removes a password you already have, e.g. to strip protection from your own statements." },
      { question: "What's a strong PDF password?", answer: "Long and random. Generate one with the Password Generator and store it in a password manager rather than reusing an old one." },
    ],
    related: ["pdf-wont-upload", "combine-pdf-files", "edit-text-in-a-pdf"],
    tags: ["pdf", "password", "encrypt", "unlock", "secure"],
    fileTypes: ["pdf"],
  },
  {
    slug: "convert-pdf-to-word",
    group: "Documents & PDF",
    problem: "I need to turn a PDF into an editable Word document",
    label: "PDF to Word",
    seoTitle: "Convert PDF to Editable Word (DOCX), Free & Private",
    seoDescription:
      "Turn a PDF into an editable Word document so you can change the text. Free, private conversion in your browser. No sign-up, no email, no watermark.",
    keywords: [
      "pdf to word",
      "convert pdf to docx",
      "pdf to editable word",
      "pdf to word free",
      "extract text from pdf",
    ],
    icon: "FileType2",
    accent: "violet",
    answer:
      "To make a PDF editable, convert it to Word (DOCX): the converter extracts the text and layout into a document you can open in Word, Google Docs or Pages and edit freely. Our PDF to Word tool does this in your browser. Text-based PDFs convert cleanly. Scanned pages need OCR first to become selectable text.",
    intro:
      "Need to reuse the text or make big changes? Convert the PDF to Word, edit in a familiar app, and convert back if you need a PDF again.",
    primaryTool: "pdf-to-word",
    tools: ["pdf-to-word", "ocr-pdf", "word-to-pdf", "pdf-editor"],
    steps: [
      { title: "Open the PDF to Word tool", description: "Drop your PDF in. The conversion runs in your browser for text-based PDFs." },
      { title: "Convert to DOCX", description: "The tool extracts the text and layout and builds an editable Word file." },
      { title: "Edit in your word processor", description: "Open the DOCX in Word, Google Docs or Pages and make your changes." },
      { title: "Convert back if needed", description: "Done editing? Use Word to PDF to export a clean PDF again." },
    ],
    mistakes: [
      "Converting a scanned PDF and getting an image instead of text. Run OCR PDF first so the words are recognised.",
      "Expecting a pixel-perfect layout on complex, multi-column designs. Converters prioritise editable text over exact styling.",
      "Editing in the PDF for a large rewrite when a round-trip through Word would be much faster.",
    ],
    faq: [
      { question: "Is PDF to Word really free?", answer: "Yes. No account, no email, no watermark. Text-based PDFs convert right in your browser." },
      { question: "Why did my converted file come out as an image?", answer: "The PDF was a scan. Run OCR PDF first to turn the scanned image into selectable text, then convert to Word." },
      { question: "Will the formatting be identical?", answer: "Simple documents convert cleanly. Very complex layouts may shift slightly because the goal is editable text you can fix, not a perfect visual clone." },
    ],
    related: ["edit-text-in-a-pdf", "resume-as-pdf", "pdf-too-large"],
    tags: ["pdf", "word", "docx", "convert", "edit"],
    fileTypes: ["pdf", "docx"],
  },
  {
    slug: "resume-as-pdf",
    group: "Documents & PDF",
    problem: "I need to submit my resume as a PDF",
    label: "Resume as PDF",
    seoTitle: "Save Your Resume as a PDF for Job Applications, Free",
    seoDescription:
      "Turn a Word resume into a clean, ATS-friendly PDF and get it under the upload limit. Free, private, in-browser tools. No sign-up, no watermark.",
    keywords: [
      "resume to pdf",
      "save resume as pdf",
      "cv to pdf",
      "resume pdf for application",
      "ats friendly pdf resume",
    ],
    icon: "FileCheck2",
    accent: "emerald",
    answer:
      "Most job portals want a PDF because it looks identical on every device. Convert your Word resume to PDF with a Word-to-PDF tool, then compress it if it's over the upload limit. Keep it text-based (not a screenshot) so applicant-tracking systems can read the words. Everything runs in your browser, privately.",
    intro:
      "A PDF keeps your layout intact and reads cleanly in hiring systems. Convert, keep it selectable, and get it under the size cap.",
    primaryTool: "word-to-pdf",
    tools: ["word-to-pdf", "compress-pdf", "merge-pdf", "pdf-to-word"],
    steps: [
      { title: "Convert your resume to PDF", description: "Use Word to PDF so the file looks the same everywhere and can't be accidentally edited by a reviewer." },
      { title: "Keep the text selectable", description: "Export from the document, not as an image: hiring systems (ATS) parse real text, not a picture of it." },
      { title: "Combine extras if required", description: "Need a cover letter or portfolio in one file? Merge them into a single PDF in the right order." },
      { title: "Compress to the size limit", description: "If the portal caps uploads (often 2–5MB), run Compress PDF so it slips under without losing sharpness." },
    ],
    mistakes: [
      "Uploading a screenshot or scanned image of your resume: ATS software can't read the text and may discard the application.",
      "Overstuffing with graphics that push the file past the upload cap. Compress it or simplify the design.",
      "Submitting a filename like 'resume-final-2.pdf', name it clearly, e.g. 'Firstname-Lastname-Resume.pdf'.",
    ],
    faq: [
      { question: "Why do employers ask for a PDF?", answer: "A PDF preserves your exact layout on any device and can't be accidentally reformatted, unlike a Word file that shifts between versions." },
      { question: "Is my PDF resume ATS-friendly?", answer: "It is if the text is selectable (exported from a document), uses a standard layout, and isn't a scanned image. Avoid heavy multi-column graphics for parsing safety." },
      { question: "How do I get my resume under the size limit?", answer: "Convert to PDF, then use Compress PDF. A text resume with a photo compresses well below typical 2–5MB caps." },
    ],
    related: ["convert-pdf-to-word", "combine-pdf-files", "pdf-too-large"],
    tags: ["resume", "cv", "pdf", "word", "convert", "career"],
    fileTypes: ["pdf", "docx"],
  },

  /* ── Images & Photos ─────────────────────────────────────────────────────── */
  {
    slug: "image-too-large",
    group: "Images & Photos",
    problem: "My image file is too large",
    label: "Image too large",
    seoTitle: "Image Too Large? Compress a Photo Below 100KB: Free",
    seoDescription:
      "Shrink a photo that's too big to upload or email, down to 100KB or 50KB, without an obvious quality drop. Free, private, in your browser. No sign-up.",
    keywords: [
      "image too large",
      "compress image",
      "reduce photo size",
      "image under 100kb",
      "make picture smaller",
      "compress jpg",
    ],
    icon: "ImageDown",
    accent: "sky",
    answer:
      "To shrink an image, run it through an image compressor: it re-encodes the photo at a smaller file size, often cutting 60–80% with little visible change. If a form also caps the dimensions, resize the pixels too. Both tools work in your browser, so the photo is never uploaded. Pick a target and download.",
    intro:
      "Phone photos are often 3–8MB. Compress (and if needed resize) to hit a 100KB or 50KB upload limit while still looking clean.",
    primaryTool: "image-compressor",
    tools: ["image-compressor", "image-resizer", "crop-image", "webp-converter"],
    steps: [
      { title: "Open the Image Compressor", description: "Drop your JPG or PNG in. It loads locally in your browser, the photo isn't uploaded." },
      { title: "Set a target size or quality", description: "Lower the quality slider or enter a target like 100KB. The tool shows the resulting size live." },
      { title: "Resize the pixels if required", description: "If the form also limits width/height, use Image Resizer to shrink the dimensions. That alone cuts size a lot." },
      { title: "Download the smaller image", description: "Save and upload. For the web, converting to WebP squeezes it even further at the same quality." },
    ],
    mistakes: [
      "Resizing a photo larger to 'fix' quality. Enlarging can't add detail and inflates the file. Start from the original.",
      "Saving a photo as PNG when JPG or WebP would be a fraction of the size. PNG suits graphics and transparency, not photos.",
      "Compressing to 50KB when the limit is 2MB, you're throwing away quality you didn't need to lose.",
    ],
    faq: [
      { question: "How do I get an image under 100KB?", answer: "Compress it and, if it's still over, resize the dimensions down. A smaller pixel size plus moderate compression easily reaches 100KB, or 50KB, for most photos." },
      { question: "Will compressing make my photo blurry?", answer: "Only at extreme settings. Moderate compression removes data your eyes barely notice. Preview the result and back off if you see artefacts." },
      { question: "JPG, PNG or WebP for a small file?", answer: "JPG for photos, PNG for graphics/transparency, WebP for the smallest web file at good quality. Convert to WebP when the destination supports it." },
    ],
    related: ["email-attachment-too-large", "passport-size-photo", "resize-for-instagram"],
    tags: ["image", "photo", "compress", "resize", "size", "jpg", "png"],
    fileTypes: ["jpg", "png", "webp"],
  },
  {
    slug: "passport-size-photo",
    group: "Images & Photos",
    problem: "I need a passport-size photo",
    label: "Passport photo",
    seoTitle: "Make a Passport-Size Photo Online: Free Crop & Resize",
    seoDescription:
      "Turn a normal photo into a passport-size image: crop to the right ratio, resize to the required pixels or size, and clean up the background. Free, private, no sign-up.",
    keywords: [
      "passport size photo",
      "passport photo maker",
      "id photo online",
      "passport photo size",
      "crop photo to passport size",
    ],
    icon: "IdCard",
    accent: "indigo",
    answer:
      "To make a passport-size photo, crop your picture to the required square-ish ratio, resize it to the pixel dimensions or file size the application asks for, and shoot it against a plain background. Our Crop, Resize and Compress tools handle each step in your browser. Always check your specific authority's exact rules first.",
    intro:
      "Requirements vary by country and document, so confirm the exact dimensions first, then crop, resize and clean the background to match.",
    primaryTool: "crop-image",
    tools: ["crop-image", "image-resizer", "image-compressor"],
    steps: [
      { title: "Look up the exact spec", description: "Passport and ID rules differ by authority, width, height, head size and background color. Note the exact numbers before you start." },
      { title: "Crop to the right frame", description: "Use Crop Image to centre your face and match the required aspect ratio and head position." },
      { title: "Resize to the required size", description: "Set the pixel dimensions (or DPI/file size) the form specifies with Image Resizer." },
      { title: "Match the file size", description: "Shoot against a plain white/grey backdrop, then Compress to hit any KB limit the form sets." },
    ],
    mistakes: [
      "Guessing the dimensions. Every authority is different, and a wrong size gets the application rejected. Use the official figure.",
      "Using a busy or colored background when a plain one is required: shoot against a plain wall or backdrop instead.",
      "Enlarging a small, blurry selfie to fit: start from a sharp, front-facing, evenly lit photo for a clean result.",
    ],
    faq: [
      { question: "What size should a passport photo be?", answer: "It depends on the country and document. Many use 2×2 inches (600×600px) or 35×45mm, but check your authority's exact rule. This tool crops and resizes to whatever you need." },
      { question: "What background should a passport photo have?", answer: "Most authorities require a plain white or light-grey background. Photograph yourself against a plain, evenly lit wall or backdrop, then crop and resize to the exact frame the spec requires." },
      { question: "Is this an official passport service?", answer: "No: these are free editing tools to prepare a photo to a spec you provide. Always follow your official authority's requirements and submission process." },
    ],
    related: ["image-too-large", "resize-for-instagram"],
    tags: ["passport", "photo", "id", "crop", "resize", "image"],
    fileTypes: ["jpg", "png"],
  },
  {
    slug: "resize-for-instagram",
    group: "Images & Photos",
    problem: "What size should my image be for Instagram?",
    label: "Instagram image size",
    seoTitle: "Instagram Image Sizes + Free Resize Tool (Post, Story, Reel)",
    seoDescription:
      "The right pixel sizes for an Instagram post, story and reel cover, plus a free tool to crop and resize your image to fit perfectly. Private, in-browser, no sign-up.",
    keywords: [
      "instagram image size",
      "instagram post size",
      "instagram story size",
      "resize for instagram",
      "instagram photo dimensions",
    ],
    icon: "Instagram",
    accent: "rose",
    answer:
      "For Instagram, use 1080×1080px for a square post, 1080×1350px for a portrait post, and 1080×1920px for a story or reel cover. Crop your image to the right aspect ratio first, then resize it to those pixels so nothing gets awkwardly cut off. Our Crop and Resize tools do both in your browser.",
    intro:
      "Uploading the wrong ratio means Instagram crops your subject or squashes it. Match the pixels below and it stays sharp and framed.",
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    steps: [
      { title: "Pick the format", description: "Square post 1080×1080, portrait post 1080×1350, story/reel 1080×1920. Choose the one you're posting." },
      { title: "Crop to the aspect ratio", description: "Use Crop Image to set the ratio (1:1, 4:5 or 9:16) so your subject sits inside the frame." },
      { title: "Resize to the exact pixels", description: "Set the target dimensions in Image Resizer so the upload is crisp and not upscaled by the app." },
      { title: "Compress and post", description: "Run a light compression to keep it under upload thresholds without visible quality loss, then post." },
    ],
    mistakes: [
      "Uploading a landscape photo to a square slot and letting Instagram chop the edges, crop it yourself to control the framing.",
      "Posting a tiny image and letting the app upscale it, which looks soft. Export at the full 1080px width.",
      "Ignoring the safe area on stories: keep text and faces away from the top and bottom where the UI overlaps.",
    ],
    faq: [
      { question: "What's the best Instagram post size?", answer: "1080×1080px for square or 1080×1350px for portrait (4:5), which takes up more feed space. Stories and reel covers are 1080×1920px (9:16)." },
      { question: "How do I stop Instagram cropping my photo?", answer: "Crop it to the exact aspect ratio before uploading (1:1, 4:5 or 9:16) so the app has nothing left to trim." },
      { question: "Do I need to compress for Instagram?", answer: "A light compression helps it upload fast and reliably. Keep the width at 1080px so the platform doesn't re-compress a low-res version." },
    ],
    related: ["youtube-thumbnail", "image-too-large"],
    tags: ["instagram", "social", "resize", "crop", "image", "size"],
    fileTypes: ["jpg", "png"],
  },
  {
    slug: "youtube-thumbnail",
    group: "Images & Photos",
    problem: "I need to make a YouTube thumbnail",
    label: "YouTube thumbnail",
    seoTitle: "YouTube Thumbnail Size (1280×720) + Free Resize Tool",
    seoDescription:
      "Make a YouTube thumbnail at the correct 1280×720px, 16:9 size and keep it under YouTube's 2MB limit. Free, private, in-browser crop, resize and compress. No sign-up.",
    keywords: [
      "youtube thumbnail size",
      "youtube thumbnail maker",
      "1280x720 thumbnail",
      "resize youtube thumbnail",
      "thumbnail under 2mb",
    ],
    icon: "Youtube",
    accent: "rose",
    answer:
      "A YouTube thumbnail should be 1280×720px (16:9 aspect ratio) and under YouTube's 2MB upload limit. Crop your image to 16:9, resize it to 1280×720, and compress it so it stays under 2MB. Our Crop, Resize and Compress tools do each step in your browser. No design software or account needed.",
    intro:
      "Get the exact size right so your thumbnail looks sharp on every device and doesn't get rejected for being too big.",
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    steps: [
      { title: "Crop to 16:9", description: "Use Crop Image to set a 16:9 ratio so the thumbnail fills YouTube's frame with no black bars." },
      { title: "Resize to 1280×720", description: "Set those exact pixels in Image Resizer: the recommended thumbnail resolution." },
      { title: "Keep it under 2MB", description: "YouTube rejects thumbnails over 2MB. Run Compress if your export is larger." },
      { title: "Frame the subject", description: "Crop tight and place your subject boldly for a clear, clickable composition." },
    ],
    mistakes: [
      "Uploading a thumbnail over 2MB and getting rejected: compress it first.",
      "Using a low-resolution image that looks pixelated when YouTube scales it up. Start at 1280×720.",
      "Putting key text at the very bottom-right, where the duration stamp covers it.",
    ],
    faq: [
      { question: "What size is a YouTube thumbnail?", answer: "1280×720px with a 16:9 aspect ratio, and a maximum file size of 2MB. Formats accepted include JPG, PNG and WebP." },
      { question: "How do I get my thumbnail under 2MB?", answer: "Resize to 1280×720 and run it through the Image Compressor. A single thumbnail compresses well under 2MB with no visible loss." },
      { question: "Can I make a thumbnail without Photoshop?", answer: "Yes. Crop to 16:9, resize to 1280×720, then compress, all free and in-browser." },
    ],
    related: ["resize-for-instagram", "image-too-large"],
    tags: ["youtube", "thumbnail", "resize", "crop", "image", "16:9"],
    fileTypes: ["jpg", "png"],
  },

  /* ── QR Codes ────────────────────────────────────────────────────────────── */
  {
    slug: "qr-code-for-wifi",
    group: "QR Codes",
    problem: "I want a QR code so guests can join my WiFi",
    label: "WiFi QR code",
    seoTitle: "WiFi QR Code Generator, Guests Join Without Typing a Password",
    seoDescription:
      "Create a QR code that connects guests to your WiFi automatically. No reading out the password. Free, private, in-browser. Print it for your home, café or office.",
    keywords: [
      "wifi qr code",
      "qr code for wifi",
      "wifi password qr code",
      "guest wifi qr",
      "scan to connect wifi",
    ],
    icon: "Wifi",
    accent: "cyan",
    answer:
      "A WiFi QR code stores your network name, password and security type, so anyone who scans it connects instantly. No typing. Enter those details in a WiFi QR code generator and download the code to print or display. Ours builds the code in your browser, so your password is never sent to a server.",
    intro:
      "Stop spelling out your WiFi password. Print one QR code and guests scan-to-connect in a second.",
    primaryTool: "wifi-qr-code-generator",
    tools: ["wifi-qr-code-generator", "qr-code-with-logo", "qr-code-scanner", "qr-code-generator"],
    steps: [
      { title: "Open the WiFi QR Code Generator", description: "Enter your network name (SSID), password and security type (usually WPA/WPA2)." },
      { title: "Generate the code", description: "The QR code is built in your browser instantly: your credentials never leave the device." },
      { title: "Brand it (optional)", description: "Add your logo or colors with the QR-with-logo tool for a café, shop or office display." },
      { title: "Download and print", description: "Save a high-resolution PNG or SVG and print it as a table card or wall sign." },
    ],
    mistakes: [
      "Typing the SSID or password with the wrong case. WiFi credentials are case-sensitive, so double-check before printing.",
      "Choosing the wrong security type. If it doesn't connect, confirm whether your network is WPA/WPA2 or open.",
      "Printing too small: keep the QR at least ~2cm/1inch so phone cameras lock on reliably from a normal distance.",
    ],
    faq: [
      { question: "Is it safe to make a WiFi QR code here?", answer: "Yes. The code is generated in your browser. Your network name and password are never uploaded or stored." },
      { question: "Will it work on iPhone and Android?", answer: "Yes. Modern iPhone and Android cameras read WiFi QR codes natively, point, tap the prompt, and it connects." },
      { question: "Can I add my logo?", answer: "Yes. Use the QR Code with Logo tool to drop in a logo and brand colors while keeping the code scannable." },
    ],
    related: ["restaurant-menu-qr-code", "scan-a-qr-code", "qr-code-for-a-link"],
    tags: ["qr", "wifi", "qr-code", "generator", "network"],
  },
  {
    slug: "restaurant-menu-qr-code",
    group: "QR Codes",
    problem: "I need a QR code for my restaurant menu",
    label: "Menu QR code",
    seoTitle: "Restaurant Menu QR Code, Free, No Monthly Fee, No Sign-Up",
    seoDescription:
      "Turn your menu into a QR code customers scan at the table, link a page or a PDF. Free and private, with no subscription. Print-ready PNG/SVG from your browser.",
    keywords: [
      "menu qr code",
      "restaurant qr code",
      "qr code for menu",
      "table qr code menu",
      "pdf menu qr code",
    ],
    icon: "ChefHat",
    accent: "orange",
    answer:
      "A menu QR code sends customers to your menu when they scan it at the table. Point it at your menu's web page, or turn a menu PDF into a code directly. Use a Menu or PDF QR code generator, brand it with your logo, and print it. Ours runs in your browser with no subscription and no per-scan fees.",
    intro:
      "Contactless menus without the monthly SaaS bill. Link a page or a PDF, brand it, and print a table card.",
    primaryTool: "menu-qr-code-generator",
    tools: ["menu-qr-code-generator", "pdf-qr-code-generator", "qr-code-with-logo", "business-card-qr-code-generator"],
    steps: [
      { title: "Decide what it links to", description: "A hosted menu page (best. You can update it), or a menu PDF. Use the Menu tool for a link, the PDF tool for a file." },
      { title: "Generate the QR code", description: "Enter the URL (or upload the PDF) and the code is created in your browser." },
      { title: "Add your branding", description: "Use QR with Logo to add your restaurant's logo and colors so it looks part of the table setting." },
      { title: "Print for the tables", description: "Download a high-resolution SVG or PNG and print table tents, stickers or a window sign." },
    ],
    mistakes: [
      "Encoding a PDF that lives only on your laptop, host the menu online so the link keeps working after you print the codes.",
      "Baking prices into a static image you can't change. Link to a page you can edit so seasonal updates don't mean reprinting.",
      "Printing the code too small or behind glare, test-scan it from where a seated customer would hold their phone.",
    ],
    faq: [
      { question: "Do I have to pay a monthly fee for a menu QR code?", answer: "No. Many services charge subscriptions, but this generator makes a permanent QR code for free. You own the image and print it yourself." },
      { question: "Should it link to a page or a PDF?", answer: "A web page is best because you can update items and prices anytime without reprinting. A PDF works if your menu rarely changes." },
      { question: "Can customers scan it without an app?", answer: "Yes. Any modern phone camera reads it. No special app to download." },
    ],
    related: ["qr-code-for-wifi", "business-card-qr-code", "scan-a-qr-code"],
    tags: ["qr", "menu", "restaurant", "pdf", "generator", "business"],
    fileTypes: ["pdf"],
  },
  {
    slug: "scan-a-qr-code",
    group: "QR Codes",
    problem: "I need to scan a QR code from an image or screenshot",
    label: "Scan a QR code",
    seoTitle: "Scan a QR Code From an Image or Screenshot: Free Online Reader",
    seoDescription:
      "Read a QR code that's saved as an image, screenshot or PDF. No phone needed. Upload it and get the link or text instantly. Free, private, in your browser.",
    keywords: [
      "scan qr code from image",
      "qr code reader online",
      "read qr from screenshot",
      "decode qr code",
      "qr scanner online",
    ],
    icon: "ScanLine",
    accent: "indigo",
    answer:
      "To read a QR code that's saved as a picture, upload it to an online QR reader: it decodes the image and shows the link or text inside. No phone camera required. Our QR Code Scanner and Reader do this in your browser, so the image stays on your device. Handy for codes in screenshots, emails or PDFs.",
    intro:
      "Got a QR in a screenshot, email or document instead of in front of your camera? Upload the image and read it right here.",
    primaryTool: "qr-code-scanner",
    tools: ["qr-code-scanner", "qr-code-reader", "qr-code-decoder", "qr-code-generator"],
    steps: [
      { title: "Open the QR Code Scanner", description: "Choose to upload an image, or use your camera if the code is physically in front of you." },
      { title: "Add the image", description: "Drop in the screenshot, photo or exported page that contains the QR code." },
      { title: "Read the decoded content", description: "The tool extracts the URL or text stored in the code and displays it instantly." },
      { title: "Act on it safely", description: "Check the link looks legitimate before opening it. Treat unknown QR destinations like unknown links." },
    ],
    mistakes: [
      "Uploading a blurry or partial crop, include the full code with its quiet-zone border so it can be decoded.",
      "Opening the decoded link without checking it. QR codes can point anywhere, so verify the domain first.",
      "Trying to read a heavily stylised code where the logo covers too much of the pattern and breaks it.",
    ],
    faq: [
      { question: "Can I scan a QR code without a phone?", answer: "Yes. Upload the image to the QR Code Scanner and it decodes the link or text on your computer. No camera needed." },
      { question: "Does it work on a screenshot?", answer: "Yes, as long as the whole code is visible and reasonably sharp. Crop to include the code plus a little margin around it." },
      { question: "Is uploading the image private?", answer: "Yes, decoding happens in your browser. The image isn't sent to a server." },
    ],
    related: ["qr-code-for-wifi", "restaurant-menu-qr-code", "qr-code-for-a-link"],
    tags: ["qr", "scan", "read", "decode", "reader"],
  },
  {
    slug: "qr-code-for-a-link",
    group: "QR Codes",
    problem: "I want to turn a link into a QR code",
    label: "QR code for a link",
    seoTitle: "Make a QR Code for a Link (URL): Free, No Expiry, No Sign-Up",
    seoDescription:
      "Turn any URL into a permanent QR code you can print anywhere. Free, private and no expiry. Download a crisp PNG or SVG straight from your browser.",
    keywords: [
      "qr code for link",
      "url to qr code",
      "make a qr code",
      "website qr code",
      "free qr code generator",
    ],
    icon: "QrCode",
    accent: "violet",
    answer:
      "To turn a link into a QR code, paste the URL into a QR code generator and download the image. Anyone who scans it opens your page. Our QR Code Generator builds it in your browser and the code never expires. You own the PNG/SVG. Use SVG for print so it stays razor-sharp at any size.",
    intro:
      "Put a website, form or profile behind a scannable code for posters, packaging, slides or business cards.",
    primaryTool: "qr-code-generator",
    tools: ["qr-code-generator", "qr-code-with-logo", "vcard-qr-code-generator", "qr-code-scanner"],
    steps: [
      { title: "Paste your link", description: "Enter the full URL (including https://) into the QR Code Generator." },
      { title: "Generate the code", description: "The QR is created instantly in your browser. Nothing is uploaded." },
      { title: "Style it (optional)", description: "Add a logo and colors with QR with Logo, keeping enough contrast so it stays scannable." },
      { title: "Download SVG for print", description: "Grab an SVG for posters and packaging so it never pixelates. PNG is fine for screens." },
    ],
    mistakes: [
      "Forgetting the https:// prefix, so scanners treat the link as plain text instead of opening it.",
      "Exporting a small PNG for a large poster. Use SVG (vector) so the code stays sharp at any print size.",
      "Over-styling until scanners struggle. Keep strong contrast and don't cover too much of the pattern with a logo.",
    ],
    faq: [
      { question: "Does the QR code expire?", answer: "No. A standard QR code encodes your URL directly, so it works forever as long as the destination page stays online. You own the exported image." },
      { question: "PNG or SVG?", answer: "SVG for anything printed (posters, packaging) because it scales without blurring. PNG is fine for screens and documents." },
      { question: "Can I add my logo?", answer: "Yes. Use QR Code with Logo. Keep good contrast and leave the finder patterns clear so phones still read it." },
    ],
    related: ["qr-code-for-wifi", "restaurant-menu-qr-code", "business-card-qr-code"],
    tags: ["qr", "link", "url", "generator", "website"],
  },
  {
    slug: "business-card-qr-code",
    group: "QR Codes",
    problem: "I want a QR code that shares my contact details",
    label: "Contact / vCard QR",
    seoTitle: "Business Card QR Code (vCard): Share Contacts With One Scan",
    seoDescription:
      "Create a QR code that adds your name, phone, email and company to someone's contacts instantly. Free, private, in-browser. Print it on your business card.",
    keywords: [
      "business card qr code",
      "vcard qr code",
      "contact qr code",
      "digital business card",
      "qr code with contact details",
    ],
    icon: "Contact",
    accent: "emerald",
    answer:
      "A vCard QR code stores your contact details (name, phone, email, company, website) so one scan saves them straight into someone's phone. Fill in the fields in a business-card/vCard QR generator and download the code for your card, email signature or badge. Ours runs in your browser, so your details are never uploaded.",
    intro:
      "Skip the typing at events. One scan drops your full contact card into their phone.",
    primaryTool: "business-card-qr-code-generator",
    tools: ["business-card-qr-code-generator", "vcard-qr-code-generator", "qr-code-with-logo", "qr-code-generator"],
    steps: [
      { title: "Enter your details", description: "Add your name, phone, email, company, title and website in the business-card/vCard generator." },
      { title: "Generate the vCard code", description: "The QR is built in your browser: your contact info stays on your device." },
      { title: "Brand it", description: "Add a logo or colors with QR with Logo so it matches your card design." },
      { title: "Print or embed", description: "Put the code on your business card, badge, slide or email signature. SVG prints crisp at any size." },
    ],
    mistakes: [
      "Cramming in too many fields until the code gets dense and slow to scan, include the essentials people actually need.",
      "Using an unbranded default when a small logo and color make it look intentional on a card.",
      "Not test-scanning the printed version to confirm the details save correctly on both iPhone and Android.",
    ],
    faq: [
      { question: "What's a vCard QR code?", answer: "It's a QR code containing a standard contact (vCard). Scanning it lets the phone save your name, phone, email and company in one tap." },
      { question: "Does it work in any phone camera?", answer: "Yes. Modern iPhone and Android cameras recognise vCard codes and offer to add the contact." },
      { question: "Can I put it on a printed card?", answer: "Absolutely. Download the SVG so it stays sharp, and keep it at a scannable size with clear margins." },
    ],
    related: ["qr-code-for-a-link", "restaurant-menu-qr-code", "qr-code-for-wifi"],
    tags: ["qr", "vcard", "contact", "business card", "generator"],
  },

  /* ── Developers & Data ───────────────────────────────────────────────────── */
  {
    slug: "fix-invalid-json",
    group: "Developers & Data",
    problem: "My JSON is invalid and I can't find the error",
    label: "Invalid JSON",
    seoTitle: "Fix Invalid JSON: Free Validator That Points to the Error",
    seoDescription:
      "'Unexpected token', 'Invalid JSON'? Paste it into a validator that highlights the exact line and reason, then format it cleanly. Free, private, in your browser.",
    keywords: [
      "invalid json",
      "json validator",
      "fix json error",
      "unexpected token in json",
      "json syntax error",
    ],
    icon: "Braces",
    accent: "violet",
    answer:
      "When JSON is invalid, a validator finds the exact spot: paste it in and it flags the line and reason, usually a trailing comma, a missing quote or bracket, or single quotes instead of double. Fix that character, then format it to make the structure obvious. Our JSON Validator and Formatter run in your browser on your data.",
    intro:
      "'Unexpected token' almost always means one stray character. A validator points straight at it so you're not hunting by eye.",
    primaryTool: "json-validator",
    tools: ["json-validator", "json-formatter", "json-tree-viewer", "json-diff"],
    steps: [
      { title: "Paste your JSON into the validator", description: "The JSON Validator parses it in your browser and reports the first error with its line and column." },
      { title: "Fix the flagged character", description: "The usual suspects: a trailing comma, an unquoted key, single quotes, or a missing } or ]." },
      { title: "Format to reveal the structure", description: "Run the JSON Formatter to indent it, mismatched nesting becomes obvious at a glance." },
      { title: "Re-validate until it's clean", description: "Repeat until the validator reports valid, then use the Tree Viewer to sanity-check the shape." },
    ],
    mistakes: [
      "Trailing commas after the last item in an object or array, valid in JavaScript, invalid in JSON.",
      "Using single quotes. JSON requires double quotes around both keys and string values.",
      "Pasting a JavaScript object or a JSONC file with comments: JSON doesn't allow comments or unquoted keys.",
    ],
    faq: [
      { question: "What does 'Unexpected token' mean in JSON?", answer: "The parser hit a character it didn't expect, commonly a trailing comma, a missing quote or bracket, or a comment. The validator shows exactly where so you can fix that spot." },
      { question: "Why is my JSON invalid but looks fine?", answer: "Often it's single quotes, unquoted keys, or a trailing comma, all legal in JavaScript but not in JSON. Format it and the mismatch usually jumps out." },
      { question: "Is my data safe to paste here?", answer: "Yes. Validation and formatting run entirely in your browser. Nothing is sent to a server." },
    ],
    related: ["convert-csv-to-json", "format-messy-code", "add-meta-tags"],
    tags: ["json", "validator", "format", "developer", "error", "data"],
    fileTypes: ["json"],
  },
  {
    slug: "convert-csv-to-json",
    group: "Developers & Data",
    problem: "I need to convert a CSV file to JSON",
    label: "CSV to JSON",
    seoTitle: "Convert CSV to JSON Online, Free, Private, No Upload",
    seoDescription:
      "Turn a spreadsheet CSV into clean JSON (an array of objects) in seconds, and back again. Free and private: your data is parsed in your browser, never uploaded.",
    keywords: [
      "csv to json",
      "convert csv to json",
      "spreadsheet to json",
      "csv to json array",
      "json to csv",
    ],
    icon: "FileSpreadsheet",
    accent: "emerald",
    answer:
      "To convert CSV to JSON, use a CSV-to-JSON tool: it reads the header row as keys and turns each row into an object, giving you a JSON array ready for an API or app. Paste or drop your file and copy the result. Ours parses everything in your browser, so your data is never uploaded, and it converts back to CSV too.",
    intro:
      "Move data between a spreadsheet and code without a script. Header row becomes keys, each row becomes an object.",
    primaryTool: "csv-to-json",
    tools: ["csv-to-json", "json-to-csv", "json-formatter", "csv-viewer"],
    steps: [
      { title: "Add your CSV", description: "Paste the CSV or drop the file into the CSV to JSON tool. It parses in your browser." },
      { title: "Map the header row", description: "The first row becomes the JSON keys. Each following row becomes one object in the array." },
      { title: "Get clean JSON", description: "Copy the JSON array. Run it through the Formatter if you want it pretty-printed." },
      { title: "Convert back if needed", description: "Need a spreadsheet again later? Use JSON to CSV to reverse it." },
    ],
    mistakes: [
      "A messy header row, spaces, duplicates or blank columns become awkward JSON keys. Clean the header first.",
      "Commas inside a field that aren't quoted, which shift the columns. Make sure text fields with commas are wrapped in quotes.",
      "Assuming numbers stay numbers. Check whether values that look numeric should be strings for your target system.",
    ],
    faq: [
      { question: "What does CSV to JSON produce?", answer: "An array of objects: each CSV row becomes an object whose keys are the column headers. That's the shape most APIs and apps expect." },
      { question: "Can I convert JSON back to CSV?", answer: "Yes, the JSON to CSV tool reverses it, flattening an array of objects back into rows and columns for a spreadsheet." },
      { question: "Is my spreadsheet uploaded?", answer: "No. Parsing and conversion happen in your browser. Your data never leaves the device." },
    ],
    related: ["fix-invalid-json", "format-messy-code", "add-meta-tags"],
    tags: ["csv", "json", "convert", "data", "spreadsheet", "developer"],
    fileTypes: ["csv", "json"],
  },
  {
    slug: "format-messy-code",
    group: "Developers & Data",
    problem: "My code or data is minified and unreadable",
    label: "Format messy code",
    seoTitle: "Beautify Minified JSON, HTML, CSS, SQL & More, Free Formatter",
    seoDescription:
      "Paste minified or messy JSON, HTML, CSS, JavaScript, XML, YAML or SQL and get clean, indented code back. Free and private, it's formatted in your browser.",
    keywords: [
      "beautify json",
      "format code online",
      "minified to readable",
      "prettify html css",
      "sql formatter",
    ],
    icon: "Code",
    accent: "sky",
    answer:
      "To make minified code readable, run it through a formatter (beautifier): it re-indents the structure and adds line breaks so you can actually read and debug it. We have dedicated formatters for JSON, HTML, CSS, JavaScript, XML, YAML and SQL: each works in your browser, so your code is never uploaded. Paste it in and copy the clean version.",
    intro:
      "One long line of minified everything? Pick the matching formatter and get properly indented, readable code back.",
    primaryTool: "json-formatter",
    tools: ["json-formatter", "html-formatter", "css-beautifier", "sql-formatter"],
    steps: [
      { title: "Pick the right formatter", description: "JSON → JSON Formatter, HTML → HTML Formatter, CSS → CSS Beautifier, SQL → SQL Formatter, and so on." },
      { title: "Paste your minified code", description: "Drop in the compressed one-liner. It's processed in your browser. Nothing is sent anywhere." },
      { title: "Get indented output", description: "The formatter re-indents and line-breaks the code so the structure is clear." },
      { title: "Copy it back", description: "Copy the readable version into your editor to inspect, debug or hand off." },
    ],
    mistakes: [
      "Using the wrong tool for the language: format JSON with the JSON formatter, not the HTML one, so it parses correctly.",
      "Formatting invalid code and getting a confusing result. If it's JSON, validate it first to fix syntax, then format.",
      "Committing auto-formatted code that fights your project's linter. Match your team's formatting rules where they exist.",
    ],
    faq: [
      { question: "What languages can I beautify?", answer: "JSON, HTML, CSS, JavaScript, XML, YAML and SQL each have a dedicated formatter. Pick the one that matches your code." },
      { question: "Why won't my JSON format?", answer: "It's probably invalid. Run the JSON Validator first to fix the syntax error, then the formatter can indent it." },
      { question: "Is my code kept private?", answer: "Yes. All formatting happens in your browser. Your code is never uploaded or stored." },
    ],
    related: ["fix-invalid-json", "convert-csv-to-json", "add-meta-tags"],
    tags: ["format", "beautify", "code", "json", "html", "css", "sql", "developer"],
    fileTypes: ["json", "html", "css"],
  },

  /* ── Web & SEO ───────────────────────────────────────────────────────────── */
  {
    slug: "google-cuts-off-my-title",
    group: "Web & SEO",
    problem: "Google cuts off my page title",
    label: "Title cut off in Google",
    seoTitle: "Google Cuts Off Your Title? Check Title Tag Pixel Width, Free",
    seoDescription:
      "Your page title ends in “…” in Google results? Titles are truncated by pixel width, not characters. Preview the exact cut-off and fix your title tag, free, in your browser.",
    keywords: [
      "google cuts off title",
      "title truncated in google",
      "title tag pixel checker",
      "title pixel checker",
      "title tag optimizer",
      "why is my title cut off in search results",
      "title tag length checker",
    ],
    icon: "Type",
    accent: "violet",
    answer:
      "Google truncates titles by rendered pixel width (~600px on desktop), not by character count, which is why a 55-character title full of wide letters can still get cut. Preview your title in a pixel-accurate Google render, see exactly where the ellipsis lands, and trim or front-load your keyword until it fits. It all runs in your browser.",
    intro:
      "A title that trails off into “…” buries your keyword and loses the click. The steps to see the real cut-off point and fix it.",
    primaryTool: "meta-title-preview",
    tools: ["meta-title-preview", "google-serp-preview", "meta-tag-generator"],
    steps: [
      { title: "Open the Meta Title Preview", description: "Type your page title and brand. A pixel-accurate Google result renders live for desktop and mobile: measured in Google's own font, not a rough character count." },
      { title: "Find the truncation point", description: "The readout goes amber near the limit and red where Google would clip. You'll see the exact word the ellipsis lands on for each surface." },
      { title: "Trim, reorder or shorten the brand", description: "Front-load your primary keyword, cut filler words, or shorten the “ | Brand” suffix, the preview updates on every keystroke until both surfaces fit." },
      { title: "Copy the fixed <title> tag", description: "Copy the finished title or a paste-ready <title> tag into your page's <head>, and re-check the full snippet in the SERP preview." },
    ],
    mistakes: [
      "Trusting a character counter: Google cuts by pixel width, so wide letters (W, M, capitals) overflow sooner than “60 characters” suggests.",
      "Putting the brand first: when space runs out, it's your keyword that gets clipped instead of the brand suffix.",
      "Fixing desktop only, mobile truncates at a narrower width, and most searches happen there. Check both previews.",
    ],
    faq: [
      { question: "Why does Google cut off my title when it's under 60 characters?", answer: "Because truncation is by rendered pixel width (~600px desktop), not character count. Titles heavy in wide letters exceed the limit at fewer characters. Measure the real width with a pixel-based preview instead of counting characters." },
      { question: "What is the ideal title tag length?", answer: "Roughly 50–60 characters or under ~600 pixels on desktop, but treat the pixel measurement as the real test. Also keep it long enough to be descriptive. Ultra-short titles waste the space that earns clicks." },
      { question: "Can I stop Google rewriting my title?", answer: "Not entirely: Google may rewrite titles it considers a poor match. Keeping your title concise, unique, relevant to your H1 and fitting within the pixel budget makes Google far more likely to show it as written." },
    ],
    related: ["meta-description-too-long", "add-meta-tags", "audit-page-seo"],
    tags: ["title", "seo", "serp", "meta", "truncation", "pixel"],
    fileTypes: ["html"],
  },
  {
    slug: "meta-description-too-long",
    group: "Web & SEO",
    problem: "My meta description gets cut off",
    label: "Meta description too long",
    seoTitle: "Meta Description Too Long? Check the Length & Preview, Free",
    seoDescription:
      "Google truncates your meta description? Check its real rendered length, preview the snippet on desktop and mobile, and rewrite it to fit: free, private, in your browser.",
    keywords: [
      "meta description too long",
      "meta description checker",
      "meta description length checker",
      "how long should a meta description be",
      "meta description cut off",
      "meta description preview",
    ],
    icon: "AlignLeft",
    accent: "sky",
    answer:
      "Google shows roughly 150–160 characters of a meta description on desktop (less on mobile) and truncates the rest by rendered width. Paste your title, URL and description into a pixel-accurate SERP preview to see exactly where the snippet is clipped, then tighten the copy until the full pitch fits. Everything runs in your browser.",
    intro:
      "A description that ends mid-sentence reads broken and wastes your pitch. Check the real cut-off and rewrite to fit.",
    primaryTool: "google-serp-preview",
    tools: ["google-serp-preview", "meta-tag-generator", "meta-tag-analyzer"],
    steps: [
      { title: "Open the Google SERP Preview", description: "Type your title, URL and meta description. A faithful Google snippet renders live for desktop and mobile, measured by pixel width, the way Google actually truncates." },
      { title: "Spot the cut-off", description: "The preview flags the exact point the ellipsis would appear on each surface, with a live length and pixel readout and green/amber/red guidance." },
      { title: "Rewrite to fit", description: "Lead with the benefit and the keyword, keep it specific to the page, and trim until both previews show the full description." },
      { title: "Copy the optimized meta block", description: "Copy the ready-to-paste meta tags into your page's <head>. Analyze an existing page first with the Meta Tag Analyzer if you're auditing." },
    ],
    mistakes: [
      "Writing one description for every page, duplicates get ignored or rewritten by Google. Each page needs its own.",
      "Counting characters only: 160 characters of wide letters can still truncate. The pixel preview is the real test.",
      "Front-loading fluff (“Welcome to our website…”) so the actual pitch is exactly what gets cut off.",
    ],
    faq: [
      { question: "How long should a meta description be?", answer: "Aim for about 150–160 characters so it survives on desktop, and put the key message in the first ~120 so it also reads well on mobile. Google truncates by rendered pixel width, so preview the real snippet rather than relying on a character count." },
      { question: "Does the meta description affect rankings?", answer: "Not directly, but it strongly affects click-through rate, which is traffic you're leaving behind if the snippet is truncated or generic. A clear, complete, page-specific description earns more clicks from the same position." },
      { question: "Why does Google show a different description than mine?", answer: "Google rewrites descriptions it judges irrelevant to the query, often pulling page text instead. Specific, accurate descriptions that match the page's content are far more likely to be shown as written." },
    ],
    related: ["google-cuts-off-my-title", "add-meta-tags", "audit-page-seo"],
    tags: ["meta", "description", "seo", "serp", "snippet", "truncation"],
    fileTypes: ["html"],
  },
  {
    slug: "og-image-not-showing",
    group: "Web & SEO",
    problem: "My link preview image isn't showing",
    label: "OG image not showing",
    seoTitle: "OG Image Not Showing? Validate & Fix Your Link Preview: Free",
    seoDescription:
      "Facebook, LinkedIn or WhatsApp shows no image for your link? Validate your og:image (size, URL, tags), find the exact cause and fix it, free, private, in your browser.",
    keywords: [
      "og image not showing",
      "link preview image not showing",
      "facebook not showing link image",
      "og:image not working",
      "open graph image not displaying",
      "whatsapp link preview no image",
    ],
    icon: "ImageOff",
    accent: "violet",
    answer:
      "A missing link-preview image almost always means the og:image tag is absent, relative instead of absolute, too small (under 200×200px), or the platform cached an old version of the page. Run your page's HTML through an Open Graph validator to see which one it is, fix the tag, then force the platform to re-scrape the URL.",
    intro:
      "A bare text card gets a fraction of the clicks a rich image card does. How to do it to find the exact reason yours is blank.",
    primaryTool: "social-share-inspector",
    tools: ["social-share-inspector", "open-graph-preview", "open-graph-generator", "image-resizer"],
    steps: [
      { title: "Inspect the page", description: "Paste your page's HTML into the Social Share Inspector. It validates the og:image (presence, absolute HTTPS URL, minimum size, ratio) and reconstructs the card each platform would draw." },
      { title: "Read the diagnosis", description: "Each problem comes with its cause, impact and exact fix: a missing tag, a relative path, an image below 200×200, or a near-square image that renders as a tiny thumbnail instead of the large card." },
      { title: "Fix the tag or the image", description: "Generate a correct og:image tag (ideally 1200×630) with the Open Graph Generator, or resize the image itself. Preview the fixed card before shipping." },
      { title: "Force a re-scrape", description: "Platforms cache previews. After deploying, refresh the cache (Facebook's Sharing Debugger, LinkedIn's Post Inspector, or share a versioned URL (?v=2)) so the new image appears." },
    ],
    mistakes: [
      "Using a relative path in og:image. Platforms can't resolve it. The URL must be absolute and HTTPS.",
      "Fixing the tag but not re-scraping: the platform keeps showing its cached, image-less preview for days.",
      "Using a near-square or tiny image. Under 200×200 is skipped entirely, and squares render as small thumbnails, not the large card.",
    ],
    faq: [
      { question: "Why does Facebook show no image for my link?", answer: "Usually one of four causes: no og:image tag, a relative (not absolute) image URL, an image smaller than 200×200 pixels, or Facebook's cached copy predates your fix. Validate the page to identify which, then re-scrape the URL in Facebook's Sharing Debugger." },
      { question: "What size should an og:image be?", answer: "1200×630 pixels (a 1.91:1 ratio) renders the full-width card everywhere. 200×200 is the hard minimum most platforms accept. Near-square images are shown as small thumbnails instead of the large card." },
      { question: "I fixed my og:image: why does the old preview still show?", answer: "Platforms cache link previews aggressively. Force a refresh: Facebook's Sharing Debugger has a Scrape Again button, LinkedIn has the Post Inspector, and elsewhere sharing the URL with a query string (?v=2) fetches a fresh preview." },
    ],
    related: ["add-meta-tags", "google-cuts-off-my-title", "meta-description-too-long"],
    tags: ["open-graph", "og-image", "social", "preview", "share", "meta"],
    fileTypes: ["html"],
  },
  {
    slug: "add-meta-tags",
    group: "Web & SEO",
    problem: "My site has no meta tags or preview when shared",
    label: "Add meta tags",
    seoTitle: "Add Meta Tags & Open Graph, Free Generator + Preview",
    seoDescription:
      "Your links share with no title, description or image? Generate proper meta and Open Graph tags, preview how they look on Google and social, and paste them in. Free.",
    keywords: [
      "add meta tags",
      "meta tag generator",
      "open graph tags",
      "no preview when sharing link",
      "seo meta description",
    ],
    icon: "Tags",
    accent: "emerald",
    answer:
      "If your pages show no title, description or image when shared, they're missing meta and Open Graph tags. Generate them with a meta tag generator (set the title, description, and share image) then paste the tags into each page's <head>. Preview how they'll appear on Google and social first. All of it runs in your browser.",
    intro:
      "A blank preview costs you clicks. Add the right tags so Google and social show a proper title, description and image.",
    primaryTool: "meta-tag-generator",
    tools: ["meta-tag-generator", "open-graph-generator", "meta-tag-analyzer", "google-serp-preview"],
    steps: [
      { title: "Generate your meta tags", description: "Use the Meta Tag Generator to set the page title, description and keywords, and get ready-to-paste HTML." },
      { title: "Add Open Graph + Twitter tags", description: "The Open Graph Generator produces the og: and twitter: tags that control the share preview image and text." },
      { title: "Preview before you ship", description: "Check the Google SERP Preview and social preview so the title isn't truncated and the image is right." },
      { title: "Paste into each page's <head>", description: "Drop the tags into the <head> of every page, titles and descriptions should be unique per page." },
    ],
    mistakes: [
      "Reusing one title and description across every page. Each page needs unique, descriptive meta to rank and read well.",
      "Skipping the Open Graph image, so shared links show a blank or random thumbnail. Set an og:image (ideally 1200×630).",
      "Writing titles over ~60 characters or descriptions over ~160, which Google truncates in results.",
    ],
    faq: [
      { question: "Why do my shared links have no preview?", answer: "The page is missing Open Graph tags (og:title, og:description, og:image). Generate them and add them to the page's <head> so social platforms have something to show." },
      { question: "What's the ideal meta description length?", answer: "Around 150–160 characters so Google doesn't cut it off. Make it specific and unique to each page: preview it before publishing." },
      { question: "Do meta tags help SEO?", answer: "A good title tag and description improve click-through from search, and Open Graph controls how links look when shared: both drive more traffic to well-structured pages." },
    ],
    related: ["fix-invalid-json", "format-messy-code", "optimize-svg"],
    tags: ["meta", "seo", "open-graph", "tags", "website", "preview"],
    fileTypes: ["html"],
  },

  /* ── Video & Audio ───────────────────────────────────────────────────────── */
  {
    slug: "compress-a-video",
    group: "Video & Audio",
    problem: "My video is too large to send or upload",
    label: "Video too large",
    seoTitle: "Video Too Large? Compress It in Your Browser, Free & Private",
    seoDescription:
      "Shrink a big video so it fits an email or upload limit, right in your browser, no upload to a server. Free, private, no sign-up. Trim or resize to save even more.",
    keywords: [
      "compress video",
      "video too large",
      "reduce video size",
      "shrink mp4",
      "make video smaller",
    ],
    icon: "FileVideo",
    accent: "sky",
    answer:
      "To shrink a video, run it through a video compressor: it re-encodes the footage at a lower bitrate or resolution, often cutting the size dramatically. Trimming to the part you actually need saves even more. Our Video Compressor processes the file in your browser, so it's never uploaded, though large clips take time and memory locally.",
    intro:
      "Phone videos get huge fast. Compress, resize or trim to fit an email or upload limit without a cloud service.",
    primaryTool: "video-compressor",
    tools: ["video-compressor", "video-resizer", "video-trimmer", "video-converter"],
    steps: [
      { title: "Open the Video Compressor", description: "Drop your clip in. Processing happens in your browser, the video isn't uploaded to a server." },
      { title: "Lower the resolution or bitrate", description: "Dropping 4K to 1080p, or 1080p to 720p, cuts the size a lot while still looking fine on most screens." },
      { title: "Trim to what matters", description: "Use the Video Trimmer to keep only the section you need. Shorter footage means a much smaller file." },
      { title: "Export and check the size", description: "Save and confirm it's under your target. Convert to a modern format like WebM to squeeze it further." },
    ],
    mistakes: [
      "Trying to process a very large clip on a low-memory device: browser-based encoding is limited. Trim first or use a smaller source.",
      "Keeping 4K when the destination only shows 1080p, wasting size on resolution nobody will see.",
      "Sending a 10-minute clip when 30 seconds makes the point: trim before you compress.",
    ],
    faq: [
      { question: "How do I make a video small enough to email?", answer: "Compress it and trim to the essential part. Lowering the resolution (e.g. to 720p) plus a shorter length usually gets well under email limits." },
      { question: "Does compressing happen in the browser?", answer: "Yes. The Video Compressor encodes locally, so your footage is never uploaded. Large clips are slower and use more memory, so trim when you can." },
      { question: "Which format is smallest?", answer: "WebM is typically smaller than MP4 at similar quality. Convert to WebM when the destination supports it." },
    ],
    related: ["email-attachment-too-large", "extract-audio-from-video", "image-too-large"],
    tags: ["video", "compress", "reduce", "size", "mp4", "trim"],
    fileTypes: ["mp4", "webm"],
  },
  {
    slug: "extract-audio-from-video",
    group: "Video & Audio",
    problem: "I want to get the audio (MP3) out of a video",
    label: "Extract audio",
    seoTitle: "Extract Audio From Video (MP4 to MP3), Free & In-Browser",
    seoDescription:
      "Pull the audio track out of a video and save it as MP3. No upload, no sign-up. Rip a soundtrack, podcast or voice note from any clip, privately in your browser.",
    keywords: [
      "extract audio from video",
      "mp4 to mp3",
      "video to mp3",
      "rip audio from video",
      "get sound from video",
    ],
    icon: "AudioLines",
    accent: "amber",
    answer:
      "To get the audio from a video, use an extract-audio tool: it separates the soundtrack and saves it as an audio file like MP3. Drop your clip in and download just the sound: useful for podcasts, music, lectures or voice notes. Our Extract Audio tool runs in your browser, so the video is never uploaded.",
    intro:
      "Keep only the sound (a lecture, a song, a podcast segment) as a clean MP3 you can play anywhere.",
    primaryTool: "extract-audio",
    tools: ["extract-audio", "audio-to-mp3", "audio-trimmer", "audio-compressor"],
    steps: [
      { title: "Open the Extract Audio tool", description: "Drop your video in. It's processed in your browser: the file isn't uploaded." },
      { title: "Extract the audio track", description: "The tool pulls the sound out of the video, separate from the picture." },
      { title: "Save as MP3", description: "Export the audio as MP3 (or convert with Audio to MP3) for maximum compatibility." },
      { title: "Trim or tidy", description: "Use the Audio Trimmer to cut to the exact part, or compress it if the file is large." },
    ],
    mistakes: [
      "Extracting from a huge video on a low-memory device. Trim the clip first so the browser can handle it.",
      "Expecting studio quality from a noisy source. Extraction preserves the original audio, it can't clean up bad recording.",
      "Ripping content you don't have the rights to reuse, only extract audio you're allowed to.",
    ],
    faq: [
      { question: "How do I convert MP4 to MP3?", answer: "Use the Extract Audio tool to pull the soundtrack out of the MP4, then save it as MP3. It all runs in your browser." },
      { question: "Will the audio quality drop?", answer: "Extraction keeps the video's original audio. You choose the MP3 quality on export. Higher bitrate for music, lower is fine for speech." },
      { question: "Is my video uploaded?", answer: "No. The audio is extracted locally in your browser. The video never leaves your device." },
    ],
    related: ["compress-a-video", "make-a-ringtone", "email-attachment-too-large"],
    tags: ["video", "audio", "mp3", "extract", "convert"],
    fileTypes: ["mp4", "mp3"],
  },
  {
    slug: "make-a-ringtone",
    group: "Video & Audio",
    problem: "I want to make a ringtone from a song",
    label: "Make a ringtone",
    seoTitle: "Make a Ringtone From Any Song: Free Trimmer, No Upload",
    seoDescription:
      "Cut the best part of a song into a ringtone with a clean fade in and out. Free and private. Trim and export in your browser, no sign-up, no upload.",
    keywords: [
      "make a ringtone",
      "ringtone maker",
      "cut song for ringtone",
      "trim mp3 ringtone",
      "custom ringtone",
    ],
    icon: "Music",
    accent: "rose",
    answer:
      "To make a ringtone, trim a song down to the 20–30 second hook and add a short fade in and out so it starts and ends cleanly. Our Ringtone Maker and Audio Trimmer do this in your browser: pick the segment, fade the edges, export. The audio is never uploaded. Then set the file as your ringtone on your phone.",
    intro:
      "Grab the best 30 seconds of a track, smooth the edges, and export a ringtone-ready clip.",
    primaryTool: "ringtone-maker",
    tools: ["ringtone-maker", "audio-trimmer", "audio-fade", "audio-to-mp3"],
    steps: [
      { title: "Open the Ringtone Maker", description: "Drop your song in. It's processed in your browser, the audio isn't uploaded." },
      { title: "Trim to the hook", description: "Select the 20–30 seconds you want. Phone ringtones are usually capped around 30–40 seconds." },
      { title: "Add a fade", description: "Apply a short fade in and out with Audio Fade so it doesn't start or stop abruptly." },
      { title: "Export and set it", description: "Save the clip, then add it as a ringtone through your phone's settings or a syncing app." },
    ],
    mistakes: [
      "Making the clip too long: phones limit ringtone length, so keep it around 30 seconds.",
      "Cutting on a hard beat with no fade, so it clicks or pops at the loop point. Add a quick fade.",
      "Forgetting each phone has its own way to install a ringtone (and iPhone often expects a specific format/length).",
    ],
    faq: [
      { question: "How long should a ringtone be?", answer: "Usually 20–30 seconds: most phones cap ringtones around 30–40 seconds. Trim to the catchiest part and fade the ends." },
      { question: "Can I make an iPhone ringtone?", answer: "You can create and export the trimmed clip here. Installing it on iPhone has extra steps (format/length and syncing) handled by your phone or a desktop app." },
      { question: "Is the song uploaded anywhere?", answer: "No. Trimming, fading and exporting all happen in your browser. Only make ringtones from audio you have the right to use." },
    ],
    related: ["extract-audio-from-video", "compress-a-video", "image-too-large"],
    tags: ["ringtone", "audio", "trim", "song", "mp3", "fade"],
    fileTypes: ["mp3"],
  },

  /* ── SVG & Vectors ───────────────────────────────────────────────────────── */
  {
    slug: "optimize-svg",
    group: "SVG & Vectors",
    problem: "My SVG file is huge and full of junk",
    label: "Optimize SVG",
    seoTitle: "Optimize an SVG, Cut File Size Without Losing Quality (Free)",
    seoDescription:
      "SVGs exported from design tools carry loads of bloat. Optimize yours to strip metadata and shrink it, often by half or more, with no visible change. Free, in-browser.",
    keywords: [
      "optimize svg",
      "svg too big",
      "compress svg",
      "minify svg",
      "reduce svg file size",
    ],
    icon: "PenTool",
    accent: "orange",
    answer:
      "SVGs exported from design tools are full of editor metadata, comments and redundant precision. An SVG optimizer strips all that and simplifies the paths, often halving the file size with no visible change: vectors stay razor-sharp. Our SVG Optimizer and Compressor run in your browser, so your file is never uploaded. Optimize, then copy or download.",
    intro:
      "Design-tool exports carry a lot of invisible bloat. Clean it out so your icons and illustrations load faster.",
    primaryTool: "svg-optimizer",
    tools: ["svg-optimizer", "svg-compressor", "svg-minifier", "svg-to-css"],
    steps: [
      { title: "Open the SVG Optimizer", description: "Paste your SVG markup or drop the file in, it's processed in your browser." },
      { title: "Strip the bloat", description: "The optimizer removes editor metadata, comments and needless decimal precision from the paths." },
      { title: "Check it still looks right", description: "Preview the result. Vectors should be identical while the byte count drops, often by half or more." },
      { title: "Copy or download", description: "Grab the clean SVG. Use SVG to CSS if you want it as an inline background or data URI." },
    ],
    mistakes: [
      "Over-optimizing until IDs or classes your CSS/JS relies on get stripped. Check that animations and styling still work.",
      "Flattening precision so far that curves visibly deform. Keep enough decimals for smooth shapes.",
      "Optimizing one icon at a time when a whole set could be cleaned and combined into a sprite.",
    ],
    faq: [
      { question: "Why is my SVG so large?", answer: "Design tools embed metadata, comments, and high-precision path data. An optimizer removes the invisible extras, typically cutting the size by half or more with no visual change." },
      { question: "Will optimizing change how it looks?", answer: "It shouldn't: vectors stay sharp. Just preview after optimizing, especially if your SVG uses specific IDs for CSS or animation." },
      { question: "Is my SVG uploaded?", answer: "No. Optimization runs in your browser. Your markup never leaves the device." },
    ],
    related: ["image-too-large", "format-messy-code", "add-meta-tags"],
    tags: ["svg", "optimize", "compress", "minify", "vector", "size"],
    fileTypes: ["svg"],
  },

  /* ── Documents & PDF (batch 2) ───────────────────────────────────────────── */
  {
    slug: "add-page-numbers-to-pdf",
    group: "Documents & PDF",
    problem: "I need to add page numbers to a PDF",
    label: "Add page numbers",
    seoTitle: "Add Page Numbers to a PDF, Free, Private, No Sign-Up",
    seoDescription:
      "Insert page numbers into a PDF and choose the position and start number. Free and private. It runs in your browser, the file is never uploaded. No watermark.",
    keywords: [
      "add page numbers to pdf",
      "pdf page numbers",
      "number pdf pages",
      "insert page numbers pdf",
      "paginate pdf",
    ],
    icon: "ListOrdered",
    accent: "rose",
    answer:
      "To number a PDF, use a page-number tool: pick a position (footer, header, a corner), a starting number and a format, and it stamps every page. Our Page Number tool does this in your browser, so the document is never uploaded. It's the quick way to paginate a report, contract or thesis before you submit it.",
    intro:
      "Reports, contracts and dissertations usually need numbered pages. Add them in seconds without Acrobat.",
    primaryTool: "document-page-number",
    tools: ["document-page-number", "pdf-editor", "merge-pdf", "document-watermark"],
    steps: [
      { title: "Open the Page Number tool", description: "Drop your PDF in. It loads locally in your browser, nothing is uploaded." },
      { title: "Choose the position", description: "Place numbers in the footer, header or a corner, and set the alignment (left, centre, right)." },
      { title: "Set the start and format", description: "Begin at 1 (or skip a cover page), and pick a style like '1', 'Page 1' or '1 of 20'." },
      { title: "Apply and download", description: "The tool stamps every page. If you merged files first, number the combined PDF so the sequence is continuous." },
    ],
    mistakes: [
      "Numbering before merging, so each section restarts at 1: combine the PDFs first, then paginate the whole thing.",
      "Placing numbers where they collide with existing footer text or a signature block. Leave a margin.",
      "Forgetting a cover or contents page should often be skipped or numbered differently from the body.",
    ],
    faq: [
      { question: "Can I start page numbers from a specific number?", answer: "Yes. Set the starting number so you can skip a cover page or continue numbering from an earlier document." },
      { question: "Will it cover up my content?", answer: "Numbers sit in the margin you choose. Pick a position and alignment that avoids existing footers or signatures, and preview before saving." },
      { question: "Is my PDF uploaded?", answer: "No. Page numbering runs in your browser. The document never leaves your device." },
    ],
    related: ["rotate-a-pdf", "watermark-a-pdf", "combine-pdf-files"],
    tags: ["pdf", "page numbers", "paginate", "edit", "document"],
    fileTypes: ["pdf"],
  },
  {
    slug: "rotate-a-pdf",
    group: "Documents & PDF",
    problem: "My PDF pages are sideways or upside down",
    label: "Rotate a PDF",
    seoTitle: "Rotate a PDF and Save It That Way, Free & Private",
    seoDescription:
      "Pages scanned sideways or upside down? Rotate a PDF 90°, 180° or 270° and save the fix permanently. Free, private, in your browser. No sign-up, no watermark.",
    keywords: [
      "rotate pdf",
      "pdf sideways",
      "pdf upside down",
      "turn pdf pages",
      "rotate and save pdf",
    ],
    icon: "RotateCw",
    accent: "cyan",
    answer:
      "Scanners and phones often save PDF pages in the wrong orientation. A rotate tool turns pages 90°, 180° or 270° and, crucially, saves the rotation into the file, so it stays fixed everywhere. Our Rotate PDF tool does this in your browser. Rotate every page at once, or just the ones that came out sideways.",
    intro:
      "Tilting your head to read a scan? Rotate the pages and save the fix so it's right on every device.",
    primaryTool: "rotate-pdf",
    tools: ["rotate-pdf", "pdf-editor", "split-pdf", "compress-pdf"],
    steps: [
      { title: "Open the Rotate PDF tool", description: "Drop the PDF in. It renders in your browser. The file is never uploaded." },
      { title: "Rotate the pages", description: "Turn all pages together, or select only the sideways/upside-down ones and rotate those." },
      { title: "Confirm the orientation", description: "Check the preview so every page reads upright before you export." },
      { title: "Save the rotated PDF", description: "Download it. The rotation is baked into the file, so it opens correctly everywhere, not just in your viewer." },
    ],
    mistakes: [
      "Rotating in a viewer without saving. That only changes the view, not the file. Export so the fix sticks.",
      "Rotating every page when only a couple are wrong. Select just those to avoid tipping the correct ones.",
      "Confusing 90° clockwise with anticlockwise. Check the preview rather than guessing the direction.",
    ],
    faq: [
      { question: "Why does my PDF look right in the app but wrong when shared?", answer: "Your viewer rotated the view without saving it. Use Rotate PDF to bake the rotation into the file so it's correct for everyone." },
      { question: "Can I rotate only some pages?", answer: "Yes. Rotate the whole document or pick individual pages, handy when a scan mixed upright and sideways pages." },
      { question: "Is it free and private?", answer: "Yes. No account, no watermark, and the file is processed in your browser, never uploaded." },
    ],
    related: ["pdf-to-images", "add-page-numbers-to-pdf", "edit-text-in-a-pdf"],
    tags: ["pdf", "rotate", "orientation", "scan", "edit"],
    fileTypes: ["pdf"],
  },
  {
    slug: "photos-to-pdf",
    group: "Documents & PDF",
    problem: "I need to turn photos into a single PDF",
    label: "Photos to PDF",
    seoTitle: "Combine Photos Into One PDF (JPG to PDF): Free & Private",
    seoDescription:
      "Turn phone photos or scans into a single PDF in the order you want. Free, private and in your browser: great for receipts, documents and assignments. No sign-up.",
    keywords: [
      "photos to pdf",
      "jpg to pdf",
      "images to pdf",
      "combine photos into pdf",
      "scan photos to pdf",
    ],
    icon: "Images",
    accent: "violet",
    answer:
      "To turn photos into a PDF, use a JPG-to-PDF tool: add your images, arrange them in order, and export one PDF with a page per photo. Our tool runs in your browser, so the pictures are never uploaded. It's the easy way to send phone-snapped receipts, documents or homework as a single, tidy file.",
    intro:
      "Snapped a multi-page document with your phone? Bundle the photos into one ordered PDF to submit or email.",
    primaryTool: "jpg-to-pdf",
    tools: ["jpg-to-pdf", "merge-pdf", "compress-pdf", "ocr-pdf"],
    steps: [
      { title: "Open the JPG to PDF tool", description: "Drop in all the photos you want in the document. They load locally in your browser." },
      { title: "Put them in order", description: "Drag the images into the correct page sequence before you export." },
      { title: "Export one PDF", description: "The tool places each photo on its own page and builds a single PDF." },
      { title: "Compress or make it searchable", description: "Large phone photos? Compress the PDF. Need selectable text? Run OCR to recognise the words." },
    ],
    mistakes: [
      "Skipping the ordering step and getting pages out of sequence, arrange the photos before exporting.",
      "Exporting full-resolution phone photos into a huge PDF. Compress it afterwards to meet upload limits.",
      "Expecting selectable text from photos. A picture of text is still an image until you run OCR on it.",
    ],
    faq: [
      { question: "How do I combine several photos into one PDF?", answer: "Add them to the JPG to PDF tool, drag them into order, and export, each photo becomes a page in a single PDF." },
      { question: "Can I make the text in my photo selectable?", answer: "Yes, run OCR PDF after converting. It recognises the text in the images so you can search and copy it." },
      { question: "Are my photos uploaded?", answer: "No. The conversion happens in your browser. Your images never leave the device." },
    ],
    related: ["pdf-to-images", "combine-pdf-files", "image-too-large"],
    tags: ["photo", "image", "jpg", "pdf", "convert", "scan"],
    fileTypes: ["jpg", "pdf"],
  },
  {
    slug: "pdf-to-images",
    group: "Documents & PDF",
    problem: "I need to save PDF pages as images",
    label: "PDF to images",
    seoTitle: "Convert PDF to JPG Images, Free, Private, No Upload",
    seoDescription:
      "Turn each PDF page into a JPG image to embed, post or send. Free and private. The PDF is converted in your browser and never uploaded. No sign-up, no watermark.",
    keywords: [
      "pdf to jpg",
      "pdf to image",
      "convert pdf to jpg",
      "save pdf page as image",
      "pdf pages to png",
    ],
    icon: "FileImage",
    accent: "sky",
    answer:
      "To turn a PDF into pictures, use a PDF-to-JPG tool: it renders each page as an image you can post, embed in a slide, or attach where PDFs aren't accepted. Our tool converts in your browser, so the file is never uploaded. Grab a single page or export every page as a separate image.",
    intro:
      "Need a PDF page as a picture for a slide, a post, or a form that only takes images? Convert the pages to JPG.",
    primaryTool: "pdf-to-jpg",
    tools: ["pdf-to-jpg", "pdf-to-word", "image-compressor", "crop-image"],
    steps: [
      { title: "Open the PDF to JPG tool", description: "Drop your PDF in: it's rendered in your browser, nothing is uploaded." },
      { title: "Pick the pages", description: "Convert the whole document or just the page you need as an image." },
      { title: "Export the images", description: "Each page becomes a JPG. Download one, or all of them at once." },
      { title: "Resize or compress", description: "For a website or upload, run the images through Compress or Crop to hit size and framing requirements." },
    ],
    mistakes: [
      "Converting a whole book when you only need one page, select the page to avoid a giant batch.",
      "Exporting low-resolution images for print. Use a higher quality when the picture needs to look sharp.",
      "Choosing JPG for a page with crisp text and fine lines, where a lossless PNG can look cleaner.",
    ],
    faq: [
      { question: "How do I save one PDF page as a picture?", answer: "Open the PDF to JPG tool, select that page, and export it as an image. Everything runs in your browser." },
      { question: "JPG or PNG for a PDF page?", answer: "JPG is smaller and fine for photo-heavy pages. PNG is lossless and sharper for pages with crisp text or diagrams." },
      { question: "Is my document uploaded?", answer: "No. The PDF is rendered to images in your browser and never sent to a server." },
    ],
    related: ["photos-to-pdf", "convert-pdf-to-word", "rotate-a-pdf"],
    tags: ["pdf", "jpg", "image", "convert", "png"],
    fileTypes: ["pdf", "jpg", "png"],
  },
  {
    slug: "remove-pages-from-pdf",
    group: "Documents & PDF",
    problem: "I need to delete pages from a PDF",
    label: "Delete PDF pages",
    seoTitle: "Delete Pages From a PDF, Free, Private, No Sign-Up",
    seoDescription:
      "Remove blank, extra or confidential pages from a PDF, or keep only the pages you need. Free and private. It runs in your browser, no upload, no watermark.",
    keywords: [
      "delete pages from pdf",
      "remove pdf pages",
      "extract pdf pages",
      "keep only some pdf pages",
      "delete blank page pdf",
    ],
    icon: "FileMinus2",
    accent: "amber",
    answer:
      "To drop pages from a PDF, use a delete/extract pages tool: select the pages to remove (or the ones to keep) and export a trimmed file. Our tools do this in your browser, so nothing is uploaded. It's how you strip a blank scan page, cut a confidential section, or keep just the pages a form asks for.",
    intro:
      "Blank scan pages, an extra appendix, a page you can't share, remove them and export a clean PDF.",
    primaryTool: "delete-pdf-pages",
    tools: ["delete-pdf-pages", "extract-pdf-pages", "split-pdf", "merge-pdf"],
    steps: [
      { title: "Open the Delete Pages tool", description: "Drop the PDF in. It renders in your browser, no upload involved." },
      { title: "Select what to remove", description: "Tick the pages to delete. To do the opposite, use Extract Pages to keep only the ones you want." },
      { title: "Review the result", description: "Check the remaining pages are the right ones and in the right order." },
      { title: "Download the trimmed PDF", description: "Export the smaller file. Removing pages also shrinks the size, which helps with upload limits." },
    ],
    mistakes: [
      "Deleting by eye and removing the wrong page: double-check page numbers against the preview first.",
      "Assuming a 'deleted' page is unrecoverable from the original. Keep a copy if you might need it back.",
      "Removing pages one file at a time when Split PDF would separate a big document faster.",
    ],
    faq: [
      { question: "How do I remove a single page from a PDF?", answer: "Open the Delete Pages tool, select that page, and export. The page is dropped from the downloaded file." },
      { question: "Can I instead keep only certain pages?", answer: "Yes: use Extract Pages to pull out just the pages you want into a new PDF, leaving the rest behind." },
      { question: "Is my PDF uploaded?", answer: "No. Pages are removed in your browser and the document is never sent anywhere." },
    ],
    related: ["combine-pdf-files", "pdf-too-large", "add-page-numbers-to-pdf"],
    tags: ["pdf", "delete", "remove", "pages", "extract", "split"],
    fileTypes: ["pdf"],
  },
  {
    slug: "watermark-a-pdf",
    group: "Documents & PDF",
    problem: "I want to add a watermark to a PDF",
    label: "Watermark a PDF",
    seoTitle: "Add a Watermark to a PDF (DRAFT, CONFIDENTIAL), Free",
    seoDescription:
      "Stamp text or a logo watermark across a PDF, DRAFT, CONFIDENTIAL, your brand. Free and private, right in your browser. No sign-up, no upload, no watermark of ours.",
    keywords: [
      "watermark pdf",
      "add watermark to pdf",
      "draft stamp pdf",
      "confidential pdf",
      "brand a pdf",
    ],
    icon: "Stamp",
    accent: "indigo",
    answer:
      "To watermark a PDF, use a watermark tool: overlay text like DRAFT or CONFIDENTIAL, or a logo, across every page, and set the opacity, angle and position. Our tool runs in your browser, so the document is never uploaded, and it adds no watermark of its own. It's the way to brand or mark the status of a document before sharing.",
    intro:
      "Mark a document as a draft, flag it confidential, or brand it with your logo, across every page, in seconds.",
    primaryTool: "document-watermark",
    tools: ["document-watermark", "document-page-number", "pdf-editor", "pdf-password-protect"],
    steps: [
      { title: "Open the Watermark tool", description: "Drop your PDF in, it's processed in your browser, never uploaded." },
      { title: "Set your watermark", description: "Type text (DRAFT, CONFIDENTIAL, your name) or add a logo image to overlay." },
      { title: "Adjust the look", description: "Choose the opacity, angle (a diagonal 45° reads clearly) and position so it's visible but not overpowering." },
      { title: "Apply and download", description: "The watermark is stamped on every page. For sensitive files, also password-protect the PDF before sharing." },
    ],
    mistakes: [
      "Making the watermark so dark it hides the text underneath. Keep it semi-transparent.",
      "Treating a watermark as security. It discourages misuse but doesn't protect a file. Add a password for that.",
      "Using a tiny corner mark when a diagonal, page-spanning watermark is far harder to crop out.",
    ],
    faq: [
      { question: "How do I stamp DRAFT across a PDF?", answer: "Open the Watermark tool, enter 'DRAFT', set a diagonal angle and moderate opacity, and apply it to every page." },
      { question: "Can I use my logo as the watermark?", answer: "Yes. Add a logo image instead of (or with) text, and adjust its size and transparency." },
      { question: "Does a watermark secure my PDF?", answer: "No. It marks and brands the document but doesn't stop copying. Use Password-Protect PDF for actual protection." },
    ],
    related: ["add-page-numbers-to-pdf", "password-protect-a-pdf", "edit-text-in-a-pdf"],
    tags: ["pdf", "watermark", "stamp", "brand", "confidential", "document"],
    fileTypes: ["pdf"],
  },
  {
    slug: "convert-excel-to-pdf",
    group: "Documents & PDF",
    problem: "I need to convert an Excel spreadsheet to PDF",
    label: "Excel to PDF",
    seoTitle: "Convert Excel to PDF. Keep Your Layout, Free & Private",
    seoDescription:
      "Turn an Excel or spreadsheet file into a clean PDF that looks the same everywhere and can't be edited. Free and private, in your browser. No sign-up, no watermark.",
    keywords: [
      "excel to pdf",
      "convert spreadsheet to pdf",
      "xlsx to pdf",
      "excel sheet to pdf",
      "table to pdf",
    ],
    icon: "Sheet",
    accent: "emerald",
    answer:
      "To share a spreadsheet as a fixed document, convert Excel to PDF: it locks the layout so the table looks identical on every device and nobody can accidentally change a formula. Our Excel to PDF tool handles the conversion. For very wide sheets, set the fit-to-page or landscape option so columns aren't cut off.",
    intro:
      "Send a spreadsheet that keeps its layout and can't be edited, ideal for reports, invoices and quotes.",
    primaryTool: "excel-to-pdf",
    tools: ["excel-to-pdf", "pdf-to-excel", "compress-pdf", "merge-pdf"],
    steps: [
      { title: "Open the Excel to PDF tool", description: "Add your .xlsx or spreadsheet file to convert it to a PDF." },
      { title: "Mind wide tables", description: "For sheets with many columns, use landscape or fit-to-page so nothing spills off the edge." },
      { title: "Convert to PDF", description: "The tool renders the sheet into a clean, fixed-layout PDF." },
      { title: "Combine or compress", description: "Merge it with a cover letter into one PDF, or compress if the export is large." },
    ],
    mistakes: [
      "Converting a very wide sheet in portrait, so the right-hand columns get cut off, switch to landscape or fit-to-page.",
      "Expecting the PDF to stay editable like a spreadsheet. A PDF is fixed. Keep the source file for edits, or use PDF to Excel to go back.",
      "Leaving in draft rows or notes you didn't mean to share, clean the sheet before converting.",
    ],
    faq: [
      { question: "Why convert Excel to PDF?", answer: "A PDF preserves the exact layout on any device and can't be accidentally edited, which is why reports, invoices and quotes are shared as PDFs." },
      { question: "My columns are getting cut off: what do I do?", answer: "Use a landscape orientation or a fit-to-page setting so wide tables fit within the PDF page." },
      { question: "Can I turn a PDF table back into a spreadsheet?", answer: "Yes, PDF to Excel extracts tabular data from a PDF back into an editable spreadsheet." },
    ],
    related: ["open-a-large-csv", "convert-pdf-to-word", "photos-to-pdf"],
    tags: ["excel", "spreadsheet", "xlsx", "pdf", "convert", "document"],
    fileTypes: ["xlsx", "pdf"],
  },

  /* ── Images & Photos (batch 2) ───────────────────────────────────────────── */
  {
    slug: "enlarge-a-blurry-photo",
    group: "Images & Photos",
    problem: "My photo is too small or blurry",
    label: "Enlarge / sharpen photo",
    seoTitle: "Enlarge a Small or Blurry Photo, Free AI Upscaler (In-Browser)",
    seoDescription:
      "Make a small, low-resolution photo bigger and cleaner with an AI upscaler that runs in your browser. Free and private. No upload. Honest about what it can and can't fix.",
    keywords: [
      "enlarge photo",
      "upscale image",
      "make blurry photo clear",
      "increase image resolution",
      "ai image upscaler",
    ],
    icon: "ImageUp",
    accent: "violet",
    answer:
      "To enlarge a small photo, use an AI upscaler: it increases the resolution and reconstructs edges and detail far better than a plain resize, which just stretches pixels. Our Image Upscaler runs on-device in your browser, so the photo is never uploaded. It genuinely helps soft, low-res images, but it can't invent detail that was never captured.",
    intro:
      "Turn a small, soft image into something larger and cleaner: with realistic expectations about what AI can recover.",
    primaryTool: "image-upscaler",
    tools: ["image-upscaler", "image-resizer", "image-compressor"],
    steps: [
      { title: "Open the Image Upscaler", description: "Drop your photo in. An AI model runs in your browser, the image isn't uploaded." },
      { title: "Upscale the image", description: "The model increases the resolution and rebuilds edges and texture, rather than just stretching pixels." },
      { title: "Compare the result", description: "Check the output. Upscaling helps soft, small photos most. Heavily blurred or tiny sources have limits." },
      { title: "Export and use it", description: "Download the larger image. Resize or compress it afterwards for wherever it's going." },
    ],
    mistakes: [
      "Expecting a forensic 'enhance'. AI can sharpen and enlarge, but it can't recover detail the camera never captured.",
      "Upscaling then over-compressing, which throws away the quality you just gained. Keep the export quality high.",
      "Using a plain resize to enlarge, which only stretches pixels and makes blur worse: use the upscaler instead.",
    ],
    faq: [
      { question: "Can you make a blurry photo clear?", answer: "An AI upscaler improves soft, low-resolution photos by rebuilding edges and detail, and it enlarges without the usual pixel stretching. It can't fully fix severe blur or invent missing detail." },
      { question: "Is upscaling different from resizing?", answer: "Yes. Resizing just scales the existing pixels (bigger = blurrier). Upscaling uses AI to reconstruct detail as it enlarges, so the result looks cleaner." },
      { question: "Is my photo uploaded?", answer: "No. The upscaler runs an AI model on your device inside the browser: nothing is sent to a server." },
    ],
    related: ["image-too-large", "passport-size-photo"],
    tags: ["image", "upscale", "enlarge", "blurry", "resolution", "photo"],
    fileTypes: ["jpg", "png"],
  },

  /* ── Developers & Data (batch 2) ─────────────────────────────────────────── */
  {
    slug: "need-a-strong-password",
    group: "Developers & Data",
    problem: "I need a strong, random password",
    label: "Strong password",
    seoTitle: "Generate a Strong Random Password, Free & Private (No Upload)",
    seoDescription:
      "Create a strong, random password of any length with letters, numbers and symbols. Generated in your browser and never sent anywhere. Free, private, no sign-up.",
    keywords: [
      "strong password generator",
      "random password",
      "secure password",
      "generate password",
      "password with symbols",
    ],
    icon: "KeyRound",
    accent: "amber",
    answer:
      "To create a strong password, use a generator: pick a length (16+ characters is a good default) and include uppercase, lowercase, numbers and symbols for maximum strength. Our Password Generator makes it in your browser using secure randomness, and it's never transmitted or stored. Then save it in a password manager rather than reusing it.",
    intro:
      "Reused and guessable passwords are the main way accounts get breached. Generate a unique, random one per account.",
    primaryTool: "password-generator",
    tools: ["password-generator", "hash-generator", "uuid-generator", "nanoid-generator"],
    steps: [
      { title: "Open the Password Generator", description: "It runs entirely in your browser. The generated password is never sent anywhere." },
      { title: "Set the length and character types", description: "Aim for at least 16 characters and enable uppercase, lowercase, numbers and symbols." },
      { title: "Generate and copy", description: "Create the password and copy it. Regenerate until you get one you're happy to use." },
      { title: "Store it in a password manager", description: "Save it in a manager so you don't have to remember it, and never reuse it across sites." },
    ],
    mistakes: [
      "Reusing one 'strong' password everywhere: a single breach then exposes every account. Use a unique one per site.",
      "Swapping letters for look-alikes (P@ssw0rd) and thinking it's strong. Length and true randomness matter far more.",
      "Storing passwords in a plain notes file instead of a proper password manager.",
    ],
    faq: [
      { question: "What makes a password strong?", answer: "Length and randomness. A 16+ character password with mixed case, numbers and symbols, generated randomly and used on only one site, is very hard to crack." },
      { question: "Is the generated password sent anywhere?", answer: "No. It's created in your browser with secure randomness and never transmitted, logged or stored." },
      { question: "How do I remember a random password?", answer: "You don't: save it in a password manager. You only need to remember one strong master password." },
    ],
    related: ["password-protect-a-pdf", "fix-invalid-json", "create-robots-txt"],
    tags: ["password", "security", "generator", "random", "developer"],
  },
  {
    slug: "open-a-large-csv",
    group: "Developers & Data",
    problem: "I can't open or read a large CSV file",
    label: "Open a big CSV",
    seoTitle: "Open & View a Large CSV File in Your Browser, Free, No Upload",
    seoDescription:
      "A CSV too big or messy to open in a spreadsheet? View, search and sort it in your browser. Nothing is uploaded. Free and private. Convert to JSON or Excel too.",
    keywords: [
      "open large csv",
      "view csv online",
      "csv viewer",
      "read csv file",
      "csv too big for excel",
    ],
    icon: "Table",
    accent: "emerald",
    answer:
      "To read a big or awkward CSV without wrestling a spreadsheet, use an online CSV viewer: it loads the file into a searchable, sortable table in your browser. No upload, no row limit fights. Our CSV Viewer and Editor do exactly this, and you can convert the data to JSON or a spreadsheet from there.",
    intro:
      "When a CSV is too large or messy for Excel, view it as a clean table you can search and sort: privately.",
    primaryTool: "csv-viewer",
    tools: ["csv-viewer", "csv-editor", "csv-to-json", "excel-to-csv"],
    steps: [
      { title: "Open the CSV Viewer", description: "Drop your.csv file in, it's parsed in your browser, never uploaded." },
      { title: "Read it as a table", description: "The data loads into a proper table you can scroll, search and sort by column." },
      { title: "Edit if needed", description: "Use the CSV Editor to fix values, remove columns or clean up a messy export." },
      { title: "Convert onward", description: "Turn the data into JSON for code, or into a spreadsheet format, straight from the viewer." },
    ],
    mistakes: [
      "Fighting a spreadsheet's row limits when a browser viewer just streams the file into a table.",
      "Assuming a broken layout is corruption when it's usually the wrong delimiter. Check comma vs semicolon vs tab.",
      "Editing a huge CSV by hand when converting to JSON or a spreadsheet would be faster for your task.",
    ],
    faq: [
      { question: "How do I open a CSV that's too big for Excel?", answer: "Use the CSV Viewer. It loads the file into a searchable, sortable table in your browser without the spreadsheet row limits, and nothing is uploaded." },
      { question: "Why does my CSV look jumbled?", answer: "Usually the delimiter is wrong (semicolon or tab instead of comma) or fields with commas aren't quoted. A viewer that lets you set the delimiter fixes the display." },
      { question: "Can I convert the CSV afterwards?", answer: "Yes, export it to JSON for code or to a spreadsheet format directly from the viewer/editor." },
    ],
    related: ["convert-csv-to-json", "convert-excel-to-pdf", "fix-invalid-json"],
    tags: ["csv", "viewer", "data", "spreadsheet", "open", "developer"],
    fileTypes: ["csv"],
  },

  /* ── Web & SEO (batch 2) ─────────────────────────────────────────────────── */
  {
    slug: "create-a-sitemap",
    group: "Web & SEO",
    problem: "My website needs an XML sitemap",
    label: "Create a sitemap",
    seoTitle: "Create an XML Sitemap for Your Website, Free Generator",
    seoDescription:
      "Generate a valid XML sitemap so Google can find and index every page, then validate it. Free and in your browser. Submit it in Search Console to speed up indexing.",
    keywords: [
      "create xml sitemap",
      "sitemap generator",
      "website sitemap",
      "sitemap for google",
      "submit sitemap",
    ],
    icon: "FolderTree",
    accent: "emerald",
    answer:
      "An XML sitemap lists your site's URLs so search engines can discover and index them faster. Generate one with a sitemap tool by adding your pages, validate the XML, then submit it in Google Search Console and reference it in robots.txt. Our generator and validator run in your browser. Keep it updated as you publish new pages.",
    intro:
      "Help Google find every page. Generate a valid XML sitemap, submit it in Search Console, and link it from robots.txt.",
    primaryTool: "xml-sitemap-generator",
    tools: ["xml-sitemap-generator", "sitemap-validator", "robots-txt-generator", "html-sitemap-generator"],
    steps: [
      { title: "Generate the sitemap", description: "Add your site's URLs to the XML Sitemap Generator to produce a valid sitemap.xml." },
      { title: "Validate it", description: "Run it through the Sitemap Validator to catch malformed URLs or structure errors before you publish." },
      { title: "Publish and reference it", description: "Upload it to your site root (e.g. /sitemap.xml) and add a 'Sitemap:' line to your robots.txt." },
      { title: "Submit in Search Console", description: "Add the sitemap URL in Google Search Console (and Bing Webmaster Tools) to prompt faster indexing." },
    ],
    mistakes: [
      "Listing URLs that redirect, 404 or are set to noindex, a sitemap should contain only canonical, indexable pages.",
      "Creating it once and forgetting it. Regenerate when you add or remove pages so it stays accurate.",
      "Never submitting it in Search Console, so it sits unused: generating it is only half the job.",
    ],
    faq: [
      { question: "Do I need an XML sitemap?", answer: "It's strongly recommended, especially for larger or newer sites. It helps search engines discover every page and index new content faster." },
      { question: "Where do I put the sitemap?", answer: "At your site root (e.g. yoursite.com/sitemap.xml), reference it in robots.txt, and submit the URL in Google Search Console." },
      { question: "What should be in it?", answer: "Only your canonical, indexable URLs. Not redirects, error pages or noindex pages. Keep it in sync as your site changes." },
    ],
    related: ["create-robots-txt", "add-structured-data", "add-meta-tags"],
    tags: ["sitemap", "seo", "xml", "google", "indexing", "website"],
    fileTypes: ["xml"],
  },
  {
    slug: "create-robots-txt",
    group: "Web & SEO",
    problem: "My website needs a robots.txt file",
    label: "Create robots.txt",
    seoTitle: "Create a robots.txt File, Free Generator + Validator",
    seoDescription:
      "Generate a correct robots.txt to control what search engines crawl, and validate it before you ship. Free, in your browser. Avoid the mistake of blocking your whole site.",
    keywords: [
      "create robots.txt",
      "robots txt generator",
      "robots file for website",
      "control search crawling",
      "disallow in robots.txt",
    ],
    icon: "Bot",
    accent: "sky",
    answer:
      "A robots.txt file tells search-engine crawlers which parts of your site they may or may not crawl, and points them to your sitemap. Generate one with a robots.txt tool, set your allow/disallow rules, add the sitemap line, and validate it before uploading to your site root. Our generator and validator run in your browser.",
    intro:
      "Control what search engines crawl, and avoid the classic mistake of accidentally blocking your entire site.",
    primaryTool: "robots-txt-generator",
    tools: ["robots-txt-generator", "robots-txt-validator", "xml-sitemap-generator", "meta-tag-generator"],
    steps: [
      { title: "Generate your robots.txt", description: "Use the generator to set which user-agents and paths are allowed or disallowed." },
      { title: "Add your sitemap", description: "Include a 'Sitemap:' line pointing to your sitemap.xml so crawlers can find it." },
      { title: "Validate the rules", description: "Run the Validator to confirm you haven't accidentally blocked pages you want indexed." },
      { title: "Upload to your root", description: "Place it at yoursite.com/robots.txt. It must live at the domain root to take effect." },
    ],
    mistakes: [
      "'Disallow: /'. This blocks your entire site from search engines. It's the most common and most damaging robots.txt mistake.",
      "Using robots.txt to hide private pages. It stops crawling, not access. Use authentication or noindex for real privacy.",
      "Placing it in a subfolder. Robots.txt only works at the domain root.",
    ],
    faq: [
      { question: "What does robots.txt do?", answer: "It tells search-engine crawlers which URLs they can and can't crawl, and points them to your sitemap. It must sit at your domain root." },
      { question: "Can robots.txt hide a page from Google?", answer: "Not reliably. It blocks crawling, not indexing or access. To keep a page out of results, use a noindex tag. To keep it private, use authentication." },
      { question: "What's the most dangerous mistake?", answer: "'Disallow: /', which tells crawlers to skip your whole site. Always validate before publishing so you don't deindex yourself." },
    ],
    related: ["create-a-sitemap", "add-meta-tags", "add-structured-data"],
    tags: ["robots", "seo", "crawling", "website", "indexing"],
    fileTypes: ["txt"],
  },
  {
    slug: "add-structured-data",
    group: "Web & SEO",
    problem: "I want rich results / structured data for my pages",
    label: "Add structured data",
    seoTitle: "Add Structured Data (Schema.org JSON-LD) for Rich Results: Free",
    seoDescription:
      "Generate valid Schema.org JSON-LD (FAQ, Article, Product, Local Business) to qualify for rich results, then preview it. Free, in your browser. No sign-up.",
    keywords: [
      "structured data",
      "schema markup generator",
      "json-ld generator",
      "rich results",
      "faq schema",
    ],
    icon: "CodeXml",
    accent: "violet",
    answer:
      "Structured data (Schema.org JSON-LD) describes your page to search engines so it can qualify for rich results: FAQ drop-downs, star ratings, article cards. Generate the right type (FAQ, Article, Product, Local Business) with a schema tool, preview how it could appear, and paste the JSON-LD into your page. Our generators and preview run in your browser.",
    intro:
      "Rich results earn more clicks. Add the right Schema.org markup so your pages qualify for enhanced listings.",
    primaryTool: "schema-generator",
    tools: ["schema-generator", "faq-schema-generator", "rich-results-preview", "article-schema-generator"],
    steps: [
      { title: "Pick the schema type", description: "Match it to the page: FAQ, Article, Product, Recipe, Local Business, and so on." },
      { title: "Generate the JSON-LD", description: "Fill in the fields and the tool builds valid Schema.org JSON-LD for you." },
      { title: "Preview the rich result", description: "Use the Rich Results Preview to see how it could appear and to catch missing required fields." },
      { title: "Add it to your page", description: "Paste the JSON-LD into the page's HTML. Make sure the markup matches the content visible to users." },
    ],
    mistakes: [
      "Marking up content that isn't visible on the page, schema must reflect what users actually see, or it can be ignored or penalised.",
      "Missing required properties for the type, so the page doesn't qualify for the rich result. Preview to catch these.",
      "Adding FAQ schema to a page with no real FAQ section just to game rich results.",
    ],
    faq: [
      { question: "What is structured data?", answer: "Machine-readable markup (usually Schema.org JSON-LD) that describes your page to search engines, making it eligible for rich results like FAQ drop-downs, ratings and article cards." },
      { question: "Will it guarantee rich results?", answer: "No. It makes a page eligible, but search engines decide when to show them. Valid markup that matches visible content gives you the best chance." },
      { question: "Where does the markup go?", answer: "Paste the JSON-LD into the page's HTML (typically the head or body). Validate it with the Rich Results Preview first." },
    ],
    related: ["add-meta-tags", "create-a-sitemap", "create-robots-txt"],
    tags: ["schema", "structured data", "json-ld", "seo", "rich results"],
    fileTypes: ["html"],
  },

  /* ── Video & Audio (batch 2) ─────────────────────────────────────────────── */
  {
    slug: "video-to-gif",
    group: "Video & Audio",
    problem: "I want to turn a video clip into a GIF",
    label: "Video to GIF",
    seoTitle: "Convert a Video to a GIF, Free, Private, In Your Browser",
    seoDescription:
      "Turn a short video clip into a looping GIF for chats, docs and social. Free and private: it's made in your browser, no upload. Trim to the best moment first.",
    keywords: [
      "video to gif",
      "convert video to gif",
      "mp4 to gif",
      "make a gif from video",
      "clip to gif",
    ],
    icon: "Film",
    accent: "rose",
    answer:
      "To make a GIF from a video, use a video-to-GIF tool: trim to the moment you want and it produces a looping GIF. Our tool runs in your browser, so the clip is never uploaded. Keep it short (a few seconds) and modestly sized, GIFs balloon fast, so trimming and a smaller resolution keep the file shareable.",
    intro:
      "Grab a few seconds of a video as a looping GIF for a chat, a doc or a reaction. No upload needed.",
    primaryTool: "video-to-gif",
    tools: ["video-to-gif", "video-trimmer", "video-compressor", "video-resizer"],
    steps: [
      { title: "Open the Video to GIF tool", description: "Drop your clip in, it's processed in your browser, never uploaded." },
      { title: "Trim to the moment", description: "GIFs are best kept short. Cut to the two-to-four seconds that matter with the trimmer." },
      { title: "Set the size", description: "Lower the resolution or frame rate to keep the GIF small enough to share easily." },
      { title: "Export the GIF", description: "Create the looping GIF and download it. Compress the source first if the clip is large." },
    ],
    mistakes: [
      "Converting a long clip: GIFs are huge per second, so a 20-second GIF can be enormous. Trim tight.",
      "Keeping full HD resolution when a smaller GIF looks fine in chats and loads far faster.",
      "Using a GIF where a short muted video would be smaller and smoother. GIFs suit tiny, simple loops.",
    ],
    faq: [
      { question: "How do I turn an MP4 into a GIF?", answer: "Open the Video to GIF tool, trim to the seconds you want, set a modest size, and export. It all runs in your browser." },
      { question: "Why is my GIF so large?", answer: "GIFs are inefficient: file size grows fast with length, resolution and frame rate. Trim shorter and reduce the size to keep it small." },
      { question: "Is my video uploaded?", answer: "No. The GIF is generated in your browser. Your clip never leaves the device." },
    ],
    related: ["compress-a-video", "convert-mov-to-mp4", "extract-audio-from-video"],
    tags: ["video", "gif", "convert", "clip", "loop"],
    fileTypes: ["mp4", "gif"],
  },
  {
    slug: "convert-mov-to-mp4",
    group: "Video & Audio",
    problem: "My video won't play (MOV, AVI, MKV)",
    label: "Convert to MP4",
    seoTitle: "Convert MOV, AVI or MKV to MP4, Free, Plays Everywhere",
    seoDescription:
      "A video that won't play on Windows or in your editor? Convert MOV, AVI, MKV or WebM to MP4, the format that plays everywhere. Free and private, in your browser.",
    keywords: [
      "mov to mp4",
      "convert to mp4",
      "video won't play",
      "avi to mp4",
      "mkv to mp4",
    ],
    icon: "Video",
    accent: "sky",
    answer:
      "When a video won't play or upload, it's usually the format. Converting MOV (iPhone), AVI, MKV or WebM to MP4 fixes it, because MP4 plays on virtually every device, editor and platform. Our converter runs in your browser, so the file is never uploaded. Convert once and it'll open where the original wouldn't.",
    intro:
      "iPhone MOV that won't open on Windows? An AVI your editor rejects? Convert it to MP4, the universal format.",
    primaryTool: "mov-to-mp4",
    tools: ["mov-to-mp4", "video-converter", "video-compressor", "avi-to-mp4"],
    steps: [
      { title: "Open the converter", description: "Use MOV to MP4, or the general Video Converter for AVI, MKV, WebM and more. Drop your file in." },
      { title: "Convert to MP4", description: "The tool re-encodes the video to MP4 (H.264), the most widely supported format." },
      { title: "Check it plays", description: "Open the result to confirm it now works in your player, editor or upload form." },
      { title: "Compress if needed", description: "If the MP4 is large for emailing or uploading, run it through the Video Compressor." },
    ],
    mistakes: [
      "Just renaming a.mov to.mp4. That doesn't re-encode it and it still won't play. Convert it properly.",
      "Processing a very large clip on a low-memory device. Browser conversion has limits, so trim first if it stalls.",
      "Converting to an obscure format when MP4 is the safest choice for compatibility everywhere.",
    ],
    faq: [
      { question: "Why won't my iPhone video play on Windows?", answer: "iPhones often record MOV (sometimes HEVC), which some Windows setups can't play. Convert it to MP4 (H.264) and it'll play virtually everywhere." },
      { question: "Can I just rename the file to .mp4?", answer: "No. The extension doesn't change the actual encoding. You need to convert (re-encode) it, which is what the tool does." },
      { question: "Is my video uploaded?", answer: "No. Conversion happens in your browser. The file never leaves your device." },
    ],
    related: ["compress-a-video", "video-to-gif", "extract-audio-from-video"],
    tags: ["video", "mp4", "mov", "avi", "mkv", "convert"],
    fileTypes: ["mp4", "mov"],
  },

  /* ── SVG & Vectors (batch 2) ─────────────────────────────────────────────── */
  {
    slug: "vectorize-an-image",
    group: "SVG & Vectors",
    problem: "I need to convert a logo image to SVG (vector)",
    label: "Image to SVG",
    seoTitle: "Convert PNG to SVG (Vectorize a Logo), Free & In-Browser",
    seoDescription:
      "Trace a PNG or JPG logo into a scalable SVG that stays crisp at any size. Free and private, in your browser. Honest about which images vectorize well and which don't.",
    keywords: [
      "png to svg",
      "convert image to svg",
      "vectorize logo",
      "raster to vector",
      "image to vector",
    ],
    icon: "Spline",
    accent: "orange",
    answer:
      "To make a logo scale without blurring, convert it to SVG: a tracer redraws the image as vector paths that stay razor-sharp at any size. Our PNG to SVG tool traces in your browser. No upload. It works best on flat, high-contrast logos and simple graphics. Detailed photos don't vectorise cleanly and should stay raster.",
    intro:
      "Need a logo that's crisp on a billboard and a favicon alike? Trace it into a scalable SVG, with realistic expectations.",
    primaryTool: "png-to-svg",
    tools: ["png-to-svg", "svg-optimizer", "svg-editor", "image-resizer"],
    steps: [
      { title: "Open the PNG to SVG tool", description: "Drop your logo or graphic in: it's traced in your browser, never uploaded." },
      { title: "Trace to vector", description: "The tool converts the pixels into vector paths that scale to any size without blurring." },
      { title: "Check the edges", description: "Flat, high-contrast art traces cleanly. Zoom in to confirm the shapes and colors look right." },
      { title: "Optimize and use it", description: "Run the SVG Optimizer to strip bloat, or tidy paths in the SVG Editor, then use it anywhere." },
    ],
    mistakes: [
      "Vectorising a detailed photo: tracing turns it into messy, oversized paths. Only flat logos and simple graphics vectorise well.",
      "Expecting a perfect trace from a low-resolution or noisy source. Start from the cleanest image you have.",
      "Shipping the raw trace without optimizing, so the SVG is bigger and more complex than it needs to be.",
    ],
    faq: [
      { question: "Can I convert any image to SVG?", answer: "Technically yes, but it only looks good for flat, high-contrast art like logos and icons. Photos and detailed images produce huge, messy vectors and should stay raster (PNG/JPG)." },
      { question: "Why convert a logo to SVG?", answer: "An SVG is resolution-independent. It stays perfectly sharp at any size, from a favicon to a banner, and is usually a small file." },
      { question: "Is my image uploaded?", answer: "No. Tracing runs in your browser. Your image never leaves the device." },
    ],
    related: ["optimize-svg", "image-too-large"],
    tags: ["svg", "vector", "png", "logo", "trace", "convert"],
    fileTypes: ["png", "svg"],
  },

  /* ── Batch 3 ─────────────────────────────────────────────────────────────── */
  {
    slug: "convert-webp-to-jpg",
    group: "Images & Photos",
    problem: "A WebP image won't open. I need a JPG",
    label: "WebP to JPG",
    seoTitle: "Convert WebP to JPG (or PNG): Free, Private, No Upload",
    seoDescription:
      "Downloaded a WebP that won't open in your app? Convert it to JPG or PNG in your browser. Free and private, nothing uploaded. Works for the reverse too.",
    keywords: [
      "webp to jpg",
      "convert webp",
      "webp won't open",
      "webp to png",
      "change webp to jpeg",
    ],
    icon: "Image",
    accent: "sky",
    answer:
      "WebP is a modern web image format that saves space, but some apps and older software can't open it. Convert it to JPG (or PNG) with a format converter and it opens everywhere. Our WebP Converter runs in your browser, so the image is never uploaded. It also converts JPG/PNG to WebP when you want the smaller web version.",
    intro:
      "Saved a WebP from a website and your editor won't open it? Convert it to a universal JPG or PNG in seconds.",
    primaryTool: "webp-converter",
    tools: ["webp-converter", "png-to-jpg", "image-compressor", "crop-image"],
    steps: [
      { title: "Open the WebP Converter", description: "Drop your.webp file in: it's converted in your browser, never uploaded." },
      { title: "Pick the output format", description: "Choose JPG for photos or PNG when you need transparency. Both open in virtually any app." },
      { title: "Convert the image", description: "The tool re-encodes the WebP into your chosen format instantly." },
      { title: "Compress if needed", description: "JPG from WebP can be larger. Run Image Compressor to trim it for email or upload." },
    ],
    mistakes: [
      "Just renaming.webp to.jpg: the file is still WebP inside and won't open. Convert it properly.",
      "Converting a transparent WebP to JPG and losing the transparency. Use PNG to keep it.",
      "Converting to JPG then back to WebP repeatedly, which compounds quality loss. Convert once from the original.",
    ],
    faq: [
      { question: "Why won't my WebP file open?", answer: "Some older apps and offline editors don't support WebP yet. Converting it to JPG or PNG makes it open in virtually any program." },
      { question: "JPG or PNG when converting from WebP?", answer: "JPG for photos (smaller), PNG when the WebP has transparency you need to keep." },
      { question: "Is my image uploaded?", answer: "No. The conversion runs in your browser. Your file never leaves the device." },
    ],
    related: ["image-too-large", "make-a-favicon"],
    tags: ["webp", "jpg", "png", "convert", "image"],
    fileTypes: ["webp", "jpg", "png"],
  },
  {
    slug: "make-a-favicon",
    group: "Images & Photos",
    problem: "I need a favicon for my website",
    label: "Make a favicon",
    seoTitle: "Make a Favicon for Your Website: Free, In-Browser",
    seoDescription:
      "Turn a logo into a favicon: crop it square and export the small icon sizes browsers use (16, 32, 48px). Free and private, in your browser. No sign-up.",
    keywords: [
      "make a favicon",
      "favicon generator",
      "create favicon from image",
      "favicon size",
      "website icon",
    ],
    icon: "AppWindow",
    accent: "orange",
    answer:
      "A favicon is the tiny icon in a browser tab. To make one, crop your logo to a square and export it at the small sizes browsers use (16×16, 32×32 and 48×48 pixels) as PNG (modern browsers accept PNG favicons). Our Crop, Resize and SVG Icon tools do this in your browser. Use a simple, high-contrast mark so it reads at 16px.",
    intro:
      "Give your site the little tab icon. Start from a simple, bold logo and export the small square sizes browsers expect.",
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "svg-icon-generator", "png-to-jpg"],
    steps: [
      { title: "Start with a square, simple mark", description: "Favicons are tiny. Crop your logo to a 1:1 square and keep it bold and high-contrast so it's legible at 16px." },
      { title: "Resize to the icon sizes", description: "Export 16×16, 32×32 and 48×48 versions with the Image Resizer: the common favicon sizes." },
      { title: "Save as PNG", description: "Modern browsers accept PNG favicons. For a crisp scalable source, an SVG icon works too." },
      { title: "Add it to your site", description: "Reference it in your HTML head with a link rel=\"icon\" tag pointing at the file." },
    ],
    mistakes: [
      "Using a detailed logo that turns into an unreadable blob at 16px, simplify to a single strong shape or letter.",
      "Exporting only a large image. Browsers want small icon sizes, so resize down to 16/32/48px.",
      "Forgetting to reference it in the HTML head, so the browser never loads it.",
    ],
    faq: [
      { question: "What size is a favicon?", answer: "The core sizes are 16×16, 32×32 and 48×48 pixels. Provide at least a 32×32 PNG. Modern browsers scale it as needed." },
      { question: "Can a favicon be a PNG?", answer: "Yes. Modern browsers support PNG (and SVG) favicons. You no longer strictly need the old.ico format." },
      { question: "Why does my favicon look blurry?", answer: "It was scaled from the wrong size or too detailed. Start from a simple square mark and export at the exact icon sizes." },
    ],
    related: ["convert-webp-to-jpg", "vectorize-an-image", "optimize-svg"],
    tags: ["favicon", "icon", "website", "resize", "image", "svg"],
    fileTypes: ["png", "svg"],
  },
  {
    slug: "sign-a-pdf",
    group: "Documents & PDF",
    problem: "I need to sign a PDF",
    label: "Sign a PDF",
    seoTitle: "Sign a PDF Online: Free, Private, No Upload",
    seoDescription:
      "Add your signature to a PDF (draw, type or upload it) and place it where you need. Free and private, right in your browser. No account, no upload, no watermark.",
    keywords: [
      "sign a pdf",
      "add signature to pdf",
      "esign pdf free",
      "pdf signature",
      "electronic signature pdf",
    ],
    icon: "Signature",
    accent: "indigo",
    answer:
      "To sign a PDF, use a signature tool: draw your signature, type it, or upload an image of it, then drag it onto the page and export the signed PDF. Our Document Signature tool runs in your browser, so the file and your signature are never uploaded. It's the free way to sign a form or contract without printing and scanning.",
    intro:
      "Skip the print-sign-scan cycle. Add your signature on-screen and download the signed PDF.",
    primaryTool: "document-signature",
    tools: ["document-signature", "pdf-editor", "pdf-password-protect", "compress-pdf"],
    steps: [
      { title: "Open the Document Signature tool", description: "Drop your PDF in, it's handled in your browser, never uploaded." },
      { title: "Create your signature", description: "Draw it with your mouse or finger, type it in a signature font, or upload a photo of your handwritten one." },
      { title: "Place it on the page", description: "Drag the signature to the right spot, resize it, and add the date or initials if needed." },
      { title: "Export the signed PDF", description: "Download the signed document. For sensitive contracts, password-protect it before sending." },
    ],
    mistakes: [
      "Printing, signing and scanning when you can sign on-screen in seconds and keep the quality.",
      "Placing the signature over important text. Position it in the signature field and resize to fit.",
      "Assuming a drawn signature is a legally binding e-signature everywhere. Check what your specific document or jurisdiction requires.",
    ],
    faq: [
      { question: "How do I sign a PDF for free?", answer: "Open the Document Signature tool, draw/type/upload your signature, place it on the page, and export. No account, no watermark, all in your browser." },
      { question: "Is my signed document uploaded?", answer: "No. The PDF and your signature stay on your device. Signing happens entirely in the browser." },
      { question: "Is a drawn signature legally valid?", answer: "Simple electronic signatures are widely accepted, but requirements vary by document and jurisdiction. For high-stakes contracts, confirm what's required." },
    ],
    related: ["edit-text-in-a-pdf", "password-protect-a-pdf", "watermark-a-pdf"],
    tags: ["pdf", "sign", "signature", "esign", "document"],
    fileTypes: ["pdf"],
  },
  {
    slug: "extract-table-from-pdf",
    group: "Documents & PDF",
    problem: "I need to get a table out of a PDF into Excel",
    label: "PDF table to Excel",
    seoTitle: "Extract a Table From a PDF to Excel: Free & Private",
    seoDescription:
      "Pull tables out of a PDF into an editable spreadsheet instead of retyping. Free and private conversion in your browser. Works best on real, text-based tables.",
    keywords: [
      "pdf to excel",
      "extract table from pdf",
      "pdf table to spreadsheet",
      "pdf to xlsx",
      "convert pdf table",
    ],
    icon: "FileSpreadsheet",
    accent: "violet",
    answer:
      "To reuse a PDF's table, convert the PDF to Excel: the tool detects the rows and columns and rebuilds them as an editable spreadsheet, so you don't retype anything. Our PDF to Excel tool does this in your browser. It works best on genuine text-based tables. A scanned image of a table needs OCR first to become recognisable text.",
    intro:
      "Stop retyping figures. Convert the PDF's tables into a spreadsheet you can sort, total and edit.",
    primaryTool: "pdf-to-excel",
    tools: ["pdf-to-excel", "pdf-to-word", "csv-viewer", "excel-to-csv"],
    steps: [
      { title: "Open the PDF to Excel tool", description: "Drop your PDF in: it's processed in your browser, never uploaded." },
      { title: "Convert the tables", description: "The tool detects the table structure and rebuilds it as spreadsheet rows and columns." },
      { title: "Open and tidy", description: "Open the result in your spreadsheet app and fix any cells that merged or split awkwardly." },
      { title: "Use the data", description: "Sort, total and chart the figures, or export to CSV for another system." },
    ],
    mistakes: [
      "Expecting perfect results from a scanned PDF, that's an image. Run OCR first so the numbers are real text.",
      "Assuming complex, multi-header tables convert flawlessly. Some manual cleanup of merged cells is normal.",
      "Retyping a whole table by hand when a conversion gets you 90% of the way in seconds.",
    ],
    faq: [
      { question: "How do I convert a PDF table to Excel?", answer: "Use the PDF to Excel tool. It detects rows and columns in text-based PDFs and rebuilds them as an editable spreadsheet, all in your browser." },
      { question: "Why did my table come out messy?", answer: "Either the PDF is a scan (needs OCR first) or the table has complex merged headers. Real text-based tables convert cleanest. Expect light cleanup on complex ones." },
      { question: "Is my document uploaded?", answer: "No. The conversion runs in your browser and the PDF never leaves your device." },
    ],
    related: ["convert-pdf-to-word", "convert-excel-to-pdf", "open-a-large-csv"],
    tags: ["pdf", "excel", "table", "spreadsheet", "convert", "data"],
    fileTypes: ["pdf", "xlsx"],
  },
  {
    slug: "convert-audio-to-mp3",
    group: "Video & Audio",
    problem: "I need to convert an audio file to MP3",
    label: "Audio to MP3",
    seoTitle: "Convert Audio to MP3 (WAV, M4A, OGG), Free & In-Browser",
    seoDescription:
      "Turn WAV, M4A, OGG or other audio into a universal MP3 that plays everywhere. Free and private, converted in your browser, never uploaded. No sign-up.",
    keywords: [
      "audio to mp3",
      "convert to mp3",
      "wav to mp3",
      "m4a to mp3",
      "mp3 converter",
    ],
    icon: "FileAudio2",
    accent: "amber",
    answer:
      "To make an audio file play everywhere, convert it to MP3: it's the most universally supported format, accepted by virtually every player, phone and upload form. Our MP3 Converter handles WAV, M4A, OGG and more in your browser, so the file is never uploaded. Choose a higher bitrate for music, or a smaller one for speech.",
    intro:
      "Got a WAV, M4A or OGG that won't play or upload? Convert it to MP3. The format that works everywhere.",
    primaryTool: "mp3-converter",
    tools: ["mp3-converter", "audio-to-mp3", "wav-converter", "m4a-converter"],
    steps: [
      { title: "Open the MP3 Converter", description: "Drop your audio file in, it's converted in your browser, never uploaded." },
      { title: "Set the quality", description: "Pick a higher bitrate (e.g. 256–320 kbps) for music, or a lower one for voice to save space." },
      { title: "Convert to MP3", description: "The tool re-encodes the audio to a universal MP3." },
      { title: "Download and use it", description: "Save the MP3, it'll play on any device or upload where the original format was rejected." },
    ],
    mistakes: [
      "Converting a compressed file (like M4A) to MP3 at a low bitrate, stacking quality loss. Keep a decent bitrate.",
      "Using MP3 for lossless archiving. If you need perfect quality, keep the WAV/FLAC original too.",
      "Renaming the extension instead of converting. The file needs re-encoding to actually become MP3.",
    ],
    faq: [
      { question: "How do I convert WAV or M4A to MP3?", answer: "Open the MP3 Converter, drop the file in, choose a bitrate, and convert. It runs in your browser and the audio is never uploaded." },
      { question: "What bitrate should I choose?", answer: "256–320 kbps for music you care about, 128 kbps is fine for speech or podcasts and keeps the file small." },
      { question: "Is the audio uploaded?", answer: "No. Conversion happens on your device inside the browser." },
    ],
    related: ["extract-audio-from-video", "make-a-ringtone", "compress-a-video"],
    tags: ["audio", "mp3", "convert", "wav", "m4a"],
    fileTypes: ["mp3", "wav"],
  },
  {
    slug: "qr-code-for-instagram",
    group: "QR Codes",
    problem: "I want a QR code for my Instagram (or social) profile",
    label: "Social profile QR",
    seoTitle: "QR Code for Instagram & Social Profiles, Free, No Expiry",
    seoDescription:
      "Turn your Instagram (or any social) profile link into a scannable QR code for flyers, packaging or a stall. Free, private and permanent, made in your browser.",
    keywords: [
      "instagram qr code",
      "qr code for instagram",
      "social media qr code",
      "profile qr code",
      "qr code for my page",
    ],
    icon: "Instagram",
    accent: "rose",
    answer:
      "To grow a following offline, turn your profile link into a QR code: anyone who scans it lands on your Instagram (or other social) page. Enter your profile URL in a QR generator, brand it with your colors, and print it on flyers, packaging or a stall sign. Ours builds it in your browser and the code never expires.",
    intro:
      "Bridge the offline-to-follow gap. One scannable code takes people straight to your profile.",
    primaryTool: "instagram-qr-code-generator",
    tools: ["instagram-qr-code-generator", "qr-code-generator", "qr-code-with-logo", "business-card-qr-code-generator"],
    steps: [
      { title: "Open the Instagram QR Code Generator", description: "Paste your profile URL (or use the general QR generator for any social link)." },
      { title: "Generate the code", description: "The QR is created in your browser instantly. Nothing is uploaded." },
      { title: "Brand it", description: "Add your colors or logo with QR with Logo so it fits your flyer, packaging or stall." },
      { title: "Download and print", description: "Grab an SVG for print so it stays sharp at any size, then place it where people will see it." },
    ],
    mistakes: [
      "Encoding a username instead of the full profile URL, so scanners can't open it: use the complete link.",
      "Printing it small or low-contrast. Keep it clear and a decent size so phones lock on quickly.",
      "Only linking one platform when a link-in-bio page could route to all your profiles from one code.",
    ],
    faq: [
      { question: "How do I make a QR code for my Instagram?", answer: "Paste your profile URL into the Instagram QR Code Generator and download the code. Scanning it opens your profile. It's free and never expires." },
      { question: "Can I use it for other platforms?", answer: "Yes. The same approach works for any social link (TikTok, YouTube, LinkedIn) or a link-in-bio page. Use the general QR generator for any URL." },
      { question: "Does the code expire?", answer: "No. It encodes your link directly, so it works as long as your profile exists. You own the exported image." },
    ],
    related: ["qr-code-for-a-link", "business-card-qr-code", "qr-code-for-wifi"],
    tags: ["qr", "instagram", "social", "profile", "generator"],
  },
  {
    slug: "count-words",
    group: "Web & SEO",
    problem: "I need to count words or characters",
    label: "Word / character count",
    seoTitle: "Word & Character Counter: Free, Instant, Private",
    seoDescription:
      "Count words and characters for an essay, a tweet, a meta description or any limit. Instant and private: the text is counted in your browser, never uploaded.",
    keywords: [
      "word counter",
      "character counter",
      "count words",
      "how many words",
      "character count for tweet",
    ],
    icon: "Type",
    accent: "emerald",
    answer:
      "To count words or characters, paste your text into a counter: it instantly shows the word count, character count (with and without spaces), and often sentences and reading time. Our Word Counter and Character Counter run in your browser, so nothing is uploaded. Handy for essay limits, meta descriptions, social posts and application fields.",
    intro:
      "Hitting an essay minimum, a tweet limit or a 160-character meta description? Get an instant, private count.",
    primaryTool: "word-counter",
    tools: ["word-counter", "character-counter", "reading-time-calculator", "meta-description-generator"],
    steps: [
      { title: "Open the Word Counter", description: "Paste or type your text: it's counted live in your browser, never uploaded." },
      { title: "Read the counts", description: "See words, characters (with and without spaces), sentences and estimated reading time update as you edit." },
      { title: "Check against your limit", description: "Compare to your target: an essay minimum, a 280-character post, or a ~160-character meta description." },
      { title: "Trim or expand", description: "Edit in place until you hit the count you need. The totals update instantly." },
    ],
    mistakes: [
      "Counting characters with spaces when a field counts without them (or vice versa). Check which the limit uses.",
      "Forgetting that some platforms count links or emoji specially, so the on-screen count can differ slightly.",
      "Writing to a raw word count and ignoring readability. Hitting a number isn't the same as writing well.",
    ],
    faq: [
      { question: "How do I count the words in my text?", answer: "Paste it into the Word Counter and it shows the word and character counts instantly, updating as you type. Nothing is uploaded." },
      { question: "What's the character limit for a meta description?", answer: "Around 150–160 characters before Google truncates it. Use the character counter to stay under, and keep it unique per page." },
      { question: "Is my text private?", answer: "Yes. Counting happens entirely in your browser. Your writing is never sent to a server." },
    ],
    related: ["audit-page-seo", "add-meta-tags", "add-structured-data"],
    tags: ["word count", "character count", "text", "writing", "seo"],
  },
  {
    slug: "audit-page-seo",
    group: "Web & SEO",
    problem: "I want to check my page's SEO and meta tags",
    label: "Check page SEO",
    seoTitle: "Check Your Page's SEO & Meta Tags: Free Analyzer",
    seoDescription:
      "See what search engines and social platforms read from your page (title, meta description, headings, Open Graph) and fix what's missing. Free, in your browser.",
    keywords: [
      "check seo",
      "meta tag analyzer",
      "seo checker",
      "analyze page seo",
      "check meta tags",
    ],
    icon: "Gauge",
    accent: "emerald",
    answer:
      "To check a page's SEO, analyze its tags: a meta-tag analyzer shows the title, meta description, headings and Open Graph tags exactly as search engines and social platforms read them, and flags what's missing or too long. Then fix the gaps with a meta-tag generator and preview the result. Our SEO tools do this in your browser.",
    intro:
      "See your page the way Google and social platforms do, then fix the missing title, description or heading structure.",
    primaryTool: "meta-tag-analyzer",
    tools: ["meta-tag-analyzer", "heading-checker", "meta-tag-generator", "google-serp-preview"],
    steps: [
      { title: "Analyze your page", description: "Run your URL or HTML through the Meta Tag Analyzer to see the title, description and Open Graph tags it exposes." },
      { title: "Check the heading structure", description: "Use the Heading Checker to confirm a single clear H1 and a logical H2/H3 outline." },
      { title: "Fix the gaps", description: "Missing or overlong tags? Generate corrected ones with the Meta Tag Generator." },
      { title: "Preview the result", description: "Use the Google SERP Preview to see how the title and description will look in results before you publish." },
    ],
    mistakes: [
      "A missing or duplicated title/description across pages. Each page needs a unique, descriptive pair.",
      "Multiple H1s or a jumbled heading order that muddies what the page is about.",
      "No Open Graph image, so shared links look blank. Add og:title, og:description and og:image.",
    ],
    faq: [
      { question: "How do I check my page's SEO for free?", answer: "Run it through the Meta Tag Analyzer to see the title, description, headings and Open Graph tags search engines read, then fix any that are missing or too long." },
      { question: "What should I look for?", answer: "A unique title (~60 chars), a unique meta description (~150–160), one clear H1, a logical heading outline, and Open Graph tags for a proper share preview." },
      { question: "Is my page data uploaded?", answer: "The analysis runs in your browser. Paste-first tools keep your HTML on your device." },
    ],
    related: ["add-meta-tags", "create-a-sitemap", "add-structured-data"],
    tags: ["seo", "meta", "analyze", "audit", "tags", "website"],
    fileTypes: ["html"],
  },
  {
    slug: "convert-heic-to-jpg",
    group: "Images & Photos",
    problem: "My iPhone photo is a HEIC that won't open",
    label: "HEIC won't open",
    seoTitle: "HEIC Won't Open? Convert iPhone Photos to JPG, Free & Private",
    seoDescription:
      "A.heic photo from an iPhone that Windows or an app won't open? Convert it to JPG in your browser: free and private, nothing uploaded. No sign-up, no watermark.",
    keywords: [
      "heic won't open",
      "convert heic to jpg",
      "open heic on windows",
      "iphone photo won't open",
      "heic to jpg free",
    ],
    icon: "Smartphone",
    accent: "cyan",
    answer:
      "iPhones save photos as HEIC, a space-saving format many Windows PCs, apps and upload forms can't open. Convert the file to JPG and it opens everywhere. Our HEIC to JPG tool decodes it in your browser (nothing is uploaded) and re-encodes a universal JPG (or PNG) in one step.",
    intro:
      "That '.heic' file isn't broken: it's just a format non-Apple devices don't recognise. Convert it to JPG and it opens anywhere.",
    primaryTool: "heic-to-jpg",
    tools: ["heic-to-jpg", "image-compressor", "image-resizer", "png-to-jpg"],
    steps: [
      { title: "Open the HEIC to JPG tool", description: "Drop your.heic photo in. It's decoded in your browser. The photo is never uploaded." },
      { title: "Choose JPG (or PNG)", description: "JPG is smallest and opens everywhere. Pick PNG if you want a lossless copy." },
      { title: "Convert", description: "The tool decodes the HEIC and re-encodes it locally. The new file size is shown." },
      { title: "Download and use it", description: "Save the JPG, it'll open on any PC, app or web form that rejected the HEIC." },
    ],
    mistakes: [
      "Renaming.heic to.jpg. That doesn't decode it, and it still won't open. Convert (re-encode) it properly.",
      "Emailing the photo to yourself to force a JPG. You can just convert it here without the round-trip.",
      "Turning off HEIC on your iPhone unnecessarily. Keep the space savings and convert only the photos you need to share.",
    ],
    faq: [
      { question: "Why won't my iPhone photo open on Windows?", answer: "iPhones save photos as HEIC, which many Windows PCs and apps don't support. Convert it to JPG and it opens in virtually any program." },
      { question: "Can I convert HEIC without uploading it?", answer: "Yes: the HEIC to JPG tool decodes and converts in your browser, so your photos never leave your device." },
      { question: "Should I stop my iPhone shooting HEIC?", answer: "No need. HEIC saves storage. Just convert the specific photos you want to share as JPG when a device or form won't accept HEIC." },
    ],
    related: ["convert-webp-to-jpg", "image-too-large", "enlarge-a-blurry-photo"],
    tags: ["heic", "iphone", "jpg", "convert", "image", "photo"],
    fileTypes: ["jpg", "png"],
  },

  /* ── Batch 4 (broaden coverage) ──────────────────────────────────────────── */
  {
    slug: "trim-a-video",
    group: "Video & Audio",
    problem: "I need to trim or cut a video",
    label: "Trim a video",
    seoTitle: "Trim or Cut a Video Online, Free, Private, No Upload",
    seoDescription:
      "Cut the start, end or a section out of a video without installing anything. Free and private, trimmed in your browser, nothing uploaded. No sign-up, no watermark.",
    keywords: [
      "trim a video",
      "cut a video online",
      "video trimmer",
      "shorten a video",
      "remove part of a video",
    ],
    icon: "Scissors",
    accent: "rose",
    answer:
      "To trim a video, use a video trimmer: set where it should start and end and export just that section. No software to install. Our Video Trimmer runs in your browser, so the clip is never uploaded. Trimming also shrinks the file, which helps if you need to email or upload it afterwards.",
    intro:
      "Cut off the dead air at the start, keep just the good part, or split a long clip, right in your browser.",
    primaryTool: "video-trimmer",
    tools: ["video-trimmer", "video-splitter", "video-compressor", "extract-audio"],
    steps: [
      { title: "Open the Video Trimmer", description: "Drop your clip in, it's processed in your browser, never uploaded." },
      { title: "Set the start and end", description: "Drag the handles to the exact section you want to keep." },
      { title: "Export the trimmed clip", description: "Save just the part you selected. Need several pieces? Use the Video Splitter." },
      { title: "Compress if needed", description: "If the result is still large for email or upload, run it through the Video Compressor." },
    ],
    mistakes: [
      "Trying to trim a very large clip on a low-memory device: browser processing has limits, so start with a manageable file.",
      "Re-exporting repeatedly, which re-encodes and slowly softens quality. Trim once from the original.",
      "Forgetting you can also just extract the audio if the video itself isn't needed.",
    ],
    faq: [
      { question: "How do I cut a video without software?", answer: "Use the Video Trimmer in your browser. Set the start and end points and export the section you want. Nothing is installed or uploaded." },
      { question: "Does trimming reduce the file size?", answer: "Yes. A shorter clip is a smaller file. If it's still too big afterwards, compress it or lower the resolution." },
      { question: "Is my video uploaded?", answer: "No. Trimming happens locally in your browser. The clip never leaves your device." },
    ],
    related: ["compress-a-video", "video-to-gif", "extract-audio-from-video"],
    tags: ["video", "trim", "cut", "shorten", "split"],
    fileTypes: ["mp4"],
  },
  {
    slug: "cut-an-audio-file",
    group: "Video & Audio",
    problem: "I need to cut or trim an audio file",
    label: "Cut audio",
    seoTitle: "Cut or Trim an Audio File Online, Free & Private",
    seoDescription:
      "Trim silence, cut a clip, or split a recording without installing anything. Free and private, processed in your browser, nothing uploaded. No sign-up, no watermark.",
    keywords: [
      "cut audio online",
      "trim audio",
      "audio cutter",
      "trim mp3",
      "split audio file",
    ],
    icon: "Scissors",
    accent: "amber",
    answer:
      "To cut an audio file, use an audio trimmer: select the section you want and export it. No software needed. Our Audio Trimmer and Cutter run in your browser, so the recording is never uploaded. Great for trimming silence, grabbing a clip, or splitting a long recording into parts.",
    intro:
      "Grab a clip, trim the silence at the start, or split a long recording, all in your browser.",
    primaryTool: "audio-trimmer",
    tools: ["audio-trimmer", "audio-cutter", "audio-splitter", "mp3-converter"],
    steps: [
      { title: "Open the Audio Trimmer", description: "Drop your audio file in, it's processed in your browser, never uploaded." },
      { title: "Select the section", description: "Set the start and end of the part you want to keep (or remove)." },
      { title: "Export the clip", description: "Save the trimmed audio. To break a file into several parts, use the Audio Splitter." },
      { title: "Convert if needed", description: "Need a universal file? Convert the result to MP3 for maximum compatibility." },
    ],
    mistakes: [
      "Cutting on a hard beat with no short fade, which can click at the edit point. Add a quick fade if it pops.",
      "Re-encoding a lossy file (like MP3) repeatedly, which stacks quality loss. Trim from the best source you have.",
      "Only trimming when a normalize or silence-remove step would clean the audio up better.",
    ],
    faq: [
      { question: "How do I cut an MP3 online?", answer: "Open the Audio Trimmer, select the part you want, and export. It runs in your browser and your file is never uploaded." },
      { question: "Can I split one audio file into several?", answer: "Yes: the Audio Splitter breaks a recording into multiple parts, handy for chapters or separating tracks." },
      { question: "Is my recording uploaded?", answer: "No. Cutting happens locally in your browser. The audio never leaves your device." },
    ],
    related: ["make-a-ringtone", "convert-audio-to-mp3", "extract-audio-from-video"],
    tags: ["audio", "cut", "trim", "split", "mp3"],
    fileTypes: ["mp3"],
  },
  {
    slug: "powerpoint-to-pdf",
    group: "Documents & PDF",
    problem: "I need to save a PowerPoint as a PDF",
    label: "PowerPoint to PDF",
    seoTitle: "Convert PowerPoint to PDF. Free, Keeps Your Slides Intact",
    seoDescription:
      "Turn a PowerPoint into a PDF so it looks the same everywhere and can't be edited. Free and private in your browser. Great for sharing decks and handouts. No sign-up.",
    keywords: [
      "powerpoint to pdf",
      "ppt to pdf",
      "convert presentation to pdf",
      "pptx to pdf",
      "save powerpoint as pdf",
    ],
    icon: "Presentation",
    accent: "orange",
    answer:
      "To share a deck reliably, convert PowerPoint to PDF: it locks the slides so they look identical on any device and can't be accidentally edited or reformatted. Our PowerPoint to PDF tool handles the conversion, and you can compress the result if it's image-heavy. It's the standard way to send a presentation or handout.",
    intro:
      "Send a deck that looks the same for everyone and can't be messed up, convert your slides to a clean PDF.",
    primaryTool: "ppt-to-pdf",
    tools: ["ppt-to-pdf", "pdf-to-ppt", "compress-pdf", "merge-pdf"],
    steps: [
      { title: "Open the PowerPoint to PDF tool", description: "Add your .ppt or .pptx file to convert it to a fixed-layout PDF." },
      { title: "Convert to PDF", description: "Each slide becomes a page, preserving the layout so nothing shifts." },
      { title: "Compress if it's large", description: "Image-heavy decks can be big: run Compress PDF so it emails and uploads easily." },
      { title: "Combine if needed", description: "Merge the deck with notes or a cover into one PDF before sending." },
    ],
    mistakes: [
      "Sending the editable.pptx when you want a fixed handout. A PDF can't be accidentally changed and looks identical everywhere.",
      "Forgetting animations and transitions don't carry into a PDF. It captures the final state of each slide.",
      "Emailing a huge image-heavy deck without compressing it first.",
    ],
    faq: [
      { question: "How do I convert a PowerPoint to PDF?", answer: "Use the PowerPoint to PDF tool. Add your.pptx and it turns each slide into a page in a fixed-layout PDF that looks the same everywhere." },
      { question: "Do animations survive the conversion?", answer: "No. A PDF is static, so it captures the final look of each slide. Convert to PDF for handouts and sharing, keep the.pptx for presenting." },
      { question: "Can I turn a PDF back into slides?", answer: "Yes, PDF to PowerPoint reverses it, placing each page onto a slide you can edit." },
    ],
    related: ["convert-excel-to-pdf", "combine-pdf-files", "resume-as-pdf"],
    tags: ["powerpoint", "ppt", "pdf", "convert", "presentation", "slides"],
    fileTypes: ["pdf"],
  },
  {
    slug: "convert-epub-to-pdf",
    group: "Documents & PDF",
    problem: "I need to convert an EPUB ebook to PDF",
    label: "EPUB to PDF",
    seoTitle: "Convert EPUB to PDF, Free & Private, In Your Browser",
    seoDescription:
      "Turn an EPUB ebook into a PDF you can read, print or share anywhere. Free and private: converted in your browser, nothing uploaded. No sign-up, no watermark.",
    keywords: [
      "epub to pdf",
      "convert epub to pdf",
      "ebook to pdf",
      "read epub as pdf",
      "epub converter",
    ],
    icon: "BookOpen",
    accent: "violet",
    answer:
      "To read or print an EPUB anywhere, convert it to PDF: EPUB is made for e-readers and reflows text, while PDF has fixed pages that print and open on any device. Our EPUB to PDF tool converts in your browser, so the file is never uploaded. You can also just view the EPUB directly if you only need to read it.",
    intro:
      "EPUB is great on e-readers but awkward elsewhere. Convert it to a PDF you can open, print and share anywhere.",
    primaryTool: "epub-to-pdf",
    tools: ["epub-to-pdf", "epub-viewer", "pdf-to-word", "compress-pdf"],
    steps: [
      { title: "Open the EPUB to PDF tool", description: "Drop your.epub file in, it's converted in your browser, never uploaded." },
      { title: "Convert to PDF", description: "The ebook's content is laid out onto fixed PDF pages you can print and share." },
      { title: "Or just read it", description: "If you only need to read it, the EPUB Viewer opens it without converting." },
      { title: "Compress if large", description: "Image-heavy ebooks can be big. Run Compress PDF to shrink the result." },
    ],
    mistakes: [
      "Expecting an EPUB's reflowable text to map perfectly to fixed PDF pages. Layout is a best-effort conversion.",
      "Converting a DRM-protected ebook, which won't work. Only convert files you own and can open.",
      "Converting when you only wanted to read it. Use the viewer instead.",
    ],
    faq: [
      { question: "How do I convert an EPUB to PDF?", answer: "Use the EPUB to PDF tool. Drop in the.epub and it lays the content onto fixed PDF pages you can print and share. It all runs in your browser." },
      { question: "Why convert EPUB to PDF?", answer: "EPUB is designed for e-readers and reflows text. PDF has fixed pages that print and open reliably on any device, which is handy for sharing or printing." },
      { question: "Can I convert a protected ebook?", answer: "No. DRM-protected files can't be converted. This works with EPUB files you own and can already open." },
    ],
    related: ["convert-pdf-to-word", "save-webpage-as-pdf", "convert-text-to-pdf"],
    tags: ["epub", "ebook", "pdf", "convert", "book"],
    fileTypes: ["pdf"],
  },
  {
    slug: "save-webpage-as-pdf",
    group: "Documents & PDF",
    problem: "I need to save a web page or HTML as a PDF",
    label: "Web page to PDF",
    seoTitle: "Convert HTML to PDF: Save a Web Page as PDF, Free & Private",
    seoDescription:
      "Turn HTML or a web page into a clean PDF for records, sharing or printing. Free and private, converted in your browser, nothing uploaded. No sign-up, no watermark.",
    keywords: [
      "html to pdf",
      "save web page as pdf",
      "convert html to pdf",
      "webpage to pdf",
      "web page to pdf",
    ],
    icon: "Globe",
    accent: "sky",
    answer:
      "To keep or share a web page, convert HTML to PDF: it captures the content as fixed pages you can archive, email or print. Our HTML to PDF tool converts your HTML in your browser, so nothing is uploaded. It's ideal for saving receipts, articles and reports as a permanent, shareable record.",
    intro:
      "Keep a permanent copy of a page, receipt or report, turn HTML into a clean, shareable PDF.",
    primaryTool: "html-to-pdf",
    tools: ["html-to-pdf", "markdown-to-pdf", "compress-pdf", "merge-pdf"],
    steps: [
      { title: "Open the HTML to PDF tool", description: "Paste your HTML or add the file, it's converted in your browser, never uploaded." },
      { title: "Convert to PDF", description: "The content is rendered onto fixed PDF pages ready to save or print." },
      { title: "Combine or compress", description: "Merge several pages into one PDF, or compress if the result is large." },
      { title: "Save your record", description: "Download the PDF as a permanent, shareable copy." },
    ],
    mistakes: [
      "Expecting a complex, interactive page to convert pixel-perfectly. Dynamic and script-heavy layouts are a best-effort capture.",
      "Converting when your browser's own 'Print → Save as PDF' would do for a quick one-off.",
      "Forgetting to compress a long, image-heavy page before emailing it.",
    ],
    faq: [
      { question: "How do I save a web page as a PDF?", answer: "Convert its HTML with the HTML to PDF tool, or use your browser's Print → Save as PDF for a quick copy. The tool keeps a clean, fixed-layout record you can share." },
      { question: "Does the layout stay the same?", answer: "Simple pages convert cleanly. Very dynamic or script-heavy layouts are a best-effort capture, since a PDF is static." },
      { question: "Is my content uploaded?", answer: "No. The conversion runs in your browser. Your HTML never leaves the device." },
    ],
    related: ["convert-epub-to-pdf", "convert-text-to-pdf", "combine-pdf-files"],
    tags: ["html", "webpage", "pdf", "convert", "web"],
    fileTypes: ["html", "pdf"],
  },
  {
    slug: "convert-text-to-pdf",
    group: "Documents & PDF",
    problem: "I need to turn a text or Markdown file into a PDF",
    label: "Text to PDF",
    seoTitle: "Convert Text or Markdown to PDF, Free & Private",
    seoDescription:
      "Turn a plain text or Markdown file into a clean, formatted PDF for sharing or printing. Free and private in your browser, nothing uploaded, no sign-up, no watermark.",
    keywords: [
      "text to pdf",
      "txt to pdf",
      "markdown to pdf",
      "convert text file to pdf",
      "notes to pdf",
    ],
    icon: "FileText",
    accent: "emerald",
    answer:
      "To share notes or a document nicely, convert text or Markdown to PDF: plain text becomes clean typeset pages, and Markdown's headings and lists render as proper formatting. Our Text to PDF and Markdown to PDF tools convert in your browser, so nothing is uploaded. It's the quick way to turn raw notes into a shareable file.",
    intro:
      "Raw notes or a Markdown draft? Turn them into a tidy, printable PDF anyone can open.",
    primaryTool: "txt-to-pdf",
    tools: ["txt-to-pdf", "markdown-to-pdf", "html-to-pdf", "compress-pdf"],
    steps: [
      { title: "Pick the right tool", description: "Plain notes → Text to PDF. A Markdown draft (with # headings) → Markdown to PDF." },
      { title: "Add your content", description: "Paste or drop the file in, it's converted in your browser, never uploaded." },
      { title: "Convert to PDF", description: "The text is typeset onto clean pages. Markdown formatting renders properly." },
      { title: "Save or combine", description: "Download the PDF, or merge it with other pages into one document." },
    ],
    mistakes: [
      "Using the plain-text tool for Markdown, the # and * symbols show literally instead of formatting. Use Markdown to PDF for that.",
      "Expecting fancy layout from plain text. It's clean and readable, not designed like a brochure.",
      "Forgetting very long documents may be worth compressing before sending.",
    ],
    faq: [
      { question: "How do I convert a text file to PDF?", answer: "Use the Text to PDF tool. Paste or drop your.txt in and it typesets the content onto clean PDF pages. For Markdown, use Markdown to PDF so the formatting renders." },
      { question: "Will my Markdown formatting show up?", answer: "Yes, if you use the Markdown to PDF tool, headings, lists and emphasis render as proper formatting rather than raw symbols." },
      { question: "Is my text uploaded?", answer: "No. Conversion runs in your browser. Your content never leaves the device." },
    ],
    related: ["save-webpage-as-pdf", "convert-epub-to-pdf", "resume-as-pdf"],
    tags: ["text", "txt", "markdown", "pdf", "convert", "notes"],
    fileTypes: ["pdf"],
  },
  {
    slug: "create-a-barcode",
    group: "QR Codes",
    problem: "I need to create a barcode",
    label: "Create a barcode",
    seoTitle: "Barcode Generator, Create a Barcode Free, In Your Browser",
    seoDescription:
      "Generate a barcode for a product, book or inventory item and download it print-ready. Free and private, in your browser. No sign-up, no watermark.",
    keywords: [
      "barcode generator",
      "create a barcode",
      "make a barcode",
      "generate barcode online",
      "product barcode",
    ],
    icon: "ScanBarcode",
    accent: "indigo",
    answer:
      "To make a barcode, use a barcode generator: enter the number or text and download a print-ready image. Barcodes encode a value as scannable bars for products, books, tickets and inventory. Our Barcode Generator builds it in your browser, so your data isn't uploaded. Download an SVG for crisp printing at any size.",
    intro:
      "Label products, books or inventory with a scannable barcode you can print at any size.",
    primaryTool: "barcode-generator",
    tools: ["barcode-generator", "qr-code-generator", "bulk-qr-code-generator", "qr-code-scanner"],
    steps: [
      { title: "Open the Barcode Generator", description: "Enter the number or text you want to encode." },
      { title: "Pick the barcode type", description: "Choose the format your system expects (e.g. a common retail or inventory type)." },
      { title: "Generate the barcode", description: "It's created in your browser instantly, your data isn't uploaded." },
      { title: "Download for print", description: "Grab an SVG so it stays sharp at any print size, or a PNG for screens." },
    ],
    mistakes: [
      "Choosing the wrong barcode type for your scanner or system, confirm which format it expects first.",
      "Printing too small or with poor contrast, so scanners struggle. Keep it crisp with a clear margin.",
      "Using a barcode when a QR code would carry more (a link, contact or Wi-Fi). Pick the right one for the job.",
    ],
    faq: [
      { question: "How do I create a barcode?", answer: "Enter your number or text in the Barcode Generator, pick the type, and download the image. It's generated in your browser and nothing is uploaded." },
      { question: "What's the difference between a barcode and a QR code?", answer: "A barcode encodes a short value (like a product number) in 1D bars. A QR code holds much more (links, contacts, Wi-Fi) in a 2D square. Use a QR code for rich data." },
      { question: "Can I print the barcode large?", answer: "Yes: download the SVG (vector) so it stays perfectly sharp at any size, from a label to a poster." },
    ],
    related: ["qr-code-for-a-link", "restaurant-menu-qr-code", "business-card-qr-code"],
    tags: ["barcode", "generator", "product", "inventory", "scan"],
  },
  {
    slug: "validate-my-html",
    group: "Web & SEO",
    problem: "I need to check my HTML or CSS for errors",
    label: "Validate HTML/CSS",
    seoTitle: "Validate HTML & CSS: Free Online Checker, In Your Browser",
    seoDescription:
      "Find errors in your HTML or CSS before you ship, unclosed tags, invalid properties and more. Free and private, checked in your browser. No sign-up.",
    keywords: [
      "html validator",
      "validate html",
      "css validator",
      "check html for errors",
      "html error checker",
    ],
    icon: "FileCheck2",
    accent: "cyan",
    answer:
      "To catch problems before they ship, validate your HTML or CSS: a validator flags unclosed tags, invalid nesting, unknown properties and typos that break rendering or SEO. Our HTML and CSS Validators check your code in your browser, so nothing is uploaded. Fix the flagged lines and your page renders reliably across browsers.",
    intro:
      "Broken layout or flaky rendering often traces to invalid markup. Validate first and fix the exact lines.",
    primaryTool: "html-validator",
    tools: ["html-validator", "css-validator", "meta-tag-analyzer", "heading-checker"],
    steps: [
      { title: "Open the validator", description: "HTML → HTML Validator, styles → CSS Validator. Paste your code in: it's checked in your browser." },
      { title: "Review the errors", description: "It flags unclosed tags, bad nesting, unknown properties and typos, with the line for each." },
      { title: "Fix the flagged lines", description: "Work through the issues. Invalid markup is a common cause of cross-browser rendering bugs." },
      { title: "Re-check and ship", description: "Validate again until it's clean, then check headings and meta with the SEO tools." },
    ],
    mistakes: [
      "Ignoring warnings that seem minor. An unclosed tag can break the whole layout below it.",
      "Validating the wrong thing (running CSS through the HTML checker). Match the tool to the code.",
      "Shipping without checking headings/meta too, which affects SEO as well as rendering.",
    ],
    faq: [
      { question: "How do I check my HTML for errors?", answer: "Paste it into the HTML Validator. It flags unclosed tags, invalid nesting and typos with the line number for each, all in your browser." },
      { question: "Why does valid HTML matter?", answer: "Invalid markup causes cross-browser rendering bugs and can hurt accessibility and SEO. Validating catches the issues before your visitors (and search engines) do." },
      { question: "Is my code uploaded?", answer: "No. Validation runs in your browser. Your HTML and CSS never leave the device." },
    ],
    related: ["audit-page-seo", "add-meta-tags", "format-messy-code"],
    tags: ["html", "css", "validate", "errors", "web", "developer"],
    fileTypes: ["html", "css"],
  },
  {
    slug: "compress-image-to-target-size",
    group: "Images & Photos",
    problem: "My image must be under an exact size (100KB, 50KB, 2MB)",
    label: "Image to an exact size",
    seoTitle: "Compress an Image to an Exact Size (100KB, 50KB, 2MB), Free",
    seoDescription:
      "A form demands your image be under 100KB, 50KB or 2MB? Set the exact target and the compressor finds the best quality that fits, free and private, in your browser.",
    keywords: [
      "compress image to 100kb",
      "compress image to 50kb",
      "compress image to exact size",
      "reduce image to 20kb",
      "compress photo to target size",
    ],
    icon: "Target",
    accent: "sky",
    answer:
      "When a form demands a specific limit (under 100KB, 50KB or 2MB) use the compressor's Target size mode: enter the limit and it binary-searches the highest quality that fits, so you don't guess with a slider. Our Image Compressor does this in your browser. For very small targets on a large photo, also resize the pixels down.",
    intro:
      "Upload forms often set a hard cap, 100KB, 50KB, sometimes 2MB. How to do it to hit an exact size without endless trial and error.",
    primaryTool: "image-compressor",
    tools: ["image-compressor", "image-resizer", "webp-converter", "crop-image"],
    steps: [
      { title: "Open the Image Compressor", description: "Drop your image in, it's processed in your browser, never uploaded." },
      { title: "Switch to Target size mode", description: "Pick a preset (50 KB, 100 KB, 200 KB, 500 KB, 1 MB) or type your exact limit in KB." },
      { title: "Compress to the target", description: "The tool finds the highest quality that lands under your limit and reports the actual size." },
      { title: "Resize if the target is tiny", description: "Aiming for 20KB on a big photo? Also reduce the pixel dimensions, or switch to WebP, to get there cleanly." },
    ],
    mistakes: [
      "Guessing with a quality slider when a target-size mode hits the exact limit for you.",
      "Trying to force a huge, high-resolution photo under 20KB by quality alone: resize the dimensions down too.",
      "Compressing to 50KB when the limit is 2MB, throwing away quality you didn't need to lose.",
    ],
    faq: [
      { question: "How do I compress an image to exactly 100KB?", answer: "Use the Image Compressor's Target size mode: enter 100 KB and it finds the highest quality that fits under it, then shows the actual size. No slider guesswork." },
      { question: "What if it can't reach my target?", answer: "Very small targets on a large image can't be met by quality alone. Resize the pixel dimensions down (or switch to WebP) and try again, the tool always reports the real size so you know where you stand." },
      { question: "Which format hits a small size best?", answer: "WebP is usually smallest at a given quality, so it reaches tight targets more easily than JPEG. Choose WebP in the output options if the destination supports it." },
    ],
    related: ["image-too-large", "email-attachment-too-large", "convert-webp-to-jpg"],
    tags: ["image", "compress", "target size", "100kb", "50kb", "exact size"],
    fileTypes: ["jpg", "png", "webp"],
  },
  /* ── Client recordings → work. Two distinct intents that both end at the
     flagship: one starts from a screen recording, one from a call or voice
     note. Kept apart because the words people type are genuinely different,
     and neither competes with the transcription problems above, those ask for
     TEXT, these ask for a TASK LIST. ─────────────────────────────────────── */
  {
    slug: "client-video-to-tasks",
    group: "Video & Audio",
    problem: "A client sent a video of the changes they want",
    label: "Client video to tasks",
    seoTitle: "Client Sent a Video of Changes? Turn It Into Developer Tasks, Free",
    seoDescription:
      "Stop rewatching client Looms and taking notes. Turn a screen recording into a list of bugs, features and design changes, each with the client's exact words, a timestamp and a screenshot. Free, no sign-up.",
    keywords: [
      "client sent a video of changes",
      "turn client video into tasks",
      "loom feedback to tickets",
      "client screen recording to task list",
      "what to do with a client feedback video",
    ],
    icon: "ListVideo",
    accent: "indigo",
    answer:
      "Run the recording through a tool that extracts the requests instead of just transcribing it. Video \u2192 Work reads the speech and the screen together and returns bugs, feature requests and design changes as tickets \u2014 each with acceptance criteria, the screenshot it happened on, and the client's own sentence beside the timestamp they said it.",
    intro:
      "Twenty minutes of \u201Ccan you just move this\u201D becomes a reviewed task list you can hand straight to a developer.",
    primaryTool: "video-to-work",
    tools: ["video-to-work", "video-intelligence", "video-trimmer", "extract-audio"],
    steps: [
      { title: "Open Video \u2192 Work", description: "Add the recording as a file, or paste a Loom link and let the server fetch it. The video is decoded in your browser, not uploaded." },
      { title: "Let it read the recording", description: "It transcribes the speech, captures the frames where the screen actually changed, and reads the on-screen text so a task can name the exact button or field." },
      { title: "Review every finding", description: "Each one shows the client's verbatim sentence, the screenshot and a confidence score. Anything vague is flagged \u201Cneeds confirmation\u201D rather than written up as a settled requirement \u2014 approve, edit or reject." },
      { title: "Export the handoff", description: "Developer handoff, a client-ready PDF with screenshots, Markdown, or JSON for Jira and Linear. Add the next revision video to the same project and it reconciles the two." },
    ],
    mistakes: [
      "Treating the output as final without reading it \u2014 the review step exists because a confident-sounding ticket built on a vague request is the expensive failure here.",
      "Ignoring the \u201Cneeds confirmation\u201D flags. Those are exactly the items worth one clarifying message before anyone starts building.",
      "Starting a fresh project for each revision video, which throws away the reconciliation that catches a client contradicting themselves between recordings.",
      "Pasting a YouTube or Vimeo link \u2014 those platforms block server-side downloads, so download the file and add it directly.",
    ],
    faq: [
      { question: "How do I turn a client's Loom into a task list?", answer: "Open Video \u2192 Work, add the Loom link or the downloaded file, and let it read the recording. You get bugs, features and design changes as tickets with acceptance criteria, screenshots and the client's exact words \u2014 then you review and export them." },
      { question: "Is the video uploaded anywhere?", answer: "No. The recording is decoded, transcribed and screenshotted in your browser. Only the transcript and the chosen screenshots go anywhere, to be read and immediately discarded \u2014 and not even those if you run a local model through Ollama." },
      { question: "What if the client was vague?", answer: "It says so. Uncertain readings carry a confidence score and a \u201Cneeds confirmation\u201D flag instead of being presented as requirements, so you know which items need one question before work starts." },
      { question: "Can I use several videos from the same client?", answer: "Yes \u2014 add them all to one project and later recordings are reconciled against earlier ones, surfacing requirements that changed, repeated or contradicted each other." },
    ],
    related: ["client-call-to-tasks", "extract-audio-from-video", "compress-a-video"],
    tags: ["video", "client", "feedback", "tasks", "tickets", "requirements", "handoff", "loom"],
    fileTypes: ["mp4", "mov", "webm"],
  },
  {
    slug: "client-call-to-tasks",
    group: "Video & Audio",
    problem: "I need to turn a recorded call or voice note into a task list",
    label: "Call to task list",
    seoTitle: "Turn a Recorded Client Call or Voice Note Into a Task List: Free",
    seoDescription:
      "Pull the actual requests out of a recorded call or a rambling voice note: tasks, questions and decisions, each quoted and timestamped. Free, no sign-up, and the recording is never uploaded.",
    keywords: [
      "turn a recorded call into a task list",
      "voice note to tasks",
      "client call to action items",
      "meeting recording to action items",
      "extract tasks from a recording",
    ],
    icon: "AudioLines",
    accent: "amber",
    answer:
      "Use a tool that extracts work items rather than a transcript. Drop the MP3, WAV or M4A into Video \u2192 Work and it returns the requests, questions and decisions in the call as separate items \u2014 each with the speaker's exact sentence and the timestamp, so you can check any of them in seconds instead of relistening.",
    intro:
      "A ten-minute voice note becomes a checked list of what was actually asked for \u2014 with the sentence that asked for it attached.",
    primaryTool: "video-to-work",
    tools: ["video-to-work", "video-intelligence", "audio-trimmer", "audio-silence-remover"],
    steps: [
      { title: "Add the audio file", description: "MP3, WAV, M4A, AAC, OGG and FLAC all work. It is decoded and transcribed in your browser \u2014 the file is never uploaded." },
      { title: "Let it read the call", description: "The screenshot and on-screen-text steps skip themselves and say why, because there was no picture. Everything else runs exactly as it does for video." },
      { title: "Review the items", description: "Tasks, questions and decisions, each with the verbatim sentence and its timestamp. Click a timestamp to hear that moment. Expect a few more \u201Cneeds confirmation\u201D flags than with video \u2014 there was no screen to point at." },
      { title: "Export or add more", description: "Export as a handoff, PDF, Markdown or JSON, or add the follow-up call to the same project so the two are reconciled." },
    ],
    mistakes: [
      "Expecting screenshots \u2014 an audio file has no picture, so those steps are skipped rather than faked.",
      "Relying on the list without reading the quotes when the caller described something visual. With no screen to reference, those readings are the least certain and are flagged as such.",
      "Recording at a very low bitrate or with heavy background noise, which costs transcription accuracy before any analysis can happen.",
      "Using it as a substitute for a transcript \u2014 if what you actually want is the text of the call to read and edit, Video Intelligence is the right tool.",
    ],
    faq: [
      { question: "How do I get action items out of a recorded call?", answer: "Add the recording to Video \u2192 Work. It transcribes the call in your browser and returns the requests, questions and decisions as separate items, each with the exact sentence and the timestamp it was said." },
      { question: "Does it work with audio only, or do I need video?", answer: "Audio alone is fine \u2014 MP3, WAV, M4A, AAC, OGG and FLAC. The steps that need a picture skip themselves and tell you why instead of leaving a blank." },
      { question: "Is my call uploaded?", answer: "The audio file is not. It is decoded and transcribed on your device. Only the transcript is sent to be read and then discarded, and not even that if you run a local model." },
      { question: "What if I just want the transcript?", answer: "Use Video Intelligence instead \u2014 it is the transcript workspace, with editing, speaker labels and caption export. Video \u2192 Work is for when you want the work items rather than the text." },
    ],
    related: ["client-video-to-tasks", "cut-an-audio-file", "extract-audio-from-video"],
    tags: ["audio", "call", "voice note", "meeting", "tasks", "action items", "client"],
    fileTypes: ["mp3", "wav", "m4a"],
  },
  /* ── GigAI Fit: target-size intents. Each is a distinct thing people type,
     and they all land on the one tool that actually does it. ───────────── */
  {
    slug: "compress-file-to-1mb",
    group: "Documents & PDF",
    problem: "I need to get a file under 1MB",
    label: "File to 1MB",
    seoTitle: "Compress a File to 1MB, Free, Exact Target Size",
    seoDescription:
      "Set 1MB as your limit and GigAI Fit compresses your image, PDF, video or audio to meet it: choosing the best quality that fits. Free, in-browser, nothing uploaded.",
    keywords: [
      "compress file to 1mb",
      "reduce file size to 1mb",
      "make file under 1mb",
      "compress image to 1mb",
      "compress pdf to 1mb",
    ],
    icon: "Zap",
    accent: "violet",
    answer:
      "Use a tool that takes the size as the input rather than a quality slider. GigAI Fit lets you type 1MB, then searches its own compression settings for the highest quality that still lands under it, for images, PDFs, video and audio alike. It runs in your browser, so the file is never uploaded.",
    intro:
      "Type the limit, not the settings. GigAI Fit works out how to get there and shows exactly what it traded away.",
    primaryTool: "gigai-fit",
    tools: ["gigai-fit", "image-compressor", "compress-pdf", "video-compressor"],
    steps: [
      { title: "Open GigAI Fit", description: "Drop your file in, it's identified from its bytes and read in your browser." },
      { title: "Enter 1 MB", description: "Type 1 and choose MB, or pick a preset if you're targeting a specific platform." },
      { title: "Let it search", description: "Each attempt names the setting it tried and the size it produced. It keeps the best quality that fits." },
      { title: "Check the trade, then download", description: "See the before/after and the quality verdict. Your original file is never modified." },
    ],
    mistakes: [
      "Guessing at a quality percentage, the relationship between quality and file size isn't linear, so guessing usually overshoots and destroys more than needed.",
      "Compressing an already-compressed file and expecting the same savings. Start from the best original you have.",
      "Aiming far below what the content can support. If 1MB isn't reachable, GigAI Fit says so instead of returning something unusable.",
    ],
    faq: [
      { question: "How do I compress a file to exactly 1MB?", answer: "Open GigAI Fit, drop the file in and type 1 MB as your limit. It searches its compression settings and returns the best-quality version that fits under 1MB, then shows you what changed." },
      { question: "What if 1MB isn't achievable?", answer: "It tells you. Rather than grinding the file down until it's unusable, GigAI Fit stops at the best practical result, shows that size, and lets you accept it or pick a different target." },
      { question: "Is my file uploaded?", answer: "No. Identification, every compression attempt and the result all happen in your browser. Nothing is transmitted or stored." },
    ],
    related: ["compress-file-to-2mb", "email-attachment-too-large", "pdf-too-large"],
    tags: ["compress", "file size", "1mb", "target size"],
    fileTypes: ["jpg", "pdf", "mp4"],
  },
  {
    slug: "compress-file-to-2mb",
    group: "Documents & PDF",
    problem: "I need to get a file under 2MB",
    label: "File to 2MB",
    seoTitle: "Compress a File to 2MB Online: Free, Hits the Target",
    seoDescription:
      "Enter 2MB and GigAI Fit compresses your image, PDF, video or audio to fit, keeping the best quality it can. Free, runs in your browser, nothing uploaded.",
    keywords: [
      "compress file to 2mb",
      "reduce file size to 2mb",
      "make file under 2mb",
      "compress pdf to 2mb",
      "compress image to 2mb",
    ],
    icon: "Zap",
    accent: "violet",
    answer:
      "Enter 2MB as the limit in GigAI Fit and it searches its compression settings for the best-quality result that fits underneath. It handles images, PDFs, video and audio, identifies which you have automatically, and runs entirely in your browser.",
    intro:
      "Upload forms often cap at 2MB with no explanation. Set the number and get a file that clears it.",
    primaryTool: "gigai-fit",
    tools: ["gigai-fit", "compress-pdf", "image-compressor", "video-compressor"],
    steps: [
      { title: "Open GigAI Fit", description: "Drop the file in. Images, PDFs, video and audio all work." },
      { title: "Set 2 MB", description: "Type 2 and choose MB, or tap the Web upload preset which uses the same figure." },
      { title: "Run it", description: "It measures the real output each round and narrows in on the best quality that fits." },
      { title: "Download", description: "Review what changed, then save. The original is untouched." },
    ],
    mistakes: [
      "Re-exporting from the original application at random settings and re-checking the size by hand, that's the loop this replaces.",
      "Using a lossless format like PNG when a specific byte target is required. A lossless format has no quality dial to search.",
      "Forgetting that a shorter video is far cheaper in quality than a lower bitrate. Trim first, then fit.",
    ],
    faq: [
      { question: "How do I make a PDF under 2MB?", answer: "Drop it into GigAI Fit and set 2 MB. It compresses the pages and reports the result. Note that PDF compression rasterises pages, so text stops being selectable, the tool says so before you run it." },
      { question: "Why did my PNG come back as a JPG?", answer: "PNG is lossless, so it has no quality setting to search towards a byte target. Reaching a specific size needs a lossy format, so GigAI Fit encodes JPEG and tells you the format changed." },
      { question: "Is it free?", answer: "Yes. No account, no watermark and no limit on how many files you process. The work happens on your own device, so there's nothing to meter." },
    ],
    related: ["compress-file-to-1mb", "pdf-too-large", "image-too-large"],
    tags: ["compress", "file size", "2mb", "target size"],
    fileTypes: ["jpg", "pdf", "mp4"],
  },
  {
    slug: "compress-video-for-whatsapp",
    group: "Video & Audio",
    problem: "My video is too big to send on WhatsApp",
    label: "Video for WhatsApp",
    seoTitle: "Compress Video for WhatsApp: Free, Fits the Limit",
    seoDescription:
      "Shrink a video until WhatsApp will accept it. GigAI Fit re-encodes to your target size in the browser, free, private, no upload, no watermark.",
    keywords: [
      "compress video for whatsapp",
      "whatsapp video size limit",
      "make video smaller for whatsapp",
      "send large video on whatsapp",
      "reduce video size for whatsapp",
    ],
    icon: "Zap",
    accent: "violet",
    answer:
      "WhatsApp caps media at roughly 16MB, so a video has to come in under that. GigAI Fit's WhatsApp preset targets 15MB, re-encodes the clip at a higher compression level and checks the real size each round until it fits: all in your browser.",
    intro:
      "Pick the WhatsApp preset and send the clip. No settings to understand, no upload.",
    primaryTool: "gigai-fit",
    tools: ["gigai-fit", "video-compressor", "video-trimmer", "video-converter"],
    steps: [
      { title: "Open GigAI Fit", description: "Drop your video in. It's read in your browser. Nothing is uploaded." },
      { title: "Tap the WhatsApp preset", description: "That targets 15MB, comfortably inside WhatsApp's limit rather than one byte over it." },
      { title: "Wait for the re-encode", description: "Video is genuinely slow to re-encode, so the search runs at most three attempts and names each one." },
      { title: "Download and send", description: "Check the quality verdict, then save the smaller clip." },
    ],
    mistakes: [
      "Sending the original and letting WhatsApp compress it. Its own compression is far more aggressive and gives you no control.",
      "Compressing a long video when trimming it would be cheaper. Removing seconds costs far less quality than removing bitrate.",
      "Expecting a 4K clip to survive a big reduction. Resolution costs bitrate, and a long 4K video may not reach the target at watchable quality.",
    ],
    faq: [
      { question: "What is WhatsApp's video size limit?", answer: "Around 16MB for media in most regions, which is why the preset here targets 15MB: landing just under is the point." },
      { question: "Will the quality be bad?", answer: "It depends how far the file has to travel. GigAI Fit gives a measured quality verdict (Excellent, Noticeable or Heavy degradation) so you know before you send it. Trimming the clip first usually gives a much better result." },
      { question: "Is my video uploaded?", answer: "No. The re-encode runs in your browser using the same engine as our Video Compressor. Nothing leaves your device." },
    ],
    related: ["compress-a-video", "compress-file-to-2mb", "convert-mov-to-mp4"],
    tags: ["video", "whatsapp", "compress", "share"],
    fileTypes: ["mp4", "mov"],
  },
  {
    slug: "compress-file-for-email",
    group: "Documents & PDF",
    problem: "My file is too big to email",
    label: "File for email",
    seoTitle: "Compress a File for Email, Free, Under the Attachment Limit",
    seoDescription:
      "Get any file under the email attachment limit. GigAI Fit targets 20MB and compresses images, PDFs, video or audio to fit, free, in your browser, nothing uploaded.",
    keywords: [
      "compress file for email",
      "email attachment size limit",
      "file too big to email",
      "reduce attachment size",
      "compress pdf for email",
    ],
    icon: "Zap",
    accent: "violet",
    answer:
      "Most mail servers reject attachments above about 25MB, so aim under 20MB to be safe. GigAI Fit's Email preset does exactly that: it identifies your file, compresses it towards 20MB and keeps the best quality that fits, in your browser, with no upload.",
    intro:
      "One preset, any file type. Get under the limit before you hit send, not after it bounces.",
    primaryTool: "gigai-fit",
    tools: ["gigai-fit", "compress-pdf", "image-compressor", "video-compressor"],
    steps: [
      { title: "Open GigAI Fit", description: "Drop the attachment in, image, PDF, video or audio." },
      { title: "Tap the Email preset", description: "It targets 20MB, safely inside the ~25MB most servers enforce." },
      { title: "Let it compress", description: "It measures each attempt and keeps the best quality that fits." },
      { title: "Attach the result", description: "Download the new file. Your original stays exactly as it was." },
    ],
    mistakes: [
      "Zipping the file: an already-compressed image, PDF or video barely shrinks in a ZIP, and the recipient has to unpack it.",
      "Sending several large attachments that individually fit but together exceed the message limit.",
      "Compressing to the exact published cap. Encoding overhead means aiming a little under is what actually gets delivered.",
    ],
    faq: [
      { question: "What is the email attachment size limit?", answer: "Gmail and most providers cap messages at around 25MB including encoding overhead, so a safe practical target is 20MB, which is what the Email preset uses." },
      { question: "Should I zip the file instead?", answer: "Usually not. Images, PDFs and video are already compressed, so a ZIP saves very little and just adds a step for the recipient. Re-compressing the file itself is what actually reduces the size." },
      { question: "Does it work for video?", answer: "Yes, though video re-encoding is slow in a browser, so the search is limited to a few attempts. Trimming the clip first gives a much better result for the same size." },
    ],
    related: ["email-attachment-too-large", "compress-file-to-2mb", "pdf-too-large"],
    tags: ["email", "attachment", "compress", "file size"],
    fileTypes: ["pdf", "jpg", "mp4"],
  },
  /* ── GigAI Verify: inspection intents. Phrased as questions people actually
     ask, and answered honestly. No page here promises certainty. ────── */
  {
    slug: "check-image-metadata",
    group: "Images & Photos",
    problem: "I want to see an image's metadata and where it came from",
    label: "Check image metadata",
    seoTitle: "Image Metadata & EXIF Checker, Free, Nothing Uploaded",
    seoDescription:
      "See an image's EXIF, camera, timestamps, GPS presence, editing software and Content Credentials. Runs in your browser. The file is never uploaded.",
    keywords: [
      "image metadata checker",
      "exif viewer online",
      "check photo metadata",
      "see camera info in photo",
      "content credentials checker",
      "c2pa checker",
    ],
    icon: "Search",
    accent: "sky",
    answer:
      "Open GigAI Verify and drop the image in. It reads the EXIF block, camera, lens, capture and modification times, whether GPS was recorded, and which software touched the file: plus any Content Credentials (C2PA) the file carries. Everything is parsed in your browser.",
    intro:
      "See what an image records about itself, and, just as importantly, what it doesn't.",
    primaryTool: "gigai-verify",
    tools: ["gigai-verify", "remove-metadata", "redaction-checker", "document-metadata-editor"],
    steps: [
      { title: "Open GigAI Verify", description: "Drop the image in. It's read from its own bytes, never uploaded." },
      { title: "Read the evidence cards", description: "Camera, timestamps, software and provenance each appear as a card you can expand for the raw values." },
      { title: "Check the alternative explanations", description: "Every card states what else could innocently produce that finding: read it before drawing conclusions." },
      { title: "Export if you need a record", description: "Download the JSON report, which includes a SHA-256 hash of the exact file analyzed." },
    ],
    mistakes: [
      "Reading missing metadata as suspicious. Every social platform strips it on upload and screenshots never have any: absence is the normal state.",
      "Treating “editing software detected” as proof of manipulation. Cropping and color correction produce the same signal.",
      "Assuming EXIF is trustworthy. It's plain text in the file and can be edited or written by hand.",
    ],
    faq: [
      { question: "How do I check a photo's metadata?", answer: "Drop it into GigAI Verify. It reads the EXIF block and shows the camera, lens, capture and modification timestamps, whether GPS coordinates are present, and any software that touched the file." },
      { question: "What does it mean if there's no metadata?", answer: "Almost always that the image came through a platform that strips it, which is most of them, or that it's a screenshot. It is not evidence that anything is wrong, and GigAI Verify records it as neutral." },
      { question: "Can it tell me if an image is AI-generated?", answer: "Only if the file says so, through Content Credentials or generator software named in its metadata. It will not guess from the pixels, because no browser tool can do that reliably. Where there's no declaration you'll get “Inconclusive”, which is the honest answer." },
      { question: "Is my image uploaded?", answer: "No. All parsing happens in your browser and nothing is transmitted or stored." },
    ],
    related: ["check-image-metadata", "check-image-editing", "pdf-metadata-check"],
    tags: ["metadata", "exif", "image", "c2pa", "provenance"],
    fileTypes: ["jpg", "png"],
  },
  {
    slug: "check-image-editing",
    group: "Images & Photos",
    problem: "I want to know whether an image has been edited",
    label: "Check if edited",
    seoTitle: "Check if an Image Was Edited, Forensic Signals, Free",
    seoDescription:
      "Inspect editing software fingerprints, timestamp differences, compression characteristics and Error Level Analysis. Evidence with alternative explanations. Never a fake verdict.",
    keywords: [
      "check if image was edited",
      "image forensics online",
      "jpeg ela analyzer",
      "error level analysis online",
      "detect photo manipulation signals",
    ],
    icon: "Search",
    accent: "sky",
    answer:
      "Look at the signals rather than expecting a yes or no. GigAI Verify reports editing-software fingerprints, differences between capture and modification timestamps, JPEG compression characteristics, and an optional Error Level Analysis view: each with the innocent explanation attached, because normal editing and manipulation produce the same signals.",
    intro:
      "There is no honest yes-or-no answer here. There is evidence, and there is what it does and doesn't mean.",
    primaryTool: "gigai-verify",
    tools: ["gigai-verify", "redaction-checker", "remove-metadata"],
    steps: [
      { title: "Open GigAI Verify", description: "Drop the image in and tick Deep check to include Error Level Analysis." },
      { title: "Look for software fingerprints", description: "Editors frequently leave their name in the metadata. That tells you the file was processed, not that it was faked." },
      { title: "Compare the timestamps", description: "A modification time later than the capture time means the file was re-saved at some point." },
      { title: "Read the ELA carefully", description: "Bright regions mean differing compression: produced by editing, exporting, resizing and screenshots alike. It is a place to look, not proof." },
    ],
    mistakes: [
      "Treating Error Level Analysis as proof. It is the single most misread forensic technique: every ordinary workflow produces the same patterns.",
      "Concluding a photo is fake because Photoshop appears in the metadata. Most published photographs have been through an editor.",
      "Expecting certainty. Nothing available in a browser can establish that an image was manipulated.",
    ],
    faq: [
      { question: "Can you tell if a photo has been Photoshopped?", answer: "You can see whether editing software left a fingerprint, whether the modification time differs from capture, and how compression varies across the image. None of those establish manipulation. They show the file was processed, which is true of almost every published photo." },
      { question: "What is Error Level Analysis?", answer: "It re-saves the image at a known quality and amplifies the difference, so regions that compress differently stand out. Editing, exporting, screenshotting and social-media recompression all produce those differences, so ELA on its own proves nothing." },
      { question: "Is this admissible as evidence?", answer: "No. GigAI Verify reports technical signals for human interpretation. It should never be the sole basis for a legal, employment or academic decision, and the report says so." },
    ],
    related: ["check-image-metadata", "pdf-metadata-check"],
    tags: ["forensics", "ela", "editing", "image"],
    fileTypes: ["jpg", "png"],
  },
  {
    slug: "pdf-metadata-check",
    group: "Documents & PDF",
    problem: "I want to inspect a PDF's metadata and structure",
    label: "Check PDF metadata",
    seoTitle: "PDF Metadata & Forensics Checker, Free, In Your Browser",
    seoDescription:
      "Inspect a PDF's creator, producer, timestamps, incremental updates, embedded fonts, JavaScript and attachments. Nothing is uploaded and nothing embedded is executed.",
    keywords: [
      "pdf metadata checker",
      "pdf forensics",
      "check pdf properties",
      "pdf creator producer info",
      "does pdf contain javascript",
    ],
    icon: "Search",
    accent: "sky",
    answer:
      "Drop the PDF into GigAI Verify. It reads the creator and producer, creation and modification dates, how many incremental updates the file carries (meaning it was re-saved after creation), how many fonts are embedded versus merely referenced, and whether JavaScript or file attachments are present: without ever executing them.",
    intro:
      "See how a document was made and whether it changed after: safely, and without uploading it.",
    primaryTool: "gigai-verify",
    tools: ["gigai-verify", "redaction-checker", "document-metadata-editor", "repair-pdf"],
    steps: [
      { title: "Open GigAI Verify", description: "Drop the PDF in. It's parsed in your browser and nothing embedded is run." },
      { title: "Read the document metadata", description: "Creator, producer, and creation versus modification dates." },
      { title: "Check the structure", description: "Incremental updates show the file was saved again after it was first written. Font embedding affects how it renders elsewhere." },
      { title: "Note any JavaScript or attachments", description: "Both are legitimate PDF features, but worth knowing about before opening the file in a reader that runs them." },
    ],
    mistakes: [
      "Reading “Microsoft Word” in the producer field as proof a human wrote the content. It names the program that wrote the file, nothing more.",
      "Treating incremental updates as evidence of concealment, filling a form, signing or annotating all create them.",
      "Opening an unknown PDF with JavaScript in a reader that executes it. GigAI Verify detects it without running it.",
    ],
    faq: [
      { question: "How do I see who created a PDF?", answer: "GigAI Verify reads the Creator and Producer fields plus any XMP metadata. Bear in mind these name the software, and the Author field (when present) is whatever was typed into the authoring application." },
      { question: "What are incremental updates?", answer: "A PDF can be modified by appending changes rather than rewriting the file. Each append leaves a marker, so counting them shows how many times the document was saved after creation. It's completely normal for forms and signed documents." },
      { question: "Does it run JavaScript in the PDF?", answer: "Never. Embedded JavaScript is detected and reported as a finding, but GigAI Verify does not execute anything from an uploaded file." },
    ],
    related: ["check-image-metadata", "check-image-editing", "pdf-too-large"],
    tags: ["pdf", "metadata", "forensics", "structure"],
    fileTypes: ["pdf"],
  },
  /* ── Privacy & Limits (Cluster A, specs/geo-strategy.md) ─────────────────
     Constraint-first pages: each answers a stated constraint - no upload, no
     account, no limit, offline, no watermark - in the first 40 words. These
     constraints are architecture facts here and documented weaknesses for
     the incumbents, which is the entire strategy. */
  {
    slug: "merge-pdfs-without-uploading",
    group: "Privacy & Limits",
    problem: "Merge PDFs without uploading them anywhere",
    label: "Merge without upload",
    seoTitle: "Merge PDFs Without Uploading Them Anywhere (Local, Free)",
    seoDescription:
      "Yes - merge PDFs entirely in your browser with pdf-lib. Files never leave your device: no upload, no account, no page limit. Built for contracts and confidential documents.",
    keywords: [
      "merge pdf without uploading",
      "combine pdf locally",
      "merge confidential pdf",
      "offline pdf merger",
      "merge pdf no server",
    ],
    icon: "ShieldCheck",
    accent: "emerald",
    answer:
      "Yes. GigAI's PDF merger runs entirely in your browser using pdf-lib - your files are never transmitted to any server at any point. There is no account, no page limit and no watermark, which makes it safe for contracts, medical records and anything under NDA.",
    intro:
      "Confidential paperwork shouldn't take a detour through someone's server just to become one file.",
    primaryTool: "merge-pdf",
    tools: ["merge-pdf", "reorder-pdf-pages", "compress-pdf"],
    steps: [
      { title: "Drop your PDFs on the merger", description: "They load in browser memory only - watch the network tab: no upload request exists." },
      { title: "Order the files", description: "Drag to arrange. Pages are copied losslessly with pdf-lib, never re-rendered." },
      { title: "Download the single PDF", description: "The merged file is created on your device. Close the tab and nothing persists anywhere." },
    ],
    mistakes: [
      "Using a cloud merger for NDA documents - most free sites process files server-side and keep them temporarily.",
      "Merging before removing pages you don't want shared. Delete pages first, then merge.",
    ],
    faq: [
      { question: "How can I verify nothing is uploaded?", answer: "Open your browser's developer tools, watch the Network tab, and merge. You'll see the pdf-lib code load once - and no request carrying your file, because processing happens in the page's own memory." },
      { question: "Is there a file size or page limit?", answer: "No fixed limit. Merging is limited only by your device's memory. Hundred-page documents are routine. In our published benchmark, two 6.6 MB files merged losslessly in 1.0 second." },
      { question: "Does merging reduce quality?", answer: "No. Pages are copied byte-for-byte with pdf-lib rather than re-rendered, so text stays sharp and selectable exactly as it was." },
    ],
    related: ["combine-pdf-files", "compress-file-for-email", "edit-confidential-pdf-locally"],
    tags: ["pdf", "merge", "privacy", "local", "no upload"],
    fileTypes: ["pdf"],
  },
  {
    slug: "compress-pdf-without-signing-up",
    group: "Privacy & Limits",
    problem: "Compress a PDF without signing up",
    label: "Compress, no signup",
    seoTitle: "Compress a PDF Without Signing Up (Free, In-Browser, No Limit)",
    seoDescription:
      "Compress PDFs with zero account, zero email, zero daily cap. In-browser re-encoding took a 6.6 MB scan to 90 KB in our benchmark - files never uploaded.",
    keywords: [
      "compress pdf without signing up",
      "compress pdf no account",
      "pdf compressor no email",
      "compress pdf no daily limit",
    ],
    icon: "FileArchive",
    accent: "sky",
    answer:
      "You don't need an account. GigAI's PDF compressor works the moment the page loads: drop the file, download the result. In our published benchmark a 6.6 MB image-heavy PDF became 90 KB in 2.2 seconds - processed in your browser, never uploaded, no daily cap.",
    intro:
      "The signup wall on most PDF sites exists for their funnel, not for your file.",
    primaryTool: "compress-pdf",
    tools: ["compress-pdf", "gigai-fit", "split-pdf"],
    steps: [
      { title: "Drop the PDF", description: "No email, no trial timer. The compressor is the page." },
      { title: "Compress", description: "Pages are re-encoded with MozJPEG locally. If compression can't beat the original, you get the original back - never a worse file." },
      { title: "Download", description: "Repeat as often as you like. There is no daily allowance to run out of." },
    ],
    mistakes: [
      "Expecting big savings on text-first PDFs - they're already small. Scans and image-heavy decks are where 90%+ reductions happen.",
      "Compressing before merging several files - merge first, compress once.",
    ],
    faq: [
      { question: "Why do other sites make me sign up?", answer: "Server-side processing costs them money per file, so accounts and daily caps ration it. This compressor spends your browser's CPU instead, which is why it can stay free and uncapped." },
      { question: "How small will my PDF get?", answer: "Scanned or image-heavy documents typically shrink 80-99% - our benchmark took 6.6 MB to 90 KB. Text-born PDFs compress far less because they're already efficient." },
      { question: "Is there a size limit?", answer: "No imposed one. Very large files are bounded by your device's memory, not by a plan tier." },
    ],
    related: ["pdf-too-large", "compress-file-to-1mb", "pdf-tools-without-account-or-limits"],
    tags: ["pdf", "compress", "no signup", "no account", "free"],
    fileTypes: ["pdf"],
  },
  {
    slug: "pdf-tools-without-account-or-limits",
    group: "Privacy & Limits",
    problem: "PDF tools that work without an account or daily limit",
    label: "PDF tools, no account",
    seoTitle: "Free PDF Tools With No Account and No Daily Limit",
    seoDescription:
      "32 PDF tools - merge, split, compress, convert, protect - all free, all in-browser, none behind a signup or daily cap. Files are never uploaded.",
    keywords: [
      "pdf tools without account",
      "free pdf tools no daily limit",
      "pdf tools no signup",
      "unlimited free pdf tools",
    ],
    icon: "LayoutGrid",
    accent: "amber",
    answer:
      "Every one of GigAI's 32 PDF tools works without an account and without a daily cap. They run in your browser - merging, splitting, compressing and converting happen on your device with pdf-lib and pdf.js, so there's no server bill forcing a paywall and no upload of your documents.",
    intro:
      "Daily limits exist to sell subscriptions. Tools that don't run servers don't need them.",
    primaryTool: "merge-pdf",
    tools: ["merge-pdf", "split-pdf", "compress-pdf", "pdf-editor", "pdf-password-protect", "ocr-pdf"],
    steps: [
      { title: "Pick the job", description: "Merge, split, compress, reorder, protect, unlock, OCR, convert - each is its own focused tool." },
      { title: "Drop the file and work", description: "Everything processes locally. The third document of the day costs the same as the first: nothing." },
      { title: "Chain tools when needed", description: "Split, then merge, then compress - outputs hand off to the next tool without re-uploading, because nothing was uploaded to begin with." },
    ],
    mistakes: [
      "Assuming 'free' web tools are equivalent - most meter you per day and process server-side. Check where the file goes before dropping anything sensitive.",
    ],
    faq: [
      { question: "What's the catch?", answer: "The site is ad-supported around the tools. The tools themselves have no tiers: your browser does the computing, so there's no per-file cost to ration." },
      { question: "Which PDF jobs are covered?", answer: "Thirty-two tools across merging, splitting, page management, compression, conversion to and from images and Word, OCR, watermarking, page numbers, protection and unlocking." },
      { question: "Are files really not uploaded?", answer: "Correct - processing uses pdf-lib and pdf.js compiled to run in the page. You can verify in your browser's network tab: no request ever carries your document." },
    ],
    related: ["merge-pdfs-without-uploading", "compress-pdf-without-signing-up", "edit-confidential-pdf-locally"],
    tags: ["pdf", "no account", "no limit", "free", "privacy"],
    fileTypes: ["pdf"],
  },
  {
    slug: "convert-heic-to-jpg-offline",
    group: "Privacy & Limits",
    problem: "Convert HEIC to JPG offline, without the internet",
    label: "HEIC to JPG offline",
    seoTitle: "Convert HEIC to JPG Offline - No Internet, No Upload",
    seoDescription:
      "Convert iPhone HEIC photos to JPG in your browser - and offline after the first visit, because the converter installs as a PWA. Photos never leave the device.",
    keywords: [
      "convert heic offline",
      "heic to jpg without internet",
      "heic to jpg no upload",
      "iphone photos offline converter",
    ],
    icon: "WifiOff",
    accent: "rose",
    answer:
      "GigAI's HEIC converter decodes iPhone photos in your browser - after your first visit it works with the internet off, because the site installs as an offline-capable app. Your photos are never uploaded either way. In our benchmark a 2.3 MB HEIC converted in 5.7 seconds.",
    intro:
      "On a plane with a folder of iPhone photos the form won't take? This keeps working.",
    primaryTool: "heic-to-jpg",
    tools: ["heic-to-jpg", "image-compressor", "remove-metadata"],
    steps: [
      { title: "Visit once online", description: "The converter and its HEIC decoder cache locally via the service worker." },
      { title: "Convert - connected or not", description: "Decoding runs in WebAssembly on your device. The network isn't part of the pipeline." },
      { title: "Compress if size matters", description: "JPG is usually larger than HEIC at the same quality - run the result through the compressor if you need it small." },
    ],
    mistakes: [
      "Emailing HEIC files to yourself to convert them on a PC - the photo makes two internet round-trips for a job your browser does locally.",
      "Expecting the JPG to be smaller: HEIC compresses better, so converting is about compatibility, not size.",
    ],
    faq: [
      { question: "How does it work offline?", answer: "The site is a progressive web app: after one visit, the converter's code and decoder are cached on your device and run without a connection. The address bar's install option makes it feel like a native app." },
      { question: "Why won't my iPhone photo upload anywhere?", answer: "Many forms and older systems don't accept HEIC, Apple's default since iOS 11. Converting to JPG makes the photo universally accepted." },
    ],
    related: ["convert-heic-to-jpg", "image-too-large", "resize-image-without-watermark"],
    tags: ["heic", "jpg", "offline", "iphone", "privacy"],
    fileTypes: ["heic", "jpg"],
  },
  {
    slug: "resize-image-without-watermark",
    group: "Privacy & Limits",
    problem: "Resize an image without a watermark",
    label: "Resize, no watermark",
    seoTitle: "Resize an Image Without a Watermark (Free, No Signup)",
    seoDescription:
      "Resize images to exact pixels with zero watermark, zero signup, zero upload. Lanczos resampling in your browser - our benchmark: 4000×3000 to 1600×1200 in 3.1 seconds.",
    keywords: [
      "resize image without watermark",
      "image resizer no watermark free",
      "resize photo no logo",
      "resize image no signup",
    ],
    icon: "Scaling",
    accent: "cyan",
    answer:
      "GigAI's Image Resizer never watermarks anything - free means free. Resizing uses Lanczos resampling in your browser (4000×3000 → 1600×1200 took 3.1 seconds in our benchmark), the image never uploads, and the output is yours with no logo, overlay or account.",
    intro:
      "A watermark on your own photo is a ransom note. Skip the sites that hold images hostage.",
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    steps: [
      { title: "Drop the image", description: "JPG, PNG or WebP - it loads locally, nothing is sent anywhere." },
      { title: "Set exact pixels", description: "Type dimensions or use the aspect-ratio lock. Lanczos resampling keeps edges clean." },
      { title: "Download, unmarked", description: "The file is yours. No corner logo, no 'upgrade to remove'." },
    ],
    mistakes: [
      "Paying to remove a watermark a free tool added - that's the business model, not a technical necessity.",
      "Resizing up expecting detail: enlarging can't create pixels. Use the upscaler's neural model when you must go bigger.",
    ],
    faq: [
      { question: "Why do other resizers watermark?", answer: "To convert free users to paid ones. Watermarking is a pricing lever, not a cost of resizing - which your own browser does in seconds for nothing." },
      { question: "Does resizing lose quality?", answer: "Downsizing with Lanczos resampling keeps images crisp - it's the same class of filter professional editors use. Upscaling is a different job with genuine limits." },
    ],
    related: ["image-too-large", "resize-for-instagram", "convert-heic-to-jpg-offline"],
    tags: ["resize", "watermark", "free", "image", "no signup"],
    fileTypes: ["jpg", "png", "webp"],
  },
  {
    slug: "edit-confidential-pdf-locally",
    group: "Privacy & Limits",
    problem: "Edit a confidential document without a cloud service",
    label: "Edit PDFs privately",
    seoTitle: "Edit a Confidential PDF Without a Cloud Service (Local, Free)",
    seoDescription:
      "Edit PDF text, add whiteout, annotate and sign - entirely in your browser. The document never uploads, which is the whole point for NDAs, contracts and medical records.",
    keywords: [
      "edit confidential pdf",
      "edit pdf without cloud",
      "pdf editor no upload",
      "edit nda pdf locally",
      "private pdf editor",
    ],
    icon: "FileLock2",
    accent: "emerald",
    answer:
      "Edit the PDF in your browser instead: GigAI's PDF editor loads the document into page memory with pdf.js, lets you edit existing text, whiteout, annotate and sign, and never transmits it - there is no server in the pipeline. For NDA and client documents, that is the entire requirement.",
    intro:
      "A confidentiality clause and a cloud PDF editor are a contradiction. Local editing isn't.",
    primaryTool: "pdf-editor",
    tools: ["pdf-editor", "redaction-checker", "pdf-password-protect", "remove-metadata"],
    steps: [
      { title: "Open the PDF in the editor", description: "It renders locally with pdf.js. The network tab stays quiet." },
      { title: "Edit, whiteout, annotate or sign", description: "Click existing text to change it, or use Find & Replace across the document." },
      { title: "Check what you're leaking", description: "Before sending, run the redaction checker - whiteout that only covers text visually is the classic confidentiality failure." },
    ],
    mistakes: [
      "Drawing a black box over text and calling it redacted - the text is still in the file. Use the redaction checker to prove what's actually recoverable.",
      "Editing in a cloud service and assuming deletion - most keep processed files temporarily, which may already breach an NDA's terms.",
    ],
    faq: [
      { question: "Is local editing as capable as Acrobat?", answer: "For text corrections, whiteout, annotations, signatures and page operations - yes, and with zero exposure. Deep typography reflow of complex layouts is where desktop Acrobat still leads. We state that honestly." },
      { question: "How do I prove nothing was uploaded?", answer: "Open the browser's developer tools and watch the Network tab during an edit: the document never appears in any request. Processing is pdf.js and pdf-lib running in the page." },
      { question: "Can I password-protect the result?", answer: "Yes - the protect tool applies real AES encryption to the downloaded file, also locally." },
    ],
    related: ["merge-pdfs-without-uploading", "edit-text-in-a-pdf", "password-protect-a-pdf"],
    tags: ["pdf", "edit", "privacy", "confidential", "local"],
    fileTypes: ["pdf"],
  },
  {
    slug: "transcribe-audio-without-uploading",
    group: "Privacy & Limits",
    problem: "Transcribe audio without sending it to a server",
    label: "Transcribe locally",
    seoTitle: "Transcribe Audio Without Uploading It Anywhere (Whisper, Free)",
    seoDescription:
      "Run OpenAI's Whisper in your browser: interviews, lectures and client calls transcribed on your own device. The recording never leaves it. Free, no account.",
    keywords: [
      "transcribe audio without uploading",
      "local transcription free",
      "whisper in browser",
      "transcribe interview privately",
      "offline transcription",
    ],
    icon: "MicOff",
    accent: "emerald",
    answer:
      "GigAI Video Intelligence runs OpenAI's Whisper model inside your browser via transformers.js, so the recording is transcribed on your own device and never uploaded. Otter, Rev and Fireflies all require upload. This doesn't. Free, no account - after the one-time model download it even works offline.",
    intro:
      "An interview under embargo or a client call under NDA shouldn't visit a transcription company's servers.",
    primaryTool: "video-intelligence",
    tools: ["video-intelligence", "audio-to-mp3", "subtitle-converter"],
    steps: [
      { title: "Drop the recording", description: "Audio or video - decoding and transcription both happen locally." },
      { title: "Pick a model size", description: "Fast English (42 MB) for quick drafts. The multilingual model for accents and other languages. Downloads once, then caches." },
      { title: "Edit and export", description: "Fix names inline, label speakers, then export TXT, Markdown, SRT or VTT." },
    ],
    mistakes: [
      "Assuming 'private' cloud transcription means unprocessed - upload IS processing on someone else's machine. Read their retention terms.",
      "Using the large model for a clear English recording - the small model is dramatically faster and usually enough.",
    ],
    faq: [
      { question: "How accurate is in-browser Whisper?", answer: "The same models the cloud services build on, running locally. Clear speech transcribes very well on the small English model. Heavy accents and crosstalk benefit from the larger multilingual one. You trade some speed for absolute privacy." },
      { question: "How long can the recording be?", answer: "The tool warns beyond about 20 minutes because WASM/WebGPU transcription is slower than a server farm - a 2-hour lecture works, it just takes a while. Nothing is capped by a plan." },
      { question: "Does it summarise too?", answer: "No, deliberately - summarisation needs a language model, which would mean sending text somewhere. For client recordings, Video → Work does that step with explicit disclosure." },
    ],
    related: ["client-call-to-tasks", "gdpr-safe-file-conversion", "compress-video-without-installing-software"],
    tags: ["transcription", "whisper", "privacy", "audio", "local"],
    fileTypes: ["mp3", "wav", "mp4"],
  },
  {
    slug: "gdpr-safe-file-conversion",
    group: "Privacy & Limits",
    problem: "GDPR-safe file conversion for client documents",
    label: "GDPR-safe conversion",
    seoTitle: "GDPR-Safe File Conversion: No Upload, No Processor Agreement Needed",
    seoDescription:
      "Convert client files without creating a data-processing relationship: browser-local conversion means personal data never reaches a third party's server.",
    keywords: [
      "gdpr safe file conversion",
      "convert client files gdpr",
      "file converter no data processing",
      "gdpr compliant pdf tools",
    ],
    icon: "Scale",
    accent: "sky",
    answer:
      "Conversion that never transmits the file sidesteps the GDPR question that matters: no personal data reaches a processor, because there is no processor. GigAI's converters run in your browser - the client document stays on your machine, so there's no transfer to paper over with an agreement.",
    intro:
      "The cleanest data-processing agreement is the one you don't need.",
    primaryTool: "gigai-fit",
    tools: ["gigai-fit", "heic-to-jpg", "word-to-pdf", "compress-pdf", "remove-metadata"],
    steps: [
      { title: "Convert on-device", description: "Image, document and audio conversion all run locally - verify with the browser's network tab." },
      { title: "Strip metadata before sharing", description: "EXIF can carry location and device identifiers - personal data in its own right under GDPR." },
      { title: "Hit exact size limits without third parties", description: "GigAI Fit compresses to a portal's cap entirely locally." },
    ],
    mistakes: [
      "Treating a converter's privacy policy as compliance - if the file uploads, you have a processing relationship regardless of what the policy promises.",
      "Forgetting metadata: converting a photo doesn't strip the GPS position embedded in it.",
    ],
    faq: [
      { question: "Is browser-local processing really outside GDPR's processor rules?", answer: "When the file never leaves your device, no third party processes the personal data in it - the conversion is legally similar to running desktop software. (This is engineering fact, not legal advice. Your DPO gets the final word.)" },
      { question: "How do I demonstrate this to a client or auditor?", answer: "Reproducibly: open the tool, watch the network panel, convert. No request carries the file. The processing libraries - pdf-lib, ffmpeg.wasm, libheif - run visibly in the page." },
    ],
    related: ["transcribe-audio-without-uploading", "edit-confidential-pdf-locally", "merge-pdfs-without-uploading"],
    tags: ["gdpr", "privacy", "conversion", "client files", "local"],
  },
  {
    slug: "compress-video-without-installing-software",
    group: "Privacy & Limits",
    problem: "Compress a video without installing software",
    label: "Compress video, no install",
    seoTitle: "Compress a Video Without Installing Anything (Browser, Free)",
    seoDescription:
      "Real H.264 re-encoding with ffmpeg compiled to WebAssembly - in the browser tab, no HandBrake, no signup, no upload. Locked-down work laptops welcome.",
    keywords: [
      "compress video without installing software",
      "compress video in browser",
      "video compressor no download",
      "compress mp4 online no upload",
    ],
    icon: "MonitorDown",
    accent: "amber",
    answer:
      "Your browser can run a real video encoder: GigAI's compressor is ffmpeg compiled to WebAssembly, re-encoding to H.264 (CRF 23) in the tab. Nothing installs, nothing uploads - which also means it works on locked-down work laptops where HandBrake isn't an option.",
    intro:
      "No admin rights, no installer, no upload - the encoder comes to the tab instead.",
    primaryTool: "video-compressor",
    tools: ["video-compressor", "video-resizer", "gigai-fit", "video-trimmer"],
    steps: [
      { title: "Drop the video", description: "The ~31 MB encoder loads once into the tab. Your file stays put." },
      { title: "Compress", description: "Full H.264 re-encode at CRF 23 - the same mechanism desktop tools use, honestly slower than native." },
      { title: "Need an exact number? Use Fit", description: "“Under 25 MB for Gmail” is GigAI Fit's job - it searches quality levels until the file fits." },
    ],
    mistakes: [
      "Compressing an already-compressed download and expecting big savings - re-encoding efficient sources can even grow them slightly.",
      "Using 'online video compressors' that upload to process: the upload often takes longer than local encoding would have.",
    ],
    faq: [
      { question: "How can a browser run ffmpeg?", answer: "WebAssembly - ffmpeg's C code compiled to run in the page at near-native speed. The engine downloads once (~31 MB), caches, and processes your video on your CPU." },
      { question: "Is it slower than desktop HandBrake?", answer: "Yes, honestly - expect roughly 2-4x slower than native for the same settings. The trade is zero install, zero upload, works anywhere including managed machines." },
      { question: "What about very large files?", answer: "Multi-GB videos are bounded by browser memory. For an hour of 4K, desktop software remains the right tool - we'd rather say so than fail at 80%." },
    ],
    related: ["compress-video-for-whatsapp", "trim-a-video", "gdpr-safe-file-conversion"],
    tags: ["video", "compress", "no install", "ffmpeg", "browser"],
    fileTypes: ["mp4", "webm", "mov"],
  },
  {
    slug: "qr-code-without-tracking",
    group: "Privacy & Limits",
    problem: "Make a QR code that doesn't track people or expire",
    label: "QR without tracking",
    seoTitle: "QR Codes That Never Track or Expire (Static, Free, Yours)",
    seoDescription:
      "Static QR codes encode your URL directly in the pattern - no redirect service, no scan tracking, no expiry, no subscription hostage. Generated in your browser.",
    keywords: [
      "qr code without tracking",
      "qr code that doesn't expire",
      "static qr code free",
      "qr code no subscription",
      "qr code generator no signup",
    ],
    icon: "QrCode",
    accent: "rose",
    answer:
      "A static QR code encodes your URL directly in the pattern itself - scanning goes straight to your destination with no redirect server in between. That means nothing to track scans, nothing to expire, and no subscription that can hold your printed codes hostage. GigAI generates exactly these, in your browser.",
    intro:
      "“Your QR codes have been deactivated” is a sentence static codes make impossible.",
    primaryTool: "qr-code-generator",
    tools: ["qr-code-generator", "wifi-qr-code-generator", "qr-code-scanner"],
    steps: [
      { title: "Enter the destination", description: "The URL is encoded into the module pattern itself - verify by scanning before you print." },
      { title: "Style and brand it", description: "Colors, dot shapes and a centre logo, rendered locally with qr-code-styling." },
      { title: "Export print-ready files", description: "PNG for screens, SVG or PDF for print - the code is yours, forever, with no account attached." },
    ],
    mistakes: [
      "Using a 'free trial' dynamic QR service for printed material - when the trial ends, the redirect dies and every printed code with it.",
      "Not test-scanning at print size: tiny codes with logos need higher error correction.",
    ],
    faq: [
      { question: "What's the difference between static and dynamic QR codes?", answer: "Static encodes the destination in the pattern - permanent, unchangeable, untracked. Dynamic encodes a redirect URL owned by a service, which enables scan counting and later edits but adds tracking, an expiry risk, and usually a subscription. For print, static is the safe default." },
      { question: "Can I count scans without tracking people?", answer: "Add a UTM parameter to the destination URL and read your own site analytics - you see totals in your data without a QR middleman profiling scanners." },
      { question: "Does the generator phone home?", answer: "No - codes render in your browser with qr-code-styling. The destination never leaves the page until someone scans the printed code." },
    ],
    related: ["qr-code-for-a-link", "qr-code-for-wifi", "pdf-tools-without-account-or-limits"],
    tags: ["qr", "tracking", "static", "privacy", "no signup"],
  },

  /* ── AI visibility (GEO Studio) ───────────────────────────────────────────
     Problem-phrased entries for the questions people actually type when their
     site is missing from AI answers. Each one routes to a GEO tool that gives
     evidence rather than a verdict, and the order of the steps is deliberate:
     access, then rendering, then content. Polishing content on a page crawlers
     cannot read is wasted work, so no entry here recommends it first. ─────── */
  {
    slug: "ai-cannot-see-my-website",
    group: "Web & SEO",
    problem: "ChatGPT and other AI tools can't see my website",
    label: "AI can't see my site",
    seoTitle: "ChatGPT Can't See My Website: How to Check and Fix It Free",
    seoDescription:
      "Find out why AI tools can't read your site: a robots.txt rule blocking GPTBot, Cloudflare blocking AI crawlers by default, or content that only exists after JavaScript. Free checks, in your browser.",
    keywords: [
      "chatgpt can't see my website",
      "why doesn't chatgpt know my site",
      "ai can't read my website",
      "is my site blocked from ai",
      "gptbot blocked",
    ],
    icon: "Bot",
    accent: "amber",
    answer:
      "There are three usual causes, in this order. A robots.txt rule blocks the AI crawler, your CDN blocks AI bots at the firewall (Cloudflare now does this by default on new zones, regardless of robots.txt), or your content only exists after JavaScript runs, which most AI crawlers never do. Check crawler access first, then rendering.",
    intro:
      "Work through the three causes in order. Access first, rendering second, content last, because fixing content on a page crawlers can't reach changes nothing.",
    primaryTool: "geo-audit",
    tools: ["geo-audit", "ai-crawler-access-checker", "js-rendering-checker", "ai-crawler-log-analyzer", "ai-robots-txt-generator"],
    steps: [
      { title: "Run a full audit", description: "Enter your URL in the GEO Audit. It checks crawler access, rendering, content and schema in one pass and orders the findings worst-first." },
      { title: "Check crawler access", description: "The AI Crawler Access Checker gives a verdict for each AI crawler token and quotes the exact robots.txt line that decided it." },
      { title: "Check for CDN blocking", description: "If you're behind Cloudflare, open Security then Bots in the dashboard. The AI-bots setting blocks crawlers before robots.txt is ever read." },
      { title: "Check rendering", description: "The JS Rendering Checker counts how many words survive without JavaScript. If the number is small, your content is invisible to AI crawlers." },
      { title: "Confirm with your logs", description: "Drop a server access log into the Log Analyzer. It's the only authoritative record of which crawlers actually arrived." },
    ],
    mistakes: [
      "Assuming a permissive robots.txt is enough. A CDN or firewall can reject AI crawlers before your file is read, and nothing in robots.txt reveals that.",
      "Blocking every OpenAI bot to opt out of training. GPTBot trains models, but OAI-SearchBot and ChatGPT-User are what put you in ChatGPT's answers and send traffic.",
      "Trusting analytics to show bot visits. Crawlers don't run JavaScript, so tools like GA4 can't see them. Only server logs can.",
      "Rewriting content first. If crawlers can't reach or read the page, better copy changes nothing.",
    ],
    faq: [
      { question: "Why doesn't ChatGPT know about my website?", answer: "Usually one of three things: a robots.txt rule blocking the relevant OpenAI bot, a CDN blocking AI crawlers at the network edge, or content that only appears after JavaScript runs. Check them in that order, because each one makes the next irrelevant." },
      { question: "Is Cloudflare blocking AI crawlers on my site?", answer: "Possibly without you doing anything. Cloudflare now blocks AI crawlers by default on newer zones and can inject its own robots.txt rules above yours. The setting lives in the dashboard under Security then Bots, robots.txt alone won't tell you." },
      { question: "How do I know whether AI crawlers actually visit?", answer: "Check your server's access log for their user-agent strings. It's the only complete record, because bots don't execute the JavaScript that analytics depends on." },
    ],
    related: ["are-ai-crawlers-visiting-my-site", "make-content-ai-citable", "should-i-block-ai-crawlers"],
    tags: ["ai", "geo", "crawling", "robots", "chatgpt", "visibility"],
    fileTypes: ["txt", "html"],
  },
  {
    slug: "are-ai-crawlers-visiting-my-site",
    group: "Web & SEO",
    problem: "I don't know whether AI crawlers are actually visiting my site",
    label: "Are AI bots visiting?",
    seoTitle: "Are AI Crawlers Visiting Your Site? Check Your Server Logs Free",
    seoDescription:
      "Find out which AI crawlers actually visit: per-bot hits, last seen, top pages and status codes, parsed from your access log in your browser. Logs contain visitor IPs, so nothing is uploaded.",
    keywords: [
      "are ai crawlers visiting my site",
      "gptbot in server logs",
      "check ai bot traffic",
      "ai crawler log analysis",
      "claudebot server logs",
    ],
    icon: "ScrollText",
    accent: "sky",
    answer:
      "Your server's access log is the only authoritative record, because AI crawlers don't run JavaScript and are therefore invisible to analytics tools like GA4. Export an nginx or Apache log and search it for crawler user-agents, or parse it in your browser to get per-bot visit counts, last-seen dates and the pages each one fetched.",
    intro:
      "Allowing a crawler in robots.txt is permission, not proof. Only your logs show whether the crawlers came.",
    primaryTool: "ai-crawler-log-analyzer",
    tools: ["ai-crawler-log-analyzer", "ai-crawler-access-checker", "geo-audit", "ai-robots-txt-generator"],
    steps: [
      { title: "Export an access log", description: "Usually /var/log/nginx/access.log or /var/log/apache2/access.log. Gunzip rotated files first. About a month of data gives a useful trend." },
      { title: "Parse it locally", description: "Drop the file into the Log Analyzer. It runs in your browser and discards the IP column as it reads, because logs contain visitor IP addresses." },
      { title: "Read the per-bot cards", description: "Each crawler shows request counts, first and last seen, most-fetched pages, status codes and a daily trend." },
      { title: "Check the status codes", description: "A bot receiving 403s is being turned away rather than served. A high hit count with a low success rate is worse than no visits." },
      { title: "Find the never-fetched pages", description: "Paste your sitemap URLs to list the pages no AI crawler has ever touched, which is usually the most actionable output." },
    ],
    mistakes: [
      "Using analytics to measure bot traffic. Bots don't run JavaScript, so GA4 and similar tools are structurally blind to them.",
      "Uploading raw logs to an online analyzer. Access logs contain your visitors' IP addresses, which is personal data. Parse them locally instead.",
      "Reading zero hits as proof of blocking. If you use a CDN, crawler requests may be served from edge cache and never reach your origin log at all.",
      "Trusting the user-agent for security decisions. Anyone can send any user-agent. Verify with reverse DNS against the operator's published ranges if it matters.",
    ],
    faq: [
      { question: "How do I check if GPTBot visited my site?", answer: "Search your server access log for the string GPTBot, or parse the whole log and read the per-bot breakdown. Analytics tools cannot show this, because crawlers don't execute their JavaScript." },
      { question: "What does it mean if no AI crawlers appear?", answer: "Either the log window predates AI crawling of your site, something is blocking them (robots.txt or a CDN firewall setting), or a CDN is serving them from cache so requests never reach your origin." },
      { question: "Is it safe to analyze my logs online?", answer: "Only if the parsing happens in your browser. Access logs contain visitor IP addresses, so uploading one to a third-party service discloses your visitors' personal data to that service." },
    ],
    related: ["ai-cannot-see-my-website", "should-i-block-ai-crawlers", "make-content-ai-citable"],
    tags: ["ai", "geo", "logs", "crawling", "privacy", "analytics"],
    fileTypes: ["log", "txt"],
  },
  {
    slug: "make-content-ai-citable",
    group: "Web & SEO",
    problem: "AI tools can read my page but never quote it",
    label: "Make content AI-citable",
    seoTitle: "How to Make Your Content Quotable by AI: Free Citability Check",
    seoDescription:
      "Score your content on the factors a published study measured as increasing AI citation: fact density, sources, quotability, answer-first openings and self-contained sections. Every formula shown.",
    keywords: [
      "make content ai citable",
      "get cited by chatgpt",
      "ai citation optimization",
      "content quotability",
      "geo content optimization",
    ],
    icon: "Quote",
    accent: "emerald",
    answer:
      "Give the model something specific it can lift. A 2024 study (Aggarwal et al., KDD) tested content edits across 10,000 queries and found adding statistics, quotable statements and cited sources produced the largest visibility gains. Then make each section survive alone, because retrieval hands the model one fragment at a time, not your whole page.",
    intro:
      "Being readable isn't the same as being quotable. These checks measure whether there's anything on the page a model could safely repeat.",
    primaryTool: "content-citability-scorer",
    tools: ["content-citability-scorer", "retrieval-chunk-preview", "answer-snippet-checker", "geo-audit", "ai-schema-checker"],
    steps: [
      { title: "Score the content", description: "The Citability Scorer rates six factors and prints the formula and counted inputs for each, so you can see exactly which one is dragging the score down." },
      { title: "Add concrete facts", description: "Replace confident adjectives with measurements, dates, percentages and results. Fact density is the highest-weighted factor for a reason." },
      { title: "Cite your sources", description: "Link outward to specs, standards and primary data. The study measured citing sources as a top-two improvement, and outbound links cost you nothing." },
      { title: "Make every section answer first", description: "The Answer Snippet Checker judges each section's opening against a 40-word self-contained standard and gives a rewrite target for each failure." },
      { title: "Check the fragments survive", description: "The Chunk Preview shows each retrieval chunk in isolation and flags the ones that collapse without their surroundings." },
    ],
    mistakes: [
      "Writing sentences that only work in context. A paragraph opening with 'It also supports…' is clear on your page and meaningless once retrieved alone.",
      "Using phrases like 'as mentioned above'. A retrieved fragment has no above, so the sentence becomes unusable.",
      "Burying the answer under a warm-up paragraph. Retrieval judges a passage largely on how it opens.",
      "Trusting a score with no stated method. If a tool won't show its arithmetic, you can't tell what to fix or whether it's right.",
    ],
    faq: [
      { question: "What makes content more likely to be cited by AI?", answer: "The published evidence points at three things: concrete statistics, self-contained quotable statements, and cited sources. Structurally, it also helps to open each section with a direct answer and to keep sections readable on their own." },
      { question: "Why does my well-ranked page never get quoted?", answer: "Ranking rewards relevance and authority. Quoting requires a specific claim a model can safely repeat. Pages full of hedged generalities rank fine and give a model nothing liftable." },
      { question: "How long should an answer be?", answer: "Aim to answer completely within about 40 words, then elaborate underneath. That's roughly the length a generative engine or featured snippet reproduces in full." },
    ],
    related: ["ai-cannot-see-my-website", "are-ai-crawlers-visiting-my-site", "audit-page-seo"],
    tags: ["ai", "geo", "content", "citation", "writing", "seo"],
    fileTypes: ["html", "md", "txt"],
  },
  {
    slug: "should-i-block-ai-crawlers",
    group: "Web & SEO",
    problem: "I don't know whether to allow or block AI crawlers",
    label: "Allow or block AI bots?",
    seoTitle: "Should You Block AI Crawlers? What Each Choice Actually Costs",
    seoDescription:
      "Blocking AI training bots is a real choice. Blocking AI search bots costs you citations and traffic. See what each crawler does and generate a correct robots.txt policy, free.",
    keywords: [
      "should i block ai crawlers",
      "block ai training bots",
      "opt out of ai training",
      "allow ai crawlers robots.txt",
      "block gptbot or not",
    ],
    icon: "FileCog",
    accent: "amber",
    answer:
      "Decide per bot, not per company, because the three jobs have different costs. Blocking a training crawler like GPTBot or ClaudeBot keeps your content out of future models. Blocking a search crawler like OAI-SearchBot, PerplexityBot or Bingbot removes you from AI answers that cite and link you, which is direct lost traffic.",
    intro:
      "There's no universally right answer on training, but there is a wrong one: blocking the search bots by accident while trying to block training.",
    primaryTool: "ai-robots-txt-generator",
    tools: ["ai-robots-txt-generator", "ai-crawler-access-checker", "ai-crawler-log-analyzer", "geo-audit"],
    steps: [
      { title: "See what you block today", description: "Run the Access Checker on your live robots.txt. Many sites are blocking crawlers from a copy-pasted template nobody chose deliberately." },
      { title: "Separate training from search", description: "Training bots build future models. Search bots build the indexes AI answers cite from. User-fetch bots read a link someone shared. They are separate decisions." },
      { title: "Pick a policy", description: "The common deliberate choice is to block training while keeping every search and user-fetch bot allowed, so you stay citable without feeding model training." },
      { title: "Generate the rules", description: "The AI Robots.txt Generator emits a correct group per bot and shows the concrete cost of each block before you ship it." },
      { title: "Deploy and re-check", description: "Put the file at your domain root, then re-run the Access Checker on the live URL to confirm a CDN hasn't rewritten it." },
    ],
    mistakes: [
      "Blocking Googlebot or Bingbot to 'block AI'. That removes you from ordinary search, and Bing's index also powers ChatGPT Search.",
      "Assuming Google-Extended is a crawler. It's a control token for Gemini training and grounding. Blocking it does not affect your Google Search rankings.",
      "Expecting robots.txt to undo the past. It governs future crawling only and cannot remove content from a model already trained on it.",
      "Forgetting subdomains. robots.txt is per-host, so a policy on your main domain does nothing for blog.example.com.",
    ],
    faq: [
      { question: "Should I block AI crawlers?", answer: "Blocking training bots is a legitimate content-control choice with a real cost: future models won't know your brand. Blocking search and user-fetch bots is much more expensive, because those are what cite and link you in AI answers." },
      { question: "Will blocking AI bots hurt my Google rankings?", answer: "No, as long as you don't block Googlebot itself. GPTBot, ClaudeBot, CCBot and similar have nothing to do with Google Search, and Google states that blocking Google-Extended does not affect ranking or inclusion in AI Overviews." },
      { question: "Do AI companies respect robots.txt?", answer: "The major operators document compliance and server-log studies generally support it. Bytespider is the documented exception. For a bot acting in bad faith you need firewall or CDN enforcement, not a text file." },
    ],
    related: ["ai-cannot-see-my-website", "are-ai-crawlers-visiting-my-site", "create-robots-txt"],
    tags: ["ai", "geo", "robots", "crawling", "policy", "training"],
    fileTypes: ["txt"],
  },
];

/* ── Pure helpers (no registry import, client-safe) ───────────────────────── */

/** Look up a problem by slug. */
export function getProblemBySlug(slug: string): ProblemSolution | undefined {
  return PROBLEMS.find((p) => p.slug === slug);
}

/** All problems, in declaration order. */
export function getAllProblems(): ProblemSolution[] {
  return PROBLEMS;
}

/** Problems grouped by their `group`, in `PROBLEM_GROUPS` order (empty groups dropped). */
export function getProblemsByGroup(): { group: ProblemGroup; problems: ProblemSolution[] }[] {
  return PROBLEM_GROUPS.map((group) => ({
    group,
    problems: PROBLEMS.filter((p) => p.group === group),
  })).filter((g) => g.problems.length > 0);
}

/** Resolve a problem's `related` slugs to full problems (dropping any misses). */
export function getRelatedProblems(problem: ProblemSolution): ProblemSolution[] {
  return problem.related
    .map((slug) => getProblemBySlug(slug))
    .filter((p): p is ProblemSolution => Boolean(p));
}

/**
 * Curated problems featured on the homepage: a broad, high-demand spread
 * across categories so the "What's your problem?" section speaks to the widest
 * range of visitors. Order here is the display order.
 */
export const FEATURED_PROBLEM_SLUGS = [
  "pdf-too-large",
  "image-too-large",
  "passport-size-photo",
  "qr-code-for-wifi",
  "convert-mov-to-mp4",
] as const;

/** Resolve the curated homepage problems (silently drops any missing slug). */
export function getFeaturedProblems(): ProblemSolution[] {
  return FEATURED_PROBLEM_SLUGS.map((slug) => getProblemBySlug(slug)).filter(
    (p): p is ProblemSolution => Boolean(p),
  );
}
