import type { Tool } from "@/types";

/**
 * PDF Forms, fills and flattens EXISTING AcroForm fields.
 *
 * Scope is stated everywhere on purpose: it does not author new fields onto a
 * flat page. A user arriving with a scan needs sending to PDF Editor, not
 * letting down after an upload. The flatten default is the security story -
 * an un-flattened form still carries editable values and their history.
 */
const pdfForms: Tool = {
  slug: "pdf-forms",
  title: "Fill PDF Forms",
  description:
    "Fill in a PDF form in your browser and flatten it, so your answers are baked into the page and can't be edited by whoever receives it.",
  category: "pdf-tools",
  group: "Edit PDF",
  icon: "ClipboardList",
  accent: "sky",
  processor: "convert",
  status: "live",
  serverSide: false,
  createdAt: "2026-08-11",

  h1: "Fill PDF Forms Online, Then Flatten Them",
  tagline: "Complete the form, lock the answers, keep the file private.",
  ctaText: "Fill a PDF form",

  longDescription:
    "Filling in a PDF form usually means one of three bad options: printing it, writing on it and scanning it back. Installing a heavyweight reader, or uploading a document full of personal details to a website you found in a search result. GigAI Fill PDF Forms does it in your browser instead. Drop the form in and its fields are read immediately, text boxes, checkboxes, radio groups, dropdowns and option lists all appear as ordinary inputs with whatever values the form already carries, so you can see the real structure straight away rather than after committing to anything. Type your answers, then export. The important part is the flattening, and it's on by default for a reason most people never think about. A filled-but-unflattened PDF still carries its form fields as live objects, which means the person you send it to can click into any box and change your answer, and, depending on how the file was saved, can sometimes read what was in there before you edited it. Flattening bakes the values into the page as ordinary content and removes the fields entirely, which is what people actually mean when they say a form is 'completed'. Now the honest scope: this fills the fields a PDF already has. It does not draw new fields onto a flat page. If your document is a scan, or a form that was designed to be printed, there are no fields to fill (the boxes you can see are printed lines, not interactive widgets) and the tool tells you exactly that and points you at PDF Editor, where you can type directly onto the page instead. Pretending a text box drawn over a scan is a form field would be the kind of half-truth this platform avoids. Free, unlimited, no account, and the form never leaves your device, which matters a great deal when the thing you're typing in is your address, your salary or your passport number.",

  keywords: [
    "fill pdf form",
    "pdf form filler",
    "fill out pdf online",
    "flatten pdf form",
    "complete pdf form",
    "fillable pdf online",
    "pdf form filler free",
    "lock pdf form fields",
  ],

  tags: ["pdf", "forms", "acroform", "flatten", "productivity"],
  fileTypes: ["pdf"],
  audiences: ["business", "students", "legal", "hr"],

  seo: {
    title: "Fill PDF Forms Online Free: Complete and Flatten in Your Browser",
    description:
      "Fill in a PDF form and flatten it so answers can't be edited. Runs entirely in your browser: your form is never uploaded. Free, no sign-up, no watermark.",
  },

  features: [
    {
      icon: "ClipboardList",
      title: "Fields read the moment you drop the file",
      description:
        "Text boxes, checkboxes, radio groups and dropdowns appear as ordinary inputs, pre-filled with whatever the form already contains: before you commit to anything.",
    },
    {
      icon: "Lock",
      title: "Flattening on by default",
      description:
        "Bakes your answers into the page and removes the fields, so the recipient can't edit what you entered, or read what was there before you changed it.",
    },
    {
      icon: "CloudOff",
      title: "Your details never leave the device",
      description:
        "Forms are exactly the documents that hold addresses, salaries and ID numbers. Nothing is uploaded, stored or logged: the filling happens in the tab.",
    },
    {
      icon: "ListChecks",
      title: "Dropdowns show their real options",
      description:
        "Radio groups and dropdowns present the choices the form actually declares, so you can't submit a value the document will reject.",
    },
    {
      icon: "Info",
      title: "Says when there's no form to fill",
      description:
        "A scan or a print-designed page has no fields. Rather than doing nothing, the tool says so plainly and sends you to PDF Editor to type on the page instead.",
    },
  ],

  benefits: [
    {
      title: "No printing, signing, scanning",
      description:
        "Complete a form and send it back the same minute, with typed answers that are legible rather than a photograph of your handwriting.",
    },
    {
      title: "Answers that stay put",
      description:
        "A flattened form can't be quietly altered after you send it. Useful when the document is an application, a claim or an agreement.",
    },
    {
      title: "Private by construction",
      description:
        "The information you type into a form is usually the most sensitive thing you'd ever put in a document. None of it is transmitted.",
    },
  ],

  howTo: [
    {
      title: "Add the PDF form",
      description:
        "Drop it in. The fields are read straight away in your browser and listed as inputs.",
    },
    {
      title: "Fill in the fields",
      description:
        "Type into text boxes, tick checkboxes, pick from dropdowns. Read-only fields are shown but locked, exactly as the form intends.",
    },
    {
      title: "Choose whether to flatten",
      description:
        "Leave flattening on so your answers are baked in and can't be edited. Turn it off only if you need the form to stay editable for someone else.",
    },
    {
      title: "Download the completed form",
      description: "Save it and send it on. Need a signature too? Use Sign PDF.",
    },
  ],

  formats: {
    input: ["PDF"],
    output: ["PDF"],
  },

  useCases: [
    {
      audience: "Business",
      title: "Supplier and onboarding forms",
      description:
        "Complete a vendor form or new-starter pack cleanly and return it flattened, so nobody downstream can adjust a figure.",
    },
    {
      audience: "Students",
      title: "Applications and enrolment",
      description:
        "Fill an application without a printer, and send back something legible rather than a photo of a handwritten page.",
    },
    {
      audience: "Legal & HR",
      title: "Documents holding personal data",
      description:
        "Claim forms, contracts and HR paperwork are filled in on your own machine, so nothing personal is uploaded to complete them.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says the PDF has no fillable fields",
      solution:
        "Then it genuinely has none, it's a scan, or a form designed for printing, and the boxes you can see are printed lines rather than interactive widgets. Use PDF Editor to type directly onto the page, then Sign PDF if a signature is needed.",
    },
    {
      problem: "A field is greyed out",
      solution:
        "It's marked read-only in the form itself, usually a reference number or a calculated total the issuer doesn't want changed. The tool shows it so you can read it, but respects the setting rather than overriding the document's intent.",
    },
    {
      problem: "The field names don't match the labels on the page",
      solution:
        "Common and not a fault. A form's internal field names are set by whoever built it and often differ from the visible labels: you'll see things like 'Text1' or 'topmostSubform[0]'. Match them by position: the list is in the form's own field order.",
    },
    {
      problem: "My answers disappeared after flattening",
      solution:
        "Usually a font issue: the form's appearance couldn't be regenerated before flattening. Try again with flattening turned off to confirm the values are set, then flatten a second pass. If the values show unflattened but not flattened, send the unflattened file. The answers are correct in it.",
    },
  ],

  tips: [
    "Keep flattening on unless you specifically need the recipient to edit the form.",
    "Flattening also stops anyone reading earlier values that a filled form can retain.",
    "No fields at all? It's a scan: PDF Editor lets you type straight onto the page.",
    "Fill first, sign second: flattening after signing can rasterise a signature you'd rather keep crisp.",
  ],

  security:
    "Forms hold the most sensitive things most people ever type into a document: addresses, salaries, dates of birth, ID and account numbers. None of it leaves your device: the PDF is read, filled and rewritten inside your browser, nothing is uploaded, stored or logged, and you can complete a form with the network disconnected. Flattening, which is on by default, additionally removes the live form fields from the file you send, so a recipient cannot edit your answers or recover values that were in the fields before you changed them.",

  faq: [
    {
      question: "What does flattening a PDF form do?",
      answer:
        "It bakes your answers into the page as ordinary content and removes the interactive fields. Without it, the file you send still contains live form fields. The recipient can click into any box and change your answer, and depending on how the file was saved may be able to see what was there before you edited it. Flattening is what people mean when they say a form is 'completed'.",
    },
    {
      question: "Can I add form fields to a PDF that doesn't have any?",
      answer:
        "Not with this tool, and we'd rather say so than imply otherwise. This fills the fields a document already declares. If your PDF is a scan or was designed for printing, there are no fields to fill. Use PDF Editor to type directly onto the page, which is what you actually want in that case.",
    },
    {
      question: "Is my form uploaded anywhere?",
      answer:
        "No. The PDF is read, filled and saved entirely in your browser. Nothing is uploaded, stored or logged, which matters here more than on most tools, given what forms contain. Disconnect from the network and it still works.",
    },
    {
      question: "Why do the field names look like gibberish?",
      answer:
        "Because they're the internal names chosen by whoever built the form, not the labels printed on the page. Names like 'Text1' or 'topmostSubform[0].Page1[0]' are normal. The fields are listed in the form's own order, so you can match them to the page by position.",
    },
    {
      question: "Can I sign the form as well?",
      answer:
        "Use Sign PDF for that, it's built for placing a signature. Fill and flatten here first, then sign, so flattening doesn't rasterise your signature afterwards.",
    },
  ],

  changelog: [
    { date: "2026-08-11", change: "Fill PDF Forms released, AcroForm filling with flatten-by-default." },
  ],

  relatedTools: ["pdf-editor", "document-signature", "pdf-password-protect", "merge-pdf"],
};

export default pdfForms;
