---
description: Use the GigAI Tools developer API from code with the Node client and CLI (npm gigai-tools), the Python client (PyPI gigai-tools) or the MCP server for AI agents (npm gigai-tools-mcp).
---

# API clients

Three clients call the [developer API](developer-api.md). Each lives in its own repository and reads your key from `GIGAI_API_KEY`. Create a key at [gigai.tools/developers](https://gigai.tools/developers), or on your own install's dashboard.

## Node client and CLI

[npm `gigai-tools`](https://www.npmjs.com/package/gigai-tools) · [source](https://github.com/cbsshekhawat18-lab/gigai-tools-node) · Node 18+, no dependencies.

```sh
npm install gigai-tools
```

```js
import { Client } from "gigai-tools";

const client = new Client(); // reads GIGAI_API_KEY
await client.run("merge-pdf", { files: ["a.pdf", "b.pdf"], output: "merged.pdf" });
```

The package also installs a `gigai` command for the same operations from a terminal.

## Python client

[PyPI `gigai-tools`](https://pypi.org/project/gigai-tools/) · [source](https://github.com/cbsshekhawat18-lab/gigai-tools-python)

```sh
pip install gigai-tools
```

## MCP server for AI agents

[npm `gigai-tools-mcp`](https://www.npmjs.com/package/gigai-tools-mcp) · [source](https://github.com/cbsshekhawat18-lab/gigai-tools-mcp)

An MCP server that gives an AI agent the API's file tools: merge PDFs, convert images, make QR codes and more. It runs as `gigai-mcp`. The setup for Claude Desktop and other MCP clients is on [gigai.tools/developers/docs/mcp](https://gigai.tools/developers/docs/mcp).

## Your own install

The clients call `https://api.gigai.tools/v1` by default. To use your own install, set `GIGAI_API_BASE` to its `/v1` address, or pass `baseUrl` (Node) or `base_url` (Python).
