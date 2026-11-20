import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Code, DocH2, DocsShell, P } from "../docs-shell";

export const metadata: Metadata = buildMetadata({
  title: "MCP server - GigAI tools for AI agents",
  description:
    "Give Claude and other MCP clients real file tools: merge PDFs, convert images, generate QR codes. Setup for Claude Desktop and Claude Code.",
  canonical: "/developers/docs/mcp",
});

export default function DocsMcp() {
  return (
    <DocsShell
      title="MCP server"
      lead="One config block gives an AI agent every tool in the catalog. The server reads the live catalog at startup, so it never offers a tool the API cannot run."
      current="/developers/docs/mcp"
    >
      <div>
        <DocH2 id="setup">Setup</DocH2>
        <P>
          You need an API key from the{" "}
          <Link href="/developers/dashboard" className="text-primary hover:underline">
            dashboard
          </Link>
          . Claude Desktop config:
        </P>
        <Code label="claude_desktop_config.json">{`{
  "mcpServers": {
    "gigai-tools": {
      "command": "npx",
      "args": ["-y", "gigai-tools-mcp"],
      "env": {
        "GIGAI_API_KEY": "gk_live_...",
        "GIGAI_MCP_OUT_DIR": "/path/where/results/go"
      }
    }
  }
}`}</Code>
        <Code label="claude code">{`claude mcp add gigai-tools -e GIGAI_API_KEY=gk_live_... -- npx -y gigai-tools-mcp`}</Code>
      </div>

      <div>
        <DocH2 id="tools">What the agent gets</DocH2>
        <P>
          Every catalog engine becomes a tool - all of them, from merge_pdf and
          ocr_pdf to detect_pii and generate_qr. The list comes from the live
          catalog at startup, so new engines appear without updating the
          package. Tools take local file paths or URLs.
          Results are saved to GIGAI_MCP_OUT_DIR and the tool answer names the
          saved paths - file bytes never pass through the model&apos;s context.
        </P>
        <P>
          Ask the agent things like &quot;merge these three PDFs and give me the
          file&quot; or &quot;make a QR code for our launch page&quot; and it picks
          the right tool with the right options.
        </P>
      </div>

      <div>
        <DocH2 id="agent-plan">agent_plan (v0.2.0)</DocH2>
        <P>
          One extra tool, agent_plan, turns a goal sentence into an ordered
          pipeline of this server&apos;s own tools with ready-to-use options -
          &quot;shrink this photo to under 150 KB as WebP&quot; comes back as
          resize → convert → compress steps the agent can execute directly. It
          sends only file metadata (basename, type, size), never contents, and
          is rate-limited to 10 plans per day per account. When the free-tier
          planning capacity behind it is unavailable it says so honestly and
          the agent falls back to picking tools from the list itself.
        </P>
      </div>

      <div>
        <DocH2 id="source">Source</DocH2>
        <P>
          The server is about 100 lines on top of the Node SDK:{" "}
          <a
            href="https://github.com/cbsshekhawat18-lab/gigai-tools-mcp"
            className="text-primary hover:underline"
            rel="noopener"
          >
            github.com/cbsshekhawat18-lab/gigai-tools-mcp
          </a>
          . Files sent through it follow the same rules as the rest of the API:
          contents never logged, deleted after retention, deletion verified.
        </P>
      </div>
    </DocsShell>
  );
}
