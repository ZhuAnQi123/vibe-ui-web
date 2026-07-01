# @vibe-ui-n-motion/mcp

Vibe UI & Motion 的 MCP Server — 让 Cursor 等 AI 工具直接读取 UI 设计规范与动效参数。

完整配置、发布与维护说明见仓库根目录 [docs/MCP_GUIDE.md](../docs/MCP_GUIDE.md)。

## Quick Start

```bash
# 在 vibe-ui-web 根目录
npm run catalog:build

cd mcp-server
npm install
npm run build
npm start   # stdio MCP
```

## Cursor Config

```json
{
  "mcpServers": {
    "vibe-ui": {
      "command": "node",
      "args": ["/path/to/vibe-ui-web/mcp-server/dist/index.js"]
    }
  }
}
```

Remote mode:

```json
{
  "env": {
    "VIBE_API_URL": "https://vibe-ui-prompt.online"
  }
}
```
