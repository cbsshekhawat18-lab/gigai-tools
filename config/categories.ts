import type { Category } from "@/types";

/**
 * Tool categories. Category pages (/category/[slug]) are generated from this
 * list, and each auto-lists its tools from the registry (config/tools.ts).
 * `icon` is a lucide-react name; `accent` maps to lib/design ACCENT_STYLES.
 */
export const CATEGORIES: Category[] = [
  {
    /**
     * File Intelligence, the home for the flagship experiences that work on a
     * file rather than performing one fixed conversion on it. GigAI Fit lives
     * here; GigAI Verify joins it.
     *
     * These are deliberately NOT filed under image/pdf/video, because the whole
     * point is that the user doesn't have to know which of those their file is.
     */
    slug: "file-intelligence",
    name: "File Intelligence",
    description:
      "Flagship GigAI experiences that work out what your file is and what to do with it: starting with hitting an exact size.",
    icon: "Sparkles",
    accent: "violet",
    featured: true,
    longDescription:
      "Most tools ask you to know the answer before you start: which format, which quality, which codec. File Intelligence is the opposite. You bring a file and say what you need, and GigAI works out the route. It identifies what the file actually is from its bytes rather than its extension, picks the existing GigAI engine built for that kind of file, and drives it towards your goal, showing every step and every trade-off it made along the way.",
    intro:
      "Bring a file and say what you want. GigAI identifies it, routes it to the right engine, and shows exactly what it did: all in your browser, with nothing uploaded.",
    popularSlugs: ["gigai-fit", "gigai-verify", "icon-lab"],
    relatedCategories: ["image-tools", "pdf-tools"],
    seo: {
      title: "GigAI File Intelligence: Smart File Tools That Pick the Method",
      description:
        "Flagship GigAI experiences that identify your file and choose the right approach automatically. Private, in-browser, nothing uploaded.",
    },
  },
  {
    slug: "image-tools",
    name: "Image Studio",
    description:
      "Get every image ready for the web, social and upload forms: compress, convert, resize, crop and edit right in your browser, nothing uploaded.",
    icon: "Image",
    accent: "sky",
    featured: true,
    longDescription:
      "A full image toolkit that covers the whole workflow, not a single trick. Shrink a photo to hit an exact file-size or upload limit, convert between JPG, PNG, WebP, HEIC and GIF, resize or crop to precise dimensions for a profile picture, thumbnail or print, upscale a small image, and strip hidden EXIF metadata before you share. Every operation runs on your own device using best-in-class codecs (MozJPEG, libwebp, OxiPNG and Lanczos resampling) so quality stays high and your originals never leave your computer.",
    intro:
      "Drop an image straight in. No account, no upload, no watermark. Because the processing happens in your browser, even sensitive photos (IDs, receipts, screenshots) stay private, and there's no server-imposed file-size cap. Pick a tool, tune the settings, and download the result in a couple of seconds.",
    popularSlugs: [
      "image-compressor",
      "image-resizer",
      "crop-image",
      "png-to-jpg",
      "webp-converter",
      "image-upscaler",
    ],
    relatedCategories: ["pdf-tools", "svg-tools"],
    seo: {
      title: "Free Image Tools: Compress, Convert, Resize & Edit",
      description:
        "A complete set of free online image tools: compress, convert, resize, crop and more. Fast, private, no sign-up.",
    },
    faq: [
      {
        question: "How do I reduce an image's file size without wrecking the quality?",
        answer:
          "Use the image compressor and let it re-encode the photo with a modern codec (MozJPEG for JPG, libwebp for WebP). These squeeze out far more redundancy than a plain 'save' does, so you can often cut a file by 60–80% with no visible difference. If you need to hit a specific limit, say under 2 MB for an upload form, compress toward a target size and preview the result before you download. WebP typically gives the smallest file at a given quality. Keep JPG when you need the widest compatibility.",
      },
      {
        question: "Which format should I use, JPG, PNG or WebP?",
        answer:
          "Use JPG for photographs where small size matters and you don't need transparency. Use PNG for graphics, logos, screenshots and anything with sharp edges or a transparent background. Use WebP when you control where the image is shown (your own site or app) and want the best quality-to-size ratio. It beats both, but a few older tools still don't read it. You can convert freely between all three here without re-shooting or re-exporting from a design app.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Every image tool here runs entirely in your browser using JavaScript and WebAssembly, so your photos are processed on your own device and never uploaded, logged or stored. That makes it safe to compress or crop sensitive images like IDs, medical scans or receipts: nothing leaves your computer.",
      },
      {
        question: "What's the right way to resize an image for social media or a profile photo?",
        answer:
          "Resize to the platform's recommended pixel dimensions rather than guessing, then let the tool downscale with high-quality Lanczos resampling so the result stays sharp. For a square profile photo, crop to a 1:1 ratio first, then resize. Avoid upscaling a small source to fit a large slot: enlarging invents detail that isn't there. Start from the highest-resolution original you have.",
      },
      {
        question: "Does compressing or converting an image remove its hidden metadata?",
        answer:
          "Re-encoding usually drops most EXIF data (including GPS location) as a side effect, but don't rely on that if privacy matters. Use the dedicated metadata remover to strip EXIF, GPS and camera details deliberately before you post a photo publicly, it's the reliable way to make sure a screenshot or holiday snap isn't quietly broadcasting where it was taken.",
      },
      {
        question: "Can I sharpen or enlarge a small, blurry image?",
        answer:
          "The image upscaler can enlarge a small picture and reconstruct plausible detail, which helps with low-resolution logos or thumbnails. It works best on clean sources. A heavily compressed or motion-blurred photo has less to recover. For print, aim to start at the true resolution you need rather than upscaling as a last resort.",
      },
    ],
  },
  {
    slug: "pdf-tools",
    name: "PDF Studio",
    description:
      "Every tool you need to work with PDFs, in one place, merge, split, compress, convert, edit, sign and protect, all privately in your browser.",
    icon: "FileText",
    accent: "rose",
    featured: true,
    longDescription:
      "Every PDF job, in one place, organized the way you actually work: organize, optimize, convert in, convert out, edit, secure. Merge several files into one and split a big one into pieces. Delete, reorder and rotate pages, or rearrange a whole document visually. Compress a heavy file to clear an email limit, and run OCR so a scan becomes searchable text. Convert into PDF from Word, PowerPoint, Excel, images, HTML, Markdown, plain text and EPUB, and back out again to Word, PowerPoint, Excel, images, HTML and text. Edit text on the page, add page numbers, stamp a watermark and clean up the metadata. Then sign it, password-protect it, unlock one you already have, diff two revisions line by line, or check a redaction actually removed the text underneath rather than just drawing a black box over it. It is the toolkit you would normally pay a desktop suite for, free, no watermarks, no page limits and no account.",
    intro:
      "Your documents never touch a server. Pages are read, rearranged and rewritten on your own device, so contracts, statements, invoices and IDs stay private. You can disconnect from the network and most of these still work. Open a tool, drop your PDF, and download the finished file in seconds. No account, no watermark, no page limit.",
    popularSlugs: [
      "merge-pdf",
      "split-pdf",
      "compress-pdf",
      "pdf-to-word",
      "pdf-editor",
      "jpg-to-pdf",
    ],
    relatedCategories: ["document-tools", "image-tools"],
    seo: {
      title: "Free PDF Tools: Every PDF Tool in One Place",
      description:
        "Merge, split, compress, convert, edit, sign and protect PDFs online free. 32 tools, all running in your browser, nothing uploaded, no watermarks, no sign-up.",
    },
    faq: [
      {
        question: "Are my PDF files uploaded anywhere?",
        answer:
          "No. Every tool in the PDF Studio runs entirely in your browser: merge, split, compress, rotate, reorder, delete pages, convert in and out, edit, sign, protect, unlock and compare. Your file is read and rewritten on your own device and never reaches a server, so there is nothing stored, nothing logged and nothing to delete afterwards. The simplest way to prove it is to disconnect from the network and use a tool anyway. It still works. Each tool page also states plainly how it runs.",
      },
      {
        question: "How do I make a PDF smaller so it will attach to an email?",
        answer:
          "Use the PDF compressor. It re-processes the file's fonts, images and structure to cut the size, often dramatically for scan-heavy or image-heavy documents, while keeping the text readable. If you're up against a hard limit like 10 MB or 25 MB, compress and check the resulting size before sending. For very large scans, converting pages to a lower-DPI image first can help.",
      },
      {
        question: "Can I edit the actual text in an existing PDF?",
        answer:
          "Yes. The PDF editor lets you click a word to change it, or use find-and-replace to swap text across the document (whiteout-and-retype), as well as add new text and signatures. PDFs weren't designed as editable documents, so heavily-formatted layouts have limits. For a full rewrite, convert to Word, edit there, and convert back.",
      },
      {
        question: "How do I combine several PDFs (or images) into one file?",
        answer:
          "Use Merge PDF to drag multiple PDFs into a single document in the order you choose. To turn photos or scans into a PDF, use JPG to PDF, which places each image on its own page. Both run locally, so even confidential paperwork stays on your device.",
      },
      {
        question: "How do I password-protect a PDF, or open one that's locked?",
        answer:
          "Use PDF Password Protect to add AES encryption and a password before you share a sensitive document, and Unlock PDF to remove a password you already know from a file you own. Both operate in your browser and never transmit the password or the document. Please only unlock files you have the right to access.",
      },
      {
        question: "Can I convert a PDF to Word and keep the formatting?",
        answer:
          "PDF to Word reconstructs the text into an editable.docx and preserves layout as faithfully as the source allows. Clean, text-based PDFs convert very well. Complex multi-column designs or scanned pages are harder, for a scan, run OCR first so the text becomes selectable. The conversion is ephemeral: your file is processed and then removed, never kept.",
      },
    ],
  },
  {
    slug: "document-tools",
    name: "Document Studio",
    description:
      "Reshape and read the data formats work actually arrives in (CSV, Excel, JSON, EPUB and RTF) with a real desktop-app feel, entirely in your browser.",
    icon: "FileStack",
    accent: "cyan",
    featured: true,
    longDescription:
      "A focused workbench for spreadsheets, delimited data and the document formats that are awkward to open. Turn a messy CSV into clean JSON and back again, lift a table straight out of an Excel workbook, fix a broken export in a real spreadsheet editor, or just open and read an EPUB, RTF or document you have no app for. Each tool is a workspace with drag-and-drop input, a live preview and one-click export. Not a form that emails you a file ten minutes later. Working with PDFs instead? Every PDF tool now lives together in the PDF Studio.",
    intro:
      "Data arrives in whatever format the last system happened to emit: the CSV with the wrong delimiter, the workbook you need as JSON, the EPUB you have no reader for. These tools give you a fast, private workbench to reshape and read that content on the spot. Drop a file in, watch it transform, copy or download the result, and move on.",
    learningCenter: {
      eyebrow: "Learn",
      title: "Working with documents the reliable way",
      description:
        "The practical rules behind every tool here, so your conversions stay faithful and your data survives the round-trip.",
      lessons: [
        {
          icon: "Table2",
          title: "Know your delimiter before you parse",
          description:
            "A 'CSV' that's actually semicolon- or tab-separated, or one with quoted fields containing commas, is the number-one cause of a mangled import. A robust parser detects the delimiter, respects quoting and handles embedded newlines, so a single stray comma in an address doesn't shift every column.",
        },
        {
          icon: "FileJson",
          title: "Match the shape to the consumer",
          description:
            "The same table can become an array of row-objects, a columnar structure or nested records. Pick the JSON shape your API or app expects up front. Reshaping downstream is far more error-prone than choosing correctly at conversion time.",
        },
        {
          icon: "FileType",
          title: "Check the encoding before you blame the data",
          description:
            "Names with accents arriving as mojibake almost always means a UTF-8 file was read as Latin-1, or the reverse. It looks like corrupted data and is really a labelling problem, re-open with the right encoding and the rows are perfectly intact.",
        },
        {
          icon: "GitCompareArrows",
          title: "Diff at the right granularity",
          description:
            "Comparing documents line by line catches moved paragraphs. Comparing word by word catches a single edited figure. Choose the granularity that matches what you're checking so real changes stand out instead of drowning in reflowed whitespace.",
        },
        {
          icon: "FileText",
          title: "Some conversions are lossy: plan for it",
          description:
            "Markdown, CSV and plain text carry no page layout, so rendering them to PDF means the tool decides typography and pagination. Rich formats like PowerPoint or a heavily-styled PDF can't be perfectly rebuilt in the browser. Expect a faithful best-effort, and keep your original for anything pixel-critical.",
        },
        {
          icon: "ShieldCheck",
          title: "Sensitive files never need to leave your device",
          description:
            "Contracts, exports and financial spreadsheets are exactly the documents you shouldn't upload to a random converter. Everything here runs locally in your browser tab, so the file you drop in is processed on your machine and nowhere else.",
        },
      ],
    },
    popularSlugs: [
      "csv-to-json",
      "csv-editor",
      "csv-to-excel",
      "excel-to-csv",
      "json-to-csv",
      "csv-viewer",
    ],
    relatedCategories: ["pdf-tools", "developer-tools"],
    seo: {
      title: "Free CSV, Excel & Document Tools, Convert, Edit & View",
      description:
        "Convert CSV↔JSON, CSV↔Excel, edit spreadsheets and open EPUB, RTF and other documents in your browser. Private, in-browser, no sign-up or watermarks.",
    },
    faq: [
      {
        question: "Which document formats can these tools handle?",
        answer:
          "The studio focuses on the text-based and tabular formats that dominate everyday work: CSV and other delimited data, JSON, Excel spreadsheets (.xlsx), Markdown, plain text, HTML and PDF. You can move between many of them (CSV to JSON, Excel to PDF, Markdown to PDF, PDF to text) and edit or compare them directly. Highly proprietary or heavily-designed formats (like PowerPoint decks) are handled on a best-effort basis where a faithful in-browser conversion is genuinely possible, and clearly flagged where it isn't.",
      },
      {
        question: "Are my documents uploaded to a server?",
        answer:
          "No. Every conversion, comparison, edit and extraction runs entirely in your browser using JavaScript: the file you drop in is read and processed on your own device and never transmitted, logged or stored. That makes the tools safe for the exact documents you'd never want to hand to a random online converter: contracts, payroll spreadsheets, client exports and internal reports.",
      },
      {
        question: "Where did the PDF tools go?",
        answer:
          "They now live together in the PDF Studio. They used to be split across two categories, which meant that finding \"every tool for working with PDFs\" involved knowing which of two pages to look on. Merging, splitting, compressing, converting to and from PDF, editing, signing and protecting are all in one place now, grouped by the job you're doing. Everything here is the data and viewer side: spreadsheets, delimited files, JSON and the formats you just need to open.",
      },
      {
        question: "Why did my leading zeros or long numbers change?",
        answer:
          "Because a spreadsheet guesses types. Open a CSV of postcodes, product codes or 16-digit references in Excel and it will helpfully read them as numbers, dropping leading zeros and rewriting anything long into scientific notation, and once saved, the original values are gone. Inspect and convert delimited files with a tool that treats every field as text, and only bring them into a spreadsheet once the columns are typed the way you intend.",
      },
      {
        question: "What's the difference between CSV, TSV and Excel?",
        answer:
          "CSV and TSV are plain text: rows separated by newlines, fields separated by a comma or a tab. They carry data and nothing else (no formulas, no formatting, no multiple sheets) which is exactly why they travel between systems so reliably. An.xlsx workbook is a compressed bundle that carries all of that, which makes it richer but far less portable. Convert to CSV when something else has to read your data, and keep the workbook when the formulas and layout are the point.",
      },
      {
        question: "How large a file can I process in the browser?",
        answer:
          "Since everything runs client-side, the practical ceiling is your device's memory rather than a server quota, modern laptops comfortably handle spreadsheets and text files well into the tens of megabytes. Very large workbooks or long PDFs may briefly pause the tab while they process, and extremely large files can strain low-memory devices, but for the vast majority of everyday documents performance is instant.",
      },
      {
        question: "Are these document tools free, and do they add watermarks?",
        answer:
          "Every tool is completely free with no account, no trial and no usage cap, and nothing is watermarked, locked behind a paywall or degraded to push an upgrade. Because the processing happens on your device, there's no per-file cost to us and therefore none to you, and the tools keep working offline once the page has loaded.",
      },
    ],
  },
  {
    slug: "developer-tools",
    name: "Developer Studio",
    description:
      "Ship cleaner code faster: format, validate, encode, decode and generate with the utilities of everyday development work.",
    icon: "CodeXml",
    accent: "violet",
    featured: true,
    longDescription:
      "A fast, no-nonsense developer toolbox for the small jobs that interrupt your flow all day: prettifying a minified JSON blob, decoding a JWT to check its claims, encoding a value to Base64, testing a regex against real input or minting a UUID. Every tool runs entirely in your browser using the same platform primitives your app already ships with, so there's nothing to install, no rate limit and no waiting on a round-trip.",
    intro:
      "Whether you're debugging an API response, wiring up a webhook or reverse-engineering a payload, these tools give you an instant, distraction-free workspace. Paste in, transform, copy out, then get back to the code that actually matters.",
    popularSlugs: [
      "json-formatter",
      "base64-encoder",
      "jwt-decoder",
      "uuid-generator",
      "hash-generator",
      "regex-tester",
    ],
    relatedCategories: ["image-tools", "pdf-tools"],
    seo: {
      title: "Free Developer Tools, Formatters, Encoders & Generators",
      description:
        "Handy online developer tools: JSON formatter, base64, JWT, regex, hash and more. Free and instant.",
    },
    faq: [
      {
        question: "Are these developer tools really free?",
        answer:
          "Yes. Every tool here is completely free, with no account, no trial and no usage limits. There are no watermarks, no locked features behind a paywall and no 'pro' tier. You can use them as often as you like.",
      },
      {
        question: "Is my data sent to a server?",
        answer:
          "No. These tools run 100% in your browser using JavaScript and the Web Crypto API. Your JSON, tokens, secrets and text never leave your device and are never uploaded, logged or stored, which makes them safe to use even with sensitive payloads.",
      },
      {
        question: "Is it safe to paste a JWT or a production API response here?",
        answer:
          "It is. Because all processing happens locally in your browser tab, nothing you paste is transmitted anywhere. That said, for genuinely secret credentials we still recommend rotating anything you've shared broadly, good hygiene regardless of the tool.",
      },
      {
        question: "Do the tools work offline?",
        answer:
          "Once the page has loaded, most operations run without a network connection because the logic executes on your machine. You can format JSON, decode tokens or generate UUIDs on a flaky connection or a plane.",
      },
      {
        question: "How large a payload can I process?",
        answer:
          "Since everything runs client-side, the practical limit is your device's memory rather than a server quota. Formatting or hashing multi-megabyte inputs works fine on a modern machine. Extremely large files may briefly pause the tab while they process.",
      },
      {
        question: "Which browsers are supported?",
        answer:
          "Any modern, up-to-date browser, Chrome, Edge, Firefox, Safari and their mobile counterparts. The tools rely on standard web platform features like the Web Crypto API and TextEncoder that ship in every current browser.",
      },
      {
        question: "Can I use these tools at work or in commercial projects?",
        answer:
          "Absolutely. They're general-purpose developer utilities you're free to use in professional and commercial work. Nothing you process is retained, so they fit neatly into privacy-conscious workflows.",
      },
    ],
  },
  {
    slug: "qr-tools",
    name: "QR Studio",
    description:
      "Put anything a scan away, design, brand, batch and decode QR codes in a full studio that runs entirely in your browser.",
    icon: "QrCode",
    accent: "indigo",
    featured: true,
    longDescription:
      "A complete QR code studio, not a throwaway generator. Craft pixel-perfect codes with custom dot shapes, rounded eyes, color gradients and a centred logo, then export crisp PNG, SVG, PDF or EPS artwork at any resolution for print or web. Purpose-built encoders turn the awkward parts: Wi-Fi credentials, vCard contacts, payment requests (PayPal.me, Bitcoin or UPI), calendar events, email and SMS payloads, into a single scan, so nobody has to type anything by hand.",
    intro:
      "Everything here renders locally on your device and stays there: the data you encode is never uploaded, logged or stored. Pick the encoder that matches what you're sharing, style it to match your brand, then download production-ready files, or point your camera at a code and read it back in a tap.",
    popularSlugs: [
      "qr-code-generator",
      "wifi-qr-code-generator",
      "vcard-qr-code-generator",
      // Generic payment encoder (PayPal.me / Bitcoin / UPI) rather than the
      // UPI-only tool: this list is a GLOBAL surface, and an India-only payment
      // rail as a headline "popular" tool reads as irrelevant everywhere else.
      // The dedicated /upi-qr-code-generator still exists and still ranks on its
      // own terms; it just isn't what we lead with worldwide.
      "payment-qr-code-generator",
      "menu-qr-code-generator",
      "qr-code-scanner",
    ],
    relatedCategories: ["image-tools", "developer-tools"],
    seo: {
      title: "Free QR Code Tools, Generate, Brand, Batch & Scan",
      description:
        "A desktop-grade QR studio: styled QR codes with logos & gradients, Wi-Fi/vCard/payment/menu encoders, bulk export and a camera scanner. Private, in-browser, no sign-up.",
    },
    faq: [
      {
        question: "What's the difference between a static and a dynamic QR code?",
        answer:
          "A static QR code encodes its data directly in the pattern, so it works forever and needs no server, but its content is fixed once printed. A dynamic QR code stores a short redirect link whose destination you can edit later, which requires a hosted database behind it. Our tools generate static codes. If you point one at a URL you control (a page, a link-in-bio, a short link from your own service), you keep the ability to change the destination while everything on your side stays private.",
      },
      {
        question: "Do QR codes expire or stop working over time?",
        answer:
          "The code itself never expires: a static QR is just an encoded pattern and will scan for as long as it's readable. What can 'break' is the thing it points to: a URL that goes offline, a Wi-Fi password that changes, or a payment handle that's deactivated. The pattern is permanent. Keep the underlying destination live and the code keeps working.",
      },
      {
        question: "Will adding a logo or colors stop my QR code from scanning?",
        answer:
          "Not if you stay within QR's built-in error correction, which lets a code be read even when part of it is obscured. Keep a logo under roughly 25–30% of the code's area, maintain strong contrast between the modules and their background (dark on light works best), and preserve the quiet-zone margin around the edge. Always test the final artwork with a couple of real phones before you print at scale.",
      },
      {
        question: "Which file format should I download for printing?",
        answer:
          "For anything printed (packaging, posters, business cards) use a vector format like SVG, PDF or EPS so the code stays razor-sharp at any size. For screens, apps and websites, a high-resolution PNG is ideal. Avoid JPEG for QR codes: its compression softens the crisp edges the scanner relies on.",
      },
      {
        question: "How much data can a single QR code hold?",
        answer:
          "A QR code can technically store up to about 4,296 alphanumeric or 7,089 numeric characters, but that's rarely a good idea. The more you pack in, the denser and harder-to-scan the pattern becomes. For links, keep URLs short. For contact and Wi-Fi codes the structured payloads stay comfortably small and scan reliably.",
      },
      {
        question: "Is it safe to scan a QR code I don't recognise?",
        answer:
          "Treat an unknown QR code like an unknown link, because that's often what it is. A code can open a URL, join a Wi-Fi network or prefill a payment, so preview the decoded content before you act on it. Our scanner shows you exactly what a code contains without automatically opening or executing anything, which makes it a safe way to inspect a suspicious code first.",
      },
      {
        question: "Are these QR tools really free and private?",
        answer:
          "Yes on both counts. Every generator, encoder, batch tool and the scanner run entirely in your browser using JavaScript and your device's camera: there's no account, no watermark and no usage cap. The data you encode or the images you decode never leave your device, so even sensitive payloads like Wi-Fi passwords or contact details stay local.",
      },
    ],
  },
  {
    slug: "seo-tools",
    name: "SEO Studio",
    description:
      "Win the click before the page even loads: craft meta tags, structured data, sitemaps and robots rules, and preview exactly how you appear on Google and social.",
    icon: "Search",
    accent: "emerald",
    featured: true,
    longDescription:
      "A complete search-optimisation workbench for the parts of SEO that are actually mechanical: hand-writing a clean title and meta description, marking up a page with the JSON-LD schema Google wants, drafting a robots.txt without breaking crawl access, and shipping an XML sitemap that search engines can read. Each tool turns fiddly, error-prone markup into a guided form with a live preview, so you spend your time on strategy instead of debugging a stray angle bracket.",
    intro:
      "Optimizing a page usually means jumping between a validator, a SERP mockup, a schema reference and three Stack Overflow tabs. This toolkit collapses that into one place: fill in a form, watch the search and social previews update as you type, then copy production-ready markup straight into your <head>. No crawler quota, no account, and nothing about your site is uploaded.",
    learningCenter: {
      eyebrow: "Learn",
      title: "SEO best practices, in plain English",
      description:
        "Field-tested rules of thumb behind every tool here, so the output isn't just valid, it actually ranks.",
      lessons: [
        {
          icon: "Type",
          title: "Write titles for humans first",
          description:
            "Keep title tags under ~60 characters so they don't truncate in results, front-load the primary keyword, and make every page's title genuinely unique. A compelling title lifts click-through far more than keyword stuffing ever will.",
        },
        {
          icon: "AlignLeft",
          title: "Treat the meta description as ad copy",
          description:
            "Google often rewrites it, but a sharp 150–160 character summary with a clear benefit and a soft call-to-action still wins clicks when it does show. Describe the page honestly. Mismatched descriptions get replaced.",
        },
        {
          icon: "Braces",
          title: "Add only the schema you can back up",
          description:
            "Structured data unlocks rich results, but marking up ratings, prices or FAQs that aren't visible on the page risks a manual action. Match your JSON-LD to real, on-page content and validate it before shipping.",
        },
        {
          icon: "Share2",
          title: "Design your Open Graph card on purpose",
          description:
            "A 1200×630 image, a punchy og:title and a one-line og:description control how every share looks on social and chat apps. Set them explicitly instead of letting platforms guess from the first image they find.",
        },
        {
          icon: "Map",
          title: "Keep sitemaps and robots in sync",
          description:
            "List only canonical, indexable URLs in your XML sitemap, point to it from robots.txt, and never disallow a path you also want indexed. Blocking a page in robots.txt stops crawling. It does not reliably remove it from the index.",
        },
        {
          icon: "Link2",
          title: "Canonicalise to avoid competing with yourself",
          description:
            "Duplicate or parameterised URLs split your ranking signals. Pick one canonical version per piece of content, reference it consistently, and let redirects and rel=canonical consolidate the rest.",
        },
      ],
    },
    popularSlugs: [
      "meta-tag-generator",
      "schema-generator",
      "google-serp-preview",
      "xml-sitemap-generator",
      "robots-txt-generator",
      "open-graph-generator",
    ],
    relatedCategories: ["developer-tools", "image-tools"],
    seo: {
      title: "Free Website & SEO Tools, Meta Tags, Schema, Sitemaps & Previews",
      description:
        "Generate meta tags, JSON-LD schema, robots.txt and XML sitemaps, and preview your Google & social snippets, free, private and 100% in your browser.",
    },
    faq: [
      {
        question: "Do these SEO tools crawl or fetch my live website?",
        answer:
          "No, and that's deliberate. Everything runs entirely in your browser with no server, so we can't and don't reach out to your URL. For tools that would normally inspect a live page (like analyzing existing meta tags or response headers), you paste in the HTML or raw headers and we analyze them locally. It keeps your data private and means the tools work on staging sites and localhost that a public crawler could never reach.",
      },
      {
        question: "Will using these tools actually improve my Google rankings?",
        answer:
          "They fix the technical foundation rankings are built on: valid structured data, crawlable sitemaps, non-truncated titles, correct canonical and robots directives. That removes the mechanical mistakes that hold pages back and unlocks rich results, but SEO also depends on content quality, relevance and links. Think of these as the tools that make sure your good content isn't sabotaged by broken markup.",
      },
      {
        question: "What's the difference between meta tags, Open Graph and Twitter cards?",
        answer:
          "Standard meta tags (title, description) control how your page appears in Google's search results. Open Graph tags (og:title, og:image and friends) control how a link looks when shared on most social platforms and chat apps. Twitter/X cards are X's own variant. Our generators output all three together so a single page looks polished everywhere, and the preview tools show you each surface before you publish.",
      },
      {
        question: "Which schema type should I use for my page?",
        answer:
          "Match the schema to the page's real purpose: Article or BlogPosting for editorial content, Product for a shop item, LocalBusiness for a physical location, FAQPage for a genuine Q&A section, and BreadcrumbList for navigation. Only add markup for content that's actually visible on the page, inventing ratings or prices you don't show can trigger a manual penalty. When in doubt, start with the most specific type that honestly describes the page.",
      },
      {
        question: "Can a robots.txt or sitemap mistake hurt my site?",
        answer:
          "Yes, and they're among the easiest ways to accidentally deindex yourself. A stray Disallow: / blocks your whole site from crawling. Listing non-canonical or redirecting URLs in a sitemap wastes crawl budget and sends mixed signals. Our generators build these files from a guided form and explain each directive, so you ship rules that open the right doors instead of quietly shutting them.",
      },
      {
        question: "How long should my title tag and meta description be?",
        answer:
          "Aim for roughly 50–60 characters for titles and 150–160 for descriptions, that's the window before Google truncates them with an ellipsis on most screens. Because search results are measured in pixels rather than characters, wide letters shorten the usable length. The preview tools here show a live truncation warning so you can trim to fit before it costs you a click.",
      },
      {
        question: "Are these tools free, and is my data kept private?",
        answer:
          "Completely free with no account, no watermark and no usage cap, and fully private: every generator, validator and preview executes in your browser tab. The HTML, URLs, headers and content you paste in are never uploaded, logged or stored, which also means the tools keep working offline once the page has loaded.",
      },
    ],
  },
  {
    slug: "svg-tools",
    name: "SVG Studio",
    description:
      "Make vectors production-ready, optimize, convert, generate and inspect SVG: shrink files, produce React components or data URIs, trace raster art, craft blobs and waves.",
    icon: "PenTool",
    accent: "orange",
    featured: true,
    longDescription:
      "A precision workbench for scalable vector graphics. The format that stays razor-sharp on every screen yet quietly bloats your bundle when it ships straight out of a design tool. These tools strip the editor cruft (hidden metadata, redundant precision, empty groups) so an icon that arrived at 12 KB leaves at 3, transform raw markup into a paste-ready React or Vue component, and reverse-engineer a JPEG or PNG into clean, editable paths. Alongside the utilities sits a small studio for making vectors from scratch: organic blob shapes, layered wave dividers and mesh-style gradients you can drop straight into a hero section.",
    intro:
      "Vectors are the one asset you can scale forever without losing a pixel, but the SVG a designer exports is rarely the SVG you want to ship. Paste your markup or drop a file, and watch it shrink, convert, re-color or render live in the same tab. Everything is measured, diffed and copy-ready, so what leaves here is smaller, cleaner and framework-native.",
    learningCenter: {
      eyebrow: "Learn",
      title: "Working with SVG, the sharp way",
      description:
        "The habits behind every tool here, so your vectors stay tiny, crisp and easy to animate long after export.",
      lessons: [
        {
          icon: "Minimize2",
          title: "Optimize before you commit an SVG",
          description:
            "A raw export from Figma or Illustrator carries editor metadata, needless coordinate precision and empty groups that can double the byte count. Running it through an optimizer removes the invisible cruft without touching how the shape looks, often a 60–80% saving on a single icon.",
        },
        {
          icon: "Frame",
          title: "The viewBox is what makes it scale",
          description:
            "Drop fixed width and height attributes and keep a clean viewBox, and your SVG stretches to fill any container while staying crisp. Getting the viewBox right is the difference between a graphic that scales gracefully and one that clips or distorts.",
        },
        {
          icon: "Palette",
          title: "Use currentColor so icons inherit theme",
          description:
            "Swapping hard-coded fills for fill=\"currentColor\" lets an inline SVG icon pick up the surrounding text color automatically: one asset that recolors itself in light mode, dark mode and on hover, with zero extra CSS.",
        },
        {
          icon: "Component",
          title: "Inline SVG beats an <img> for control",
          description:
            "Converting markup into a React or Vue component lets you animate paths, respond to props and style with CSS. None of which is possible when the same graphic is loaded through an <img> tag or a background image. It also removes an extra network request.",
        },
        {
          icon: "Spline",
          title: "Fewer path points animate more smoothly",
          description:
            "Auto-traced or hand-drawn paths often carry far more anchor points than the shape needs. Simplifying the path data keeps the outline visually identical while making the file lighter and any morph or draw animation dramatically smoother.",
        },
        {
          icon: "Code",
          title: "Data URIs cut requests: up to a point",
          description:
            "Encoding a small SVG as a data URI inlines it directly into your CSS or HTML, saving a round-trip for tiny icons. Prefer URL-encoding over Base64 for SVG (it stays smaller and human-readable), and keep it for small assets, large ones bloat the stylesheet instead.",
        },
      ],
    },
    popularSlugs: [
      "svg-optimizer",
      "svg-to-react",
      "svg-blob-generator",
      "svg-viewer",
      "svg-to-data-uri",
      "svg-minifier",
    ],
    relatedCategories: ["image-tools", "developer-tools"],
    seo: {
      title: "Free SVG Tools: Optimize, Convert, Generate & View Vectors",
      description:
        "Optimize and minify SVG, convert to React/JSX or data URI, trace images to vectors, generate blobs and waves, and preview markup live, free, private, 100% in-browser.",
    },
    faq: [
      {
        question: "What does optimizing an SVG actually remove, and is it safe?",
        answer:
          "Optimisation strips the parts a browser never renders: editor metadata and comments, hidden layers, empty groups, unused definitions, and coordinate precision far finer than any screen can show. The visible shape is untouched. You get the identical graphic at a fraction of the size. It's lossless for the rendered result, though heavy optimisation can flatten the layer structure, so keep your original design file if you plan to re-edit it later.",
      },
      {
        question: "Why convert an SVG into a React or Vue component?",
        answer:
          "As a component the vector becomes part of your app rather than an external file: you can pass it props (size, color, a title for accessibility), animate individual paths, style it with CSS and drop the extra network request an <img> or background image would cost. Our converter renames attributes to their JSX form (className, strokeWidth, camelCased styles), can wire fills to currentColor, and hands back a clean, typed component you paste straight in.",
      },
      {
        question: "Can I turn a PNG or JPG into an SVG here?",
        answer:
          "Yes, the tracer follows the edges in a raster image and rebuilds them as vector paths, which works beautifully for logos, icons and other flat, high-contrast artwork. Bear in mind it's a genuine trace, not magic: detailed photographs produce enormous, messy paths, so tracing is best reserved for simple shapes where the payoff (infinite scalability) is real.",
      },
      {
        question: "What's the difference between a data URI and Base64 encoding?",
        answer:
          "A data URI is any asset inlined directly into your CSS or HTML instead of loaded from a separate file. For SVG specifically you can encode it two ways: URL-encoding (percent-escaping) keeps the markup readable and is smaller for text-based formats, while Base64 is more compact for binary data but adds roughly a third to an SVG's size. Our tool defaults to URL-encoding for SVG and shows you the byte count of each so you can pick the shorter one.",
      },
      {
        question: "How do the blob, wave and gradient generators work?",
        answer:
          "They build vectors from scratch rather than editing an upload. The blob generator produces smooth, organic shapes by placing points on a circle and randomising their radius, so you get a fresh silhouette every click. The wave generator lays out layered dividers for section transitions, and the gradient tools output SVG or CSS gradients. Each gives you copy-ready markup you can drop into a hero, card or section background.",
      },
      {
        question: "Do these SVG tools upload my files anywhere?",
        answer:
          "No. Every operation (optimizing, converting, tracing, generating and previewing) runs entirely in your browser using the DOM and canvas APIs already built into it. Your markup and images never leave the tab, are never logged or stored, and the tools keep working offline once the page has loaded, which makes them safe for proprietary logos and unreleased brand assets.",
      },
    ],
  },
  {
    /**
     * GEO Studio — the free technical layer under AI visibility.
     *
     * Positioning is deliberate: the AI-visibility market is 200+ paid
     * citation-monitoring dashboards. This category is explicitly NOT that.
     * It's the free technical utilities underneath them — can crawlers reach
     * you, can they read you, is there anything worth citing — with published
     * methodology on every score.
     */
    slug: "geo-tools",
    name: "GEO Studio",
    description:
      "The free technical layer under AI visibility: check whether AI crawlers can reach your site, whether they can read it without JavaScript, and whether there's anything on it a model could actually cite.",
    icon: "Radar",
    accent: "orange",
    featured: true,
    longDescription:
      "Generative Engine Optimization is mostly sold as monitoring: dashboards that track how often ChatGPT or Perplexity mentions your brand, priced monthly. None of that helps if GPTBot is blocked in your robots.txt, if Cloudflare is rejecting AI crawlers at the firewall by default, if your content only exists after JavaScript hydration, or if every section of your page becomes meaningless the moment a retrieval system quotes it alone. Those are the technical problems underneath AI visibility, they're all fixable, and until now there was no free tool that checked them properly. This studio is that layer. Crawler access is computed with real RFC 9309 robots.txt matching and quotes the exact rule behind every verdict. Content is scored on factors a peer-reviewed study measured, with the formula printed next to each sub-score. Your page is sliced into retrieval chunks and shown to you one fragment at a time, the way a model sees it. And your server logs are parsed in your own browser, because access logs contain your visitors' IP addresses and should never be uploaded to anyone.",
    intro:
      "Start with the GEO Audit: one URL, one report, every finding linked to the tool that fixes it. Or go straight to the specific check you need. No account, no usage cap, and every score shows its arithmetic.",
    learningCenter: {
      eyebrow: "Learn",
      title: "What actually changes AI visibility",
      description:
        "The mechanics behind every tool here, stated plainly, including where the evidence is thin.",
      lessons: [
        {
          icon: "Bot",
          title: "\"AI crawler\" is not one thing",
          description:
            "OpenAI alone runs three: GPTBot trains models, OAI-SearchBot builds the index ChatGPT Search cites from, and ChatGPT-User fetches links people share. Blocking all three because you object to training silently removes you from AI answers and their referral traffic. Decide per bot, not per company.",
        },
        {
          icon: "CloudOff",
          title: "Cloudflare may be blocking crawlers you allowed",
          description:
            "Cloudflare now blocks AI crawlers at the firewall by default on new zones, and a managed robots.txt feature can inject Disallow rules above your own. Both act before your file is ever read, so a permissive robots.txt can coexist with a total AI block. Check Security → Bots in the dashboard.",
        },
        {
          icon: "MonitorOff",
          title: "Most AI crawlers don't run JavaScript",
          description:
            "Googlebot renders pages. GPTBot, ClaudeBot and PerplexityBot read the raw HTML and move on. A client-rendered site can rank perfectly in Google while being an effectively blank page to every AI system. Server-render the content you want cited.",
        },
        {
          icon: "Puzzle",
          title: "Your page is read as fragments, not as a page",
          description:
            "Retrieval splits documents into chunks and hands a model one at a time, without your headings or the paragraph above. A section opening \"It also supports…\" is clear in place and meaningless retrieved. Write every section to survive alone.",
        },
        {
          icon: "Quote",
          title: "Statistics, quotes and sources measurably help",
          description:
            "The GEO study (Aggarwal et al., KDD 2024) tested content edits across 10,000 queries and found adding statistics, quotable statements and cited sources produced the largest visibility gains. Concrete numbers beat confident adjectives, and it's one of the few claims here with a controlled study behind it.",
        },
        {
          icon: "ScrollText",
          title: "Permission isn't the same as arrival",
          description:
            "Allowing a crawler in robots.txt doesn't mean it came. Server access logs are the only authoritative record. Analytics can't see bots, because bots don't run JavaScript. If a permissive file produces zero crawler hits, something upstream is blocking them.",
        },
      ],
    },
    popularSlugs: [
      "geo-audit",
      "ai-crawler-access-checker",
      "retrieval-chunk-preview",
      "content-citability-scorer",
      "js-rendering-checker",
      "ai-crawler-log-analyzer",
    ],
    relatedCategories: ["seo-tools", "developer-tools"],
    seo: {
      title: "GEO Tools: Free AI Visibility & LLM SEO Checkers | GigAI Tools",
      description:
        "Free Generative Engine Optimization tools: AI crawler access checker with Cloudflare detection, JS rendering checker, citability scorer with published methodology, retrieval chunk preview. No signup.",
    },
    faq: [
      {
        question: "What is GEO (Generative Engine Optimization)?",
        answer:
          "GEO is the practice of making a site usable by generative engines — ChatGPT, Claude, Perplexity, Gemini and the search indexes they retrieve through — so that they can find your pages, read them, and cite them in answers. It overlaps with SEO but diverges in three places that matter: most AI crawlers don't execute JavaScript, retrieval reads your page as isolated fragments rather than as a document, and citation favors specific, sourced, quotable claims over keyword coverage.",
      },
      {
        question: "Do these tools monitor whether AI mentions my brand?",
        answer:
          "No, and that's deliberate. Citation monitoring is a crowded, well-funded category (Profound, Peec, Otterly and roughly 200 others) that requires continuous paid querying of every model. These tools do the thing nobody offers free: the technical layer underneath, which determines whether being cited is even possible. Check that first — a $99/month dashboard can't fix a robots.txt block.",
      },
      {
        question: "Is my data uploaded when I use these tools?",
        answer:
          "Analysis always runs in your browser. Tools that need to read someone else's URL use a stateless proxy that fetches the public page, returns it, and stores nothing — that's unavoidable, because browsers can't fetch cross-origin. Two tools never touch the network at all: the log analyzer (server logs contain your visitors' IP addresses, so the file is parsed locally and the IP column is discarded at parse time) and the entity checker, which reads only what you paste.",
      },
      {
        question: "Why do these scores show their formulas when other tools don't?",
        answer:
          "Because a score with no stated method can't be checked, argued with, or acted on — and the AI-visibility category is full of them, which is why it has a credibility problem. Every sub-score here prints its formula, its counted inputs and the evidence it counted, and links the source when a factor comes from published research. If a factor can't be stated as a one-line formula, it isn't scored.",
      },
      {
        question: "Which tool should I start with?",
        answer:
          "The GEO Audit: enter one URL and it runs every check in the studio, orders the findings worst-first, and links each one to the specific tool that digs deeper. If you'd rather go straight to a single question, the AI Crawler Access Checker answers the most common one ('is GPTBot blocked?') in about ten seconds.",
      },
      {
        question: "Will these tools guarantee that AI cites my site?",
        answer:
          "No. Citation depends on competition, query demand, your site's authority and model behavior nobody controls, and any tool promising a guarantee is overselling. What these tools do is narrower and genuinely useful: they find the technical and structural problems that make citation impossible or unlikely, show you the evidence, and hand you the fix.",
      },
    ],
  },
  {
    slug: "ai-tools",
    name: "AI Studio",
    description:
      "Smart, on-device and cloud AI helpers for writing, images and productivity.",
    icon: "Sparkles",
    accent: "emerald",
    featured: true,
    seo: {
      title: "Free AI Tools, Writing, Images & Productivity",
      description:
        "AI-powered online tools for writing, images and productivity. Simple, fast and free.",
    },
  },
  {
    slug: "business-tools",
    name: "Business Studio",
    description:
      "Invoices, calculators, converters and generators to run the day-to-day.",
    icon: "Briefcase",
    accent: "amber",
    seo: {
      title: "Free Business Tools, Invoices, Calculators & Generators",
      description:
        "Practical online business tools: invoice makers, calculators, converters and generators. Free to use.",
    },
  },
  {
    slug: "video-tools",
    name: "Video Studio",
    description:
      "Make every clip fit its destination, trim, convert, compress and extract audio from video, quick and hassle-free in your browser.",
    icon: "Video",
    accent: "cyan",
    longDescription:
      "A real video workbench that runs entirely inside your browser tab: powered by a self-hosted build of FFmpeg compiled to WebAssembly. Shrink a phone clip that's too heavy to email, transcode a stubborn.mov into a web-friendly MP4, cut a tight 12-second highlight without re-encoding the whole file, turn a reaction shot into a shareable GIF, or lift a clean audio track out of an interview. Each tool is a focused editor with drag-and-drop input, a scrubbable preview and a single Export button: the footage you drop in is decoded and rewritten on your own machine, then handed straight back to you as a download.",
    intro:
      "Video is the format everyone needs and nobody wants to upload: the file is huge, it's often personal, and the usual answer is a sketchy site that queues your clip on a stranger's server. These tools flip that around: drop a clip in, watch it process locally with a live progress bar, and download the result. Nothing leaves your device, there's no account, and there's no watermark on the way out.",
    learningCenter: {
      eyebrow: "Learn",
      title: "Getting the most out of in-browser video",
      description:
        "How WebAssembly video processing actually behaves, so you pick the right tool, the right settings, and the right file size for the job.",
      lessons: [
        {
          icon: "Gauge",
          title: "Container vs. codec: know which one you're changing",
          description:
            "An .mp4 is a box. The H.264 or H.265 stream inside it is the content. Some conversions just repackage the same stream into a new box (fast, lossless), while others re-encode the pixels (slower, and quality depends on your bitrate). Knowing which you're asking for tells you whether to expect seconds or minutes.",
        },
        {
          icon: "Scissors",
          title: "Cut on keyframes to trim without re-encoding",
          description:
            "Trimming at a keyframe lets the tool copy the video stream byte-for-byte, instant and lossless. Cutting mid-GOP forces a re-encode of the surrounding frames so the clip stays playable. If a trim is slower than you expect, it's honouring your exact in/out points rather than snapping to the nearest keyframe.",
        },
        {
          icon: "Minimize2",
          title: "Bitrate, not resolution, drives file size",
          description:
            "Halving the resolution barely helps if the bitrate stays high. Dropping the bitrate (or raising the CRF quality number) is what actually shrinks a file. For a compressor, aim for a target size or CRF first and only scale the resolution down when the footage still won't fit.",
        },
        {
          icon: "Film",
          title: "GIFs are big, reach for them deliberately",
          description:
            "A GIF has no modern compression and a 256-color palette, so a few seconds of motion can outweigh the source MP4. Keep clips short, trim the frame rate and dimensions, and let the tool build an optimized palette. When you actually want small and shareable, an MP4 or WebM beats a GIF every time.",
        },
        {
          icon: "AudioLines",
          title: "Extracting audio can be a clean copy",
          description:
            "If the source already holds an AAC or MP3 track, pulling it out can copy the stream directly with zero quality loss and almost no wait. Re-encoding to a different format (say AAC to MP3) trades a little time and fidelity. Choose 'keep original' when the source codec is already what you need.",
        },
        {
          icon: "ShieldCheck",
          title: "Your footage never leaves the tab",
          description:
            "Every decode, cut and re-encode happens in WebAssembly on your own device. The clip is never uploaded, queued or stored. That's exactly what you want for personal recordings, client footage and anything under NDA, and it's why there's no upload bar and no watermark.",
        },
      ],
    },
    popularSlugs: [
      "video-compressor",
      "video-converter",
      "video-trimmer",
      "video-to-gif",
      "extract-audio",
      "mp4-to-webm",
    ],
    relatedCategories: ["audio-tools", "image-tools"],
    seo: {
      title: "Free Video Tools: Compress, Convert, Trim & Extract Audio",
      description:
        "In-browser video toolkit powered by FFmpeg WebAssembly: compress, convert, trim, make GIFs and pull audio. No uploads, no account, no watermark.",
    },
    faq: [
      {
        question: "Is the video really processed in my browser, or is it uploaded?",
        answer:
          "It's genuinely processed in your browser. These tools run a self-hosted build of FFmpeg compiled to WebAssembly, so decoding, cutting and re-encoding all happen on your own device inside the tab. Your clip is never uploaded to a server, queued behind other people's jobs, logged or stored, which is exactly why there's no upload progress bar reaching out to the cloud and no watermark stamped on the result.",
      },
      {
        question: "How large a video can I process?",
        answer:
          "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. As a loose rule, files up to roughly a few hundred megabytes are comfortable on a typical laptop. Very long or high-bitrate 4K clips can exhaust memory or slow to a crawl. The tools warn you before starting a heavy job: for the biggest files, trimming down first or lowering the resolution keeps things responsive.",
      },
      {
        question: "Why is browser video processing slower than a desktop app?",
        answer:
          "A native app like desktop FFmpeg uses your CPU's full instruction set and, often, hardware video acceleration. The WebAssembly build here runs single-threaded in a sandbox for safety and compatibility, so the same re-encode takes longer. The trade-off is that it needs zero installation, works on any modern browser, and keeps your footage entirely private, and a live progress bar shows exactly where each job stands.",
      },
      {
        question: "Which formats and codecs are supported?",
        answer:
          "The toolkit handles the mainstream web and mobile formats: MP4, WebM, MOV, MKV and AVI containers, with H.264, VP8/VP9 and similar codecs, plus audio tracks like AAC, MP3, Opus and WAV. You can transcode between the common pairings, MP4 to WebM, MOV to MP4 and so on. Exotic professional or DRM-protected formats aren't supported, and where a conversion has to re-encode, the tool makes that clear.",
      },
      {
        question: "Will trimming or converting reduce my video's quality?",
        answer:
          "It depends on the operation. Trimming on a keyframe and repackaging into a new container copies the original stream with no quality loss at all. Anything that re-encodes the pixels, most compression and cross-codec conversions, is lossy by nature, but you control the outcome through the quality (CRF) or target-size settings. Pick a higher quality setting when fidelity matters and accept a larger file, or trade some detail for a smaller download.",
      },
      {
        question: "Do I need to install anything or create an account?",
        answer:
          "No. There's nothing to download, no plugin, no sign-up and no paywall. The first time you use a tool it fetches the FFmpeg engine once and caches it, after which everything works on demand: including offline for tools you've already opened. You just drop a file in and export the result.",
      },
    ],
  },
  {
    slug: "audio-tools",
    name: "Audio Studio",
    description:
      "Shape sound without installing a DAW: trim, convert, record, merge and master audio in your browser, powered by the native Web Audio engine.",
    icon: "AudioLines",
    accent: "rose",
    featured: true,
    longDescription:
      "A genuine audio workbench that runs inside your browser tab on the Web Audio engine your device already ships with. No plugins, no installs, no server queue. Trim a podcast intro to the exact millisecond, splice several takes into one seamless track, level a too-quiet voice memo, strip the dead air out of a recording, fade a song in and out cleanly, or capture your microphone straight to a file. Because the browser can decode and re-render audio natively, the everyday jobs: cutting, merging, volume, speed, reverse, fade, normalisation, silence removal, waveform display and recording. Are instant and export to lossless WAV or MP3 without any heavyweight machinery. Only the exotic container conversions (OGG, FLAC, M4A, AAC) reach for a WebAssembly codec, and even then it loads on demand and solely for that job.",
    intro:
      "Audio is the file you keep needing to nudge: a clip that's a beat too long, two takes that should be one, a recording that's just too quiet, a track that needs a clean fade. The usual answer is a bloated desktop editor or a sketchy site that uploads your voice to a stranger's server. These tools flip that around: drop a clip in, see its waveform, make the edit, and download the result, every sample processed on your own machine, nothing uploaded, no watermark and no account.",
    learningCenter: {
      eyebrow: "Learn",
      title: "Getting clean results from in-browser audio",
      description:
        "How browser audio actually behaves, so you pick the right tool, the right format and the right settings, and your edits stay faithful.",
      lessons: [
        {
          icon: "AudioLines",
          title: "Sample rate and bit depth define your fidelity",
          description:
            "Audio is just numbers: how many samples per second (44.1 kHz for CD, 48 kHz for video) and how many bits describe each one. Editing at the source's native rate avoids needless resampling, and exporting at the same rate keeps the result faithful. Upsampling never adds detail that wasn't captured. It only grows the file.",
        },
        {
          icon: "FileAudio",
          title: "Lossy and lossless are a one-way street",
          description:
            "WAV and FLAC keep every sample. MP3, AAC and OGG throw some away to shrink the file. Decoding a lossy file, editing it and re-encoding to lossy compounds the loss each time. When you'll keep editing, work from and export to a lossless format, and only encode to MP3 as the final delivery step.",
        },
        {
          icon: "Volume2",
          title: "Normalise for peaks, not for loudness",
          description:
            "Peak normalisation lifts a clip so its loudest moment just reaches the ceiling without clipping, great for rescuing a quiet recording. It does not match perceived loudness between tracks the way broadcast LUFS targets do, so a normalised whisper and a normalised drum loop can still feel worlds apart. Use it to maximise headroom, not to balance a playlist.",
        },
        {
          icon: "Scissors",
          title: "Cut at zero-crossings to avoid clicks",
          description:
            "A cut or join made where the waveform isn't at zero leaves a sudden jump that your ears hear as a click or pop. Trimming and merging tools that snap edits to zero-crossings, or apply a millisecond fade at the seam, keep splices inaudible. It's the single biggest difference between an amateur cut and a clean one.",
        },
        {
          icon: "Mic",
          title: "Record dry, process afterwards",
          description:
            "Capture the cleanest possible signal first (quiet room, mic close, levels peaking well below the ceiling) then normalise, trim and fade as separate steps. Baking effects in while recording is unrecoverable. Keeping the raw take means every later decision stays reversible.",
        },
        {
          icon: "ShieldCheck",
          title: "Your recordings never leave the tab",
          description:
            "Every decode, cut, merge and re-render happens in the Web Audio engine on your own device. The audio is never uploaded, queued or stored. That's exactly what you want for voice memos, interviews, client mixes and anything private, and it's why there's no upload bar and no watermark on the way out.",
        },
      ],
    },
    popularSlugs: [
      "audio-trimmer",
      "mp3-converter",
      "audio-recorder",
      "audio-normalizer",
      "audio-merger",
      "ringtone-maker",
    ],
    relatedCategories: ["video-tools", "image-tools"],
    seo: {
      title: "Free Audio Tools, Trim, Convert, Record, Merge & Normalise",
      description:
        "In-browser audio toolkit on the native Web Audio engine: trim, convert to MP3/WAV, record, merge, normalise and make ringtones. No uploads, no account, no watermark.",
    },
    faq: [
      {
        question: "Is my audio really processed in the browser, or is it uploaded?",
        answer:
          "It's genuinely processed in your browser. These tools run on the native Web Audio engine (AudioContext and OfflineAudioContext) built into every modern browser, so decoding, cutting, merging and re-rendering all happen on your own device inside the tab. Your clip (a voice memo, an interview, an unreleased mix) is never uploaded to a server, queued behind other jobs, logged or stored, which is why there's no upload progress bar reaching out to the cloud and no watermark on the result.",
      },
      {
        question: "Which audio formats can I import and export?",
        answer:
          "You can import essentially anything your browser can decode: MP3, WAV, M4A/AAC, OGG and, on most browsers, FLAC. Core editing tools export to lossless WAV or to MP3 (encoded locally in your browser), which covers the vast majority of needs. Converting into the more exotic containers (OGG, FLAC, M4A, AAC) uses an on-demand WebAssembly codec that loads only when you run that specific conversion, so the fast, everyday tools stay lightweight and never pull in anything heavy.",
      },
      {
        question: "Why should I keep a WAV while editing and only export MP3 at the end?",
        answer:
          "MP3, AAC and OGG are lossy: they discard some audio data to shrink the file, and that loss can't be recovered. Every time you decode a lossy file, edit it and re-encode to lossy again, you lose a little more quality. Working from a lossless WAV (or FLAC) and keeping it as your master means each edit is clean, and encoding to MP3 only as the final delivery step limits the loss to a single pass.",
      },
      {
        question: "How long a clip can I edit in the browser?",
        answer:
          "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. Short-to-medium clips (songs, podcast segments, voice memos up to many minutes) run comfortably on a typical laptop. Very long recordings (a multi-hour interview) or many stacked tracks can use significant memory and briefly pause the tab while rendering. For the longest files, trimming down first keeps everything responsive.",
      },
      {
        question: "Why does a trim or join sometimes cause a click, and how do I avoid it?",
        answer:
          "A click at an edit point happens when the cut lands where the waveform isn't at zero, creating an abrupt jump the ear hears as a pop. The trimmer and merger avoid this by snapping edits to zero-crossings or applying a tiny fade at the seam, so splices stay inaudible. If you ever hear a click, nudging the cut point slightly or adding a short fade at the boundary removes it.",
      },
      {
        question: "Can I record straight from my microphone, and where does that audio go?",
        answer:
          "Yes. The recorder uses your browser's built-in microphone capture (via MediaRecorder), so you can record a voiceover, a memo or an idea directly in the tab and export it without any other software. The captured audio is held only in your browser and processed on your device, it's never streamed to a server. Your browser will ask permission before the microphone is used, and recording stops the moment you tell it to.",
      },
      {
        question: "Are these audio tools free, and do they add watermarks or audible tags?",
        answer:
          "Every tool is completely free (no account, no trial, no usage cap) and nothing you export is watermarked, tagged with an audio stinger or degraded to push an upgrade. Because the processing happens on your device, there's no per-file cost to us and therefore none to you, and the tools keep working offline once the page has loaded.",
      },
    ],
  },
];

/**
 * Lightweight category lookup for CLIENT components. Importing this instead of
 * `lib/registry.getCategoryBySlug` keeps the full tool registry (every tool's
 * long-form config) out of client bundles: CATEGORIES is a tiny, data-only
 * list, so listing pages don't ship all tool copy to the browser.
 */
export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}
