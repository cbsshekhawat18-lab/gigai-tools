import type { Tool } from "@/types";

/**
 * Protect PDF; add an open password and AES encryption to a PDF, entirely in
 * the browser. All copy is unique to encryption and kept honest: the password
 * never leaves the device, the file is encrypted locally with @cantoo/pdf-lib,
 * and the result requires that exact password to open in any reader.
 */
const pdfPasswordProtect: Tool = {
  slug: "pdf-password-protect",
  title: "Protect PDF",
  description:
    "Add a password and AES encryption to any PDF so only people with the password can open it. Free, fast and completely in your browser.",
  category: "pdf-tools",
  group: "PDF Security",
  icon: "Lock",
  accent: "indigo",
  status: "live",
  featured: false,
  createdAt: "2026-07-02",

  h1: "Password-Protect a PDF Online, Free & Private",
  tagline:
    "Encrypt a PDF with a password that's required to open it. The document is locked with AES right on your device, and the password is never typed anywhere but your own browser. No uploads, no watermark.",
  longDescription:
    "The GigAI PDF Protector adds a genuine open password to your document using AES encryption, all inside your browser tab with @cantoo/pdf-lib. Drop in one PDF, choose a password, confirm it, and the tool rewrites the file so that any reader (Acrobat, Preview, Chrome, a phone) asks for that password before showing a single page. Because the encryption happens locally, neither the file nor the password ever touches a server, so there is nothing to intercept, log or leak. The result is a standard encrypted PDF you can email, share or archive, safe in the knowledge that the contents stay sealed until the right password is entered.",

  ctaText: "Protect PDF",

  keywords: [
    "protect pdf",
    "password protect pdf",
    "encrypt pdf",
    "add password to pdf",
    "pdf encryption",
    "lock pdf",
    "secure pdf online",
    "pdf password free",
    "aes encrypt pdf",
  ],

  seo: {
    title: "Protect PDF. Add a Password & Encrypt PDF Free | GigAI Tools",
    description:
      "Password-protect a PDF for free with real AES encryption. Set an open password in your browser, the file and password never leave your device. No sign-up, no watermark.",
  },

  features: [
    {
      icon: "KeyRound",
      title: "Real AES encryption",
      description:
        "Your PDF is sealed with AES, the same encryption standard readers like Acrobat expect. Not a fake overlay. Without the password, the pages simply won't open.",
    },
    {
      icon: "EyeOff",
      title: "Password never leaves your device",
      description:
        "You type the password into your own browser and nowhere else. It's used locally to encrypt the file and is never transmitted, stored or recoverable by us.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "The whole file is encrypted on your device with @cantoo/pdf-lib. Nothing is uploaded, so there's no server copy of your document to worry about.",
    },
    {
      icon: "CheckCheck",
      title: "Confirm before you lock",
      description:
        "A confirm field and a show/hide toggle mean you lock the file with exactly the password you intended. No silent typos that leave you locked out.",
    },
    {
      icon: "FileLock2",
      title: "Opens anywhere",
      description:
        "The protected PDF is a standard encrypted file. It prompts for the password in Acrobat, Preview, Chrome, Edge and mobile PDF apps alike.",
    },
  ],

  benefits: [
    {
      title: "Genuinely private",
      description:
        "Encryption and the password stay on your device. There's no upload, no round-trip and no server-side copy: the sensitive part never leaves your browser.",
    },
    {
      title: "You choose the password",
      description:
        "No auto-generated codes to keep track of. Pick a password you'll remember (and can share safely), confirm it, and it's the exact key to the file.",
    },
    {
      title: "Free with no watermark",
      description:
        "No account, no daily cap and nothing stamped onto your pages. Protect as many PDFs as you need, whenever you need to, at no cost.",
    },
    {
      title: "Works on any device",
      description:
        "It's a normal web page. No install or plugin. Encrypt a PDF from a laptop, tablet or phone and get the same standards-based protected file.",
    },
  ],

  howTo: [
    {
      title: "Upload your PDF",
      description:
        "Drag one PDF onto the drop zone, or click to browse. Only the file you want to protect is added: nothing is sent anywhere.",
    },
    {
      title: "Set a password",
      description:
        "Type the open password, then re-type it in the confirm field. Use the show/hide toggle to check it matches before you continue.",
    },
    {
      title: "Encrypt",
      description:
        "Hit Protect PDF. The tool encrypts the file with AES locally, so opening it will require your password from now on.",
    },
    {
      title: "Download",
      description:
        "Download the encrypted PDF and share it. Anyone who opens it, including you, will be prompted for the password first.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF (encrypted)"],
  },

  useCases: [
    {
      audience: "Professional",
      title: "Send a signed contract securely",
      description:
        "Lock an executed agreement with a password before emailing it to the other party, so a forwarded or intercepted message can't expose the terms.",
    },
    {
      audience: "Student",
      title: "Protect a thesis draft before sharing",
      description:
        "Add a password to an unpublished dissertation or research paper before sending it to a supervisor, keeping unreviewed work out of the wrong hands.",
    },
    {
      audience: "Business",
      title: "Distribute payroll and HR files",
      description:
        "Encrypt payslips, offer letters or performance reviews so only the intended employee, holding the password, can open their own document.",
    },
  ],

  troubleshooting: [
    {
      problem: "My PDF won't encrypt. It says it may already be protected.",
      solution:
        "You can't add a password to a file that's already encrypted. Remove the existing password first with our Unlock PDF tool (you'll need to know it), then protect the unlocked copy with a new one.",
    },
    {
      problem: "The Protect button stays disabled.",
      solution:
        "You need a queued PDF and a password that matches its confirmation. Check the two fields are identical, the show/hide toggle helps, and that the password isn't empty or only spaces.",
    },
    {
      problem: "I forgot the password I set.",
      solution:
        "There's no back door. The encryption is real, so a lost password can't be recovered by us or anyone else. Always store it in a password manager, and keep the original unprotected file somewhere safe.",
    },
  ],

  tips: [
    "Use a long passphrase. A few unrelated words are far harder to crack than a short, complex password and much easier to remember.",
    "Never send the password in the same email as the file. Share it separately, ideally over a different channel like a text or call.",
    "Keep an unprotected master copy in a safe place. If you ever forget the password, the encrypted file can't be reopened.",
    "Store the password in a password manager the moment you set it, so you and any intended recipient can retrieve it reliably.",
  ],

  security:
    "Your PDF is encrypted entirely in your browser with @cantoo/pdf-lib, and the password you type is used only on your device to lock the file. Neither the document nor the password is ever uploaded, stored or logged: when you close the tab, both are gone.",

  faq: [
    {
      question: "Is the password actually sent to your servers?",
      answer:
        "No. The password is used purely inside your browser to encrypt the PDF with AES. It's never transmitted, stored or logged anywhere. We couldn't recover it even if you asked, because it never reaches us in the first place.",
    },
    {
      question: "What kind of encryption is used?",
      answer:
        "The tool applies AES encryption via @cantoo/pdf-lib, the standard scheme PDF readers expect. The file is genuinely encrypted, not hidden behind a flag, so it can only be opened by supplying the correct password.",
    },
    {
      question: "Will the protected PDF ask for a password in every app?",
      answer:
        "Yes. Because it's a standard encrypted PDF, Acrobat, Preview, Chrome, Edge and mobile PDF apps will all prompt for the password before displaying any page. That includes you, so keep the password safe.",
    },
    {
      question: "Can I remove the password later?",
      answer:
        "Yes, as long as you know it. Use our Unlock PDF tool, enter the password, and it produces an unencrypted copy. Without the password, though, the file stays locked for good.",
    },
    {
      question: "What happens if I lose the password?",
      answer:
        "The file cannot be reopened. The encryption is real and has no back door, so a forgotten password means a permanently locked document. Always store the password in a manager and keep an unprotected backup of the original.",
    },
    {
      question: "Is it really free?",
      answer:
        "Completely. There's no account, daily limit, paywall or watermark. Because the encryption runs on your device rather than our servers, we don't pay to process your files, so we can offer it free with no strings attached.",
    },
  ],

  relatedTools: ["unlock-pdf", "merge-pdf", "compress-pdf", "ocr-pdf"],
};

export default pdfPasswordProtect;
