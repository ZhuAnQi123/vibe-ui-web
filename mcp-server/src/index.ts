#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createVibeMcpServer } from "./server.js";

async function main() {
  const server = createVibeMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vibe MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in Vibe MCP Server:", error);
  process.exit(1);
});
