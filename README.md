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
│   └── vibe-motion/
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

`vibe-ui-web` 本身不存储任何 Markdown 规范或视频资产，所有内容均在构建时（Build Time）从 `vibe-ui` 和 `vibe-motion` 这两个内容仓库中动态拉取。

### 自动化同步机制
1. **本地开发时**：运行 `npm run dev` 会自动触发 `predev` 钩子，执行 `npm run catalog:build`。
2. **生产构建时**：运行 `npm run build` 会自动触发 `prebuild` 钩子，执行 `npm run catalog:build`。

### `npm run catalog:build` 做了什么？
- **扫描解析**：它会扫描 `content/` 或同级目录下的 `vibe-ui` 和 `vibe-motion` 仓库，解析所有 `.md` 文件的 Frontmatter 元数据。
- **生成索引**：将解析结果汇总，生成 `src/data/catalog.json`，供前端 `StyleGrid` 和 `ElasticFilter` 组件驱动渲染。
- **拷贝资产**：自动将 `vibe-motion` 仓库中的视频/GIF 文件（如 `.mov`, `.mp4`）拷贝到 `public/content-assets/` 目录下，以便前端可以作为静态资源直接加载播放。

### 当内容库更新后，我该怎么做？

如果你在 `vibe-ui` 或 `vibe-motion` 中添加了新的风格或动效：

**如果在本地开发：**
只需重新运行 `npm run dev`（或者手动跑一次 `npm run catalog:build`），新卡片就会立刻出现在页面上。

**如果是在 Vercel 等线上环境：**
1. 在 `vibe-ui-web` 目录下，拉取最新的子模块代码：`git submodule update --remote`
2. 提交并推送：`git commit -am "update content submodules" && git push`
3. Vercel 会自动触发重新部署，并在部署前执行 `catalog:build`，线上网站即刻更新。

### Catalog Item Schema（摘要）

| 字段                     | 说明                                              |
| ------------------------ | ------------------------------------------------- |
| `id` / `name`            | 来自 md frontmatter                               |
| `type`                   | `ui` \| `motion`                                  |
| `domains` / `aesthetics` | 多维筛选标签                                      |
| `preview`                | 卡片背景色 / 文字色（从 Primary 或 palette 推导） |
| `source`                 | 指向内容仓库中的 reference 与 SKILL 路径          |

### 标签来源逻辑（筛选与展示）

页面标签分成「数据值来源」和「展示文案来源」两层：

1. **数据值来源（构建时）**
   - 来自 `vibe-ui` / `vibe-motion` 的 Markdown frontmatter。
   - 在 `scripts/build-catalog.ts` 中解析后写入 `src/data/catalog.json`：
     - `domains`：来自 `domain` / `domains`
     - `aesthetics`：来自 `aesthetic` / `aesthetics`
     - `interactionTypes`：来自 `interactionTypes` / `interaction_types`
     - `effects`：来自 `effects`
     - `components`：来自 `components`

2. **筛选选项来源（运行时）**
   - `ElasticFilter` 的「审美风格」来自 `item.aesthetics` 聚合。
   - `ElasticFilter` 的「交互类型」已升级为三组来源聚合：
     - `interactionTypes`（交互类型）
     - `effects`（效果）
     - `components`（组件）

3. **展示文案来源（i18n）**
   - 标签显示优先走 `t.tags[key]`（`src/i18n/dictionaries/zh.ts` / `en.ts`）。
   - 若字典里没有该 key，则回退显示原始标签值（保证新标签可直接显示）。

## 🎨 Tailwind v4 说明

本项目使用最新的 **Tailwind CSS v4**。

- 不再需要 `tailwind.config.js`。
- 所有主题变量和自定义工具类均在 `src/app/globals.css` 中通过 `@theme` 和 `@utility` 指令配置。
