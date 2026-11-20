---
title: "How to Edit or Remove PDF Metadata (and Why It Matters for Privacy)"
description: "PDFs carry hidden metadata, author names, software, edit history, timestamps. Learn what's in there, why it's a privacy risk, and how to view, edit, or strip it before sharing."
date: "2026-07-04"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "document-tools"
tags: ["metadata", "privacy", "pdf", "how-to", "security"]
featured: true
---

Every PDF you create carries a small invisible dossier about itself: who made it, what software produced it, when it was created and last modified, and often a title and set of keywords you never typed. This is *metadata*, data about the document rather than the document's visible content. Most of the time it's harmless. Occasionally it quietly tells the recipient something you'd rather they didn't know: your real name on an "anonymous" submission, the internal file title from a template, or the fact that a "brand-new" proposal was actually last edited three weeks ago. This guide explains what's in there and how to view, change, or wipe it before you hit send.

## What counts as PDF metadata

PDF metadata comes in a few flavors, and it's worth knowing them because they aren't all removed the same way.

### The document properties

These are the classic fields any PDF reader can display: **Title, Author, Subject, Keywords, Creator** (the app you authored in), and **Producer** (the library that wrote the final PDF). There are also **CreationDate** and **ModDate** timestamps. Open almost any PDF's properties panel and you'll see them, sometimes populated with a former colleague's name, a template's leftover title, or the exact name of the software you used.

### XMP metadata

Modern PDFs often also embed an XMP packet, a block of structured metadata that can duplicate the document properties and add more: copyright statements, editing history, and application-specific tags. Stripping the visible properties without clearing XMP can leave copies of the same information behind, which is why a proper metadata tool handles both.

### The stuff that *isn't* metadata (but people confuse for it)

Hidden layers, comments, annotations, and cropped-but-not-deleted content are content, not metadata. Removing metadata won't touch them. If you're preparing a document for public release, treat those separately, our guide on [cleaning up a PDF before sharing](/blog/clean-up-a-pdf-before-sharing) covers that wider sweep.

## Why metadata is a real privacy issue

It's easy to dismiss metadata as trivia until you picture the moment it leaks:

- **De-anonymization.** A whistleblower, job applicant, or peer reviewer sends a supposedly anonymous PDF whose Author field is their full name.
- **Revealing your tools and workflow.** The Creator/Producer fields announce exactly which software you use, occasionally including version numbers that hint at unpatched vulnerabilities, and sometimes a pirated app's watermark string.
- **Contradicting your story.** You tell a client the report is fresh. The ModDate says it was finished last month and only reopened today. Timestamps have derailed more than a few negotiations and legal matters.
- **Template residue.** Corporate templates often bake in a Title like "Confidential, Internal Draft v3" that rides along into the version you email externally.

None of this shows on the page. That's precisely why it slips through: you proofread what you can see, not the invisible fields attached to the file.

## How to view your PDF's metadata

Before you change anything, look at what's actually there. You can check quickly in most desktop readers via **File → Properties** (or Document Properties). For a fast, no-install look (and the ability to edit right away) open the file in our [PDF metadata editor](/document-metadata-editor). It reads the file locally in your browser and shows every field it finds, so you can see exactly what a recipient would.

You'll often be surprised. Fields you never filled in are frequently populated automatically by whatever created the file, which is exactly the point: the software wrote your details in for you.

## How to edit or remove PDF metadata

There are two goals people have, and the tool serves both:

### Editing (correcting or setting fields)

Sometimes you don't want the fields *gone*. You want them *right*. Setting a proper Title improves how the file appears in search results, bookmark lists, and reading apps, since many of them display the Title rather than the filename. Setting the Author and Keywords deliberately is good hygiene for documents you publish. To do this, open the file, overwrite each field with the value you want, and save.

### Removing (stripping it clean)

When privacy is the goal, you want the fields emptied entirely. The safe workflow:

1. **Open the PDF** in the [metadata editor](/document-metadata-editor). The file loads into your browser. It isn't uploaded anywhere.
2. **Review every field**, including any XMP data, so you know what's being carried.
3. **Clear the sensitive fields**, Author, Title, Subject, Keywords, and Creator/Producer if you'd rather not advertise your toolchain.
4. **Save a clean copy.** Keep your original. Export the stripped version for sharing.

Because this happens in the browser, your document (which is presumably sensitive, or you wouldn't care about its metadata) never travels to a server. That is the point of doing privacy work with a private tool, a principle we unpack in [Are online PDF and image tools safe?](/blog/are-online-pdf-and-image-tools-safe).

## A pre-send routine worth building

For anything going outside your organization, spend thirty seconds on this:

- **Check the Author and Title.** These leak most often. Blank them or set them intentionally.
- **Decide about timestamps.** If the edit date tells a story you don't want told, be aware of it: some workflows regenerate a clean file to reset it.
- **Strip Creator/Producer** if you'd rather not disclose your software stack.
- **Handle content separately.** Metadata scrubbing won't remove comments, hidden layers, or cropped material, clean those too if the document is going public.

## Small, invisible, and worth checking

PDF metadata is small, invisible, and easy to forget, which is exactly what makes it a reliable source of accidental leaks. The fix is quick: look at what your file is actually carrying, then either correct the fields or wipe them before sharing. Do it with a tool that works in your browser so the document itself stays on your device throughout.

Take a look right now. Open your file in the [PDF metadata editor](/document-metadata-editor) and see what it's been quietly telling people. While you're tidying documents for sending, you might also want to [sign a PDF privately](/document-signature) or read our broader checklist on [cleaning up a PDF before sharing](/blog/clean-up-a-pdf-before-sharing).

## Two tools, two depths of cleaning

We split this job in two on purpose. The [metadata editor](/document-metadata-editor) lets you view and correct the standard fields (title, author, subject, keywords) when the goal is accuracy. The [metadata remover](/remove-metadata) is the scorched-earth option for when the goal is privacy before sharing. Both operate on your file in the browser. Nothing uploads, which for a task whose entire purpose is preventing information leaks is the only architecture that makes sense.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
