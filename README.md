
# Vibe UI Web

UI Design Systems, Translated for AI.

这是一个专为 Vibe Coder 打造的开源设计风格库展示网站。它将顶级产品的视觉风格转换为 AI（Cursor, Windsurf, Claude 等）能直接读懂并完美执行的纯文本设计说明书（Prompt/Skill）。

## 🚀 核心特性

- **多维筛选器**：支持按领域 (Domain) 和风格 (Aesthetic) 快速筛选。
- **丝滑物理动效**：基于 Framer Motion 打造的极具高级感、软糯跟手的交互体验。
- **一键 Copy to Cursor**：将繁杂的设计规范化繁为简，一键注入设计灵魂。
- **🤖 MCP Server 原生支持**：AI 可通过 MCP 协议直接读取设计系统和动效参数，无需手动拖拽 `.md` 文件。

## 🛠️ 技术栈

- **框架**: Next.js
- **UI 库**: React
- **样式**: Tailwind CSS v4 (CSS-first 架构)
- **动效**: Framer Motion
- **MCP**: @modelcontextprotocol/sdk

## 💻 本地启动指南

### 1. 安装依赖

```bash
npm install
```

### 2. 构建 Catalog（首次或内容更新后）

```bash
npm run catalog:build
```
此命令会扫描 `vibe-ui` 和 `vibe-motion` 的 Markdown，生成 `src/data/catalog.json`。

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 预览
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可查看效果。

## 🤖 MCP Server 使用指南

Vibe UI Web 内置了一个完整的 MCP Server（`@vibe-ui/mcp`），让 AI 可以直接读取最新的设计系统和动效参数。

### 快速开始（3 种方式）

#### 方式 A：npm 全局安装（推荐普通用户）

```bash
# 1. 全局安装
npm install -g @vibe-ui/mcp

# 2. 在 Cursor 中配置 MCP
```

Cursor 设置 → MCP → 添加 Server：

```json
{
  "mcpServers": {
    "vibe-ui": {
      "command": "vibe-mcp"
    }
  }
}
```

#### 方式 B：远程模式（推荐，无需安装）

适用于已部署 `vibe-ui-web` 的场景，用户无需安装任何包。

```json
{
  "mcpServers": {
    "vibe-ui": {
      "command": "npx",
      "args": [
        "@vibe-ui/mcp@latest"
      ],
      "env": {
        "VIBE_API_URL": "https://你的域名.vercel.app"
      }
    }
  }
}
```

#### 方式 C：本地开发模式（推荐贡献者）

```bash
# 1. Clone 项目
git clone vibe-ui-web
cd vibe-ui-web

# 2. 安装依赖并构建
npm install
npm run catalog:build
cd mcp-server
npm install
npm run build

# 3. 在 Cursor 中配置
```

```json
{
  "mcpServers": {
    "vibe-ui": {
      "command": "node",
      "args": ["/绝对路径/vibe-ui-web/mcp-server/dist/index.js"]
    }
  }
}
```

### MCP 提供的 Tools

| Tool | 用途 | 示例 |
|------|------|------|
| `list_vibe_styles` | 列出所有 UI / Motion 条目 | `type: "ui"` |
| `search_vibe_styles` | 按关键词、领域、审美筛选 | `query: "Stripe"` |
| `get_vibe_style` | 获取完整 Markdown 规范 | `id: "supabase", type: "ui"` |
| `get_vibe_combo` | 一次拉取 UI + 多个动效 | `ui: "supabase", motions: ["fluid-elastic"]` |

### 在 Cursor 中使用示例

启动 MCP Server 后，在 Cursor 聊天框中：

```
@vibe-ui 我要做一个 SaaS 登录页，用 Supabase 那种 developer-friendly 风格，按钮要有流体弹性悬停动效。
```

AI 会自动调用 MCP 工具获取设计参数和动效配置，并生成代码。

### 内容更新机制

