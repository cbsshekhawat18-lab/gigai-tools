import type { Tool } from "@/types";

/**
 * Repair PDF, rebuilds the cross-reference table and object offsets.
 *
 * The claim discipline here is unusually important. Every competitor's repair
 * page implies total recovery; almost nothing can recover content that was
 * truncated away. This page says what a rebuild fixes (structure) and what no
 * tool can fix (missing bytes), and the workspace shows the recovered page
 * count so a partial recovery can't masquerade as a success.
 */
const repairPdf: Tool = {
  slug: "repair-pdf",
  title: "Repair PDF",
  description:
    "Rebuild a PDF that won't open, fixes the broken structure most damaged files actually have, in your browser, and reports exactly what came back.",
  category: "pdf-tools",
  group: "Optimize PDF",
  icon: "Wrench",
  accent: "amber",
  processor: "convert",
  status: "live",
  serverSide: false,
  createdAt: "2026-08-11",

  h1: "Repair PDF, Fix a File That Won't Open",
  tagline: "Rebuild the structure, and see what actually came back.",
  ctaText: "Repair a PDF",

  longDescription:
    "A PDF that refuses to open is usually not as broken as it looks. Inside every file is a cross-reference table, an index of where each object physically sits in the bytes, plus a trailer telling the reader where that index begins. Interrupt a download, sync a file badly, export from a program that crashed halfway, or copy it off failing storage, and that index stops matching reality. The content is all still there. The map to it is wrong, so the reader gives up and shows you an error. GigAI Repair PDF parses the file as leniently as it can, works out what objects genuinely exist, and writes a brand-new document with a correct index, fresh offsets and a clean trailer. That fixes the overwhelming majority of files that won't open. Now the part other repair tools tend not to say: no rebuild can recover content that isn't in the bytes. If your download stopped at 40% then 60% of the pages were never written to disk, and nothing (not this tool, not an expensive desktop one) can reconstruct them. Anyone promising otherwise is promising something impossible. That's why this tool leads with a report rather than a download button: it tells you how many pages were recovered, whether the file needed a lenient parse (which means it really was damaged), and what the size was before and after. Check the page count against what you expect. A repair that quietly returns three pages of a forty-page contract looks like a success and is a catastrophe, and you should be the one who notices. Free, no account, and the file never leaves your device, worth knowing, since a damaged file is often the only copy you have left.",

  keywords: [
    "repair pdf",
    "fix corrupted pdf",
    "pdf won't open",
    "recover damaged pdf",
    "pdf file is damaged",
    "restore corrupt pdf",
    "pdf repair tool",
    "damaged pdf fix online",
    "rebuild broken pdf",
  ],

  tags: ["pdf", "repair", "recovery", "corrupt", "troubleshooting"],
  fileTypes: ["pdf"],
  audiences: ["business", "students", "developers"],

  seo: {
    title: "Repair PDF Online Free: Fix a Corrupted File That Won't Open",
    description:
      "Rebuild a damaged PDF's structure and see exactly how many pages were recovered. Runs in your browser, nothing uploaded. Free, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "Wrench",
      title: "Rebuilds what's usually actually broken",
      description:
        "The cross-reference table, object offsets and trailer: the index rather than the content. That's the real fault in nearly every file that won't open after a bad download or export.",
    },
    {
      icon: "ClipboardCheck",
      title: "Reports what came back",
      description:
        "Pages recovered, size before and after, and whether the file needed a lenient parse. You can see whether anything is missing instead of assuming a download button means success.",
    },
    {
      icon: "FileWarning",
      title: "Accepts files other tools reject",
      description:
        "A damaged PDF often has a broken or missing MIME type, so the uploader accepts it by extension. Turning away the exact files the tool exists for would be absurd.",
    },
    {
      icon: "CloudOff",
      title: "Never uploaded",
      description:
        "A damaged file is frequently the only copy someone has. It's read and rebuilt on your own device, so using this tool can't cost you the original.",
    },
    {
      icon: "TriangleAlert",
      title: "Won't pretend to recover the unrecoverable",
      description:
        "If pages were truncated away they're gone, and the tool says so rather than handing you a confident green tick over a third of a document.",
    },
  ],

  benefits: [
    {
      title: "Most 'corrupt' PDFs aren't",
      description:
        "The bytes are usually fine and the index is wrong. Rebuilding the index is often the whole fix, and takes a second.",
    },
    {
      title: "You find out the truth immediately",
      description:
        "The page count tells you whether you've recovered a document or a fragment: before you rely on it or tell someone it's fine.",
    },
    {
      title: "Fixes files that open here but not there",
      description:
        "Stale offsets trip some readers and not others. A fresh rewrite often resolves a PDF that works in one viewer and fails in another.",
    },
  ],

  howTo: [
    {
      title: "Add the damaged PDF",
      description:
        "Drop in the file that won't open. Broken files often have a missing type, so it's accepted by extension rather than being turned away at the door.",
    },
    {
      title: "Rebuild it",
      description:
        "The file is parsed as leniently as possible and a fresh document is written from whatever objects survived: all on your device.",
    },
    {
      title: "Read the report",
      description:
        "Check the recovered page count against what the document should contain. This is the step that matters. Do not skip it.",
    },
    {
      title: "Download and verify",
      description:
        "Open the rebuilt file and check the pages you actually need are present and readable before relying on it.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Anyone",
      title: "A download that stopped halfway",
      description:
        "The most common cause by far. If the transfer completed but the index was left stale, a rebuild usually restores the whole document.",
    },
    {
      audience: "Business",
      title: "A file that opens on one machine but not another",
      description:
        "Different readers tolerate different amounts of structural damage. Rewriting the file cleanly gives every viewer the same, valid document.",
    },
    {
      audience: "Developers",
      title: "Output from a generator that crashed",
      description:
        "A PDF library interrupted mid-write leaves a valid body and a broken trailer. Rebuilding recovers the pages that were already flushed.",
    },
  ],

  troubleshooting: [
    {
      problem: "It recovered fewer pages than the document had",
      solution:
        "Then those pages aren't in the file. They were never written, or were lost before you got it. No repair tool can reconstruct bytes that don't exist. Anything claiming otherwise is guessing. Look for an earlier copy, a version in your email, or re-export from the source document.",
    },
    {
      problem: "It says the file can't be read at all",
      solution:
        "The damage reaches the structure the parser needs just to begin. That usually means the file is truncated very early or isn't really a PDF. Check the size against what you'd expect, and open it in a text editor to see whether it starts with %PDF. If it doesn't, the download failed entirely.",
    },
    {
      problem: "The rebuilt file is a different size",
      solution:
        "Expected and fine. The document is written fresh, so unreferenced objects and the old broken index are dropped, and compression is reapplied. A smaller result doesn't mean content was lost. Check the page count, which is the measure that matters.",
    },
    {
      problem: "It parsed cleanly and says nothing was wrong",
      solution:
        "Then the structure wasn't the problem. The file has still been rewritten fresh, which fixes stale offsets some viewers trip over. Try it. If it still won't open, the issue may be encryption (try Unlock PDF) or a viewer-specific bug rather than damage.",
    },
  ],

  tips: [
    "Check the recovered page count before anything else. A partial recovery looks exactly like a full one otherwise.",
    "Keep the damaged original until you've confirmed the rebuild is complete: don't overwrite your only copy.",
    "If the file won't open because it's password-protected rather than damaged, use Unlock PDF instead.",
  ],

  security:
    "The damaged file is read and rebuilt entirely inside your browser and is never uploaded. That matters more here than almost anywhere else: a corrupted PDF is often the only copy someone has left, and handing it to a stranger's server to fix is a risk you shouldn't have to take. Nothing is stored, logged or transmitted, and the original file on your device is never modified. The repair is written as a new file, so a failed attempt cannot cost you what you still have.",

  faq: [
    {
      question: "What does repairing a PDF actually do?",
      answer:
        "It rebuilds the file's index. A PDF carries a cross-reference table saying where each object sits in the bytes, plus a trailer pointing at that table. When a download is interrupted or an export crashes, the index stops matching the file and readers refuse to open it even though the content is intact. The repair works out what's really there and writes a fresh document with a correct index.",
    },
    {
      question: "Can it recover pages that are missing?",
      answer:
        "No, and no tool can. If the bytes for those pages were never written to disk, there is nothing to recover them from: reconstruction would mean inventing them. That's why the tool reports the recovered page count so prominently: so you learn immediately whether you have your document back or only part of it.",
    },
    {
      question: "Will I lose formatting or quality?",
      answer:
        "No. The surviving page objects are copied as they are, not re-rendered, so text stays text, images stay at their original resolution and fonts are preserved. The file is rewritten, not recreated.",
    },
    {
      question: "My PDF asks for a password rather than showing an error: will this help?",
      answer:
        "That isn't damage, it's encryption, and repair is the wrong tool. Use Unlock PDF to remove a password you already know.",
    },
    {
      question: "Is my file uploaded?",
      answer:
        "No. Everything happens in your browser: the file never leaves your device, nothing is stored and nothing is logged. Free, unlimited, no account and no watermark.",
    },
  ],

  changelog: [{ date: "2026-08-11", change: "Repair PDF released, structural rebuild with a recovery report." }],

  relatedTools: ["unlock-pdf", "compress-pdf", "merge-pdf", "pdf-to-word"],
};

export default repairPdf;
