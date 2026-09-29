# MuQingCi 的个人博客

保留原生 HTML、CSS、JavaScript 前端，采用“一篇文章一个 Markdown 文件”的内容管理方式。构建时生成摘要索引、独立 HTML 正文和全文搜索索引，发布结果仍是静态网站。

仓库：<https://github.com/MuQingCi/MuQingCi.github.io>

发布地址：<https://muqingci.github.io/>（是否可访问以实际部署结果为准）

## 本地预览

需要 Node.js 22 或更高版本，建议使用 24。在项目根目录执行：

```powershell
npm ci
npm run dev
```

打开 <http://127.0.0.1:4173/>。保存文章、前端代码、分类配置或图片后，服务会重新构建，刷新浏览器查看结果。按 `Ctrl + C` 停止服务。

现在需要 HTTP 预览，不再直接双击 `index.html`。前端使用 `fetch()` 加载生成内容，源码根目录不是完整发布目录。

## 写新文章

在 `content/posts/` 中创建 `.md` 文件，可按年份分目录，例如 `content/posts/2026/my-new-post.md`：

````markdown
---
id: my-new-post
title: 我的新文章
description: 这篇文章的简短介绍。
date: 2026-09-28
category: tech
tags: [JavaScript, 前端]
cover: code
featured: false
sample: false
---

这里是文章介绍。

## 一个小标题

正文可以使用 **加粗**、列表、链接和图片。

```javascript
console.log("Hello, blog!");
```
````

- `id` 必须唯一，支持英文字母、数字、连字符和下划线；大小写也不能与另一篇文章重复。保留已公开文章的 ID，以保持 `/#article/文章ID` 链接有效。
- `title`、`description`、`date`、`category`、`tags`、`cover` 为必填字段。
- 日期使用有效的 `YYYY-MM-DD`。
- 分类默认为 `tech`、`life`、`reading`，定义在 `blog.config.json`。
- 封面支持 `code`、`garden`、`git`、`books`、`grid`、`journal`、`mountains`。
- `minutes` 可省略，由构建按正文长度估算；也可填写正整数。
- `featured`、`sample` 可省略，默认为 `false`。最多一篇精选，没有精选时隐藏精选区域。
- 正文使用 Markdown，不再需要写成 JavaScript 字符串。

当前文章来自迁移前的实际工作区，包括 `Love-Story`，保留原有 ID、元数据和正文；已经删除的文章不会重新加入。`sample: true` 会保留示例标记，个人文章可按需要改为 `false`。

## 修改、删除与查找

- 修改：编辑对应 `.md` 文件。
- 删除：删除对应文件并重新构建，列表、归档、标签、搜索和旧正文一起更新。
- 查找：按文件名查找，或使用编辑器全文搜索。
- 更换精选：取消原文章的 `featured: true`，为新文章设置它。精选标题、摘要、日期和链接自动生成，无需再修改首页。
- 正文图片：放入 `assets/`，用 `![图片说明](assets/my-photo.jpg)` 引用。

开启预览服务时保存源文件会自动重建；否则运行 `npm run build`。不要手动修改 `dist/`，下次构建会覆盖生成结果。

## 构建和检查

```powershell
npm test
npm run build
```

构建会检查元数据、重复 ID、分类、日期、封面、标签、时长和多篇精选。文章校验失败时报告源文件，并保留上一次成功输出。

```text
dist/
├── index.html
├── styles.css
├── app.js
├── assets/
├── .nojekyll
└── data/
    ├── posts.json         # 分类与摘要，不含正文
    ├── search.json        # 全文索引，首次输入关键词时加载
    └── articles/
        └── 文章ID.内容指纹.html  # 打开文章时加载
```

`dist/`、`node_modules/` 已忽略，无需手动提交。`package-lock.json` 应提交，用于本地和 CI 安装一致的依赖。Markdown 和 YAML 解析库仅用于构建，访客浏览器没有这些依赖。

## 发布到 GitHub Pages

`.github/workflows/pages.yml` 在推送 `main` 后安装依赖、运行测试、构建并发布 `dist/`。

首次使用时，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。原来的 **Deploy from a branch / main / root** 设置需要切换，因为源码根目录不包含生成数据。

确认改动后提交源码与文章：

```powershell
git status --short --branch
git add content scripts tests .github package.json package-lock.json blog.config.json app.js index.html styles.css .gitignore README.md "项目架构与维护指南.md"
git add -u posts.js
git diff --staged
git commit -m "Manage blog posts as Markdown files"
git push origin main
```

`git add -u posts.js` 仅用于首次迁移时暂存旧文件删除；完成迁移提交后不再需要。日常更新只暂存实际修改的文件，提交前检查已有改动。

推送后在仓库 **Actions** 确认构建和部署，再访问网站检查。工作流文件已准备好，并不表示已经修改远程 Pages 设置或完成发布。

参考 [GitHub Pages 自定义工作流官方指南](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 修改实现

| 修改内容 | 文件 |
| --- | --- |
| 姓名“木青辞”、个人介绍、页面结构、随记、GitHub 链接 | `index.html` |
| 配色、排版和手机适配 | `styles.css` |
| 文章路由、渲染、筛选、搜索、主题和导航 | `app.js` |
| 分类名称与图标 | `blog.config.json` |
| 文章与标签 | `content/posts/**/*.md` |
| 构建校验和内容生成 | `scripts/build.mjs` |
| 本地预览和自动重建 | `scripts/serve.mjs` |
| 构建与发布 | `.github/workflows/pages.yml` |

新增分类修改 `blog.config.json`，筛选按钮和分类数量自动生成；关于页介绍仍需手动修改。完整说明见 [项目架构与维护指南.md](./项目架构与维护指南.md)。

Markdown 允许作者嵌入原始 HTML，当前没有外部用户内容清洗功能。项目没有账号后台或评论服务。
