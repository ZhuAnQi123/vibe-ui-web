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

- `src/app/` - Next.js 页面与全局样式 (`globals.css` 中包含 Tailwind v4 配置)
- `src/components/` - 核心交互组件 (搜索框、多维筛选器、瀑布流卡片)
- `library/` (外部) - 存放核心的 `.md` 风格文件

## 🎨 Tailwind v4 说明

本项目使用最新的 **Tailwind CSS v4**。
- 不再需要 `tailwind.config.js`。
- 所有主题变量和自定义工具类均在 `src/app/globals.css` 中通过 `@theme` 和 `@utility` 指令配置。