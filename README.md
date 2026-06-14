# Vibe UI Web

UI Design Systems, Translated for AI. 
这是一个专为 Vibe Coder 打造的开源设计风格库展示网站。它将顶级产品的视觉风格转换为 AI（Cursor, Windsurf, Claude 等）能直接读懂并完美执行的纯文本设计说明书（Prompt/Skill）。

## 🚀 核心特性

- **多维筛选器**：支持按领域 (Domain) 和风格 (Aesthetic) 快速筛选。
- **丝滑物理动效**：基于 Framer Motion 打造的极具高级感、软糯跟手的交互体验。
- **一键 Copy to Cursor**：将繁杂的设计规范化繁为简，一键注入设计灵魂。

## 🛠️ 技术栈

- **框架**: Next.js 
- **UI 库**: React
- **样式**: Tailwind CSS v4 (CSS-first 架构)
- **动效**: Framer Motion

## 💻 本地启动指南

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **预览**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可查看效果。

## 📁 目录结构

```text
vibe-ui-web/
├── content/                    # Git submodule 挂载点（见 content/README.md）
│   ├── vibe-ui/
│   └── vibe-motion-md/
├── scripts/
│   └── build-catalog.ts        # 扫描 md frontmatter → catalog.json
├── src/
│   ├── app/                    # Next.js 页面与全局样式
│   ├── components/             # 搜索框、筛选器、StyleGrid
│   ├── data/catalog.json       # build 产物（UI + Motion 元数据索引）
│   ├── lib/get-catalog.ts      # 读取 catalog 的 helper
│   └── types/catalog.ts        # Catalog schema 类型定义
```

## 🔗 与内容仓库联动

1. 将 `vibe-ui` 与 `vibe-motion-md` 以 submodule 或 sibling 目录方式接入（详见 `content/README.md`）。
2. 运行 `npm run catalog:build` 生成 `src/data/catalog.json`。
3. `StyleGrid` 从 catalog 驱动卡片渲染；`dev` / `build` 前会自动执行 catalog 构建。

### Catalog Item Schema（摘要）

| 字段 | 说明 |
|------|------|
| `id` / `name` | 来自 md frontmatter |
| `type` | `ui` \| `motion` |
| `domains` / `aesthetics` | 多维筛选标签 |
| `preview` | 卡片背景色 / 文字色（从 Primary 或 palette 推导） |
| `source` | 指向内容仓库中的 reference 与 SKILL 路径 |

## 🎨 Tailwind v4 说明

本项目使用最新的 **Tailwind CSS v4**。
- 不再需要 `tailwind.config.js`。
- 所有主题变量和自定义工具类均在 `src/app/globals.css` 中通过 `@theme` 和 `@utility` 指令配置。