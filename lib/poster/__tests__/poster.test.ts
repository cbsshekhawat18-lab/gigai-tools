import { describe, expect, it } from "vitest";

import { badgeMetrics, coverFit, panForFace, zoneRect } from "@/lib/poster/render";
import { RESERVED_SLUGS, SLUG_RE, slugProblem, suggestSlug } from "@/lib/poster/slug";

describe("coverFit", () => {
  it("scales a landscape image to cover a square", () => {
    const f = coverFit(2000, 1000, 400, 400);
    expect(f.h).toBe(400);
    expect(f.w).toBe(800);
  });
  it("scales a portrait image to cover a wide box", () => {
    const f = coverFit(1000, 2000, 400, 300);
    expect(f.w).toBe(400);
    expect(f.h).toBe(800);
  });
});

describe("zoneRect", () => {
  it("resolves circles by width and boxes by both axes at any canvas size", () => {
    const c = zoneRect({ shape: "circle", cx: 0.2, cy: 0.16, r: 0.1 }, 1080, 1350);
    expect(c).toEqual({ cx: 216, cy: 216, w: 216, h: 216, radius: 108 });
    const b = zoneRect({ shape: "box", cx: 0.8, cy: 0.83, w: 0.26, h: 0.27, radius: 0.015 }, 2000, 2500);
    expect(b.w).toBeCloseTo(520);
    expect(b.h).toBeCloseTo(675);
    expect(b.radius).toBeCloseTo(30);
  });
});

describe("panForFace", () => {
  it("is zero for a centred face", () => {
    expect(panForFace(0.5, 0.5, 1000, 1000, 200, 200)).toEqual({ panX: -0, panY: -0 });
  });
  it("pans left when the face sits on the right of the image", () => {
    const p = panForFace(0.8, 0.5, 1000, 1000, 200, 200);
    expect(p.panX).toBeLessThan(0);
    expect(p.panY).toBeCloseTo(0);
    // face offset 0.3 * cover width 200 = 60px -> -0.3 of the box
    expect(p.panX).toBeCloseTo(-0.3);
  });
  it("grows with zoom", () => {
    expect(panForFace(0.8, 0.5, 1000, 1000, 200, 200, 2).panX).toBeCloseTo(-0.6);
  });
});

describe("badgeMetrics", () => {
  it("never exceeds half the canvas and keeps a minimum width", () => {
    const wide = badgeMetrics(5000, 5000, 40, 1080, true);
    expect(wide.w).toBeCloseTo(1080 * 0.52);
    const narrow = badgeMetrics(10, 10, 40, 1080, true);
    expect(narrow.w).toBeCloseTo(280);
    expect(narrow.h).toBeCloseTo(108);
  });
  it("single-line badge is a pill", () => {
    const m = badgeMetrics(100, 0, 40, 1080, false);
    expect(m.r).toBeCloseTo(m.h / 2);
  });
});

describe("slug rules", () => {
  it("matches the server regex and reserved list", () => {
    expect(SLUG_RE.test("puneet")).toBe(true);
    expect(SLUG_RE.test("ward-76-jaipur")).toBe(true);
    expect(SLUG_RE.test("ab")).toBe(false);
    expect(SLUG_RE.test("-lead")).toBe(false);
    expect(SLUG_RE.test("Trail-")).toBe(false);
    expect(RESERVED_SLUGS.has("create")).toBe(true);
    expect(slugProblem("admin")).toMatch(/reserved/);
    expect(slugProblem("puneet")).toBeNull();
  });
  it("suggests an ASCII slug from a name", () => {
    expect(suggestSlug("Puneet Karnawat")).toBe("puneet-karnawat");
    expect(suggestSlug("  Ramesh  Sharma!! ")).toBe("ramesh-sharma");
    expect(suggestSlug("पुनीत")).toBe("");
  });
});
