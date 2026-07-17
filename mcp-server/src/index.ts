#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createVibeMcpServer } from "./server.js";
import http from "node:http";

// 启动一个极轻量的 HTTP 服务供前端跨域探测连接状态
function startProbeServer(port = 31337) {
  const server = http.createServer((req, res) => {
    // 允许前端 Web 域名及本地开发环境跨域请求
    const allowedOrigins = [
      "https://vibe-ui-prompt.online",
      "http://localhost:3000"
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "Vibe MCP is running locally!" }));
  });
  server.listen(port, "127.0.0.1");
}

async function main() {
  const server = createVibeMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vibe MCP Server running on stdio");
  startProbeServer();
}

main().catch((error) => {
  console.error("Fatal error in Vibe MCP Server:", error);
  process.exit(1);
});
