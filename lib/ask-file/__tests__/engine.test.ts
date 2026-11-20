/** Ask Your File engine tests - the pure, Node-runnable parts. */

import { describe, expect, it } from "vitest";

import { actPlans } from "@/lib/ask-file/engine";
import type { IngestedFile } from "@/lib/ask-file/engine";

const entry = (texts: string[]): IngestedFile => ({
  hash: "h",
  name: "doc.txt",
  chunks: texts.map((text, id) => ({ id, where: `p.${id + 1}`, text, embedding: [] })),
});

describe("act plans", () => {
  it("extract-contacts finds emails and phones with locations", async () => {
    const plan = actPlans().find((p) => p.action === "extract-contacts")!;
    const out = await plan.run(entry(["Contact hello@example.com or +91 98765 43210 for help."]), new File([], "x"));
    const csv = await out.blob.text();
    expect(csv).toContain('email,"hello@example.com","p.1"');
    expect(csv).toContain("phone");
  });

  it("extract-amounts finds currency values", async () => {
    const plan = actPlans().find((p) => p.action === "extract-amounts")!;
    const out = await plan.run(entry(["Total due ₹1,499.50 plus $20 shipping."]), new File([], "x"));
    const csv = await out.blob.text();
    expect(csv).toContain("₹1,499.50");
    expect(csv).toContain("$20");
  });

  it("redact-pii masks and verifies", async () => {
    const plan = actPlans().find((p) => p.action === "redact-pii")!;
    const out = await plan.run(entry(["Customer PAN: ABCPE1234F on file."]), new File([], "x"));
    const text = await out.blob.text();
    expect(text).not.toContain("ABCPE1234F");
    expect(out.note).toContain("verification");
  });

  it("act plans fail honestly on empty matches", async () => {
    const plan = actPlans().find((p) => p.action === "extract-contacts")!;
    await expect(plan.run(entry(["nothing to see here"]), new File([], "x"))).rejects.toThrow(/No emails/);
  });

  it("page-summary is extractive", async () => {
    const plan = actPlans().find((p) => p.action === "page-summary")!;
    const out = await plan.run(entry(["First sentence here. Second sentence ignored."]), new File([], "x"));
    const text = await out.blob.text();
    expect(text).toContain("[p.1] First sentence here.");
    expect(text).not.toContain("Second sentence");
  });
});
