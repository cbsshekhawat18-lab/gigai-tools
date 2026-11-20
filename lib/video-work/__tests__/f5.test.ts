/** Feature 5 unit tests: parsing, chunking, ticket bodies, email draft. */

import { describe, expect, it } from "vitest";

import { chunkText, parseFile } from "@/lib/video-work/context";
import { buildTicketBody, clientEmailDraft, previewTickets } from "@/lib/video-work/trackers";
import type { Finding, Project } from "@/lib/video-work/types";

const finding = (over: Partial<Finding> = {}): Finding => ({
  id: "BUG-004",
  type: "BUG" as Finding["type"],
  title: "Checkout button unresponsive",
  priority: "P1" as Finding["priority"],
  confidence: 90,
  area: "checkout",
  description: "The pay button does nothing on tap.",
  observed: "Nothing happens",
  expected: "Payment sheet opens",
  stepsToReproduce: ["Open cart", "Tap Pay"],
  interpretation: "",
  acceptanceCriteria: ["Payment sheet opens on tap"],
  dependencies: [],
  evidence: { videoId: "v1", timestampMs: 83_000, frameTimeMs: null, clientStatement: "when I press pay, nothing" },
  status: "OPEN" as Finding["status"],
  needsConfirmation: false,
  ...over,
});

const project = { name: "Acme" } as unknown as Project;

describe("context parsing", () => {
  it("chunks long text with overlap", () => {
    const chunks = chunkText("x".repeat(4000));
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0]!.length).toBe(1600);
  });

  it("parses markdown by headings", async () => {
    const md = new File(["# Intro\nhello\n\n## Login flow\nThe LoginWidget handles auth."], "spec.md");
    const parts = await parseFile(md);
    expect(parts.length).toBe(2);
    expect(parts[1]!.where).toContain("Login flow");
  });

  it("parses csv in row windows", async () => {
    const rows = ["id,title", ...Array.from({ length: 45 }, (_, i) => `T-${i},thing ${i}`)].join("\n");
    const parts = await parseFile(new File([rows], "tickets.csv"));
    expect(parts.length).toBe(3);
    expect(parts[0]!.where).toBe("rows 1-20");
  });

  it("parses a json ticket export per item", async () => {
    const parts = await parseFile(new File([JSON.stringify([{ id: "APP-7" }, { id: "APP-9" }])], "export.json"));
    expect(parts.length).toBe(2);
    expect(parts[1]!.text).toContain("APP-9");
  });
});

describe("ticket export", () => {
  it("builds a body with evidence quote and timestamp", () => {
    const body = buildTicketBody(finding(), project);
    expect(body).toContain('"when I press pay, nothing"');
    expect(body).toContain("1:23");
    expect(body).toContain("- [ ] Payment sheet opens on tap");
  });

  it("includes spec refs when enrichment attached them", () => {
    const enriched = Object.assign(finding(), {
      relatedSpecRefs: [{ file: "spec.pdf", where: "p.4", excerpt: "", score: 0.7 }],
    });
    expect(buildTicketBody(enriched, project)).toContain("spec.pdf (p.4)");
  });

  it("previews carry labels and ids", () => {
    const [t] = previewTickets([finding()], project);
    expect(t!.title).toBe("[BUG-004] Checkout button unresponsive");
    expect(t!.labels).toContain("BUG");
  });
});

describe("client email draft", () => {
  it("groups bugs, requests and open questions with timestamps", () => {
    const draft = clientEmailDraft(project, [
      finding(),
      finding({ id: "FEAT-1", type: "FEATURE" as Finding["type"], title: "Add dark mode", needsConfirmation: true }),
    ]);
    expect(draft).toContain("Issues to fix:");
    expect(draft).toContain("Checkout button unresponsive (at 1:23)");
    expect(draft).toContain("Changes and requests:");
    expect(draft).toContain("Open questions");
    expect(draft).toContain("Add dark mode");
  });
});
