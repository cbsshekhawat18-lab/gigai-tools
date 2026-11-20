import type { Tool } from "@/types";

/**
 * Unlock PDF: removes the "open" password from an encrypted PDF you already
 * know the password to. It runs entirely in the browser: @cantoo/pdf-lib
 * genuinely decrypts the file with the password you supply, then re-saves a
 * fresh, unencrypted copy that keeps selectable text and vectors intact. All
 * copy here is unique to unlocking and stays honest; this is for PDFs you own,
 * it needs the real password, and nothing is ever uploaded.
 */
const unlockPdf: Tool = {
  slug: "unlock-pdf",
  title: "Unlock PDF",
  description:
    "Remove the open password from a PDF you own, enter the password, and download a decrypted copy you can read, edit and print. Free and 100% in your browser.",
  category: "pdf-tools",
  group: "PDF Security",
  icon: "LockOpen",
  accent: "emerald",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Unlock a Password-Protected PDF: Free & Private",
  tagline:
    "Enter the password you already have and get back a clean, unencrypted PDF. No more typing it in every time you open the file. Runs on your device. Nothing is uploaded.",
  longDescription:
    "The GigAI PDF Unlocker takes an encrypted PDF plus the password you know and returns a decrypted copy that opens with a single click. It genuinely decrypts the document with @cantoo/pdf-lib, not a screenshot or a rasterised copy, so text stays selectable, links keep working and the pages look exactly as they did. Everything happens inside your browser tab: your file and your password never touch a server, are never stored, and vanish the moment you close the page. This tool is only for PDFs you own and are authorised to open. It needs the correct password and cannot break, guess or bypass one you don't have.",

  ctaText: "Unlock PDF",

  keywords: [
    "unlock pdf",
    "remove pdf password",
    "decrypt pdf",
    "pdf password remover",
    "open password protected pdf",
    "unlock pdf online",
    "remove password from pdf free",
    "pdf unlocker",
    "take password off pdf",
  ],

  seo: {
    title: "Unlock PDF: Remove PDF Password Online Free | GigAI Tools",
    description:
      "Unlock a password-protected PDF you own. Enter the password and download a decrypted copy: selectable text preserved, 100% private, no uploads, no sign-up.",
  },

  features: [
    {
      icon: "KeyRound",
      title: "Real decryption, not a screenshot",
      description:
        "Your password truly decrypts the file, so the unlocked copy keeps selectable text, working links and crisp vector graphics. No rasterising or quality loss.",
    },
    {
      icon: "ShieldCheck",
      title: "Password never leaves your device",
      description:
        "Both the PDF and the password you type stay in your browser tab. Nothing is uploaded, logged or remembered: the moment you close the page, both are gone.",
    },
    {
      icon: "TriangleAlert",
      title: "Clear, instant password feedback",
      description:
        "A wrong password is caught immediately with a plain message, so you can correct it and retry. No silent failures and no mangled output file.",
    },
    {
      icon: "FileCheck2",
      title: "Layout preserved exactly",
      description:
        "Every page is copied into a fresh, unencrypted document as-is. Fonts, images, form fields and page order come through unchanged.",
    },
    {
      icon: "Infinity",
      title: "No limits, no watermark",
      description:
        "Unlock as many PDFs as you like, of any size your device can handle. There's no daily cap, no sign-up and nothing stamped onto the result.",
    },
  ],

  benefits: [
    {
      title: "Stop re-typing the password",
      description:
        "Once unlocked, your PDF opens instantly in any reader. No prompt, no copy-pasting a password every single time you want to glance at it.",
    },
    {
      title: "Private by design",
      description:
        "Decryption runs locally with @cantoo/pdf-lib. Your file and password never reach a server, so there is nothing for us to store, read or leak.",
    },
    {
      title: "Honest about what it does",
      description:
        "This removes a password you already know from a PDF you own. It won't crack an unknown password: we're upfront rather than promising the impossible.",
    },
    {
      title: "Works on any device",
      description:
        "It's just a web page: no install, plugin or app. Unlock a PDF from a laptop, tablet or phone and get the same clean, unencrypted file.",
    },
  ],

  howTo: [
    {
      title: "Upload your locked PDF",
      description:
        "Drag the password-protected PDF onto the drop zone, or click to browse. Just one file, the one you want to unlock.",
    },
    {
      title: "Enter the password",
      description:
        "Type the password you already use to open the file. Use the show/hide toggle to check it before you continue.",
    },
    {
      title: "Unlock",
      description:
        "Hit Unlock PDF. The tool decrypts the file locally and rebuilds an unencrypted copy: in a moment, with no upload.",
    },
    {
      title: "Download the open copy",
      description:
        "Download your decrypted PDF. It now opens with no password prompt and is ready to read, edit or print.",
    },
  ],

  formats: {
    input: ["PDF (password-protected)"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Reuse an encrypted contract archive",
      description:
        "Decrypt a signed agreement you were sent with a password so you can search it, copy clauses and file it alongside your other unencrypted records.",
    },
    {
      audience: "Student",
      title: "Open protected lecture notes offline",
      description:
        "Remove the password from course PDFs you're entitled to so they open instantly on your tablet during exams prep. No password prompt mid-revision.",
    },
    {
      audience: "Business",
      title: "Prepare statements for your accountant",
      description:
        "Unlock the password-protected bank or payroll PDFs you receive each month so they can be merged, compressed and shared with your finance team.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says the password is incorrect.",
      solution:
        "The password is case-sensitive and must match exactly. Watch for a stray space, Caps Lock, or a different keyboard layout. Use the show/hide toggle to confirm every character before you retry.",
    },
    {
      problem: "The tool asks for a password but I don't have one.",
      solution:
        "This tool can only remove a password you know. It can't recover or bypass an unknown one. Ask whoever created or sent the PDF for the password, then come back and unlock it.",
    },
    {
      problem: "The file won't open even with the right password.",
      solution:
        "The PDF may use an uncommon or legacy cipher, or the file may be damaged. Try re-downloading the original from its source, or re-save it from the app that created it, then upload it again.",
    },
  ],

  tips: [
    "Only unlock PDFs you own or are authorised to open. This tool needs the real password and isn't a way around one you don't have.",
    "After unlocking, run the file through our Compress PDF tool if you plan to email it. Decrypted copies are sometimes slightly larger.",
    "Need to keep it protected but change the password? Unlock it here first, then set a new one with our Protect PDF tool.",
    "If your reader keeps prompting for a password after unlocking, make sure you saved and reopened the new decrypted file, not the original.",
  ],

  security:
    "Your PDF and the password you enter are processed entirely in your browser with @cantoo/pdf-lib: neither is ever uploaded, stored or logged. Decryption happens in memory on your device, and everything is discarded the instant you close the tab.",

  faq: [
    {
      question: "Do I need to know the password to unlock a PDF?",
      answer:
        "Yes. This tool decrypts a PDF using the password you already have, it's for files you own or are authorised to open. It cannot guess, crack or bypass an unknown password, and we deliberately don't pretend otherwise.",
    },
    {
      question: "Is my file or password uploaded anywhere?",
      answer:
        "No. Both the PDF and the password stay inside your browser tab. Decryption runs locally with @cantoo/pdf-lib, so nothing is sent to a server, stored or logged. When you close the page, both are gone.",
    },
    {
      question: "Will unlocking reduce quality or make text unselectable?",
      answer:
        "No. Your password genuinely decrypts the file, and each page is copied into a fresh document as-is. Text stays selectable, links keep working, and images and vectors keep their original quality: nothing is rasterised.",
    },
    {
      question: "What's the difference between the open password and permissions?",
      answer:
        "The open (user) password is what's needed to view the file at all: that's what this tool removes. Some PDFs also carry an owner password restricting printing or editing. Because we rebuild an unencrypted copy, those view-only restrictions are lifted too on the copy you download.",
    },
    {
      question: "Why does it say the cipher is unsupported?",
      answer:
        "A small number of PDFs use legacy or uncommon encryption schemes our in-browser engine can't read. If you hit that, try re-saving the file from the app that created it, or export a fresh copy, then upload it again.",
    },
    {
      question: "Is it really free and unlimited?",
      answer:
        "Yes. There's no account, no daily limit and no paywall, and nothing is watermarked. Because the work happens on your device rather than our servers, we can offer it free with no strings attached.",
    },
  ],

  relatedTools: ["pdf-password-protect", "merge-pdf", "compress-pdf", "pdf-editor"],
};

export default unlockPdf;
