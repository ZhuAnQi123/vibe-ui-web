# Content Sources

`vibe-ui-web` 不拥有 skill 内容，只通过 build 脚本消费两个内容仓库。

## 推荐：Git Submodule

```bash
# 在 vibe-ui-web 根目录执行
git submodule add <your-vibe-ui-repo-url> content/vibe-ui
git submodule add <your-vibe-motion-repo-url> content/vibe-motion

git submodule update --init --recursive
```

期望目录：

```text
vibe-ui-web/
└── content/
    ├── vibe-ui/              # submodule → UI 风格 skill
    │   └── skills/ui-style-library/
    └── vibe-motion/       # submodule → 动效 skill
        └── skills/interaction-library/
```

## 本地开发备选：Sibling 目录

若尚未配置 submodule，脚本会自动回退到同级目录：

```text
code/
├── vibe-ui/
├── vibe-motion/
└── vibe-ui-web/
```

## 生成 Catalog

```bash
npm run catalog:build
```

输出：`src/data/catalog.json`（供 StyleGrid 与筛选器读取）
