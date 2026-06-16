# Vibe 体系部署上线指南【新手版】

因为我们的项目拆分成了 3 个仓库（1 个网站 + 2 个内容库），部署时最核心的关键点是**让网站在构建（Build）时能正确拉取到内容库的代码**。

我们推荐使用 **Vercel** 进行部署，它是 Next.js 官方的托管平台，对新手极其友好，且完全免费。

---

## 第一步：在 Web 项目中配置 Git Submodule（子模块）

这是最关键的一步！我们需要告诉 `vibe-ui-web`，它的内容来源于另外两个仓库。

1. 打开终端，进入 `vibe-ui-web` 的根目录：

   ```bash
   cd /Users/mac/Documents/code/vibe-ui-web
   ```

2. 添加子模块（**请把下面的 URL 替换成你真实的 GitHub 仓库地址**）：

   ```bash
   git submodule add https://github.com/你的用户名/vibe-ui.git content/vibe-ui
   git submodule add https://github.com/你的用户名/vibe-motion.git content/vibe-motion
   ```

3. 提交这个改动并推送到 GitHub：
   ```bash
   git commit -m "chore: add content submodules"
   git push
   ```

---

## 第三步：在 Vercel 上一键部署

1. 登录 [Vercel](https://vercel.com/)（可以直接用 GitHub 账号授权登录）。
2. 点击右上角的 **"Add New..." -> "Project"**。
3. 在列表中找到你的 `vibe-ui-web` 仓库，点击 **"Import"**。
4. **配置项（基本不需要改，确认一下即可）：**
   - **Framework Preset**: 确认识别为 `Next.js`。
   - **Root Directory**: 保持默认（`./`）。
   - **Build Command**: 保持默认（Vercel 会自动执行 `npm run build`，而我们在 `package.json` 里写了 `prebuild`，所以它会自动先去拉取 catalog）。
5. 点击 **"Deploy"** 按钮！

🎉 **等待 1-2 分钟，你的网站就上线了！Vercel 会自动为你分配一个免费的域名。**

---

## 💡 常见问题 (FAQ)

### Q1: 以后我更新了 `vibe-ui` 或 `vibe-motion` 里的 md 文件，网站会自动更新吗？

**不会自动更新。** 因为子模块锁定的是某一个特定的 Commit 记录。
当你更新了内容库后，你需要：

1. 在 `vibe-ui-web` 目录下运行：`git submodule update --remote`（拉取最新内容）。
2. 提交代码：`git commit -am "update content"` 并 `git push`。
3. Vercel 监听到 `vibe-ui-web` 有新的 push，就会自动重新部署，线上网站就更新了。

### Q2: 部署失败了，报错说找不到 content 目录？

请检查你的 `vibe-ui` 和 `vibe-motion` 仓库是否是 **Private (私有)** 的。
如果是私有仓库，Vercel 默认没有权限拉取子模块。
**解决办法**：

1. 去 GitHub 生成一个 Personal Access Token (PAT)。
2. 在 Vercel 的项目设置 (Settings) -> Environment Variables 中，添加一个环境变量 `GITHUB_TOKEN`，填入你的 PAT。
3. 重新部署即可。
