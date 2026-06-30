# Vibe MCP Server 配置与发布指南

本文说明 **Vibe MCP Server** 的架构决策、本地/远程使用方式，以及内容更新后如何同步到所有用户。

---

## 1. 为什么放在 `vibe-ui-web`？

| 方案                    | 优点                                                                                  | 缺点                               |
| ----------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| **vibe-ui**             | 内容同源                                                                              | 只管 UI，用户需再挂一个 motion MCP |
| **vibe-motion**         | 内容同源                                                                              | 只管动效，用户需再挂一个 ui MCP    |
| **vibe-ui-web（推荐）** | 已有 `catalog.json` 聚合层；统一搜索/筛选；可本地 + 云端双模式；内容库保持纯 Markdown | 需在 web 仓库维护 MCP 代码         |

**结论**：MCP Server 放在 `vibe-ui-web/mcp-server/`，作为 **分发层（Distribution Layer）**。  
`vibe-ui` 和 `vibe-motion` 继续只负责写 `.md` 内容，不碰 MCP 基础设施。

数据流：

```text
vibe-ui (.md)  ──┐
                 ├──► catalog:build ──► catalog.json ──► MCP Server / Web API
vibe-motion (.md)┘
```

---

## 2. 目录结构

```text
vibe-ui-web/
├── mcp-server/                  # MCP Server 独立 npm 包
│   ├── src/
│   │   ├── index.ts             # stdio 入口
│   │   ├── server.ts            # Tools / Resources / Prompts
│   │   ├── catalog.ts           # 本地/远程 catalog 加载
│   │   └── types.ts
│   ├── package.json             # 包名 @vibe-ui-n-motion/mcp
│   └── tsconfig.json
├── src/app/api/catalog/         # 远程模式 HTTP API
│   ├── route.ts
│   └── [type]/[id]/route.ts
└── src/data/catalog.json        # build 产物（MCP 本地模式读取）
```

---

## 3. MCP 提供的 Tools

| Tool                 | 用途                      | 示例                                                        |
| -------------------- | ------------------------- | ----------------------------------------------------------- |
| `list_vibe_styles`   | 列出所有 UI / Motion 条目 | `type: "ui"`                                                |
| `search_vibe_styles` | 按关键词、领域、审美筛选  | `query: "Stripe"`, `aesthetic: "极简"`                      |
| `get_vibe_style`     | 获取完整 Markdown 规范    | `id: "supabase"`, `type: "ui"`                              |
| `get_vibe_combo`     | 一次拉取 UI + 多个动效    | `ui: "supabase"`, `motions: ["fluid-elastic-button-hover"]` |

**Resources**

- `vibe://catalog` — 全量索引（无正文）
- `vibe://style/{type}/{id}` — 单条 Markdown 规范

**Prompts**

- `build-with-vibe` — 引导 AI 先调 MCP 再写代码的模板

---

## 4. 用户在 Cursor 中配置

### 方式 A：本地模式（推荐开发者 / 贡献者）

适合：本地 clone 了 `vibe-ui-web`，或 submodule 已拉取。

1. 确保 catalog 已构建：

   ```bash
   cd vibe-ui-web
   npm run catalog:build
   ```

2. 构建 MCP Server：

   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

3. 在 Cursor 设置 → **MCP** → 添加 Server：

   ```json
   {
     "mcpServers": {
       "vibe-ui": {
         "command": "node",
         "args": ["/绝对路径/vibe-ui-web/mcp-server/dist/index.js"],
         "env": {}
       }
     }
   }
   ```

   或用 `tsx` 免构建（开发时）：

   ```json
   {
     "mcpServers": {
       "vibe-ui": {
         "command": "npx",
         "args": ["tsx", "/绝对路径/vibe-ui-web/mcp-server/src/index.ts"]
       }
     }
   }
   ```

4. 重启 Cursor，在聊天中说：

   > 我要做一个登录页，请从 MCP 读取 Supabase 风格和流体弹性按钮动效，然后实现。

### 方式 B：远程模式（推荐普通用户）

适合：不想 clone 仓库，直接用线上最新 catalog。

1. 部署 `vibe-ui-web` 到 Vercel（或其他平台），确保 `/api/catalog` 可访问。

2. Cursor MCP 配置：

   ```json
   {
     "mcpServers": {
       "vibe-ui": {
         "command": "node",
         "args": ["/绝对路径/vibe-ui-web/mcp-server/dist/index.js"],
         "env": {
           "VIBE_API_URL": "https://你的域名.vercel.app"
         }
       }
     }
   }
   ```

   MCP Server 会通过 `VIBE_API_URL/api/catalog?includeContent=true` 拉取最新内容，**无需本地 catalog.json**。

### 方式 C：npm 全局安装（发布后）

```bash
npm install -g @vibe-ui-n-motion/mcp
```

Cursor 配置：