当 `vibe-ui` 或 `vibe-motion` 内容更新后：

**本地用户：**
```bash
cd vibe-ui-web
git submodule update --remote  # 拉取最新内容
npm run catalog:build          # 重新生成 catalog
# 重启 Cursor 或等待缓存过期
```

**远程用户：**
1. `vibe-ui-web` 自动部署到 Vercel
2. MCP Server 在 60 秒内拉取最新数据
3. **所有用户实时生效，无需手动更新**

## 📁 目录结构

```text
vibe-ui-web/
├── content/                    # Git submodule 挂载点
│   ├── vibe-ui/               # UI 风格 Markdown 内容库
│   └── vibe-motion/           # 动效 Markdown 内容库
├── mcp-server/                 # MCP Server（独立 npm 包）
│   ├── src/
│   │   ├── index.ts           # stdio 入口
│   │   ├── tools/             # MCP Tools 实现
│   │   │   ├── list-catalog.ts
│   │   │   ├── search-styles.ts
│   │   │   ├── get-style.ts
│   │   │   └── get-combo.ts
│   │   ├── services/
│   │   │   └── catalog-service.ts
│   │   └── types/
│   ├── package.json           # @vibe-ui/mcp
│   └── README.md
├── scripts/
│   └── build-catalog.ts       # 扫描 md → catalog.json
├── src/
│   ├── app/
│   │   ├── api/catalog/       # HTTP API（远程模式）
│   │   └── page.tsx
│   ├── components/
│   ├── data/catalog.json      # build 产物（UI + Motion 索引）
│   └── types/
└── docs/
    └── MCP_GUIDE.md           # 完整 MCP 配置与发布指南
```

## 🔗 与内容仓库联动

`vibe-ui-web` 本身不存储任何 Markdown 规范或视频资产，所有内容均在构建时（Build Time）从 `vibe-ui` 和 `vibe-motion` 这两个内容仓库中动态拉取。

### 自动化同步机制

1. **本地开发时**：运行 `npm run dev` 会自动触发 `predev` 钩子，执行 `npm run catalog:build`。
2. **生产构建时**：运行 `npm run build` 会自动触发 `prebuild` 钩子，执行 `npm run catalog:build`。
3. **MCP 构建**：`catalog:build` 完成后自动构建 MCP Server。

### `npm run catalog:build` 做了什么？

- **扫描解析**：扫描 `content/` 下的 `vibe-ui` 和 `vibe-motion`，解析所有 `.md` 文件的 Frontmatter。
- **生成索引**：汇总生成 `src/data/catalog.json`，供网站和 MCP Server 使用。
- **拷贝资产**：将视频/GIF 文件拷贝到 `public/content-assets/`。
- **构建 MCP**：自动构建 `mcp-server` 的 `dist/`。

### 当内容库更新后，我该怎么做？

**本地开发：**
```bash
npm run catalog:build  # 重新生成 catalog + MCP
```

**线上环境（Vercel）：**
1. 更新子模块：`git submodule update --remote`
2. 提交推送：`git commit -am "feat: update content" && git push`
3. Vercel 自动部署，新内容实时生效

## 🎨 Tailwind v4 说明

本项目使用最新的 **Tailwind CSS v4**。

- 不再需要 `tailwind.config.js`。
- 所有主题变量和自定义工具类均在 `src/app/globals.css` 中通过 `@theme` 和 `@utility` 指令配置。

## 📚 相关文档

- **[MCP 完整指南](docs/MCP_GUIDE.md)**：配置、发布、维护全流程
- **[内容贡献指南](content/README.md)**：如何添加新的 UI 风格或动效

## 🤝 贡献

欢迎贡献新的 UI 风格或动效！

1. Fork 项目
2. 在 `vibe-ui` 或 `vibe-motion` 中添加 `.md` 文件
3. 提交 PR，内容会自动同步到网站和 MCP

## 📄 License

MIT
