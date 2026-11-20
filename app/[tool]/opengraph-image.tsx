import { ImageResponse } from "next/og";

import { getAllTools, getToolBySlug } from "@/lib/registry";
import { CATEGORIES } from "@/config/categories";

/**
 * Per-tool social card: a unique, on-brand 1200×630 PNG for every tool,
 * generated statically at build time (proven to work with `output: export`).
 * The tool page's generateMetadata drops its explicit OG image so Next injects
 * this convention image as both og:image and twitter:image.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
export const alt = "GigAI Tools";

/** Category accent → hex, matching the site's accent palette (satori needs hex). */
const ACCENT_HEX: Record<string, string> = {
  sky: "#38bdf8",
  rose: "#fb7185",
  cyan: "#22d3ee",
  indigo: "#818cf8",
  orange: "#fb923c",
  amber: "#fbbf24",
  emerald: "#34d399",
  violet: "#a78bfa",
};

export function generateStaticParams(): { tool: string }[] {
  return getAllTools()
    .filter((tool) => tool.status === "live")
    .map((tool) => ({ tool: tool.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  const cat = CATEGORIES.find((c) => c.slug === tool?.category);
  const title = tool?.h1 ?? tool?.title ?? "GigAI Tools";
  const accent = ACCENT_HEX[tool?.accent ?? cat?.accent ?? "indigo"] ?? "#818cf8";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0b0f19",
          color: "#ffffff",
          padding: "72px",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        {/* accent bar */}
        <div style={{ display: "flex", width: "120px", height: "10px", borderRadius: "6px", background: accent }} />

        {/* category eyebrow */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", width: "18px", height: "18px", borderRadius: "5px", background: accent, marginRight: "16px" }} />
          <div style={{ display: "flex", fontSize: "30px", color: "#9aa0b4", letterSpacing: "2px" }}>
            {(cat?.name ?? "GigAI Tools").toUpperCase()}
          </div>
        </div>

        {/* tool title */}
        <div style={{ display: "flex", fontSize: "92px", fontWeight: 700, lineHeight: 1.02, maxWidth: "1010px" }}>
          {title}
        </div>

        {/* brand + tagline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 700 }}>
            <span style={{ color: "#ffffff" }}>gigai</span>
            <span style={{ color: accent }}>.tools</span>
          </div>
          <div style={{ display: "flex", fontSize: "26px", color: "#9aa0b4" }}>
            Free · Private · In your browser
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