```json
{
  "mcpServers": {
    "vibe-ui": {
      "command": "vibe-mcp",
      "env": {
        "VIBE_API_URL": "https://你的域名.vercel.app"
      }
    }
  }
}
```

---

## 5. HTTP API（远程模式 / 第三方集成）

部署 `vibe-ui-web` 后可用：

| 端点                                   | 说明                                  |
| -------------------------------------- | ------------------------------------- |
| `GET /api/catalog`                     | 返回 catalog 元数据（不含 `content`） |
| `GET /api/catalog?includeContent=true` | 返回完整 catalog（含 Markdown 正文）  |
| `GET /api/catalog?type=ui&id=supabase` | 按 id 查单条                          |
| `GET /api/catalog/ui/supabase`         | 返回 Markdown 正文                    |

响应带 `Cache-Control: public, s-maxage=300`，CDN 可缓存 5 分钟。

---

## 6. 内容更新后如何同步？

### 你在 `vibe-ui` 或 `vibe-motion` 新增了 `.md`

**本地 MCP 用户：**

```bash
cd vibe-ui-web
git submodule update --remote   # 或 pull 同级目录的 vibe-ui / vibe-motion
npm run catalog:build           # 重新生成 catalog.json
# 重启 Cursor MCP（或等 60s 缓存过期）
```

**远程 MCP 用户（VIBE_API_URL 模式）：**

1. 在 `vibe-ui-web` 更新 submodule 并 push
2. Vercel 自动 redeploy → `prebuild` 跑 `catalog:build`
3. 用户 MCP 最多 60 秒后拉取到新 catalog（本地缓存 TTL）

**无需**让用户手动拖 `.md` 到 `.cursor/skills`。

---

## 7. 发布 npm 包

### 7.1 首次发布前检查

```bash
cd mcp-server
npm run build
npm pack --dry-run   # 确认 dist/ 被打包
```

### 7.2 发布到 npm

```bash
cd mcp-server
npm login
npm publish --access public
```

包名：`@vibe-ui-n-motion/mcp`

### 7.3 版本 bump 流程

1. 在 `vibe-ui` / `vibe-motion` 更新内容
2. `vibe-ui-web` 跑 `catalog:build` 并 deploy
3. 若 MCP 代码有变：`cd mcp-server && npm version patch && npm publish`
4. 在 README / 网站公告新版本

---

## 8. 维护者日常 Checklist

- [ ] 新增 UI 风格 → `vibe-ui/skills/ui-style-library/references/*.md`
- [ ] 新增动效 → `vibe-motion/skills/interaction-library/references/*.md`
- [ ] `vibe-ui-web`: `npm run catalog:build` 验证新卡片出现
- [ ] 本地测试 MCP：`cd mcp-server && npm run dev`（另开终端用 MCP Inspector 或 Cursor 试调）
- [ ] Push → Vercel deploy → 远程用户自动生效
- [ ] （可选）bump `@vibe-ui-n-motion/mcp` 版本并 publish

---

## 9. 环境变量

| 变量                | 说明                       | 默认值                           |
| ------------------- | -------------------------- | -------------------------------- |
| `VIBE_API_URL`      | 远程 catalog 根 URL        | 未设置则用本地文件               |
| `VIBE_CATALOG_PATH` | 本地 catalog.json 绝对路径 | 自动探测 `src/data/catalog.json` |

---

## 10. 常见问题

**Q: MCP 报 "Catalog not found"**  
A: 先跑 `npm run catalog:build`，或设置 `VIBE_API_URL` 指向已部署站点。

**Q: 搜索不到中文名**  
A: `search_vibe_styles` 会匹配 `nameZh`、`description` 和 `triggers`，可直接用「有机极简」等词搜索。

**Q: 要不要在 vibe-ui / vibe-motion 各做一个 MCP？**  
A: 不建议。统一入口降低用户配置成本；若未来有独立需求，可再拆 `@vibe-ui-n-motion/mcp-ui` 和 `@vibe-motion/mcp` 作为 thin wrapper。

**Q: 能否不用 Node、纯 HTTP MCP？**  
A: 当前 Cursor 对 stdio MCP 支持最好。远程内容已通过 `/api/catalog` 提供；后续可加 Streamable HTTP transport 让 Cursor 直连网站。

---

## 11. 示例对话

用户：

> 我要做一个 SaaS 登录页，用 Supabase 那种 developer-friendly 风格，按钮要有流体弹性悬停动效。

AI（通过 MCP）：

1. `search_vibe_styles({ query: "supabase", type: "ui" })`
2. `search_vibe_styles({ query: "fluid elastic", type: "motion" })`
3. `get_vibe_combo({ ui: "supabase", motions: ["fluid-elastic-button-hover"] })`
4. 按返回的 Design Tokens + motion_tokens 生成代码

---

如有问题，欢迎在 `vibe-ui-web` 仓库提 Issue。
